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

## Skills

This project has 5 custom skills at `.claude/skills/`. Invoke the relevant
skill BEFORE starting work on any task that matches its triggers:

- **spyn-editor-ui** — Dark-theme editor controls, numeric inputs, property
  groups, section cards, toolbar buttons. Use when building ANY UI component
  for Spyn's panels.
  Triggers: "build UI component", "create editor control", "properties panel",
  "section builder", "toolbar", "input component"

- **r3f-editor-viewport** — React Three Fiber scene, camera rig, model loading,
  coordinate mapping (vw/vh → world), edit/preview modes.
  Triggers: "3D viewport", "load model", "camera controls", "Three.js scene",
  "R3F", "wireframe", "model preview"

- **scroll-timeline-editor** — Timeline panel, keyframe markers, scrubbing,
  interpolation engine, easing curves, hold zones.
  Triggers: "timeline", "keyframe", "scroll animation", "easing", "hold zone",
  "scrub", "interpolation", "scroll progress"

- **spyn-3d-animations** — Split/explode events, physics simulation, animation
  presets, responsive breakpoint overrides.
  Triggers: "split animation", "exploded view", "physics", "momentum",
  "animation preset", "responsive keyframe"

- **spyn-yaml-export** — YAML export, validation, save/load, copy-to-clipboard,
  schema enforcement.
  Triggers: "export YAML", "generate config", "spyn.config", "save project",
  "load project", "validation"

## File Structure
See /src/ for the component and store organization.
Types are the source of truth — check /src/types/index.ts first.
