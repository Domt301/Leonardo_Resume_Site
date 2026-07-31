import { useEffect, useState } from 'react';

// Location title card (spec §11.4). Slides in from the left, holds ~1.6s, fades.
// The highest-value legibility device: "oh, this is his AWS job" in two seconds.

export interface CardData {
  name: string;
  subtitle: string;
  key: number;
}

export default function TitleCard({ card, reducedMotion }: { card: CardData | null; reducedMotion: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!card) return;
    setVisible(true);
    const hold = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(hold);
  }, [card]);

  if (!card) return null;

  return (
    <div
      className="font-pixel pointer-events-none fixed left-8 top-1/3 z-30"
      style={{
        transition: reducedMotion ? 'none' : 'opacity 400ms ease, transform 250ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-24px)',
      }}
    >
      <h1
        className="text-3xl text-[#f6efdd]"
        style={{ textShadow: '2px 2px 0 #07060d' }}
      >
        {card.name.toUpperCase()}
      </h1>
      {card.subtitle && <p className="mt-1 text-sm italic text-[#d49d2b]">{card.subtitle}</p>}
    </div>
  );
}
