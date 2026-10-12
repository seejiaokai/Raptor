// Walker D's shared helpers — the holiday, the one list, the bell (oil-ask-notify walk, share D). Desktop 1440 x 900.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4231/'
export const PICS = 'docs/img/handpass/2026-10-13-oil-ask-notify/D'
export const PARTS = 'docs/handpass/parts'
mkdirSync(PICS, { recursive: true })
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const FRI = '2026-07-17', THU = '2026-07-16', SAT = '2026-07-18'
export const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
]

export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

// ---- the report: rows kept in on-D.json, on-D.md rewritten after every row
export function rec(id, did, said, inputs, urr, verdict, pics) {
  const f = join(PARTS, 'on-D.json')
  let rows = []
  try { rows = JSON.parse(readFileSync(f, 'utf8')) } catch {}
  rows = rows.filter(r => r.id !== id)
  rows.push({ id, did, said, inputs, urr, verdict, pics })
  const key = r => { const m = /^D(\d+)(.*)$/.exec(r.id); return m ? +m[1] * 10 + (m[2] ? 1 : 0) : 9999 }
  rows.sort((a, b) => key(a) - key(b) || a.id.localeCompare(b.id))
  writeFileSync(f, JSON.stringify(rows, null, 1))
  const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
  const c = {}; for (const r of rows) c[r.verdict] = (c[r.verdict] || 0) + 1
  const head = `# Walker D — the holiday, the one list and the bell (desktop 1440 x 900, build index-Bv5bvisT.js)\n\nEach world: its own fresh browser context at http://localhost:4231/ (?fresh=1 unless the row reloads), clock set to 22 Jun 2026 09:00 and left running, signed in as Saber (ad / a); Warden given an admin sign-in on Admin → Users where a second scheduler was needed; four inputs on Fri 17 = Range brief (Training, Ranger+Tally), Gate duty (Duty, Harpoon), Safety board (Meeting, Mamba) + the demo's own overseas duty. Pictures in docs/img/handpass/2026-10-13-oil-ask-notify/D/.\n\n`
  const tbl = '| # | what I did (the real gesture) | what the screen said and showed | what window.INPUTS said | Undo / Redo / reload | verdict | picture(s) |\n|---|---|---|---|---|---|---|\n' +
    rows.map(r => `| ${r.id} | ${esc(r.did)} | ${esc(r.said)} | ${esc(r.inputs)} | ${esc(r.urr)} | ${r.verdict} | ${esc((r.pics || []).join(', '))} |`).join('\n')
  writeFileSync(join(PARTS, 'on-D.md'), head + tbl + '\n\nCount: ' + Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', ') + '\n' + (existsSync(join(PARTS, 'on-D-tail.md')) ? '\n' + readFileSync(join(PARTS, 'on-D-tail.md'), 'utf8') : ''))
}

// ---- a world
export async function world(browser, { fresh = true, tag = 'w', login = ['ad', 'a'], clock = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.install({ time: new Date('2026-06-22T09:00:00') })
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERR ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const w = { ctx, page, errors, tag }
  w.press = loc => loc.click()
  w.tid = t => page.locator(`[data-testid="${t}"]`)
  w.say = (k, v) => console.log(`${tag} ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
  w.shot = async (name, clip) => { const f = join(PICS, `${name}.png`); await page.screenshot({ path: f, ...(clip ? { clip } : {}) }); console.log('picture', f); return `${name}.png` }
  w.hush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  w.unhush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  w.toast = async () => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  await page.goto(URL + (fresh ? '?fresh=1' : ''))
  await page.fill('#luser', login[0]); await page.fill('#lpass', login[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  // measure: the box is inside the screen and the thing at its centre is itself
  w.measure = sel => page.evaluate(sel => {
    const el = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').pop()
    if (!el) return null
    const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), inside: r.x >= -0.5 && r.y >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, onTop: hit === el || el.contains(hit) }
  }, sel)
  w.inp = (fn, arg) => page.evaluate(fn, arg)
  w.oilOf = iid => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? JSON.stringify(r.oil || null) : 'GONE' }, iid)
  w.allOil = () => page.evaluate(() => window.INPUTS.filter(r => (r.d && String(r.d).includes('2026-07-1')) || true).map(r => `${r.title || r.type}[${r.iid}]=${JSON.stringify(r.oil || null)}`).filter(s => !/=null$/.test(s) || true).join(' ; '))
  w.state = (ids) => page.evaluate(ids => ids.map(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? `${r.title || r.type}:${JSON.stringify(r.oil || null)}` : `${i}:GONE` }).join(' ; '), ids)

  // ---- the inputs calendar
  w.toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal, #inCalBtn').first().waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press(page.locator('#inCalBtn'))
    await page.locator('#inpCal').waitFor()
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await w.press(page.locator('#icNext'))
    for (; d < 0; d++) await w.press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${FRI}"]`)
  }
  w.openDay = async iso => {
    if (await page.locator('[data-testid="win-inputsday"]').count()) return
    await page.locator(`[data-icday="${iso}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  w.closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await w.press(x); await page.waitForTimeout(250) } }
  w.fileIt = async (iso, spec) => {
    const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
    await w.toMonth(); await w.openDay(iso)
    await w.press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop #inpEditType')
    await page.selectOption('#inpEditPop #inpEditType', spec.type)
    if (spec.toDay) { await w.press(page.locator('#inpEditPop #inpEdCal [data-cal="' + spec.toDay + '"]').first()); await page.waitForTimeout(250) }
    if (spec.people.length > 1) {
      await w.press(page.locator('#inpEditPop [data-testid="pp-several"]'))
      for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await w.press(b) }
      const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await w.press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
    const ad = page.locator('#inpEditPop #inpEditAllday')
    if (spec.from) {
      if (await ad.count() && await ad.isChecked()) await w.press(ad)
      await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
      await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
    } else if (await ad.count() && !(await ad.isChecked())) await w.press(ad)
    if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
    await w.press(page.locator('#inpEditSave'))
    await page.waitForTimeout(450)
    for (let k = 0; k < 4; k++) {
      const sheet = page.locator('[data-testid="oilconf"]')
      if (await sheet.count()) {
        const one = sheet.locator('[data-testid="oil-yes"]'), many = sheet.locator('[data-testid="oil-all"]')
        await w.press((await one.count()) ? one : many)
        await w.press(sheet.locator('[data-testid="oilconf-save"]'))
      } else if (await page.locator('[data-testid="docconf"]').count()) await w.press(page.locator('[data-testid="docconf-nodoc"]'))
      else break
      await page.waitForTimeout(350)
    }
    await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => w.say('STILL OPEN', 'the input window'))
    await page.waitForTimeout(300)
    const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
    await w.closeDay()
    return made[0]
  }
  w.fileFriday = async (specs = ON_FRI) => { const ids = []; for (const s of specs) ids.push(await w.fileIt(FRI, s)); return ids }

  // ---- Warden gets an admin sign-in (Admin -> Users, the row's own controls)
  w.giveWarden = async () => {
    await page.evaluate(() => window.go('admin'))
    const row = page.locator('.acc-row[data-person="nact"]').first()
    await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
    await page.locator('#accGiveName').fill('warden')
    await page.selectOption('#accGiveRole', 'admin')
    await page.locator('#accGive').evaluate(e => e.click())
    await page.waitForTimeout(300)
    return await page.locator('.acc-row[data-person="nact"][data-acct]').count() === 1
  }

  // ---- the Holidays list
  w.openHolidays = async () => {
    await page.evaluate(() => window.go('inputs'))
    await w.press(page.locator('#inGear')); await page.waitForTimeout(400)
    await w.press(w.tid('iset-days')); await page.waitForTimeout(600)
    const tab = w.tid('days-tab-holidays'); if (await tab.count()) { await w.press(tab); await page.waitForTimeout(300) }
  }
  w.closeSettings = async () => { await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250) }
  w.closeCal = async () => { await page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250) }
  // days: array of iso dates (first..last of a run)
  w.makeHoliday = async (name, days) => {
    await w.openHolidays()
    await w.press(w.tid('hol-add')); await page.waitForTimeout(500)
    await w.press(w.tid('hol-kind-ph'))
    await w.tid('hol-name').fill(name)
    for (const d of days) {
      for (let i = 0; i < 24 && !(await w.tid(`holcal-day-${d}`).count()); i++) await w.press(w.tid('holcal-next-month'))
      await w.press(w.tid(`holcal-day-${d}`)); await page.waitForTimeout(200)
    }
    await w.press(w.tid('hol-save')); await page.waitForTimeout(800)
    await w.closeSettings()
  }

  // ---- the bell
  w.bellSel = async () => ((await page.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell')
  w.bell = async () => page.locator(await w.bellSel())
  w.bellLit = async () => page.evaluate(sel => { const b = document.querySelector(sel); return b ? b.classList.contains('on') : null }, await w.bellSel())
  w.openBell = async () => { if (!(await page.locator('[data-testid="bell-list"]').count())) { await w.press(await w.bell()); await page.waitForTimeout(400) } return page.locator('[data-testid="bell-list"]') }
  w.closeBell = async () => { if (await page.locator('[data-testid="bell-list"]').count()) { await w.press(await w.bell()); await page.waitForTimeout(250) } }
  w.bellLines = async () => {
    const bl = await w.openBell()
    const lines = await bl.locator('.bl-line').evaluateAll(es => es.map(e => ({ unread: e.classList.contains('unread'), text: e.innerText.replace(/\s+/g, ' ').trim() })))
    return lines
  }
  w.me = async id => { await page.evaluate(i => window.raptorMe(i), id); await page.waitForTimeout(400) }
  w.undoInfo = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); const r = document.querySelector('#redoBtn'); return { undo: b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : 'none', redo: r ? `${r.disabled ? 'off' : 'on'}|${r.title}` : 'none' } })
  w.undo = async () => { await w.press(page.locator('#sbUndo:visible, #undoBtn:visible').first()); await page.waitForTimeout(600) }
  w.redo = async () => { await w.press(page.locator('#sbRedo:visible, #redoBtn:visible').first()); await page.waitForTimeout(600) }
  return w
}

export const bye = async (w, extra = []) => { const e = [...w.errors, ...extra]; await w.ctx.close(); return e }
