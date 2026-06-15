import { useTranslation } from 'react-i18next';
import { useFavorites, useRemoveFavorite } from '../hooks/queries';
import { AssetCard } from '../components/assets/AssetCard';

export function Favorites() {
  const { t } = useTranslation();
  const { data: favorites, isLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  return (
    <div>
      <h1 className="text-2xl font-bold text-beige-900">{t('favorites.title')}</h1>
      <p className="mt-1 text-beige-500">{t('favorites.subtitle')}</p>

      {isLoading ? (
        <div className="py-16 text-center text-beige-500">{t('common.loading')}</div>
      ) : (favorites ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-beige-300 rounded-xl p-8 text-center text-beige-500">
          {t('favorites.noFavorites')}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(favorites ?? []).map((fav) => (
            <AssetCard
              key={fav.id}
              asset={fav.asset}
              isFavorite
              onToggleFavorite={(id) => removeFavorite.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
