/* host probe — the preview showed him a blank screen on his iPhone (19 Oct 26): does the built app start in WebKit and in
   Chromium on this machine, and what does each say on its console? */
import { webkit, chromium, devices } from '@playwright/test'
const URL = process.env.HP_URL || 'http://localhost:4333/'
for (const [name, type, opts] of [['webkit-iphone', webkit, devices['iPhone 13']], ['chromium-phone', chromium, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }]]) {
  let b
  try { b = await type.launch() } catch (e) { console.log(name, 'CANNOT LAUNCH', String(e).slice(0, 160)); continue }
  const ctx = await b.newContext(opts), p = await ctx.newPage(), errs = []
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
  await p.goto(URL)
  const ok = await p.waitForSelector('#luser', { timeout: 10000 }).then(() => true, () => false)
  console.log(name, ok ? 'sign-in shown' : 'NO SIGN-IN', JSON.stringify(errs.slice(0, 5)))
  await b.close()
}
