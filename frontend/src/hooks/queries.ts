import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import type {
  AdminAction,
  AdminExchangeDetail,
  AdminExchangeRow,
  AdminKpis,
  AdminUserSummary,
  AIMatch,
  AppNotification,
  Asset,
  AssetListResponse,
  AuthTokens,
  Category,
  DashboardStats,
  ExchangeMessage,
  ExchangeRequest,
  Favorite,
  User,
} from '../types';

// ----- Auth -----

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: {
      full_name: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      const { data } = await api.post<AuthTokens>('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => login(data.access_token),
  });
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post<AuthTokens>('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => login(data.access_token),
  });
}

export interface ProfileUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  address?: string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const { data } = await api.patch<User>('/auth/me', payload);
      return data;
    },
    onSuccess: (data) => setUser(data),
  });
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: PasswordChangePayload) => {
      await api.post('/auth/me/password', payload);
    },
  });
}

// ----- Categories -----

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
  });
}

// ----- Assets -----

export interface AssetFilters {
  q?: string;
  category?: string;
  region?: string;
  city?: string;
  min_value?: number;
  max_value?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  page_size?: number;
}

export function useAssets(filters: AssetFilters = {}) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      const { data } = await api.get<AssetListResponse>('/assets', {
        params: filters,
      });
      return data;
    },
  });
}

export function useAsset(assetId: number | null) {
  return useQuery({
    queryKey: ['asset', assetId],
    enabled: assetId != null,
    queryFn: async () => {
      const { data } = await api.get<Asset>(`/assets/${assetId}`);
      return data;
    },
  });
}

export function useMyAssets() {
  return useQuery({
    queryKey: ['my-assets'],
    queryFn: async () => {
      const { data } = await api.get<Asset[]>('/assets/mine');
      return data;
    },
  });
}

export interface AssetCreatePayload {
  title: string;
  category_slug: string;
  description: string;
  estimated_value: number;
  country: string;
  region?: string | null;
  city?: string | null;
  liquidity_score: number;
  images: { url: string; position: number }[];
  preferences: { category_slug: string; cash_accepted: boolean; notes?: string | null }[];
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssetCreatePayload) => {
      const { data } = await api.post<Asset>('/assets', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      qc.invalidateQueries({ queryKey: ['my-assets'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: number) => {
      await api.delete(`/assets/${assetId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      qc.invalidateQueries({ queryKey: ['my-assets'] });
    },
  });
}

// ----- Matches -----

export function useMatches(minScore = 0) {
  return useQuery({
    queryKey: ['matches', minScore],
    queryFn: async () => {
      const { data } = await api.get<AIMatch[]>('/matches', {
        params: { min_score: minScore },
      });
      return data;
    },
  });
}

export function useMyMatches() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['my-matches'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<AIMatch[]>('/matches/mine');
      return data;
    },
  });
}

export function useRecomputeMatches() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ matches: number }>('/matches/recompute');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] });
      qc.invalidateQueries({ queryKey: ['my-matches'] });
    },
  });
}

// ----- Exchanges -----

export function useExchanges(direction: 'incoming' | 'outgoing') {
  return useQuery({
    queryKey: ['exchanges', direction],
    queryFn: async () => {
      const { data } = await api.get<ExchangeRequest[]>('/exchanges', {
        params: { direction },
      });
      return data;
    },
  });
}

export function useCreateExchange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      offered_asset_id: number;
      requested_asset_id: number;
      message: string;
    }) => {
      const { data } = await api.post<ExchangeRequest>('/exchanges', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchanges'] });
    },
  });
}

export function useExchange(id: number | null) {
  return useQuery({
    queryKey: ['exchange', id],
    enabled: id != null,
    queryFn: async () => {
      const { data } = await api.get<ExchangeRequest>(`/exchanges/${id}`);
      return data;
    },
  });
}

export function useUpdateExchangeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: 'accepted' | 'rejected' | 'cancelled' | 'completed';
    }) => {
      const { data } = await api.patch<ExchangeRequest>(`/exchanges/${id}`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchanges'] });
      qc.invalidateQueries({ queryKey: ['exchange'] });
      qc.invalidateQueries({ queryKey: ['my-assets'] });
    },
  });
}

// ----- Exchange messaging -----

export function useExchangeMessages(exchangeId: number | null) {
  return useQuery({
    queryKey: ['exchange-messages', exchangeId],
    enabled: exchangeId != null,
    queryFn: async () => {
      const { data } = await api.get<ExchangeMessage[]>(
        `/exchanges/${exchangeId}/messages`,
      );
      return data;
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: string }) => {
      const { data } = await api.post<ExchangeMessage>(
        `/exchanges/${id}/messages`,
        { body },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['exchange-messages', variables.id] });
    },
  });
}

// ----- Notifications -----

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['notifications'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<AppNotification[]>('/notifications');
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ----- Admin: Exchange Approval Center -----

export function useAdminKpis() {
  return useQuery({
    queryKey: ['admin-kpis'],
    queryFn: async () => {
      const { data } = await api.get<AdminKpis>('/admin/kpis');
      return data;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get<AdminUserSummary[]>('/admin/users');
      return data;
    },
  });
}

export function useAdminExchanges(statusFilter?: string) {
  return useQuery({
    queryKey: ['admin-exchanges', statusFilter ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<AdminExchangeRow[]>('/admin/exchanges', {
        params: statusFilter ? { status: statusFilter } : undefined,
      });
      return data;
    },
  });
}

export function useAdminExchange(id: number | null) {
  return useQuery({
    queryKey: ['admin-exchange', id],
    enabled: id != null,
    queryFn: async () => {
      const { data } = await api.get<AdminExchangeDetail>(
        `/admin/exchanges/${id}`,
      );
      return data;
    },
  });
}

export function useAdminDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      note,
    }: {
      id: number;
      action: AdminAction;
      note?: string;
    }) => {
      const { data } = await api.post<AdminExchangeDetail>(
        `/admin/exchanges/${id}/decision`,
        { action, note },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-exchanges'] });
      qc.invalidateQueries({ queryKey: ['admin-exchange', variables.id] });
      qc.invalidateQueries({ queryKey: ['admin-kpis'] });
      qc.invalidateQueries({ queryKey: ['exchanges'] });
    },
  });
}

// ----- Favorites -----

export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['favorites'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<Favorite[]>('/favorites');
      return data;
    },
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: number) => {
      const { data } = await api.post<Favorite>(`/favorites/${assetId}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: number) => {
      await api.delete(`/favorites/${assetId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

// ----- Dashboard -----

export function useDashboardStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['dashboard-stats'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/dashboard/stats');
      return data;
    },
  });
}
