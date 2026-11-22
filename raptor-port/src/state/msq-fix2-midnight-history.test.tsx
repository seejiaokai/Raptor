// @vitest-environment jsdom
import { it, expect } from 'vitest'
import { act, render } from '@testing-library/react'
import {
  useMsqWorld, signInAs, PID, on, moveMan, pastMidnight,
} from '../test-support/msq-world'
import { App } from '../ui/App'
import { switchRoleView } from './store'
import { SESSION } from './auth'
import { commitNewInput } from '../ui/inputedit'
import { INPUTS } from '../engine/inputs'
import { globalUndo, _timelineEntries } from '../undo/timeline'

useMsqWorld()

it('keeps the same person’s Undo across his midnight access change', async () => {
  signInAs('saber')
  expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
  signInAs('hunter')
  switchRoleView()
  on(15, 23, 50)

  const page = render(<App />)
  try {
    await act(async () => {
      expect(commitNewInput({
        person: PID.hunter, type: 'LL', allday: true,
        half: '', start: '2026-08-20', end: '2026-08-21',
        sTime: '', eTime: '', remarks: '', sans: null, docIds: [],
      })).toBe(true)
    })

    const entry = _timelineEntries().at(-1)!
    expect(entry.actor.role).toBe('member')
    const iid = entry.forward.find(c => c.collection === 'inputs')!.id

    await act(async () => { pastMidnight() })

    expect(SESSION?.acct).toBe('main')
    expect(
      _timelineEntries().some(e => e.seq === entry.seq),
      'the same signed-in person keeps his recorded action',
    ).toBe(true)

    await act(async () => {
      const result = globalUndo()
      expect(result.ok, result.reason).toBe(true)
    })
    expect(INPUTS.some((r: any) => r.iid === iid)).toBe(false)
  } finally {
    page.unmount()
  }
})
