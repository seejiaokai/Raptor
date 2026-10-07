/* Walker D — shared helpers for the published-day cases of the [BLANK-TIMES-ABSENCE] walk. On top of rbl-C-lib (and the libraries
   it stands on). Every fixture goes through the app's own controls; window.* is read only (and used to get somewhere). */
import './bta-env.mjs'
import * as C from './rbl-C-lib.mjs'
export * from './rbl-C-lib.mjs'
const { B, L, W, K, ID, CSN, SEAT, TUE, sleep } = C
export { B, L, W, K }

/* ---------- reading ---------- */
const ABSRE = /leave|Downchit|but tasked|but on|clashes|standing SC SPARE|down for|but planned/i
export const absLines = (full) => (full || []).filter(x => x.text.includes(CSN) && ABSRE.test(x.text)).map(x => (x.hid ? '[HIDDEN] ' : '') + x.text.replace(/ ✕| ↺/g, '').slice(0, 170))
export const pkS = ps => ps.length ? ps.map(x => `${x.where}:${x.solid ? 'SOLID-ring' : 'no-ring'}${x.chip ? ' chip ' + x.chip : ''}`).join('; ') : '(no puck drawn)'

/* the top of the day card (version tag, pending chip, sign-off line, the four sign-off selects) with its warning list under it */
export async function headPic(p, surf, di, name) {
  const geo = await p.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (!d) return null
    d.scrollIntoView({ block: 'start', inline: 'nearest' }); window.scrollBy(0, -70)
    const r = d.getBoundingClientRect(), w = d.querySelector('[data-dwbox]'), wr = w ? w.getBoundingClientRect() : null
    return { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 6), w: Math.min(innerWidth - Math.max(0, r.left - 6), r.width + 12), bottom: wr ? wr.bottom : r.top + 300, vh: innerHeight }
  }, [surf, di])
  if (!geo) return B.pic(p, name + '-noday')
  await sleep(250)
  const h = Math.max(120, Math.min(geo.vh - geo.y, geo.bottom - geo.y + 14))
  return B.pic(p, name, { clip: { x: geo.x, y: geo.y, width: geo.w, height: h } })
}
/* the day card on a surface: head (tag, pending chip, sign-off line), the list (opened) and X's pucks as painted */
export async function card(p, surf, di, tag, { pic = true, puck = true } = {}) {
  const sc = `${surf} .day[data-day="${di}"]`
  await W.showDay(p, di, surf)
  await C.closeList(p, di).catch(() => {})
  if (surf === '#vWeek') {
    const open = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : false }, [surf, di])
    if (open) { await p.locator(`${sc} [data-daywarn="${di}"]`).first().click(); await sleep(300) }
  }
  await sleep(250)
  const pk = await C.painted(p, sc, ID)
  await B.openList(p, surf, di)
  const bar = await B.readList(p, surf, di)
  const full = await C.listFull(p, surf, di)
  await sleep(250)
  const hd = await p.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (!d) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const sel = d.querySelector('select.dver')
    return { tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend')), nys: t(d.querySelector('.nysmark')), signed: t(d.querySelector('.signedln')),
      signs: [...d.querySelectorAll('select[data-sign]')].map(x => x.options[x.selectedIndex] ? x.options[x.selectedIndex].text : ''), ver: sel ? sel.options[sel.selectedIndex].text : '', bar: t(d.querySelector('.dprev-bar')) }
  }, [surf, di])
  const shot = pic ? await headPic(p, surf, di, tag) : null
  const pshot = (pic && puck && pk.length) ? await B.puckPic(p, surf, di, ID, tag + '-puck') : null
  return { pk, bar: bar.bar, gone: (bar.gone || []).filter(t => t.includes(CSN)).map(t => t.slice(0, 80)), lines: absLines(full), all: (full || []).length, hd, shot, pshot, ring: pk.some(x => x.solid), chip: pk.map(x => x.chip).filter(Boolean).join(',') }
}
export const sayCard = c => `${c.hd ? `[${c.hd.tag || '-'}${c.hd.pend ? ' · ' + c.hd.pend : ''}${c.hd.nys ? ' · ' + c.hd.nys : ''}${c.hd.signed ? ' · ' + c.hd.signed : ''} · signs ${c.hd.signs.map(s => /name/i.test(s) ? '·' : s).join('|')}]` : '[no head]'} list "${c.bar}" ${JSON.stringify(c.lines)}${c.gone && c.gone.length ? " + goes-away-once-signed " + JSON.stringify(c.gone) : ""} · pucks [${pkS(c.pk)}]`

/* the working copy (Edit Schedule) */
export async function work(p, tag, o = {}) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return card(p, '#eWeek', TUE, tag + '-W', o) }
/* View-only Sched's published face */
export async function face(p, tag, o = {}) {
  await W.boardOff(p).catch(() => {})
  if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  await sleep(500)
  const r = await card(p, '#vWeek', TUE, tag + '-V', o)
  await B.toEdit(p)
  return r
}
/* the 👁 look at one issued version (label regex), read and put back */
export async function lookAt(p, label, tag, o = {}) {
  await W.boardOff(p).catch(() => {})
  await B.toEdit(p)
  const lk = await B.look(p, TUE, label)
  if (lk.err) return { err: lk.err }
  await sleep(300)
  const lf = await B.lookFace(p, TUE)
  const c = await card(p, '#eWeek', TUE, tag + '-L', o)
  const back = await B.backLive(p, TUE)
  await sleep(300)
  return { ...c, label: lk.label, lf, back }
}
export async function versionsOf(p) { const r = await B.versions(p, TUE); await p.keyboard.press('Escape'); await sleep(200); return r.err ? [r.err] : r.vs.map(v => v.label) }

/* publish / amend the day through its sign-off selects and button */
export async function pub(p) { const r = await K.publishOrig(p, TUE); await sleep(500); return r }
export async function amend(p) { const r = await K.publishAL(p, TUE); await sleep(500); return r }
export const pubSay = r => r && r.r ? `${JSON.stringify(r.r)}` : JSON.stringify(r)

/* ---------- fixtures ---------- */
/* S — X seated on a NEW flying line with no times (+ Wave → Flying wave), no callsign */
export async function seatBlank(p, name = null) {
  const m = await K.addFlyWave(p, TUE)
  if (name) await K.ff(p, TUE, m.gi, 0, 'cs', name)
  const s = await K.seat(p, TUE, m.gi, 0, 0, SEAT, ID)
  return { gi: m.gi, took: s.took, msg: s.msg, key: `${TUE}.${m.gi}.0.0.${SEAT}` }
}
/* X off the line (the board's own way: drag the seated puck off) */
export async function unseat(p, key) { await K.boardTo(p, TUE); return K.takeOff(p, TUE, key) }
/* F — file a whole-day absence on Tuesday, through the Inputs page's form */
export async function file(p, type = 'LL', remarks = 'Walker D') { const f = await C.fileInput(p, { type, di: TUE, allday: true, remarks }); return f }
/* lift it: the Inputs page row's ✕ */
export async function lift(p, iid) {
  await B.toEdit(p)
  await W.boardOff(p).catch(() => {})
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  const btn = p.locator('#inRangeBtn')
  if ((await btn.getAttribute('aria-expanded')) !== 'true') { await btn.click(); await sleep(300) }
  await p.locator('#inRangeAll').click().catch(() => {}); await sleep(400)
  const x = p.locator(`#inBody tr[data-iid="${iid}"] .rmx`).first()
  if (!(await x.count())) return 'no ✕ on the row'
  await x.scrollIntoViewIfNeeded(); await x.click(); await sleep(600)
  return (await p.locator(`#inBody tr[data-iid="${iid}"]`).count()) ? 'still listed' : 'gone'
}
export const inputsOf = p => p.evaluate(() => window.INPUTS.map(x => `${x.iid}:${x.person}:${x.type}:${x.date}${x.endDate ? '→' + x.endDate : ''}${x.allday ? ' allday' : ''}`))
export const pendOf = (p) => p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend`); return d ? d.innerText.trim() : '' }, TUE)

/* the top bar's Undo / Redo and a reload (sign in again) */
export async function undo(p) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return W.door(p, 'top', 'undo') }
export async function redo(p) { await W.boardOff(p).catch(() => {}); await B.toEdit(p); return W.door(p, 'top', 'redo') }
export async function reload(p) { await B.reloadAs(p, 'a'); await B.toEdit(p) }
