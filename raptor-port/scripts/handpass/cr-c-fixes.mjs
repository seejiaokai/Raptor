/* The re-walk of what the two final code reads' fixes touched (the change-recording re-test, 29 Sep 26 — Fable's and
   Astra's reports: raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-final-read-{fable,astra}.md). Each
   check ASSERTS the right behaviour, through the app's own controls, on a fresh demo world per scenario.
   R1  Astra F2 — Saturday signed and published (the Leave War's OIL credit rides the publish), then Undo pressed from
       Admin: lands on Edit Schedule; Redo; the board on Friday, Undo from the board: the board goes to Saturday.
   R2  Fable F2 — a day title typed on the Inputs calendar (the month it opens on — today's), the calendar closed, Undo from Edit Schedule: Inputs opens
       ON its calendar, the title gone.
   R3  Fable F1 — a new Leave War period created: the Undo hover and bubble read "a new Leave War period".
   R4  Fable F3 — Outlaw suspended, then a new person added WITH a sign-in: Undo refuses, naming the later change to a
       person and the way back.
   Usage (from raptor-port/): node scripts/handpass/cr-c-fixes.mjs  (HP_W=390 for the phone; CR_REWALK=1) */
import { openA1, book, door, boardOn, boardOff, signDay, publishDay, go, toasts, PHONE } from './cr-a1-lib.mjs'

const B = book('fixes')
const allErrors = []
let world = null, page = null
async function fresh() { if (world) await world.browser.close(); world = await openA1('a'); page = world.page; allErrors.push(world.errors) }
async function step(id, fn) {
  try { await fresh(); await fn() } catch (e) { B.ck(id, 'step ran', false, 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300), page ? await B.shot(page, `THREW-${id}`) : '') }
}
const cur = () => page.evaluate(() => window.CURPAGE)
const said = (r) => (r.toasts || []).join(' | ')
const tap = async (sel) => { const l = page.locator(sel).first(); if (PHONE) await l.tap().catch(() => l.click()); else await l.click(); await page.waitForTimeout(500) }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

await step('R1', async () => {
  await boardOn(page, 5)
  await signDay(page, 5, 0)
  const pr = await publishDay(page, 5)
  await boardOff(page)
  await go(page, 'admin')
  const u = await door(page, 'top', 'undo')
  const p1 = await cur()
  B.ck('R1.1', 'a Saturday publish (its OIL credit riding it), undone from Admin, lands on Edit Schedule — not the Leave War', pr.pressed && p1 === 'editsched' && /Undid: publishing a day/.test(said(u)), `page ${p1} · ${said(u)}`, await B.shot(page, 'R1-undone-from-admin'))
  await door(page, 'top', 'redo')
  await boardOn(page, 4)
  const u2 = await door(page, 'board', 'undo')
  const day = await page.evaluate(() => window.SBDAY)
  B.ck('R1.2', 'the board on Friday, its Undo of the Saturday publish brings the board to Saturday', day === 5 && /Undid: publishing a day/.test(said(u2)), `board day ${day} · ${said(u2)}`, await B.shot(page, 'R1-board-to-saturday'))
})

await step('R2', async () => {
  await go(page, 'inputs')
  await tap('button:has-text("Calendar view")')
  await tap('[data-icday="2026-09-30"]')
  const box = page.locator('#icRmkEdit').first()
  await box.fill('WALK TITLE'); await box.press('Enter'); await page.waitForTimeout(500)
  const t1 = await page.evaluate(() => (document.querySelector('[data-icday="2026-09-30"]') || {}).textContent || '')
  B.ck('R2.1', 'the day title shows on the calendar', /WALK TITLE/.test(t1), t1.slice(0, 120), await B.shot(page, 'R2-title-typed'))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await go(page, 'editsched')
  const u = await door(page, 'top', 'undo')
  const p = await cur()
  const cal = await page.locator('[data-icday="2026-09-30"]:visible').count()
  const t2 = await page.evaluate(() => (document.querySelector('[data-icday="2026-09-30"]') || {}).textContent || '')
  B.ck('R2.2', 'Undo from Edit Schedule opens Inputs ON the calendar, the title gone (Fable F2)', p === 'inputs' && cal > 0 && !/WALK TITLE/.test(t2), `page ${p} · calendar shown ${cal} · ${said(u)}`, await B.shot(page, 'R2-undone-on-calendar'))
  B.ck('R2.3', 'the bubble names the calendar: "Undid: a day title on the calendar" (it read "a personal input")', /Undid: a day title on the calendar/.test(said(u)), said(u))
})

await step('R3', async () => {
  await go(page, 'leavewar')
  await tap('[data-testid="war-new"]')
  await page.fill('[data-testid="war-name"]', 'WALK 29')
  const goTo = async (yyyymm) => {
    for (let i = 0; i < 72; i++) {
      const [name, year] = ((await page.locator('[data-testid="war-month"]').textContent()) || '').split(' ')
      const at = `${year}-${String(MONTHS.findIndex(m => m.toUpperCase() === String(name).toUpperCase()) + 1).padStart(2, '0')}`
      if (at === yyyymm) return
      await page.locator(`[data-testid="war-${at < yyyymm ? 'next' : 'prev'}-month"]`).click()
    }
  }
  await goTo('2029-01'); await page.locator('[data-testid="war-day-2029-01-01"]').click()
  await page.locator('[data-testid="war-day-2029-01-31"]').click()
  await tap('[data-testid="war-create"]')
  await page.waitForTimeout(1200)   // the war's commit runs at idle
  const st = await door(page, 'top', 'undo', { press: false })
  B.ck('R3.1', 'the Undo hover reads "a new Leave War period" — never "taking the war back to a draft" (Fable F1)', /a new Leave War period/.test(st.title || '') && !/draft/.test(st.title || ''), st.title, await B.shot(page, 'R3-war-created'))
  const u = await door(page, 'top', 'undo')
  B.ck('R3.2', 'the bubble: "Undid: a new Leave War period"', /Undid: a new Leave War period/.test(said(u)), said(u))
})

await step('R4', async () => {
  await go(page, 'admin')
  if (!(await page.locator('#accList').isVisible().catch(() => false))) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(400) }
  await tap('.acc-row[data-person="casper"] .acc-tap'); await tap('#accEdOnOff')
  await toasts(page)
  await page.keyboard.press('Escape').catch(() => {})
  await page.fill('#accAddCs', 'Nomex'); await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
  await page.fill('#accAddName', 'nomex@mail')
  await tap('#accAdd'); await toasts(page)
  const u = await door(page, 'top', 'undo')
  B.ck('R4.1', 'Undo of the suspension, behind a person added with a sign-in, refused NAMING the act and the way back (Fable F3)', /later change to a person \(added, archived, restored or posted\)/.test(said(u)) && /change it back by hand/.test(said(u)), said(u), await B.shot(page, 'R4-refused-named'))
})

if (world) await world.browser.close()
B.save(allErrors.flat())
const fails = B.rows.filter(r => r.ok === false).length
process.exit(fails ? 1 : 0)
