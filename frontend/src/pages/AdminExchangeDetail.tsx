import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  BadgeCheck,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { useAdminExchange, useAdminDecision } from '../hooks/queries';
import { formatKzt, formatDate, getStatusColor } from '../utils/helpers';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import type {
  AdminAction,
  AdminUserDetail,
  Asset,
  MatchAnalysis,
} from '../types';

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-beige-500">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="mt-0.5 h-1.5 bg-beige-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold-500 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function UserCard({
  title,
  user,
  t,
}: {
  title: string;
  user: AdminUserDetail;
  t: (k: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <div className="bg-white border border-beige-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-beige-400 uppercase tracking-wide">
        {title}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <p className="font-semibold text-beige-900">{user.full_name}</p>
        {user.verification_status !== 'unverified' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-50 text-gold-700 text-[11px] font-medium rounded-full">
            <BadgeCheck className="w-3 h-3" />
            {t(`admin.verify.${user.verification_status}`)}
          </span>
        )}
      </div>
      <p className="mt-2 flex items-center text-sm text-beige-600">
        <Phone className="w-4 h-4 mr-1.5" />
        {user.phone ?? '—'}
      </p>
      <p className="mt-1 flex items-center text-sm text-beige-600">
        <Mail className="w-4 h-4 mr-1.5" />
        {user.email}
      </p>
      <p className="mt-2 text-xs text-beige-400">
        {t('admin.registered', { date: formatDate(user.created_at) })}
      </p>
    </div>
  );
}

function AssetCard({ title, asset }: { title: string; asset: Asset }) {
  const location = [asset.city, asset.region, asset.country]
    .filter(Boolean)
    .join(', ');
  return (
    <div className="bg-white border border-beige-200 rounded-xl overflow-hidden">
      {asset.images[0] && (
        <img
          src={asset.images[0].url}
          alt={asset.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <p className="text-xs font-semibold text-beige-400 uppercase tracking-wide">
          {title}
        </p>
        <Link
          to={`/assets/${asset.id}`}
          className="mt-1 block font-semibold text-beige-900 hover:text-gold-600"
        >
          {asset.title}
        </Link>
        <p className="text-gold-600 font-semibold">
          {formatKzt(asset.estimated_value)}
        </p>
        {location && <p className="mt-1 text-sm text-beige-500">{location}</p>}
        <p className="mt-2 text-sm text-beige-600 line-clamp-3">
          {asset.description}
        </p>
      </div>
    </div>
  );
}

function MatchAnalysisCard({
  analysis,
  t,
}: {
  analysis: MatchAnalysis;
  t: (k: string) => string;
}) {
  return (
    <div className="bg-white border border-beige-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-beige-900">{t('admin.matchAnalysis')}</h3>
        <MatchScoreBadge score={analysis.match_score} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <ScoreBar label={t('matches.valueWeight')} value={analysis.value_score} />
        <ScoreBar
          label={t('matches.preferenceWeight')}
          value={analysis.preference_score}
        />
        <ScoreBar
          label={t('matches.locationWeight')}
          value={analysis.location_score}
        />
        <ScoreBar
          label={t('matches.liquidityWeight')}
          value={analysis.liquidity_score}
        />
      </div>
    </div>
  );
}

export function AdminExchangeDetail() {
  const { t } = useTranslation();
  const { requestId } = useParams<{ requestId: string }>();
  const id = requestId ? Number(requestId) : null;
  const { data: detail, isLoading } = useAdminExchange(id);
  const decide = useAdminDecision();
  const [note, setNote] = useState('');

  if (isLoading) {
    return (
      <div className="py-32 text-center text-beige-500">{t('common.loading')}</div>
    );
  }
  if (!detail) {
    return (
      <div className="py-32 text-center text-beige-500">
        {t('admin.notFound')}{' '}
        <Link to="/admin" className="text-gold-600">
          {t('admin.backToCenter')}
        </Link>
      </div>
    );
  }

  const runDecision = async (action: AdminAction) => {
    await decide.mutateAsync({ id: detail.id, action, note: note || undefined });
    setNote('');
  };

  const decided =
    detail.status === 'approved' ||
    detail.status === 'rejected' ||
    detail.status === 'completed' ||
    detail.status === 'cancelled';

  return (
    <div>
      <Link to="/admin" className="text-sm text-beige-500 hover:text-beige-700">
        {t('admin.backToCenter')}
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h2 className="text-2xl font-bold text-beige-900">
          {t('admin.requestId', { id: detail.id })}
        </h2>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
            detail.status,
          )}`}
        >
          {t(`exchanges.status.${detail.status}`)}
        </span>
      </div>

      {/* Users */}
      <h3 className="mt-6 text-sm font-semibold text-beige-700">
        {t('admin.userInfo')}
      </h3>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserCard title={t('admin.userA')} user={detail.from_user} t={t} />
        <UserCard title={t('admin.userB')} user={detail.to_user} t={t} />
      </div>

      {/* Assets */}
      <h3 className="mt-6 text-sm font-semibold text-beige-700">
        {t('admin.assetsInfo')}
      </h3>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AssetCard title={t('admin.assetA')} asset={detail.offered_asset} />
        <AssetCard title={t('admin.assetB')} asset={detail.requested_asset} />
      </div>

      {/* Match analysis */}
      {detail.match_analysis && (
        <div className="mt-6">
          <MatchAnalysisCard analysis={detail.match_analysis} t={t} />
        </div>
      )}

      {/* Communication history */}
      <h3 className="mt-6 text-sm font-semibold text-beige-700">
        {t('admin.communication')}
      </h3>
      <div className="mt-2 bg-white border border-beige-200 rounded-xl p-4 space-y-2 max-h-72 overflow-y-auto">
        {detail.messages.length === 0 ? (
          <p className="text-sm text-beige-400 py-4 text-center">
            {t('admin.noMessages')}
          </p>
        ) : (
          detail.messages.map((m) => {
            const fromA = m.sender_id === detail.from_user.id;
            return (
              <div key={m.id} className="text-sm">
                <span className="font-medium text-beige-700">
                  {fromA ? detail.from_user.full_name : detail.to_user.full_name}:
                </span>{' '}
                <span className="text-beige-600">{m.body}</span>
                {m.flagged && (
                  <span className="ml-1 text-[11px] text-amber-600">
                    ({t('admin.flagged')})
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Decision panel */}
      {!decided && (
        <div className="mt-6 bg-white border border-beige-200 rounded-xl p-4">
          <h3 className="font-semibold text-beige-900">{t('admin.decision')}</h3>
          {!detail.recipient_accepted && (
            <p className="mt-1 text-xs text-amber-600">
              {t('admin.recipientNotAccepted')}
            </p>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={t('admin.notePlaceholder')}
            className="mt-3 w-full px-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-sm"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void runDecision('approve')}
              disabled={decide.isPending}
              className="flex-1 min-w-[8rem] py-2.5 bg-gold-gradient hover:bg-gold-gradient-hover disabled:opacity-60 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> {t('admin.approve')}
            </button>
            <button
              onClick={() => void runDecision('reject')}
              disabled={decide.isPending}
              className="flex-1 min-w-[8rem] py-2.5 border border-red-300 text-red-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 hover:bg-red-50"
            >
              <X className="w-4 h-4" /> {t('admin.reject')}
            </button>
            <button
              onClick={() => void runDecision('request_info')}
              disabled={decide.isPending}
              className="flex-1 min-w-[8rem] py-2.5 border border-beige-300 text-beige-700 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 hover:bg-beige-50"
            >
              <HelpCircle className="w-4 h-4" /> {t('admin.requestInfo')}
            </button>
          </div>
        </div>
      )}

      {detail.admin_note && (
        <p className="mt-4 text-sm text-beige-500">
          {t('admin.adminNote')}: {detail.admin_note}
        </p>
      )}
    </div>
  );
}
