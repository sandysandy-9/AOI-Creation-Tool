// Utility functions for the application

import type { SearchResult } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const searchLocation = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AOI-Creation-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const results = await response.json();
    console.log('Search results for:', query, results);
    return results;
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const downloadJSON = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
