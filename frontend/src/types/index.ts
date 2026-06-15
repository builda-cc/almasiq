// Shared domain types. These mirror the FastAPI backend response shapes
// (snake_case fields are preserved to match the API exactly).

export type CategorySlug =
  | 'real-estate'
  | 'land-agro'
  | 'livestock'
  | 'auto-equipment'
  | 'mining-metals'
  | 'business-industry';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Category {
  id: number;
  slug: CategorySlug;
  name: string;
  icon: string | null;
  image_url: string | null;
  asset_count: number;
}

export interface AssetImage {
  id: number;
  url: string;
  position: number;
}

export interface ExchangePreference {
  id: number;
  category_slug: CategorySlug;
  cash_accepted: boolean;
  notes: string | null;
}

export interface Asset {
  id: number;
  title: string;
  description: string;
  estimated_value: number;
  country: string;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  liquidity_score: number;
  status: 'active' | 'exchanged' | 'hidden';
  created_at: string;
  category: Category;
  owner: User;
  images: AssetImage[];
  preferences: ExchangePreference[];
}

export interface AssetListResponse {
  items: Asset[];
  total: number;
  page: number;
  page_size: number;
}

export interface AIMatch {
  id: number;
  match_score: number;
  value_score: number;
  preference_score: number;
  location_score: number;
  liquidity_score: number;
  value_difference: number;
  match_type: '1to1' | '1tomany' | 'manytomany';
  explanation: string | null;
  asset_a: Asset;
  asset_b: Asset;
}

export type ExchangeStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'negotiation'
  | 'completed';

export interface ExchangeRequest {
  id: number;
  message: string;
  status: ExchangeStatus;
  created_at: string;
  from_user: User;
  to_user: User;
  offered_asset: Asset;
  requested_asset: Asset;
}

export interface Favorite {
  id: number;
  asset: Asset;
}

export interface DashboardStats {
  total_assets: number;
  active_exchanges: number;
  completed_exchanges: number;
  ai_matches: number;
  total_value_listed: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
