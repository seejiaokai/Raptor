/* THE BOARD'S KEYBOARD LEFTOVERS, WALKED BY THE KEYS ON THE BUILT APP (the night of 3 Nov 26, job 2 —
   [BOARD-OPEN-BY-KEYS], [VEILED-WINDOWS-BAR]'s Escape part). His PC's screen, 1536 × 864. Keyboard only after the sign-in:
   Tab to a day's date (picture of the ring), Enter opens the board, each small menu by its button and Escape (a picture of
   each up, then of it gone), the Traffic and day-details windows by Escape, Escape closes the board (the ring back on the
   date), Space opens it again; then a mouse click on the date — no ring. Pictures to
   docs/img/handpass/2026-11-03-week-swipe/keys-build/. Run against a served build:
   node scripts/handpass/keys-build-walk.mjs <port> */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'fs'

const PORT = process.argv[2] || '4173'
const OUT = 'docs/img/handpass/2026-11-03-week-swipe/keys-build'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } })
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()) })
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()) })

const rows = []
const note = (step, ok, detail = '') => { rows.push({ step, ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + step + (detail ? ' — ' + detail : '')) }
const shot = (name, clip) => page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip } : {}) })
const at = () => page.evaluate(() => {
  const a = document.activeElement
  return a ? { tag: a.tagName, id: a.id, sbday: a.dataset.sbday ?? null, air: a.dataset.air ?? null, info: a.classList.contains('dinfobtn'), inBoard: !!a.closest('#schedBoard'), ring: a.matches(':focus-visible'), outline: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth } : null
})
const boardOpen = () => page.locator('#schedBoard:not([hidden])').count().then(n => n > 0)
/* a picture cut to the thing in question, with room round it */
const around = async (sel, pad = 60) => {
  const b = await page.locator(sel).first().boundingBox()
  if (!b) return undefined
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  return { x, y, width: Math.min(1536 - x, b.width + pad * 2 + 200), height: Math.min(864 - y, b.height + pad * 2) }
}

await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.click('.nav a[data-page="editsched"]')
await page.waitForSelector('#eWeek .day[data-day="0"] .dt.sb-open')
await page.waitForTimeout(400)

/* 1. Tab to Monday's date: from the top bar's last control the keys walk on into the week — put on the day's Templates
   button and stepped back once, as a person tabbing backwards would */
await page.locator('#eWeek .day[data-day="0"] [data-daytplopen]').focus()
await page.keyboard.press('Shift+Tab')
let a = await at()
note('1 Shift+Tab from Templates lands on the date, its ring showing', a && a.sbday === '0' && a.ring, JSON.stringify(a))
await shot('01-date-ring', await around('#eWeek .day[data-day="0"] .day-head', 30))
/* and forwards: Tab from the date goes on to Templates, as before */
await page.keyboard.press('Tab')
a = await at()
note('1b Tab from the date goes on to Templates', !!a && a.tag === 'BUTTON', JSON.stringify(a))
await page.keyboard.press('Shift+Tab')

/* 2. Enter opens the board, the keys on it */
await page.keyboard.press('Enter')
await page.waitForTimeout(300)
a = await at()
note('2 Enter opens the board, the keys on it', (await boardOpen()) && !!a && a.inBoard, JSON.stringify(a))
await shot('02-board-open')
await page.keyboard.press('Tab')
a = await at()
note('2b the first Tab lands on a control of the board', !!a && a.inBoard && a.ring, JSON.stringify(a))

/* 3. each menu by its button and Escape */
const menus = [['03-block', '#sbBoard [data-dwadd]'], ['04-templates', '#sbTpl'], ['05-plans', '#schedBoard [data-planmenu]'], ['06-stores', '#sbBoard [data-stcfg]'], ['07-wave', '#sbBoard [data-wvadd]']]
for (const [name, sel] of menus) {
  const b = page.locator(sel).first()
  await b.scrollIntoViewIfNeeded()
  await b.focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(250)
  const up = await page.locator('.wavemenu').count()
  await shot(name + '-up', await around('.wavemenu', 80))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  const gone = (await page.locator('.wavemenu').count()) === 0
  const back = await b.evaluate(el => el === document.activeElement && el.matches(':focus-visible'))
  await shot(name + '-escaped', await around(sel, 80))
  note(`3 ${sel}: up ${up}, Escape closed it, board open, keys and ring back on its button`, up === 1 && gone && (await boardOpen()) && back)
}

/* 4. the Traffic window and the day-details window over the board */
const air = page.locator('#sbBoard [data-air]').first()
await air.scrollIntoViewIfNeeded(); await air.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(250)
const airUp = await page.locator('#airpop:not([hidden])').count()
await shot('08-traffic-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(200)
a = await at()
note('4 Traffic over the board: Escape closes it only, keys back on its button', airUp === 1 && (await page.locator('#airpop:not([hidden])').count()) === 0 && (await boardOpen()) && !!a && !!a.air && a.inBoard, JSON.stringify(a))
await shot('08-traffic-escaped', await around('#sbBoard [data-air]', 80))
const info = page.locator('#schedBoard .dinfobtn').first()
await info.scrollIntoViewIfNeeded(); await info.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(250)
const dayUp = await page.locator('#dayPop:not([hidden])').count()
await shot('09-daydetails-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(200)
a = await at()
note('4b day details over the board: Escape closes it only, keys back on its ⓘ', dayUp === 1 && (await page.locator('#dayPop:not([hidden])').count()) === 0 && (await boardOpen()) && !!a && a.info, JSON.stringify(a))

/* 5. Escape closes the board, the ring back on the date */
await page.locator('#sbCal').focus()
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
a = await at()
note('5 Escape closes the board, the keys and the ring back on the date', !(await boardOpen()) && !!a && a.sbday === '0' && a.ring, JSON.stringify(a))
await shot('10-board-closed-ring', await around('#eWeek .day[data-day="0"] .day-head', 30))

/* 6. Space opens it again; ✓ Done by the keys */
await page.keyboard.press(' '); await page.waitForTimeout(300)
note('6 Space opens it again', await boardOpen())
await page.locator('#sbDone').focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(300)
a = await at()
note('6b ✓ Done by the keys: the keys back on the date', !(await boardOpen()) && !!a && a.sbday === '0', JSON.stringify(a))

/* 7. the week's own Traffic and day-details windows */
const wair = page.locator('#eWeek [data-air]:visible').first()
await wair.scrollIntoViewIfNeeded(); await wair.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(250)
const wairUp = await page.locator('#airpop:not([hidden])').count()
await page.keyboard.press('Escape'); await page.waitForTimeout(200)
note("7 the week's Traffic window by Escape, keys back on its button", wairUp === 1 && (await page.locator('#airpop:not([hidden])').count()) === 0 && (await wair.evaluate(el => el === document.activeElement)))
const winfo = page.locator('#eWeek .day[data-day="0"] .dinfobtn')
await winfo.scrollIntoViewIfNeeded(); await winfo.focus()
await page.keyboard.press('Enter'); await page.waitForTimeout(250)
const wdayUp = await page.locator('#dayPop:not([hidden])').count()
await shot('11-week-daydetails-up')
await page.keyboard.press('Escape'); await page.waitForTimeout(200)
note("7b the week's day-details window by Escape, keys back on its ⓘ", wdayUp === 1 && (await page.locator('#dayPop:not([hidden])').count()) === 0 && (await winfo.evaluate(el => el === document.activeElement)))

/* 8. a mouse click on the date: no ring, before or after the board */
await page.mouse.click(5, 500)   // the keys off everything, by the mouse
const dt = page.locator('#eWeek .day[data-day="1"] .dt.sb-open')
await dt.scrollIntoViewIfNeeded()
const sl0 = await page.evaluate(() => document.querySelector('#eWeek')?.scrollLeft)
await dt.click(); await page.waitForTimeout(300)
const sl1 = await page.evaluate(() => document.querySelector('#eWeek')?.scrollLeft)
note('8 a mouse click on the date opens the board', await boardOpen())
/* the focus the click now puts on the date must not move the week (closing the board then brings its day to the front —
   the owner's rule of 10 Aug 26, view.ts closeBoardState CARRYDAY — which is not this check) */
note('8c the week did not move under the click', sl0 === sl1, `${sl0} → ${sl1}`)
await page.locator('#sbDone').click(); await page.waitForTimeout(300)
a = await at()
note('8b after the mouse, the date wears no ring', !!a && !a.ring, JSON.stringify(a))
await shot('12-mouse-no-ring', await around('#eWeek .day[data-day="1"] .day-head', 30))

note('no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '))
await browser.close()
const bad = rows.filter(r => !r.ok)
console.log(`\n${rows.length - bad.length}/${rows.length} pass`)
process.exit(bad.length ? 1 : 0)
