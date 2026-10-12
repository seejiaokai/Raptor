// E1: file "Range brief" (Training Wed 15 Jul 09:00-10:00, Ranger + Hex), cancel on the phone's board (CX, WX), read every surface.
import { world, sleep, DAY, DI, PHONE, PARTS, browser } from './or-E-lib.mjs'
import { writeFileSync } from 'node:fs'

const w = await world({ size: PHONE, touch: true })
const { page, press } = w
const T = 'Range brief'
try {
  await w.fileIt({ pick: ['Ranger', 'Hex'], title: T, from: '09:00', to: '10:00', rmk: 'Bring your kit', kind: 'Training', oil: 'no' })
  const r = await w.rec(T); w.say('E1 filed', JSON.stringify(r))
  const ri = await w.boardCx(r.iid, DI, { why: 'WX' })
  await w.say('E1 board closed? cx now', JSON.stringify(await w.recById(r.iid)))
  await w.shot('e1-01-board-after-cx')
  // stay on the board: read its Ground Programme row and Personal Inputs line
  await w.openBoard(DI)
  const row = page.locator(`#schedBoard [data-grcx="${DI}.${ri}"]:visible`).first()
  await row.scrollIntoViewIfNeeded(); await sleep(300); await w.quiet()
  await w.say('E1 board row', JSON.stringify(await row.evaluate(b => { const r = b.closest('.sb-arow') || b.parentElement; return { cls: r.className, text: r.innerText.replace(/\s+/g, ' ') } })))
  await w.shot('e1-02-board-ground-row-full')
  await w.clip('e1-02-board-ground-row', await row.evaluate(b => { const r = (b.closest('.sb-arow') || b.parentElement).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }), [50, 10, 50, 10])
  // Personal Inputs on the board: unfold
  const bfold = page.locator(`#schedBoard .pinp .pl-fold[data-pitog="${DI}"]:visible`).first()
  if (await bfold.count() && !(await page.locator('#schedBoard .pinp .sb-arow:visible').count())) { await bfold.scrollIntoViewIfNeeded(); await press(bfold); await sleep(300) }
  const bl = page.locator('#schedBoard .pinp .sb-arow.inprow:visible').filter({ hasText: T }).first()
  const blAny = page.locator('#schedBoard .pinp .sb-arow.inprow:visible').filter({ has: page.locator('.cxtag') }).first()
  const use = (await bl.count()) ? bl : blAny
  if (await use.count()) {
    await use.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400); await w.quiet()
    const f = await use.evaluate(e => { const nm = e.querySelector('.inp-cx'), tg = e.querySelector('.cxtag'), r = e.getBoundingClientRect(); const kids = [...e.children].map(c => { const cr = c.getBoundingClientRect(); return { cls: c.className, text: c.innerText.replace(/\s+/g, ' ').trim().slice(0, 40), top: Math.round(cr.top), h: Math.round(cr.height), cut: c.scrollWidth > c.clientWidth + 1 } }); return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.textContent.trim() + ' bg ' + getComputedStyle(tg).backgroundColor : null, name: nm ? nm.textContent : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, w: Math.round(r.width), h: Math.round(r.height), inScreen: r.left >= 0 && r.right <= innerWidth, over: e.scrollWidth > e.clientWidth + 1, kids, sameLine: tg && nm ? Math.abs(tg.getBoundingClientRect().top - nm.getBoundingClientRect().top) < 8 : null } })
    w.say('E1 board PI line', JSON.stringify(f)); w.res('e1_board_line', f)
    await w.shot('e1-03-board-inputs-line-full')
    await w.clip('e1-03-board-inputs-line', await use.boundingBox(), [60, 10, 50, 10])
  } else w.say('E1 board PI line', 'NOT FOUND')
  // neighbouring (non-cancelled) lines for comparison of heights
  w.say('E1 board all PI lines', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp .sb-arow.inprow')].filter(e => e.offsetParent).map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60), h: Math.round(e.getBoundingClientRect().height) })))))
  await w.closeBoard()

  // the week: Personal Inputs line and Ground Programme row
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor(); await sleep(400)
  const fold = page.locator(`#eWeek .sec-inp .pl-fold[data-pitog="${DI}"]`).first()
  if (await fold.count() && !(await page.locator('#eWeek .sec-inp .pl-row').count())) { await fold.scrollIntoViewIfNeeded(); await press(fold); await sleep(300) }
  const wl = page.locator('#eWeek .sec-inp .pl-row', { hasText: T }).first()
  if (await wl.count()) {
    await wl.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400); await w.quiet()
    const f = await wl.evaluate(e => { const nm = e.querySelector('.inp-cx'), tg = e.querySelector('.cxtag'), acc = e.querySelector('.accs, .accb, .accd'); return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.textContent.trim() + ' bg ' + getComputedStyle(tg).backgroundColor : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, name: nm ? nm.textContent : null, accText: acc ? acc.textContent : null, accStrike: acc ? getComputedStyle(acc).textDecorationLine : null, rowCls: e.className, accPseudo: [e, ...e.querySelectorAll('*')].map(x => getComputedStyle(x, '::after').content + '|' + getComputedStyle(x, '::before').content).filter(c => !/^none\|none$|^normal\|normal$/.test(c)).slice(0, 8), tagText: tg ? tg.innerText : null, cxwhyStrike: e.querySelector('.cxwhy') ? getComputedStyle(e.querySelector('.cxwhy')).textDecorationLine : null, h: Math.round(e.getBoundingClientRect().height), over: e.scrollWidth > e.clientWidth + 1 } })
    w.say('E1 week PI line', JSON.stringify(f)); w.res('e1_week_line', f)
    await w.shot('e1-04-week-inputs-line-full')
    await w.clip('e1-04-week-inputs-line', await wl.boundingBox(), [70, 14, 60, 14])
  } else w.say('E1 week PI line', 'NOT FOUND')
  const gr = page.locator('#eWeek .pl-row.cx.gr-frominput').first()
  if (await gr.count()) {
    await gr.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400); await w.quiet()
    w.say('E1 week ground row', JSON.stringify(await gr.evaluate(e => e.innerText.replace(/\s+/g, ' ').trim())))
    await w.clip('e1-05-week-ground-row', await gr.boundingBox(), [78, 14, 96, 14])
  }

  // Inputs: card, window, List, bar
  await w.toMonth(); await sleep(300); await w.quiet()
  const X = r.iid
  const barSel = `.ib-bar[data-iid="${X}"]`
  if (await page.locator(barSel).count()) {
    w.say('E1 bar', JSON.stringify(await page.evaluate(s => [...document.querySelectorAll(s)].map(e => ({ text: e.textContent, strike: getComputedStyle(e).textDecorationLine, opacity: getComputedStyle(e).opacity, tip: e.getAttribute('title'), pseudo: getComputedStyle(e, '::before').content })), barSel)))
    await w.shot('e1-06-month-full')
  } else w.say('E1 bar', 'behind "+N more" on a full day (Wed 15 Jul)')
  await w.openDay(DAY); await w.quiet()
  const cardSel = `[data-testid="win-inputsday"] .icard[data-popiid="${X}"]`
  await page.locator(cardSel).first().scrollIntoViewIfNeeded()
  const cf = await w.facts(cardSel); w.say('E1 card', JSON.stringify(cf)); w.res('e1_card', cf)
  await w.shot('e1-07-day-full')
  await w.clip('e1-07-card', await page.locator(cardSel).first().boundingBox(), [66, 12, 14, 12])
  // neighbours' heights
  w.say('E1 other cards heights', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].map(e => ({ iid: e.getAttribute('data-popiid'), h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 50) })))))
  // the day's "+N more" bars: is the bar behind more? record the cell text
  // window
  await press(page.locator(cardSel).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(400); await w.quiet()
  const wf = await page.evaluate(() => {
    const m = document.querySelector('[data-testid="inped-cx"]'); if (!m) return null
    const bar = m.closest('.win-bar, .airpop-head') || m.parentElement, r = m.getBoundingClientRect(), b = bar.getBoundingClientRect()
    const t = bar.querySelector('.win-ttl, #inpEditTitle'), x = bar.querySelector('.win-x, #inpEditClose')
    return { text: m.textContent.trim(), tag: getComputedStyle(m.querySelector('.icx')).backgroundColor, why: m.querySelector('.icx-why') ? getComputedStyle(m.querySelector('.icx-why')).color : null, title: t && t.textContent, inBar: r.left >= b.left && r.right <= b.right, controls: m.querySelectorAll('button,input').length, barH: Math.round(b.height) }
  })
  w.say('E1 window title bar', JSON.stringify(wf)); w.res('e1_window', wf)
  await w.shot('e1-08-window-full')
  { const bar = await page.locator('[data-testid="inped-cx"]').first().evaluateHandle(e => e.closest('.win-bar, .airpop-head') || e.parentElement); const bb = await bar.asElement().boundingBox(); await w.clip('e1-08-window-title', bb, [10, 10, 60, 10]) }
  { const x = page.locator('#inpEditClose:visible, [data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) await press(x); await sleep(300) }
  await w.closeDay()
  // List card
  await press(page.locator('#inListBtn')); await sleep(400)
  if (!(await page.locator('#inRangeAll').count())) await press(page.locator('#inRangeBtn'))
  await press(page.locator('#inRangeAll')); await sleep(400)
  const lc = page.locator(`.icard[data-iid="${X}"]`).first()
  if (await lc.count()) {
    await lc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await w.quiet()
    const lf = await w.facts(`.icard[data-iid="${X}"]`); w.say('E1 list card', JSON.stringify(lf)); w.res('e1_list', lf)
    await w.shot('e1-09-list-full')
    await w.clip('e1-09-list-card', await lc.boundingBox(), [70, 12, 70, 12])
    w.say('E1 list neighbours heights', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.icard[data-iid]')].slice(0, 12).map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 40) })))))
  } else w.say('E1 list card', 'NOT FOUND')
  await press(page.locator('#inCalBtn')); await sleep(200)
  w.say('E1 errors', JSON.stringify(w.errors))
  w.res('e1_errors', w.errors)
  await w.ctx.storageState({ path: `${PARTS}/or-E-state1.json` })
} catch (e) { w.say('E1 FAILED SCRIPT', String(e).slice(0, 600)); await w.shot('e1-zz-fail').catch(() => {}) }
await browser.close()
