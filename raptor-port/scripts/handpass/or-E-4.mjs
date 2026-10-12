// E2 (un-cancel on the phone's board, U/R) and E4 (red box, information only on the phone's board) on the E world.
import { browser, PARTS, URL, sleep, mk, DI } from './or-E-lib.mjs'
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, storageState: `${PARTS}/or-E-state3.json` })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) }); page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
await page.clock.install({ time: new Date('2026-06-22T17:00:00') })
await page.goto(URL)
const w = mk(page, ctx, true, errors, 'E4'); const { press } = w
await w.signIn('ad', 'a')
const T = 'Range brief'
const rb = await w.rec(T); const X = rb.iid
w.say('start', JSON.stringify(rb))

/* every surface of the input, as facts; pic: save pictures with this stage's name */
async function read(stage, pic) {
  const out = {}
  // WEEK
  await w.closeBoard()
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor(); await sleep(400)
  const day = page.locator('#eWeek .day').nth(DI)
  const fold = day.locator('.sec-inp .pl-fold').first()
  await fold.scrollIntoViewIfNeeded()
  if (!(await day.locator('.sec-inp .pl-row').count())) { await press(fold); await sleep(300) }
  const wl = day.locator('.sec-inp .pl-row', { hasText: T }).first()
  await wl.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(350); await w.quiet()
  out.weekLine = await wl.evaluate(e => { const nm = e.querySelector('.ntx.inpedit'), tg = e.querySelector('.cxtag'); return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.innerText : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, h: Math.round(e.getBoundingClientRect().height) } })
  if (pic) await w.clip(`${stage}-week-line`, await wl.boundingBox(), [70, 14, 60, 14])
  const gr = day.locator('.sec-grnd .pl-row.gr-frominput', { hasText: T }).first()
  await gr.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(350); await w.quiet()
  out.weekGround = await gr.evaluate(e => { const tg = e.querySelector('.cxtag'), nm = e.querySelector('.nm'); return { cls: e.className, text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.innerText : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, flag: !!e.querySelector('.red, .flag, [class*="flag"]'), h: Math.round(e.getBoundingClientRect().height), html: e.innerHTML.length } })
  if (pic) await w.clip(`${stage}-week-ground`, await gr.boundingBox(), [60, 14, 60, 14])
  // BOARD
  await w.openBoard(DI)
  const ri = await w.rowIdx(DI, X)
  const brow = page.locator(`#schedBoard [data-grcx="${DI}.${ri}"]:visible`).first().locator('xpath=ancestor::*[contains(@class,"sb-arow")][1]')
  await brow.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(350); await w.quiet()
  out.boardRow = await brow.evaluate(e => ({ cls: e.className, text: e.innerText.replace(/\s+/g, ' ').trim(), cxOn: e.querySelector('[data-grcx]').className, infoOn: e.querySelector('[data-grinfo]').className, flagOn: e.querySelector('[data-grflag]').className, h: Math.round(e.getBoundingClientRect().height) }))
  if (pic) await w.clip(`${stage}-board-row`, await brow.boundingBox(), [60, 10, 50, 10])
  const bfold = page.locator(`#schedBoard .pinp .pl-fold[data-pitog="${DI}"]:visible`).first()
  if (await bfold.count() && !(await page.locator('#schedBoard .pinp .sb-arow.inprow:visible').count())) { await bfold.scrollIntoViewIfNeeded(); await press(bfold); await sleep(300) }
  const bl = page.locator('#schedBoard .pinp .sb-arow.inprow:visible', { has: page.locator('.cxtag, .inp-cx, .inpedit') }).filter({ hasText: T }).first()
  if (await bl.count()) {
    await bl.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(350); await w.quiet()
    out.boardLine = await bl.evaluate(e => { const tg = e.querySelector('.cxtag'), nm = e.querySelector('.itemcell button, .itemcell .inpedit, .itemcell'); return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: tg ? tg.innerText : null, nameStrike: nm ? getComputedStyle(nm).textDecorationLine : null, h: Math.round(e.getBoundingClientRect().height) } })
    if (pic) await w.clip(`${stage}-board-line`, await bl.boundingBox(), [60, 10, 50, 10])
  } else out.boardLine = 'NOT FOUND'
  await w.closeBoard()
  // INPUTS pages
  await w.toMonth(); await sleep(300); await w.quiet()
  out.bar = await page.evaluate(i => { const e = document.querySelector(`.ib-bar[data-iid="${i}"]`); return e ? { text: e.textContent, strike: getComputedStyle(e).textDecorationLine, op: getComputedStyle(e).opacity, tip: e.getAttribute('title').split('\n').slice(0, 2).join(' / '), html: e.outerHTML } : null }, X)
  await w.openDay('2026-07-15'); await w.quiet()
  const cs = `[data-testid="win-inputsday"] .icard[data-popiid="${X}"]`
  await page.locator(cs).first().scrollIntoViewIfNeeded()
  out.card = (await w.facts(cs))[0]; out.cardHtml = await page.locator(cs).first().evaluate(e => e.outerHTML)
  if (pic) await w.clip(`${stage}-card`, await page.locator(cs).first().boundingBox(), [66, 12, 14, 12])
  await press(page.locator(cs).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(450); await w.quiet()
  out.windowBar = await page.evaluate(() => { const bar = (document.querySelector('#inpEditPop .win-bar, #inpEditPop .airpop-head') || document.querySelector('#inpEditPop')); const m = document.querySelector('[data-testid="inped-cx"]'); return { cx: m ? m.textContent.trim() : null, barHtml: bar.outerHTML.slice(0, 1500) } })
  const xb = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await xb.count()) { await press(xb); await sleep(300) }
  await w.closeDay()
  await press(page.locator('#inListBtn')); await sleep(400)
  if (!(await page.locator('#inRangeAll').count())) await press(page.locator('#inRangeBtn'))
  await press(page.locator('#inRangeAll')); await sleep(400)
  const lc = page.locator(`.icard[data-iid="${X}"]`).first()
  await lc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await w.quiet()
  out.list = (await w.facts(`.icard[data-iid="${X}"]`))[0]; out.listHtml = await lc.evaluate(e => e.outerHTML)
  if (pic) await w.clip(`${stage}-list`, await lc.boundingBox(), [70, 12, 70, 12])
  await press(page.locator('#inCalBtn')); await sleep(200)
  out.rec = await w.recById(X)
  out.recRaw = await page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); const o = {}; for (const k of Object.keys(r)) if (!['people'].includes(k)) o[k] = r[k]; return o }, X)
  return out
}
const trim = o => { const c = { ...o }; delete c.cardHtml; delete c.listHtml; if (c.bar) c.bar = { ...c.bar, html: undefined }; c.windowBar = { cx: o.windowBar.cx }; return c }
const brief = o => ({ weekLine: o.weekLine, weekGround: { cls: o.weekGround.cls, tag: o.weekGround.tag, strike: o.weekGround.nameStrike, h: o.weekGround.h, text: o.weekGround.text }, boardRow: { cls: o.boardRow.cls, cxBtn: o.boardRow.cxOn, infoBtn: o.boardRow.infoOn, flagBtn: o.boardRow.flagOn }, boardLine: o.boardLine, bar: o.bar && { text: o.bar.text, strike: o.bar.strike, op: o.bar.op, tip: o.bar.tip }, card: { text: o.card.text, tag: o.card.tag, titleStrike: o.card.titleStrike, why: o.card.why, h: o.card.h }, windowCx: o.windowBar.cx, list: { text: o.list.text, tag: o.list.tag, titleStrike: o.list.titleStrike, why: o.list.why, h: o.list.h }, rec: o.rec })
try {
  const s0 = await read('e2-0-cancelled', false); w.say('E2 BEFORE (cancelled)', JSON.stringify(brief(s0))); w.res('e2_before', brief(s0))
  // un-cancel on the phone's board
  await w.boardCx(X, DI, { un: true })
  w.say('E2 un-cancel pressed: INPUTS', JSON.stringify(await w.recById(X)), await w.note())
  await w.shot('e2-00-board-after-uncancel')
  const s1 = await read('e2-1-uncancelled', true); w.say('E2 AFTER un-cancel', JSON.stringify(brief(s1))); w.res('e2_after', brief(s1))
  // Undo, Redo on the board
  await w.openBoard(DI)
  const ub = page.locator('#sbUndo:visible').first()
  w.say('E2 Undo button', await ub.getAttribute('title'), 'disabled', await ub.isDisabled())
  await press(ub); await sleep(700); w.say('E2 after Undo note', await w.note()); await w.closeBoard()
  const s2 = await read('e2-2-undo', true); w.say('E2 AFTER Undo', JSON.stringify(brief(s2))); w.res('e2_undo', brief(s2))
  await w.openBoard(DI)
  const rbn = page.locator('#sbRedo:visible').first()
  w.say('E2 Redo button', await rbn.getAttribute('title'), 'disabled', await rbn.isDisabled())
  await press(rbn); await sleep(700); w.say('E2 after Redo note', await w.note()); await w.closeBoard()
  const s3 = await read('e2-3-redo', true); w.say('E2 AFTER Redo', JSON.stringify(brief(s3))); w.res('e2_redo', brief(s3))
  // the bell lines Saber's un-cancel gave Ranger (read later in the E5 world; here the stored notices)
  w.say('notices', JSON.stringify(await page.evaluate(() => (window.NOTICES || []).slice(-6).map(n => [n.to, n.by, (n.what || []).map(p => p.k).join('+')]))))
  // E4: red box, then information only — on the (now un-cancelled) Range brief; the Inputs pages must stay the same
  const base = s3
  await w.openBoard(DI)
  let ri = await w.rowIdx(DI, X)
  const flag = page.locator(`#schedBoard [data-grflag="${DI}.${ri}"]:visible`).first(); await flag.scrollIntoViewIfNeeded(); await press(flag); await sleep(500)
  w.say('E4 red box pressed', await w.note()); await w.closeBoard()
  const s4 = await read('e4-1-redbox', true); w.say('E4 AFTER red box', JSON.stringify(brief(s4))); w.res('e4_redbox', brief(s4))
  w.say('E4 red box: card/list/bar/window identical to before?', JSON.stringify({ card: s4.cardHtml === base.cardHtml, list: s4.listHtml === base.listHtml, bar: s4.bar.html === base.bar.html, window: s4.windowBar.barHtml === base.windowBar.barHtml }))
  w.res('e4_redbox_same', { card: s4.cardHtml === base.cardHtml, list: s4.listHtml === base.listHtml, bar: s4.bar.html === base.bar.html, window: s4.windowBar.barHtml === base.windowBar.barHtml })
  await w.openBoard(DI); ri = await w.rowIdx(DI, X)
  const info = page.locator(`#schedBoard [data-grinfo="${DI}.${ri}"]:visible`).first(); await info.scrollIntoViewIfNeeded(); await press(info); await sleep(500)
  w.say('E4 information only pressed', await w.note()); await w.closeBoard()
  const s5 = await read('e4-2-infoonly', true); w.say('E4 AFTER information only', JSON.stringify(brief(s5))); w.res('e4_info', brief(s5))
  w.say('E4 info only: card/list/bar/window identical to before?', JSON.stringify({ card: s5.cardHtml === base.cardHtml, list: s5.listHtml === base.listHtml, bar: s5.bar.html === base.bar.html, window: s5.windowBar.barHtml === base.windowBar.barHtml }))
  w.res('e4_info_same', { card: s5.cardHtml === base.cardHtml, list: s5.listHtml === base.listHtml, bar: s5.bar.html === base.bar.html, window: s5.windowBar.barHtml === base.windowBar.barHtml })
  // un-cancel the bare input too, for the E3 row-height comparison (same two pucks, no longer cancelled)
  const bare = await page.evaluate(() => { const l = window.INPUTS.filter(x => x.date === 'Jul 17' && (x.people || []).length === 2); return l[l.length - 1].iid })
  await w.boardCx(bare, 4, { un: true }); await w.closeBoard()
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor(); await sleep(400)
  w.say('E3 week ground rows on Fri 17 after the bare one is un-cancelled', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day')[4].querySelectorAll('.sec-grnd .pl-row')].map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 40), cls: e.className })))))
  w.say('errors', JSON.stringify(errors)); w.res('e24_errors', errors)
} catch (e) { w.say('E4 SCRIPT FAILED', String(e).slice(0, 800)); await w.shot('e4-zz-fail').catch(() => {}) }
await browser.close()
