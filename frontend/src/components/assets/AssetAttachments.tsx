import { useTranslation } from 'react-i18next';
import { Download, FileText } from 'lucide-react';
import type { AssetAttachment } from '../../types';

interface AssetAttachmentsProps {
  attachments: AssetAttachment[];
}

function fileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext || '';
}

function fileIconColor(filename: string): string {
  const ext = fileExtension(filename);
  if (ext === 'pdf') return 'text-red-500';
  if (['doc', 'docx'].includes(ext)) return 'text-blue-500';
  if (['xls', 'xlsx'].includes(ext)) return 'text-green-500';
  if (ext === 'csv') return 'text-green-500';
  return 'text-beige-500';
}

export function AssetAttachments({ attachments }: AssetAttachmentsProps) {
  const { t } = useTranslation();

  if (attachments.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="font-semibold text-beige-900">{t('assets.attachments')}</h2>
      <ul className="mt-2 space-y-1.5">
        {attachments.map((att) => (
          <li key={att.id}>
            <a
              href={att.url}
              download={att.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2.5 bg-beige-50 border border-beige-200 rounded-lg hover:bg-beige-100 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText
                  className={`w-4 h-4 shrink-0 ${fileIconColor(att.filename)}`}
                />
                <span className="text-sm text-beige-700 truncate">
                  {att.filename}
                </span>
              </div>
              <Download className="w-4 h-4 text-beige-400 group-hover:text-gold-600 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
