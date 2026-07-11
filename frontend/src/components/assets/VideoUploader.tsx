import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Video, Loader2 } from 'lucide-react';
import { uploadFile } from '../../utils/api';

interface VideoUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxVideos?: number;
}

interface UploadEntry {
  id: string;
  url: string;
  uploading: boolean;
  error?: string;
}

let nextId = 0;
function uid(): string {
  return `vid-${++nextId}-${Date.now()}`;
}

const ACCEPT = 'video/mp4,video/webm,video/quicktime';
const MAX_SIZE_BYTES = 60 * 1024 * 1024;
const MAX_DURATION_SECONDS = 6 * 60;

function validateFile(file: File): string | null {
  if (!ACCEPT.split(',').includes(file.type)) {
    return 'errorUnsupported';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'errorTooLarge';
  }
  return null;
}

function checkDuration(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (video.duration > MAX_DURATION_SECONDS) {
        resolve('errorTooLong');
      } else {
        resolve(null);
      }
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('errorUnsupported');
    };
    video.src = url;
  });
}

export function VideoUploader({ value, onChange, maxVideos = 5 }: VideoUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [entries, setEntries] = useState<UploadEntry[]>([]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxVideos - value.length;
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
        const file = batch[i];

        const fileError = validateFile(file);
        if (fileError) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, uploading: false, error: fileError } : e,
            ),
          );
          continue;
        }

        const durationError = await checkDuration(file);
        if (durationError) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, uploading: false, error: durationError } : e,
            ),
          );
          continue;
        }

        try {
          const result = await uploadFile(file);
          newUrls.push(result.url);
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, url: result.url, uploading: false } : e,
            ),
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, uploading: false, error: message } : e,
            ),
          );
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }
    },
    [value, onChange, maxVideos],
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

  const removeVideo = (idx: number) => {
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
          {t('videoUploader.dropOrClick')}
        </p>
        <p className="text-xs text-beige-500">
          {t('videoUploader.fileTypes')} &middot; {t('videoUploader.maxSize')} &middot; {t('videoUploader.maxDuration')}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((url, idx) => (
            <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-beige-200 bg-beige-100">
              <video src={url} className="w-full h-full object-cover" muted />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => removeVideo(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('common.delete')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {entries
            .filter((e) => !e.url && !e.error)
            .map((entry) => (
              <div key={entry.id} className="relative aspect-video rounded-lg border border-beige-200 bg-beige-50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
              </div>
            ))}

          {entries
            .filter((e) => e.error)
            .map((entry) => (
              <div
                key={entry.id}
                className="relative aspect-video rounded-lg border border-red-200 bg-red-50 flex flex-col items-center justify-center gap-1 p-2"
              >
                <Video className="w-5 h-5 text-red-400" />
                <p className="text-[10px] text-red-500 text-center leading-tight">
                  {t(`videoUploader.${entry.error}`)}
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
          {value.length} / {maxVideos} {t('videoUploader.videos')}
        </p>
      )}
    </div>
  );
}
