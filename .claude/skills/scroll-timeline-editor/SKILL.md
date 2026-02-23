---
name: scroll-timeline-editor
description: >
  Builds and modifies the scroll timeline editor for the Spyn 3D choreography
  tool. This is Spyn's core feature — the horizontal timeline that maps scroll
  position to keyframes, section regions, and hold zones. Use when working on
  the timeline panel, keyframe markers, scrubbing, easing curves, scroll-to-
  transform interpolation, keyframe CRUD operations, or hold zone visualization.
  Triggers on "timeline", "keyframe", "scroll animation", "easing", "hold zone",
  "scrub", "interpolation", "add keyframe", "move keyframe", "scroll progress",
  "section regions", or any work on the bottom Timeline panel. Make sure to use
  this skill for ALL timeline and keyframe interpolation work — this is the
  hardest part of Spyn to get right.
---

# Scroll Timeline Editor

## Architecture

The Timeline is the bottom panel spanning center + right columns (full width
minus the 280px Section Builder). It visualizes the entire scroll journey as a
horizontal track with section regions, keyframe markers, and a scrub playhead.

### Component Tree
```
src/components/Timeline/
├── Timeline.tsx           ← Panel wrapper, scroll-to-pixel math
├── TimelineTrack.tsx      ← Horizontal ruler with section bands
├── KeyframeMarker.tsx     ← Diamond marker for each keyframe
├── HoldZone.tsx           ← Visual bar showing hold regions
├── ScrubPlayhead.tsx      ← Vertical line showing current scroll position
├── TimelineContextMenu.tsx← Right-click: add/delete/duplicate keyframe
└── EasingPreview.tsx      ← Mini curve visualization between keyframes
```

## Core Concepts

### Scroll-to-Pixel Mapping
The timeline has a fixed pixel width (panel width). All scroll positions (0-1)
must map to pixel positions within this width.

```typescript
// The timeline track represents the full 0-1 scroll range
// Section bands are proportional to their vh height

function scrollToPixel(scroll: number, trackWidth: number): number {
  return scroll * trackWidth;
}

function pixelToScroll(pixel: number, trackWidth: number): number {
  return Math.max(0, Math.min(1, pixel / trackWidth));
}
```

### Section Bands
Each section occupies a proportional width of the timeline based on its vh height:

```typescript
import { getTotalScrollHeight } from '../../utils/scrollmath';
import type { Section } from '../../types';

function getSectionBands(sections: Section[], trackWidth: number) {
  const totalVh = getTotalScrollHeight(sections);
  let x = 0;

  return sections.map((section) => {
    const width = totalVh > 0 ? (section.height / totalVh) * trackWidth : 0;
    const band = { section, x, width };
    x += width;
    return band;
  });
}
```

Render each band as a colored rectangle:
- Background: section color at 15% opacity (`opacity-15`)
- Bottom border: 2px solid in section color (full opacity)
- Label: section label centered, `text-xs text-gray-500`, clipped with overflow

### Keyframe Markers
Diamond shapes positioned at their scroll position:

```tsx
// KeyframeMarker.tsx
// Position: absolute, left = scrollToPixel(keyframe.scroll, trackWidth)
// Shape: 10x10px rotated 45° (rotate-45)
// Default: bg-gray-400 border border-gray-500
// Selected: bg-indigo-400 border-indigo-300 ring-2 ring-indigo-500/30
// Hold: show a horizontal bar extending from this marker to the next
// Draggable: mousedown starts drag, mousemove updates scroll position

interface KeyframeMarkerProps {
  keyframe: Keyframe;
  x: number;          // pixel position
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (newScroll: number) => void;
}
```

### Hold Zones
When a keyframe has `hold: true`, render a visual bar from that keyframe to the next:

```tsx
// HoldZone.tsx
// Horizontal bar between two keyframe x-positions
// Background: indigo-500 at 20% opacity
// Top/bottom borders: dashed, indigo-400
// Height: 4px, centered vertically on the track
// Indicates: model stays pinned at this transform while content scrolls
```

### Scrub Playhead
Vertical line showing current `scrollProgress`:

```tsx
// ScrubPlayhead.tsx
// Vertical line: w-0.5 h-full bg-white
// Top handle: small triangle or circle for grab
// Position: absolute, left = scrollToPixel(scrollProgress, trackWidth)
// Interaction:
//   - Click anywhere on track → jump playhead there
//   - Drag playhead → continuous scrub
//   - Updates: useStore(s => s.setScrollProgress)
```

### Scrubbing Interaction
```typescript
function handleTrackMouseDown(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const scroll = pixelToScroll(x, rect.width);
  setScrollProgress(scroll);

  // Start drag
  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX - rect.left;
    const scroll = pixelToScroll(x, rect.width);
    setScrollProgress(scroll);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}
```

## Keyframe Interpolation Engine

This is the core algorithm. It lives in a utility function, used by both the
timeline (for visualization) and the viewport (for 3D rendering).

### Location: `src/utils/interpolation.ts`

```typescript
import type { Keyframe, ModelTransform, CameraConfig, EasingFunction } from '../types';
import { lerp, clamp } from './scrollmath';

// Main entry point: given keyframes and scroll position, return interpolated state
export function interpolateAtScroll(
  keyframes: Keyframe[],
  scroll: number
): { model: ModelTransform; camera: CameraConfig } | null {
  if (keyframes.length === 0) return null;
  if (keyframes.length === 1) return { model: keyframes[0].model, camera: keyframes[0].camera };

  // Clamp scroll
  scroll = clamp(scroll, 0, 1);

  // Before first keyframe: use first keyframe's values
  if (scroll <= keyframes[0].scroll) return { model: keyframes[0].model, camera: keyframes[0].camera };

  // After last keyframe: use last keyframe's values
  const last = keyframes[keyframes.length - 1];
  if (scroll >= last.scroll) return { model: last.model, camera: last.camera };

  // Find bracketing pair
  let prev = keyframes[0];
  let next = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (scroll >= keyframes[i].scroll && scroll <= keyframes[i + 1].scroll) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  // Hold zone: if prev.hold is true, return prev's values
  if (prev.hold) return { model: prev.model, camera: prev.camera };

  // Compute local t (0-1 between prev and next)
  const range = next.scroll - prev.scroll;
  const t = range > 0 ? (scroll - prev.scroll) / range : 0;

  // Apply easing (next.easeFrom = easing from prev TO next)
  const easedT = applyEasing(t, next.easeFrom);

  // Interpolate both model and camera
  return {
    model: lerpModelTransform(prev.model, next.model, easedT),
    camera: lerpCameraConfig(prev.camera, next.camera, easedT),
  };
}
```

### Model Transform Interpolation
```typescript
function lerpModelTransform(a: ModelTransform, b: ModelTransform, t: number): ModelTransform {
  return {
    position: {
      x: lerp(a.position.x, b.position.x, t),
      y: lerp(a.position.y, b.position.y, t),
      z: lerp(a.position.z, b.position.z, t),
    },
    rotation: {
      x: lerp(a.rotation.x, b.rotation.x, t),
      y: lerp(a.rotation.y, b.rotation.y, t),
      z: lerp(a.rotation.z, b.rotation.z, t),
    },
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}
```

### Camera Config Interpolation
```typescript
function lerpCameraConfig(a: CameraConfig, b: CameraConfig, t: number): CameraConfig {
  return {
    orbit: lerp(a.orbit, b.orbit, t),
    elevation: lerp(a.elevation, b.elevation, t),
    distance: lerp(a.distance, b.distance, t),
    fov: lerp(a.fov, b.fov, t),
    lookAt: a.lookAt, // Don't interpolate lookAt target type
    offset: {
      x: lerp(a.offset.x, b.offset.x, t),
      y: lerp(a.offset.y, b.offset.y, t),
    },
  };
}
```

## Easing Functions

All 16 easing functions. See `references/easing-functions.md` for implementations.

Usage in interpolation:
```typescript
function applyEasing(t: number, easing: EasingFunction): number {
  // Look up easing function and return eased t
  return EASING_FUNCTIONS[easing](t);
}
```

## Keyframe CRUD Operations

### Add Keyframe
```typescript
import { DEFAULT_MODEL_TRANSFORM, DEFAULT_CAMERA_CONFIG, DEFAULT_EASING } from '../../constants';

function addKeyframeAtScroll(scroll: number, sectionId: string) {
  // If there are existing keyframes, interpolate current state as starting values
  const interpolated = interpolateAtScroll(keyframes, scroll);

  const newKeyframe: Keyframe = {
    id: crypto.randomUUID(),
    scroll,
    sectionId,
    description: '',
    model: interpolated?.model ?? DEFAULT_MODEL_TRANSFORM,
    camera: interpolated?.camera ?? DEFAULT_CAMERA_CONFIG,
    easeFrom: DEFAULT_EASING,
    hold: false,
  };

  addKeyframe(newKeyframe);
  selectKeyframe(newKeyframe.id);
}
```

### Delete Keyframe
```typescript
// Remove keyframe, select nearest remaining
function deleteSelectedKeyframe() {
  if (!selectedKeyframeId) return;
  removeKeyframe(selectedKeyframeId);
  selectKeyframe(null);
}
```

### Duplicate Keyframe
```typescript
// Copy keyframe at slightly offset scroll position
function duplicateKeyframe(id: string) {
  const kf = keyframes.find(k => k.id === id);
  if (!kf) return;
  addKeyframe({
    ...kf,
    id: crypto.randomUUID(),
    scroll: Math.min(1, kf.scroll + 0.02),
    description: `${kf.description} (copy)`,
  });
}
```

## Timeline Layout

```
┌──────────────────────────────────────────────────────┐
│ TIMELINE  [+ Add] [zoom -][zoom +]                   │ ← header bar
├──────────────────────────────────────────────────────┤
│ ┃Hero Banner    ┃Features Grid       ┃CTA Banner┃   │ ← section bands
│ ◆────────◆══════════◆───────────◆                    │ ← keyframes + hold
│          ▏                                           │ ← playhead
│ 0%         25%         50%         75%       100%    │ ← scroll ruler
└──────────────────────────────────────────────────────┘

◆ = keyframe marker (diamond)
═ = hold zone (model pinned)
▏ = scrub playhead
┃ = section boundary
```

## Store Integration

```typescript
import { useStore } from '../../store';

// Reading
const sections = useStore(s => s.sections);
const keyframes = useStore(s => s.keyframes);
const scrollProgress = useStore(s => s.scrollProgress);
const selectedKeyframeId = useStore(s => s.selectedKeyframeId);

// Mutations
const addKeyframe = useStore(s => s.addKeyframe);
const removeKeyframe = useStore(s => s.removeKeyframe);
const updateKeyframe = useStore(s => s.updateKeyframe);
const setScrollProgress = useStore(s => s.setScrollProgress);
const selectKeyframe = useStore(s => s.selectKeyframe);
```

## Examples

**Example 1: Building the timeline panel**
User says: "Build the scroll timeline with section regions and keyframe markers"
Actions:
1. Create TimelineTrack with section bands from sections array
2. Render KeyframeMarker for each keyframe at correct pixel position
3. Add ScrubPlayhead with click-to-jump and drag-to-scrub
4. Wire selection: click marker → selectKeyframe(id)
5. Add right-click context menu for add/delete/duplicate

**Example 2: Implementing hold zones**
User says: "Add hold zone visualization to the timeline"
Actions:
1. For each keyframe with hold=true, find the next keyframe
2. Render HoldZone bar between their pixel positions
3. Style: indigo bar with dashed borders, 20% opacity

## Troubleshooting

**Issue: Keyframe markers overlap when close together**
Cause: Normalized scroll positions very close (e.g., 0.01 apart)
Solution: Add minimum pixel spacing, offset overlapping markers vertically

**Issue: Scrubbing feels jittery**
Cause: Mouse events at 60fps overwhelming Zustand updates
Solution: Use requestAnimationFrame to throttle setScrollProgress calls

**Issue: Section bands don't match actual scroll behavior**
Cause: Using equal widths instead of proportional to vh heights
Solution: Always use `section.height / totalVh * trackWidth` for band widths

**Issue: Interpolation jumps at keyframe boundaries**
Cause: Not handling edge cases (before first, after last keyframe)
Solution: Return first keyframe values for scroll < first.scroll, last for scroll > last.scroll
