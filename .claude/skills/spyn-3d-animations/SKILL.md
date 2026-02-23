---
name: spyn-3d-animations
description: >
  Implements advanced 3D animation features for the Spyn scroll choreography tool,
  including keyframe events (split, rejoin, material-swap), animation presets,
  scroll physics (momentum, drag, overshoot), and responsive breakpoint overrides.
  Use when working on split/exploded view animations, material swaps, physics-
  based scroll smoothing, animation preset templates, or responsive keyframe
  variants. Triggers on "split animation", "exploded view", "rejoin", "material
  swap", "physics", "momentum", "drag", "overshoot", "animation preset",
  "responsive keyframe", "tablet override", "mobile override", or any advanced
  3D animation feature in Spyn. Make sure to use this skill for keyframe event
  handling and physics — these are niche Three.js patterns.
---

# Spyn 3D Animations

## Keyframe Events

Events are special animations triggered at specific keyframes. They extend
beyond simple transform interpolation.

### Event Types (from `src/types/index.ts`)
```typescript
type KeyframeEventType = 'split' | 'rejoin' | 'material-swap' | 'custom';
```

### Split Event
Separates a model into named mesh groups, spreading them apart:

```typescript
interface SplitEventConfig {
  type: 'split';
  pieces: string[];      // mesh group names (from GLB scene hierarchy)
  spread: number;        // distance to spread (world units)
  axis: 'x' | 'y' | 'z'; // direction of separation
  stagger: number;       // delay between pieces (0-1, fraction of transition)
}
```

**Implementation pattern:**
```typescript
// 1. Traverse model scene to find named groups
// 2. For each piece, compute offset along axis
// 3. Apply staggered timing: piece[i] starts at t * (i * stagger)
// 4. Animate position offset using the keyframe's easing function

function applySplitEvent(
  scene: THREE.Group,
  event: KeyframeEvent,
  progress: number // 0 = together, 1 = fully spread
) {
  const { pieces = [], spread = 2, axis = 'y', stagger = 0 } = event;

  pieces.forEach((name, i) => {
    const group = scene.getObjectByName(name);
    if (!group) return;

    // Stagger: each piece starts later
    const pieceT = Math.max(0, Math.min(1,
      (progress - i * stagger) / (1 - (pieces.length - 1) * stagger)
    ));

    const offset = (i - (pieces.length - 1) / 2) * spread * pieceT;

    // Apply offset on the specified axis
    group.position[axis] = offset;
  });
}
```

### Rejoin Event
Reverses a split — pieces animate back together:

```typescript
// Rejoin is the inverse of split.
// Use the same applySplitEvent with progress going from 1 → 0.
// The rejoin keyframe should reference the same pieces/axis as the split.
```

### Material Swap Event
Hot-swaps materials on the model at a scroll position:

```typescript
interface MaterialSwapConfig {
  type: 'material-swap';
  material: string; // material preset name or hex color
}

function applyMaterialSwap(
  scene: THREE.Group,
  materialName: string,
  progress: number // 0 = original, 1 = new material
) {
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;

    // Cross-fade via opacity: fade out original, fade in new
    // Or: lerp material color between original and target
    // Store original material in mesh.userData for restoration
    if (!mesh.userData.originalColor) {
      mesh.userData.originalColor = mat.color.clone();
    }

    const targetColor = new THREE.Color(materialName);
    mat.color.lerpColors(mesh.userData.originalColor, targetColor, progress);
  });
}
```

### Custom Events
Extensible event handler for project-specific animations:

```typescript
interface CustomEventConfig {
  type: 'custom';
  customData: Record<string, unknown>;
}
// Consumers define their own handlers keyed by customData properties
```

## Animation Presets

Pre-built keyframe sequences for common scroll patterns. Located in
`src/utils/presets.ts` alongside section presets.

### Preset Structure
```typescript
import type { AnimationPreset } from '../types';

// Each preset produces keyframes WITHOUT id or sectionId —
// those are assigned when the preset is applied to a specific project.
```

### Product Showcase Orbit
Model starts front-center, orbits 360° as user scrolls, ends front-center.
```
Keyframe 1 (scroll 0.0): orbit=0°, elevation=15°, model center
Keyframe 2 (scroll 0.25): orbit=90°, elevation=20°
Keyframe 3 (scroll 0.50): orbit=180°, elevation=10°
Keyframe 4 (scroll 0.75): orbit=270°, elevation=20°
Keyframe 5 (scroll 1.0): orbit=360°, elevation=15°, model center
All easings: easeInOutCubic
```

### Hero to Sidebar
Model starts large + centered in hero, shrinks and moves to right sidebar.
```
Keyframe 1 (scroll 0.0): position(50vw, 50vh), scale=1.5, orbit=0°
Keyframe 2 (scroll 0.15): hold=true (pin during hero content)
Keyframe 3 (scroll 0.3): position(80vw, 40vh), scale=0.6, orbit=30°
                          easing: easeOutCubic
```

### Fly Through
Camera zooms from far to close, model stays centered.
```
Keyframe 1 (scroll 0.0): distance=15, fov=35
Keyframe 2 (scroll 0.5): distance=3, fov=50, elevation changes
Keyframe 3 (scroll 1.0): distance=1.5, fov=65
All easings: easeInOutQuart
```

### Exploded View
Model splits into pieces mid-scroll, then rejoins.
```
Keyframe 1 (scroll 0.0): together
Keyframe 2 (scroll 0.3): event=split, spread=3, axis=y
Keyframe 3 (scroll 0.5): hold=true (keep exploded)
Keyframe 4 (scroll 0.7): event=rejoin
Keyframe 5 (scroll 1.0): together, orbit rotated 45°
```

### Parallax Float
Model gently bobs up/down with slight rotation, parallax effect.
```
Keyframe 1 (scroll 0.0): position(50vw, 45vh), rotation(0, 0, -5°)
Keyframe 2 (scroll 0.5): position(50vw, 55vh), rotation(0, 15°, 5°)
Keyframe 3 (scroll 1.0): position(50vw, 45vh), rotation(0, 30°, -5°)
All easings: easeInOutQuad (gentle sine-like motion)
```

### Reveal Rotate
Model starts hidden (opacity 0, behind content), reveals with rotation.
```
Keyframe 1 (scroll 0.0): opacity=0, z=-5, rotation(0, -90°, 0)
Keyframe 2 (scroll 0.3): opacity=1, z=2, rotation(0, 0, 0)
                          easing: easeOutBack (dramatic reveal)
Keyframe 3 (scroll 1.0): hold=true
```

## Scroll Physics

Physics simulation smooths the scroll-driven animation by adding momentum,
drag, and overshoot.

### PhysicsConfig (from `src/types/index.ts`)
```typescript
interface PhysicsConfig {
  momentum: boolean; // enable physics layer
  drag: number;      // 0-1: resistance to sudden changes
  overshoot: number; // 0-1: how far past target when scroll stops
}
```

### Implementation: Physics Scroll Smoother
```typescript
// This wraps the raw scrollProgress with a spring-like filter.
// Location: src/utils/scrollPhysics.ts

class ScrollPhysics {
  private velocity = 0;
  private current = 0;
  private target = 0;

  constructor(private config: PhysicsConfig) {}

  setTarget(scroll: number) {
    this.target = scroll;
  }

  // Call each frame (in useFrame or requestAnimationFrame)
  update(deltaTime: number): number {
    if (!this.config.momentum) {
      this.current = this.target;
      return this.current;
    }

    const diff = this.target - this.current;
    const springForce = diff * (1 - this.config.drag) * 10;
    const dampingForce = -this.velocity * (1 - this.config.overshoot) * 5;

    this.velocity += (springForce + dampingForce) * deltaTime;
    this.current += this.velocity * deltaTime;

    // Clamp
    this.current = Math.max(0, Math.min(1, this.current));

    return this.current;
  }
}
```

### Where Physics Plugs In
```
Raw scroll (from timeline scrub or viewport store)
  → ScrollPhysics.setTarget(rawScroll)
  → ScrollPhysics.update(dt) each frame
  → Smoothed scroll → interpolateAtScroll(keyframes, smoothedScroll)
  → Apply to model + camera
```

Physics only affects the viewport render. The timeline playhead shows the RAW
scroll position, not the physics-smoothed value.

## Responsive Breakpoint System

Keyframes can have `responsive` overrides for tablet and mobile:

```typescript
interface Keyframe {
  // ... base properties ...
  responsive?: {
    tablet?: Partial<ModelTransform>;
    mobile?: Partial<ModelTransform> & { hidden?: boolean };
  };
}
```

### Merge Rules
1. Desktop transform is the base (always defined)
2. Tablet inherits desktop, then applies its overrides
3. Mobile inherits the tablet result, then applies its overrides
4. If `mobile.hidden === true`, model is not rendered on mobile

```typescript
function getResponsiveTransform(
  base: ModelTransform,
  responsive: Keyframe['responsive'],
  breakpoint: BreakpointView
): ModelTransform & { hidden?: boolean } {
  if (breakpoint === 'desktop' || !responsive) return base;

  if (breakpoint === 'tablet' && responsive.tablet) {
    return deepMerge(base, responsive.tablet);
  }

  if (breakpoint === 'mobile') {
    const tabletMerged = responsive.tablet ? deepMerge(base, responsive.tablet) : base;
    if (responsive.mobile) {
      return { ...deepMerge(tabletMerged, responsive.mobile), hidden: responsive.mobile.hidden };
    }
    return tabletMerged;
  }

  return base;
}
```

### Where Responsive is Applied
In the viewport's interpolation pipeline:
```
1. interpolateAtScroll() returns base model + camera
2. getResponsiveTransform() applies breakpoint overrides
3. Result is used for rendering
```

The current breakpoint comes from viewport store: `useStore(s => s.breakpointView)`

## Store Integration

```typescript
import { useStore } from '../../store';

const physics = useStore(s => s.physics);
const setPhysics = useStore(s => s.setPhysics);
const breakpointView = useStore(s => s.breakpointView);
const keyframes = useStore(s => s.keyframes);
const updateKeyframe = useStore(s => s.updateKeyframe);
```

## Examples

**Example 1: Adding exploded view to a product page**
User says: "Add a split animation where the model explodes into pieces"
Actions:
1. Identify mesh group names from the loaded GLB
2. Create a keyframe with `event: { type: 'split', pieces: [...], spread: 3, axis: 'y' }`
3. Add a hold keyframe after it to keep the exploded state
4. Add a rejoin keyframe to bring pieces back together
5. Wire the applySplitEvent to the viewport render loop

**Example 2: Enabling scroll physics**
User says: "Make the scroll feel smoother with momentum"
Actions:
1. Create ScrollPhysics instance with project's PhysicsConfig
2. In viewport useFrame, call physics.update(delta) each frame
3. Use the smoothed value for interpolation instead of raw scrollProgress
4. Leave timeline playhead on raw scroll for accuracy

## Troubleshooting

**Issue: Split pieces don't match expected mesh groups**
Cause: GLB mesh names don't match the pieces array
Solution: Log `scene.traverse(c => console.log(c.name))` to see actual names

**Issue: Physics overshoot causes scroll to go out of 0-1 range**
Cause: Spring simulation not clamped
Solution: Always clamp physics output: `Math.max(0, Math.min(1, value))`

**Issue: Responsive overrides not applying**
Cause: Checking breakpoint after interpolation instead of during
Solution: Apply responsive merge AFTER interpolation but BEFORE rendering
