/* Walker A1 of the change-recording re-test (28 Sep 26) — Phase A: walk the ONE Undo as it is today on the schedule
   and the board. Shared helpers on top of the amendment walk's drivers (./am/w4-lib.mjs → am-lib.mjs → ../lib.mjs):
   sign-offs, Publish day / Publish AL / Unpublish, the plans menu, the day head, the Leave War cells, the Inputs form.
   Everything a scenario TESTS is driven through the app's own controls (the board's and the top bar's Undo / Redo, the
   sign-off selects, the publish buttons, the OIL Earn button, the pucks, the grips); the localhost probe bridge is used
   only to get to a place (open the board on a day, load a week) and to READ state for the evidence table.
   A fresh browser context = a fresh demo world (never ?fresh=1). */
import { W, H, PHONE, TAG } from './cr-a1-env.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { login, SHOTS } from './am/w4-lib.mjs'
export * from './am/w4-lib.mjs'
export { dragTo } from './am/w1-lib.mjs'
export { W, H, PHONE, TAG }

/** A fresh world at the walker's width, signed in as 'a' (Saber, admin) or 'm' (Ranger, member). */
export async function openA1(who = 'a') {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext(PHONE
    ? { viewport: { width: W, height: H }, hasTouch: true, isMobile: true }
    : { viewport: { width: W, height: H } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto((process.env.HP_URL || 'http://localhost:4173') + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  await spy(page)
  return { browser, ctx, page, errors }
}

/** Every toast the app raises, kept in the page (re-installed after a reload / sign-in). */
export async function spy(page) {
  await page.evaluate(() => {
    if (window.__a1t) return
    window.__a1t = []
    new MutationObserver(ms => { for (const m of ms) {
      if (m.target && m.target.id === 'toastEl') for (const n of m.addedNodes || []) if (n.nodeType === 3 && n.data) window.__a1t.push(n.data)
      if (m.type === 'characterData' && m.target.parentElement && m.target.parentElement.id === 'toastEl') window.__a1t.push(m.target.data)
    } }).observe(document.body, { childList: true, subtree: true, characterData: true })
  }).catch(() => {})
}
export async function toasts(page) {
  return page.evaluate(() => { const a = window.__a1t || []; window.__a1t = []; return a.filter(Boolean).filter((t, i, x) => i === 0 || t !== x[i - 1]) }).catch(() => [])
}

/** An Undo / Redo door — 'top' (Edit Schedule's bar) or 'board' (the board's bar). Reads it, presses it when it is on,
    returns the words it showed and every toast the press raised. */
const DOOR = { top: ['#undoBtn', '#redoBtn'], board: ['#sbUndo', '#sbRedo'], lw: ['[data-testid="lw-undo"]', '[data-testid="lw-redo"]'] }
export async function door(page, where, dir = 'undo', { press = true } = {}) {
  const sel = DOOR[where][dir === 'undo' ? 0 : 1]
  const b = page.locator(`${sel}:visible`).first()
  if (!(await b.count())) return { where, dir, present: false, pressed: false, toasts: [] }
  const title = await b.getAttribute('title'), disabled = await b.isDisabled()
  await toasts(page)
  if (!press || disabled) return { where, dir, present: true, title, disabled, pressed: false, toasts: [] }
  if (PHONE) await b.tap().catch(() => b.click()); else await b.click()
  await page.waitForTimeout(900)
  const t = await toasts(page)
  return { where, dir, present: true, title, disabled, pressed: true, toasts: t,
    titleAfter: await b.getAttribute('title').catch(() => null), disabledAfter: await b.isDisabled().catch(() => null) }
}
export async function doorState(page, where) {
  const one = async (sel) => { const b = page.locator(`${sel}:visible`).first(); if (!(await b.count())) return 'absent'
    return `${(await b.isDisabled()) ? 'off' : 'on'} "${await b.getAttribute('title')}"` }
  return { undo: await one(DOOR[where][0]), redo: await one(DOOR[where][1]) }
}

/** Open the board on day di (the bridge — getting to a place), close any open one first. */
export async function boardOn(page, di) {
  const open = await page.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500) }
  await page.evaluate(d => window.openScheduler(d), di)
  await page.waitForSelector('#schedBoard', { timeout: 8000 })
  await page.waitForTimeout(600)
}
export async function boardOff(page) {
  if (!(await page.locator('#schedBoard:visible').count())) return false
  const x = page.locator('#sbClose:visible').first()
  if (await x.count()) { if (PHONE) await x.tap().catch(() => x.click()); else await x.click(); await page.waitForTimeout(600) }
  return true
}

/** The step / picture / results book: each check ASSERTS the right behaviour (PASS = the app did what it should). */
export function book(tag) {
  const rows = []
  let n = 0
  const s = (o) => typeof o === 'string' ? o : JSON.stringify(o)
  return {
    rows,
    async shot(page, name) { const f = `${tag}-${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: `${SHOTS}/${f}` }).catch(() => {}); return `${TAG}/${f}` },
    ck(id, what, ok, observed, pics = '') { rows.push({ id, what, ok: !!ok, observed: s(observed), pics }); console.log(`${ok ? 'PASS' : 'FAIL'} [${tag}/${TAG}] ${id} ${what} — ${s(observed).slice(0, 1000)}${pics ? ' · ' + pics : ''}`); return !!ok },
    note(id, observed, pics = '') { rows.push({ id, what: 'NOTE', ok: null, observed: s(observed), pics }); console.log(`NOTE [${tag}/${TAG}] ${id} — ${s(observed).slice(0, 1000)}${pics ? ' · ' + pics : ''}`) },
    save(errors) {
      const md = [`# Walker A1 — ${tag} (${TAG} ${W}×${H})`, '', '| # | Check | Result | Observed | Picture(s) |', '|---|---|---|---|---|',
        ...rows.map(r => `| ${r.id} | ${r.what.replace(/\|/g, '/')} | ${r.ok === null ? 'note' : r.ok ? 'PASS' : '**FAIL**'} | ${r.observed.replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 900)} | ${r.pics} |`),
        '', `Console / page errors: ${errors && errors.length ? errors.map(e => e.slice(0, 220)).join(' · ') : 'none'}`]
      writeFileSync(`${SHOTS}/${tag}-results.md`, md.join('\n') + '\n')
      const f = rows.filter(r => r.ok === false)
      console.log(`SUMMARY [${tag}/${TAG}] ${rows.filter(r => r.ok).length} pass · ${f.length} fail${f.length ? ' — ' + f.map(r => r.id).join(', ') : ''} · errors ${errors ? errors.length : 0}`)
    },
  }
}

/** The day's head as the surface on screen shows it (the board when open, else the edit week's day). */
export async function dayHead(page, di) {
  return page.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!scope) return null
    const q = s => scope.querySelector(s)
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    return {
      tag: t(q('.verchip')),
      pending: t(q('.dpend')),
      beak: !!q(`[data-beak="${i}"]`), beakOff: !!(q(`[data-beak="${i}"]`) || {}).disabled,
      alpub: t(q(`[data-alpub="${i}"]`)), unpub: t(q(`[data-unpub="${i}"]`)),
      signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ''),
      prev: t(q('.dprev-bar')).slice(0, 80),
      planbtn: t(q('.planselbtn')).slice(0, 40),
    }
  }, di)
}
/** Are all four sign-offs empty (the "— name —" placeholder)? */
export const signsEmpty = (h) => !!h && h.signs.length === 4 && h.signs.every(s => !s || /name/.test(s))
export const signsFull = (h) => !!h && h.signs.length === 4 && h.signs.every(s => s && !/name/.test(s))

/** The changes window on Edit Schedule's clock (admin): "All changes", a day (Mon…Sun) or the Week; its lines. */
export async function changesLines(page, day) {
  await boardOff(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500) }
  if (!(await page.locator('.chgwin:not([hidden])').count())) { await page.locator('#histBtn:visible').first().click(); await page.waitForTimeout(500) }
  if (await page.locator('.chgwin.bar').count()) { await page.locator('.chgwin.bar .cw-barbtn').click(); await page.waitForTimeout(300) }
  await page.locator('.chgwin .win-tab', { hasText: 'All changes' }).first().click().catch(() => {})
  await page.waitForTimeout(200)
  await page.locator('.chgwin .cw-day', { hasText: new RegExp('^' + day + '$') }).first().click().catch(() => {})
  await page.waitForTimeout(350)
  return page.evaluate(() => {
    const w = document.querySelector('.chgwin')
    if (!w) return { open: false }
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    return { open: true, title: t(w.querySelector('.win-ttl') || w), groups: [...w.querySelectorAll('.cw-g')].map(g => ({
      head: t(g.querySelector('.cw-gh .cw-ghname, .cw-what') || g).slice(0, 60), lines: [...g.querySelectorAll('.cw-l')].map(t) })),
      lines: [...w.querySelectorAll('.cw-l')].map(t) }
  })
}
export async function changesClose(page) {
  if (await page.locator('.chgwin:not([hidden]) .win-x').count()) { await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(250) }
}

/** The OIL Earn pucks on the open board: [{ who, item, on }]. */
export async function oilPucks(page) {
  return page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent !== null)
    .map(e => ({ who: e.dataset.oilp, item: e.dataset.oilitem, on: e.classList.contains('on') && !e.classList.contains('off') })))
}
/** Is the OIL Earn mode on (the button pressed)? */
export async function oilOn(page) {
  return page.evaluate(() => { const b = document.querySelector('#sbOil'); return b ? b.getAttribute('aria-pressed') === 'true' : null })
}
/** Tap a puck in OIL mode (by person and item), the way a person taps it. */
export async function oilTap(page, who, item) {
  const p = page.locator(`#schedBoard [data-oilp="${who}"][data-oilitem="${item}"]:visible`).first()
  await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(120)
  if (PHONE) await p.tap().catch(() => p.click()); else await p.click()
  await page.waitForTimeout(600)
}
/** Press the board's OIL Earn button. */
export async function oilButton(page) {
  const b = page.locator('#sbOil:visible').first()
  if (!(await b.count())) {
    /* a phone keeps the day's own buttons in the day bar — try its OIL button */
    const alt = page.locator('#schedBoard button:visible', { hasText: /OIL Earn|OIL/ }).first()
    if (!(await alt.count())) return 'NO OIL BUTTON'
    if (PHONE) await alt.tap().catch(() => alt.click()); else await alt.click()
    await page.waitForTimeout(700); return 'pressed (day bar)'
  }
  if (PHONE) await b.tap().catch(() => b.click()); else await b.click()
  await page.waitForTimeout(700)
  return 'pressed'
}

/** A text box on the open board (data-txt key) typed and committed. */
export async function boardText(page, key, value) {
  const el = page.locator(`#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible`).first()
  if (!(await el.count())) return 'NO BOX ' + key
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await el.click()
  const tag = await el.evaluate(e => e.tagName)
  if (tag === 'INPUT' || tag === 'TEXTAREA') { await el.fill(''); await el.type(String(value), { delay: 8 }) }
  else { await page.keyboard.press('Control+A'); await page.keyboard.type(String(value), { delay: 8 }) }
  await el.evaluate(e => e.blur())
  await page.waitForTimeout(600)
  return 'typed'
}
/** Read a text key's value from the model (evidence only). */
export async function txt(page, key) { return page.evaluate(k => window.txtGet ? window.txtGet(k) : null, key) }
