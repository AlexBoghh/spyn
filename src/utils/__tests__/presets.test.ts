import { createSection, SECTION_COLORS, SECTION_LABELS } from '../presets';
import type { SectionPresetType } from '../../types';

const ALL_TYPES: SectionPresetType[] = [
  'hero-banner', 'features-grid', 'text-image', 'our-team', 'testimonials',
  'contact-form', 'gallery', 'pricing', 'stats', 'cta-banner', 'blank',
];

describe('SECTION_COLORS', () => {
  it('has an entry for all 11 preset types', () => {
    for (const type of ALL_TYPES) {
      expect(SECTION_COLORS[type]).toBeDefined();
    }
  });

  it('values are valid hex color strings', () => {
    for (const type of ALL_TYPES) {
      expect(SECTION_COLORS[type]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('SECTION_LABELS', () => {
  it('has an entry for all 11 preset types', () => {
    for (const type of ALL_TYPES) {
      expect(SECTION_LABELS[type]).toBeDefined();
    }
  });

  it('values are non-empty strings', () => {
    for (const type of ALL_TYPES) {
      expect(SECTION_LABELS[type].length).toBeGreaterThan(0);
    }
  });
});

describe('createSection', () => {
  it('returns correct type and label for each preset', () => {
    for (const type of ALL_TYPES) {
      const section = createSection(type);
      expect(section.type).toBe(type);
      expect(section.label).toBe(SECTION_LABELS[type]);
      expect(section.color).toBe(SECTION_COLORS[type]);
    }
  });

  it('uses default height of 100', () => {
    const section = createSection('blank');
    expect(section.height).toBe(100);
  });

  it('accepts custom height', () => {
    const section = createSection('blank', 200);
    expect(section.height).toBe(200);
  });

  it('generates unique IDs across calls', () => {
    const a = createSection('blank');
    const b = createSection('blank');
    expect(a.id).not.toBe(b.id);
  });

  it('hero-banner has 3 content blocks', () => {
    const section = createSection('hero-banner');
    expect(section.contentBlocks).toHaveLength(3);
    expect(section.contentBlocks[0].type).toBe('heading');
    expect(section.contentBlocks[1].type).toBe('subtitle');
    expect(section.contentBlocks[2].type).toBe('button');
  });

  it('blank has 0 content blocks', () => {
    const section = createSection('blank');
    expect(section.contentBlocks).toHaveLength(0);
  });

  it('features-grid has 4 content blocks', () => {
    const section = createSection('features-grid');
    expect(section.contentBlocks).toHaveLength(4);
  });

  it('content blocks have valid structure', () => {
    const section = createSection('text-image');
    for (const block of section.contentBlocks) {
      expect(block.id).toBeTruthy();
      expect(block.type).toBeTruthy();
      expect(block.label).toBeTruthy();
      expect(block.position).toEqual(
        expect.objectContaining({ x: expect.any(Number), y: expect.any(Number), w: expect.any(Number), h: expect.any(Number) })
      );
      expect(block.zLayer).toBe(0);
    }
  });

  it('content block IDs are unique within a section', () => {
    const section = createSection('our-team'); // 5 blocks
    const ids = section.contentBlocks.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
