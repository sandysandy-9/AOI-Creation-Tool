import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import type { Feature } from '../types';
import { generateId } from '../utils/helpers';

interface DrawControlsProps {
  onFeatureAdd: (feature: Feature) => void;
}

const DrawControls = ({ onFeatureAdd }: DrawControlsProps) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#0ea5e9',
            weight: 2,
          },
        },
        polyline: {
          shapeOptions: {
            color: '#0ea5e9',
            weight: 3,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#0ea5e9',
            weight: 2,
          },
        },
        circle: {
          shapeOptions: {
            color: '#0ea5e9',
            weight: 2,
          },
        },
        marker: {},
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    const handleDrawCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;
      drawnItems.addLayer(layer);

      const feature: Feature = {
        id: generateId(),
        type:
          event.layerType === 'marker'
            ? 'marker'
            : event.layerType === 'polyline'
              ? 'polyline'
              : 'polygon',
        geometry: layer.toGeoJSON().geometry,
        properties: {
          color: '#0ea5e9',
          createdAt: new Date().toISOString(),
        },
      };

      onFeatureAdd(feature);
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
    };
  }, [map, onFeatureAdd]);

  return null;
};

export default DrawControls;
