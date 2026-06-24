import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import {
  useAsset,
  useMyAssets,
  useCreateExchange,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from '../hooks/queries';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { formatKzt, formatDate, categoryName } from '../utils/helpers';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200';

export function AssetDetails() {
  const { t } = useTranslation();
  const { assetId } = useParams<{ assetId: string }>();
  const id = assetId ? Number(assetId) : null;

  const { data: asset, isLoading } = useAsset(id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const openAuth = useUIStore((s) => s.openAuth);

  const { data: myAssets } = useMyAssets();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const createExchange = useCreateExchange();

  const [imageIndex, setImageIndex] = useState(0);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [offeredId, setOfferedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return <div className="py-32 text-center text-beige-500">{t('common.loading')}</div>;
  }
  if (!asset) {
    return (
      <div className="py-32 text-center text-beige-500">
        {t('assets.assetNotFound')}{' '}
        <Link to="/assets" className="text-gold-600">
          {t('assets.backToBrowseAlt')}
        </Link>
      </div>
    );
  }

  const images = asset.images.length > 0 ? asset.images : [{ id: 0, url: PLACEHOLDER, position: 0 }];
  const isOwner = currentUser?.id === asset.owner.id;
  const isFavorite = (favorites ?? []).some((f) => f.asset.id === asset.id);
  const eligibleAssets = (myAssets ?? []).filter((a) => a.status === 'active');
  const location = [asset.city, asset.region, asset.country].filter(Boolean).join(', ');

  const toggleFavorite = () => {
    if (!isAuthenticated) return openAuth('login');
    if (isFavorite) {
      removeFavorite.mutate(asset.id);
    } else {
      addFavorite.mutate(asset.id);
    }
  };

  const submitExchange = async () => {
    if (!offeredId) return;
    await createExchange.mutateAsync({
      offered_asset_id: offeredId,
      requested_asset_id: asset.id,
      message,
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/assets" className="text-sm text-beige-500 hover:text-beige-700">
        {t('assets.backToBrowse')}
      </Link>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery + description */}
        <div className="lg:col-span-2">
          <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden bg-beige-100">
            <img
              src={images[imageIndex].url}
              alt={asset.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImageIndex((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-3 top-1/2 -tranbeige-y-1/2 p-2 bg-white/90 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -tranbeige-y-1/2 p-2 bg-white/90 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="mt-6">
            <span className="inline-block px-2.5 py-1 bg-gold-50 text-gold-700 text-xs font-medium rounded-full">
              {categoryName(asset.category.slug)}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-beige-900">{asset.title}</h1>
            {location && (
              <p className="mt-2 flex items-center text-beige-500">
                <MapPin className="w-4 h-4 mr-1.5" />
                {location}
              </p>
            )}
            <p className="mt-4 text-beige-700 whitespace-pre-line">{asset.description}</p>

            {asset.preferences.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-beige-900">{t('assets.preferredExchanges')}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {asset.preferences.map((p) => (
                    <li
                      key={p.id}
                      className="px-3 py-1.5 bg-beige-100 text-beige-700 text-sm rounded-full"
                    >
                      {p.category_slug}
                      {p.cash_accepted ? ` ${t('assets.plusCash')}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-beige-200 rounded-xl p-6 lg:sticky lg:top-24">
            <p className="text-sm text-beige-500">{t('assets.estimatedValue')}</p>
            <p className="text-3xl font-bold text-gold-600">
              {formatKzt(asset.estimated_value)}
            </p>
            <p className="mt-1 text-sm text-beige-500">
              {t('assets.liquidityScore', { score: asset.liquidity_score })}
            </p>

            <div className="mt-6 border-t border-beige-100 pt-4">
              <p className="text-sm text-beige-500">{t('assets.owner')}</p>
              <p className="font-medium text-beige-900">{asset.owner.full_name}</p>
              {asset.owner.city && (
                <p className="mt-0.5 text-sm text-beige-500">{asset.owner.city}</p>
              )}

              {isOwner || asset.owner.contact_unlocked ? (
                <div className="mt-2 space-y-1">
                  {asset.owner.phone && (
                    <p className="flex items-center text-sm text-beige-600">
                      <Phone className="w-4 h-4 mr-1.5" />
                      {asset.owner.phone}
                    </p>
                  )}
                  {asset.owner.email && (
                    <p className="flex items-center text-sm text-beige-600">
                      <Mail className="w-4 h-4 mr-1.5" />
                      {asset.owner.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-lg bg-beige-50 border border-beige-200 p-3">
                  <p className="flex items-center text-sm font-medium text-beige-700">
                    <Lock className="w-4 h-4 mr-1.5 text-gold-600" />
                    {t('contact.hiddenBadge')}
                  </p>
                  <p className="mt-1 text-xs text-beige-500">
                    {t('contact.hiddenHelp')}
                  </p>
                </div>
              )}
            </div>

            {!isOwner && (
              <div className="mt-6 space-y-2">
                <button
                  onClick={() =>
                    isAuthenticated ? setExchangeOpen(true) : openAuth('login')
                  }
                  className="w-full py-3 bg-gold-gradient hover:bg-gold-gradient-hover text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  {t('assets.proposeExchange')}
                </button>
                <button
                  onClick={toggleFavorite}
                  className="w-full py-3 border border-beige-300 rounded-lg font-medium text-beige-700 hover:bg-beige-50 flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  {isFavorite ? t('assets.saved') : t('assets.saveToFavorites')}
                </button>
              </div>
            )}

            <p className="mt-4 text-xs text-beige-400">
              {t('assets.listed', { date: formatDate(asset.created_at) })}
            </p>
          </div>
        </div>
      </div>

      {/* Exchange proposal modal */}
      {exchangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-beige-900/50 backdrop-blur-sm"
            onClick={() => setExchangeOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-beige-900">{t('assets.exchangeProposal')}</h2>
              <button
                onClick={() => setExchangeOpen(false)}
                className="p-2 hover:bg-beige-100 rounded-lg"
              >
                <X className="w-5 h-5 text-beige-500" />
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center">
                <p className="text-gold-600 font-semibold">{t('assets.proposalSent')}</p>
                <p className="mt-1 text-sm text-beige-500">
                  {t('assets.proposalSentDesc')}
                </p>
                <Link
                  to="/dashboard/exchanges"
                  className="mt-4 inline-block px-4 py-2 bg-gold-600 text-white rounded-lg"
                >
                  {t('assets.goToExchanges')}
                </Link>
              </div>
            ) : eligibleAssets.length === 0 ? (
              <div className="py-4 text-center text-sm text-beige-500">
                {t('assets.noEligibleAssets')}
                <Link to="/assets/new" className="block mt-3 text-gold-600 font-medium">
                  {t('assets.publishAnAsset')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    {t('assets.offerYourAsset')}
                  </label>
                  <select
                    value={offeredId ?? ''}
                    onChange={(e) => setOfferedId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                  >
                    <option value="">{t('assets.selectAsset')}</option>
                    {eligibleAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} — {formatKzt(a.estimated_value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    {t('assets.message')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                    placeholder={t('assets.messagePlaceholder')}
                  />
                </div>
                <button
                  onClick={submitExchange}
                  disabled={!offeredId || createExchange.isPending}
                  className="w-full py-3 bg-gold-gradient hover:bg-gold-gradient-hover disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm"
                >
                  {createExchange.isPending ? t('common.sending') : t('assets.sendProposal')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
