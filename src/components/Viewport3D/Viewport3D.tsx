export function Viewport3D() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-gray-700 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          3D Viewport
        </h2>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Three.js scene goes here</p>
      </div>
    </div>
  );
}
