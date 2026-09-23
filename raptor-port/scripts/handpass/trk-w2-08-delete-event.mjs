/* [HUMAN-RETEST] Tracker — walker w2, walk 8: DELETING AN EVENT THAT HAS
   MARKS (Astra #29), desktop, admin.

   Mark ACG-03 for both students; Syllabus ✎ → Edit chart layout → 🗑 Delete →
   press ACG-03 → confirm → ↶: back with its links and marks? Then delete it
   again → Done editing → ✓ Save changes → reload → + Acad named "ACG-03" (the
   SAME code) → does the old mark reappear on the new ball? */
import { open, shot, save, log, reveal, dlg, DESK } from './trk-lib.mjs'
import { sleep, tapBall, pickFrom, wedges, undoState, reloadBack, popFails } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
const has = id => page.evaluate(id => !![...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id), id)
/* ACG-03's own arrows, as edit mode tags them (each arrow names its two ends) */
const links = () => page.evaluate(() => [...document.querySelectorAll('#flowSvg path.edgehit')].filter(p => p.dataset.p === 'ACG-03' || p.dataset.c === 'ACG-03').map(p => p.dataset.p + '→' + p.dataset.c).join(', '))
const overall = () => page.evaluate(() => { const c = document.querySelector('.c-overall'); return c ? c.innerText.replace(/\s+/g, ' ').slice(0, 90) : '' })
const menu = async () => { await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(450) }

/* marks on ACG-03: A DCO + a failure, B DPCO */
await tapBall(page, 'ACG-03'); await page.click('#popFailPlus'); await sleep(350); await grade('DCO')
await pickFrom(page, '#activeSel', /STUDENT B/)
await tapBall(page, 'ACG-03'); await grade('DPCO')
await pickFrom(page, '#activeSel', /STUDENT A/)
const w0 = await wedges(page, 'ACG-03'); const o0 = await overall()
const tf = () => page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-03'); return g ? g.getAttribute('transform') : null })
const t0 = await tf()
L.note('0. ACG-03 marked', JSON.stringify({ wedges: w0, overall: o0 }))

/* delete with the Delete tool */
await menu()
await reveal(page, 'ACG-03')
const e0 = await links()
L.note("0b. in edit mode, ACG-03's arrows", e0)
await page.locator('#arrTools button', { hasText: '🗑 Delete' }).click(); await sleep(300)
const bb = await page.locator('#flowSvg .ball[data-id="ACG-03"]').first().boundingBox()
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(350)
const q = await dlg(page, { ok: true }); await sleep(700)
const e1 = await links()
L.ok('1.1 the Delete tool asks, then removes ACG-03 and its arrows', /Delete ACG-03 from this syllabus\?/.test(q.text) && !(await has('ACG-03')) && !!e0 && e1 === '', JSON.stringify({ asked: q.text.replace(/\s+/g, ' '), arrows: `${e0} → ${e1 || 'none'}`, status: await page.locator('#saveStat').innerText() }))
await shot(page, 'w2-10-deleted')
/* ↶ */
const u = await undoState(page)
await page.click('#trUndoBtn'); await sleep(700)
const w1 = await wedges(page, 'ACG-03'); const e2 = await links()
L.ok('1.2 ↶ brings ACG-03 back in the same place, with its arrows and both marks', (await has('ACG-03')) && e2 === e0 && JSON.stringify(w1) === JSON.stringify(w0) && (await tf()) === t0, JSON.stringify({ tip: u.undo.t, arrows: e2, wedges: w1, place: `${t0} → ${await tf()}` }))
await shot(page, 'w2-10-undone')

/* delete again, keep it deleted: Done editing → Save changes → reload */
await reveal(page, 'ACG-03')
await page.locator('#arrTools button', { hasText: '🗑 Delete' }).click(); await sleep(300)
const bb2 = await page.locator('#flowSvg .ball[data-id="ACG-03"]').first().boundingBox()
await page.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await sleep(350)
await dlg(page, { ok: true }); await sleep(600)
await menu()   // ✓ Done editing chart
await page.click('#saveChanges'); await sleep(700)
const o1 = await overall()
await reloadBack(page, 'a')
L.ok('2.1 deleted, saved, reloaded: ACG-03 is gone', !(await has('ACG-03')), JSON.stringify({ overallAfterDelete: o1, overallAfterReload: await overall() }))

/* a NEW ball with the SAME code */
await menu()
await page.locator('#arrTools button', { hasText: '+ Acad' }).click(); await sleep(300)
const q2 = await dlg(page, { value: 'ACG-03' }); await sleep(600)
L.note('3.0 + Acad asked', q2.text.replace(/\s+/g, ' '))
const w2 = await wedges(page, 'ACG-03')
L.ok('3.1 the NEW ball "ACG-03" starts with no marks (the old event\'s marks do not reappear)', (await has('ACG-03')) && w2 && w2.every(f => f === '#ffffff'), JSON.stringify({ wedges: w2, oldWere: w0 }))
await reveal(page, 'ACG-03')
await shot(page, 'w2-10-new-ball-same-code')
await menu()
await page.click('#saveChanges'); await sleep(700)
await reloadBack(page, 'a')
const w3 = await wedges(page, 'ACG-03')
await tapBall(page, 'ACG-03')
const pf = await popFails(page)
L.ok('3.2 …and after Save changes and a reload it still has none', w3 && w3.every(f => f === '#ffffff'), JSON.stringify({ wedges: w3, popUp: pf, overall: await overall() }))
await shot(page, 'w2-10-new-ball-after-reload')
await page.keyboard.press('Escape'); await sleep(200)

save('w2-08-delete-event', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
