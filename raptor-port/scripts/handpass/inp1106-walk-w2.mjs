console.log('[inp1106-walk-w2 v1]')
import { open, sleep } from './inp1106-walk-lib.mjs'
const size = process.argv[2] || 'desk'
const { br, p, errs, shot, tap, phone } = await open(size)
const T = `w2-${size}-`
const log = (...a) => console.log(...a)
const click = async (loc, name) => { if (phone) await tap(loc, T + name); else { await loc.click(); await sleep(500); await shot(T + name) } }
const rings = () => p.evaluate(() => [...document.querySelectorAll('.innew')].filter(e => e.offsetWidth).map(e => e.tagName + '.' + e.className.slice(0, 30) + ' | ' + e.innerText.replace(/\s+/g, ' ').slice(0, 50)))
const wins = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^=win-],[data-testid=docconf],.floatwin')].filter(e => e.offsetWidth).map(e => e.dataset.testid || e.className.slice(0, 20)))
const docconf = async () => { const b = p.locator('[data-testid=docconf] button', { hasText: 'No document' }); if (await b.count() && await b.first().isVisible()) { await sleep(300); phone ? await b.first().tap() : await b.first().click(); await sleep(200); return true } return false }
const fast = async name => { await p.screenshot({ path: `${(await import('./inp1106-walk-lib.mjs')).OUT}/${T}${name}.png` }) }
const pickDay = async d => { const l = p.locator(`[data-testid="inpEdCal-day-2026-07-${d}"]`); phone ? await l.tap() : await l.click(); await sleep(300) }
const savebtn = () => p.locator('#inpEditSave')

// S1: add on the List
await p.click('#inListBtn'); await sleep(300); await p.click('#inRangeBtn'); await sleep(200); await p.click('#inRangeAll'); await sleep(600)
await click(p.locator('#inNew'), 's1-new-window')
log('S1 windows:', JSON.stringify(await wins()))
await pickDay(22); await pickDay(23)
await p.fill('#inpEditRmk', 'W2 walk')
await shot(T + 's1-filled')
log('S1 title:', await p.locator('[data-testid=win-inputedit]').innerText().then(t => t.split('\n').slice(0, 2).join(' / ')))
await savebtn().click(); await sleep(400)
const dc = await docconf(); log('S1 docconf shown:', dc)
const r1 = await p.locator('.innew').count(); log('S1 ring count right after add:', r1, JSON.stringify(await rings()))
const rowSel = phone ? 'text=W2 walk' : '#intbl tr:has-text("W2 walk")'
await p.locator(rowSel).first().scrollIntoViewIfNeeded().catch(() => {})
await p.screenshot({ path: `${(await import('./inp1106-walk-lib.mjs')).OUT}/${T}s1-list-ring.png` })
log('S1 after scroll ring:', JSON.stringify(await rings()), 'wins', JSON.stringify(await wins()))
await sleep(7000); log('S1 ring after 7s:', (await rings()).length)
await p.locator(rowSel).first().scrollIntoViewIfNeeded().catch(() => {}); await shot(T + 's1-list-after-7s')

// S2: calendar month — open the input from its bar
await click(p.locator('#inCalBtn'), 's2-month')
const bar = p.locator('[data-testid^=ib-bar-]', { hasText: 'Saber · OL' }).first()
log('S2 bar count:', await p.locator('[data-testid^=ib-bar-]', { hasText: 'Saber · OL' }).count())
await bar.scrollIntoViewIfNeeded()
await click(bar, 's2-bar-tapped')
log('S2 after bar tap windows:', JSON.stringify(await wins()))
if (phone) { log('S2 phone: a tap on a month bar opens no window (see picture); month-bar ring checked in S3 after closing the day') } else {
log('S2 after bar tap windows:', JSON.stringify(await wins()))
log('S2 edit window remarks value:', await p.locator('#inpEditRmk').inputValue().catch(() => 'n/a'))
await p.fill('#inpEditRmk', 'W2 walk edit1'); await shot(T + 's2-edit-filled')
log('S2 save button text:', await savebtn().innerText())
await savebtn().click(); await sleep(250); await docconf()
const bring = await p.evaluate(() => [...document.querySelectorAll('.ib-bar.innew')].map(e => e.dataset.testid + ' ' + e.textContent.trim().slice(0, 30)))
await fast('s2-month-ring')
log('S2 bar ring after save:', JSON.stringify(bring), 'all rings', JSON.stringify(await rings()), 'wins', JSON.stringify(await wins()))
await sleep(7000)

}

// S3: a day opened — ring on its card
const cell = p.locator('#inpCal [data-icday="2026-07-22"]')
if (phone) await cell.tap({ position: { x: 10, y: 10 } }); else await cell.click({ position: { x: 10, y: 10 } })
await sleep(800); await shot(T + 's3-day22')
log('S3 windows:', JSON.stringify(await wins()))
const card = p.locator('[data-testid=win-inputsday] .icard', { hasText: 'W2 walk' }).first()
log('S3 cards in day:', await p.locator('[data-testid=win-inputsday] .icard').count(), 'W2 cards:', await p.locator('[data-testid=win-inputsday] .icard', { hasText: 'W2 walk' }).count())
await click(card, 's3-card-tapped')
log('S3 windows after card tap:', JSON.stringify(await wins()))
await p.fill('#inpEditRmk', 'W2 walk edit2')
await savebtn().click(); await sleep(250); await docconf()
await fast('s3-day-ring')
log('S3 ring in day:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.icard.innew,.ib-bar.innew')].map(e => e.className.slice(0, 20) + ' ' + e.textContent.trim().slice(0, 40)))), 'wins', JSON.stringify(await wins()))
if (phone) { await tap(p.locator('[data-testid=win-inputsday-x]'), T + 's3-day-closed'); log('S3 phone month-bar ring after closing day:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.ib-bar.innew')].map(e => e.dataset.testid + ' ' + e.textContent.trim().slice(0, 20)))), 'wins', JSON.stringify(await wins())); await tap(p.locator('#inpCal [data-icday="2026-07-22"]'), T + 's3-day-reopen') }
await sleep(7000)

// S4: Cancel / ✕ / Escape on the open input window
const openIt = async name => { const c = p.locator('[data-testid=win-inputsday] .icard', { hasText: 'W2 walk' }).first(); await click(c, name); await sleep(300) }
const state = async () => ({ wins: await wins(), dayCards: await p.locator('[data-testid=win-inputsday] .icard', { hasText: 'W2 walk edit2' }).count() })
await openIt('s4-open-for-cancel')
log('S4 open:', JSON.stringify(await state()))
await click(p.locator('#inpEditCancel'), 's4-after-cancel')
log('S4 after Cancel:', JSON.stringify(await state()))
await openIt('s4-open-for-x')
await click(p.locator('[data-testid=win-inputedit-x]'), 's4-after-x')
log('S4 after ✕:', JSON.stringify(await state()))
if (!phone) { await openIt('s4-open-for-esc'); await p.keyboard.press('Escape'); await sleep(500); await shot(T + 's4-after-esc'); log('S4 after Escape:', JSON.stringify(await state())) }

// S5: Delete from window, then Undo
await openIt('s5-open-for-delete')
const del = p.locator('[data-testid=win-inputedit] button', { hasText: /^Delete$/ })
log('S5 delete buttons:', await del.count())
await click(del.first(), 's5-after-delete'); await docconf()
log('S5 after delete:', JSON.stringify(await state()), 'W2 anywhere:', await p.locator('text=W2 walk').count())
const undo = p.locator('button[aria-label*="Undo" i], button[title*="Undo" i], #undoBtn').first()
log('S5 undo button:', await undo.evaluate(e => e.id + '|' + e.title + '|' + e.getAttribute('aria-label') + '|' + e.disabled).catch(() => 'none'))
if (phone) { await sleep(2500); await click(p.locator('[data-testid=win-inputsday-x]'), 's5-day-closed-for-undo') }
await click(undo, 's5-after-undo')
if (phone) { log('S5 phone month bar back after undo:', await p.locator('[data-testid^=ib-bar-]', { hasText: 'Saber · OL' }).count()); await click(p.locator('#inpCal [data-icday="2026-07-22"]'), 's5-day-reopened') }
log('S5 after Undo:', JSON.stringify(await state()), 'W2 anywhere:', await p.locator('text=W2 walk').count())

// S6: View-only Sched, the week of July 2026
await p.evaluate(() => window.go('viewsched')); await sleep(1200); await shot(T + 's6-viewsched-open')
log('S6 page text head:', await p.evaluate(() => document.querySelector('.page.on')?.innerText.replace(/\s+/g, ' ').slice(0, 200)))
{
  const wk = p.locator('.page.on').locator('text=Jul 20').first()
  log('S6 week tab count:', await wk.count())
  if (await wk.count() && await wk.isVisible()) { await click(wk, 's6-week-jul20'); await sleep(800); await shot(T + 's6-week-jul20-settled') }
  const t = await p.evaluate(() => document.querySelector('.page.on').innerText)
  log('S6 wed 22 / thu 23 lines mentioning Saber:', JSON.stringify(t.split(String.fromCharCode(10)).filter(l => /Saber/i.test(l)).slice(0, 8)))
  const sab = await p.evaluate(() => [...document.querySelectorAll('.page.on .day *')].filter(e => e.children.length === 0 && e.textContent.trim() === 'Saber' && e.offsetWidth).map(e => { const d = e.closest('.day'); return (d.querySelector('h3,.dh,.dayname,.dtitle') || d).innerText.replace(/\s+/g, ' ').slice(0, 20) + ' >> ' + e.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 60) }))
log('S6 Saber in days:', JSON.stringify(sab))
const un = await p.evaluate(() => { const els = [...document.querySelectorAll('.page.on .day *')].filter(e => e.children.length === 0 && /UNAVAILABLE/i.test(e.textContent) && e.offsetWidth); const e = els[2] || els[0]; if (e) e.scrollIntoView({ block: 'center', inline: 'center' }); return els.length })
log('S6 Unavailable headings visible:', un); await sleep(600); await shot(T + 's6-unavail')
log('S6 text has Unavailable list:', /unavail/i.test(t), '; heading ', t.replace(/\s+/g, ' ').slice(0, 120))
}
log('ERRORS', JSON.stringify(errs))
await br.close()
