import { describe, it, expect } from 'vitest';
import { interpolateAtScroll } from '../interpolation';
import type { Keyframe } from '../../types';
import { DEFAULT_MODEL_TRANSFORM, DEFAULT_CAMERA_CONFIG } from '../../constants';

function makeKeyframe(overrides: Partial<Keyframe> & { scroll: number }): Keyframe {
  return {
    id: crypto.randomUUID(),
    sectionId: 'sec-1',
    description: '',
    model: { ...DEFAULT_MODEL_TRANSFORM },
    camera: { ...DEFAULT_CAMERA_CONFIG },
    easeFrom: 'linear',
    hold: false,
    ...overrides,
  };
}

const kfA = makeKeyframe({
  scroll: 0,
  model: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    opacity: 1,
  },
  camera: {
    orbit: 0, elevation: 0, distance: 5, fov: 50,
    lookAt: 'model', offset: { x: 0, y: 0 },
  },
});

const kfB = makeKeyframe({
  scroll: 1,
  model: {
    position: { x: 100, y: 100, z: 10 },
    rotation: { x: 90, y: 180, z: 45 },
    scale: 2,
    opacity: 0.5,
  },
  camera: {
    orbit: 180, elevation: 45, distance: 10, fov: 75,
    lookAt: 'model', offset: { x: 1, y: 2 },
  },
});

describe('interpolateAtScroll', () => {
  it('returns null for empty keyframes', () => {
    expect(interpolateAtScroll([], 0.5)).toBeNull();
  });

  it('returns single keyframe values regardless of scroll', () => {
    const result = interpolateAtScroll([kfA], 0.5);
    expect(result).not.toBeNull();
    expect(result!.model.position.x).toBe(0);
    expect(result!.camera.orbit).toBe(0);
  });

  it('returns first keyframe when scroll is before first', () => {
    const kfs = [makeKeyframe({ scroll: 0.3 }), makeKeyframe({ scroll: 0.8 })];
    const result = interpolateAtScroll(kfs, 0.1);
    expect(result!.model).toEqual(kfs[0].model);
  });

  it('returns last keyframe when scroll is after last', () => {
    const kfs = [makeKeyframe({ scroll: 0.2 }), makeKeyframe({ scroll: 0.6 })];
    const result = interpolateAtScroll(kfs, 0.9);
    expect(result!.model).toEqual(kfs[1].model);
  });

  it('linearly interpolates at midpoint with linear easing', () => {
    const result = interpolateAtScroll([kfA, kfB], 0.5);
    expect(result!.model.position.x).toBeCloseTo(50);
    expect(result!.model.position.y).toBeCloseTo(50);
    expect(result!.model.rotation.y).toBeCloseTo(90);
    expect(result!.model.scale).toBeCloseTo(1.5);
    expect(result!.model.opacity).toBeCloseTo(0.75);
    expect(result!.camera.orbit).toBeCloseTo(90);
    expect(result!.camera.elevation).toBeCloseTo(22.5);
    expect(result!.camera.distance).toBeCloseTo(7.5);
    expect(result!.camera.fov).toBeCloseTo(62.5);
    expect(result!.camera.offset.x).toBeCloseTo(0.5);
  });

  it('interpolates at 25%', () => {
    const result = interpolateAtScroll([kfA, kfB], 0.25);
    expect(result!.model.position.x).toBeCloseTo(25);
    expect(result!.model.scale).toBeCloseTo(1.25);
  });

  it('holds prev values when prev.hold is true', () => {
    const held = { ...kfA, hold: true };
    const result = interpolateAtScroll([held, kfB], 0.5);
    expect(result!.model.position.x).toBe(0);
    expect(result!.model.scale).toBe(1);
    expect(result!.camera.orbit).toBe(0);
  });

  it('applies easing (easeOutQuad at t=0.5 gives 0.75 blend)', () => {
    const kfBEased = { ...kfB, easeFrom: 'easeOutQuad' as const };
    const result = interpolateAtScroll([kfA, kfBEased], 0.5);
    // easeOutQuad(0.5) = 0.75, so position.x = lerp(0, 100, 0.75) = 75
    expect(result!.model.position.x).toBeCloseTo(75);
  });

  it('finds correct bracket among multiple keyframes', () => {
    const kfMid = makeKeyframe({
      scroll: 0.5,
      model: {
        position: { x: 50, y: 50, z: 5 },
        rotation: { x: 45, y: 90, z: 22.5 },
        scale: 1.5,
        opacity: 0.8,
      },
    });
    const result = interpolateAtScroll([kfA, kfMid, kfB], 0.25);
    // Between kfA (scroll=0) and kfMid (scroll=0.5), localT = 0.25/0.5 = 0.5
    expect(result!.model.position.x).toBeCloseTo(25);
    expect(result!.model.scale).toBeCloseTo(1.25);
  });

  it('preserves lookAt from prev keyframe', () => {
    const a = makeKeyframe({ scroll: 0, camera: { ...DEFAULT_CAMERA_CONFIG, lookAt: 'model' } });
    const b = makeKeyframe({ scroll: 1, camera: { ...DEFAULT_CAMERA_CONFIG, lookAt: { x: 1, y: 2, z: 3 } } });
    const result = interpolateAtScroll([a, b], 0.5);
    expect(result!.camera.lookAt).toBe('model');
  });

  it('handles zero-range brackets (same scroll position)', () => {
    const a = makeKeyframe({ scroll: 0.5 });
    const b = makeKeyframe({ scroll: 0.5 });
    const result = interpolateAtScroll([a, b], 0.5);
    expect(result).not.toBeNull();
  });
});
