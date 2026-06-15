import i18n from 'i18next';
import type { CategorySlug, ExchangeStatus } from '../types';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  kk: 'kk-KZ',
  ru: 'ru-RU',
  zh: 'zh-CN',
};

function currentLocale(): string {
  return LOCALE_MAP[i18n.language] ?? 'en-US';
}

export function formatKzt(value: number): string {
  return new Intl.NumberFormat(currentLocale(), {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(currentLocale(), {
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

  if (diffMins < 1) return i18n.t('common.justNow');
  if (diffMins < 60) return i18n.t('common.minutesAgo', { count: diffMins });
  if (diffHours < 24) return i18n.t('common.hoursAgo', { count: diffHours });
  if (diffDays < 7) return i18n.t('common.daysAgo', { count: diffDays });
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
      return 'bg-gold-100 text-gold-700';
    case 'completed':
      return 'bg-gold-100 text-gold-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-beige-100 text-beige-700';
  }
}

export function getMatchScoreColor(score: number): string {
  if (score >= 85) return 'bg-gold-100 text-gold-700';
  if (score >= 70) return 'bg-lime-100 text-lime-700';
  if (score >= 55) return 'bg-amber-100 text-amber-700';
  return 'bg-beige-100 text-beige-700';
}

export const CATEGORY_SLUGS: CategorySlug[] = [
  'real-estate',
  'land-agro',
  'livestock',
  'auto-equipment',
  'mining-metals',
  'business-industry',
];
