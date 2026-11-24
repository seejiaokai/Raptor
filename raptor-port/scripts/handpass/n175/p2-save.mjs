// p2-save - P2 case 6 (H8; C27; F9, A35): a save still going when a pick is pressed, which then FAILS after the pick.
// Saber on 142, Inputs → the first input → Remarks typed → Save; the squadron pick of 149 pressed AT ONCE (the picker and
// its 149 row pressed with no pause - the app waits about 0.3 s before it sends a save, so the save is still "Saving…"
// when the pick lands and is sent after it).
// STAND-IN (named): the browser's storage refuses every write (localStorage.setItem throws QuotaExceededError), installed
// from inside the page just before the Save - n166 save-d's stand-in. So the save, sent after the pick, fails there.
// Read: the save sign at the pick, the squadron after the pick, where the "Not saved" band stands and its words, what
// Retry does while it still fails, then (stand-in lifted) Retry pressed on 149: the squadron, the band, and which
// saved record holds the words (the input's own record - its key and its fields).
//   node raptor-port/scripts/handpass/n175/p2-save.mjs <d|p>
// Pictures: p2-save-<d|p>-<what>.png
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, windowsNow, bands, boxOf, toastNow, shut } from './lib.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p2'
const W = 'N175 slow save'
const sign = s => s.page.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent.replace(/\s+/g, ' ').trim()))
const storedWith = (s, w) => s.page.evaluate(w => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k) || ''; if (v.includes(w)) { let f = ''; try { const r = JSON.parse(v); f = ` {person:${r.person}, date:${r.date}, unit:${r.u ?? r.unit ?? '(none)'}}` } catch {} out.push(k + f) } } return out }, w)
async function tapNow(s, sel) { const b = await boxOf(s, sel); if (!b) return false; if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); return true }
const rowSel = (root) => `${root} .sqm-row[data-n175pick]`
async function markRow(s, root) { return s.page.evaluate(r => { const e = [...document.querySelectorAll(r + ' .sqm-row')].find(x => x.getBoundingClientRect().width > 0 && x.querySelector('.sqm-num')?.textContent.trim() === '149'); if (e) e.setAttribute('data-n175pick', '1'); return !!e }, root) }
/* the pick of 149 as fast as a quick hand: no pause between the presses */
async function fastPick(s) {
  const t0 = Date.now(); const out = {}
  if (s.desk) {
    await tapNow(s, '#sqnMenuBtn'); await s.page.waitForSelector('#sqnMenu .sqm-row', { timeout: 2000 }).catch(() => {})
    await markRow(s, '#sqnMenu'); out.signAtRow = await sign(s); await tapNow(s, rowSel('#sqnMenu'))
  } else {
    await tapNow(s, '#burger'); await s.page.waitForTimeout(60)
    if (!(await s.page.locator('#drawerSqnList .sqm-row').count())) { await tapNow(s, '#drawerSqnBtn'); await s.page.waitForTimeout(60) }
    await markRow(s, '#drawerSqnList'); out.signAtRow = await sign(s); await tapNow(s, rowSel('#drawerSqnList'))
  }
  out.ms = Date.now() - t0
  return out
}
const s = await mk(SZ); const { page } = s
const k = `p2.save.${SZ}`, P = `p2-save-${SZ}`
try {
  console.log('p2-save v1', SZ)
  await signIn(s, 'ad', 'a')
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
  FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  const r = vis(s, '#inpEditRmk').first()
  if (s.desk) { await r.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(W) } else await r.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, W)
  await page.evaluate(() => { window.__n175 = { hits: 0, real: Storage.prototype.setItem }; Storage.prototype.setItem = function () { window.__n175.hits++; throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') } })
  FACT(`${k}.standIn`, 'browser storage refuses every write (localStorage.setItem throws), from just before the Save')
  await tapNow(s, '#inpEditSave')
  FACT(`${k}.signRightAfterSave`, await sign(s))
  const fp = await fastPick(s)
  FACT(`${k}.pick`, fp)
  FACT(`${k}.signRightAfterPick`, { sign: await sign(s), squadron: await barSq(s) })
  await wait(s, 2500)
  FACT(`${k}.afterFail`, { squadron: await barSq(s), page: await pageOn(s), sign: await sign(s), bands: await bands(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)), refusedWrites: await page.evaluate(() => window.__n175.hits) })
  await shot(s, `${P}-1-not-saved-on-149`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '.savestat.failed'], null, 20)
  /* a phone: the ☰ menu is still open after the pick - closed as a person does, by a tap beside it */
  if (!s.desk) { FACT(`${k}.menuStillOpen`, await page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))); await shut(s); await scratch(s, SEC, `${P}-1b-menu-closed`) }
  /* Retry while storage still refuses */
  const retry = () => vis(s, 'button').filter({ hasText: /^Retry$/ }).first()
  if (await retry().count()) { await hit(s, retry(), 1500); FACT(`${k}.retryStillFailing`, { squadron: await barSq(s), sign: await sign(s), bands: await bands(s), toast: await toastNow(s) }) }
  /* the stand-in lifted, Retry pressed on 149 */
  await page.evaluate(() => { Storage.prototype.setItem = window.__n175.real })
  FACT(`${k}.standInLifted`, true)
  if (await retry().count()) { await hit(s, retry(), 1500); FACT(`${k}.retryPressed`, true) } else FACT(`${k}.retryPressed`, 'no Retry drawn')
  FACT(`${k}.afterRetry`, { squadron: await barSq(s), page: await pageOn(s), sign: await sign(s), bands: await bands(s), toast: await toastNow(s), storedUnder: await storedWith(s, W) })
  await shot(s, `${P}-2-after-retry`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 30)
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await closeAll() }
