// k2 - the Tracker's marking window (N7; his D2597's open question). Three-squadron world (k0). Saber (master admin) on
// 142's Tracker presses an event's ball: the marking window opens. Each of its controls pressed, then the browser's saved
// data read (which keys changed; the Tracker's records are `raptor:tracker/*`):
//   a. Fails +   b. Fails −   c. "Done on": the date box → a day (Mon 23 Nov 2026)   d. a grade (DCO)   e. Close
//   (the window re-opened by the same ball where a press closed it). Any box to type in is listed.
// Then, with it open: the Schedules menu (the squadron picker; a phone: ☰ → its squadron line) → 149: what the first
// press does to the window, whether the list opens in that same press, and where the pick lands. Then the same → 150.
//   node raptor-port/scripts/handpass/n176/k2-trkmark.mjs <d|p>
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, reachPick, windowsNow, toastNow, covered, boxOf, tapCentre, store, diffKeys, world, tag } from './k-lib.mjs'
const SZ = process.argv[2] === 'p' ? 'p' : 'd'
const POP = '#pop'
async function trk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 800) }
async function pressBall(s, want) {
  const id = want || await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 160 || cx > innerWidth - 10 || cy > innerHeight - 120) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
  if (!id) throw new Error('no event ball free to press')
  const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await wait(s, 900); return id
}
const popNow = s => s.page.evaluate(() => { const p = document.querySelector('#pop'); if (!p) return null; const b = p.getBoundingClientRect(); if (!(b.width > 2)) return null; return { title: p.querySelector('#popTitle')?.textContent.trim(), fails: p.querySelector('#failCount')?.textContent.trim(), done: p.querySelector('#popDoneDate')?.getAttribute('aria-label'), boxes: [...p.querySelectorAll('input, textarea, select, [contenteditable="true"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}#${e.id}`), buttons: [...p.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent.trim() || e.getAttribute('aria-label') || '?').slice(0, 22)) } })
const trkKeys = ks => ks.map(k => k.replace(/^raptor:/, '')).slice(0, 10)
async function readAfter(s, k, before, what) {
  await wait(s, 900)
  const after = await store(s); const ks = diffKeys(before, after)
  FACT(k, { what, savedKeys: trkKeys(ks), saved: ks.length > 0, windowStill: await popNow(s), toast: await toastNow(s), saveBtn: await s.page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /Save changes/.test(b.textContent)).map(b => b.textContent.trim())) })
  return after
}
const via = s => (s.desk ? 'bar' : 'menu')
try {
  console.log('k2-trkmark v1', SZ)
  const st = await world()
  const s = await mk(SZ, { storageState: st }); const { page } = s; const T = tag(s); const K = `k2.${T}`, P = `k2-${T}`
  try {
    await signIn(s, 'ad', 'a')
    await trk(s)
    let snapA = await store(s)
    const id = await pressBall(s)
    FACT(`${K}.0.opened`, { squadron: await barSq(s), ball: id, window: await popNow(s) })
    await shot(s, `${P}-1-open`, [POP], null, 12)
    snapA = await readAfter(s, `${K}.0.openRead`, snapA, 'the ball pressed, the window open')
    const reopen = async () => { if (!(await popNow(s))) { await pressBall(s, id); return 'reopened by the same ball' } return 'still open' }
    /* a. Fails + */
    await hit(s, '#popFailPlus', 300); snapA = await readAfter(s, `${K}.a.failPlus`, snapA, 'Fails + pressed')
    FACT(`${K}.a.reopen`, await reopen())
    /* b. Fails − */
    await hit(s, '#popFailMinus', 300); snapA = await readAfter(s, `${K}.b.failMinus`, snapA, 'Fails − pressed')
    FACT(`${K}.b.reopen`, await reopen())
    /* c. Done on: the date box → a day */
    await hit(s, '#popDoneDate', 600)
    const card = await page.evaluate(() => { const c = document.querySelector('[data-testid="dcal-card"]'); return c ? c.getAttribute('aria-label') : null })
    const dayBtn = page.locator('[data-testid="dcal-card"] [data-iso="2026-11-23"]').first()
    if (card && await dayBtn.count()) {
      await hit(s, dayBtn, 500)
      snapA = await readAfter(s, `${K}.c.doneOnDay`, snapA, { card, picked: 'Mon 23 Nov 2026' })
    } else FACT(`${K}.c.doneOnDay`, { card, dayButton: false, window: await popNow(s) })
    if (await page.locator('[data-testid="dcal-card"]').count()) { await page.keyboard.press('Escape'); await wait(s, 300) }
    FACT(`${K}.c.reopen`, await reopen())
    /* d. a grade */
    await shot(s, `${P}-2-before-grade`, [`${POP} button[data-g="dco"]`], [POP], 12)
    await hit(s, `${POP} button[data-g="dco"]`, 500); snapA = await readAfter(s, `${K}.d.gradeDCO`, snapA, 'DCO pressed')
    if (!s.desk) await shot(s, `${P}-2b-tap-grade`, [`#flowSvg .ball[data-id="${id}"]`], null, 60)
    FACT(`${K}.d.reopen`, await reopen())
    /* e. Close */
    const close = page.locator(`${POP} .opts button`).filter({ hasText: /^Close$/ }).first()
    if (await close.count()) { await hit(s, close, 400); snapA = await readAfter(s, `${K}.e.close`, snapA, 'Close pressed') }
    FACT(`${K}.e.reopen`, await reopen())
    /* the pick with it open: the first press, then the list's row */
    FACT(`${K}.f.beforePick`, { squadron: await barSq(s), window: await popNow(s), controls: { picker: (await boxOf(s, '#sqnMenuBtn')) ? await covered(s, '#sqnMenuBtn') : 'not drawn', menu: (await boxOf(s, '#burger')) ? await covered(s, '#burger') : 'not drawn' } })
    await shot(s, `${P}-3-before-pick149`, [POP, s.desk ? '#sqnMenuBtn' : '#burger'], null, 12)
    const first = s.desk ? '#sqnMenuBtn' : '#burger'
    await tapCentre(s, first); await wait(s, 400)
    const afterFirst = { window: await popNow(s), listOpen: await page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row, #drawerSqnList .sqm-row, #drawerSqnBtn')].some(e => e.getBoundingClientRect().width > 0)), menuOpen: await page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open')) }
    FACT(`${K}.f.firstPress`, { control: s.desk ? 'the Schedules menu (top bar)' : '☰', ...afterFirst })
    await shot(s, `${P}-4-after-first-press`, [s.desk ? '#sqnMenu' : '#drawer', s.desk ? '#sqnMenuBtn' : '#burger'], null, 12)
    /* the rest of the pick as a person makes it (the list open: its row; else the press again) */
    if (s.desk) { await page.keyboard.press('Escape').catch(() => {}); await wait(s, 300) }
    else { const { shut } = await import('./k-lib.mjs'); await shut(s) }
    const p9 = await reachPick(s, 149, via(s)); await wait(s, 900)
    FACT(`${K}.f.pick149`, { reach: p9, squadron: await barSq(s), page: await pageOn(s), window: await popNow(s), toast: await toastNow(s) })
    await shot(s, `${P}-5-after-pick149`, ['.topbar .mark', '#sqnMenuBtn, #burger'], null, 12)
    /* the same on 142 again, then 150 */
    await reachPick(s, 142, via(s)); await wait(s, 900); await trk(s)
    await pressBall(s, id)
    FACT(`${K}.g.reopened142`, { squadron: await barSq(s), window: await popNow(s) })
    const p0 = await reachPick(s, 150, via(s)); await wait(s, 900)
    FACT(`${K}.g.pick150`, { reach: p0, squadron: await barSq(s), page: await pageOn(s), window: await popNow(s), trackerText: (await page.evaluate(() => document.querySelector('.page.on')?.innerText.replace(/\s+/g, ' ').slice(0, 160))) })
    await shot(s, `${P}-6-after-pick150`, ['.topbar .mark', '#sqnMenuBtn, #burger'], null, 12)
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
