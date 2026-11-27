// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 6 (the security reader's S2, [ACCT-TOLD-OTHER-LINES] — the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md; copied from his proof-1, its "it shows" case dropped now the
   premise is gone): a bare `account.told` (no `acct` line in it) was judged by nobody — acctLineViolation returned at
   once where the command carried no `acct` line, BEFORE its own `account.told` section, the only place that says
   "nothing else rides this command". So the app's projection door could put any other kind of bell line, in any words,
   on any person's bell, by labelling its command `account.told`. Now it carries only account and squadron-Plan lines. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, PID } from '../test-support/msq-world'
import { NOTICES, type Notice } from './notices'
import { todayIso } from './units'
import { commitProjection } from '../command'
import { commitSettingsIntent } from './people-settings-commit'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'

withThird()
beforeEach(() => { NOTICES.length = 0 })

const cs = (pid: string): string => String((PEOPLE as any)[pid]?.cs ?? pid)
let seq = 0
const line = (to: string, what: any[], extra: Record<string, unknown> = {}): Notice =>
  ({ id: 'zzsec' + (++seq), to, by: null, at: Date.now(), iid: '', name: cs(PID.osprey), day: todayIso(), what, ...extra }) as Notice
const app = (type: string, lines: Notice[]): any => commitProjection({ type, scope: { module: 'inputs' }, apply: (txn: any) => {
  HOOKS.bellEnlist(txn)
  for (const n of lines) NOTICES.push(n)
  HOOKS.bellEnd()
} } as any)
const onBell = (pid: string, id: string): boolean => NOTICES.some(n => n.id === id && String(n.to) === pid)

const KINDS: Array<[string, () => Notice]> = [
  ["a posting's line (po) to Kestrel, about Osprey", () => line(PID.kestrel, [{ k: 'po', who: PID.osprey, o: 'arch', d: todayIso() }], { u: 'u149' })],
  ["a holiday's admin line (oilhol) to Mako, stamped 150", () => line(PID.mako, [{ k: 'oilhol', a: todayIso(), b: todayIso(), u: 'u150' }], { u: 'u150', name: 'Fake Holiday' })],
  ["an input's line (in) to Osprey naming no input the command changed", () => line(PID.osprey, [{ k: 'in' }], { iid: 'nosuchinput' })],
  ["a Leave War decision (lw) to Ranger", () => line(PID.ranger, [{ k: 'lw', c: 'LL', a: todayIso(), b: todayIso(), d: 'refused' }], { name: 'Your leave' })],
  ["a posting's take-back (poback) to Hunter", () => line(PID.hunter, [{ k: 'poback', who: PID.osprey }], { u: 'u149' })],
]

describe('U2 fix 6 — a bare account.told carries only account and squadron-Plan lines', () => {
  it.each(KINDS)('the app\'s actor, account.told: %s — refused', (_n, mk) => {
    const n = mk()
    const r = app('account.told', [n])
    expect(r.ok, 'account.told rode a line of another kind').toBe(false)
    expect(onBell(String(n.to), String(n.id))).toBe(false)
  })
  it('(contrast) the same posting line under posting.failed is refused — the one other app-only line writer', () => {
    const n = KINDS[0]![1]()
    expect(app('posting.failed', [n]).ok).toBe(false)
  })
  it('(contrast) an admin\'s account.told with an input line about nobody he may tell: refused by the ordinary doors', () => {
    signInAs('kestrel')
    const n = line(PID.ranger, [{ k: 'in' }], { iid: 'nosuchinput', by: PID.kestrel })
    const r: any = commitSettingsIntent('account.told', null, (txn: any) => { HOOKS.bellEnlist(txn); NOTICES.push(n); HOOKS.bellEnd() })
    expect(r.ok).toBe(false)
  })
})
