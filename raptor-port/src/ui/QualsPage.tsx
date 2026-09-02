/* The Quals page (LoX) — renderQuals' table strings verbatim in a pure
   builder; the tick/untick handlers keep the reference's invariants: NAAR
   is signed off after DAAR, SC NIGHT after SC DAY, and withdrawing the day
   qualification takes the night one with it. */
import { useEffect, useRef, useState } from 'react'
import { PEOPLE, QORDER, QCHIP, QCOLOR, LEVELNAME, deriveQuals, isInstrPilot, ID_BY_CS } from '../engine/people'
import { renameCallsign } from '../engine/slots'
import { validate } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { SESSION } from '../state/auth'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { DEFAULT_QUAL_COLS, qualCols, setQualCols } from '../engine/qualcols'
import { useVersion } from './useStore'
/* this page used to carry its own copy of exportCSV — which is how it missed
   the UTF-8 BOM the shared one now writes. One exporter, one encoding. */
import { exportCSV } from './export'
/* the sync seam is the ONE sanctioned crossing into Leave War (CLAUDE.md's
   four-seams rule; inputedit's retractLwRow is the precedent). Restoring an
   archived body has to clear their Leave War posting-out too, or the very
   next auto-archive pass would put them straight back — so the whole restore
   lives in sync.ts and this page just calls it. */
import { restoreArchivedPerson } from '../leavewar/sync'

/* Column order is the owner's, left to right (5 Aug 26): SANS, SXO, SCHEDULER,
   SC DAY, SC NIGHT, DAAR, NAAR, NVG, IMC, TF — currency and appointments
   first, the flying qualifications after them.

   CAT A / CAT B / IP used to sit in here. All three were shadows of the CAT
   dropdown and are gone: A/B duplicated it outright (removed, owner Aug 5),
   and IP — kept then because a pilot could be CAT A *and* an instructor —
   went when instructor-ness moved into CAT itself as IW / IP / IR / FI
   (owner, Aug 5 '26).

   Downchit went with them (owner, 5 Aug 26). It was the last tick column
   nothing read: a downchit is an INPUT with a date range (`isDownchit` in
   inputs.ts), which is what DNIF_FLY and the fade on the pucks actually key
   off. A permanent tick on the LoX said nothing the inputs did not, and
   could not say when. */
/* The column list itself lives in engine/qualcols.ts now (owner, 3 Sep 26) —
   Leave War reads the same list, so a qualification added here is offered
   there at once, held by anyone or not. */
/* ---- EDIT QUALS: which columns the LoX carries (owner, 5 Aug 26) ---------
   A second mode inside edit mode, admin only: add a qualification, remove
   one, or drag a heading to move it. It is the page's own `Set which quals
   your squadron uses`, so it lives here rather than in the engine.

   SIX OF THEM ARE WIRED INTO THE RULES, and removing one takes away the only
   place the squadron can grant it while the rule that reads it carries on
   enforcing it. That is not a reason to refuse — the owner asked to be able
   to delete qualifications — so those six ARM instead: the first ✕ says what
   reads the column and the second one removes it. Deleting a column never
   touches p.quals, so a rule still sees whoever already held it and adding
   the column back brings the ticks back with it.

   Nothing here is persisted, exactly like the ticks, initials and flights it
   sits beside: reload and the LoX is the default set again. `rules` is still
   the only thing this app writes to storage. The list IS shared, though: the
   page's `cols` state is mirrored into the engine's `qualCols()` registry on
   every change (the effect below), and Raptor's `notify` then carries it to
   Leave War's projection. */
const WIRED: any = {
  sched: 'the sign-off drop-downs — SKED CK, PLANNED BY and APPROVED BY',
  scDay: 'the SC shift rules', scNight: 'the SC shift rules',
  daar: 'the air-to-air refuelling rules', naar: 'the air-to-air refuelling rules',
  sxo: 'the VIEW AS filter, and who is appointed a scheduler automatically',
}
/* a heading becomes a key: letters and digits, first word lower-cased, so
   "Night SC" and "night sc" cannot become two columns holding one flag */
const qualKey = (h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
/* AAR is a front-seat qualification; the rear seat has none */
const qualNA = (p: any, c: any) => !!(c.fcpOnly && p && p.seat !== 'FCP')
/* CLEARED TO INSTRUCT AAR (owner, 10 Aug 26) — the cells that carry a third
   state. An instructor pilot is not automatically cleared to teach AAR from
   the back seat, so his DAAR / NAAR tick can be promoted to an 'I'.
   isInstrPilot alone is NOT the test: a WSO FI passes it (people.ts's own
   comment says so), and a WSO holds no AAR at all — hence the seat check,
   the same pairing the engine uses at validate.ts and avail.ts. Scoped to the
   two AAR keys by name because that is exactly what the owner asked for: a
   third state on a column no rule reads would be a mark that means nothing. */
const AAR_I_KEYS = ['daar', 'naar']
const qualI = (p: any, k: string) => !!(p && AAR_I_KEYS.indexOf(k) >= 0 && p.seat === 'FCP' && isInstrPilot(p.q))
/* the CAT dropdowns are seat-filtered so the inconsistent combinations can't
   be picked at all: IW is a WSO-only category, IP and IR are pilot-only, FI
   goes both ways. The validator still guards the hand-edited case. */
const catsFor = (seat: any) => Object.keys(QCHIP).filter(k => seat === 'FCP' ? k !== 'IW' : (k !== 'IP' && k !== 'IR'))

/* ---- sorting (owner, 5 Aug 26) -------------------------------------------
   The Sort chips are gone; the headings themselves sort, the way the Inputs
   table's already do. One click sorts a column, a second click inverts it.
   Each key returns something comparable, and callsign breaks every tie so
   rows that match on the sorted column still land in a stable, readable
   order.

   Two of them do not sort the way the eye first expects, and both are what
   was asked for. CAT sorts by SENIORITY, not alphabetically — the ladder
   order in QORDER, most senior first — because "A above D" is the useful
   reading of a CAT column and "A, B, C, D" is not. A qualification column
   sorts by HELD, not by anything inside the cell: everyone with the tick
   first, everyone without below them. A struck-out AAR cell (a WSO, who
   holds no AAR at all) counts as not held and sits with the untickeds. */
const SORTKEY: any = {
  cs: (p: any) => p.cs.toLowerCase(),
  /* initials are optional, so the blanks go to the BOTTOM ascending rather
     than heading the table with a block of empty cells */
  initials: (p: any) => (p.initials || '').toLowerCase() || '￿',
  flight: (p: any) => (p.flight || '').toLowerCase() || '￿',
  cat: (p: any) => -QORDER[p.q],
}
const sortKeyFor = (key: string) => SORTKEY[key] || ((p: any) => (p.quals && p.quals[key] ? 0 : 1))
const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0)

/* which people the table is showing: the seat view, then the filter box */
function qualsIds(qSeatView: string, qSort: any, qSearch: string) {
  let ids = Object.keys(PEOPLE).filter(id =>
    (qSeatView === 'ALL' || PEOPLE[id].seat === qSeatView) && !PEOPLE[id].archived)
  if (qSearch) { const s = qSearch.toLowerCase(); ids = ids.filter(id => PEOPLE[id].cs.toLowerCase().includes(s) || (PEOPLE[id].initials || '').toLowerCase().includes(s) || (PEOPLE[id].name || '').toLowerCase().includes(s)) }
  const key = sortKeyFor(qSort.key)
  ids.sort((a, b) => cmp(key(PEOPLE[a]), key(PEOPLE[b])) * qSort.dir || cmp(SORTKEY.cs(PEOPLE[a]), SORTKEY.cs(PEOPLE[b])))
  return ids
}

/* renderQuals' HEAD — pulled out of qualsTable so the frozen header mirror
   (see the QualsPage effect) can draw the SAME markup from one source: a
   second copy of the heading cells would be exactly the drift seam this app
   keeps warning about. Verbatim strings, like the rest of this builder. */
function qualsHead(cols: any[], qSeatView: string, qSort: any, qualsEdit: boolean, armDel: string) {
  /* the heading cell for a sortable column. The arrow box is rendered at a
     fixed width whether or not it holds an arrow, so switching the sorted
     column never shifts the headings sideways. */
  const sortTh = (key: string, label: string, cls: string, title: string, style = '') => {
    const on = qSort.key === key
    return `<th class="insort${cls ? ' ' + cls : ''}${on ? ' on' : ''}" data-sort="${key}"`
      + ` aria-sort="${on ? (qSort.dir > 0 ? 'ascending' : 'descending') : 'none'}"`
      + ` title="${esc(title)}"${style}>${label}<span class="inarrow">${on ? (qSort.dir > 0 ? '▲' : '▼') : ''}</span></th>`
  }
  /* CALLSIGN is the identity the whole app plans by — it is what every puck
     prints — so it heads the table; INITIALS sits beside it as the admin
     record (owner, Aug 26). Under the Personnel view the column reads
     Callsign/Name (owner, 26 Aug 26): ground crew go by name as much as by
     callsign, and the cell is where either is typed. The aircrew views keep
     the plain word — a pilot's identity here is the callsign, full stop. */
  return `<thead><tr>`
    + sortTh('cs', qSeatView === 'GND' ? 'Callsign/Name' : 'Callsign', '', 'Sort by callsign', ' style="text-align:left"')
    + sortTh('initials', 'Initials', '', 'Sort by initials')
    + sortTh('flight', 'Flight', '', 'Sort by flight — groups each flight together')
    + sortTh('cat', 'CAT', '', 'Sort by CAT — most senior first') +
    cols.map(c => {
      const cls = c.lav ? 'lav' : c.fix ? 'fix' : c.apt ? 'apt' : c.scq ? 'scq' : c.aar ? 'aarq' : ''
      const what = c.k === 'sched' ? 'Appointed scheduler — may sign SKED CK, PLANNED BY and APPROVED BY'
        : c.k === 'scDay' ? 'SC DAY — may be planned on an SC shift inside 07:00–19:00'
        : c.k === 'scNight' ? 'SC NIGHT — may be planned on an SC shift reaching outside 07:00–19:00. Needs SC DAY first'
        : c.k === 'daar' ? 'DAAR — day air-to-air refuelling (front seat only)'
        : c.k === 'naar' ? 'NAAR — night air-to-air refuelling. Needs DAAR first'
        : c.k === 'tf' ? 'TF — terrain following'
        : c.h
      /* in EDIT QUALS the heading stops being a sort button and becomes the
         column itself: drag it to move it, ✕ to remove it. It carries no
         data-sort at all, so a drag can never be read as a click that
         re-sorts the table under the hand that is moving it. */
      if (qualsEdit) return `<th class="qcol${cls ? ' ' + cls : ''}${armDel === c.k ? ' arm' : ''}" data-col="${c.k}"`
        + ` title="${esc(what)} · drag to move${WIRED[c.k] ? ' · used by ' + WIRED[c.k] : ''}">`
        /* the label keeps an element of its own here: in this mode the
           heading is a grip, a name and a ✕, and anything reading the column
           name — a test, a future export — should not have to strip the
           furniture back off it */
        + `<span class="qgrip">⋮⋮</span><span class="qlbl">${esc(c.h)}</span>`
        + `<span class="qdel" data-del="${c.k}" title="Remove ${esc(c.h)}">${armDel === c.k ? 'remove?' : '✕'}</span></th>`
      return sortTh(c.k, esc(c.h), cls, what + ' · click to bring the qualified to the top')
    }).join('') +
    `<th>Remarks</th><th></th></tr></thead>`
}

/* the group-header row ("Assigned pilots · N"), pulled out so it has one source.
   It lives in the LIVE table only and scrolls away with its rows — it is
   deliberately NOT in the frozen mirror (owner, 30 Aug 26 — "there isn't a need
   to freeze this bar"); only the column headers freeze. */
function qualsGrpRow(qSeatView: string, n: number, colsLen: number) {
  const grp = qSeatView === 'FCP' ? 'Assigned pilots' : qSeatView === 'RCP' ? 'Assigned WSOs' : qSeatView === 'GND' ? 'Personnel (ground crew)' : 'Assigned aircrew'
  return `<tr class="grp"><td colspan="${5 + colsLen + 1}">${grp} · ${n}</td></tr>`
}

/* renderQuals' head + rows, verbatim strings.
   `canArch` — whether the row's archive ✕ is drawn at all. Archiving is
   roster MEMBERSHIP, the same class as Add person and Restore ("stays with
   the admin", the owner's 5 Aug line), NOT table contents a member may edit.
   The reference never had to say so — only a scheduler could enable editing
   there — but opening Enable editing to members (5 Aug 26) silently opened
   the ✕ with it: a member could archive anyone off every roster surface,
   with Restore admin-only, so they could not even undo it (bug hunt,
   31 Aug 26). The cell itself stays so the column count matches the head. */
function qualsTable(cols: any[], qSeatView: string, qSort: any, qEditing: boolean, qSearch: string, qualsEdit: boolean, armDel: string, canArch: boolean) {
  const ids = qualsIds(qSeatView, qSort, qSearch)
  const archCell = (id: string) => `<td>${canArch ? `<span class="qarch" data-arch="${id}" title="Archive">✕</span>` : ''}</td>`
  const rows = ids.map(id => {
    const p = PEOPLE[id]
    /* Personnel (ground crew) hold no CAT and no qualifications, so every column
       from CAT rightward is blank; their Remarks cell is a free-text note they
       own — editable in edit mode — where aircrew show their CAT description.
       Callsign / initials / flight edit exactly as an aircrew row does. Keyed on
       p.pers, not the seat view, so a personnel row reads the same under the
       Personnel view and under All. */
    if (p.pers) {
      const cs = qEditing
        ? `<input class="qcs" data-cs="${id}" value="${esc(p.cs)}" maxlength="14" aria-label="Callsign for ${esc(p.cs)}" />`
        : esc(p.cs)
      const init = qEditing
        ? `<input class="qinit" data-init="${id}" value="${esc(p.initials || '')}" maxlength="12" aria-label="Initials for ${esc(p.cs)}" />`
        : esc(p.initials || '')
      const flt = qEditing
        ? `<input class="qinit qflt" data-flt="${id}" value="${esc(p.flight || '')}" maxlength="10" aria-label="Flight for ${esc(p.cs)}" />`
        : esc(p.flight || '')
      const rmk = qEditing
        ? `<input class="qinit qrmk" data-prmk="${id}" value="${esc(p.remarks || '')}" maxlength="80" aria-label="Remarks for ${esc(p.cs)}" />`
        : esc(p.remarks || '')
      const blanks = cols.map(() => `<td class="qcell na"></td>`).join('')
      return `<tr class="persrow"><td class="qname" data-person="${id}" title="${esc(p.name || '')}">${cs}</td><td class="qinitc">${init}</td><td class="qfltc">${flt}</td><td class="qcell na"></td>${blanks}<td class="qprmk" style="text-align:left">${rmk}</td>${archCell(id)}</tr>`
    }
    const lvl = qEditing
      ? `<select class="qlvlsel" data-lvl="${id}" aria-label="CAT for ${esc(p.cs)}">${catsFor(p.seat).map(k => `<option ${k === p.q ? 'selected' : ''}>${k}</option>`).join('')}</select>`
      : `<span class="lvl"><span class="qmini" style="background:${QCOLOR[p.q]};${(p.q === 'C' || p.q === 'B') ? 'color:#04222b' : ''}">${QCHIP[p.q]}</span>${p.q}</span>`
    const cells = cols.map(c => {
      if (qualNA(p, c)) return `<td class="qcell na" title="${esc(p.cs)} is a WSO — AAR is a front-seat qualification">–</td>`
      /* 'I' — cleared to INSTRUCT this AAR from the back seat. It is a truthy
         state, so every on-class above still lights and every reader that asks
         "does he hold this?" still says yes; only the glyph differs, and the
         title spells the mark out because a bare letter in a grid of ticks
         explains itself to nobody. */
      const held = p.quals[c.k]
      const inst = held === 'I'
      const glyph = held ? `<span class="qchk${inst ? ' qi' : ''}"${inst ? ` title="${esc(p.cs)} is cleared to instruct ${esc(c.h)} from the back seat"` : ''}>${inst ? 'I' : '✓'}</span>` : ''
      return `<td class="qcell${(c.k === 'sched' && held) ? ' apt-on' : ''}${(c.scq && held) ? ' scq-on' : ''}${(c.aar && held) ? ' aar-on' : ''}" data-q="${id}|${c.k}">${glyph}</td>`
    }).join('')
    /* editable in edit mode, so the initials of the people already on the
       roster can be filled in without re-adding them. It commits on CHANGE
       (blur / Enter), never on input: the table is an innerHTML string that
       notify() rebuilds, so a per-keystroke commit would tear the field out
       from under the cursor. */
    const init = qEditing
      ? `<input class="qinit" data-init="${id}" value="${esc(p.initials || '')}" maxlength="12" aria-label="Initials for ${esc(p.cs)}" />`
      : esc(p.initials || '')
    /* the callsign is editable in edit mode too, and renameCallsign rewrites
       every stored `who` string with it, so the pucks re-print under the new
       name (owner, Aug 26). Same commit-on-change reasoning as the initials. */
    const cs = qEditing
      ? `<input class="qcs" data-cs="${id}" value="${esc(p.cs)}" maxlength="14" aria-label="Callsign for ${esc(p.cs)}" />`
      : esc(p.cs)
    /* Flight is editable for the same reason the initials are — the roster
       arrived with the column blank, and the heading now sorts by it, so
       there has to be a way to fill it in (owner, 5 Aug 26). Same
       commit-on-change rule as the two beside it. */
    const flt = qEditing
      ? `<input class="qinit qflt" data-flt="${id}" value="${esc(p.flight || '')}" maxlength="10" aria-label="Flight for ${esc(p.cs)}" />`
      : esc(p.flight || '')
    return `<tr><td class="qname" data-person="${id}" title="${esc(p.name || '')}">${cs}</td><td class="qinitc">${init}</td><td class="qfltc">${flt}</td><td>${lvl}</td>${cells}<td style="text-align:left;color:var(--ink-3)">${LEVELNAME[p.q]}</td>${archCell(id)}</tr>`
  }).join('')
  return qualsHead(cols, qSeatView, qSort, qualsEdit, armDel)
    + `<tbody>${qualsGrpRow(qSeatView, ids.length, cols.length)}${rows}</tbody>`
}

export function QualsPage() {
  useVersion()
  const [qSeatView, setSeat] = useState('FCP')
  const [qSort, setSort] = useState({ key: 'cs', dir: 1 })
  const [qEditing, setEditing] = useState(false)
  const [qSearch, setQSearch] = useState('')
  /* the LoX's own shape: which qualification columns, in which order — seeded
     from the shared registry (so a list edited before this page last unmounted
     comes back as it was), and written back to it on every change. `notify`
     fires only when the list really changed, so the mount pass is silent. */
  const [cols, setCols] = useState<any[]>(() => [...qualCols()])
  useEffect(() => { if (setQualCols(cols)) notify() }, [cols])
  const [qualsEdit, setQualsEdit] = useState(false)
  const [newQual, setNewQual] = useState('')
  /* the column whose ✕ has been pressed once — see WIRED above */
  const [armDel, setArmDel] = useState('')
  const [addP, setAddP] = useState({ initials: '', cs: '', flight: '', seat: 'FCP', level: 'OCU' })
  /* Add person folds behind a button now (owner, 15 Aug 26): the seat-view
     switch is the everyday control, so it moves out of the toolbar to sit
     above the table, and the occasional add-person form opens on demand
     instead of taking an open row on every visit. Admin-only, so a member
     never sees the toggle or the form. */
  const [showAdd, setShowAdd] = useState(false)
  /* the Archived section under the table (owner, 19 Aug 26): folded to a
     count by default — it is a records drawer, not the roster */
  const [showArch, setShowArch] = useState(false)
  const tblRef = useRef<HTMLTableElement>(null)
  /* the frozen-header mirror (see the effect below): the scroll wrap it pins
     over, the mirror's own horizontal scroller, and the activation state
     carrying where to pin it and the live column widths to size it. */
  const wrapRef = useRef<HTMLDivElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState<{ top: number; left: number; width: number; cols: number[] } | null>(null)
  const admin = !!SESSION && SESSION.role === 'admin'

  /* WHO MAY EDIT WHAT HERE (owner, 5 Aug 26). `Enable editing` is open to a
     squadron member now: they tick the qualifications they have been signed
     off for, and fill in the initials, flight and CAT beside them. The two
     things that are NOT the table's contents stay with the admin — `Add
     person`, which puts someone on the roster, and EDIT QUALS, which decides
     which qualifications the whole squadron's LoX carries. */
  const canEditQuals = () => admin && qEditing && qualsEdit

  /* remove a column. WIRED ones arm first — see the note beside WIRED. */
  const delQual = (k: string) => {
    const c = cols.find((x: any) => x.k === k); if (!c) return
    if (WIRED[k] && armDel !== k) {
      setArmDel(k)
      return HOOKS.toast(`${c.h} is read by ${WIRED[k]}. Press REMOVE? to take it off the LoX — who already holds it is kept.`)
    }
    setArmDel(''); setCols(cs => cs.filter((x: any) => x.k !== k))
    /* the table cannot go on being sorted by a column that is no longer
       there — the arrow would have nowhere to sit and the order would look
       arbitrary, so it falls back to the callsign it opens on */
    setSort(s => s.key === k ? { key: 'cs', dir: 1 } : s)
    HOOKS.toast(`${c.h} removed from the LoX. Nobody's record changed — add it back and the ticks return.`)
  }

  const addQual = () => {
    const h = newQual.trim(); if (!h) return
    /* A STANDARD HEADING RECOVERS ITS OWN KEY (audit, 12 Aug 26) — the same
       problem, and the same answer, as `2 TKS`/`tk2` in the stores list.
       qualKey strips to letters and digits and lower-cases, so `SC DAY` derives
       `scday` while the real column is keyed `scDay`; four of the ten standard
       headings do not round-trip that way. Re-adding one therefore minted a
       LOOK-ALIKE column: a second heading reading `SC DAY` whose ticks write a
       flag no rule reads, while the wired rule kept enforcing the original flag
       that no longer had a column to edit it — and the removal toast's promise
       that "add it back and the ticks return" was false for exactly those four.
       Matching on the printed label first is what the remove/re-add path
       promises, and it makes the duplicate check below correct as well. */
    const std = DEFAULT_QUAL_COLS.find((c: any) => c.h.toLowerCase() === h.toLowerCase())
    const k = std ? std.k : qualKey(h)
    if (!k) return HOOKS.toast('A qualification needs a letter or a number in its name')
    if (cols.some((c: any) => c.k === k)) return HOOKS.toast(`${h} is already on the LoX`)
    /* held by nobody until it is ticked, exactly as TF arrived — except where
       the flag is already on the roster, which is a column coming back */
    setCols(cs => [...cs, std ? { ...std } : { k, h: h.toUpperCase(), lav: true }])
    setNewQual('')
    HOOKS.toast(`${h.toUpperCase()} added — tick the people who hold it`)
  }

  const moveQual = (from: string, to: string) => setCols(cs => {
    const i = cs.findIndex((c: any) => c.k === from), j = cs.findIndex((c: any) => c.k === to)
    if (i < 0 || j < 0 || i === j) return cs
    const out = [...cs]; out.splice(j, 0, out.splice(i, 1)[0]); return out
  })

  /* the delegated listeners below are mounted once and never re-bound, so
     anything of theirs that changes per render is read through this ref
     rather than captured in the closure */
  const live = useRef<any>({})
  live.current = { canEditQuals, delQual, moveQual }

  /* the reference's tick/untick + archive + level handlers, verbatim logic */
  useEffect(() => {
    const tbl = tblRef.current!
    const onClick = (e: Event) => {
      const t = e.target as HTMLElement
      /* EDIT QUALS: the ✕ on a heading takes the column off the LoX */
      const del = t.closest('[data-del]') as HTMLElement | null
      if (del && live.current.canEditQuals()) { live.current.delQual(del.dataset.del!); return }
      /* the headings sort in EVERY mode — reading the table is not editing it,
         and this runs before the edit gate below for exactly that reason. The
         dir flip reads the live state through the functional update, so this
         listener can stay mounted once with no dependency on the render. */
      const th = t.closest('th[data-sort]') as HTMLElement | null
      if (th) { const key = th.dataset.sort!; setSort(s => ({ key, dir: s.key === key ? -s.dir : 1 })); return }
      if (!(tbl.classList.contains('editing'))) return
      const cell = t.closest('[data-q]') as HTMLElement | null
      if (cell) {
        const [id, k] = cell.dataset.q!.split('|') as [string, string]
        const p = PEOPLE[id]
        /* THREE STATES on an instructor pilot's AAR cells (owner, 10 Aug 26):
           blank → ✓ → I → blank. Every other cell keeps the plain flip, so
           this is one extra rung on the same ladder rather than a new
           mechanism. `next` is the whole difference. */
        const cur = p.quals[k]
        /* the I rung is OFFERED only where it is legal, rather than offered
           and then refused. Refusing it mid-cycle would strand the cell: a
           NAAR tick whose promotion is rejected has nowhere left to go, and
           the next click rejects it again — blank becomes unreachable and the
           loop the owner asked for stops being a loop. Gating instead makes
           the cycle degrade cleanly to the ordinary two states. */
        const canI = qualI(p, k) && (k === 'daar' || p.quals.daar === 'I')
        const next = canI ? (!cur ? true : cur === true ? 'I' : false) : !cur
        /* night AAR is signed off after day AAR, never before it */
        if (k === 'naar' && next && !p.quals.daar) { notify(); return HOOKS.toast(`${p.cs} needs DAAR before NAAR can be ticked`) }
        /* and say WHY the I was not offered — the click still unticks, but an
           instructor who expected a third state deserves the reason */
        if (k === 'naar' && qualI(p, k) && cur === true && p.quals.daar !== 'I') HOOKS.toast(`${p.cs} needs the DAAR instructor mark before NAAR can carry it — the tick comes off instead`)
        /* SC night is signed off after SC day, exactly as NAAR is after DAAR */
        if (k === 'scNight' && next && !p.quals.scDay) { notify(); return HOOKS.toast(`${p.cs} needs SC DAY before SC NIGHT can be ticked`) }
        p.quals[k] = next
        /* SANS membership is read everywhere off PEOPLE[id].san, never
           p.quals.san — deriveQuals copies ONE WAY, p.san → quals.san, so the
           tick above set only the derived copy and did nothing to who can file
           availability, who the palette strikes, or who sansGate judges (owner,
           15 Aug 26 — the tick was a no-op). Wire it through to p.san so it
           actually grants/removes SANS, and mint the currency counters the boot
           SANS loop gives a member so sanStatus has its numbers. Session-only,
           like every qual tick — PEOPLE is rebuilt from source and SANS_IDS
           re-applied at boot. */
        if (k === 'san') { p.san = !!next; if (next) p.sanQ = p.sanQ || { flown: 0, carry: 0, missedQtrs: 0 } }
        /* SXO is the SAME one-way-copy trap as SANS above: deriveQuals copies
           p.sxo -> quals.sxo, so the tick set only the derived flag and left the
           RAW p.sxo untouched. Leave War's roster projection reads p.sxo, so a
           man marked SXO here never showed as SXO there (owner, 18 Aug 26).
           Wire it through so the projection — and anything else reading the raw
           flag — sees it. Session-only, like every qual tick. */
        if (k === 'sxo') p.sxo = !!next
        if (k === 'daar' && !next && p.quals.naar) { p.quals.naar = false; HOOKS.toast(`${p.cs} — NAAR removed too, it cannot stand without DAAR`) }
        /* DEMOTED, not removed: withdrawing the day instructor mark costs him
           the night one as well, but he keeps night currency itself. */
        if (k === 'daar' && next === true && p.quals.naar === 'I') { p.quals.naar = true; HOOKS.toast(`${p.cs} — NAAR instructor mark removed too, it cannot stand without DAAR's`) }
        if (k === 'scDay' && !next && p.quals.scNight) { p.quals.scNight = false; HOOKS.toast(`${p.cs} — SC NIGHT removed too, it cannot stand without SC DAY`) }
        /* RE-CHECK THE WEEK (owner, 10 Aug 26 — reported as "the warning is
           still there" after signing someone off). A qual is an INPUT to the
           rules: daar/naar drive the AAR warnings, scDay/scNight the SC ones.
           notify() only repaints, and the pucks are painted from WARN, which
           nothing has recomputed — so the board kept showing a warning the
           roster no longer justified until some unrelated schedule edit
           happened to run the validator. The callsign path below already
           re-validated for exactly this reason; the tick never did. */
        validate(); notify(); return
      }
      /* archiving takes a body off the roster, which can change what the
         warnings say about the lines he was on. Write-path role backstop
         (bug hunt, 31 Aug 26): roster membership is the admin's — the ✕ no
         longer renders for a member, so a real gesture cannot reach this;
         it refuses a stale element or a hand-made call, the commitInputEdit
         idiom (a sessionless test/boot context is not a member). */
      const arch = t.closest('[data-arch]') as HTMLElement | null
      if (arch) {
        if (SESSION && SESSION.role !== 'admin') return HOOKS.toast('Only an admin can archive someone', 'warn')
        PEOPLE[arch.dataset.arch!].archived = true; validate(); notify()
      }
    }
    const onChange = (e: Event) => {
      const s = (e.target as HTMLElement).closest('[data-lvl]') as HTMLSelectElement | null
      /* a CAT change moves MORE rules than a tick does — the seat rules, the
         combination matrix, OCU-without-IP — so this one especially cannot
         leave the week showing what it worked out for the old category */
      if (s) { PEOPLE[s.dataset.lvl!].q = s.value; deriveQuals(PEOPLE[s.dataset.lvl!]); validate(); notify(); return }
      const ini = (e.target as HTMLElement).closest('[data-init]') as HTMLInputElement | null
      if (ini) { PEOPLE[ini.dataset.init!].initials = ini.value.trim().toUpperCase(); notify(); return }
      /* upper-cased on the way in, like the initials: the column is sorted by
         GROUPING, and "a" typed on one row and "A" on another would read as
         two flights in the table even though they sort together */
      const flt = (e.target as HTMLElement).closest('[data-flt]') as HTMLInputElement | null
      if (flt) { PEOPLE[flt.dataset.flt!].flight = flt.value.trim().toUpperCase(); notify(); return }
      /* a personnel (ground crew) row's Remarks is free-text prose the person
         owns — kept as typed (only trimmed), unlike the identity fields above.
         Nothing in the engine reads it, so a plain re-render is enough. */
      const prmk = (e.target as HTMLElement).closest('[data-prmk]') as HTMLInputElement | null
      if (prmk) { PEOPLE[prmk.dataset.prmk!].remarks = prmk.value.trim(); notify(); return }
      const cs = (e.target as HTMLElement).closest('[data-cs]') as HTMLInputElement | null
      if (cs) {
        const id = cs.dataset.cs!, was = PEOPLE[id].cs, want = cs.value.trim()
        if (!renameCallsign(id, want)) {
          cs.value = was                       // put the old name back in the box
          if (want && want !== was) HOOKS.toast(`${want} is already taken — callsigns must be unique`)
          return
        }
        /* warning text embeds the callsign, so re-run the engine or the issue
           strips would keep naming them by the name they no longer have */
        validate(); notify()
        HOOKS.toast(`${was} is now ${PEOPLE[id].cs} — every puck follows`)
      }
    }
    /* ---- dragging a heading to move its column --------------------------
       Its own little machine, deliberately: `drag.ts` stays scoped to pucks
       (owner, Aug 26) and a column is not a puck. Pointer events rather than
       HTML5 drag-and-drop so a finger works as well as a mouse — and the
       implicit pointer capture a touch gets is RELEASED on the way down,
       because without that every pointermove keeps reporting the heading the
       drag began on and the column can never find a new home.

       The highlight is written straight onto the DOM instead of through
       state: the table is an innerHTML string that a re-render rebuilds, and
       rebuilding it under a moving finger would drop the drag. Only the drop
       itself changes state. */
    let from = '', over: HTMLElement | null = null
    const clear = () => { if (over) over.classList.remove('qdrop'); over = null }
    const onDown = (e: any) => {
      if (!live.current.canEditQuals()) return
      const th = (e.target as HTMLElement).closest('th[data-col]') as HTMLElement | null
      if (!th || (e.target as HTMLElement).closest('[data-del]')) return
      from = th.dataset.col!
      try { th.releasePointerCapture?.(e.pointerId) } catch { /* mouse: nothing to release */ }
      th.classList.add('qdragging')
    }
    const onMove = (e: any) => {
      if (!from) return
      const th = (e.target as HTMLElement).closest?.('th[data-col]') as HTMLElement | null
      if (!th || th.dataset.col === from) return
      if (th !== over) { clear(); over = th; th.classList.add('qdrop') }
    }
    const onUp = () => {
      if (from && over) live.current.moveQual(from, over.dataset.col!)
      tbl.querySelectorAll('.qdragging').forEach(x => x.classList.remove('qdragging'))
      clear(); from = ''
    }
    tbl.addEventListener('click', onClick)
    tbl.addEventListener('change', onChange)
    tbl.addEventListener('pointerdown', onDown)
    tbl.addEventListener('pointermove', onMove)
    /* on the document, not the table: a finger that lifts off the edge of the
       table must still end the drag rather than leave it armed */
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    /* mark the scroll wrap once the table is scrolled sideways, so the frozen
       callsign column's edge-seal (scheduler.css .qwrap.xscroll …::after) only
       shows then — unscrolled it must not dim the next column's leading edge
       (owner, 16 Aug 26). The wrap is stable across the table's innerHTML
       rebuilds, so this listener survives them. */
    const wrap = tbl.parentElement as HTMLElement
    /* the frozen-header mirror FOLLOWS the grid's sideways scroll and never
       drives it (the Leave War lesson, syncMirror there): a write-back would
       fight an iOS fling. One-way grid → mirror, and only when it is mounted. */
    const onXScroll = () => {
      wrap.classList.toggle('xscroll', wrap.scrollLeft > 0)
      const m = mirrorRef.current
      if (m && m.scrollLeft !== wrap.scrollLeft) m.scrollLeft = wrap.scrollLeft
    }
    wrap.addEventListener('scroll', onXScroll, { passive: true })
    onXScroll()
    return () => {
      tbl.removeEventListener('click', onClick); tbl.removeEventListener('change', onChange)
      tbl.removeEventListener('pointerdown', onDown); tbl.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp)
      wrap.removeEventListener('scroll', onXScroll)
    }
  }, [])

  /* THE FROZEN HEADER — the same fixed-mirror mechanism Leave War uses
     (src/leavewar/ui/Matrix.tsx), and for the same reason. `.qwrap` scrolls the
     table SIDEWAYS (overflow-x), which makes IT the sticky scrollport — but the
     PAGE owns the vertical scroll, so the `position:sticky;top:0` already on the
     thead pins nothing (its scrollport never moves vertically; there is no CSS
     that scrolls one axis here and lets a descendant stick to the page's other
     axis). Instead a fixed MIRROR of the header row appears the moment the real
     header slides under the app top bar, pinned just below it, and disappears
     when it comes back. The "Assigned pilots · N" group row is NOT mirrored
     (owner, 30 Aug 26) — it scrolls away with its rows. The mirror is its own tiny horizontal scroller
     kept in lockstep with the grid (onXScroll above), so the frozen callsign
     column's own sticky-left keeps working inside it. Desktop AND phone (owner,
     29 Aug 26 — "freeze like the leave war top bar … on desktop and mobile").
     jsdom has no layout, so a 0-height header never activates it there. */
  useEffect(() => {
    setStuck(null)
    if (typeof window.matchMedia !== 'function') return
    /* `force` re-measures the pinned widths even while already stuck. A plain
       scroll keeps them (cheap, and they don't change as you scroll), but a
       rotate/resize changes EVERY column width — without a fresh measurement the
       mirror kept the old orientation's widths until a scroll un-stuck and
       re-pinned it (owner, 30 Aug 26 — flipping the phone left the frozen bar cut
       off to the portrait view "to fix it I need to scroll up then back down"). */
    const pin = (force: boolean) => {
      const head = tblRef.current?.tHead
      if (!head) { setStuck(prev => (prev ? null : prev)); return }
      const r = head.getBoundingClientRect()
      if (r.height === 0) return // jsdom, or not laid out yet — never activate
      /* the app top bar stays pinned (sticky, z-index 60), so "the top" is its
         LOWER edge: the mirror freezes there the instant the real header would
         slide under it. Measured live, so it is right whatever the bar wrapped to. */
      const topEdge = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      if (r.top >= topEdge) { setStuck(prev => (prev ? null : prev)); return }
      setStuck(prev => {
        if (prev && !force) return prev
        const wrap = wrapRef.current
        if (!wrap) return prev
        const wr = wrap.getBoundingClientRect()
        const cells = Array.from(head.querySelectorAll('tr:last-child > th')) as HTMLElement[]
        const cols = cells.map(c => c.getBoundingClientRect().width)
        if (cols.length === 0 || cols.some(w => !w)) return prev
        return { top: topEdge, left: wr.left, width: wr.width, cols }
      })
    }
    const onScroll = () => pin(false)
    /* a rotate/resize fires BEFORE iOS settles the new viewport, so an immediate
       read takes the OLD geometry — re-measure on the next two frames AND once
       more after a beat, forcing fresh widths each time. */
    let raf = 0
    let t: ReturnType<typeof setTimeout> | undefined
    const remeasure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => requestAnimationFrame(() => pin(true)))
      clearTimeout(t); t = setTimeout(() => pin(true), 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', remeasure)
    window.addEventListener('orientationchange', remeasure)
    window.visualViewport?.addEventListener('resize', remeasure)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('orientationchange', remeasure)
      window.visualViewport?.removeEventListener('resize', remeasure)
      cancelAnimationFrame(raf); clearTimeout(t)
    }
    /* re-measure (drop the stuck bar so the next scroll re-pins with fresh
       widths) whenever the column set, the view, the filter, or either edit mode
       could have changed a column's width or the header's own markup. */
  }, [cols, qSeatView, qSearch, qEditing, qualsEdit])

  /* start the mirror at the grid's current sideways position the instant it
     mounts, so its first painted frame is already in step (Leave War's own
     on-show sync); from then on onXScroll keeps the two locked. */
  useEffect(() => {
    if (stuck && mirrorRef.current && wrapRef.current) mirrorRef.current.scrollLeft = wrapRef.current.scrollLeft
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stuck])

  const addPerson = () => {
    const cs = addP.cs.trim()
    if (!cs) return HOOKS.toast('A person needs a callsign')   // was a silent no-op
    /* TWO PEOPLE CANNOT SHARE A CALLSIGN (audit, 12 Aug 26). renameCallsign
       has refused this since Aug — "every stored `who` string would be
       ambiguous, ID_BY_CS can only point one way" — and adding never made the
       same check, so the ADD path could do what the RENAME path forbids. It
       was not cosmetic: ID_BY_CS was repointed at the new, empty person, so
       every ground, programme and sim row that stores a callsign STRING
       changed owner to someone with no schedule, and three real conflicts on
       the seed week — a hard clash and two brief-window warnings — silently
       left the checks panel. Same refusal, same words as the rename. */
    if (ID_BY_CS[cs.toLowerCase()]) return HOOKS.toast(`${cs} is already taken — callsigns must be unique`)
    const id = 'p' + Date.now()
    /* the callsign IS the person here — it is what every puck prints and what
       ID_BY_CS resolves — so it is the only required field; initials are the
       administrative record beside it (owner, Aug 26, replacing first/last). */
    /* Personnel (ground crew) carry no CAT — pers:true and an empty q, so
       deriveQuals grants them nothing and they land in the Personnel table. */
    PEOPLE[id] = addP.seat === 'GND'
      ? { cs, initials: addP.initials.trim().toUpperCase(), seat: 'GND', pers: true, q: '', flight: addP.flight.trim() || '-', remarks: '' }
      : { cs, initials: addP.initials.trim().toUpperCase(), seat: addP.seat, q: addP.level, flight: addP.flight.trim() || '-' }
    deriveQuals(PEOPLE[id]); ID_BY_CS[cs.toLowerCase()] = id
    setAddP({ initials: '', cs: '', flight: '', seat: addP.seat, level: addP.level })
    /* ALL already shows them, so only a seat-specific view has to follow the
       person who was just added into the view they landed in */
    if (qSeatView !== 'ALL' && PEOPLE[id].seat !== qSeatView) setSeat(PEOPLE[id].seat)
    /* the two refusals above already speak; the success path was the one
       silent branch — a tap that adds a whole person to the roster with
       nothing said (owner audit) */
    HOOKS.toast(`${cs} added`, 'ok')
    notify()
  }

  /* the export is what is on the screen: the same view, the same filter and
     the same sort order, so a printed LoX matches the one it was taken from.
     ALL mixes pilots and WSOs, so that view — and only that view — carries a
     Seat column, since the rows no longer say which is which. */
  const doExport = () => {
    const all = qSeatView === 'ALL'
    const head = ['Callsign', 'Initials', 'Flight', ...(all ? ['Seat'] : []), 'CAT', ...cols.map(c => c.h)]
    const rows: any[][] = [head]
    qualsIds(qSeatView, qSort, qSearch).forEach(id => {
      const p = PEOPLE[id]
      rows.push([p.cs, p.initials || '', p.flight, ...(all ? [p.seat === 'FCP' ? 'Pilot' : p.pers ? 'Personnel' : 'WSO'] : []), p.pers ? '' : p.q,
        /* I, not Y, for the instructor mark — the CSV is what gets printed and
           passed around, so it has to carry the same three states the screen does.
           Personnel hold no qualifications, so every qual column is blank. */
        ...cols.map(c => p.pers ? '' : qualNA(p, c) ? '–' : p.quals[c.k] === 'I' ? 'I' : p.quals[c.k] ? 'Y' : '')])
    })
    exportCSV(`142-LoX-${qSeatView}.csv`, rows)
    /* same reason as the Inputs page's export: a phone shows nothing when a
       download lands, so the tap otherwise reads as dead */
    HOOKS.toast('CSV downloaded', 'ok')
  }

  return (
    <>
      <div className="qbar">
        <button className="abtn primary" id="qEdit" hidden={qEditing} onClick={() => setEditing(true)}>Enable editing</button>
        <button className="abtn" id="qSave" hidden={!qEditing}
          onClick={() => { setEditing(false); setQualsEdit(false); setArmDel(''); HOOKS.toast('Quals saved (prototype — writes to Dataverse in the full build).') }}>Save changes</button>
        {/* the second mode, inside edit mode and admin-only (owner, 5 Aug 26):
            which qualifications the LoX carries, and in which order. Off by
            default every time editing is switched on — reshaping the table is
            a deliberate act, not the state you land in to tick a box. */}
        {/* it reads the way Enable editing does (owner, 5 Aug 26): BLUE while
            it is the thing to press, then plain dark with a ✕ once you are
            inside it, so the button always shows the way OUT rather than
            lighting up to say where you already are. */}
        {admin && qEditing &&
          <button className={'abtn' + (qualsEdit ? '' : ' primary')} id="qEditQuals"
            aria-pressed={qualsEdit}
            onClick={() => { setQualsEdit(v => !v); setArmDel('') }}>{qualsEdit ? '✕ Edit quals' : 'Edit quals'}</button>}
        <input className="datef" id="qDate" defaultValue="23/06/2026" style={{ maxWidth: 120 }} />
        <button className="abtn" id="qExport" onClick={doExport}>Export to Excel</button>
        {/* Enable editing and Export stay up here (owner, 15 Aug 26); the View
            switch moved down to sit directly above the table it filters. */}
        <div className="grow"></div>
        <div className="searchbox">🔍<input id="qFilter" placeholder="filter" value={qSearch} onChange={e => setQSearch(e.target.value)} /></div>
      </div>
      {/* only while the mode is on: adding a qualification, and the sentence
          that says what the headings do while it is on. Both live here rather
          than in the qbar so the toolbar does not change width every time the
          mode is toggled. */}
      {canEditQuals() && <div className="qadd" id="qQualBar">
        <span className="lab">Add qualification</span>
        <input id="qNewQual" placeholder="e.g. LOW LEVEL" maxLength={14} style={{ width: 150 }}
          value={newQual} onChange={e => setNewQual(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addQual() }} />
        <button className="abtn primary" id="qAddQualBtn" onClick={addQual}>Add</button>
        <span className="qhint">Drag a heading to move its column · ✕ takes one off the LoX ·
          removing a column never changes who holds what</span>
      </div>}
      <div className="qhelp">
        Similar to a LoX and integrated with the board — a person's <b>CAT</b> drives their puck's qualification chip colour and the validator rules.
        A check (✓) means the person holds that qualification. In edit mode, click a cell to toggle it, or the red ✕ to archive someone.
        <a id="qAddQual" onClick={() => HOOKS.toast('Shortcut to the Admin page (Django-style backend in the full build).')}> Add qualifications</a> · <a id="qUses">Set which quals your squadron uses</a> · <a id="qAdminLink">Admin page</a>
      </div>
      {/* the seat view + Add person, right above the table (owner, 15 Aug 26).
          The four seat buttons keep their ids so every caller and test that
          reaches them by #qViewP etc is unchanged; they read as one segmented
          control here rather than loose chips in the toolbar. Add person is
          admin-only and folds behind its own button. */}
      <div className="qtablehead">
        <span className="seglab">Viewing</span>
        <div className="segview" role="group" aria-label="Which people to show">
          <button id="qViewP" className={qSeatView === 'FCP' ? 'on' : ''} aria-pressed={qSeatView === 'FCP'} onClick={() => setSeat('FCP')}>Pilots</button>
          <button id="qViewW" className={qSeatView === 'RCP' ? 'on' : ''} aria-pressed={qSeatView === 'RCP'} onClick={() => setSeat('RCP')}>WSOs</button>
          <button id="qViewG" className={qSeatView === 'GND' ? 'on' : ''} aria-pressed={qSeatView === 'GND'} onClick={() => setSeat('GND')}>Personnel</button>
          <button id="qViewA" className={qSeatView === 'ALL' ? 'on' : ''} aria-pressed={qSeatView === 'ALL'} onClick={() => setSeat('ALL')}>All</button>
        </div>
        <div className="grow"></div>
        {admin && <button className="abtn" id="qAddToggle" aria-expanded={showAdd}
          onClick={() => setShowAdd(v => !v)}>{showAdd ? '✕ Close' : '+ Add person'}</button>}
      </div>
      {admin && showAdd && <div className="qadd qadd-person" data-admin="">
        <input id="qCS" placeholder="Callsign" maxLength={14} style={{ width: 110 }} value={addP.cs} onChange={e => setAddP({ ...addP, cs: e.target.value })} />
        <input id="qInitials" placeholder="Initials" maxLength={12} style={{ width: 120 }} value={addP.initials} onChange={e => setAddP({ ...addP, initials: e.target.value })} />
        <input id="qFlight" placeholder="Flight" maxLength={10} style={{ width: 70 }} value={addP.flight} onChange={e => setAddP({ ...addP, flight: e.target.value })} />
        <select id="qSeat" aria-label="Pilot, WSO or personnel" value={addP.seat}
          onChange={e => { const seat = e.target.value; setAddP({ ...addP, seat, level: seat === 'GND' ? addP.level : catsFor(seat).includes(addP.level) ? addP.level : 'OCU' }) }}><option value="FCP">Pilot (FCP)</option><option value="RCP">WSO (RCP)</option><option value="GND">Personnel (ground crew)</option></select>
        {/* personnel hold no CAT, so the level picker is hidden for them */}
        {addP.seat !== 'GND' && <select id="qLevel" aria-label="Cat" value={addP.level} onChange={e => setAddP({ ...addP, level: e.target.value })}>{catsFor(addP.seat).map(k => <option key={k}>{k}</option>)}</select>}
        <button className="abtn primary" id="qAddPerson" onClick={addPerson}>Add</button>
      </div>}
      <div className="qwrap" ref={wrapRef}>
        <table className={'qtbl' + (qEditing ? ' editing' : '') + (canEditQuals() ? ' qediting' : '')} id="qtbl" ref={tblRef}
          dangerouslySetInnerHTML={{ __html: qualsTable(cols, qSeatView, qSort, qEditing, qSearch, canEditQuals(), armDel, admin) }} />
      </div>
      {/* THE FROZEN HEADER MIRROR (see the effect above). A fixed clone of the
          heading row + the group row, pinned just under the app top bar while the
          real header is scrolled past. Its own horizontal scroller (.qfixed-scroll)
          tracks the grid, so the callsign column's sticky-left freezes inside it
          too. It reuses qualsHead / qualsGrpRow so there is ONE source for the
          heading markup; a colgroup of the live-measured widths (table-layout:fixed)
          lands each column exactly over the grid's. aria-hidden — the real table
          under it stays the single accessible/interactive copy — except that a
          click on a heading still sorts, so the frozen bar is usable while scrolled. */}
      {stuck && (
        <div className="qfixed" data-testid="qsticky-head"
          style={{ top: stuck.top, left: stuck.left, width: stuck.width }}
          onClick={e => {
            const th = (e.target as HTMLElement).closest?.('th[data-sort]') as HTMLElement | null
            if (th) { const key = th.dataset.sort!; setSort(s => ({ key, dir: s.key === key ? -s.dir : 1 })) }
          }}>
          <div className="qfixed-scroll" ref={mirrorRef}>
            <table className={'qtbl' + (qEditing ? ' editing' : '') + (canEditQuals() ? ' qediting' : '')}
              style={{ tableLayout: 'fixed', width: stuck.cols.reduce((a, b) => a + b, 0), minWidth: 0 }}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html:
                `<colgroup>${stuck.cols.map(w => `<col style="width:${w}px">`).join('')}</colgroup>`
                /* Only the COLUMN HEADERS freeze — NOT the "Assigned pilots · N"
                   group row (owner, 30 Aug 26 — "there isn't a need to freeze this
                   bar. Applicable to the rest as well", covering every seat view's
                   roster label). The group row stays in the live table below, so
                   it scrolls away with its rows and the mirror is header-only. */
                + qualsHead(cols, qSeatView, qSort, canEditQuals(), armDel) }} />
          </div>
        </div>
      )}
      {/* ---- the Archived section (owner, 19 Aug 26) ------------------------
          Where a body lands when it is archived — by the red ✕ above, or by
          the Leave War post-out's "Archive on PO date" switch the day the PO
          arrives. Their quals, CAT and every puck on a past schedule are
          untouched (archiving is a flag, not a delete), so Restore puts them
          back exactly as they left — "in the future they post back into this
          sqn, they can be re-added easily". Restore is admin-only: it is the
          other half of the post-out, which is management's, and it also
          clears the Leave War posting-out through the sync seam. Sentinel
          bodies (ALL AVAIL) are archived by construction and are not people,
          so they never list here. */}
      {(() => {
        const archived = Object.keys(PEOPLE)
          .filter(id => PEOPLE[id].archived && !PEOPLE[id].special)
          .sort((a, b) => cmp(SORTKEY.cs(PEOPLE[a]), SORTKEY.cs(PEOPLE[b])))
        if (!archived.length) return null
        return (
          <div className="qarchive" id="qArchive">
            <button className="abtn" id="qArchToggle" aria-expanded={showArch}
              onClick={() => setShowArch(v => !v)}>
              {showArch ? '▾' : '▸'} Archived · {archived.length}
            </button>
            {showArch && (
              <div className="qarchlist" data-testid="qarchlist">
                {archived.map(id => {
                  const p = PEOPLE[id]
                  return (
                    <div className="qarchrow" key={id} data-testid={`qarchrow-${id}`}>
                      <span className="qarchcs">{p.cs}</span>
                      <span className="qarchmeta">
                        {p.pers ? 'Personnel' : `${p.seat === 'FCP' ? 'Pilot' : 'WSO'} · ${p.q}`}
                      </span>
                      {admin && (
                        <button className="abtn qrestore" data-restore={id}
                          onClick={() => {
                            if (restoreArchivedPerson(id)) HOOKS.toast(`${p.cs} restored to the roster`, 'ok')
                          }}>
                          Restore
                        </button>
                      )}
                    </div>
                  )
                })}
                <div className="qarchhint">
                  Archived people keep their quals and their pucks on past schedules.
                  {admin ? ' Restore puts them straight back on the roster.' : ' An admin can restore them.'}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </>
  )
}
