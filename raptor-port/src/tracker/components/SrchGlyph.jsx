import React from 'react';

/* the app's line magnifier (ui/icons.tsx SrchIcon, the same drawing) — every Tracker search box wears it (owner D1127,
   21 Oct 26: one search box, everywhere); the Tracker draws its own glyphs */
export function SrchGlyph() {
  return (
    <svg className="srchglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
