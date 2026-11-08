// Shared parts of the top-bar-fixed walk (D1873, 8 Nov 26): serve a built folder inside the test browser, sign in as the admin.
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
export { chromium, webkit, LAUNCH, serveDist }
export const ORIGIN = 'http://localhost:4393'
export const DIST_BEFORE = 'C:/Users/User/AppData/Local/Temp/topbar-dist-before'
export const DIST_AFTER = 'C:/Users/User/AppData/Local/Temp/topbar-dist-after'
export const V = sel => `${sel} >> visible=true`
export async function open({ dist, engine = 'chromium', w = 1536, h = 864, dsf = 1, q = '?fresh=1', clock = false, touch = false, user = 'ad', pass = 'a', login = true }) {
  const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
  const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, hasTouch: touch || w < 600, isMobile: engine === 'webkit' ? undefined : undefined })
  await serveDist(ctx, ORIGIN, dist)
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push('pageerror: ' + e.message))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  p.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url().slice(0, 100)) })
  if (clock) { await p.clock.install({ time: new Date('2026-07-14T09:30:00+08:00') }); await p.clock.pauseAt(new Date(Date.parse('2026-07-14T09:30:00+08:00') + 5000)) }
  await p.goto(ORIGIN + '/' + q)
  if (login) {
    await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
    if (clock) await p.clock.runFor(1500); else await p.waitForTimeout(800)
  }
  return { br, ctx, p, errs }
}
export const phoneOf = p => p.viewportSize().width < 600
export async function press(p, sel, clk = false) {
  await p.locator(V(sel)).first().click({ timeout: 6000 })
  if (clk) await p.clock.runFor(450); else await p.waitForTimeout(450)
}
export async function tab(p, page, clk = false) {
  const folded = await p.locator(V('#burger')).count() && !(await p.locator(V(`#topnav a[data-page="${page}"]`)).count())
  if (folded) { await press(p, '#burger', clk); await press(p, `#drawerNav a[data-page="${page}"]`, clk) }
  else await press(p, `#topnav a[data-page="${page}"]`, clk)
  if (clk) await p.clock.runFor(900); else await p.waitForTimeout(900)
}
