// Walker C's own helpers (night of 24 Nov 26): reads of the words on screen, and a person's row edited by its own
// controls. Everything changes state only by pressing the app's controls.
import { press, note, admCat, openRow, ask, lineBtn, as, signIn } from './jlib.mjs'
export { lineBtn }

export const clean = t => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
export const toast = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (!t) return null; const b = t.getBoundingClientRect(); const cs = getComputedStyle(t); return b.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' ? t.textContent.replace(/\s+/g, ' ').trim() : `(not showing) ${t.textContent.replace(/\s+/g, ' ').trim()}` })
export const tips = s => s.page.evaluate(() => {
  const f = id => { const b = [...document.querySelectorAll(id)].find(e => e.getBoundingClientRect().width > 0) || document.querySelector(id); return b ? { title: b.getAttribute('title'), aria: b.getAttribute('aria-label'), off: b.disabled || b.getAttribute('aria-disabled') === 'true', shown: b.getBoundingClientRect().width > 0 } : null }
  return { undo: f('#undoBtn'), redo: f('#redoBtn') }
})
export const rowText = (s, pid) => s.page.evaluate(p => { const r = [...document.querySelectorAll(`#page-admin [data-person="${p}"]`)].find(e => e.getBoundingClientRect().height > 0); if (!r) return null; const t = r.querySelector('.acc-tap') || r; return t.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) }, pid)
/* who a row says this person is: opened, read, shut by its Cancel (which changes nothing) */
export async function who(s, pid, nums = ['149']) {
  const { page } = s
  const wasOpen = await page.locator('#accEdSave').count()
  if (!wasOpen) await openRow(s, pid)
  const r = await page.evaluate(() => ({ role: document.querySelector('#accEdRole')?.value, name: document.querySelector('#accEdName')?.value }))
  const lines = {}; for (const n of nums) lines[n] = await lineState(s, n)
  await page.locator('#accEdCancel').first().click(); await page.waitForTimeout(240)
  return { ...r, lines, row: await rowText(s, pid) }
}
/* a reload: this demo build returns to the sign-in card on a reload (its session is not kept), so the person signs in again */
export async function reload(s, user = 'ad', pass = 'a') {
  await s.page.reload(); await s.page.waitForSelector('#luser, #accessWaiting, #accessRequest, #vWeek .day', { state: 'attached', timeout: 30000 }); await s.page.waitForTimeout(700)
  if (await s.page.locator('#luser').count()) await signIn(s, user, pass)
  else await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
}
export const roleOpts = s => s.page.evaluate(() => { const r = document.querySelector('#accEdRole'); return r ? { value: r.value, opts: [...r.options].map(o => `${o.value}=${o.textContent}${o.disabled ? ' (off)' : ''}`) } : null })
export const lineState = (s, num) => s.page.evaluate(n => { const g = document.querySelector(`[data-testid="acc-sq"] [aria-label="Access to ${n}"]`); if (!g) return null; const on = [...g.querySelectorAll('button[data-line]')].find(b => b.getAttribute('aria-pressed') === 'true'); return on ? on.dataset.line : '(none pressed)' }, num)
export const rowOpen = s => s.page.locator('#accEdSave').count().then(n => n > 0)

async function tapOrClick(s, loc) { if (s.desk) await loc.click(); else await loc.tap(); await s.page.waitForTimeout(220) }

/* one edit of an opened row, in the order given: ['role','name','line:149:plan'] with the values */
export async function editRow(s, pid, steps) {
  const { page } = s
  if (!(await rowOpen(s))) await openRow(s, pid)
  for (const st of steps) {
    if (st.role) await page.selectOption('#accEdRole', st.role)
    if (st.name !== undefined) await page.fill('#accEdName', st.name)
    if (st.line) { const b = page.locator(lineBtn(st.line[0], st.line[1])); if (!(await b.count())) { note(`editRow: no ${st.line} on ${pid}`); return false } await tapOrClick(s, b) }
    await page.waitForTimeout(120)
  }
  return true
}
/* Save, answering any question the app raises with its go-ahead; returns the words of the question it answered */
export async function saveRow(s) {
  const { page } = s
  await tapOrClick(s, page.locator('#accEdSave')); await page.waitForTimeout(350)
  let q = null
  const a = await ask(s)
  if (a.msg) { q = a; note(`[${s.sz}] the Save asked: ${JSON.stringify(a)}`); await tapOrClick(s, page.locator('#dlgOk')); await page.waitForTimeout(450) }
  return q
}
export const toUsers = async s => { await admCat(s, 'Users') }
export async function doUndo(s) { const b = s.page.locator('#undoBtn').filter({ visible: true }); if (!(await b.count())) return false; await tapOrClick(s, b.first()); await s.page.waitForTimeout(260); return true }
export async function doRedo(s) { const b = s.page.locator('#redoBtn').filter({ visible: true }); if (!(await b.count())) return false; await tapOrClick(s, b.first()); await s.page.waitForTimeout(260); return true }

export const bell = {
  async open(s) { const b = s.page.locator('#notifyBell').filter({ visible: true }); if (!(await b.count())) return false; if (!(await bell.isOpen(s))) await tapOrClick(s, b.first()); await s.page.waitForTimeout(350); return true },
  isOpen: s => s.page.evaluate(() => { const e = document.querySelector('[data-testid="bell-list"]'); return !!e && e.getBoundingClientRect().height > 0 }),
  lines: s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim())),
  async close(s) { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(280) },
}
export { as, press }
