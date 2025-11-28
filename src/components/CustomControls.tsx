import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

const CustomControls = () => {
  const map = useMap();

  useEffect(() => {
    const onLocationFound = (e: L.LocationEvent) => {
      const radius = e.accuracy / 2;

      L.marker(e.latlng)
        .addTo(map)
        .bindPopup(`You are within ${radius.toFixed(0)} meters from this point`)
        .openPopup();

      L.circle(e.latlng, radius).addTo(map);
    };

    const onLocationError = (e: L.ErrorEvent) => {
      alert('Location access denied or unavailable: ' + e.message);
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
    };
  }, [map]);

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleFullscreen = () => {
    const element = document.getElementById('map-container');
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="absolute bottom-8 right-4 z-1000 flex flex-col space-y-2">
      <button
        onClick={handleZoomIn}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Zoom in"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <button
        onClick={handleZoomOut}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Zoom out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <button
        onClick={handleLocate}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="My location"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <button
        onClick={handleFullscreen}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Fullscreen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  );
};

export default CustomControls;
