import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { uploadFile } from '../../utils/api';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

interface UploadEntry {
  id: string;
  url: string;
  uploading: boolean;
  error?: string;
}

let nextId = 0;
function uid(): string {
  return `img-${++nextId}-${Date.now()}`;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function ImageUploader({ value, onChange, maxImages = 20 }: ImageUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [entries, setEntries] = useState<UploadEntry[]>([]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxImages - value.length;
      const batch = Array.from(files).slice(0, remaining);
      if (batch.length === 0) return;

      const newEntries: UploadEntry[] = batch.map(() => ({
        id: uid(),
        url: '',
        uploading: true,
      }));

      setEntries((prev) => [...prev, ...newEntries]);
      const newUrls: string[] = [];

      for (let i = 0; i < batch.length; i++) {
        const entryId = newEntries[i].id;
        try {
          const result = await uploadFile(batch[i]);
          newUrls.push(result.url);
          setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, url: result.url, uploading: false } : e)),
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, uploading: false, error: message } : e)),
          );
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }
    },
    [value, onChange, maxImages],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        void processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        void processFiles(e.target.files);
        e.target.value = '';
      }
    },
    [processFiles],
  );

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const removeEntry = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
          dragOver
            ? 'border-gold-500 bg-gold-50'
            : 'border-beige-300 hover:border-gold-400 hover:bg-beige-50'
        }`}
      >
        <Upload className="w-8 h-8 text-beige-400" />
        <p className="text-sm font-medium text-beige-700">
          {t('imageUploader.dropOrClick')}
        </p>
        <p className="text-xs text-beige-500">
          {t('imageUploader.fileTypes')} &middot; {t('imageUploader.maxSize')}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {(value.length > 0 || entries.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, idx) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-beige-200 bg-beige-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('common.delete')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-gold-600 text-white rounded">
                  {t('imageUploader.cover')}
                </span>
              )}
            </div>
          ))}

          {entries
            .filter((e) => !e.url && !e.error)
            .map((entry) => (
              <div key={entry.id} className="relative aspect-square rounded-lg border border-beige-200 bg-beige-50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
              </div>
            ))}

          {entries
            .filter((e) => e.error)
            .map((entry) => (
              <div
                key={entry.id}
                className="relative aspect-square rounded-lg border border-red-200 bg-red-50 flex flex-col items-center justify-center gap-1 p-2"
              >
                <ImagePlus className="w-5 h-5 text-red-400" />
                <p className="text-[10px] text-red-500 text-center leading-tight">
                  {entry.error}
                </p>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-[10px] text-red-600 underline"
                >
                  {t('common.delete')}
                </button>
              </div>
            ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-beige-500">
          {value.length} / {maxImages} {t('imageUploader.images')}
        </p>
      )}
    </div>
  );
}
