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
import { INPUTS, holds, facesOf, iuTail } from './inputs'
import { iuParts } from './keys'

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

/* A MAN CUT OUT KEEPS HIS ROW WHERE IT STOOD (the shared-row walk, 25 Nov 26 — walker A's A7(e); the code reads' first
   finding, Astra 1 and the fresh Opus reader's F1; red first in ui/sharedrow-walkfinds.test.tsx). The Unavailable list
   draws a row a man, record by record, so a record of one man cannot stand BETWEEN two men who still share another:
   wherever it is put in the list, a neighbour's row slides into the place his row stood in — under the pointer of
   whoever is about to press there. Nothing on the board re-orders itself (owner, 10 Aug 26; D735). So every cut-out
   (inputown.ts ownInputOf) is remembered here as ONE ORDER A FAMILY: the input the first cut was made from, the men of
   it top to bottom as their rows stood, and every input cut out of it since — or out of one of those, a man put into
   it later standing straight under the man above him. The ONE answer to "the Unavailable list's rows, top to bottom" —
   unavailFaces, asked by the week (ui/html.ts) and the Board (ui/board-html.ts) — draws each such input's rows back
   among the first input's, by that order, while the first input is on the same list. (The first version kept each
   cut-out's two neighbours instead, and only for a man from the middle: a man cut out AGAIN from his own input, drawn
   between two others, dropped under everyone.) The first and the last man of an input are also SAVED on the right
   side of it (ownInputOf), so a reload keeps them. Only a pointer, as OWN_OF above is: read against the records each
   time, it lives for the page's life and is not saved — after a reload a man from the middle stands under the others,
   with nothing under a finger to move. */
const RIDES = new Map<string, string>()      // an input cut out -> the first input of its family, whose rows it stands among
const FAMILY = new Map<string, string[]>()   // that first input -> its men, top to bottom, as their rows stood
/** A man is being cut out of `inputIid` into `ownIid`: remember where the rows stood. `drawn` — the input's people in
 *  the order its rows are drawn, the man among them (inputown.ts ownInputOf). */
export function noteRowCut(inputIid: any, ownIid: any, drawn: any[]): void {
  if (!inputIid || !ownIid || String(inputIid) === String(ownIid)) return
  const first = RIDES.get(String(inputIid)) || String(inputIid)
  const ids = (drawn || []).map(String), fam = (FAMILY.get(first) || []).slice()
  /* a man the order does not hold yet (the family's first cut; or put into this input since): straight under the man above him */
  ids.forEach((p, i) => {
    // eslint-disable-next-line react-doctor/js-set-map-lookups -- the men of one input, a handful, in an order that is spliced as the loop goes: a Set could not say where a man stands
    if (fam.includes(p)) return
    const above = i > 0 ? fam.indexOf(ids[i - 1]) : -1
    const below = ids.slice(i + 1).map(q => fam.indexOf(q)).find(x => x >= 0)
    if (above >= 0) fam.splice(above + 1, 0, p); else if (below != null) fam.splice(below, 0, p); else fam.push(p)
  })
  FAMILY.set(first, fam); RIDES.set(String(ownIid), first)
}
/** One man replaced by another in his place (inputown.ts swapPerson): the newcomer's row is the row he took. */
export function noteRowSwap(inputIid: any, from: any, to: any): void {
  const fam = FAMILY.get(RIDES.get(String(inputIid)) || String(inputIid))
  if (!fam) return
  const at = fam.indexOf(String(from)); if (at < 0) return
  const was = fam.indexOf(String(to)); if (was >= 0) fam.splice(was, 1)
  fam.splice(fam.indexOf(String(from)), 1, String(to))
}
/** The Unavailable list's rows — a face a man (inputs.ts facesOf) — in the order they stand, for the records handed in
 *  (already the day's, already the listed ones): the records in their order and each one's people in theirs, an input
 *  cut out of another drawn among that other's rows, where its man stood, while that other is on the same list. */
export function unavailFaces(recs: any[]): any[] {
  const list = (recs || []).filter(Boolean)
  const plain = () => list.flatMap((r: any) => facesOf(r))
  if (!RIDES.size) return plain()
  const ids = new Set<string>(list.filter((r: any) => r.iid).map((r: any) => String(r.iid)))
  const firstOf = (r: any): string | undefined => { const t = r.iid ? RIDES.get(String(r.iid)) : undefined; return t && t !== String(r.iid) && ids.has(t) ? t : undefined }
  const riders = new Map<string, any[]>()
  for (const r of list) { const t = firstOf(r); if (t) riders.set(t, [...(riders.get(t) || []), r]) }
  if (!riders.size) return plain()
  const out: any[] = []
  for (const r of list) {
    if (firstOf(r)) continue
    const mine = riders.get(String(r.iid))
    if (!mine) { out.push(...facesOf(r)); continue }
    const fam = FAMILY.get(String(r.iid)) || []
    /* each face's place in the family's order; a man it does not hold stands straight under the man above him in his
       own input (or, the first of his input, straight above the next one it does hold) */
    const placed = (rec: any): { f: any; k: number }[] => {
      const fs = facesOf(rec), at = fs.map((f: any) => fam.indexOf(String(f.person)))
      return fs.map((f: any, i: number) => {
        if (at[i] >= 0) return { f, k: at[i] * 4096 }
        let j = i - 1; while (j >= 0 && at[j] < 0) j--
        if (j >= 0) return { f, k: at[j] * 4096 + (i - j) }
        j = i + 1; while (j < fs.length && at[j] < 0) j++
        return { f, k: j < fs.length ? at[j] * 4096 - (j - i) : Number.MAX_SAFE_INTEGER }
      })
    }
    /* the first input's own rows stay in ITS order; each cut-out's rows go in before the first row that stands below them */
    const block = placed(r)
    for (const x of mine.flatMap(placed).sort((a, b) => a.k - b.k)) {
      const i = block.findIndex(y => y.k > x.k)
      if (i >= 0) block.splice(i, 0, x); else block.push(x)
    }
    out.push(...block.map(x => x.f))
  }
  return out
}

/* A ROW'S ADDRESS AS IT STANDS NOW (the code reads' second finding — the fresh Opus and Fable readers, 25 Nov 26; red
   first in ui/sharedrow-buttons.test.tsx S7b). An armed puck's key is the address its row had when it was tapped —
   `iu:<shared>~<man>` on a held row — and the row repaints with his own input's address once the caret leaves. Every
   reader that asks "is this the armed row" (the ring: ui/highlights.ts; a second tap putting it down: state/view.ts
   armSlot; a drop on it: ui/drag.ts) compares the two through this, never letter for letter: the address of the input
   the row stands for now, his name after it only where that input holds several. A key of any other kind, or one whose
   man cannot be found, comes back as it was. */
export function rowKeyNow(key: any): string {
  const p = typeof key === 'string' && key.indexOf('iu:') === 0 ? iuParts(key) : null
  if (!p || !p.person) return String(key ?? '')
  const r = rowInputOf((INPUTS as any[]).find((x: any) => x.iid === p.iid) || null, p.person)
  return r ? 'iu:' + iuTail({ iid: r.iid, person: p.person, several: facesOf(r).length > 1 }) : String(key)
}
