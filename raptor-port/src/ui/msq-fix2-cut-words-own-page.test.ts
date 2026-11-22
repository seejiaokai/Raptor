// @vitest-environment jsdom
/* Fable, share 1 — proof: the calendars' "How this works" cut-off sentence (ui/sanscal-model.ts cutParts / cutSentence —
   printed on the SANS calendar and the Inputs calendar, own pages) reads the PICK's cut-off (state/cutoff.ts getCut with
   no squadron, engine/inputs.ts cutRuleText over VCONF), while the page's late marks and its settings window read the
   page's own squadron's. Hunter, 142's admin with View of 149, 149 picked: his own SANS calendar states 149's rule. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { switchUnit } from '../state/store'
import { setGrant } from '../state/units'
import { getCut, saveCut } from '../state/cutoff'
import { pageUnit } from '../state/perms'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { cutSentence } from './sanscal-model'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

describe("the cut-off sentence on his own calendars is his own squadron's", () => {
  it("149 picked by a View holder: the sentence is still 142's rule", () => {
    signInAs('saber')
    const own = cutSentence('sans')
    const lead142 = getCut('sans', 'u142').lead
    expect(saveCut('sans', { mode: 0, lead: lead142 + 4, wd: 0, weeks: 1 }, 'u149')).toMatchObject({ ok: true })
    expect(getCut('sans', 'u142').lead, "142's untouched").toBe(lead142)
    expect(getCut('sans', 'u149').lead).toBe(lead142 + 4)
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
    signInAs('hunter')
    expect(cutSentence('sans'), 'control: at home').toBe(own)
    switchUnit('u149')
    expect(pageUnit('own'), "his own pages stay 142's").toBe('u142')
    expect(cutSentence('sans'), "his SANS calendar's sentence").toBe(own)
  })
})
