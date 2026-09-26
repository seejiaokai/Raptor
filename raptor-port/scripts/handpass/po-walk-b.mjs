/* [POST-OUT-OUTCOMES] walk B (27 Sep 26) — a DELETE from Admin → Users, against days still to come, desktop.
   The plan's roll-call rows 5, 17, 18, 20, 21, 31 and the scenario designers' first choices (Fable 1, 10, 11; Astra 2,
   3): a published day to come keeps its issued face and reads pending; an unpublished one loses him; loading the
   published version back never brings him back and says why; Undo never brings him back; a reload keeps it all.
   The clock is the calendar date (one clock), so the days to come are built in the week of 5 Oct 26.
   STATED SHORTCUTS (the localhost probe bridge — the fixture only, never the thing under test): the week is loaded with
   `loadWeek` (on screen: the week calendar), a flying wave added with `addWave` and Hex planted with `setSlotVal` (the
   funnel every drop uses). Publishing, the delete, the load and Undo go through the screen.
   Run: HP_URL=http://localhost:4192 HP_SHOTS=… node scripts/handpass/po-walk-b.mjs            */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4192'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-27-post-out-outcomes/b'
const lib = await import('./lib.mjs')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL
const SHOTS = process.env.HP_SHOTS
const OUT = `${SHOTS}/walk.json`
mkdirSync(SHOTS, { recursive: true })
const p2 = n => String(n).padStart(2, '0')

const results = []
let shotN = 0
async function shot(page, name) { const f = `${p2(++shotN)}-${name}.png`; await page.screenshot({ path: `${SHOTS}/${f}` }); return f }
async function step(page, id, what, fn) {
  let ok = false, note = ''
  try { const r = await fn(); ok = r === true || !!(r && r.ok === true); if (typeof r === 'string') note = r; else if (r && r.note) note = r.note } catch (e) { note = String(e && e.message || e).slice(0, 300) }
  const pic = await shot(page, id).catch(() => '')
  results.push({ id, what, ok, note, pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${note ? ' :: ' + note : ''}`)
}
const text = async (page, sel) => ((await page.locator(sel).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
const slot = (page, k) => page.evaluate(k => window.slotVal(k), k)
const toasts = []

const browser = await chromium.launch({ headless: true, ...launchOptions })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await lib.login(page, 'a')
/* every toast the app says, kept (they fade) */
await page.evaluate(() => { const o = new MutationObserver(() => { document.querySelectorAll('#toastEl, .toast, [role="status"]').forEach(t => { const s = (t.textContent || '').trim(); if (s && !(window.__toasts || []).includes(s)) (window.__toasts = window.__toasts || []).push(s) }) }); o.observe(document.body, { childList: true, subtree: true, characterData: true }) })

/* ---- the fixture: the week of 5 Oct; Hex on Tuesday's front seat (to be published) and Wednesday's (not) ---- */
const TUE = 1, WED = 2, KT = `${TUE}.0.0.0.p`, KW = `${WED}.0.0.0.p`
await page.evaluate(() => window.loadWeek('05/10/2026')); await page.waitForTimeout(700)
await page.evaluate(([t, w]) => { window.addWave(t); window.addWave(w) }, [TUE, WED]); await page.waitForTimeout(400)
await page.evaluate(([kt, kw]) => { window.setSlotVal(kt, 'rocky'); window.setSlotVal(kw, 'rocky'); window.afterSchedMutate() }, [KT, KW]); await page.waitForTimeout(500)
await step(page, 'b01-fixture', 'the fixture: Hex on Tuesday 6 Oct and Wednesday 7 Oct (front seat)', async () => {
  const t = await slot(page, KT), w = await slot(page, KW)
  return t === 'rocky' && w === 'rocky' ? true : `Tue "${t}" Wed "${w}"`
})
await lib.board(page, TUE)
const pub = await lib.publish(page, TUE)
await lib.closeBoard(page)
await step(page, 'b02-published', 'Tuesday published through the four sign-offs and Publish', async () => {
  const v = await page.evaluate(d => window.dayCurVer(d), TUE)
  return pub.published && v ? { ok: true, note: `version ${v}` } : JSON.stringify(pub)
})
const ISSUED = await page.evaluate(d => window.dayCurVer(d), TUE)

/* ---- the delete: Admin → Users → Hex → Delete account → Tap again ---- */
await lib.go(page, 'admin')
await page.click('[data-acct="achex"] .acc-tap'); await page.waitForTimeout(300)
await page.click('#accEdDel'); await page.waitForTimeout(300)
await step(page, 'b03-delete-armed', 'the first tap asks again and says what goes; nothing is deleted yet', async () => {
  const btn = await text(page, '#accEdDel'), note = await text(page, '#accEdDelNote')
  const d = await page.evaluate(() => !!window.PEOPLE.rocky.deleted)
  return /Tap again to delete Hex/.test(btn) && note.length > 0 && !d ? { ok: true, note } : `button "${btn}" note "${note}" deleted ${d}`
})
await page.click('#accEdDel'); await page.waitForTimeout(900)
await step(page, 'b04-deleted', 'the second tap: Hex deleted — his account gone, the hidden mark from today', async () => {
  const p = await page.evaluate(() => ({ d: !!window.PEOPLE.rocky.deleted, f: window.PEOPLE.rocky.deletedFrom }))
  const row = await page.locator('[data-acct="achex"]').count()
  return p.d && !row ? { ok: true, note: `from ${p.f}` } : `deleted ${p.d}, row ${row}`
})

/* ---- the days to come ---- */
await lib.go(page, 'editsched')
await step(page, 'b05-working-tue', 'Tuesday (published): the working copy loses him and reads pending', async () => {
  const t = await slot(page, KT)
  const pend = await page.evaluate(d => window.pendCount ? window.pendCount(d) : null, TUE)
  const stat = await text(page, `#eWeek .day:nth-of-type(${TUE + 1}) .daystat, #eWeek [data-di="${TUE}"] .daystat`)
  return t === '' ? { ok: true, note: `pending ${pend}; head "${stat}"` } : `Tue seat "${t}"`
})
await step(page, 'b06-working-wed', 'Wednesday (not published): he is gone from it', async () =>
  (await slot(page, KW)) === '' ? true : `Wed seat "${await slot(page, KW)}"`)
await step(page, 'b07-issued-face', 'the published Tuesday still holds him (a record — never rewritten)', async () => {
  const s = await page.evaluate(([d, v]) => JSON.stringify(window.daySnapOf(d, v)), [TUE, ISSUED])
  return s.includes('"rocky"') ? true : 'the issued version lost him'
})
await lib.go(page, 'viewsched')
await step(page, 'b08-view-only', 'View-only Sched on Tuesday still shows Hex (what was issued)', async () => {
  const has = await page.evaluate(d => !!document.querySelector(`#vWeek .day:nth-of-type(${d + 1}) [data-person="rocky"], #vWeek [data-di="${d}"] [data-person="rocky"]`), TUE)
  return has ? true : 'no Hex puck on the published face'
})

/* ---- load the published version back onto the working copy (the belt) ---- */
await lib.go(page, 'editsched')
/* the day's plan selector → "Issued · read-only" → the ORIG look → Load onto working copy (a second tap confirms,
   since the day has unpublished edits — the delete's) */
let loadNote = ''
const menu = page.locator(`#eWeek [data-planmenu="${TUE}"]:visible`).first()
if (await menu.count()) {
  await menu.click(); await page.waitForTimeout(400)
  const pv = page.locator(`[data-planpv="${ISSUED}"]:visible`).first()
  if (await pv.count()) {
    await pv.click(); await page.waitForTimeout(500)
    for (let i = 0; i < 2; i++) {
      const b = page.locator(`[data-restore="${TUE}"]:visible`).first()
      if (!(await b.count())) break
      await b.click(); await page.waitForTimeout(700)
    }
  } else loadNote = 'no issued version in the plan menu'
} else loadNote = 'no plan selector on the day'
await step(page, 'b09-load-belt', 'loading the published version back: Hex stays off, and the message says he was left out', async () => {
  const t = await slot(page, KT)
  const said = (await page.evaluate(() => window.__toasts || [])).join(' | ')
  return t === '' && /Hex left out — he has been deleted/.test(said) ? { ok: true, note: said.slice(-160) } : `${loadNote} seat "${t}" said "${said.slice(-200)}"`
})

/* ---- Undo never brings him back ---- */
for (let i = 0; i < 4; i++) {
  const u = page.locator('#undoBtn')
  if (!(await u.count()) || await u.isDisabled()) break
  await u.click(); await page.waitForTimeout(500)
}
await step(page, 'b10-undo', 'pressing Undo repeatedly never puts Hex back on a day to come, nor undeletes him', async () => {
  const t = await slot(page, KT), w = await slot(page, KW)
  const d = await page.evaluate(() => !!window.PEOPLE.rocky.deleted)
  const title = await page.locator('#undoBtn').getAttribute('title').catch(() => '')
  return t !== 'rocky' && w !== 'rocky' && d ? { ok: true, note: `undo hover "${title}"` } : `Tue "${t}" Wed "${w}" deleted ${d}`
})

/* ---- a reload keeps it ---- */
await page.reload(); await page.waitForTimeout(1200)
if (await page.locator('#luser').count()) await lib.login(page, 'a')
await page.evaluate(() => window.loadWeek('05/10/2026')); await page.waitForTimeout(700)
await step(page, 'b11-reload', 'after a reload: still deleted, still off Tuesday and Wednesday, no account', async () => {
  const d = await page.evaluate(() => !!window.PEOPLE.rocky.deleted)
  const t = await slot(page, KT), w = await slot(page, KW)
  return d && t !== 'rocky' && w !== 'rocky' ? true : `deleted ${d} Tue "${t}" Wed "${w}"`
})

writeFileSync(OUT, JSON.stringify({ results, errors }, null, 2))
console.log(`\n${results.filter(r => r.ok).length}/${results.length} PASS · errors: ${errors.length ? errors.join(' | ').slice(0, 400) : 'none'}`)
await browser.close()
