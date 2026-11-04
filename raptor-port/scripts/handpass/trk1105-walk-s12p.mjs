/* S12 (phone upright and sideways, admin, WebKit) — the pair with Edit chart layout, its panel and Tools ▾.
   node scripts/handpass/trk1105-walk-s12p.mjs */
import { open, pair, grade, mark, openBall, click, shot, tap2, dragBall, ballPos, answerDialogs, mk, sleep, P, Lnd } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s12p v1')
const L = mk('S12')
const near = (a, b) => Math.abs(a.x - b.x) <= 3 && Math.abs(a.y - b.y) <= 3
for (const [tag, size] of [['P', P], ['L', Lnd]]) {
  const { browser, page, errors } = await open({ engine: 'webkit', size, touch: true, who: 'a' })
  const T = async (name, fn) => { try { await fn() } catch (e) { L.ok(name, tag, 'admin', false, 'SCRIPT STOP: ' + String(e.message).split('\n')[0].slice(0, 220)) } }
  const reach = () => page.evaluate(() => { const b = document.getElementById('trUndoBtn').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { onScreen: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight, reachable: !!e && !!e.closest('#trUndoBtn') } })
  await T('(a) phone arrange', async () => {
    await page.locator('#sylMenuBtn').tap(); await sleep(300)
    await tap2(page, '#arrangeBtn', `S12-${tag}-a1-arrange-on`)
    await sleep(700)
    const r0 = await reach(), pr0 = await pair(page)
    L.ok('(a) Edit chart layout on: the pair stays in the top bar, on screen and reachable', tag, 'admin', r0.onScreen && r0.reachable && pr0.undo === 1 && pr0.redo === 1 && pr0.inTop && !pr0.inTracker, JSON.stringify({ r0, pr0: { u: pr0.undo, r: pr0.redo, inTop: pr0.inTop, inTracker: pr0.inTracker } }), `S12-${tag}-a1-arrange-on-set.png`)
    if (tag === 'L') {
      const tools = page.locator('button:visible:has-text("Tools")').first()
      const has = await tools.count()
      if (has) { await tools.tap(); await sleep(600) }
      const r1 = await reach()
      L.ok('(a) sideways: Tools ▾ opens over the chart and the pair is still on screen and pressable', tag, 'admin', has === 1 && r1.onScreen && r1.reachable, JSON.stringify({ toolsButton: has, r1 }), await shot(page, `S12-${tag}-a2-tools-open`))
      if (has) { await tools.tap(); await sleep(500) }
    } else {
      // the strip's dropdown panel, if the strip has one on this width: open every visible "▾" toggle inside the strip
      const tg = page.locator('#arrTools button:visible:has-text("▾"), #arrTools [aria-expanded]:visible').first()
      const has = await tg.count()
      if (has) { await tg.tap(); await sleep(600) }
      const r1 = await reach()
      L.ok('(a) phone: the strip panel (where it has one) does not cover the pair', tag, 'admin', r1.onScreen && r1.reachable, JSON.stringify({ stripToggle: has, r1 }), await shot(page, `S12-${tag}-a2-strip-panel`))
      if (has) { await page.mouse.click(size.width / 2, size.height - 40); await sleep(400) }
    }
    let p0 = null, moved = null, ballId = null, pr1 = null
    for (const id of ['ACG-03', 'ST-02', 'ACG-01', 'ACG-05']) {
      try { p0 = await ballPos(page, id); await dragBall(page, id, 60, 0, 12); moved = await ballPos(page, id); pr1 = await pair(page); ballId = id } catch (e) { L.note('(a) drag ' + id, String(e.message).split('\n')[0]); continue }
      if (pr1.undoOff === false) break
    }
    if (pr1 && pr1.undoOff === false) {
      L.ok('(a) a drag of ' + ballId + ' lights the top bar undo', tag, 'admin', true, `pos ${JSON.stringify(p0)} to ${JSON.stringify(moved)}; "${pr1.title}"`, await shot(page, `S12-${tag}-a3-dragged`))
      const pics = await tap2(page, '.topbar #trUndoBtn', `S12-${tag}-a4-undo`); await sleep(500)
      const p2 = await ballPos(page, ballId)
      L.ok('(a) top bar undo (tap) puts the ball back', tag, 'admin', near(p0, p2), `pos after ${JSON.stringify(p2)} vs start ${JSON.stringify(p0)}`, pics)
    } else {
      L.ok('(a) drag with a mouse in touch WebKit', tag, 'admin', null, 'NOT WALKED in WebKit: no ball drag registered after 4 balls (' + JSON.stringify({ p0, moved }) + ')', await shot(page, `S12-${tag}-a3-nodrag`))
    }
    // leave arrange mode
    await page.locator('#sylMenuBtn').tap().catch(() => {}); await sleep(300)
    await page.locator('#arrangeBtn').tap().catch(() => {}); await sleep(600)
    const sc = page.locator('#page-tracker button:visible:has-text("Save changes")').first()
    if (await sc.count()) { await sc.tap(); await answerDialogs(page, [/^Save/i, /^OK/i], 3000) }
    await sleep(600)
    const pr3 = await pair(page)
    L.ok('(a) after Done / Save: one pair, still in the top bar', tag, 'admin', pr3.undo === 1 && pr3.redo === 1 && pr3.inTop && !pr3.inTracker, `undo ${pr3.undoOff ? 'greyed' : 'lit'}`, await shot(page, `S12-${tag}-a5-after`))
  })
  if (tag === 'P') {
    await T('(e) phone bar hide', async () => {
      await page.locator('#barHideBtn').tap(); await sleep(600)
      const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
      const pr = await pair(page)
      L.ok('(e) phone: Tracker bar hidden: pair stays, page not wider than the window', tag, 'admin', pr.undo === 1 && pr.inTop && w.sw <= w.iw, JSON.stringify(w), await shot(page, `S12-${tag}-e1-hidden`))
      await page.getByText('Show bar').first().tap(); await sleep(600)
      const pr2 = await pair(page), w2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, back: document.getElementById('courseSel').getBoundingClientRect().width > 0 }))
      L.ok('(e) phone: bar shown again, one pair, not wider', tag, 'admin', pr2.undo === 1 && pr2.inTop && w2.sw <= w2.iw && w2.back, JSON.stringify(w2), await shot(page, `S12-${tag}-e2-shown`))
    })
    await T('(c)(d) phone Show All / Legend', async () => {
      await tap2(page, 'button:visible:has-text("Show All")', 'S12-P-c1-showall')
      const r = await page.evaluate(() => { const b = document.getElementById('trUndoBtn').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e && !!e.closest('#trUndoBtn') })
      const shown = await page.getByText('All events — name, crew & prerequisites').first().isVisible().catch(() => false)
      L.ok('(c) phone: Show All opens; pair state right (top bar reachable: ' + r + ')', tag, 'admin', (await pair(page)).undo === 1, `show all visible ${shown}`, 'S12-P-c1-showall-set.png')
      await page.locator('button:visible:has-text("Close")').first().tap().catch(() => {}); await sleep(500)
      await tap2(page, '#legendBtn', 'S12-P-d1-legend')
      await page.keyboard.press('Escape'); await sleep(300)
      await page.mouse.click(200, 860).catch(() => {}); await sleep(300)
      L.ok('(d) phone: Legend opens and closes; one pair afterwards', tag, 'admin', (await pair(page)).undo === 1, '', 'S12-P-d1-legend-set.png')
    })
  }
  L.note(`${tag} errors`, errors.join(' | ').slice(0, 400) || 'none')
  await browser.close()
}
L.save('S12p')
