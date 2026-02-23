import yaml from 'js-yaml';
import { exportToYaml } from '../yamlExporter';
import type { SpynProject } from '../../types';

function makeProject(overrides?: Partial<SpynProject>): SpynProject {
  return {
    name: 'Test Project',
    model: { file: 'model.glb', initialScale: 1, initialRotation: { x: 0, y: 0, z: 0 } },
    physics: { momentum: true, drag: 0.5, overshoot: 0.2 },
    sections: [
      {
        id: 'sec-1',
        type: 'hero-banner',
        label: 'Hero',
        height: 100,
        color: '#6366f1',
        contentBlocks: [
          { id: 'blk-1', type: 'heading', label: 'Title', position: { x: 10, y: 30, w: 45, h: 10 }, zLayer: 1 },
        ],
      },
    ],
    keyframes: [
      {
        id: 'kf-1',
        scroll: 0,
        sectionId: 'sec-1',
        description: 'Model enters from left',
        model: { position: { x: 20, y: 50, z: 0 }, rotation: { x: 0, y: 45, z: 0 }, scale: 1, opacity: 1 },
        camera: { orbit: 0, elevation: 15, distance: 5, fov: 50, lookAt: 'model', offset: { x: 0, y: 0 } },
        easeFrom: 'easeInOutCubic',
        hold: false,
      },
    ],
    ...overrides,
  };
}

describe('exportToYaml', () => {
  it('outputs valid YAML', () => {
    const output = exportToYaml(makeProject());
    expect(() => yaml.load(output)).not.toThrow();
  });

  it('has correct top-level keys', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    expect(parsed).toHaveProperty('project');
    expect(parsed).toHaveProperty('model');
    expect(parsed).toHaveProperty('physics');
    expect(parsed).toHaveProperty('sections');
    expect(parsed).toHaveProperty('keyframes');
  });

  it('maps project name to project key', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    expect(parsed.project).toBe('Test Project');
  });

  it('maps model with snake_case keys', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    const model = parsed.model as Record<string, unknown>;
    expect(model.file).toBe('model.glb');
    expect(model.initial_scale).toBe(1);
    expect(model.initial_rotation).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('maps physics correctly', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    const physics = parsed.physics as Record<string, unknown>;
    expect(physics.momentum).toBe(true);
    expect(physics.drag).toBe(0.5);
    expect(physics.overshoot).toBe(0.2);
  });

  it('maps sections with snake_case keys', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    const sections = parsed.sections as Record<string, unknown>[];
    expect(sections).toHaveLength(1);

    const section = sections[0];
    expect(section.type).toBe('hero-banner');
    expect(section.label).toBe('Hero');
    expect(section.height_vh).toBe(100);
    expect(section.content_blocks).toBeDefined();

    const blocks = section.content_blocks as Record<string, unknown>[];
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('heading');
    expect(blocks[0].z_layer).toBe(1);
    expect(blocks[0].position).toEqual({ x: 10, y: 30, w: 45, h: 10 });
  });

  it('maps keyframes with correct keys', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    const keyframes = parsed.keyframes as Record<string, unknown>[];
    expect(keyframes).toHaveLength(1);

    const kf = keyframes[0];
    expect(kf.scroll).toBe(0);
    expect(kf.section).toBe('sec-1');
    expect(kf.description).toBe('Model enters from left');
    expect(kf.easing).toBe('easeInOutCubic');
    expect(kf.hold).toBe(false);

    const model = kf.model as Record<string, unknown>;
    expect(model.position).toEqual({ x: 20, y: 50, z: 0 });
    expect(model.rotation).toEqual({ x: 0, y: 45, z: 0 });
    expect(model.scale).toBe(1);
    expect(model.opacity).toBe(1);

    const camera = kf.camera as Record<string, unknown>;
    expect(camera.orbit).toBe(0);
    expect(camera.elevation).toBe(15);
    expect(camera.distance).toBe(5);
    expect(camera.fov).toBe(50);
    expect(camera.look_at).toBe('model');
    expect(camera.offset).toEqual({ x: 0, y: 0 });
  });

  it('includes event when present', () => {
    const project = makeProject();
    project.keyframes[0].event = { type: 'split', pieces: ['lid', 'base'], spread: 2, axis: 'y' };
    const parsed = yaml.load(exportToYaml(project)) as Record<string, unknown>;
    const kf = (parsed.keyframes as Record<string, unknown>[])[0];
    expect(kf.event).toBeDefined();
    expect((kf.event as Record<string, unknown>).type).toBe('split');
  });

  it('includes responsive when present', () => {
    const project = makeProject();
    project.keyframes[0].responsive = { tablet: { scale: 0.8 }, mobile: { scale: 0.5, hidden: true } };
    const parsed = yaml.load(exportToYaml(project)) as Record<string, unknown>;
    const kf = (parsed.keyframes as Record<string, unknown>[])[0];
    expect(kf.responsive).toBeDefined();
  });

  it('omits event and responsive when absent', () => {
    const parsed = yaml.load(exportToYaml(makeProject())) as Record<string, unknown>;
    const kf = (parsed.keyframes as Record<string, unknown>[])[0];
    expect(kf).not.toHaveProperty('event');
    expect(kf).not.toHaveProperty('responsive');
  });
});
