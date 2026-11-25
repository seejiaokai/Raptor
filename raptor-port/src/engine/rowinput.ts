/* ONE MAN'S ROW FOLLOWS HIM TO THE INPUT OF HIS OWN (chat 170's night walk, W3 — 25 Nov 26; fixed by chat 177, pinned
   in leavewar/sharedrow-follows.test.ts; moved here from ui/inputedit.tsx by chat 178, so the engine's own question
   "does an armed row still exist" — slots.ts armTargetExists — can ask it too). Each door is handed the input its row or
   window ADDRESSES — the box's `iu:<iid>~<person>` on the Board's Unavailable list (ui/board.ts) and the week
   (ui/textedit.ts), the buttons on the same row (ui/interactions.ts: the type label, Reject, the LATE chip — each names
   its man in `data-iuw`, ui/html.ts iuWhoAtt), his puck as a drop or plant target (ui/inputedit.tsx reassignInput), the
   leave a Leave War remark window was opened on (leavewar/ui/ReqWords.tsx). The first change gives him an input of his
   own, a NEW record; the row under the caret is held back from repainting and the window keeps what it was handed, so
   the next change came back with the SHARED input's address — which no longer holds him — and was saved onto it whole:
   onto the OTHERS' leave (Ranger's end 11:00 saved as Hex's, Ranger left at 10:00). So every cut-out is remembered
   here, the shared input's id and the man's against the id of his own, and a door asks `rowInputOf` for the input his
   row stands for now: the one it addresses while he is still in it; else the one cut out for him, followed as far as it
   was cut again; else none — and a door with none saves NOTHING, never the others' input. Only a pointer, checked
   against the records each time, so an Undo that puts him back in the shared input is followed by itself, and a stale
   one finds nothing; it lives for the page's life and is not saved — a reload repaints every row with its own
   address. */
import { INPUTS, holds } from './inputs'

const OWN_OF = new Map<string, string>()
/** A change on one man's row cut an input of his own out of a shared one: remember where he went (ui/inputedit.tsx ownPartSave). */
export function noteOwnOf(sharedIid: any, who: any, ownIid: any): void {
  if (sharedIid && ownIid && who != null && who !== '' && String(sharedIid) !== String(ownIid)) OWN_OF.set(`${sharedIid}~${who}`, String(ownIid))
}
/** The input one man's row stands for NOW; the input itself where the row names no man. */
export function rowInputOf(inp: any, who?: any): any {
  if (!inp || who == null || who === '') return inp
  let cur: any = inp
  for (let hop = 0; cur && hop < 8; hop++) {
    if (holds(cur, who)) return cur
    const next = cur.iid ? OWN_OF.get(`${cur.iid}~${who}`) : undefined
    cur = next ? (INPUTS as any[]).find((r: any) => r.iid === next) || null : null
  }
  return null
}
