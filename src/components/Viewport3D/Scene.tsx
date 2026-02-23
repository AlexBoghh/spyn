import { Suspense } from 'react';
import { useStore } from '../../store';
import { interpolateAtScroll } from '../../utils/interpolation';
import { ModelRenderer } from './ModelRenderer';
import { CameraRig } from './CameraRig';

export function Scene() {
  const keyframes = useStore((s) => s.keyframes);
  const scrollProgress = useStore((s) => s.scrollProgress);
  const interpolated = interpolateAtScroll(keyframes, scrollProgress);

  return (
    <>
      <color attach="background" args={['#1f2937']} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />

      <CameraRig config={interpolated?.camera} />

      <Suspense fallback={null}>
        <ModelRenderer transform={interpolated?.model} />
      </Suspense>
    </>
  );
}
