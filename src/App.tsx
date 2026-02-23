import { SectionBuilder } from './components/SectionBuilder/SectionBuilder';
import { Viewport3D } from './components/Viewport3D/Viewport3D';
import { Timeline } from './components/Timeline/Timeline';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';

export default function App() {
  return (
    <div className="grid h-screen w-screen grid-cols-[280px_1fr_300px] grid-rows-[1fr_200px] overflow-hidden bg-gray-900 text-gray-100">
      {/* Left: Section Builder — spans both rows */}
      <div className="row-span-2 border-r border-gray-700 bg-gray-800">
        <SectionBuilder />
      </div>

      {/* Center: 3D Viewport */}
      <div className="border-b border-gray-700 bg-gray-800">
        <Viewport3D />
      </div>

      {/* Right: Properties Panel */}
      <div className="border-b border-l border-gray-700 bg-gray-800">
        <PropertiesPanel />
      </div>

      {/* Bottom: Timeline — spans center + right */}
      <div className="col-span-2 bg-gray-800">
        <Timeline />
      </div>
    </div>
  );
}
