import { profile } from '../../content/profile';

/** Lightweight loading cover shown while the 3D bundle/scene loads (spec §10.5). */
export default function LoadingScreen({ progress = 0 }: { progress?: number }) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07060d]"
      role="status"
      aria-label="Loading the interactive island"
    >
      <svg viewBox="0 0 16 16" className="pixelated mb-4 h-12 w-12" aria-hidden>
        <rect x="2" y="9" width="12" height="4" fill="#357544" />
        <rect x="3" y="13" width="10" height="1" fill="#48311f" />
        <rect x="6" y="5" width="1" height="4" fill="#6e4c2e" />
        <rect x="4" y="3" width="5" height="3" fill="#3d9247" />
        <rect x="10" y="7" width="3" height="2" fill="#956a3f" />
      </svg>
      <h1 className="font-pixel text-lg text-[#f6efdd]">{profile.name.toUpperCase()}</h1>
      <p className="font-pixel mt-1 text-[10px] uppercase tracking-widest text-[#b6a78d]">
        {profile.tagline}
      </p>
      <div className="mt-5 h-3 w-48 border border-[#242838] bg-[#131022] p-[2px]">
        <div
          className="h-full bg-gradient-to-r from-[#54a253] to-[#7ec85f] transition-[width]"
          style={{ width: `${Math.max(5, Math.round(progress))}%` }}
        />
      </div>
    </div>
  );
}
