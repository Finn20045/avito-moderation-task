import { api } from '../../shared/api/base';
import { Ad, AdsResponse, FetchAdsParams } from './types';

export const getAds = async (params?: FetchAdsParams): Promise<AdsResponse> => {
  const { data } = await api.get<AdsResponse>('/ads', { 
    params: { 
      ...params,
      limit: params?.limit || 10, // Меняем perPage на limit согласно схеме
      page: params?.page || 1 
    } 
  });
  return data;
};

export const getAdById = async (id: string | number): Promise<Ad> => {
  const { data } = await api.get<Ad>(`/ads/${id}`);
  return data;
};

// Тип для отправки решения (Reject или Request Changes)
interface DecisionPayload {
  reason: string;
  comment?: string;
}

export const approveAd = async (id: number): Promise<void> => {
  await api.post(`/ads/${id}/approve`);
};

export const rejectAd = async (id: number, payload: DecisionPayload): Promise<void> => {
  await api.post(`/ads/${id}/reject`, payload);
};

export const requestChangesAd = async (id: number, payload: DecisionPayload): Promise<void> => {
  await api.post(`/ads/${id}/request-changes`, payload);
};