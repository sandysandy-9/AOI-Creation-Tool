import { useState, useRef, useEffect } from 'react';
import MapComponent from './components/MapComponent.tsx';
import LayerPanel from './components/LayerPanel.tsx';
import SearchBar from './components/SearchBar.tsx';
import FeatureList from './components/FeatureList.tsx';
import { useFeatures } from './hooks/useMapHooks';
import type { Layer } from './types';

function App() {
  const { features, addFeature, removeFeature, clearFeatures } = useFeatures();
  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lon: number;
    zoom: number;
    name?: string;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsSidebarOpen(false);
    }, 500);
  };

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'esri-satellite',
      name: 'Satellite Imagery (Esri)',
      visible: true,
      type: 'tile',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    },
    {
      id: 'wms-satellite',
      name: 'Satellite Imagery (NRW)',
      visible: false,
      type: 'wms',
      url: 'https://www.wms.nrw.de/geobasis/wms_nw_dop',
    },
  ]);

  const handleLayerToggle = (id: string) => {
    setLayers(
      layers.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer))
    );
  };

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    setSearchLocation({ lat, lon, zoom: 13, name });
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-cyan-300 via-purple-300 to-pink-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-700 to-purple-700 shadow-2xl z-[999] animate-gradient">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-2xl animate-fade-in">
            🗺️ AOI Creation Tool
          </h1>
          <p className="text-sm text-cyan-100 font-medium animate-slide-up">
            Draw and manage Areas of Interest on satellite imagery
          </p>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar */}
        <div
          className="bg-gradient-to-b from-cyan-200 via-blue-300 to-purple-300 backdrop-blur-md border-r-4 border-purple-600 flex flex-col z-[1000] overflow-y-auto transition-all duration-500 ease-in-out shadow-2xl"
          style={{ width: isSidebarOpen ? '150px' : '0px' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isSidebarOpen && (
            <>
              {/* Search Section */}
              <div className="px-1 py-1.5 bg-transparent border-b border-gray-200">
                <h3 className="text-[10px] font-semibold text-gray-700 mb-1.5">Search</h3>
                <SearchBar onLocationSelect={handleLocationSelect} />
              </div>

              {/* Layer Panel Section */}
              <div className="px-1 py-1.5 bg-transparent border-b border-gray-200">
                <LayerPanel layers={layers} onLayerToggle={handleLayerToggle} />
              </div>

              {/* Features Section */}
              <div className="flex-1 px-1 py-1.5 bg-transparent">
                <FeatureList
                  features={features}
                  onFeatureRemove={removeFeature}
                  onClearAll={clearFeatures}
                />
              </div>
            </>
          )}
        </div>
        {/* Sidebar Toggle Tab */}
        {!isSidebarOpen && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border border-l-0 rounded-r px-1 py-3 cursor-pointer z-[1000] hover:bg-white/90 transition-colors"
            onMouseEnter={handleMouseEnter}
          >
            <span className="text-[10px] text-gray-600">▶</span>
          </div>
        )}{' '}
        {/* Map Container */}
        <div id="map-container" className="flex-1 relative">
          <MapComponent
            layers={layers}
            features={features}
            onFeatureAdd={addFeature}
            searchLocation={searchLocation}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
