// E3 + the Ranger-alone cancelled input: reload the E1 world (Range brief cancelled), as Saber file
//   "Solo drill" (Training, Ranger alone, Thu 16 Jul 10:00-11:00) and cancel it with WX;
//   a BARE input (no title) for Ranger + Hex on Fri 17 Jul 09:00-10:00 and cancel it with NO reason; read every surface of the bare one.
import { browser, PARTS, URL, sleep, mk, DI } from './or-E-lib.mjs'
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, storageState: `${PARTS}/or-E-state1.json` })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) }); page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
await page.clock.install({ time: new Date('2026-06-22T11:00:00') })
await page.goto(URL)
const w = mk(page, ctx, true, errors, 'E2'); const { press } = w
await w.signIn('ad', 'a')
try {
  w.say('start INPUTS', JSON.stringify(await page.evaluate(() => window.INPUTS.filter(r => r.cx).map(r => [r.title, r.cx, r.cxr]))))
  // Solo drill, Ranger alone
  await w.fileIt({ day: '2026-07-16', pick: ['Ranger'], title: 'Solo drill', from: '10:00', to: '11:00', kind: 'Training', oil: 'no' })
  const solo = await w.rec('Solo drill'); w.say('solo filed', JSON.stringify(solo))
  await w.boardCx(solo.iid, 3, { why: 'WX' }); await w.closeBoard()
  w.say('solo cancelled', JSON.stringify(await w.recById(solo.iid)))
  // the bare input
  const bareDay = '2026-07-17'
  await w.toMonth(); await w.openDay(bareDay)
  await press(page.locator('#icPopAdd')); await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
  await page.locator('#inpEditPop #inpEditType').selectOption('Training')
  await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
  for (const cs of ['Ranger', 'Hex']) { const id = await w.csId(cs); if (await page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${id}"]`)) }
  const keep = [await w.csId('Ranger'), await w.csId('Hex')]
  for (const id of await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))) if (!keep.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
  const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  w.say('picked', JSON.stringify(lit))
  await page.locator('#inpEditPop #inpEditStart').fill('09:00'); await page.locator('#inpEditPop #inpEditEnd').fill('10:00')
  await press(page.locator('#inpEditSave')); await sleep(600)
  const oq = await page.locator('[data-testid="oilconf"]').count(); w.say('oil question after bare save', oq)
  await w.closeDay()
  const bare = await page.evaluate(() => { const l = window.INPUTS.filter(x => x.date === 'Jul 17' && (x.people || []).length === 2); const r = l[l.length - 1]; return r ? { iid: r.iid, title: r.title || '', type: r.type, cx: !!r.cx } : null })
  w.say('bare filed', JSON.stringify(bare))
  const ri = await w.boardCx(bare.iid, 4, { why: '' }); await w.closeBoard()
  w.say('bare cancelled', JSON.stringify(await w.recById(bare.iid)))
  const X = bare.iid
  // surfaces of the bare one — quiet day Fri 17
  await w.toMonth(); await sleep(300); await w.quiet()
  const barSel = `.ib-bar[data-iid="${X}"]`
  const bf = await page.evaluate(s => [...document.querySelectorAll(s)].map(e => { const r = e.getBoundingClientRect(); return { text: e.textContent, strike: getComputedStyle(e).textDecorationLine, opacity: getComputedStyle(e).opacity, tip: e.getAttribute('title'), w: Math.round(r.width), h: Math.round(r.height), inScreen: r.left >= 0 && r.right <= innerWidth } }), barSel)
  w.say('E3 bar (Fri 17, quiet day)', JSON.stringify(bf)); w.res('e3_bar', bf)
  await w.shot('e3-01-month-full')
  const cell = await page.locator(`[data-icday="${bareDay}"]`).boundingBox()
  await w.clip('e3-01-bar', cell, [20, 6, 6, 6])
  // neighbouring bars on the quiet day for the height comparison
  w.say('E3 bars on that day', JSON.stringify(await page.evaluate(d => { const c = document.querySelector(`[data-icday="${d}"]`).getBoundingClientRect(); return [...document.querySelectorAll('.ib-bar')].filter(e => { const r = e.getBoundingClientRect(); return r.left < c.right && r.right > c.left && r.top >= c.top && r.bottom <= c.bottom }).map(e => ({ t: e.textContent, h: Math.round(e.getBoundingClientRect().height), strike: getComputedStyle(e).textDecorationLine, op: getComputedStyle(e).opacity })) }, bareDay)))
  await w.openDay(bareDay); await w.quiet()
  const cardSel = `[data-testid="win-inputsday"] .icard[data-popiid="${X}"]`
  await page.locator(cardSel).first().scrollIntoViewIfNeeded()
  const cf = await w.facts(cardSel); w.say('E3 card', JSON.stringify(cf)); w.res('e3_card', cf)
  w.say('E3 card neighbours', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 60) })))))
  await w.shot('e3-02-day-full')
  await w.clip('e3-02-card', await page.locator(cardSel).first().boundingBox(), [66, 12, 14, 12])
  await press(page.locator(cardSel).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(400); await w.quiet()
  const wf = await page.evaluate(() => { const m = document.querySelector('[data-testid="inped-cx"]'); if (!m) return null; const bar = m.closest('.win-bar, .airpop-head') || m.parentElement; const t = bar.querySelector('.win-ttl, #inpEditTitle'); return { text: m.textContent.trim(), title: t && t.textContent, controls: m.querySelectorAll('button,input').length } })
  w.say('E3 window title bar', JSON.stringify(wf)); await w.shot('e3-03-window-full')
  { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) await press(x); await sleep(300) }
  await w.closeDay()
  await press(page.locator('#inListBtn')); await sleep(400)
  if (!(await page.locator('#inRangeAll').count())) await press(page.locator('#inRangeBtn'))
  await press(page.locator('#inRangeAll')); await sleep(400)
  const lc = page.locator(`.icard[data-iid="${X}"]`).first()
  await lc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await w.quiet()
  const lf = await w.facts(`.icard[data-iid="${X}"]`); w.say('E3 list card', JSON.stringify(lf)); w.res('e3_list', lf)
  w.say('E3 list neighbours', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.icard[data-iid]')].filter(e => /Jul|JUL/.test(e.innerText) || true).map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 50) })).slice(0, 40))))
  await w.shot('e3-04-list-full'); await w.clip('e3-04-list-card', await lc.boundingBox(), [70, 12, 70, 12])
  await press(page.locator('#inCalBtn')); await sleep(200)
  // schedule: week's PI line + ground row, board line
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor(); await sleep(400)
  const fold = page.locator(`#eWeek .sec-inp .pl-fold[data-pitog="4"]`).first()
  await fold.scrollIntoViewIfNeeded()
  if (!(await page.locator('#eWeek .day').nth(4).locator('.sec-inp .pl-row').count())) { await press(fold); await sleep(300) }
  const wl = page.locator('#eWeek .day').nth(4).locator('.sec-inp .pl-row').first()
  await wl.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400); await w.quiet()
  const wlf = await wl.evaluate(e => { const nm = e.querySelector('.ntx.inpedit, .inp-cx'), tg = e.querySelector('.cxtag'); return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.innerText : null, name: nm ? nm.textContent : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, h: Math.round(e.getBoundingClientRect().height) } })
  w.say('E3 week PI line', JSON.stringify(wlf)); w.res('e3_week_line', wlf)
  await w.clip('e3-05-week-inputs-line', await wl.boundingBox(), [70, 14, 60, 14])
  const gr = page.locator('#eWeek .day').nth(4).locator('.pl-row.cx.gr-frominput').first()
  if (await gr.count()) {
    await gr.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
    const gf = await gr.evaluate(e => { const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' ').trim(), h: Math.round(r.height) } })
    w.say('E3 week ground row', JSON.stringify(gf), 'neighbours', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day')[4].querySelectorAll('.sec-grnd .pl-row')].map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 40) })))))
    await w.clip('e3-06-week-ground-row', await gr.boundingBox(), [78, 14, 96, 14])
  }
  await w.openBoard(4)
  const bfold = page.locator(`#schedBoard .pinp .pl-fold[data-pitog="4"]:visible`).first()
  if (await bfold.count() && !(await page.locator('#schedBoard .pinp .sb-arow:visible').count())) { await bfold.scrollIntoViewIfNeeded(); await press(bfold); await sleep(300) }
  const bl = page.locator('#schedBoard .pinp .sb-arow.inprow:visible').first()
  await bl.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400); await w.quiet()
  const blf = await bl.evaluate(e => { const nm = e.querySelector('.inp-cx, .intitle, .itemcell'), tg = e.querySelector('.cxtag'), it = e.querySelector('.itemcell'); const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.innerText : null, itemcell: it ? it.innerText.replace(/\s+/g, ' ') : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, h: Math.round(r.height), inScreen: r.left >= 0 && r.right <= innerWidth } })
  w.say('E3 board PI line', JSON.stringify(blf)); w.res('e3_board_line', blf)
  await w.shot('e3-07-board-line-full'); await w.clip('e3-07-board-line', await bl.boundingBox(), [70, 10, 60, 10])
  await w.closeBoard()
  w.say('errors', JSON.stringify(errors)); w.res('e3_errors', errors)
  await w.shot('e3-zz-end')
  await ctx.storageState({ path: `${PARTS}/or-E-state2.json` })
} catch (e) { w.say('E2 SCRIPT FAILED', String(e).slice(0, 700)); await w.shot('e2-zz-fail').catch(() => {}) }
await browser.close()
