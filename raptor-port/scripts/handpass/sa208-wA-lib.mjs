// sa208-wA-lib — walker A's helpers for the chat 208 walk (his answers to the SANS warning-lines questions, D2753–D2759),
// 27 Nov 26. Built on chat 207's crew-column helpers (scc-w1B-lib) and chat 203's warning-list readers (swl-w1A-lib),
// imported, never edited; their folders set by sa208-wA-env first (||=). window.* is only READ here (and window.go, the
// recipes' own page switch). Every staging step is the app's own controls. Brief:
// docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md.
import './sa208-wA-env.mjs'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
export const B = await import('./scc-w1B-lib.mjs')
export const Y = await import('./swl-w1A-lib.mjs')
export const { L, W5, T } = B
export const { J, sleep } = B
export const OUT = L.OUT
mkdirSync(path.join(OUT, 'now'), { recursive: true })
export const RAW = 'D:/raptor-work/c208/A'
mkdirSync(RAW, { recursive: true })
export const ID = { Zenith: 'vinci', Bolt: 'yeti', Rebel: 'romeo', Jester: 'ipman', Kraken: 'krait', Marlin: 'cards', Otter: 'wrangler', Pixel: 'badger', Scribe: 'waldo', Tally: 'nick', Zulu: 'bullet', Ranger: 'bane', Hex: 'rocky' }
export const CS = Object.fromEntries(Object.entries(ID).map(([k, v]) => [v, k]))
export const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
export const clean = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()

/* the words the rulings give (D2753, D2754, D2759) */
export const NFW = 'SANS — no availability filed for today'
export const OFFW = (offered, ev) => `SANS — offered ${offered} only, not ${ev}`
export const HALF = h => `SANS — available ${h} only`        // 'AM' | 'PM' | '08:00–10:00'
export const note = (cs, w) => `${cs} — ${w}`
export const LNF = (cs, tail) => `${cs} — SANS: no availability filed for today. Planned on ${tail}`
export const LOFF = (cs, offered, tail) => `${cs} — SANS: offered ${offered} only today. Planned on ${tail}`
export const LHRS = (cs, a, b, tail) => `${cs} — SANS: available ${a}–${b} only. Planned on ${tail}`

/* each assertion recorded; a step that cannot stop the rest of its scenario */
export const chk = (W, id, what, ok, nt, pic) => W.rec(id, what, !!ok, nt, pic)
export const rec = (W, id, what, nt, pic) => W.rec(id, what, 'REC', nt, pic)
export const nw = (W, id, what, nt, pic) => W.rec(id, what, 'NW', nt, pic)
export async function step(W, id, fn) { try { await fn() } catch (e) { nw(W, id, 'step stopped by the script', String(e && e.message || e).split('\n')[0].slice(0, 300), await W.pic(W.p, id.replace(/\W+/g, '-') + '-stopped').catch(() => '')) } }
export const pics = (...a) => a.flat().filter(Boolean).join(', ')

/* a picture taken at once (the note's first frame), both sizes */
export async function nowPic(p, W, tag) {
  const f = path.join(OUT, 'now', `${W.scn}-${tag}-now-${W.sz.name}.png`)
  await p.screenshot({ path: f }).catch(() => {})
  return 'now/' + path.basename(f)
}
/* the note's box: in the screen, its words whole, clear of the top bar */
export const noteGeom = p => p.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return { none: true }
  const r = t.getBoundingClientRect(), cs = getComputedStyle(t)
  const bar = [...document.querySelectorAll('#topbar, .topbar, header, #appbar, .appbar, #sbTop, .sb-top, .sbbar')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top < 5 }).map(e => e.getBoundingClientRect().bottom)
  const barB = bar.length ? Math.max(...bar) : 0
  return { text: (t.textContent || '').replace(/\s+/g, ' ').trim(), op: +cs.opacity, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, inScreen: r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5, whole: t.scrollWidth <= t.clientWidth + 1 && t.scrollHeight <= t.clientHeight + 1, barBottom: Math.round(barB), underBar: r.top < barB - 0.5 }
})
export const geomSay = g => g.none ? 'no note box' : `"${g.text}" box ${g.l}–${g.r} × ${g.t}–${g.b} of ${g.vw}×${g.vh}, ${g.inScreen ? 'in the screen' : 'OUT OF THE SCREEN'}, ${g.whole ? 'words whole' : 'WORDS CUT'}, top bar ends ${g.barBottom}${g.underBar ? ' — UNDER THE TOP BAR' : ''}, opacity ${g.op}`

/* + Wave → Flying wave with times; a sim row; both asserted */
export async function mkLine(p, W, di, cs, to = '', ld = '') {
  await L.openBoard(p, W, di); await W5.boardDrawer(p, W, false)  /* the phone's crew drawer covers the board's boxes (final run, phone A13) */
  const l = await Y.addLine(p, W, di, { cs, to, ld })
  Y.need(W, `set.line.${di}.${cs}`, `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][di]}: + Wave → Flying wave "${cs}" ${to || '(no T/O)'}–${ld || '(no landing)'}`, l.wi >= 0 && l.f.cs === cs && (l.f.to || '') === to, J(l))
  return l.wi
}
export async function mkSim(p, W, di, kind, label, str = '', end = '') {
  await L.openBoard(p, W, di); await W5.boardDrawer(p, W, false)
  const s = await Y.addSimRow(p, W, di, kind, label, str, end)
  Y.need(W, `set.sim.${di}.${kind}.${label}`, `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][di]}: an ${kind.toUpperCase()} row "${label}" ${str || '(no start)'}–${end || '(no end)'}`, s.ri >= 0 && s.r && (s.r.label || '') === label && (s.r.str || '') === str && (s.r.end || '') === end, J(s.r))
  return s.ri
}
export const seat = (di, wi, s = 'p', ai = 0) => `[data-slot="${di}.${wi}.0.${ai}.${s}"]`
export const sim = (di, kind, ri, s = 'p') => `[data-slot="s:${di}.${kind}.${ri}.${s}"]`
export const key = sel => /data-(?:slot|fill)="([^"]+)"/.exec(sel)[1]

/* a man filed on the SANS tab by Saber ("+ Commitment"); asserted */
export async function file(p, W, iso, id, kinds, span, tag) {
  const f = await B.fileS(p, W, iso, id, kinds, span)
  Y.need(W, 'set.file.' + tag, `Saber files on the SANS tab for ${CS[id]} on ${iso}: ${kinds.join('+')} ${Array.isArray(span) ? span.join('–') : span || 'all day'}`, !!f.iid, f.iid ? J(f.made) : f.refused)
  return f.iid
}

/* a place pressed on the board (left armed), the SANS section read, the man's row */
export async function reason(p, W, di, sel, id, tag) {
  const a = await B.arm(p, W, 'B', di, sel, { now: true, tag })
  if (!a.armed) return { armed: null, a }
  const s = await B.readSec(p, 'B')
  const r = B.rowOf(s, id) || null
  const pic = await B.secPic(p, W, 'B', tag + '-reason').catch(() => '')
  return { armed: a.armed, s, r, pic: pics(pic, a.now) }
}
/* a man's crew-list name pressed with a place armed: the note's first frame, every note raised, where he landed */
export async function pick(p, W, di, sel, id, tag) {
  await L.hideToast(p).catch(() => {})
  await Y.noteWatch(p)
  await B.showList(p, W, 'B')
  const pk = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first()
  if (!(await pk.count())) return { seen: [], why: 'his name is not in the crew list' }
  await pk.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) await pk.tap(); else await pk.click()
  await sleep(40)
  const first = await nowPic(p, W, tag + '-note')
  const g = await noteGeom(p)
  await sleep(700)
  const seen = await Y.notesSeen(p)
  const crop = await B.crop(p, W, ['#toastEl'], tag + '-toast', 14).catch(() => '')
  await B.showList(p, W, 'B', false)
  const holds = await at(p, sel)
  return { seen, first, g, crop, holds, placed: String(holds).includes(id) }
}
/* arm + read + pick, one call */
export async function plant(p, W, di, sel, id, tag) {
  const r = await reason(p, W, di, sel, id, tag)
  if (!r.armed) return { ...r, seen: [], placed: false }
  const k = await pick(p, W, di, sel, id, tag)
  return { ...r, ...k, pic: pics(r.pic, k.first, k.crop) }
}
export const rsay = r => r ? B.rowSay(r) + ` · title "${r.title}"` : 'his row not in the SANS section'

/* the board's warning panel: his SANS lines, every line, the head; a crop of the panel */
export async function lines(p, W, di, cs, tag) {
  await W5.boardDrawer(p, W, false)
  const b = await Y.boardList(p, W, di)
  const pic = tag ? await Y.clipOf(p, W, '#schedBoard .sb-warn', tag + '-list', 10) : ''
  const all = b.lines || []
  const his = all.filter(x => x.text.startsWith(cs + ' ') || x.text.startsWith(cs + ',') || x.text.includes(', ' + cs + ' '))
  return { head: b.head, all, his, sans: his.filter(x => /SANS/.test(x.text)), pic, say: `head "${b.head}" · ${cs}'s lines: ${his.map(x => `${x.hid ? '[HIDDEN] ' : ''}[${x.sev}] "${x.text}"`).join(' | ') || 'none'}` }
}
export async function hide(p, W, di, ix, tag) { return Y.boardLineBtn(p, W, di, ix, tag || 'woff') }

/* a man's crew-list name dragged by a desktop mouse onto a place on the board; the drag hint read while held */
export async function dragIn(p, W, di, sel, id, tag) {
  await B.openB(p, W, di); await B.unarm(p, W, 'B')
  const r = await B.dragHold(p, W, 'B', id, sel, tag, { drop: true, pic: true })
  /* the note pictured as it stands after the drop (dragHold waits 0.7s; the note shows about 4.6s) */
  r.first = await nowPic(p, W, tag + '-drop'); r.g = await noteGeom(p)
  const k = key(sel)
  const holds = await Y.holdsAt(p, k.replace(/\.(x\d+|pax\.\d+)$/, '.+'))
  return { ...r, holds, placed: String(holds).includes(id), pic: pics(r.hpic, r.first) }
}
/* a finger drag over CDP (Chromium's phone): from a locator to a locator; `hold` ms before moving, `steps`, `gap` ms a step
   (a person's ordinary drag: 500 / 14 / 25; a quick flick: 120 / 4 / 12); the ghost's words read before the lift */
export async function finger(p, W, src, dst, tag, o = {}) {
  const hold = o.hold ?? 500, steps = o.steps ?? 14, gap = o.gap ?? 25
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {}); await sleep(200)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })).catch(() => {}); await sleep(200)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) return { ok: false, why: 'no box ' + J({ a: !!a, b: !!b }) }
  await Y.noteWatch(p)
  const c = await p.context().newCDPSession(p)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  const f = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, to = { x: o.centre ? b.x + b.width / 2 : b.x + Math.min(b.width / 2, 30), y: b.y + b.height / 2 }
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(f.x, f.y) }); await sleep(hold)
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(f.x + 2, f.y + 2) }); await sleep(30)
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(f.x + (to.x - f.x) * i / steps, f.y + (to.y - f.y) * i / steps) }); await sleep(gap) }
  await sleep(o.rest ?? 300)
  const hover = await p.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0 }; const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim(); const g = [...document.querySelectorAll('.dragimg, .tdghost')].filter(vis).pop(); const w = g && g.querySelector('.dwhy'); return { ghost: !!g, ghostWords: g ? t(g) : null, why: w ? t(w) : null } })
  const hpic = await nowPic(p, W, tag + '-held')
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
  await sleep(40)
  const first = await nowPic(p, W, tag + '-lift')
  const g = await noteGeom(p)
  await sleep(700)
  return { ok: true, hover, hpic, first, g, seen: await Y.notesSeen(p) }
}
/* a seated man's puck dragged to another place, or onto the crew list (off): desktop mouse, or a CDP finger ('pc') */
export async function moveMan(p, W, di, fromSel, toSel, tag, o = {}) {
  await B.openB(p, W, di); await B.unarm(p, W, 'B')
  const src = p.locator(`#schedBoard ${fromSel} .puck`).first()
  let dst
  /* off: onto the crew list (a desktop's list beside the board; on a phone the drawer stays shut — it covers the seat — and
     the drop goes onto its AIRCREW tab) */
  if (toSel === 'crew') { if (W.isPhone) { await W5.boardDrawer(p, W, false); dst = p.locator('#schedBoard .sb-ros .ros-tab').first() } else dst = p.locator('#schedBoard .rpuck:visible').first() } else { await W5.boardDrawer(p, W, false); dst = p.locator(`#schedBoard ${toSel}:visible`).first() }
  if (!(await src.count()) || !(await dst.count())) return { ok: false, why: `source ${await src.count()} / place ${await dst.count()}` }
  if (toSel !== 'crew') {
    /* a place far down the board: chat 182's dragVia holds the name at the screen's edge (the board's own edge scroll) until
       the place is in view, then carries it on (a desktop mouse, or a CDP finger) — dev2's S5a let go off screen */
    await Y.noteWatch(p)
    const d = await Y.X.dragVia(p, W, src, [dst], tag, 'last', !!W.cdp)
    const first = await nowPic(p, W, tag + '-drop'); const g = await noteGeom(p)
    await sleep(500)
    const h = (d.seen || [])[0] || {}
    return { ok: d.ok, hover: h.hover ? { caps: (h.hover.caps || []).filter(x => /dragimg|tdghost|dwhy/.test(x)) } : null, hpic: h.pic, first, g, seen: await Y.notesSeen(p) }
  }
  if (W.cdp) return finger(p, W, src, dst, tag, o)
  await Y.noteWatch(p)
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {}); await sleep(200)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })).catch(() => {}); await sleep(200)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  if (!a || !b) return { ok: false, why: 'no box' }
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
  await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps: 16 }); await sleep(450)
  const hover = await p.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0 }; const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim(); const g = [...document.querySelectorAll('.dragimg, .tdghost')].filter(vis).pop(); const w = g && g.querySelector('.dwhy'); return { ghost: !!g, ghostWords: g ? t(g) : null, why: w ? t(w) : null } })
  const hpic = await nowPic(p, W, tag + '-held')
  await p.mouse.up(); await sleep(40)
  const first = await nowPic(p, W, tag + '-drop')
  const g = await noteGeom(p)
  await sleep(700)
  return { ok: true, hover, hpic, first, g, seen: await Y.notesSeen(p) }
}
/* a phone drag of a crew-list name onto a place ('pc' only) */
export async function fingerIn(p, W, di, sel, id, tag, o = {}) {
  await B.openB(p, W, di); await B.unarm(p, W, 'B'); await W5.boardDrawer(p, W, true)
  const src = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible .puck`).first()
  const dst = p.locator(`#schedBoard ${sel}:visible`).first()
  const r = await finger(p, W, src, dst, tag, o)
  const k = key(sel)
  const holds = await Y.holdsAt(p, k.replace(/\.(x\d+|pax\.\d+)$/, '.+'))
  return { ...r, holds, placed: String(holds).includes(id) }
}
/* who stands in a place: a programme row (g:di.gi), a duty desk (d:di.bi.ri), or a seat / sim (the borrowed reader) */
export const at = (p, sel) => { const k = key(sel).replace(/\.\+$/, ''); if (/^[gd]:/.test(k)) return p.evaluate(k => { const [di, a, b] = k.slice(2).split('.').map(Number); if (k[0] === 'g') { const r = (window.DAYS[di].ground || [])[a]; return r ? JSON.stringify({ who: r.who, more: r.more }) : 'no row' } const r = ((window.DAYS[di].dutywaves || [])[a] || { rows: [] }).rows[b]; return r ? JSON.stringify(r) : 'no row' }, k); return Y.holdsAt(p, key(sel).replace(/\.(x\d+|pax\.\d+)$/, '.+')) }
export const sansOnly = seen => (seen || []).filter(n => /SANS/.test(n))
export const oneSans = s => (String(s).match(/SANS/g) || []).length === 1 && !/Planned on/.test(s)
export function saveRaw(name, data) { writeFileSync(path.join(RAW, name), JSON.stringify(data, null, 1)) }
