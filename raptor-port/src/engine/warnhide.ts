/* A HIDDEN WARNING — the one key and the one count ([WARN-HIDE-KEPT], owner D469 / D471 / D472 / D475, 1 Oct 26).
   "It can be hidden until another person unhides it, but if it's hidden, the pucks shouldn't have flagging for that
   specific item … it should just show a strike out and it's darker." · "If there are 3 issues initially and a scheduler
   clicks 1 to hide it should just show 2 issues."

   A hide is tied to ONE warning, by what it says: the day, the rule, the men it names and its words. The moment the
   situation changes the validator writes a different warning, the key no longer matches and it shows again by itself
   (owner, Aug 26 — "if things change that warning will appear again").

   A RENAME IS NOT THE SITUATION CHANGING (a callsign is a label — 14 Sep 26): the words are keyed with each NAMED man's
   callsign folded to his id (publish.ts warnMsgKey, the same fold the published-day comparison uses), so renaming a man
   never brings his hidden warning back — least of all on a published face, where nothing may move without an amendment
   (D45). A callsign in the words that belongs to a man the warning does not name is not folded: renaming HIM changes the
   words, and the warning returns.

   The key LEADS WITH THE DAY — state/weekrows.ts files each hide in its day's row by that lead. */
import { PEOPLE } from './people'
import { warnMsgKey } from './publish'

export function hideKey(w:any):string{
  const who=((w&&w.who)||[]) as any[], cs:any={};
  who.forEach((id:any)=>{ const p=(PEOPLE as any)[id]; if(p&&p.cs)cs[id]=p.cs; });
  return `${w.di}|${w.code}|${who.join(',')}|${warnMsgKey(w.msg,cs)}`;}

/* what one ✕ / ↺ did, as its command carries it — engine/hidedetail.ts (no imports, so the undo layer can read it) */
export { hideDetail, parseHideDetail } from './hidedetail'

/* THE WARNINGS A DAY COUNTS (D472 — "it should just show 2 issues"): every count of issues, every "worst colour" and
   every reader that works a flag out from the list reads this, never the raw list. A hidden warning stays IN the list
   (same place, same index — a tap on its line still finds it), carrying `off`. */
export function shownWarns(warns:any):any[]{ return ((warns||[]) as any[]).filter((w:any)=>w&&!w.off); }
