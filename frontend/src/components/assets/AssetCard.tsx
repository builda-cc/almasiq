import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import type { Asset } from '../../types';
import { formatKzt } from '../../utils/helpers';

interface AssetCardProps {
  asset: Asset;
  isFavorite?: boolean;
  onToggleFavorite?: (assetId: number) => void;
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';

export function AssetCard({ asset, isFavorite, onToggleFavorite }: AssetCardProps) {
  const { t } = useTranslation();
  const image = asset.images[0]?.url ?? PLACEHOLDER;
  const location = [asset.city, asset.region].filter(Boolean).join(', ');

  return (
    <Link
      to={`/assets/${asset.id}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={asset.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-xs font-medium text-slate-700 rounded-full">
          {asset.category.name}
        </span>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(asset.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors"
            aria-label={t('assets.toggleFavorite')}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'
              }`}
            />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-1">{asset.title}</h3>
        {location && (
          <p className="mt-1 flex items-center text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {location}
          </p>
        )}
        <p className="mt-3 text-lg font-bold text-emerald-600">
          {formatKzt(asset.estimated_value)}
        </p>
        {asset.preferences.length > 0 && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            {t('assets.wants')}{' '}
            {asset.preferences.map((p) => p.category_slug).join(', ')}
          </p>
        )}
      </div>
    </Link>
  );
}
