import type { Section, SectionPresetType, ContentBlock } from '../types';

let nextId = 1;
function uid(): string {
  return `spyn-${nextId++}-${Date.now().toString(36)}`;
}

const SECTION_COLORS: Record<SectionPresetType, string> = {
  'hero-banner': '#6366f1',
  'features-grid': '#22c55e',
  'text-image': '#f59e0b',
  'our-team': '#ec4899',
  'testimonials': '#8b5cf6',
  'contact-form': '#14b8a6',
  'gallery': '#f97316',
  'pricing': '#06b6d4',
  'stats': '#84cc16',
  'cta-banner': '#ef4444',
  'blank': '#6b7280',
};

const SECTION_LABELS: Record<SectionPresetType, string> = {
  'hero-banner': 'Hero Banner',
  'features-grid': 'Features Grid',
  'text-image': 'Text + Image',
  'our-team': 'Our Team',
  'testimonials': 'Testimonials',
  'contact-form': 'Contact Form',
  'gallery': 'Gallery',
  'pricing': 'Pricing',
  'stats': 'Stats',
  'cta-banner': 'CTA Banner',
  'blank': 'Blank Section',
};

function makeBlock(
  type: ContentBlock['type'],
  label: string,
  x: number,
  y: number,
  w: number,
  h: number
): ContentBlock {
  return { id: uid(), type, label, position: { x, y, w, h }, zLayer: 0 };
}

const SECTION_BLOCKS: Record<SectionPresetType, () => ContentBlock[]> = {
  'hero-banner': () => [
    makeBlock('heading', 'Main Heading', 10, 30, 45, 10),
    makeBlock('subtitle', 'Subheading', 10, 45, 40, 6),
    makeBlock('button', 'CTA Button', 10, 58, 15, 6),
  ],
  'features-grid': () => [
    makeBlock('heading', 'Section Title', 25, 5, 50, 8),
    makeBlock('card', 'Feature 1', 5, 25, 28, 35),
    makeBlock('card', 'Feature 2', 36, 25, 28, 35),
    makeBlock('card', 'Feature 3', 67, 25, 28, 35),
  ],
  'text-image': () => [
    makeBlock('heading', 'Heading', 5, 20, 40, 8),
    makeBlock('text-block', 'Body Text', 5, 35, 40, 25),
    makeBlock('image', 'Image', 55, 15, 40, 55),
  ],
  'our-team': () => [
    makeBlock('heading', 'Our Team', 25, 5, 50, 8),
    makeBlock('card', 'Member 1', 5, 25, 20, 40),
    makeBlock('card', 'Member 2', 28, 25, 20, 40),
    makeBlock('card', 'Member 3', 52, 25, 20, 40),
    makeBlock('card', 'Member 4', 75, 25, 20, 40),
  ],
  'testimonials': () => [
    makeBlock('heading', 'Testimonials', 25, 5, 50, 8),
    makeBlock('card', 'Quote 1', 10, 25, 35, 45),
    makeBlock('card', 'Quote 2', 55, 25, 35, 45),
  ],
  'contact-form': () => [
    makeBlock('heading', 'Contact Us', 25, 5, 50, 8),
    makeBlock('form', 'Contact Form', 20, 20, 60, 60),
  ],
  'gallery': () => [
    makeBlock('heading', 'Gallery', 25, 5, 50, 8),
    makeBlock('image', 'Image 1', 5, 20, 30, 35),
    makeBlock('image', 'Image 2', 37, 20, 26, 35),
    makeBlock('image', 'Image 3', 65, 20, 30, 35),
  ],
  'pricing': () => [
    makeBlock('heading', 'Pricing', 25, 5, 50, 8),
    makeBlock('card', 'Basic Plan', 8, 22, 25, 55),
    makeBlock('card', 'Pro Plan', 37, 15, 26, 65),
    makeBlock('card', 'Enterprise', 67, 22, 25, 55),
  ],
  'stats': () => [
    makeBlock('heading', 'By the Numbers', 20, 10, 60, 8),
    makeBlock('card', 'Stat 1', 5, 35, 20, 25),
    makeBlock('card', 'Stat 2', 28, 35, 20, 25),
    makeBlock('card', 'Stat 3', 52, 35, 20, 25),
    makeBlock('card', 'Stat 4', 75, 35, 20, 25),
  ],
  'cta-banner': () => [
    makeBlock('heading', 'Ready to Start?', 20, 25, 60, 10),
    makeBlock('subtitle', 'Join thousands of users', 25, 42, 50, 6),
    makeBlock('button', 'Get Started', 37, 58, 26, 7),
  ],
  'blank': () => [],
};

export function createSection(type: SectionPresetType, height = 100): Section {
  return {
    id: uid(),
    type,
    label: SECTION_LABELS[type],
    height,
    contentBlocks: SECTION_BLOCKS[type](),
    color: SECTION_COLORS[type],
  };
}

export { SECTION_COLORS, SECTION_LABELS };
