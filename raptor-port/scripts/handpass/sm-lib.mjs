// Shared helpers for the schedule's marks and words walk (chat 13, 8 Nov 26 — D1784, D1785, D1792 a, d).
// Routes copied from scripts/handpass/pr-sched.mjs (the pictures round's drawings) and oeb-w1-lib.mjs (the frozen build
// served inside the browser, no port held). Every walker imports this file; each passes its own origin and output folder.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
export { chromium, webkit, LAUNCH, serveDist }

const HERE = dirname(fileURLToPath(import.meta.url))
export const PORT_DIR = join(HERE, '..', '..')
// the frozen build of this round — never rebuilt while a walker uses it (bug-check-order §4)
export const DIST = process.env.SM_DIST || 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad/dist-sm1'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const T = id => `[data-testid="${id}"]`

export const SIZES = {
  phone: { browser: webkit, opts: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
  pc: { browser: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 } },
}

export function outDir(who) { const d = join(PORT_DIR, 'docs', 'img', 'handpass', '2026-11-08-sched-marks', who); mkdirSync(d, { recursive: true }); return d }

/* one world: its own browser, context and storage. state = a storageState object or file (the same origin only);
   init = { fn, arg } run before the app loads (used to damage a saved row before the app reads it) */
export async function launch(size, { origin, state = null, init = null } = {}) {
  const s = SIZES[size]
  const browser = await s.browser.launch(size === 'pc' ? LAUNCH : {})
  const ctx = await browser.newContext({ ...s.opts, ...(state ? { storageState: state } : {}) })
  await serveDist(ctx, origin, DIST)
  // the clock starts at Mon 13 Jul 26 09:00 and is left RUNNING (walk-scripts.md §1)
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  if (init) await ctx.addInitScript(init.fn, init.arg)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  return { browser, ctx, page, origin, phone: size === 'phone', size, errs }
}
export async function closeAll(W) { try { await W.ctx.close() } catch {} try { await W.browser.close() } catch {} }

/* sign in: admin (Saber) 'a', or the member 'm' */
export async function signIn(W, who = 'a') {
  const { page, origin } = W
  await page.goto(origin + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us'); await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}
export const press = async (W, sel, opts = {}) => {
  const l = (typeof sel === 'string' ? W.page.locator(sel) : sel).filter({ visible: true }).first()
  if (W.phone) await l.tap(opts); else await l.click(opts)
}
export async function goEdit(W) {
  const { page } = W
  if (await page.evaluate(() => window.CURPAGE === 'editsched')) { await page.evaluate(() => window.go('viewsched')); await sleep(400) }
  await page.evaluate(() => window.go('editsched')); await sleep(1200)
  await page.waitForSelector('#eWeek section.day[data-day="0"]', { state: 'attached', timeout: 8000 })
}
export async function openBoard(W, di) {
  const { page } = W
  if (!(await page.evaluate(() => window.CURPAGE === 'editsched'))) await goEdit(W)
  await page.evaluate(d => window.openScheduler(d), di)
  await page.waitForSelector('#schedBoard'); await sleep(900)
}
export async function closeBoard(W) {
  const { page } = W
  const done = page.locator('#schedBoard #sbDone:visible, #schedBoard [data-sbdone]:visible').first()
  if (await done.count()) { await done.click(); await sleep(600); return }
  await page.keyboard.press('Escape'); await sleep(600)
}
/* publish day di from the board's sign strip (copied from lib.mjs publish) */
export async function publishDay(W, di) {
  const { page } = W
  await openBoard(W, di)
  const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await sleep(150)
  }
  await sleep(400)
  let beak = page.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  if (!await beak.count()) beak = page.locator(`#schedBoard [data-alpub="${di}"]:visible`).first()
  if (!await beak.count()) return { published: false, why: 'no publish button', signSelects: n }
  const label = (await beak.innerText()).trim()
  if (await beak.isDisabled()) return { published: false, why: label, signSelects: n }
  await beak.click(); await sleep(900)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) }
  const ver = await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  return { published: true, label, version: ver, signSelects: n }
}

/* the Inputs page's list, its "+ Input", and the input window (copied from pr-sched.mjs) */
export async function openInputsList(W) {
  const { page } = W
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.evaluate(() => window.go('inputs')); await sleep(900)
  const vis = async sel => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
  if (!(await vis(T('in-new'))) && await vis('#inMemberMode')) { await page.locator('#inMemberMode').first().click(); await sleep(600) }
  if (!(await vis(T('in-new'))) && await vis('#inListBtn')) { await page.locator('#inListBtn').first().click(); await sleep(600) }
  await page.waitForSelector(T('in-new'), { timeout: 5000 })
}
export async function fillNew(W, { who, type, iso, iso2 = null, remarks = null }) {
  const { page } = W
  await openInputsList(W)
  await page.locator(T('in-new')).first().click(); await page.waitForSelector(T('win-inputedit')); await sleep(500)
  await page.locator('#inpEditPerson').selectOption({ label: who })
  await page.locator('#inpEditType').selectOption(type); await sleep(300)
  if (remarks != null) await page.locator('#inpEditRmk').fill(remarks)
  await page.locator(`[data-testid="inpEdCal-day-${iso}"]`).first().click(); await sleep(200)
  await page.locator(`[data-testid="inpEdCal-day-${iso2 || iso}"]`).first().click(); await sleep(200)
}
/* file one input through the window; answers the document and OIL questions; returns the new input (by id difference) */
export async function fileInput(W, o) {
  const { page } = W
  const before = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await fillNew(W, o)
  await page.locator('#inpEditSave').click(); await sleep(1100)
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(T('docconf-nodoc')).first().click()
    else { await page.locator(T(o.oil === 'yes' ? 'oil-yes' : 'oil-no')).first().click(); await sleep(250); await page.locator(T('oilconf-save')).first().click() }
    await sleep(700)
  }
  const after = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const fresh = after.filter(i => !before.includes(i))
  return fresh.length ? await page.evaluate(id => (window.INPUTS || []).find(r => r.iid === id), fresh[0]) : null
}

/* the waiting mark as PAINTED (bug-check-order §10, anti-pattern 21): the element's own computed style */
export const weekUnavMark = (page, di, who) => page.evaluate(([di, who]) => {
  const day = document.querySelector(`#eWeek section.day[data-day="${di}"]`); if (!day) return { err: 'no day' }
  const rows = [...day.querySelectorAll('.sec-unav .pl-row')].filter(r => r.getBoundingClientRect().height > 0 && r.textContent.includes(who))
  if (!rows.length) return { err: 'no Unavailable row for ' + who }
  return rows.map(r => {
    const b = r.querySelector('.nm .ntx'); if (!b) return { err: 'no name' }
    const cs = getComputedStyle(b)
    return { name: b.textContent.trim(), tag: b.tagName, aln: b.dataset.aln || null, alp: b.dataset.alp || null,
      deco: `${cs.textDecorationLine} ${cs.textDecorationStyle} ${cs.textDecorationColor}`, title: b.title || null }
  })
}, [di, who])
export const boardUnavMark = (page, who) => page.evaluate(who => {
  const rows = [...document.querySelectorAll('#schedBoard .sb-panel.unav .sb-arow')].filter(r => r.getBoundingClientRect().height > 0 && r.textContent.includes(who))
  if (!rows.length) return { err: 'no board Unavailable row for ' + who }
  return rows.map(r => {
    const b = r.querySelector('.sbi-ty'); if (!b) return { err: 'no name box' }
    const cs = getComputedStyle(b)
    return { name: b.textContent.trim(), tag: b.tagName, aln: b.dataset.aln || null,
      outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, bg: cs.backgroundColor, color: cs.color }
  })
}, who)
export const dayPending = (page, di) => page.evaluate(di => {
  const d = document.querySelector(`#eWeek section.day[data-day="${di}"] .dpend`); return d ? d.textContent.trim() : null
}, di)
export const toastText = page => page.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = t.getBoundingClientRect(); const s = getComputedStyle(t)
  return { text: t.innerText.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, shown: r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0 }
})
/* make the saved row of one day of the week of 13 Jul unreadable BEFORE the app reads it (Astra's fixture U) */
export function damageInit(key) {
  return { fn: k => { try { if (!sessionStorage.getItem('smdone')) { localStorage.setItem(k, '{"broken'); sessionStorage.setItem('smdone', '1') } } catch (e) {} }, arg: key }
}
export const weekRowKey = (page, di = 2) => page.evaluate(di => { const ks = Object.keys(localStorage).filter(k => new RegExp(`weeks/13-07-2026#${di}$`).test(k)); return ks.length === 1 ? ks[0] : { err: 'found ' + ks.length } }, di)

export async function pic(W, out, name, { sel = null, pad = 12, clip = null } = {}) {
  const f = join(out, name + '.png')
  if (sel) {
    const b = await W.page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().height > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }, sel)
    if (b) { const vw = W.page.viewportSize(); const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad); clip = { x, y, width: Math.min(vw.width - x, b.w + 2 * pad), height: Math.min(vw.height - y, b.h + 2 * pad) } }
  }
  await W.page.screenshot({ path: f, ...(clip ? { clip } : {}) })
  return name + '.png'
}
export const center = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel)
export function saveJson(out, name, obj) { writeFileSync(join(out, name + '.json'), JSON.stringify(obj, null, 1)) }
