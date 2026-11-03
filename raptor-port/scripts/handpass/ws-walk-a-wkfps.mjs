/* walker A: how fast does the test browser's WebKit draw frames during the glide, at pixel ratio 3 and 1? version 1 */
import { webkit, chromium, launchOptions, BASE, fingerPage, fingerCdp, startSampler, stopSampler, goPage, park, path, sleep, crossed, weekId } from './ws-walk-a-lib.mjs'
console.log('ws-walk-a-wkfps v1')
for (const [eng, dsf] of [['webkit', 3], ['webkit', 1], ['chromium', 3]]) {
  const type = eng === 'webkit' ? webkit : chromium
  const browser = await type.launch({ headless: true, ...(eng === 'chromium' ? launchOptions : {}) })
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: 402, height: 874 }, deviceScaleFactor: dsf, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  try {
    await page.goto('/'); await page.waitForSelector('#luser')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
    await goPage(page, 'editsched')
    const cdp = eng === 'chromium' ? await context.newCDPSession(page) : null
    await park(page, '#eWeek', 0)
    const from = await weekId(page)
    await startSampler(page, '#eWeek')
    const pts = path(100, 430, 250, 430, 10, 400)
    if (cdp) await fingerCdp(cdp, pts, 90); else await fingerPage(page, pts, 90)
    await crossed(page, from); await sleep(400)
    const tr = await stopSampler(page)
    const F = tr.frames, up = F.findIndex(f => f.copies.length), down = F.map(f => f.copies.length > 0).lastIndexOf(true)
    const gaps = []; for (let i = up + 1; i <= down; i++) gaps.push(Math.round(F[i].t - F[i - 1].t))
    console.log(eng, 'dsf', dsf, '| frames while the copies were up:', down - up + 1, '| copies up ms:', Math.round(F[down].t - F[up].t), '| frame gaps ms:', gaps.join(','))
  } finally { await browser.close() }
}
