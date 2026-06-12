import { useFavorites, useRemoveFavorite } from '../hooks/queries';
import { AssetCard } from '../components/assets/AssetCard';

export function Favorites() {
  const { data: favorites, isLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Favorites</h1>
      <p className="mt-1 text-slate-500">Assets you've saved for later.</p>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">Loading…</div>
      ) : (favorites ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
          No favorites yet. Browse assets and tap the heart to save them.
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
