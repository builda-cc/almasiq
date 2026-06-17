import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { useCategories, useCreateAsset } from '../hooks/queries';
import { CATEGORY_SLUGS } from '../utils/helpers';
import type { CategorySlug } from '../types';

interface FormValues {
  title: string;
  category_slug: CategorySlug;
  description: string;
  estimated_value: number;
  region: string;
  city: string;
  liquidity_score: number;
}

const inputClass =
  'w-full px-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none';

export function AddAsset() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createAsset = useCreateAsset();

  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [preferences, setPreferences] = useState<
    { category_slug: CategorySlug; cash_accepted: boolean }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category_slug: 'real-estate',
      liquidity_score: 60,
    },
  });

  const addImageField = () => setImageUrls((u) => [...u, '']);
  const updateImage = (idx: number, value: string) =>
    setImageUrls((u) => u.map((v, i) => (i === idx ? value : v)));
  const removeImage = (idx: number) =>
    setImageUrls((u) => u.filter((_, i) => i !== idx));

  const togglePreference = (slug: CategorySlug) => {
    setPreferences((prefs) =>
      prefs.some((p) => p.category_slug === slug)
        ? prefs.filter((p) => p.category_slug !== slug)
        : [...prefs, { category_slug: slug, cash_accepted: false }],
    );
  };

  const toggleCash = (slug: CategorySlug) => {
    setPreferences((prefs) =>
      prefs.map((p) =>
        p.category_slug === slug ? { ...p, cash_accepted: !p.cash_accepted } : p,
      ),
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    const images = imageUrls
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, position) => ({ url, position }));

    const asset = await createAsset.mutateAsync({
      title: values.title,
      category_slug: values.category_slug,
      description: values.description,
      estimated_value: Number(values.estimated_value),
      country: 'Kazakhstan',
      region: values.region || null,
      city: values.city || null,
      liquidity_score: Number(values.liquidity_score),
      images,
      preferences: preferences.map((p) => ({
        category_slug: p.category_slug,
        cash_accepted: p.cash_accepted,
      })),
    });
    navigate(`/assets/${asset.id}`);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-beige-900">{t('addAsset.title')}</h1>
      <p className="mt-1 text-beige-500">
        {t('addAsset.subtitle')}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {/* Basic info */}
        <section className="bg-white border border-beige-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-beige-900">{t('addAsset.basicInfo')}</h2>
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-1">{t('addAsset.assetTitle')}</label>
            <input
              className={inputClass}
              placeholder={t('addAsset.assetTitlePlaceholder')}
              {...register('title', { required: true })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{t('addAsset.titleRequired')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-1">{t('addAsset.category')}</label>
            <select className={inputClass} {...register('category_slug', { required: true })}>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {t(`categories.${cat.slug}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-beige-700 mb-1">
              {t('addAsset.description')}
            </label>
            <textarea
              rows={4}
              className={inputClass}
              placeholder={t('addAsset.descriptionPlaceholder')}
              {...register('description')}
            />
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white border border-beige-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-beige-900">{t('addAsset.photos')}</h2>
          {imageUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => updateImage(idx, e.target.value)}
                className={inputClass}
                placeholder={t('addAsset.photoPlaceholder')}
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="px-3 border border-beige-300 rounded-lg text-beige-500 hover:bg-beige-50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {imageUrls.length < 20 && (
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-1 text-sm text-gold-600 font-medium"
            >
              <Plus className="w-4 h-4" /> {t('addAsset.addAnotherImage')}
            </button>
          )}
        </section>

        {/* Location + value */}
        <section className="bg-white border border-beige-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-beige-900">{t('addAsset.locationValue')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">{t('addAsset.region')}</label>
              <input className={inputClass} placeholder={t('addAsset.regionPlaceholder')} {...register('region')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">{t('addAsset.city')}</label>
              <input className={inputClass} placeholder={t('addAsset.cityPlaceholder')} {...register('city')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('addAsset.estimatedValue')}
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder={t('addAsset.valuePlaceholder')}
                {...register('estimated_value', { required: true, min: 0 })}
              />
              {errors.estimated_value && (
                <p className="mt-1 text-xs text-red-600">{t('addAsset.valueRequired')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('addAsset.liquidityScore')}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                {...register('liquidity_score', { min: 0, max: 100 })}
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white border border-beige-200 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-beige-900">{t('addAsset.preferredExchange')}</h2>
          <p className="text-sm text-beige-500">
            {t('addAsset.preferredSubtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORY_SLUGS.map((slug) => {
              const pref = preferences.find((p) => p.category_slug === slug);
              return (
                <div
                  key={slug}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                    pref ? 'border-gold-300 bg-gold-50' : 'border-beige-200'
                  }`}
                >
                  <label className="flex items-center gap-2 text-sm text-beige-700">
                    <input
                      type="checkbox"
                      checked={!!pref}
                      onChange={() => togglePreference(slug)}
                    />
                    {t(`categories.${slug}`)}
                  </label>
                  {pref && (
                    <label className="flex items-center gap-1 text-xs text-beige-500">
                      <input
                        type="checkbox"
                        checked={pref.cash_accepted}
                        onChange={() => toggleCash(slug)}
                      />
                      {t('addAsset.plusCash')}
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <button
          type="submit"
          disabled={createAsset.isPending}
          className="w-full py-3 bg-gold-gradient hover:bg-gold-gradient-hover disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm"
        >
          {createAsset.isPending ? t('common.publishing') : t('addAsset.publish')}
        </button>
      </form>
    </div>
  );
}
