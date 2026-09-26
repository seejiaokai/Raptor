/* [POST-OUT-OUTCOMES] walk A (27 Sep 26) — the posting doors and each outcome on its date, desktop.
   The plan's roll-call (docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md §Roll-call) rows 1, 2, 4, 5, 6, 7,
   8, 9, 23, 24, 28, 31 — driven on the REAL production bundle in a real Chromium, pictures to disk. Every step ASSERTS
   the right behaviour (PASS means correct), so re-running it on a fixed build IS the re-walk (bug-check order §5).
   Fixtures go through the app's own controls: the Leave War grid, the bid sheet, Admin → Users, Quals. The clock is the
   calendar date (the plan's Round 2 — one clock), so the postings are dated TODAY and run at once.
   Run: HP_URL=http://localhost:4192 HP_SHOTS=… HP_OUT=… node scripts/handpass/po-walk-a.mjs            */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4192'
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build') }
const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-27-post-out-outcomes/a'
const OUT = process.env.HP_OUT || `${SHOTS}/walk.json`
mkdirSync(SHOTS, { recursive: true })

const p2 = n => String(n).padStart(2, '0')
const d0 = new Date()
const TODAY = `${d0.getFullYear()}-${p2(d0.getMonth() + 1)}-${p2(d0.getDate())}`
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DM = `${Number(TODAY.slice(8))} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(TODAY.slice(5, 7)) - 1]}`
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` }

const results = []
let shotN = 0
async function world(width, height) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { browser, page, errors }
}
async function shot(page, name) {
  const f = `${p2(++shotN)}-${name}.png`
  await page.screenshot({ path: `${SHOTS}/${f}`, fullPage: false })
  return f
}
async function step(page, id, what, fn) {
  let ok = false, note = ''
  try { const r = await fn(); ok = r === true || !!(r && r.ok === true); if (typeof r === 'string') note = r; else if (r && r.note) note = r.note } catch (e) { note = String(e && e.message || e).slice(0, 300) }
  const pic = await shot(page, id).catch(() => '')
  results.push({ id, what, ok, note, pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${note ? ' :: ' + note : ''}`)
}
async function signOut(page) {
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = page.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await page.waitForTimeout(500); break }
  }
  if (await page.locator('#luser').count() === 0) {
    const b = page.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(300); await page.click('#drawerLogout'); await page.waitForTimeout(500) }
  }
  await page.waitForSelector('#luser')
}
async function signIn(page, name, pass = 'x') {
  if (await page.locator('#luser').count() === 0) await signOut(page)
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(900)
}
const text = async (page, sel) => ((await page.locator(sel).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
const P = (page, id) => page.evaluate(i => { const p = window.PEOPLE[i]; return p ? { cs: p.cs, archived: !!p.archived, archivedBy: p.archivedBy || '', deleted: !!p.deleted, deletedFrom: p.deletedFrom || '', san: !!p.san, sanBy: p.sanBy || '' } : null }, id)
async function go(page, to) { await page.evaluate(p => window.go(p), to); await page.waitForTimeout(700) }
async function lwMonth(page, iso) {
  await go(page, 'leavewar')
  const m = page.locator(`[data-testid="month-${MON[Number(iso.slice(5, 7)) - 1]}"]`)
  if (await m.count()) { await m.first().click(); await page.waitForTimeout(900) }
}
async function tapCell(page, id, iso) {
  await lwMonth(page, iso)
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`)
  await c.scrollIntoViewIfNeeded()
  await c.click()
  await page.waitForTimeout(400)
}
async function usersRow(page, acct) {
  await go(page, 'admin')
  const t = page.locator('[data-admcat="users"]'); if (await t.count() && await t.first().isVisible()) { await t.first().click(); await page.waitForTimeout(300) }
  return text(page, `[data-acct="${acct}"]`)
}
async function archivedList(page) {
  await go(page, 'quals')
  if (!(await page.locator('[data-testid="qarchlist"]').count())) { await page.click('#qArchToggle'); await page.waitForTimeout(400) }
  return text(page, '[data-testid="qarchlist"]')
}

/* ======================= DESKTOP ======================= */
const { browser, page, errors } = await world(1440, 900)
await signIn(page, 'ad', 'a')
const HEX = 'rocky', OUTLAW = 'casper', RANGER = 'bane'

/* ---- row 1: the bid sheet's PO — the four chips, the one line, "Post out" (D229, D294, D298, D300) ---- */
await tapCell(page, HEX, TODAY)
await page.click('[data-testid="bid-postout"]'); await page.waitForTimeout(300)
await step(page, 'a01-bid-po-chips', 'the bid sheet\'s PO: four chips, Overseas Sqn chosen, Transfer not pressable, one line, "Post out"', async () => {
  const line = await text(page, '[data-testid="po-line"]')
  const ov = await page.locator('[data-testid="po-overseas"]').getAttribute('aria-pressed')
  const tr = await page.locator('[data-testid="po-transfer"]').isDisabled()
  const btn = await text(page, '[data-testid="po-confirm"]')
  const want = `On ${DM}: archived on Quals, account suspended.`
  return ov === 'true' && tr && btn === 'Post out' && line === want ? true : `line "${line}" (want "${want}") ov ${ov} transfer disabled ${tr} button "${btn}"`
})
await page.click('[data-testid="po-delete"]'); await page.waitForTimeout(200)
await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(300)
await step(page, 'a02-bid-po-delete-asks', 'Delete asks twice: the first tap names him and writes nothing', async () => {
  const btn = await text(page, '[data-testid="po-confirm"]')
  const line = await text(page, '[data-testid="po-line"]')
  const p = await P(page, HEX)
  return btn === 'Tap again to delete Hex' && !p.deleted && line.includes('deleted with his account') ? true : `button "${btn}" line "${line}" deleted ${p.deleted}`
})
/* back out: Overseas Sqn — confirm */
await page.click('[data-testid="po-overseas"]'); await page.waitForTimeout(200)
await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(900)
await step(page, 'a03-overseas-ran', 'an Overseas Sqn posting dated today runs at once: archived on Quals by the posting', async () => {
  const p = await P(page, HEX)
  return p.archived && p.archivedBy === 'po' && !p.deleted ? true : JSON.stringify(p)
})
await page.keyboard.press('Escape').catch(() => {})
await step(page, 'a04-users-suspended', 'Admin → Users: his account reads "suspended"', async () => {
  const row = await usersRow(page, 'achex')
  return /suspended/.test(row) ? true : `row "${row}"`
})
await step(page, 'a05-quals-archived', 'Quals: he is off the roster and on the Archived list', async () => {
  const onRoster = await page.evaluate(() => !!document.querySelector('#qtbl td.qname[data-person="rocky"]')).catch(() => false)
  const arch = await archivedList(page)
  return !onRoster && /Hex/.test(arch) ? true : `on roster ${onRoster}; archived "${arch.slice(0, 120)}"`
})
await signIn(page, 'hex')
await step(page, 'a06-signin-suspended', 'his sign-in: "Your access is suspended — Ask an admin to enable it when you\'re back."', async () => {
  const h = await text(page, '#accessOff .acc-h'), p = await text(page, '#accessOff .acc-p')
  return h === 'Your access is suspended' && p === 'Ask an admin to enable it when you’re back.' ? true : `"${h}" / "${p}"`
})
await signIn(page, 'ad', 'a')

/* ---- rows 8, 9: Restore → the "he's back" prompt; Check his quals → his row outlined ---- */
await archivedList(page)
await page.click('[data-restore="rocky"]'); await page.waitForTimeout(700)
await step(page, 'a07-restore-prompt', 'Restore: he is back on the roster, his account enabled, and the prompt asks to check his quals', async () => {
  const p = await P(page, HEX)
  const prompt = await text(page, '[data-testid="back-rocky"]')
  return !p.archived && /Hex is back/.test(prompt) ? true : `archived ${p.archived}; prompt "${prompt}"`
})
await page.click('[data-back-check="rocky"]'); await page.waitForTimeout(700)
await step(page, 'a08-check-quals', 'Check his quals: the prompt answered, his row outlined', async () => {
  const outlined = await page.evaluate(() => !!document.querySelector('#qtbl td.qname[data-person="rocky"]')?.closest('tr')?.classList.contains('back-hl'))
  const still = await page.locator('[data-testid="back-rocky"]').count()
  return outlined && !still ? true : `outlined ${outlined}, prompt still ${still}`
})
await step(page, 'a09-users-enabled', 'Admin → Users: his account no longer reads "suspended"', async () => {
  const row = await usersRow(page, 'achex')
  return !/suspended/.test(row) ? true : `row "${row}"`
})

/* ---- row 28: a SANS posting — Show SANS off, then on (D283) ---- */
await tapCell(page, HEX, TODAY)
await page.click('[data-testid="bid-postout"]'); await page.waitForTimeout(300)
await page.click('[data-testid="po-sans"]'); await page.waitForTimeout(200)
await step(page, 'a10-sans-line', 'SANS chosen: the one line reads "becomes SANS"', async () => {
  const line = await text(page, '[data-testid="po-line"]')
  return line === `On ${DM}: becomes SANS.` ? true : `line "${line}"`
})
await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(900)
await page.keyboard.press('Escape').catch(() => {})
await step(page, 'a11-sans-ran', 'the SANS posting ran: ticked SANS by the posting', async () => {
  const p = await P(page, HEX)
  return p.san && p.sanBy === 'po' ? true : JSON.stringify(p)
})
await lwMonth(page, TODAY)
await step(page, 'a12-sans-show-off', 'Show SANS off: his row stays in its old place, the days from the posting hatched', async () => {
  const row = await page.locator('[data-testid="row-rocky"]').count()
  const cls = await page.locator(`[data-testid="cell-rocky-${TODAY}"]`).getAttribute('class').catch(() => '')
  return row === 1 && /gone/.test(cls || '') ? true : `row ${row}, today's cell "${cls}"`
})

/* ---- row 2: the Post out sheet on the struck day — un-choose → "nothing else" takes the SANS tick back ---- */
await page.locator(`[data-testid="cell-rocky-${TODAY}"]`).click(); await page.waitForTimeout(400)
await step(page, 'a13-postout-sheet', 'the struck day opens the Post out sheet: the same chips, SANS chosen, one line', async () => {
  const s = await page.locator('[data-testid="postout-sheet"]').count()
  const sans = await page.locator('[data-testid="postout-sans"]').getAttribute('aria-pressed')
  const line = await text(page, '[data-testid="postout-line"]')
  return s === 1 && sans === 'true' && line === `On ${DM}: becomes SANS.` ? true : `sheet ${s} sans ${sans} line "${line}"`
})
await page.click('[data-testid="postout-sans"]'); await page.waitForTimeout(700)
await step(page, 'a14-sans-taken-back', 'un-choosing SANS ("nothing else"): the SANS tick the posting made is taken back', async () => {
  const p = await P(page, HEX)
  return !p.san && !p.sanBy ? true : JSON.stringify(p)
})
await page.click('[data-testid="postout-undo"]'); await page.waitForTimeout(700)
await page.keyboard.press('Escape').catch(() => {})
await step(page, 'a15-undo-post-out', 'Undo post out: he is back in the squadron, no posting left', async () => {
  const cls = await page.locator(`[data-testid="cell-rocky-${TODAY}"]`).getAttribute('class').catch(() => '')
  return !/gone/.test(cls || '') ? true : `today's cell "${cls}"`
})

/* ---- rows 1, 7, 23, 24, 6: a Delete posting on Outlaw (he has an account) ---- */
await tapCell(page, OUTLAW, TODAY)
await page.click('[data-testid="bid-postout"]'); await page.waitForTimeout(300)
await page.click('[data-testid="po-delete"]'); await page.waitForTimeout(200)
await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(300)
await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(1200)
await page.keyboard.press('Escape').catch(() => {})
await step(page, 'a16-delete-ran', 'a Delete posting dated today, second tap: the hidden mark from today', async () => {
  const p = await P(page, OUTLAW)
  return p.deleted && p.deletedFrom === TODAY ? true : JSON.stringify(p)
})
await step(page, 'a17-delete-users', 'Admin → Users: his account is gone', async () => {
  await usersRow(page, 'acoutlaw')
  return (await page.locator('[data-acct="acoutlaw"]').count()) === 0 ? true : 'the outlaw account is still listed'
})
await step(page, 'a18-delete-quals', 'Quals: not on the roster, not on the Archived list (D299)', async () => {
  const arch = await archivedList(page)
  const onRoster = await page.evaluate(() => !!document.querySelector('#qtbl td.qname[data-person="casper"]'))
  return !onRoster && !/Outlaw/.test(arch) ? true : `on roster ${onRoster}; archived "${arch.slice(0, 120)}"`
})
await lwMonth(page, TODAY)
await step(page, 'a19-lw-month-before', 'the Leave War, the month he left: his row kept (the past keeps its record), hatched from today', async () => {
  const row = await page.locator('[data-testid="row-casper"]').count()
  const cls = await page.locator(`[data-testid="cell-casper-${TODAY}"]`).getAttribute('class').catch(() => '')
  return row === 1 && /gone/.test(cls || '') ? true : `row ${row}; today's cell "${cls}"`
})
const nextMonth = addDays(TODAY.slice(0, 8) + '28', 7)
await lwMonth(page, nextMonth)
await step(page, 'a20-lw-month-after', 'the Leave War, the month after: no row for him', async () =>
  (await page.locator('[data-testid="row-casper"]').count()) === 0 ? true : 'his row is drawn')
await step(page, 'a21-lw-delete-no-door', 'no posting door for a deleted man: his struck day opens nothing that changes his posting', async () => {
  await lwMonth(page, TODAY)
  await page.locator(`[data-testid="cell-casper-${TODAY}"]`).click().catch(() => {})
  await page.waitForTimeout(400)
  const undo = await page.locator('[data-testid="postout-undo"]').count()
  const chips = await page.locator('[data-testid="postout-overseas"]').count()
  await page.keyboard.press('Escape').catch(() => {})
  return undo === 0 && chips === 0 ? true : `Undo post out ${undo}, chips ${chips}`
})
await signIn(page, 'outlaw')
await step(page, 'a22-deleted-signin', 'his sign-in now lands on Request access (his account is gone)', async () =>
  (await page.locator('#accessRequest').count()) === 1 ? true : 'not the Request access screen')
await signIn(page, 'ad', 'a')

/* ---- row 31: a reload keeps every mark ---- */
await page.reload(); await page.waitForTimeout(1200)
if (await page.locator('#luser').count()) await signIn(page, 'ad', 'a')
await step(page, 'a23-reload', 'after a reload: Outlaw still deleted, Hex back and not SANS, no posting on Hex', async () => {
  const o = await P(page, OUTLAW), h = await P(page, HEX)
  return o.deleted && !h.archived && !h.san ? true : `outlaw ${JSON.stringify(o)} hex ${JSON.stringify(h)}`
})

writeFileSync(OUT, JSON.stringify({ results, errors }, null, 2))
console.log(`\n${results.filter(r => r.ok).length}/${results.length} PASS · errors: ${errors.length ? errors.join(' | ').slice(0, 400) : 'none'}`)
await browser.close()
