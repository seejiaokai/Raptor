// [GROUP-INPUT-ONE-ROW] — the pictures he asked for (11 Oct 26): what happens to an ALL AVAIL puck dropped on a shared
// input's row, step by step, on the built app (D745).   node scripts/handpass/gi-aa-story.mjs
// A shared Meeting for four is filed (Drifter first), ALL AVAIL is dropped on Hunter's puck, Hunter is taken off (the
// puck stays), then Drifter — the man filed first — is taken off (the puck goes with him, with the note), then Undo.
import { join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as L from './gi-w3-lib.mjs'

const OUT = 'docs/img/handpass/2026-10-11-group-input-one-row/aa-story'
mkdirSync(OUT, { recursive: true })
const ctx = await L.browser.newContext({ viewport: L.DESK, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
await page.goto(L.BASE); await L.login(page)
const log = [], sec = () => page.locator('#eWeek .day:not(.peek)').nth(L.DI).locator('.sec-grnd').first()
const pucks = async () => JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks)
async function shot(name, what) {
  const s = sec(); await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(250)
  /* the note, if one is up, in its own picture — then hidden so it does not cover the row */
  const toast = await L.toastText(page)
  if (toast) { const t = page.locator('#toastEl'); if (await t.isVisible().catch(() => false)) await t.screenshot({ path: join(OUT, name + '-note.png') }).catch(() => {}) }
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  await s.screenshot({ path: join(OUT, name + '.png') })
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  const row = await pucks(); log.push({ name, what, row, toast }); console.log(name, '|', what, '|', row, '|', toast)
}

await L.fileInput(page, { type: 'Meeting', people: L.FOUR, from: L.ISO, to: L.ISO, timed: ['14:00', '15:00'], title: L.TITLE })
await L.toWeek(page)
await shot('1-row', 'the shared input is one row with its four people')
await L.dragNameOnto(page, 'ALL AVAIL', 'Hunter'); await page.waitForTimeout(700)
await shot('2-dropped', 'ALL AVAIL dropped on Hunter')
await L.rowPuckLoc(page, 'Hunter').click({ button: 'right' }); await page.waitForTimeout(700)
await shot('3-hunter-off', 'Hunter taken off — the man it was dropped on')
await L.rowPuckLoc(page, 'Drifter').click({ button: 'right' }); await page.waitForTimeout(700)
await shot('4-drifter-off', 'Drifter taken off — the man filed first')
await L.undoOnce(page); await page.waitForTimeout(600)
await shot('5-undo', 'one Undo')
writeFileSync(join(OUT, 'story.json'), JSON.stringify({ log, errs }, null, 1))
console.log('browser errors:', errs.length, errs.slice(0, 3))
await ctx.close(); await L.browser.close()
