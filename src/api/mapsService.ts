import { apiClient } from './client';

/**
 * Place lookup used by the Discover filter's location anchor.
 *
 * Seeded landmarks come from our own collection (curated, with their own search
 * radius, and free); Google autocomplete only fills the gaps. Both are proxied
 * through the backend, which is authenticated and rate-limited — debounce input
 * rather than calling per keystroke.
 */

export interface PlacePrediction {
  description: string;
  placeId: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface Landmark {
  _id: string;
  name: string;
  shortName: string;
  type: string;
  location: { type: string; coordinates: [number, number] };
  radius: number;
  city: string;
  state: string;
}

export const mapsService = {
  async landmarks(q?: string, type?: string): Promise<Landmark[]> {
    const params = new URLSearchParams();
    if (q?.trim()) params.append('q', q.trim());
    if (type) params.append('type', type);
    try {
      const response = await apiClient.get<{ success: boolean; data: Landmark[] }>(
        `/maps/landmarks?${params.toString()}`
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async autocomplete(input: string): Promise<PlacePrediction[]> {
    if (!input || input.trim().length < 2) return [];
    try {
      const response = await apiClient.get<{ success: boolean; data: PlacePrediction[] }>(
        `/maps/autocomplete?input=${encodeURIComponent(input.trim())}`
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async geocode(address: string): Promise<GeocodeResult | null> {
    if (!address?.trim()) return null;
    try {
      const response = await apiClient.get<{ success: boolean; data: GeocodeResult }>(
        `/maps/geocode?address=${encodeURIComponent(address.trim())}`
      );
      return response.data.data || null;
    } catch {
      return null;
    }
  },
};

export default mapsService;
