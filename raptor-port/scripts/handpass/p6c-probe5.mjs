/* phase 6 (c) check — §8 item 6: a request on a week nobody has opened shows on the next-week preview (a picture of it) */
import { world, fileTimed } from './p6-lib.mjs'
const L = await import('./dbrA-lib.mjs'); const W = await import('./dbrA-W1-lib.mjs')
const { browser, p } = await world(L)
await fileTimed(L, p, { person: 'bane', type: 'Meeting', iso: '2026-07-21', from: '10:00', to: '11:00', remarks: 'P6C PEEK' })
await W.toEdit(L, p)
/* the desktop arrows walk the live days to the front, the preview after them — pressed as a person would */
for (let i = 0; i < 8; i++) { const b = p.locator('#eWeek .pan-next:visible, #eWeek [data-pan="1"]:visible, .wkarrow.next:visible').first(); if (!(await b.count())) break; await b.click(); await L.sleep(350) }
const el = p.locator('.day.peek[data-peek-day="1"]').first()
console.log('has it:', /P6C PEEK/.test(await el.innerText()))
await el.screenshot({ path: process.env.HP_SHOTS + '/X4b-peek-tuesday-' + process.env.HP_TAG + '.png' })
await browser.close()
