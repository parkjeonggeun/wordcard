import { memo } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  fillClass: string;
}

function ProgressBar({ current, total, fillClass }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div
      className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}          // BUG-12: was 1, ARIA spec requires 0
      aria-valuemax={total}
      aria-valuetext={`${current}번째 카드, 총 ${total}개`}
    >
      <div
        className={`h-full ${fillClass} transition-all duration-300 rounded-full`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default memo(ProgressBar);
