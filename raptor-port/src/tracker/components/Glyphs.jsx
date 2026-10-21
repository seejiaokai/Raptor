import React from 'react';

/* THE APP'S LINE ICONS ON THE TRACKER'S BUTTONS (owner D1132, 21 Oct 26 — round 2 of the consistency look): in place of
   the typed marks it came with (✎ ⓘ ☰ ⇪ ⌃ ⌄ and the 🗺 emoji, which an iPhone draws in colour), the same Lucide-style
   line drawings the rest of the app wears (ui/icons.tsx — the pencil is PenIcon's, D919, mirrored by D1133; the list is ListIcon's). The
   Tracker draws its own copies so a standalone export carries them (SrchGlyph.jsx is the first). Sized by `.trkglyph`
   (tracker.css); each is aria-hidden — the button's title or its word names it. The gear keeps the app's own ⚙ (D635). */
const G = ({ children }) => (
  <svg className="trkglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
/* THE APP'S ONE PENCIL (owner D1134, 21 Oct 26 — his solid pencil, tip at the bottom right, D1133): a copy of
   ui/pen.ts PEN_INNER — the Tracker draws its own so a standalone export carries it; tracker.test.tsx keeps the two the
   same. Filled, not a line drawing. `solo` where it is the button's only mark (no gap after it). */
export const PenGlyph = ({ solo = false } = {}) => (
  <svg className={'trkglyph trkpen' + (solo ? ' solo' : '')} viewBox="0 0 24 24" aria-hidden="true">
    <g transform="rotate(-45 12 12)" fill="currentColor">
      <rect x="9" y="1" width="6" height="4.2" rx="1.6" />
      <rect x="9" y="6.3" width="6" height="11.2" rx=".4" />
      <path d="M9 18.7h6l-2.4 3.7a.7.7 0 0 1-1.2 0Z" />
    </g>
  </svg>
);
/* the menus' and Students card's marks (owner D1135, 21 Oct 26 — round 3): Lucide shapes in the bar's line style */
export const ReorderGlyph = () => <G><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></G>;
export const CopyGlyph = () => <G><rect x="8" y="8" width="14" height="14" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></G>;
export const TrashGlyph = () => <G><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></G>;
export const DownloadGlyph = () => <G><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></G>;
export const XGlyph = () => <G><path d="M18 6 6 18" /><path d="m6 6 12 12" /></G>;
export const InfoGlyph = () => <G><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></G>;
export const ListGlyph = () => <G><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></G>;
export const UploadGlyph = () => <G><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></G>;
export const UpGlyph = () => <G><path d="m18 15-6-6-6 6" /></G>;
export const DownGlyph = () => <G><path d="m6 9 6 6 6-6" /></G>;
export const MapGlyph = () => <G><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" /></G>;
