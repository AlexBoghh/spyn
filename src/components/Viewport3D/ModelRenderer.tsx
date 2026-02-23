import { useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { degToRad } from '../../utils/scrollmath';
import { DEFAULT_MODEL_TRANSFORM } from '../../constants';
import type { ModelTransform } from '../../types';

function vwToWorld(vw: number): number {
  return (vw - 50) * 0.1;
}

function vhToWorld(vh: number): number {
  return -(vh - 50) * 0.1;
}

interface ModelRendererProps {
  transform?: ModelTransform;
}

export function ModelRenderer({ transform = DEFAULT_MODEL_TRANSFORM }: ModelRendererProps) {
  const model = useStore((s) => s.model);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[
        vwToWorld(transform.position.x),
        vhToWorld(transform.position.y),
        transform.position.z * 0.1,
      ]}
      rotation={[
        degToRad(transform.rotation.x + model.initialRotation.x),
        degToRad(transform.rotation.y + model.initialRotation.y),
        degToRad(transform.rotation.z + model.initialRotation.z),
      ]}
      scale={transform.scale * model.initialScale}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        transparent={transform.opacity < 1}
        opacity={transform.opacity}
      />
    </mesh>
  );
}
