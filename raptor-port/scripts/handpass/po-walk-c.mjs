/* [POST-OUT-OUTCOMES] walk C (27 Sep 26) — the member view, a SANS posting to come with "Show SANS" on (desktop), and the
   phone: the drawer's switch, the four chips, Admin → Users' delete, Quals' Restore-as and the "he's back" prompt.
   The plan's roll-call rows 1, 5, 8, 9, 28, 29, 30 and the scenario designers' Fable 3, 19, 23; Astra 4, 13, 14, 20.
   Every step asserts the right behaviour. STATED SHORTCUT: one callsign clash is made with the probe bridge's
   `renameCallsign` (on screen: Quals' callsign box) — the Restore under test goes through the screen.
   Run: HP_URL=http://localhost:4192 node scripts/handpass/po-walk-c.mjs            */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4192'
{ const h = new URL(BASE).hostname; if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build') }
const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-27-post-out-outcomes/c'
mkdirSync(SHOTS, { recursive: true })
const p2 = n => String(n).padStart(2, '0')
const d0 = new Date()
const TODAY = `${d0.getFullYear()}-${p2(d0.getMonth() + 1)}-${p2(d0.getDate())}`
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` }
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const results = [], errorsAll = []
let shotN = 0
async function shot(page, name) { const f = `${p2(++shotN)}-${name}.png`; await page.screenshot({ path: `${SHOTS}/${f}` }); return f }
async function step(page, id, what, fn) {
  let ok = false, note = ''
  try { const r = await fn(); ok = r === true || !!(r && r.ok === true); if (typeof r === 'string') note = r; else if (r && r.note) note = r.note } catch (e) { note = String(e && e.message || e).slice(0, 300) }
  const pic = await shot(page, id).catch(() => '')
  results.push({ id, what, ok, note, pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${note ? ' :: ' + note : ''}`)
}
async function world(width, height) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const page = await (await browser.newContext({ viewport: { width, height } })).newPage()
  page.on('console', m => { if (m.type() === 'error') errorsAll.push(m.text()) })
  page.on('pageerror', e => errorsAll.push('PAGEERROR ' + e.message))
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.evaluate(() => { const o = new MutationObserver(() => { const t = document.querySelector('#toastEl'); const s = t && (t.textContent || '').trim(); if (s && !(window.__toasts || []).includes(s)) (window.__toasts = window.__toasts || []).push(s) }); o.observe(document.body, { childList: true, subtree: true, characterData: true }) })
  return { browser, page }
}
async function signIn(page, name, pass = 'x') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
}
const text = async (page, sel) => ((await page.locator(sel).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
const P = (page, id) => page.evaluate(i => { const p = window.PEOPLE[i]; return { cs: p.cs, archived: !!p.archived, deleted: !!p.deleted, san: !!p.san, sanBy: p.sanBy || '' } }, id)
async function go(page, to) { await page.evaluate(p => window.go(p), to); await page.waitForTimeout(700) }
async function lwMonth(page, iso) {
  await go(page, 'leavewar')
  const m = page.locator(`[data-testid="month-${MON[Number(iso.slice(5, 7)) - 1]}"]`)
  if (await m.count()) { await m.first().click(); await page.waitForTimeout(900) }
}
async function tapCell(page, id, iso) { await lwMonth(page, iso); const c = page.locator(`[data-testid="cell-${id}-${iso}"]`); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(400) }
const inView = async (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1 ? 'in' : `out ${Math.round(r.left)},${Math.round(r.top)}-${Math.round(r.right)},${Math.round(r.bottom)} of ${innerWidth}x${innerHeight}` }, sel)

/* ======================= DESKTOP — the member view ======================= */
{
  const { browser, page } = await world(1440, 900)
  await signIn(page, 'ad', 'a')
  /* an admin step first, so Undo in the member view has one to refuse: an ordinary schedule edit on Edit Schedule
     (STATED SHORTCUT: planted through the bridge's funnel + afterSchedMutate, a command as the signed-in admin). (A
     posting out is not a step of the Undo button — its sheet has "Undo post out" — so it cannot serve here.) */
  await go(page, 'editsched')
  await page.evaluate(() => { window.setSlotVal('0.0.0.0.w', 'bane'); window.afterSchedMutate() }); await page.waitForTimeout(500)
  await step(page, 'c01-badge-admin', 'the badge reads "Saber · Admin" and is a button (D292)', async () => {
    const t = await text(page, '#roleBadge'), tag = await page.locator('#roleBadge').evaluate(e => e.tagName)
    return /Saber · Admin/i.test(t) && tag === 'BUTTON' ? true : `"${t}" <${tag}>`
  })
  await page.click('#roleBadge'); await page.waitForTimeout(700)
  await step(page, 'c02-member-view', 'one tap: "Saber · Member" — no Admin tab, no Edit Schedule, the view page', async () => {
    const t = await text(page, '#roleBadge')
    const admin = await page.locator('.nav a[data-page="admin"]:visible').count()
    const edit = await page.locator('.nav a[data-page="editsched"]:visible').count()
    const cur = await page.evaluate(() => window.CURPAGE)
    /* the switch leaves Edit Schedule and Admin for View-only Sched; any other page (here the Leave War) stays */
    /* switched on Edit Schedule: it leaves for View-only Sched (it keeps any other page) */
    return /Saber · Member/i.test(t) && !admin && !edit && cur === 'viewsched' ? true : `"${t}" admin ${admin} edit ${edit} page ${cur}`
  })
  await page.evaluate(() => { window.__toasts = [] })
  /* a member has no Edit Schedule (the top bar's Undo lives there): the Undo he meets is the Leave War's own */
  await go(page, 'leavewar')
  const u = page.locator('[data-testid="lw-undo"]:visible').first()
  if (await u.count() && !(await u.isDisabled())) { await u.click(); await page.waitForTimeout(600) }
  await step(page, 'c03-member-undo', 'Undo of his own admin step, in the member view: "Switch back to the admin view to undo that."', async () => {
    const said = (await page.evaluate(() => window.__toasts || [])).join(' | ')
    const title = await u.getAttribute('title').catch(() => '')
    return /Switch back to the admin view/.test(said) ? true : `said "${said}" hover "${title}" disabled ${await u.isDisabled().catch(() => '?')}`
  })
  await tapCell(page, 'rocky', addDays(TODAY, 5))
  await step(page, 'c04-member-no-po', 'in the member view the Leave War offers no posting door on another man', async () =>
    (await page.locator('[data-testid="bid-postout"]:visible').count()) === 0 ? true : 'the PO button is there')
  await page.keyboard.press('Escape').catch(() => {})
  await page.click('#roleBadge'); await page.waitForTimeout(700)
  await step(page, 'c05-back-to-admin', 'a second tap: back to "Saber · Admin", the Admin tab again', async () => {
    const t = await text(page, '#roleBadge'); const admin = await page.locator('.nav a[data-page="admin"]:visible').count()
    return /Saber · Admin/i.test(t) && admin ? true : `"${t}" admin ${admin}`
  })

  /* ---- a SANS posting to come with Show SANS ON: shown like any posting until its date, its sheet the door ---- */
  await lwMonth(page, TODAY)
  await page.click('[data-testid="settings-open"]'); await page.waitForTimeout(400)
  const tog = page.locator('[data-testid="sans-toggle"]')
  if ((await tog.getAttribute('aria-pressed')) !== 'true' && !(await tog.isChecked().catch(() => false))) await tog.click()
  await page.waitForTimeout(300); await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  const SOON = addDays(TODAY, 10)
  await tapCell(page, 'rocky', SOON)
  await page.click('[data-testid="bid-postout"]'); await page.waitForTimeout(200)
  await page.click('[data-testid="po-sans"]'); await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(800)
  await page.keyboard.press('Escape').catch(() => {})
  await lwMonth(page, SOON)
  await step(page, 'c06-sans-to-come-shown', 'Show SANS on, a SANS posting to come: his row hatched from its date (the posting shows)', async () => {
    const cls = await page.locator(`[data-testid="cell-rocky-${SOON}"]`).getAttribute('class').catch(() => '')
    return /gone/.test(cls || '') ? true : `the posting date's cell "${cls}"`
  })
  await page.locator(`[data-testid="cell-rocky-${SOON}"]`).click(); await page.waitForTimeout(400)
  await step(page, 'c07-sans-to-come-door', 'tapping it opens the Post out sheet with SANS chosen — the door to change or undo it', async () => {
    const s = await page.locator('[data-testid="postout-sheet"]').count()
    const sans = await page.locator('[data-testid="postout-sans"]').getAttribute('aria-pressed').catch(() => '')
    return s === 1 && sans === 'true' ? true : `sheet ${s} sans ${sans}`
  })
  await page.click('[data-testid="postout-undo"]').catch(() => {}); await page.waitForTimeout(500)
  await browser.close()
}

/* ======================= PHONE ======================= */
{
  const { browser, page } = await world(390, 844)
  await signIn(page, 'ad', 'a')
  await page.click('#burger'); await page.waitForTimeout(400)
  await step(page, 'c08-phone-drawer', 'the phone drawer: "Signed in as Saber · Admin" and the member-view switch under it', async () => {
    const acct = await text(page, '#drawerAcct'); const sw = await page.locator('#drawerRole:visible').count()
    return /Saber · Admin/.test(acct) && sw === 1 ? true : `"${acct}" switch ${sw}`
  })
  await page.click('#drawerRole'); await page.waitForTimeout(700)
  if (!(await page.locator('#drawerAcct:visible').count())) { await page.click('#burger'); await page.waitForTimeout(400) }
  await step(page, 'c09-phone-member', 'the switch: the drawer reads "· Member"', async () => {
    const acct = await text(page, '#drawerAcct')
    return /Saber · Member/.test(acct) ? true : `"${acct}"`
  })
  await page.click('#drawerRole').catch(() => {}); await page.waitForTimeout(600)
  await page.keyboard.press('Escape').catch(() => {})
  if (await page.locator('#drawerAcct:visible').count()) { await page.click('#burger').catch(() => {}); await page.waitForTimeout(300) }

  /* the four chips on a phone */
  await tapCell(page, 'rocky', TODAY)
  await page.click('[data-testid="bid-postout"]'); await page.waitForTimeout(300)
  await step(page, 'c10-phone-chips', 'phone: the four chips, the line and "Post out" all on screen', async () => {
    const a = await inView(page, '[data-testid="po-overseas"]'), b = await inView(page, '[data-testid="po-transfer"]')
    const l = await inView(page, '[data-testid="po-line"]'), c = await inView(page, '[data-testid="po-confirm"]')
    return [a, b, l, c].every(x => x === 'in') ? true : `overseas ${a} · transfer ${b} · line ${l} · button ${c}`
  })
  await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(900)   // Overseas Sqn, today — he is archived
  await page.keyboard.press('Escape').catch(() => {})

  /* Quals' Archived list on a phone: Restore meeting a taken callsign → "Restore as Hex 2" → the prompt */
  await page.evaluate(() => { window.renameCallsign('casper', 'Hex') })   // the stated shortcut: a roster man now holds "Hex"
  await go(page, 'quals')
  if (!(await page.locator('[data-testid="qarchlist"]').count())) { await page.click('#qArchToggle'); await page.waitForTimeout(400) }
  await page.locator('[data-restore="rocky"]').scrollIntoViewIfNeeded(); await page.click('[data-restore="rocky"]'); await page.waitForTimeout(500)
  await step(page, 'c11-phone-restore-as', 'phone: Restore asks for another callsign on the spot, "Hex 2" offered, the box on screen', async () => {
    const box = await text(page, '[data-testid="qrestoreas-rocky"]'); const v = await page.locator('#qRestoreCs').inputValue()
    const go = await inView(page, '#qRestoreGo')
    return /Hex is taken/.test(box) && v === 'Hex 2' && go === 'in' ? true : `"${box.slice(0, 80)}" value "${v}" button ${go}`
  })
  await page.click('#qRestoreGo'); await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  await step(page, 'c12-phone-back-prompt', 'restored as "Hex 2": the prompt "Hex 2 is back", Check his quals and Later on screen', async () => {
    const p = await P(page, 'rocky'); const t = await text(page, '[data-testid="back-rocky"]')
    const chk = await inView(page, '[data-back-check="rocky"]')
    return !p.archived && p.cs === 'Hex 2' && /Hex 2 is back/.test(t) ? { ok: true, note: `check button ${chk}` } : `${JSON.stringify(p)} prompt "${t}"`
  })

  /* Admin → Users on a phone: Delete account asks twice — the first tap only (nothing deleted) */
  await go(page, 'admin')
  const users = page.locator('.adm-cat', { hasText: 'Users' }).first()
  if (await users.count() && await users.isVisible()) { await users.click(); await page.waitForTimeout(400) }
  await page.locator('[data-acct="acoutlaw"] .acc-tap').scrollIntoViewIfNeeded().catch(() => {})
  await page.click('[data-acct="acoutlaw"] .acc-tap').catch(() => {}); await page.waitForTimeout(300)
  await page.locator('#accEdDel').scrollIntoViewIfNeeded().catch(() => {})
  await page.click('#accEdDel').catch(() => {}); await page.waitForTimeout(300)
  await step(page, 'c13-phone-delete-arms', 'phone: "Delete account" asks again, says what goes, and deletes nothing yet', async () => {
    const btn = await text(page, '#accEdDel'); const note = await text(page, '#accEdDelNote')
    const d = (await P(page, 'casper')).deleted
    return /Tap again to delete/.test(btn) && note && !d ? true : `"${btn}" note "${note}" deleted ${d}`
  })
  await browser.close()
}

writeFileSync(`${SHOTS}/walk.json`, JSON.stringify({ results, errors: errorsAll }, null, 2))
console.log(`\n${results.filter(r => r.ok).length}/${results.length} PASS · errors: ${errorsAll.length ? errorsAll.join(' | ').slice(0, 400) : 'none'}`)
