import { open, fileInput, shot, toWeekDay, errs, browser, unavRows, reveal, toastMark, toastsSince, undoOnce, redoOnce, calDay, PID } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
const ODs = () => page.evaluate(() => window.INPUTS.filter(r => r.type === 'OD' && r.date === 'Jul 16').map(r => ({ who: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs + ':' + (e.s ?? '') + '-' + (e.e ?? '')) : [window.PEOPLE[r.person]?.cs], s: r.s, e: r.e, rmk: r.remarks || r.rmk || '', n: r.people ? r.people.length : 1 })))
const thuRows = async () => (await unavRows(page, 3)).filter(r => /^OD/.test(r.text) && (r.people.includes('Drifter') || r.people.includes('Hunter'))).map(r => r.text)
const calCard = async () => { await calDay(page, '2026-07-16'); await page.locator('[data-icday="2026-07-16"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500); return page.evaluate(() => (document.querySelector('[data-testid="win-inputsday"]')?.innerText || '').replace(/\s+/g, ' ')) }
res.filed = await fileInput(page, { type: 'OD', people: ['Drifter', 'Hunter'], from: '2026-07-16', to: '2026-07-16' })
res.before = { rows: await (async () => { await toWeekDay(page, 3); return thuRows() })(), inputs: await ODs() }
await shot(page, 'j3-a-before')
const iid = res.filed[0].iid
const cell = page.locator(`#eWeek [data-inp="${iid}~slipway.str"]`).first()
await reveal(cell)
const m = await toastMark(page)
await cell.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('09:00'); await page.keyboard.press('Tab'); await page.waitForTimeout(900)
res.after = { toast: await toastsSince(page, m), rows: await thuRows(), inputs: await ODs(), all: await page.evaluate(() => window.INPUTS.filter(r => r.type === 'OD').map(r => ({ iid: r.iid.slice(-5), date: r.date, cs: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs) : window.PEOPLE[r.person]?.cs, s: r.s, e: r.e }))) }
await shot(page, 'j3-b-after-retime')
const sec = page.locator('#eWeek .day:not(.peek)').nth(3).locator('.sec-unav').first(); await reveal(sec); await sec.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/J/j3-b-thu-unavail.png' })
res.afterCard = await calCard(); await shot(page, 'j3-c-cal-day'); await page.keyboard.press('Escape'); await page.waitForTimeout(300); await shot(page, 'j3-c-cal-month')
/* Hunter's bell, in place */
await page.evaluate(([id]) => { window.raptorMe(id); window.raptorRole('member') }, [PID.Hunter]); await page.waitForTimeout(800)
await page.evaluate(() => window.go('editsched')).catch(() => {}); await page.waitForTimeout(500)
res.hunterBell = await page.evaluate(() => { const b = document.querySelector('#notifyBell'); return b ? { lit: b.classList.contains('on'), cls: b.className } : null })
await page.locator('#notifyBell').click(); await page.waitForTimeout(500)
res.hunterList = await page.evaluate(() => { const l = document.querySelector('.bell-list'); return l ? { empty: l.querySelector('.bl-empty')?.textContent || null, lines: [...l.querySelectorAll('.bl-line')].map(e => e.innerText.replace(/\s+/g, ' ')) } : null })
res.notices = await page.evaluate(() => (window.NOTICES || []).map(n => [n.to, n.by, (n.what || []).map(p => p.k).join('+')]))
await shot(page, 'j3-d-hunter-bell')
await page.locator('#notifyBell').click().catch(() => {}); await page.waitForTimeout(300)
await page.evaluate(([id]) => { window.raptorMe(id); window.raptorRole('admin') }, [PID.Saber]); await page.waitForTimeout(800)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
/* U / R */
res.undo = await undoOnce(page); await toWeekDay(page, 3)
res.afterUndo = { rows: await thuRows(), inputs: await ODs(), undoDisabled: await page.locator('#undoBtn').isDisabled().catch(() => null) }
await shot(page, 'j3-e-undo')
res.redo = await redoOnce(page); await toWeekDay(page, 3)
res.afterRedo = { rows: await thuRows(), inputs: await ODs() }
await shot(page, 'j3-f-redo')
console.log(JSON.stringify(res, null, 1))
writeFileSync('docs/handpass/parts/or-J-j3-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
