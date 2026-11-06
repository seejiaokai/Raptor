/* S15 — first visit: the pair before the Tracker's code has loaded (D admin Chromium; phone size in Chromium touch, since WebKit
   has no network throttle).   node scripts/handpass/trk1105-walk-s15.mjs */
import { open, pair, grade, mark, shot, mk, sleep, D, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s15 v1')
const L = mk('S15')
for (const [tag, size, touch] of [['D', D, false], ['P', P, true]]) {
  const { browser, page, errors, ctx } = await open({ engine: 'chromium', size, touch, who: 'a', tracker: false })
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 500, downloadThroughput: 40 * 1024, uploadThroughput: 40 * 1024 })
  const errs0 = errors.length
  if (touch) { await page.click('#burger'); await sleep(300); await page.locator('#drawer a[data-page="tracker"]').first().tap() }
  else await page.locator('#topnav a[data-page="tracker"]:visible').click()
  const seen = []
  let claw = 0, drawn = false, pressedWhile = 'no press made (chart arrived first)'
  const t0 = Date.now()
  while (Date.now() - t0 < 120000) {
    const st = await page.evaluate(() => ({ balls: document.querySelectorAll('#flowSvg .ball').length, u: document.querySelectorAll('#trUndoBtn').length, off: document.getElementById('trUndoBtn')?.disabled, roff: document.getElementById('trRedoBtn')?.disabled, title: document.getElementById('trUndoBtn')?.title, claw: !!document.querySelector('[class*=claw], [class*=loading], [aria-label*=oading]') }))
    seen.push(st); if (st.claw) claw++
    if (seen.length === 3) await shot(page, `S15-${tag}-1-loading`)
    if (seen.length === 4 && st.balls === 0) { try { await page.evaluate(() => document.getElementById('trUndoBtn').click()); await page.evaluate(() => document.getElementById('trRedoBtn').click()); pressedWhile = 'clicked both while loading (disabled buttons: no effect)' } catch (e) { pressedWhile = 'threw: ' + e.message.slice(0, 80) } }
    if (st.balls > 20) { drawn = true; break }
    await sleep(250)
  }
  const loadingSamples = seen.filter(s => s.balls === 0)
  const allGrey = loadingSamples.length > 0 && loadingSamples.every(s => s.u === 1 && s.off === true && s.roff === true)
  L.ok('while the Tracker loads (slow network): the top bar pair is drawn once, greyed, in every sample', tag, 'admin', allGrey, `${loadingSamples.length} samples before the chart; claw-like element seen in ${claw}; first ${JSON.stringify(loadingSamples[0])}; titles ${[...new Set(loadingSamples.map(s => s.title))].join('/')}`, `S15-${tag}-1-loading.png`)
  // a press while loading does nothing and throws nothing
  let pressed = 'n/a'
  if (!drawn) { try { await page.locator('#trUndoBtn').click({ force: true, timeout: 3000 }); pressed = 'clicked' } catch (e) { pressed = 'not clickable: ' + String(e.message).split('\n')[0].slice(0, 80) } }
  L.note('a press on the greyed undo while loading', pressed)
  L.ok('Tracker chart arrives; no page error from the pair meanwhile', tag, 'admin', drawn && errors.slice(errs0).filter(e => /PAGEERROR/.test(e)).length === 0, `drawn ${drawn} after ${Math.round((Date.now() - t0) / 1000)} s; new errors ${JSON.stringify(errors.slice(errs0)).slice(0, 300)}`, await shot(page, `S15-${tag}-2-drawn`))
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })
  if (drawn) {
    await sleep(500)
    await mark(page, 'ST-02', 'dco', touch)
    const pr = await pair(page)
    L.ok('once the chart is drawn, a mark lights undo', tag, 'admin', pr.undoOff === false && /mark on ST-02/.test(pr.title), `title "${pr.title}"`, await shot(page, `S15-${tag}-3-marked`))
  }
  L.note(`${tag} errors`, errors.join(' | ').slice(0, 400) || 'none')
  await browser.close()
}
L.save('S15')
