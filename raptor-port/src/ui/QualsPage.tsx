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
import { useVersion } from './useStore'
/* this page used to carry its own copy of exportCSV — which is how it missed
   the UTF-8 BOM the shared one now writes. One exporter, one encoding. */
import { exportCSV } from './export'

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
const DEFAULT_QUAL_COLS: any[] = [
  { k: 'san', h: 'SANS', lav: true }, { k: 'sxo', h: 'SXO', lav: true },
  { k: 'sched', h: 'Scheduler', apt: true },
  { k: 'scDay', h: 'SC DAY', scq: true }, { k: 'scNight', h: 'SC NIGHT', scq: true },
  { k: 'daar', h: 'DAAR', aar: true, fcpOnly: true }, { k: 'naar', h: 'NAAR', aar: true, fcpOnly: true },
  { k: 'nvg', h: 'NVG', lav: true }, { k: 'imc', h: 'IMC', lav: true },
  /* TF is new (owner, 5 Aug 26) and starts UNHELD by everyone — nothing
     derives it from CAT the way IMC and NVG are derived, because no one has
     been signed off for it yet. Ticked by hand in edit mode, and no rule
     reads it: it is a record, not a gate, until the squadron asks for one. */
  { k: 'tf', h: 'TF', lav: true },
]
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
   the only thing this app writes to storage. */
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

/* renderQuals' head + rows, verbatim strings */
function qualsTable(cols: any[], qSeatView: string, qSort: any, qEditing: boolean, qSearch: string, qualsEdit: boolean, armDel: string) {
  const ids = qualsIds(qSeatView, qSort, qSearch)
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
     record (owner, Aug 26). */
  const head = `<thead><tr>`
    + sortTh('cs', 'Callsign', '', 'Sort by callsign', ' style="text-align:left"')
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
      return `<tr class="persrow"><td class="qname" data-person="${id}" title="${esc(p.name || '')}">${cs}</td><td class="qinitc">${init}</td><td class="qfltc">${flt}</td><td class="qcell na"></td>${blanks}<td class="qprmk" style="text-align:left">${rmk}</td><td><span class="qarch" data-arch="${id}" title="Archive">✕</span></td></tr>`
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
    return `<tr><td class="qname" data-person="${id}" title="${esc(p.name || '')}">${cs}</td><td class="qinitc">${init}</td><td class="qfltc">${flt}</td><td>${lvl}</td>${cells}<td style="text-align:left;color:var(--ink-3)">${LEVELNAME[p.q]}</td><td><span class="qarch" data-arch="${id}" title="Archive">✕</span></td></tr>`
  }).join('')
  const grp = qSeatView === 'FCP' ? 'Assigned pilots' : qSeatView === 'RCP' ? 'Assigned WSOs' : qSeatView === 'GND' ? 'Personnel (ground crew)' : 'Assigned aircrew'
  return head + `<tbody><tr class="grp"><td colspan="${5 + cols.length + 1}">${grp} · ${ids.length}</td></tr>${rows}</tbody>`
}

export function QualsPage() {
  useVersion()
  const [qSeatView, setSeat] = useState('FCP')
  const [qSort, setSort] = useState({ key: 'cs', dir: 1 })
  const [qEditing, setEditing] = useState(false)
  const [qSearch, setQSearch] = useState('')
  /* the LoX's own shape: which qualification columns, in which order */
  const [cols, setCols] = useState<any[]>(DEFAULT_QUAL_COLS)
  const [qualsEdit, setQualsEdit] = useState(false)
  const [newQual, setNewQual] = useState('')
  /* the column whose ✕ has been pressed once — see WIRED above */
  const [armDel, setArmDel] = useState('')
  const [addP, setAddP] = useState({ initials: '', cs: '', flight: '', seat: 'FCP', level: 'OCU' })
  const tblRef = useRef<HTMLTableElement>(null)
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
         warnings say about the lines he was on */
      const arch = t.closest('[data-arch]') as HTMLElement | null
      if (arch) { PEOPLE[arch.dataset.arch!].archived = true; validate(); notify() }
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
    return () => {
      tbl.removeEventListener('click', onClick); tbl.removeEventListener('change', onChange)
      tbl.removeEventListener('pointerdown', onDown); tbl.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp)
    }
  }, [])

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
    exportCSV(`142SQN-LoX-${qSeatView}.csv`, rows)
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
        <span className="div" style={{ width: 1, height: 22, background: 'var(--edge)' }}></span>
        {/* View sits beside Export because the two answer the same question —
            which people am I looking at, and which people come out. The Sort
            chips that used to follow are gone: the headings sort now. */}
        <span className="lab">View</span>
        <button className={'fchip' + (qSeatView === 'FCP' ? ' on' : '')} id="qViewP" onClick={() => setSeat('FCP')}>Pilots</button>
        <button className={'fchip' + (qSeatView === 'RCP' ? ' on' : '')} id="qViewW" onClick={() => setSeat('RCP')}>WSOs</button>
        <button className={'fchip' + (qSeatView === 'GND' ? ' on' : '')} id="qViewG" onClick={() => setSeat('GND')}>Personnel</button>
        <button className={'fchip' + (qSeatView === 'ALL' ? ' on' : '')} id="qViewA" onClick={() => setSeat('ALL')}>All</button>
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
      {admin && <div className="qadd" data-admin="">
        <span className="lab">Add person</span>
        <input id="qCS" placeholder="Callsign" maxLength={14} style={{ width: 110 }} value={addP.cs} onChange={e => setAddP({ ...addP, cs: e.target.value })} />
        <input id="qInitials" placeholder="Initials" maxLength={12} style={{ width: 120 }} value={addP.initials} onChange={e => setAddP({ ...addP, initials: e.target.value })} />
        <input id="qFlight" placeholder="Flight" maxLength={10} style={{ width: 70 }} value={addP.flight} onChange={e => setAddP({ ...addP, flight: e.target.value })} />
        <select id="qSeat" aria-label="Pilot, WSO or personnel" value={addP.seat}
          onChange={e => { const seat = e.target.value; setAddP({ ...addP, seat, level: seat === 'GND' ? addP.level : catsFor(seat).includes(addP.level) ? addP.level : 'OCU' }) }}><option value="FCP">Pilot (FCP)</option><option value="RCP">WSO (RCP)</option><option value="GND">Personnel (ground crew)</option></select>
        {/* personnel hold no CAT, so the level picker is hidden for them */}
        {addP.seat !== 'GND' && <select id="qLevel" aria-label="Cat" value={addP.level} onChange={e => setAddP({ ...addP, level: e.target.value })}>{catsFor(addP.seat).map(k => <option key={k}>{k}</option>)}</select>}
        <button className="abtn primary" id="qAddPerson" onClick={addPerson}>Add</button>
      </div>}
      <div className="qwrap">
        <table className={'qtbl' + (qEditing ? ' editing' : '') + (canEditQuals() ? ' qediting' : '')} id="qtbl" ref={tblRef}
          dangerouslySetInnerHTML={{ __html: qualsTable(cols, qSeatView, qSort, qEditing, qSearch, canEditQuals(), armDel) }} />
      </div>
    </>
  )
}
