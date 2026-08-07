import api from './client';
export interface Ad {
  _id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  isActive: boolean;
  order: number;
}


export const adService = {
  getActiveAds: async (): Promise<{ success: boolean; data: Ad[] }> => {
    try {
      const response = await api.get<{ success: boolean; data: Ad[] }>('/ads');
      return response.data;
    } catch (error) {
      console.error('Error fetching active ads:', error);
      throw error;
    }
  },
};

export default adService;
