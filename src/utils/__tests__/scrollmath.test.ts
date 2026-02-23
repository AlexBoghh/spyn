import {
  clamp,
  lerp,
  degToRad,
  radToDeg,
  getTotalScrollHeight,
  scrollToSectionProgress,
  sectionProgressToScroll,
} from '../scrollmath';
import type { Section } from '../../types';

function stub(height: number): Section {
  return { id: 'test', type: 'blank', label: '', height, contentBlocks: [], color: '' };
}

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('returns max when value is above', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns boundary when value equals boundary', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});

describe('degToRad', () => {
  it('converts 0 degrees to 0 radians', () => {
    expect(degToRad(0)).toBe(0);
  });

  it('converts 180 degrees to PI radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
  });

  it('converts 360 degrees to 2*PI radians', () => {
    expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
  });

  it('converts 90 degrees to PI/2 radians', () => {
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
  });
});

describe('radToDeg', () => {
  it('converts 0 radians to 0 degrees', () => {
    expect(radToDeg(0)).toBe(0);
  });

  it('converts PI radians to 180 degrees', () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });

  it('round-trips with degToRad', () => {
    expect(radToDeg(degToRad(45))).toBeCloseTo(45);
    expect(radToDeg(degToRad(270))).toBeCloseTo(270);
  });
});

describe('getTotalScrollHeight', () => {
  it('returns 0 for empty array', () => {
    expect(getTotalScrollHeight([])).toBe(0);
  });

  it('returns single section height', () => {
    expect(getTotalScrollHeight([stub(100)])).toBe(100);
  });

  it('sums multiple section heights', () => {
    expect(getTotalScrollHeight([stub(100), stub(200), stub(50)])).toBe(350);
  });
});

describe('scrollToSectionProgress', () => {
  it('returns index 0, progress 0 for empty sections', () => {
    expect(scrollToSectionProgress(0.5, [])).toEqual({ sectionIndex: 0, localProgress: 0 });
  });

  it('returns start of first section at scroll=0', () => {
    const sections = [stub(100), stub(100)];
    expect(scrollToSectionProgress(0, sections)).toEqual({ sectionIndex: 0, localProgress: 0 });
  });

  it('returns end of last section at scroll=1', () => {
    const sections = [stub(100), stub(100)];
    expect(scrollToSectionProgress(1, sections)).toEqual({ sectionIndex: 1, localProgress: 1 });
  });

  it('returns midpoint of single section at scroll=0.5', () => {
    const sections = [stub(100)];
    const result = scrollToSectionProgress(0.5, sections);
    expect(result.sectionIndex).toBe(0);
    expect(result.localProgress).toBeCloseTo(0.5);
  });

  it('correctly maps scroll into second section', () => {
    const sections = [stub(100), stub(100)]; // total 200vh
    // scroll=0.75 → 150vh into 200vh → section 1, local 50/100 = 0.5
    const result = scrollToSectionProgress(0.75, sections);
    expect(result.sectionIndex).toBe(1);
    expect(result.localProgress).toBeCloseTo(0.5);
  });

  it('handles unequal section heights', () => {
    const sections = [stub(200), stub(100)]; // total 300vh
    // scroll=0.5 → 150vh → still in section 0 (ends at 200), local = 150/200 = 0.75
    const result = scrollToSectionProgress(0.5, sections);
    expect(result.sectionIndex).toBe(0);
    expect(result.localProgress).toBeCloseTo(0.75);
  });
});

describe('sectionProgressToScroll', () => {
  it('returns 0 for empty sections', () => {
    expect(sectionProgressToScroll(0, 0, [])).toBe(0);
  });

  it('returns 0 for start of first section', () => {
    const sections = [stub(100), stub(100)];
    expect(sectionProgressToScroll(0, 0, sections)).toBe(0);
  });

  it('returns 1 for end of last section', () => {
    const sections = [stub(100), stub(100)];
    expect(sectionProgressToScroll(1, 1, sections)).toBe(1);
  });

  it('is inverse of scrollToSectionProgress', () => {
    const sections = [stub(100), stub(200), stub(100)];
    const scroll = 0.6;
    const { sectionIndex, localProgress } = scrollToSectionProgress(scroll, sections);
    const roundTrip = sectionProgressToScroll(sectionIndex, localProgress, sections);
    expect(roundTrip).toBeCloseTo(scroll);
  });

  it('returns 0.5 for midpoint of equal sections', () => {
    const sections = [stub(100), stub(100)];
    // section 1, local 0 → accumulated 100/200 = 0.5
    expect(sectionProgressToScroll(1, 0, sections)).toBeCloseTo(0.5);
  });
});
