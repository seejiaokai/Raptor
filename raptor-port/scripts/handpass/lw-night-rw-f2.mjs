// RE-WALK F2 (w1 break test 2) and R6: the foot note's "Show ›" guard.
//  (a) Show pressed twice ~90 ms apart → one scroll up to the Manning rows, NO stray bid window.
//  (b) desktop: Tab to Show, Enter, then Enter at once on the Manning button → the rows fold / open (the key press is not eaten).
//  (c) a quick click / tap on the top bar's Undo right after Show works.
// usage (from raptor-port/): node scripts/handpass/lw-night-rw-f2.mjs <desk|phone>
const R = await import('./lw-night-rw-lib.mjs')
const { H1: H, L, T, rec, judge, availCell, f1, sleep, rowsOpen, foldRows, openRows, rawTap, undoTitle } = R
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone', engine = 'chromium'
const phone = size === 'phone'
const tag = `f2-${R.shortTag(size, engine)}`
const label = R.engineTag(size, engine)
console.log('lw-night-rw-f2 v1', which, tag)
const w = await H.startWorld(size, engine)
const P = w.page
const ids = await H.peopleIds(P)
const D = '2026-12-16'
const out = async () => { const b = await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom); if (b > 0) { await P.evaluate(d => window.scrollBy(0, d), b + 80); await P.waitForTimeout(300) } }
const stray = () => P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid], [data-testid="person-figures"], [data-testid="daylist-sheet"], .qualpop, [data-testid="qualpop"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => { const t = e.dataset.testid || e.className; const h = e.querySelector('.who, .bidsheet-hd'); return t + (h ? ' (' + h.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) + ')' : '') }))
const inView = () => P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
/* a pending LL by `who` on D with the Manning button out of view → the foot note (a second tap at the below-zero ask) */
async function raiseFoot(who, name = null) {
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await L.openCellR(w, who, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await H.setSwitch(w, false); await out()
  await H.tapPic(w, T('bid-LL'), name); await P.waitForTimeout(500)
  if (await L.vis(P, T('bid-picker'))) { await H.tapPic(w, T('bid-LL'), name); await P.waitForTimeout(700) }
  const b = await H.bubbleNow(P)
  if (b.where !== 'foot') throw new Error('no foot note: ' + H.bubbleLine(b))
  return b
}
try {
  const f = await f1(w, D)
  if (phone) await foldRows(w)
  await P.evaluate(() => window.scrollTo(0, 0))
  // ================= (a) Show twice =================
  try {
    const b0 = await raiseFoot(ids.Vapor, `${tag}-a-0-foot-after-tap`)
    const sc0 = await P.evaluate(() => scrollY)
    const errsBefore = w.errs.length
    await P.evaluate(() => { window.__sc = 0; window.__ck = []; window.addEventListener('scroll', () => { window.__sc++ }, { passive: true }); document.addEventListener('click', e => { window.__ck.push({ t: Math.round(e.timeStamp), d: e.detail, tgt: (e.target.closest && e.target.closest('[data-testid]')?.dataset.testid) || e.target.tagName }) }, true) })
    const c = await P.locator(T('manning-bubble-show')).boundingBox()
    const px = c.x + c.width / 2, py = c.y + c.height / 2
    await H.settled(w, `${tag}-a-1-before`)
    const t0 = Date.now()
    const HOLD = Number(process.env.HOLD || 20), WAIT = Number(process.env.WAIT || (phone ? 70 : 35))
    await rawTap(w, px, py, HOLD)
    await P.waitForTimeout(WAIT)
    const t1 = Date.now()
    await rawTap(w, px, py, HOLD)
    const gap = t1 - t0
    await P.waitForTimeout(100)
    await H.settled(w, `${tag}-a-2-100ms-after-second`)
    await P.waitForTimeout(1800)
    const sc1 = await P.evaluate(() => scrollY), events = await P.evaluate(() => window.__sc), cks = await P.evaluate(() => window.__ck)
    const bAfter = await H.bubbleNow(P), iv = await inView(), st = await stray(), open = await rowsOpen(P)
    await H.settled(w, `${tag}-a-3-settled`)
    judge('F2a Show pressed twice ~90 ms apart', label, [
      ['no bid window / pop-up opened on the grid under the vanished note', st.length === 0, JSON.stringify(st)],
      ['the page went up to the Manning button once and rests there', iv, `scrollY ${sc0} → ${sc1}; button in view ${iv}`],
      ['the Manning rows are open', open, `rows open ${open}`],
      ['the note is gone', bAfter.where === 'none', H.bubbleLine(bAfter)],
      ['no error in the console / page', w.errs.length === errsBefore, w.errs.slice(errsBefore).join(' || ') || 'none'],
    ], `foot note up first (${b0.text} + "${b0.showText}"); two presses ${cks.length > 1 ? cks[1].t - cks[0].t : gap} ms apart (clicks seen by the page: ${JSON.stringify(cks)}); ${events} scroll events; scrollY ${sc0} → ${sc1}; windows open afterwards: ${JSON.stringify(st)}; Manning rows open: ${open}`, [`${tag}-a-2-100ms-after-second.png`, `${tag}-a-3-settled.png`])
  } catch (e) { rec('F2a Show pressed twice', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), []); await H.closeAll(w).catch(() => {}) }
  // a window closed? leave clean
  await H.closeAll(w).catch(() => {})
  // ================= (c) a quick Undo right after Show =================
  try {
    const who = ids.Diesel
    await raiseFoot(who, `${tag}-c-0-foot-after-tap`)
    const u0 = await R.undoTitle(P), k0 = await H.kinds(w, who, D)
    const undoBox = await P.locator('#undoBtn').boundingBox()
    const ux = undoBox.x + undoBox.width / 2, uy = undoBox.y + undoBox.height / 2
    const c = await P.locator(T('manning-bubble-show')).boundingBox()
    const px = c.x + c.width / 2, py = c.y + c.height / 2
    const fixedBar = await P.evaluate(() => { const b = document.querySelector('#undoBtn'); let e = b, pos = []; while (e && e !== document.body) { const p = getComputedStyle(e).position; if (p !== 'static') pos.push(p); e = e.parentElement } return pos })
    await rawTap(w, px, py, 20)
    await P.waitForTimeout(60)
    await rawTap(w, ux, uy, 20)
    await P.waitForTimeout(150)
    await H.settled(w, `${tag}-c-1-after-undo-tap-150ms`)
    await P.waitForTimeout(1500)
    const u1 = await R.undoTitle(P), k1 = await H.kinds(w, who, D), iv = await inView(), a1 = await availCell(P, D)
    await H.settled(w, `${tag}-c-2-settled`)
    judge('F2c a quick click on the top bar’s Undo right after Show', label, [
      ['the bid just placed is taken back (its cell is empty)', k0.length > 0 && k1.length === 0, `before ${JSON.stringify(k0)} → after ${JSON.stringify(k1)}`],
      ['the Undo button’s words changed (a step was used)', u0 && u1 && u0.title !== u1.title, `${u0?.title} → ${u1?.title}`],
    ], `the foot note up (Diesel's pending LL); Show pressed, Undo pressed ~60 ms later (top bar position styles ${JSON.stringify(fixedBar)}); the cell ${JSON.stringify(k0)} → ${JSON.stringify(k1)}; Undo "${u0?.title}" → "${u1?.title}"; page ${iv ? 'at' : 'NOT at'} the Manning button; Available P now ${a1}`, [`${tag}-c-1-after-undo-tap-150ms.png`, `${tag}-c-2-settled.png`])
    await H.closeAll(w).catch(() => {})
  } catch (e) { rec('F2c Undo right after Show', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), []); await H.closeAll(w).catch(() => {}) }
  // ================= (b) keyboard: Tab to Show, Enter, then Enter at once on the Manning button =================
  if (!phone) {
    try {
      await foldRows(w)
      await raiseFoot(ids.Gambit, `${tag}-b-0-foot-after-tap`)
      // focus starts nowhere: blur whatever, then Tab to Show
      await P.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
      let tabs = 0, at = null
      for (; tabs < 80; tabs++) {
        await P.keyboard.press('Tab')
        at = await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
        if (at === 'manning-bubble-show') { tabs++; break }
      }
      if (at !== 'manning-bubble-show') throw new Error('Tab never reached Show (last ' + at + ')')
      const foot1 = (await H.bubbleNow(P)).where
      const rows0 = await rowsOpen(P)
      await H.settled(w, `${tag}-b-1-tab-on-show`)
      await P.keyboard.press('Enter')
      await P.waitForTimeout(60)
      const focusNow = await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
      await P.keyboard.press('Enter')
      await P.waitForTimeout(150)
      const rowsA = await rowsOpen(P)
      await H.settled(w, `${tag}-b-2-after-second-enter-150ms`)
      await P.waitForTimeout(1500)
      const rowsB = await rowsOpen(P), iv = await inView(), bAfter = await H.bubbleNow(P)
      await H.settled(w, `${tag}-b-3-settled`)
      // rows were folded before Show (phone folds; a desktop opens them) — Show must have OPENED them, the second Enter toggled them
      judge('F2b Tab to Show, Enter, then Enter at once on the Manning button', label, [
        ['Tab reached Show with the foot note up', foot1 === 'foot', `${tabs} Tabs; foot note ${foot1}`],
        ['focus moved to the Manning button after the first Enter', focusNow === 'counts-toggle', focusNow],
        ['the second Enter (~60 ms after the first) was not eaten: the Enter on the Manning button toggled the rows (open → folded, as Show leaves them open)', rowsB === false, `rows open: before Show ${rows0}; 150 ms after the 2nd Enter ${rowsA}; settled ${rowsB}`],
      ], `${tabs} Tab presses reached Show; Enter → focus on "${focusNow}"; second Enter 60 ms later; rows open before ${rows0}, 150 ms after ${rowsA}, settled ${rowsB}; page ${iv ? 'at' : 'not at'} the Manning button; note: ${H.bubbleLine(bAfter)}`, [`${tag}-b-2-after-second-enter-150ms.png`, `${tag}-b-3-settled.png`])
      // control: the same Enter on the Manning button 700 ms after Show — what does a plain Enter do on it?
      await H.closeAll(w).catch(() => {})
    } catch (e) { rec('F2b keyboard', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), []); await H.closeAll(w).catch(() => {}) }
  }
} catch (e) { rec('F2', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), []) }
rec('errors-f2', label, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
await w.ctx.close()
await L.closeBrowser()
R.saveResults(`f2-${which}`)
