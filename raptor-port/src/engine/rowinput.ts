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
import { INPUTS, holds, facesOf } from './inputs'

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

/* A MAN CUT OUT OF THE MIDDLE KEEPS HIS ROW BETWEEN THE OTHERS (the shared-row walk, 25 Nov 26 — walker A's A7(e); red
   first in ui/sharedrow-walkfinds.test.tsx). The Unavailable list draws a row a man, record by record, so a record of
   one man cannot stand BETWEEN two men who still share another: wherever it is put in the list, a neighbour's row
   slides into the place his row stood in — under the pointer of whoever is about to press there. Nothing on the board
   re-orders itself (owner, 10 Aug 26; D735). So the cut-out (inputown.ts ownInputOf) remembers the two men he stood
   between, and the ONE answer to "the Unavailable list's rows, top to bottom" — unavailFaces, asked by the week
   (ui/html.ts) and the Board (ui/board-html.ts) — draws his own input's row back between them. The first and the last
   man need none of this: their own input is SAVED on the right side of the shared one. Only a pointer, as OWN_OF above
   is: checked against the records each time, it lives for the page's life and is not saved — after a reload the middle
   man's row stands under the others', with nothing under a finger to move. */
const SLOT = new Map<string, { shared: string; prev: string; next: string; n: number }>()
let SLOT_N = 0
/** A man was cut out from between two others: remember where his row stood (inputown.ts ownInputOf). */
export function noteRowSlot(ownIid: any, sharedIid: any, prev: any, next: any): void {
  if (ownIid && sharedIid && String(ownIid) !== String(sharedIid)) SLOT.set(String(ownIid), { shared: String(sharedIid), prev: String(prev), next: String(next), n: ++SLOT_N })
}
/** The Unavailable list's rows — a face a man (inputs.ts facesOf) — in the order they stand, for the records handed in
 *  (already the day's, already the listed ones). The records in their order and each one's people in theirs; an input
 *  cut out from between two men of another is drawn between them still, while that other is on the same list. */
export function unavailFaces(recs: any[]): any[] {
  const list = (recs || []).filter(Boolean)
  if (!SLOT.size) return list.flatMap((r: any) => facesOf(r))
  const byId = new Map<string, any>(list.filter((r: any) => r.iid).map((r: any) => [String(r.iid), r] as [string, any]))
  const slotOf = (r: any) => { const s = r.iid ? SLOT.get(String(r.iid)) : undefined; return s && byId.has(s.shared) ? s : undefined }
  /* who rides in whose block: never in the block of a record that is itself riding (it is drawn where the list has it) */
  const riders = new Map<string, any[]>()
  for (const r of list) { const s = slotOf(r); if (s && !slotOf(byId.get(s.shared))) riders.set(s.shared, [...(riders.get(s.shared) || []), r]) }
  if (!riders.size) return list.flatMap((r: any) => facesOf(r))
  const riding = new Set<any>([...riders.values()].flat())
  const out: any[] = []
  for (const r of list) {
    if (riding.has(r)) continue
    const block = facesOf(r), lost: any[] = []
    /* the latest cut first: an earlier one may have stood beside a man who was cut out after him */
    const mine = (riders.get(String(r.iid)) || []).slice().sort((a: any, b: any) => SLOT.get(String(b.iid))!.n - SLOT.get(String(a.iid))!.n)
    for (const o of mine) {
      const s = SLOT.get(String(o.iid))!
      const nx = block.findIndex((f: any) => String(f.person) === s.next), pv = block.findIndex((f: any) => String(f.person) === s.prev)
      if (nx >= 0) block.splice(nx, 0, ...facesOf(o))
      else if (pv >= 0) block.splice(pv + 1, 0, ...facesOf(o))
      else lost.push(o)                         // neither neighbour is on the list any more: straight after the block
    }
    out.push(...block, ...lost.flatMap((o: any) => facesOf(o)))
  }
  return out
}
