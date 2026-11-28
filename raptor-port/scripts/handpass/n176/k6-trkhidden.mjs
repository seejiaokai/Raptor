// k6 - N12: a Tracker window hidden behind the Flow chart tab. Three-squadron world (k0). Saber (master admin) on 142's
// Tracker at a desktop's width (1536×864):
//   1. "No. of Down Days" pressed (the demo counts none, so it may open nothing - read); then the Info panel's other
//      window of the same kind, "Failures" (its title pressed) - the Down days window is "a clone of the Failures list's
//      window" (core.js) - opened.
//   2. The browser narrowed to 1000 wide (the window's size changed, as a person drags a browser's edge): which half shows
//      (Flow chart / Info), is the window in sight, is anything on screen saying a window is open.
//   3. The Schedules menu → 149: what happens to the window. 4. Back to 142, the Info tab pressed: is it there again?
//   node raptor-port/scripts/handpass/n176/k6-trkhidden.mjs
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, reachPick, windowsNow, toastNow, world } from './k-lib.mjs'
const K = 'k6', P = 'k6-d'
const WIN = '#failLog, #downLog'
const state = s => s.page.evaluate(() => {
  const vis = e => { if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); if (!(b.width > 2 && b.height > 2) || c.visibility === 'hidden' || c.display === 'none') return false; for (let p = e; p; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden') return false } return b.right > 0 && b.left < innerWidth && b.bottom > 0 && b.top < innerHeight }
  const w = document.querySelector('#failLog, #downLog')
  const tabs = [...document.querySelectorAll('button[data-view]')].map(b => ({ view: b.dataset.view, active: b.classList.contains('active'), shown: vis(b), words: b.textContent.trim() }))
  return { width: innerWidth, window: w ? { id: w.id, inDom: true, seen: vis(w), words: w.innerText.replace(/\s+/g, ' ').trim().slice(0, 100) } : { inDom: false }, tabs: tabs.filter(t => t.shown).map(t => t.words + (t.active ? ' (showing)' : '')), root: document.querySelector('.tr-root')?.className ?? null, failTitleExpanded: document.querySelector('#failTitle')?.getAttribute('aria-expanded') ?? null }
})
try {
  console.log('k6-trkhidden v1')
  const s = await mk('d', { storageState: await world() }); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 800)
    const ddNow = () => page.evaluate(() => { const b = document.querySelector('#downDays'); return b ? { label: b.getAttribute('aria-label'), greyed: b.getAttribute('aria-disabled') === 'true' } : 'not drawn' })
    let dd = await ddNow()
    FACT(`${K}.1.downDays`, dd)
    if (dd !== 'not drawn' && dd.greyed) {
      /* the demo counts none until the course start is set: "Course start" → a day (Mon 2 Nov 2026), by its date box */
      await hit(s, '#courseStart', 600)
      const day = page.locator('[data-testid="dcal-card"] [data-iso="2026-11-02"]').first()
      if (await day.count()) await hit(s, day, 700)
      if (await page.locator('[data-testid="dcal-card"]').count()) { await page.keyboard.press('Escape'); await wait(s, 300) }
      dd = await ddNow(); FACT(`${K}.1.afterCourseStart`, dd)
    }
    if (dd !== 'not drawn' && !dd.greyed) await hit(s, '#downDays', 800)
    let opened = await page.evaluate(() => !!document.querySelector('#downLog'))
    FACT(`${K}.1.downLogOpened`, opened)
    if (!opened) { await hit(s, '#failTitle', 700); FACT(`${K}.1.instead`, 'Down days could not be opened; the Failures window opened instead') }
    FACT(`${K}.1.window`, await state(s))
    await shot(s, `${P}-1-open-1536`, [WIN], null, 12)
    /* 2. narrowed */
    s.W = 1000; await page.setViewportSize({ width: 1000, height: 864 }); await wait(s, 1200)
    FACT(`${K}.2.narrow1000`, { ...(await state(s)), topBar: await page.evaluate(() => ({ picker: !!document.querySelector('#sqnMenuBtn') && document.querySelector('#sqnMenuBtn').getBoundingClientRect().width > 0, burger: !!document.querySelector('#burger') && document.querySelector('#burger').getBoundingClientRect().width > 0 })) })
    await shot(s, `${P}-2-narrow-1000`, ['button[data-view="info"]', '.topbar .mark'], null, 12)
    /* 3. pick 149 */
    const via = (await page.evaluate(() => { const b = document.querySelector('#sqnMenuBtn'); return b && b.getBoundingClientRect().width > 0 })) ? 'bar' : 'menu'
    const p9 = await reachPick(s, 149, via); await wait(s, 900)
    FACT(`${K}.3.pick149`, { reach: p9, squadron: await barSq(s), page: await pageOn(s), toast: await toastNow(s), ...(await state(s)) })
    await shot(s, `${P}-3-after-pick149`, ['.topbar .mark', 'button[data-view="info"]'], null, 12)
    /* the Info tab on 149 */
    if (await vis(s, 'button[data-view="info"]').count()) { await hit(s, 'button[data-view="info"]', 700); FACT(`${K}.3.info149`, await state(s)); await scratch(s, `${P}-3b-info-149`) }
    /* 4. back to 142, the Info tab */
    await reachPick(s, 142, via); await wait(s, 900)
    if (await vis(s, 'button[data-view="info"]').count()) await hit(s, 'button[data-view="info"]', 700)
    FACT(`${K}.4.back142Info`, { squadron: await barSq(s), ...(await state(s)) })
    await shot(s, `${P}-4-back142-info`, [WIN, 'button[data-view="info"]', '.topbar .mark'], null, 12)
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
