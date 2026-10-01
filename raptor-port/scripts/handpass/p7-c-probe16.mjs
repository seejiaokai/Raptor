/* p7 walker C — probe 16 (C37 vi): the Leave War's post-in / post-out sheets, the event rows; the Inputs page's
   document field; the Tracker's first screen. Reads the controls only. */
process.env.HP_URL ||= 'http://localhost:4207'
import { boot, world } from './p6-lib.mjs'
const { L } = await boot()
const { browser, p, errors } = await world(L)
const sheet = () => p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth); const s = d[d.length - 1]; return s ? s.outerHTML.slice(0, 3500) : 'no sheet' })
const close = async () => { for (let i = 0; i < 4; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } else break } }
await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800)
await p.locator('[data-testid="month-JUL"]:visible').first().click(); await L.sleep(900)
const cell = p.locator('[data-testid="cell-slash-2026-07-20"]').first()
await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await cell.click(); await L.sleep(500)
console.log('BID SHEET buttons', await p.evaluate(() => [...document.querySelectorAll('.bidsheet[role="dialog"] button')].filter(b => b.offsetWidth).map(b => (b.getAttribute('data-testid') || '?') + ':' + b.innerText.trim())))
await p.click('[data-testid="bid-postin"]').catch(e => console.log('no bid-postin', e.message.split('\n')[0])); await L.sleep(500)
console.log('PI SHEET', await sheet())
await L.shot(p, 'probe16-pi')
await close()
await cell.click(); await L.sleep(500)
await p.click('[data-testid="bid-postout"]').catch(e => console.log('no bid-postout')); await L.sleep(500)
console.log('PO SHEET', await sheet())
await close()
console.log('EVENT rows', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="event-row-"]')].map(e => e.getAttribute('data-testid'))))
const ev = p.locator('[data-testid="event-0-2026-07-20"]').first()
console.log('event cell', await ev.count())
if (await ev.count()) { await ev.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await ev.click(); await L.sleep(500); console.log('EVENT SHEET', await sheet()); await L.shot(p, 'probe16-event'); await close() }
// inputs: a downchit type and its document field
await L.go(p, 'inputs'); await L.sleep(500)
console.log('types', await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '=' + o.text)))
for (const t of ['ATT C', 'ATTC', 'MC', 'OML']) { if (await p.locator(`#inType option[value="${t}"]`).count()) { await p.selectOption('#inType', t); await L.sleep(300); console.log(t, 'doc field', await p.evaluate(() => [...document.querySelectorAll('.docfield, input[type=file]')].map(e => e.outerHTML.slice(0, 400)))); break } }
// tracker
await L.go(p, 'tracker'); await L.sleep(1500)
console.log('TRACKER', await p.evaluate(() => { const r = document.querySelector('#page-tracker'); return r ? { text: r.innerText.replace(/\s+/g, ' ').slice(0, 600), buttons: [...r.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => (b.getAttribute('data-testid') || b.className || '?') + ':' + (b.innerText || b.title || '').trim().slice(0, 18)).slice(0, 50) } : null }))
await L.shot(p, 'probe16-tracker')
console.log('errors', errors)
await browser.close()
