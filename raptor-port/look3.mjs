import { chromium } from '@playwright/test'
const SHOT = '/tmp/claude-0/-home-user-Raptor/b45a6b95-b47b-590a-9db4-243a0eb269d5/scratchpad/shots'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', chromiumSandbox: false })
const pg = await b.newPage({ viewport: { width: 1200, height: 1000 } })
const errs = []
pg.on('console', m => m.type() === 'error' && errs.push(m.text()))
pg.on('pageerror', e => errs.push('pageerror: ' + e.message))
await pg.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await pg.fill('#luser', 'a'); await pg.fill('#lpass', 'a')
await pg.click('#loginForm button[type=submit]')
await pg.waitForSelector('#vWeek .day')
await pg.click('[data-page="logic"]')
await pg.waitForSelector('.lgmatrix')
const m = await pg.$$('.lgmatrix')
console.log('matrices on page:', m.length)
// the absence matrix is the one with 20 cells
for (const el of m) {
  const n = await el.$$eval('.lgcell', c => c.length)
  if (n >= 20) { await el.screenshot({ path: `${SHOT}/logic-matrix.png` }); console.log('absence matrix cells:', n) }
}
console.log('ERRORS', errs.length ? errs : 'none')
await b.close()
