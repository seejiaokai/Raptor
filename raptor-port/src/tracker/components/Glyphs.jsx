import React from 'react';

/* THE APP'S LINE ICONS ON THE TRACKER'S BUTTONS (owner D1132, 21 Oct 26 — round 2 of the consistency look): in place of
   the typed marks it came with (✎ ⓘ ☰ ⇪ ⌃ ⌄ and the 🗺 emoji, which an iPhone draws in colour), the same Lucide-style
   line drawings the rest of the app wears (ui/icons.tsx — the pencil is PenIcon's, D919; the list is ListIcon's). The
   Tracker draws its own copies so a standalone export carries them (SrchGlyph.jsx is the first). Sized by `.trkglyph`
   (tracker.css); each is aria-hidden — the button's title or its word names it. The gear keeps the app's own ⚙ (D635). */
const G = ({ children }) => (
  <svg className="trkglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const PenGlyph = () => <G><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></G>;
export const InfoGlyph = () => <G><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></G>;
export const ListGlyph = () => <G><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></G>;
export const UploadGlyph = () => <G><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></G>;
export const UpGlyph = () => <G><path d="m18 15-6-6-6 6" /></G>;
export const DownGlyph = () => <G><path d="m6 9 6 6 6-6" /></G>;
export const MapGlyph = () => <G><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" /></G>;
