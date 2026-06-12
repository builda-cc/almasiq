import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAssets, useCategories, type AssetFilters } from '../hooks/queries';
import { AssetCard } from '../components/assets/AssetCard';

type SortValue = NonNullable<AssetFilters['sort']>;

export function AssetListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = (searchParams.get('sort') as SortValue) ?? 'newest';
  const minValue = searchParams.get('min_value');
  const maxValue = searchParams.get('max_value');

  const { data: categories } = useCategories();
  const { data, isLoading } = useAssets({
    q: q || undefined,
    category: category || undefined,
    sort,
    min_value: minValue ? Number(minValue) : undefined,
    max_value: maxValue ? Number(maxValue) : undefined,
    page_size: 24,
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const assets = data?.items ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Browse Assets</h1>
      <p className="mt-1 text-slate-500">
        {data ? `${data.total} assets available for exchange` : 'Loading…'}
      </p>

      <div className="mt-6 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            defaultValue={q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Search by title…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => update('category', e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">All categories</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest value</option>
          <option value="lowest">Lowest value</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-500">Loading assets…</div>
      ) : assets.length === 0 ? (
        <div className="py-24 text-center text-slate-500">
          No assets found. Try adjusting your filters.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
