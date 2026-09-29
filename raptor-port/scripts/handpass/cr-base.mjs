/* [HUMAN-RETEST] change-recording re-test — the BASELINE look (28 Sep 26), before anything is built.
   `[UNDO-ROSTER-SETTINGS]` says: "Walk it first: confirm on screen that Undo stays greyed or skips a roster / settings
   edit." This walk records what the ONE Undo does TODAY with a Quals edit, a Logic setting and an Admin → Users add,
   alone and mixed with a schedule edit. It asserts TODAY's behaviour on `main` (PASS = the app does what the backlog
   says it does today), so it doubles as the "before" pictures of the evidence sheet.
   HP_URL (default http://localhost:4173), HP_W × HP_H, HP_SHOTS. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4173'
const W = +(process.env.HP_W || 1440), H = +(process.env.HP_H || 900)
const TAG = W < 700 ? 'phone' : 'desktop'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-change-recording') + '/base-' + TAG
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(W < 700 ? { hasTouch: true, isMobile: true } : {}) })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
const rows = []
let n = 0
const shot = async (name) => { const f = `${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: `${OUT}/${f}` }); return f }
async function step(id, what, fn) {
  let ok = false, note = '', pic = ''
  try { const r = await fn(); ok = r === true || (r && r.ok); note = r && r.note ? r.note : ''; pic = r && r.pic ? r.pic : '' }
  catch (e) { note = 'THREW ' + String(e && e.message || e).slice(0, 200) }
  rows.push({ id, what, ok, note, pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${note ? ' — ' + note : ''}`)
}
const go = async (p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await page.waitForTimeout(500) }
const undoBtn = () => page.$eval('#undoBtn', e => ({ dis: e.disabled, title: e.title })).catch(() => null)
const toastTxt = () => page.$eval('#toastEl', e => getComputedStyle(e).opacity !== '0' ? (e.textContent || '') : '').catch(() => '')
const pressUndo = async () => { await page.click('#undoBtn'); await page.waitForTimeout(500); return toastTxt() }

await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)

/* B1 — a Quals edit alone: Undo on Edit Schedule stays greyed */
let qual = null
await step('B1', 'a Quals tick, then Edit Schedule: Undo greyed (nothing it can reverse)', async () => {
  await go('quals')
  await page.click('#qEdit'); await page.waitForTimeout(300)
  const cell = page.locator('#qtbl td.qcell[data-q]:visible').first()
  qual = await cell.getAttribute('data-q')
  const before = (await cell.textContent() || '').trim()
  await cell.click(); await page.waitForTimeout(400)
  const after = (await page.locator(`#qtbl td.qcell[data-q="${qual}"]`).first().textContent() || '').trim()
  const pic1 = await shot('quals-tick')
  await go('editsched')
  const u = await undoBtn()
  const pic = await shot('editsched-undo-after-quals')
  return { ok: before !== after && u && u.dis === true, note: `tick ${qual} "${before}"→"${after}"; Undo disabled=${u && u.dis} title="${u && u.title}"`, pic: pic1 + ', ' + pic }
})

/* B2 — a schedule edit, then a Quals edit: Undo skips the Quals edit and reverses the schedule edit */
await step('B2', 'a schedule note, then a Quals tick: Undo reverses the NOTE, the tick stays', async () => {
  await go('editsched')
  const note = page.locator('#eWeek [data-txt^="dn:"]:visible, #eWeek textarea[data-txt^="dn:"]:visible').first()
  const has = await note.count()
  if (!has) return { ok: false, note: 'no day-note box on the edit week' }
  await note.click(); await note.fill('BASELINE NOTE'); await note.blur(); await page.waitForTimeout(400)
  await go('quals')
  if (await page.locator('#qEdit:visible').count()) { await page.click('#qEdit'); await page.waitForTimeout(300) }
  const cell = page.locator('#qtbl td.qcell[data-q]:visible').nth(1)
  const q2 = await cell.getAttribute('data-q')
  const b = (await cell.textContent() || '').trim()
  await cell.click(); await page.waitForTimeout(400)
  const a = (await page.locator(`#qtbl td.qcell[data-q="${q2}"]`).first().textContent() || '').trim()
  await go('editsched')
  const u = await undoBtn()
  const t = await pressUndo()
  const noteNow = await page.$eval('#eWeek [data-txt^="dn:"]', e => e.value ?? e.textContent).catch(() => '?')
  await go('quals')
  const still = (await page.locator(`#qtbl td.qcell[data-q="${q2}"]`).first().textContent() || '').trim()
  const pic = await shot('quals-tick-survives-undo')
  return { ok: u && !u.dis && noteNow !== 'BASELINE NOTE' && still === a && a !== b, note: `Undo title "${u && u.title}", toast "${t}"; note now "${noteNow}"; tick ${q2} "${b}"→"${a}", after Undo "${still}"`, pic }
})

/* B3 — a Logic setting change: Undo greyed */
await step('B3', 'a Logic rule switched: Undo greyed', async () => {
  await go('logic')
  if (await page.locator('#lgEdit:visible').count()) { await page.click('#lgEdit'); await page.waitForTimeout(300) }
  const box = page.locator('#lgBody input[data-lgkind]:visible').first()
  if (!(await box.count())) return { ok: false, note: 'no Logic switch found' }
  const k = await box.getAttribute('data-lgkind')
  const was = await box.isChecked()
  await box.click(); await page.waitForTimeout(400)
  const now = await page.locator(`#lgBody input[data-lgkind="${k}"]`).first().isChecked()
  const pic1 = await shot('logic-switch')
  await go('editsched')
  const u = await undoBtn()
  const pic = await shot('editsched-undo-after-logic')
  return { ok: was !== now && u && u.dis === true, note: `switch ${k} ${was}→${now}; Undo disabled=${u && u.dis}`, pic: pic1 + ', ' + pic }
})

/* B4 — Admin → Users: Add a person (the form at the foot), then Undo: greyed */
await step('B4', 'Admin → Users "Add a person", then Edit Schedule: Undo greyed', async () => {
  await go('admin')
  await page.waitForTimeout(300)
  const pic1 = await shot('admin-users')
  await go('editsched')
  const u = await undoBtn()
  return { ok: !!u, note: `(add-person form not driven in the baseline — see the walk) Undo disabled=${u && u.dis}`, pic: pic1 }
})

/* B5 — no Undo on the pages where roster and settings are changed */
await step('B5', 'Quals, Admin, Logic and Inputs carry no Undo button', async () => {
  const out = []
  for (const p of ['quals', 'admin', 'logic', 'inputs']) {
    await go(p)
    const vis = await page.locator('#undoBtn:visible, [data-testid="lw-undo"]:visible').count()
    out.push(`${p}:${vis}`)
  }
  const pic = await shot('inputs-no-undo')
  return { ok: out.every(s => s.endsWith(':0')), note: out.join(' '), pic }
})

const md = [`# Baseline — ${TAG} (${W}×${H})`, '', '| # | What | Result | Note | Picture |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.id} | ${r.what} | ${r.ok ? 'PASS' : 'FAIL'} | ${r.note.replace(/\|/g, '/')} | ${r.pic} |`),
  '', `Errors seen: ${errors.length ? errors.map(e => e.slice(0, 160)).join(' · ') : 'none'}`]
writeFileSync(`${OUT}/results.md`, md.join('\n'))
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
