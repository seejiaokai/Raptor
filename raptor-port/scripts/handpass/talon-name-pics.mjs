// The RAPTOR -> TALON rename (D1590, 3 Nov 26): pictures of every place the app shows its name TODAY, each ringed, for the owner.
// Reads and presses only through the app's own controls; changes no app code.
//   1 sign-in on a phone (the word + the line under it)   2 sign-in on a desktop
//   3 top bar on a phone ("142 RAPTOR")                   4 top bar on a desktop
//   5 Leave War: the read-only sheet "Leave from Raptor"  6 Leave War: the select-and-decide note "... Raptor-owned"
//   7 "Request access" screen (only if reachable)
// Run (dev server, no build):   npx vite --port 4251 --strictPort      then, from raptor-port/:
//   LOOK_URL=http://localhost:4251/ node scripts/handpass/talon-name-pics.mjs [out dir]     (empties its own folder first)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-11-03-talon/names')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4251/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const say = (...a) => console.log(...a)
const RING = e => { e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '3px' }
const UNRING = e => { e.style.outline = ''; e.style.outlineOffset = '' }

const newCtx = async phone => {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(e.message))
  return page
}
const signIn = async page => {
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await page.waitForTimeout(700) }
const ring = async (page, sels) => { for (const s of sels) await page.locator(s).first().evaluate(RING) }
const unring = async (page, sels) => { for (const s of sels) await page.locator(s).first().evaluate(UNRING) }
const words = async (page, s) => (await page.locator(s).first().innerText()).replace(/\s+/g, ' ').trim()
const box = async (page, s) => page.locator(s).first().boundingBox()
const union = bs => { const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height)); return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } }
const pad = (c, p, W, H) => { const x = Math.max(0, c.x - p), y = Math.max(0, c.y - p); return { x, y, width: Math.min(W - x, c.width + 2 * p), height: Math.min(H - y, c.height + 2 * p) } }

/* ---- 1 and 2: the sign-in screen, before signing in */
{
  const p = await newCtx(true)
  await p.goto(URL); await p.waitForSelector('#luser'); await p.waitForTimeout(800)
  await ring(p, ['.lb-mark .lb-word', '.lb-sub'])
  say('01 ringed:', await words(p, '.lb-mark .lb-word'), '|', await words(p, '.lb-sub'))
  await p.screenshot({ path: join(OUT, '01-signin-phone.png') })
  await p.context().close()
}
{
  const p = await newCtx(false)
  await p.goto(URL); await p.waitForSelector('#luser'); await p.waitForTimeout(800)
  await ring(p, ['.lb-mark .lb-word', '.lb-sub'])
  const b = union([await box(p, '.lb-mark'), await box(p, '.lb-sub'), await box(p, '#loginForm')])
  say('02 ringed:', await words(p, '.lb-mark .lb-word'), '|', await words(p, '.lb-sub'))
  await p.screenshot({ path: join(OUT, '02-signin-desktop.png'), clip: pad(b, 60, 1536, 864) })
  await p.context().close()
}

/* ---- 3 and 4: the top bar on Edit Schedule */
{
  const p = await newCtx(true)
  await p.goto(URL); await p.waitForSelector('#luser'); await signIn(p); await go(p, 'editsched')
  await ring(p, ['.tx'])
  say('03 ringed:', await words(p, '.tx'), JSON.stringify(await box(p, '.tx')))
  await p.screenshot({ path: join(OUT, '03-topbar-phone.png'), clip: { x: 0, y: 0, width: 390, height: 200 } })
  await p.context().close()
}
const D = await newCtx(false)
await D.goto(URL); await D.waitForSelector('#luser'); await signIn(D); await go(D, 'editsched')
{
  await ring(D, ['.tx'])
  const b = await box(D, '.tx')
  say('04 ringed:', await words(D, '.tx'), JSON.stringify(b))
  await D.screenshot({ path: join(OUT, '04-topbar-desktop.png'), clip: { x: 0, y: 0, width: 760, height: Math.max(120, b.y + b.height + 50) } })
  await unring(D, ['.tx'])
}

/* ---- 5: the Leave War's read-only sheet. A whole day of LL for Ranger (bane) is filed on the Inputs page as the admin,
        then its box on the war is tapped. */
const fileLeave = async (page, person, iso, remarks) => {
  await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  if (await page.locator('[data-testid="win-inputedit"]').count()) await page.locator('#inpEditCancel').click()
  await page.locator('#inNew').click()
  await page.waitForSelector('#inpEditSave')
  await page.selectOption('#inpEditType', 'LL')
  await page.selectOption('#inpEditPerson', person)
  for (let i = 0; i < 36 && !(await page.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) {
    const at = await page.locator('[data-testid="inpEdCal"]').getAttribute('data-month')
    await page.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await page.locator(`#inpEdCal [data-iso="${iso}"]`).click()
  if (await page.locator('#inpEditSpan').count()) await page.locator('#inpEditSpan [data-span="all"]').click()
  const before = await page.evaluate(() => window.INPUTS.length)
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(700)
  for (let i = 0; i < 3; i++) {
    const nodoc = page.locator('[data-testid="docconf-nodoc"]')
    if (await nodoc.count()) { await nodoc.click(); await page.waitForTimeout(600); continue }
    break
  }
  return (await page.evaluate(() => window.INPUTS.length)) - before
}
const lwOpen = async (page, iso) => {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await page.waitForTimeout(600)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await page.waitForTimeout(300) }
  const m = page.locator(`[data-testid="month-${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+iso.slice(5, 7) - 1]}"]:visible`).first()
  if (await m.count()) { await m.click(); await page.waitForTimeout(900) }
  await page.locator(`[data-testid="head-${iso}"]`).waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
}
const tapCell = async (page, id, iso) => {
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  await page.mouse.click(at.x, at.y); await page.waitForTimeout(700)
}
const P = 'rocky', E = '2026-02-06'   // Rocky's day is filed by the admin; Ranger (the member account us) then looks at it
let sheetOk = false
try {
  say('filed:', await fileLeave(D, P, E, 'Filed on the Inputs page'))
  await D.locator('#logout').click(); await D.waitForSelector('#luser'); await D.fill('#luser', 'us'); await D.fill('#lpass', 'us'); await D.click('#loginForm button[type=submit]'); await D.waitForSelector('#vWeek .day', { state: 'attached' }); await D.waitForTimeout(600)
  await lwOpen(D, E)
  await tapCell(D, P, E)
  const sheet = D.locator('[data-testid="raptor-sheet"]').first()
  if (await sheet.count()) {
    /* "Leave from Raptor" is the dialog's aria-label (read aloud by a screen reader), NOT text drawn on screen: so the whole
       sheet is ringed, and its hidden name is reported beside the picture. */
    say('sheet aria-label (not drawn):', await sheet.getAttribute('aria-label'))
    say('sheet visible text:', (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 200))
    await sheet.evaluate(RING)
    const b = await sheet.boundingBox()
    await D.screenshot({ path: join(OUT, '05-leavewar-sheet.png'), clip: pad(b, 40, 1536, 864) })
    await sheet.evaluate(UNRING)
    sheetOk = true
  } else say('NOT OPEN: raptor-sheet; sheets now:', await D.evaluate(() => [...document.querySelectorAll('.bidsheet[role="dialog"]')].map(e => e.getAttribute('data-testid'))))
} catch (e) { say('step 5 threw:', String(e.message).slice(0, 300)) }
/* ---- 6: the select-and-decide window's note. Admin; Ranger (bane) has a leave filed on the Inputs page on 10 Feb; the admin
        drags 9-11 Feb, fills LL (the two free days become pending bids), drags again and presses Approve: two are decided, the day
        filed on the Inputs page is skipped, and the note says so. */
const dragRect = async (page, a, isoA, b, isoB) => {
  await page.locator(`[data-testid="cell-${a}-${isoA}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(350)
  const bx = async (id, iso) => page.locator(`[data-testid="cell-${id}-${iso}"]`).first().boundingBox()
  const b1 = await bx(a, isoA), b2 = await bx(b, isoB)
  const x1 = b1.x + b1.width / 2, y1 = b1.y + b1.height / 2, x2 = b2.x + b2.width / 2, y2 = b2.y + b2.height / 2
  await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move(x1 + 6, y1 + 1, { steps: 3 }); await page.mouse.move(x2, y2, { steps: 14 }); await page.mouse.up(); await page.waitForTimeout(700)
}
const selPress = async (page, id) => { await page.locator(`[data-testid="select-sheet"] [data-testid="${id}"]:visible`).first().click(); await page.waitForTimeout(700) }
try {
  await D.keyboard.press('Escape'); await D.waitForTimeout(400)
  await D.locator('#logout').click(); await D.waitForSelector('#luser'); await signIn(D)
  say('filed bane 10 Feb:', await fileLeave(D, 'bane', '2026-02-10', 'x'))
  await lwOpen(D, '2026-02-09')
  await dragRect(D, 'bane', '2026-02-09', 'bane', '2026-02-11')
  const tick = D.locator('[data-testid="sel-approve-tick"]').first()
  if ((await tick.getAttribute('aria-checked')) === 'true') { await tick.click(); await D.waitForTimeout(300) }
  await selPress(D, 'sel-LL')
  await dragRect(D, 'bane', '2026-02-09', 'bane', '2026-02-11'); await selPress(D, 'sel-approve')
  const note = D.locator('[data-testid="sel-note"]').first()
  if (await note.count()) {
    say('sel-note:', (await note.innerText()).replace(/\s+/g, ' '))
    await note.evaluate(RING)
    const sh = D.locator('[data-testid="select-sheet"]').first()
    const b = await sh.boundingBox()
    await D.screenshot({ path: join(OUT, '06-leavewar-select-note.png'), clip: pad(b, 30, 1536, 864) })
  } else say('NOT REACHED: no sel-note')
} catch (e) { say('step 6 threw:', String(e.message).slice(0, 300)) }
say('page errors:', errs.length, errs.slice(0, 3))
await browser.close()
