// Chat 162 (24 Nov 26) — the Undo bubble and the Undo / Redo hover texts after a Save on Admin → Users: what they SAY,
// and what the one Undo BRINGS BACK. Facts only: every step presses the app's own controls (mouse at 1536, a real finger
// at 402); the page is only READ. Each case starts from a fresh browser context (a fresh demo store).
// The build is served by the chat's lead on http://localhost:4700/ — never started or stopped here.
// Run from anywhere:  node raptor-port/scripts/handpass/n162/undo-c1.mjs d   (or p)
// Prints `FACT …` lines; pictures to raptor-port/docs/mock/2026-11-24-msq-night-questions/checked/undo-*.png
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
export const PICS = resolve(HERE, '../../../docs/mock/2026-11-24-msq-night-questions/checked')
mkdirSync(PICS, { recursive: true })
const URL_ = 'http://localhost:4700/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

const SIZES = {
  d: { desk: true, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
export const FACTS = []
export function fact(k, v) { const line = `FACT ${k}=${typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v)}`; FACTS.push(line); console.log(line) }
export const log = (...a) => console.log('..', ...a.map(x => typeof x === 'string' ? x : JSON.stringify(x)))
export class Stop extends Error {}
export function fail(msg) { throw new Stop(msg) }

let browser = null
export async function newPage(sz) {
  const S = SIZES[sz]; if (!S) fail(`size must be d or p, got ${sz}`)
  if (!browser) browser = await chromium.launch(launchOptions)
  const ctx = await browser.newContext(S.opts)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('dialog', d => { log('browser dialog', d.message()); d.accept().catch(() => {}) })
  return { ctx, page, sz, desk: S.desk, errs }
}
export async function closeAll() { if (browser) await browser.close().catch(() => {}); browser = null }

/* a press as a person makes it: the mouse at 1536, a finger at 402; the control must be drawn */
export async function press(s, sel) {
  const l = typeof sel === 'string' ? s.page.locator(sel).filter({ visible: true }).first() : sel
  if (!(await l.count())) fail(`cannot press ${sel}: not drawn`)
  await l.scrollIntoViewIfNeeded()
  if (s.desk) await l.click(); else await l.tap()
}

export async function signIn(s, user, pass) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await press(s, '#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
}
export async function logout(s) {
  const { page } = s
  if (await page.locator('#logout').filter({ visible: true }).count()) await press(s, '#logout')
  else { await press(s, '#burger'); await press(s, '#drawerLogout') }
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
}

/* the page by the top bar's tab, else the ☰ menu's line */
async function go(s, pg) {
  const tab = s.page.locator(`#topnav a[data-page="${pg}"]`).filter({ visible: true })
  if (await tab.count()) { await press(s, tab.first()); return }
  const open = await s.page.evaluate(() => document.getElementById('drawer')?.classList.contains('open'))
  if (!open) await press(s, '#burger')
  await s.page.locator(`#drawerNav a[data-page="${pg}"]`).first().waitFor({ state: 'visible', timeout: 5000 })
  await press(s, `#drawerNav a[data-page="${pg}"]`)
}
export async function users(s) {
  const { page } = s
  await go(s, 'admin')
  await page.locator('#page-admin').waitFor({ state: 'visible' })
  if (await page.locator('.adm-back').filter({ visible: true }).count()) await press(s, '.adm-back')
  const c = page.locator('#page-admin button.adm-cat', { has: page.locator('.adm-cat-l', { hasText: /^Users/ }) }).filter({ visible: true })
  await c.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => fail('Admin → Users tile not drawn'))
  await press(s, c.first())
  await page.locator('#page-admin [data-person] .acc-tap').first().waitFor({ state: 'visible', timeout: 8000 })
}
const rowSel = pid => `#page-admin [data-person="${pid}"]:has(.acc-tap)`
export async function openRow(s, pid) {
  const r = s.page.locator(`${rowSel(pid)} .acc-tap`).filter({ visible: true }).first()
  if (!(await r.count())) fail(`row ${pid} not drawn`)
  await press(s, r)
  await s.page.locator('#accEdSave').filter({ visible: true }).first().waitFor({ timeout: 8000 }).catch(() => fail(`row ${pid} did not open`))
}
export async function cancelRow(s) {
  await press(s, '#accEdCancel')
  await s.page.locator('#accEdSave').waitFor({ state: 'detached', timeout: 5000 }).catch(() => fail('the row did not close on Cancel'))
}
export const lineBtn = (unitNum, v) => `[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${v}"]`

/* the words of a row as drawn (text whose element has a width), the open editor's fields when open */
export const rowSeen = (s, pid) => s.page.evaluate(pid => {
  const row = [...document.querySelectorAll(`#page-admin [data-person="${pid}"]`)].find(e => e.querySelector('.acc-tap') && e.getBoundingClientRect().width > 1)
  if (!row) return null
  const words = []
  const w = document.createTreeWalker(row, NodeFilter.SHOW_TEXT); let n
  while ((n = w.nextNode())) {
    const el = n.parentElement, t = n.nodeValue.replace(/\s+/g, ' ').trim()
    if (!t || !el) continue
    if (el.closest('.acc-edit')) continue
    const b = el.getBoundingClientRect(), cs = getComputedStyle(el)
    if (b.width > 1 && b.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none') words.push(t)
  }
  return words.join(' | ')
}, pid)
export const editorSeen = s => s.page.evaluate(() => {
  const role = document.querySelector('#accEdRole'), name = document.querySelector('#accEdName')
  const lines = [...document.querySelectorAll('[data-testid="acc-sq"] [aria-label^="Access to"]')].filter(g => g.getBoundingClientRect().width > 1).map(g => {
    const on = [...g.querySelectorAll('button[data-line]')].find(b => b.getAttribute('aria-pressed') === 'true')
    return `${g.getAttribute('aria-label')}: ${on ? on.textContent.trim() : '(none pressed)'}`
  })
  const sq = document.querySelector('[data-testid="acc-sq"]')
  return {
    role: role ? `${role.value} (${role.selectedOptions[0]?.textContent.trim()})` : null,
    name: name ? name.value : null,
    lines,
    sqWords: sq ? sq.innerText.replace(/\s+/g, ' ').trim() : null,
  }
})
/* the row read twice — closed, then opened and cancelled */
export async function readRow(s, pid, key) {
  await s.page.locator(rowSel(pid)).filter({ visible: true }).first().scrollIntoViewIfNeeded()
  fact(`${key}.row`, await rowSeen(s, pid))
  await openRow(s, pid)
  const e = await editorSeen(s)
  fact(`${key}.role`, e.role); fact(`${key}.signin`, e.name); fact(`${key}.lines`, e.lines.join(' ; '))
  await cancelRow(s)
}

/* the passing note: shown = its inline opacity '1' and its computed opacity 1 (faded in) */
const toastNow = s => s.page.evaluate(() => {
  const t = document.getElementById('toastEl')
  if (!t) return { shown: false, text: null }
  return { shown: t.style.opacity === '1' && +getComputedStyle(t).opacity > 0.99, text: t.textContent.replace(/\s+/g, ' ').trim() }
})
export async function toastGone(s) {
  await s.page.waitForFunction(() => { const t = document.getElementById('toastEl'); return !t || +getComputedStyle(t).opacity === 0 }, null, { timeout: 20000 }).catch(() => fail('the passing note never went'))
}
async function toastStarting(s, prefix) {
  await s.page.waitForFunction(p => { const t = document.getElementById('toastEl'); return !!t && t.style.opacity === '1' && +getComputedStyle(t).opacity > 0.99 && t.textContent.trim().startsWith(p) }, prefix, { timeout: 10000 })
    .catch(async () => fail(`no note starting "${prefix}" — the note reads ${JSON.stringify(await toastNow(s))}`))
  /* the rise (a 200 ms animation) ended, so the picture is of the note in its place */
  await s.page.evaluate(() => Promise.all((document.getElementById('toastEl').getAnimations?.() || []).map(a => a.finished.catch(() => {}))))
}
/* the note's box, its lines (the text's own line boxes) and anything cut */
export const toastGeom = s => s.page.evaluate(() => {
  const t = document.getElementById('toastEl'), b = t.getBoundingClientRect()
  const r = document.createRange(); r.selectNodeContents(t)
  const tops = []
  for (const q of r.getClientRects()) { if (q.width < 1) continue; if (!tops.some(x => Math.abs(x - q.top) < 4)) tops.push(q.top) }
  const cut = []
  for (const e of [t, ...t.querySelectorAll('*')]) { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') cut.push(`${e.tagName} scroll ${e.scrollWidth}>${e.clientWidth}`); if (getComputedStyle(e).textOverflow === 'ellipsis') cut.push(`${e.tagName} ellipsis`) }
  return { box: { left: Math.round(b.left), top: Math.round(b.top), width: Math.round(b.width), height: Math.round(b.height) }, lines: tops.length, insideScreen: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight, cut, screenW: innerWidth }
})

/* a full picture and a crop: the note and the person's row together, about 800 px wide on a desktop, full width on a phone */
async function pics(s, pid, name) {
  const { page } = s
  await page.screenshot({ path: `${PICS}/${name}-full.png` })
  const c = await page.evaluate(([pid, desk]) => {
    const t = document.getElementById('toastEl').getBoundingClientRect()
    const row = [...document.querySelectorAll(`#page-admin [data-person="${pid}"]`)].find(e => e.querySelector('.acc-tap') && e.getBoundingClientRect().width > 1)
    const rb = row ? row.getBoundingClientRect() : t
    let top = Math.max(0, Math.min(t.top, rb.top) - 16), bottom = Math.min(innerHeight, Math.max(t.bottom, rb.bottom) + 16)
    let x = 0, w = innerWidth
    /* on a desktop: from the row's left to its right (its badge in view), the note inside it */
    if (desk) { x = Math.max(0, Math.min(t.left, rb.left) - 16); w = Math.min(innerWidth, Math.max(t.right, rb.right) + 16) - x }
    return { x, y: top, width: w, height: bottom - top, rowShown: !!row && rb.bottom > 0 && rb.top < innerHeight }
  }, [pid, s.desk])
  await page.screenshot({ path: `${PICS}/${name}-crop.png`, clip: { x: c.x, y: c.y, width: c.width, height: c.height } })
  return c
}

/* the change in the opened row: role (main | admin | master), the 149 line (none | view | plan), the sign-in name */
export async function change(s, pid, { role, line149, name } = {}) {
  const { page } = s
  await openRow(s, pid)
  if (line149) await press(s, lineBtn('149', line149))
  if (name !== undefined) {
    const box = page.locator('#accEdName').filter({ visible: true }).first()
    await press(s, box); await box.fill(name)
  }
  if (role) {
    const box = page.locator('#accEdRole').filter({ visible: true }).first()
    if (await box.isDisabled()) fail(`the Role box is greyed for ${pid}`)
    await box.selectOption(role)
  }
}
/* Save pressed; a question answered OK; the note it leaves read. Returns the note's words. */
export async function save(s, key) {
  const { page } = s
  await toastGone(s)
  await press(s, '#accEdSave')
  await page.waitForFunction(() => {
    const t = document.getElementById('toastEl'), d = document.querySelector('#dlgModal')
    return (!!t && t.style.opacity === '1') || (!!d && d.getBoundingClientRect().width > 0 && getComputedStyle(d).display !== 'none' && !!document.querySelector('#dlgMsg')?.textContent.trim())
  }, null, { timeout: 8000 }).catch(() => fail(`${key}: Save showed nothing`))
  const q = await page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null })
  if (q) { fact(`${key}.question`, q); await press(s, '#dlgOk') ; await page.waitForFunction(() => document.getElementById('toastEl')?.style.opacity === '1', null, { timeout: 8000 }).catch(() => fail(`${key}: nothing after OK`)) }
  const words = (await toastNow(s)).text
  fact(`${key}.saveNote`, words)
  if (words !== 'Saved') fail(`${key}: the Save did not say Saved — it says ${JSON.stringify(words)}`)
  await page.locator('#accEdSave').waitFor({ state: 'detached', timeout: 5000 }).catch(() => fail(`${key}: the row stayed open after Save`))
  return words
}

const btn = (s, id) => s.page.locator(`#${id}`).filter({ visible: true }).first()
export async function hoverText(s, id, key) {
  const b = btn(s, id)
  if (!(await b.count())) fail(`${id} not drawn`)
  if (s.desk) await b.hover()
  fact(`${key}`, await b.getAttribute('title'))
  fact(`${key}.how`, s.desk ? 'hovered by the mouse; the words are its hover title' : 'phone: no hover — the title the button carries, read')
}
/* Undo or Redo pressed; its note pictured at once and read */
export async function undoRedo(s, which, pid, key, picName) {
  await toastGone(s)
  const id = which === 'undo' ? 'undoBtn' : 'redoBtn'
  const b = btn(s, id)
  if (!(await b.count())) fail(`${id} not drawn`)
  if (await b.isDisabled()) fail(`${id} is greyed`)
  /* the person's row brought into view first, so the crop shows whose row it is */
  await s.page.locator(rowSel(pid)).filter({ visible: true }).first().scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await b.click(); else await b.tap()
  await toastStarting(s, which === 'undo' ? 'Undid' : 'Redid')
  const c = picName ? await pics(s, pid, picName) : null
  const t = await toastNow(s)
  fact(`${key}.bubble`, t.text)
  const g = await toastGeom(s)
  fact(`${key}.bubble.lines`, g.lines)
  fact(`${key}.bubble.box`, g.box)
  fact(`${key}.bubble.insideScreen`, g.insideScreen)
  fact(`${key}.bubble.cut`, g.cut.length ? g.cut.join('; ') : 'none')
  if (c) fact(`${key}.pics`, `${picName}-full.png, ${picName}-crop.png (row in crop: ${c.rowShown})`)
  return t.text
}

/* the bell of a person, read as he sees it (desktop) */
export async function bellLines(s) {
  const { page } = s
  const bell = page.locator('#notifyBell, .bellbtn').filter({ visible: true }).first()
  if (!(await bell.count())) fail('no bell drawn')
  await press(s, bell)
  await page.locator('[data-testid="bell-list"]').filter({ visible: true }).first().waitFor({ timeout: 6000 }).catch(() => fail('the bell list did not open'))
  /* each line's drawn pieces, joined with " | " (the name, the day, the words, the time) */
  return page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => {
    const out = [], w = document.createTreeWalker(l, NodeFilter.SHOW_TEXT); let n
    while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); const el = n.parentElement; if (t && el && el.getBoundingClientRect().width > 1) out.push(t) }
    return out.join(' | ')
  }))
}
const diff = (after, before) => { const left = [...before]; return after.filter(x => { const i = left.indexOf(x); if (i >= 0) { left.splice(i, 1); return false } return true }) }

/* ONE CASE: set-up and change by presses as Saber; the Undo / Redo read and pictured; then, on a desktop, a second fresh
   world for the bell (Saber sets up, the person's bell read, Saber saves, the person's bell read again) */
export async function runCase(c, sz) {
  const k = `${c.id}.${sz}`
  const tag = `undo-${c.id}-${sz === 'd' ? 'desk' : 'phone'}`
  let code = 0
  try {
    const s = await newPage(sz)
    await signIn(s, 'ad', 'a')
    await users(s)
    if (c.setup) await c.setup(s)
    await readRow(s, c.pid, `${k}.before`)
    await change(s, c.pid, c.change)
    await save(s, `${k}.save`)
    await readRow(s, c.pid, `${k}.afterSave`)
    await hoverText(s, 'undoBtn', `${k}.undoHover`)
    await undoRedo(s, 'undo', c.pid, `${k}.undo`, tag)
    await readRow(s, c.pid, `${k}.afterUndo`)
    await hoverText(s, 'redoBtn', `${k}.redoHover`)
    await undoRedo(s, 'redo', c.pid, `${k}.redo`, `${tag}-redo`)
    await readRow(s, c.pid, `${k}.afterRedo`)
    if (s.errs.length) fact(`${k}.pageErrors`, s.errs.slice(0, 5))
    await s.ctx.close()
    if (sz === 'd' && c.bell) {
      const b = await newPage('d')
      await signIn(b, 'ad', 'a'); await users(b)
      if (c.setup) await c.setup(b)
      await logout(b); await signIn(b, c.bell.before[0], c.bell.before[1])
      const was = await bellLines(b)
      await logout(b); await signIn(b, 'ad', 'a'); await users(b)
      await change(b, c.pid, c.change); await save(b, `${k}.bellRun.save`)
      await logout(b); await signIn(b, c.bell.after[0], c.bell.after[1])
      const now = await bellLines(b)
      fact(`${k}.bell.newLines`, diff(now, was))
      fact(`${k}.bell.top3`, now.slice(0, 3))
      await b.ctx.close()
    }
  } catch (e) {
    code = 1
    console.error(`FAILED ${k}: ${e instanceof Stop ? e.message : e.stack || e}`)
  } finally { await closeAll() }
  console.log(`--- ${k}: ${FACTS.length} facts${code ? ', FAILED' : ''}`)
  if (code) process.exitCode = code
}
/* a set-up Save as Saber, by presses (the row opened, changed, Save) */
export async function setupSave(s, pid, ch, key) { await change(s, pid, ch); await save(s, key) }
