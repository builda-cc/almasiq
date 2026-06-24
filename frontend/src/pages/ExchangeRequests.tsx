import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightLeft,
  Check,
  X,
  MessageSquare,
  Lock,
  Phone,
  Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useExchanges,
  useUpdateExchangeStatus,
} from '../hooks/queries';
import { useAuthStore } from '../store/authStore';
import { formatKzt, formatDate, getStatusColor } from '../utils/helpers';
import { ExchangeChatModal } from '../components/exchanges/ExchangeChatModal';
import type { ExchangeRequest, User } from '../types';

function ContactPanel({ user, t }: { user: User; t: (k: string) => string }) {
  return (
    <div className="mt-3 rounded-lg bg-gold-50 border border-gold-200 p-3">
      <p className="text-xs font-semibold text-gold-700">
        {t('contact.unlockedBadge')}
      </p>
      <p className="mt-1 text-sm font-medium text-beige-900">{user.full_name}</p>
      {user.phone && (
        <p className="mt-1 flex items-center text-sm text-beige-700">
          <Phone className="w-4 h-4 mr-1.5" />
          {user.phone}
        </p>
      )}
      {user.email && (
        <p className="mt-1 flex items-center text-sm text-beige-700">
          <Mail className="w-4 h-4 mr-1.5" />
          {user.email}
        </p>
      )}
      {user.whatsapp && (
        <p className="mt-1 text-sm text-beige-700">WhatsApp: {user.whatsapp}</p>
      )}
      {user.telegram && (
        <p className="mt-1 text-sm text-beige-700">Telegram: {user.telegram}</p>
      )}
    </div>
  );
}

function RequestRow({
  request,
  direction,
  currentUserId,
  onOpenChat,
  t,
}: {
  request: ExchangeRequest;
  direction: 'incoming' | 'outgoing';
  currentUserId: number;
  onOpenChat: (request: ExchangeRequest) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const update = useUpdateExchangeStatus();
  const canRespond = direction === 'incoming' && request.status === 'pending';
  const canCancel =
    direction === 'outgoing' &&
    (request.status === 'pending' || request.status === 'under_review');
  const canComplete = request.status === 'approved';
  const chatOpenable =
    request.status !== 'rejected' && request.status !== 'cancelled';

  // The counterparty whose details are unlocked on approval.
  const counterparty =
    request.from_user.id === currentUserId
      ? request.to_user
      : request.from_user;

  return (
    <div className="bg-white border border-beige-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
            request.status,
          )}`}
        >
          {t(`exchanges.status.${request.status}`)}
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

      {/* Contact state */}
      {request.contact_unlocked ? (
        <ContactPanel user={counterparty} t={t} />
      ) : (
        request.status !== 'rejected' &&
        request.status !== 'cancelled' && (
          <p className="mt-3 flex items-center text-xs text-beige-500">
            <Lock className="w-3.5 h-3.5 mr-1.5 text-gold-600" />
            {t('exchanges.awaitingApproval')}
          </p>
        )
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {chatOpenable && (
          <button
            onClick={() => onOpenChat(request)}
            className="flex-1 min-w-[8rem] py-2 border border-beige-300 text-beige-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1 hover:bg-beige-50"
          >
            <MessageSquare className="w-4 h-4" /> {t('exchanges.openChat')}
          </button>
        )}
        {canRespond && (
          <>
            <button
              onClick={() => update.mutate({ id: request.id, status: 'accepted' })}
              className="flex-1 min-w-[8rem] py-2 bg-gold-600 hover:bg-gold-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> {t('exchanges.accept')}
            </button>
            <button
              onClick={() => update.mutate({ id: request.id, status: 'rejected' })}
              className="flex-1 min-w-[8rem] py-2 border border-beige-300 text-beige-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1 hover:bg-beige-50"
            >
              <X className="w-4 h-4" /> {t('exchanges.reject')}
            </button>
          </>
        )}
        {canCancel && (
          <button
            onClick={() => update.mutate({ id: request.id, status: 'cancelled' })}
            className="flex-1 min-w-[8rem] py-2 border border-beige-300 text-beige-700 text-sm font-medium rounded-lg hover:bg-beige-50"
          >
            {t('exchanges.cancel')}
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => update.mutate({ id: request.id, status: 'completed' })}
            className="flex-1 min-w-[8rem] py-2 bg-gold-600 hover:bg-gold-700 text-white text-sm font-medium rounded-lg"
          >
            {t('exchanges.markCompleted')}
          </button>
        )}
      </div>
    </div>
  );
}

export function ExchangeRequests() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const { data: requests, isLoading } = useExchanges(tab);
  const currentUser = useAuthStore((s) => s.user);
  const [chatRequest, setChatRequest] = useState<ExchangeRequest | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold text-beige-900">{t('exchanges.title')}</h1>
      <p className="mt-1 text-sm text-beige-500">{t('exchanges.subtitle')}</p>

      <div className="mt-4 inline-flex rounded-lg border border-beige-200 p-1 bg-white">
        {(['incoming', 'outgoing'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              tab === value ? 'bg-gold-600 text-white' : 'text-beige-600'
            }`}
          >
            {t(`exchanges.${value}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-beige-500">{t('common.loading')}</div>
      ) : (requests ?? []).length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-beige-300 rounded-xl p-8 text-center text-beige-500">
          {t('exchanges.noRequests', { tab: t(`exchanges.${tab}`) })}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(requests ?? []).map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              direction={tab}
              currentUserId={currentUser?.id ?? -1}
              onOpenChat={setChatRequest}
              t={t}
            />
          ))}
        </div>
      )}

      {chatRequest && (
        <ExchangeChatModal
          request={chatRequest}
          currentUserId={currentUser?.id ?? -1}
          onClose={() => setChatRequest(null)}
        />
      )}
    </div>
  );
}
