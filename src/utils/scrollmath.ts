import type { Section } from '../types';

export function getTotalScrollHeight(sections: Section[]): number {
  return sections.reduce((sum, s) => sum + s.height, 0);
}

export function scrollToSectionProgress(
  scroll: number,
  sections: Section[]
): { sectionIndex: number; localProgress: number } {
  const totalHeight = getTotalScrollHeight(sections);
  if (totalHeight === 0) return { sectionIndex: 0, localProgress: 0 };

  const scrollVh = scroll * totalHeight;
  let accumulated = 0;

  for (let i = 0; i < sections.length; i++) {
    const sectionEnd = accumulated + sections[i].height;
    if (scrollVh <= sectionEnd) {
      const localProgress = sections[i].height > 0
        ? (scrollVh - accumulated) / sections[i].height
        : 0;
      return { sectionIndex: i, localProgress };
    }
    accumulated = sectionEnd;
  }

  return { sectionIndex: sections.length - 1, localProgress: 1 };
}

export function sectionProgressToScroll(
  sectionIndex: number,
  localProgress: number,
  sections: Section[]
): number {
  const totalHeight = getTotalScrollHeight(sections);
  if (totalHeight === 0) return 0;

  let accumulated = 0;
  for (let i = 0; i < sectionIndex && i < sections.length; i++) {
    accumulated += sections[i].height;
  }

  if (sectionIndex < sections.length) {
    accumulated += sections[sectionIndex].height * localProgress;
  }

  return accumulated / totalHeight;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
