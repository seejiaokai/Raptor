/* THE INPUT'S OWN WINDOW AND ITS PARTS — the components of the input editor, moved whole out of ui/inputedit.tsx on 3 Nov 26
   (the Inputs batch's React Doctor ride, [DOCTOR-INPUTS-RIDE]): a file that draws components exports only components
   (only-export-components), so the editor's window (`InputEditor`), its span and SANS pickers and its document field live
   here, and every rule they apply — the saves, the OIL question, the medical cascades, the drafts — stays in
   ui/inputedit.tsx, imported from there. Nothing in them was reworded. */
import { cxOf, cxWhy, cxSays } from './inputcard-model'
import { FloatWin } from './FloatWindow'
import { bringForward } from './winorder'
import { frontWin, holdPageScroll } from './floatwin'
import { placedLineOf } from './placedline'
import { PeoplePick, PlaceholderGroup } from './PeoplePick'
import { pickProblem } from './peoplepick-model'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { INPUTS, TITLE_MAX, titledKind, titleOf, DATES, inpId, inpType, isSansAvail, isUpchit, isDownchit, isLeave, needsDoc, defaultAllday, baseYear, remarksTyped, tillOfISO, tillDefaultISO, shortYear, idsOf, leadOf, holds, isPlaceholderInput, isOther, isFly } from '../engine/inputs'
import { upchitEffects, medClashes } from '../engine/medical'
import { UpchitConfirm } from './UpchitConfirm'
import { MedClashConfirm } from './MedClashConfirm'
import { OilConfirm } from './OilConfirm'
import { DocConfirm } from './DocConfirm'
import { docAdd, docGet, rowDocIds } from '../state/docs'
import { ClipIcon, PenIcon, UploadIcon } from './icons'
import { PEOPLE, isSpecial } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { stampChanged } from '../state/inputstamp'
import { notify } from '../state/store'
import { canEditSched } from '../state/auth'
import { me, isMe, mayEditInput, mayMovePlace } from '../state/perms'
import { INPEDIT, INPEDIT_REFOUND, setInpEdit, OILASK, OILOWN, setOilAsk, setDocView } from './pops'
import { CURPAGE, INPVIEW, revealInput, revealMedInput } from '../state/view'
import { toastHeld } from './toast'
import { noteUnlessSeen } from './seen'
import { useVersion } from './useStore'
import { RangeCal } from './RangeCal'
import { DateBox } from './DateBox'
import { TypeLegend } from './TypeLegend'
import { clickedOutside } from './outside'
import { useSheetFocus, topSheet } from './sheetfocus'
import { AskCard } from './AskCard'
import { lastPressed } from './lastpress'
import { rosterOptions, archivedOptions, fmt, fmtDay, unfmt, hasHalf, spanOf, spanFields, SPANS, SANS_ROWS, sansRefusal, isoOrd, ordISO, applyMedPlan, medKeptSegments, mintMedSegments, typeOptions, draftOf, normalizeInputDraft, docGate, oilGate, oilAnswered, oilUnansweredDay, oilSummary, oilDayLabel, TYPE_ALLOW, protectedInput, medPlanProtected, medicalLocked, medSegmentsProtected, placeholderRefused, placeholderWhy, commitNewInput, commitInputEdit, medAskFor, saveBatchX, saveBatch, giveBackCuts, askOilIfPending, removeInput, upchitDeleteAsk, sharedRefusal, inputWho, howMany, commitInput, WIN_FIELDS, fieldSame, fieldPart, fieldSay, progOf } from './inputedit'
import type { Span } from './inputedit'

export function SpanPicker({ id, span, onPick }: { id: string, span: Span, onPick: (m: Span) => void }) {
  return <div className="spanpick" id={id} role="group" aria-label="Duration">
    {SPANS.map(([m, label, title]) =>
      <button key={m} type="button" className={'spanbtn' + (span === m ? ' on' : '')}
        aria-pressed={span === m} title={title} data-span={m}
        onClick={() => onPick(m)}>{label}</button>)}
  </div>
}

export function SansPicker({ id, sans, onChange }: { id: string, sans: any, onChange: (next: any) => void }) {
  const set = (k: string, checked: boolean) => {
    const next = { ...(sans || {}) }
    if (checked) next[k] = true; else delete next[k]
    onChange(next)
  }
  return <div className="sanspick" id={id} role="group" aria-label="SANS availability">
    {SANS_ROWS.map(([k, label]) => (
      <label className="sanspick-ck" key={k}>
        <input type="checkbox" checked={!!(sans && sans[k])}
          onChange={e => set(k, e.target.checked)} /> {label}
      </label>
    ))}
  </div>
}

/* THE UPLOAD CONTROL every editor renders when needsDoc(type) — one
   component so the add form, the in-table row editor and the modal cannot
   grow three file inputs with three behaviours. An entry holds SEVERAL
   files now (owner, 1 Sep 26 — "upload several files into a single entry
   and delete or reupload"): each attached file is a chip with a ✕ that
   drops it from the DRAFT list (nothing changes until Save — Cancel stays
   a real cancel, and the store keeps every stored file either way, because
   undo can resurrect a record), and the button appends more. Picking files
   stores each at once (state/docs); a refused file (wrong kind, over the
   cap) toasts and the rest still land.
   A CHIP'S NAME OPENS ITS FILE (his D1292, 24 Oct 26 — "After I upload the document. I should be able to click on the image to
   preview what I uploaded"; [LW-DOCFIELD-CHIP-OPENS]): a tap on the name shows that file in the app's document viewer, over
   the window it sits in — straight after it is picked, nothing saved yet, as well as later; the ✕ beside it only takes it
   off. The viewer opens read only (no "Edit input": the window it was opened from is where the entry changes) on the page
   `viewRow` names — whose, which kind, which days, as the window has them now — every chip's file on it, the one tapped
   shown first. Every caller says what that page is, so no chip can open on a blank one. */
function viewDocFile(row: any, ids: readonly string[], id: string): void {
  if (!row) return
  setDocView({ row: { ...row, docId: undefined, docIds: [...ids] }, readOnly: true, docId: id })
  notify()
}
export function DocField({ ids, onIds, viewRow }: { ids: string[], onIds: (ids: string[]) => void, viewRow: () => any }) {
  const ref = useRef<HTMLInputElement>(null)
  const have = ids || []
  return <span className="docfield">
    <input ref={ref} type="file" accept="image/*,application/pdf" multiple hidden
      onChange={e => {
        const fs = e.target.files ? [...e.target.files] : []
        e.target.value = ''
        if (!fs.length) return
        const fresh: string[] = []
        fs.forEach(f => {
          const { id, why } = docAdd(f)
          if (!id) { HOOKS.toast(why, 'warn'); return }
          fresh.push(id)
        })
        if (fresh.length) onIds([...have, ...fresh])
      }} />
    {have.map(id => {
      const doc = docGet(id)
      return <span key={id} className="docchip" title={doc ? doc.name : 'Document'}>
        <button type="button" className="docname docopen" title={`Open ${doc ? doc.name : 'the document'}`}
          onClick={() => viewDocFile(viewRow(), have, id)}>{doc ? doc.name : 'document'}</button>
        <button type="button" className="docdel" aria-label={`Remove ${doc ? doc.name : 'document'}`}
          onClick={() => onIds(have.filter(x => x !== id))}>✕</button>
      </span>
    })}
    <button type="button" className={'abtn docbtn' + (have.length ? ' has' : '')}
      title={have.length ? 'Attach another file (photo or PDF)' : 'Attach the supporting document (photo or PDF)'}
      onClick={() => ref.current && ref.current.click()}>
      <UploadIcon /><span>{have.length ? 'Add' : 'Document'}</span>
    </button>
  </span>
}

// eslint-disable-next-line react-doctor/no-high-complexity-react-function, react-doctor/no-giant-component -- the ONE window every door opens (the Inputs page, the week, the board): one draft, its questions and its record-follow kept together so a Save can never write from a half; split it and the draft's rules split with it — a design job of its own, not a tidy-up; moved whole from inputedit.tsx on 3 Nov 26 with this finding already on it (D1534: the area's findings ride with its batch)
export function InputEditor() {
  useVersion()
  const r = INPEDIT
  const open = !!r
  /* the dialog opens on an EXISTING row for an edit, or on a seed row carrying
     `_new` for the board's + Add — same fields, but Save inserts rather than
     overwrites and there is nothing to Delete (see commitNewInput) */
  const isNew = !!(r && r._new)
  /* which board panel the + Add came from (owner, 19 Aug 26) — 'g' the Ground
     Programme (+ Inputs: activity types only, accepted straight onto the
     programme), 'u' Unavailable (leave/medical/OD only, with a date range),
     's' SANS Availability (the type is fixed, SANS aircrew only). '' is an
     ordinary EDIT, which keeps the full type list — retyping an existing row
     across groups is a real move the app already handles. */
  const ctx = isNew ? (r._ctx || '') : ''
  /* GUARD RAIL (owner, 27 Aug 26): a medical input stays medical. Editing a
     downchit offers ONLY the downchit family (ATT C/B, OML, HL) — never a
     retype into leave or a course, which would strand its mandatory document
     and the trim rules; an upchit edit likewise stays an upchit. The
     cross-group retype the comment above allows is kept for non-medical rows.
     Board + Add keeps its own TYPE_ALLOW list; this only narrows an EDIT. */
  const typeFilter = ctx ? TYPE_ALLOW[ctx]
    : (r && !isNew && isDownchit(r.type)) ? isDownchit
    : (r && !isNew && isUpchit(r.type)) ? isUpchit
    /* and no input already filed is turned INTO SANS availability (D620: it is filed on the SANS calendar only); a
       SANS commitment's own editor keeps the full list, as built */
    : (r && !isNew && !isSansAvail(r.type)) ? TYPE_ALLOW.i
    : undefined
  const [draft, setDraft] = useState<any>(null)
  /* the upchit save-time summary (owner, 27 Aug 26) — effects to show + the
     commit its Save runs; null = no sheet over this dialog */
  const [upConf, setUpConf] = useState<any>(null)
  /* the medical clash sheet (owner, 27 Aug 26) — the clashes to put to the
     filer plus the span ordinals its Save resolves against */
  const [medConf, setMedConf] = useState<any>(null)
  /* the OIL ask (owner, 28 Aug 26) — the oilGate payload; null = no sheet */
  const [oilConf, setOilConf] = useState<any>(null)
  /* the medical-document ask (owner, [SYNC-INTEG]) — {who, typeLabel}; null = no sheet */
  const [docConf, setDocConf] = useState<any>(null)
  const box = useRef<HTMLDivElement>(null)
  const keepDraft = useRef(false)
  /* A WINDOW ON THE INPUTS PAGE (owner D641: "an input or a commitment being filed" is one of the windows that drag
     while the page behind works; the plan §3.7: "the input / commitment editor when it is opened on the Inputs page").
     Opened from the board or the week it stays the blocking dialog it was — outside this job's mock-ups.
     A window does not block, so the record it shows CAN be changed behind it. The rule is the plan's: "an editor never
     saves a field its user did not change". `base` is the record as the window last saw it; on every change behind it
     a field he has not touched takes the live value silently, and a field changed BOTH ways is put to him (`clash`).
     `shown` is the record the window holds, for the one-editor-at-a-time question (`swap`). */
  const win = open && CURPAGE === 'inputs'
  /* OPENED FROM THE SCHEDULE IT TAKES AND KEEPS THE KEYBOARD ([WINDOWS-KEEP-KEYS], reader D2's second pass, 6 Oct 26): Tab
     used to walk on into the schedule behind the dialog, where a box saved on leaving. On the Inputs page it is a window
     the page behind still works with (D641), so it holds nothing there. Its question sheets stack on top (ui/sheetfocus.ts). */
  useSheetFocus(box, open && !win)
  /* THE BLOCKING DIALOG HOLDS A FINGER TOO ([SCHED-INPUT-WINDOW-PHONE], 18 Oct 26 — owner D686: a finger on a window never
     scrolls the page behind it). Opened from the board or the week, a swipe on it used to scroll the schedule behind; the
     same guard as the window on the Inputs page (floatwin.ts holdPageScroll), on the whole dialog, its dimmed edge
     included — that edge is no page to scroll: a press on it closes the dialog. */
  const pop = useRef<HTMLDivElement>(null)
  useEffect(() => { const n = pop.current; if (!n) return; return holdPageScroll(n) }, [win])
  const base = useRef<any>(null)
  const shown = useRef<any>(null)
  const [clash, setClash] = useState<string[]>([])
  /* WHAT HIS CHANGE WAS MADE OVER, per field (`[CAL-CHECK-SEEN]`, the editor — walker G's X-08, 10 Oct 26). `base` moves
     with every change behind the window, so once a field was in dispute nothing remembered the value he had typed his
     change over: a bar's drag rewrote a leave's "till" word under his typed remark — rightly listed — and when the
     drag was UNDONE the note stayed, "theirs" now the very value the window had opened on. A field whose record is
     back to what his change was made over is not in dispute: it is an ordinary unsaved change again. Kept from the
     first change behind him until the field is settled the other way (he takes theirs, both become the same, the
     window is seeded afresh). */
  const madeOver = useRef<Record<string, any>>({})
  const [, redraw] = useState(0)
  const [swap, setSwap] = useState<any>(null)
  /* Escape over unsaved work asks first (F2 of the 3 Nov 26 re-check) */
  const [escAsk, setEscAsk] = useState(false)
  const swapOk = useRef(false)
  /* WHO IT IS FOR (owner D654–D656; the plan §3.13). On the Inputs page the Person field is the people picker
     (ui/PeoplePick.tsx): `ppl` in the order picked, `several` its switch. The editor holds the input's ONE record,
     which carries its people (engine/inputs.ts idsOf — D756; until the one-rule build an "entry" worked out on read
     by state/inputgroup.ts, removed) — and a save for more than one person, or of an input that holds more than one,
     is ONE command (commitInput). `basePpl` is the input's people as the window last saw them: a man added or taken
     off on the page behind is followed silently — an add and a removal of different men cannot collide. */
  const [ppl, setPpl] = useState<string[]>([])
  const [several, setSeveral] = useState(false)
  const basePpl = useRef<string[]>([])
  const entryIds = useRef<string[]>([])
  const [delAll, setDelAll] = useState(false)
  /* THE QUESTIONS HANG FROM THE BUTTON PRESSED (owner D1626, D1627, 4 Nov 26): "Delete this input for all N people?" from
     Delete, "Take yourself out?" from Take me out, "Open the other input and lose them?" from the other input pressed on
     the page behind — each a card at the hand (ui/AskCard.tsx), never in the form's flow. (The old flow question opened at
     the form's foot and had to be scrolled into view, both answers with it — [GROUP-INPUT-ONE-ROW]'s walker W2; a card at
     its button stands in view with its button.) */
  const delBtn = useRef<HTMLButtonElement>(null)
  const outBtn = useRef<HTMLButtonElement>(null)
  /* the control that asked for the other input — its bar on the calendar, its card in the opened day, + Input */
  const swapAt = useRef<HTMLElement | null>(null)
  const [takeOut, setTakeOut] = useState(false)
  /* a saved shared input's dates, being re-picked in the window (D681): true between the tap for the new start and the
     tap for the new end — see `datesHere`, below */
  const [midPick, setMidPick] = useState(false)
  /* ...and two more, from the two reads of that door (9 Oct 26). `calKey`: the calendar's month is seeded ONCE, when it
     is put on screen - and it was put on screen with the dates of the input the window held BEFORE (the new record
     arrives a render ahead of its draft), so a December input opened over an October one showed October (Astra A3).
     It is counted up where the draft is re-seeded, so the calendar is made again WITH that draft - and never on a
     tap, which would throw away a month he had turned to. `datesPicked`: he has tapped the calendar since the window
     took its dates. A first tap ON the saved day leaves the dates as they were, and "not different from what was
     saved" read as "not touched": a move made behind the window then replaced his start without a word (Sol 3). */
  const [calKey, setCalKey] = useState(0)
  // eslint-disable-next-line react-doctor/rerender-state-only-in-handlers -- read by the record-follow effect after a paint (below), beside the draft it qualifies; kept as state so the two can never disagree in one render; moved whole from inputedit.tsx on 3 Nov 26 with this finding already on it (D1534: the area's findings ride with its batch)
  const [datesPicked, setDatesPicked] = useState(false)
  /* THE INPUT IS ONE RECORD WITH ITS PEOPLE (the one-rule build, step 2 (g) — owner D756): `rows` is that record while
     it is live (one, or none), and `recPpl` who is in it. "Several people" is asked of the PEOPLE, never of a count of
     records. */
  const rows: any[] = r && !isNew && INPUTS.indexOf(r) >= 0 ? [r] : []
  const recPpl: string[] = rows.length ? idsOf(r).map(String) : []
  /* …AND WHEREVER A SHARED INPUT IS OPENED FROM (`[GROUP-INPUT-ONE-ROW]`; owner D661, D734 — "the same as doing it in the
     input's own window"; the plan 2026-10-10-group-input-one-row-plan.md §4.5: "the dialog opened from the row or the
     line is the entry's throughout"). The schedule draws a shared input as ONE row, and the dialog a tap on it opened
     was the one-man form: off the Inputs page `picker` was false, so `grouped` was, and Save wrote the one record the
     dialog happened to hold — that man then stood as a row of his own (the re-walk's picture G5b). The dialog of an
     entry of several is the ENTRY's now: its people in the picker, Save the entry's one command, Delete "for all",
     its OIL lines counting every man. Its DATES stay not editable there (`datesHere` asks for the Inputs page): a
     moved span would take the row off the day it was opened from. A one-man input's dialog is the form it was.
     HIS OWN RULE SINCE D748 (11 Oct 26), on seeing the one-man form over a line of four pucks: "when I click on personal
     inputs it just shows a single user to be selected for an input that had multiple inputs. Shouldn't it be the
     same? That it shows multiple inputs to edit from there". */
  const picker = (win || recPpl.length > 1) && ctx !== 'up'
  const grouped = picker && (ppl.length > 1 || recPpl.length > 1)
  const csOf = (p: any) => (PEOPLE[p] ? PEOPLE[p].cs : String(p ?? ''))
  /* MAY THIS INPUT HOLD A PLACEHOLDER? — the one body, asked of the draft as it stands: its kind and its dates. The
     picker greys its two placeholder pucks by it and the Save refuses with the same sentence (step 3 of the one-rule
     build — owner D750, D753). NOT where the saved input is filed: one under Unavailable that takes a placeholder goes
     back onto the programme at the save (commitInputEdit, commitInput), as it always has. */
  const phWhy = (id: string) => (draft ? placeholderWhy({ ...draft, person: id }) : '')
  /* re-seed whenever a different row is opened, never on a repaint — a
     re-seed mid-edit would throw away what has been typed. The bell's
     hand-off (pops.OILASK) is consumed HERE: opened on the flagged row, the
     OIL sheet comes straight up over the dialog so the tap lands on the
     question itself — one-shot, cleared as it is read. */
  useLayoutEffect(() => {
    /* the same record, found again after a refused save (stay, below): what he typed is kept */
    if (keepDraft.current) { keepDraft.current = false; shown.current = r; return }
    /* …and the same record found again after a save tried and thrown away (giveBackCuts — D1023): nothing about it
       changed, so nothing typed is thrown away either. Only while it was already this window's record. */
    if (INPEDIT_REFOUND) {
      setInpEdit(r)                                    // consumed: a later re-find is judged afresh
      if (shown.current && r && shown.current.iid != null && String(shown.current.iid) === String(r.iid)) { shown.current = r; return }
    }
    /* ONE EDITOR AT A TIME (the plan §3.7): the page behind a window works, so another input can be asked for while
       this one holds changes nobody has saved. It is not replaced under him: the window keeps the first, and asks. */
    const prev = shown.current
    const other = !!prev && !!r && r !== prev && !(prev.iid && prev.iid === r.iid)
    /* ... and WHO IT IS FOR is his work too (the same bug check - Astra's M2): the picked people are held apart from
       the draft's fields, so a third man added to a shared input, and nothing else touched, was thrown away without
       a word when another input was opened. Compared as a set - picked and un-picked again is no change. */
    const hadPpl = new Set(basePpl.current)
    const pplTouched = ppl.length !== hadPpl.size || ppl.some(id => !hadPpl.has(id))
    if (win && other && !swapOk.current && draft && base.current && (pplTouched || WIN_FIELDS.some(f => !fieldSame(f, draft, base.current)))) {
      /* hung from the other input as a whole — its bar, its list row — where the press landed inside one */
      { const p = lastPressed(); swapAt.current = (p?.closest('[data-iid]') as HTMLElement | null) || p }
      setSwap(r); keepDraft.current = true; setInpEdit(prev); notify()
      /* ...AND IT ASKS FROM THE FRONT (`[TITLE-CHECK-SEEN]` 4, 10 Oct 26). The press that asked for the other input landed
         on another window first — a card of the opened day — and that window took the front, as any pressed window
         does: this one put its question up BEHIND it. On a phone the day's window is nearly the whole screen, so
         nobody saw a question at all until the day was closed. The window that asks comes forward. */
      /* …unless the press was in another window (a card of the opened day): the question now hangs from that card, drawn
         in that window (D1627), so that window keeps the front and the card stays in view, as drawn for him */
      if (!swapAt.current?.closest('.floatwin')) bringForward('inputedit')
      return
    }
    swapOk.current = false
    shown.current = r
    base.current = r ? draftOf(r) : null
    madeOver.current = {}
    setClash([]); setSwap(null); setEscAsk(false)   // the unsaved question goes with the record it asked about (the code read of 3 Nov 26, F-A4)
    setDraft(r ? draftOf(r) : null); setUpConf(null); setMedConf(null); setOilConf(null); setDocConf(null)
    /* who it is for: a saved input's own list; a new one's seed names its one person */
    const p0 = !r ? [] : r._new ? [String(r.person ?? '')] : idsOf(r).map(String)
    setPpl(p0); setSeveral(p0.length > 1); basePpl.current = p0; entryIds.current = r && !r._new ? [r.iid] : []
    setDelAll(false); setTakeOut(false); setMidPick(false); setDatesPicked(false); setCalKey(k => k + 1)
    if (r && !r._new && OILASK && r.iid === OILASK) {
      /* …or the question was raised from the input's ROW on the schedule (ui/reqdoor.ts afterPut / replace / rowMove →
         askOilIfPending(r, true); pops.ts OILOWN carries the mark): it is the INPUT's one question (owner D762 —
         D744's "his alone" has nothing left to ask), and the dialog shuts with the sheet (`shut`), answered or not:
         whoever put the person on the row was on the schedule, not in the input's window. Nothing to ask after all
         (the day stopped asking): the dialog is not left standing open for no reason. */
      const one = OILOWN
      setOilAsk(null)
      const g = oilGate(draftOf(r), r)
      /* the bell's question to a man about his OWN record inside a shared input he did not file: his answer alone */
      /* (the question is the INPUT's — one answer, given by whoever may change it: owner D762. Nobody in it has an
         answer of his own any more.) */
      if (g.kind === 'ask') setOilConf(one ? { ...g, shut: true } : g)
      else if (one) { setInpEdit(null); notify() }
    } else if (OILASK && !r) setOilAsk(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seeds only when a different record is opened; on a repaint it would throw away what he has typed
  }, [r])
  /* THE RECORD BEHIND THE WINDOW. After every paint of the page the window asks what its record now is:
       · GONE (deleted on the page behind, or taken away by an Undo) — the window closes and says so;
       · the same record as a NEW object (a refused command and an Undo both put the list back as new objects) — it
         holds that one, without throwing away what he typed;
       · CHANGED — a field he has not touched takes the live value silently; one changed both ways is listed, with what
         theirs is and what his is, and waits for his choice; Save is refused until he has made it.
     So a Save writes only his own changes over the record as it stands (the plan §3.7). */
  // eslint-disable-next-line react-hooks/exhaustive-deps -- after every paint on purpose (any store change can alter the record behind the window); it sets state only when something differs, so it settles
  useLayoutEffect(() => {
    if (!win || !r || isNew || !draft) return
    /* NOT WHILE IT IS ASKING. When another input is asked for over unsaved work, the effect above keeps the first one
       and puts it back — but for that one paint `r` IS the other input, and this step took it for the window's own
       record changed behind it: it said "Changed while this window was open: people — X added, Y taken off", said the
       reverse a moment later, and put the saved people back over the ones he had picked (the calendar job's bug check,
       8 Oct 26 — found writing the test for a people-only change). The window follows only the record it is SHOWING. */
    if (shown.current !== r) return
    const now = INPUTS.find((x: any) => x.iid === r.iid)
    if (!now) {
      HOOKS.toast('That input was removed while its window was open, so the window has closed', 'warn'); close(); return
    }
    if (now !== r) { keepDraft.current = true; setInpEdit(now); notify(); return }
    /* THE PEOPLE, FOLLOWED: a man added or taken off behind the window is added or taken off in it, and said once */
    const liveP: string[] = idsOf(now).map(String), bp = basePpl.current
    entryIds.current = [now.iid]
    if (liveP.join('\u0000') !== bp.join('\u0000')) {
      const bpSet = new Set(bp), liveSet = new Set(liveP), pplSet = new Set(ppl)
      const added = liveP.filter(p => !bpSet.has(p)), removed = bp.filter(p => !liveSet.has(p)), removedSet = new Set(removed)
      basePpl.current = liveP
      const next = [...ppl.filter(p => !removedSet.has(p)), ...added.filter(p => !pplSet.has(p))]
      setPpl(next.length ? next : liveP)
      if (next.length > 1) setSeveral(true)
      const what = [added.length ? added.map(csOf).join(', ') + ' added' : '', removed.length ? removed.map(csOf).join(', ') + ' taken off' : ''].filter(Boolean).join(', ')
      if (what) HOOKS.toast('Changed while this window was open: people — ' + what, 'info')
    }
    const cur = draftOf(now), b = base.current
    if (!b) { base.current = cur; return }
    if (WIN_FIELDS.every(f => fieldSame(f, cur, b))) return
    let next = draft
    const hit = new Set(clash)
    for (const f of WIN_FIELDS) {
      if (fieldSame(f, cur, b)) continue                                   // not changed behind him
      /* a date he has TAPPED is his, even where the tap was on the day already saved (`datesPicked`, above) */
      const tapped = datesPicked && (f.k === 'start' || f.k === 'end')
      if (!tapped && fieldSame(f, draft, b)) { next = { ...next, ...fieldPart(f, cur) }; delete madeOver.current[f.k] } // he has not touched it: theirs, silently
      else if (!fieldSame(f, draft, cur)) {                                // changed both ways…
        if (!madeOver.current[f.k]) madeOver.current[f.k] = b
        /* …unless the record is BACK to what his change was made over (`madeOver`, above): nothing is in dispute */
        if (fieldSame(f, cur, madeOver.current[f.k])) hit.delete(f.k)
        else hit.add(f.k)
      }
      else { hit.delete(f.k); delete madeOver.current[f.k] }               // both made the same change
    }
    base.current = cur
    if (next !== draft) setDraft(next)
    const wasClash = new Set(clash)
    if (hit.size !== wasClash.size || [...hit].some(k => !wasClash.has(k))) setClash([...hit])
    /* …and where the same fields stay in dispute, the note is drawn again: it prints "theirs" from `base`, which has
       just moved, and nothing else would repaint it — a second change behind him left the first value on screen
       (found by this batch's own control test, 10 Oct 26). Once: the next pass finds the record as `base` and stops. */
    else if (hit.size) redraw(n => n + 1)
  })
  /* THE TILL-DATE TICK'S DEFAULT FOR THE DATES IN THE WINDOW (owner D951–D953). A hand choice is weighed against it at the
     SAVE, not while the dates are being picked: a range is picked in two taps, and between them the window holds a start
     alone — one day — so a hand untick on a several-day leave would be dropped by the first tap of a re-pick (the
     scenario designer's 1, 17 Oct 26). What is saved is what reading 2 asks: the dates as saved against the default the
     choice was made over — kept where they keep it, replaced where they flip it (engine/inputs.ts tillSettle, run by the
     save's own write). */
  const draftTillDef = draft ? tillDefaultISO(draft.type, draft.start, draft.end) : true
  /* asked before every write, and again after any blocking question (an upchit, OIL or clash sheet) — the record may
     have been changed behind the window while the question stood */
  const undecided = () => {
    if (!win || !clash.length) return false
    setUpConf(null); setMedConf(null); setOilConf(null); setDocConf(null)
    HOOKS.toast('Choose which to keep first — your change, or the one made while this window was open', 'warn')
    return true
  }
  useEffect(() => {
    if (!open) return
    /* Escape peels one layer: whichever sheet is up first, then the dialog —
       all are deps so the handler never closes the dialog under a sheet */
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      /* A SHEET OF ANOTHER'S OVER IT ANSWERS FIRST (the walk of 24 Oct 26, D12): with the document viewer opened from this
         window, one Escape closed the viewer AND this window behind it — this handler runs before the viewer's, on the
         same document. With none of its own questions up, it leaves Escape alone while the topmost keyboard-holding sheet
         is not this window (ui/sheetfocus.ts topSheet); the next Escape is its own. */
      /* the swap's question hangs from the card pressed, drawn in THAT window and in front with it (D1627): Escape is its
         answer, whichever window holds the front (the walk of 4 Nov 26, S3 on a phone: it closed the opened day instead) */
      if (!docConf && !upConf && !medConf && !oilConf && !escAsk && !swap) {
        const top = topSheet()
        const own = box.current && (box.current.closest('.floatwin') || box.current)
        if (top && own && !own.contains(top)) return
      }
      /* as a window it does not own the page: Escape typed in a box on the page BEHIND it is that box's own (a cell
         being edited puts its text back on Escape) — the shell's own rule, ui/FloatWindow.tsx */
      if (win) {
        const a = document.activeElement as HTMLElement | null
        const mine = !!a && !!box.current && !!box.current.closest('.floatwin')?.contains(a)
        if (!mine && a && a !== document.body && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return
        /* AND IT IS THE FRONT WINDOW'S (D641; the calendar job's bug check, 8 Oct 26 - Astra's M1, seen in the running
           build): with the settings window opened over this one, Escape closed THIS editor - the one behind - and
           lost what he had typed, because this handler runs first and never asked which window was in front. With
           none of its own questions up, the editor takes Escape only when it is the front window; otherwise the
           key is left for the shell, which closes the front one (ui/FloatWindow.tsx). A question of its own (the
           OIL, upchit, medical or document sheet) blocks the page, so it still answers first. */
        /* The unsaved-work question is NOT one of those: it sits in this window and blocks nothing behind it, so with
           another window brought in front of it, that one is Escape's (the bug check of 3 Nov 26, walker W1 S08 — the
           question answered "Keep editing" and the settings window in front stayed up). */
        if (!docConf && !upConf && !medConf && !oilConf && !swap && frontWin() !== 'inputedit') return
      }
      e.preventDefault()
      e.stopPropagation()
      if (docConf) setDocConf(null)
      else if (upConf) setUpConf(null)
      else if (medConf) setMedConf(null)
      else if (oilConf) setOilConf(null)
      /* its own question up: Escape is "Keep editing" — the swap's too (another input asked for over unsaved work: the bug
         check of 3 Nov 26, walker W1 S07 — Escape did nothing there) */
      else if (swap) setSwap(null)
      else if (escAsk) setEscAsk(false)
      /* the foot's questions hang from their buttons now (D1627): Escape is their safe answer, Keep or Stay in */
      else if (delAll) setDelAll(false)
      else if (takeOut) setTakeOut(false)
      /* A WINDOW HOLDING TYPED WORDS ASKS FIRST (F2 of the 3 Nov 26 re-check): one Escape threw away what was typed, with
         no word. With anything of his not saved — a field, or who it is for — it asks; nothing typed, it closes. */
      /* (the Inputs page's window; the schedule's pop-up closes on a tap outside it as well, and keeps that way) */
      else if (win && unsavedNow()) { setEscAsk(true); bringForward('inputedit') }
      else close()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- unsavedNow reads the draft and the people, which re-render this effect's owner; the listed deps re-arm it on every question that changes what Escape peels
  }, [open, win, upConf, medConf, oilConf, docConf, escAsk, swap, delAll, takeOut, draft, ppl])

  const close = () => { setEscAsk(false); setInpEdit(null); notify() }
  /* anything of his not saved: a field of the window, or who it is for (the swap's own test, above) */
  const unsavedNow = () => {
    if (!draft || !base.current) return false
    const had = new Set(basePpl.current)
    const pplTouched = ppl.length !== had.size || ppl.some(id => !had.has(id))
    return pplTouched || WIN_FIELDS.some(f => !fieldSame(f, draft, base.current))
  }
  /* THE WINDOW'S ✕ ASKS AS ESCAPE DOES (owner D1622, 3 Nov 26): with anything of his not saved, ✕ puts up the same
     "Close it and lose them?" question — a ✕ is easy to hit by mistake; with nothing typed it closes at once. Cancel keeps
     `close` and asks nothing: it already means "throw this away". Pressed again while the question stands it changes
     nothing (the question stays); over the swap's question it asks the close question in its place. */
  const askClose = () => {
    if (unsavedNow()) { setSwap(null); setEscAsk(true); bringForward('inputedit') }
    else close()
  }
  /* the "?" card beside Type takes Escape only while this window is the one in front (ui/TypeLegend.tsx) */
  const legendFront = useRef(() => frontWin() === 'inputedit').current
  /* A REFUSED SAVE KEEPS THE WINDOW, ON THE RECORD, WITH WHAT HE TYPED ([INPUT-SAVE-SAYS-OK-WHEN-REFUSED]; the plan
     §3.13: "his Save is refused with the sentence, the window stays"). A refused command puts the list back as new
     objects, so the record this window holds is no longer the one in the list: find it again by its id and hold
     that — WITHOUT re-seeding the draft, which the effect above would do for any newly opened row. A new input's
     seed is in no list and simply stays; a record that is truly gone closes the window, as it always did. */
  const stay = () => {
    if (!r || r._new) return
    const live = INPUTS.find((x: any) => x.iid === r.iid)
    if (!live) { close(); return }
    if (live !== r) { keepDraft.current = true; setInpEdit(live); notify() }
  }
  /* a refusal KEEPS the dialog open, so nothing typed is lost — bar the one
     refusal there is no way back from: the row went (an undo under the modal),
     and there is nothing left to hold the typing for */
  /* THE SAVE AND ITS OWN WORD ARE ONE NOTE (found by the gate run of the design vet's build, 10 Oct 26). The app has one
     passing note, whose words the next one replaces. A save can say something of its own as it is written — the Leave
     War's door: "Ammo's LL replaces the LL bid on 11 Feb", "the leave is cut for the ATT C" — and this window then said
     "Input added" over it in the same instant. While the List had its own add form (which said nothing after a
     one-person add) that sentence was read there; with the form gone (D729, V1) the window is the page's one maker,
     and the sentence would have been covered on every filing. So every save of this window runs inside ONE note
     (engine/hooks.ts toastBatch — the publish command's way): what the save said and "Input added" are said together,
     in order, in the stronger colour. A refused save still says its one sentence alone — nothing is joined to it,
     because the window says "added" only after a save that happened. */
  /* WHAT A SAVE SAYS, AND WHERE IT SAYS NOTHING (owner D851, 14 Oct 26 — "Why 1 needs an input added note? Isint it obvious
     when the input appears after it’s been added?"; D854 — "Yes to all": "Input updated" the same; the design guide's
     §1, D850). The Inputs page shows the input just saved where it stands — the List's row or card, the month's bar,
     the opened day's card — wearing the just-added mark, and where it can be SEEN there the window says nothing more:
     the mark is the feedback, and a screen reader is told the words (ui/seen.ts, which decides it on the screen).
     The words are still said, as they always were:
       · where the page was not asked to show it, or is not the page in front — a save made from the schedule (its row
         there wears no such mark), and "Input added to the Ground Programme", which is never this note's;
       · where the save had a word of its own — a warning that goes with it stays ONE note with these words (above);
       · where, shown, it still cannot be seen (a window over it; a view that does not draw it). */
  /* NOT FROM THE MEDICAL TAB (the code read of [MEDICAL-CARDS-3], 17 Oct 26 — finding 4): asked to show a saved input,
     the page turns the Inputs and SANS calendars to its month; from the Medical tab ("+ Medical", D963) neither calendar
     is in view, so a filing for July turned his November away unseen. There the new card is the feedback and the note
     is said (nothing there wears the just-added mark).
     …UNTIL HIS D1300 (24 Oct 26): the new card wears it now — the Medical tab is asked to show the input (its own reveal,
     which turns no calendar), and where the card can be seen the note is left unsaid, as on the List. */
  const onMedTab = () => CURPAGE === 'inputs' && INPVIEW === 'med'
  const show = (row: any, want: boolean) => want && !!row && (onMedTab() ? revealMedInput(row) : revealInput(row) && CURPAGE === 'inputs')
  const saidSaved = (row: any, shown: boolean, words: string) => {
    if (!shown || toastHeld()) HOOKS.toast(words, 'ok')
    else noteUnlessSeen(String(inpId(row)), words, 'ok')
  }
  const doSave = (removals: any[], oilDec?: Record<string, number>) => HOOKS.toastBatch(() => saveNow(removals, oilDec))
  const saveNow = (removals: any[], oilDec?: Record<string, number>) => {
    if (undecided()) return
    if (medPlanProtected(removals.map(row => ({ row })))) return medicalLocked()
    /* FOR SEVERAL PEOPLE, OR AN INPUT THAT HOLDS SEVERAL: one command for the one record (commitInput) — the OIL
       answer, asked once, is the input's ONE answer for everyone in it (D762; first D660) */
    if (grouped) {
      const had = new Set(INPUTS.map((x: any) => x.iid))
      const rec = isNew ? null : r
      /* F1 for an input of several too (the code read of 3 Nov 26): every field, its "To" and "Goes to", and who is in it
         as the record has them, no OIL answer or removal riding along — the window just closes, saying nothing */
      if (rec && !oilDec && !removals.length) {
        const saved = draftOf(rec), inIt = new Set(idsOf(rec).map(String))
        if (WIN_FIELDS.every(f => fieldSame(f, draft, saved)) && String(draft.to ?? '') === String(saved.to ?? '')
          && (!('goes' in draft) || draft.goes === saved.goes) && ppl.length === inIt.size && ppl.every(id => inIt.has(String(id)))) { close(); return }
      }
      if (commitInput(rec, draft, ppl, oilDec ? { oil: oilDec } : undefined)) {
        const row = (rec && INPUTS.indexOf(rec) >= 0 ? rec : null) || INPUTS.find((x: any) => !had.has(x.iid))
        saidSaved(row, show(row, true), isNew ? (ppl.length > 1 ? `Input added for ${howMany(ppl)}` : 'Input added') : 'Input updated'); close()
      } else stay()
      return
    }
    if (isNew) {
      let savedRow:any=null
      const ok = saveBatch(() => {
        const ok = commitNewInput(draft, ctx === 'g', undefined, undefined, row=>{savedRow=row})
        /* the OIL answers land on the just-unshifted row, inside the same
           batch, so the add and its acknowledgment are ONE undo step */
        if (ok && oilDec) savedRow.oil = oilDec
        if (ok && removals.length)
          applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
        return ok
      })
      if (ok) {
        const shown = show(savedRow, r._calendar || CURPAGE === 'inputs')
        /* the place it is drawn: an input for ALL / ALL AVAIL stands on the Common Programme (owner D955) */
        /* …and from the Ground panel an input filed under Unavailable says so (the code read's F1) */
        if (ctx === 'g') HOOKS.toast(savedRow && savedRow.acc === 'u' ? 'Input filed under Unavailable' : `Input added to the ${progOf([...ppl, draft && draft.person])}`, 'ok'); else saidSaved(savedRow, shown, 'Input added')
        close()
      }
      return
    }
    /* AN OIL ANSWER ALONE IS NOT A CHANGE TO THE INPUT (both readers of the input card's check, 10 Oct 26). "Answer…" and
       "Change…" came through the full save below, which stamps the input's late date with today — so an on-time input
       turned LATE for having its OIL question answered after the cut-off. The desktop row's chip never did that
       (ui/InputsPage.tsx reviseOil), and since the phone's card has no chip (D723) this window is the phone's only
       way to an answer. Where nothing of the input itself differs from the record as it stands, the answer is written
       by itself — who answered and when is stamped, the late date is not moved — one step, one Undo. Anything he has
       also changed goes through the full save, answer and change together, as before. */
    /* A SAVE WITH NOTHING CHANGED CHANGES NOTHING (F1 of the 3 Nov 26 re-check — the Inputs batch [INPUTS-FIXES-1103]):
       Save pressed on an input as it stands wrote "changed by" and the time, an Undo step of its own and the just-changed
       mark — for nothing. Where every field of the window, an Attach's "To" and an Other's "Goes to" included, is the
       record's own, and no OIL answer or medical removal rides the save, the window just closes. */
    const saved = draftOf(r)
    if (!oilDec && !removals.length && WIN_FIELDS.every(f => fieldSame(f, draft, saved))
      && String(draft.to ?? '') === String(saved.to ?? '') && (!('goes' in draft) || draft.goes === saved.goes)) { close(); return }
    if (oilDec && !removals.length && WIN_FIELDS.every(f => fieldSame(f, draft, saved))) {
      if (!mayEditInput(r) || protectedInput(r)) { stay(); return }
      const s = saveBatchX(() => { r.oil = { ...oilDec }; stampChanged(r); return true })
      if (s.ok) { if (CURPAGE === 'inputs' && !onMedTab()) revealInput(r); HOOKS.toast('OIL answer saved', 'ok'); close() }
      else if (s.refused) stay()
      else if (INPUTS.indexOf(r) < 0) close()
      return
    }
    const s = saveBatchX(() => {
      const ok = commitInputEdit(r, draft)
      if (ok && oilDec) r.oil = oilDec
      if (ok && removals.length)
        applyMedPlan(removals.map((lr: any) => ({ row: lr, action: 'delete', why: 'removed with the upchit' })))
      return ok
    })
    if (s.ok) { saidSaved(r, show(r, CURPAGE === 'inputs'), 'Input updated'); close() }
    else if (s.refused) stay()
    else if (INPUTS.indexOf(r) < 0) close()
  }
  /* the clash sheet's Save — resolve the choices into kept segments, file
     the draft as the first and mint the rest, all one undo step */
  const doMedSave = (choices: string[], keepTail: any[]) => HOOKS.toastBatch(() => medSaveNow(choices, keepTail))
  const medSaveNow = (choices: string[], keepTail: any[]) => {
    if (undecided()) return
    const segs = medKeptSegments(medConf.a, medConf.b, medConf.clashes, choices)
    if (!segs.length) return          // toasted; the form stays open, unwritten
    if (medSegmentsProtected({ ...draft, yr: isNew ? baseYear() : r.yr }, segs, keepTail, medConf.b, isNew ? null : r)) return medicalLocked()
    const g0 = segs[0]
    const d2 = {
      ...draft,
      start: ordISO(g0.startOrd),
      end: g0.endOrd > g0.startOrd ? ordISO(g0.endOrd) : '',
      remarks: remarksTyped(draft.remarks, draft),     // the date is printed from the dates (D948)
    }
    let savedRow:any=isNew?null:r
    const s = saveBatchX(() => {
      const ok = isNew ? commitNewInput(d2, ctx === 'g', keepTail, medConf.b, row=>{savedRow=row}) : commitInputEdit(r, d2, keepTail, medConf.b)
      /* the commit's own trim only cuts rows the first segment overlaps —
         all of them chosen losers, since kept rows sit outside every
         segment; the later segments land as sibling rows, each trimmed the
         same way. keepTail carries the filer's per-leftover Remove/Keep so a
         tail is minted only where kept (owner, 28 Aug 26) */
      if (ok) mintMedSegments(savedRow, segs.slice(1), keepTail, medConf.b)
      return ok
    })
    if (s.ok) { saidSaved(savedRow, show(savedRow, r._calendar || CURPAGE === 'inputs'), isNew ? 'Input added' : 'Input updated'); close() }
    else if (s.refused) stay()
    else if (!isNew && INPUTS.indexOf(r) < 0) close()
  }
  /* `skipDoc` is reserved for the DocConfirm "No document" resume (owner,
     [SYNC-INTEG]); a plain click/Enter must pass FALSE, never React's event
     object — see the bindings below (SYNC-002). */
  const save = (skipDoc = false) => {
    if (undecided()) return
    /* A NEW INPUT WITH NO DATE PICKED IS REFUSED FIRST, in the List's own old sentence (D729 — V1: the List's "+ Input"
       opens this window with no date). Before every question: the OIL and the medical questions below would otherwise
       be asked about a day nobody chose (a blank date reads as the loaded week's Monday — engine fmt). */
    if (isNew && r._calendar && draft && !draft.start) { HOOKS.toast('Pick a start date on the calendar first', 'warn'); return }
    /* an input for ALL AVAIL / ALL that may not be saved is refused FIRST — before the picker's own line, the document
       question and every sheet ([INPUT-ALL-AVAIL]) */
    if (draft && placeholderRefused(several && picker ? { ...draft, person: ppl.find(p => isSpecial(p)) ?? draft.person } : draft)) return
    if (picker && draft) {
      /* nothing is substituted for what he picked: people he may not file this kind for refuse the save, in the
         picker's own sentence */
      const pb = pickProblem(ppl, several, draft.type, phWhy)
      if (pb) { HOOKS.toast(pb.why, 'warn'); return }
    }
    if (grouped && draft) {
      /* ONE QUESTION FOR THE ENTRY (D660): the days and the hours are every man's alike, so the amounts are. A man
         added to an entry already answered is answered for by whoever adds him — the sheet comes back, with the
         standing answers ticked */
      /* NEVER INTO A MEDICAL ENTRY BY THIS BRANCH (Astra's read of the calendar job's bug check, 8 Oct 26 — R1, seen
         failing in `groupeditor.test.tsx`): this branch returns before the document ask, the upchit summary and the
         medical-clash question, and a shared meeting whose kind was changed to a medical one and whose people were cut
         to one was SAVED through it with none of them asked. A medical entry is one person's own: the others are taken
         out and saved first, and the kind is changed after — by the one-person save, which asks them all. */
      if (needsDoc(draft.type) || isUpchit(draft.type)) {
        HOOKS.toast('A medical entry is one person’s own. Take the other people out and save, then change its kind.', 'warn')
        return
      }
      /* ONE QUESTION, ONE ANSWER, FOR THE INPUT (owner D762): asked of the one record against the new hours. Someone
         ADDED follows the answer the input carries — nothing is asked for him where it is answered (D755 (1)). */
      const rec = rows[0] || null
      const g = oilGate({ ...draft, person: rec ? leadOf(rec) : ppl[0] }, rec)
      if (g.kind === 'refused') return
      if (g.kind === 'ask') { setOilConf(g); return }
      doSave([])
      return
    }
    /* THE DOCUMENT ASK runs FIRST (owner, [SYNC-INTEG]): saving a NEW medical
       with no certificate opens [Upload] / [No document] before anything else,
       so "No document" then flows on through the upchit-summary / downchit-clash
       / OIL pipeline exactly as an attached one would. */
    if (!skipDoc && draft && docGate(draft, isNew ? null : r) === 'ask') {
      setDocConf({
        who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
        typeLabel: draft.type,
        leave: isLeave(draft.type),
      })
      return
    }
    /* an upchit is NEVER saved silently (owner, 27 Aug 26): the summary sheet
       runs first — what it ends, and an explicit Keep/Remove on every
       later-dated entry. A missing date skips straight to the commit, whose
       own refusal says so; the removals ride doSave's batch as one undo step
       (the nested batch's inner push is a no-op under the outer). */
    if (draft && isUpchit(draft.type) && draft.start) {
      /* run the shared refusals FIRST — a missing document or a junk upchit
         should toast at once, not after the summary was already shown */
      if (!normalizeInputDraft(draft, isNew ? null : r)) return
      /* moved later, it gives days back (D999) — and each leave and bid of his those days will cut is said here too
         (D1023): the same ask the calendar's drag puts (medAskFor), which tries the save the sheet's Save runs; a new
         upchit gives nothing back */
      const ask = isNew ? null : medAskFor(r, { ...draft })
      if (ask === 'refused') return
      setUpConf(ask && ask.kind === 'up'
        ? { who: ask.who, dateLabel: ask.dateLabel, effects: ask.effects, cuts: ask.cuts }
        : {
          who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
          dateLabel: fmt(draft.start),
          effects: upchitEffects(draft.person, isoOrd(draft.start), isNew ? null : r),
          cuts: [],
        })
      return
    }
    /* a DIFFERENT-type medical overlap is asked about, never resolved
       silently (owner, 27 Aug 26 — the clash sheet); same refusal-first
       order as the upchit path */
    if (draft && isDownchit(draft.type) && draft.start) {
      if (!normalizeInputDraft(draft, isNew ? null : r)) return
      /* the days the save will take — `isoOrd`, as `medAskFor` reads them (the record's old year is not theirs) */
      const a = isoOrd(draft.start)
      const b = isoOrd(draft.end || draft.start)
      const clashes = medClashes(draft.person, draft.type, a, b, isNew ? null : r)
      if (clashes.length) {
        setMedConf({
          who: PEOPLE[draft.person] ? PEOPLE[draft.person].cs : String(draft.person || ''),
          newType: draft.type,
          /* printed as the sheet's body prints its dates: day first, the year two digits where it is another (D1096) */
          span: fmtDay(draft.start) + (draft.end && draft.end !== draft.start ? ' – ' + fmtDay(draft.end) : ''),
          clashes, a, b,
        })
        return
      }
    }
    /* a duty-&-commitments input over a weekend/PH is never credited — or
       skipped — silently (owner, 28 Aug 26): the OIL ask runs before the
       write, and its decisions ride doSave's batch. Disjoint from the two
       medical branches by type, so at most one sheet ever gates a save. */
    const g = oilGate(draft, isNew ? null : r)
    if (g.kind === 'refused') return
    if (g.kind === 'ask') { setOilConf(g); return }
    doSave([])
  }
  /* a shared input is deleted for everyone only after it is asked (the day's own question — the plan §3.13) */
  const del = () => {
    if (recPpl.length > 1) { setDelAll(true); return }
    /* an upchit whose delete gives a downchit its days back says so first (D1022); any other delete goes at once (D792) */
    const back = upchitDeleteAsk(r)
    if (back) { setUpConf({ ...back, del: true }); return }
    delNow()
  }
  /* THE DELETE SPEAKS IN ONE BATCH WITH ITS RULES, as a save does (doSave): leave a give-back now covers is cut by the Leave
     War's rules inside the same command, and their warning must not be wiped out by "Input deleted" (the fresh read of
     18 Oct 26, finding 1 — D1022) */
  const delNow = () => HOOKS.toastBatch(() => { if (removeInput(r)) { HOOKS.toast('Input deleted', 'ok'); close() } else stay() })
  const delEntry = () => {
    const n = howMany(recPpl)
    setDelAll(false)
    if (removeInput(r)) { HOOKS.toast(`Input deleted for ${n}`, 'ok'); close() } else stay()
  }
  /* WHO THE WINDOW IS TITLED BY: its one person; for several, the first A TO Z and how many more — never whoever joined
     first (the card and the OIL question in this same window name them A to Z — D721, D727; found re-expressing the
     tests, 12 Oct 26: the list is kept in joined order since the one record, and the title had followed it). */
  const who = recPpl.length > 1 ? inputWho(r)
    : r ? csOf(isNew ? r.person : leadOf(r)) : ''
  /* READ ONLY for an input its reader may not change (the absence-record re-test, W1-F3, 26 Sep 26): a member reaching
     another man's input — the calendar's chip, the day popover's row — was shown Delete and Save, each refused only
     when pressed. The write path's own rule (perms.ts mayEditInput), asked before the form is drawn: he may still
     READ it (D211 — type, remarks, documents), with nothing offered that he cannot use. */
  const canAll = rows.length ? mayEditInput(r) : true
  const readOnly = !isNew && !!r && !mayEditInput(r)
  /* WHERE IT GOES IS A SCHEDULER'S once he has moved it (his D1388): the member's window shows where it stands, picked,
     and offers neither button — as a rejected one already does (G5) */
  const goesLocked = !isNew && !!r && !mayMovePlace(r)
  /* A MAN IN A SHARED INPUT WHO DID NOT FILE IT (D655, reading 2) reads it, and has exactly two things of his own: take
     himself out, and his own OIL answer. Anyone else only reads it. */
  /* (since the one-rule build: ONE thing of his own — take himself out. The OIL answer is the input's, given by
     whoever may change it; no man gives an answer of his own — owner D762, D755 (3).) */
  const mineRow = recPpl.length > 1 && !canAll && recPpl.some(p => isMe(p)) ? r : null
  const takeMeOut = () => {
    const live = mineRow && INPUTS.indexOf(mineRow) >= 0 ? mineRow : null
    setTakeOut(false)
    if (live && commitInput(live, draftOf(live), idsOf(live).map(String).filter(p => !isMe(p)))) { HOOKS.toast('You are out of this input', 'ok'); close() } else stay()
  }
  /* THE DATES OF A SAVED SHARED INPUT ARE CHANGED HERE (owner D681, 9 Oct 26 — `[CAL-SHARED-DATES]`, found by Astra's
     read of the calendar job's bug check). "One shared input, shown and edited as one thing" (D655) — and no door
     changed its dates: the List's shared row opens this window (it has no edit in place: that would act on the first
     man's record alone), the window drew its date picker for a NEW input only, and a bar's drag keeps the length. So
     the window carries the same two-tap calendar for a saved entry of more than one man — on the Inputs page, and only
     for a reader who may change it for EVERYONE (`readOnly` is the write path's own rule): a man in it who did not file
     it keeps his one thing — "Take me out" — and no more. Nothing new is written: the input's ONE command
     (`commitInput`; `commitGroup` until the one-rule build) always took the dates from the draft, asks the input's one
     OIL question against the new days (D762; first D660, D682) and follows the remark's "till" word
     (`commitInputEdit`) — only the control was missing. The board's and the week's dialogs are as they were: there a
     moved span would take the row off the day it was opened from.
     AND AN ORDINARY ONE-PERSON INPUT'S TOO (owner D718, D723, 10 Oct 26 — `[INPUT-LIST-AS-DAY-CARD]`; the plan
     docs/superpowers/plans/2026-10-10-input-card-plan.md §3.1). D681's reading (7) left it "the ways it already has
     (its row in the List)" — and that row's pencil, the ONLY form that changed a saved one-person input's dates, went
     with D718 ("the edit and cross is not needed because … u can click on it to edit it"). So the window carries the
     same calendar for every saved input its reader may change. Again nothing new is written: the one-person save
     (`commitInputEdit`) always took the dates from the draft, and `save` asks every question the pencil's row asked —
     the document, the upchit's summary, the medical clash, OIL. NOT for one man's SANS commitment, which is on no
     list (D620) and keeps its own way: deleted and added again on the SANS calendar. */
  const datesHere = win && !isNew && !readOnly && ctx !== 'up' && !(recPpl.length < 2 && !!r && isSansAvail(r.type))
  /* who the window's Person list offers beyond the roster (below) */
  /* …AND FOR A NEW INPUT OF THE INPUTS PAGE, since the List's own add form went (D729 — V1, 10 Oct 26): that form was
     "where such leave is filed" — its Person list carried this group — and the window a new input opens in did not,
     so with the form gone no door could file an input for a man who has posted out. Found by the door inventory made
     before the form was removed (docs/superpowers/plans/2026-10-10-inputs-vet-plan.md §2). Not on the SANS calendar's
     "+ Commitment", nor on a pending upchit's own window: neither ever offered it. */
  const archivedHere = win && (!isNew || ctx === 'i') && canEditSched() && ctx !== 's' && !(draft && isSansAvail(draft.type)) ? archivedOptions() : []
  /* the first day whose OIL question nobody has answered, for the line that says so (below); '' where there is none */
  /* …asked of the input's ONE record, which carries everyone in it (the one-rule build, D756). Before it, of EVERY record
     of the entry, not of the one the window happened to be opened on (walker C's find, 10 Oct 26 — Astra's scenario 69:
     a shared duty whose first man had answered from his own bell read "no OIL … Change…", with no word that another man
     of it was still unanswered) */
  /* THE RECORD THE OIL LINES SPEAK FOR: the input's ONE record, wherever the window was opened from — its line states
     the input's one answer for everyone in it (`oilSummary`; owner D762, which changed D731 (4): `oilSummaryOf`'s
     "credited for 2 of 3" and a man's own line are gone, and since D748 the schedule's dialog on an input of several is
     the input's, not one man's row). The line shows while the input has an answer.
     ONE SCOPE FOR BOTH LINES (Astra's read of this batch, 10 Oct 26 — finding 2): "Not answered yet" was asked of every
     record of the entry wherever the editor stood, so the schedule's dialog on Ace's row named RANGER as unanswered —
     beside a button that answers for Ace alone. It is asked of the same records the line above it speaks for. */
  const oilRows = !isNew && r ? [r] : []
  const anyAnswered = oilRows.some(x => oilAnswered(x))
  const unanswered = oilRows.filter(x => oilUnansweredDay(x))
  const unansweredDay = unanswered.length ? oilUnansweredDay(unanswered[0]) : ''
  /* a NEW row's dates live on the DRAFT (the range picker moves them); an
     edit's stay on the row — and so does the TITLE's date, which says what is saved, while the line under the picker
     says what a Save would write */
  const when = !r ? '' : (isNew && draft && draft.start)
    /* (printed: the kept label's year in two digits — owner D1096) */
    ? shortYear(fmt(draft.start)) + (draft.end && draft.end !== draft.start ? ' → ' + shortYear(fmt(draft.end)) : '')
    /* the stored month-first labels said day-first, as the rest of the Inputs page speaks ([LW-ISO-DATES], 28 Sep 26 —
       the window's title read "Tally · Jul 24") */
    : fmtDay(unfmt(r.date, r.yr)) + (r.endDate ? ' → ' + fmtDay(unfmt(r.endDate, r.yr)) : '')
  const span = draft ? spanOf(draft.allday, draft.half) : 'all'
  /* the roster a context-bound add offers — SANS Availability is refused for
     anyone else at commit (sansRefusal), so the list should not offer them */
  const peopleFor = () => ctx === 's' ? rosterOptions().filter(id => PEOPLE[id].san) : rosterOptions()

  /* the form itself — the same fields, checks and buttons whichever chrome it stands in */
  const inner = (<>
        {draft && <div className="airpop-body inped-body" inert={readOnly || undefined}>
          {/* SCHEDULER ONLY (owner, 14 Aug 26 — "allow Unavailable to be
              editable too... even down to changing the puck"). A member
              opening their own input never reaches this dialog at all today
              (the buttons that open it only render in an admin's edit mode),
              but the gate is repeated here anyway rather than trusted to
              that — canEditSched() is the same check every other
              admin-only control in this dialog's callers already uses. */}
          {/* the upchit context comes FROM a pending card, so its person is a
              value, not a choice — the fixed-type idiom below, one row up */}
          {ctx === 'up'
            ? <div className="inped-f">
              <span className="inped-k">Person</span>
              <span className="inped-v" id="inpEditPersonFixed">{PEOPLE[draft.person] ? PEOPLE[draft.person].cs : draft.person}</span>
            </div>
            : picker
            /* ON THE INPUTS PAGE: the people picker — one person from the list, or several as pucks (D656) */
            ? <PeoplePick people={ppl} several={several} type={draft.type} sansOnly={ctx === 's' || isSansAvail(draft.type)}
              lockOne={!isNew && !canEditSched()} readOnly={readOnly}
              /* THE POSTED-OUT / ARCHIVED PEOPLE, for an admin changing a SAVED input ([INPUT-LIST-AS-DAY-CARD], 10 Oct 26 —
                 Astra's scenario 57). The List's pencil offered them in its own Person list (clearing leave is filed
                 for a man who has posted out — [ARCH-STACK] step 4, H5) and the pencil is gone (D718): without this
                 no form could move a saved input to an archived man. A NEW input's window offers them too since the
                 List's Add form — where such leave was filed — went (D729; `archivedHere`, above). */
              more={archivedHere.length ? <optgroup label="Posted out / archived">{archivedHere.map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}</optgroup> : undefined}
              moreIds={archivedHere.length ? archivedHere : undefined}
              phWhy={phWhy}
              onChange={(p, s) => { setPpl(p); setSeveral(s); if (p.length === 1 && draft.person !== p[0]) setDraft({ ...draft, person: p[0] }) }} />
            : canEditSched() && <label className="inped-f">
              <span className="inped-k">Person</span>
              <select id="inpEditPerson" aria-label="Person" value={draft.person}
                onChange={e => setDraft({ ...draft, person: e.target.value })}>
                <PlaceholderGroup type={draft.type} current={draft.person} />
                {peopleFor().map(id => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
              </select>
            </label>}
          {/* the SANS panel's add is not a choice of type at all, so a dropdown
              with one entry would only pretend it was — the type reads as a
              plain value there (owner, 19 Aug 26) */}
          {ctx === 's' || ctx === 'up'
            ? <div className="inped-f">
              <span className="inped-k">Type</span>
              <span className="inped-v" id="inpEditTypeFixed">{draft.type}</span>
            </div>
            /* ON THE INPUTS PAGE THE "?" STANDS BESIDE "TYPE" (owner D729 — V1, 10 Oct 26; ui/TypeLegend.tsx): what each
               kind means lived only in the List's own add form, which went. It is outside the field's <label>, so a
               press on the card is never a press on the list of kinds. NOT where the form cannot be used: the form
               of an input its reader may not change is inert, and a "?" inside it would be a button that is seen and
               does nothing (Astra's scenario design, 10 Oct 26) — a reader chooses no kind, and the card is one press
               away under "+ Input". */
            : <div className="inped-f">
              {win && !readOnly
                ? <span className="inped-kh"><label className="inped-k" htmlFor="inpEditType">Type</label><TypeLegend shut={!!(docConf || upConf || medConf || oilConf)} front={legendFront} /></span>
                : <label className="inped-k" htmlFor="inpEditType">Type</label>}
              <select id="inpEditType" aria-label="Type" value={draft.type}
                onChange={e => {
                  const t = e.target.value
                  /* a type with no halves cannot keep a half label — it would
                     read "(AM)" on a row the picker can no longer express.
                     Switching TO SANS Availability seeds an empty payload for
                     the picker below to fill; switching AWAY drops it — a
                     record for a different type carrying a stale sans object
                     would be dead weight nothing reads. */
                  setDraft({
                    ...draft, type: t, ...(hasHalf(t) ? {} : { half: '' }),
                    sans: isSansAvail(t) ? (draft.sans || {}) : null,
                    /* a typed title stays with a kind that takes one; a leave or a medical kind takes none, and a
                       title left behind would come back if the kind were changed again ([INPUT-OWN-TITLE]) */
                    ...(titledKind(t) ? {} : { title: null }),
                    /* re-seed the All day default on a brand-new add only, so the
                       board add agrees with the Inputs form (defaultAllday): a
                       personal commitment opens timed, leave/medical/SANS all-day.
                       An EDIT keeps whatever the saved record already carries. */
                    ...(isNew ? { allday: defaultAllday(t) } : {}),
                  })
                }}>{typeOptions(typeFilter)}</select>
            </div>}
          {/* THE INPUT'S OWN TITLE (owner D715, 9 Oct 26 — "select the type of input and it gives the user the option to
              change the name of the input … if event Is selected, event shows as the title which can be edited"; D716:
              the "Duty & other commitments" kinds only). The box SHOWS the kind's own name until something else is
              typed, so choosing a kind fills it in and changing the kind changes it — and a box nobody touched saves
              nothing (titleOf). The KIND above goes on deciding every rule; this is the name people read. */}
          {/* ENTER IS USED UP BY THE SAVE (`[TITLE-CHECK-SEEN]` 5, 10 Oct 26 — here and in Remarks, below). The save closes
              the window and the keyboard goes back to the button that opened it ("+ Input"); the SAME key press, still
              in flight, then pressed that button, and a blank "New input" opened again. `preventDefault` on the key
              down is what stops the browser handing the press on (seen in a real browser: e2e/inputs-batch2.spec.ts). */}
          {titledKind(draft.type) && ctx !== 's' && ctx !== 'up' && <label className="inped-f">
            <span className="inped-k">Title</span>
            {/* its id is NOT `inpEditTitle`: that is the dialog's own heading where this editor opens from the schedule or
                the board, and the two shared one id there (the check's walk, walker C — W3) */}
            {/* THE PENCIL INSIDE THE BOX, AT ITS RIGHT END (owner D918 — "an edit pencil icon beside the title to indicate
                that people can edit it"; D919, his pick P1 of the drawing scripts/handpass/mock-input-defaults.mjs). A
                drawing, not a button: hidden from a screen reader, and the stylesheet lets a press through it to the box
                (`.inped-pen` pointer-events) — a tap on it IS a tap on the box. The ui/icons.tsx line style, never the ✏
                glyph, which an iPhone draws as a coloured emoji. None on an input its reader may only read. */}
            <span className="inped-title">
              <input id="inpEditOwnTitle" aria-label="Title" maxLength={TITLE_MAX} autoComplete="off"
                value={draft.title == null ? inpType(draft.type) : draft.title} placeholder={inpType(draft.type)}
                onChange={e => setDraft({ ...draft, title: e.target.value })}
                onFocus={e => { if (draft.title == null) e.target.select() }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(false) } }} />
              {!readOnly && <span className="inped-pen" aria-hidden="true"><PenIcon solo /></span>}
            </span>
          </label>}
          {/* AN ATTACH SAYS WHERE TO (his D1373 — "Attach · 145 Sqn"; drawn by scripts/handpass/lw-1025-q7.mjs, SET att): one
              short box, free words, optional, shown in its name on the schedule */}
          {isFly(draft.type) && ctx !== 's' && ctx !== 'up' && <label className="inped-f">
            <span className="inped-k">To</span>
            <span className="inped-title">
              <input id="inpEditTo" aria-label="Attached to" maxLength={TITLE_MAX} autoComplete="off" placeholder="Squadron, job or exercise"
                value={draft.to ?? ''} disabled={readOnly}
                onChange={e => setDraft({ ...draft, to: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(false) } }} />
            </span>
          </label>}
          {/* AN OTHER ASKS WHERE IT GOES (his D1356, D1367–D1369; drawn by lw-1025-q7.mjs, SET q1n look C): Ground Programme
              (amber, the schedule's colour for it) or Unavailable (red) — the picked one solid with dark words, ordinary
              letters, 36 tall — and one grey line saying what the Leave War does with it (D1368, no separate tick). Not for
              ALL AVAIL / ALL, which is never under Unavailable — nor where either is among the people picked (G3). */}
          {isOther(draft.type) && !isSpecial(draft.person) && !(several && ppl.some(p => isSpecial(p))) && ctx !== 's' && ctx !== 'up' && <div className="inped-f">
            <span className="inped-k">Goes to</span>
            <div className="inped-goes">
              <div className="goespick" role="group" aria-label="Goes to">
                {([['g', 'Ground Programme'], ['u', 'Unavailable']] as const).map(([k, words]) => (
                  <button key={k} type="button" className={`goesbtn goes-${k}${(draft.goes ?? 'g') === k ? ' on' : ''}`} data-testid={`inpEdit-goes-${k}`}
                    aria-pressed={(draft.goes ?? 'g') === k} disabled={readOnly || goesLocked || (draft.goes === 'r' && !canEditSched())} onClick={() => setDraft({ ...draft, goes: k })}>{words}</button>
                ))}
              </div>
              {/* …a rejected one says so and picks neither; only a scheduler moves it (G5) */}
              <span className="inped-goesline" data-testid="inpEdit-goes-line">
                {draft.goes === 'r' ? 'Rejected by a scheduler'
                  : goesLocked ? `A scheduler moved it here: ${(draft.goes ?? 'g') === 'u' ? 'counted as away on the Leave War' : 'still counted in the Leave War’s manning'}`
                  : (draft.goes ?? 'g') === 'u' ? 'Counted as away on the Leave War' : 'Still counted in the Leave War’s manning'}
              </span>
            </div>
          </div>}
          {/* an upchit is ONE date (the write path refuses a range), picked
              plainly — defaulting to today, editable for a certificate
              signed a day or two back (owner, 27 Aug 26) */}
          {/* eslint-disable-next-line react-doctor/label-has-associated-control -- it wraps the app's own date box (DateBox), which names its control itself (its `label`); moved whole from inputedit.tsx on 3 Nov 26 with this finding already on it (D1534: the area's findings ride with its batch) */}
          {ctx === 'up' && <label className="inped-f">
            <span className="inped-k">Date</span>
            {/* the app's own date box (owner D796, D797 — over its form) */}
            <DateBox id="inpEditUpDate" label="Upchit date" value={draft.start}
              onChange={v => setDraft({ ...draft, start: v, end: '' })} />
          </label>}
          {/* the F/O/A ticks sit ABOVE the standard timing controls now, not
              in place of them (owner rework, 14 Aug 26) — SANS Availability
              is a normal timed input with one extra field, and its single
              window is the SAME 'When' block below every other half-day
              type already uses (hasHalf('SANS Availability') is true). */}
          {isSansAvail(draft.type) && <div className="inped-f">
            <span className="inped-k">Availability</span>
            <SansPicker id="inpEditSans" sans={draft.sans} onChange={sans => setDraft({ ...draft, sans })} />
          </div>}
          {/* an upchit has no hours — the date above is the whole record, so
              the When row would only offer controls that mean nothing */}
          {!isUpchit(draft.type) && <div className="inped-f">
            {/* "Duration" — the Leave War's windows and this one ask it in the same word (D1212) */}
            <span className="inped-k">Duration</span>
            <div className="inped-when">
              {hasHalf(draft.type)
                ? <SpanPicker id="inpEditSpan" span={span} onPick={m => {
                  const f = spanFields(m)
                  setDraft({
                    ...draft, allday: f.allday, half: f.half,
                    /* Custom keeps whatever is already in the boxes — the
                       point of it is to adjust the times you can see */
                    ...(m === 'custom' ? {} : { sTime: f.sTime, eTime: f.eTime }),
                  })
                }} />
                : <label className="inped-ad"><input type="checkbox" id="inpEditAllday" checked={draft.allday}
                  onChange={e => setDraft({ ...draft, allday: e.target.checked, half: '' })} /> all day</label>}
              <span className="inped-t" hidden={draft.allday}>
                <input type="time" id="inpEditStart" aria-label="Start time" value={draft.sTime}
                  onChange={e => setDraft({ ...draft, sTime: e.target.value, half: '' })} />
                <input type="time" id="inpEditEnd" aria-label="End time" value={draft.eTime}
                  onChange={e => setDraft({ ...draft, eTime: e.target.value, half: '' })} />
              </span>
            </div>
          </div>}
          {/* the mandatory supporting document (owner, 27 Aug 26) — drawn for
              exactly the types whose commit demands one (needsDoc is the one
              body for both), so the button never appears where the file is
              not wanted and never hides where it is */}
          {/* …FOR EVERY KIND since M3 7.4 (owner D1150): a leave shows it was applied for and approved in the official
              leave system; a medical's is still the one asked and guarded (needsDoc) */}
          <div className="inped-f">
            <span className="inped-k">Document</span>
            {/* a chip opens its file (D1292, D1159 — the one Document button everywhere): the page the window's own fields
                name now, a file not yet saved included; who placed it, from the saved entry */}
            <DocField ids={draft.docIds} onIds={ids => setDraft({ ...draft, docIds: ids })}
              viewRow={() => ({
                person: draft.person, type: draft.type, allday: draft.allday, date: fmt(draft.start),
                ...(draft.end && fmt(draft.end) !== fmt(draft.start) ? { endDate: fmt(draft.end) } : {}),
                remarks: draft.remarks || '',
                ...(r && !r._new && r.by != null ? { by: r.by, at: r.at } : {}),
              })} />
          </div>
          {/* THE REMARKS BOX HOLDS ONLY WHAT A PERSON TYPES (owner D948, 16 Oct 26 — his D946: "a dedicated remarks box just
              for free text that is empty and easy to select and the editable till date is always after the remarks"):
              the "till <date>" stands after the box in grey, from the dates in the window the moment it opens — a day
              already picked on the Inputs calendar included — and follows every pick. It is changed by changing the
              dates; nothing writes it into the box. Not for SANS availability or an upchit (engine/inputs.ts tillOfISO). */}
          {/* …AND A TICK BEFORE THE DATE TURNS IT ON OR OFF (owner D953, 17 Oct 26 — "1B", the drawing of record
              docs/img/handpass/2026-10-17-till-switch, frames B): the window's own "all day" tick, the date its label;
              unticked, the date is struck through here and no screen prints it. Ticked by default, except a one-day duty
              or other commitment (D951, D952); a hand choice is kept only where it differs from that default, and a
              date or kind that flips the default replaces it, weighed at the save (above). The row is a div, not a label: a tick
              cannot sit inside the box's own label, so the heading names the box by `htmlFor`. */}
          <div className="inped-f">
            <label className="inped-k" htmlFor="inpEditRmk">Remarks</label>
            <span className="inped-rmk">
              <input id="inpEditRmk" aria-label="Remarks" maxLength={200} value={draft.remarks} autoComplete="off"
                onChange={e => setDraft({ ...draft, remarks: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(false) } }} />
              {(t => {
                if (!t) return null
                const on = typeof draft.till === 'boolean' ? draft.till : draftTillDef
                return <label className="inped-ad inped-tl" data-testid="inped-tl">
                  <input type="checkbox" id="inpEditTill" checked={on}
                    onChange={e => setDraft({ ...draft, till: e.target.checked === draftTillDef ? undefined : e.target.checked })} />
                  <span className={'inped-till' + (on ? '' : ' off')} data-testid="inped-till">{t}</span>
                </label>
              })(tillOfISO(draft.type, draft.start, draft.end))}
            </span>
          </div>
          {/* THE DATES STAND BELOW WHAT IS STILL TO BE FILLED IN (owner D920, 15 Oct 26 — his first idea, D913 drawing A:
              "move the time and remarks above the calendar since I can already select the dates through the initial
              inputs calendar"): SANS availability's F / O / A, When, a Document and Remarks come first, the calendar —
              which keeps showing (D916) — after them, for every kind and every door; the List's "+ Input", with no
              dates yet, fills in the time first, and its save still refuses an input with no dates. An upchit's one
              date box (above) is not a calendar and keeps its place. */}
          {/* the Unavailable add takes a RANGE (owner, 19 Aug 26 — "I can
              select a date range as well"): the same two-click calendar the
              Inputs page uses. A pick never touches the remark (owner D948): the
              "till <date>" after the Remarks box follows the dates by itself. */}
          {/* ...and a SAVED shared input's (D681 — `datesHere`, above). A saved input's dates are a finished range, so
              the first tap is always the NEW START and the next the new end — "a tap for the start, a tap for the end";
              a one-day input is handed to the calendar as a range of one day until that first tap, or its first tap
              would stretch it instead (`midPick`). Its remark is not rewritten here: the save follows the "till" word
              itself, and a remark the picker had touched would read as his own change to the window. */}
          {(ctx === 'u' || (isNew && r._calendar) || datesHere) && <div className="inped-f">
            <span className="inped-k">Dates</span>
            <div className="inped-dates">
              <RangeCal key={'cal-' + calKey} idPrefix="inpEd" startHolds start={draft.start}
                end={datesHere && !midPick ? (draft.end || draft.start) : draft.end}
                onPick={(s2, e2) => {
                  if (datesHere) { setMidPick(!e2); setDatesPicked(true); setDraft({ ...draft, start: s2, end: e2 }); return }
                  setDraft({ ...draft, start: s2, end: e2 })
                }} />
              <div className="rc-read">{draft.start ? (shortYear(fmt(draft.start)) + (draft.end && draft.end !== draft.start ? ' → ' + shortYear(fmt(draft.end)) : '')) : 'pick a start date'}</div>
            </div>
          </div>}
          {/* REVISE A RECORDED OIL ANSWER (owner, 29 Aug 26 — a mistaken "No
              OIL" used to be revisable only by nudging the input's times).
              Drawn off the SAVED row (oilAnswered — no per-render normalize),
              priced off the CURRENT draft (oilGate force — a half-edited time
              asks what the save would credit); the sheet's Save runs the same
              doSave as the gate, one batch, one undo step. */}
          {/* NO "CHANGE…" FOR A READER (`[CAL-CHECK-SEEN]`, the editor — 10 Oct 26): his form is inert, so the button was
              one that is seen and cannot be pressed — as the "?" beside Type was until D729. The line still says what
              stands. A man in a shared input he did not file has no line and no answer of his own (owner D762) — only
              "Take me out", in the foot. */}
          {anyAnswered && <div className="inped-f">
            <span className="inped-k">OIL</span>
            <div className="inped-oil">
              <span className="inped-oilsum">{oilSummary(r)}</span>
              {!readOnly && <button type="button" className="abtn ghost" data-testid="oil-revise"
                onClick={() => { const g = oilGate(draft, r, true); if (g.kind === 'ask') setOilConf(g) }}>Change…</button>}
            </div>
          </div>}
          {/* …AND THE QUESTION NOBODY HAS ANSWERED YET (the plan docs/superpowers/plans/2026-10-10-input-card-plan.md
              §3.2; `oilUnansweredDay` — Fable F6, 22 Sep 26). The List's "OIL?" chip was the one sign, outside the bell
              of the man himself, that a weekend request's question was asked and put away unanswered; the phone's
              list is cards now and a card has no chips (D723), so the window says it — and answers it, by the same
              forced question the chip opened. Only for a reader who may change the input. Said while the input's one
              record has a day nobody answered (one question for everyone in it, D762, so the line names nobody), and
              beside an answered line too (one day answered, another not): then that line's "Change…" is the one button,
              since both open the same question. */}
          {!isNew && r && unansweredDay && <div className="inped-f" data-testid="oil-unanswered">
            <span className="inped-k">OIL</span>
            <div className="inped-oil">
              <span className="inped-oilsum">Not answered yet — {oilDayLabel(unansweredDay)}</span>
              {!readOnly && !anyAnswered && <button type="button" className="abtn ghost" data-testid="oil-answer"
                onClick={() => { const g = oilGate(draft, r, true); if (g.kind === 'ask') setOilConf(g) }}>Answer…</button>}
            </div>
          </div>}
          {/* who placed this input and when, and its last change — the editor's small print (owner D629; the one line
              is ui/placedline.ts). Not on a new input, which nobody has placed yet. */}
          {!isNew && r && placedLineOf([r]) && <div className="inped-placed" data-testid="inped-placed">{placedLineOf([r])}</div>}
          {/* a shared input its reader may NOT change for everyone says nothing here about dates: the line beside the
              buttons already says who can change it, and "changed on the Inputs page" sent him to the page he is on */}
          {/* …and since the window carries the dates of EVERY saved input (D718), no reader of another person's input is
              sent "to the Inputs page" for them either: he is on it, and they are not his to change */}
          {/* THE PARAGRAPH OF INSTRUCTIONS IS GONE FROM THE INPUTS PAGE'S WINDOW (owner D729 — the design vet's V3,
              10 Oct 26; D726: "I don't like too wordy interface"). A new input said "Choose the dates and the hours.
              Save adds one input covering the whole date range." and a saved one "To change its dates, tap the new
              start on the calendar above, then the new end …" — the line under the calendar already shows what a Save
              will write. ONE short line stays, on a saved SHARED input: its dates change for every man in it, which
              nothing else in the window says. `hint` is '' where there is nothing to say, and then no line is drawn.
              NOT TOUCHED (D729 reading 2 — only what the page showed): the SANS calendar's own lines, and every line
              of the dialogs the schedule and the board open. */}
          {(hint => hint && <div className="inped-hint">{hint}</div>)(win && !isNew && readOnly ? '' : isNew
            ? r._calendar
              /* "your available hours" is the SANS calendar's wording — on the Inputs calendar the same window files
                 a meeting or a leave (Opus's own read of the build, step 0, 7 Oct 26) */
              ? isSansAvail(draft.type)
                ? 'Choose the dates and your available hours. Save adds one input covering the whole date range.'
                : ''
              : ctx === 'up'
              ? 'Pick the day he is fit for full duty and attach the upchit document — the medical entry ends the day before, and a summary asks before anything is changed.'
              : ctx === 'u'
              ? 'Pick the dates on the calendar. A leave syncs to the Inputs page and Leave War.'
              : ctx === 'g'
                ? `Added on ${when}, straight onto the ${progOf([...ppl, draft && draft.person])}. For a multi-day span, use the Inputs page.`
                : `Added on ${when}. For a multi-day span, use the Inputs page.`
            /* a SANS commitment is on no list of the Inputs tab (D620), so "the Inputs page" is no place to change its
               dates — and this editor changes none: it is deleted and added again (the calendar job's bug check, 8 Oct 26) */
            : datesHere
              ? recPpl.length > 1 ? (recPpl.some(p => isSpecial(p)) ? `Date changes apply to ${howMany(recPpl)}.` : `Date changes apply to all ${recPpl.length}.`) : ''
            : isSansAvail(draft.type)
              ? 'To change its dates, delete it and add it again on the SANS calendar.'
            : canEditSched()
              ? 'The dates are changed on the Inputs page.'
              : 'The person and the dates are changed on the Inputs page.')}
        </div>}
        {/* HIS ONE THING in an input he is in but may not change — "Take me out" (D755 (3), D762) — outside the read-only
            form, so it is live */}
        {mineRow && draft && (
          <div className="inped-own">
            {takeOut && (
              <AskCard at={outBtn.current} testid="inped-takeout-ask" label="Take yourself out?"
                question={<>Take yourself out of this input? It stays for {recPpl.some(p => isSpecial(p)) ? howMany(recPpl.filter(p => !isMe(p))) : `the other ${recPpl.length - 1 === 1 ? 'person' : `${recPpl.length - 1} people`}`}.</>}>
                <button type="button" className="abtn danger" data-testid="inped-takeout-yes" onClick={takeMeOut}>Take me out</button>
                <button type="button" className="abtn primary" data-testid="inped-takeout-no" autoFocus onClick={() => setTakeOut(false)}>Stay in</button>
              </AskCard>
            )}
          </div>
        )}
        {delAll && (
          <AskCard at={delBtn.current} testid="inped-delall" label="Delete for everyone?"
            question={<>Delete this input for {recPpl.some(p => isSpecial(p)) ? howMany(recPpl) : `all ${recPpl.length} people`}?</>}>
            <button type="button" className="abtn danger" data-testid="inped-delall-yes" onClick={delEntry}>Delete</button>
            <button type="button" className="abtn primary" data-testid="inped-delall-no" autoFocus onClick={() => setDelAll(false)}>Keep</button>
          </AskCard>
        )}
        <div className="airpop-foot">
          {/* nothing to delete on a row that does not exist yet (the board's
              + Add) — the button is simply absent in that mode */}
          {!isNew && !readOnly && <button className="abtn danger" id="inpEditDel" ref={delBtn} aria-expanded={delAll || undefined} onClick={del}>Delete</button>}
          {/* it stays in sight while its question hangs from it (D1627); pressed again, the question stays */}
          {mineRow && <button className="abtn" data-testid="inped-takeout" ref={outBtn} aria-expanded={takeOut || undefined} onClick={() => setTakeOut(true)}>Take me out</button>}
          {/* ITS DOCUMENT, OPENED FROM HERE ([INPUT-LIST-AS-DAY-CARD], 10 Oct 26 — Astra's scenario 60). The paperclip of the
              List's row is how a medical input's paperwork is read — by EVERY account (owner, 27 Aug 26) — and a phone's
              card carries no paperclip (D723): the form above names a document and cannot open it, and for a reader who
              may not change the input the form is inert besides. So the paperclip stands here, beside the buttons and
              outside the form, for any saved input that has a document; it opens the same viewer. */}
          {!isNew && r && rowDocIds(r).some(id => !!docGet(id)) && <button type="button" className="abtn inped-doc" data-testid="inped-docview"
            aria-label="View the document" title="View the document" onClick={() => { setDocView({ row: r }); notify() }}><ClipIcon /></button>}
          {readOnly && <span className="inped-ro" data-testid="inped-ro">{recPpl.length > 1 || (!!r && isPlaceholderInput(r))
            /* an input of several, or one for ALL AVAIL, names whoever may change it for everyone — its filer, or (once
               a scheduler has changed who is in it — D755 (3)) an admin; to the FILER, kept out by the members' switch
               alone, that the switch is off (D731 (8)). One body with every other door: `sharedRefusal`, above. */
            ? sharedRefusal([r], 'change this for everyone') + (/[.!]$/.test(sharedRefusal([r], 'change this for everyone')) ? '' : '.')
            : `Only ${who || 'its owner'} or an admin can change this.`}</span>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" id="inpEditCancel" onClick={close}>{readOnly ? 'Close' : 'Cancel'}</button>
          {!readOnly && <button className="abtn primary" id="inpEditSave" onClick={() => save(false)}>{isNew ? 'Add' : 'Save'}</button>}
        </div>
  </>)
  /* the questions that must be answered before going on stay BLOCKING, over the form (the plan §3.7: "It does not
     carry: a question that must be answered before going on") */
  const sheets = (<>
      {/* the upchit save-time summary rides OVER this dialog (its z sits one
          layer up) — Save commits with the ticked removals, Cancel returns
          to the still-open form with nothing written */}
      {upConf && <UpchitConfirm who={upConf.who} dateLabel={upConf.dateLabel} effects={upConf.effects} cuts={upConf.cuts} deleting={!!upConf.del}
        onCancel={() => setUpConf(null)}
        onSave={removals => {
          setUpConf(null)
          /* the question before a delete (D1022): its button deletes — the give-back rides inside removeInput's one command */
          if (upConf.del) { delNow(); return }
          doSave(removals)
        }} />}
      {/* the medical clash sheet, same layer and same contract — Save
          resolves the choices, Cancel returns to the untouched form */}
      {medConf && <MedClashConfirm who={medConf.who} newType={medConf.newType} span={medConf.span}
        clashes={medConf.clashes} aOrd={medConf.a} bOrd={medConf.b}
        onCancel={() => setMedConf(null)}
        onSave={(choices, keepTail) => { setMedConf(null); doMedSave(choices, keepTail) }} />}
      {/* the OIL ask, same layer and same contract — Save commits the input
          with the day decisions in one batch, Cancel returns to the form */}
      {/* HEADED FOR WHOEVER THE ANSWER IS WRITTEN FOR (`[CAL-CHECK-SEEN]`, the editor — 10 Oct 26). A shared input's
          question is asked once and its answer goes on every man's record (D660, D682): the save's own door headed it
          "Saber +2", while "Change…", "Answer…", the bell and the question that follows a bar's drag headed it with
          the one man whose record the window happened to hold. ONE place decides it now, for every door: the group —
          its first name and how many more, the words of the window's own title — unless the question is a man's own
          (`own`: his record alone, inside an input he did not file). */}
      {/* …and the first name is the entry's first A TO Z, whatever order its people were picked in — the name the saved
          input's title leads with (the walk's find, 10 Oct 26: a NEW group asked as "Ranger +2", the man picked
          first, and was "Ace +2" from the moment it was saved). */}
      {oilConf && <OilConfirm who={grouped && ppl.length > 1 ? inputWho({ people: ppl.map(p => ({ p })) }) : oilConf.who} typeLabel={oilConf.typeLabel}
        plan={oilConf.plan} prev={oilConf.prev}
        /* its right-hand button says what the form's own does — "Add" for a new input, "Save" for a change (the
           sheet's default); the left-hand one is "Back" for both (the design look's L4, owner D830) */
        yesLabel={isNew ? 'Add' : undefined}
        onCancel={() => { const shut = oilConf.shut; setOilConf(null); if (shut) close() }}
        onSave={dec => { setOilConf(null); doSave([], dec) }} />}
      {/* the medical-document ask (owner, [SYNC-INTEG]): "No document" resumes
          the SAME save through the rest of the pipeline (skipDoc); "Upload"
          dismisses so the filer can attach a certificate and save again */}
      {docConf && <DocConfirm who={docConf.who} typeLabel={docConf.typeLabel} leave={!!docConf.leave}
        onUpload={() => setDocConf(null)}
        /* the keyboard back inside the window before the save closes it, so the window hands it on to the button that opened
           it (FloatWindow.tsx returns focus only from inside itself — M3's browser check: a new leave's "No document" left it
           nowhere) */
        onNoDoc={() => { setDocConf(null); document.getElementById('inpEditSave')?.focus(); save(true) }} />}
  </>)
  /* A CANCELLED INPUT'S OWN WINDOW SAYS SO (owner D771, 12 Oct 26 — "Yes for both"): the card's own small red CX tag and
     the reason in red, beside the window's title, in both of its shapes — FOLLOWING the title, not standing by the ✕
     (owner D849, 14 Oct 26 — "2 yes": in the movable window it had been drawn as one of the head's tools, at the right). A MARK, never a control — only a scheduler
     cancels an input or brings it back, on its row on the schedule (D760 reading 2); what the input SAYS is still its
     owner's to change while it is cancelled. Read off the live record, so it goes the moment the input is brought back. */
  const cxRec: any = r && !isNew ? (INPUTS.find((x: any) => x.iid === r.iid) || r) : null
  const cxMark = cxRec && cxOf(cxRec)
    ? <span className="inped-cx" data-testid="inped-cx" title={cxSays(cxRec)}><span className="icx">CX</span>{cxWhy(cxRec) && <span className="icx-why">{cxWhy(cxRec)}</span>}</span>
    : null
  /* the control the swap's question hangs from gone with its window (the opened day closed under it): the question goes
     too — never left standing where nobody can see it, to take the next Escape ("adjust state while rendering") */
  if (swap && swapAt.current && !swapAt.current.isConnected) setSwap(null)
  if (win) return (<>
    <FloatWin id="inputedit" title={(isNew ? 'New input' : who) + (when ? ' · ' + when : '')} testid="win-inputedit" className="inpedwin" onClose={askClose}
      mark={cxMark || undefined}>
      <div id="inpEditPop" className="inpedbox inped-win" ref={box}>
        {/* ONE EDITOR AT A TIME: another input was asked for while this one holds unsaved changes */}
        {swap && (
          /* it hangs from what was pressed on the page behind, over every window (portal): on a phone the opened day stands
             in front of this window, and the card must show at the card tapped there (D1627) */
          <AskCard at={swapAt.current} portal testid="inped-swap" label="Unsaved changes"
            question={<>This input has unsaved changes. Open {swap._new ? 'a new input' : `${inputWho(swap) || 'the other'}’s input`} and lose them?</>}>
            <button type="button" className="abtn danger" data-testid="inped-swap-go"
              onClick={() => { const to = swap._new ? swap : (INPUTS.find((x: any) => x.iid === swap.iid) || null); swapOk.current = true; setSwap(null); setInpEdit(to); notify() }}>Discard and open</button>
            <button type="button" className="abtn primary" data-testid="inped-swap-stay" autoFocus onClick={() => setSwap(null)}>Keep editing</button>
          </AskCard>
        )}
        {/* ESCAPE OR ✕ OVER UNSAVED WORK (F2 of the 3 Nov 26 re-check; ✕ since D1622). A SMALL CARD HANGING FROM THE ✕
            (owner D1626, 3 Nov 26, design C — "if u want to close, you position your hand to reach it"): the question
            stands where the hand already is, pointing at the ✕, and covers the form's top only while it is up. Its
            anchor has no height and sticks to the top of the window's body, so the form never moves and a scrolled
            form still shows the card under the ✕. */}
        {escAsk && !swap && (
          <div className="inped-xask-at">
            {/* eslint-disable-next-line react-doctor/prefer-html-dialog -- a question inside this window: it leaves the page behind working (D641) and hangs from the window's own ✕; a <dialog> would open in the top layer over every window */}
            <div className="inped-xask" data-testid="inped-escask" role="alertdialog" aria-label="Unsaved changes">
              <span className="inped-xask-q">This input has unsaved changes. Close it and lose them?</span>
              <span className="inped-xask-btns">
                <button type="button" className="abtn danger" data-testid="inped-escask-go" onClick={close}>Discard and close</button>
                <button type="button" className="abtn primary" data-testid="inped-escask-stay" autoFocus onClick={() => setEscAsk(false)}>Keep editing</button>
              </span>
            </div>
          </div>
        )}
        {/* A FIELD CHANGED BOTH WAYS — his, in the window, and someone's on the page behind it: listed, each with its
            two values and a choice. Nothing of his is thrown away, and nothing is saved over theirs unasked. */}
        {clash.length > 0 && draft && (
          <div className="inped-ask" data-testid="inped-clash" role="alert">
            <b className="inped-ask-h">Changed while this window was open</b>
            {clash.map(k => {
              const f = WIN_FIELDS.find(x => x.k === k)!
              return (
                <div key={k} className="inped-clash-row">
                  <span className="inped-ask-q">{f.label} — theirs {fieldSay(k, base.current)}, yours {fieldSay(k, draft)}</span>
                  <button type="button" className="abtn" data-testid={'inped-clash-mine-' + k} onClick={() => setClash(c => c.filter(x => x !== k))}>Keep mine</button>
                  <button type="button" className="abtn" data-testid={'inped-clash-theirs-' + k}
                    onClick={() => {
                      setDraft({ ...draft, ...fieldPart(f, base.current) }); setClash(c => c.filter(x => x !== k)); delete madeOver.current[k]
                      /* dates taken back from the record are a FINISHED range again: the next tap is a new start, not
                         the end of a pick he has just given up (Astra's read of the date door, 9 Oct 26 - A4) */
                      if (k === 'start' || k === 'end') { setMidPick(false); if (!clash.some(x => x !== k && (x === 'start' || x === 'end'))) setDatesPicked(false) }
                    }}>Take theirs</button>
                </div>
              )
            })}
          </div>
        )}
        {inner}
      </div>
    </FloatWin>
    {sheets}
  </>)
  return (
    // eslint-disable-next-line react-doctor/no-static-element-interactions -- a press on the veil around the schedule's pop-up closes it (a click outside, D1 of the pop-up rule); the keyboard closes it with Escape; moved whole from inputedit.tsx on 3 Nov 26 with this finding already on it (D1534: the area's findings ride with its batch)
    <div className="airpop" id="inpEditPop" hidden={!open} ref={pop}
      onClick={e => { if (clickedOutside(e, 'inpEditPop')) close() }}>
      <div className="airpop-box inpedbox" ref={box} tabIndex={-1} style={{ outline: 'none' }}>
        <div className="airpop-head">
          <b id="inpEditTitle">{isNew ? 'New input' : who}{when ? ' · ' + when : ''}</b>
          {cxMark}
          <button className="x" id="inpEditClose" aria-label="Close" onClick={close}>✕</button>
        </div>
        {inner}
      </div>
      {sheets}
    </div>
  )
}
