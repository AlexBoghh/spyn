import { describe, it, expect } from 'vitest';
import { EASING_FUNCTIONS, applyEasing } from '../easing';
import type { EasingFunction } from '../../types';

const ALL_EASINGS = Object.keys(EASING_FUNCTIONS) as EasingFunction[];

describe('easing functions', () => {
  describe('boundaries', () => {
    for (const name of ALL_EASINGS) {
      it(`${name} returns 0 at t=0`, () => {
        expect(EASING_FUNCTIONS[name](0)).toBeCloseTo(0);
      });

      it(`${name} returns 1 at t=1`, () => {
        expect(EASING_FUNCTIONS[name](1)).toBeCloseTo(1);
      });
    }
  });

  describe('monotonicity (non-Back easings increase from 0 to 1)', () => {
    const monotonic: EasingFunction[] = [
      'linear',
      'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
      'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
      'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
      'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
    ];

    for (const name of monotonic) {
      it(`${name} is monotonically increasing`, () => {
        const fn = EASING_FUNCTIONS[name];
        let prev = fn(0);
        for (let i = 1; i <= 20; i++) {
          const t = i / 20;
          const val = fn(t);
          expect(val).toBeGreaterThanOrEqual(prev - 1e-10);
          prev = val;
        }
      });
    }
  });

  describe('sample values', () => {
    it('easeInQuad(0.5) === 0.25', () => {
      expect(EASING_FUNCTIONS.easeInQuad(0.5)).toBeCloseTo(0.25);
    });

    it('easeOutQuad(0.5) === 0.75', () => {
      expect(EASING_FUNCTIONS.easeOutQuad(0.5)).toBeCloseTo(0.75);
    });

    it('easeInOutQuad(0.25) === 0.125', () => {
      expect(EASING_FUNCTIONS.easeInOutQuad(0.25)).toBeCloseTo(0.125);
    });

    it('linear(0.5) === 0.5', () => {
      expect(EASING_FUNCTIONS.linear(0.5)).toBeCloseTo(0.5);
    });

    it('easeInCubic(0.5) === 0.125', () => {
      expect(EASING_FUNCTIONS.easeInCubic(0.5)).toBeCloseTo(0.125);
    });
  });

  describe('Back easings overshoot', () => {
    it('easeInBack dips below 0 near start', () => {
      const val = EASING_FUNCTIONS.easeInBack(0.1);
      expect(val).toBeLessThan(0);
    });

    it('easeOutBack overshoots above 1 near end', () => {
      const val = EASING_FUNCTIONS.easeOutBack(0.9);
      expect(val).toBeGreaterThan(1);
    });
  });
});

describe('applyEasing', () => {
  it('clamps t below 0', () => {
    expect(applyEasing(-0.5, 'linear')).toBe(0);
  });

  it('clamps t above 1', () => {
    expect(applyEasing(1.5, 'linear')).toBe(1);
  });

  it('applies the named easing', () => {
    expect(applyEasing(0.5, 'easeInQuad')).toBeCloseTo(0.25);
  });
});
