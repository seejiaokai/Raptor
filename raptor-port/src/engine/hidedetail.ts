/* WHAT ONE ✕ / ↺ ON A WARNING DID, AS ITS COMMAND CARRIES IT ([WARN-HIDE-KEPT], owner D469, 1 Oct 26). The command's
   `detail` — the fact a command hands the change stream (command/commit.ts, the same channel a text box's key rides) —
   says: hidden or flagged again, which day, and the warning in WORDS. The change history's line (state/changelines.ts)
   and Undo's label (undo/describe.ts) read this, never the stored key, which holds ids, not callsigns.
   No imports — the undo layer and the change lines load it without loading the engine. */
export function hideDetail(hidden: boolean, di: any, words: string): string { return `hide:${hidden ? 1 : 0}:${+di}:${words}` }
export function parseHideDetail(detail: any): { hidden: boolean, di: number, words: string } | null {
  const m = /^hide:([01]):(\d+):([\s\S]*)$/.exec(String(detail || ''))
  return m ? { hidden: m[1] === '1', di: +m[2]!, words: m[3]! } : null
}
