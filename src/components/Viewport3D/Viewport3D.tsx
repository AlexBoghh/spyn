import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';

export function Viewport3D() {
  return (
    <div className="h-full w-full relative">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
