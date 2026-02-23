import type { ModelTransform, CameraConfig, EasingFunction } from '../types';

export const DEFAULT_MODEL_TRANSFORM: ModelTransform = {
  position: { x: 50, y: 50, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  opacity: 1,
};

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  orbit: 0,
  elevation: 15,
  distance: 5,
  fov: 50,
  lookAt: 'model',
  offset: { x: 0, y: 0 },
};

export const DEFAULT_EASING: EasingFunction = 'easeInOutCubic';

export const BREAKPOINTS = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
} as const;

export const PANEL_SIZES = {
  leftPanel: 280,
  rightPanel: 300,
  bottomPanel: 200,
} as const;
