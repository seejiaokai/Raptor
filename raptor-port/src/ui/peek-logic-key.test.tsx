// @vitest-environment jsdom
/* THE NEXT-WEEK PREVIEW REDRAWS AFTER A LOGIC CHANGE (the bug check of 12 Nov 26 — the third narrow read's proof test,
   kept whole). The preview is drawn once and kept by a key (ui/peek.ts peekKey); a Logic value it draws with but the key
   did not carry left Edit Schedule's preview showing the old drawing until the week was reloaded. Here: the same-time
   line's words read the debrief — with the report lead and the debrief at 0 the line measures nothing, and the words
   must say so at once. Its own file: it edits next week's saved copy. */
import { afterAll, beforeAll, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek, afterSchedMutate } from '../state/store'
import { DAYS } from '../engine/data'
import { peekWeekHTML } from './peek'
import { HOOKS } from '../engine/hooks'
import { VCONF } from '../engine/rules'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let host: HTMLDivElement, root: Root
beforeAll(async () => {
  initStore()
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true })
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

const titles = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return [...d.querySelectorAll('.badtm')].map(x => x.getAttribute('title') || '') }

it('P: the preview redraws its same-time line words when the Logic debrief changes', async () => {
  await act(async () => { loadWeek('20/07/2026') })
  const d: any = DAYS[1]
  const w = (d.waves || []).find((x: any) => !x.standalone && (x.formations || []).length)
  const f = w.formations[0]
  await act(async () => { f.to = '10:00'; f.ld = '10:00'; f.cx = false; f.rl = ''; w.intimes = []; afterSchedMutate() })
  await act(async () => { loadWeek('13/07/2026') })
  const em = (HOOKS as any).editMode, rl = VCONF.reportLead, deb = VCONF.debrief
  try {
    ;(HOOKS as any).editMode = () => true
    ;(VCONF as any).reportLead = 0
    const a = titles(peekWeekHTML())
    expect(a.length, 'the line is marked').toBeGreaterThan(0)
    expect(a[0]).toMatch(/still earns from the report and debrief/)
    ;(VCONF as any).debrief = 0
    const b = titles(peekWeekHTML())
    /* the control: a key value that does not touch these words (the brief lead) forces a fresh drawing */
    const bl = VCONF.briefLead
    ;(VCONF as any).briefLead = bl + 1
    const fresh = titles(peekWeekHTML())
    ;(VCONF as any).briefLead = bl
    expect(fresh[0], 'CONTROL — a fresh drawing under debrief 0').toMatch(/no debrief after it/)
    expect(b[0], 'debrief 0: the line measures nothing').toMatch(/no debrief after it/)
  } finally { (HOOKS as any).editMode = em; (VCONF as any).reportLead = rl; (VCONF as any).debrief = deb }
})
