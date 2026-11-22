// @vitest-environment jsdom
/* THE FIRST WRITE OF A SQUADRON'S SETTING THAT IS NOT THE ONE IN VIEW, AND NEVER STORED (the own-pages helper's
   inventory, point 8 — the reshape plan §3.2 A-ii). The settings record set (state/people-settings-commit.ts
   settingsRecordKeys) holds the unit in view's fixed keys always, but another squadron's only once it is stored. Once
   an own page writes its own squadron's setting while another is picked, the first such write meets a key the record set
   did not hold before the command. The worry: captured as nothing, its Undo leaving it behind. This holds that it is
   captured as a new record — Undo removes it, Redo puts it back, the squadron in view untouched — written through the
   store's write with the qualified name, exactly as state/memberfile.ts already writes its switch. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans } from './store'
import { setGrant } from './units'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { store, unitSetting, unitSettingKey } from '../engine/hooks'
import { globalUndo, globalRedo } from '../undo/timeline'

useWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans() })

const COLS = [{ k: 'sxo', h: 'SXO' }, { k: 'mgmt', h: 'MGMT' }]

describe("another squadron's setting written for the first time is one Undo step, both ways", () => {
  it("Hunter (142 admin, View of 149) picks 149 and saves 142's never-stored Quals columns: Undo takes them away, Redo brings them back", () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    switchUnit('u149')
    expect(UNIT).toBe('u149')
    expect(unitSetting('u142', 'qualcols', null), "142's list never stored").toBeNull()
    store.set(unitSettingKey('u142', 'qualcols'), COLS)
    expect(unitSetting('u142', 'qualcols', null), 'saved as 142\'s').toEqual(COLS)
    expect(unitSetting('u149', 'qualcols', null), "149's untouched").toBeNull()
    /* (a step about one squadron waits for him in that squadron — undo/timeline.ts inUnitView, helper "undo & roles"'
       A-v: so the Undo is pressed with 142 in view; this test is about the capture, not that wait) */
    switchUnit('u142')
    const u = globalUndo() as any
    expect(u?.ok, JSON.stringify(u)).toBe(true)
    expect(unitSetting('u142', 'qualcols', null), 'Undo takes the new record away').toBeNull()
    const r = globalRedo() as any
    expect(r?.ok, JSON.stringify(r)).toBe(true)
    expect(unitSetting('u142', 'qualcols', null), 'Redo brings it back').toEqual(COLS)
    expect(unitSetting('u149', 'qualcols', null), "149's still untouched").toBeNull()
  })
})
