import type { Keyframe, ModelTransform, CameraConfig } from '../types';
import { lerp, clamp } from './scrollmath';
import { applyEasing } from './easing';

function lerpTransform(a: ModelTransform, b: ModelTransform, t: number): ModelTransform {
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

function lerpCamera(a: CameraConfig, b: CameraConfig, t: number): CameraConfig {
  return {
    orbit: lerp(a.orbit, b.orbit, t),
    elevation: lerp(a.elevation, b.elevation, t),
    distance: lerp(a.distance, b.distance, t),
    fov: lerp(a.fov, b.fov, t),
    lookAt: a.lookAt,
    offset: {
      x: lerp(a.offset.x, b.offset.x, t),
      y: lerp(a.offset.y, b.offset.y, t),
    },
  };
}

export function interpolateAtScroll(
  keyframes: Keyframe[],
  scroll: number,
): { model: ModelTransform; camera: CameraConfig } | null {
  if (keyframes.length === 0) return null;
  if (keyframes.length === 1) return { model: keyframes[0].model, camera: keyframes[0].camera };

  scroll = clamp(scroll, 0, 1);

  if (scroll <= keyframes[0].scroll) {
    return { model: keyframes[0].model, camera: keyframes[0].camera };
  }

  const last = keyframes[keyframes.length - 1];
  if (scroll >= last.scroll) {
    return { model: last.model, camera: last.camera };
  }

  let prev = keyframes[0];
  let next = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (scroll >= keyframes[i].scroll && scroll <= keyframes[i + 1].scroll) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  if (prev.hold) {
    return { model: prev.model, camera: prev.camera };
  }

  const range = next.scroll - prev.scroll;
  const t = range > 0 ? (scroll - prev.scroll) / range : 0;
  const easedT = applyEasing(t, next.easeFrom);

  return {
    model: lerpTransform(prev.model, next.model, easedT),
    camera: lerpCamera(prev.camera, next.camera, easedT),
  };
}
