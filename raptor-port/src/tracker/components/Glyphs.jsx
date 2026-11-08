import React from 'react';
import { GearIcon, ListIcon, PenIcon, ReorderIcon, ResetIcon } from '../../ui/icons';

/* THE APP'S LINE ICONS ON THE TRACKER'S BUTTONS (owner D1132, 21 Oct 26 — round 2 of the consistency look): in place of
   the typed marks it came with (✎ ⓘ ☰ ⇪ ⌃ ⌄ and the 🗺 emoji, which an iPhone draws in colour), the same Lucide-style
   line drawings the rest of the app wears (ui/icons.tsx — the pencil is PenIcon's, D919, mirrored by D1133; the list is ListIcon's).
   The marks the rest of the app draws too — the pencil, Reorder, the gear, Reset and the list — are the app's own icons,
   given the Tracker's class ([TRK-KEPT-COPIES], 8 Nov 26: the copies it kept for a standalone export went with D1538);
   the marks only the Tracker wears are drawn here. Sized by `.trkglyph`
   (tracker.css); each is aria-hidden — the button's title or its word names it. The gear is the app's one drawn gear since
   D1509 / D1707 (it kept the typed ⚙ under D635 until round 4) — GearGlyph, below. */
const G = ({ children }) => (
  <svg className="trkglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
/* THE APP'S ONE PENCIL (owner D1134, 21 Oct 26 — his solid pencil, tip at the bottom right, D1133): ui/icons.tsx PenIcon
   itself, drawn from ui/pen.ts PEN_INNER. Filled, not a line drawing. `solo` where it is the button's only mark (no gap
   after it). */
export const PenGlyph = ({ solo = false } = {}) => <PenIcon solo={solo} className="trkglyph trkpen" />;
/* the menus' and Students card's marks (owner D1135, 21 Oct 26 — round 3): Lucide shapes in the bar's line style */
export const ReorderGlyph = () => <ReorderIcon className="trkglyph" />;
export const CopyGlyph = () => <G><rect x="8" y="8" width="14" height="14" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></G>;
export const TrashGlyph = () => <G><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></G>;
export const DownloadGlyph = () => <G><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></G>;
export const XGlyph = () => <G><path d="M18 6 6 18" /><path d="m6 6 12 12" /></G>;
export const InfoGlyph = () => <G><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></G>;
export const ListGlyph = () => <ListIcon className="trkglyph" />;
export const UploadGlyph = () => <G><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></G>;
export const UpGlyph = () => <G><path d="m18 15-6-6-6 6" /></G>;
export const DownGlyph = () => <G><path d="m6 9 6 6 6-6" /></G>;
export const MapGlyph = () => <G><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" /></G>;
/* ROUND 4 OF THE CONSISTENCY LOOK (owner D1705, D1707, 5 Nov 26 — "all as recommended"; the drawings and their shapes:
   scripts/handpass/cr4-look.mjs ICON). The flex settings' gear — the app's one gear itself (ui/icons.tsx GearIcon, drawn from
   ui/glyphs.ts GEAR_INNER) — and Edit chart layout's tools, each a mark in this line style in place of its typed one (✋ ▣ → ╱ ❐ ➤
   ⤢ ↺ 📋 — some an iPhone draws as coloured emoji). Copy, Delete, the list and ✕ are the marks above; Merge and Unmerge are
   their words alone (a ✕ or a hop would read as Close or another tool). Reset is the app's arrow turning back
   (ui/icons.tsx ResetIcon, drawn from ui/glyphs.ts RESET_INNER — History's arrow without its clock: "put back"). */
export const GearGlyph = () => <GearIcon className="trkglyph" />;
/** Move — a hand */
export const HandGlyph = () => <G><path d="M18 11V6a2 2 0 0 0-4 0" /><path d="M14 10V4a2 2 0 0 0-4 0v2" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15" /></G>;
/** Select — a dashed box */
export const SelectGlyph = () => <G><path d="M5 3a2 2 0 0 0-2 2M19 3a2 2 0 0 1 2 2M21 19a2 2 0 0 1-2 2M5 21a2 2 0 0 1-2-2M9 3h1M9 21h1M14 3h1M14 21h1M3 9v1M21 9v1M3 14v1M21 14v1" /></G>;
/** Select all — the dashed box with a tick (not Select's box again) */
export const SelectAllGlyph = () => <G><path d="M5 3a2 2 0 0 0-2 2M19 3a2 2 0 0 1 2 2M21 19a2 2 0 0 1-2 2M5 21a2 2 0 0 1-2-2M9 3h1M9 21h1M14 3h1M14 21h1M3 9v1M21 9v1M3 14v1M21 14v1" /><path d="m8 12 3 3 5-6" /></G>;
/** Connect — two points joined (not an arrow beside Arrow) */
export const ConnectGlyph = () => <G><circle cx="5" cy="12" r="2.5" /><circle cx="19" cy="12" r="2.5" /><path d="M7.5 12h9" /></G>;
/** Line — a line */
export const LineGlyph = () => <G><path d="M5 19 19 5" /></G>;
/** Edit lines — a curve between two points */
export const EditLinesGlyph = () => <G><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><path d="M5 17A12 12 0 0 1 17 5" /></G>;
/** Arrow — a line with a head */
export const ArrowHeadGlyph = () => <G><path d="M5 19 19 5" /><path d="M10 5h9v9" /></G>;
/** Fit — four corners */
export const FitGlyph = () => <G><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /></G>;
/** Reset layout — an arrow turning back */
export const ResetGlyph = () => <ResetIcon className="trkglyph" />;
