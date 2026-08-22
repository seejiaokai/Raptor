import { chromium } from 'playwright'

const PORT = process.argv[2] || '4173'
const SCRATCH = '/tmp/claude-0/-home-user-Raptor/a3c4c10e-d346-5d28-a36e-669d1c39b114/scratchpad'
const errs = []
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', chromiumSandbox: false })

async function shot(vp, name) {
  const p = await b.newPage({ viewport: vp })
  p.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()) })
  p.on('pageerror', e => errs.push(name + ' pageerror: ' + e.message))
  p.on('response', r => { if (r.status() >= 400) errs.push(name + ` ${r.status()} ${r.url()}`) })
  await p.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
  await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 15000 })
  // the app's own nav bridge — the phone header hides the nav links
  await p.evaluate(() => window.go('inputs'))
  await p.waitForSelector('#inCalBtn', { timeout: 10000 })
  await p.click('#inCalBtn')
  await p.waitForSelector('#inpCal', { timeout: 10000 })
  // demo inputs live in July 2026; today is Aug 2026 → one month back
  await p.click('#icPrev')
  await p.waitForTimeout(250)
  const chips = await p.locator('.ic-chip').count()
  const cols = await p.evaluate(() => {
    const cells = [...document.querySelectorAll('.ic-grid [data-icday], .ic-grid .ic-x')].slice(0, 7)
    return cells.length
  })
  await p.screenshot({ path: `${SCRATCH}/${name}.png` })
  console.log(`${name}: chips=${chips} firstRowCells=${cols}`)
  await p.close()
}

await shot({ width: 1500, height: 950 }, 'cal-desktop')
await shot({ width: 390, height: 844 }, 'cal-phone')
console.log('ERRORS:', errs.length ? errs : 'none')
await b.close()
