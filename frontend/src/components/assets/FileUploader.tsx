import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText } from 'lucide-react';
import { uploadDocument } from '../../utils/api';

export interface AttachmentEntry {
  url: string;
  filename: string;
  mime_type: string;
}

interface FileUploaderProps {
  value: AttachmentEntry[];
  onChange: (files: AttachmentEntry[]) => void;
  maxFiles?: number;
}

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';

let nextId = 0;
function uid(): string {
  return `file-${++nextId}-${Date.now()}`;
}

interface PendingEntry {
  id: string;
  filename: string;
  done: boolean;
  error?: string;
}

export function FileUploader({ value, onChange, maxFiles = 10 }: FileUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<PendingEntry[]>([]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxFiles - value.length;
      const batch = Array.from(files).slice(0, remaining);
      if (batch.length === 0) return;

      const entries: PendingEntry[] = batch.map(() => ({
        id: uid(),
        filename: '',
        done: false,
      }));

      setPending((prev) => [...prev, ...entries]);
      const uploaded: AttachmentEntry[] = [];

      for (let i = 0; i < batch.length; i++) {
        const entryId = entries[i].id;
        try {
          const result = await uploadDocument(batch[i]);
          uploaded.push({
            url: result.url,
            filename: result.filename,
            mime_type: batch[i].type || '',
          });
          setPending((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? { ...e, filename: result.filename, done: true }
                : e,
            ),
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setPending((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, error: message, done: true } : e,
            ),
          );
        }
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
    },
    [value, onChange, maxFiles],
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

  const removeFile = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const dismissPending = (id: string) => {
    setPending((prev) => prev.filter((e) => e.id !== id));
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
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
          dragOver
            ? 'border-gold-500 bg-gold-50'
            : 'border-beige-300 hover:border-gold-400 hover:bg-beige-50'
        }`}
      >
        <Upload className="w-7 h-7 text-beige-400" />
        <p className="text-sm font-medium text-beige-700">
          {t('fileUploader.dropOrClick')}
        </p>
        <p className="text-xs text-beige-500">
          PDF, DOC, DOCX, XLS, XLSX, CSV, TXT
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

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((file, idx) => (
            <li
              key={file.url}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-beige-400 shrink-0" />
                <span className="text-sm text-beige-700 truncate">
                  {file.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 rounded hover:bg-beige-200 text-beige-400 hover:text-beige-600 shrink-0"
                aria-label={t('common.delete')}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending.filter((e) => !e.done).length > 0 && (
        <p className="text-xs text-beige-500">{t('common.saving')}</p>
      )}

      {pending
        .filter((e) => e.done && e.error)
        .map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-xs text-red-600 truncate">{entry.error}</p>
            <button
              type="button"
              onClick={() => dismissPending(entry.id)}
              className="text-xs text-red-600 underline shrink-0"
            >
              {t('common.delete')}
            </button>
          </div>
        ))}

      {value.length > 0 && (
        <p className="text-xs text-beige-500">
          {value.length} / {maxFiles} {t('fileUploader.files')}
        </p>
      )}
    </div>
  );
}
