/* THE BALANCES PAGE — EVERYONE'S LEAVE FIGURES AND GRADES (the Leave War overhaul's M5a, job 3 — D1230, D1242, D1245,
   D1482–D1488, D1233, D1236, D1249, D1254, D1255, D1220, D1247, D1486, D1490; the build spec
   docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md §2.2, §2.3; readings 9, 11, 13, 20, 23).

   Built to the drawings of record (D1424, D1478) — desktop `full/m5a/m5b-b1-desk` (admin), `m5c-c2-desk-open-cut` /
   `-desk-locked-cut` (a member, unlocked and locked), Days taken `m5b-b3-desk` / `-phone`, the phone `m5b-b2-rest` / `-slid` /
   `-pinch`, `m5c-c2-phones`, the lock `m5c-c3-lock` / `-lock-phone`, the grades `m5c-c1-grades` / `-picker` / `-nograde-cut`.
   Their markup, sizes and colours are `docs/mock/lw-overhaul/full-m5a-balances.mjs`'s own (round 14's page, round 15/16's
   phone, round 19b's read-only figures) — carried into `balances.css` under the same names with a `bp-` prefix.

   A tab's page in the grid card's place (LeaveWarPage.tsx), as Approvals' is. One row a person, in the grid's own order and
   groups (the store's `displayRoster` and the engine's `assignGroup`, the people of the View period — reading 9), each name
   the schedule's own puck (D1476, D1482 — `sync.ts puckHtml`, the one the drawing and the Approvals list draw). Every figure
   is the store's one engine (`leaveFiguresOf`, `daysTaken` — the spec §1.6), so this page, the person window, the grid,
   My leave and Approvals cannot disagree.

   WHO MAY TYPE is `balanceProblem` — the store's one rule, asked here only to decide whether a box is drawn: an admin any
   row; a member his own row while unlocked (D1242, D1487). The lock is read again when the box SAVES (the store refuses),
   so a box left open while an admin locks refuses with "Locked by admin" at the box (B6, §2.3).

   SPEED (docs/performance.md Part 1, §E): a row is memoised on its own figures (a signature string), so typing in one box
   repaints one box, and a save repaints the rows whose figures moved. The grid stays mounted and untouched behind it. */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { HOOKS } from '../../engine/hooks'
import { assignGroup, FIGURES, groupLabel, OTHER_ID, OTHER_LABEL, type Person } from '../engine'
import { BAL_KINDS, daysTaken, DAYS_TAKEN_COLS, type BalKind, type DaysTakenCol } from '../engine/leaveyear'
import {
  balanceProblem, balancesLocked, displayRoster, figureCtxOf, getState, gradeDaysNow, gradeOf, groupPriorityIds,
  groupsInOrder, leaveFiguresOf, leaveWorldOf, liveGrades, setBalanceLock, setPersonGrade, setTypedBalance,
} from '../state/store'
import { puckHtml } from '../sync'
import { wirePinch } from '../../ui/pinchzoom'
import { askLw, setBalancesUp } from './lwnav'
import { LW_ZOOM_MAX, roundZoom } from './lwzoom'
import { rowInWindow } from './Matrix'
import { groupColorOf } from './groupColor'
import { GradesSheet } from './GradesSheet'
import { usePhone } from './phone'
import { useVersion } from './useStore'
import './balances.css'

/** A figure as the page writes it: halves .5 (D1246), a minus sign, never a hyphen — the app's one helper, kept in the
 *  figure box's module so the grid and the bid windows write a figure through the same words (FigureCell.tsx). */
import { figWords } from './FigureCell'
export { figWords }
/** what a box's words read as a number — "−2", "-2", "17.5", "+3"; NaN for anything else (the store's refusal names it) */
const readFig = (t: string) => { const s = t.trim().replace(/^\+/, '').replace(/^[−–]/, '-'); return /^-?(\d+(\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN }

const OTHER = BAL_KINDS.filter(k => k !== 'LVE') as Exclude<BalKind, 'LVE'>[]
const OIL = FIGURES.find(f => f.id === 'oil')!

/* the drawing's own glyphs (round 14 — full-r14-bal.mjs MAG, LOCK, CHEV; the unlit open padlock, full-m5a-balances.mjs) */
function Mag() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
export function Lock({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 14 16" width="12" height="14" aria-hidden="true">
      <rect x="2" y="7" width="10" height="7.5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d={open ? 'M4.5 7V4a2.5 2.5 0 0 1 5 0' : 'M4.5 7V5a2.5 2.5 0 0 1 5 0v2'} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
function Chev() {
  return <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

/* ------------------------------------------------------------------ a box a figure is typed in */

/** an emptied box's words, in the store's refusals' voice (balanceProblem) */
const EMPTY_WORDS = 'Type a figure'
/** the person window's box: four figures' room ("16.5", "−2.5", "100") — longer ones are drawn smaller (fitFigure) */
const FIT_CH = 4
/** the smallest letters a long figure is drawn in */
const FIG_MIN_PX = 9

/** A FIGURE LONGER THAN ITS BOX IS DRAWN SMALLER UNTIL IT FITS (the M5a walk's A-F3). The box's own letters come back the
 *  moment the figure fits again. Reads the box's measure once; writes only for a figure that overflows. */
function fitFigure(el: HTMLInputElement): void {
  if (el.style.fontSize) el.style.fontSize = ''
  if (el.scrollWidth <= el.clientWidth) return
  const cs = getComputedStyle(el)
  const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
  const base = parseFloat(cs.fontSize) || 13.5
  const room = el.clientWidth - pad, need = el.scrollWidth - pad
  let px = Math.max(FIG_MIN_PX, Math.floor((base * room) / Math.max(need, 1) * 2) / 2)
  el.style.fontSize = `${px}px`
  /* the letters' widths do not scale exactly with their size: a half point less until it fits, at most a few steps */
  for (let i = 0; i < 6 && px > FIG_MIN_PX && el.scrollWidth > el.clientWidth; i++) { px -= 0.5; el.style.fontSize = `${px}px` }
}

/** A REFUSAL'S WORDS MOVED SIDEWAYS INTO SIGHT (the M5a walk's B-F2/F3): inside the page's scroller, 4px off its edges,
 *  never past the screen's. Under the phone's pinch (CSS zoom on the rows) a screen pixel is not the words' own pixel, so
 *  the move is given in theirs. */
function keepInSight(e: HTMLElement): void {
  e.style.transform = ''
  const r = e.getBoundingClientRect()
  if (!r.width) return
  /* …or inside the war window the box stands in (the fresh read of the fixes, finding 6): the person window and Grades clip
     what runs past their edge, so a refusal under a box in the right-hand tiles was cut there */
  const area = e.closest('.bp-hs, .bp-scroll, .bidsheet')?.getBoundingClientRect()
  const L = Math.max(area ? area.left : 0, 0) + 4
  const Rt = Math.min(area ? area.right : window.innerWidth, window.innerWidth) - 4
  let dx = 0
  if (r.right > Rt) dx = Rt - r.right
  if (r.left + dx < L) dx = L - r.left
  if (!dx) return
  const s = e.offsetWidth ? r.width / e.offsetWidth : 1
  e.style.transform = `translateX(${Math.round(dx / (s || 1))}px)`
}

/** ONE BOX (the spec §1.1, D1080): saves on Enter or on leaving it, never on each key; Escape puts the old figure back; one
 *  tap then typing replaces it — the app's own arming for its figure boxes (ui/interactions.ts, `input.mth-in`). `save`
 *  answers the refusal's words, or null when it saved; the words stand at the box until it is next typed in. */
export function FigBox({ value, sm, label, testid, save, plus, cls, fit }: {
  value: number
  sm?: boolean
  label: string
  testid?: string
  save: (n: number) => string | null
  /** the grades' "+36" — written with its plus sign */
  plus?: boolean
  /** a class of the surface it stands on (the person window's tile box — PersonWindow.tsx, drawn by its own drawing) */
  cls?: string
  /** the person window's tile box (round 20d's `r17-box`): one width — four figures' room plus this many pixels of its own
   *  padding and edge — whatever it shows, so the figures beside it never move as it is typed in (the M5a walk's A-F3,
   *  29 Oct 26: hugging its figure, it widened 42 → 53 for "16.5" and pushed Pending and War bal 11px along) */
  fit?: number
}) {
  const shown = (plus ? '+' : '') + figWords(value)
  const [text, setText] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const skip = useRef(false)
  /* A FIGURE TYPED IN ONE MAN'S BOX SAVES TO THAT MAN (the M5a scenario designer's ★17): the door and the figure shown are
     taken when the box takes the keyboard, so whatever takes it next — another name, Days taken, Lock, Grades…, the top
     bar's Undo — the save is his, never the row's under the pointer. What is typed is kept beside it, so a box taken off the
     screen with words still in it (Days taken redraws the row without it) saves them as it goes. */
  const held = useRef<{ save: typeof save; value: number; shown: string } | null>(null)
  const typed = useRef<string | null>(null)
  const commitText = (t: string | null) => {
    const h = held.current ?? { save, value, shown }
    typed.current = null
    if (t === null || t === h.shown) return null
    /* AN EMPTIED BOX SAYS SO (the M5a walk's A-F1, 29 Oct 26): Enter, or leaving it, put the old figure back with nothing
       said, so a box he cleared to type a new figure read as saved. The old figure stays and the box says what it needs;
       Escape still puts it back silently (above) */
    if (t.trim() === '') return EMPTY_WORDS
    const n = readFig(t)
    if (n === h.value) return null
    return h.save(n)
  }
  /* nothing typed since the last save leaves the words where they are (the fresh read of the fixes, finding 7): leaving the
     box after Enter ran this again with nothing typed, and its "nothing to say" cleared the refusal Enter had just put up.
     Typing, Escape and `lw-revert` clear the words themselves */
  const commit = () => { const t = text; if (t === null) return; setText(null); setErr(commitText(t)) }
  /* the box leaving the screen with an unsaved figure in it saves it — the browser raises no blur for a box removed */
  /* — and a refusal there (the lock landed while he typed, which takes his boxes away) is said in the app's passing note, the
     box being gone (D850: a refusal out of sight is told) */
  const labelNow = useRef(label)
  labelNow.current = label
  useEffect(() => () => {
    /* a box taken away emptied was no save he asked for: nothing is said of it */
    if (typed.current === null || typed.current.trim() === '') return
    const why = commitText(typed.current)
    if (why) HOOKS.toast(`${labelNow.current} not saved: ${why}`, 'warn')
  }, [])
  /* Escape inside a window (the Grades window — a Sheet, whose Escape closes it) puts the old figure back FIRST: the window
     asks for it with `lw-revert` before its own Escape is heard (GradesSheet.tsx), so Escape closes what opened last */
  const boxRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const revert = () => { typed.current = null; held.current = null; skip.current = false; setText(null); setErr(null) }
    el.addEventListener('lw-revert', revert)
    return () => el.removeEventListener('lw-revert', revert)
  }, [])
  /* THE WHOLE FIGURE, ALWAYS (the M5a walk's A-F3, 29 Oct 26): "10.5" in a CCL box and "−12.5" in App bal showed their
     last digit cut. The box keeps its drawn width — the columns and the figures beside it never move as it is typed in —
     and a figure longer than that width holds is drawn in smaller letters until it fits (−999.5, the longest the store
     takes, included). Measured only when the figure changes; a figure that fits is never touched. */
  useLayoutEffect(() => { const el = boxRef.current; if (el) fitFigure(el) }, [text, shown])
  /* A REFUSAL'S WORDS STAY ON THE SCREEN (the M5a walk's B-F2/F3, 29 Oct 26): set under the box's right edge, a long
     refusal under a box near the phone's left ran off the screen. They are moved sideways, never re-worded, to stand
     inside the sliding area (the page's scroller), or the screen where the box has none. */
  const errRef = useRef<HTMLSpanElement | null>(null)
  useLayoutEffect(() => { const e = errRef.current; if (e) keepInSight(e) }, [err])
  const key = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    /* saved and still his: the next figure typed here is read against the figure this save leaves */
    if (e.key === 'Enter') { e.preventDefault(); commit(); held.current = null }
    else if (e.key === 'Escape') {
      /* the old figure back, nothing saved; the box keeps the keyboard */
      e.preventDefault(); e.stopPropagation()
      skip.current = true
      typed.current = null
      setText(null); setErr(null)
    }
  }
  /* a TEXT keypad, as the war's Required and Available point boxes have (CounterForm.tsx — the ★20 scenario): an iPhone's
     decimal keypad has no minus key, and a figure below zero may be typed (reading 10) */
  return (
    <span className={`bp-fb${err ? ' bad' : ''}`}>
      <input
        className={`mth-in bp-bx${sm ? ' sm' : ''}${value === 0 && text === null ? ' z' : ''}${cls ? ` ${cls}` : ''}`}
        style={fit != null ? { width: `calc(${FIT_CH}ch + ${fit}px)` } : undefined}
        data-testid={testid}
        ref={boxRef}
        data-dirty={text !== null ? '1' : undefined}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label={label}
        aria-invalid={err ? true : undefined}
        value={text ?? shown}
        onFocus={() => { skip.current = false; held.current = { save, value, shown } }}
        /* typing again after an Escape is a new figure to save: the Escape's "leave without saving" mark goes with it (the
           re-walk's r1d, 29 Oct 26 — 22, Escape, 23, another box: the 23 was dropped with nothing said) */
        onChange={e => { skip.current = false; held.current = held.current ?? { save, value, shown }; setText(e.target.value); typed.current = e.target.value; if (err) setErr(null) }}
        onKeyDown={key}
        onBlur={() => { held.current = held.current ?? { save, value, shown }; if (skip.current) { skip.current = false; typed.current = null; setText(null); return } commit(); held.current = null }}
      />
      {err && <span className="bp-err" ref={errRef} role="alert" data-testid={testid ? `${testid}-err` : undefined}>{err}</span>}
    </span>
  )
}

/** A TYPED FIGURE SAVED — the page's boxes and the person window's (PersonWindow.tsx), one door: the refusal's words, or
 *  null when it saved. A save of either LVE box WRITES THE WHOLE ROW AFRESH (the spec §1.1, narrow read 2): the App bal box
 *  as it then shows and the carried-forward box as it then shows, clamped to 0 … the figure; "from" is the running figure
 *  shown before (the history line's "18 → 20"). */
export function saveTypedFigure(pid: string, kind: BalKind, n: number, part?: 'cf'): string | null {
  const k = leaveFiguresOf(pid).kinds[kind]
  if (kind === 'LVE') {
    const amount = part === 'cf' ? k.app : n
    /* the carried-forward box typed past its bounds is CLAMPED to 0 … the figure (the spec §1.1), never refused — walker D's
       FAIL 7, 29 Oct 26: "25" beside an App bal of 20 was refused "Carried forward is from 0 to 20"; it saves 20, and the
       box shows it. A figure that is no number, or no half, still meets the store's refusal (a NaN stays a NaN here). A
       clamp that lands on the figure already shown saves nothing, as a figure typed equal to it does (FigBox) */
    /* only a half is clamped (the fresh read of the fixes, finding 4): clamped first, "25.3" became 20 and saved, nothing said */
    const half = Number.isFinite(n) && Number.isInteger(n * 2)
    const cf = part === 'cf' ? (half ? Math.max(0, Math.min(n, Math.max(amount, 0))) : n) : Math.max(0, Math.min(k.cf, Math.max(n, 0)))
    if (part === 'cf' && cf === k.cf) return null
    const why = balanceProblem(pid, 'LVE', amount, cf)
    if (why) return why
    return setTypedBalance(pid, 'LVE', amount, cf, { amount: k.app, cf: k.cf }) ? null : 'Not saved'
  }
  const why = balanceProblem(pid, kind, n)
  if (why) return why
  return setTypedBalance(pid, kind, n, undefined, { amount: k.app }) ? null : 'Not saved'
}

/* ------------------------------------------------------------------ the rows */

interface Kind { app: number; pend: number }
interface RowData {
  app: number; cf: number; pend: number; war: number; oil: number
  other: Record<string, Kind>
  taken: Record<DaysTakenCol, number> | null
  /** his grade's name and "+ days" today; null for "No grade" */
  grade: { id: string; name: string; days: number } | null
}
interface RowProps {
  p: Person
  puck: string
  me: boolean
  /** a box is drawn on this row (balanceProblem's own answer) */
  boxes: boolean
  admin: boolean
  phone: boolean
  view: 'bal' | 'taken'
  sig: string
  d: RowData
  api: RowApi
}
interface RowApi {
  name: (pid: string) => void
  oil: (pid: string) => void
  grade: (pid: string, el: HTMLElement) => void
  save: (pid: string, kind: BalKind, n: number, part?: 'cf') => string | null
}

/** the figure read only — round 19b's (a member, or anyone's row but his own) */
function Ro({ v, sm }: { v: number; sm?: boolean }) {
  return <span className={`bp-ro${sm ? ' sm' : ''}${v === 0 ? ' z' : ''}`}>{figWords(v)}</span>
}
const pendWords = (n: number) => (n ? `−${figWords(n)}` : '')

function GradeBox({ pid, g, phone, admin, api }: { pid: string; g: RowData['grade']; phone: boolean; admin: boolean; api: RowApi }) {
  /* a member reads his grade as words with its "+36" (D1487); "No grade" in amber where a grade is set (D1249) */
  if (!admin) {
    if (phone) return <span className="bp-gd ro">{g ? `${g.name} · +${g.days}` : 'No grade'}</span>
    return <span className="bp-rogd">{g ? <>{g.name}<b>+{g.days}</b></> : 'No grade'}</span>
  }
  const open = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); api.grade(pid, e.currentTarget) }
  if (phone) {
    return (
      <button type="button" className={`bp-gd${g ? '' : ' none'}`} data-testid={`bal-grade-${pid}`} aria-haspopup="menu" aria-label={`Grade: ${g ? `${g.name}, +${g.days}` : 'No grade'}`} onClick={open}>
        {g ? `${g.name} · +${g.days}` : 'No grade'}<Chev />
      </button>
    )
  }
  return (
    <button type="button" className={`bp-gr${g ? '' : ' none'}`} data-testid={`bal-grade-${pid}`} aria-haspopup="menu" aria-label={`Grade: ${g ? `${g.name}, +${g.days}` : 'No grade'}`} onClick={open}>
      {g ? g.name : 'No grade'}<span className="d">{g ? `+${g.days}` : '–'}</span><Chev />
    </button>
  )
}

const Row = memo(function Row({ p, puck, me, boxes, admin, phone, view, d, api }: RowProps) {
  const pid = p.id
  const who = (
    <button type="button" className="bp-name" data-testid={`bal-name-${pid}`} aria-label={`${p.callsign}: open his leave`} onClick={() => api.name(pid)}>
      <span className="bp-puck" dangerouslySetInnerHTML={{ __html: puck }} />
    </button>
  )
  const box = (k: BalKind, v: number, sm: boolean, part?: 'cf') => boxes
    ? <FigBox value={v} sm={sm} testid={`bal-${part ?? k}-${pid}`} label={`${p.callsign} ${part === 'cf' ? 'LVE carried forward' : k === 'LVE' ? 'LVE App bal' : k}`} save={n => api.save(pid, k, n, part)} />
    : <Ro v={v} sm={sm} />
  const oil = (
    <button type="button" className="bp-oil" data-testid={`bal-oil-${pid}`} aria-label={`${p.callsign} OIL ${figWords(d.oil)}: open his OIL`} onClick={() => api.oil(pid)}>
      {d.oil ? figWords(d.oil) : <span className="z">0</span>}<span className="ch" aria-hidden="true">›</span>
    </button>
  )
  const taken = (k: DaysTakenCol) => { const n = d.taken?.[k] ?? 0; return n ? figWords(n) : <span className="z">–</span> }
  const pend = <>{d.pend ? `−${figWords(d.pend)}` : <span className="z">–</span>}</>
  if (phone) {
    return (
      <div className={`bp-row${me ? ' me' : ''}`} data-testid={`bal-row-${pid}`}>
        <span className="bp-who">{who}<GradeBox pid={pid} g={d.grade} phone admin={admin} api={api} /></span>
        {view === 'bal' ? (
          <>
            {box('LVE', d.app, false)}
            {box('LVE', d.cf, true, 'cf')}
            <span className={`bp-pend${d.pend ? ' pd' : ''}`} data-testid={`bal-pend-${pid}`}>{pend}</span>
            <span className={`bp-war${d.war < 0 ? ' neg' : ''}`} data-testid={`bal-war-${pid}`}>{figWords(d.war)}</span>
            <span className="bp-oilc sep">{oil}</span>
            {OTHER.map((k, i) => (
              <span key={k} className={`bp-oc${i ? '' : ' sep'}`}>{box(k, d.other[k]!.app, true)}<span className="bp-opd" data-testid={`bal-opd-${k}-${pid}`}>{pendWords(d.other[k]!.pend)}</span></span>
            ))}
          </>
        ) : DAYS_TAKEN_COLS.map((k, i) => <span key={k} className={i ? '' : 'sep'} data-testid={`bal-taken-${k}-${pid}`}>{taken(k)}</span>)}
      </div>
    )
  }
  return (
    <tr className={me ? 'me' : undefined} data-testid={`bal-row-${pid}`}>
      <td className="l"><span className="bp-zwho">{who}</span></td>
      <td className="l">{<GradeBox pid={pid} g={d.grade} phone={false} admin={admin} api={api} />}</td>
      {view === 'bal' ? (
        <>
          <td className="sep">{box('LVE', d.app, false)}</td>
          <td>{box('LVE', d.cf, true, 'cf')}</td>
          <td className={`bp-pend${d.pend ? ' pd' : ''}`} data-testid={`bal-pend-${pid}`}>{pend}</td>
          <td className={`bp-war${d.war < 0 ? ' neg' : ''}`} data-testid={`bal-war-${pid}`}>{figWords(d.war)}</td>
          {/* a plain table cell, its figure set right under OIL as every column's is (the M5a walk's A-F2: the phone's
              flex class on this cell took it out of the table, its figures left of the heading by 10–23px) */}
          <td className="sep">{oil}</td>
          {OTHER.map((k, i) => (
            <td key={k} className={i ? undefined : 'sep'}>{box(k, d.other[k]!.app, true)}<span className="bp-opd" data-testid={`bal-opd-${k}-${pid}`}>{pendWords(d.other[k]!.pend)}</span></td>
          ))}
        </>
      ) : DAYS_TAKEN_COLS.map((k, i) => <td key={k} className={i ? undefined : 'sep'} data-testid={`bal-taken-${k}-${pid}`}>{taken(k)}</td>)}
      <td />
    </tr>
  )
}, (a, b) => a.sig === b.sig && a.puck === b.puck && a.me === b.me && a.boxes === b.boxes && a.admin === b.admin
  && a.phone === b.phone && a.view === b.view && a.api === b.api && a.p === b.p)

/* ------------------------------------------------------------------ the grade list a row's box opens */

/** THE GRADE BOX'S LIST (D1486, D1233; drawn `m5c-c1-picker`): each grade with its "+ days", then "No grade". One tap sets
 *  his grade (counts from the next 1 Jan — D1490). A click-open popup: a press outside closes it, Escape closes it, the
 *  keyboard back on the box that opened it; the arrow keys move along it. */
function GradePick({ pid, anchor, phone, onClose }: { pid: string; anchor: HTMLElement; phone: boolean; onClose: (back: boolean) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const cur = gradeOf(pid)?.id ?? null
  const list = liveGrades()
  const r = anchor.getBoundingClientRect()
  useEffect(() => {
    const items = () => [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])]
    ;(items().find(b => b.getAttribute('aria-checked') === 'true') ?? items()[0])?.focus()
    const down = (e: Event) => {
      const t = e.target as Node | null
      if (t && (ref.current?.contains(t) || anchor.contains(t))) return
      onClose(false)
    }
    document.addEventListener('pointerdown', down, true)
    return () => document.removeEventListener('pointerdown', down, true)
  }, [anchor, onClose])
  const key = (e: ReactKeyboardEvent) => {
    const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(true) }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') onClose(false)
  }
  const pick = (id: string | null) => { setPersonGrade(pid, id); onClose(true) }
  return (
    <div
      ref={ref}
      className={`bp-gm${phone ? ' ph' : ''}`}
      role="menu"
      aria-label="Grade"
      data-testid="bal-grade-list"
      style={{ left: Math.max(8, Math.min(r.left, window.innerWidth - (phone ? 228 : 212))), top: r.bottom + 4 }}
      onKeyDown={key}
    >
      {list.map(g => (
        <button key={g.id} type="button" role="menuitemradio" aria-checked={cur === g.id} className={cur === g.id ? 'on' : undefined} data-testid={`bal-grade-opt-${g.id}`} onClick={() => pick(g.id)}>
          {g.name}<span className="d">+{gradeDaysNow(g)}</span>
        </button>
      ))}
      <hr />
      <button type="button" role="menuitemradio" aria-checked={cur === null} className={`no${cur === null ? ' on' : ''}`} data-testid="bal-grade-opt-none" onClick={() => pick(null)}>
        No grade<span className="d">–</span>
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ the page */

interface Group { id: string; label: string; cls: string; color?: string; people: Person[] }

export function BalancesPage() {
  const version = useVersion()
  const phone = usePhone()
  const st = getState()
  const { period, role, viewer, qualCatalog, groupColors, spans } = st
  const admin = role === 'admin'
  const locked = balancesLocked()
  const [view, setView] = useState<'bal' | 'taken'>('bal')
  const [q, setQ] = useState('')
  const [searching, setSearching] = useState(false)
  const [grades, setGrades] = useState(false)
  const [pick, setPick] = useState<{ pid: string; el: HTMLElement } | null>(null)
  const gradesBtn = useRef<HTMLButtonElement | null>(null)
  const searchBtn = useRef<HTMLButtonElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const hsRef = useRef<HTMLDivElement | null>(null)
  const zoomBox = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  /* THE PEOPLE — the grid's own order and groups (reading 9: the people on the grid in the View period; a SANS man while
     SANS is off the war, and a man whose stints miss the period, are not on it). The heading's label and colour are the
     grid's (Matrix.tsx `labelOfGroup`, `groupClass`, `groupColorOf`); the count, the people listed. */
  const groups = useMemo<Group[]>(() => {
    const win = `${period.start.slice(0, 7)}|${period.end.slice(0, 7)}`
    const defs = groupsInOrder(), prio = groupPriorityIds()
    const needle = q.trim().toLowerCase()
    const out: Group[] = []
    for (const p of displayRoster()) {
      if (!rowInWindow(p, win, spans)) continue
      if (needle && !p.callsign.toLowerCase().includes(needle)) continue
      const g = assignGroup(p, defs, prio)
      let G = out[out.length - 1]
      if (!G || G.id !== g) {
        const d = defs.find(x => x.id === g)
        G = { id: g, label: g === OTHER_ID ? OTHER_LABEL : d ? groupLabel(d, qualCatalog) : g, cls: `g-${g.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, color: groupColorOf(g, groupColors), people: [] }
        out.push(G)
      }
      G.people.push(p)
    }
    return out
  }, [version, period.id, q])

  /* EVERY ROW'S FIGURES — the store's one engine, worked out once per change of the war; a row's signature decides whether it
     repaints (its memo) */
  const rows = useMemo(() => {
    const ctx = figureCtxOf()
    const m = new Map<string, { d: RowData; sig: string; puck: string; boxes: boolean }>()
    for (const G of groups) for (const p of G.people) {
      const f = leaveFiguresOf(p.id)
      const L = f.kinds.LVE
      const other: Record<string, Kind> = {}
      for (const k of OTHER) other[k] = { app: f.kinds[k].app, pend: f.kinds[k].pending }
      let taken: RowData['taken'] = null
      if (view === 'taken') { const { world, days } = leaveWorldOf(p.id); taken = daysTaken(world, p.id, days, period.start, period.end) }
      const g = gradeOf(p.id)
      const d: RowData = { app: L.app, cf: L.cf, pend: L.pending, war: L.war, oil: OIL.value(ctx, p.id), other, taken, grade: g ? { id: g.id, name: g.name, days: gradeDaysNow(g) } : null }
      m.set(p.id, { d, sig: JSON.stringify(d), puck: puckHtml(p.id, p.callsign), boxes: balanceProblem(p.id, 'CCL', 0) === null })
    }
    return m
  }, [groups, version, view, period.id])

  /* the row's doors, stable for the page's life so a row's memo holds */
  const api = useMemo<RowApi>(() => ({
    /* a tap on a name opens his person window, as every tap on a person on the Leave War does (D1148; reading 23) */
    name: pid => askLw({ kind: 'person', id: pid }),
    /* OIL is read only here: "0 ›" opens his OIL tracker (D1255) — the OIL tab's page, on his row */
    oil: pid => { setBalancesUp(false); askLw({ kind: 'oil', id: pid }) },
    grade: (pid, el) => setPick(cur => (cur && cur.pid === pid ? null : { pid, el })),
    /* A SAVE WRITES THE WHOLE ROW AFRESH (narrow read 2): for LVE the App bal box as it then shows and the carried-forward box
       as it then shows, clamped to 0 … the figure; "from" is the running figure shown before (the history line) */
    save: saveTypedFigure,
  }), [])

  /* THE PAGE FILLS THE SCREEN UNDER THE TAB ROW and scrolls inside itself (the drawing's page: its foot 8px off the screen's
     on a desktop, at the screen's foot on a phone), so its headings stay in sight and, on a phone, its names stay put */
  /* Its top is read in the PAGE's measure (the screen's plus how far the window is scrolled): the page opens at the
     window's top (LeaveWarPage.tsx Body scrolls there, after this has run), and opened from a grid scrolled down, a top
     read off the screen was short by that scroll — the page came out 120 taller than the phone's screen and the whole
     window scrolled, the tab row going under the top bar (the M5a walk's B-F5, 29 Oct 26). */
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const fit = () => { const top = el.getBoundingClientRect().top + (window.scrollY || 0); el.style.height = `${Math.max(240, window.innerHeight - Math.max(0, top))}px` }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [phone])

  /* THE TWO HEADING LINES MEET (the M5a walk's A-F4, 29 Oct 26): the second pinned at the drawing's 30px while the first
     drew shorter, and a strip of the rows slid between them. The second pins where the first one ends, as measured — the
     same in every browser, whatever a table cell makes of its height and padding. */
  const tableRef = useRef<HTMLTableElement | null>(null)
  useLayoutEffect(() => {
    const t = tableRef.current
    if (!t) return
    const pin = () => {
      const h = t.querySelector<HTMLElement>('tr.h1')?.offsetHeight ?? 0
      if (h > 0) t.querySelectorAll<HTMLElement>('tr.h2 th').forEach(th => { th.style.top = `${h}px` })
    }
    pin()
    window.addEventListener('resize', pin)
    return () => window.removeEventListener('resize', pin)
  }, [phone, view, groups.length === 0])

  /* A TAPPED BOX COMES INTO SIGHT WITH ITS PENDING FIGURE (the M5a walk's B-F4, 29 Oct 26): the browser slides the phone's
     list only far enough for the box, and a kind's amber pending figure after it — the figure the typed number changes —
     was cut at the screen's edge. Once the browser has slid, the box's whole cell (box and pending figure) is brought
     inside the list, clear of the names held at its left. */
  const showCell = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement
    if (!(t instanceof HTMLInputElement)) return
    const hs = hsRef.current
    if (!hs) return
    const later = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f: () => void) => setTimeout(f, 16)
    later(() => {
      if (!t.isConnected || document.activeElement !== t) return
      const cell = (t.closest('.bp-oc') as HTMLElement | null) ?? t
      const c = cell.getBoundingClientRect(), a = hs.getBoundingClientRect()
      const names = t.closest('.bp-row')?.querySelector('.bp-who')?.getBoundingClientRect()
      const L = Math.max(a.left, names ? names.right : a.left) + 4, Rt = a.right - 4
      let dx = 0
      if (c.right > Rt) dx = c.right - Rt
      if (c.left - dx < L) dx = c.left - L
      if (dx) hs.scrollLeft += dx
    })
  }, [])

  /* PINCH ON A PHONE (D1483, D1236): the list zooms out until every column fits — the OIL tab's set-up (OilTracker.tsx), the
     app's one pinch body: CSS zoom, the headings held on their row and the names on their column while the fingers move,
     the Leave War's own zoom limits */
  useEffect(() => {
    if (!phone) return
    const root = rootRef.current, hs = hsRef.current
    if (!root || !hs) return
    return wirePinch({
      surface: root,
      target: () => zoomBox.current,
      get: () => zoomRef.current,
      max: LW_ZOOM_MAX,
      min: () => {
        const z = zoomRef.current, cols = zoomBox.current?.querySelector<HTMLElement>('.bp-cols')
        const w = cols ? cols.getBoundingClientRect().width / z : 0
        const fit = w > 0 ? Math.min(1, hs.clientWidth / w) : 1
        return Math.min(z, fit)
      },
      apply: z => { const v = roundZoom(z); zoomRef.current = v; flushSync(() => setZoom(v)) },
      blockTwo: () => true,
      pin: () => {
        const box = zoomBox.current; if (!box) return []
        const out: { el: HTMLElement; x: boolean; y: boolean }[] = []
        box.querySelectorAll<HTMLElement>('.bp-cols > span').forEach((s, i) => out.push({ el: s, x: i === 0, y: true }))
        box.querySelectorAll<HTMLElement>('.bp-row > .bp-who, .bp-grp .gl').forEach(el => out.push({ el, x: true, y: false }))
        return out
      },
      pinAt: () => {
        const h = zoomBox.current?.querySelector<HTMLElement>('.bp-cols')?.getBoundingClientRect()
        return { x: hs.getBoundingClientRect().left, y: h ? h.top : hs.getBoundingClientRect().top }
      },
      /* the spot under the fingers is a column and a row — the names and headings are pinned, so the element under the
         fingers would not say where the figures went */
      anchor: (x, y) => {
        const box = zoomBox.current; if (!box) return null
        let ax: Element | null = null, ay: Element | null = null
        const w = hs.getBoundingClientRect()
        const heads = [...box.querySelectorAll<HTMLElement>('.bp-cols > span')].slice(1)
        for (const c of heads) { const r = c.getBoundingClientRect(); if (x >= r.left && x < r.right) { ax = c; break } if (!ax && r.right > Math.max(x, w.left)) ax = c }
        for (const r0 of box.querySelectorAll<HTMLElement>('.bp-row')) { const r = r0.getBoundingClientRect(); if (y >= r.top && y < r.bottom) { ay = r0; break } if (!ay && r.bottom > Math.max(y, w.top)) ay = r0 }
        return { x: ax, y: ay }
      },
      edges: true,
    })
  }, [phone, view])

  const closePick = useCallback((back: boolean) => { setPick(cur => { if (back && cur) cur.el.focus(); return null }) }, [])
  const closeGrades = useCallback(() => { setGrades(false); gradesBtn.current?.focus() }, [])

  const seg = (
    <span className="bp-seg" role="group" aria-label="Show">
      <button type="button" className={view === 'bal' ? 'on' : undefined} aria-pressed={view === 'bal'} data-testid="bal-view-bal" onClick={() => setView('bal')}>Balances</button>
      <button type="button" className={view === 'taken' ? 'on' : undefined} aria-pressed={view === 'taken'} data-testid="bal-view-taken" onClick={() => setView('taken')}>Days taken</button>
    </span>
  )
  const searchBox = (
    <label className="bp-srch">
      <Mag />
      <input
        type="search"
        data-testid="bal-search"
        placeholder="Find a person"
        aria-label="Find a person"
        value={q}
        autoFocus={phone}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape' && phone) { e.preventDefault(); setQ(''); setSearching(false); searchBtn.current?.focus() } }}
      />
    </label>
  )
  /* "Lock for members" (D1220, D1247, D1488): round 14's switch on a desktop; the padlock on a phone, open and unlit when off,
     closed and lit cyan when on. An admin's only (D1487) */
  const lock = admin && (phone ? (
    <button type="button" className={`bp-lk${locked ? '' : ' off'}`} role="switch" aria-checked={locked} data-testid="bal-lock" aria-label={locked ? 'Locked for members' : 'Lock for members: off'} title={locked ? 'Locked for members' : 'Lock for members'} onClick={() => setBalanceLock(!locked)}>
      <Lock open={!locked} />
    </button>
  ) : (
    <button type="button" className={`bp-lock${locked ? ' on' : ''}`} role="switch" aria-checked={locked} data-testid="bal-lock" onClick={() => setBalanceLock(!locked)}>
      <Lock />Lock for members<span className="sw" aria-hidden="true" />
    </button>
  ))
  const gradesButton = admin && (
    <button type="button" ref={gradesBtn} className="bp-btn" data-testid="bal-grades" aria-haspopup="dialog" aria-expanded={grades} onClick={() => setGrades(g => !g)}>
      {phone ? 'Grades' : 'Grades…'}
    </button>
  )
  /* a member, locked: everything read only with the padlock and "Locked by admin" — on a phone on a slim line under the bar */
  const lockedWords = !admin && locked && (
    <span className={phone ? 'bp-lk2' : 'bp-lkw'} data-testid="bal-locked"><Lock /><span>Locked by admin</span></span>
  )
  const bar = phone ? (
    <div className="bp-bar">
      {seg}
      <button type="button" ref={searchBtn} className={`bp-btn ic${searching || q ? ' on' : ''}`} data-testid="bal-search-open" aria-label="Find a person" aria-expanded={searching} onClick={() => { if (searching) { setQ(''); setSearching(false) } else setSearching(true) }}>
        <Mag />
      </button>
      <span className="bp-sp" />
      {gradesButton}
      {lock}
    </div>
  ) : (
    <div className="bp-bar">
      {seg}
      {searchBox}
      <span className="bp-sp" />
      {lockedWords}
      {gradesButton}
      {lock}
    </div>
  )

  const span = view === 'bal' ? 13 : DAYS_TAKEN_COLS.length + 3
  const takenHead = `DAYS TAKEN IN ${period.name}`
  const body = phone ? (
    <div className="bp-hs" ref={hsRef} data-testid="bal-scroll" onFocus={showCell}>
      <div className={`bp-zoom ${view}`} ref={zoomBox} style={zoom !== 1 ? { zoom } : undefined}>
        <div className="bp-cols" role="presentation">
          <span>NAME · GRADE</span>
          {view === 'bal'
            ? <><span>APP BAL</span><span>CARRIED</span><span>PENDING</span><span>WAR BAL</span><span className="sep">OIL</span>{OTHER.map((k, i) => <span key={k} className={`ok${i ? '' : ' sep'}`}>{k}</span>)}</>
            : DAYS_TAKEN_COLS.map((k, i) => <span key={k} className={i ? undefined : 'sep'}>{k}</span>)}
        </div>
        {groups.map(G => (
          <div key={G.id}>
            <div className={`bp-grp grp ${G.cls}`}><span className="gl"><i className="gsw" style={G.color ? { background: G.color } : undefined} />{G.label}<em>{G.people.length}</em></span></div>
            {G.people.map(p => { const r = rows.get(p.id)!; return <Row key={p.id} p={p} puck={r.puck} me={p.id === viewer} boxes={r.boxes} admin={admin} phone view={view} sig={r.sig} d={r.d} api={api} /> })}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="bp-scroll" data-testid="bal-scroll">
      <table className="bp-table" ref={tableRef}>
        <thead>
          {view === 'bal' ? (
            <>
              <tr className="h1"><th className="l" colSpan={2} /><th className="span sep" colSpan={4}>LVE</th><th className="sep" /><th className="span sep" colSpan={5}>OTHER LEAVE</th><th /></tr>
              <tr className="h2">
                <th className="l">NAME</th><th className="l">GRADE · AUTO + LVE ON 1 JAN</th>
                <th className="sep">APP BAL</th><th>INCL. CARRIED FWD</th><th>PENDING</th><th>WAR BAL</th><th className="sep">OIL</th>
                {OTHER.map((k, i) => <th key={k} className={`ok${i ? '' : ' sep'}`}>{k}</th>)}
                <th className="fill" />
              </tr>
            </>
          ) : (
            <>
              <tr className="h1"><th className="l" colSpan={2} /><th className="span sep" colSpan={DAYS_TAKEN_COLS.length} data-testid="bal-taken-head">{takenHead}</th><th /></tr>
              <tr className="h2">
                <th className="l">NAME</th><th className="l">GRADE · AUTO + LVE ON 1 JAN</th>
                {DAYS_TAKEN_COLS.map((k, i) => <th key={k} className={`tk${i ? '' : ' sep'}`}>{k}</th>)}
                <th className="fill" />
              </tr>
            </>
          )}
        </thead>
        <tbody>
          {groups.map(G => [
            <tr key={`g-${G.id}`} className={`bp-grp grp ${G.cls}`}><td colSpan={span}><i className="gsw" style={G.color ? { background: G.color } : undefined} />{G.label}<em>{G.people.length}</em></td></tr>,
            ...G.people.map(p => { const r = rows.get(p.id)!; return <Row key={p.id} p={p} puck={r.puck} me={p.id === viewer} boxes={r.boxes} admin={admin} phone={false} view={view} sig={r.sig} d={r.d} api={api} /> }),
          ])}
        </tbody>
      </table>
    </div>
  )

  return (
    <section className={`bp${phone ? ' ph' : ''}`} ref={rootRef} data-testid="balances-page" aria-label="Balances">
      <div className="bp-card">
        {bar}
        {phone && lockedWords}
        {phone && (searching || q) && <div className="bp-srchline">{searchBox}</div>}
        {groups.length === 0 ? <div className="bp-empty" role="status">{q.trim() ? 'No one by that name on the Leave War' : 'No one on the Leave War in this period'}</div> : body}
        <div className="bp-cutf" aria-hidden="true" />
      </div>
      {pick && admin && <GradePick key={pick.pid} pid={pick.pid} anchor={pick.el} phone={phone} onClose={closePick} />}
      {grades && admin && <GradesSheet anchor={gradesBtn.current} onClose={closeGrades} />}
    </section>
  )
}

