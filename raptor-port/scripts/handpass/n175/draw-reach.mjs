// draw-reach - [MSQ-PICK-GUARD] the second questions page, drawing D2: the way to reach Logout on a phone with a window
// open (his D2592) - two options, each on the REAL app at 402x874 (chat 175, 25 Nov 26). Today an Input window fills an
// upright phone and its title strip covers ☰, where Logout lives.
//  d2a - THE TOP BAR STAYS IN REACH: on a phone a window stands UNDER the top bar (the rule the app already keeps for
//        three desktop windows, his D1645 - "the grey starts at the bar's foot"). The one transform: the window's top is
//        moved to the bar's foot plus the gap it keeps from the screen's edge today, its foot staying where it is (so it
//        is shorter by that much and its middle scrolls). Nothing is added. ☰ is then pressed FOR REAL and the app's own
//        menu opens over the window, Logout in it. Also drawn over one more window: a SANS day.
//  d2b - A LOGOUT BUTTON ON THE WINDOW'S OWN STRIP: the app's own Logout button (the ☰ menu's, cloned - same size, same
//        look) placed in the window's title strip, before its ✕. The window does not move; nothing else becomes reachable.
//   node raptor-port/scripts/handpass/n175/draw-reach.mjs        (ONLY=d2a,d2a-sans,d2b)
// Pictures: drawn/d2a-p-window, d2a-p-menu, d2a-p-sansday, d2b-p-window (each + -crop; in the crop only, the control the
// option is about is ringed 3px #e6007e - the ring is the drawing's, not the design's).
import { closeAll, FACT, signIn, go, wait, boxOf, covered, vis, hit, run, want, DRAWN, openInput, inputWin, note } from './draw-lib.mjs'

const frontWin = '.floatwin'
/* the whole picture, then the crop with the named control ringed (an outline, which takes no room), then the ring off */
async function pair(s, name, ringSel, clip) {
  await s.page.waitForTimeout(200)
  await s.page.screenshot({ path: `${DRAWN}/${name}.png` })
  await s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 1); if (e) { e.dataset.n175ring = '1'; e.style.outline = '3px solid #e6007e'; e.style.outlineOffset = '3px' } }, ringSel)
  await s.page.screenshot({ path: `${DRAWN}/${name}-crop.png`, clip })
  await s.page.evaluate(() => document.querySelectorAll('[data-n175ring]').forEach(e => { e.style.outline = ''; e.style.outlineOffset = ''; delete e.dataset.n175ring }))
  FACT(`${name}.crop`, { ...clip, ringed: ringSel }); note('picture', `${name}.png + -crop`)
}
const reach = async s => ({ burger: await covered(s, '#burger'), squadronPicker: await covered(s, '#sqnMenuBtn'), bell: await covered(s, '#notifyBell'), syncDot: await covered(s, '#fastSync'), undo: await covered(s, '.topbar [aria-label^="Undo"], .topbar #undoBtn') })
/* THE ONE TRANSFORM OF d2a: every window drawn over the top bar stands under it instead - top at the bar's foot plus the
   gap the window keeps from the screen's edge today; its foot where it is */
async function underTheBar(s, k) {
  const r = await s.page.evaluate(sel => {
    const bar = document.querySelector('.topbar').getBoundingClientRect()
    const out = []
    for (const w of document.querySelectorAll(sel)) {
      const b = w.getBoundingClientRect(); if (!(b.width > 1 && b.height > 1) || b.top >= bar.bottom) continue
      const gap = Math.max(0, Math.round(b.left)), top = Math.round(bar.bottom) + gap, foot = Math.round(b.bottom)
      w.style.setProperty('top', top + 'px', 'important'); w.style.setProperty('height', (foot - top) + 'px', 'important'); w.style.setProperty('max-height', (foot - top) + 'px', 'important')
      const a = w.getBoundingClientRect()
      const sc = [...w.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)).map(e => `${e.className || e.tagName}: ${e.scrollHeight - e.clientHeight}px more to scroll`)
      out.push({ window: w.className, before: [b.left, b.top, b.width, b.height].map(Math.round), after: [a.left, a.top, a.width, a.height].map(Math.round), barFoot: Math.round(bar.bottom), shorterBy: Math.round(b.height - a.height), scrollsInside: sc })
    }
    return out
  }, frontWin)
  FACT(`${k}.transform`, r)
  if (!r.length) throw new Error('no window stood over the top bar')
  await wait(s, 300)
  return r
}

if (want('d2a')) await run('d2a', 'p', async s => {
  const k = 'd2a'
  await signIn(s, 'ad', 'a'); FACT(`${k}.opened`, await openInput(s, 0, 'N175 typed words'))
  FACT(`${k}.today.reach`, await reach(s))
  await underTheBar(s, k)
  FACT(`${k}.after.reach`, await reach(s)); FACT(`${k}.window`, await inputWin(s))
  const w = await boxOf(s, '.inpedwin'), foot = await s.page.evaluate(() => { const e = document.querySelector('.inpedwin #inpEditSave'); const b = e?.getBoundingClientRect(); return b ? { saveInSight: b.bottom <= innerHeight && b.top >= 0, saveBox: [b.left, b.top, b.width, b.height].map(Math.round) } : null })
  FACT(`${k}.windowBox`, w); FACT(`${k}.windowFoot`, foot)
  await pair(s, 'd2a-p-window', '#burger', { x: 0, y: 0, width: s.W, height: 240 })
  /* ☰ pressed for real: the app's own menu, over the window */
  await hit(s, '#burger', 600)
  const menu = await s.page.evaluate(() => { const d = document.querySelector('#drawer'); const lo = document.querySelector('#drawerLogout'); const b = lo.getBoundingClientRect(); const at = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { open: d.classList.contains('open'), lines: [...d.querySelectorAll('.drawer-panel button, .drawer-panel a')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()), logout: { words: lo.textContent.trim(), box: [b.left, b.top, b.width, b.height].map(Math.round), inFront: at === lo || lo.contains(at) } } })
  FACT(`${k}.menu`, menu)
  FACT(`${k}.alsoReachable`, 'in the menu: the squadron list, "Switch to the member view" and the page names; on the bar: Undo, Redo, the sync dot and the bell')
  if (!menu.open || !menu.logout.inFront) throw new Error('the menu did not open over the window')
  await pair(s, 'd2a-p-menu', '#drawerLogout', { x: 0, y: 0, width: s.W, height: 560 })
})
if (want('d2a-sans')) await run('d2a.sans', 'p', async s => {
  const k = 'd2a.sans'
  await signIn(s, 'ad', 'a')
  await go(s, 'inputs'); await hit(s, '#inSansMode', 800)
  const d = vis(s, '[data-testid="sc-grid"] [data-testid^="sc-"]').nth(10); await hit(s, d, 700)
  FACT(`${k}.window`, await s.page.evaluate(() => [...document.querySelectorAll('.floatwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 60))))
  FACT(`${k}.today.reach`, await reach(s))
  await underTheBar(s, k)
  FACT(`${k}.after.reach`, await reach(s))
  await pair(s, 'd2a-p-sansday', '#burger', { x: 0, y: 0, width: s.W, height: 240 })
})
if (want('d2b')) await run('d2b', 'p', async s => {
  const k = 'd2b'
  await signIn(s, 'ad', 'a')
  /* the app's own Logout button, read from the ☰ menu (opened and closed again) */
  await hit(s, '#burger', 500)
  const src = await s.page.evaluate(() => { const b = document.querySelector('#drawerLogout'), r = b.getBoundingClientRect(), c = getComputedStyle(b); return { html: b.outerHTML, size: [Math.round(r.width), Math.round(r.height)], font: c.fontSize + ' ' + c.fontWeight, bg: c.backgroundColor, border: c.borderTopColor } })
  FACT(`${k}.theAppsLogout`, src)
  await s.page.touchscreen.tap(s.W - 8, 500); await wait(s, 500)
  FACT(`${k}.opened`, await openInput(s, 0, 'N175 typed words'))
  const r = await s.page.evaluate(html => {
    const bx = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
    const w = [...document.querySelectorAll('.inpedwin')].find(e => e.getBoundingClientRect().width > 0), bar = w.querySelector('.win-bar'), x = bar.querySelector('.win-x'), ttl = bar.querySelector('.win-ttl')
    const before = { title: bx(ttl), x: bx(x), strip: bx(bar) }
    const h = document.createElement('div'); h.innerHTML = html
    const b = h.firstElementChild; b.id = 'n175logout'; b.style.flex = '0 0 auto'; b.style.marginRight = '8px'
    bar.insertBefore(b, x)
    const c = getComputedStyle(b)
    return { before, after: { title: bx(ttl), x: bx(x), strip: bx(bar) }, button: { words: b.textContent.trim(), box: bx(b), font: c.fontSize + ' ' + c.fontWeight, bg: c.backgroundColor, border: c.borderTopColor }, gapToX: Math.round(x.getBoundingClientRect().left - b.getBoundingClientRect().right), titleWords: ttl.textContent.trim(), titleCut: ttl.scrollWidth > ttl.clientWidth + 1 }
  }, src.html)
  FACT(`${k}.button`, r)
  FACT(`${k}.sameAsTheAppsLogout`, { size: r.button.box.w === src.size[0] && r.button.box.h === src.size[1] ? `yes, ${src.size[0]}x${src.size[1]}` : `NO: ${r.button.box.w}x${r.button.box.h} against ${src.size.join('x')}`, look: r.button.font === src.font && r.button.bg === src.bg && r.button.border === src.border ? 'yes - letters, surface and edge' : { drawn: r.button, real: src } })
  FACT(`${k}.reach`, { ...(await reach(s)), note: 'only Logout is added; ☰, the squadron list, the member-view line and the bell stay covered as today' })
  await pair(s, 'd2b-p-window', '#n175logout', { x: 0, y: 0, width: s.W, height: 240 })
})
await closeAll()
