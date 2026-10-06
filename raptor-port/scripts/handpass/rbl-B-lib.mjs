/* [REST-BLANK-LINE] walker B — helpers on top of stk-B-lib.mjs. Every fixture goes through the app's own controls. */
import * as K from './stk-B-lib.mjs'
export * from './stk-B-lib.mjs'
const { B, L, W, picEl, sleep } = K
export const MON = 0, TUE = 1, SUN = 6
export const X = 'waldo'

/* Baseline B: Monday ordinary flight 20:00-22:30; Tuesday ordinary flight 07:00-08:00, typed Brief 05:00. X on both. */
export async function baseB(p, { monTo = '20:00', monLd = '22:30', tueTo = '07:00', tueLd = '08:00', tueBr = '05:00', di0 = MON, di1 = TUE } = {}) {
  const m = await K.addFlyWave(p, di0)
  await K.ff(p, di0, m.gi, 0, 'cs', 'ZM'); await K.ff(p, di0, m.gi, 0, 'msn', 'BFM'); await K.ff(p, di0, m.gi, 0, 'to', monTo); await K.ff(p, di0, m.gi, 0, 'ld', monLd)
  const s1 = await K.seat(p, di0, m.gi, 0, 0, 'w', X)
  const t = await K.addFlyWave(p, di1)
  await K.ff(p, di1, t.gi, 0, 'cs', 'ZT'); await K.ff(p, di1, t.gi, 0, 'msn', 'BFM'); await K.ff(p, di1, t.gi, 0, 'to', tueTo); await K.ff(p, di1, t.gi, 0, 'ld', tueLd)
  if (tueBr) await K.ff(p, di1, t.gi, 0, 'br', tueBr)
  const s2 = await K.seat(p, di1, t.gi, 0, 0, 'w', X)
  return { m, t, tookM: s1.took, tookT: s2.took, msgM: s1.msg, msgT: s2.msg }
}
export const nLines = (p, di, gi) => p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.length, [di, gi])

/* X's crew-rest and tight-turn lines (the app's own list) with the hidden flag */
export async function xw(p, di, id = X) {
  const all = await B.warnsOf(p, di)
  return all.filter(w => w.who.includes(id))
}
export async function xwFull(p, di, id = X) {
  return p.evaluate(([i, who]) => ((window.WARN.byDay[i] || {}).warns || []).filter(w => (w.who || []).includes(who)).map(w => ({ sev: w.sev, code: w.code, off: !!w.off, msg: String(w.msg || '') })), [di, id])
}

/* what a person can see about X on Tuesday (and Monday's puck), on Edit Schedule's week */
export async function see(p, tag, { surf = '#eWeek', di = TUE, prev = MON, pics = true, id = X } = {}) {
  const held = await xwFull(p, di, id)
  if (surf === '#eWeek') { await W.boardOff(p).catch(() => {}); await B.toEdit(p) } else { if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched') }
  await W.showDay(p, di, surf)
  /* paint is read with BOTH days' lists shut: an open list lights the crew of its warnings with the focus ring, which would hide the real ring */
  await closeList(p, surf, di); await closeList(p, surf, prev)
  const tue = await B.dayPucks(p, surf, di, id)
  const out = { held, pics: [] }
  out.tuePaint = await paintAll(p, surf, di, id)
  if (pics) out.pics.push(await B.puckPic(p, surf, di, id, tag + '-tue-puck'))
  await B.openList(p, surf, di)
  const list = await B.readList(p, surf, di)
  out.list = list
  const csn = await B.csOf(p, id)
  out.lines = (list.lines || []).filter(x => (/Crew rest|Tight turn/i.test(x.text)) && x.text.includes(csn))
  if (pics) out.pics.push(await picEl(p, `${surf} .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-tue-list', { pad: 8, maxH: 700 }))
  await closeList(p, surf, di)
  await W.showDay(p, prev, surf)
  const mon = await B.dayPucks(p, surf, prev, id)
  out.monPaint = await paintAll(p, surf, prev, id)
  if (pics) out.pics.push(await B.puckPic(p, surf, prev, id, tag + '-mon-puck'))
  out.tue = tue; out.mon = mon
  /* yesterday's list: the "Breaks <day>" line under it (the list is opened only for this read, then shut again) */
  await B.openList(p, surf, prev)
  out.monTrace = await traceRows(p, surf, prev)
  if (pics) out.pics.push(await picEl(p, `${surf} .day[data-day="${prev}"] [data-dwbox="${prev}"]`, tag + '-mon-list', { pad: 8, maxH: 600 }))
  await closeList(p, surf, prev)
  out.tuePk = B.pk(tue); out.monPk = B.pk(mon)
  out.breach = held.some(x => x.code === 'CREW_REST' && !x.off)
  out.breachHid = held.some(x => x.code === 'CREW_REST' && x.off)
  out.ringTue = solidRing(out.tuePaint) && tue.some(x => x.warn && x.sev === 'hard')
  out.dotMon = dottedRing(out.monPaint)
  out.head = await B.head(p, di).catch(() => null)
  out.headMon = surf === '#eWeek' ? await B.head(p, prev).catch(() => null) : null
  return out
}
export const says = s => `held: ${s.held.map(x => `${x.sev}/${x.code}${x.off ? '/HIDDEN' : ''}`).join(', ') || 'none'} · list bar "${s.list.bar}" ${JSON.stringify(s.lines.map(x => (x.struck ? '[STRUCK] ' : '') + x.text.slice(0, 120)))} · Tue pucks [${s.tuePk}] painted [${pn(s.tuePaint)}] · Mon pucks [${s.monPk}] painted [${pn(s.monPaint)}] · Mon list trace ${JSON.stringify((s.monTrace || []).map(x => x.text.slice(0, 110)))}`
export const hd = h => h ? `tag "${h.tag}" · chip "${h.pending || 'none'}" · marker "${h.nys || 'none'}" · signed line "${h.signed || 'none'}" · sign-off boxes [${h.signs.map(x => x.replace(/—\s*name\s*—/, '·')).join(' | ')}]` : '(no head)'
/* the whole picture: breach live, ring on Tuesday, dotted Monday, line on the list, not struck */
export const whole = s => s.breach && s.ringTue && s.dotMon && s.lines.some(x => /Crew rest/i.test(x.text) && !x.struck) && s.monTrace.some(x => /Breaks/.test(x.text))

/* computed paint of the first puck: box-shadow / outline-style */
export async function paint(p, surf, di, id = X) {
  return p.evaluate(([s, i, who]) => {
    const e = [...document.querySelectorAll(`${s} .day[data-day="${i}"] .puck[data-person="${who}"]`)].find(x => x.offsetParent !== null)
    if (!e) return null
    const cs = getComputedStyle(e)
    return { boxShadow: cs.boxShadow, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, cls: e.className }
  }, [surf, di, id])
}
export function snapOK(x) { return !!x }

/* the top of a day's column (its head: tag, chip, marker, sign-offs) as a picture */
export async function headPic(p, surf, di, name, { h = 300 } = {}) {
  await W.showDay(p, di, surf)
  await p.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (d) { d.scrollIntoView({ block: 'start', inline: 'nearest' }); window.scrollBy(0, -80) } }, [surf, di])
  await sleep(300)
  const b = await p.locator(`${surf} .day[data-day="${di}"]`).first().boundingBox()
  const vp = p.viewportSize()
  if (!b) return B.pic(p, name)
  const x = Math.max(0, b.x), y = Math.max(0, b.y)
  return B.pic(p, name, { clip: { x, y, width: Math.max(50, Math.min(vp.width - x, b.width)), height: Math.min(h, vp.height - y) } })
}

/* every visible puck of X on a day, as PAINTED (computed outline / box-shadow) */
export async function paintAll(p, surf, di, id = X) {
  return p.evaluate(([s, i, who]) => [...document.querySelectorAll(`${s} .day[data-day="${i}"] .puck[data-person="${who}"]`)].filter(x => x.offsetParent !== null).map(e => {
    const cs = getComputedStyle(e)
    return { os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, bs: cs.boxShadow, chip: (e.querySelector('.lchip') || {}).innerText || '' }
  }), [surf, di, id])
}
export const solidRing = a => a.length > 0 && a.every(x => (x.os === 'solid' && x.ow !== '0px') || (x.bs && x.bs !== 'none')) && a.every(x => x.os !== 'dashed')
export const dottedRing = a => a.length > 0 && a.every(x => x.os === 'dotted')
export const dashedRing = a => a.length > 0 && a.some(x => x.os === 'dashed')
export const pn = a => a.length ? a.map(x => (x.os === 'none' ? (x.bs && x.bs !== 'none' ? 'shadow' : 'no-ring') : x.os) + (x.chip ? ' ' + x.chip : '')).join(', ') : '(no puck)'
import { readdirSync, unlinkSync } from 'node:fs'
export function cleanPics(tokens) {
  const dir = process.env.HP_SHOTS; if (!dir) return
  try { for (const f of readdirSync(dir)) if (f.startsWith(B.TAG + '-') && tokens.some(t => f.includes('-' + t))) unlinkSync(dir + '/' + f) } catch {}
}
/* shut a day's warning list (an open list lights the crew of a warning with the focus ring, which hides the dotted ring) */
export async function closeList(p, surf, di) {
  const st = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
  if (st) { await p.locator(`${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await sleep(350) }
  return st
}
/* Insights on desktop AND phone (the app's own door: the button, or the phone's menu) — what it says about conflicts */
export async function insx(p, name) {
  await B.toEdit(p)
  let r
  if (B.PHONE) {
    /* the phone's door since D558: the schedule page's ... menu, one item, Insights */
    await p.locator('#editSchedMore').click(); await sleep(300)
    await p.locator('#editSchedMoreInsights').click(); await sleep(800)
    r = await K.readIns(p)
    r.how = 'phone ... menu > Insights'
    r.shot = await B.pic(p, name)
    await p.evaluate(() => { const rows = document.querySelectorAll('#insightBody .irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await sleep(250)
    r.shot2 = await B.pic(p, name + '-byday')
    await K.closeIns(p)
  } else r = await K.look(p, name, { keep: false, foot: true })
  if (r.none || r.openErr) return { byType: [], byDay: [], tile: '', err: r.how, shot: r.shot }
  return { byType: K.sec(r, 'Conflicts'), byDay: K.sec(r, 'By day'), tile: (r.tiles[3] ? r.tiles[3].n + ' ' + r.tiles[3].l : ''), tiles: r.tiles.map(t => t.n + ' ' + t.l), how: r.how, shot: r.shot, shot2: r.shot2 }
}

export async function traceRows(p, surf, di) {
  return p.evaluate(([s, i]) => [...document.querySelectorAll(`${s} .day[data-day="${i}"] .dwtrace .witem`)].map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), cls: e.className })), [surf, di])
}

/* one day, as a person reads it: X's pucks as painted (list shut), the day's bar and lines, the "Breaks <day>" lines */
export async function readDay(p, tag, di, { surf = '#eWeek', pics = true, id = X } = {}) {
  if (surf === '#eWeek') { await W.boardOff(p).catch(() => {}); await B.toEdit(p) } else if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  await W.showDay(p, di, surf)
  await closeList(p, surf, di)
  const pk = await B.dayPucks(p, surf, di, id)
  const paint = await paintAll(p, surf, di, id)
  const out = { pk, paint, pics: [] }
  if (pics) out.pics.push(await B.puckPic(p, surf, di, id, tag + '-puck'))
  await B.openList(p, surf, di)
  const list = await B.readList(p, surf, di)
  const csn = await B.csOf(p, id)
  out.bar = list.bar
  out.lines = (list.lines || []).filter(x => /Crew rest|Tight turn/i.test(x.text) && x.text.includes(csn))
  out.trace = (await traceRows(p, surf, di)).filter(x => x.text.includes(csn))
  out.held = await xwFull(p, di, id)
  if (pics) out.pics.push(await picEl(p, `${surf} .day[data-day="${di}"] [data-dwbox="${di}"]`, tag + '-list', { pad: 8, maxH: 700 }))
  out.head = await B.head(p, di).catch(() => null)
  await closeList(p, surf, di)
  return out
}
export const dsays = d => `held [${d.held.map(x => `${x.sev}/${x.code}${x.off ? '/HIDDEN' : ''}: ${x.msg.slice(0, 110)}`).join(' ; ') || 'none'}] · bar "${d.bar}" · his lines ${JSON.stringify(d.lines.map(x => (x.struck ? '[STRUCK] ' : '') + x.text.slice(0, 110)))} · "Breaks" lines ${JSON.stringify(d.trace.map(x => x.text.slice(0, 120)))} · pucks [${B.pk(d.pk)}] painted [${pn(d.paint)}]`
/* go to another week through the week chips ("Jul 13", "Jul 20" …) — the app's own control */
export async function weekTo(p, label) {
  await W.boardOff(p).catch(() => {}); await B.toEdit(p)
  const b = p.locator('[data-wk]:visible', { hasText: label }).first()
  if (!(await b.count())) return 'no chip ' + label
  await b.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await b.click(); await sleep(900)
  return await p.evaluate(() => window.CURWEEK)
}
