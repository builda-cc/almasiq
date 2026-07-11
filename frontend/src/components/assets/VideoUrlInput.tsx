import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, X, Plus } from 'lucide-react';

interface VideoUrlInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxVideos?: number;
}

const URL_PATTERN = /^https?:\/\/.+\..+/;

export function VideoUrlInput({ value, onChange, maxVideos = 5 }: VideoUrlInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addUrl = () => {
    const url = input.trim();
    if (!url) return;
    if (!URL_PATTERN.test(url)) {
      setError(t('videoUrl.invalidUrl'));
      return;
    }
    if (value.includes(url)) {
      setError(t('videoUrl.duplicate'));
      return;
    }
    if (value.length >= maxVideos) {
      setError(t('videoUrl.maxReached'));
      return;
    }
    setError('');
    onChange([...value, url]);
    setInput('');
  };

  const removeUrl = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrl();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-400" />
          <input
            type="url"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder={t('videoUrl.placeholder')}
            className="w-full pl-9 pr-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-sm"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium text-sm flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('videoUrl.add')}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((url, idx) => (
            <li key={url} className="flex items-center gap-2 px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg">
              <Link2 className="w-3.5 h-3.5 text-beige-400 shrink-0" />
              <span className="text-sm text-beige-700 truncate flex-1">{url}</span>
              <button
                type="button"
                onClick={() => removeUrl(idx)}
                className="p-1 hover:bg-beige-200 rounded shrink-0"
                aria-label={t('common.delete')}
              >
                <X className="w-3.5 h-3.5 text-beige-500" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length > 0 && (
        <p className="text-xs text-beige-500">
          {value.length} / {maxVideos} {t('videoUrl.videos')}
        </p>
      )}
    </div>
  );
}
