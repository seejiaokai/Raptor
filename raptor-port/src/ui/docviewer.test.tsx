// @vitest-environment jsdom
/* The document viewer (owner, 27 Aug 26): ungated viewing, gated actions.
   jsdom has no object URLs, so they are stubbed the way refwin does. */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DocViewer } from './DocViewer'
import { setDocView } from './pops'
import { initStore, setSession, notify } from '../state/store'
import { docAdd } from '../state/docs'
import { setMe } from '../state/auth'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement

beforeAll(async () => {
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub')
  ;(URL as any).revokeObjectURL = vi.fn()
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<DocViewer />) })
})
beforeEach(async () => { await act(async () => { setDocView(null); notify() }) })

const open = async (row: any, up = false) => act(async () => { setDocView({ row, up }); notify() })

describe('the document viewer', () => {
  it('shows the image for a documented row, titled by the row', async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    const { id } = docAdd(new Blob(['x'], { type: 'image/png' }) as any)
    await open({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13', docId: id })
    expect(($('#docViewPop') as any).hidden).toBe(false)
    expect($('#docViewTitle').textContent).toContain('ATT C')
    expect(($('.docview-img') as HTMLImageElement).src).toContain('blob:stub')
  })
  it('states plainly when an entry has no document on file', async () => {
    await open({ person: 'bane', type: 'OML', date: 'Jul 10' })
    expect($('.docview-none').textContent).toContain('No document on file')
  })
  it('a member sees actions on their OWN row only; viewing is never gated', async () => {
    await act(async () => { setSession({ user: 'us', role: 'main' }); setMe('bane'); notify() })
    await open({ person: 'sufa', type: 'ATT C', date: 'Jul 10' }, true)
    expect($('#docViewEdit')).toBeNull()
    expect($('#docViewUpchit')).toBeNull()
    expect($('.docview-none'), 'the paperwork panel still shows').toBeTruthy()
    await open({ person: 'bane', type: 'ATT C', date: 'Jul 10' }, true)
    expect($('#docViewEdit')).toBeTruthy()
    expect($('#docViewUpchit'), 'the pending card offers the upchit path').toBeTruthy()
  })
})
