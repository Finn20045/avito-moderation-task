export type AdStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface Seller {
  id: number;
  name: string;
  rating: number;
  totalAds: number;
  registeredAt: string;
}

export interface ModerationHistoryItem {
  id: number;
  moderatorId: number;
  moderatorName: string;
  action: 'approved' | 'rejected' | 'requestChanges';
  reason?: string;
  comment?: string;
  timestamp: string;
}

export interface Ad {
  id: number;
  title: string;
  price: number;
  description: string;
  // 2. Галерея (массив строк)
  images: string[]; 
  category: string;
  categoryId: number;
  status: AdStatus;
  priority: 'normal' | 'urgent';
  createdAt: string;
  // 3. Добавляем объект продавца и характеристики
  seller: Seller; 
  characteristics: Record<string, string>; // Объект "Ключ": "Значение"
  moderationHistory: ModerationHistoryItem[];
}


export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Ответ от сервера содержит и объявления, и пагинацию
export interface AdsResponse {
  ads: Ad[];
  pagination: Pagination;
}

export interface FetchAdsParams {
  page?: number;
  limit?: number;
  status?: string | string[]; 
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'priority';
  sortOrder?: 'asc' | 'desc';
}