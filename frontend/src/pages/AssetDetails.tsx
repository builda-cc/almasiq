import { useState } from 'react';
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
import { formatKzt, formatDate } from '../utils/helpers';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200';

export function AssetDetails() {
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
    return <div className="py-32 text-center text-slate-500">Loading…</div>;
  }
  if (!asset) {
    return (
      <div className="py-32 text-center text-slate-500">
        Asset not found.{' '}
        <Link to="/assets" className="text-emerald-600">
          Back to browse
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
      <Link to="/assets" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to browse
      </Link>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery + description */}
        <div className="lg:col-span-2">
          <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-100">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="mt-6">
            <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
              {asset.category.name}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">{asset.title}</h1>
            {location && (
              <p className="mt-2 flex items-center text-slate-500">
                <MapPin className="w-4 h-4 mr-1.5" />
                {location}
              </p>
            )}
            <p className="mt-4 text-slate-700 whitespace-pre-line">{asset.description}</p>

            {asset.preferences.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-slate-900">Preferred Exchanges</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {asset.preferences.map((p) => (
                    <li
                      key={p.id}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full"
                    >
                      {p.category_slug}
                      {p.cash_accepted ? ' + cash' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 lg:sticky lg:top-24">
            <p className="text-sm text-slate-500">Estimated value</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatKzt(asset.estimated_value)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Liquidity score: {asset.liquidity_score}/100
            </p>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">Owner</p>
              <p className="font-medium text-slate-900">{asset.owner.full_name}</p>
              {asset.owner.phone && (
                <p className="mt-1 flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-1.5" />
                  {asset.owner.phone}
                </p>
              )}
              <p className="mt-1 flex items-center text-sm text-slate-600">
                <Mail className="w-4 h-4 mr-1.5" />
                {asset.owner.email}
              </p>
            </div>

            {!isOwner && (
              <div className="mt-6 space-y-2">
                <button
                  onClick={() =>
                    isAuthenticated ? setExchangeOpen(true) : openAuth('login')
                  }
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  Propose Exchange
                </button>
                <button
                  onClick={toggleFavorite}
                  className="w-full py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  {isFavorite ? 'Saved' : 'Save to Favorites'}
                </button>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400">
              Listed {formatDate(asset.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Exchange proposal modal */}
      {exchangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setExchangeOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Propose Exchange</h2>
              <button
                onClick={() => setExchangeOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center">
                <p className="text-emerald-600 font-semibold">Proposal sent!</p>
                <p className="mt-1 text-sm text-slate-500">
                  Track it under Exchange Requests.
                </p>
                <Link
                  to="/dashboard/exchanges"
                  className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg"
                >
                  Go to exchanges
                </Link>
              </div>
            ) : eligibleAssets.length === 0 ? (
              <div className="py-4 text-center text-sm text-slate-500">
                You need at least one active asset to propose an exchange.
                <Link to="/assets/new" className="block mt-3 text-emerald-600 font-medium">
                  Publish an asset
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Offer one of your assets
                  </label>
                  <select
                    value={offeredId ?? ''}
                    onChange={(e) => setOfferedId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Select an asset…</option>
                    {eligibleAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} — {formatKzt(a.estimated_value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Introduce your offer…"
                  />
                </div>
                <button
                  onClick={submitExchange}
                  disabled={!offeredId || createExchange.isPending}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg"
                >
                  {createExchange.isPending ? 'Sending…' : 'Send Proposal'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
