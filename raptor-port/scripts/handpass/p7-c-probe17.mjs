/* p7 walker C — probe 17: the event sheet's "A range", what a filled event box is called, and the way back in for a
   man posted out (where the app offers PI). Reads controls; makes one event and one posting in a throwaway world. */
import { boot, world } from './p6-lib.mjs'
const { L } = await boot()
const { browser, p, errors } = await world(L)
const sheet = () => p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth); const s = d[d.length - 1]; return s ? (s.getAttribute('data-testid') || '') + ' :: ' + s.innerText.replace(/\s+/g, ' ').trim().slice(0, 500) + ' :: ' + [...s.querySelectorAll('input, button, select')].filter(e => e.offsetWidth).map(e => (e.getAttribute('data-testid') || e.className) + (e.type ? '(' + e.type + ')' : '')).join(', ') : 'no sheet' })
await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800)
await p.locator('[data-testid="month-JUL"]:visible').first().click(); await L.sleep(900)
const ev = p.locator('[data-testid="event-1-2026-07-20"]').first()
await ev.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await ev.click(); await L.sleep(500)
await p.locator('[data-testid="event-text"]').fill('P7 BAND'); await p.click('[data-testid="event-tag-work"]'); await L.sleep(200)
await p.click('[data-testid="event-scope-range"]'); await L.sleep(500)
console.log('AFTER "A range":', await sheet())
console.log('banner', await p.evaluate(() => [...document.querySelectorAll('[data-testid*="banner"], .lw-banner, .movebar')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' '))))
await L.shot(p, 'probe17-range')
// try: tap the end day's event box on the grid
const end = p.locator('[data-testid="event-1-2026-07-22"]').first()
if (await end.count()) { await end.click({ timeout: 3000 }).catch(e => console.log('end click', e.message.split('\n')[0])); await L.sleep(500) }
console.log('AFTER tapping 22 Jul:', await sheet())
const ap = p.locator('[data-testid="event-apply"]:visible'); if (await ap.count()) { await ap.click(); await L.sleep(600) }
console.log('row 1 cells', await p.evaluate(() => [...document.querySelectorAll('[data-testid="event-row-1"] td, [data-testid="event-row-1"] [data-testid]')].filter(e => /2026-07-(19|2[0-4])/.test(e.getAttribute('data-testid') || '') || /P7/.test(e.innerText || '')).map(e => (e.getAttribute('data-testid') || e.tagName) + ' colspan=' + (e.getAttribute('colspan') || '') + ' "' + (e.innerText || '').replace(/\s+/g, ' ').trim() + '" [' + e.className + ']').slice(0, 14)))
await L.shot(p, 'probe17-band')
// posting: PO Cobra from 20 Jul (SANS), then where is PI offered?
const tap = async (id, iso) => { const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await c.click(); await L.sleep(500) }
await tap('taipan', '2026-07-20'); await p.click('[data-testid="bid-postout"]'); await L.sleep(300); await p.click('[data-testid="po-sans"]'); await L.sleep(200); await p.click('[data-testid="po-confirm"]'); await L.sleep(900)
for (let i = 0; i < 3; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } }
await tap('taipan', '2026-07-28'); console.log('tap a PO box (28 Jul):', await sheet())
for (let i = 0; i < 3; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } }
await tap('taipan', '2026-07-17'); console.log('tap a box before the PO (17 Jul):', await sheet())
console.log('errors', errors)
await browser.close()
