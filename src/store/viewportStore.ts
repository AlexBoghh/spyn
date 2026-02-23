import { StateCreator } from 'zustand';
import type { ViewportState, ViewportMode, BreakpointView } from '../types';

export interface ViewportSlice extends ViewportState {
  setMode: (mode: ViewportMode) => void;
  selectKeyframe: (id: string | null) => void;
  selectSection: (id: string | null) => void;
  setScrollProgress: (progress: number) => void;
  setBreakpointView: (view: BreakpointView) => void;
  toggleDebugOverlay: () => void;
  toggleWireframes: () => void;
}

export const createViewportSlice: StateCreator<ViewportSlice> = (set) => ({
  mode: 'edit',
  selectedKeyframeId: null,
  selectedSectionId: null,
  scrollProgress: 0,
  breakpointView: 'desktop',
  showDebugOverlay: false,
  showWireframes: true,

  setMode: (mode) => set({ mode }),
  selectKeyframe: (id) => set({ selectedKeyframeId: id }),
  selectSection: (id) => set({ selectedSectionId: id }),
  setScrollProgress: (progress) => set({ scrollProgress: Math.max(0, Math.min(1, progress)) }),
  setBreakpointView: (view) => set({ breakpointView: view }),
  toggleDebugOverlay: () => set((state) => ({ showDebugOverlay: !state.showDebugOverlay })),
  toggleWireframes: () => set((state) => ({ showWireframes: !state.showWireframes })),
});
