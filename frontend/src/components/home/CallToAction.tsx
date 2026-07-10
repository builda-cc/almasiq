import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export function CallToAction() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUIStore((s) => s.openAuth);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gold-600 to-gold-700 px-6 py-10 sm:px-12 sm:py-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {t('home.ctaTitle')}
            </h2>
            <p className="mt-2 text-sm text-gold-50/90">{t('home.ctaBody')}</p>
          </div>
          {isAuthenticated ? (
            <Link
              to="/assets/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 transition-all hover:bg-gold-50 active:scale-[0.98]"
            >
              {t('nav.publishAsset')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => openAuth('register')}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 transition-all hover:bg-gold-50 active:scale-[0.98]"
            >
              {t('nav.publishAsset')}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
