/* [INSIGHTS-WHICH-COPY] walk — walker A: helpers on top of wh-b-lib (itself on wh-lib, dbrA-lib, dbrA-W1-lib).
   Every gesture is the app's own control; window.* only to get to a place and to read. */
import * as B from './wh-b-lib.mjs'
export * from './wh-b-lib.mjs'
const { L, W, pic } = B

/* open the Insights window by the door of this width; says which door, or why not */
export async function insOpen(p) {
  if (await p.locator('#insightBody').count()) return { how: 'already open' }
  const b = p.locator('#insightBtn:visible').first()
  if (await b.count()) {
    /* is the button the thing a pointer would land on? */
    const top = await b.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) })
    if (!top) return { err: 'the Insights button is drawn but something lies over it' }
    await b.click(); await L.sleep(500); return { how: 'top bar Insights' }
  }
  const bg = p.locator('#burger:visible').first()
  if (!(await bg.count())) return { err: 'no Insights button and no ☰' }
  const topB = await bg.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) })
  if (!topB) return { err: 'the ☰ is drawn but something lies over it' }
  await bg.click(); await L.sleep(400)
  const d = p.locator('#drawerInsights:visible').first()
  if (!(await d.count())) return { err: 'no "Week insights" row in the ☰ drawer' }
  await d.click(); await L.sleep(500)
  return { how: '☰ → Week insights' }
}
/* everything the window says, as painted */
export async function insRead(p) {
  return p.evaluate(() => {
    const b = document.querySelector('#insightBody'); if (!b) return { err: 'the window is not open' }
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const m = document.querySelector('#insightModal'), box = m.querySelector('.modal-box')
    const r = box.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    const tiles = [...b.querySelectorAll('.itile')].map(e => ({ n: t(e.querySelector('.n')), l: t(e.querySelector('.l')), all: t(e) }))
    const secs = {}; let cur = '(top)'
    const walk = el => { for (const e of el.children) {
      if (e.classList.contains('isec-h')) { cur = t(e); secs[cur] = secs[cur] || []; continue }
      if (e.classList.contains('itiles') || e.classList.contains('itile')) continue
      const items = e.matches('.ibar,.irow,.ichip') ? [e] : [...e.querySelectorAll('.ibar,.irow,.ichip')]
      if (items.length) (secs[cur] ||= []).push(...items.map(t)); else if (t(e)) (secs[cur] ||= []).push(t(e))
    } }
    walk(b)
    return { title: t(m.querySelector('.modal-head b')), tiles, secs, text: t(b),
      top: !!hit && box.contains(hit), box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, vw: innerWidth, vh: innerHeight,
      scroll: { h: b.scrollHeight, c: b.clientHeight }, hitWas: hit ? (hit.id || hit.className || hit.tagName) : null }
  })
}
export async function insClose(p) { const x = p.locator('#insightClose:visible').first(); if (await x.count()) { await x.click(); await L.sleep(250) } }
/* open, read, picture(s), close. `foot` also takes the foot of the window (Conflicts by type, By day) */
export async function ins(p, name = null, { foot = true } = {}) {
  const o = await insOpen(p)
  if (o.err) return { err: o.err, shots: [] }
  const r = await insRead(p)
  r.how = o.how; r.shots = []
  if (name && !r.err) {
    r.shots.push(await pic(p, name))
    if (foot) {
      await p.evaluate(() => { const b = document.querySelector('#insightBody'); const rows = b.querySelectorAll('.irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await L.sleep(250)
      r.shots.push(await pic(p, name + '-foot'))
    }
  }
  await insClose(p)
  return r
}
/* short picks out of a read */
export const tile = (r, re) => { const x = (r.tiles || []).find(t => re.test(t.l) || re.test(t.all)); return x ? x.n : null }
export const tilesLine = r => (r.tiles || []).map(t => t.all).join(' | ')
export const sec = (r, re) => { const k = Object.keys(r.secs || {}).find(k => re.test(k)); return k ? r.secs[k] : [] }
export const rowOf = (r, secRe, re) => sec(r, secRe).find(x => re.test(x)) || '(none)'
export const flyLoad = (r, cs) => rowOf(r, /Flying load/i, new RegExp('^' + cs + '\\b'))
export const hoursOf = (r, cs) => rowOf(r, /Work hours/i, new RegExp('^' + cs + '\\b'))
export const idleHas = (r, cs) => sec(r, /Not on the flying/i).some(x => new RegExp('(^|\\s)' + cs + '(\\s|$)').test(x))
export const byDay = (r, day) => rowOf(r, /By day/i, new RegExp('^' + day, 'i'))
export const byType = r => sec(r, /Conflicts by type/i).join(' ; ')
export const sum = r => r.err ? r.err : `tiles [${tilesLine(r)}] · types [${byType(r)}] · Tue "${byDay(r, 'Tue')}"`
/* two reads say the same thing, word for word */
export const same = (a, b) => !!a && !!b && !a.err && !b.err && a.text === b.text && a.title === b.title
export const diffText = (a, b) => {
  if (!a || !b || a.err || b.err) return 'one read failed'
  if (a.text === b.text) return 'identical'
  const out = []
  for (const k of new Set([...Object.keys(a.secs), ...Object.keys(b.secs)])) {
    const x = a.secs[k] || [], y = b.secs[k] || []
    const gone = x.filter(v => !y.includes(v)), came = y.filter(v => !x.includes(v))
    if (gone.length || came.length) out.push(`${k}: −[${gone.join(' | ')}] +[${came.join(' | ')}]`)
  }
  const ta = tilesLine(a), tb = tilesLine(b); if (ta !== tb) out.unshift(`tiles: ${ta} → ${tb}`)
  return out.join(' ;; ').slice(0, 900) || 'text differs outside the sections'
}
export const cs = (p, id) => p.evaluate(i => (window.PEOPLE[i] || {}).cs || i, id)
export const wait = L.sleep

/* ---------- gestures on the open board ---------- */
const seatOf = (p, slot) => p.evaluate(s => { const [di, gi, li, ai, k] = s.split('.'); return window.DAYS[+di].waves[+gi].formations[+li].aircraft[+ai][k] || '' }, slot)
/* put `pid` on a flying seat from the board's crew list: a drag on a desktop; on a phone the AIRCREW drawer, the name, the seat */
export async function seatPut(p, slot, pid) {
  const seat = p.locator(`#schedBoard [data-slot="${slot}"]:visible`).first()
  const before = await seatOf(p, slot)
  if (!B.PHONE) {
    const rp = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
    /* the crew list scrolls by itself: bring the seat, then the name, to the middle of their own panels first */
    await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
    await rp.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200)
    try { await W.drag(p, rp, seat) } catch (e) { return { before, after: await seatOf(p, slot), err: String(e).slice(0, 200) } }
  } else {
    await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
    const tab = p.locator('#schedBoard .ros-tab:visible').first()
    await tab.click(); await L.sleep(500)
    const rp = p.locator(`#sbRoster .rpuck[data-person="${pid}"]`).first()
    await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    await rp.click({ timeout: 4000 }); await L.sleep(400)
    await seat.click({ timeout: 4000, position: { x: 12, y: 8 } }).catch(async () => { const b = await seat.boundingBox(); if (b) await p.touchscreen.tap(b.x + 10, b.y + b.height / 2) }); await L.sleep(700)
  }
  return { before, after: await seatOf(p, slot), took: (await seatOf(p, slot)) === pid }
}
/* take the man off a flying seat: his puck dragged off the seat onto the crew list (desktop) */
export async function seatOff(p, slot) {
  const src = p.locator(`#schedBoard [data-slot="${slot}"] [data-person]:visible`).first()
  const before = await seatOf(p, slot)
  if (!(await src.count())) return { before, after: before, err: 'no puck on the seat' }
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  const a = await src.boundingBox(), b = await p.locator('#sbRoster:visible').first().boundingBox()
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
  await p.mouse.move(b.x + b.width / 2, Math.min(b.y + 320, b.y + b.height - 20), { steps: 14 }); await L.sleep(150); await p.mouse.up(); await L.sleep(700)
  return { before, after: await seatOf(p, slot) }
}
/* the CX on an aircraft line → the dialog's "Cancel line" */
export async function cxLine(p, key, reason = '') {
  const cx = p.locator(`#schedBoard [data-lcx="${key}"]:visible`).first()
  if (!(await cx.count())) return 'no CX on that line'
  await cx.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await cx.click(); await L.sleep(400)
  if (reason) await p.locator('#cxReason').fill(reason)
  const title = await p.evaluate(() => (document.querySelector('#cxTitle') || {}).innerText || '')
  await p.locator('#cxSave').click(); await L.sleep(600)
  return 'pressed: ' + title
}
export const boxText = (p, key, v) => W.boardText(p, key, v)
/* the day on Edit Schedule (the board shut): its head and its bar */
export async function face(p, di) {
  await B.toEdit(p); await W.showDay(p, di)
  const h = await B.head(p, di)
  const bar = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"] .daywarn`); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '(no bar)' }, di)
  return { ...h, bar }
}
export const faceLine = f => `tag ${f.tag} · chip "${f.pending}" · ${f.nys ? '"' + f.nys + '"' : 'no not-signed marker'} · ${f.alpub ? 'button "' + f.alpub + '"' : 'no Publish AL button'} · signed line "${(f.signed || '').slice(0, 60)}" · bar "${f.bar}"`
export const isPending = f => /pending/.test(f.pending || '')
/* the published face on View-only Sched (same sign-in): the day's bar and version select */
export async function vface(p, di) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  await W.showDay(p, di, '#vWeek')
  return p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const sel = d.querySelector('select.dver'); const bar = d.querySelector(`[data-dwbox="${i}"] .daywarn`)
    return { tag: t(d.querySelector('.verchip')), sel: sel ? sel.options[sel.selectedIndex].text : '', bar: bar ? t(bar) : '(no bar)' } }, di)
}
export async function toPage(p, pg) { await W.boardOff(p); if ((await p.evaluate(() => window.CURPAGE)) !== pg) await L.go(p, pg) }
/* a scenario's wrapper: run it, catch a stop, write the error row, save the part, close */
export async function run(S, fn, opts = {}) {
  const w = await B.world(opts)
  try { await fn(w.p, w) } catch (e) { B.row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 700), 'FAIL', [await pic(w.p, `s${S}-X-error`)]) }
  B.row(`${S}.err`, 'the browser\'s error list through this scenario', w.errors.length ? w.errors.join(' | ').slice(0, 800) : 'none', w.errors.length ? 'FAIL' : 'PASS')
  B.savePart(`s${S}`, { errors: w.errors })
  await w.browser.close()
}
/* one picture of the window: 'top' (tiles, flying load, work hours), 'foot' (idle, types, by day) or 'both' */
export async function insPic(p, name, which = 'top') {
  const o = await insOpen(p)
  if (o.err) return { err: o.err, shots: [] }
  const r = await insRead(p); r.how = o.how; r.shots = []
  if (which !== 'foot') r.shots.push(await pic(p, name))
  if (which !== 'top') { await p.evaluate(() => { const rows = document.querySelectorAll('#insightBody .irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await L.sleep(250); r.shots.push(await pic(p, name + '-foot')) }
  await insClose(p)
  return r
}
/* the window read with no picture */
export async function insNow(p) { const o = await insOpen(p); if (o.err) return { err: o.err }; const r = await insRead(p); r.how = o.how; await insClose(p); return r }
/* a picture of the day on Edit Schedule, its list open */
export async function facePic(p, di, name) { await B.toEdit(p); await B.openList(p, '#eWeek', di); return pic(p, name) }
export const num = s => { const m = /(\d+) issues?/.exec(s || ''); return m ? +m[1] : (/clear|No issues/i.test(s || '') ? 0 : null) }
export const typeN = (r, re) => { const x = rowOf(r, /Conflicts by type/i, re); return x === '(none)' ? 0 : +x.replace(/^.*\D(\d+)$/, '$1') }
/* a picture of the window with one man's Work-hours bar brought to the middle (the list is long) */
export async function insAt(p, name, csName) {
  const o = await insOpen(p)
  if (o.err) return { err: o.err, shots: [] }
  const r = await insRead(p); r.how = o.how
  await p.evaluate(c => { const hs = [...document.querySelectorAll('#insightBody .isec-h')]; const h = hs.find(e => /Work hours/i.test(e.innerText)); let e = h; while (e && (e = e.nextElementSibling) && !e.classList.contains('isec-h')) { const nm = e.querySelector('.nm'); if (nm && nm.innerText.trim() === c) { e.scrollIntoView({ block: 'center' }); break } } }, csName)
  await L.sleep(250)
  r.shots = [await pic(p, name)]
  await insClose(p)
  return r
}
