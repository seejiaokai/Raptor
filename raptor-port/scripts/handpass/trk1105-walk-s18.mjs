/* S18 — the Tracker's page download fails, Retry reloads (D admin Chromium; P admin Chromium touch at phone size, WebKit's route
   handling not needed).  The outside acts: page.route aborting the Tracker chunk, then un-routing; __failSaves for the second case.
   node scripts/handpass/trk1105-walk-s18.mjs */
import { open, navTo, login, keys, diffKeys, classify, ocuAny, pair, words, grade, mark, click, shot, setFail, retryBtn, mk, sleep, D, P, BASE } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s18 v1')
const L = mk('S18')
const cardInfo = page => page.evaluate(() => { const els = [...document.querySelectorAll('#page-tracker *')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 1 && e.textContent.trim()); return { text: els.map(e => e.textContent.trim()).join(' | ').slice(0, 200), retry: [...document.querySelectorAll('button')].some(b => /^Retry$/i.test(b.textContent.trim()) && b.getBoundingClientRect().width > 1) } })
for (const [tag, size, touch] of [['D', D, false], ['P', P, true]]) {
  const { browser, ctx, page, errors } = await open({ engine: 'chromium', size, touch, who: 'a', tracker: false, fail: true })
  const T = async (name, fn) => { try { await fn() } catch (e) { L.ok(name, tag, 'admin', false, 'SCRIPT STOP: ' + String(e.message).split('\n').slice(0, 3).join(' ').slice(0, 300)) } }
  await T('s18', async () => {
    await navTo(page, 'editsched', touch); await sleep(600)
    await page.locator('.txed:visible').first().click(); await page.keyboard.type('s18note'); await page.keyboard.press('Tab'); await sleep(1500)
    const kBefore = await keys(page)
    let blocked = 0
    await page.route(/\/assets\/(TrackerPage|tracker)[^/]*\.(js|css)/i, r => { blocked++; r.abort() })
    // press the Tracker tab
    if (touch) { await page.click('#burger'); await sleep(300); await page.locator('#drawer a[data-page="tracker"]').first().tap() } else await page.locator('#topnav a[data-page="tracker"]:visible').click()
    await sleep(6000)
    const ci = await cardInfo(page)
    L.ok('Tracker download blocked: "Couldn\'t open the Tracker" card with Retry (top bar still there)', tag, 'admin', /Couldn.t open the Tracker/i.test(ci.text) && ci.retry && (await page.locator('.topbar').count()) >= 1, `blocked requests ${blocked}; card "${ci.text}"; retry ${ci.retry}`, await shot(page, `S18-${tag}-1-card`))
    // a failed download while a save has failed: Retry (blocked still) -> what it says
    await setFail(page, true)
    await page.locator('#page-tracker button', { hasText: /^Retry$/i }).first().click(); await sleep(4500)
    const ci2 = await cardInfo(page), w2 = await words(page)
    L.ok('Retry with the download still blocked AND a save failing: the card comes back, still signed in', tag, 'admin', /Couldn.t open the Tracker/i.test(ci2.text) && (await page.locator('#luser').count()) === 0, `card "${ci2.text}"; band "${w2.band}"`, await shot(page, `S18-${tag}-2-retry-both-failing`))
    // unblock both; Retry
    await setFail(page, false); await page.unroute(/\/assets\/(TrackerPage|tracker)[^/]*\.(js|css)/i)
    await page.locator('#page-tracker button', { hasText: /^Retry$/i }).first().click()
    await sleep(4500)
    let onLogin = (await page.locator('#luser').count()) === 1
    if (!onLogin) await sleep(4000)
    onLogin = (await page.locator('#luser').count()) === 1
    L.note('after Retry (unblocked)', onLogin ? 'the app reloaded; the sign-in card shows' : 'no sign-in card; page ' + await page.evaluate(() => window.CURPAGE))
    if (onLogin) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#flowSvg .ball', { timeout: 30000 }).catch(() => {}) }
    await sleep(800)
    const cp = await page.evaluate(() => window.CURPAGE)
    L.ok('after Retry the app reloads, the sign-in reopens the Tracker (D1635) and it draws', tag, 'admin', cp === 'tracker' && (await page.locator('#flowSvg .ball').count()) > 20, `page ${cp}; balls ${await page.locator('#flowSvg .ball').count()}`, await shot(page, `S18-${tag}-3-after-retry`))
    await mark(page, 'ST-02', 'dco', touch); await sleep(1200)
    const kAfter = await keys(page), cl = classify(diffKeys(kBefore, kAfter)), pr = await pair(page)
    L.ok('mark an event: stored under raptor:tracker/ (none ocu:); the top bar pair works', tag, 'admin', cl.tracker.length > 0 && cl.ocu.length === 0 && ocuAny(kAfter).length === 0 && pr.undoOff === false && pr.undo === 1 && pr.inTop, `tracker keys changed ${cl.tracker.length}; ocu ${cl.ocu.length}; undo "${pr.title}"`, await shot(page, `S18-${tag}-4-marked`))
    await navTo(page, 'editsched', touch); await sleep(600)
    const still = (await page.locator('body').innerText()).includes('s18note')
    L.ok('the earlier Edit Schedule change is still there after the reload', tag, 'admin', still, 'note text found on Edit Schedule: ' + still)
  })
  L.note(`${tag} errors (the blocked files and the forced quota produce their own)`, errors.join(' | ').slice(0, 500) || 'none')
  await browser.close()
}
L.save('S18')
