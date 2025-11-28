import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Feature } from '../types';

interface FeatureLayerProps {
  features: Feature[];
}

const FeatureLayer = ({ features }: FeatureLayerProps) => {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    map.addLayer(layerGroup);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [map]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    features.forEach((feature) => {
      const geoJsonLayer = L.geoJSON(feature.geometry, {
        style: () => ({
          color: feature.properties.color || '#0ea5e9',
          weight: 2,
          fillOpacity: 0.2,
        }),
        pointToLayer: (_, latlng) => {
          return L.marker(latlng);
        },
      });

      geoJsonLayer.bindPopup(`
        <div class="p-2">
          <p class="font-semibold">Feature ID: ${feature.id}</p>
          <p class="text-sm">Type: ${feature.type}</p>
          <p class="text-sm">Created: ${new Date(feature.properties.createdAt).toLocaleString()}</p>
        </div>
      `);

      layerGroup.addLayer(geoJsonLayer);
    });
  }, [features]);

  return null;
};

export default FeatureLayer;
