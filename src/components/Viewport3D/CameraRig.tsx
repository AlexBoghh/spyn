import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { degToRad } from '../../utils/scrollmath';
import { DEFAULT_CAMERA_CONFIG } from '../../constants';
import type { CameraConfig } from '../../types';

interface CameraRigProps {
  config?: CameraConfig;
  modelPosition?: THREE.Vector3;
}

function configToPosition(c: CameraConfig): [number, number, number] {
  const orbitRad = degToRad(c.orbit);
  const elevRad = degToRad(c.elevation);

  const x = c.distance * Math.cos(elevRad) * Math.sin(orbitRad);
  const y = c.distance * Math.sin(elevRad);
  const z = c.distance * Math.cos(elevRad) * Math.cos(orbitRad);

  return [x + c.offset.x, y + c.offset.y, z];
}

const _target = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

export function CameraRig({
  config = DEFAULT_CAMERA_CONFIG,
  modelPosition,
}: CameraRigProps) {
  const { camera } = useThree();
  const initialized = useRef(false);

  useFrame(() => {
    const [tx, ty, tz] = configToPosition(config);
    _target.set(tx, ty, tz);

    const cam = camera as THREE.PerspectiveCamera;

    if (!initialized.current) {
      cam.position.copy(_target);
      cam.fov = config.fov;
      cam.updateProjectionMatrix();
      initialized.current = true;
    } else {
      cam.position.lerp(_target, 0.08);
      if (Math.abs(cam.fov - config.fov) > 0.01) {
        cam.fov += (config.fov - cam.fov) * 0.08;
        cam.updateProjectionMatrix();
      }
    }

    if (config.lookAt === 'model') {
      _lookAt.copy(modelPosition ?? _lookAt.set(0, 0, 0));
    } else {
      _lookAt.set(config.lookAt.x, config.lookAt.y, config.lookAt.z);
    }
    cam.lookAt(_lookAt);
  });

  return null;
}
