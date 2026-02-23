import type { StateCreator } from 'zustand';
import type { Keyframe } from '../types';

export interface KeyframeSlice {
  keyframes: Keyframe[];
  addKeyframe: (keyframe: Keyframe) => void;
  removeKeyframe: (id: string) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  reorderKeyframes: () => void;
}

export const createKeyframeSlice: StateCreator<KeyframeSlice> = (set) => ({
  keyframes: [],

  addKeyframe: (keyframe) =>
    set((state) => ({
      keyframes: [...state.keyframes, keyframe].sort((a, b) => a.scroll - b.scroll),
    })),

  removeKeyframe: (id) =>
    set((state) => ({ keyframes: state.keyframes.filter((k) => k.id !== id) })),

  updateKeyframe: (id, updates) =>
    set((state) => ({
      keyframes: state.keyframes
        .map((k) => (k.id === id ? { ...k, ...updates } : k))
        .sort((a, b) => a.scroll - b.scroll),
    })),

  reorderKeyframes: () =>
    set((state) => ({
      keyframes: [...state.keyframes].sort((a, b) => a.scroll - b.scroll),
    })),
});
