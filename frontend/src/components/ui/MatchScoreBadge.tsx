import { Sparkles } from 'lucide-react';
import { getMatchScoreColor } from '../../utils/helpers';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const sizeClasses =
    size === 'lg'
      ? 'text-lg px-3 py-1.5'
      : size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${getMatchScoreColor(
        score,
      )} ${sizeClasses}`}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {Math.round(score)} match
    </span>
  );
}
