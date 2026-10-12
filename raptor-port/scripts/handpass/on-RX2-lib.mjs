// Walker RX2's shared helpers — the holiday's one line, the list, the short screens (oil-ask-notify RE-walk, share RX2).
// Copied in shape from oilnotify-look.mjs, on-D-lib.mjs, on-E-lib.mjs and on-B-lib.mjs. Touches only RX2's own files.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4231/'
export const PICS = 'docs/img/handpass/2026-10-13-oil-ask-notify/RX2'
export const PARTS = 'docs/handpass/parts'
mkdirSync(PICS, { recursive: true })
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const FRI = '2026-07-17', THU = '2026-07-16', SAT = '2026-07-18', MONDAY = '2026-07-20', SUN = '2026-07-19'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  p844: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  l390: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
export const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
]

export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

// ---- the report: rows kept in on-RX2.json, on-RX2.md rewritten after every row
export function rec(id, did, said, inputs, urr, verdict, pics) {
  const f = join(PARTS, 'on-RX2.json')
  let rows = []
  try { rows = JSON.parse(readFileSync(f, 'utf8')) } catch {}
  rows = rows.filter(r => r.id !== id)
  rows.push({ id, did, said, inputs, urr, verdict, pics })
  const key = r => { const m = /^RX2-(\d+)(.*)$/.exec(r.id); return m ? +m[1] * 10 + (m[2] ? 1 : 0) : 9999 }
  rows.sort((a, b) => key(a) - key(b) || a.id.localeCompare(b.id))
  writeFileSync(f, JSON.stringify(rows, null, 1))
  const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
  const c = {}; for (const r of rows) c[r.verdict] = (c[r.verdict] || 0) + 1
  const head = `# Walker RX2 — the holiday's one line, the list, the short screens (re-walk; build index-CoBxP-O_.js)\n\nEach world: its own fresh browser context at http://localhost:4231/ (?fresh=1 unless the row reloads), clock set to 22 Jun 2026 09:00 and left running, signed in as Saber (ad / a); Warden given an admin sign-in on Admin → Users. Desktop 1440 x 900 by mouse unless the row says a phone (390 x 844 / 844 x 390 by touch). Pictures in docs/img/handpass/2026-10-13-oil-ask-notify/RX2/.\n\n`
  const tbl = '| # | what I did (the real gesture) | what the screen said and showed | what window.INPUTS said | Undo / Redo / reload | verdict | picture(s) |\n|---|---|---|---|---|---|---|\n' +
    rows.map(r => `| ${r.id} | ${esc(r.did)} | ${esc(r.said)} | ${esc(r.inputs)} | ${esc(r.urr)} | ${r.verdict} | ${esc((r.pics || []).join(', '))} |`).join('\n')
  writeFileSync(join(PARTS, 'on-RX2.md'), head + tbl + '\n\nCount: ' + Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', ') + '\n' + (existsSync(join(PARTS, 'on-RX2-tail.md')) ? '\n' + readFileSync(join(PARTS, 'on-RX2-tail.md'), 'utf8') : ''))
}
export const logf = (tag, k, v) => { const s = `${tag} ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`; console.log(s); try { appendFileSync(join(PARTS, 'on-RX2-log.txt'), s + '\n') } catch {} }

// ---- a world
export async function world(browser, { fresh = true, tag = 'w', login = ['ad', 'a'], size = 'desk' } = {}) {
  const sz = SIZES[size]
  const touch = !!sz.isMobile
  const ctx = await browser.newContext(sz)
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-06-22T09:00:00') })
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERR ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const VW = sz.viewport.width, VH = sz.viewport.height
  const w = { ctx, page, errors, tag, VW, VH, touch, size }
  w.press = loc => (touch ? loc.tap() : loc.click())
  w.tid = t => page.locator(`[data-testid="${t}"]`)
  w.say = (k, v) => logf(tag, k, v)
  w.shot = async (name, clip) => { const f = join(PICS, `${name}.png`); await page.screenshot({ path: f, ...(clip ? { clip } : {}) }); console.log('picture', f); return `${name}.png` }
  w.hush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  w.unhush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  w.toast = async () => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  await page.goto(URL + (fresh ? '?fresh=1' : ''))
  await page.fill('#luser', login[0]); await page.fill('#lpass', login[1])
  await w.press(page.locator('#loginForm button[type=submit]'))
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  w.measure = sel => page.evaluate(([sel, VW, VH]) => {
    const el = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').pop()
    if (!el) return null
    const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom), inside: r.x >= -0.5 && r.y >= -0.5 && r.right <= VW + 0.5 && r.bottom <= VH + 0.5, onTop: hit === el || el.contains(hit) }
  }, [sel, VW, VH])
  w.measureT = t => w.measure(`[data-testid="${t}"]`)
  w.state = ids => page.evaluate(ids => ids.map(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? `${r.title || r.type}:${JSON.stringify(r.oil || null)}` : `${i}:GONE` }).join(' ; '), ids)

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
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.evaluate(() => window.go('admin'))
    const row = page.locator('.acc-row[data-person="nact"]').first()
    await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
    await page.locator('#accGiveName').fill('warden')
    await page.selectOption('#accGiveRole', 'admin')
    await page.locator('#accGive').evaluate(e => e.click())
    await page.waitForTimeout(300)
    const ok = await page.locator('.acc-row[data-person="nact"][data-acct]').count() === 1
    await page.setViewportSize({ width: VW, height: VH })
    return ok
  }

  // ---- the Holidays list
  w.openHolidays = async () => {
    await page.evaluate(() => window.go('inputs'))
    await w.press(page.locator('#inGear')); await page.waitForTimeout(400)
    await w.press(w.tid('iset-days')); await page.waitForTimeout(600)
    const tab = w.tid('days-tab-holidays'); if (await tab.count()) { await w.press(tab); await page.waitForTimeout(300) }
  }
  w.closeSettings = async () => { await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250) }
  w.closeCal = async () => { await page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250); await w.closeSettings() }
  // pick the form's dates: first and last day of a run (taps until the form shows them)
  w.pickDates = async (from, to) => {
    const dates = () => page.evaluate(() => { const e = document.querySelector('[data-testid="hol-dates"]'); return e ? [e.dataset.from, e.dataset.to] : null })
    for (let i = 0; i < 24 && !(await w.tid(`holcal-day-${from}`).count()); i++) await w.press(w.tid('holcal-next-month'))
    await w.press(w.tid(`holcal-day-${from}`)); await page.waitForTimeout(200)
    if (to !== from) { await w.press(w.tid(`holcal-day-${to}`)); await page.waitForTimeout(250) }
    let d = await dates()
    for (let k = 0; k < 3 && JSON.stringify(d) !== JSON.stringify([from, to]); k++) {
      await w.press(w.tid(`holcal-day-${to}`)); await page.waitForTimeout(250); d = await dates()
    }
    return d
  }
  w.makeHoliday = async (name, from, to = from) => {
    await w.openHolidays()
    await w.press(w.tid('hol-add')); await page.waitForTimeout(500)
    await w.press(w.tid('hol-kind-ph'))
    await w.tid('hol-name').fill(name)
    const d = await w.pickDates(from, to)
    await w.press(w.tid('hol-save')); await page.waitForTimeout(800)
    await w.closeSettings()
    return d
  }
  // open an existing holiday (by its first day) on the list and change its dates and/or name; returns the form's dates
  w.editHoliday = async (oldFrom, { name, from, to } = {}) => {
    await w.openHolidays()
    const line = page.locator(`.hol-line[data-from="${oldFrom}"]`)
    if (!(await line.count())) return { err: 'no line' }
    await w.press(line); await page.waitForTimeout(500)
    if (name) await w.tid('hol-name').fill(name)
    let d = null
    if (from) {
      // a fresh range: tap the first day, then the last
      d = await w.pickDates(from, to || from)
    }
    await w.press(w.tid('hol-save')); await page.waitForTimeout(900)
    const err = await w.tid('hol-err').innerText().catch(() => '')
    await w.closeSettings()
    return { d, err }
  }
  w.removeHoliday = async (oldFrom) => {
    await w.openHolidays()
    const line = page.locator(`.hol-line[data-from="${oldFrom}"]`)
    await w.press(line); await page.waitForTimeout(500)
    const btns = await page.locator('button:visible').evaluateAll(es => es.map(e => (e.getAttribute('data-testid') || e.id || '') + ':' + e.innerText.trim()))
    return btns
  }

  // ---- the bell
  w.bellSel = async () => ((await page.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell')
  w.bell = async () => page.locator(await w.bellSel())
  w.bellLit = () => page.locator('.bellbtn.on:visible').count()
  w.openBell = async () => { if (!(await page.locator('[data-testid="bell-list"]').count())) { await w.press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(400) } return page.locator('[data-testid="bell-list"]') }
  w.closeBell = async () => { if (await page.locator('[data-testid="bell-list"]').count()) { await w.press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(250) } }
  w.bellLines = async () => {
    const bl = await w.openBell()
    return await bl.locator('.bl-line').evaluateAll(es => es.map(e => ({ unread: e.classList.contains('unread'), text: e.innerText.replace(/\s+/g, ' ').trim() })))
  }
  // both bells in one go: lit + lines + (optionally) a picture of each. Leaves Saber signed in.
  w.bothBells = async (picName) => {
    const out = {}
    for (const [nm, id] of [['Saber', 'stiff'], ['Warden', 'nact']]) {
      await w.me(id)
      const lit = await w.bellLit(); const lines = await w.bellLines()
      out[nm] = { lit, lines: lines.map(l => (l.unread ? '[unread] ' : '') + l.text) }
      if (picName) { await w.hush(); await w.shot(`${picName}-${nm}`, touch ? { x: 0, y: 0, width: VW, height: Math.min(VH, 340) } : { x: Math.max(0, VW - 760), y: 0, width: Math.min(VW, 760), height: 360 }) }
      await w.closeBell()
    }
    await w.me('stiff')
    return out
  }
  w.me = async id => { await page.evaluate(i => window.raptorMe(i), id); await page.waitForTimeout(400) }
  w.undoInfo = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); const r = document.querySelector('#redoBtn'); return { undo: b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : 'none', redo: r ? `${r.disabled ? 'off' : 'on'}|${r.title}` : 'none' } })
  w.listInfo = async () => {
    const win = w.tid('win-oilday')
    if (!(await win.count())) return null
    return {
      title: (await win.locator('.win-ttl').innerText()).replace(/\s+/g, ' ').trim(),
      lead: await w.tid('odl-lead').innerText().catch(() => '(none)'),
      count: (await w.tid('odl-count').innerText().catch(() => '')).trim(),
      cards: await win.locator('.icard').evaluateAll(es => es.map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 50))),
      left: (await w.tid('odl-left').innerText().catch(() => '')).trim(),
    }
  }
  // touch drag (the long-press drag of the first walk's share B)
  w.touchDrag = async (from, to, { hold = 450, steps = 14, settle = 500, afterHold = null, beforeEnd = null } = {}) => {
    const c = await ctx.newCDPSession(page)
    const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
    await sleep(hold); if (afterHold) await afterHold()
    await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + 2, from.y + 2) }); await sleep(60)
    for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await sleep(25) }
    await sleep(250); if (beforeEnd) await beforeEnd()
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await c.detach().catch(() => {})
    await sleep(settle)
  }
  w.centreOf = async sel => { const b = await page.locator(sel).first().boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null }
  return w
}

export const bye = async (w, extra = []) => { const e = [...w.errors, ...extra]; await w.ctx.close(); return e }
