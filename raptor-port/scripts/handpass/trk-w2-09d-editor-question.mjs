/* [HUMAN-RETEST] Tracker — walker w2, walk 9d: the ball editor and the
   question boxes (R114, R95), desktop, admin — the part of walk 9 that needs
   edit mode. In edit mode the chart is brought into view by dragging empty
   space (the driver's reveal), then the ball is double-clicked on its centre. */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, centreOf, wedges } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const vis = sel => page.locator(sel).first().isVisible().catch(() => false)
async function outsidePoint(sel) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel); const r = el ? el.getBoundingClientRect() : { left: 9999, right: -1, top: 9999, bottom: -1 }
    for (const [x, y] of [[60, 600], [innerWidth - 60, 600], [60, innerHeight - 60]]) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) continue
      const hit = document.elementFromPoint(x, y)
      return { x, y, hit: hit ? (hit.id ? '#' + hit.id : hit.tagName.toLowerCase() + '.' + String(hit.getAttribute('class') || '').split(' ')[0]) : null }
    }
    return null
  }, sel)
}
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(450)
const dbl = async () => { await reveal(page, 'ACG-04'); const c = await centreOf(page, 'ACG-04'); await page.mouse.dblclick(c.x, c.y); await sleep(450) }

/* 8. the ball editor */
await dbl(); const up = await vis('#editModal')
const p = await outsidePoint('#editModal')
await shot(page, 'w2-11-ball-editor-open')
await page.mouse.click(p.x, p.y); await sleep(400)
const out = !(await vis('#editModal'))
L.ok('8 ball editor: a press OUTSIDE closes it', up && out, `opened ${up}; pressed (${p.x},${p.y}) on ${p.hit}; ${out ? 'closed' : 'STILL OPEN'}`)
if (!out) { await page.keyboard.press('Escape'); await sleep(300) }
await dbl(); const up2 = await vis('#editModal')
await page.keyboard.press('Escape'); await sleep(400)
L.ok('8 ball editor: Escape closes it', up2 && !(await vis('#editModal')), `opened ${up2}; Escape → ${(await vis('#editModal')) ? 'STILL OPEN' : 'closed'}`)

/* 9. the question box on top of the ball editor */
await dbl()
await page.click('#edDelete'); await sleep(350)
const qText = (await page.locator('#dlgMsg').innerText().catch(() => '')).replace(/\s+/g, ' ')
await shot(page, 'w2-11-question-over-editor')
await page.keyboard.press('Escape'); await sleep(400)
L.ok('9.1 Escape on the question answers NO and closes ONLY the question — the editor stays open, the ball stays', !(await vis('#dlgModal')) && (await vis('#editModal')) && !!(await wedges(page, 'ACG-04')), JSON.stringify({ q: qText, question: await vis('#dlgModal'), editor: await vis('#editModal'), ball: !!(await wedges(page, 'ACG-04')) }))
await page.click('#edDelete'); await sleep(350)
const pq = await outsidePoint('#dlgModal')
await page.mouse.click(pq.x, pq.y); await sleep(450)
const after = { question: (await vis('#dlgModal')) ? 'still open' : 'closed', editor: (await vis('#editModal')) ? 'still open' : 'closed', ball: (await wedges(page, 'ACG-04')) ? 'still there' : 'DELETED' }
L.note('9.2 a press OUTSIDE the question box (on ' + pq.hit + ')', JSON.stringify(after))
L.ok('9.2a …answers NO: nothing deleted', after.ball === 'still there' && after.question === 'closed', JSON.stringify(after))
await shot(page, 'w2-11-after-outside-question')
if (await vis('#dlgModal')) { await page.keyboard.press('Escape'); await sleep(300) }
if (await vis('#editModal')) { await page.keyboard.press('Escape'); await sleep(300) }
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(450)

/* 10. a question box on its own — a press outside it */
const chipX = page.locator('.c-students .chip', { hasText: 'STUDENT B' }).locator('[data-rm]')
await chipX.scrollIntoViewIfNeeded(); await chipX.click(); await sleep(350)
const q2 = (await page.locator('#dlgMsg').innerText().catch(() => '')).replace(/\s+/g, ' ')
const pq2 = await outsidePoint('#dlgModal')
await page.mouse.click(pq2.x, pq2.y); await sleep(450)
const a2 = { question: (await vis('#dlgModal')) ? 'still open' : 'closed', studentB: (await page.locator('.c-students .chip', { hasText: 'STUDENT B' }).count()) ? 'still on the course' : 'REMOVED' }
L.note('10. "' + q2 + '" — a press outside it (on ' + pq2.hit + ')', JSON.stringify(a2))
L.ok('10a …answers NO: STUDENT B stays', a2.studentB === 'still on the course' && a2.question === 'closed', JSON.stringify(a2))

save('w2-09d-editor-question', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
