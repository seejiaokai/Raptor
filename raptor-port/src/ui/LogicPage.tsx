/* The Logic tab — a guide for the person reading it to how the app's rules work (owner D925, built as drawn D928,
   D929, D930, D931 — 15 Oct 26): ONE row of controls (the page's name, search, Filter, ✎ Edit — the design guide §3,
   D926), then two parts: SETTINGS, everything an admin can change, each with the one line saying what moves with it;
   then THE CHECKS, every warning, advisory and note the app raises, four with a folded "How it works". Its two lists
   and their words: ui/logic-html.ts. The admin's edit mode is as it was: a value is parsed, bounded and applied live,
   the clash grading toggles, "Reset to standard" puts them all back — and now each changed value carries its own
   Reset while editing (the mock-up's per-setting Reset). The RULES MODIFIED stamp is as it was. */
import { SrchIcon } from './icons'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

/* …and a box's own change is applied a beat later ([LOGIC-REDRAW-DROPS-TYPING]'s neighbour, 21 Oct 26). A box saves on
   `change`, which the browser raises as the keyboard LEAVES it — by Tab, or by a press on the next box — before the
   keyboard has moved. Applied there and then, the save redrew the list at once (writing the setting announces itself to
   the whole app, which repaints), the browser found the box it was leaving gone, and gave the move up: Tab left the
   keyboard in the box just left, every time (probed on the built app). The value is taken from the box at once and
   applied once the keyboard has landed; the page then puts the keyboard back where it landed (keep, below). */
const PENDING = new Map<string, { v: any, t: ReturnType<typeof setTimeout> }>()
function ruleApplyLater(k: string, v: any) {
  const was = PENDING.get(k); if (was) clearTimeout(was.t)
  PENDING.set(k, { v, t: setTimeout(() => { PENDING.delete(k); VCONF[k] = v; ruleApply() }, 0) })
}
/* the value a box last asked for — waiting, or applied */
const ruleNow = (k: string) => PENDING.has(k) ? PENDING.get(k)!.v : VCONF[k]
/* a press that acts on the settings themselves (Reset to standard, a row's Reset) applies what is still waiting FIRST, so
   the order is the person's — the typed value, then the reset — and a value waiting a beat never lands on top of a reset
   (the fresh code read, 21 Oct 26, F1: a tap on "Reset all" with a value still in its box) */
function flushRuleApply() {
  if (!PENDING.size) return
  PENDING.forEach(({ v, t }, k) => { clearTimeout(t); VCONF[k] = v })
  PENDING.clear()
  ruleApply()
}

/* the one control in the list that has the keyboard, by a mark that survives a redraw — a box by its place in the list
   (a key could render on several rows), a toggle or button by its own mark */
function focusMark(el: Element | null): string | null {
  const h = el as HTMLElement | null
  if (!h || !h.dataset) return null
  if (h.dataset.lgi != null) return `[data-lgi="${h.dataset.lgi}"]`
  if (h.dataset.lgkind) return `[data-lgkind="${h.dataset.lgkind}"]`
  if (h.dataset.lgmix) return '[data-lgmix]'
  if (h.dataset.lgreset) return `[data-lgreset="${h.dataset.lgreset}"]`
  if (h.dataset.lgopen) return `[data-lgopen="${h.dataset.lgopen}"]`
  const how = h.tagName === 'SUMMARY' ? (h.parentElement as HTMLElement | null)?.dataset.how : undefined
  return how ? `details[data-how="${how}"] > summary` : null
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
    ? `<label class="lgmix"><input id="lgMissionMix" type="checkbox" role="switch" data-lgmix="1"${missionTracking() ? ' checked' : ''} aria-label="${esc(s.name)}">${esc(s.value!())}</label>`
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
        + (edit ? ` · <button type="button" class="lgreset1" data-lgreset="${s.kind === 'kinds' ? 'kinds' : own.join(',')}" aria-label="Reset ${esc(s.name)} to standard">Reset</button>` : '') + `</span>` : ''
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
  /* THE RULE LIST IS DRAWN AGAIN ONLY WHEN ITS WORDS CHANGE ([LOGIC-REDRAW-DROPS-TYPING], 21 Oct 26). React sets a
     `dangerouslySetInnerHTML` again whenever its OBJECT is a new one, not only when the markup differs (as Quals found,
     19 Oct 26) — so every repaint of the app rebuilt the whole list with the same 32,832 characters (probed on the built
     app: a late recheck about 1.3s after the page opens), and a value half typed into a box went with the old box. The
     object is made once per change of the words. Pin: logic.test.tsx, e2e/logicedit.spec.ts. */
  const bodyHTML = useMemo(() => ({ __html: b.html }), [b.html])
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

  /* THE KEYBOARD STAYS WHERE THE PERSON PUT IT (21 Oct 26). When the words do change — a value saved, a toggle flipped, a
     setting changed by someone else — the list is rebuilt and the control with the keyboard goes with it. The control is
     remembered as the keyboard arrives (focusin, below); after a rebuild that took it, the keyboard goes to the one drawn
     in its place, and a value half typed there is carried across, caret and all. A box arrived at clean is selected
     whole, so typing replaces it (D1080). Remembered only while the keyboard is in the list: leaving it for anywhere
     else forgets it, so a press outside never pulls the keyboard back. This replaces the press-remembering the page
     had, which a Tab never updated (it sent the keyboard back to the box just left). */
  const keep = useRef<{ mark: string, el: HTMLElement } | null>(null)
  /* THE LIST IS BEING REBUILT: from the render that brings new words until the rebuild's own keeper has run. Chrome raises
     a typed box's `change` as a rebuild takes it off the page (LE4: a half-typed "1h4" saved as 1h04 by a setting changed
     elsewhere) — that is not the person leaving the box, so it saves nothing: the keeper carries the typing to the box
     drawn in its place, owed, and it is saved when the box is really left. */
  const shown = useRef<object | null>(null)
  const rebuilding = useRef(false)
  if (shown.current !== bodyHTML) rebuilding.current = true
  useLayoutEffect(() => {
    shown.current = bodyHTML; rebuilding.current = false
    const k = keep.current, host = bodyRef.current
    if (!k || !host || k.el.isConnected) return
    const a = document.activeElement
    if (a && a !== document.body && a.isConnected) return
    const el = host.querySelector(k.mark) as HTMLElement | null
    if (!el) { keep.current = null; return }
    const was = k.el
    const typing = (x: Element): x is HTMLInputElement => x instanceof HTMLInputElement && x.type !== 'checkbox'
    /* carried only while the setting under it is as it was when the typing began (a row's Reset, or a change made
       elsewhere, to THIS setting wins over half a value — the fresh code read's F2) */
    if (typing(was) && typing(el) && was.value !== was.defaultValue && was.value !== el.value && was.defaultValue === el.defaultValue) {
      el.value = was.value
      el.focus({ preventScroll: true })
      try { el.setSelectionRange(was.selectionStart, was.selectionEnd) } catch (_) { /* a caret is a courtesy */ }
      /* a value written by script is not one the browser saw typed: leaving the box would raise no change and save
         nothing (F3). The box is marked, and the page raises its change on Enter or once the keyboard has really left it
         (owedChange, below) — never as a later rebuild takes it away (the fix round's read: Chrome's "lost the keyboard"
         on a rebuild would have saved the half-typed value) */
      el.dataset.lgowed = '1'
    } else {
      el.focus({ preventScroll: true })
      if (typing(el)) el.select()
    }
  }, [bodyHTML])

  /* the reference's change listeners on #lgBody, verbatim logic —
     native listeners, since the fields live inside the built markup */
  useEffect(() => {
    const host = bodyRef.current!
    const onFocusIn = (e: Event) => {
      const t = e.target as HTMLElement, mark = focusMark(t)
      keep.current = mark ? { mark, el: t } : null
    }
    /* leaving the list forgets — but a control taken away by a rebuild is not leaving. Chrome tells a control it lost the
       keyboard as a rebuild takes it off the page, while it is still on it (probed on the built app, 21 Oct 26), so the
       question is asked a moment later, once the rebuild's own keeper (above) has put the keyboard back and noted the
       control drawn in its place: still the one that left means the keyboard really left. */
    /* a carried value's change, raised by the page once the box is really left (a box a rebuild took is off the page, and
       a change raised there never reaches the list's listener — its value went on to the box drawn in its place). A second
       change (the browser's own, after more typing) is absorbed: the value is already the one asked for (ruleNow). */
    const owedChange = (t: HTMLInputElement) => {
      if (!t.dataset.lgowed) return
      delete t.dataset.lgowed
      if (t.value !== t.defaultValue) t.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Enter') owedChange(e.target as HTMLInputElement) }
    const onFocusOut = (e: FocusEvent) => {
      const t = e.target as HTMLInputElement
      if (t.dataset?.lgowed) queueMicrotask(() => owedChange(t))
      const to = e.relatedTarget as Node | null
      if (to && host.contains(to)) return   // moving within the list: the arrival notes the new control
      const was = keep.current
      queueMicrotask(() => {
        if (keep.current === was) keep.current = null
        /* …and the page's text cursor is not left parked in a box the keyboard has left: a box blurred by script keeps
           it, and a box focused next by a tap that places no caret (a window's number box, on a phone) then took no
           typing at all — the keys went to the cursor's box, which no longer listened (kbscroll.spec.ts KS5, 21 Oct 26;
           the list's old repaint-every-time used to throw that box, and the stray cursor, away) */
        const s = window.getSelection?.()
        if (s?.anchorNode && host.contains(s.anchorNode) && !host.contains(document.activeElement)) s.removeAllRanges()
      })
    }
    const onChange = (e: Event) => {
      const t = e.target as HTMLElement
      const i = t.closest('[data-lgset]') as HTMLInputElement | null
      if (i) {
        if (!isAdmin()) return
        if (rebuilding.current) return   // taken off the page by a rebuild, not left — the keeper carries the typing
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
        if (v === ruleNow(k)) { i.classList.remove('bad'); i.value=ruleFmt(k,v); return }
        /* no passing note (owner D936, 16 Oct 26): the row shows the new value, and its standard where it differs (D850).
           The box shows it in the squadron's spelling at once, as the redraw will (a "150" reads 2h30). */
        i.classList.remove('bad'); i.value = ruleFmt(k, v); ruleApplyLater(k, v)
        return
      }
      const c = t.closest('[data-lgkind]') as HTMLInputElement | null
      if (c) {
        if (!isAdmin()) return
        const k = c.dataset.lgkind!
        SHIFT_HARD[k] = c.checked; ruleApply()   // a toggle keeps the keyboard where it is; the page puts it back after the redraw
        HOOKS.toast(`A shift against ${KIND_LABEL[k]} is now ${c.checked ? 'a Warning' : 'an Advisory'}`)
        return
      }
      /* the Insights switch, while editing (D521) */
      const m = t.closest('[data-lgmix]') as HTMLInputElement | null
      if (m && lgCanEdit()) {
        /* the switch's markup is redrawn by the change it makes; the keyboard, if it was on it, is put back on it by the
           page's keeper (the fresh code read, 15 Oct 26) */
        setMissionTracking(m.checked)
        notify()   // its On / Off is in the built markup: redraw it
      }
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
        flushRuleApply()
        /* what is half typed in this row's own box goes with the Reset (the press keeps the keyboard in the box, so its
           change never came) — the row shows its standard, not the typing (F2) */
        const a = document.activeElement as HTMLInputElement | null
        if (a?.dataset?.lgset && r.dataset.lgreset!.split(',').includes(a.dataset.lgset)) a.value = a.defaultValue
        if (r.dataset.lgreset === 'kinds') Object.keys(KIND_LABEL).forEach(k => { SHIFT_HARD[k] = RULE_STD.s[k] })
        else r.dataset.lgreset!.split(',').forEach(k => { if (RULE_SPEC[k]) VCONF[k] = RULE_STD.v[k] })
        ruleApply()
        /* the Reset goes with the change it undid — the keyboard lands on the row's own box, never on the page's foot */
        const k0 = r.dataset.lgreset!.split(',')[0]
        setTimeout(() => (host.querySelector(k0 === 'kinds' ? '[data-lgkind]' : `[data-lgset="${k0}"]`) as HTMLElement | null)?.focus(), 0)
      }
    }
    /* a fold opened or closed — remembered, so a repaint draws it as the reader left it */
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement
      if (!d.matches?.('details[data-how]')) return
      if (d.open) LGOPEN.add(d.dataset.how!); else LGOPEN.delete(d.dataset.how!)
    }
    /* a press on a row's Reset or a door must not blur a box first: the blur's change would repaint the row and the press
       would land on nothing (the fresh code read, 15 Oct 26) — the box keeps its focus until the press is done */
    const onMouseDown = (e: Event) => { if ((e.target as HTMLElement).closest('[data-lgreset],[data-lgopen]')) e.preventDefault() }
    host.addEventListener('mousedown', onMouseDown)
    host.addEventListener('change', onChange)
    host.addEventListener('focusin', onFocusIn)
    host.addEventListener('focusout', onFocusOut)
    host.addEventListener('keydown', onKeyDown)
    host.addEventListener('click', onClick)
    host.addEventListener('toggle', onToggle, true)
    return () => { host.removeEventListener('mousedown', onMouseDown); host.removeEventListener('change', onChange); host.removeEventListener('focusin', onFocusIn); host.removeEventListener('focusout', onFocusOut); host.removeEventListener('keydown', onKeyDown); host.removeEventListener('click', onClick); host.removeEventListener('toggle', onToggle, true) }
  }, [])

  /* DONE TAKES ONE PRESS ([LOGIC-DONE-FIRST-PRESS], 21 Oct 26). A press on Done used to take the keyboard out of the box
     first, which saved its changed value, and the save brought "Reset to standard" up beside Done — on a phone (402 wide)
     Done moved 77px left between the finger going down and coming up, so the press landed on nothing and the page stayed
     in editing. The press now leaves the box alone until it is complete; Done itself saves what the box holds, then
     ends editing. */
  const finishBox = () => {
    const a = document.activeElement as HTMLElement | null
    if (a && bodyRef.current?.contains(a)) a.blur()   // its change is raised here, and saves (or refuses) as ever
  }

  return (
    <>
      <div className="lgbar" ref={barRef}>
        <h1 className="lgttl">Logic</h1>
        <div className="searchbox"><SrchIcon /><input id="lgSearch" placeholder="Search" aria-label="Search the rules"
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
          onMouseDown={e => e.preventDefault()}
          onClick={() => { finishBox(); setLgEdit(false); notify() }}>Done</button>
        <button type="button" className="abtn ghost" id="lgReset" hidden={!admin || !off}
          onClick={() => {
            if (!isAdmin()) return
            flushRuleApply()   // a value still waiting is applied first, then everything is reset (F1)
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
          {` The schedule is checked against ${checkedOff > 1 ? 'them' : 'it'} now.`} A published day keeps its printed B and its OIL until it is published again.
          {admin ? '' : ' Only an admin can change them.'}</> : null}
      </div>
      <div className="lgwrap" id="lgBody" ref={bodyRef} dangerouslySetInnerHTML={bodyHTML} />
    </>
  )
}
