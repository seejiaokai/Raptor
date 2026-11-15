/* rcb2-w3 helpers (copied from w2) v1 (15 Nov 26) — walker W3 (crew rest and OIL). Set RCB2_RUN before importing.
   Builds nothing, serves nothing: the frozen build is served inside the browser by rcb2-lib. */
process.env.RCB2_WHO = 'w3'
const W = await import('./rcb2-lib.mjs')
export const { L, say, check, nrm } = W
export { W }
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const FRI = 4, SAT = 5, SUN = 6, MAN = 'bane'
export const rows = []   // report rows: [scenario, size, did, expected, saw, verdict, pic]
export function row(sc, size, did, exp, saw, verdict, pic = '') {
  rows.push([sc, size, did, exp, saw, verdict, pic])
  say(`ROW ${verdict} | ${sc} | ${size} | ${did} | saw: ${String(saw).slice(0, 300)}`)
}
import { writeFileSync } from 'node:fs'
export function saveRows() { writeFileSync(W.SHOTS + '/rows.json', JSON.stringify(rows, null, 1)) }

export async function open({ phone = false, who = 'a' } = {}) {
  const w = await W.openWorld({ phone, who })
  w.phone = phone
  w.P = phone ? 'p' : 'd'
  return w
}
export async function press(w, sel, { nth = 0, after = null, scope = 'page' } = {}) {
  const page = w.page
  const q = sel.split(',').map(s => (scope === 'board' ? '#schedBoard ' : '') + s.trim() + ':visible').join(', ')
  const el = page.locator(q).nth(nth)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(150)
  const doIt = async () => { if (w.phone) await el.tap({ timeout: 2500 }); else await el.click({ timeout: 2500 }) }
  try { await doIt() } catch {
    const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel)
    if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  if (after) { await sleep(60); await page.screenshot({ path: `${W.SHOTS}/${after}.png` }) }
  await sleep(300)
}
export const bpress = (w, sel, o = {}) => press(w, sel, { ...o, scope: (w.page.__inBoard ? 'board' : 'page') })
export async function typeIn(w, sel, value) {
  const page = w.page
  const inBoard = await page.locator('#schedBoard:visible').count()
  const q = (inBoard ? '#schedBoard ' : '') + sel + ':visible'
  const el = page.locator(q).first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(100)
  if (w.phone) await el.tap(); else await el.click()
  await el.fill('')
  await el.type(String(value), { delay: 8 })
  await page.keyboard.press('Enter').catch(() => {})
  await el.blur().catch(() => {})
  await sleep(350)
}
export async function board(w, di) {
  const page = w.page
  const cur = await page.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (cur === di) return
  if (cur != null) await closeBoard(w)
  await L.go(page, 'editsched')
  await press(w, `#eWeek [data-sbday="${di}"]`)
  await page.waitForSelector('#schedBoard'); await sleep(500)
}
export async function closeBoard(w) {
  const page = w.page
  if (!(await page.locator('#schedBoard').count())) return
  const d = page.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first()
  if (await d.count()) { if (w.phone) await d.tap(); else await d.click() } else await page.keyboard.press('Escape')
  await sleep(600)
}
export async function addWave(w, di, kind = '') {
  const page = w.page
  const n0 = await page.evaluate(i => window.DAYS[i].waves.length, di)
  await press(w, `[data-wvadd="${di}"]`, { scope: 'board' })
  await press(w, `.wavemenu [data-wmkind="${kind}"]`)
  await page.waitForFunction(([i, n]) => window.DAYS[i].waves.length === n + 1, [di, n0])
  await sleep(300)
  return n0
}
export async function ensureRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.locator('#sbRoster:visible').count()) return
  const tab = page.locator('#schedBoard .ros-tab:visible').first()
  if (await tab.count()) { await tab.tap(); await sleep(400) }
}
export async function closeRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) { const tab = page.locator('#schedBoard .ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await sleep(400) } }
}
export async function seat(w, slotSel, id) {
  const page = w.page
  await ensureRoster(w)
  let res = 'FAILED seat not armed'
  for (let t = 0; t < 3; t++) {
    await press(w, slotSel, { scope: 'board' }); await sleep(200)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
    if (!(await p.count())) { await page.keyboard.press('Escape'); res = 'FAILED ' + id + ' not offered'; break }
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
    try { if (w.phone) await p.tap({ timeout: 2500 }); else await p.click({ timeout: 2500 }) } catch { const b = await p.boundingBox(); if (b) { if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
    await sleep(400); res = 'ok'; break
  }
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await closeRoster(w)
  return res
}
/** a flight: wave on day di, take-off/landing typed ('' leaves blank), Ranger front seat. returns wave index */
export async function flight(w, di, to, ld, man = MAN, extra = {}) {
  const wi = await addWave(w, di, '')
  await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld) await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  for (const [k, v] of Object.entries(extra)) await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.${k}"]`, v)
  const s = await seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, man)
  if (s !== 'ok') say('SEAT PROBLEM', di, wi, s)
  const f = await page(w).evaluate(([d, g]) => { const x = window.DAYS[d].waves[g].formations[0]; return { to: x.to, ld: x.ld, p: window.PEOPLE[x.aircraft[0].p]?.cs } }, [di, wi])
  say(`flight d${di} w${wi}`, JSON.stringify(f))
  return wi
}
const page = w => w.page
/** the board's own warning lines (desktop #sbSide; phone folds behind [data-sbwtog]) */
export async function boardWarn(w) {
  const pg = w.page
  const tog = pg.locator('#schedBoard [data-sbwtog]:visible').first()
  if (await tog.count()) {
    const has = await pg.evaluate(() => !!document.querySelector('#schedBoard #sbWarn .wln'))
    if (has && !(await pg.locator('#schedBoard #sbWarn .wln:visible').count())) {
      await tog.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
      if (w.phone) await tog.tap(); else await tog.click()
      await sleep(400)
    }
  }
  return pg.evaluate(() => {
    const side = document.querySelector('#schedBoard #sbWarn') || document.querySelector('#schedBoard #sbSide')
    if (!side) return []
    const els = [...side.querySelectorAll('.wln, .witem')].filter(e => e.offsetWidth)
    if (els.length) return els.map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()).filter(Boolean)
    return (side.innerText || '').split(/\r?\n/).map(s => s.replace(/ /g, ' ').trim()).filter(Boolean)
  })
}
/** the week strip of a day on a week root ('#eWeek' | '#vWeek'): opens it, reads .witem lines */
export async function weekWarn(w, root, di) {
  const pg = w.page
  const s = pg.locator(`${root} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return { head: 'NO STRIP', items: [] }
  const head = nrm(await s.innerText())
  const open = await pg.locator(`${root} [data-dwbox="${di}"].open`).count()
  if (!open) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await s.tap(); else await s.click(); await sleep(400) }
  const items = await pg.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].filter(e => e.offsetWidth).map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()), [root, di])
  return { head, items }
}
/** day details window from the day's own door on a week root; reads the issue lines; leaves it OPEN (close it at the next step) */
export async function dayDetails(w, root, di) {
  const pg = w.page
  const d = pg.locator(`${root} [data-dayinfo="${di}"]:visible`).first()
  if (!(await d.count())) return { ok: false, items: [], why: 'no door ' + root + ' ' + di }
  await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  if (w.phone) await d.tap(); else await d.click()
  await sleep(500)
  if (!(await pg.locator('#dayPop:not([hidden]) .airpop-box:visible').count())) return { ok: false, items: [], why: 'window did not open' }
  const items = await pg.evaluate(() => [...document.querySelectorAll('#dayPopBody .witem')].map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()))
  const text = nrm(await pg.evaluate(() => document.querySelector('#dayPopBody')?.innerText || ''))
  return { ok: true, items, text }
}
export async function closeDayPop(w, how = 'done') {
  const pg = w.page
  if (!(await pg.locator('#dayPop:not([hidden]) .airpop-box:visible').count())) return 'not open'
  if (how === 'done') await press(w, '#dayPopDone')
  else if (how === 'x') await press(w, '#dayPopClose')
  else if (how === 'esc') { await pg.keyboard.press('Escape'); await sleep(400) }
  else if (how === 'outside') { const b = await pg.locator('#dayPop').boundingBox(); if (w.phone) await pg.touchscreen.tap(b.x + 4, b.y + 4); else await pg.mouse.click(b.x + 4, b.y + 4); await sleep(400) }
  const still = await pg.locator('#dayPop:not([hidden]) .airpop-box:visible').count()
  return still ? 'STILL OPEN' : 'closed'
}
export const crest = a => (a || []).filter(l => /crew rest|tight turn/i.test(l))
export const pic = (w, name, loc) => W.pic(w.page, name, loc)
export async function fin(w) {
  say('errors', JSON.stringify(w.errors.slice(0, 8)))
  saveRows(); await W.closeAll(w.browser); W.summary()
}
/** the forward "Breaks <day>" explanation on a day: tap the man's puck in the week, read the .wtr rows */
export async function trace(w, root, di, person = MAN) {
  const pg = w.page
  const p = pg.locator(`${root} .day[data-day="${di}"] .puck[data-person="${person}"]:visible`).first()
  if (!(await p.count())) return { items: [], why: 'no puck' }
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  if (w.phone) await p.tap(); else await p.click()
  await sleep(600)
  const items = await pg.evaluate(([q, i]) => [...document.querySelectorAll(`${q} .day[data-day="${i}"] .wtr`)].filter(e => e.offsetWidth).map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()), [root, di])
  return { items }
}
export const WK = { cur: '13/07/2026', next: '20/07/2026', nextIso: '2026-07-20', curIso: '2026-07-13' }
/** go to a week by the page's own week control: desktop's week buttons; the phone's "Jump to a date" calendar */
export async function gotoWeek(w, v, iso, page_ = 'editsched') {
  const pg = w.page
  if (await pg.evaluate(() => !!document.querySelector('#schedBoard'))) await closeBoard(w)
  await L.go(pg, page_); await sleep(300)
  if (!w.phone) {
    await press(w, `[data-wk="${v}"]`)
  } else {
    await press(w, '.filt-cal')
    await pg.waitForSelector('#weekCal:not([hidden]) .airpop-box', { timeout: 5000 })
    await press(w, `#weekCal [data-iso="${iso}"]`)
  }
  await pg.waitForFunction(x => window.CURWEEK === x, v, { timeout: 5000 })
  await sleep(500)
  return pg.evaluate(() => window.CURWEEK)
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
/** file a Duty input through the Inputs page's own calendar and window (admin). returns the stored rows with this remark */
export async function fileDuty(w, iso, person, start, end, remark) {
  const pg = w.page
  const [yy, mm] = iso.split('-').map(Number)
  await L.go(pg, 'inputs'); await pg.waitForSelector('#inpCal, #inListBtn', { timeout: 8000 }); await sleep(500)
  if (!(await pg.locator('#inpCal:visible').count())) await press(w, '#inCalBtn, button[aria-label="Calendar"]')
  for (let i = 0; i < 12; i++) {
    const [name, y] = (await pg.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = yy * 12 + (mm - 1) - (+y * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await pg.locator(d > 0 ? '#icNext' : '#icPrev').click(); await sleep(300)
  }
  const day = pg.locator(`#inpCal [data-icday="${iso}"]`).first()
  await day.scrollIntoViewIfNeeded(); if (w.phone) await day.tap({ position: { x: 8, y: 8 } }); else await day.click({ position: { x: 8, y: 8 } }); await sleep(450)
  await press(w, '#icPopAdd')
  await pg.waitForSelector('[data-testid="win-inputedit"], #inpEditPop', { timeout: 5000 }); await sleep(300)
  await pg.selectOption('#inpEditType', 'Duty')
  await pg.selectOption('#inpEditPerson', person)
  const ad = pg.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
  await pg.fill('#inpEditStart', start); await pg.fill('#inpEditEnd', end); await pg.fill('#inpEditRmk', remark)
  await pg.locator('#inpEditSave').click(); await sleep(450)
  if (await pg.locator('[data-testid="oilconf"]').count()) { await pg.locator('[data-testid="oil-no"]').click(); await pg.locator('[data-testid="oilconf-save"]').click(); await sleep(400) }
  for (const x of await pg.locator('[data-testid="win-inputedit-x"], [data-testid="win-inputsday-x"]').all()) { if (await x.isVisible().catch(() => false)) { await x.click({ force: true }).catch(() => {}); await sleep(300) } }
  return pg.evaluate(r => window.INPUTS.filter(i => (i.remarks || '') === r).map(i => ({ type: i.type, person: i.person, s: i.s, e: i.e, acc: i.acc, date: i.date })), remark)
}
export const restRe =/crew rest|tight turn|Breaks/i
/** read a day pair on every surface: day B's week strip, day B's day details, day B's board list, day A's forward trace */
export async function readPair(w, tag, dB = SAT, dA = FRI, person = MAN) {
  const pg = w.page, P = w.P
  await L.go(pg, 'editsched'); await sleep(500)
  const sat = await weekWarn(w, '#eWeek', dB)
  await pic(w, `${tag}-week-${P}`)
  let tr = await trace(w, '#eWeek', dA, person); if (!tr.items.length) tr = await trace(w, '#eWeek', dA, person)
  await pic(w, `${tag}-trace-${P}`)
  const dd = await dayDetails(w, '#eWeek', dB)
  await pic(w, `${tag}-daydet-${P}`)
  await closeDayPop(w, 'done')
  await board(w, dB)
  const bw = await boardWarn(w)
  await pic(w, `${tag}-board-${P}`)
  await closeBoard(w)
  return { week: sat.items.filter(l => restRe.test(l)), details: dd.items.filter(l => restRe.test(l)), board: bw.filter(l => restRe.test(l)), fwd: tr.items }
}
export function judgeAll(sc, tag, size, r, re, picBase, fwdOpt = false) {
  for (const k of ['week', 'details', 'board']) {
    const v = r[k]; const ok = v.length > 0 && v.some(l => re.test(l))
    row(sc + ' ' + tag, size, k, String(re), JSON.stringify(v), ok ? 'PASS' : 'FAIL', `${picBase}`)
  }
  row(sc + ' ' + tag, size, 'forward trace on the earlier day', 'RECORD', JSON.stringify(r.fwd), r.fwd.length || fwdOpt ? 'RECORDED' : 'FAIL', picBase)
}
