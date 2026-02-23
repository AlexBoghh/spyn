import { Suspense } from 'react';
import { ModelRenderer } from './ModelRenderer';
import { CameraRig } from './CameraRig';

export function Scene() {
  return (
    <>
      <color attach="background" args={['#1f2937']} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />

      <CameraRig />

      <Suspense fallback={null}>
        <ModelRenderer />
      </Suspense>
    </>
  );
}
