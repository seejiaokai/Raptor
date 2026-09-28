/* Walker A2 of the change-recording re-test (28 Sep 26) — Phase A: walk the one Undo AS IT IS TODAY on the inputs, the
   Leave War and the roles. Shared helpers on top of the absence re-test's drivers (./ab/w3-lib.mjs → ab-lib → am/w4-lib
   → am-lib → lib). Everything drives the app's OWN controls — the Leave War's cells and sheets, its Undo / Redo, Edit
   Schedule's top-bar pair, the board's pair, the Inputs page form, the role badge (or the phone drawer's switch), the
   Logout — so a fixture is made the way a person makes it (bug-check order §7.7). The localhost probe bridge is used only
   to get to a place and to READ state for the evidence table. A PHONE here is a real touch device (hasTouch, isMobile).
   The build served on 4173; pictures to docs/img/handpass/2026-09-28-change-recording/a2/<width>/. */
import { WIDTH, ROOT } from './cr-a2-env.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { login, BASE } from './ab/w3-lib.mjs'
export * from './ab/w3-lib.mjs'
export { WIDTH, ROOT }
export const PHONE = WIDTH === 'phone'
export const SHOTS = process.env.HP_SHOTS

/** The browser at desktop 1440×900 or a 390×844 touch phone, a FRESH demo world (empty storage — never ?fresh=1),
    signed in as `who` ('a' = Saber, admin · 'm' = Ranger, member). */
export async function openA2(who = 'a') {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext(PHONE
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  await spy(page)
  const cdp = PHONE ? await ctx.newCDPSession(page) : null
  return { browser, ctx, page, errors, cdp }
}

/** Every toast the app raises, kept in the page (a message a second toast replaced in the same instant is kept too).
    A sign-in reloads the page, so this is installed again after every sign-in. */
export async function spy(page) {
  await page.evaluate(() => {
    if (window.__a2t) return
    window.__a2t = []
    new MutationObserver(ms => { for (const m of ms) {
      if (m.target && m.target.id === 'toastEl') for (const n of m.addedNodes || []) if (n.nodeType === 3 && n.data) window.__a2t.push(n.data)
      if (m.type === 'characterData' && m.target.parentElement && m.target.parentElement.id === 'toastEl') window.__a2t.push(m.target.data)
    } }).observe(document.body, { childList: true, subtree: true, characterData: true })
  }).catch(() => {})
}
/** The toasts raised since the last call (and forget them). */
export async function toasts(page) {
  return page.evaluate(() => { const a = window.__a2t || []; window.__a2t = []; return a.filter(Boolean).filter((t, i, x) => i === 0 || t !== x[i - 1]) }).catch(() => [])
}

/** Sign out through the app's own Logout (the top bar's on a desktop, the ☰ drawer's on a phone). */
export async function signOut(page) {
  if (await page.locator('#schedBoard:visible').count()) { const x = page.locator('#sbDone:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(500) } }
  const lo = page.locator('#logout:visible').first()
  if (await lo.count()) await lo.click()
  else {
    await page.locator('#burger:visible').first().click(); await page.waitForTimeout(400)
    await page.locator('#drawerLogout:visible').first().click()
  }
  /* a Tracker "unsaved edits" question never arises here (no chart edited) */
  await page.waitForSelector('#luser', { timeout: 15000 })
  await page.waitForTimeout(400)
}
/** Sign in as 'a' (Saber, admin) or 'm' (Ranger, member) on the sign-in card, then re-install the toast spy. */
export async function signIn(page, who) {
  await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }).catch(() => {})
  await spy(page)
}

/** The admin's member view (D292): the name badge on a desktop, the ☰ drawer's switch on a phone. Returns the badge /
    drawer words after the tap. */
export async function switchView(page) {
  if (await page.locator('#schedBoard:visible').count()) { const x = page.locator('#sbDone:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(500) } }
  const badge = page.locator('#roleBadge:visible').first()
  if (!PHONE && await badge.count()) { await badge.click(); await page.waitForTimeout(700); return (await page.locator('#roleBadge').first().innerText()).trim() }
  await page.locator('#burger:visible').first().click(); await page.waitForTimeout(400)
  const b = page.locator('#drawerRole:visible').first()
  if (!(await b.count())) { await page.keyboard.press('Escape'); return 'NO SWITCH IN THE DRAWER' }
  const was = (await b.innerText()).trim()
  await b.click(); await page.waitForTimeout(700)
  return 'pressed: ' + was
}
/** Which view the signed-in admin is in, as the app says it (badge text; on a phone the drawer's account line). */
export async function viewNow(page) {
  return page.evaluate(() => {
    const b = document.querySelector('#roleBadge'), a = document.querySelector('#drawerAcct')
    return { badge: b ? (b.textContent || '').trim() : null, acct: a ? (a.textContent || '').trim() : null, role: window.raptorRole ? undefined : undefined }
  })
}

/** An Undo / Redo door: 'lw' (the Leave War's Period row), 'top' (Edit Schedule's top bar), 'board' (the board's
    bar). Reads the button's words and state, presses it when it is on, and returns every toast it raised. */
const DOOR = { lw: ['[data-testid="lw-undo"]', '[data-testid="lw-redo"]'], top: ['#undoBtn', '#redoBtn'], board: ['#sbUndo', '#sbRedo'] }
export async function door(page, where, dir = 'undo', { press = true } = {}) {
  const sel = DOOR[where][dir === 'undo' ? 0 : 1]
  const b = page.locator(`${sel}:visible`).first()
  if (!(await b.count())) return { door: where, dir, present: false, pressed: false }
  const title = await b.getAttribute('title'), disabled = await b.isDisabled()
  await toasts(page)
  if (!press || disabled) return { door: where, dir, present: true, title, disabled, pressed: false }
  if (PHONE) await b.tap().catch(() => b.click()); else await b.click()
  await page.waitForTimeout(900)
  const t = await toasts(page)
  const after = await b.isDisabled().catch(() => null)
  const title2 = await b.getAttribute('title').catch(() => null)
  return { door: where, dir, present: true, title, disabled, pressed: true, toasts: t, disabledAfter: after, titleAfter: title2 }
}
/** Both buttons of a door, not pressed. */
export async function doorState(page, where) {
  const u = await door(page, where, 'undo', { press: false }), r = await door(page, where, 'redo', { press: false })
  return { undo: u.present ? (u.disabled ? 'off' : 'on') + ` "${u.title}"` : 'absent', redo: r.present ? (r.disabled ? 'off' : 'on') + ` "${r.title}"` : 'absent' }
}

/** The change history's lines, read from the app's record (the evidence table only): the last `n` with their dates. */
export async function elogTail(page, n = 6) {
  return page.evaluate(k => (window.ELOG && window.ELOG.rows || []).slice(-k).map(r => ({ lbl: r.lbl, date: r.date, end: r.end, who: r.who })), n).catch(() => [])
}

/** The changes window on Edit Schedule's clock (admin): opened through #histBtn, "All changes", a day of the loaded week
    (or the week), its lines as shown. Leaves it open when `keep`. On a phone a tap on a line shrinks it to its bar. */
export async function changesWindow(page, { day = 'Week', keep = false } = {}) {
  await closeBoardIfOpen(page)
  const { go } = await import('./ab/w3-lib.mjs')
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await go(page, 'editsched')
  if (!(await page.locator('.chgwin:not([hidden])').count())) { await page.locator('#histBtn:visible').first().click(); await page.waitForTimeout(500) }
  if (await page.locator('.chgwin.bar').count()) { await page.locator('.chgwin.bar .cw-barbtn').click(); await page.waitForTimeout(300) }
  await page.locator('.chgwin .win-tab', { hasText: 'All changes' }).first().click().catch(() => {})
  await page.waitForTimeout(200)
  await page.locator('.chgwin .cw-day', { hasText: new RegExp('^' + day + '$') }).first().click().catch(() => {})
  await page.waitForTimeout(300)
  const r = await page.evaluate(() => {
    const w = document.querySelector('.chgwin')
    if (!w) return { open: false }
    return { open: true, title: (w.querySelector('.win-ttl') || {}).textContent || '', day: (w.querySelector('.cw-day.on') || {}).textContent || '',
      lines: [...w.querySelectorAll('.cw-l')].map(l => (l.textContent || '').replace(/\s+/g, ' ').trim()),
      groups: [...w.querySelectorAll('.cw-gh .cw-ghname, .cw-one .cw-what')].map(g => (g.textContent || '').replace(/\s+/g, ' ').trim()),
      none: ((w.querySelector('.cw-none') || {}).textContent || '').trim() }
  })
  return r
}
export async function closeChanges(page) {
  if (await page.locator('.chgwin:not([hidden]) .win-x').count()) { await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(250) }
}
export async function closeBoardIfOpen(page) {
  if (await page.locator('#schedBoard:visible').count()) { const x = page.locator('#sbDone:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(500) } else { await page.keyboard.press('Escape'); await page.waitForTimeout(400) } }
}
/** Load the week holding `ddmmyyyy` (the bridge — getting to a place, not a gesture under test). */
export async function toWeek(page, ddmmyyyy) {
  await page.evaluate(d => window.loadWeek(d), ddmmyyyy); await page.waitForTimeout(700)
}

/** The step / picture / results book: every step ASSERTS the right behaviour (PASS = the app did what it should). */
export function book(tag) {
  const rows = []
  let n = 0
  return {
    rows,
    async shot(page, name) { const f = `${tag}-${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: `${SHOTS}/${f}` }).catch(() => {}); return f },
    ck(id, what, ok, observed, pics = '') { rows.push({ id, what, ok: !!ok, observed: typeof observed === 'string' ? observed : JSON.stringify(observed), pics })
      console.log(`${ok ? 'PASS' : 'FAIL'} [${tag}] ${id} ${what} — ${(typeof observed === 'string' ? observed : JSON.stringify(observed)).slice(0, 900)}${pics ? ' · ' + pics : ''}`); return ok },
    note(id, observed) { rows.push({ id, what: 'NOTE', ok: null, observed: typeof observed === 'string' ? observed : JSON.stringify(observed), pics: '' }); console.log(`NOTE [${tag}] ${id} — ${(typeof observed === 'string' ? observed : JSON.stringify(observed)).slice(0, 900)}`) },
    save(errors) {
      const md = [`# Walker A2 — ${tag} (${WIDTH})`, '', '| # | Check | Result | Observed | Picture(s) |', '|---|---|---|---|---|',
        ...rows.map(r => `| ${r.id} | ${r.what.replace(/\|/g, '/')} | ${r.ok === null ? 'note' : r.ok ? 'PASS' : '**FAIL**'} | ${r.observed.replace(/\|/g, '/').slice(0, 700)} | ${r.pics} |`),
        '', `Console / page errors: ${errors && errors.length ? errors.map(e => e.slice(0, 200)).join(' · ') : 'none'}`]
      writeFileSync(`${SHOTS}/${tag}-results.md`, md.join('\n') + '\n')
    },
  }
}
