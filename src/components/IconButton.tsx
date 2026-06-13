import { memo } from 'react';

interface IconButtonProps {
  onClick: () => void;
  label: string;
  icon: string;
  subLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function IconButton({ onClick, label, icon, subLabel, className = '', size = 'md' }: IconButtonProps) {
  const sizeClass = {
    sm: 'h-12 text-xl',
    md: 'h-16 text-2xl',
    lg: 'h-20 text-3xl',
  }[size];

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        flex flex-col items-center justify-center rounded-2xl
        active:scale-90 transition-transform duration-75
        select-none touch-manipulation
        ${sizeClass} ${className}
      `}
    >
      <span role="img" aria-hidden="true">{icon}</span>
      {subLabel && (
        <span className="text-xs font-bold mt-0.5 leading-none">{subLabel}</span>
      )}
    </button>
  );
}

export default memo(IconButton);
