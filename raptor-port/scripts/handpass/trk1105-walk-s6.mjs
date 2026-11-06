/* S6 — a save that fails while the Tracker is open (D admin Chromium; P member WebKit).  node scripts/handpass/trk1105-walk-s6.mjs
   The fixture: Storage.prototype.setItem throws a quota error for raptor: keys while window.__failSaves is true. */
import { open, back, keys, words, pair, grade, mark, click, shot, tap2, pickDay, setFail, greenPixels, cornerRect, retryBtn, mk, sleep, D, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s6 v1')
const L = mk('S6')
for (const [tag, engine, size, touch, who] of [['D', 'chromium', D, false, 'a'], ['P', 'webkit', P, true, 'u']]) {
  const role = who === 'a' ? 'admin' : 'member'
  const { browser, page, errors } = await open({ engine, size, touch, who, fail: true })
  await mark(page, 'ST-02', 'dco', touch); await sleep(1500)
  let w = await words(page)
  const clip0 = await cornerRect(page)
const barTop = () => page.evaluate(() => { const e = document.getElementById('hSearch') || document.getElementById('courseSel'); return Math.round(e.getBoundingClientRect().top) })
const top0 = await barTop()
let clip = clip0
  const g0 = clip ? await greenPixels(page, clip) : null
  L.ok('mark ST-02 saved: corner shows words, no band', tag, role, /saved/.test(w.corner) && !w.band, `corner "${w.corner}" band "${w.band}" greenPx ${g0 && g0.green}`, await shot(page, `S6-${tag}-1-saved`))
  await setFail(page, true)
  await mark(page, 'ST-01', 'dco', touch, 1500)
  if (touch) await click(page, '#page-tracker button[data-view="info"]', touch)
  await click(page, '#lastCurr', touch); await pickDay(page, 2, touch); await sleep(3500)
  w = await words(page)
  clip = { ...clip0, y: clip0.y + (await barTop()) - top0 }
  const gp = clip ? await greenPixels(page, clip) : null
  const nowPic = await shot(page, `S6-${tag}-2-failed`)
  L.ok('failed: Raptor band "Not saved — keep this page open" with Retry', tag, role, /Not saved/.test(w.band) && w.retry, `band "${w.band}" retry ${w.retry}`, nowPic)
  L.ok('failed: corner draws nothing (element) ', tag, role, w.corner === '', `corner "${w.corner}"`)
  L.ok('failed: corner area holds no saved-green pixels (pixels judged)', tag, role, !!gp && gp.green === 0, `greenPx ${gp && gp.green} (was ${g0 && g0.green}) clip ${JSON.stringify(clip)}`)
  L.ok('no "saved" anywhere on the bar', tag, role, !(await page.evaluate(() => [...document.querySelectorAll('#page-tracker .controls, #page-tracker header, .topbar')].some(e => /● saved|\bsaved\b/i.test(e.innerText || '') && e.getBoundingClientRect().width > 1 && !/Not saved/.test(e.innerText)))), '')
  // Retry while still failing
  if (touch) { const p = await tap2(page, retryBtn(page), `S6-${tag}-3-retry-still-failing`) } else { await retryBtn(page).click() }
  await sleep(2500)
  w = await words(page); const gp2 = clip ? await greenPixels(page, clip) : null
  L.ok('Retry while still failing: band stays, corner silent', tag, role, /Not saved/.test(w.band) && w.corner === '' && gp2.green === 0, `band "${w.band}" corner "${w.corner}" greenPx ${gp2 && gp2.green}`, await shot(page, `S6-${tag}-4-retry-failed`))
  // succeed
  await setFail(page, false)
  if (touch) await tap2(page, retryBtn(page), `S6-${tag}-5-retry-ok`); else await retryBtn(page).click()
  await sleep(2500)
  w = await words(page)
  L.ok('block lifted + Retry: band goes, corner words come back', tag, role, !w.band && /saved/.test(w.corner), `band "${w.band}" corner "${w.corner}"`, await shot(page, `S6-${tag}-6-recovered`))
  await page.reload(); await back(page, who, touch)
  const gs = [await grade(page, 'ST-02'), await grade(page, 'ST-01')]
  if (touch) await click(page, '#page-tracker button[data-view="info"]', touch)
  const cv = (await page.locator('#lastCurr').innerText()).trim()
  L.ok('reload: both marks and the typed day are there', tag, role, gs[0] === 'dco' && gs[1] === 'dco' && /2 Nov/.test(cv), `grades ${gs}; currency ${cv}`, await shot(page, `S6-${tag}-7-reload`))
  L.note('errors', errors.join(' | ').slice(0, 500) || 'none')
  await browser.close()
}
L.save('S6')
