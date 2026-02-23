import { StateCreator } from 'zustand';
import type { CameraConfig } from '../types';

const defaultCamera: CameraConfig = {
  orbit: 0,
  elevation: 15,
  distance: 5,
  fov: 50,
  lookAt: 'model',
  offset: { x: 0, y: 0 },
};

export interface CameraSlice {
  defaultCamera: CameraConfig;
  setDefaultCamera: (config: Partial<CameraConfig>) => void;
}

export const createCameraSlice: StateCreator<CameraSlice> = (set) => ({
  defaultCamera,

  setDefaultCamera: (config) =>
    set((state) => ({
      defaultCamera: { ...state.defaultCamera, ...config },
    })),
});
