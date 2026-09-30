// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 5 — THE TRACKER ON A SHARED STORE STARTS WITH NO COURSE (owner D463, 30 Sep 26: "No
   course" — "the demo course 26ABSG and its demo students never reach a shared store"; plan §3 phase 5.3: "its empty
   state checked, and a way in if it has none").
   Under the blank boot policy (src/bootpolicy.ts — told to the Tracker through its page seam, TrackerPage.tsx), the
   Tracker's first mount makes no course and no student: its screen says there is no course yet and offers the two ways
   in — add a course, or import a file (his charts and students reach the database by his own Export → Import, D120) —
   and once a course exists it is the usual Tracker. His built-in charts are shipped content and stay (D62). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import * as core from './app/core.js'
import App from './App.jsx'
import { useStorageImpl } from './storage.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C = core as any
const tick = () => new Promise(r => setTimeout(r, 0))
let wb: Whiteboard, host: HTMLDivElement, root: Root

beforeAll(async () => {
  wb = new Whiteboard()
  useStorageImpl(trackerTarget(wb))
  C.setTrackerSeedDemo(false)
  await C.init()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App active={true} />); await tick() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove(); useStorageImpl(null) })

describe('the Tracker on a shared store: no course, no student', () => {
  it('boots with no course and nobody on it — never the demo course or its pair', () => {
    expect(C.ready).toBe(true)
    expect(C.bootError).toBeFalsy()
    expect(C.COURSES).toEqual([])
    expect(C.course).toBeNull()
    expect(C.roster).toEqual([])
    const stored = wb.keys('tracker').map(k => `${k}=${wb.get('tracker', k)}`).join('\n')
    expect(stored).not.toMatch(/26ABSG|STUDENT A|STUDENT B/)
    expect(wb.keys('tracker').filter(k => /:roster$|:m:|:d:|:pace:|:lulls:|:plan$/.test(k))).toEqual([])
  })

  it('its screen says there is no course yet, and offers the two ways in', () => {
    const empty = host.querySelector('[data-testid="trk-nocourse"]')!
    expect(empty).toBeTruthy()
    expect(empty.textContent).toMatch(/no course yet/i)
    expect(host.querySelector('[data-testid="trk-first-course"]')).toBeTruthy()
    expect(host.querySelector('[data-testid="trk-first-import"]')).toBeTruthy()
    expect(host.querySelector('#board')).toBeNull()
  })

  it('adding the first course makes that course, empty — and the usual Tracker is back', async () => {
    let p: Promise<any>
    await act(async () => { (host.querySelector('[data-testid="trk-first-course"]') as HTMLElement).click(); await tick() })
    await act(async () => { p = C.whenDialogOpen ? C.whenDialogOpen() : Promise.resolve(); await p; C.dlgClose('27ABSG'); await tick(); await tick(); await tick() })
    await act(async () => { await tick(); await tick() })
    expect(C.COURSES.map((c: any) => c.name)).toEqual(['27ABSG'])
    expect(C.curCourseName()).toBe('27ABSG')
    expect(C.roster).toEqual([])
    expect(host.querySelector('[data-testid="trk-nocourse"]')).toBeNull()
    expect(host.querySelector('#board')).toBeTruthy()
  })
})
