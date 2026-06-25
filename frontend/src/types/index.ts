// Shared domain types. These mirror the FastAPI backend response shapes
// (snake_case fields are preserved to match the API exactly).

export type CategorySlug =
  | 'real-estate'
  | 'land-agro'
  | 'livestock'
  | 'auto-equipment'
  | 'mining-metals'
  | 'business-industry';

export type VerificationStatus = 'unverified' | 'verified' | 'premium';

export interface User {
  id: number;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  verification_status: VerificationStatus;
  created_at: string;
  // Private contact channels — only present (non-null) when the viewer is the
  // user themselves or the counterparty of an admin-approved exchange.
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  address: string | null;
  contact_unlocked: boolean;
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
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface ExchangeRequest {
  id: number;
  message: string;
  status: ExchangeStatus;
  recipient_accepted: boolean;
  contact_unlocked: boolean;
  created_at: string;
  from_user: User;
  to_user: User;
  offered_asset: Asset;
  requested_asset: Asset;
}

export interface ExchangeMessage {
  id: number;
  sender_id: number;
  body: string;
  flagged: boolean;
  created_at: string;
}

export interface AppNotification {
  id: number;
  type: 'match' | 'exchange' | 'system';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// ----- Admin: Exchange Approval Center -----

export interface AdminUserDetail {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface AdminUserSummary extends AdminUserDetail {
  role: string;
  is_active: boolean;
  asset_count: number;
  exchange_request_count: number;
}

export interface MatchAnalysis {
  value_score: number;
  preference_score: number;
  location_score: number;
  liquidity_score: number;
  match_score: number;
  value_difference: number;
}

export interface AdminExchangeRow {
  id: number;
  status: ExchangeStatus;
  created_at: string;
  from_user_name: string;
  to_user_name: string;
  offered_asset_title: string;
  requested_asset_title: string;
  offered_value: number;
  requested_value: number;
  match_score: number | null;
}

export interface AdminExchangeDetail {
  id: number;
  status: ExchangeStatus;
  recipient_accepted: boolean;
  message: string;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  from_user: AdminUserDetail;
  to_user: AdminUserDetail;
  offered_asset: Asset;
  requested_asset: Asset;
  messages: ExchangeMessage[];
  match_analysis: MatchAnalysis | null;
}

export type AdminAction = 'approve' | 'reject' | 'request_info' | 'under_review';

export interface AdminKpis {
  total_requests: number;
  pending_approvals: number;
  under_review: number;
  approved: number;
  completed: number;
  rejected: number;
  total_value_exchanged: number;
  average_approval_hours: number | null;
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
