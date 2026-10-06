/* [BLANK-TIMES-ABSENCE] walk, walker B — shared helpers on top of bta-env (who X is) and the existing libraries.
   Every fixture goes through the app's own controls; window.* is read only, or to get to a place. */
import './bta-env.mjs'
import * as C from './rbl-C-lib.mjs'
import * as D from './rbl-D-lib.mjs'
import * as P6 from './p6-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
export { C, D, P6, W2 }
export const { B, L, W, K, ID, CSN, SEAT, MON, TUE, WED, R, pic, picEl, sleep } = C
export const THU = 3, SUN = 6
export const PHONE = !!process.env.HP_PHONE
export const ISO = C.ISO

const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const p2 = n => String(n).padStart(2, '0')
export async function walkCal(page, cal, iso) {
  for (let i = 0; i < 40 && !(await page.locator(`${cal} [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
    const at = `${y}-${p2(MONS.indexOf(m.slice(0, 3)) + 1)}`
    await page.locator(`${cal} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
    await sleep(80)
  }
  await page.locator(`${cal} [data-cal="${iso}"]`).first().click()
  await sleep(140)
}

/* a typed input through the Inputs page's own form, with a last day (toDi) for a span of days. Returns { iid, asked, clash, form } */
export async function file(p, { person = ID, type, di, toDi = null, allday = true, from = null, to = null, remarks = '', sans = null, span = null, clashAns = null, upAns = 'keep' }) {
  await B.toEdit(p)
  if (await p.locator('#schedBoard:visible').count()) await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  if (await p.locator('#icClose:visible').count()) { await p.locator('#icClose').click(); await sleep(300) }
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  if (person && await p.locator('#inPerson').count()) await p.selectOption('#inPerson', person)
  await p.selectOption('#inType', type)
  await walkCal(p, '#inCal', ISO(di))
  if ((await p.locator('#inDates').textContent()).includes('→')) await walkCal(p, '#inCal', ISO(di))
  if (toDi != null && toDi !== di) await walkCal(p, '#inCal', ISO(toDi))
  if (sans) for (const i of sans) await p.locator('#inSans input[type=checkbox]').nth(i).check()
  if (await p.locator('#inSpan').count()) {
    const sp = span || (allday ? 'all' : 'custom')
    await p.locator(`#inSpan [data-span="${sp}"]`).click().catch(() => {})
    await sleep(150)
  }
  if (await p.locator('#inAllday').count()) {
    const on = await p.locator('#inAllday').isChecked()
    if (allday && !on) await p.locator('#inAllday').click()
    if (!allday && on) await p.locator('#inAllday').click()
  }
  if (!allday && (span === null || span === 'custom')) {
    if (from != null && await p.locator('#inStartT').count()) { await p.locator('#inStartT').fill(from); await p.locator('#inStartT').blur() }
    if (to != null && await p.locator('#inEndT').count()) { await p.locator('#inEndT').fill(to); await p.locator('#inEndT').blur() }
  }
  await p.locator('#inRemarks').fill(remarks)
  const form = await p.evaluate(() => ({ dates: (document.querySelector('#inDates') || {}).textContent, span: (document.querySelector('#inSpan .spanbtn.on') || {}).textContent || null, s: (document.querySelector('#inStartT') || {}).value, e: (document.querySelector('#inEndT') || {}).value }))
  await p.locator('#inAdd').click()
  await sleep(700)
  const asked = []
  let clashDone = null, upSheet = null, upPic = null
  for (let i = 0; i < 4; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { asked.push('oil'); await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
    if (await p.locator('[data-testid="upconf"]:visible').count()) {
      const txt = await p.locator('[data-testid="upconf"]:visible').first().innerText()
      upSheet = txt.replace(/\s+/g, ' ').trim()
      asked.push('upchit-sheet')
      upPic = await pic(p, 'upchit-sheet')
      const nLeft = await p.locator('[data-testid^="upconf-left-"]:visible').count()
      for (let k = 0; k < nLeft; k++) await p.locator(`[data-testid="upconf-left-${k}"] button.upconf-seg`).nth(upAns === 'remove' ? 1 : 0).click()
      await p.locator('[data-testid="upconf-save"]:visible').click(); await sleep(700)
      continue
    }
    if (await p.locator('[data-testid="medclash"]:visible').count()) {
      asked.push('clash-sheet')
      clashDone = await W2.clashAnswer(p, clashAns || ['new', 'new', 'new'])
      continue
    }
    break
  }
  const iid = await p.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid)[0] || null }, before)
  return { iid, asked, clashDone, form, upSheet, upPic }
}
/* what the Inputs page's stored record reads (read only) */
export const rec = (p, iid) => p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? `${x.type} ${x.date}${x.endDate ? '→' + x.endDate : ''} allday ${!!x.allday} half "${x.half || ''}" ${x.s || ''}–${x.e || ''}${x.acc ? ' acc ' + x.acc : ''}${x.fromDate ? ' fromDate ' + x.fromDate : ''}` : 'not found' }, iid)
export const recAll = (p, id = ID) => p.evaluate(who => window.INPUTS.filter(x => x.person === who).map(x => `${x.iid}:${x.type} ${x.date}${x.endDate ? '→' + x.endDate : ''} ${x.allday ? 'allday' : (x.half || '') + ' ' + (x.s || '') + '–' + (x.e || '')}${x.acc ? ' acc ' + x.acc : ''}`), id)

const ABS = /leave|Downchit|but tasked|but on BB|but planned|clashes|standing SC SPARE|down for|Upchit|overseas|medical|Meeting|Training/i
/* what a person can see about X on one day: every warning naming him (code + sentence), the day's lines naming him as painted,
   his pucks as painted (ring + chip). */
export async function see(p, tag, { di = TUE, id = ID, cs = CSN, prev = -1, noPics = false } = {}) {
  const s = await C.seeWeek(p, di, tag, { prev, id, noPics })
  const held = s.held.map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${w.msg}`)
  const keyed = await p.evaluate(([i, who]) => ((window.WARN.byDay[i] || {}).warns || []).filter(w => (w.who || []).includes(who)).map(w => (w.code) + ' @' + (w.key || '-') + ': ' + String(w.msg).slice(0, 70)), [di, id])
  const lines = (s.list.full || []).filter(x => x.text.includes(cs)).map(x => (x.struck ? '[STRUCK] ' : '') + x.text.replace(/ ✕| ↺/g, ''))
  return { held, keyed, lines, pk: s.pk, pkOpen: s.pkOpen, bar: s.list.bar, pics: s.pics, ring: s.pk.some(x => x.solid), chips: s.pk.map(x => x.chip).filter(Boolean), nan: held.concat(lines).some(t => /NaN|undefined|null/.test(t)), raw: s }
}
export const says = (s, n = 150) => `warnings naming him: ${s.held.length ? JSON.stringify(s.held.map(t => t.slice(0, n))) : 'none'} · the day's list "${s.bar}" lines naming him ${JSON.stringify(s.lines.map(t => t.slice(0, n)))} · his pucks [${C.pk2(s.pk)}] · where each is anchored ${JSON.stringify((s.keyed||[]).filter(k => /INPUT|LEAVE|DNIF|SHIFT|STANDBY|OD|BB|SC/.test(k)).map(k => k.slice(0, 60)))}`
export const absLines = s => s.held.filter(t => ABS.test(t))
export const silent = s => s.held.length === 0 && s.lines.length === 0
/* a puck's ring as painted by its place name */
export const ringAt = (s, where) => s.pk.filter(x => x.where === where).some(x => x.solid)

/* fixtures through the board */
export const key = (di, gi, fi, ai, seat = SEAT) => `${di}.${gi}.${fi}.${ai}.${seat}`
/* a flying wave with one blank line, X armed and pressed from the crew list */
export async function blankLine(p, di, seatX = true) {
  const m = await K.addFlyWave(p, di)
  let took = null, msg = null
  if (seatX) { const s = await K.seat(p, di, m.gi, 0, 0, SEAT, ID); took = s.took; msg = s.msg }
  return { gi: m.gi, label: m.label, took, msg }
}
/* an extra "+ Line" on the day's last wave, blank, X seated */
export async function extraBlank(p, di, gi, seatX = true) {
  await K.addLine(p, di, gi)
  const fi = (await C.nLines(p, di, gi)) - 1
  let took = null
  if (seatX) { const s = await K.seat(p, di, gi, fi, 0, SEAT, ID); took = s.took }
  return { fi, took }
}
/* a new duty / sim / ground / prog row with no name and no times, X put on it */
export const blankRow = (p, kind, di, seatX = true) => D.addRow(p, kind, di, null, null, null, seatX ? ID : null)
/* take X off a flying seat or a row (by its crew-list "armed" gesture is not needed — a row's ✕ / the seat's own control is used) */
export const lineText = (p, di, gi, fi) => C.lineNow(p, di, gi, fi)

/* a picture of the whole page, opened by the caller afterwards */
export async function shot(p, name) { return pic(p, name) }
export function mk(name) {
  const rows = []
  return { rows, add(id, did, saw, verdict, pics = []) { R(id, did, saw, verdict, pics.filter(Boolean)); rows.push({ id, verdict }) } }
}
export function done(part) {
  B.savePart(part)
  for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      -> ${String(r.saw).slice(0, 600)}`)
}
