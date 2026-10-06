/* Walker C — shared helpers for the [REST-BLANK-LINE] walk, on top of stk-B-lib (which re-exports wh-lib, wh-b-lib, dbrA-*).
   Every fixture goes through the app's own controls. window.* is read only (and to get to a place). */
import * as K from './stk-B-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
export * from './stk-B-lib.mjs'
export { K }
const { B, L, W } = K
export const MON = 0, TUE = 1, WED = 2
export const ID = process.env.RBL_X || 'waldo'      /* Scribe, a WSO, idle across the demo week, a SANS man (RBL_X overrides; RBL_SEAT is his seat, p or w) */
export const CSN = process.env.RBL_CS || 'Scribe'
export const SEAT = process.env.RBL_SEAT || 'w'
export const OPP = SEAT === 'w' ? 'p' : 'w'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const PHONE = !!process.env.HP_PHONE
export const notes = []
export function note(s) { notes.push(s); console.log('NOTE ' + s) }

/* ---------- reading what a person sees ---------- */
/* the specific crew-rest / tight-turn lines that name X (never the day's total) */
export async function warnsX(p, di, id = ID) {
  const all = await B.warnsOf(p, di)
  return all.filter(x => x.who.includes(id))
}
export async function fullWarnsX(p, di, id = ID) {
  return p.evaluate(([i, who]) => ((window.WARN.byDay[i] || {}).warns || []).filter(w => (w.who || []).includes(who)).map(w => ({ sev: w.sev, code: w.code, off: !!w.off, msg: String(w.msg || '') })), [di, id])
}
/* every puck of a person in a scope, AS PAINTED: computed shadow / outline, chip, where it sits */
export async function painted(p, scope, id = ID) {
  return p.evaluate(([s, who]) => {
    const where = e => {
      const toks = []; let x = e
      for (let i = 0; i < 9 && x; i++, x = x.parentElement) toks.push(' ' + (x.id ? '#' + x.id + ' ' : '') + (typeof x.className === 'string' ? x.className : '') + ' ')
      const t = toks.join('|')
      const pick = [[/availwin/, 'ALL AVAIL window'], [/ rsans |sb-roster|eroster|#sbRoster|crewpal/, 'crew list'], [/sansav|sanscards|sec-sans/, 'SANS card'], [/ pinp |sec-pinp/, 'Personal Inputs row'],
        [/ unav |sec-unav|unavrow/, 'Unavailable row'], [/ sb-go |sb-line| go /, 'flying line'], [/ grnd |sec-grnd/, 'ground row'], [/ duty |sec-duty/, 'duty'], [/ simr |sec-sim/, 'sim'], [/ prog |sec-prog/, 'programme'], [/ avail|sec-avail|avgrid/, 'Available crew'], [/inprow/, 'input row (other panel)']]
      for (const [re, name] of pick) if (re.test(t)) return name
      return 'other'
    }
    return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null).map(e => {
      const cs = getComputedStyle(e), chip = e.querySelector('.lchip')
      const sh = cs.boxShadow
      const ln = (sh || '').match(/-?[0-9.]+px/g) || []; const ringSolid = !!sh && sh !== 'none' && ln.length >= 4 && parseFloat(ln[3]) >= 1.5 && parseFloat(ln[0]) === 0
      return { where: where(e), cls: String(e.className).split(' ').filter(Boolean).join(' '), shadow: sh === 'none' ? '' : sh.slice(0, 120), outline: cs.outlineStyle === 'none' ? '' : `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
        solid: ringSolid, dashed: cs.outlineStyle === 'dashed', dotted: cs.outlineStyle === 'dotted', chip: chip ? chip.innerText.trim() : '' }
    })
  }, [scope, id])
}
export const pk2 = ps => ps.length ? ps.map(x => `${x.where}:${x.solid ? 'SOLID-ring' : 'no-solid'}${x.dashed ? ' DASHED' : ''}${x.dotted ? ' DOTTED' : ''}${x.chip ? ' chip ' + x.chip : ''}`).join('; ') : '(no puck drawn)'
/* the day's list as painted */
export async function listOf(p, di) {
  await B.toEdit(p)
  await B.openList(p, '#eWeek', di)
  return B.readList(p, '#eWeek', di)
}
/* every line of the day's list, whole text (readList cuts at 110 characters) */
export async function listFull(p, surf, di) {
  return p.evaluate(([s, i]) => {
    const box = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`)
    if (!box) return []
    return [...box.querySelectorAll('.witem[data-wix]')].map(e => {
      const t = e.querySelector('.wtx') || e.children[1]
      return { ix: +e.dataset.wix, sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', hid: e.classList.contains('hid'), struck: getComputedStyle(t).textDecorationLine.includes('line-through'), text: e.innerText.replace(/\s+/g, ' ').trim() }
    })
  }, [surf, di])
}
export async function aboutX(p, surf, di, name = CSN) {
  return (await listFull(p, surf, di)).filter(x => x.text.includes(name))
}
export const breachLines = (list, cs = CSN) => (list.full || list.lines || []).filter(x => x.text.includes(cs) && /Crew rest|Tight turn|rest/i.test(x.text)).map(x => x.text)
/* a day's issue list shut (opening it hangs .wfoc on the pucks of the people it names, which paints a SOLID outline over a dashed one) */
export async function closeList(p, di) {
  const open = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, di)
  if (open) { await p.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await sleep(400) }
}
/* what the day's list and the pucks said about X on the week: the pucks are read with the list SHUT (pk) and again with it OPEN (pkOpen) */
export async function seeWeek(p, di, tag, { prev = di - 1, id = ID, lean = false, noPics = false } = {}) {
  await B.toEdit(p)
  await W.showDay(p, di)
  await closeList(p, di)
  await sleep(500)
  const pk = await painted(p, `#eWeek .day[data-day="${di}"]`, id)
  const pic2 = noPics ? null : await B.puckPic(p, '#eWeek', di, id, tag + '-puck')
  let pv = [], pic3 = null, prevHeld = null
  if (prev >= 0) {
    await W.showDay(p, prev)
    await closeList(p, prev)
    pv = await painted(p, `#eWeek .day[data-day="${prev}"]`, id)
    pic3 = (lean || noPics) ? null : await B.puckPic(p, '#eWeek', prev, id, tag + '-prev-puck')
    prevHeld = await fullWarnsX(p, prev, id)
    await W.showDay(p, di)
  }
  const list = await listOf(p, di)
  list.full = await listFull(p, '#eWeek', di)
  const held = await fullWarnsX(p, di, id)
  await sleep(300)
  const pkOpen = await painted(p, `#eWeek .day[data-day="${di}"]`, id)
  const pic1 = noPics ? null : await K.picEl(p, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-list', { pad: 8, maxH: 700 })
  return { list, held, pk, pkOpen, pv, prevHeld, pics: [pic1, pic2, pic3].filter(Boolean) }
}
export const sayWeek = s => `Tuesday bar "${s.list.bar}" · lines naming him: ${JSON.stringify(breachLines(s.list).map(t => t.slice(0, 160)))} · his pucks that day [${pk2(s.pk)}] · previous day [${pk2(s.pv)}]`

/* ---------- fixtures through the board ---------- */
export async function nLines(p, di, gi) { return p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.length, [di, gi]) }
export async function csFix(p, di, gi, fi, o) {
  for (const [k, v] of Object.entries(o)) await K.ff(p, di, gi, fi, k, v)
}
/* a fresh wave with one filled line, X seated in the back seat (or not) */
export async function flyWave(p, di, o, seatX = true, seatKey = SEAT) {
  const m = await K.addFlyWave(p, di)
  await csFix(p, di, m.gi, 0, o)
  let took = null
  if (seatX) { const s = await K.seat(p, di, m.gi, 0, 0, seatKey, ID); took = s.took; m.msg = s.msg }
  return { ...m, fi: 0, took }
}
export async function extraLine(p, di, gi, o = null, seatX = true) {
  await K.addLine(p, di, gi)
  const fi = (await nLines(p, di, gi)) - 1
  if (o) await csFix(p, di, gi, fi, o)
  let took = null, msg = null
  if (seatX) { const s = await K.seat(p, di, gi, fi, 0, SEAT, ID); took = s.took; msg = s.msg }
  return { fi, took, msg }
}
/* Baseline B: Monday ordinary flight 20:00–22:30, Tuesday ordinary flight 07:00–08:00, typed Brief 05:00 — X on both */
export async function baselineB(p, { monTo = '20:00', monLd = '22:30', tueTo = '07:00', tueLd = '08:00', tueBr = '05:00', seatX = true } = {}) {
  const m = await flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: monTo, ld: monLd }, seatX)
  const t = await flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', br: tueBr, to: tueTo, ld: tueLd }, seatX)
  return { m, t }
}
export const lineNow = (p, di, gi, fi) => p.evaluate(([i, g, f]) => { const x = window.DAYS[i].waves[g].formations[f]; return `cs "${x.cs}" br "${x.br || ''}" to "${x.to}" ld "${x.ld}"` }, [di, gi, fi])

/* the crew list on the open board: the name's puck for X, with its strike and reason as painted */
export async function crewListX(p, id = ID) {
  return p.evaluate(who => {
    const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${who}"]`)].find(x => x.offsetParent !== null)
    if (!e) return { found: false }
    const cs = getComputedStyle(e)
    const nm = e.querySelector('.nm, .rp-nm, b') || e
    const struck = [e, ...e.querySelectorAll('*')].some(x => getComputedStyle(x).textDecorationLine.includes('line-through'))
    return { found: true, text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200), struck, cls: e.className, title: e.getAttribute('title') || '', opacity: cs.opacity }
  }, id)
}
/* an arbitrary text under the roster item (the reason line may be a sibling) */
export async function crewListRow(p, id = ID) {
  return p.evaluate(who => {
    const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${who}"]`)].find(x => x.offsetParent !== null)
    if (!e) return null
    const host = e.closest('.rrow, .rp-row, li, .rpwrap') || e.parentElement
    return (host.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240)
  }, id)
}
/* toast right now */
export async function toastNow(p) { return p.evaluate(() => { const el = document.getElementById('toastEl'); return el && (el.textContent || '').trim() && getComputedStyle(el).opacity !== '0' ? el.textContent.trim() : null }) }

/* ---------- the Inputs page ---------- */
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const p2 = n => String(n).padStart(2, '0')
export const ISO = di => `2026-07-${p2(13 + di)}`
async function walkCal(page, cal, iso) {
  for (let i = 0; i < 40 && !(await page.locator(`${cal} [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
    const at = `${y}-${p2(MONS.indexOf(m.slice(0, 3)) + 1)}`
    await page.locator(`${cal} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
    await sleep(80)
  }
  await page.locator(`${cal} [data-cal="${iso}"]`).first().click()
  await sleep(140)
}
/* a typed input through the Inputs page's own form. allday true/false; from/to times when not all day. Returns the new iid. */
export async function fileInput(p, { person = ID, type, di, allday = true, from = null, to = null, remarks = '', sans = null, span = null }) {
  await B.toEdit(p)
  if (await p.locator('#schedBoard:visible').count()) await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  if (await p.locator('#icClose:visible').count()) { await p.locator('#icClose').click(); await sleep(300) }
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  if (person && await p.locator('#inPerson').count()) await p.selectOption('#inPerson', person)
  await p.selectOption('#inType', type)
  const iso = ISO(di)
  await walkCal(p, '#inCal', iso)
  if ((await p.locator('#inDates').textContent()).includes('→')) await walkCal(p, '#inCal', iso)
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
  if (!allday) {
    if (from != null && await p.locator('#inStartT').count()) { await p.locator('#inStartT').fill(from); await p.locator('#inStartT').blur() }
    if (to != null && await p.locator('#inEndT').count()) { await p.locator('#inEndT').fill(to); await p.locator('#inEndT').blur() }
  }
  await p.locator('#inRemarks').fill(remarks)
  await p.locator('#inAdd').click()
  await sleep(700)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { asked.push('oil'); await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
    break
  }
  const clash = await p.locator('[data-testid="medclash"]:visible').count()
  const iid = await p.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid)[0] || null }, before)
  return { iid, asked, clash: !!clash }
}
export async function inputRowText(p, iid) { return p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim() : null }, iid) }

/* ---------- saving this walker's results ---------- */
export function savePartC(name) { B.savePart(name) }

/* ---------- more shared helpers ---------- */
/* arm a seat on the open board (tap it) and say which key is armed */
export async function armSeat(p, key) {
  const el = p.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  try { await el.click({ timeout: 2500 }) } catch { const b = await el.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(300)
  return p.evaluate(() => (window.ARM && window.ARM.key) || null)
}
/* his name in the crew list as painted: struck (class .no / ::after), the reason printed with it */
export async function rosterX(p, id = ID) {
  return p.evaluate(who => {
    const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${who}"]`)].find(x => x.offsetParent !== null)
    if (!e) return { found: false }
    const struck = e.classList.contains('no') || getComputedStyle(e, '::after').content !== 'none'
    return { found: true, struck, cls: String(e.className), own: (e.innerText || '').split('\n').join(' ').trim(), title: e.getAttribute('title') || '' }
  }, id)
}
export const sayRoster = r => !r.found ? 'name not in the crew list' : `struck ${r.struck ? 'YES' : 'no'} · printed "${r.own}" · tooltip "${r.title}"`
/* press his name in the crew list (the seat armed first) */
export async function pressName(p, id = ID) {
  const el = p.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await el.click({ timeout: 3000 }).catch(async () => { const bb = await el.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) })
  await sleep(450)
  const t = await toastNow(p)
  await p.keyboard.press('Escape'); await sleep(200)
  return t
}
/* a time box typed the way a person does: surf 'board' (data-bfld) or 'week' (data-txt); commit by 'tab' or 'blur' (click away) */
export async function typeBox(p, surf, key, value, commit = 'blur') {
  if (surf === 'board') await K.boardTo(p, Number(key.split(':')[1].split('.')[0]))
  else { await B.toEdit(p); await W.showDay(p, Number(key.split(':')[1].split('.')[0])) }
  const sel = surf === 'board' ? `#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible` : `#eWeek [data-txt="${key}"]:visible`
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  await el.click()
  const tag = await el.evaluate(e => e.tagName)
  if (tag === 'INPUT' || tag === 'TEXTAREA') { await el.fill(''); await el.type(String(value), { delay: 8 }) }
  else { await p.keyboard.press('Control+A'); await p.keyboard.type(String(value), { delay: 8 }) }
  if (commit === 'tab') await p.keyboard.press('Tab')
  else { await p.mouse.click(5, 5); await el.evaluate(e => e.blur()).catch(() => {}) }
  await sleep(450)
}
export const formVal = (p, di, gi, fi, f) => p.evaluate(([i, g, x, k]) => { const o = window.DAYS[i].waves[g].formations[x]; return o ? o[k] : undefined }, [di, gi, fi, f])
/* "+ Item" on the Ground Programme: a new row with a name and times, X seated (the crew list); returns its index */
export async function groundRow(p, di, name, str, end, seatX = true) {
  await K.boardTo(p, di)
  const n0 = await p.evaluate(i => window.DAYS[i].ground.length, di)
  const b = p.locator(`#schedBoard [data-gradd="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
  const ri = n0
  await W.boardText(p, `gr:${di}.${ri}.prog`, name)
  await W.boardText(p, `gr:${di}.${ri}.str`, str)
  await W.boardText(p, `gr:${di}.${ri}.end`, end)
  let took = null
  if (seatX) { const s = await K.handPut(p, `g:${di}.${ri}.+`, ID); took = s.took }
  return { ri, took }
}
