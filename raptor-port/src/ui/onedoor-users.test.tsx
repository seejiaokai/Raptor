// @vitest-environment jsdom
/* [ONE-DOOR] (27 Sep 26) — ADMIN → USERS AS THE ONE DOOR, rendered through the real App.
   D309 / D310: one row per person with a Sign-in and a Roster dot, every action on his row — Active → Suspend · Archive
   · Delete; Suspended → Enable · Archive · Delete; no sign-in → Give sign-in · Archive · Delete; Archived (a folded
   "▸ Archived · N" group) → Restore · Delete; Waiting → Give access · Refuse; a posting waiting for its date on the row.
   D322: the approved mock-up (docs/mock/one-door.html) and the agent's calls on it (Archive one tap; A to Z with a
   search box; renaming an archived man here). D308: Restore and New person ask the post-in date. D295 / D286: his
   callsign taken — "Restore as …"; a rename alone. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession } from '../state/store'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { accountsLoad, signIn, sessionFor, requestAccess, ACCESS_REQS, accountByName, accountOfPid } from '../state/accounts'
import { setPage } from '../state/view'
import { effectiveToday } from '../state/person-delete'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const type = async (el: HTMLInputElement | HTMLSelectElement, v: string) => {
  await act(async () => {
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, v)
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}
const signInAs = async (name: string, pass = 'x') => act(async () => { resetSession(sessionFor(signIn(name, pass))); notify() })
const P = (id: string): any => (PEOPLE as any)[id]
const users = async () => { await signInAs('ad', 'a'); await act(async () => { setPage('admin'); notify() }) }
const dot = (kind: 'signin' | 'roster', pid: string) => $(`[data-testid="dot-${kind}-${pid}"]`)?.getAttribute('aria-label')
/* the dot's COLOUR too, not only its words (the break tests, 27 Sep 26: a Roster dot drawn green on an archived man passed) */
const dotColour = (kind: 'signin' | 'roster', pid: string) => $(`[data-testid="dot-${kind}-${pid}"] i`)?.className
const buttons = () => $$('[data-editing] .acc-acts button, [data-restoring] .acc-acts button').map(b => b.textContent)

const mem: Record<string, string> = {}
const toasts: string[] = []
let host: HTMLDivElement
let root: Root
let PEOPLE0 = ''
beforeAll(async () => {
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  PEOPLE0 = JSON.stringify(PEOPLE)
  initStore(); accountsLoad()
  HOOKS.toast = (t: string) => { toasts.push(t) }
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove(); storeBackend.impl = null
})
beforeEach(async () => {
  Object.keys(mem).forEach(k => delete mem[k])
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  accountsLoad()
  toasts.length = 0
  await act(async () => { resetSession(null); notify() })
})

describe('D309 / D310 — every person, one row, two dots', () => {
  it('lists every person on the roster, A to Z; the dots say sign-in and roster in words', async () => {
    await users()
    const roster = Object.keys(PEOPLE).filter(id => !P(id).special && !P(id).archived && !P(id).deleted)
    const rows = $$('#accList [data-person]')
    expect(rows.length).toBe(roster.length)
    const names = rows.map(r => r.querySelector('.acc-name')!.textContent!)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
    expect(dot('signin', 'rocky')).toBe('Can sign in')
    expect(dot('roster', 'rocky')).toBe('On the roster')
    const noSign = roster.find(id => !accountOfPid(id))!
    expect(dot('signin', noSign)).toBe('No sign-in')
    expect($(`#accList [data-person="${noSign}"]`).textContent).toContain('no sign-in')
    expect($('.od-head .adm-sub').textContent).toBe(`People · ${roster.length}`)
  })

  it('the search finds a callsign or a sign-in; the Archived group opens while it holds a match', async () => {
    P('casper').archived = true; indexCallsigns()
    await users()
    await type($('#accFind') as HTMLInputElement, 'hex')
    expect($$('#accList [data-person]').map(r => r.dataset.person)).toEqual(['rocky'])
    await type($('#accFind') as HTMLInputElement, 'outlaw')
    expect($('#accNoMatch').textContent).toBe('Nobody matches.')
    expect($('#accArchList [data-person="casper"]'), 'an archived match opens the group').toBeTruthy()
  })

  it('the walk design (Fable R7): while a search matches, the Archived group still folds when its ▾ is tapped', async () => {
    P('casper').archived = true; indexCallsigns()
    await users()
    await type($('#accFind') as HTMLInputElement, 'outlaw')
    expect($('#accArchList [data-person="casper"]')).toBeTruthy()
    await click($('#accArchToggle'))
    expect($('#accArchList'), 'folded by his tap').toBeNull()
    await click($('#accArchToggle'))
    expect($('#accArchList [data-person="casper"]')).toBeTruthy()
  })

  it('the walk design (Fable R13): the Admin page names Users for what it now holds — sign-in and roster', async () => {
    await users()
    expect(document.body.textContent).toContain('Sign-in and roster')
    expect(document.body.textContent).not.toContain('Who can sign in')
  })

  it('your own row cannot be opened; a man\'s row opens with his state\'s buttons (active)', async () => {
    await users()
    expect(($('#accList [data-person="stiff"] .acc-tap') as HTMLButtonElement).disabled).toBe(true)
    await click($('#accList [data-person="rocky"] .acc-tap'))
    expect(buttons()).toEqual(['Save', 'Suspend', 'Archive', 'Delete', 'Cancel'])
  })

  it('suspended: Enable · Archive · Delete; no sign-in: Give sign-in · Archive · Delete', async () => {
    const { updateAccount } = await import('../state/accounts')
    await users()
    expect(updateAccount('achex', { on: false })).toBeNull()
    await act(async () => { notify() })
    expect(dot('signin', 'rocky')).toBe('Sign-in suspended')
    await click($('#accList [data-person="rocky"] .acc-tap'))
    expect(buttons()).toEqual(['Save', 'Enable', 'Archive', 'Delete', 'Cancel'])
    await click($('#accEdCancel'))
    await click($('#accList [data-person="dj"] .acc-tap'))
    expect(buttons()).toEqual(['Give sign-in', 'Archive', 'Delete', 'Cancel'])
  })
})

describe('D310 / D322 / D323 — Archive and Restore on the row', () => {
  it('Archive is one tap: he moves to the folded Archived group, his sign-in red, the message says so', async () => {
    await users()
    await click($('#accList [data-person="rocky"] .acc-tap'))
    await click($('#accEdArchive'))
    expect(P('rocky').archived).toBe(true)
    expect(toasts.some(t => /Hex archived — his sign-in is suspended/.test(t))).toBe(true)
    expect($('#accList [data-person="rocky"]')).toBeFalsy()
    expect($('#accArchToggle').textContent).toMatch(/▸ Archived · 1/)
    await click($('#accArchToggle'))
    expect(dot('signin', 'rocky')).toBe('Sign-in suspended')
    expect(dot('roster', 'rocky')).toBe('Archived')
    expect(dotColour('roster', 'rocky'), 'the Roster dot is red').toBe('r')
    expect(dotColour('signin', 'rocky'), 'the Sign-in dot is red').toBe('r')
    expect(dotColour('roster', 'casper'), 'a man on the roster: green').toBe('g')
  })

  it('Restore asks the post-in date (today) and brings both back; he\'ll be asked to check his quals', async () => {
    await users()
    await click($('#accList [data-person="rocky"] .acc-tap')); await click($('#accEdArchive'))
    await click($('#accArchToggle'))
    await click($('#accArchList [data-person="rocky"] .acc-tap'))
    expect(($('#accArPostIn') as HTMLInputElement).value).toBe(effectiveToday())
    expect(buttons()).toEqual(['Restore', 'Delete', 'Cancel'])
    await click($('#accArRestore'))
    expect(P('rocky').archived).toBe(false)
    expect(accountByName('hex')!.on).toBe(true)
    expect(P('rocky').back).toBe(true)
    expect($('#accList [data-person="rocky"]')).toBeTruthy()
  })

  it('D286 / D295: his callsign taken on the roster — the box offers the next free one; "Restore as …" does both', async () => {
    await users()
    await click($('#accList [data-person="rocky"] .acc-tap')); await click($('#accEdArchive'))
    P('bane').cs = 'Hex'; indexCallsigns()
    await act(async () => { notify() })
    await click($('#accArchToggle'))
    await click($('#accArchList [data-person="rocky"] .acc-tap'))
    expect($('#accArTaken').textContent).toBe('Hex is taken on the roster — give him another callsign.')
    expect(($('#accArCs') as HTMLInputElement).value).toBe('Hex 2')
    expect($('#accArRestore').textContent).toBe('Restore as Hex 2')
    await click($('#accArRestore'))
    expect(P('rocky').cs).toBe('Hex 2')
    expect(P('rocky').archived).toBe(false)
  })

  it('D295: an archived man renamed alone — Save name; a taken or over-long callsign refused with its reason', async () => {
    P('casper').archived = true; indexCallsigns()
    await users()
    await click($('#accArchToggle'))
    await click($('#accArchList [data-person="casper"] .acc-tap'))
    await type($('#accArCs') as HTMLInputElement, P('bane').cs)
    await click($('#accArSave'))
    expect($('#accArErr').textContent).toMatch(/already taken/)
    await type($('#accArCs') as HTMLInputElement, 'Abcdefghijklmnop')
    await click($('#accArSave'))
    expect($('#accArErr').textContent).toMatch(/at most 14 letters/)
    await type($('#accArCs') as HTMLInputElement, 'Casper Old')
    await click($('#accArSave'))
    expect(P('casper').cs).toBe('Casper Old')
    expect(P('casper').archived).toBe(true)
  })

  /* the refusal's words come from the one body (sync.ts restoreProblem — the post-in on or before the day he left is
     pinned in leavewar/onedoor.test.ts, where the war runs); here: a refusal is SHOWN on the row and nothing changes */
  it('D308: a refused post-in date is said on the row, and nothing changes', async () => {
    await users()
    await click($('#accList [data-person="rocky"] .acc-tap')); await click($('#accEdArchive'))
    await click($('#accArchToggle'))
    await click($('#accArchList [data-person="rocky"] .acc-tap'))
    await type($('#accArPostIn') as HTMLInputElement, '')
    await click($('#accArRestore'))
    expect($('#accArErr').textContent).toBe('Pick the post-in date')
    expect(P('rocky').archived).toBe(true)
  })

  it('Delete from the Archived group asks twice and says what goes', async () => {
    P('casper').archived = true; indexCallsigns()
    await users()
    await click($('#accArchToggle'))
    await click($('#accArchList [data-person="casper"] .acc-tap'))
    await click($('#accArDel'))
    expect($('#accArDel').textContent).toBe(`Tap again to delete ${P('casper').cs}`)
    expect($('#accArDelNote').textContent).toMatch(/Can’t be undone/)
    await click($('#accArDel'))
    expect(P('casper').deleted).toBe(true)
  })
})

describe('moved from the Quals Archived list (D310) — PO5, PO10', () => {
  it('D287 / D299: a DELETED man is on no list — not the People, not the Archived group', async () => {
    P('casper').archived = true; P('bane').archived = true; P('bane').deleted = true; indexCallsigns()
    await users()
    await click($('#accArchToggle'))
    expect($('#accArchList [data-person="casper"]'), 'archived: listed').toBeTruthy()
    expect($('[data-person="bane"].od-row'), 'deleted: on no list').toBeFalsy()
    expect($('#accArchToggle').textContent).toMatch(/Archived · 1/)
  })

  it('D284 / D307: after Restore the admin Quals prompt asks to check his quals; Later puts it away and changes nothing', async () => {
    await users()
    await click($('#accList [data-person="rocky"] .acc-tap')); await click($('#accEdArchive'))
    await click($('#accArchToggle'))
    await click($('#accArchList [data-person="rocky"] .acc-tap'))
    await click($('#accArRestore'))
    await act(async () => { setPage('quals'); notify() })
    expect($('[data-testid="back-rocky"]').textContent).toMatch(/Hex is back — quals and CAT as he left them/)
    const before = JSON.stringify(P('rocky'))
    await click($('[data-back-later="rocky"]'))
    expect($('[data-testid="back-rocky"]')).toBeFalsy()
    expect(JSON.stringify(P('rocky'))).toBe(before)
  })
})

describe('D309 / D308 — Give access · Refuse; the post-in date on every door that makes a person', () => {
  it('the waiting list reads Give access / Refuse; New person there asks the post-in date', async () => {
    await signInAs('newface@mail'); expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' })).toBeNull()
    await users()
    const rq = ACCESS_REQS[0]
    expect($(`[data-approve="${rq.id}"]`).textContent).toBe('Give access')
    expect($(`[data-decline="${rq.id}"]`).textContent).toBe('Refuse')
    await click($(`[data-approve="${rq.id}"]`))
    expect(($('#apvPostIn') as HTMLInputElement).value).toBe(effectiveToday())
    await click($('#apvModeRoster'))
    expect($('#apvPostIn'), 'a man already on the roster: no post-in asked').toBeFalsy()
  })

  it('Add a person asks the post-in date, opening on today', async () => {
    await users()
    expect(($('#accAddPostIn') as HTMLInputElement).value).toBe(effectiveToday())
    expect($('#accAddNote').textContent).toBe('Makes his Quals row, and his sign-in if you give one. The Leave War counts him from the post-in date.')
  })
})
