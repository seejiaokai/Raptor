/* b3-03 — ITEM 11 (his keyboard-gap report): on a phone, typing into the scheduler board must never show the week
   behind it above the keyboard; the board fills what is visible. Chromium cannot raise an iPhone keyboard, so the
   keyboard is EMULATED two ways (both said in the report — the real proof is his iPhone):
     E1  iOS-like: the layout viewport stays 844 tall while the VISUAL viewport shrinks and pans (a keyboard of ~300px,
         the page panned down to keep the field in sight). Chromium's CDP cannot do this alone (Emulation.setVisibleSize
         leaves visualViewport untouched — measured in b3-00b), so window.visualViewport is replaced BEFORE the board
         opens by a stand-in with the same fields and events — a browser-side emulation, nothing written to the app.
     E2  Android-like: the whole viewport shortens (page.setViewportSize), which the real visualViewport reports.
   Each with History off and on. Walker B3, 25 Sep 26. Usage (from raptor-port/): node scripts/handpass/am/b3-03-keyboard.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, check, note, summary, STATE, PHONE, RESULTS } = L
import { writeFileSync } from 'node:fs'
const SH = process.env.HP_SHOTS
const DI = 0, KB = 300, PAN = 260

async function stubVV(page) {
  await page.evaluate(() => {
    class FakeVV extends EventTarget {
      constructor() { super(); this.width = innerWidth; this.height = innerHeight; this.offsetTop = 0; this.offsetLeft = 0; this.pageTop = 0; this.pageLeft = 0; this.scale = 1 }
    }
    const f = new FakeVV()
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
    window.__vv = f
  })
}
async function kbUp(page, h, top) {
  await page.evaluate(([h, top]) => { const v = window.__vv; v.height = h; v.offsetTop = top; v.pageTop = top; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, [h, top])
  await page.waitForTimeout(300)
}
async function focusProgNear(page) {
  /* the LAST Common Programme item name on the board — brought to the bottom of the screen, then tapped */
  const key = await page.evaluate(i => { const all = [...document.querySelectorAll(`#schedBoard [data-bfld^="ap:${i}."][data-bfld$=".prog"]`)].filter(e => e.offsetWidth); return all.length ? all[all.length - 1].dataset.bfld : null }, DI)
  if (!key) return null
  const el = page.locator(`#schedBoard [data-bfld="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'end' })); await page.waitForTimeout(250)
  await el.evaluate(e => { const sc = e.closest('.sb-main') || document.scrollingElement; sc.scrollBy(0, -30) }); await page.waitForTimeout(200)
  await el.click(); await page.waitForTimeout(300)
  const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), focused: document.activeElement === e } })
  return { key, ...r }
}
/* what the phone user would see: sample the visible band; every point must land inside the board (or a body-level
   layer the board itself raises — the History bubble, a toast); the page behind must not be painted */
async function probe(page, top, h) {
  return page.evaluate(([top, h]) => {
    const sb = document.getElementById('schedBoard'), r = sb.getBoundingClientRect()
    const pageBehind = document.getElementById('page-editsched')
    const pts = []
    for (const y of [top + 2, top + h * 0.25, top + h * 0.5, top + h * 0.75, top + h - 3]) for (const x of [6, innerWidth / 2, innerWidth - 6]) {
      const e = document.elementFromPoint(x, y)
      const ok = !!e && (sb.contains(e) || !!e.closest('.histbub, #toastEl, .pendlist'))
      pts.push({ x: Math.round(x), y: Math.round(y), ok, at: ok ? '' : (e ? (e.id || String(e.className)).slice(0, 40) + ' in ' + ((e.closest('[id]') || {}).id || '?') : 'nothing') })
    }
    return { board: { top: Math.round(r.top), height: Math.round(r.height), bottom: Math.round(r.bottom), styleTop: sb.style.top, styleH: sb.style.height },
      behindVis: pageBehind ? getComputedStyle(pageBehind).visibility : 'no page', bodyCls: document.body.className,
      misses: pts.filter(p => !p.ok) }
  }, [top, h])
}
async function histOn(page, on) {
  const b = page.locator('#schedBoard #sbHist:visible').first()
  if (!(await b.count())) return 'NO HISTORY BUTTON'
  const isOn = await b.evaluate(e => e.classList.contains('on'))
  if (isOn !== on) { await b.click(); await page.waitForTimeout(400) }
  return (await b.evaluate(e => e.classList.contains('on'))) ? 'on' : 'off'
}

for (const hist of [false, true]) {
  const H = hist ? 'hist-on' : 'hist-off'
  /* ---- E1: the iOS-like keyboard (the visual viewport shrinks and pans; the layout stays) ---- */
  {
    const { browser, page, errors } = await openHi({ ...PHONE, state: STATE, dpr: 3 })
    await editWeek(page); await stubVV(page)
    await board(page, DI)
    const hs = await histOn(page, hist)
    const f = await focusProgNear(page)
    note(`p.K1 ${H} E1 focused a Common Programme item near the bottom`, JSON.stringify({ hs, f }))
    check(`p.K1 ${H} E1 fixture: the item name has focus, low on the screen`, f && f.focused && f.bottom > 844 * 0.55, JSON.stringify(f))
    await page.screenshot({ path: `${SH}/p-K1-${H}-E1-before-keyboard.png` })
    await kbUp(page, 844 - KB, PAN)
    const p1 = await probe(page, PAN, 844 - KB)
    note(`p.K1 ${H} E1 keyboard up (visible band ${PAN}–${PAN + 844 - KB})`, JSON.stringify(p1))
    check(`p.K1 ${H} E1 the board follows the visible band (top ${PAN}, height ${844 - KB})`, p1.board.top === PAN && p1.board.height === 844 - KB, JSON.stringify(p1.board))
    check(`p.K1 ${H} E1 nothing of the week behind shows anywhere in the visible band`, p1.misses.length === 0, JSON.stringify(p1.misses))
    check(`p.K1 ${H} E1 the page behind is not painted while the board is open`, p1.behindVis === 'hidden', p1.behindVis + ' · ' + p1.bodyCls)
    await page.screenshot({ path: `${SH}/p-K1-${H}-E1-keyboard-visible-band.png`, clip: { x: 0, y: PAN, width: 390, height: 844 - KB } })
    await page.screenshot({ path: `${SH}/p-K1-${H}-E1-keyboard-whole-layout.png` })
    /* still focused, and typing works while the keyboard is up */
    const typed = await page.evaluate(() => { const a = document.activeElement; return a && a.dataset ? a.dataset.bfld || '' : '' })
    check(`p.K1 ${H} E1 the field keeps focus with the board re-fitted`, typed === (f && f.key), typed)
    /* where the field being typed into now sits against the visible band — a real Safari also scrolls a focused field
       into view by itself, which this emulation cannot reproduce, so this is a NOTE for his phone check, not a verdict */
    const fr = await page.evaluate(k => { const e = document.querySelector(`#schedBoard [data-bfld="${k}"]`); const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } }, f && f.key)
    note(`p.K1 ${H} E1 the focused field against the visible band ${PAN}–${PAN + 844 - KB}`, JSON.stringify({ field: fr, inBand: fr.top >= PAN && fr.bottom <= PAN + 844 - KB }))
    /* keyboard down: the board goes back to the whole screen */
    await kbUp(page, 844, 0)
    const p2 = await probe(page, 0, 844)
    check(`p.K1 ${H} E1 keyboard down: the board fills the whole screen again`, p2.board.top === 0 && p2.board.height === 844 && p2.misses.length === 0, JSON.stringify(p2.board))
    /* close the board: the week comes back painted */
    await page.locator('#sbClose:visible').first().click(); await page.waitForTimeout(600)
    const back = await page.evaluate(() => ({ vis: getComputedStyle(document.getElementById('page-editsched')).visibility, cls: document.body.className, week: !!document.querySelector('#eWeek .day') }))
    check(`p.K1 ${H} E1 after closing the board the week is painted again`, back.vis === 'visible' && back.week, JSON.stringify(back))
    await page.screenshot({ path: `${SH}/p-K1-${H}-E1-after-close.png` })
    check(`p.K1 ${H} E1 no browser errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
  /* ---- E2: the Android-like keyboard (the whole viewport shortens) ---- */
  {
    const { browser, page, errors } = await openHi({ ...PHONE, state: STATE, dpr: 3 })
    await editWeek(page); await board(page, DI)
    const hs = await histOn(page, hist)
    const f = await focusProgNear(page)
    await page.setViewportSize({ width: 390, height: 844 - KB }); await page.waitForTimeout(500)
    const vv = await page.evaluate(() => ({ ih: innerHeight, vh: visualViewport.height, vt: visualViewport.offsetTop }))
    const p1 = await probe(page, 0, vv.vh)
    note(`p.K2 ${H} E2 viewport shortened to ${844 - KB}`, JSON.stringify({ hs, f, vv, p1 }))
    check(`p.K2 ${H} E2 the board fills the shortened screen`, p1.board.top === 0 && Math.abs(p1.board.height - vv.vh) <= 1, JSON.stringify(p1.board))
    check(`p.K2 ${H} E2 nothing of the week behind shows`, p1.misses.length === 0 && p1.behindVis === 'hidden', JSON.stringify(p1.misses))
    const still = await page.evaluate(() => { const a = document.activeElement; return a && a.dataset ? a.dataset.bfld || '' : '' })
    const inView = await page.evaluate(k => { const e = document.querySelector(`#schedBoard [data-bfld="${k}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } }, f && f.key)
    note(`p.K2 ${H} E2 the focused field after the keyboard`, JSON.stringify({ still, inView }))
    await page.screenshot({ path: `${SH}/p-K2-${H}-E2-keyboard.png` })
    check(`p.K2 ${H} E2 no browser errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
    await browser.close()
  }
}
const fl = summary('b3-03-keyboard')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-03.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = fl ? 1 : 0
