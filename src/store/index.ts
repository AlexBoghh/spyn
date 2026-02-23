import { create } from 'zustand';
import { createSectionSlice, type SectionSlice } from './sectionStore';
import { createKeyframeSlice, type KeyframeSlice } from './keyframeStore';
import { createCameraSlice, type CameraSlice } from './cameraStore';
import { createViewportSlice, type ViewportSlice } from './viewportStore';
import { createProjectSlice, type ProjectSlice } from './projectStore';

export type StoreState = SectionSlice & KeyframeSlice & CameraSlice & ViewportSlice & ProjectSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createSectionSlice(...a),
  ...createKeyframeSlice(...a),
  ...createCameraSlice(...a),
  ...createViewportSlice(...a),
  ...createProjectSlice(...a),
}));
