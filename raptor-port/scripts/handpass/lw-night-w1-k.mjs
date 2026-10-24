// WALKER 1 — break tests 1 to 3 (the bubble under the button with a hostile long name; the foot note across a turn of the phone and a narrowing window;
// what must raise nothing). Usage, from raptor-port/:  LW_PORT=4180 [WHICH=1,2,3] [SIZES=phone,desk] node scripts/handpass/lw-night-w1-k.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-k v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const WHICH = new Set((process.env.WHICH || '1,2,3').split(','))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^b[123]-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && [...WHICH].some(o => f.startsWith(`b${o}-`))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
async function foldRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
async function f1(w, iso, minus = 0) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0) - minus); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  return { a0, req, cell }
}
async function setCounterAmber(w, ruleId, amber) {
  const P = w.page
  await openRows(w)
  await L.press(w, T(`manning-info-${ruleId}`)); await P.waitForTimeout(400)
  await L.press(w, T('counter-edit-open')); await P.waitForSelector(T('cform-amber'), { timeout: 4000 })
  await P.locator(T('cform-amber')).fill(String(amber)); await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
}
async function setPoints(w, rowId, amberText, redText, newName = null) {
  const P = w.page
  await openRows(w)
  await L.press(w, T(`fly-name-${rowId}`)); await P.waitForSelector(T('cform-amber-pt'), { timeout: 4000 })
  if (newName !== null) await P.locator(T('cform-name')).fill(newName)
  await P.locator(T('cform-amber-pt')).fill(amberText); await P.locator(T('cform-red-pt')).fill(redText)
  await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
}
const undoTitle = P => P.evaluate(() => document.querySelector('#undoBtn')?.title ?? null)
async function rawTap(w, x, y, hold = 30) {
  if (w.cdp) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await w.page.waitForTimeout(hold); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
  else if (w.phone) await w.page.touchscreen.tap(x, y)
  else await w.page.mouse.click(x, y)
}

for (const size of SIZES) {
  const phone = size === 'phone'
  const sc = async (w, id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { rec(id, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}); await w.page.keyboard.press('Escape').catch(() => {}) } }

  /* ============ BREAK 1: the bubble under the button, a hostile long name, three rows named at once ============ */
  if (WHICH.has('1')) {
    const w = await H.startWorld(size)
    const P = w.page
    const ids = await H.peopleIds(P)
    await sc(w, 'B1 the long name under the button', async () => {
      const D = '2026-12-15'
      const NAME = 'VeryLongPilotsFreeToday<b>&amp;</b>Zzzzzzzz'
      const a0 = await H.availP(w, D)
      await H.setReq(w, D, Number(a0) - 4, 'p')
      await setPoints(w, 'avail-p', '+ 6', '+ 0', NAME)
      await setCounterAmber(w, 'ip', 17)
      await setCounterAmber(w, 'sxo', 13)
      const shown = await P.evaluate(sel => document.querySelector(sel)?.textContent, T('fly-name-avail-p'))
      if (phone) await foldRows(w)
      const r = await H.bidType(w, ids.Anvil, D, { type: 'LL', inView: true, approve: false, name: `b1-${size}-after-tap` })
      const b = await H.bubbleNow(P)
      const html = await P.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble"], [data-testid="manning-bubble-text"]'); return e ? { inner: e.innerHTML, kids: e.querySelectorAll('*').length, b: e.querySelectorAll('b').length, h: Math.round(e.getBoundingClientRect().height), lh: parseFloat(getComputedStyle(e).lineHeight) } : null })
      const pic = await H.cropPic(w, `b1-${size}-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot')])
      const whole = await H.settled(w, `b1-${size}-settled-full`)
      const vw = b.vw
      judge('B1 hostile long name, three rows at once', size, [
        ['the row’s name was saved as typed (the markup shown as letters)', /<b>&amp;<\/b>/.test(shown || ''), `row label textContent: "${shown}"`],
        ['a bubble under the button', b.where === 'mid', b.where],
        ['three rows named in one sentence', /IP/.test(b.text) && /SXO/.test(b.text) && b.text.includes('<b>&amp;</b>'), b.text],
        ['the words are shown literally (the typed tags, no real <b> element, no &amp; turned into &)', html && html.b === 0 && html.kids === 0 && b.text.includes('<b>&amp;</b>'), JSON.stringify(html)],
        ['it wraps: more than one line', html && html.h > (html.lh || 17) * 1.6, `height ${html?.h} line ${html?.lh}`],
        [`wholly inside ${vw} wide`, b.rect.x >= 0 && b.rect.r <= vw, JSON.stringify(b.rect)],
        ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
      ], `Available P renamed "${NAME}"; ${H.bubbleLine(b)}; box height ${html?.h}`, [`b1-${size}-after-tap.png`, pic, whole].filter(Boolean))
      // a mouse press on the bubble itself also ends it
      const bb = await H.bubbleNow(P)
      if (bb.where === 'none') throw new Error('bubble gone before the press')
      const gridBefore = await P.evaluate(() => [...document.querySelectorAll('td[data-testid^="head-"], th[data-testid^="head-"]')].filter(e => e.getBoundingClientRect().right > 120 && e.getBoundingClientRect().left < innerWidth).slice(0, 1).map(e => e.dataset.testid))
      await P.mouse.click(bb.rect.x + bb.rect.w / 2, bb.rect.y + bb.rect.h / 2)
      await P.waitForTimeout(500)
      const after = await H.bubbleNow(P)
      const gridAfter = await P.evaluate(() => [...document.querySelectorAll('td[data-testid^="head-"], th[data-testid^="head-"]')].filter(e => e.getBoundingClientRect().right > 120 && e.getBoundingClientRect().left < innerWidth).slice(0, 1).map(e => e.dataset.testid))
      judge('B1 a mouse press on the bubble itself ends it', size, [['the bubble is gone', after.where === 'none', H.bubbleLine(after)]], `pressed at its centre (${Math.round(bb.rect.x + bb.rect.w / 2)}, ${Math.round(bb.rect.y + bb.rect.h / 2)}); it sits over "${bb.hitTag}" (pointer-events ${bb.pe}); the grid's first date head ${JSON.stringify(gridBefore)} → ${JSON.stringify(gridAfter)} (${JSON.stringify(gridBefore) === JSON.stringify(gridAfter) ? 'did not move' : 'the press also moved the grid: it went through to the month button under the bubble'})`, [])
    })
    rec('errors-B1', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
    await w.ctx.close()
  }

  /* ============ BREAK 2: the foot note across a turn, a narrowing window, and Show pressed twice ============ */
  if (WHICH.has('2')) {
    const w = await H.startWorld(size)
    const P = w.page
    const ids = await H.peopleIds(P)
    await sc(w, 'B2 the foot note', async () => {
      const D = '2026-12-16'
      const f = await f1(w, D)
      if (phone) await foldRows(w)
      await P.evaluate(() => window.scrollTo(0, 0))
      const out = async () => { const b = await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom); if (b > 0) { await P.evaluate(d => window.scrollBy(0, d), b + 80); await P.waitForTimeout(300) } }
      await L.openCellR(w, ids.Vapor, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await H.setSwitch(w, false); await out()
      let seen = await H.tapPic(w, T('bid-LL'), null); await P.waitForTimeout(500)
      if (await L.vis(P, T('bid-picker'))) { seen = await H.tapPic(w, T('bid-LL'), null); await P.waitForTimeout(700) }
      const b0 = await H.bubbleNow(P)
      if (b0.where !== 'foot') throw new Error('premise: no foot note: ' + H.bubbleLine(b0))
      const readings = []
      const sizes = phone ? [[874, 402, 'on its side'], [402, 874, 'upright again'], [874, 402, 'on its side again'], [402, 874, 'upright']] : [[1100, 900, '1100'], [900, 900, '900'], [760, 900, '760'], [720, 900, '720'], [701, 900, '701'], [700, 900, '700'], [699, 900, '699'], [640, 900, '640'], [500, 900, '500'], [402, 900, '402'], [1440, 900, 'back to 1440']]
      let pi = 0
      for (const [vw, vh, label] of sizes) {
        await P.setViewportSize({ width: vw, height: vh }); await P.waitForTimeout(700)
        const b = await H.bubbleNow(P)
        const ok = b.where === 'none' || (b.where === 'foot' && b.rect.x >= 0 && b.rect.r <= vw && b.rect.y >= 0 && b.rect.b <= vh)
        const pic = await H.settled(w, `b2-${size}-resize-${++pi}-${vw}x${vh}`)
        readings.push({ vw, vh, label, ok, where: b.where, rect: b.where === 'none' ? null : b.rect, pic })
      }
      judge('B2 the foot note across a turn / a narrowing window', size, readings.map(r => [`at ${r.vw}×${r.vh} (${r.label}): wholly on screen or gone`, r.ok, `${r.where} ${JSON.stringify(r.rect)}`]), readings.map(r => `${r.vw}×${r.vh} ${r.where}${r.rect ? ` ${r.rect.x},${r.rect.y}→${r.rect.r},${r.rect.b}` : ''}`).join('; '), readings.map(r => r.pic).filter(Boolean).slice(0, 6))
      // Show pressed twice fast
      await P.setViewportSize(phone ? { width: 402, height: 874 } : { width: 1440, height: 900 }); await P.waitForTimeout(500)
      let b1 = await H.bubbleNow(P)
      if (b1.where !== 'foot') { // bring it back with one more bid, the button out of view
        await P.evaluate(() => window.scrollTo(0, 0))
        await L.openCellR(w, ids.Diesel, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
        await H.setSwitch(w, false); await out()
        await H.tapPic(w, T('bid-LL'), null); await P.waitForTimeout(500)
        if (await L.vis(P, T('bid-picker'))) { await H.tapPic(w, T('bid-LL'), null); await P.waitForTimeout(700) }
        b1 = await H.bubbleNow(P)
      }
      if (b1.where !== 'foot') throw new Error('no foot note for the double Show: ' + H.bubbleLine(b1))
      const sc0 = await P.evaluate(() => scrollY)
      const errsBefore = w.errs.length
      const sy = []
      await P.evaluate(() => { window.__sc = 0; window.addEventListener('scroll', () => { window.__sc++ }, { passive: true }) })
      const c = await P.locator(T('manning-bubble-show')).boundingBox()
      const px = c.x + c.width / 2, py = c.y + c.height / 2
      await rawTap(w, px, py, 20)
      await P.waitForTimeout(70)
      await rawTap(w, px, py, 20)
      await P.waitForTimeout(1800)
      const sc1 = await P.evaluate(() => scrollY), events = await P.evaluate(() => window.__sc)
      const bAfter = await H.bubbleNow(P)
      const inV = await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
      const stray = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid], [data-testid="person-figures"], [data-testid="daylist-sheet"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => { const t = e.dataset.testid; const h = e.querySelector('.who, .bidsheet-hd'); return t + (h ? ' (' + h.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) + ')' : '') }))
      const pic = await H.settled(w, `b2-${size}-show-twice`)
      judge('B2 Show pressed twice fast', size, [
        ['the second press opened no window on the grid under the vanished note', stray.length === 0, JSON.stringify(stray)],
        ['the page went up to the Manning button once and rests there', inV, `scrollY ${sc0} → ${sc1}; button in view ${inV}`],
        ['the note is gone', bAfter.where === 'none', H.bubbleLine(bAfter)],
        ['no error in the console / page', w.errs.length === errsBefore, w.errs.slice(errsBefore).join(' || ') || 'none'],
      ], `two presses ~90 ms apart; ${events} scroll events; scrollY ${sc0} → ${sc1}; windows open afterwards: ${JSON.stringify(stray)}`, [pic])
    })
    rec('errors-B2', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
    await w.ctx.close()
  }

  /* ============ BREAK 3: what must raise nothing, and leave no stray Undo step ============ */
  if (WHICH.has('3')) {
    const w = await H.startWorld(size)
    const P = w.page
    const ids = await H.peopleIds(P)
    await sc(w, 'B3 what raises nothing', async () => {
      const D = '2026-12-17', D2 = '2026-12-18'
      const f = await f1(w, D)
      await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
      const u0 = await undoTitle(P)
      // (a) Escape at the below-zero ask
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, ids.Vapor, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await H.setSwitch(w, false); await H.setManningView(w, true)
      const sA = await H.tapPic(w, T('bid-LL'), `b3-${size}-escape-ask-tap`)
      await P.waitForTimeout(500)
      const asked = /Tap the same leave again/.test((await L.sheetDump(P))?.text || '')
      await P.keyboard.press('Escape'); await P.waitForTimeout(500)
      const bA = await H.bubbleNow(P), kA = (await H.kinds(w, ids.Vapor, D)).join('+'), uA = await undoTitle(P), openA = await L.vis(P, T('bid-picker'))
      judge('B3 Escape at the below-zero ask', size, [
        ['the ask was shown first (proof the gesture happened)', asked, `asked=${asked}`],
        ['the window closed, nothing was written', !openA && kA === '', `open=${openA} cell="${kA}"`],
        ['no bubble', bA.where === 'none' && sA.where === 'none', H.bubbleLine(bA)],
        ['no stray Undo step', uA === u0, `Undo title "${u0}" → "${uA}"`],
      ], `Undo "${uA}"`, [`b3-${size}-escape-ask-tap.png`])
      // (b) a move dropped on its own day, then cancelled by Escape and by an empty tap
      const r = await H.bidType(w, ids.Ridge, D2, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
      const u1 = await undoTitle(P)
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, ids.Ridge, D2); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await L.press(w, T('decide-shift')); await P.waitForTimeout(500)
      const sB1 = await H.tapPic(w, T(L.cellId(ids.Ridge, D2)), `b3-${size}-own-day-tap`)
      await P.waitForTimeout(500)
      const own = await L.txt(P, T('move-banner'))
      await P.keyboard.press('Escape'); await P.waitForTimeout(500)
      const gone = !(await L.vis(P, T('move-banner')))
      const bB = await H.bubbleNow(P), uB = await undoTitle(P), kB = (await H.kinds(w, ids.Ridge, D2)).join('+')
      judge('B3 a move dropped on its own day, then cancelled by Escape', size, [
        ['the reason was said (proof the tap happened)', /already/i.test(own || ''), `"${own}"`],
        ['the banner went with Escape', gone, `gone=${gone}`],
        ['the bid is still where it was', /^LL\|k-ll\|s-w/.test(kB), kB],
        ['no bubble', bB.where === 'none' && sB1.where === 'none', H.bubbleLine(bB)],
        ['no stray Undo step', uB === u1, `Undo title "${u1}" → "${uB}"`],
      ], `Undo "${uB}"`, [`b3-${size}-own-day-tap.png`])
      // (c) the same UNA with the same words placed again
      const D3 = '2026-12-21'
      await f1(w, D3)
      await H.bidType(w, ids.Hunter, D3, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, ids.Gambit, D3); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await L.press(w, T('bid-remarks')); await P.keyboard.type('Same words'); await P.waitForTimeout(150)
      await H.setManningView(w, true)
      const s1 = await H.tapPic(w, T('bid-una'), `b3-${size}-una-first-after-tap`)
      await P.waitForTimeout(700)
      const b1 = await H.bubbleNow(P); await H.dismissBubble(w)
      const u2 = await undoTitle(P), kU1 = (await H.kinds(w, ids.Gambit, D3)).join('+'), a1 = await availCell(P, D3).catch(() => null)
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, ids.Gambit, D3)
      const sheet = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())
      let note2 = `the day opens "${sheet}"`
      let s2 = null, b2 = null
      if (sheet === 'bid-picker') {
        if (await L.vis(P, T('bid-remarks'))) { await L.press(w, T('bid-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Same words') }
        await H.setManningView(w, true)
        s2 = await H.tapPic(w, T('bid-una'), `b3-${size}-una-again-after-tap`); await P.waitForTimeout(700)
      } else { s2 = await H.bubbleNow(P) }
      b2 = await H.bubbleNow(P)
      const u3 = await undoTitle(P), kU2 = (await H.kinds(w, ids.Gambit, D3)).join('+'), a2 = await availCell(P, D3).catch(() => null)
      rec('B3 a whole-day UNA’s day opened again (RECORD)', size, 'RECORD', `${note2}; a whole-day UNA's day opens the day's list, which has no UNA button, so it cannot be placed again that way; cells ${kU1} → ${kU2}; Undo "${u3}"; bubble ${H.bubbleLine(b2)}`, [`b3-${size}-una-first-after-tap.png`])
      await H.closeAll(w)
      // the same morning UNA with the same words, placed again on its own half
      const D4 = '2026-12-22'
      await f1(w, D4)
      await H.bidType(w, ids.Hunter, D4, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, ids.Diesel, D4); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
      await L.press(w, T('portion-am')); await L.press(w, T('bid-remarks')); await P.keyboard.type('Same words'); await P.waitForTimeout(150)
      await H.setManningView(w, true)
      const t1 = await H.tapPic(w, T('bid-una'), `b3-${size}-am-una-first-after-tap`)
      await P.waitForTimeout(700)
      const c1 = await H.bubbleNow(P); await H.dismissBubble(w)
      const v2 = await undoTitle(P), kk1 = (await H.kinds(w, ids.Diesel, D4)).join('+'), aa1 = await availCell(P, D4).catch(() => null)
      await P.evaluate(() => window.scrollTo(0, 0))
      await L.openCellR(w, ids.Diesel, D4)
      const sheet2 = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())
      let t2 = null
      if (sheet2 === 'bid-picker') {
        await L.press(w, T('portion-am'))
        if (await L.vis(P, T('bid-remarks'))) { await L.press(w, T('bid-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Same words') }
        await H.setManningView(w, true)
        t2 = await H.tapPic(w, T('bid-una'), `b3-${size}-am-una-again-after-tap`); await P.waitForTimeout(700)
      }
      const c2 = await H.bubbleNow(P), v3 = await undoTitle(P), kk2 = (await H.kinds(w, ids.Diesel, D4)).join('+'), aa2 = await availCell(P, D4).catch(() => null)
      const stillOpen2 = await L.vis(P, T('bid-picker'))
      if (sheet2 !== 'bid-picker') {
        rec('B3 the same morning UNA with the same words placed again (RECORD)', size, 'RECORD', `a day holding a morning UNA opens "${sheet2}" (the day's list), not a bid window for the free half (D1353 reads "opens the bid window for the free half" — held as a question this night, not built); so the same UNA could not be placed again from that tap; the first UNA raised: ${H.bubbleLine(c1)}; cells ${kk1} → ${kk2}; Undo "${v3}"; no bubble after: ${H.bubbleLine(c2)}`, [`b3-${size}-am-una-first-after-tap.png`])
      } else judge('B3 the same morning UNA with the same words placed again', size, [
        ['the first UNA raised a bubble (proof the first press happened)', c1.where !== 'none' && /UNA/.test(c1.text), H.bubbleLine(c1)],
        ['the second placing raised none', c2.where === 'none' && (!t2 || t2.where === 'none'), H.bubbleLine(c2)],
        ['Available P unchanged by the second', aa2 === aa1, `${aa1} → ${aa2}`],
        ['the cell unchanged', kk2 === kk1, `${kk1} → ${kk2}`],
        ['no stray Undo step', v3 === v2, `Undo title "${v2}" → "${v3}"`],
      ], `window ${stillOpen2 ? 'stayed open' : 'closed'}; cells ${kk1} → ${kk2}; Undo "${v3}"`, [`b3-${size}-am-una-first-after-tap.png`, t2 ? `b3-${size}-am-una-again-after-tap.png` : null].filter(Boolean))
      await H.closeAll(w)
    })
    rec('errors-B3', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
    await w.ctx.close()
  }
}
await L.closeBrowser()
H.saveResults(`k-${SIZES.join('-')}-${[...WHICH].join('')}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
