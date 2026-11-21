// @vitest-environment jsdom
/* A QUALS CHANGE WORDED WITH THE RIGHT COLUMNS (the reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md
   §3.2 A-ii — Quals is an own page: it reads its own squadron's columns, never the pick's; engine/qualcols.ts qualColsOf).
   The change history's line for a tick (state/changelines.ts, the person lines) named it by the columns of the squadron
   picked: a master admin who picked 149, whose Quals columns differ, read a 142 man's tick under 149's heading. A tick is
   named by the man's own squadron's columns. The world: test-support/msq-world.ts. */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, mem, PID } from '../test-support/msq-world'
import { switchUnit } from './store'
import { updatePersonField } from './quals-write'
import { DEFAULT_QUAL_COLS } from '../engine/qualcols'
import { unitSettingKey } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

/* 149's own Quals columns: NVG headed "Night goggles" there */
const cols149 = () => {
  mem['sqn142_' + unitSettingKey('u149', 'qualcols')] = JSON.stringify(DEFAULT_QUAL_COLS.map(c => (c.k === 'nvg' ? { ...c, h: 'Night goggles' } : c)))
}
const qualsLines = () => ELOG.rows.filter(r => r.sect === 'quals').map(r => r.lbl)

describe("a Quals change is named by the man's own squadron's columns, never the pick's", () => {
  it("Saber picks 149 and ticks NVG for Ranger (142's): the line reads 142's heading, NVG", () => {
    signInAs('saber')
    cols149()
    switchUnit('u149')
    expect(updatePersonField(PID.ranger, { tick: 'nvg' })).toBeNull()
    switchUnit('u142')
    expect(qualsLines(), "filed with 142's history, under 142's column").toEqual(['Ranger · NVG'])
  })

  it("(control) a 149 man's tick, with 149 picked: 149's own heading", () => {
    signInAs('saber')
    cols149()
    switchUnit('u149')
    expect(updatePersonField(PID.osprey, { tick: 'nvg' })).toBeNull()
    expect(qualsLines()).toEqual(['Osprey · Night goggles'])
  })
})
