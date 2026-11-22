// @vitest-environment jsdom
/* Fix read 2, the core share — a step he can no longer reach (state/undo-wire.ts stepStuck) and the same person's Undo
   list kept across his access refresh (state/store.ts refreshAccess, ui/App.tsx): the two together, and the controls
   that the reach check blocks nothing it should not. */
import { describe, it, expect } from 'vitest'
import { act, render } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, ACCT, moveMan, on, pastMidnight } from '../test-support/msq-world'
import { App } from '../ui/App'
import { switchRoleView, notify } from './store'
import { setPage, CURPAGE } from './view'
import { INPEDIT, setInpEdit } from '../ui/pops'
import { SESSION, setEffectiveRole } from './auth'
import { commitNewInput } from '../ui/inputedit'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { updateAccount, accountById } from './accounts'
import { globalUndo, globalRedo, _timelineEntries } from '../undo/timeline'

useMsqWorld()

describe('fix read 2 — a moving admin, his page open across midnight', () => {
  it('his admin step of last night is blocked for good, said once; his own member step is still undone', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    signInAs('hunter')
    on(15, 23, 40)
    const page = render(<App />)
    try {
      const quals0 = JSON.stringify((PEOPLE as any)[PID.ranger].quals)
      await act(async () => { expect(updatePersonField(PID.ranger, { tick: 'daar' } as any)).toBeNull() })   // as 142's admin
      const changed = JSON.stringify((PEOPLE as any)[PID.ranger].quals)
      expect(changed).not.toBe(quals0)
      await act(async () => { switchRoleView() })
      await act(async () => {
        expect(commitNewInput({ person: PID.hunter, type: 'LL', allday: true, half: '', start: '2026-08-20', end: '2026-08-21', sTime: '', eTime: '', remarks: '', sans: null, docIds: [] })).toBe(true)
      })
      const iid = _timelineEntries().at(-1)!.forward.find(c => c.collection === 'inputs')!.id
      await act(async () => { pastMidnight() })
      expect(SESSION?.acct, 'a member of 149 from today').toBe('main')
      expect(_timelineEntries().length, 'both steps kept').toBeGreaterThanOrEqual(2)
      let u1: any, u2: any, u3: any
      await act(async () => { u1 = globalUndo() })
      expect(u1.ok, u1.reason).toBe(true)
      expect(INPUTS.some((r: any) => r.iid === iid)).toBe(false)
      await act(async () => { u2 = globalUndo() })
      expect(u2.ok).toBe(false)
      expect(u2.reason).toBe('Something else changed this after your action — it can’t be undone now.')
      expect(JSON.stringify((PEOPLE as any)[PID.ranger].quals), '142’s man untouched').toBe(changed)
      await act(async () => { u3 = globalUndo() })
      expect(u3.ok).toBe(false)
      expect(u3.reason, 'never "switch back to the admin view" — he has none').toBe('Something else changed this after your action — it can’t be undone now.')
    } finally { page.unmount() }
  })
})

describe('fix read 2 — the schedule-side re-walk’s W3-06: his open Input window at his midnight access change', () => {
  it('the page stays on Inputs and the window stays open under its band — his words are not dropped without a word (D2243 Q7)', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    signInAs('hunter')
    on(15, 23, 52)
    expect(commitNewInput({ person: PID.hunter, type: 'LL', allday: true, half: '', start: '2026-08-20', end: '2026-08-21', sTime: '', eTime: '', remarks: '', sans: null, docIds: [] })).toBe(true)
    const iid = _timelineEntries().at(-1)!.forward.find(c => c.collection === 'inputs')!.id
    const rec = INPUTS.find((r: any) => r.iid === iid)
    expect(rec, 'setup: his leave').toBeTruthy()
    const page = render(<App />)
    try {
      await act(async () => { setPage('inputs'); setInpEdit(rec); notify() })
      expect(page.queryByTestId('inped-moveband')).toBeNull()
      await act(async () => { pastMidnight() })
      expect(SESSION?.acct, 'a member of 149 from today').toBe('main')
      expect(CURPAGE, 'the page is not jumped').toBe('inputs')
      expect(INPEDIT, 'the window is not closed').toBeTruthy()
      expect(page.queryByTestId('inped-moveband'), 'the band, over his words').not.toBeNull()
    } finally { page.unmount(); setInpEdit(null) }
  })
})

describe('fix read 2 — the reach check blocks nothing he can still reach', () => {
  it('142’s admin: the first change to an account (it stores every seeded account) is undone and redone', () => {
    signInAs('hunter')
    expect(updateAccount(ACCT.ranger, { name: 'ranger2' })).toBeNull()
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(accountById(ACCT.ranger)!.name).not.toBe('ranger2')
    const r = globalRedo()
    expect(r.ok, r.reason).toBe(true)
    expect(accountById(ACCT.ranger)!.name).toBe('ranger2')
  })
  it('142’s admin: a change to his own man’s row is undone the day after, nobody having moved', () => {
    signInAs('hunter')
    const was = JSON.stringify((PEOPLE as any)[PID.ranger].quals)
    expect(updatePersonField(PID.ranger, { tick: 'daar' } as any)).toBeNull()
    on(16)
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(JSON.stringify((PEOPLE as any)[PID.ranger].quals)).toBe(was)
  })
  /* the Leave War's browser tests sign in as a member and take the admin's role by the localhost bridge (e2e/app.ts
     lwRole → probe-bridge.ts raptorRole → auth.ts setEffectiveRole): the reach check read that session as "an admin's
     step, his account gives no admin role" and blocked every Undo for good (GitHub's run of 22 Nov 26) */
  it('a member’s sign-in holding the admin’s role by the localhost bridge: his step is undone, never blocked for good', () => {
    signInAs('ranger')
    expect(SESSION?.acct).toBe('main')
    setEffectiveRole('admin')
    expect(commitNewInput({ person: PID.ranger, type: 'LL', allday: true, half: '', start: '2026-08-20', end: '2026-08-21', sTime: '', eTime: '', remarks: '', sans: null, docIds: [] })).toBe(true)
    const iid = _timelineEntries().at(-1)!.forward.find(c => c.collection === 'inputs')!.id
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(INPUTS.some((r: any) => r.iid === iid)).toBe(false)
  })
})
