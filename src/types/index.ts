// ============================================
// SPYN — Type Definitions
// ============================================

// --- Content & Layout ---

export interface ContentBlock {
  id: string;
  type: 'heading' | 'subtitle' | 'text-block' | 'button' | 'card' | 'image' | 'form' | 'custom';
  label: string;
  position: {
    x: number;  // viewport-relative: 0-100 (vw)
    y: number;  // viewport-relative: 0-100 (vh) — relative to section top
    w: number;  // width in vw
    h: number;  // height in vh
  };
  zLayer: number;  // z-index layer for 3D depth ordering
}

export type SectionPresetType =
  | 'hero-banner'
  | 'features-grid'
  | 'text-image'
  | 'our-team'
  | 'testimonials'
  | 'contact-form'
  | 'gallery'
  | 'pricing'
  | 'stats'
  | 'cta-banner'
  | 'blank';

export interface Section {
  id: string;
  type: SectionPresetType;
  label: string;
  height: number;           // in vh units
  contentBlocks: ContentBlock[];
  color: string;            // for timeline region visualization
}

// --- 3D Model ---

export interface ModelConfig {
  file: string | null;      // path/name of GLB/GLTF file
  initialScale: number;
  initialRotation: { x: number; y: number; z: number };  // degrees
}

// --- Keyframes ---

export interface ModelTransform {
  position: {
    x: number;  // vw (0-100)
    y: number;  // vh (0-100)
    z: number;  // depth: positive = in front of content, negative = behind
  };
  rotation: {
    x: number;  // degrees
    y: number;  // degrees
    z: number;  // degrees
  };
  scale: number;
  opacity: number;  // 0-1
}

export interface CameraConfig {
  orbit: number;       // degrees: angle around model (0=front, 90=side, 180=back)
  elevation: number;   // degrees: angle above/below (0=eye level, 90=top down)
  distance: number;    // distance from model
  fov: number;         // field of view in degrees
  lookAt: 'model' | { x: number; y: number; z: number };
  offset: { x: number; y: number };  // shift look-at point for off-center framing
}

export type EasingFunction =
  | 'linear'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack';

export type KeyframeEventType = 'split' | 'rejoin' | 'material-swap' | 'custom';

export interface KeyframeEvent {
  type: KeyframeEventType;
  pieces?: string[];        // mesh group names for split
  spread?: number;          // how far pieces separate
  axis?: 'x' | 'y' | 'z';  // split direction
  stagger?: number;         // delay between pieces
  material?: string;        // for material-swap
  customData?: Record<string, unknown>;  // for custom events
}

export interface Keyframe {
  id: string;
  scroll: number;           // normalized 0-1 scroll position
  sectionId: string;        // which section this keyframe belongs to
  description: string;      // natural language description for Claude Code
  model: ModelTransform;
  camera: CameraConfig;
  easeFrom: EasingFunction; // easing from PREVIOUS keyframe to this one
  hold: boolean;            // if true, model stays pinned until next keyframe
  event?: KeyframeEvent;
  responsive?: {
    tablet?: Partial<ModelTransform>;
    mobile?: Partial<ModelTransform> & { hidden?: boolean };
  };
}

// --- Physics ---

export interface PhysicsConfig {
  momentum: boolean;
  drag: number;       // 0-1: how much model resists sudden scroll changes
  overshoot: number;  // 0-1: how much model slides past target when scroll stops
}

// --- Animation Presets ---

export type AnimationPresetType =
  | 'product-showcase-orbit'
  | 'hero-to-sidebar'
  | 'fly-through'
  | 'exploded-view'
  | 'parallax-float'
  | 'reveal-rotate';

export interface AnimationPreset {
  id: AnimationPresetType;
  name: string;
  description: string;
  keyframes: Omit<Keyframe, 'id' | 'sectionId'>[];
}

// --- Project ---

export interface SpynProject {
  name: string;
  model: ModelConfig;
  physics: PhysicsConfig;
  sections: Section[];
  keyframes: Keyframe[];
}

// --- Viewport UI State ---

export type ViewportMode = 'preview' | 'edit';
export type BreakpointView = 'desktop' | 'tablet' | 'mobile';

export interface ViewportState {
  mode: ViewportMode;
  selectedKeyframeId: string | null;
  scrollProgress: number;         // current scrub position 0-1
  breakpointView: BreakpointView;
  showDebugOverlay: boolean;
  showWireframes: boolean;
}
