/* The Logic tab — every rule the engine applies, read out of the LIVE
   objects at render time (renderLogic's row/group strings kept verbatim), with
   the admin edit mode: thresholds parsed + bounded + applied live, the clash
   matrix toggles, Reset to standard, and the RULES MODIFIED stamp. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { VCONF, SHIFT_HARD, RULE_SPEC, RULE_STD, KIND_LABEL, ruleFmt, ruleParse, ruleOff, kindOff, rulesOffCount, rulesCheckedOffCount, rulesSave, rulesReset } from '../engine/rules'
import { WARN, validate, lgFired } from '../engine/validate'
import { dowShort } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { setLgEdit, lgCanEdit } from '../state/auth'
import { isAdmin } from '../state/perms'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { useVersion } from './useStore'
import { lgRules, LG_TIER } from './logic-html'
import { setInpSet, setSansSet } from './pops'
import { missionTracking, setMissionTracking } from '../engine/insights-config'

/* the reference's ruleApply: write, persist, re-run the engine, repaint */
function ruleApply() {
  rulesSave()
  validate()
  notify()
}

/* renderLogic's body loop, verbatim strings, returning what the page needs */
function logicBody(LGQ: string, LGF: string) {
  if (!WARN.byDay.length) validate()
  const fired = lgFired()
  const q = LGQ.toLowerCase()
  let shown = 0, total = 0, firedN = 0
  /* one setting can now sit on SEVERAL rows (reportLead is quoted — and
     editable — on both the nominal-report row and the CREW_TIGHT row, owner
     21 Aug 26), so each rendered box also carries a per-render ordinal. The
     focus-restore after a repaint targets the ordinal, not the key — with
     the key alone it always jumped back to the FIRST box holding it. */
  let lgi = 0
  const strip = (h: any) => String(h).replace(/<[^>]*>/g, ' ')
  const html = lgRules().map((grp: any) => {
    const rows = grp.rows.map((r: any) => {
      total++
      const f = r.code ? fired[r.code] : null
      if (f) firedN++
      const txt = r.t(), src = r.src ? r.src() : (r.code || '')
      const hay = (strip(txt) + ' ' + grp.g + ' ' + (r.code || '') + ' ' + src + ' ' + LG_TIER[r.sev]).toLowerCase()
      if (q && hay.indexOf(q) < 0) return ''
      if (LGF === 'fired' && !f) return ''
      if (LGF !== 'all' && LGF !== 'fired' && r.sev !== LGF) return ''
      shown++
      const days = f ? [...f.days].sort((a: any, b: any) => a - b).map(dowShort).join(', ') : ''
      const keys = (r.set || []).filter((k: any) => RULE_SPEC[k])
      const edited = keys.some(ruleOff) || (r.kinds && Object.keys(KIND_LABEL).some(kindOff))
      const fields = keys.length ? `<span class="lgmatrix">` + keys.map((k: any) => {
        const off = ruleOff(k)
        return `<span class="lgcell ${off ? 'adv' : ''}${RULE_SPEC[k].kind==='text'?' lgcell-text':''}"><span class="k">${esc(RULE_SPEC[k].t)}</span>`
          + (lgCanEdit()
            ? `<input class="lgin" data-lgset="${k}" data-lgi="${lgi++}" value="${esc(ruleFmt(k, VCONF[k]))}"`
            + (RULE_SPEC[k].kind==='text'?` maxlength="${RULE_SPEC[k].maxlen}"`:'')
            + ` aria-label="${esc(RULE_SPEC[k].t)}">`
            : `<span class="val">${esc(ruleFmt(k, VCONF[k]))}</span>`)
          + (off ? `<span class="lgstd">standard ${esc(ruleFmt(k, RULE_STD.v[k]))}</span>`
            + `<span class="lgmod">changed</span>` : '') + `</span>`
      }).join('') + `</span>` : ''
      /* ONE SETTING, TWO WAYS IN (owner D639): a row whose setting is set in a calendar's own settings window carries a
         button that opens that SAME window — for an admin, in or out of "Edit rules" (the window is its own draft and
         its own Save); a member reads the rule as it is set. */
      const door = r.open && isAdmin()
        ? `<button type="button" class="abtn lgopen" data-lgopen="${r.open}">${r.open === 'sans' ? 'SANS calendar settings…' : 'Inputs calendar settings…'}</button>` : ''
      return `<div class="lgrule ${r.sev}${edited ? ' edited' : ''}">`
        + `<span class="lgsev"><span class="tier ${r.sev}">${LG_TIER[r.sev]}</span>`
        + (r.code ? `<span class="code">${esc(r.code)}</span>` : '') + `</span>`
        + `<span class="lgtxt">${txt}${r.extra ? r.extra() : ''}${fields}${door}</span>`
        + `<span class="lgsrc">${esc(src)}`
        + (r.code ? `<span class="lgfired ${f ? 'on' : 'off'}">${f ? `fired ${f.n}× · ${esc(days)}` : 'not fired this week'}</span>` : '')
        + `</span></div>`
    }).join('')
    if (!rows) return ''
    return `<div class="lggrp"><h2>${esc(grp.g)}</h2>`
      + (grp.sub ? `<p class="gsub">${esc(grp.sub)}</p>` : '') + rows + `</div>`
  }).join('') || `<div class="lgempty">Nothing matches “${esc(LGQ)}”.</div>`
  return { html, shown, total, firedN }
}

export function LogicPage() {
  useVersion()
  const [LGQ, setLGQ] = useState('')
  const [LGF, setLGF] = useState('all')
  const bodyRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

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
  const b = logicBody(LGQ, LGF)
  const off = rulesOffCount()
  /* W2: the stamp and the strip speak of RULES — the settings a check reads; the count and Reset speak of every setting */
  const checkedOff = rulesCheckedOffCount()

  /* a modified rule set is never silent: the body class drives the
     RULES MODIFIED stamp on the week banner */
  useEffect(() => { document.body.classList.toggle('page-rules-off', !!checkedOff) })

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
      }
    }
    const onPointerDown = (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-lgset],[data-lgkind]') as HTMLElement | null
      /* prefer the ordinal — a key can render on several rows now, and the
         key selector alone re-focused the first of them */
      LGNEXT = t ? (t.dataset.lgi != null ? ['lgi', t.dataset.lgi]
        : t.dataset.lgset ? ['lgset', t.dataset.lgset] : ['lgkind', t.dataset.lgkind]) : null
    }
    /* a row's door to its calendar's settings window (D639) */
    const onClick = (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-lgopen]') as HTMLElement | null
      if (!b || !isAdmin()) return
      if (b.dataset.lgopen === 'sans') setSansSet(true); else setInpSet(true)
      notify()
    }
    host.addEventListener('change', onChange)
    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('click', onClick)
    return () => { host.removeEventListener('change', onChange); host.removeEventListener('pointerdown', onPointerDown); host.removeEventListener('click', onClick) }
  }, [])

  return (
    <>
      <div className="title"><h1>Logic</h1>
        {/* The subtitle said "read-only" to everyone, which is untrue for an
            admin — this page is where the thresholds are edited (owner, 28 Aug
            26 — "not true for read only. because admin can edit"). It now says
            what the READER can do, the same split the off-standard note below
            already makes. */}
        <span className="sub">every rule the engine applies{admin ? ' — “Edit rules” to change a threshold' : ' — read-only'}</span></div>
      <div className="lgbar" ref={barRef}>
        <div className="searchbox">🔍<input id="lgSearch" placeholder="search the rules — “crew rest”, “brief”, “spare”"
          value={LGQ} onChange={e => setLGQ(e.target.value)} /></div>
        <span className="lgfilters" id="lgFilters">
          {(['all', 'hard', 'adv', 'note', 'fired'] as const).map(f =>
            <button key={f} className={'fchip' + (LGF === f ? ' on' : '')} data-lgf={f} onClick={() => setLGF(f)}>
              {{ all: 'All', hard: 'Warnings', adv: 'Advisories', note: 'Notes', fired: 'Fired this week' }[f]}
            </button>)}
        </span>
        <span className="lgedit">
          <button className="abtn" id="lgEdit" hidden={!admin || lgCanEdit()}
            onClick={() => { setLgEdit(true); notify(); HOOKS.toast('Editing rules — the schedule rechecks as you type') }}>✎ Edit rules</button>
          <button className="abtn primary" id="lgDone" hidden={!admin || !lgCanEdit()}
            onClick={() => { setLgEdit(false); notify() }}>Done</button>
          <button className="abtn ghost" id="lgReset" hidden={!admin || !off}
            onClick={() => {
              if (!isAdmin()) return
              const n = rulesOffCount(); if (!n) return
              rulesReset(); ruleApply()
              HOOKS.toast(`${n} rule${n > 1 ? 's' : ''} back to squadron standard`)
            }}>Reset to standard</button>
        </span>
        <span className="lgnote" id="lgCount">
          {`${b.shown} of ${b.total} rules · ${b.firedN} fired on this week's schedule` + (off ? ` · ${off} off standard` : '')}
        </span>
      </div>
      <div className="lgoff" id="lgOff" hidden={!checkedOff}>
        {checkedOff ? <><b>{checkedOff} rule{checkedOff > 1 ? 's' : ''} changed from the squadron standard.</b>{' '}
          The schedule is being checked against these values, not the published ones
          {admin ? ' — “Reset to standard” puts them all back.' : '. Only an admin can change them.'}</> : null}
      </div>
      <section className="lg-insights" aria-labelledby="lgInsightsTitle">
        <b id="lgInsightsTitle">Insights</b>
        <label className="lg-insights-row"><span>Track Blue/Red sorties<small>Split flying load by mission role. Conditional DS or RED wording asks the scheduler.</small></span>
          <span className="lg-insights-switch">{lgCanEdit()
            ? <input id="lgMissionMix" type="checkbox" role="switch" checked={missionTracking()} onChange={e=>{if(lgCanEdit()) setMissionTracking(e.currentTarget.checked)}} aria-label="Track Blue/Red sorties" />
            : <span id="lgMissionMix" className={'lg-switch-read'+(missionTracking()?' on':'')} role="switch" aria-checked={missionTracking()} aria-disabled="true" aria-label="Track Blue/Red sorties" />}{missionTracking()?'On':'Off'}</span>
        </label>
      </section>
      <div className="lgwrap" id="lgBody" ref={bodyRef} dangerouslySetInnerHTML={{ __html: b.html }} />
    </>
  )
}
