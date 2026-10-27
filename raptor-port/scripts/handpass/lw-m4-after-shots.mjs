// The pictures after his answers (27 Oct 26, D1430–D1436) that the side-by-side script does not take: the header on a
// SECOND visit ("· 1 new since you last looked, <time>" — a first visit has no earlier time), and his iPhone's width in
// WebKit with the phone buttons as built and with his drawing's letters (question 18). Run from raptor-port/ against the
// build served on PORT: PORT=4174 node scripts/handpass/lw-m4-after-shots.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/sbs-after'
import path from 'node:path'
import { webkit, devices } from '@playwright/test'
const L = await import('./lw-m4-lib.mjs')
const { T } = L
const shot = (w, name) => w.page.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'device' })

/* (a) the desktop header on his second visit */
{
  const w = await L.newCtx('desk')
  const P = w.page
  await L.signIn(w, 'admin')
  await L.openApprovals(w)                                   // his first look
  await L.press(w, T('lw-tab-grid')); await P.waitForTimeout(600)
  await L.switchTo(w, 'member')
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)                                   // his second look
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  console.log('header:', await L.txt(P, T('appr-sub')))
  await shot(w, 'd1-second-visit')
  if (w.errs.length) console.log('errors:', w.errs.join(' | '))
  await w.ctx.close()
}

/* (b) his iPhone's width in WebKit: the buttons as built, then with his drawing's letters (r22-5-phone: 12.5px, bold 700) */
{
  const b = await webkit.launch()
  for (const [name, css] of [['q18-built', ''], ['q18-drawing-letters', '#page-leavewar .appr-l1 .appr-ok, #page-leavewar .appr-l1 .appr-no { font-size: 12.5px; font-weight: 700; padding: 0 3px; }']]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 } })
    const P = await ctx.newPage()
    await P.goto(L.PLAIN); await P.waitForSelector('#luser')
    await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
    await P.waitForSelector('#vWeek .day', { state: 'attached' })
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(T('lw-tab-approvals'))
    await P.click(T('lw-tab-approvals')); await P.waitForTimeout(600)
    if (css) await P.addStyleTag({ content: css })
    await P.waitForTimeout(300)
    await P.locator('.appr-cols').first().scrollIntoViewIfNeeded()
    await P.screenshot({ path: path.join(L.OUT, name + '.png') })
    const wraps = await P.evaluate(() => [...document.querySelectorAll('[data-testid="appr-dates"]')].filter(d => d.getBoundingClientRect().height > parseFloat(getComputedStyle(d).fontSize) * 1.9).map(d => d.textContent))
    console.log(name, 'dates on two lines:', wraps.join(', ') || 'none')
    await ctx.close()
  }
  await b.close()
}
await (await L.getBrowser()).close()
process.exit(0)   // (a closed browser can leave the run waiting — 27 Oct 26)
