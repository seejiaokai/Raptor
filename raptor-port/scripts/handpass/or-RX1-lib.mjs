// Walker RX1 (one-rule second re-walk, 12 Oct 26): my helpers. Imports the earlier walks' helpers READ-ONLY; own picture folder.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
export * from './or-B-lib2.mjs'
import { oilPeople as _o } from './or-B-lib2.mjs'
import { WIN as W0, csId as csId0, answerOil, MONTHS as M0 } from './or-B-lib2.mjs'
export { as, bellRead, describeWin, openFromList, declareHoliday } from './or-H-lib.mjs'

export const OUTX = 'docs/img/handpass/2026-10-12-one-rule/RX1'
mkdirSync(OUTX, { recursive: true })
export const shotX = async (p, name, clip) => { await p.screenshot({ path: join(OUTX, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
export const log = (...a) => console.log(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '))
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const undoTitle = p => p.evaluate(() => { const vis = id => { const b = document.getElementById(id); return b && b.offsetParent ? { id, title: b.getAttribute('title'), disabled: b.disabled } : null }; return vis('sbUndo') || vis('undoBtn') })
export const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || '').trim() + ' [op ' + t.style.opacity + ']' : '' })
export const waitQuiet = async p => { for (let i = 0; i < 30; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.style.opacity : '0' }); if (o !== '1') return; await p.waitForTimeout(400) } }
export const csOfP = (p, id) => p.evaluate(id => (window.PEOPLE[id] || {}).cs || id, id)

async function pickDate(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(M0.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
/* fileInput variant: records whether an OIL question / a refusal stood. spec: {type, person, people, ph, from, to, timed, title, rmk, oil, noSave} */
export async function fileX(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(W0).count()) { await p.locator('#inpEditCancel').click(); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(200) }
  await p.locator('#inNew').click(); await p.locator(W0).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId0(p, spec.person))
  if (spec.from) await pickDate(p, spec.from)
  if (spec.to) await pickDate(p, spec.to)
  if (spec.people) {
    await p.locator(`${W0} [data-testid="pp-several"]`).click()
    const want = []
    for (const cs of spec.people) { const pid = await csId0(p, cs); want.push(pid); const b = p.locator(`${W0} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), W0)
    for (const pid of pressed) if (!want.includes(pid)) await p.locator(`${W0} [data-pp="${pid}"]`).click()
  }
  if (spec.ph) { const b = p.locator(`${W0} [data-ph="${spec.ph}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click() }
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  if (spec.noSave) return { had }
  const toastsBefore = await p.evaluate(() => (window.__toasts || []).length)
  await p.locator('#inpEditSave').click()
  await p.waitForTimeout(350)
  let oilSeen = 0
  for (let k = 0; k < 3; k++) {
    if (await p.locator('[data-testid="oilconf"]').count()) { oilSeen++; await answerOil(p, spec.oil || 'no') }
    else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  const stillOpen = await p.locator(W0).count()
  const winText = stillOpen ? (await p.locator(W0).innerText()).replace(/\s+/g, ' ').slice(-400) : ''
  const toasts = await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), toastsBefore)
  await p.locator(W0).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  await p.waitForTimeout(300)
  const made = await p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, to: r.to, s: r.s, e: r.e, people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p), by: (window.PEOPLE[r.by] || {}).cs, oil: r.oil })), had)
  return { made, oilSeen, stillOpen, winText, toasts }
}

/* ---- copied from the earlier walks' helpers (their files import a browser at load, so they are not imported) ---- */
export async function signAndPublish(p, di) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(300)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
  const sels = p.locator(`#schedBoard [data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await p.waitForTimeout(150)
  }
  await p.waitForTimeout(300)
  let btn = p.locator(`#schedBoard [data-beak="${di}"]`).first()
  if (!(await btn.count())) btn = p.locator(`#schedBoard [data-alpub="${di}"]`).first()
  if (!(await btn.count())) return { ok: false, why: 'no publish button', selects: n }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { ok: false, why: 'disabled: ' + label, selects: n }
  await btn.evaluate(b => b.click()); await p.waitForTimeout(800)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await p.waitForTimeout(900) }
  const ver = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return { ok: true, label, version: ver, selects: n }
}
export async function lwOpen(p, mon = 'jul') {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1200)
  const m = p.locator(`[data-testid="month-${mon}"], [data-testid="month-${mon.toUpperCase()}"]`); if (await m.count()) { await m.first().click(); await p.waitForTimeout(900) }
}
export async function lwTracker(p) {
  await p.locator('[data-testid="oil-tracker"]').first().click(); await p.waitForTimeout(1000)
  return p.evaluate(() => {
    const s = document.querySelector('[data-testid="oil-sheet"]') || [...document.querySelectorAll('.sheet')].find(e => e.offsetParent)
    if (!s) return { open: false }
    return { open: true, text: (s.innerText || '').replace(/\s+/g, ' ').slice(0, 4000), entries: [...s.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200)) }
  })
}
export async function lwCloseSheet(p) {
  const x = p.locator('[data-testid="oil-close"]').first()
  if (await x.count() && await x.isVisible()) { await x.click(); await p.waitForTimeout(400); return }
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
}
export const lwCellsOf = (p, ids, dates) => p.evaluate(([ids, dates]) => ids.map(id => (window.PEOPLE[id]?.cs || id) + ': ' + dates.map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return d.slice(5) + '=' + (c ? '"' + c.innerText.trim().replace(/\s+/g, ' ') + '"' : 'none') }).join(' ')).join('\n'), [ids, dates])
export async function winState(p) {
  return p.evaluate(() => {
    const w = document.querySelector('.availwin'); if (!w) return null
    const seats = {}
    for (const s of w.querySelectorAll('.seat.oilpk')) seats[(window.PEOPLE[s.dataset.oilp]?.cs) || s.dataset.oilp] = ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?'
    const tabs = [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim())
    const on = Object.values(seats).filter(v => v === 'on').length
    return { tabs, seats, on, off: Object.entries(seats).filter(([, v]) => v === 'off').map(([k]) => k), inert: Object.entries(seats).filter(([, v]) => v === 'inert').length, total: Object.keys(seats).length, text: w.innerText.replace(/\s+/g, ' ').slice(-300) }
  })
}
export async function closeWin(p) { const x = p.locator('.availwin .win-x'); if (await x.count()) { await x.first().click(); await p.waitForTimeout(300) } }
export async function oilToggle(p, on = true) {
  const pressed = async () => (await p.locator('#sbOil').getAttribute('aria-pressed')) === 'true'
  if ((await pressed()) !== on) { await p.locator('#sbOil').click(); await p.waitForTimeout(700) }
}
