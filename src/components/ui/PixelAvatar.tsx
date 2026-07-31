// Tiny original pixel-art portrait drawn as inline SVG rects — no image asset.
// Matches the in-world character: black polo, glasses, goatee, brown hair.
export default function PixelAvatar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`pixelated ${className}`} role="img" aria-label="Pixel portrait">
      <rect width="16" height="16" fill="#1e1a30" />
      {/* hair */}
      <rect x="4" y="2" width="8" height="3" fill="#3a2717" />
      <rect x="3" y="3" width="2" height="3" fill="#3a2717" />
      <rect x="11" y="3" width="2" height="3" fill="#3a2717" />
      {/* face */}
      <rect x="5" y="4" width="6" height="6" fill="#d29c69" />
      {/* glasses */}
      <rect x="5" y="6" width="2" height="2" fill="#161925" />
      <rect x="9" y="6" width="2" height="2" fill="#161925" />
      <rect x="7" y="6" width="2" height="1" fill="#161925" />
      <rect x="5.5" y="6.5" width="1" height="1" fill="#dacfb6" />
      <rect x="9.5" y="6.5" width="1" height="1" fill="#dacfb6" />
      {/* goatee */}
      <rect x="6" y="9" width="4" height="2" fill="#241811" />
      <rect x="7" y="9" width="2" height="1" fill="#ae7546" />
      {/* black polo */}
      <rect x="4" y="11" width="8" height="5" fill="#161925" />
      <rect x="6" y="11" width="4" height="1" fill="#0b0d13" />
      <rect x="7.5" y="12" width="1" height="2" fill="#363c53" />
    </svg>
  );
}
