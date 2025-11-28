import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import type { Feature, Layer } from '../types';
import DrawControls from './DrawControls.tsx';
import FeatureLayer from './FeatureLayer.tsx';
import CustomControls from './CustomControls.tsx';

interface MapComponentProps {
  layers: Layer[];
  features: Feature[];
  onFeatureAdd: (feature: Feature) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
  searchLocation?: { lat: number; lon: number; zoom: number; name?: string } | null;
}

// Fix for default marker icons
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create popup content with image for a place
const createPlacePopup = async (place: {
  display_name: string;
  extratags?: { wikipedia?: string; wikidata?: string };
}): Promise<string> => {
  const placeName = place.display_name.split(',')[0];

  // Use placeholder images from Unsplash with place-related keywords
  const keywords = placeName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const imageUrl = `https://source.unsplash.com/300x200/?${encodeURIComponent(keywords)},landmark,architecture`;

  return `
    <div style="text-align: center; min-width: 250px;">
      <img src="${imageUrl}" alt="${placeName}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
      <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">⭐ ${placeName}</h3>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">${place.display_name}</p>
    </div>
  `;
};

// Fetch city boundary and famous places
const fetchCityBoundaryAndPlaces = async (
  lat: number,
  lon: number,
  map: L.Map,
  centerMarker: L.Marker
) => {
  const layers: L.Layer[] = [centerMarker];

  try {
    // Search for the city/area boundary using reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&polygon_geojson=1`,
      { headers: { 'User-Agent': 'AOI-Creation-App' } }
    );

    if (response.ok) {
      const data = await response.json();

      // Draw city boundary if available
      if (data.geojson && data.geojson.type === 'Polygon') {
        const coords = data.geojson.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
        const polygon = L.polygon(coords, {
          color: '#3b82f6',
          weight: 3,
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
        }).addTo(map);
        polygon.bindPopup(`🏙️ ${data.display_name}`);
        layers.push(polygon);
      }
    }

    // Fetch famous places nearby
    const placesResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=tourism+attraction+near+${lat},${lon}&limit=5&addressdetails=1&extratags=1`,
      { headers: { 'User-Agent': 'AOI-Creation-App' } }
    );

    if (placesResponse.ok) {
      const places = await placesResponse.json();

      for (const place of places) {
        const placeMarker = L.circleMarker([parseFloat(place.lat), parseFloat(place.lon)], {
          radius: 8,
          fillColor: '#ef4444',
          color: '#fff',
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(map);

        // Create popup with image (fetch from Wikipedia if available)
        const popupContent = await createPlacePopup(place);
        placeMarker.bindPopup(popupContent, { maxWidth: 300 });
        layers.push(placeMarker);
      }
    }
  } catch (error) {
    console.error('Error fetching city data:', error);
  }

  // Remove all layers after 15 seconds
  setTimeout(() => {
    layers.forEach((layer) => map.removeLayer(layer));
  }, 15000);
};

const MapComponent = ({
  layers,
  features,
  onFeatureAdd,
  onMapMove,
  searchLocation,
}: MapComponentProps) => {
  // Default center over North Rhine-Westphalia, Germany (WMS layer region)
  const [center] = useState<[number, number]>([51.4332, 7.6616]);
  const [zoom] = useState(10);

  const visibleWMSLayers = layers.filter((l) => l.visible && l.type === 'wms');
  const visibleTileLayers = layers.filter((l) => l.visible && l.type === 'tile');

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visibleTileLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.url || ''}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          maxZoom={19}
        />
      ))}

      {visibleWMSLayers.map((layer) => (
        <WMSTileLayer
          key={layer.id}
          url={layer.url || ''}
          layers="nw_dop_rgb"
          format="image/png"
          transparent={true}
          version="1.3.0"
          crs={L.CRS.EPSG4326}
          attribution='&copy; <a href="https://www.wms.nrw.de/geobasis/wms_nw_dop">Geobasis NRW</a>'
        />
      ))}

      <FeatureLayer features={features} />
      <DrawControls onFeatureAdd={onFeatureAdd} />
      <CustomControls />
      <MapEventHandler onMapMove={onMapMove} />
      {searchLocation && <SearchController searchLocation={searchLocation} />}
    </MapContainer>
  );
};

// Component to handle search location changes
const SearchController = ({
  searchLocation,
}: {
  searchLocation: { lat: number; lon: number; zoom: number; name?: string };
}) => {
  const map = useMap();

  useEffect(() => {
    if (searchLocation) {
      map.setView([searchLocation.lat, searchLocation.lon], searchLocation.zoom);

      // Add a marker at the searched location
      const popupContent = searchLocation.name || '📍 Search Result';
      const marker = L.marker([searchLocation.lat, searchLocation.lon])
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();

      // Fetch city boundary and famous places
      fetchCityBoundaryAndPlaces(searchLocation.lat, searchLocation.lon, map, marker);
    }
  }, [searchLocation, map]);

  return null;
};

// Component to handle map events
const MapEventHandler = ({
  onMapMove,
}: {
  onMapMove?: (center: [number, number], zoom: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapMove) return;

    const handleMove = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapMove([center.lat, center.lng], zoom);
    };

    map.on('moveend', handleMove);
    map.on('zoomend', handleMove);

    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleMove);
    };
  }, [map, onMapMove]);

  return null;
};

export default MapComponent;
