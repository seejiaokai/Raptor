/* p7 walker C — probe 12: which stored row a new Leave War counter lands in (one counter added, rows compared). */
import { boot, world } from './p6-lib.mjs'
const { L } = await boot()
const { browser, p } = await world(L)
await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800)
const r0 = await L.rows(p)
await p.click('[data-testid="settings-open"]'); await L.sleep(300); await p.click('[data-testid="counter-add"]'); await L.sleep(300)
await p.locator('[data-testid="cform-name"]').fill('P7 PROBE'); await p.click('[data-testid="cform-save"]'); await L.sleep(300)
await L.settle(p)
const r1 = await L.rows(p); const d = L.diff(r0, r1)
for (const k of d.put) console.log(k, '=', String(r1[k]).slice(0, 400), '… length', String(r1[k]).length)
await browser.close()
