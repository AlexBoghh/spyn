import type { StateCreator } from 'zustand';
import type { ModelConfig, PhysicsConfig } from '../types';

export interface ProjectSlice {
  name: string;
  model: ModelConfig;
  physics: PhysicsConfig;
  setName: (name: string) => void;
  setModel: (config: Partial<ModelConfig>) => void;
  setPhysics: (config: Partial<PhysicsConfig>) => void;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set) => ({
  name: 'Untitled Project',
  model: {
    file: null,
    initialScale: 1,
    initialRotation: { x: 0, y: 0, z: 0 },
  },
  physics: {
    momentum: true,
    drag: 0.3,
    overshoot: 0.1,
  },

  setName: (name) => set({ name }),

  setModel: (config) =>
    set((state) => ({ model: { ...state.model, ...config } })),

  setPhysics: (config) =>
    set((state) => ({ physics: { ...state.physics, ...config } })),
});
