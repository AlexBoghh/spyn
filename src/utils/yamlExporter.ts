import yaml from 'js-yaml';
import type { SpynProject } from '../types';

export function exportToYaml(project: SpynProject): string {
  const spec = {
    project: project.name,
    model: {
      file: project.model.file,
      initial_scale: project.model.initialScale,
      initial_rotation: project.model.initialRotation,
    },
    physics: {
      momentum: project.physics.momentum,
      drag: project.physics.drag,
      overshoot: project.physics.overshoot,
    },
    sections: project.sections.map((s) => ({
      id: s.id,
      type: s.type,
      label: s.label,
      height_vh: s.height,
      content_blocks: s.contentBlocks.map((b) => ({
        id: b.id,
        type: b.type,
        label: b.label,
        position: b.position,
        z_layer: b.zLayer,
      })),
    })),
    keyframes: project.keyframes.map((k) => ({
      scroll: k.scroll,
      section: k.sectionId,
      description: k.description,
      model: {
        position: k.model.position,
        rotation: k.model.rotation,
        scale: k.model.scale,
        opacity: k.model.opacity,
      },
      camera: {
        orbit: k.camera.orbit,
        elevation: k.camera.elevation,
        distance: k.camera.distance,
        fov: k.camera.fov,
        look_at: k.camera.lookAt,
        offset: k.camera.offset,
      },
      easing: k.easeFrom,
      hold: k.hold,
      ...(k.event && { event: k.event }),
      ...(k.responsive && { responsive: k.responsive }),
    })),
  };

  return yaml.dump(spec, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
}
