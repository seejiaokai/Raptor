// A LOOK at step 2 of the one-rule build in the RUNNING build, phone and desktop — the builder's own eye before the owner's:
// an input filed for three people on the Inputs calendar is ONE row on the schedule (its people A to Z); a person put on
// that row by arming its "+ add" and tapping a name JOINS the input (the Inputs calendar then names four); a puck taken
// off by right-click LEAVES it. Not a gate and not the job's walk (that is the FULL check after step 8): it asserts little
// and a person opens the pictures. What it reads off the app it prints, so a picture that missed its target says so.
//
//   npm run build && npx vite preview --port 4186 --strictPort
//   node scripts/handpass/onerule-step2-look.mjs <out dir>
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/onerule-step2-look'
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
}
const DAY = '2026-07-15', DI = 2, TITLE = 'Range brief'
const PICK = ['bane', 'pike', 'split'], ADD = 'rocky'

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  const press = loc => (size === 'desk' ? loc.click() : loc.tap())
  const shot = name => page.screenshot({ path: join(OUT, `${size}-${name}.png`) })
  const say = (step, what) => console.log(`${size} ${step}: ${what}`)
  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')

  /* 1 — file it on the Inputs calendar, for three people, through the day's own "+ Input" */
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 6 - await at()
  for (; d > 0; d--) await press(page.locator('#icNext'))
  for (; d < 0; d++) await press(page.locator('#icPrev'))
  await page.waitForSelector(`[data-icday="${DAY}"]`)
  await page.locator(`[data-icday="${DAY}"]`).focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('[data-testid="win-inputsday"]')
  await press(page.locator('#icPopAdd'))
  await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
  await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
  for (const p of PICK) {
    const lit = await page.locator(`#inpEditPop [data-pp="${p}"]`).getAttribute('aria-pressed')
    if (lit !== 'true') await press(page.locator(`#inpEditPop [data-pp="${p}"]`))
  }
  /* un-pick whoever the seed lit that is not wanted (the signed-in admin) */
  const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (!PICK.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
  const title = page.locator('#inpEditPop #inpEditOwnTitle').first()
  if (await title.count()) { await title.fill(TITLE) }
  await page.waitForTimeout(200)
  await shot('1-window-three-people')
  await press(page.locator('#inpEditSave'))
  await page.waitForTimeout(500)
  const filed = await page.evaluate(() => window.INPUTS.filter(r => r.date === 'Jul 15' && Array.isArray(r.people) && r.people.length === 3).map(r => ({ iid: r.iid, people: r.people.map(e => e.p), type: r.type, title: r.title || '' })))
  say('1 filed', JSON.stringify(filed))
  await shot('2-day-after-filing')
  if (filed.length !== 1) { say('STOP', 'the input for three was not filed — see the pictures'); await ctx.close(); continue }
  const iid = filed[0].iid

  /* 2 — its ONE row on the schedule */
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor()
  const rowInfo = () => page.evaluate(([di, id]) => {
    const g = (window.DAYS[di].ground || []), rows = g.filter(r => r.src === id)
    return { rows: rows.length, who: rows[0] && rows[0].who, more: rows[0] && rows[0].more, ri: g.indexOf(rows[0]) }
  }, [DI, iid])
  let ri0 = await rowInfo()
  say('2 the row', JSON.stringify(ri0))
  const rowSel = `[data-slot="g:${DI}.${ri0.ri}"]`
  await page.locator(rowSel).first().scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(300)
  const drawn = await page.evaluate(([di, ri]) => [...document.querySelectorAll(`[data-slot^="g:${di}.${ri}"] [data-person], [data-slot^="g:${di}.${ri}"][data-person]`)].filter(e => e.offsetParent).map(e => e.getAttribute('data-person')), [DI, ri0.ri])
  say('2 drawn on the week', JSON.stringify(drawn))
  await shot('3-week-one-row')

  /* 3 — arm the row's "+ add" and tap a name: he JOINS the input */
  await page.evaluate(k => window.armSlot(k), `g:${DI}.${ri0.ri}.+`).catch(() => {})
  const armed = await page.evaluate(() => window.ARM && window.ARM.key)
  say('3 armed', String(armed))
  if (armed) {
    const pk = page.locator(`#eRoster .rpuck[data-person="${ADD}"]:visible`).first()
    if (await pk.count()) { await pk.scrollIntoViewIfNeeded().catch(() => {}); await press(pk) }
    else say('3', 'the crew list did not offer ' + ADD + ' on this size')
    await page.waitForTimeout(500)
  }
  const after = await page.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r ? r.people.map(e => e.p) : null }, iid)
  say('3 the input after the tap', JSON.stringify(after))
  ri0 = await rowInfo()
  say('3 the row after the tap', JSON.stringify(ri0))
  await shot('4-week-after-join')

  /* 4 — the Inputs calendar says the same people */
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  await page.waitForSelector(`[data-icday="${DAY}"]`)
  await page.locator(`[data-icday="${DAY}"]`).focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('[data-testid="win-inputsday"]')
  await page.waitForTimeout(300)
  const card = await page.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`).first().innerText().catch(() => '(no card found)')
  say('4 the card', JSON.stringify(card.replace(/\s+/g, ' ').slice(0, 200)))
  await shot('5-day-card-four-people')

  /* 5 — (a desktop: a right-click is the mouse's way) the man just added is taken off the row: he LEAVES the input */
  if (size === 'desk') {
    await page.keyboard.press('Escape')
    await page.evaluate(() => window.go('editsched'))
    await page.locator('#eWeek .day').first().waitFor()
    ri0 = await rowInfo()
    const pk = page.locator(`#eWeek [data-slot^="g:${DI}.${ri0.ri}"][data-person="${ADD}"]:visible, #eWeek [data-slot^="g:${DI}.${ri0.ri}"] [data-person="${ADD}"]:visible`).first()
    if (await pk.count()) { await pk.scrollIntoViewIfNeeded().catch(() => {}); await pk.click({ button: 'right' }); await page.waitForTimeout(500) }
    else say('5', 'his puck was not found on the row')
    const left = await page.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r ? r.people.map(e => e.p) : null }, iid)
    say('5 the input after his puck is taken off', JSON.stringify(left))
    say('5 the row', JSON.stringify(await rowInfo()))
    await shot('6-week-after-leave')
  }

  console.log(size, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors')
  await ctx.close()
}
await browser.close()
