# Easing Functions Reference

All 16 easing functions used in Spyn keyframe interpolation.
Input: `t` in range [0, 1]. Output: eased value in [0, 1] (Back easings may overshoot).

```typescript
import type { EasingFunction } from '../types';

export const EASING_FUNCTIONS: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,

  // Quad (power of 2)
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic (power of 3)
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quart (power of 4)
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Expo (exponential)
  easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  // Back (overshoot)
  easeInBack: (t) => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack: (t) => {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
  easeInOutBack: (t) => {
    const s = 1.70158 * 1.525;
    if (t < 0.5) return (t *= 2) * t * ((s + 1) * t - s) / 2;
    return ((t = t * 2 - 2) * t * ((s + 1) * t + s) + 2) / 2;
  },
};
```

## Visual Characteristics

| Easing | Start | End | Feel |
|--------|-------|-----|------|
| linear | constant | constant | mechanical |
| easeInQuad | slow | fast | accelerating |
| easeOutQuad | fast | slow | decelerating |
| easeInOutQuad | slow | slow | smooth S-curve |
| easeInCubic | slower | faster | dramatic acceleration |
| easeOutCubic | faster | slower | dramatic deceleration |
| easeInOutCubic | slow | slow | **default** — smooth and natural |
| easeInBack | pulls back | fast | anticipation |
| easeOutBack | fast | overshoots | bouncy landing |
| easeInOutBack | both | both | dramatic with overshoot |

## Usage in Spyn

The `easeFrom` property on a Keyframe defines the easing curve used when
interpolating FROM the previous keyframe TO this one. So if keyframe B has
`easeFrom: 'easeOutCubic'`, the transition from A→B uses easeOutCubic.
