/* A TYPED BOX OF A REQUEST'S ROW GOES TO THE REQUEST — owner D739, D740 (10 Oct 26): "The scheduler changes the input
   entirely from the original on the schedule" — and, asked what the Inputs calendar shows after 14:30 is typed on the
   schedule, "14:30 - the input changes"; for a one-man request's row, "Yes - same rule". The plan:
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.4.

   Until this, the name, the two times and the remark of a request's row on the Ground Programme were the scheduler's
   own layer over the request: typing there changed the ROW, the request and the Inputs calendar kept what was filed,
   and the member's next edit wrote over the scheduler's words (`[REQ-ROW-OWN-BOXES]`). They are the request's now.

   ONE DOOR, ASKED FIRST by every writer of a typed box, before it reaches the text funnel (engine/slots.ts txtSet):
   the week's focus-out (ui/textedit.ts), the board's change (ui/board.ts), the store's text writer (state/store.ts
   writeText, through HOOKS — state/ may not import ui/) and the developer's probe bridge. It gives one of THREE
   answers:
     'none'    — not a request's box: the caller writes it exactly as before;
     'saved'   — the request was changed (one input command: one Undo step, one line in the change history in the
                 scheduler's name, what was filed in its "from"); the row is re-made from it by the rule that exists
                 (engine/overlay.ts — its id, its place, its people, CX, red box and information-only kept: D468, D46);
     'refused' — nothing was saved: an unreadable time, a save the input's own rules refused, or a box left exactly as
                 it reads. The caller heals the box and NEVER falls through to the funnel — which would refuse it
                 anyway (the belt in txtSet).
   WHOSE a box is, is the engine's one answer (overlay.ts requestOfBox), shared with that belt.

   The two times and the remark go through the body the Personal Inputs boxes have used since 10 Aug 26 (setInpField),
   with its manners (reading R2, told to him): a time typed alone fills the other end, a time CLEARED makes the request
   all day. The name becomes the input's own title, in the letters typed (reading R1) — through the one normaliser, so
   the kind's own name typed there is no title. Each is a save made from a row on the schedule: it never moves the late
   date (D741) and keeps a Yes to the OIL question at what the new hours give, with no question (D739 reading 4). */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { titleOf } from '../engine/inputs'
import { requestOfBox } from '../engine/overlay'
import { parseHM, hhmm, hmOK } from '../engine/time'
import { setInpField, setInpTitle } from './inputedit'

export type ReqRowAnswer = 'none' | 'saved' | 'refused'

const BOX = /^gr:(\d+)\.(\d+)\.(prog|str|end|rmks)$/
/* as the funnel folds a typed value (txtSet): inner runs of white space are one space, the empty-field dash is nothing */
const fold = (v: any) => { const s = String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); return s === '—' ? '' : s }
/* a clock read the one way, so 0745 typed over 07:45 is the box left as it reads */
const clock = (v: string) => (v && hmOK(v) ? hhmm(parseHM(v) as number) : v)

export function reqRowText(path: any, text: any): ReqRowAnswer {
  const m = BOX.exec(String(path))
  if (!m) return 'none'
  const d: any = DAYS[+m[1]!]
  const row: any = d && (d.ground || [])[+m[2]!]
  const inp = requestOfBox(d, row)
  if (!inp) return 'none'
  const field = m[3] as 'prog' | 'str' | 'end' | 'rmks'
  const v = fold(text), shown = fold(row[field])
  if (field === 'str' || field === 'end') {
    if (clock(v) === clock(shown)) return 'refused'
    return setInpField(inp, field, v) ? 'saved' : 'refused'
  }
  if (v === shown) return 'refused'
  if (field === 'rmks') return setInpField(inp, 'rmks', v) ? 'saved' : 'refused'
  /* a name that leaves the input named as it is (the kind's own name typed in another case) is no change */
  if (titleOf(inp.type, v) === titleOf(inp.type, inp.title)) return 'refused'
  return setInpTitle(inp, v) ? 'saved' : 'refused'
}

HOOKS.reqRowText = reqRowText
