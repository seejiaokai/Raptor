// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { setHome } from '../state/units'
import {
  setCell, rawState, movableRecords, moveRecords, decideRequests,
} from './state/store'
import { warHolding } from './engine'
import { recsAt, type RequestRec } from './engine/warrecs'

useMsqWorld()
const day = '2026-07-08'
const requests = () =>
  recsAt(warHolding(rawState().wars, day)!.recs, 'bane', day)
    .filter((r): r is RequestRec => r.kind === 'request')

function bid() {
  signInAs('saber')
  expect(setCell('bane', day, 'LL')).toBe(true)
  expect(requests()).toHaveLength(1)
  return requests()[0]!
}
function movers() {
  const m = movableRecords([{ personId: 'bane', date: day }])
  expect(m).toHaveLength(1)
  return m
}

it('F1: a forbidden landing retains the pending source', () => {
  const r = bid()
  expect(setHome('bane', 'u149').ok).toBe(true)
  expect(moveRecords(movers(), 34)).not.toBe('moved')
  expect(
    requests().some(x => x.id === r.id),
    'F1: original bid survives',
  ).toBe(true)
})

it('F2: approved leave cannot land on another squadron day', () => {
  const r = bid()
  const out = decideRequests([{
    personId: 'bane',
    parts: [{ date: day, recId: r.id, code: r.code, state: 'pending' }],
    to: 'approved',
  }])
  expect(out[0]!.kind).toBe('done')
  expect(setHome('bane', 'u149').ok).toBe(true)
  const m = movers()
  expect(m[0]!.kind).toBe('absence')
  expect(
    moveRecords(m, 34),
    'F2: foreign destination refused',
  ).not.toBe('moved')
})
