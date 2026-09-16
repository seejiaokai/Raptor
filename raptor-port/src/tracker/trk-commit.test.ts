// @vitest-environment jsdom
/* [ARCH-STACK] Step 2 phase 5 — the Tracker routed through the command gate
   (design §5.4). Proves the ADDITIVE wiring: once init() has enabled command
   routing (after all boot migrations), a durable Tracker write (recording a
   failure -> saveMarks -> sSet) emits a record-level envelope on the trk.marks
   collection, scoped to the module. The async storage persist is unchanged; the
   allowlist keeps migration flags off the stream (behaviour-identical to today).
   The comprehensive behaviour check is the vendored smoke suite (425/0). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { onCommit } from '../command'
import type { CommitEnvelope } from '../command'

const Z = 'sTZCMD'
let board: HTMLDivElement

beforeAll(async () => {
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await core.init()   // enables command routing at the end (after boot migrations)
  if (!(core as any).byName('CMD Z')) ((core as any).roster as any).push({ id: Z, name: 'CMD Z' })
})
afterAll(() => { board.remove() })

describe('a Tracker durable write emits a record envelope (property c)', () => {
  it('recording a failure (saveMarks) emits a trk.marks envelope, scoped to trk', async () => {
    ;(core as any).setActive(Z)
    const caught: CommitEnvelope[] = []
    const unsub = onCommit(e => caught.push(e))
    ;(core as any).openPop('ST-01', { clientX: 1, clientY: 1 })
    await (core as any).popFail(1)
    unsub()
    expect(caught.length).toBeGreaterThan(0)
    expect(caught.some(e => e.changes.some(c => c.collection === 'trk.marks'))).toBe(true)
    expect(caught.every(e => (e.scope as any).module === 'trk')).toBe(true)
  })

  /* NB: delKey routing (Codex-4) is exercised end-to-end by the smoke suite's
     student/syllabus/course deletions; a unit test of removeStudent hangs headless
     on its confirm dialog, so it is not repeated here. */
})
