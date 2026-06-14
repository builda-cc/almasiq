import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import { useMyAssets, useDeleteAsset } from '../hooks/queries';
import { formatKzt } from '../utils/helpers';

export function MyAssets() {
  const { t } = useTranslation();
  const { data: assets, isLoading } = useMyAssets();
  const deleteAsset = useDeleteAsset();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.myAssetsTitle')}</h1>
        <Link
          to="/assets/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {t('dashboard.addAsset')}
        </Link>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">{t('common.loading')}</div>
      ) : (assets ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
          {t('dashboard.noAssetsYet')}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(assets ?? []).map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4"
            >
              <img
                src={
                  asset.images[0]?.url ??
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200'
                }
                alt={asset.title}
                className="w-20 h-20 rounded-lg object-cover bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/assets/${asset.id}`}
                  className="font-semibold text-slate-900 hover:text-emerald-600 line-clamp-1"
                >
                  {asset.title}
                </Link>
                <p className="text-sm text-slate-500">{asset.category.name}</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatKzt(asset.estimated_value)}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  asset.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {asset.status}
              </span>
              <button
                onClick={() => {
                  if (confirm(t('dashboard.deleteConfirm'))) deleteAsset.mutate(asset.id);
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                aria-label={t('dashboard.deleteAsset')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
