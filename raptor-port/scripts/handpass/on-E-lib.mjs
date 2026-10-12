// Walker E's shared helpers — copied from the worked example oilnotify-look.mjs (Warden's admin sign-in, fileIt, the
// bell, the one list), plus the Leave War's Event row. Desktop 1440 x 900 only. Nothing here writes outside walker E's
// own files.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4231/'
export const OUT = 'docs/img/handpass/2026-10-13-oil-ask-notify/E'
export const JSONF = 'docs/handpass/parts/on-E.json'
export const LOGF = 'docs/handpass/parts/on-E-log.txt'
mkdirSync(OUT, { recursive: true })
export const FRI = '2026-07-17', SAT = '2026-07-18', THU = '2026-07-16', TUE = '2026-07-14'
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
]

export function addRow(r) {
  let all = []
  try { all = JSON.parse(readFileSync(JSONF, 'utf8')) } catch {}
  all = all.filter(x => x.id !== r.id)
  all.push(r)
  writeFileSync(JSONF, JSON.stringify(all, null, 1))
}

export async function launch() { return chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) }

export async function session(browser, tag, body, { login = ['ad', 'a'] } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-06-22T09:00:00') })
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const press = loc => loc.click()
  const say = (k, v) => { const s = `${tag} ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`; console.log(s); appendFileSync(LOGF, s + '\n') }
  const shot = async (name, clip) => { const f = join(OUT, `${tag}-${name}.png`); await page.screenshot({ path: f, ...(clip ? { clip } : {}) }); say('picture', f); return f }
  const tid = t => page.locator(`[data-testid="${t}"]`)
  const toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal, #inCalBtn').first().waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    await page.locator('#inpCal').waitFor()
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${SAT}"]`)
  }
  const openDay = async iso => {
    if (await page.locator('[data-testid="win-inputsday"]').count()) return
    await page.locator(`[data-icday="${iso}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  const closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await page.waitForTimeout(250) } }
  // fileIt answers its own OIL question YES (as the worked example) unless spec.no
  let lastAsked = null
  const fileIt = async (iso, spec) => {
    lastAsked = null
    const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
    await toMonth(); await openDay(iso)
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop #inpEditType')
    await page.selectOption('#inpEditPop #inpEditType', spec.type)
    if (spec.people.length > 1) {
      await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
      for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await press(b) }
      const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
    const ad = page.locator('#inpEditPop #inpEditAllday')
    if (spec.from) {
      if (await ad.count() && await ad.isChecked()) await press(ad)
      await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
      await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
    } else if (await ad.count() && !(await ad.isChecked())) await press(ad)
    if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
    await press(page.locator('#inpEditSave'))
    await page.waitForTimeout(450)
    for (let k = 0; k < 4; k++) {
      const sheet = page.locator('[data-testid="oilconf"]')
      if (await sheet.count()) {
        lastAsked = (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 160)
        if (spec.shotAsk) await shot(spec.shotAsk)
        const pick = spec.no ? 'oil-no' : 'oil-yes'
        const one = sheet.locator(`[data-testid="${pick}"]`), many = sheet.locator('[data-testid="oil-all"]')
        await press((await one.count()) ? one : many)
        await press(sheet.locator('[data-testid="oilconf-save"]'))
      } else if (await page.locator('[data-testid="docconf"]').count()) await press(page.locator('[data-testid="docconf-nodoc"]'))
      else break
      await page.waitForTimeout(350)
    }
    await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => say('STILL OPEN', 'the input window'))
    await page.waitForTimeout(300)
    const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
    await closeDay()
    return made[0]
  }
  const giveWarden = async () => {
    await page.evaluate(() => window.go('admin'))
    const row = page.locator('.acc-row[data-person="nact"]').first()
    await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
    await page.locator('#accGiveName').fill('warden')
    await page.selectOption('#accGiveRole', 'admin')
    await page.locator('#accGive').evaluate(e => e.click())
    await page.waitForTimeout(300)
    return await page.locator('.acc-row[data-person="nact"][data-acct]').count() === 1
  }
  // the Holidays list: + Add a public holiday on one day
  const addHoliday = async (iso, name, kind = 'ph') => {
    await page.evaluate(() => window.go('inputs'))
    await press(page.locator('#inGear')); await page.waitForTimeout(400)
    await press(tid('iset-days')); await page.waitForTimeout(600)
    const tab = tid('days-tab-holidays'); if (await tab.count()) { await press(tab); await page.waitForTimeout(300) }
    await press(tid('hol-add')); await page.waitForTimeout(500)
    await press(tid(`hol-kind-${kind}`))
    await tid('hol-name').fill(name)
    for (let i = 0; i < 24 && !(await tid(`holcal-day-${iso}`).count()); i++) await press(tid('holcal-next-month'))
    await press(tid(`holcal-day-${iso}`)); await page.waitForTimeout(200)
    await press(tid('hol-save')); await page.waitForTimeout(800)
    await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
    await page.waitForTimeout(250)
  }
  const measure = async sel => page.evaluate(sel => {
    const el = document.querySelector(sel); if (!el) return null
    const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, onTop: hit === el || el.contains(hit) }
  }, sel)
  const bell = async () => ({
    lit: await page.locator('.bellbtn.on:visible').count(),
    lines: await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(e => ({ unread: e.classList.contains('unread'), t: e.innerText.replace(/\s+/g, ' ').trim() }))),
  })
  const openBell = async () => { if (!(await tid('bell-list').count())) { await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(400) } }
  const closeBell = async () => { if (await tid('bell-list').count()) { await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(300) } }
  const inputsOf = ids => page.evaluate(ids => ids.map(i => { const r = window.INPUTS.find(x => x.iid === i) || {}; return { iid: i, who: r.who || r.people, oil: r.oil || null } }), ids)

  await page.goto(URL + (login ? '?fresh=1' : ''))
  if (login) {
    await page.fill('#luser', login[0]); await page.fill('#lpass', login[1])
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  }
  const api = { asked: () => lastAsked, page, ctx, press, say, shot, tid, toMonth, openDay, closeDay, fileIt, giveWarden, addHoliday, measure, bell, openBell, closeBell, inputsOf, errors, tag }
  try { await body(api) } catch (e) { say('SCRIPT ERROR', String(e).slice(0, 400)); try { await shot('error') } catch {} }
  say('browser errors', errors)
  await ctx.close()
}

// ---- the Leave War ----
export const lw = page => ({
  async go(month = 'JUL') {
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 15000 })
    const bar = page.locator('[data-testid="figures-toggle"]')
    if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') await bar.click()
    await page.locator(`[data-testid="month-${month}"]`).click()
    await page.locator('[data-testid="head-2026-07-01"]').waitFor({ state: 'attached' })
    await page.waitForTimeout(800)
  },
  async openEventSheet(line, iso) {
    const c = page.locator(`[data-testid="event-${line}-${iso}"], [data-testid="event-band-${line}-${iso}"]`).first()
    await c.scrollIntoViewIfNeeded()
    await c.click()
    await page.waitForTimeout(500)
    const pk = page.locator('[data-testid="event-peek-edit"]')
    if (await pk.count()) { await pk.click(); await page.waitForTimeout(500) }
  },
})
