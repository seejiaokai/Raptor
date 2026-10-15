/* The Logic tab — a guide for the person reading it to how the app's rules work (owner D925, built as drawn D928,
   D929, D930, D931 — 15 Oct 26): ONE row of controls (the page's name, search, Filter, ✎ Edit — the design guide §3,
   D926), then two parts: SETTINGS, everything an admin can change, each with the one line saying what moves with it;
   then THE CHECKS, every warning, advisory and note the app raises, four with a folded "How it works". Its two lists
   and their words: ui/logic-html.ts. The admin's edit mode is as it was: a value is parsed, bounded and applied live,
   the clash grading toggles, "Reset to standard" puts them all back — and now each changed value carries its own
   Reset while editing (the mock-up's per-setting Reset). The RULES MODIFIED stamp is as it was. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { VCONF, SHIFT_HARD, RULE_SPEC, RULE_STD, KIND_LABEL, ruleFmt, ruleParse, ruleOff, kindOff, rulesOffCount, rulesCheckedOffCount, rulesSave, rulesReset } from '../engine/rules'
import { WARN, validate, lgFired } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { setLgEdit, lgCanEdit } from '../state/auth'
import { isAdmin } from '../state/perms'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { useVersion } from './useStore'
import { lgSettings, lgChecks, lgChkName, lgKinds, LG_TIER, type LgSet, type LgChk } from './logic-html'
import { setInpSet, setSansSet } from './pops'
import { missionTracking, setMissionTracking } from '../engine/insights-config'

/* the reference's ruleApply: write, persist, re-run the engine, repaint */
function ruleApply() {
  rulesSave()
  validate()
  notify()
}

/* which "How it works" folds are open. The checks are one built string swapped in whole whenever it changes (a value
   edited, the filter, the search), and a swap would close every fold the reader had opened — so the open ones are
   remembered here and drawn open again. Session-only, as every view state is. */
const LGOPEN = new Set<string>()

const FILTERS = ['all', 'hard', 'adv', 'note', 'fired'] as const
type LgFilter = typeof FILTERS[number]
const FILTER_WORD: Record<LgFilter, string> = { all: 'All', hard: 'Warnings', adv: 'Advisories', note: 'Notes', fired: 'Fired this week' }

const plain = (h: string) => String(h).replace(/<[^>]*>/g, ' ')

/* one setting's value: a box while an admin edits, the value otherwise */
function setValue(s: LgSet, edit: boolean, admin: boolean, next: () => number): string {
  const box = (k: string) => `<input class="lgin${RULE_SPEC[k].kind === 'text' ? ' lgin-text' : ''}" data-lgset="${k}" data-lgi="${next()}" value="${esc(ruleFmt(k, VCONF[k]))}"`
    + (RULE_SPEC[k].kind === 'text' ? ` maxlength="${RULE_SPEC[k].maxlen}"` : '') + ` aria-label="${esc(s.name)}${s.kind === 'window' ? (k === 'scDayFrom' ? ' opens' : ' closes') : ''}">`
  const val = (k: string) => `<span class="val">${esc(ruleFmt(k, VCONF[k]))}</span>`
  if (s.kind === 'window') return edit ? `${box('scDayFrom')}<span class="lgto">to</span>${box('scDayTo')}` : `${val('scDayFrom')}<span class="lgto">to</span>${val('scDayTo')}`
  if (s.kind === 'kinds') return ''
  /* ONE SETTING, TWO WAYS IN (owner D639): set in a calendar's own settings window; an admin's value opens that SAME
     window, in or out of editing (the window is its own draft and its own Save); a member reads it as it is set */
  if (s.kind === 'door') return admin
    ? `<button type="button" class="lgval lgdoor" data-lgopen="${s.door}" aria-label="${esc(s.name)}: ${esc(s.value!())}, opens the ${s.door === 'sans' ? 'SANS' : 'Inputs'} calendar settings">${esc(s.value!())} <span aria-hidden="true">›</span></button>`
    : `<span class="val">${esc(s.value!())}</span>`
  /* the Insights switch (D521, D524): live while editing, read otherwise */
  if (s.kind === 'mix') return edit
    ? `<span class="lgmix"><input id="lgMissionMix" type="checkbox" role="switch" data-lgmix="1"${missionTracking() ? ' checked' : ''} aria-label="${esc(s.name)}">${esc(s.value!())}</span>`
    : `<span class="lgmix"><span id="lgMissionMix" class="lg-switch-read${missionTracking() ? ' on' : ''}" role="switch" aria-checked="${missionTracking()}" aria-disabled="true" aria-label="${esc(s.name)}"></span>${esc(s.value!())}</span>`
  const k = s.keys[0]
  return edit ? box(k) : val(k)
}

function settingsHTML(q: string, edit: boolean, admin: boolean): { html: string, n: number } {
  let lgi = 0, n = 0
  const next = () => lgi++
  const html = lgSettings().map(grp => {
    const rows = grp.items.map(s => {
      const line = s.line()
      if (q && (s.name + ' ' + plain(line) + ' ' + grp.g + ' ' + (s.value ? s.value() : '')).toLowerCase().indexOf(q) < 0) return ''
      n++
      /* off standard: this row's own settings (the door rows' are measured in their own windows, and the kinds below) */
      const own = s.kind === 'door' ? [] : s.keys.filter(k => RULE_SPEC[k])
      const off = own.some(ruleOff) || (s.kind === 'kinds' && Object.keys(KIND_LABEL).some(kindOff))
      const std = s.kind === 'kinds' ? '' : own.filter(ruleOff).map(k => esc(ruleFmt(k, RULE_STD.v[k]))).join(' to ')
      const kinds = s.kind === 'kinds' ? `<span class="lgkinds">` + lgKinds().map(x => edit
        ? `<label class="lgk ${x.hard ? 'hard' : 'adv'}${kindOff(x.k) ? ' off' : ''}"><input type="checkbox" data-lgkind="${x.k}"${x.hard ? ' checked' : ''}><span>${esc(x.label)}</span><b>${x.hard ? 'Warning' : 'Advisory'}</b></label>`
        : `<span class="lgk ${x.hard ? 'hard' : 'adv'}${kindOff(x.k) ? ' off' : ''}"><span>${esc(x.label)}</span><b>${x.hard ? 'Warning' : 'Advisory'}</b></span>`).join('') + `</span>` : ''
      /* a changed value says so on its row: its standard, and — while an admin edits — its own Reset (the mock-up) */
      const mark = off ? `<span class="lgstd">${std ? `Standard ${std}` : 'Changed from the standard'}`
        + (edit ? ` · <button type="button" class="lgreset1" data-lgreset="${s.kind === 'kinds' ? 'kinds' : own.join(',')}">Reset</button>` : '') + `</span>` : ''
      return `<div class="lgset${off ? ' off' : ''}${s.kind === 'kinds' ? ' lgset-kinds' : ''}${s.kind === 'text' ? ' lgset-text' : ''}" data-lgkey="${esc(s.keys.join(' '))}" data-lgname="${esc(s.name)}">`
        + `<span class="lgnm">${esc(s.name)}</span>`
        + `<span class="lgv">${setValue(s, edit, admin, next)}</span>`
        + `<span class="lgwhy">${line}${mark}</span>${kinds}</div>`
    }).join('')
    return rows ? `<section class="lggrp"><h3>${esc(grp.g)}</h3>${rows}</section>` : ''
  }).join('')
  return { html, n }
}

function checksHTML(q: string, f: LgFilter, fired: any): { html: string, n: number } {
  let n = 0
  const html = lgChecks().map(grp => {
    const rows = grp.items.map((c: LgChk) => {
      const name = lgChkName(c), line = c.line(), how = c.how ? c.how() : []
      if (q && (name + ' ' + plain(line) + ' ' + plain(how.join(' ')) + ' ' + grp.g + ' ' + LG_TIER[c.sev]).toLowerCase().indexOf(q) < 0) return ''
      if (f === 'fired' && !(c.code && fired[c.code])) return ''
      if (f !== 'all' && f !== 'fired' && c.sev !== f) return ''
      n++
      return `<div class="lgchk ${c.sev}" data-chk="${c.id}"${c.code ? ` data-code="${c.code}"` : ''}>`
        + `<span class="lgdot ${c.sev}" aria-hidden="true"></span>`
        + `<span class="lgnm"><span class="lgsr">${LG_TIER[c.sev]}: </span>${esc(name)}</span>`
        + (line ? `<span class="lgwhy">${line}</span>` : '')
        /* the fold's key points, one to a line (D930, D933) */
        + (how.length ? `<details class="lghow" data-how="${c.id}"${LGOPEN.has(c.id) ? ' open' : ''}><summary>How it works</summary><ul>${how.map(x => `<li>${x}</li>`).join('')}</ul></details>` : '')
        + `</div>`
    }).join('')
    return rows ? `<section class="lggrp"><h3>${esc(grp.g)}</h3>${rows}</section>` : ''
  }).join('')
  return { html, n }
}

function logicBody(LGQ: string, LGF: LgFilter) {
  if (!WARN.byDay.length) validate()
  const fired = lgFired()
  const q = LGQ.trim().toLowerCase()
  const edit = lgCanEdit(), admin = isAdmin()
  /* the settings are all one kind of thing — they show with All only; a filter is a question about the checks */
  const s = LGF === 'all' ? settingsHTML(q, edit, admin) : { html: '', n: 0 }
  const c = checksHTML(q, LGF, fired)
  const firedN = Object.keys(fired).length
  const html = (s.n ? `<div class="lgpart" id="lgSettings"><h2>Settings</h2><div class="lgcols">${s.html}</div></div>` : '')
    + (c.n ? `<div class="lgpart" id="lgChecks"><h2>The checks</h2><div class="lgcols">${c.html}</div></div>` : '')
    || `<div class="lgempty">${q ? `Nothing matches “${esc(LGQ)}”.` : 'Nothing fired on this week\'s schedule.'}</div>`
  return { html, firedN }
}

export function LogicPage() {
  useVersion()
  const [LGQ, setLGQ] = useState('')
  const [LGF, setLGF] = useState<LgFilter>('all')
  const [menu, setMenu] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const fBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  /* D561: the page scrolls under Shell's sticky bar. Measure only its size,
     on mount/resize, without repainting the rules or following each scroll. */
  useLayoutEffect(() => {
    const bar = barRef.current, top = document.querySelector('.topbar')
    if (!bar || !top) return
    const place = () => { bar.style.top = `${top.getBoundingClientRect().height}px` }
    place()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    observer?.observe(top)
    window.addEventListener('resize', place)
    return () => { observer?.disconnect(); window.removeEventListener('resize', place) }
  }, [])

  const admin = isAdmin()
  const editing = lgCanEdit()
  const b = logicBody(LGQ, LGF)
  const off = rulesOffCount()
  /* W2: the stamp and the strip speak of RULES — the settings a check reads; Reset speaks of every setting */
  const checkedOff = rulesCheckedOffCount()

  /* a modified rule set is never silent: the body class drives the
     RULES MODIFIED stamp on the week banner */
  useEffect(() => { document.body.classList.toggle('page-rules-off', !!checkedOff) })

  /* THE FILTER MENU closes on a press outside it (the app's popup rule, 4 Sep 26), on Escape (the keyboard back on its
     button — the guide §2) and on a pick; it opens with the keyboard on the picked filter */
  useEffect(() => {
    if (!menu) return
    const onDown = (e: PointerEvent) => { const t = e.target as Node; if (!menuRef.current?.contains(t) && !fBtnRef.current?.contains(t)) setMenu(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setMenu(false); fBtnRef.current?.focus() } }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey, true)
    ;(menuRef.current?.querySelector('[aria-checked="true"]') as HTMLElement | null)?.focus()
    return () => { document.removeEventListener('pointerdown', onDown, true); document.removeEventListener('keydown', onKey, true) }
  }, [menu])
  const menuKeys = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitemradio"]') || [])] as HTMLElement[]
    const i = items.indexOf(document.activeElement as HTMLElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus()
  }

  /* the reference's change/pointerdown listeners on #lgBody, verbatim logic —
     native listeners, since the fields live inside the built markup */
  useEffect(() => {
    const host = bodyRef.current!
    let LGNEXT: any = null
    const lgReapply = () => {
      const want = LGNEXT; LGNEXT = null
      ruleApply()
      if (!want) return
      /* the repaint lands after React commits — put the pointer back then */
      setTimeout(() => {
        const el = host.querySelector(`[data-${want[0]}="${want[1]}"]`) as any
        if (el) { el.focus(); if (el.select) el.select() }
      }, 0)
    }
    const onChange = (e: Event) => {
      const t = e.target as HTMLElement
      const i = t.closest('[data-lgset]') as HTMLInputElement | null
      if (i) {
        if (!isAdmin()) return
        const k = i.dataset.lgset!, spec = RULE_SPEC[k], v = ruleParse(k, i.value)
        if (v == null || (spec.kind!=='text' && (v < spec.lo || v > spec.hi))) {
          /* put the LIVE value back, the way every other refusing path in the
             app does (txtSet's callers, setInpField, the stores pen). The box
             used to sit there still showing `abc` while the rule underneath
             read 1h — the one refusal in the app that left its own bad value
             on screen looking saved (audit, 12 Aug 26). The .bad flash still
             marks which box was refused. */
          i.classList.add('bad')
          i.value = ruleFmt(k, VCONF[k])
          return HOOKS.toast(`${spec.t} must be between ${ruleFmt(k, spec.lo)} and ${ruleFmt(k, spec.hi)}`, 'warn')
        }
        if (v === VCONF[k]) { i.classList.remove('bad'); i.value=ruleFmt(k,v); return }
        VCONF[k] = v; lgReapply()
        HOOKS.toast(`${spec.t} → ${ruleFmt(k, v)}${v === RULE_STD.v[k] ? ' (standard)' : ''}`)
        return
      }
      const c = t.closest('[data-lgkind]') as HTMLInputElement | null
      if (c) {
        if (!isAdmin()) return
        const k = c.dataset.lgkind!
        SHIFT_HARD[k] = c.checked; lgReapply()
        HOOKS.toast(`A shift against ${KIND_LABEL[k]} is now ${c.checked ? 'a Warning' : 'an Advisory'}`)
        return
      }
      /* the Insights switch, while editing (D521) */
      const m = t.closest('[data-lgmix]') as HTMLInputElement | null
      if (m && lgCanEdit()) setMissionTracking(m.checked)
    }
    const onPointerDown = (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-lgset],[data-lgkind]') as HTMLElement | null
      /* prefer the ordinal — a key could render on several rows, and the
         key selector alone re-focused the first of them */
      LGNEXT = t ? (t.dataset.lgi != null ? ['lgi', t.dataset.lgi]
        : t.dataset.lgset ? ['lgset', t.dataset.lgset] : ['lgkind', t.dataset.lgkind]) : null
    }
    const onClick = (e: Event) => {
      const el = e.target as HTMLElement
      /* a row's door to its calendar's settings window (D639) */
      const b = el.closest('[data-lgopen]') as HTMLElement | null
      if (b) {
        if (!isAdmin()) return
        if (b.dataset.lgopen === 'sans') setSansSet(true); else setInpSet(true)
        notify()
        return
      }
      /* one setting back to the squadron standard — the changed value shows changed, so no note says it (D850) */
      const r = el.closest('[data-lgreset]') as HTMLElement | null
      if (r) {
        if (!isAdmin() || !lgCanEdit()) return
        if (r.dataset.lgreset === 'kinds') Object.keys(KIND_LABEL).forEach(k => { SHIFT_HARD[k] = RULE_STD.s[k] })
        else r.dataset.lgreset!.split(',').forEach(k => { if (RULE_SPEC[k]) VCONF[k] = RULE_STD.v[k] })
        ruleApply()
      }
    }
    /* a fold opened or closed — remembered, so a repaint draws it as the reader left it */
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement
      if (!d.matches?.('details[data-how]')) return
      if (d.open) LGOPEN.add(d.dataset.how!); else LGOPEN.delete(d.dataset.how!)
    }
    host.addEventListener('change', onChange)
    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('click', onClick)
    host.addEventListener('toggle', onToggle, true)
    return () => { host.removeEventListener('change', onChange); host.removeEventListener('pointerdown', onPointerDown); host.removeEventListener('click', onClick); host.removeEventListener('toggle', onToggle, true) }
  }, [])

  return (
    <>
      <div className="lgbar" ref={barRef}>
        <h1 className="lgttl">Logic</h1>
        <div className="searchbox">🔍<input id="lgSearch" placeholder="Search" aria-label="Search the rules"
          value={LGQ} onChange={e => setLGQ(e.target.value)} /></div>
        <span className="lgfilt">
          <button type="button" ref={fBtnRef} className={'abtn' + (LGF !== 'all' ? ' on' : '')} id="lgFilterBtn"
            aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(m => !m)}>{LGF === 'all' ? 'Filter' : FILTER_WORD[LGF]}</button>
          {menu && <div className="lgmenu" id="lgFilters" role="menu" aria-label="Show" ref={menuRef} onKeyDown={menuKeys}>
            {FILTERS.map(f =>
              <button key={f} type="button" role="menuitemradio" aria-checked={LGF === f} className={'lgmi' + (LGF === f ? ' on' : '')} data-lgf={f}
                onClick={() => { setLGF(f); setMenu(false); fBtnRef.current?.focus() }}>
                {FILTER_WORD[f]}{f === 'fired' ? ` (${b.firedN})` : ''}
              </button>)}
          </div>}
        </span>
        <button type="button" className="abtn" id="lgEdit" hidden={!admin || editing}
          onClick={() => { setLgEdit(true); notify(); HOOKS.toast('Editing rules — the schedule rechecks as you type') }}>✎ Edit</button>
        <button type="button" className="abtn primary" id="lgDone" hidden={!admin || !editing}
          onClick={() => { setLgEdit(false); notify() }}>Done</button>
        <button type="button" className="abtn ghost" id="lgReset" hidden={!admin || !off}
          onClick={() => {
            if (!isAdmin()) return
            const n = rulesOffCount(); if (!n) return
            rulesReset(); ruleApply()
            HOOKS.toast(`${n} rule${n > 1 ? 's' : ''} back to squadron standard`)
          }}>
          {/* on a phone the row runs out of room while editing: the button keeps its place and takes shorter words (the
              design guide §3, "A page's controls are one row" — D926; as the Inputs list's dates button, D910) */}
          <span className="lgrs-long">Reset to standard</span><span className="lgrs-short" aria-hidden="true">Reset all</span></button>
      </div>
      {/* the strip, while a setting a check reads is changed (W2). Its old "not the published ones" was untrue: a
          published day keeps its brief, report, debrief and OIL values until it is published again (D928, the
          inventory's one misleading line) */}
      <div className="lgoff" id="lgOff" hidden={!checkedOff}>
        {checkedOff ? <><b>{checkedOff} setting{checkedOff > 1 ? 's' : ''} changed from the squadron standard.</b>{' '}
          The schedule is checked against them now. A published day keeps its printed B and its OIL until it is published again.
          {admin ? '' : ' Only an admin can change them.'}</> : null}
      </div>
      <div className="lgwrap" id="lgBody" ref={bodyRef} dangerouslySetInnerHTML={{ __html: b.html }} />
    </>
  )
}
