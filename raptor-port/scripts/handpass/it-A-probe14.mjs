import { launch, open, shot, sleep, press, enableMemberFiling, asMember, people } from './it-A-lib.mjs'
import { calDoor, listDoor, runCase } from './it-A-doors.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
const P = await people(page)
await enableMemberFiling(page); await asMember(page, 'Ranger')
const r = await runCase(page, listDoor(), 'T2', { iso: '2026-07-28', several: [P.Ranger, P.Saber], st: '14:00', en: '15:00', expectCount: 2 }, 'probe14')
console.log(r.say)
await browser.close()
