// WALKER A's shared helpers for the design vet's walk (10 Oct 26). Copied from the host's ivet-walk.mjs; READS state, never writes it.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const OUT = 'docs/img/handpass/2026-10-10-inputs-vet-check/A'
mkdirSync(OUT, { recursive: true })
mkdirSync('docs/handpass/parts', { recursive: true })
export const BASE = process.env.LOOK_URL || 'http://localhost:4231/'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'
export const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }

export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const errs = []
export const rows = []

/* one scenario's row; status PASS / FAIL / NOT RUN */
export function record(n, size, role, status, said, pics = []) {
  rows.push({ n, size, role, status, said: String(said).slice(0, 1400), pics })
  console.log(`#${n} ${size} ${role} ${status} — ${String(said).slice(0, 600)}`)
}
export function saveRows(file) { writeFileSync(file, JSON.stringify(rows, null, 1)) }

export async function open(viewport, who = 'ad', pass = 'a', touch = false, fresh = true) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await signIn(page, who, pass)
  return { ctx, page }
}
export async function signIn(page, who, pass) {
  await page.waitForSelector('#luser', { timeout: 15000 })
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
export const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') }).then(() => name + '.png')
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const count = p => p.evaluate(() => window.INPUTS.length)
export const ids = p => p.evaluate(() => window.INPUTS.map(r => r.iid))
export const newest = (p, had) => p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, person: r.person, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, oil: r.oil || null, grp: r.grp || null, by: r.by, byCs: window.PEOPLE[r.by]?.cs, docs: (r.docIds || []).length })), had)
export const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())
export const clearToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
export async function toList(p, touch, all = true) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(250)
  }
}
export async function plus(p, touch) {
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  await press(touch, p.locator('#inNew'))
  await p.locator(WIN).waitFor()
}
export async function pick(p, iso, touch) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(touch, p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(touch, p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
export async function answerOil(p, touch, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
}
/* the window's own state, read as a person would see it */
export const winState = p => p.evaluate(() => {
  const q = s => document.querySelector(s)
  const win = q('[data-testid="win-inputedit"]')
  return {
    open: !!win, title: q('[data-testid="win-inputedit"] .win-ttl')?.textContent || '', read: q('#inpEditPop .rc-read')?.textContent || '',
    who: q('#inpEditPerson')?.selectedOptions[0]?.textContent || q('#inpEditPersonFixed')?.textContent || '', whoValue: q('#inpEditPerson')?.value || '',
    type: q('#inpEditType')?.value || q('#inpEditTypeFixed')?.textContent || '', title2: q('#inpEditOwnTitle')?.value ?? null, rmk: q('#inpEditRmk')?.value ?? null,
    start: q('#inpEditStart')?.value ?? null, end: q('#inpEditEnd')?.value ?? null, startVis: !!q('#inpEditStart') && q('#inpEditStart').getClientRects().length > 0,
    allday: q('#inpEditAllday') ? q('#inpEditAllday').checked : null, span: q('#inpEditSpan [aria-pressed="true"], #inpEditSpan .on, #inpEditSpan [aria-checked="true"]')?.getAttribute('data-span') || null,
    saveWord: q('#inpEditSave')?.textContent || '', hints: win ? win.querySelectorAll('.inped-hint').length : 0, hintText: [...(win?.querySelectorAll('.inped-hint') || [])].map(h => h.textContent).join(' | '),
    placed: q('[data-testid="inped-placed"]')?.textContent || '', ro: q('[data-testid="inped-ro"]')?.textContent || '', help: !!q('#inTypeHelp'),
    several: !!q('[data-testid="pp-several"]'), why: q('[data-testid="pp-why"]')?.innerText || ''
  }
})
export const rowOf = (p, iid) => p.evaluate(iid => {
  const want = window.INPUTS.find(r => r.iid === iid); if (!want) return null
  const el = [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].find(e => { const r = window.INPUTS.find(x => x.iid === e.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) })
  if (!el) return null
  const all = [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')]
  const b = el.getBoundingClientRect()
  const head = el.previousElementSibling
  return { at: all.indexOf(el), lit: el.classList.contains('innew'), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 200), name: el.querySelector('[data-label="Name"], [data-testid="inl-who"]')?.textContent || '',
    by: el.querySelector('.in-placed, [data-testid="inl-by"]')?.textContent || '', rmk: el.querySelector('[data-testid="inl-rmk"]')?.textContent ?? null, when: el.querySelector('[data-testid="inl-when"]')?.textContent ?? null,
    head: head?.getAttribute('data-testid') === 'inl-day' ? head.textContent : '', onScreen: b.top >= 0 && b.bottom <= innerHeight, h: Math.round(b.height) }
}, iid)
/* open a saved input from the List: its Name button (desktop) or its card (phone) */
export async function openSaved(p, touch, iid) {
  const sel = touch ? `[data-testid="inl-row-${iid}"]` : `#inBody tr[data-iid="${iid}"] [data-testid="in-open"]`
  const loc = p.locator(sel).first()
  await loc.scrollIntoViewIfNeeded()
  await press(touch, loc)
  await p.locator(WIN).waitFor()
}
/* the gear: set "Members may file duties for others" to on/off (admin) */
export async function setMemberFile(p, touch, on) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await press(touch, p.locator('#inGear'))
  const w = p.locator('[data-testid="win-inputsset"]'); await w.waitFor()
  const box = w.locator('[data-testid="iset-memberfile"]')
  if ((await box.isChecked()) !== on) await press(touch, box)
  const now = await box.isChecked()
  await press(touch, w.locator('[data-testid="iset-save"]')); await p.waitForTimeout(400)
  return now
}
export async function finish(file) {
  saveRows(file)
  console.log(errs.length ? 'ERRORS SEEN:\n' + [...new Set(errs)].join('\n') : 'no page errors, no failed requests')
  writeFileSync(file.replace('.json', '-errors.json'), JSON.stringify([...new Set(errs)], null, 1))
  await browser.close()
}
