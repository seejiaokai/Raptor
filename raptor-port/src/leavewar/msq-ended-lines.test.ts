// @vitest-environment jsdom
/* "BIDDING CLOSED · ITS DATES ENDED" IS HIS OWN SQUADRON'S WAR'S, WHICHEVER WAR IS LOADED (batch 1's second half, §16 D4′ —
   R3-O12, R3-F8). The line is worked out live in each reader's bell from the war's stored stretches (sync.ts endedLines).
   It read the LOADED war — so Saber, a master admin of 142, who picks 149 (his pages follow the pick, D2197, and the war
   loaded with them) lost his own 142 war's line, and the bell's unread count moved with the pick. It reads the war of the
   reader's own squadron: the loaded one where that is it, else that squadron's stored war. Red first. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { enterSquadron, switchUnit } from '../state/store'
import { noticesFor, noticeWords } from '../state/notices'
import { unreadFor } from '../state/noticeseen'
import { closeDates, openDates, getState, worldUnit } from './state/store'
import { setMemberTodayForTests } from './engine'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useMsqWorld()
afterEach(() => { setMemberTodayForTests('2000-01-01'); if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

const ended = (pid: string) => noticesFor(pid).map(n => noticeWords(n).what).filter(w => /its dates ended/.test(String(w)))

describe('the ended-stretch line follows his own squadron, not the war loaded', () => {
  it("Saber picks 149: his 142 war's line stays, the unread count unchanged", () => {
    signInAs('saber')
    expect(worldUnit()).toBe('u142')
    const p = getState().period
    closeDates(p.start, p.end)
    setMemberTodayForTests('2026-02-20')
    openDates('2026-03-01', '2026-03-31')
    setMemberTodayForTests('2026-04-02')
    const before = ended(PID.saber), count = unreadFor(PID.saber)
    expect(before.length, 'control: the line').toBe(1)
    enterSquadron('u149')
    expect(worldUnit(), "control: 149's war is loaded").toBe('u149')
    expect(ended(PID.saber), 'his own war\'s line, still').toEqual(before)
    expect(unreadFor(PID.saber), 'the unread count').toBe(count)
  })
})
