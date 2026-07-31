// Tiny original pixel-art portrait drawn as inline SVG rects — no image asset.
export default function PixelAvatar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`pixelated ${className}`} role="img" aria-label="Pixel portrait">
      <rect width="16" height="16" fill="#1e1a30" />
      {/* hair */}
      <rect x="4" y="2" width="8" height="3" fill="#3a2717" />
      <rect x="3" y="3" width="2" height="4" fill="#3a2717" />
      <rect x="11" y="3" width="2" height="4" fill="#3a2717" />
      {/* face */}
      <rect x="5" y="4" width="6" height="6" fill="#d29c69" />
      <rect x="6" y="6" width="1" height="1" fill="#241811" />
      <rect x="9" y="6" width="1" height="1" fill="#241811" />
      <rect x="7" y="8" width="2" height="1" fill="#ae7546" />
      {/* tunic */}
      <rect x="4" y="10" width="8" height="6" fill="#176272" />
      <rect x="6" y="10" width="4" height="1" fill="#2593a6" />
      {/* gold trim */}
      <rect x="4" y="12" width="8" height="1" fill="#a36f1b" />
    </svg>
  );
}
