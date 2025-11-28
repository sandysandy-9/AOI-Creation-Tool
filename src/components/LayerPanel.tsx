import { useState } from 'react';
import type { Layer } from '../types';

interface LayerPanelProps {
  layers: Layer[];
  onLayerToggle: (id: string) => void;
}

const LayerPanel = ({ layers, onLayerToggle }: LayerPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between cursor-pointer mb-0.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-[10px] font-semibold text-gray-700">Layers {isOpen ? '▼' : '▶'}</h3>
      </div>

      {isOpen && (
        <div className="space-y-1">
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center space-x-1.5">
              <input
                type="checkbox"
                id={layer.id}
                checked={layer.visible}
                onChange={() => onLayerToggle(layer.id)}
                className="w-3 h-3 text-blue-600 rounded focus:ring-1 focus:ring-blue-500"
              />
              <label htmlFor={layer.id} className="text-[10px] text-gray-700 cursor-pointer flex-1">
                {layer.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerPanel;
