import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { useCategories, useCreateAsset } from '../hooks/queries';
import { CATEGORY_LABELS, CATEGORY_SLUGS } from '../utils/helpers';
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
  'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none';

export function AddAsset() {
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
      category_slug: 'apartments',
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
      <h1 className="text-2xl font-bold text-slate-900">Publish Asset</h1>
      <p className="mt-1 text-slate-500">
        List an asset and tell us what you'd accept in exchange.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {/* Basic info */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              className={inputClass}
              placeholder="3-room apartment in Almaty center"
              {...register('title', { required: true })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">Title is required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select className={inputClass} {...register('category_slug', { required: true })}>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              className={inputClass}
              placeholder="Describe your asset…"
              {...register('description')}
            />
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Photos (image URLs)</h2>
          {imageUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => updateImage(idx, e.target.value)}
                className={inputClass}
                placeholder="https://…"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="px-3 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50"
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
              className="flex items-center gap-1 text-sm text-emerald-600 font-medium"
            >
              <Plus className="w-4 h-4" /> Add another image
            </button>
          )}
        </section>

        {/* Location + value */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Location & Value</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
              <input className={inputClass} placeholder="Almaty" {...register('region')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input className={inputClass} placeholder="Almaty" {...register('city')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estimated value (KZT)
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="50000000"
                {...register('estimated_value', { required: true, min: 0 })}
              />
              {errors.estimated_value && (
                <p className="mt-1 text-xs text-red-600">Value is required</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Liquidity score (0-100)
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
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-slate-900">Preferred Exchange Assets</h2>
          <p className="text-sm text-slate-500">
            Select categories you'd accept in exchange.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORY_SLUGS.map((slug) => {
              const pref = preferences.find((p) => p.category_slug === slug);
              return (
                <div
                  key={slug}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                    pref ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!pref}
                      onChange={() => togglePreference(slug)}
                    />
                    {CATEGORY_LABELS[slug]}
                  </label>
                  {pref && (
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={pref.cash_accepted}
                        onChange={() => toggleCash(slug)}
                      />
                      + cash
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
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg"
        >
          {createAsset.isPending ? 'Publishing…' : 'Publish Asset'}
        </button>
      </form>
    </div>
  );
}
