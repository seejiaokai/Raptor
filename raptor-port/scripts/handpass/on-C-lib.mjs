// Walker C — shared helpers for [OIL-ASK-NOTIFY] share C (published days, Unavailable drag, Inputs calendar drag, downstream OIL).
// Copied from oilnotify-look.mjs and gi-w3-lib.mjs (worked examples); drives the REAL built app at :4231. Read-only on the app.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4231/'
export const OUT = 'docs/img/handpass/2026-10-13-oil-ask-notify/C'
mkdirSync(OUT, { recursive: true })
export const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const SAT = '2026-07-18', SAT_DI = 5, FRI = '2026-07-17', FRI_DI = 4, WED = '2026-07-15'
export const REPORT = 'docs/handpass/parts/on-C.md'
export const DATA = 'docs/handpass/parts/on-C.json'

export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* a world: its own context, clock three weeks before the week (it RUNS), signed in. fresh=true opens ?fresh=1 (memory only) */
export async function world(browser, { who = 'ad', pass = 'a', fresh = false, size = DESK } = {}) {
  const ctx = await browser.newContext(size)
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-06-22T09:00:00') })
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  await page.goto(URL + (fresh ? '?fresh=1' : ''))
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(500)
  return { ctx, page, errors }
}
export const tid = (page, t) => page.locator(`[data-testid="${t}"]`)
export const shot = async (page, name, clip) => { await page.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('PIC ' + name + '.png'); return name + '.png' }
export const hush = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
export const unhush = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
export const toast = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : '' })
export const csId = (page, cs) => page.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

/* ---- the report table: one row per mark, appended to the .md as I go; and a json of rows ---- */
export function row(r) {
  const line = `| ${r.n} | ${r.did} | ${r.saw} | ${r.inputs} | ${r.ur} | ${r.verdict} | ${r.pics} |`
  appendFileSync(REPORT, line + '\n')
  let d = []; try { d = JSON.parse(readFileSync(DATA, 'utf8')) } catch {}
  d.push(r); writeFileSync(DATA, JSON.stringify(d, null, 1))
  console.log('ROW', r.n, r.verdict)
}
export const check = (name, ok, got) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' — got ' + JSON.stringify(got)}`); return !!ok }
export const measure = (page, sel) => page.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed')[0]
  if (!el) return null
  const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight,
    inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, onTop: hit === el || el.contains(hit) }
}, sel)

/* ---- navigation ---- */
export async function toMonth(page) {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal, #inCalBtn').first().waitFor()
  if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await page.locator('#inCalBtn').click()
  await page.locator('#inpCal').waitFor()
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 6 - await at()
  for (; d > 0; d--) await page.locator('#icNext').click()
  for (; d < 0; d++) await page.locator('#icPrev').click()
  await page.waitForSelector(`[data-icday="${SAT}"]`)
}
export async function openDay(page, iso) {
  if (await page.locator('[data-testid="win-inputsday"]').count()) return
  await page.locator(`[data-icday="${iso}"]`).focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('[data-testid="win-inputsday"]')
  await page.waitForTimeout(350)
}
export async function closeDay(page) { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await page.waitForTimeout(250) } }

/* file an input through the Inputs calendar's day window, answering its own OIL question (answer: 'yes' | 'no') */
export async function fileIt(page, iso, spec, answer = 'yes') {
  const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
  await toMonth(page); await openDay(page, iso)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('#inpEditPop #inpEditType')
  await page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people.length > 1) {
    await page.locator('#inpEditPop [data-testid="pp-several"]').click()
    for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await b.click() }
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!spec.people.includes(id)) await page.locator(`#inpEditPop [data-pp="${id}"]`).click()
  } else if (await page.locator('#inpEditPop #inpEditPerson').count()) await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  const ad = page.locator('#inpEditPop #inpEditAllday')
  if (spec.from) {
    if (await ad.count() && await ad.isChecked()) await ad.click()
    await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
    await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
  } else if (await ad.count() && !(await ad.isChecked())) await ad.click()
  if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(450)
  for (let k = 0; k < 4; k++) {
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const pick = answer === 'no' ? 'oil-no' : 'oil-yes'
      const one = sheet.locator(`[data-testid="${pick}"]`), many = sheet.locator('[data-testid="oil-all"]')
      await ((await one.count()) ? one : many).click()
      await sheet.locator('[data-testid="oilconf-save"]').click()
    } else if (await page.locator('[data-testid="docconf"]').count()) await page.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await page.waitForTimeout(350)
  }
  await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => console.log('STILL OPEN: the input window'))
  await page.waitForTimeout(300)
  const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
  await closeDay(page)
  return made[0]
}

/* ---- the Scheduler Board / Edit Schedule ---- */
export async function toWeek(page) {
  await page.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await page.waitForTimeout(200)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
}
export async function toBoard(page, di) {
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(300)
  await page.evaluate(d => window.openScheduler(d), di); await page.waitForTimeout(900)
}
export const groundNow = (page, di = SAT_DI) => page.evaluate(di => (window.DAYS[di].ground || []).map(r => {
  const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x || ''
  return `${r.prog || '(blank)'}: ${cs(r.who)}${(r.more || []).map(m => ' + ' + cs(m)).join('')}`
}), di)
export const oilOf = (page, iid) => page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), iid)

/* "the usual Saturday": Range brief (Training 09:00-12:00, Ranger, Yes) and a plain row "Hangar open day" 13:00-15:00 with Tally */
export async function usualSaturday(page) {
  const iid = await fileIt(page, SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' }, 'yes')
  await page.evaluate(() => window.go('editsched'))
  await page.waitForTimeout(500)
  await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await page.waitForTimeout(400)
  await page.locator(`#sbBoard [data-gradd="${SAT_DI}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.waitForTimeout(300)
  const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
  await type(`gr:${SAT_DI}.1.prog`, 'Hangar open day')
  await type(`gr:${SAT_DI}.1.str`, '13:00')
  await type(`gr:${SAT_DI}.1.end`, '15:00')
  await page.evaluate(di => { window.fillSlot(`g:${di}.1.+`, 'nick'); window.afterSchedMutate() }, SAT_DI)   // SETUP: Tally on the plain row
  await page.waitForTimeout(400)
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
  return iid
}
export const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
export const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
export async function frame(page) {
  await page.locator(rowSel(0)).evaluate(e => {
    const sec = e.closest('.sb-sec'); sec.scrollIntoView({ block: 'start' })
    let sc = sec.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement
    if (sc) sc.scrollTop -= 260
  })
  await page.waitForTimeout(250)
}
export const undoLabel = page => page.evaluate(() => { const b = [...document.querySelectorAll('#sbUndo, #undoBtn')].find(e => e.offsetParent !== null) || document.querySelector('#sbUndo') || document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
export async function mouseDrag(page, from, to) {
  const fx = from.x, fy = from.y, tx = to.x, ty = to.y
  await page.mouse.move(fx, fy); await page.mouse.down()
  await page.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await page.mouse.move(tx, ty, { steps: 14 }); await page.waitForTimeout(150)
  await page.mouse.move(tx + 1, ty + 1); await page.waitForTimeout(150)
  await page.mouse.up(); await page.waitForTimeout(600)
}
export const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
export async function dragSel(page, from, to) {
  const fb = await page.locator(from).first().boundingBox(), tb = await page.locator(to).first().boundingBox()
  await mouseDrag(page, centre(fb), centre(tb))
}
export async function clickUndo(page) {
  if (!(await page.locator('#sbUndo:visible, #undoBtn:visible').count())) await toWeek(page)
  const sel = (await page.locator('#sbUndo:visible').count()) ? '#sbUndo' : '#undoBtn'
  await page.locator(`${sel}:visible`).first().click(); await page.waitForTimeout(700)
}
export async function clickRedo(page) {
  if (!(await page.locator('#sbRedo:visible, #redoBtn:visible').count())) await toWeek(page)
  const sel = (await page.locator('#sbRedo:visible').count()) ? '#sbRedo' : '#redoBtn'
  await page.locator(`${sel}:visible`).first().click(); await page.waitForTimeout(700)
}

/* ---- sign + publish a day through the board (gi-w3-lib signAndPublish) ---- */
export async function signAndPublish(page, di) {
  await toBoard(page, di)
  const sels = page.locator(`#schedBoard [data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(300)
  let btn = page.locator(`#schedBoard [data-beak="${di}"]`).first()
  if (!(await btn.count())) btn = page.locator(`#schedBoard [data-alpub="${di}"]`).first()
  if (!(await btn.count())) return { ok: false, why: 'no publish button', selects: n }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { ok: false, why: 'disabled: ' + label, selects: n }
  await btn.evaluate(b => b.click()); await page.waitForTimeout(800)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await page.waitForTimeout(900) }
  const ver = await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(400)
  return { ok: true, label, version: ver, selects: n }
}
/* the day head on the Edit week: the pending text, and the whole head line */
export async function pendingOn(page, di) {
  await toWeek(page)
  return page.evaluate(di => {
    const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
    if (!day) return null
    const s = day.querySelector('.dstat'); const pend = s && s.querySelector('.dpend')
    return { pend: pend ? pend.textContent.replace(/\s+/g, ' ').trim() : 'none', dstat: s ? s.innerText.replace(/\s+/g, ' ').trim() : 'no .dstat',
      head: day.innerText.slice(0, 220).replace(/\s+/g, ' ') }
  }, di)
}
/* the board's four sign-offs and the day's publish button */
export async function signoffsOn(page, di) {
  await toBoard(page, di)
  const r = await page.evaluate(di => {
    const b = document.querySelector('#schedBoard')
    const vals = [...b.querySelectorAll(`[data-signday="${di}"]`)].map(s => s.value)
    const beak = b.querySelector(`[data-beak="${di}"], [data-alpub="${di}"]`)
    const line = [...b.querySelectorAll('*')].filter(e => /signed|sign-?off|not yet/i.test(e.textContent) && e.textContent.length < 120 && !e.querySelector('*')).map(e => e.textContent.trim()).slice(0, 6)
    return { vals, publish: beak ? beak.innerText.trim() : null, chip: (b.querySelector('.verchip') || {}).innerText || '', line }
  }, di)
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(300)
  return r
}
/* the changes window's "To go out" tab (via the day's pending count) */
export async function toGoOut(page, di, keep = false) {
  await toWeek(page)
  const had = await page.locator('.chgwin:not([hidden])').count()
  if (!had) {
    const bb = page.locator('#eWeek .day:not(.peek)').nth(di).locator('.dstat .dpend').first()
    if (!(await bb.count())) return { window: false, lines: [], head: 'no pending button on the day' }
    await bb.scrollIntoViewIfNeeded(); await bb.click(); await page.waitForTimeout(800)
  }
  const title = await page.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? (w.querySelector('.win-ttl') || {}).innerText?.replace(/\s+/g, ' ').trim() : 'NO CHANGES WINDOW' })
  const tab = page.locator('.chgwin .win-tab', { hasText: /To go out/ })
  let tabLabel = 'no To-go-out tab'
  if (await tab.count()) { tabLabel = (await tab.first().innerText()).replace(/\s+/g, ' '); await tab.first().click(); await page.waitForTimeout(450) }
  const head = await page.evaluate(() => { const h = document.querySelector('.chgwin .cw-out .pl-head'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : 'no head' })
  const lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => i.innerText.replace(/\s+/g, ' ').trim()))
  if (!keep) { await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300) }
  return { window: true, title, tabLabel, head, lines }
}
/* View-only Sched: the Ground Programme rows of a day with their pucks */
export async function viewSchedRows(page, di) {
  await page.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await page.waitForTimeout(200)
  await page.locator('a[data-page="viewsched"]').first().click(); await page.waitForTimeout(900)
  return page.evaluate(di => {
    const day = [...document.querySelectorAll('#vWeek .day:not(.peek)')][di]
    if (!day) return 'NO DAY'
    return [...day.querySelectorAll('.sec-grnd .pl-row')].map(r => (r.querySelector('.nm .ntx')?.textContent || '').trim() + ': ' + [...r.querySelectorAll('.ppl .puck .nm')].map(e => e.textContent.trim()).join(' + '))
  }, di)
}
export async function fileOutHoliday(page, iso, name) {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inGear').click(); await page.waitForTimeout(400)
  await tid(page, 'iset-days').click(); await page.waitForTimeout(600)
  const tab = tid(page, 'days-tab-holidays'); if (await tab.count()) { await tab.click(); await page.waitForTimeout(300) }
  await tid(page, 'hol-add').click(); await page.waitForTimeout(500)
  await tid(page, 'hol-kind-ph').click()
  await tid(page, 'hol-name').fill(name)
  for (let i = 0; i < 24 && !(await tid(page, `holcal-day-${iso}`).count()); i++) await tid(page, 'holcal-next-month').click()
  await tid(page, `holcal-day-${iso}`).click(); await page.waitForTimeout(200)
  await tid(page, 'hol-save').click(); await page.waitForTimeout(800)
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250)
}

/* a PLAIN programme row on the Ground Programme through the board's own "+ Item" and typed boxes; SETUP puck via fillSlot */
export async function plainRow(page, di, idx, prog, str, end, whoIds) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForTimeout(500)
  await page.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await page.waitForTimeout(400)
  await page.locator(`#sbBoard [data-gradd="${di}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.waitForTimeout(300)
  const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
  await type(`gr:${di}.${idx}.prog`, prog)
  await type(`gr:${di}.${idx}.str`, str)
  await type(`gr:${di}.${idx}.end`, end)
  for (const w of whoIds) await page.evaluate(([di, idx, w]) => { window.fillSlot(`g:${di}.${idx}.+`, w); window.afterSchedMutate() }, [di, idx, w])
  await page.waitForTimeout(400)
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
}

/* file an input over a RUN of dates by dragging across the month's cells (the app's own gesture), then the same editor fill as fileIt */
export async function fileRun(page, isoA, isoB, spec, answer = 'yes') {
  const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
  await toMonth(page); await closeDay(page)
  const low = async d => { const b = await page.locator(`[data-icday="${d}"]`).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height - 10 } }
  const a = await low(isoA), b = await low(isoB)
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 8 }); await page.mouse.up()
  await page.waitForSelector('#inpEditPop #inpEditType')
  await page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (await page.locator('#inpEditPop #inpEditPerson').count()) await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  const ad = page.locator('#inpEditPop #inpEditAllday')
  if (spec.from) { if (await ad.count() && await ad.isChecked()) await ad.click(); await page.locator('#inpEditPop #inpEditStart').fill(spec.from); await page.locator('#inpEditPop #inpEditEnd').fill(spec.to) }
  else if (await ad.count() && !(await ad.isChecked())) await ad.click()
  if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
  const read = await page.locator('#inpEditPop .rc-read').innerText().catch(() => '')
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(450)
  for (let k = 0; k < 4; k++) {
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const pick = answer === 'no' ? 'oil-no' : 'oil-yes'
      const one = sheet.locator(`[data-testid="${pick}"]`), many = sheet.locator('[data-testid="oil-all"]')
      await ((await one.count()) ? one : many).click(); await sheet.locator('[data-testid="oilconf-save"]').click()
    } else if (await page.locator('[data-testid="docconf"]').count()) await page.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await page.waitForTimeout(350)
  }
  await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => console.log('STILL OPEN: the input window'))
  await page.waitForTimeout(300)
  const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
  return { iid: made[0], read }
}
