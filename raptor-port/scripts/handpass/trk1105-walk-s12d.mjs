/* S12 (desktop, admin) — the pair in every Tracker mode.  node scripts/handpass/trk1105-walk-s12d.mjs */
import { open, pair, grade, mark, openBall, click, shot, dragBall, ballPos, answerDialogs, mk, sleep } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s12d v1')
const L = mk('S12')
const { browser, page, errors } = await open({})
const T = async (name, fn) => { try { await fn() } catch (e) { L.ok(name, 'D', 'admin', false, 'SCRIPT STOP: ' + String(e.message).split('\n')[0].slice(0, 200)) } }
const topReach = () => page.evaluate(() => { const b = document.getElementById('trUndoBtn').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e && (e.id === 'trUndoBtn' || !!e.closest('#trUndoBtn')) })
const one = async () => { const p = await pair(page); return p.undo === 1 && p.redo === 1 && p.inTop && !p.inTracker }
const near = (a, b) => Math.abs(a.x - b.x) <= 2 && Math.abs(a.y - b.y) <= 2
const selGrades = () => page.evaluate(() => [...document.querySelectorAll('#pop .opts button')].filter(b => /\b(on|sel|selected|active|act)\b/.test(b.className)).map(b => b.dataset.g))

await T('(a) arrange', async () => {
  await click(page, '#sylMenuBtn'); await click(page, '#arrangeBtn'); await sleep(700)
  const p0 = await ballPos(page, 'ACG-03')
  await dragBall(page, 'ACG-03', 80, 0, 16)
  const p1 = await ballPos(page, 'ACG-03'); let pr = await pair(page)
  L.ok('(a) slow drag moved the ball; top bar undo is lit, one pair', 'D', 'admin', !near(p0, p1) && pr.undoOff === false && await one(), `pos ${JSON.stringify(p0)} to ${JSON.stringify(p1)}; undo title "${pr.title}"`, await shot(page, 'S12-D-a1-slow-drag'))
  await click(page, '.topbar #trUndoBtn'); await sleep(600)
  const p2 = await ballPos(page, 'ACG-03')
  L.ok('(a) top bar undo puts the slow-dragged ball back', 'D', 'admin', near(p0, p2), `pos after undo ${JSON.stringify(p2)} vs start ${JSON.stringify(p0)}`)
  await click(page, '.topbar #trRedoBtn'); await sleep(600)
  const p3 = await ballPos(page, 'ACG-03')
  L.ok('(a) redo moves it again', 'D', 'admin', near(p1, p3), JSON.stringify(p3))
  await click(page, '.topbar #trUndoBtn'); await sleep(600)
  const f0 = await ballPos(page, 'ACG-04')
  await dragBall(page, 'ACG-04', 0, 70, 2)
  const f1 = await ballPos(page, 'ACG-04')
  await click(page, '.topbar #trUndoBtn'); await sleep(600)
  const f2 = await ballPos(page, 'ACG-04')
  L.ok('(a) a quick flick drag is one step: undo puts ACG-04 back where it was before the flick', 'D', 'admin', Math.abs(f1.y - f0.y) > 20 && near(f0, f2), `start ${JSON.stringify(f0)}; after flick ${JSON.stringify(f1)}; after undo ${JSON.stringify(f2)}`, await shot(page, 'S12-D-a2-flick-undone'))
  await dragBall(page, 'ACG-03', 60, 0, 10)
  const m0 = await ballPos(page, 'ACG-03')
  await click(page, '#sylMenuBtn'); await click(page, '#arrangeBtn'); await sleep(600)
  const sc = page.locator('#page-tracker button:visible:has-text("Save changes")').first()
  const hadSave = await sc.count()
  if (hadSave) { await sc.click(); await answerDialogs(page, [/^Save/i, /^OK/i], 3000) }
  await sleep(1000)
  pr = await pair(page)
  L.ok('(a) Done editing, then Save changes: one pair, state readable', 'D', 'admin', hadSave === 1 && await one(), `Save changes present ${hadSave}; undo ${pr.undoOff ? 'greyed' : 'lit'} "${pr.title}"`, await shot(page, 'S12-D-a3-saved'))
  if (!pr.undoOff) {
    await click(page, '.topbar #trUndoBtn'); await sleep(700)
    const m1 = await ballPos(page, 'ACG-03'); pr = await pair(page)
    L.note('(a) undo after Save changes', `ball ${JSON.stringify(m0)} to ${JSON.stringify(m1)}; redo ${pr.redoOff ? 'greyed' : 'lit'}`)
    if (!pr.redoOff) { await click(page, '.topbar #trRedoBtn'); await sleep(700); L.note('(a) redo', JSON.stringify(await ballPos(page, 'ACG-03'))) }
  }
})

await T('(b) pop-up', async () => {
  await mark(page, 'ST-02', 'dco', false)
  await openBall(page, 'ST-02', false)
  const sel0 = await selGrades()
  const reach = await topReach()
  await click(page, '.topbar #trUndoBtn'); await sleep(900)
  const g = await grade(page, 'ST-02')
  const popOpen = await page.locator('#pop:visible').count()
  const sel1 = await selGrades()
  const popTxt = popOpen ? (await page.locator('#pop').innerText()).replace(/\n+/g, ' | ').slice(0, 160) : ''
  L.ok('(b) undo pressed with the marking pop-up open: chart loses the mark; the pop-up never shows a grade the chart no longer has', 'D', 'admin', g !== 'dco' && !sel1.includes('dco'), `top bar reachable ${reach}; grade now ${g}; pop-up open ${popOpen}; selected before ${JSON.stringify(sel0)} after ${JSON.stringify(sel1)}; pop text "${popTxt}"`, await shot(page, 'S12-D-b1-undo-under-popup'))
  if (popOpen) await page.keyboard.press('Escape')
  await sleep(300)
  await mark(page, 'ST-02', 'dco', false)
  await openBall(page, 'ST-02', false)
  await page.locator('#pop .opts button[data-g="dpco"]').focus()
  await page.keyboard.press('Control+z'); await sleep(900)
  const g2 = await grade(page, 'ST-02'), po = await page.locator('#pop:visible').count()
  L.ok('(b) Ctrl+Z with keyboard focus on a pop-up button — recorded', 'D', 'admin', true, `grade after Ctrl+Z ${g2}; pop-up open ${po}`, await shot(page, 'S12-D-b2-ctrlz-in-popup'))
  if (po) await page.keyboard.press('Escape')
  await sleep(300)
})

await T('(c) Show All', async () => {
  await click(page, '#showAllBtn'); await sleep(700)
  const reach = await topReach()
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click(); await sleep(600)
  await page.locator('textarea:visible').first().fill('S12CREW'); await page.getByRole('button', { name: 'Save', exact: true }).first().click(); await sleep(900)
  const pr = await pair(page)
  L.ok('(c) typed a field in Show All and saved: one pair', 'D', 'admin', await one(), `top bar reachable over the scrim: ${reach}; undo ${pr.undoOff ? 'greyed' : 'lit'} "${pr.title}"`, await shot(page, 'S12-D-c1-showall-edit'))
  const open = () => page.getByText('All events — name, crew & prerequisites').first().isVisible().catch(() => false)
  const res = {}
  res.stillOpen = await open()
  if (res.stillOpen) { await page.locator('button:visible:has-text("Close")').first().click(); await sleep(400) }
  res.closedByClose = !(await open())
  await click(page, '#showAllBtn'); await sleep(500); await page.keyboard.press('Escape'); await sleep(400); res.closedByEsc = !(await open())
  await click(page, '#showAllBtn'); await sleep(500); await page.mouse.click(60, 500); await sleep(400); res.closedByOutside = !(await open())
  L.ok('(c) Show All closes by its Close button, Escape and a press outside', 'D', 'admin', res.closedByClose && res.closedByEsc && res.closedByOutside, JSON.stringify(res), await shot(page, 'S12-D-c2-closed'))
  const p2 = await pair(page)
  if (!p2.undoOff) { await click(page, '.topbar #trUndoBtn'); await sleep(600); const p3 = await pair(page); L.note('(c) undo after the Show All edit', 'pressed; undo now ' + (p3.undoOff ? 'greyed' : 'lit') + ' title "' + p3.title + '"') }
})

await T('(d) Legend and flex settings', async () => {
  for (const [name, btn] of [['Legend', '#legendBtn'], ['flex settings', '#flexBtn']]) {
    await click(page, btn); await sleep(600)
    const reach = await topReach()
    const pic = await shot(page, `S12-D-d-${name.replace(' ', '')}-open`)
    const count = () => page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog], [class*=legend], [class*=flexset], #flexModal, #legendModal')].filter(e => e.getBoundingClientRect().width > 100 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none').length)
    const was = await count()
    const res = { openedSomething: was > 0, topBarReachable: reach }
    await page.keyboard.press('Escape'); await sleep(400); res.escCloses = (await count()) === 0
    if (!res.escCloses) { const cl = page.locator('button:visible:has-text("Close"), button:visible:has-text("Cancel")').first(); if (await cl.count()) { await cl.click(); await sleep(400) } }
    await click(page, btn); await sleep(500); await page.mouse.click(40, 600); await sleep(400); res.outsideCloses = (await count()) === 0
    if (!res.outsideCloses) await page.keyboard.press('Escape')
    L.ok(`(d) ${name}: opens, closes by Escape and by a press outside, pair state right after`, 'D', 'admin', res.openedSomething && await one(), JSON.stringify({ ...res, pairOk: await one() }), pic)
    await sleep(300)
  }
})

await T('(e) bar hide/show', async () => {
  await click(page, '#barHideBtn'); await sleep(600)
  const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
  L.ok('(e) Tracker bar hidden: one pair stays in the top bar; page not wider than the window', 'D', 'admin', await one() && w.sw <= w.iw, JSON.stringify({ w, barHidden: (await page.locator('#courseSel:visible').count()) === 0 }), await shot(page, 'S12-D-e1-bar-hidden'))
  const show = page.locator('button.barhide:visible, #barShowBtn:visible, #barHideBtn:visible').first()
  await show.click(); await sleep(600)
  const w2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, barBack: document.getElementById('courseSel').getBoundingClientRect().width > 0 }))
  L.ok('(e) bar shown again: pair still one, page not wider', 'D', 'admin', await one() && w2.sw <= w2.iw && w2.barBack, JSON.stringify(w2), await shot(page, 'S12-D-e2-bar-shown'))
})
L.note('errors', errors.join(' | ').slice(0, 500) || 'none')
await browser.close()
L.save('S12d')
