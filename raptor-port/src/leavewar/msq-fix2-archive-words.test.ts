// @vitest-environment jsdom
/* The re-walk of 22 Nov 26 (RK item 6): Hunter (142's admin) pressing Archive on Kestrel (149's) said
   "…can change him." where Member, Suspend and Delete say the ruled "…can change his account." */
import { expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { archiveProblem, archivePerson } from './sync'

useMsqWorld()
const RULED = "He is 149's. Only an admin of 149 can change his account."

it("Hunter archiving Kestrel is refused in the ruled sentence, as Member, Suspend and Delete are", () => {
  signInAs('hunter')
  expect(archiveProblem(PID.kestrel)).toBe(RULED)
  expect(archivePerson(PID.kestrel).bad).toBe(RULED)
})

it('control: 149s own admin may still archive his own man', () => {
  signInAs('kestrel')
  expect(archiveProblem(PID.osprey)).toBeNull()
})
