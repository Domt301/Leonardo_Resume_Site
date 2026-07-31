import type { ReactNode } from 'react';

// Shared panel chrome (spec §11.2): double border + four gold corner ornaments.
export function Panel({
  children,
  className = '',
  onClose,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  labelledBy?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={`rq-panel font-pixel px-5 py-4 text-[#dacfb6] ${className}`}
    >
      <span className="rq-corner-tr" aria-hidden />
      <span className="rq-corner-bl" aria-hidden />
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-1 text-xs text-[#b6a78d] hover:text-[#f2c750]"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}
