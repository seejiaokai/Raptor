// r4wf second walk — a probe (no verdicts): Monday's versions button and the plans selector on the Board — what they
// list, so W11's frozen look can be reached. Run: WR4_OUT=<dir> WR4_NEW=<build> node scripts/handpass/r4wf-w2-probe3.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, log, finish } = L
const J = JSON.stringify
const w = await newPage('desk', undefined, L.NEW_DIR, 'chromium'); await signIn(w, 'ad')
const p = w.page
await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(0)); await sleep(800)
for (const re of [/approval, AL versions/, /Switch between your plans/]) {
  const b = p.locator('#schedBoard button').filter({ has: p.locator('xpath=self::*') }).and(p.locator(`#schedBoard button[title*="${re.source.split(',')[0]}"], #schedBoard button[aria-label*="${re.source.split(',')[0]}"]`))
  log('p', re.source + ' count ' + await b.count())
  if (await b.count()) {
    await b.first().click(); await sleep(500)
    log('p', 'menu ' + J(await p.evaluate(() => [...document.querySelectorAll('[role="menu"] [role="menuitem"], [role="menu"] button, .sb-menu button, .plans-menu button, [role="dialog"] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('data-ver') || e.getAttribute('data-plan') || '') + ':' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 50)).slice(0, 20))))
    await p.screenshot({ path: `${process.env.WR4_OUT}/probe3-${re.source.slice(0, 8)}.png` })
    await p.keyboard.press('Escape'); await sleep(300)
  }
}
await finish()
