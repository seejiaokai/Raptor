// W3 group D - scenarios 7 (panel for a dragged block), 9 (phone veil), 10 (desktop Escape). Fresh worlds per scenario.
import { newWorld, rec } from './lib.mjs'
const which = process.argv[2] || 'desktop'
console.log(`w3 groupD VERSION 1 - ${which}`)
const P = which === 'phone' ? 'p' : 'd'
const sheetText = page => page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no .bidsheet up)' })
const selText = page => page.evaluate(() => { const s = document.querySelector('[data-testid="select-sheet"]'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no select-sheet up)' })

// ===================== S7
{
  const w = await newWorld(which, { tag: 'D-s7' }); const { page } = w
  try {
    console.log('\n== S7')
    await w.login(); await w.toLeaveWar()
    const a = '[data-testid="cell-slipway-2026-07-14"]', b = '[data-testid="cell-slipway-2026-07-16"]'
    await page.locator(a).first().scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
    const bbA = await page.locator(a).first().boundingBox(), bbB = await page.locator(b).first().boundingBox()
    console.log('  cell boxes', JSON.stringify(bbA), JSON.stringify(bbB))
    let attempt = 0, opened = false, how = ''
    while (attempt < 3 && !opened) {
      attempt++
      const A = await page.locator(a).first().boundingBox(), B = await page.locator(b).first().boundingBox()
      if (!w.TOUCH) {
        how = 'mouse: press on 14 Jul, move 8px to arm, drag to 16 Jul, release'
        await page.mouse.move(A.x + A.width / 2, A.y + A.height / 2); await page.mouse.down()
        await page.mouse.move(A.x + A.width / 2 + 8, A.y + A.height / 2)
        await page.mouse.move(B.x + B.width / 2, B.y + B.height / 2, { steps: 6 }); await page.mouse.up()
      } else {
        how = 'touch (DevTools finger): hold 320ms on 14 Jul, drag to 16 Jul, rest 90ms, lift'
        const cdp = await w.ctx.newCDPSession(page)
        const x0 = A.x + A.width / 2, y0 = A.y + A.height / 2, x1 = B.x + B.width / 2, y1 = B.y + B.height / 2
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
        await page.waitForTimeout(320)
        for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 8, y: y0 + (y1 - y0) * i / 8 }] })
        await page.waitForTimeout(90)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(400)
      opened = await page.locator('[data-testid="select-sheet"]').count() > 0
      console.log(`  attempt ${attempt}: select-sheet open = ${opened}`)
    }
    if (!opened) { await w.shot(`s7-${P}-drag-failed`); rec(w, '7', 'NOT WALKED', `the drag did not open the panel after 3 tries (${how})`, `s7-${P}-drag-failed.png`) }
    else {
      console.log('  panel:', await selText(page))
      await w.shot(`s7-${P}-panel-open`)
      await w.press('[data-testid="sel-postout"]')
      console.log('  after PO:', await selText(page))
      const fit = await w.boxFits('[data-testid="sel-po-date"]', '[data-testid="select-sheet"]', 'panel PO from')
      const read0 = await w.text('[data-testid="sel-po-date"]'), val0 = await w.val('[data-testid="sel-po-date"]')
      await w.press('[data-testid="sel-po-date"]')
      const c = await w.cardOnTop('S7 panel PO from')
      await w.shot(`s7-${P}-panel-po-calendar-open`)
      await w.pickDay('2026-07-22')
      const up = await page.locator('[data-testid="select-sheet"]').count() > 0
      const read1 = up ? await w.text('[data-testid="sel-po-date"]') : '(panel gone)', val1 = up ? await w.val('[data-testid="sel-po-date"]') : ''
      await w.shot(`s7-${P}-panel-po-picked`)
      const t = up ? await selText(page) : ''
      rec(w, '7', c.ok && fit.ok && up && val1 === '2026-07-22' ? 'PASS' : 'FAIL', `${how}. Panel PO from box read "${read0}" (${val0}); box inside panel ${fit.ok}; calendar on top ${c.ok}; after the tap panel still up=${up}, box reads "${read1}" (${val1}); panel text: "${t.slice(-240)}"`, `s7-${P}-panel-po-calendar-open.png, s7-${P}-panel-po-picked.png`)
    }
  } catch (e) { console.log('ERR S7', String(e).slice(0, 500)); await w.shot(`D-S7-ERR-${P}`).catch(() => {}); rec(w, '7', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}

// ===================== S9 (phone only) and S10 (desktop only)
{
  const w = await newWorld(which, { tag: 'D-s9s10' }); const { page } = w
  try {
    await w.login(); await w.toLeaveWar()
    await w.tapCell('slipway', '2026-07-14')
    await w.press('[data-testid="bid-postout"]')
    const boxVal0 = await w.val('[data-testid="po-date"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('S9/10 PO from')
    if (w.TOUCH) {
      console.log('\n== S9 (phone)')
      await page.touchscreen.tap(3, 3); await page.waitForTimeout(500)
      const cardGone = await page.locator('[data-testid="dcal-card"]').count() === 0
      const sheetUp = await page.locator('.bidsheet').count() > 0, v1 = await w.val('[data-testid="po-date"]').catch(() => '(box gone)')
      await w.shot('s9-p-after-veil-tap')
      // open again and tap a date
      await w.press('[data-testid="po-date"]'); await w.cardOnTop('S9 PO from again')
      await w.pickDay('2026-07-21')
      const sheetUp2 = await page.locator('.bidsheet').count() > 0, v2 = await w.val('[data-testid="po-date"]').catch(() => '(box gone)')
      await w.shot('s9-p-after-date-tap')
      // tap the grid behind the sheet: pick a visible cell of another man above the sheet
      const sheetTop = await page.evaluate(() => document.querySelector('.bidsheet').getBoundingClientRect().top)
      const spot = await page.evaluate(top => {
        const cells = [...document.querySelectorAll('[data-testid^="cell-"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 10 && r.height > 10 && r.bottom < top - 8 && r.top > 70 && r.left > 150 && r.right < innerWidth - 4 })
        const e = cells[Math.floor(cells.length / 2)]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), id: e.getAttribute('data-testid') }
      }, sheetTop)
      console.log('  grid spot to tap behind the sheet:', JSON.stringify(spot), 'sheetTop', sheetTop)
      let third = 'no visible grid cell above the sheet to tap'
      if (spot) {
        await page.touchscreen.tap(spot.x, spot.y); await page.waitForTimeout(600)
        const sheetCount = await page.locator('.bidsheet').count(), picker = await page.locator('[data-testid="bid-picker"]').count()
        third = `tapped ${spot.id} at (${spot.x},${spot.y}) above the sheet: .bidsheet count ${sheetCount}, bid-picker count ${picker}; any sheet text now: "${(await sheetText(page)).slice(0, 120)}"`
        await w.shot('s9-p-after-grid-tap')
      }
      const ok = cardGone && sheetUp && v1 === boxVal0 && sheetUp2 && v2 === '2026-07-21'
      rec(w, '9', ok ? 'PASS' : 'FAIL', `tap on the dimmed area: calendar gone=${cardGone}, sheet still up=${sheetUp}, box "${v1}" (was ${boxVal0}); reopened and tapped 21 Jul: sheet still up=${sheetUp2}, box ${v2}; tap on the grid behind the sheet: ${third}`, 's9-p-after-veil-tap.png, s9-p-after-date-tap.png, s9-p-after-grid-tap.png')
    } else {
      console.log('\n== S10 (desktop)')
      await page.keyboard.press('Escape'); await page.waitForTimeout(500)
      const cardGone = await page.locator('[data-testid="dcal-card"]').count() === 0
      const sheetUp = await page.locator('.bidsheet').count() > 0, v1 = sheetUp ? await w.val('[data-testid="po-date"]') : '(sheet gone)'
      await w.shot('s10-d-after-first-escape')
      await page.keyboard.press('Escape'); await page.waitForTimeout(500)
      const sheetUp2 = await page.locator('.bidsheet').count() > 0
      await w.shot('s10-d-after-second-escape')
      rec(w, '10', cardGone && sheetUp && !sheetUp2 && v1 === boxVal0 ? 'PASS' : 'FAIL', `first Escape: calendar gone=${cardGone}, sheet still up=${sheetUp}, box "${v1}" (was ${boxVal0}); second Escape: sheet up=${sheetUp2}`, 's10-d-after-first-escape.png, s10-d-after-second-escape.png')
    }
  } catch (e) { console.log('ERR S9/10', String(e).slice(0, 500)); await w.shot(`D-S9-ERR-${P}`).catch(() => {}); rec(w, w.TOUCH ? '9' : '10', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}
console.log('DONE')
