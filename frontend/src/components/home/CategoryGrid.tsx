import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Building2,
  Wheat,
  Beef,
  Truck,
  Pickaxe,
  Factory,
  type LucideIcon,
} from 'lucide-react';
import { useCategories } from '../../hooks/queries';
import { categoryName, CATEGORY_SLUGS } from '../../utils/helpers';
import type { CategorySlug } from '../../types';

const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  'real-estate': Building2,
  'land-agro': Wheat,
  livestock: Beef,
  'auto-equipment': Truck,
  'mining-metals': Pickaxe,
  'business-industry': Factory,
};

export function CategoryGrid() {
  const { t } = useTranslation();
  const { data: categories } = useCategories();

  // Prefer live categories from the API, but fall back to the known slugs so the
  // section always renders even before the request resolves.
  const slugs: CategorySlug[] =
    categories && categories.length > 0
      ? categories.map((c) => c.slug)
      : CATEGORY_SLUGS;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-beige-900">
            {t('home.browseByCategory')}
          </h2>
          <p className="mt-1 text-sm text-beige-500">
            {t('home.categorySubtitle')}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {slugs.map((slug) => {
            const Icon = CATEGORY_ICONS[slug] ?? Building2;
            return (
              <Link
                key={slug}
                to={`/assets?category=${slug}`}
                className="group flex flex-col items-center gap-4 rounded-xl border border-beige-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-8 w-8 text-white" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-beige-900 group-hover:text-gold-700 transition-colors">
                  {categoryName(slug)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
