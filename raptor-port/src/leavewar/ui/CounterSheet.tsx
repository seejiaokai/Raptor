// Choosing — and ordering — what the frozen column shows.
//
// The column header used to carry two 13px arrows, and the owner's verdict
// from a phone was that they are too small to hit. They were: a glyph inside
// a 44px column is not a tap target, and no amount of padding makes it one
// without eating the column it sits in.
//
// So the choice moves out of the column entirely, into the sheet idiom every
// other decision in this app already uses — full-width rows, each naming a
// figure and previewing the VIEWING person's number as the same two-line box
// the grid cell wears (a dash where nobody is being viewed — owner, 18 Aug
// 26, no squadron-wide total). This sheet is ALSO the legend the owner asked
// for (6 Sep 26): every row's caption is the figure's own `desc` — the one
// wording the title pop-up, this sheet and the page Legend all read, so the
// three can never drift apart. And it is where the figures are REORDERED and
// SHOWN/HIDDEN: the ▲▼ and eye on each row (admin only), persisted, so the
// column cycles the squadron's own preferred, visible figures.

import { useState } from 'react'
import { figureLines, figureParts, grantsFor, orderedFigures, type CounterName, type Figure, type Person } from '../engine'
import { figureCtxOf, getState, moveFigure, resetFigureOrder, toggleFigure, visibleFigures } from '../state/store'
import { shortDate } from './dates'
import { Sheet } from './Sheet'
import './bidpicker.css'
import './oiltracker.css'

/** Rounds for display only, the same rule the grid and the count rows use. */
const show = (n: number) => String(Math.round(n * 10) / 10)

export function CounterSheet({
  shownId,
  onPick,
  onClose,
}: {
  shownId: string
  onPick: (id: string) => void
  onClose: () => void
}) {
  const { people, figureOrder, figureHidden, role, viewer } = getState()
  // The ARRANGEMENT is management's (owner, 17 Aug 26) — the ▲▼, the eye and
  // the Reset render for an admin only; the store refuses a member's write
  // anyway. Read before the list, because it also decides what the list IS.
  const arranging = role === 'admin'
  // WHAT THE PICKER LISTS depends on who is looking (6 Sep 26 review). An
  // ADMIN sees every figure, a hidden one dimmed with its eye lit, because
  // hiding is his control and the dimmed row is the way back. A MEMBER sees
  // only what is actually showing: a hidden figure is not his to un-hide, so a
  // row he cannot use — greyed, with no eye, doing nothing when tapped — is an
  // inert control on a production surface, and this app does not ship those.
  // The column and the drawer read `visibleFigures()` for both roles.
  const figures = arranging ? orderedFigures(figureOrder) : visibleFigures()
  const hidden = new Set(figureHidden)
  const ctx = figureCtxOf()
  // The person LOOKING at the page, when the roster holds them — each row
  // then answers with THEIR number (owner, 17 Aug 26: the title tap should
  // show "what was used or balance of that individual"), because "how much
  // do I have left" is the question a person opens this sheet holding. The
  // viewer is Raptor's own "view as", which defaults to the account's person,
  // so a row is personal to whoever is being viewed. When NOBODY is (an admin
  // with no view-as, or a viewer the roster does not hold) the row shows a
  // dash — NOT a squadron-wide sum (owner, 18 Aug 26: "I don't need to see
  // totals when no one is picked… it defaults to the account viewer"). The
  // number is meant to answer "how much do I have left", which has no meaning
  // without a person.
  const me = viewer ? people.find(p => p.id === viewer) ?? null : null

  return (
    <Sheet testid="counter-sheet" label="Which figure" onClose={onClose} narrow>
      <div className="bidsheet-hd">
        {/* Lead with WHOSE numbers these are (owner, 28 Aug 26 — "make it
            obvious that im viewing as for example RANGER"). The counter column
            answers for the viewing person, and a grey aside said so too
            quietly; the viewer is now the headline, accented so it reads at a
            glance. When nobody is being viewed the sheet falls back to naming
            its own job. */}
        <span className="who" data-testid="counter-viewer">
          {me ? <>VIEWING AS <b className="vwname">{me.callsign}</b></> : 'WHAT THIS COLUMN SHOWS'}
        </span>
        <span className="dt">
          {me ? 'your numbers' : 'view a callsign to see numbers'}
          {arranging ? ' · tap a figure · ▲▼ to reorder · eye to hide' : ' · tap a figure to show it in the column'}
        </span>
        <button className="x" data-testid="counter-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>
      {/* The suffix key, stated once — the same words the column title and the
          page Legend wear (owner, 6 Sep 26): + is the balance left, − is what
          was used, and LL/OL are the two colours a balance can split into. */}
      <div className="clegend" data-testid="counter-legend">
        <b>+</b> balance left · <b>−</b> days used · <b className="amber">LL</b> amber · <b className="red">OL</b> red
      </div>
      <div className="clist">
        {figures.map((f, i) => {
          // The viewer's own figure where the roster knows who is looking (the
          // common case since the View-as mirror). Where nobody is being viewed
          // the row shows a dash rather than a squadron-wide sum (owner, 18 Aug
          // 26): the number answers "how much do I have left", which has no
          // meaning without a person — and a squadron total here only invited
          // the aircrew/ground-crew mixing the owner did not want either.
          const lines = me ? figureLines(f, ctx, me.id) : null
          const shownUsed = lines ? lines.used.filter(u => u.value !== 0) : []
          const isHidden = hidden.has(f.id)
          return (
            <div
              key={f.id}
              className={`crow-wrap${f.id === shownId ? ' on' : ''}${isHidden ? ' hidden' : ''}`}
              data-testid={`figrow-${f.id}`}
            >
              <button
                className="crow"
                data-testid={`counter-${f.id}`}
                aria-pressed={f.id === shownId}
                onClick={() => {
                  // Only an admin is ever shown a hidden row, and his tap
                  // un-hides it first — one gesture picks AND reveals rather
                  // than two. (Picking a still-hidden figure would be refused
                  // by the column's own visibility gate, so the un-hide is
                  // what makes the tap mean anything.)
                  if (isHidden) toggleFigure(f.id)
                  onPick(f.id)
                  onClose()
                }}
              >
                <span className="crow-top">
                  <span className="cn">{f.label}</span>
                  {lines ? (
                    <span className="ct fbox">
                      <span className={`fb${f.kind === 'tot' ? ' red' : lines.top < 0 ? ' neg' : ''}`}>{show(lines.top)}</span>
                      {shownUsed.length > 0 && (
                        <span className="fu">
                          {shownUsed.map(u => <b key={u.label} className={u.tone}>{show(u.value)}</b>)}
                        </span>
                      )}
                    </span>
                  ) : '—'}
                </span>
                {/* The caption is the owner's own words now (`Figure.desc`) on
                    EVERY row — the one source the title pop-up, this sheet and
                    the page Legend all read, so the three can never disagree. */}
                <span className="csub" data-testid={`figsub-${f.id}`}>{f.desc}</span>
              </button>
              {/* Their own hit target, outside the select button — a button
                  cannot nest a button, and tapping ▲ must reorder, not
                  select. Admin only: the arrangement is management's
                  (owner, 17 Aug 26), and a member's tap would be refused by
                  the store anyway — a control that does nothing is worse
                  than no control. */}
              {arranging && (
                <span className="cmove">
                  <button
                    className="cmv"
                    data-testid={`figup-${f.id}`}
                    disabled={i === 0}
                    aria-label={`Move ${f.label} up`}
                    onClick={() => moveFigure(f.id, -1)}
                  >
                    ▲
                  </button>
                  <button
                    className="cmv"
                    data-testid={`figdown-${f.id}`}
                    disabled={i === figures.length - 1}
                    aria-label={`Move ${f.label} down`}
                    onClick={() => moveFigure(f.id, 1)}
                  >
                    ▼
                  </button>
                  {/* Show/hide (owner, 6 Sep 26 — "admin should also be able
                      to customise" which figures show at all). Same glyph the
                      manning rows' eye uses (CountRows.tsx `mrow-tools`); ⊘
                      when this figure is already hidden, so the row itself
                      says what tapping it does next. The store refuses to
                      hide the last visible figure — see `toggleFigure`. */}
                  <button
                    className="cmv figeye"
                    data-testid={`figeye-${f.id}`}
                    aria-pressed={isHidden}
                    aria-label={isHidden ? `Show ${f.label}` : `Hide ${f.label}`}
                    onClick={() => toggleFigure(f.id)}
                  >
                    {isHidden ? '⊘' : '👁'}
                  </button>
                </span>
              )}
            </div>
          )
        })}
      </div>
      {arranging && (
        <div className="cfoot">
          <button className="creset" data-testid="counter-reset" onClick={() => resetFigureOrder()}>
            Reset
          </button>
        </div>
      )}
    </Sheet>
  )
}

/**
 * One person's number, opened out — the sheet a tap on a counter CELL opens
 * (the header still opens the picker above; the cell is the person's own
 * figure, so it answers for that person). The owner's ask, 17 Aug 26: "when
 * I click on the individual personnel counter, I should be able to see the
 * breakdown" — MED TOT opens as its ATT C / HL / OML rows, LVE TOT as its
 * seven codes, and a balance as opening + granted (+ earned) − taken, split
 * per type where it draws on more than one (LVE: LL taken, OL taken). Every
 * one of the eight figures defines its own parts now, so every row answers.
 *
 * Zero rows are kept, not hidden: "ATT C 0" says something true — that none
 * of this person's medical days were ATT C — and a breakdown with vanishing
 * rows would make the three-line shape read differently person to person.
 */
export function FigureBreakdownSheet({
  figure,
  person,
  onClose,
}: {
  figure: Figure
  person: Person
  onClose: () => void
}) {
  const ctx = figureCtxOf()
  const parts = figureParts(figure, ctx, person.id)
  const total = figure.value(ctx, person.id)
  // The entries behind the "granted" line. Since the grid's balance bar keys
  // credits onto any pool (6 Sep 26), a bare "granted 2" leaves the reader with
  // no way to ask who gave it or when — so the row itemises them underneath.
  // A total names no counter and has no grants to show.
  const grants = figure.counter ? grantsFor(ctx.ledger, person.id, figure.counter) : []

  return (
    <Sheet testid="figure-breakdown" label={`${figure.label} breakdown`} onClose={onClose} narrow>
      <div className="bidsheet-hd">
        <span className="who">{person.callsign}</span>
        <span className="dt">{figure.label}</span>
        <span className="cur">{figure.kind === 'bal' ? 'balance left' : 'days taken'}</span>
        <button className="x" data-testid="breakdown-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="clist">
        {parts.map(p => (
          <div key={p.label} className="crow-wrap" data-testid={`part-${p.label}`}>
            <span className="crow bdrow">
              <span className="crow-top">
                <span className="cn">{p.label}</span>
                {/* Signed as computed — a balance's "taken −3" reads as the
                    subtraction it is, so the rows visibly sum to the total. */}
                <span className={`ct${p.value < 0 ? ' neg' : ''}`}>{show(p.value)}</span>
              </span>
              {/* Inside the row, under its label-and-number line — the place
                  `.csub` already uses for a caption. Outside it the list
                  became a flex SIBLING of the row and squeezed in beside the
                  number it explains (live-view pass, 6 Sep 26). */}
              {p.label === 'granted' && grants.length > 0 && (
                <span className="bdgrants" data-testid="breakdown-grants">
                  {grants.map(g => (
                    <span key={g.id} className="bdgrant" data-testid={`grant-${g.id}`}>
                      <b className={g.amount < 0 ? 'neg' : ''}>{g.amount < 0 ? '−' : '+'}{show(Math.abs(g.amount))}</b>
                      {' · '}{shortDate(g.date)}{' · by '}{g.approvedBy}{g.givenBy ? ` (${g.givenBy})` : ''}{g.reason ? ` · ${g.reason}` : ''}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </div>
        ))}
        <div className="crow-wrap bdtotal" data-testid="breakdown-total">
          <span className="crow bdrow">
            <span className="crow-top">
              <span className="cn">Total</span>
              <span className={`ct${total < 0 ? ' neg' : ''}`}>{show(total)}</span>
            </span>
          </span>
        </div>
      </div>
    </Sheet>
  )
}

/**
 * EVERY figure for ONE person — the sheet a tap on any CALLSIGN opens, for
 * everyone (owner, 17 Aug 26: "everyone should be able to click on that
 * person's name and see these logics"). Where the column shows one figure at
 * a time and the breakdown sheet opens one figure's parts, this is the whole
 * picture: the eight figures (visibleFigures — a hidden one drops out here
 * too) with this person's own number, as the same two-line box the grid
 * shows. Tapping a row opens that figure's parts breakdown for this person,
 * so the two sheets chain into the full story. An admin also gets the Edit
 * person button here — the callsign tap used to be the edit shortcut for
 * them, and the edit surface must not become unreachable because the tap now
 * informs.
 *
 * Two kinds of row are special since 2 Sep 26 (owner): +OIL hands over to
 * the OIL TRACKER (the ledger behind the number) instead of the flat
 * breakdown, and an admin can SET a plain-sum balance — "manually input and
 * change LVE BAL … every time a LL or OL is taken it deducts from it" —
 * through a Set button beside the row that moves the opening figure (store
 * `setBalance`). That is every balance figure that names a counter other
 * than OIL (`Figure.counter`): LVE, CCL, FCL, CL and PL.
 */
export function PersonFiguresSheet({
  person,
  onOpenFigure,
  onOpenOil,
  onSetBalance,
  onEdit,
  onClose,
}: {
  person: Person
  onOpenFigure: (figureId: string) => void
  /** Opens the OIL tracker on this person — the +OIL row's tap. */
  onOpenOil?: () => void
  /** Present for an admin only — each settable balance row grows a Set button. */
  onSetBalance?: (counter: CounterName, target: number) => void
  /** Present for an admin only — opens the person EDITOR (PersonSheet). */
  onEdit?: () => void
  onClose: () => void
}) {
  // The figures a hidden id must not surface here either — "hidden" means
  // hidden everywhere the figure appears, this sheet included.
  const figures = visibleFigures()
  const ctx = figureCtxOf()
  // The balance row being edited — its figure id and the typed text, or
  // null when no row is. One at a time: opening a second closes the first.
  const [balEdit, setBalEdit] = useState<{ id: string; text: string } | null>(null)

  return (
    <Sheet testid="person-figures" label={`${person.callsign}'s figures`} onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{person.callsign}</span>
        <span className="dt">every figure · tap one for its breakdown</span>
        <button className="x" data-testid="pfig-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      {/* Same words as the picker's key and the column title (owner, 6 Sep 26)
          — one source, so the two sheets can never disagree. */}
      <div className="clegend">
        <b>+</b> balance left · <b>−</b> days used · <b className="amber">LL</b> amber · <b className="red">OL</b> red
      </div>
      <div className="clist">
        {figures.map(f => {
          const lines = figureLines(f, ctx, person.id)
          const shownUsed = lines.used.filter(u => u.value !== 0)
          const toOil = f.id === 'oil' && !!onOpenOil
          const settable = !!f.counter && f.counter !== 'oil' && !!onSetBalance
          const editing = settable && balEdit?.id === f.id
          const balDraft = editing ? balEdit!.text : null
          const setBalDraft = (text: string | null) => setBalEdit(text === null ? null : { id: f.id, text })
          const caption = toOil
            ? 'tap to open the OIL tracker · oldest credit is used first'
            : settable
              ? `set by admin · ${f.used.map(u => u.label).join(' and ')} deduct${f.used.length === 1 ? 's' : ''} from it`
              : f.desc
          const commit = () => {
            const n = Number(balDraft)
            if (balDraft === null || balDraft.trim() === '' || !Number.isFinite(n)) return
            onSetBalance!(f.counter!, n)
            setBalDraft(null)
          }
          return (
            <div key={f.id} className="crow-wrap" data-testid={`pfig-${f.id}`}>
              <button className="crow" onClick={() => (toOil ? onOpenOil!() : onOpenFigure(f.id))}>
                <span className="crow-top">
                  <span className="cn">{f.label}</span>
                  <span className="ct fbox">
                    <span className={`fb${f.kind === 'tot' ? ' red' : lines.top < 0 ? ' neg' : ''}`}>{show(lines.top)}</span>
                    {shownUsed.length > 0 && (
                      <span className="fu">
                        {shownUsed.map(u => <b key={u.label} className={u.tone}>{show(u.value)}</b>)}
                      </span>
                    )}
                  </span>
                </span>
                <span className="csub">{caption}</span>
              </button>
              {/* Its own hit target beside the row — a button cannot nest a
                  button, and the row's tap opens the breakdown. */}
              {settable && !editing && (
                <span className="cmove">
                  <button className="cmv setbal" data-testid={`${f.id}-edit`} onClick={() => setBalDraft(show(lines.top))} aria-label={`Set the ${f.label} balance`}>
                    Set
                  </button>
                </span>
              )}
              {editing && (
                <span className="cmove setbal-edit">
                  <input
                    type="number"
                    step="0.5"
                    className="oil-num"
                    data-testid={`${f.id}-input`}
                    value={balDraft ?? ''}
                    autoFocus
                    onChange={e => setBalDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setBalDraft(null) }}
                    aria-label={`${f.label} balance`}
                  />
                  <button className="cmv setbal" data-testid={`${f.id}-save`} onClick={commit}>Save</button>
                  <button className="cmv setbal dim" data-testid={`${f.id}-cancel`} onClick={() => setBalDraft(null)}>✕</button>
                </span>
              )}
            </div>
          )
        })}
      </div>
      {onEdit && (
        <div className="cfoot">
          <button className="creset" data-testid="person-edit" onClick={onEdit}>
            Edit person
          </button>
        </div>
      )}
    </Sheet>
  )
}
