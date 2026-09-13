// @vitest-environment jsdom
/* The amendment panel, Phase 2 (the per-day verId rewrite). The panel now shows
   PER-DAY publish (each published day with real changes vs its issued version
   gets a "Publish AL{seq}" button calling publishALDay(di)), a "Discard marks"
   button, and a READ-ONLY issued-AL history list — the week-wide AL-number
   <select> and the per-AL unpublish ✕ are GONE (take-backs are Phase 3).

   Security pin (kept): a recorded sign-off callsign is interpolated into the AL
   tag's hover tooltip inside a dangerouslySetInnerHTML block. Callsigns are
   editable (QualsPage renameCallsign only trims + checks uniqueness — quotes and
   markup pass), so an un-escaped title lets a callsign like  A" onmouseover=alert(1)
   break out of the attribute and become live markup. The value must be escaped
   at render time so already-saved names are handled too. Same family as the two
   unescaped sinks found 6 Aug 26. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ALPanel } from './ALPanel'
import { initStore, notify } from '../state/store'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { txtSet } from '../engine/slots'
import { DAYS } from '../engine/data'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
let D0: any

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}
/* publish day `di`, then make a REAL content change on it so it has a canonical
   delta to issue as its next AL (a bare mark changes no content — F-02). */
const publishThenAmend = (di: number, note: string) => {
  sign(di); setDayApproved(di, true)
  txtSet(`dn:${di}.0`, note)
  sign(di)
}
const render = () => act(() => { root.render(<ALPanel />); notify() })
const click = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })) })

beforeAll(() => {
  initStore()
  D0 = JSON.parse(JSON.stringify(DAYS[0]))
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
})
afterAll(() => {
  act(() => root.unmount())
  host.remove()
})
beforeEach(() => {
  DAYS[0] = JSON.parse(JSON.stringify(D0))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
})

describe('ALPanel — per-day publish + read-only history', () => {
  it('a published day with real changes shows a Publish AL button that issues that day', () => {
    publishThenAmend(0, 'AMENDED NOTE')
    render()
    const btn = host.querySelector('.al-pubday .abtn.primary') as HTMLButtonElement
    expect(btn, 'the per-day publish button rendered').toBeTruthy()
    expect(btn.textContent).toBe('Publish AL1')
    expect(btn.hasAttribute('disabled')).toBe(false)   // signed, so unlocked
    /* clicking calls publishALDay(0): a single-day AL is issued for day 0 */
    click(btn)
    expect(SCHED.als.length).toBe(1)
    expect(SCHED.als[0].di).toBe(0)
    expect(SCHED.als[0].seq).toBe(1)
  })

  it('the publish button is LOCKED until the day is signed', () => {
    sign(0); setDayApproved(0, true)
    txtSet('dn:0.0', 'AMENDED NOTE')   // a real change, but the publish spent the signature
    render()
    const btn = host.querySelector('.al-pubday .abtn.primary') as HTMLButtonElement
    expect(btn.textContent).toBe('Publish AL1')
    expect(btn.className).toContain('locked')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('the issued-AL history is READ-ONLY — no unpublish control — and renders verLabel + counts', () => {
    publishThenAmend(0, 'AMENDED NOTE')
    render()
    click(host.querySelector('.al-pubday .abtn.primary')!)   // issue AL1
    render()
    const list = host.querySelector('.al-list') as HTMLElement
    expect(list, 'the history list rendered').toBeTruthy()
    /* the history is read-only: no unpublish ✕ button, no control at all */
    expect(list.querySelector('button')).toBeNull()
    expect(list.textContent).not.toContain('✕')
    const tag = host.querySelector('.al-tag') as HTMLElement
    expect(tag, 'the issued AL tag rendered').toBeTruthy()
    expect(tag.querySelector('b')!.textContent).toBe('AL1')       // verLabel(rec.id)
    expect(tag.textContent).toContain('1 item')                    // alCount from the frozen diff
  })

  it('escapes a callsign carrying attribute-breakout markup in the AL tag tooltip', () => {
    const evil = 'A" onmouseover="alert(1)'
    /* a published AL signed off by a person whose callsign carries markup.
       Phase-2 record shape: single-day, verId-keyed, with a frozen diff. */
    SCHED.als.push({
      id: 'x#1', di: 0, iso: 'x', seq: 1, snap: { d: {}, c: {} }, diff: [],
      sign: { 0: { cur: evil, sked: '', plan: '', appr: '' } },
    } as any)
    render()
    const tag = host.querySelector('.al-tag') as HTMLElement
    expect(tag, 'the AL tag rendered').toBeTruthy()
    // the callsign survives as DATA inside the title, not as markup: no stray
    // event-handler attribute was parsed out of the string.
    expect(host.querySelector('[onmouseover]')).toBeNull()
    expect(tag.getAttribute('onmouseover')).toBeNull()
    // and the full callsign, quote included, is preserved in the tooltip text.
    expect(tag.getAttribute('title')).toContain(evil)
  })
})
