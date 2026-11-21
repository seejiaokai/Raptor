// @vitest-environment jsdom
/* C8 (Fable F5; Opus saw the same strip and judged it unreachable): a saved week read by its squadron-qualified key
   (stashDays('u149@27/07/2026')) is worked out as the squadron IN VIEW — wkOf(v) strips the unit before viewOfWeek, which
   then lands the unit in view's requests. Correct (the brief's promise 1, plan §3.4 "only this week's unit's requests
   land on it"): 149's week lands no 142 man's request. Latent: no caller passes a qualified key today.
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/c-c08-stash-qualified-key.test.ts.txt
   — only the harness changed (test-support/msq-world.ts; `boot()` goes, its world boots itself). */
import { useMsqWorld, at, signInAs } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { INPUTS, goesOnProg } from '../engine/inputs'
import { stashPut, stashDays } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { UNIT } from '../engine/unitview'

useMsqWorld()

const hasRow = (b: any, iid: string) => !!b && (b.days || []).some((d: any) => ((d && d.ground) || []).some((g: any) => g && String(g.src || '') === iid))

describe("C8 — 149's saved week read by its qualified key while 142 is in view", () => {
  it("lands no 142 man's activity request", () => {
    at('2026-07-14')
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    const proto = INPUTS.find((r: any) => goesOnProg(r) && !r.endDate) as any
    expect(proto, 'a seed activity request to copy').toBeTruthy()
    const req = { ...structuredClone(proto), iid: 'c08', person: 'bane', people: undefined, date: 'Jul 28', yr: 2026, acc: undefined, by: 'bane', ord: 99908 }
    delete (req as any).people
    INPUTS.push(req)
    expect(goesOnProg(req)).toBe(true)
    const blank = () => JSON.stringify({ d: structuredClone(weekBundle('27/07/2026').days).map((d: any) => ({ ...d, ground: [] })) })
    /* control: 142's own week (bare key = the unit in view) lands it */
    stashPut('27/07/2026', blank())
    expect(hasRow(stashDays('27/07/2026'), 'c08'), "control: 142's week lands bane's request").toBe(true)
    /* 149's week, named by its qualified key */
    stashPut('u149@27/07/2026', blank())
    expect(hasRow(stashDays('u149@27/07/2026'), 'c08'), "149's week does not land a 142 man's request").toBe(false)
  })
})
