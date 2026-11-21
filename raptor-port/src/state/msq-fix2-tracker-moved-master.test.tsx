// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useMsqWorld, signInAs, pastMidnight } from '../test-support/msq-world'
import { setMaster } from './accounts'
import { setHome, todayIso } from './units'
import { ownershipViolation, pageUnit, setTrkUnitProbe } from './perms'
import { trackerBand, warBand } from './typing-hold'
import { deriveActor } from '../command'
import { setCell, openDates, rawState } from '../leavewar/state/store'
import { warHolding } from '../leavewar/engine'
import { recsAt, type RequestRec } from '../leavewar/engine/warrecs'
import { Matrix } from '../leavewar/ui/Matrix'

useMsqWorld()
afterEach(() => {
  cleanup()
  setTrkUnitProbe(null)
})
function movingMaster() {
  signInAs('saber')
  expect(setMaster('acad2', true).ok).toBe(true)
  expect(setHome('prowler', 'u149').ok).toBe(true)
  signInAs('hunter')
}

it('F3: the retained Tracker rejects a moved master', () => {
  movingMaster()
  setTrkUnitProbe(() => 'u142')
  pastMidnight()
  expect(pageUnit('own', todayIso())).toBe('u149')
  expect(trackerBand()?.rest).toBe("This can't be saved in 142's Tracker.")
  const env: any = {
    seq: 1, at: '', origin: 'local',
    scope: { module: 'trk' }, type: 'trk.marks',
    actor: deriveActor(),
    changes: [{
      op: 'put', collection: 'trk.marks',
      id: 'v3:c1:sb2024:m:e1', before: null,
      after: '{"ST-01":{"g":2}}',
    }],
  }
  expect(
    ownershipViolation(env),
    'F3: retained Tracker refuses',
  ).not.toBeNull()
})
