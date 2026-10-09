// A LOOK at the Inputs page in the RUNNING build, phone and desktop — the builder's own eye, and the built side of
// D624's mock-up-beside-built evidence (the approved drawings: the month as bars on a phone and on a desktop, a day
// opened, the three tabs). Not a gate: it asserts nothing; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/inputs-look.mjs <out dir> [shot names…]
//
// The month drawn is October 2026 with made-up inputs of the demo squadron's own people: long bars and short ones, a
// week with more inputs than lines, a group filing, a public holiday, an Off day and a no-fly day — so every kind of
// thing the approved month shows is on it. The figures are the demo squadron's, so the pictures may go into the repo.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/inputs-look'
const ONLY = process.argv.slice(3)
mkdirSync(OUT, { recursive: true })
const want = name => !ONLY.length || ONLY.some(o => name.includes(o))

const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
  short: { ...devices['iPhone 13'], viewport: { width: 390, height: 568 } },
}
const big = size => size === 'desk' || size === 'wide'
const press = (size, loc) => (big(size) ? loc.click() : loc.tap())

async function open(browser, size, who = 'ad') {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto((process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1')
  await page.fill('#luser', who === 'ad' ? 'ad' : 'us'); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => {
    const P = window.PEOPLE
    const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    const admin = Object.keys(P).find(id => P[id].cs === 'Saber') || crew[0]
    const at = (d, h, m) => new Date(2026, 8, d, h, m).getTime()
    /* who, kind, from, to, timed — a spread over October: long absences, a busy week, single days */
    const plan = [
      [0, 'OML', 5, 9], [1, 'CSE', 5, 8], [2, 'Appointment', 6, 6, [600, 660]], [3, 'OL', 7, 11], [4, 'Meeting', 8, 8, [840, 900]],
      [5, 'OD', 12, 16], [6, 'OML', 12, 12], [7, 'Fly with', 12, 12, [480, 720]], [8, 'Meeting', 12, 12, [600, 660]], [9, 'Appointment', 12, 12, [900, 960]], [10, 'LL', 12, 13],
      [11, 'LL', 13, 13], [12, 'OIL', 13, 13], [13, 'Appointment', 13, 13, [840, 900]], [14, 'Appointment', 13, 13, [600, 630]],
      [15, 'OL', 14, 14], [16, 'OIL', 14, 15], [17, 'OD', 14, 16], [18, 'Duty', 14, 14, [480, 1020]],
      [19, 'Appointment', 15, 15, [540, 600]], [0, 'LL', 19, 19], [1, 'Appointment', 19, 19, [600, 660]], [2, 'CSE', 19, 23], [3, 'OL', 20, 22],
      [4, 'Meeting', 21, 21, [600, 660]], [5, 'OML', 22, 22], [6, 'LL', 23, 23], [7, 'OL', 26, 30], [8, 'Appointment', 27, 27, [600, 660]], [9, 'LL', 28, 29],
      [10, 'LL', 30, 33],
    ]
    let k = 0
    for (const [who, type, from, to, t] of plan) {
      const id = crew[who % crew.length]
      k += 1
      const d = n => (n > 31 ? 'Nov ' + (n - 31) : 'Oct ' + n)
      window.fileInput({ person: id, type, date: d(from), endDate: to > from ? d(to) : undefined, yr: 2026, allday: !t, s: t ? t[0] : 360, e: t ? t[1] : 1080,
        mod: k === 14 ? '2026-10-12' : '2026-09-1' + (k % 9), by: k % 5 === 0 ? admin : id, at: at(10 + (k % 15), 8 + (k % 9), 5 + k), modBy: k % 5 === 0 ? admin : id, modAt: at(10 + (k % 15), 8 + (k % 9), 5 + k) })
    }
    /* one group filing: a meeting for four, filed by the admin */
    const four = crew.slice(20, 24), g = 'g-look'
    for (const id of four) window.fileInput({ person: id, type: 'Meeting', date: 'Oct 8', yr: 2026, allday: false, s: 540, e: 600, mod: '2026-09-20', grp: g, grpBy: admin, by: admin, at: at(20, 10, 0), modBy: admin, modAt: at(20, 10, 0) })
    window.setFlyDays([{ iso: '2026-10-22', cls: 'nf' }, { iso: '2026-10-15', cls: 'night' }])
    window.lwSetDayEvent('2026-10-09', 0, 'PH')
    window.lwSetDayEvent('2026-10-26', 0, 'Off day')
  })
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  /* to October 2026 */
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 9 - await at()
  for (; d > 0; d--) await press(size, page.locator('#icNext'))
  for (; d < 0; d++) await press(size, page.locator('#icPrev'))
  await page.waitForTimeout(400)
  return { ctx, page, errors }
}
const shot = async (page, name, full = false) => { await page.mouse.move(0, 0).catch(() => {}); await page.screenshot({ path: join(OUT, name + '.png'), fullPage: full }) }

const browser = await chromium.launch(launchOptions)
const errorsAll = []
for (const size of ['phone', 'short', 'desk', 'wide']) {
  if (!want(size)) continue
  const { ctx, page, errors } = await open(browser, size)
  await shot(page, `${size}-month`)
  if (size === 'short') await shot(page, `${size}-month-full`, true)
  /* a day opened */
  /* on the date's own corner — its middle is under a bar, which opens the input instead */
  await (big(size) ? page.locator('[data-icday="2026-10-13"]').click({ position: { x: 8, y: 8 } }) : page.locator('[data-icday="2026-10-13"]').tap({ position: { x: 8, y: 8 } }))
  await page.waitForTimeout(400)
  await shot(page, `${size}-day`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  /* the filters, folded on a phone */
  if (!big(size)) { await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(200); await shot(page, `${size}-filters`); await page.locator('#inFiltersBtn').tap() }
  /* the List, the SANS tab, the Medical tab — each under the same three tabs */
  await press(size, page.locator('#inListBtn')); await page.waitForTimeout(300); await shot(page, `${size}-list`)
  await press(size, page.locator('#inSansMode')); await page.waitForTimeout(400); await shot(page, `${size}-sans`)
  await press(size, page.locator('#inMedBtn')); await page.waitForTimeout(400); await shot(page, `${size}-medical`)
  await press(size, page.locator('#inMemberMode')); await page.waitForTimeout(300)
  errorsAll.push(...errors.map(e => `${size}: ${e}`))
  await ctx.close()
}
await browser.close()
console.log(errorsAll.length ? 'PAGE ERRORS:\n' + errorsAll.join('\n') : 'no page errors')
console.log('pictures in', OUT)
