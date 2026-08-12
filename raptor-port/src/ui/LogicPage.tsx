/* The Logic tab — every rule the engine applies, read out of the LIVE
   objects at render time (renderLogic's row/group strings kept verbatim), with
   the admin edit mode: thresholds parsed + bounded + applied live, the clash
   matrix toggles, Reset to standard, and the RULES MODIFIED stamp. */
import { useEffect, useRef, useState } from 'react'
import { VCONF, SHIFT_HARD, RULE_SPEC, RULE_STD, KIND_LABEL, ruleFmt, ruleParse, ruleOff, kindOff, rulesOffCount, rulesSave, rulesReset } from '../engine/rules'
import { WARN, validate, lgFired } from '../engine/validate'
import { dowShort } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { SESSION, setLgEdit, lgCanEdit } from '../state/auth'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { useVersion } from './useStore'
import { lgRules, LG_TIER } from './logic-html'

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
        return `<span class="lgcell ${off ? 'adv' : ''}"><span class="k">${esc(RULE_SPEC[k].t)}</span>`
          + (lgCanEdit()
            ? `<input class="lgin" data-lgset="${k}" value="${esc(ruleFmt(k, VCONF[k]))}"`
            + ` aria-label="${esc(RULE_SPEC[k].t)}">`
            : `<span class="val">${esc(ruleFmt(k, VCONF[k]))}</span>`)
          + (off ? `<span class="lgstd">standard ${esc(ruleFmt(k, RULE_STD.v[k]))}</span>`
            + `<span class="lgmod">changed</span>` : '') + `</span>`
      }).join('') + `</span>` : ''
      return `<div class="lgrule ${r.sev}${edited ? ' edited' : ''}">`
        + `<span class="lgsev"><span class="tier ${r.sev}">${LG_TIER[r.sev]}</span>`
        + (r.code ? `<span class="code">${esc(r.code)}</span>` : '') + `</span>`
        + `<span class="lgtxt">${txt}${r.extra ? r.extra() : ''}${fields}</span>`
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

  const admin = !!SESSION && SESSION.role === 'admin'
  const b = logicBody(LGQ, LGF)
  const off = rulesOffCount()

  /* a modified rule set is never silent: the body class drives the
     RULES MODIFIED stamp on the week banner */
  useEffect(() => { document.body.classList.toggle('page-rules-off', !!off) })

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
        if (SESSION.role !== 'admin') return
        const k = i.dataset.lgset!, spec = RULE_SPEC[k], v = ruleParse(k, i.value)
        if (v == null || v < spec.lo || v > spec.hi) {
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
        if (v === VCONF[k]) { i.classList.remove('bad'); return }
        VCONF[k] = v; lgReapply()
        HOOKS.toast(`${spec.t} → ${ruleFmt(k, v)}${v === RULE_STD.v[k] ? ' (standard)' : ''}`)
        return
      }
      const c = t.closest('[data-lgkind]') as HTMLInputElement | null
      if (c) {
        if (SESSION.role !== 'admin') return
        const k = c.dataset.lgkind!
        SHIFT_HARD[k] = c.checked; lgReapply()
        HOOKS.toast(`A shift against ${KIND_LABEL[k]} is now ${c.checked ? 'a Warning' : 'an Advisory'}`)
      }
    }
    const onPointerDown = (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-lgset],[data-lgkind]') as HTMLElement | null
      LGNEXT = t ? (t.dataset.lgset ? ['lgset', t.dataset.lgset] : ['lgkind', t.dataset.lgkind]) : null
    }
    host.addEventListener('change', onChange)
    host.addEventListener('pointerdown', onPointerDown)
    return () => { host.removeEventListener('change', onChange); host.removeEventListener('pointerdown', onPointerDown) }
  }, [])

  return (
    <>
      <div className="title"><h1>Logic</h1>
        <span className="sub">every rule the engine applies — read-only</span></div>
      <div className="lgbar">
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
              if (SESSION.role !== 'admin') return
              const n = rulesOffCount(); if (!n) return
              rulesReset(); ruleApply()
              HOOKS.toast(`${n} rule${n > 1 ? 's' : ''} back to squadron standard`)
            }}>Reset to standard</button>
        </span>
        <span className="lgnote" id="lgCount">
          {`${b.shown} of ${b.total} rules · ${b.firedN} fired on this week's schedule` + (off ? ` · ${off} off standard` : '')}
        </span>
      </div>
      <div className="lgoff" id="lgOff" hidden={!off}>
        {off ? <><b>{off} rule{off > 1 ? 's' : ''} changed from the squadron standard.</b>{' '}
          The schedule is being checked against these values, not the published ones
          {admin ? ' — “Reset to standard” puts them all back.' : '. Only an admin can change them.'}</> : null}
      </div>
      <div className="lgwrap" id="lgBody" ref={bodyRef} dangerouslySetInnerHTML={{ __html: b.html }} />
    </>
  )
}
