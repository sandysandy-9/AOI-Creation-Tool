// Types for the application

export interface Feature {
  id: string;
  type: 'polygon' | 'marker' | 'polyline';
  geometry: GeoJSON.Geometry;
  properties: {
    name?: string;
    description?: string;
    color?: string;
    createdAt: string;
  };
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'wms' | 'tile' | 'feature';
  url?: string;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: string[];
}

export interface MapState {
  center: [number, number];
  zoom: number;
}
