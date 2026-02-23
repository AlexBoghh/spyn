---
name: r3f-editor-viewport
description: >
  Builds and modifies the React Three Fiber 3D viewport for the Spyn scroll
  choreography editor. Use when working on the 3D scene, loading GLB/GLTF
  models, setting up camera rigs, applying model transforms, rendering wireframe
  overlays, or visualizing content blocks in 3D space. Triggers on "3D viewport",
  "load model", "camera controls", "Three.js scene", "R3F", "orbital camera",
  "wireframe", "model preview", "edit mode", "preview mode", or any work inside
  the center Viewport3D panel. Make sure to use this skill for ALL React Three
  Fiber work in Spyn — editor viewports have different patterns than marketing
  3D or game scenes.
---

# R3F Editor Viewport

## Architecture

The viewport is the center panel of Spyn's four-panel layout. It renders a
Three.js scene via React Three Fiber showing the loaded 3D model with transforms
interpolated from keyframes based on the current scroll position.

### Scene Component Tree
```
src/components/Viewport3D/
├── Viewport3D.tsx          ← Panel wrapper + R3F Canvas
├── Scene.tsx               ← Scene contents (lights, model, helpers)
├── ModelRenderer.tsx       ← Loads and renders the GLB/GLTF model
├── CameraRig.tsx           ← Programmatic orbital camera
├── ContentBlockOverlay.tsx ← Wireframe boxes for content blocks
├── GridHelper.tsx          ← Ground grid (edit mode only)
└── ViewportToolbar.tsx     ← Mode/breakpoint/debug controls overlay
```

### Canvas Setup
```tsx
// Viewport3D.tsx
import { Canvas } from '@react-three/fiber';

// Canvas fills its parent container. Parent must have explicit dimensions.
// Use: className="flex-1 relative" on the panel, Canvas takes full space.
<Canvas
  camera={{ position: [0, 2, 5], fov: 50 }}
  gl={{ antialias: true, alpha: true }}
  dpr={[1, 2]}
>
  <Scene />
</Canvas>
```

**Critical:** The Canvas component must be wrapped in a div with defined height.
The panel uses CSS Grid so the viewport div already has height. Do NOT add
`h-screen` or other height utilities on Canvas's parent — the grid handles it.

## Camera Rig

Spyn uses a programmatic orbital camera, NOT `OrbitControls` from drei. The
camera position is derived from `CameraConfig` values stored in keyframes.

### CameraConfig → Three.js Camera Position

```typescript
import { degToRad } from '../../utils/scrollmath';
import type { CameraConfig } from '../../types';

function cameraConfigToPosition(config: CameraConfig): [number, number, number] {
  const orbitRad = degToRad(config.orbit);
  const elevRad = degToRad(config.elevation);

  const x = config.distance * Math.cos(elevRad) * Math.sin(orbitRad);
  const y = config.distance * Math.sin(elevRad);
  const z = config.distance * Math.cos(elevRad) * Math.cos(orbitRad);

  return [x + config.offset.x, y + config.offset.y, z];
}
```

### Camera Animation
- In **preview mode**: Camera position is driven entirely by interpolated keyframes
- In **edit mode**: Camera can be manually orbited with mouse drag, but snaps back to
  keyframe position when a keyframe is selected
- Use `useFrame` to smoothly lerp camera position each frame (not instant jumps)
- Lerp factor: `0.05` for smooth follow, `1.0` for instant snap (when scrubbing fast)

### Look-At Target
```typescript
// If lookAt is 'model', look at model's world position
// If lookAt is {x, y, z}, look at that fixed point
// Apply offset to shift the look-at point for off-center framing
```

## Model Loading

### GLB/GLTF Loading Pattern
```tsx
import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function ModelRenderer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}

// Wrap in Suspense at the Scene level
<Suspense fallback={<ModelPlaceholder />}>
  <ModelRenderer url={modelUrl} />
</Suspense>
```

### Model Placeholder
When no model is loaded (`model.file === null`), render a placeholder:
- Simple box geometry: `<boxGeometry args={[1, 1, 1]} />`
- Material: `<meshStandardMaterial color="#6366f1" wireframe />`
- Helps verify transforms work before a real model is loaded

### Applying ModelTransform
```typescript
import { degToRad } from '../../utils/scrollmath';
import type { ModelTransform } from '../../types';

// Position: Convert vw/vh to world units
// Simple mapping: 1 vw = 0.1 world units, centered at 0
// So 50vw = 0, 0vw = -5, 100vw = +5
function vwToWorld(vw: number): number {
  return (vw - 50) * 0.1;
}
function vhToWorld(vh: number): number {
  return -(vh - 50) * 0.1; // Invert Y: vh increases downward
}

function applyTransform(transform: ModelTransform) {
  return {
    position: [
      vwToWorld(transform.position.x),
      vhToWorld(transform.position.y),
      transform.position.z * 0.1, // z-depth scaling
    ] as [number, number, number],
    rotation: [
      degToRad(transform.rotation.x),
      degToRad(transform.rotation.y),
      degToRad(transform.rotation.z),
    ] as [number, number, number],
    scale: transform.scale,
  };
}
```

**Convention:** Rotations stored in degrees everywhere in Spyn. Convert to radians
ONLY at render time using `degToRad()` from `src/utils/scrollmath.ts`.

### Opacity
Apply opacity via material traversal:
```typescript
scene.traverse((child) => {
  if ((child as THREE.Mesh).isMesh) {
    const mesh = child as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.transparent = true;
    mat.opacity = transform.opacity;
  }
});
```

## Coordinate System

### vw/vh → World Space Mapping
```
vw: 0───────50──────100    →  world X: -5────0────+5
vh: 0───────50──────100    →  world Y: +5────0────-5  (inverted!)
z:  negative──0──positive  →  world Z: behind──0──in front
```

- Model at (50vw, 50vh) = world origin (0, 0, 0)
- Z-depth: positive values bring model IN FRONT of content, negative BEHIND
- All coordinate functions live in the viewport component, not in utils

## Edit vs Preview Mode

### Edit Mode (`mode === 'edit'`)
- Grid helper visible on ground plane
- Axis helper in corner (drei `GizmoHelper`)
- Wireframe overlay for content blocks
- Camera can be manually orbited
- Selected keyframe highlighted in viewport
- Debug overlay shows current transform values

### Preview Mode (`mode === 'preview'`)
- Clean render, no helpers or guides
- Camera locked to keyframe interpolation
- Content block overlays hidden
- Full-screen feel (toolbar becomes semi-transparent)

Read mode from store: `const mode = useStore(s => s.mode)`

## Content Block Visualization

In edit mode, render content blocks as semi-transparent rectangles in 3D space:
```tsx
// For each section's content blocks, render at their vw/vh position
// Use PlaneGeometry with MeshBasicMaterial
// Material: transparent, opacity 0.15, color from section color
// Wireframe edges: visible, color from section color at full opacity
// Only visible when showWireframes is true
```

## Lighting Setup

Standard three-point lighting for model preview:
```tsx
<ambientLight intensity={0.4} />
<directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
<directionalLight position={[-3, 4, -2]} intensity={0.3} />
```

## Spyn Store Integration

```typescript
import { useStore } from '../../store';

// In Scene.tsx or wherever you need state:
const model = useStore(s => s.model);
const keyframes = useStore(s => s.keyframes);
const scrollProgress = useStore(s => s.scrollProgress);
const selectedKeyframeId = useStore(s => s.selectedKeyframeId);
const mode = useStore(s => s.mode);
const showWireframes = useStore(s => s.showWireframes);
const showDebugOverlay = useStore(s => s.showDebugOverlay);
const sections = useStore(s => s.sections);
```

## Keyframe Interpolation in Viewport

The viewport doesn't do its own interpolation — it receives the current
`scrollProgress` and finds the right transform:

```typescript
import { lerp } from '../../utils/scrollmath';
import type { Keyframe, ModelTransform } from '../../types';

function interpolateTransform(
  keyframes: Keyframe[],
  scroll: number
): ModelTransform | null {
  if (keyframes.length === 0) return null;
  if (keyframes.length === 1) return keyframes[0].model;

  // Find bracketing keyframes
  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (scroll >= keyframes[i].scroll && scroll <= keyframes[i + 1].scroll) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  // If prev has hold=true, return prev's transform until next keyframe
  if (prev.hold && scroll < next.scroll) {
    return prev.model;
  }

  // Compute local t between prev and next
  const range = next.scroll - prev.scroll;
  const t = range > 0 ? (scroll - prev.scroll) / range : 0;

  // Apply easing (next.easeFrom defines curve FROM prev TO next)
  const easedT = applyEasing(t, next.easeFrom);

  // Lerp all properties
  return lerpTransform(prev.model, next.model, easedT);
}
```

## Examples

**Example 1: Setting up the initial viewport**
User says: "Build the 3D viewport with model loading"
Actions:
1. Create Canvas in Viewport3D.tsx with proper sizing
2. Create Scene.tsx with lighting, camera rig, Suspense boundary
3. Create ModelRenderer.tsx with useGLTF + placeholder box
4. Create CameraRig.tsx with orbit/elevation/distance → position math
5. Wire to store: read model.file, scrollProgress, keyframes
6. Implement interpolateTransform for smooth scroll-driven animation

**Example 2: Adding wireframe content overlays**
User says: "Show content blocks in the 3D viewport"
Actions:
1. Read sections and their contentBlocks from store
2. For each block, create a PlaneGeometry at vw/vh mapped position
3. Apply section color with 0.15 opacity
4. Only render when showWireframes === true and mode === 'edit'

## Troubleshooting

**Issue: Model doesn't appear after loading**
Cause: Model scale is too small/large for the scene
Solution: Check `model.initialScale`, try values between 0.01 and 100. Log the
model's bounding box with `new THREE.Box3().setFromObject(scene)`.

**Issue: Camera jumps instead of smoothing**
Cause: Setting camera.position directly instead of lerping
Solution: Use `useFrame` with `camera.position.lerp(target, 0.05)` each frame

**Issue: Content block overlays face wrong direction**
Cause: PlaneGeometry faces Z by default
Solution: Rotate planes to face camera, or use `<Billboard>` from drei

**Issue: Canvas has zero height**
Cause: Parent div missing explicit height in CSS Grid
Solution: The Viewport3D panel div in App.tsx already has grid-defined height.
Ensure Canvas wrapper uses `className="h-full w-full"`.
