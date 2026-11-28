// p4-drag - P4 case 3, a drag in progress when a door is pressed (H12; C54; F26, A49). Saber on Edit Schedule (142).
//   p (phone, touch): one finger holds Warden's puck in the first seat (a:0.1.0), waits past the app's hold, moves it down
//     the column (not released); a SECOND finger taps the top bar's squadron control, then the list's "149" row; what is
//     on screen; then the first finger lifts where it is. What happened to the drag - dropped where it was, put back, or
//     landed on 149's day? The seats of the column read on 142 before, on 149 after, and on 142 again.
//   d (desktop, keys): the mouse holds the same puck and moves it (button down, not released); Tab is pressed until the
//     squadron control has the focus, Enter, then Tab to the "149" row and Enter; then the mouse is released where it is.
//   node raptor-port/scripts/handpass/n175/p4-drag.mjs <d|402x874>
// STAND-IN, named: the phone's two fingers are sent as raw touch events (Chrome's own touch input, CDP
// Input.dispatchTouchEvent) - Playwright has no two-finger press; each touch lands at a control's middle as drawn.
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, wait, toast, tpic, dpic, SZT, boxOf, covered, windowsNow, sayNow } from './p4-lib.mjs'
const SZ = process.argv[2] || 'd', T = SZT(SZ), k = `G.${T}`, P = `p4-drag-${T}`
const SEAT = 'a:0.1.0'
const seats = s => s.page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.page.on .seat[data-slot^="a:0."]')].slice(0, 8).map(e => [e.getAttribute('data-slot'), e.innerText.replace(/\s+/g, ' ').trim()])))
/* every seat of the board in view (any squadron): its words - to see whether a drop landed anywhere on 149 */
const allSeats = s => s.page.evaluate(() => { const o = {}; for (const e of document.querySelectorAll('.page.on .seat[data-slot], .page.on [data-fill], .page.on [data-inpseat]')) { const key = e.getAttribute('data-slot') || e.getAttribute('data-fill') || e.getAttribute('data-inpseat') || 'x'; o[key] = (o[key] ? o[key] + ' | ' : '') + e.innerText.replace(/\s+/g, ' ').trim() } return o })
const diff = (a, b) => { const out = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[key] !== b[key]) out[key] = [a[key] ?? null, b[key] ?? null]; return out }
const dragState = s => s.page.evaluate(() => {
  const vis = e => { const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' }
  const floating = [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); return (c.position === 'fixed' || c.position === 'absolute') && e.classList.contains('puck') && vis(e) }).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' @' + Math.round(e.getBoundingClientRect().top))
  const marked = [...document.querySelectorAll('.lifted, .dragging, .dragsrc, .dropok, .dropbad, [class*=ghost], [class*=lift]')].filter(vis).map(e => String(e.className).slice(0, 40) + ':' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 20)).slice(0, 6)
  return { floatingPucks: floating.slice(0, 4), markedForDrag: marked }
})
const s = await mk(SZ); const { page } = s
try {
  console.log('p4-drag v1', SZ)
  await signIn(s, 'ad', 'a'); await go(s, 'editsched'); await wait(s, 1200)
  const before142 = await seats(s); FACT(`${k}.seats142.before`, before142)
  const src = await boxOf(s, `.page.on .seat[data-slot="${SEAT}"] .puck`)
  const dst = await boxOf(s, `.page.on .seat[data-slot="a:0.3.0"]`)
  if (!src || !dst) throw new Error('no seat drawn')
  const x0 = src.x + src.w / 2, y0 = src.y + src.h / 2, x1 = dst.x + dst.w / 2, y1 = dst.y + dst.h / 2 + 30
  if (s.desk) {
    await page.mouse.move(x0, y0); await page.mouse.down(); await wait(s, 250)
    for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8); await wait(s, 40) }
    FACT(`${k}.holding`, { ...(await dragState(s)), squadron: await barSq(s) })
    await tpic(s, `${P}-0-holding`)
    /* Tab until the squadron control has the focus */
    /* the picker sits before the board in the page's order: Shift+Tab walks back to it (Tab forward went 80 presses
       into the board without reaching it in the first run) */
    let n = 0, at = null; const path = []
    for (; n < 150; n++) { at = await page.evaluate(() => document.activeElement?.id || document.activeElement?.className?.toString().slice(0, 30) || document.activeElement?.tagName); if (n < 6 || n % 20 === 0) path.push(at); if (at === 'sqnMenuBtn') break; await page.keyboard.press('Shift+Tab') }
    FACT(`${k}.shiftTabToPicker`, { presses: n, focus: at, path, scrolled: await page.evaluate(() => Math.round(scrollY)) })
    if (at === 'sqnMenuBtn') {
      await page.keyboard.press('Enter'); await wait(s, 400)
      const rows = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
      FACT(`${k}.listAfterEnter`, rows)
      let m = 0, row = null
      for (; m < 10; m++) { row = await page.evaluate(() => { const a = document.activeElement; return a?.closest('#sqnMenu .sqm-row') ? a.closest('.sqm-row').querySelector('.sqm-num')?.textContent.trim() : (a?.id || a?.tagName) }); if (row === '149') break; await page.keyboard.press(m < 1 ? 'ArrowDown' : 'Tab') }
      FACT(`${k}.keysTo149`, { presses: m, focus: row })
      if (row === '149') { await page.keyboard.press('Enter'); await wait(s, 900) }
    }
    FACT(`${k}.afterKeys.stillHolding`, { squadron: await barSq(s), page: await pageOn(s), ...(await dragState(s)), said: await sayNow(s), seats: await seats(s) })
    globalThis.__board = await allSeats(s)
    await dpic(s, `${P}-1-after-pick-still-holding`, ['.topbar #sqnMenuBtn', `.page.on .seat[data-slot^="a:0."]`], null)
    await page.mouse.up(); await wait(s, 900)
  } else {
    const cdp = await s.ctx.newCDPSession(page)
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: p[2] ?? i })) })
    let p1 = [x0, y0, 1]
    await touch('touchStart', [p1]); await wait(s, 400)
    for (let i = 1; i <= 8; i++) { p1 = [x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8, 1]; await touch('touchMove', [p1]); await wait(s, 50) }
    await wait(s, 300)
    FACT(`${k}.holding`, { ...(await dragState(s)), squadron: await barSq(s) })
    await tpic(s, `${P}-0-holding`)
    const pk = await boxOf(s, '#sqnMenuBtn')
    FACT(`${k}.pickerAsDrawn`, pk ? await covered(s, '#sqnMenuBtn') : 'not drawn')
    if (pk) {
      const p2 = [pk.x + pk.w / 2, pk.y + pk.h / 2, 2]
      /* the second finger down (the first still held), read, then the second finger up alone: a move event carrying only
         the first finger lifts the second (Chrome's touch input releases a finger left out of the list) */
      await touch('touchStart', [p1, p2]); await wait(s, 120)
      FACT(`${k}.secondFingerDown`, { ...(await dragState(s)), said: await sayNow(s) })
      await touch('touchMove', [p1]); await wait(s, 500)
      const rows = await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
      FACT(`${k}.secondFingerOnPicker`, { listRows: rows, ...(await dragState(s)), squadron: await barSq(s) })
      const r = await boxOf(s, '#sqnMenu .sqm-row[data-unit="u149"]')
      if (r) {
        const p3 = [r.x + r.w / 2, r.y + r.h / 2, 3]
        await touch('touchStart', [p1, p3]); await wait(s, 120); await touch('touchMove', [p1]); await wait(s, 900)
      }
      FACT(`${k}.secondFingerOn149`, { rowDrawn: !!r, squadron: await barSq(s), page: await pageOn(s), ...(await dragState(s)), said: await sayNow(s), seats: await seats(s) })
      globalThis.__board = await allSeats(s)
      await dpic(s, `${P}-1-after-pick-still-holding`, ['.topbar #sqnMenuBtn, .topbar .mark', `.page.on .seat[data-slot^="a:0."]`], null)
    }
    await touch('touchEnd', []); await wait(s, 900)
  }
  if (globalThis.__board) FACT(`${k}.boardInViewChangedByRelease`, diff(globalThis.__board, await allSeats(s)))
  FACT(`${k}.afterRelease`, { squadron: await barSq(s), page: await pageOn(s), toast: await toast(s), said: await sayNow(s), ...(await dragState(s)), seats: await seats(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)) })
  await dpic(s, `${P}-2-after-release`, [`.page.on .seat[data-slot^="a:0."]`], null)
  /* back to 142 by the bar's list, as a person would */
  const { reachPick } = await import('./p4-lib.mjs')
  if ((await barSq(s))?.startsWith('149')) { await reachPick(s, 142, 'bar'); await wait(s, 900); if ((await pageOn(s)) !== 'page-editsched') await go(s, 'editsched'); await wait(s, 700) }
  const after142 = await seats(s)
  FACT(`${k}.seats142.after`, { squadron: await barSq(s), seats: after142, sameAsBefore: JSON.stringify(after142) === JSON.stringify(before142) })
  await tpic(s, `${P}-3-back-142`)
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await tpic(s, `${P}-error`).catch(() => {}); process.exitCode = 1 } finally { await closeAll() }
