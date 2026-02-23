# Spyn — 3D Scroll Choreography Tool

## What This Is
A visual editor for choreographing 3D object animations on scroll-based
websites. Outputs a YAML spec (spyn.config.yaml) that can be given to
Claude Code for precise implementation.

Spyn is a communication layer between designer and AI coding assistant.

## Tech Stack
- React 18+ with TypeScript (strict mode)
- Tailwind CSS for styling
- Three.js via React Three Fiber (@react-three/fiber, @react-three/drei)
- Zustand for state management (sliced stores)
- @dnd-kit for drag and drop
- js-yaml for YAML export
- lucide-react for icons

## Architecture
Four-panel layout:
- Left: Section Builder (page wireframe with preset sections)
- Center: 3D Viewport (Three.js scene with wireframe overlay)
- Bottom: Timeline (scroll-mapped keyframes with hold zones)
- Right: Properties Panel (edit selected keyframe values)

## Coding Conventions
- Functional components only, no classes
- Zustand stores in /src/store/ with separate slices
- All types in /src/types/index.ts
- Components organized by panel in /src/components/{PanelName}/
- Shared UI components in /src/components/ui/
- Use viewport-relative units (vw/vh) for all positions
- Rotations stored in degrees, converted to radians only at render time
- Scroll progress always normalized 0-1
- Descriptive variable names, minimal comments (code should be self-documenting)
- Tailwind for all styling, no CSS modules or styled-components

## Key Concepts
- Sections define the page layout and scroll regions
- Section heights (vh) determine scroll pacing — taller = more scroll time
- Keyframes store model transform + camera config at a scroll position
- Hold zones pin the model while content scrolls past
- The YAML export is the primary output — it must be precise enough for
  Claude Code to implement without ambiguity
- Z-depth determines if 3D model renders in front of or behind content

## File Structure
See /src/ for the component and store organization.
Types are the source of truth — check /src/types/index.ts first.
