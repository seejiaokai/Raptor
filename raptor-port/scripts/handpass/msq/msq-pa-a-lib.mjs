/* msq-pa-a-lib v1 (20 Nov 26) — walker A of the Plan audit: shared helpers. Settings: PA_PHONE=1 for the iPhone; PA_DIST the frozen build;
   PA_TAG a sub-folder suffix. Own world per run, real storage, frozen build served from inside the test browser. */
process.env.MSQ_DIST = process.env.PA_DIST || 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/2edafb56-e544-4e90-a441-340014ce0ec8/scratchpad/dist-a5271a17c'
process.env.MSQ_BUNDLE = 'index-a7kr8dHR.js'
process.env.MSQ_IMGDIR = '2026-11-20-msq-plan-audit'
process.env.MSQ_WHO = 'a'
process.env.MSQ_RUN = (process.env.PA_PHONE === '1' ? 'phone' : 'desktop') + (process.env.PA_TAG ? '-' + process.env.PA_TAG : '')
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
export const X = await import('./msq-lib.mjs')
export const { say, sleep, nrm } = X
export const phone = process.env.PA_PHONE === '1'
export const size = phone ? 'iPhone' : 'desktop'
export const tap = async loc => { if (phone) await loc.tap(); else await loc.click() }
export const REPORT = X.SHOTS.replace(/docs[\\/]img[\\/]handpass.*$/, '') + 'docs/handpass/parts/2026-11-20-msq-plan-audit/rows-a-' + X.RUN + '.txt'
mkdirSync(dirname(REPORT), { recursive: true })
export const rep = (sc, did, exp, saw, verdict, pic = '') => {
  X.row(sc, size, did, exp, saw, verdict, pic)
  try { appendFileSync(REPORT, [sc, size, did, exp, String(saw).replace(/\n/g, ' '), verdict, pic].join(' | ') + '\n') } catch {}
}
/** a world; plan: true writes Hunter's Plan of 149 before anyone signs in */
export async function start(plan) {
  const w = await X.open({ phone, user: null })
  if (plan) {
    await w.page.evaluate(() => {
      localStorage.setItem('raptor:settings/grant:gpa1', JSON.stringify({ id: 'gpa1', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-01-01' }))
    })
    await w.page.reload(); await sleep(1500)
  }
  return w
}
export async function toUsers(w) {
  const p = w.page
  if (phone) {
    const menu = p.locator('button[aria-label*="enu" i]:visible, .hamb:visible, [data-drawer]:visible').first()
    if (await menu.count()) { await tap(menu); await sleep(600) }
  }
  const navAdmin = p.locator('button:visible, a:visible', { hasText: /^\s*Admin\s*$/ }).first()
  await tap(navAdmin); await sleep(1200)
  const usersCat = p.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first()
  if (await usersCat.count() && !(await p.locator('#page-admin button.acc-main').first().isVisible().catch(() => false))) { await tap(usersCat); await sleep(800) }
}
export const find = (w, cs) => w.page.locator('#page-admin input[type=search]:visible, #page-admin input[aria-label*="Find" i]:visible').first()
export async function search(w, cs) {
  const f = find(w); await f.fill(cs); await sleep(600)
}
export const rowBtn = (w, cs) => w.page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first()
/** open a row (search, then press its header) unless already open */
export async function openRow(w, cs) {
  await search(w, cs)
  const r = rowBtn(w, cs)
  if (!(await w.page.locator('#page-admin .acc-edit:visible').count())) { await tap(r); await sleep(900) }
}
export const editWords = w => w.page.evaluate(() => (document.querySelector('#page-admin .acc-edit')?.innerText || '').replace(/\s+/g, ' ').trim())
/** the whole row (header + open edit) as text, and the dot's colour/title */
export const rowRead = (w, cs) => w.page.evaluate(c => {
  const b = [...document.querySelectorAll('#page-admin button.acc-main')].find(x => x.innerText.trim().startsWith(c))
  if (!b) return 'NO ROW'
  const li = b.closest('li, .acc-row, .acc') || b.parentElement
  const dots = [...b.querySelectorAll('*')].filter(e => /dot/i.test(e.className && e.className.baseVal === undefined ? e.className : '')).map(e => e.className + ':' + getComputedStyle(e).backgroundColor + ':' + (e.getAttribute('title') || e.getAttribute('aria-label') || ''))
  return 'HEADER[' + b.innerText.replace(/\s+/g, ' ').trim() + '] DOTS[' + dots.join(';') + '] HTML[' + b.innerHTML.replace(/\s+/g, ' ').slice(0, 500) + ']'
}, cs)
export const btn = (w, re) => w.page.locator('#page-admin .acc-edit button:visible', { hasText: re }).first()
/** words of any message the page shows beyond the row: toast / banner / status lines (visible, short) */
export const notes = w => w.page.evaluate(() => [...document.querySelectorAll('[role=status], [role=alert], .toast, .banner, .acc-msg, .acc-err, .acc-note, .note, #toast, [class*=toast], [class*=err], [class*=msg]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 }).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300)).filter(s => !s.endsWith(': ')))
export const undoBtn = w => w.page.locator('#undoBtn:visible, button[aria-label*="Undo" i]:visible').first()
export const redoBtn = w => w.page.locator('#redoBtn:visible, button[aria-label*="Redo" i]:visible').first()
/** quick picture right after a press (phone: within ~100 ms), then settled */
export async function press(w, loc, name) {
  await tap(loc); await sleep(phone ? 90 : 150)
  await X.pic(w, name + '-press').catch(() => {})
  await sleep(900)
  await X.pic(w, name)
}
/** one reading of a person's row and the page's words: dot colours, role badge, header, toast, open edit panel, any dialog */
export const state = (w, cs) => w.page.evaluate(c => {
  const r = [...document.querySelectorAll('#page-admin .acc-row')].find(x => x.querySelector('.acc-name')?.innerText.trim() === c)
  const t = document.querySelector('#toastEl')
  const dlg = [...document.querySelectorAll('dialog[open], [role=dialog], [role=alertdialog], .modal, .confirm')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300))
  return {
    row: r ? { signin: r.querySelector('[data-testid^="dot-signin"] i')?.className || '(none)', roster: r.querySelector('[data-testid^="dot-roster"] i')?.className || '(none)', badge: (r.querySelector('.od-rc')?.innerText || '').replace(/\s+/g, ' ').trim(), header: (r.querySelector('.acc-main')?.innerText || '').replace(/\s+/g, ' ').trim(), cls: r.className, editWords: (r.querySelector('.acc-edit')?.innerText || '').replace(/\s+/g, ' ').trim() } : 'NO ROW',
    toast: t ? t.innerText.replace(/\s+/g, ' ').trim() : '', dlg,
    sr: document.querySelector('#srSay')?.innerText || ''
  }
}, cs)
export const sj = o => JSON.stringify(o)
export async function done(w) {
  say('errors', JSON.stringify(w.errors.slice(0, 12)))
  try { await w.browser.close() } catch {}
}
