/* THE WALK of the Insights and Logic small fixes (21 Oct 26 — [LOGIC-REDRAW-DROPS-TYPING], [LOGIC-DONE-FIRST-PRESS]).
   The Logic page's ✎ Edit, driven through its real controls on the built app, at a desktop width (mouse and keys) and at
   his iPhone's width (finger). Each step asserts the RIGHT behaviour, so running it again is the re-walk:
     node scripts/handpass/walk-logic-fixes.mjs [port]            → docs/img/handpass/2026-10-21-logic-fixes/walk/
     WALK_DIR=rewalk node scripts/handpass/walk-logic-fixes.mjs   → …/rewalk/
   Prints one line a check (PASS / FAIL / NOT WALKED, with the value it judged) and every console error met. */
import { chromium } from 'playwright'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const PORT = process.argv[2] || '4290'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', '..', 'docs', 'img', 'handpass', '2026-10-21-logic-fixes', process.env.WALK_DIR || 'walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

let pass = 0, fail = 0, notWalked = 0
const errors = []
const check = (id, ok, what, seen) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what} — saw ${JSON.stringify(seen)}`) }

async function world(label, vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: touch, isMobile: touch })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${label} pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${label} console: ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${label} ${r.status()} ${r.url()}`) })
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  return { ctx, page }
}
const shot = (page, name) => page.screenshot({ path: join(OUT, `${name}.png`) })
const V = (page, k) => page.evaluate(k => window.VCONF[k], k)
const focused = page => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'nothing'; return a.dataset?.lgset || a.dataset?.lgkind && `kind:${a.dataset.lgkind}` || (a.dataset?.lgmix && 'insights switch') || a.id || a.getAttribute('aria-label') || a.tagName })
const box = (page, k) => page.locator(`#lgBody input[data-lgset="${k}"]`)
const nextBox = (page, k) => box(page, k).evaluate(b => { const all = [...document.querySelectorAll('#lgBody input[data-lgset]')]; return all[all.indexOf(b) + 1].dataset.lgset })
const editing = page => page.locator('#lgDone').isVisible()
const press = async (page, loc, touch) => {
  const b = await loc.boundingBox()
  if (touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
}
const standard = page => page.evaluate(() => { window.rulesReset(); window.rulesSave(); window.validate(); window.notify?.() })
const toastText = page => page.evaluate(() => document.getElementById('toastEl')?.textContent || '')

/* ===================== DESKTOP — 1440 × 900, mouse and keys ===================== */
{
  const { ctx, page } = await world('desktop', { width: 1440, height: 900 }, false)
  const P = 'D'

  /* D1 — straight in from the week, ✎ Edit, a value typed slowly across the page's late repaint, then Tab */
  await page.evaluate(() => window.go('logic'))
  await page.locator('#lgEdit').click()
  const nxt = await nextBox(page, 'reportLead')
  await box(page, 'reportLead').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('2h3')
  await page.waitForTimeout(2500)
  await page.keyboard.type('0')
  check(`${P}1a`, await box(page, 'reportLead').inputValue() === '2h30', 'a value typed across the late repaint is all there', await box(page, 'reportLead').inputValue())
  await shot(page, `${P}01-typed-across-repaint`)
  await page.keyboard.press('Tab'); await page.waitForTimeout(300)
  check(`${P}1b`, await V(page, 'reportLead') === 150, 'Tab saved it: Default rally 2h30', await V(page, 'reportLead'))
  check(`${P}1c`, await focused(page) === nxt, `the keyboard went on to the next box (${nxt})`, await focused(page))
  await shot(page, `${P}02-tab-next-box`)

  /* D2 — a value typed, then a PRESS on another box: saved, the keyboard there, typing replaces it (D1080) */
  await box(page, 'crewRest').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('11h')
  await box(page, 'debrief').click(); await page.waitForTimeout(200)
  check(`${P}2a`, await V(page, 'crewRest') === 660, 'crew rest saved as 11h by the press elsewhere', await V(page, 'crewRest'))
  check(`${P}2b`, await focused(page) === 'debrief', 'the keyboard is in the box pressed', await focused(page))
  await page.keyboard.type('1h30'); await page.waitForTimeout(100)
  check(`${P}2c`, await box(page, 'debrief').inputValue() === '1h30', 'typing replaced the box pressed (not added to it)', await box(page, 'debrief').inputValue())
  await shot(page, `${P}03-press-next-box`)

  /* D3 — leaving the list with a press on the page's own heading: saved, and the keyboard is NOT pulled back */
  await press(page, page.locator('.lgttl'), false); await page.waitForTimeout(300)
  check(`${P}3a`, await V(page, 'debrief') === 90, 'debrief saved as 1h30', await V(page, 'debrief'))
  check(`${P}3b`, !(await page.evaluate(() => document.getElementById('lgBody').contains(document.activeElement))), 'the keyboard stayed out of the list', await focused(page))
  await shot(page, `${P}04-left-the-list`)

  /* D4 — a refused value then Tab: the refusal is said, the box shows the live value, the keyboard moves on */
  await box(page, 'crewRest').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('abc')
  const nCR = await nextBox(page, 'crewRest')
  await page.keyboard.press('Tab'); await page.waitForTimeout(300)
  check(`${P}4a`, /must be between/.test(await toastText(page)), 'the refusal is said', await toastText(page))
  check(`${P}4b`, await box(page, 'crewRest').inputValue() === '11h' && await V(page, 'crewRest') === 660, 'the box shows the live 11h; nothing changed', [await box(page, 'crewRest').inputValue(), await V(page, 'crewRest')])
  check(`${P}4c`, (await focused(page)) !== 'crewRest' && (await focused(page)) !== 'nothing', `the keyboard moved on (the next stop: ${nCR}, or the row's Reset)`, await focused(page))
  await shot(page, `${P}05-refused-then-tab`)

  /* D5 — Enter in a box saves it and leaves the keyboard in it */
  await box(page, 'simLen').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('2h')
  await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  check(`${P}5a`, await V(page, 'simLen') === 120, 'Enter saved the sim length 2h', await V(page, 'simLen'))
  check(`${P}5b`, await focused(page) === 'simLen', 'the keyboard stays in the box', await focused(page))
  await shot(page, `${P}06-enter-saves-stays`)

  /* D6 — a clash-grading toggle by the keyboard (Space): flipped, the keyboard stays on it */
  const kind = page.locator('#lgBody input[data-lgkind]').first()
  const kk = await kind.getAttribute('data-lgkind'), was = await page.evaluate(k => !!window.SHIFT_HARD?.[k], kk)
  await kind.focus(); await page.keyboard.press('Space'); await page.waitForTimeout(300)
  const now = await page.evaluate(k => !!window.SHIFT_HARD?.[k], kk)
  if (await page.evaluate(() => typeof window.SHIFT_HARD) === 'undefined') { notWalked++; console.log(`NOT WALKED ${P}6 — SHIFT_HARD is not on the test bridge`) }
  else check(`${P}6a`, now !== was, `the toggle flipped (${kk})`, [was, now])
  check(`${P}6b`, await focused(page) === `kind:${kk}`, 'the keyboard stays on the toggle', await focused(page))
  await shot(page, `${P}07-kind-toggle-keys`)
  await page.keyboard.press('Space'); await page.waitForTimeout(200)

  /* D7 — the Insights switch by the keyboard: flipped, the keyboard stays on it */
  const sw = page.locator('#lgBody [data-lgmix]')
  const swWas = await sw.isChecked()
  await sw.focus(); await page.keyboard.press('Space'); await page.waitForTimeout(300)
  check(`${P}7a`, await page.locator('#lgBody [data-lgmix]').isChecked() === !swWas, 'the switch flipped', [swWas, await page.locator('#lgBody [data-lgmix]').isChecked()])
  check(`${P}7b`, await focused(page) === 'insights switch', 'the keyboard stays on the switch', await focused(page))
  await shot(page, `${P}08-insights-switch-keys`)
  await page.keyboard.press('Space'); await page.waitForTimeout(200)

  /* D8 — a "How it works" fold opened stays open through a save */
  const fold = page.locator('#lgBody details[data-how]').first()
  const how = await fold.getAttribute('data-how')
  await fold.locator('summary').click()
  await box(page, 'longDay').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('13h'); await page.keyboard.press('Tab'); await page.waitForTimeout(300)
  check(`${P}8a`, await V(page, 'longDay') === 780, 'the long day saved as 13h', await V(page, 'longDay'))
  check(`${P}8b`, await page.locator(`#lgBody details[data-how="${how}"]`).evaluate(d => d.open), 'the opened fold is still open after the save', how)
  await page.locator(`#lgBody details[data-how="${how}"]`).scrollIntoViewIfNeeded()
  await shot(page, `${P}09-fold-stays-open`)

  /* D9 — a row's own Reset: back to standard, the keyboard on that row's box */
  await box(page, 'longDay').scrollIntoViewIfNeeded()
  await page.locator('#lgBody [data-lgreset="longDay"]').click(); await page.waitForTimeout(300)
  check(`${P}9a`, await V(page, 'longDay') === 720, 'the long day back to 12h', await V(page, 'longDay'))
  check(`${P}9b`, await focused(page) === 'longDay', "the keyboard is on the row's box", await focused(page))
  await shot(page, `${P}10-row-reset`)

  /* D10 — Done by mouse straight after a changed value: ONE press saves it and ends editing */
  await box(page, 'epBrief').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('20')
  await page.locator('#lgDone').scrollIntoViewIfNeeded()
  await shot(page, `${P}11-before-done`)
  await press(page, page.locator('#lgDone'), false); await page.waitForTimeout(300)
  check(`${P}10a`, await V(page, 'epBrief') === 20, 'the EP sim brief saved as 20', await V(page, 'epBrief'))
  check(`${P}10b`, !(await editing(page)) && await page.locator('#lgEdit').isVisible(), 'one press ended editing: ✎ Edit is back', await editing(page))
  await shot(page, `${P}12-after-one-done`)

  /* D11 — Done with a refused value in the box: the refusal said, nothing changed, editing ends */
  await page.locator('#lgEdit').click()
  await box(page, 'crewRest').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('3h')
  await press(page, page.locator('#lgDone'), false); await page.waitForTimeout(300)
  check(`${P}11a`, /must be between/.test(await toastText(page)) && await V(page, 'crewRest') === 660, 'refused, said, crew rest still 11h', [await toastText(page), await V(page, 'crewRest')])
  check(`${P}11b`, !(await editing(page)), 'editing ended', await editing(page))
  await shot(page, `${P}13-done-refused`)

  /* D12 — a value typed, then straight to another page by the top bar: saved on the way out */
  await page.locator('#lgEdit').click()
  await box(page, 'step').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('1h15')
  await press(page, page.locator('.nav a[data-page="editsched"]').first(), false)
  await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(300)
  check(`${P}12`, await V(page, 'step') === 75, 'the step saved as 1h15 on leaving the page', await V(page, 'step'))
  await shot(page, `${P}14-left-the-page`)

  /* D13 — back on Logic: Reset to standard puts every value back */
  await page.evaluate(() => window.go('logic')); await page.waitForTimeout(300)
  if (!(await editing(page))) await page.locator('#lgEdit').click()
  await page.locator('#lgReset').click(); await page.waitForTimeout(300)
  check(`${P}13`, await V(page, 'step') === 60 && await V(page, 'crewRest') === 720 && await V(page, 'reportLead') === 180, 'everything back to standard', [await V(page, 'step'), await V(page, 'crewRest'), await V(page, 'reportLead')])
  await shot(page, `${P}15-reset-all`)

  /* D14 — the code read's F2: a row's Reset pressed while that row's box is being retyped — the row shows its standard */
  await box(page, 'crewRest').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('11h'); await page.keyboard.press('Tab'); await page.waitForTimeout(300)
  await box(page, 'crewRest').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('13')
  await page.locator('#lgBody [data-lgreset="crewRest"]').click(); await page.waitForTimeout(400)
  check(`${P}14a`, await V(page, 'crewRest') === 720, 'crew rest back to 12h', await V(page, 'crewRest'))
  check(`${P}14b`, await box(page, 'crewRest').inputValue() === '12h', 'the box shows the standard, not the typing', await box(page, 'crewRest').inputValue())
  await shot(page, `${P}16-row-reset-while-typing`)
  await ctx.close()
}

/* ===================== PHONE — 402 × 874, a finger ===================== */
{
  const { ctx, page } = await world('phone', { width: 402, height: 874 }, true)
  const P = 'P'
  await page.evaluate(() => window.go('logic'))
  await press(page, page.locator('#lgEdit'), true); await page.waitForTimeout(200)

  /* P1 — a value typed slowly across the late repaint, then a tap on the next box */
  const b1 = box(page, 'reportLead'); await b1.scrollIntoViewIfNeeded()
  await press(page, b1, true); await b1.fill(''); await page.keyboard.type('2h3'); await page.waitForTimeout(2500); await page.keyboard.type('0')
  check(`${P}1a`, await b1.inputValue() === '2h30', 'a value typed across the late repaint is all there', await b1.inputValue())
  await press(page, box(page, 'briefLead'), true); await page.waitForTimeout(300)
  check(`${P}1b`, await V(page, 'reportLead') === 150, 'saved by the tap on the next box', await V(page, 'reportLead'))
  check(`${P}1c`, await focused(page) === 'briefLead', 'the keyboard is in the box tapped', await focused(page))
  await shot(page, `${P}01-tap-next-box`)
  await press(page, page.locator('.lgttl'), true); await page.waitForTimeout(200)

  /* P2 — a changed value, then ONE tap on Done: saved and editing ended; Reset all appears beside ✎ Edit */
  await press(page, page.locator('#lgReset'), true); await page.waitForTimeout(300)
  const b2 = box(page, 'reportLead'); await b2.scrollIntoViewIfNeeded()
  await press(page, b2, true); await b2.fill('2h30')
  const before = await page.locator('#lgDone').boundingBox()
  await shot(page, `${P}02-before-done`)
  await press(page, page.locator('#lgDone'), true); await page.waitForTimeout(300)
  check(`${P}2a`, await V(page, 'reportLead') === 150, 'one tap saved the default rally 2h30', await V(page, 'reportLead'))
  check(`${P}2b`, !(await editing(page)) && await page.locator('#lgEdit').isVisible(), 'one tap ended editing', await editing(page))
  check(`${P}2c`, await page.locator('#lgReset').isVisible(), 'the changed value offers Reset', await page.locator('#lgReset').isVisible())
  console.log(`      Done stood at x=${Math.round(before.x)}; ✎ Edit now at x=${Math.round((await page.locator('#lgEdit').boundingBox()).x)}`)
  await shot(page, `${P}03-after-one-done`)

  /* P3 — in editing again, a row's own Reset by finger; then Reset all by finger */
  await press(page, page.locator('#lgEdit'), true); await page.waitForTimeout(200)
  const r = page.locator('#lgBody [data-lgreset="reportLead"]'); await r.scrollIntoViewIfNeeded()
  await press(page, r, true); await page.waitForTimeout(300)
  check(`${P}3a`, await V(page, 'reportLead') === 180, "the row's Reset put the default rally back to 3h", await V(page, 'reportLead'))
  await shot(page, `${P}04-row-reset`)
  const b3 = box(page, 'crewRest'); await b3.scrollIntoViewIfNeeded(); await press(page, b3, true); await b3.fill('10h')
  await press(page, page.locator('.lgttl'), true); await page.waitForTimeout(300)
  await press(page, page.locator('#lgReset'), true); await page.waitForTimeout(300)
  check(`${P}3b`, await V(page, 'crewRest') === 720, 'Reset all put crew rest back to 12h', await V(page, 'crewRest'))
  await press(page, page.locator('#lgDone'), true); await page.waitForTimeout(200)
  check(`${P}3c`, !(await editing(page)), 'Done by one tap with nothing changed', await editing(page))
  await shot(page, `${P}05-reset-all-done`)

  /* P4 — the code read's F1: a value typed and, straight away, "Reset all" tapped — the reset wins */
  await press(page, page.locator('#lgEdit'), true); await page.waitForTimeout(200)
  const b4 = box(page, 'debrief'); await b4.scrollIntoViewIfNeeded(); await press(page, b4, true); await b4.fill('1h30')
  await press(page, page.locator('.lgttl'), true); await page.waitForTimeout(300)   // one saved, so "Reset all" is offered
  const b5 = box(page, 'crewRest'); await b5.scrollIntoViewIfNeeded(); await press(page, b5, true); await b5.fill('11h')
  await press(page, page.locator('#lgReset'), true); await page.waitForTimeout(400)
  check(`${P}4`, await V(page, 'crewRest') === 720 && await V(page, 'debrief') === 120, 'Reset all with a value still in its box: everything standard', [await V(page, 'crewRest'), await V(page, 'debrief')])
  await shot(page, `${P}06-reset-all-while-typing`)
  await ctx.close()
}

await browser.close()
console.log(`\n${pass} PASS · ${fail} FAIL · ${notWalked} NOT WALKED · errors met: ${errors.length}`)
for (const e of errors) console.log('  ' + e)
console.log(`pictures: ${OUT}`)
