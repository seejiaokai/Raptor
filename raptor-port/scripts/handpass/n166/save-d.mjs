// save-d - case D: a save still going, and a save that failed ("Not saved" with Retry), then a pick of 149.
//   (d1) Saber edits an input's Remarks on Inputs and presses its Save; the pick is pressed straight after, before the
//        app's short wait to send it is over (it waits about 0.3 s): what the save sign said, where the save landed.
//   (d2) STAND-IN: the browser's storage refuses every write (localStorage.setItem throws QuotaExceededError), installed
//        from inside the page just before the Save - a full or locked browser storage. The save fails, the band "Not
//        saved" with Retry stands; the pick is pressed; then the stand-in is lifted and Retry pressed: where did the
//        save land (142's record, or not at all)?
//   node raptor-port/scripts/handpass/n166/save-d.mjs <d|402x874>    (ONLY=d1,d2)
// Pictures: D-<d|p>-*.png
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, pic, windowsNow, reachPick, wait, bands, boxOf, covered, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd', T = SZTAG(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
const status = s => s.page.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent.replace(/\s+/g, ' ').trim()))
/* where the words are kept in this browser's storage: every key whose value holds them */
const storedWith = (s, w) => s.page.evaluate(w => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if ((localStorage.getItem(k) || '').includes(w)) out.push(k) } return out }, w)
async function openFirstInput(s) {
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
  const iid = await row.getAttribute('data-iid'); const who = (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40)
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  return { iid, who }
}
async function typeAndSave(s, words) {
  const r = vis(s, '#inpEditRmk').first(); await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(words)
  const b = await boxOf(s, '#inpEditSave'); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2)
}
async function d1() {
  const k = `D.${T}.d1-saving`, P = `D-${T}-d1`, W = 'N166D1 words'
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    const inp = await openFirstInput(s); FACT(`${k}.input`, inp.who)
    await typeAndSave(s, W)
    await wait(s, 60)
    FACT(`${k}.signBeforePick`, await status(s)); FACT(`${k}.windowsBeforePick`, (await windowsNow(s)).map(w => w.what))
    const did = await reachPick(s, 149, SZ === 'd' ? 'bar' : 'bar')
    FACT(`${k}.press`, did)
    FACT(`${k}.after`, { squadron: await barSq(s), sign: await status(s), bands: await bands(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 70)) })
    await pic(s, `${P}-1-after-pick`)
    await wait(s, 1500)
    FACT(`${k}.storedUnder`, await storedWith(s, W))
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
async function d2() {
  const k = `D.${T}.d2-failed`, P = `D-${T}-d2`, W = 'N166D2 words'
  const s = await mk(SZ); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    const inp = await openFirstInput(s); FACT(`${k}.input`, inp.who)
    await page.evaluate(() => { window.__n166 = { hits: 0, real: Storage.prototype.setItem }; Storage.prototype.setItem = function () { window.__n166.hits++; throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') } })
    FACT(`${k}.standIn`, 'browser storage refuses every write (localStorage.setItem throws), from just before the Save')
    await typeAndSave(s, W)
    await wait(s, 2500)
    FACT(`${k}.windowsAfterSave`, (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 70)))
    FACT(`${k}.signBeforePick`, await status(s)); FACT(`${k}.bandsBeforePick`, await bands(s))
    FACT(`${k}.pickerCovered`, await covered(s, '#sqnMenuBtn'))
    await pic(s, `${P}-1-not-saved`)
    const did = await reachPick(s, 149, 'bar')
    FACT(`${k}.press`, did)
    await wait(s, 600)
    FACT(`${k}.after`, { squadron: await barSq(s), page: await pageOn(s), sign: await status(s), bands: await bands(s), retryDrawn: !!(await vis(s, 'button').filter({ hasText: /^Retry$/ }).count()) })
    await pic(s, `${P}-2-after-pick`)
    /* the stand-in lifted, then Retry as a person presses it */
    await page.evaluate(() => { Storage.prototype.setItem = window.__n166.real })
    FACT(`${k}.standInLifted`, true)
    if (await vis(s, 'button').filter({ hasText: /^Retry$/ }).count()) { await hit(s, vis(s, 'button').filter({ hasText: /^Retry$/ }).first(), 1500); FACT(`${k}.retryPressed`, true) } else FACT(`${k}.retryPressed`, 'no Retry drawn')
    FACT(`${k}.afterRetry`, { squadron: await barSq(s), sign: await status(s), bands: await bands(s), storedUnder: await storedWith(s, W) })
    await pic(s, `${P}-3-after-retry`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('save-d v1', SZ)
  if (!ONLY.length || ONLY.includes('d1')) await d1()
  if (!ONLY.length || ONLY.includes('d2')) await d2()
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
