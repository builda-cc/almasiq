import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, ShieldAlert, Lock } from 'lucide-react';
import { useExchangeMessages, useSendMessage } from '../../hooks/queries';
import { formatRelativeTime } from '../../utils/helpers';
import type { ExchangeRequest } from '../../types';

interface ExchangeChatModalProps {
  request: ExchangeRequest;
  currentUserId: number;
  onClose: () => void;
}

export function ExchangeChatModal({
  request,
  currentUserId,
  onClose,
}: ExchangeChatModalProps) {
  const { t } = useTranslation();
  const { data: messages, isLoading } = useExchangeMessages(request.id);
  const sendMessage = useSendMessage();
  const [body, setBody] = useState('');

  const counterparty =
    request.from_user.id === currentUserId
      ? request.to_user
      : request.from_user;

  const handleSend = async () => {
    const text = body.trim();
    if (!text) return;
    await sendMessage.mutateAsync({ id: request.id, body: text });
    setBody('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-beige-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b border-beige-100">
          <div>
            <h2 className="text-lg font-bold text-beige-900">
              {t('chat.title')}
            </h2>
            <p className="text-xs text-beige-500">{counterparty.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-100 rounded-lg"
          >
            <X className="w-5 h-5 text-beige-500" />
          </button>
        </div>

        {!request.contact_unlocked && (
          <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">{t('chat.maskingNotice')}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[12rem]">
          {isLoading ? (
            <p className="text-center text-sm text-beige-500">
              {t('common.loading')}
            </p>
          ) : (messages ?? []).length === 0 ? (
            <p className="text-center text-sm text-beige-400 py-8">
              {t('chat.empty')}
            </p>
          ) : (
            (messages ?? []).map((msg) => {
              const mine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'bg-gold-600 text-white'
                        : 'bg-beige-100 text-beige-900'
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{msg.body}</p>
                    {msg.flagged && (
                      <p
                        className={`mt-1 flex items-center gap-1 text-[11px] ${
                          mine ? 'text-amber-100' : 'text-amber-600'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {t('chat.flagged')}
                      </p>
                    )}
                    <p
                      className={`mt-0.5 text-[10px] ${
                        mine ? 'text-gold-100' : 'text-beige-400'
                      }`}
                    >
                      {formatRelativeTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-beige-100 flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-sm"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!body.trim() || sendMessage.isPending}
            className="px-4 py-2.5 bg-gold-gradient hover:bg-gold-gradient-hover disabled:opacity-60 text-white rounded-lg flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
