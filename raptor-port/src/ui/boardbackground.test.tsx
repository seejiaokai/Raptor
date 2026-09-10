// @vitest-environment jsdom
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { initStore, notify, setSession, subscribe, subscribeBoard } from '../state/store'
import { setPage } from '../state/view'
import { App } from './App'
import { boardTab, openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement

let host: HTMLDivElement
let root: Root

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); setPage('editsched'); notify() })
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('the hidden edit week does no work during board navigation', () => {
  it('keeps the already-rendered week and roster byte-for-byte through a swipe notify', async () => {
    await act(async () => { openScheduler(6); notify() })
    const week = $('#eWeek')
    const roster = $('#eRoster')
    const day = week.firstElementChild
    const rosterBody = roster.firstElementChild
    expect(day).toBeTruthy()
    expect(rosterBody).toBeTruthy()

    let globalPaints = 0, boardPaints = 0
    const offGlobal = subscribe(() => { globalPaints++ })
    const offBoard = subscribeBoard(() => { boardPaints++ })
    await act(async () => { boardTab(5) })
    offGlobal(); offBoard()

    expect(week.firstElementChild, 'the hidden week was not rebuilt').toBe(day)
    expect(roster.firstElementChild, 'the hidden roster was not rebuilt').toBe(rosterBody)
    expect(globalPaints, 'day navigation does not wake the full app').toBe(0)
    expect(boardPaints, 'the visible board still repaints').toBe(1)
  })
})
