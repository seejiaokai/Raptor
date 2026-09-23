/* [HUMAN-RETEST] Tracker — re-walk, round three, C: the SURFACE fixes on the
   rebuilt preview (23 Sep 26) — a finger on a phone, a phone on its side, and
   the laptop widths where the bar used to wrap.

   w3-F1  the details bubble goes with its chart: the Info half, another page
   w3-F2  a turn made on the Info half re-fits the chart when Flow comes back
   w3-F3  a phone on its side: the grading pop-up stays on screen, DCO reachable
   w3-F5  1200 / 1250 px: the first chart edit does not wrap the bar
   w3-F6  a phone: ✓ Save changes is the far-right item of its row */
import { open, shot, save, log, reveal, toPage, toTracker, DESK } from './trk-lib.mjs'
import { sleep, ball, box, bubble, tapBall } from './trk-w3-lib.mjs'
import { menu, arrangeOn, arrangeOff, addBall, saveLit } from './trk-w1-lib.mjs'

const L = log()
const P = { width: 390, height: 844 }, LS = { width: 844, height: 390 }
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const zoom = page => page.evaluate(() => ({ chart: document.getElementById('fzPct').textContent, sw: document.getElementById('board').scrollWidth, cw: document.getElementById('board').clientWidth }))

/* ================= a phone, by finger ================= */
{
  const { browser, page, errors } = await open({ size: P, who: 'a', touch: true })
  /* w3-F1 */
  await tapSel(page, '#detailsBtn')
  await tapBall(page, 'ST-01', { touch: true })
  const b0 = await bubble(page)
  await tapSel(page, '#viewtabs [data-view="info"]')
  const b1 = await bubble(page)
  await shot(page, 'r3-c1-phone-info-no-bubble')
  L.ok('w3-F1: the bubble goes when the phone switches to Info', b0.shown && !b1.shown, `before ${JSON.stringify(b0)} after ${JSON.stringify(b1)}`)
  await tapSel(page, '#viewtabs [data-view="flow"]')
  await tapBall(page, 'ACG-01', { touch: true })
  const b2 = await bubble(page)
  await toPage(page, 'leavewar')
  const b3 = await bubble(page)
  await shot(page, 'r3-c1-leavewar-no-bubble')
  L.ok('w3-F1: …and when another page is opened', b2.shown && !b3.shown, `before ${JSON.stringify(b2)} after ${JSON.stringify(b3)}`)
  await toTracker(page)
  await tapSel(page, '#detailsBtn')                         /* Details mode off */

  /* w3-F2: control on Flow, then the case on Info */
  const zp = await zoom(page)
  await page.setViewportSize(LS); await sleep(800)
  const zl = await zoom(page)
  await page.setViewportSize(P); await sleep(800)
  await tapSel(page, '#viewtabs [data-view="info"]')
  await page.setViewportSize(LS); await sleep(800)
  await tapSel(page, '#viewtabs [data-view="flow"]'); await sleep(400)
  const zSide = await zoom(page)
  await tapSel(page, '#viewtabs [data-view="info"]')
  await page.setViewportSize(P); await sleep(800)
  await tapSel(page, '#viewtabs [data-view="flow"]'); await sleep(400)
  const zUp = await zoom(page)
  await shot(page, 'r3-c2-upright-after-info-turn')
  L.ok('w3-F2: turned sideways on Info, then Flow — the chart takes the sideways fit', zSide.chart === zl.chart, `sideways fit ${zl.chart}; got ${JSON.stringify(zSide)}`)
  L.ok('w3-F2: turned upright on Info, then Flow — the chart fits the width again (no sideways wander)', zUp.chart === zp.chart && zUp.sw <= zUp.cw + 2, `upright fit ${zp.chart}; got ${JSON.stringify(zUp)}`)

  /* w3-F6: the phone's save corner after a chart edit */
  await arrangeOn(page); await addBall(page, '+ Acad', 'PHONE-R3'); await sleep(300); await arrangeOff(page)
  const corner = await page.evaluate(() => {
    const s = document.getElementById('saveChanges'); if (!s) return null
    const r = s.getBoundingClientRect()
    const row = [...document.querySelectorAll('#page-tracker header *')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0 && Math.abs((q.top + q.bottom) / 2 - (r.top + r.bottom) / 2) < q.height / 2 && e.children.length === 0 })
    const right = Math.max(...row.map(e => e.getBoundingClientRect().right))
    return { saveRight: Math.round(r.right), rowRight: Math.round(right), w: innerWidth }
  })
  await shot(page, 'r3-c3-phone-save-corner')
  L.ok('w3-F6: ✓ Save changes is the far-right item of its row on a phone', corner && corner.saveRight >= corner.rowRight - 1, JSON.stringify(corner))
  if (await saveLit(page)) { await page.click('#saveChanges'); await sleep(500) }
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ================= a phone on its side (w3-F3) ================= */
{
  const { browser, page, errors } = await open({ size: LS, who: 'a', touch: true })
  await reveal(page, 'ST-01')
  const bb = await ball(page, 'ST-01').boundingBox()
  await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(600)
  const pop = await box(page, '#pop')
  const dco = page.locator('#pop button', { hasText: /^\s*DCO\s*$/ }).first()
  await dco.scrollIntoViewIfNeeded(); const d = await dco.boundingBox()
  await shot(page, 'r3-c4-landscape-pop-on-screen')
  L.ok('w3-F3: the pop-up opens on the screen (not above its top)', pop && pop.y >= 0 && pop.b <= LS.height, JSON.stringify(pop))
  L.ok('w3-F3: DCO is reachable', !!d && d.y >= 0 && d.y + d.height <= LS.height, JSON.stringify(d))
  if (d) { await page.touchscreen.tap(d.x + d.width / 2, d.y + d.height / 2); await sleep(500) }
  const graded = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-01'); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null })
  L.ok('w3-F3: …and a tap on it grades', (graded || []).includes('#000000'), JSON.stringify(graded))
  const zc = await box(page, '#flowZoomCtl')
  L.ok('w3-F3: the chart zoom control is on the screen at 844×390', !!zc && zc.b <= LS.height, JSON.stringify(zc) + ' — screen height ' + LS.height)
  await shot(page, 'r3-c4-landscape-after-dco')
  L.note('landscape errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ================= laptop widths (w3-F5) ================= */
for (const W of [1200, 1250, 1440]) {
  const { browser, page, errors } = await open({ size: { width: W, height: 800 }, who: 'a' })
  const bar = () => page.evaluate(() => { const h = document.querySelector('#page-tracker header'); const b = document.getElementById('board'); return { barH: Math.round(h.getBoundingClientRect().height), boardTop: Math.round(b.getBoundingClientRect().top) } })
  await arrangeOn(page)
  const b0 = await bar()
  await addBall(page, '+ Test', 'LAP-' + W); await sleep(400)
  const b1 = await bar()
  await arrangeOff(page); await sleep(300)
  const b2 = await bar()
  const pos = await page.evaluate(() => { const s = document.getElementById('saveChanges'), h = document.querySelector('#page-tracker header'); if (!s) return null; const r = s.getBoundingClientRect(), hr = h.getBoundingClientRect(); return { saveRight: Math.round(r.right), barRight: Math.round(hr.right), saveTop: Math.round(r.top), barTop: Math.round(hr.top) } })
  await shot(page, 'r3-c5-bar-' + W)
  L.ok(`w3-F5 at ${W}px: the first edit does not grow the bar or move the chart`, b0.barH === b1.barH && b0.boardTop === b1.boardTop, `${JSON.stringify(b0)} → ${JSON.stringify(b1)}`)
  L.ok(`w3-F5 at ${W}px: Done editing does not grow it either`, b2.barH === b0.barH, `${JSON.stringify(b2)}`)
  L.ok(`w3-F5 at ${W}px: Save sits in the far-right corner of the one row`, pos && pos.barRight - pos.saveRight < 24 && Math.abs(pos.saveTop - pos.barTop) < 30, JSON.stringify(pos))
  if (await saveLit(page)) { await page.click('#saveChanges'); await sleep(400) }
  L.note(`${W}px errors`, errors.join(' | ') || 'none')
  await browser.close()
}

save('r3-c-surfaces', { rows: L.rows })
