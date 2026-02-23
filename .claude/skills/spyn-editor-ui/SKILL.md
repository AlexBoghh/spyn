---
name: spyn-editor-ui
description: >
  Builds dark-theme editor UI controls for the Spyn 3D scroll choreography tool.
  Use when building or modifying any UI component inside Spyn's four-panel layout,
  including numeric inputs, property groups, section lists, dropdowns, sliders,
  color pickers, or toolbar buttons. Triggers on "build UI component", "create
  editor control", "properties panel", "section builder", "add input", "slider
  component", "collapsible group", or any Spyn panel UI work. Make sure to use
  this skill whenever working on Spyn UI components, even for small changes —
  editor tools need specific patterns that differ from typical web UI.
---

# Spyn Editor UI

## Design Language

Spyn is a professional editor tool, not a website. Every UI element should feel
like VS Code, Blender, or After Effects — compact, information-dense, keyboard-friendly.

### Color System (Tailwind classes only)
- **Background layers:** `bg-gray-900` (app), `bg-gray-800` (panels), `bg-gray-750` (nested groups)
- **Borders:** `border-gray-700` (panel dividers), `border-gray-600` (input borders)
- **Text:** `text-gray-100` (primary), `text-gray-400` (labels), `text-gray-500` (placeholders)
- **Accent:** `text-indigo-400` / `bg-indigo-500` (selected states, active elements)
- **Hover:** `hover:bg-gray-700` (list items), `hover:border-gray-500` (inputs)
- **Section colors:** Use `SECTION_COLORS` from `src/utils/presets.ts` for section-specific chips

### Typography
- Panel headers: `text-xs font-semibold uppercase tracking-wider text-gray-400`
- Property labels: `text-xs text-gray-400`
- Input values: `text-sm text-gray-100 font-mono`
- Section labels: `text-sm font-medium text-gray-200`

### Spacing
- Panel padding: `px-4 py-3` for headers, `p-3` for content areas
- Property rows: `gap-2` between label and input, `gap-1` between stacked rows
- Group spacing: `mt-3` between property groups

## Component Patterns

### Numeric Input with Scrub
The primary input for all numeric values (position, rotation, scale, etc.):

```tsx
// Location: src/components/ui/NumericInput.tsx
// - Shows value with unit suffix (°, vw, vh, %)
// - Click + drag horizontally to scrub value
// - Shift+drag for 0.1 precision, no modifier for 1.0 steps
// - Arrow keys: up/down by step, shift+arrow for fine step
// - Double-click to type exact value
// - Right-click to reset to default

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;        // default 1
  fineStep?: number;    // default 0.1 (shift+drag)
  suffix?: string;      // "°", "vw", "vh", "%"
  label?: string;
  defaultValue?: number; // for right-click reset
}
```

Styling: `h-7 bg-gray-900 border border-gray-600 rounded px-2 text-sm font-mono text-gray-100 w-full`
Focused: `focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30`

### Property Group (Collapsible)
Groups related properties under a disclosure header:

```tsx
// Location: src/components/ui/PropertyGroup.tsx
interface PropertyGroupProps {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
```

- Header: chevron icon (lucide `ChevronRight` / `ChevronDown`) + label
- Chevron rotates with `transition-transform duration-150`
- Content area: `pl-2` indent, hidden when collapsed
- Store open/closed state in local component state (not Zustand)

### Property Row
Single label + input pair:

```tsx
// Location: src/components/ui/PropertyRow.tsx
// Layout: grid grid-cols-[80px_1fr] items-center gap-2
// Label on left: text-xs text-gray-400 truncate
// Input on right: any input component
```

### XYZ Input Group
For position/rotation vectors — three numeric inputs in a row:

```tsx
// Location: src/components/ui/XYZInput.tsx
// Layout: grid grid-cols-3 gap-1
// Each input has a colored left-border indicator:
//   X: border-l-2 border-red-500
//   Y: border-l-2 border-green-500
//   Z: border-l-2 border-blue-500
// Pass suffix per-axis: position uses "vw"/"vh"/"z", rotation uses "°"
```

### Dropdown Select
For easing functions, section presets, event types:

```tsx
// Location: src/components/ui/DropdownSelect.tsx
// Styling matches inputs: bg-gray-900 border-gray-600 text-sm
// Use native <select> with custom styling, not a custom dropdown
// For easing: group options by family (Quad, Cubic, Quart, Expo, Back)
```

### Toggle Button
For boolean states (hold, momentum, wireframes, debug overlay):

```tsx
// Compact pill shape: h-5 w-9 rounded-full
// Off: bg-gray-600
// On: bg-indigo-500
// Animated dot: transition-transform duration-150
```

### Section Card
For the Section Builder panel — represents one page section:

```tsx
// Location: src/components/SectionBuilder/SectionCard.tsx
// Left color bar: w-1 rounded-full, color from SECTION_COLORS[section.type]
// Label: text-sm font-medium text-gray-200
// Type badge: text-xs text-gray-400
// Height display: text-xs font-mono text-gray-500 (e.g., "100vh")
// Drag handle: lucide GripVertical icon, cursor-grab
// Selected state: ring-1 ring-indigo-500 bg-gray-750
// Use @dnd-kit for drag-and-drop reordering
```

### Toolbar Button
For viewport mode toggles, breakpoint switcher, action buttons:

```tsx
// Size: h-8 w-8 or h-8 px-3 (icon-only vs icon+label)
// Default: bg-transparent text-gray-400 hover:bg-gray-700 hover:text-gray-200
// Active: bg-gray-700 text-indigo-400
// Use lucide-react icons at size={16}
```

## Spyn-Specific References

### Types to import from `src/types/index.ts`:
- `Section`, `SectionPresetType`, `ContentBlock` — for Section Builder
- `Keyframe`, `ModelTransform`, `CameraConfig` — for Properties Panel
- `EasingFunction` — for easing dropdown
- `ViewportMode`, `BreakpointView` — for toolbar toggles
- `KeyframeEvent`, `KeyframeEventType` — for event configuration

### Store hook: `useStore()` from `src/store/index.ts`
- Section mutations: `addSection`, `removeSection`, `updateSection`, `reorderSections`
- Content block mutations: `addContentBlock`, `removeContentBlock`, `updateContentBlock`
- Keyframe mutations: `updateKeyframe`
- Viewport state: `mode`, `selectedKeyframeId`, `breakpointView`, `setMode`, `selectKeyframe`, `setBreakpointView`

### Utilities:
- `createSection(type, height?)` from `src/utils/presets.ts` — creates sections with preset blocks
- `SECTION_COLORS`, `SECTION_LABELS` from `src/utils/presets.ts`

## Layout Rules

### Properties Panel (right panel, 300px wide)
```
┌─────────────────────┐
│ PROPERTIES          │ ← panel header
├─────────────────────┤
│ ▸ Model Transform   │ ← PropertyGroup (collapsible)
│   Position  [x][y][z]│ ← XYZInput
│   Rotation  [x][y][z]│
│   Scale     [1.0   ]│ ← NumericInput
│   Opacity   [1.0   ]│
├─────────────────────┤
│ ▸ Camera            │
│   Orbit     [0°    ]│
│   Elevation [15°   ]│
│   Distance  [5.0   ]│
│   FOV       [50°   ]│
├─────────────────────┤
│ ▸ Animation         │
│   Easing   [dropdown]│
│   Hold     [toggle  ]│
│   Desc     [text    ]│
└─────────────────────┘
```

### Section Builder (left panel, 280px wide)
```
┌─────────────────────┐
│ SECTION BUILDER     │
│ [+ Add Section ▾]   │ ← dropdown with presets
├─────────────────────┤
│ ┃ Hero Banner       │ ← SectionCard (draggable)
│ ┃ 100vh             │
├─────────────────────┤
│ ┃ Features Grid     │
│ ┃ 150vh             │
├─────────────────────┤
│ ┃ CTA Banner        │
│ ┃ 80vh              │
└─────────────────────┘
```

## Examples

**Example 1: Building the Properties Panel**
User says: "Build the properties panel for editing keyframe values"
Actions:
1. Create PropertyGroup, PropertyRow, NumericInput, XYZInput, DropdownSelect, Toggle components in `src/components/ui/`
2. Build PropertiesPanel reading `selectedKeyframeId` from viewport store
3. Find the selected keyframe from `keyframes` array
4. Render Model Transform group with XYZInput for position/rotation, NumericInput for scale/opacity
5. Render Camera group with NumericInput fields for orbit/elevation/distance/fov
6. Render Animation group with easing dropdown, hold toggle, description textarea
7. Wire all inputs to `updateKeyframe(id, updates)` from keyframe store

**Example 2: Adding a numeric scrub input**
User says: "Create a scrub input for the rotation Y value"
Actions:
1. Use NumericInput component with `suffix="°"`, `min=-360`, `max=360`, `step=1`
2. Wire to keyframe update: `updateKeyframe(id, { model: { ...model, rotation: { ...rotation, y: newValue } } })`
3. Render inside a PropertyRow with label "Y"

## Troubleshooting

**Issue: Inputs feel laggy during scrub**
Cause: Re-rendering entire panel on every mouse move
Solution: Use local state during drag, commit to Zustand only on mouseUp

**Issue: Colors don't match between section builder and timeline**
Cause: Using hardcoded colors instead of SECTION_COLORS
Solution: Always import from `src/utils/presets.ts`, never hardcode section colors

**Issue: Property groups fight for scroll space**
Cause: Too many groups open at once in 300px panel
Solution: Panel content area should be `overflow-y-auto` with `flex-1`
