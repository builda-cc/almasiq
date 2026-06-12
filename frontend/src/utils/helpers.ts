import type { CategorySlug, ExchangeStatus } from '../types';

export function formatKzt(value: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getStatusColor(status: ExchangeStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'negotiation':
      return 'bg-blue-100 text-blue-700';
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

// Tailwind color for a 0-100 match score badge.
export function getMatchScoreColor(score: number): string {
  if (score >= 85) return 'bg-emerald-100 text-emerald-700';
  if (score >= 70) return 'bg-lime-100 text-lime-700';
  if (score >= 55) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  apartments: 'Apartments',
  houses: 'Houses',
  land: 'Land Plots',
  vehicles: 'Vehicles',
  commercial: 'Commercial Properties',
};

export const CATEGORY_SLUGS: CategorySlug[] = [
  'apartments',
  'houses',
  'land',
  'vehicles',
  'commercial',
];
