// p6-lib - presser P6's helpers ([MSQ-PICK-GUARD] separate squadrons, separate views, his D2622; chat 175, 25 Nov 26).
// Re-exports ./lib.mjs (n166's helpers + the picture pair) and adds the set-up presses P6's cases share, each made by the
// app's own controls on a desktop browser, its saved data then copied into fresh browsers (Playwright's storage copy):
//   give(s, pid, num, line)    Admin → Users: a person's row → "Access to <num>" → Plan / View / None → Save
//   tick(s, pid, key)          Quals → Edit → the cell <pid>|<key> pressed → Done
//   fileInput(s, who, type, dayLabel, words)  Inputs → List → + Input: Person, Type, the day, Remarks → Save
//   archive(s, pid)            Admin → Users: his row → Archive (→ OK)
// and the readers: storage before/after (which squadron's record a save wrote), the bell's list and its marks.
import { writeFileSync } from 'node:fs'
import { mk, FACT, signIn, go, wait, vis, hit, barSq, pageOn, roleNow, toastNow, bands, windowsNow, covered, boxOf, tmpDir, scratch } from './lib.mjs'
export * from './lib.mjs'
export const SEC = 'p6'
export const via = s => (s.desk ? 'bar' : 'menu')
export const lineBtn = (num, v) => `[data-testid="acc-sq"] [aria-label="Access to ${num}"] button[data-line="${v}"]`
export async function usersTab(s) {
  if ((await pageOn(s)) !== 'page-admin') { await go(s, 'admin'); await wait(s, 600) }
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
}
export async function give(s, pid, num, line) {
  const { page } = s
  await usersTab(s)
  const r = page.locator(`[data-person="${pid}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = page.locator(lineBtn(num, line)); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await page.locator('#accEdSave').click(); await wait(s, 700)
  return toastNow(s)
}
export async function tick(s, pid, key) {
  await go(s, 'quals'); await wait(s, 600)
  await hit(s, '#qEdit', 700)
  const cell = `.page.on td.qcell[data-q="${pid}|${key}"]`
  const before = await s.page.evaluate(c => document.querySelector(c)?.textContent.trim() ?? null, cell)
  if (before === null) return { cell: `${pid}|${key}`, drawn: false }
  await hit(s, cell, 600)
  const asked = (await windowsNow(s)).map(w => w.words.slice(0, 120))
  if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 500)
  const after = await s.page.evaluate(c => document.querySelector(c)?.textContent.trim() ?? null, cell)
  if (await vis(s, '#qSave').count()) await hit(s, '#qSave', 700)
  return { cell: `${pid}|${key}`, before, after, asked, toast: await toastNow(s) }
}
export async function newInputWindow(s) {
  await go(s, 'inputs'); await wait(s, 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 700)
}
export async function pickDay(s, dayLabel) {
  const { page } = s
  const day = () => page.locator(`.floatwin.inpedwin button[aria-label^="${dayLabel}"]`).first()
  for (let i = 0; i < 14 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day())
}
export async function typeIn(s, sel, words) {
  const r = vis(s, sel).first(); await r.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) { await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(words) }
  else await r.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, words)
  await wait(s, 200)
}
export async function saveInput(s) {
  await hit(s, '#inpEditSave', 800)
  const said = []
  for (let i = 0; i < 3; i++) {
    const w = (await windowsNow(s)).filter(x => !/inpedwin/.test(x.what)).map(x => x.words.slice(0, 140)); if (w.length) said.push(...w)
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  await wait(s, 400)
  return { closed: !(await vis(s, '#inpEditRmk').count()), said: [...new Set(said)], toast: await toastNow(s) }
}
export async function fileInput(s, who, type, dayLabel, words) {
  const { page } = s
  await newInputWindow(s)
  const v = await page.evaluate(w => [...document.querySelector('#inpEditPerson').options].find(x => x.textContent.trim() === w)?.value, who)
  await page.selectOption('#inpEditPerson', v)
  await page.selectOption('#inpEditType', type)
  await pickDay(s, dayLabel); await page.fill('#inpEditRmk', words)
  return saveInput(s)
}
export async function archive(s, pid) {
  await usersTab(s)
  await hit(s, s.page.locator(`[data-person="${pid}"] .acc-tap`).first(), 700)
  await hit(s, '#accEdArchive', 900); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 700)
  return toastNow(s)
}
/* Logout (the top bar's own button; it reloads to the sign-in card), then the next person signs in */
export async function relog(s, user, pass) {
  await hit(s, '#logout', 800)
  if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 600)
  await s.page.waitForSelector('#luser', { timeout: 15000 })
  await signIn(s, user, pass)
}
export async function saveState(s, name) { await wait(s, 600); const f = `${tmpDir(SEC)}/state-${name}.json`; writeFileSync(f, JSON.stringify(await s.ctx.storageState())); return f }
/* the browser's saved data before / after: which records a press wrote; an input's record read for its person, day, unit */
export const snap = s => s.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
export const changed = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k] && !/seen|view|ui|pref|last|sess/i.test(k)).map(k => {
  if (!/^raptor:inputs\//.test(k)) return `${k} ${String(b[k] ?? '(removed)').replace(/\s+/g, ' ').slice(0, 200)}`
  try { const r = JSON.parse(b[k] || 'null') || {}; return `${k} {person:${JSON.stringify(r.person ?? r.people)}, type:${r.type}, date:${r.date}, unit:${r.u ?? r.unit ?? '(none: the home squadron)'}, rmks:${JSON.stringify(r.rmks ?? r.remarks ?? '')}, oil:${JSON.stringify(r.oil ?? null)}}` } catch { return k }
})
export const state = async s => ({ squadron: await barSq(s), page: await pageOn(s), role: (await roleNow(s)).badge, toast: await toastNow(s), bands: await bands(s) })
export const winFacts = async s => (await windowsNow(s)).map(w => `${w.what}${w.inert ? ' [inert]' : ''}: ${w.words.slice(0, 200)} | buttons: ${w.buttons.join(', ')}`)
/* the Inputs List, All dates */
export async function toList(s) {
  if ((await pageOn(s)) !== 'page-inputs') { await go(s, 'inputs'); await wait(s, 600) }
  if (!(await vis(s, '#inListBtn').count())) { const t = vis(s, '.page.on button').filter({ hasText: /^\s*Inputs\s*$/ }).first(); if (await t.count()) await hit(s, t, 700) }
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test((await s.page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '')) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  await wait(s, 500)
}
export const rowsWith = (s, re) => s.page.evaluate(src => { const re = new RegExp(src); return [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].filter(e => e.getBoundingClientRect().height > 0 && re.test(e.innerText)).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)) }, re.source)
export const ringRow = (s, re) => s.page.evaluate(src => { const re = new RegExp(src); const e = [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].find(x => x.getBoundingClientRect().height > 0 && re.test(x.innerText)); if (e) { e.setAttribute('data-n175ring', '1'); return true } return false }, re.source)
export const unring = s => s.page.evaluate(() => document.querySelectorAll('[data-n175ring],[data-n175line]').forEach(e => { e.removeAttribute('data-n175ring'); e.removeAttribute('data-n175line') }))
/* an input found in the List (All dates) by its Remarks, opened, its Remarks changed, Save */
export async function editRemarks(s, re, words) {
  await toList(s)
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasText: re }).first()
  if (!(await row.count())) return { found: false }
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 800)
  await typeIn(s, '#inpEditRmk', words)
  return { found: true, ...(await saveInput(s)) }
}
/* the bell */
export const BELL = '#notifyBell, .bellbtn'
export const LIST = '[data-testid="bell-list"]'
export async function tapBell(s) {
  const c = await covered(s, BELL); if (c !== 'free') return { covered: c }
  const b = await boxOf(s, BELL); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2)
  await wait(s, 900); return { covered: 'free', pressed: true }
}
export const bellLit = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell, .bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : null })
export const bellLines = s => s.page.evaluate(l => [...document.querySelectorAll(l + ' .bl-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.classList.contains('unread') ? '[unread] ' : '[read] ') + (e.querySelector('.bl-sqn') ? `[mark ${e.querySelector('.bl-sqn').textContent.trim()}] ` : '[no mark] ') + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 110)), LIST)
export const bellShow = s => s.page.evaluate(() => { const g = document.querySelector('[data-testid="bell-show"]'); return g ? [...g.querySelectorAll('button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`) : 'no Show row' })
export const bellFoot = s => s.page.evaluate(l => { const e = document.querySelector(l + ' .bl-foot'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, LIST)
export async function closeBell(s) { if (await s.page.locator(LIST).count()) { await s.page.keyboard.press('Escape').catch(() => {}); await wait(s, 300) } if (await s.page.locator(LIST).count()) await tapBell(s) }
export { mk, FACT, signIn, go, wait, vis, hit, scratch, tmpDir }
