/* the flying plan's resolver, run again under this suite's hostile time zone — the Leave War's rows read it
   (the build plan §3.2; .claude/rules/raptor-executor.md §Correctness) */
import { expect, it } from 'vitest'
import { flyplanModelSuite } from '../state/flyplan-model.suite'

it('runs under the hostile time zone', () => { expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(660) })
flyplanModelSuite()
