/* THE MEDICAL VIEW (owner, 27 Aug 26) — who is medically down, who owes an
   upchit, who upchitted. A full-screen view of the Inputs page, the
   calendar-view chassis (.inpcal overlay, INPVIEW routing), because it is a
   status dashboard over the SAME records the table lists — not a page of its
   own.

   Everything on it is DERIVED (engine/medical.ts) from INPUTS and one as-of
   date, so it can never disagree with the table: a downchit expiring moves
   its puck to Pending Upchit by arithmetic, not by anything stored moving.

   THE AS-OF DATE defaults to the app's notional today (weeknav.TODAY — the
   one literal; the device clock would read the whole demo week as ancient
   history) and the header's calendar picks any other date to answer "who
   was down THEN" (owner: "u can click on a calendar view to view the
   history as per that selected date"). Pending Upchit and Upchit Complete
   follow the same as-of, so the three sections always describe one moment.

   A card tap opens the DOCUMENT — every account may view every document
   (owner) — and the viewer's footer carries the gated actions: edit for
   your own puck or an admin, and on a Pending card the Upchit path itself.
   This view deliberately ignores the table's filter bar: it is the
   squadron's medical state, not a filtered list (docs/ui-contracts.md). */
import { useEffect, useState } from 'react'
import { PEOPLE, byCrew } from '../engine/people'
import { INPUT_TYPES, inpMeta, inpType, leadOf, remarksTyped, defaultAllday } from '../engine/inputs'
import { medDownAsOf, pendingUpchits, upchitsWithin, medEpisode } from '../engine/medical'
import { docHas, rowDocIds } from '../state/docs'
import { MEDASOF, setMedAsOf } from '../state/view'
import { notify } from '../state/store'
import { setDocView, setInpEdit } from './pops'
import { useVersion } from './useStore'
import { puck } from './html'
import { fmtDay, unfmt, newInputSeed } from './inputedit'
import { monthCells } from './InputsCal'
import { rangeWords } from './InputsPage'
import { TODAY, keyToIso } from './weeknav'
import { CalIcon } from './icons'
import { SaveBand } from './SaveStatus'
import { OilBand } from './OilWaitSheet'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const isoOrd = (iso: string) => +iso.slice(0, 4) * 10000 + +iso.slice(5, 7) * 100 + +iso.slice(8, 10)
/* a record label ('Jul 12', row-anchored) → the day-first voice this page
   speaks ('12 Jul') — through the row's own yr so cross-year stays honest */
const lblDay = (lbl: any, yr: any) => fmtDay(unfmt(lbl, yr)) || String(lbl || '')
/* THE PERIOD AN ENTRY COVERS, as the Inputs pages say a range (owner D960, 17 Oct 26 — "the status they filed that
   starts from 15-17jul"): "15–17 Jul", across months "28 Jun – 2 Jul", one day "17 Jul". An end label earlier in the
   year than its start runs into the next year (a December entry ending in January — the row's yr anchors the start). */
const spanOf = (r: any) => {
  const a = unfmt(r.date, r.yr)
  let b = unfmt(r.endDate || r.date, r.yr)
  if (!a || !b) return lblDay(r.endDate || r.date, r.yr)
  if (b < a) b = `${+b.slice(0, 4) + 1}${b.slice(4)}`
  return a === b ? fmtDay(a) : rangeWords(a, b)
}

/* the card already prints a derived 'till <date>' status line; a remark that
   only restates that date (the app's own auto '… till 13 Jul' tail, or a demo
   'Medically down till 17 Jul') would double it (owner, 27 Aug). So show the
   remark ONLY when, stripped of dates and medical boilerplate, a real note
   survives — 'knee injury' shows, 'Medically down till 17 Jul' does not. */
const STOP = new Set(['medically', 'medical', 'down', 'leave', 'till', 'until', 'was', 'up', 'upchit', 'upchitted',
  'on', 'fit', 'to', 'fly', 'again', 'dnif', 'and', 'the', 'a', 'of',
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
function remarkNote(remark: any): string {
  const s = String(remark || '').trim()
  if (!s) return ''
  /* strip digits, dates and the boilerplate words; if anything is left the
     remark carries a real note. The survivors test counts NON-boilerplate
     content, not a–z words: a note written in another script or in symbols
     ('复诊 15/7') has no Latin letters at all, and the first cut — which
     demanded a surviving a–z word — hid exactly those real notes. */
  const scrubbed = s.toLowerCase().replace(/[0-9]/g, ' ')
  const words = scrubbed.split(/[^a-z]+/).filter(Boolean)
  if (words.some(w => !STOP.has(w))) return s
  /* every Latin word was boilerplate — anything beyond letters, digits and
     ordinary punctuation left standing is a real note in another script */
  const residue = scrubbed.replace(/[a-z]/g, '').replace(/[\s.,;:!?()'"/\-–—*]+/g, '')
  return residue.length ? s : ''
}

/* one section's card: puck + what the section says about him + his remarks.
   The puck sits inside the row-direction top line and the texts are its
   SIBLINGS — the sanscard flex contract (scheduler.css), where nesting them
   in the puck's own box is the documented trap.
   TWO ROWS, THREE CARDS A ROW ON A PHONE (owner D961, D965 — 17 Oct 26, "Anyway we can compact 3 names on a row?",
   built as drawn): the puck alone on row 1; row 2 the kind, in its section's colour, then the period ("ATT C 13–17 Jul"),
   so a card is as wide as its puck (~95) and three stand in a row at 375 and 390. Upchit Complete's card drops the kind
   and "upchitted" (its section says Upchit, D961). ITS DOCUMENTS, IN EVERY SECTION (owner D966, D967 — "Both as
   recommended"): from two on file, one page drawing and the number ("▯ 2") after the period; one shows none — a downchit
   always carries one, so it would say nothing. The "N documents" pill went. */
function Card({ e, line, up, docs, kind = true, onOpen }: { e: any, line: string, up?: boolean, docs?: number, kind?: boolean, onOpen: (row: any, up?: boolean) => void }) {
  const r = e.row
  /* (whose it is: a medical entry and an upchit are ONE person's — engine/inputs.ts shapeProblem, D655 reading 4 — so
     the puck is the first of the record's people, leadOf: a record stored before the one-rule build answers with its
     one `person`, one after it with its list) */
  /* when this person's overlapping medical entries form one episode, the card
     says how many documents are behind it so a checker knows to page through
     them (owner, 1 Sep 26); one document shows the plain title as before */
  const n = docs || 1
  return (
    <button type="button" className="medcard" data-medcard={r.iid || ''}
      title={n > 1 ? `Tap to view ${n} documents` : 'Tap to view the document'}
      onClick={() => onOpen(r, up)}>
      <span className="medcard-top">
        <span className="seat" dangerouslySetInnerHTML={{ __html: puck(leadOf(r), 0, true, '') }} />
      </span>
      <span className="medcard-row2">
        {kind ? <span className="medcard-type">{inpType(r.type)}</span> : null}
        {/* a period across two months may break at its dash and nowhere else, so on a phone's third of a row "28 Dec –
            3 Jan 2027" goes onto two lines inside the card instead of running past it (the fix read, 17 Oct 26) */}
        <span className="medcard-t">{line.includes(' – ')
          ? <><span className="medcard-tp">{line.split(' – ')[0]} –</span> <span className="medcard-tp">{line.split(' – ').slice(1).join(' – ')}</span></>
          : line}</span>
        {/* ONE NAME FOR THE GROUP, read aloud as "2 documents" (the code read, finding 3): the drawing and the number are
            hidden from a screen reader, and the card's title is only a hint there */}
        {n > 1 ? <span className="medcard-docs" role="img" aria-label={`${n} documents`}>
          <DocMark /><span className="medcard-docs-n" aria-hidden="true">{n}</span></span> : null}
      </span>
      {/* the typed words (its line above says the dates — D948, engine/inputs.ts remarksTyped) */}
      {remarkNote(remarksTyped(r.remarks, r)) ? <span className="medcard-r" title={remarksTyped(r.remarks, r)}>{remarksTyped(r.remarks, r)}</span> : null}
      {/* nothing under it: who placed the entry and when is the input's window's to say, not the card's (owner D960, 17 Oct
          26 — "No need for the time/ date or who it's filed from"; it narrows D629 for this card) */}
    </button>
  )
}
/* a document, drawn as the app's own page (ui/icons.tsx PdfIcon's sheet and folded corner, without its lines and arrow —
   at 11px those blur into a smudge); it takes the section's colour from the card (16-medical.css) */
function DocMark() {
  return (
    <svg className="medcard-doc" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

export function MedicalView({ onClose }: { onClose?: () => void }) {
  useVersion()
  const todayIso = keyToIso(TODAY)
  const asOf = MEDASOF || todayIso
  const ord = isoOrd(asOf)
  const [calOpen, setCalOpen] = useState(false)
  const [cal, setCal] = useState({ y: +asOf.slice(0, 4), m: +asOf.slice(5, 7) })

  /* byCrew assumes roster members; a record restored for a body since
     removed from the roster must still LIST, not crash the page — it sorts
     to the tail by name (fail open for display, the missing-input doctrine) */
  /* (`a` and `b` are the tracker's own entries — engine/medical.ts: { person, row, endOrd }, the person already read
     off the record through leadOf — not input records) */
  const crew = (a: any, b: any) => (PEOPLE[a.person] && PEOPLE[b.person])
    ? byCrew(a.person, b.person)
    : String(a.person).localeCompare(String(b.person))
  const down = medDownAsOf(ord).sort(crew)
  const pend = pendingUpchits(ord).sort(crew)
  const done = upchitsWithin(ord, 30)          // newest first, its own order

  /* this person's overlapping-episode documents that are actually on file.
     ROWS feed the pager; the card's count of documents — its title, and the drawing and number from two (D966, D967) — counts FILES (an
     entry holds several since 1 Sep 26) — both read the same per-row lists,
     so what the card promises and the viewer pages cannot disagree */
  const episodeDocs = (row: any) => medEpisode(row).filter((x: any) => rowDocIds(x).some(docHas))
  const episodeDocN = (row: any) => medEpisode(row).reduce((n: number, x: any) => n + rowDocIds(x).filter(docHas).length, 0)
  const open = (row: any, up?: boolean) => {
    const eps = episodeDocs(row)
    if (eps.length > 1) {
      const rows = eps.map((x: any) => ({ row: x, up: !!up && x === row }))
      const idx = Math.max(0, rows.findIndex((p: any) => p.row === row))
      setDocView({ row, up: !!up, rows, idx })
    } else setDocView({ row, up: !!up })
    notify()
  }
  const pick = (iso: string) => { setMedAsOf(iso === todayIso ? null : iso); setCalOpen(false); notify() }
  const openNew = () => {
    /* ATT C, THE MOST COMMON MEDICAL KIND (owner D968, 17 Oct 26 — "default medical to ATT C since it's the most common");
       a squadron whose list had none opens on its first medical kind */
    const seed = newInputSeed(), t = INPUT_TYPES.includes('ATT C') ? 'ATT C' : INPUT_TYPES.find((k: any) => inpMeta(k)?.grp === 'med')
    setInpEdit(t ? { ...seed, type: t, allday: defaultAllday(t) } : seed); notify()
  }

  /* Escape closes the as-of picker, in the capture-phase manner the sibling
     popups (DocViewer, the input dialog) already use — the keyboard must not
     be the one door this popover ignores. */
  useEffect(() => {
    if (!calOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setCalOpen(false) } }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [calOpen])

  return (
    <div className={'inpcal medview' + (onClose ? '' : ' in-page')} id="medView">
      <div className="ic-head">
        {/* NO "Medical" HEADING (owner D927, 15 Oct 26 — built as drawn, D912): it only repeated the name of the tab
            picked just above it (the design guide §3, "A page's controls are one row", D926). The as-of button stands
            alone in the row under the tabs, as tall as that row's buttons on Inputs and SANS (36 — 16-medical.css). */}
        {/* the as-of control: which day the three sections describe. A pick
            answers "who was down then"; Today returns the view to now. */}
        <button type="button" className={'abtn' + (calOpen ? ' on' : '')} id="medCalBtn"
          title="See the medical state as of another date"
          onClick={() => { setCal({ y: +asOf.slice(0, 4), m: +asOf.slice(5, 7) }); setCalOpen(o => !o) }}>
          <CalIcon /> as of {fmtDay(asOf)}
        </button>
        {MEDASOF && <button type="button" className="abtn" id="medToday" onClick={() => pick(todayIso)}>Today</button>}
        <span style={{ flex: 1 }}></span>
        {/* THE TAB'S OWN DOOR FOR A MEDICAL INPUT (owner D963, D965 — 17 Oct 26: two doors, one window; look B, a filled
            "+ Medical" at the row's right end, as tall as the row's "as of"). It opens the SAME window as the Inputs tab's
            "+ Input" — the same seed (ui/inputedit.tsx newInputSeed: the signed-in person, no date yet) with ATT C, the most
            common medical kind, already set (D968); the window itself, and who may file for whom in it (D655),
            are unchanged. */}
        <button type="button" className="abtn primary" id="medNew" onClick={openNew}>+ Medical</button>
        {/* no cross where Medical is a TAB of the Inputs page (D626): a tab is left by choosing another */}
        {onClose && <button type="button" className="abtn" id="medClose" aria-label="Back to list"
          title="Back to list" onClick={onClose}>✕</button>}
        {/* the as-of picker is a FLOATING dropdown, not an in-flow band — it
            overlays the sections rather than shoving them down (owner, 27 Aug).
            Anchored to the header (position:relative) so it hangs from the bar
            whatever the bar's height; a transparent scrim closes it on an
            outside tap, the popover manner a date pick wants. */}
        {calOpen && <>
          <button type="button" className="med-cal-scrim" aria-label="Close the date picker"
            onClick={() => setCalOpen(false)} />
          <div className="med-cal" role="dialog" aria-label="Pick the as-of date">
            <div className="med-cal-head">
              <button type="button" className="abtn" id="medCalPrev" aria-label="Previous month"
                onClick={() => setCal(c => c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 })}>‹</button>
              <span className="ic-mon">{MON[cal.m - 1]} {cal.y}</span>
              <button type="button" className="abtn" id="medCalNext" aria-label="Next month"
                onClick={() => setCal(c => c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 })}>›</button>
            </div>
            <div className="med-cal-dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>
            <div className="med-cal-grid">
              {monthCells(cal.y, cal.m).map((iso, i) => iso
                ? <button type="button" key={iso} data-medday={iso}
                  className={'med-cal-d' + (iso === asOf ? ' on' : '') + (iso === todayIso ? ' today' : '')}
                  onClick={() => pick(iso)}>{+iso.slice(8, 10)}</button>
                : <span key={'x' + i} className="med-cal-x" />)}
            </div>
          </div>
        </>}
      </div>
      {/* a failed save's warning, under this full-screen surface's own bar — it lies over the top bar, whose own
          warning cannot be seen from here ([SAVE-NOTE-COVERS], D587; ui/SaveStatus.tsx) */}
      {/* a failed save's warning under this surface's own bar — ONLY where it lies over the top bar (opened with a close
          cross of its own). As a TAB of the Inputs page (D620, D626) it sits in the page, under the tabs: the top bar is
          in view and carries the warning itself, as it does for the Inputs calendar ([SAVE-NOTE-COVERS], D587). */}
      {onClose && <SaveBand />}
      {/* …and the bar that waits on an OIL answer, where one is up behind this view (D831) */}
      {onClose && <OilBand />}
      <div className="med-body">
        <section className="medsec med-down">
          {/* no grey line: the heading says it, the "as of" button above says the date (owner D959, the words pass) */}
          <div className="medsec-h">Medically Down<span className="medsec-n">{down.length}</span></div>
          {down.length
            ? <div className="medcards">{down.map((e: any, i: number) =>
              <Card key={(e.row.iid || '') + i} e={e} onOpen={open} docs={episodeDocN(e.row)}
                line={spanOf(e.row)} />)}</div>
            : <div className="med-empty">Nobody is medically down on this date.</div>}
        </section>
        <section className="medsec med-pend">
          {/* no grey line: "pending upchit" is the squadron's own word for it, and each card says when he was down (D959) —
              as the kind and the period, "OML 6–9 Jul": the section already says it is over, so "was down" went (D965) */}
          <div className="medsec-h">Pending Upchit<span className="medsec-n">{pend.length}</span></div>
          {pend.length
            ? <div className="medcards">{pend.map((e: any, i: number) =>
              <Card key={(e.row.iid || '') + i} e={e} up onOpen={open} docs={episodeDocN(e.row)}
                line={spanOf(e.row)} />)}</div>
            : <div className="med-empty">Nobody is owing an upchit.</div>}
        </section>
        <section className="medsec med-done">
          <div className="medsec-h">Upchit Complete<span className="medsec-n">{done.length}</span>
            <span className="medsec-sub">the past 30 days, newest first</span></div>
          {done.length
            ? <div className="medcards">{done.map((e: any, i: number) =>
              <Card key={(e.row.iid || '') + i} e={e} onOpen={open} docs={episodeDocN(e.row)} kind={false}
                line={lblDay(e.row.date, e.row.yr)} />)}</div>
            : <div className="med-empty">No upchits in the past 30 days.</div>}
        </section>
      </div>
    </div>
  )
}
