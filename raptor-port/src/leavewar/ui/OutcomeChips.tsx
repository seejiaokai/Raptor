/* THE POSTING'S CHOICES, AND THE PARTS EVERY POSTING SHEET IS LAID OUT FROM ([POST-OUT-OUTCOMES], 27 Sep 26; way C, 26 Nov 26).

   Owner D229 (26 Sep 26): a posting out says WHICH it is. D294 (27 Sep): "can use less words and space to have these 4
   options. Change to 'Overseas Sqn', 'Fully delete', 'SANS', 'Transfer to Sqn'"; D298: "Fully delete" reads "Delete".
   D300: each thing said once — the date in its own box, ONE line saying what happens on it, the button just "Post out".
   The same choices on the three doors: the bid sheet's Post out, an existing posting's Post out sheet, the drag
   selection's Post out.

   The agent's calls, on his look card: tapping the chosen chip again un-chooses it — "off the manpower, nothing else"
   (the old switch turned off, and the one way to record a transfer until Transfer is built — KEPT by his "1 keep", D303,
   27 Sep 26).

   "TRANSFER TO SQN" IS LEFT OUT altogether until the Transfer step builds it (his D2659, 26 Nov 26 — "leave it out for
   now"): no greyed chip, no line saying why; it comes back with that step, and with it the "To squadron" box beside
   "PO from" (D2653 h). So an aircrew man has three choices, a ground-crew man two (no SANS — D1709).

   WAY C (his D2648 "so ugly", D2653 — the look he took in round 6; his go for this section, D2732; lesson 105): the sheet
   is the posting's alone — the kind of posting first, the choices equal in one row at a desk and two to a line on a
   phone, then "PO from" (each label over its box, the box half the width), then the line of what happens on a strip one
   step off the sheet, then the one button. The parts below are that layout, shared by the five posting sheets so they
   cannot drift apart; their look is `bidpicker.css`'s `.po-form` (drawn by the batch branch's
   `scripts/handpass/n191/draw-s4.mjs`, pictures `docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s4-*`). */
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import type { PostOutcome } from '../engine'

/* THE KEYS STAY IN THE WINDOW AS IT BECOMES A POSTING (chat 197 — Fable's blind read, K): ⋯ → Post out takes the menu item
   pressed off the screen with the leave's parts, and the keys were left on the page itself, outside the window. As the
   posting opens they go to its first control — the first chip, or Post in's date box (a button, so a phone raises no
   keys) — only when they are not already inside the window. The ref goes on the posting's `.po-form`. */
export function usePostingFocus(posting: string | null) {
  const form = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const f = form.current
    if (!posting || !f) return
    const win = f.closest('[role="dialog"]')
    if (win && win.contains(document.activeElement)) return
    f.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled])')?.focus({ preventScroll: true })
  }, [posting])
  return form
}

const OUTCOME_CHIPS: { v: PostOutcome; l: string }[] = [
  { v: 'overseas', l: 'Overseas Sqn' },
  { v: 'delete', l: 'Delete' },
  { v: 'sans', l: 'SANS' },
]

export function OutcomeChips({ value, onChange, testid, noSans }: {
  value: PostOutcome
  onChange: (o: PostOutcome) => void
  /** a ground-crew man: no SANS chip — SANS is an aircrew status (his D1709, 5 Nov 26) */
  noSans?: boolean
  /** the chips' test-id stem — `${testid}-overseas` … */
  testid: string
}) {
  const chips = OUTCOME_CHIPS.filter(c => !(noSans && c.v === 'sans'))
  return (
    <div className="po-blk po-outcomes" role="group" aria-label="Posting">
      <span className="lab">Posting</span>
      {/* as many equal columns as there are choices at a desk; two to a line on a phone (bidpicker.css) */}
      <div className="po-chips" style={{ '--po-n': String(chips.length) } as CSSProperties}>
        {chips.map(c => {
          const on = value === c.v
          return (
            <button key={c.v} type="button" className={`pchip${on ? ' on' : ''}`} data-testid={`${testid}-${c.v}`}
              aria-pressed={on} onClick={() => onChange(on ? 'none' : c.v)}>
              {on ? '✓ ' : ''}{c.l}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* THE HEAD'S SECOND WORD NAMES THE ACT — "Cinch  Post out" (D2653 f, his D2732 Q2): on every posting sheet, a new one, an
   existing posting's and the drag sheet's alike; the day stands only in the date box, where it can be changed (D1462
   narrowed for this sheet; lesson 105 narrows lesson 65). The same look as the day it replaces (`.dt.when`). */
export const PostAct = ({ act, testid }: { act: 'Post out' | 'Post in'; testid?: string }) => (
  <span className="dt when po-act" data-testid={testid}>{act}</span>
)

/* "PO from" / "PI from" — its label over its box, the box half the sheet's width (the other half is the Transfer step's
   "To squadron", not laid out here — D2659) */
export const PostField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="po-fields"><div className="po-f"><span className="lab">{label}</span>{children}</div></div>
)

/* the one line of what happens on the date, on its strip one step off the sheet */
export const PostLine = ({ testid, children }: { testid?: string; children: ReactNode }) => (
  <div className="po-line" data-testid={testid}>{children}</div>
)

/* the app's amber line — a posting held back (the last admin, D306), a refusal's reason, a locked sheet's reason */
export const PostWarn = ({ testid, children }: { testid: string; children: ReactNode }) => (
  <div className="po-warn"><span className="note warn" data-testid={testid}>{children}</span></div>
)

/* "UNDO POST OUT" — design A (his D2732 Q1, after D2660 asked for it redesigned): the app's plain grey chip, built as
   "Move" is (`.dchip.move`), wearing the top bar's own Undo arrow in teal; "(PO)" / "(PI)" dropped, the box just above
   already saying "PO from"; alone at the sheet's foot, where "Post out" stands on a new posting (D2727 took away the
   button beside it). It deletes nothing, so it never wears Delete's dashed edge. */
export const UndoPosting = ({ testid, label, onClick }: { testid: string; label: 'Undo post out' | 'Undo post in'; onClick: () => void }) => (
  <button type="button" className="dchip move po-undo" data-testid={testid} onClick={onClick}>
    <span className="mvarr" aria-hidden="true">↶</span>{label}
  </button>
)
