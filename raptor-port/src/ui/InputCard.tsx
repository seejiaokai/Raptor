/* THE INPUT CARD — one body for the Inputs calendar's opened day and for the Inputs list on a phone (owner D718–D724,
   10 Oct 26 — `[INPUT-LIST-AS-DAY-CARD]`; the plan docs/superpowers/plans/2026-10-10-input-card-plan.md §2.1; the
   pictures of record docs/mock/img/input-card-final/day-final.png, list-final.png). What it says is worked out by the
   pure `inputcard-model.ts`; this draws it.

     THE TOP LINE   the colour square · who · the KIND in small grey capitals · LATE · the hours.
     THE WORDS      the title at the left on a row of its own (D722), a remark after it in grey — both at the card's
                    full width, wrapping, never cut by what stands at the right (D719); "By Saber" at the row's right
                    end (D720, D723, D724), under the words where the two do not fit.
     NOTHING MORE   a card with no title, no remark and no "By" is ONE line.

   HOW THE NAMES WRAP (D721 — "Instead of doing a +1 hiding the info … Like wrap text"): the LATE-and-hours corner
   FLOATS at the right of the first line and the names are plain inline text beside it, so a shared input's names run
   on under the corner at the card's full width. That is why the corner is first in the markup, and why the card's
   button is a span with a button's role, not a <button>: a real button is laid out as a box, and a box that does not
   fit beside the corner drops whole to the next line — the names would start under the hours.

   The card's BUTTON is its names (what a keyboard and a screen reader meet — its label says the card whole); a press
   anywhere else on the card opens the input too. LATE is its own button: pressed, it says the cut-off that was missed
   (D646) and does not open the input. Anything the screen adds under the card (the day's "Delete this input?") comes
   as `children`. */
import { useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import type { CardFacts } from './inputcard-model'

export function InputCard({ id, facts, when, late, tid, row, onOpen, onKey, flash, children }: {
  /** the entry's address — its first record's id */
  id: string
  facts: CardFacts
  /** its hours, as the corner says them (inputcard-model.ts cardWhen) */
  when: string
  /** the LATE tag's note; '' where it is not late (inputcard-model.ts lateNoteOf) */
  late: string
  /** the prefix of its test ids — 'idy' on the opened day, 'inl' on the list */
  tid: string
  /** it is the Inputs list's row for this input: it carries `data-iid`, by which the page finds a just-saved input to
   *  bring it on screen (ui/InputsPage.tsx). The opened day's card does not — the list stays mounted under the calendar,
   *  and two elements answering to one id would send that look-up to the wrong one. */
  row?: boolean
  onOpen: () => void
  /** a key on the card's button that is not Enter or Space — the day's Delete */
  onKey?: (e: ReactKeyboardEvent) => void
  /** just saved: the list's flash */
  flash?: boolean
  children?: ReactNode
}) {
  const [lateOpen, setLateOpen] = useState(false)
  const { names, kind, title, remark, by, tone } = facts
  const label = [names, title, kind, when].filter(Boolean).join(', ') + (late ? ', late' : '') + (by ? `, placed by ${by}` : '')
  return (
    <div className={'icard ' + tone + (flash ? ' innew' : '')} data-popiid={id} data-iid={row ? id : undefined} data-testid={`${tid}-row-${id}`}
      onClick={ev => { if (!(ev.target as HTMLElement).closest('button')) onOpen() }}>
      <div className="icard-top">
        <span className="icard-corner">
          {late && <button type="button" className="sd-late" data-testid={`${tid}-late`} aria-expanded={lateOpen} title={late}
            onClick={() => setLateOpen(o => !o)}>LATE</button>}
          <span className="icard-hrs" data-testid={`${tid}-when`}>{when}</span>
        </span>
        <span className="icard-open" role="button" tabIndex={0} data-testid={`${tid}-open`} aria-label={label}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); return }
            if (onKey) onKey(e)
          }}>
          <span className="icard-sq" aria-hidden="true" />
          <b className="icard-who" data-testid={`${tid}-who`}>{names}</b>
        </span>
        <span className="icard-kind" data-testid={`${tid}-kind`}>{kind}</span>
      </div>
      {late && lateOpen && <div className="sd-latenote icard-latenote" data-testid={`${tid}-latenote`} role="status">{late}</div>}
      {(title || remark || by) && (
        <div className="icard-words">
          {(title || remark) && (
            <span className="icard-text">
              {title && <b className="icard-title" data-testid={`${tid}-title`}>{title}</b>}
              {title && remark && <span className="icard-rmk" aria-hidden="true"> · </span>}
              {remark && <span className="icard-rmk" data-testid={`${tid}-rmk`}>{remark}</span>}
            </span>
          )}
          {by && <span className="icard-by" data-testid={`${tid}-by`}>By {by}</span>}
        </div>
      )}
      {children}
    </div>
  )
}
