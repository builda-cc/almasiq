import { useState } from 'react';
import { ArrowRightLeft, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExchanges, useUpdateExchangeStatus } from '../hooks/queries';
import { formatKzt, formatDate, getStatusColor } from '../utils/helpers';
import type { ExchangeRequest } from '../types';

function RequestRow({
  request,
  direction,
}: {
  request: ExchangeRequest;
  direction: 'incoming' | 'outgoing';
}) {
  const update = useUpdateExchangeStatus();
  const canRespond = direction === 'incoming' && request.status === 'pending';
  const canComplete = request.status === 'accepted';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
            request.status,
          )}`}
        >
          {request.status}
        </span>
        <span className="text-xs text-slate-400">{formatDate(request.created_at)}</span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm">
        <Link
          to={`/assets/${request.offered_asset.id}`}
          className="flex-1 min-w-0 hover:text-emerald-600"
        >
          <p className="font-medium text-slate-900 line-clamp-1">
            {request.offered_asset.title}
          </p>
          <p className="text-emerald-600 font-semibold">
            {formatKzt(request.offered_asset.estimated_value)}
          </p>
        </Link>
        <ArrowRightLeft className="w-4 h-4 text-emerald-600 shrink-0" />
        <Link
          to={`/assets/${request.requested_asset.id}`}
          className="flex-1 min-w-0 text-right hover:text-emerald-600"
        >
          <p className="font-medium text-slate-900 line-clamp-1">
            {request.requested_asset.title}
          </p>
          <p className="text-emerald-600 font-semibold">
            {formatKzt(request.requested_asset.estimated_value)}
          </p>
        </Link>
      </div>

      {request.message && (
        <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
          {direction === 'incoming'
            ? request.from_user.full_name
            : 'You'}
          : {request.message}
        </p>
      )}

      {(canRespond || canComplete) && (
        <div className="mt-3 flex gap-2">
          {canRespond && (
            <>
              <button
                onClick={() => update.mutate({ id: request.id, status: 'accepted' })}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => update.mutate({ id: request.id, status: 'rejected' })}
                className="flex-1 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1 hover:bg-slate-50"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </>
          )}
          {canComplete && (
            <button
              onClick={() => update.mutate({ id: request.id, status: 'completed' })}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
            >
              Mark Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ExchangeRequests() {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const { data: requests, isLoading } = useExchanges(tab);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Exchange Requests</h1>

      <div className="mt-4 inline-flex rounded-lg border border-slate-200 p-1 bg-white">
        {(['incoming', 'outgoing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              tab === t ? 'bg-emerald-600 text-white' : 'text-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">Loading…</div>
      ) : (requests ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
          No {tab} requests.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(requests ?? []).map((request) => (
            <RequestRow key={request.id} request={request} direction={tab} />
          ))}
        </div>
      )}
    </div>
  );
}
