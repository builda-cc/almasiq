import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightLeft, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExchanges, useUpdateExchangeStatus } from '../hooks/queries';
import { formatKzt, formatDate, getStatusColor } from '../utils/helpers';
import type { ExchangeRequest } from '../types';

function RequestRow({
  request,
  direction,
  t,
}: {
  request: ExchangeRequest;
  direction: 'incoming' | 'outgoing';
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const update = useUpdateExchangeStatus();
  const canRespond = direction === 'incoming' && request.status === 'pending';
  const canComplete = request.status === 'accepted';

  return (
    <div className="bg-white border border-beige-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
            request.status,
          )}`}
        >
          {request.status}
        </span>
        <span className="text-xs text-beige-400">{formatDate(request.created_at)}</span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm">
        <Link
          to={`/assets/${request.offered_asset.id}`}
          className="flex-1 min-w-0 hover:text-gold-600"
        >
          <p className="font-medium text-beige-900 line-clamp-1">
            {request.offered_asset.title}
          </p>
          <p className="text-gold-600 font-semibold">
            {formatKzt(request.offered_asset.estimated_value)}
          </p>
        </Link>
        <ArrowRightLeft className="w-4 h-4 text-gold-600 shrink-0" />
        <Link
          to={`/assets/${request.requested_asset.id}`}
          className="flex-1 min-w-0 text-right hover:text-gold-600"
        >
          <p className="font-medium text-beige-900 line-clamp-1">
            {request.requested_asset.title}
          </p>
          <p className="text-gold-600 font-semibold">
            {formatKzt(request.requested_asset.estimated_value)}
          </p>
        </Link>
      </div>

      {request.message && (
        <p className="mt-3 text-sm text-beige-600 bg-beige-50 rounded-lg px-3 py-2">
          {direction === 'incoming'
            ? request.from_user.full_name
            : t('exchanges.you')}
          : {request.message}
        </p>
      )}

      {(canRespond || canComplete) && (
        <div className="mt-3 flex gap-2">
          {canRespond && (
            <>
              <button
                onClick={() => update.mutate({ id: request.id, status: 'accepted' })}
                className="flex-1 py-2 bg-gold-600 hover:bg-gold-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> {t('exchanges.accept')}
              </button>
              <button
                onClick={() => update.mutate({ id: request.id, status: 'rejected' })}
                className="flex-1 py-2 border border-beige-300 text-beige-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1 hover:bg-beige-50"
              >
                <X className="w-4 h-4" /> {t('exchanges.reject')}
              </button>
            </>
          )}
          {canComplete && (
            <button
              onClick={() => update.mutate({ id: request.id, status: 'completed' })}
              className="flex-1 py-2 bg-gold-600 hover:bg-gold-700 text-white text-sm font-medium rounded-lg"
            >
              {t('exchanges.markCompleted')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ExchangeRequests() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const { data: requests, isLoading } = useExchanges(tab);

  return (
    <div>
      <h1 className="text-2xl font-bold text-beige-900">{t('exchanges.title')}</h1>

      <div className="mt-4 inline-flex rounded-lg border border-beige-200 p-1 bg-white">
        {(['incoming', 'outgoing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              tab === t ? 'bg-gold-600 text-white' : 'text-beige-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-beige-500">{t('common.loading')}</div>
      ) : (requests ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-beige-300 rounded-xl p-8 text-center text-beige-500">
          {t('exchanges.noRequests', { tab })}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(requests ?? []).map((request) => (
            <RequestRow key={request.id} request={request} direction={tab} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
