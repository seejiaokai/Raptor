// W2 walker's shared helpers — OIL Earn on the board, a tap on a puck that cannot earn (8 Nov 26). Frozen build only.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, readdirSync } from 'node:fs'
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const PORT = join(HERE, '..', '..')
export const DIST = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/dist-a827307a5'
export const SHOTS = join(PORT, 'docs/img/handpass/2026-11-08-oil-earn-board/w2')
export const STATE = join(PORT, 'docs/handpass/state-sat.json')
mkdirSync(SHOTS, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const SAT = 5
export const VERSION = 'oeb-w2 v1'

const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  pc: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 },
}
// world: 'fresh' (origin 4382, no state) or 'sat' (origin 4173, saved Saturday)
export async function newWorld(size, world, who = 'ad') {
  const phone = size === 'phone'
  const browser = await (phone ? webkit : chromium).launch(phone ? {} : { headless: true, ...LAUNCH })
  const origin = world === 'sat' ? 'http://localhost:4173' : 'http://localhost:4382'
  const ctx = await browser.newContext({ ...SIZES[size], ...(world === 'sat' ? { storageState: STATE } : {}) })
  await serveDist(ctx, origin, DIST)
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  const w = { browser, ctx, page, phone, size, origin, errors, world }
  await page.goto(origin + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
  return w
}
export async function openBoard(w, di = SAT) {
  const { page } = w
  await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await sleep(400)
  await page.evaluate(d => window.openScheduler(d), di)
  await page.waitForSelector('#schedBoard'); await sleep(900)
}
export async function closeBoard(w) {
  const x = w.page.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(500) }
}
export async function press(w, sel, nth = 0) {
  const l = w.page.locator(sel).filter({ visible: true }).nth(nth)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.phone) await l.tap(); else await l.click()
}
export async function oilOn(w, on = true) {
  const { page } = w
  const isOn = () => page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon'))
  if ((await isOn()) === on) return
  await press(w, (await page.locator('#sbOil').filter({ visible: true }).count()) ? '#sbOil' : '#schedBoard [data-oilmode]')
  await sleep(700)
  if ((await isOn()) !== on) throw new Error('OIL Earn did not switch ' + on)
}
export const selCount = page => page.evaluate(() => document.querySelectorAll('#schedBoard .puck.sel').length)
export const toast = page => page.evaluate(() => { const t = document.querySelector('#toastEl'); if (!t) return null; const cs = getComputedStyle(t); return { text: t.textContent.trim(), op: cs.opacity, vis: cs.visibility, cls: t.className } })
export const undoState = page => page.evaluate(() => {
  const b = [...document.querySelectorAll('#schedBoard button')].find(x => /^\s*(↶|⟲)?\s*Undo/i.test(x.textContent) || /undo/i.test(x.getAttribute('title') || '') || /undo/i.test(x.id))
  return b ? { id: b.id, disabled: b.disabled || b.getAttribute('aria-disabled'), text: b.textContent.trim().slice(0, 20), title: b.title } : null
})
// the day's fingerprint: the stored day + schedule, to prove a tap changed nothing
export const fingerprint = page => page.evaluate(() => JSON.stringify([window.DAYS && window.DAYS[5], window.SCHED && window.SCHED[5]]).length + ':' + (window.HIST ? (window.HIST.length ?? '') : ''))
export async function shot(w, name, clip) {
  const f = join(SHOTS, `${name}.png`)
  await w.page.screenshot({ path: f, ...(clip ? { clip } : {}) })
  return f
}
// tap a locator, read toast at ~250ms, a phone picture ~100ms after the lift, settled picture 1s after
export async function tapAndRead(w, loc, name, { settle = true, position } = {}) {
  const { page } = w
  const before = { sel: await selCount(page), undo: await undoState(page), fp: await fingerprint(page) }
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await sleep(250)
  await w.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) t.textContent = '' })
  const box = await loc.boundingBox()
  const po = position ? { position } : {}
  if (w.phone) await loc.tap(po); else await loc.click(po)
  await sleep(w.phone ? 100 : 200)
  if (w.phone) await shot(w, `${name}-phone-right-after-tap`)
  await sleep(w.phone ? 150 : 100)
  const t = await toast(page)
  const sel = await selCount(page)
  if (!w.phone) await shot(w, `${name}-pc-note`)
  else await shot(w, `${name}-phone-note`)
  await sleep(settle ? 1000 : 100)
  const after = { sel: await selCount(page), undo: await undoState(page), fp: await fingerprint(page) }
  return { note: t && t.text, noteOp: t && t.op, sel, selAfter: after.sel, undoSame: JSON.stringify(before.undo) === JSON.stringify(after.undo), fpSame: before.fp === after.fp, box }
}
export function close(w) { return w.browser.close() }
export const log = (...a) => console.log(...a)

/* ---- tagging a puck by what it is, then pressing it ---- */
export async function tag(page, spec) {
  return page.evaluate(({ cs, key, cls, nth, exact, root }) => {
    document.querySelectorAll('[data-w2]').forEach(e => e.removeAttribute('data-w2'))
    const list = []
    for (const p of document.querySelectorAll((root || '#sbBoard') + ' .puck')) {
      const r = p.getBoundingClientRect(); if (r.width < 2) continue
      const t = p.textContent.trim()
      if (cs && (exact ? t !== cs : !t.startsWith(cs))) continue
      const wrap = p.closest('.oilpk')
      if (cls && !(wrap && wrap.classList.contains(cls))) continue
      let row = p.parentElement, k = ''
      for (let i = 0; i < 8 && row; i++, row = row.parentElement) { const f = row.querySelector('[data-bfld]'); if (f) { k = f.dataset.bfld; break } }
      if (key && !k.startsWith(key)) continue
      list.push(p)
    }
    const p = list[nth || 0]
    if (!p) return { n: list.length }
    p.setAttribute('data-w2', '1')
    const wrap = p.closest('.oilpk')
    return { n: list.length, wrap: wrap ? wrap.className : '', title: (wrap || p).title, puckTitle: p.title }
  }, spec)
}
// bring an element to a fixed height in its scroller, and say whether it answers a press at its middle
export async function standAt(page, sel, y) {
  return page.evaluate(([sel, y]) => {
    const e = document.querySelector(sel); if (!e) return 'none'
    let s = e.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    s = s || document.scrollingElement
    s.scrollTop += e.getBoundingClientRect().top - y
    const r = e.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return at && (at === e || e.contains(at) || at.contains(e)) ? 'hit' : 'covered by ' + (at ? at.tagName + '.' + at.className : 'nothing')
  }, [sel, y])
}
export async function tapSpec(w, spec, name, y = 420, position) {
  const t = await tag(w.page, spec)
  if (t.puckTitle === undefined) return { missing: true, n: t.n, tag: t }
  await sleep(150)
  const hit = await standAt(w.page, '[data-w2="1"]', y)
  await sleep(250)
  const loc = w.page.locator('[data-w2="1"]')
  const res = await tapAndRead(w, loc, name, { position })
  return { ...res, hit, tag: t }
}
// clear / set a board field. Phone: set the value and send input+change; PC: click, select, type, Tab
export async function setField(w, key, val) {
  const { page } = w
  const box = page.locator(`[data-bfld="${key}"]`).filter({ visible: true }).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  if (w.phone || val === '') {
    if (w.phone) await box.evaluate((e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() }, val)
    else { await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); await page.keyboard.press('Tab') }
  } else { await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(val); await page.keyboard.press('Tab') }
  await sleep(600)
  return box.evaluate(e => e.value).catch(() => '(redrawn)')
}
export const fieldVal = (page, key) => page.evaluate(k => { const e = document.querySelector(`#sbBoard [data-bfld="${k}"]`); return e ? e.value : null }, key)
export const wrapCls = (page) => page.evaluate(() => { const p = document.querySelector('[data-w2="1"]'); const w = p && p.closest('.oilpk'); return w ? w.className : null })
// file an input through the Inputs page
export async function fileInput(w, o) {
  const { page } = w
  await page.evaluate(() => window.go('inputs')); await sleep(800)
  if (await page.locator('#inCalBtn').count()) { await page.locator('#inCalBtn').click().catch(() => {}); await sleep(300) }
  for (let i = 0; i < 4; i++) { const n = await page.evaluate(() => { const x = [...document.querySelectorAll('.floatwin .win-x')].find(e => e.getBoundingClientRect().width > 0); if (x) x.click(); return !!x }); if (!n) break; await sleep(350) }
  const d = page.locator('#inpCal [data-icday="2026-07-18"]').first()
  await d.scrollIntoViewIfNeeded(); await d.click({ position: { x: 8, y: 8 } }); await sleep(300)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"]'); await sleep(250)
  await page.selectOption('#inpEditType', o.kind)
  await page.selectOption('#inpEditPerson', { label: o.person }).catch(async () => {
    const v = await page.locator('#inpEditPerson option').evaluateAll((os, cs) => (os.find(x => x.textContent.trim().startsWith(cs)) || {}).value, o.person)
    await page.selectOption('#inpEditPerson', v)
  })
  if (o.rmk != null) await page.fill('#inpEditRmk', o.rmk)
  if (o.s != null || o.e != null) {
    const ad = page.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
    if (o.s != null) { await page.locator('#inpEditStart').fill(o.s); await page.locator('#inpEditStart').blur() }
    if (o.e != null) { await page.locator('#inpEditEnd').fill(o.e); await page.locator('#inpEditEnd').blur() }
  }
  await page.locator('#inpEditSave').click(); await sleep(500)
  const nd = page.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click(); await sleep(500) }
  let oilShown = false
  if (await page.locator('[data-testid="oilconf"]').count()) {
    oilShown = true
    await page.locator(`[data-testid="oil-${o.oil || 'yes'}"]`).click(); await page.locator('[data-testid="oilconf-save"]').click(); await sleep(400)
  }
  const rec = await page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r && i.date === 'Jul 18'); return x ? { person: x.person, type: x.type || x.kind, s: x.s, e: x.e, oil: x.oil, acc: x.acc } : null }, o.rmk)
  for (let i = 0; i < 4; i++) { const n = await page.evaluate(() => { const x = [...document.querySelectorAll('.floatwin .win-x')].find(e => e.getBoundingClientRect().width > 0); if (x) x.click(); return !!x }); if (!n) break; await sleep(350) }
  return { oilShown, rec }
}
