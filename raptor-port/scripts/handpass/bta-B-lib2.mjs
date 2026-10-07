/* walker B — one whole-day commitment (Training / Meeting / Other …) filed, put on the Ground Programme, then X seated on
   other blank seats; every step reads what the screen said. Used by S04 and S05. */
import * as T from './bta-B-lib.mjs'
const { K, B, C, D, L, W, P6, ID, CSN, TUE, SEAT, sleep, pic } = T

export const groundRowsOf = (p, di, iid) => p.evaluate(([d, i]) => (window.DAYS[d].ground || []).map((g, ri) => ({ ri, prog: g.prog || '', str: g.str || '', end: g.end || '', who: g.who || '', src: g.src || '', info: !!g.info })).filter(g => !i || g.src === i), [di, iid])

/* an SC wave with its first formation's shift start and end CLEARED, X on the first MAIN seat */
export async function scMainBlank(p, di, seatX = true) {
  const sc = await K.addStandby(p, di, 'sc')
  await K.ff(p, di, sc.gi, 0, 'to', ''); await K.ff(p, di, sc.gi, 0, 'ld', '')
  const times = await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `start "${x.to}" end "${x.ld}" B "${x.br || ''}"` }, [di, sc.gi])
  let took = null
  if (seatX) { const s = await K.seat(p, di, sc.gi, 0, 0, SEAT, ID); took = s.took }
  return { gi: sc.gi, label: sc.label, times, took }
}

/* the sequence. cfg: { type, allday, span, from, to, remarks, tag } */
export async function walkInput(p, cfg, t, idp) {
  const { type, tag } = cfg
  const out = {}
  const f = await T.file(p, { type, di: TUE, allday: cfg.allday, span: cfg.span, from: cfg.from, to: cfg.to, remarks: cfg.remarks || tag })
  out.f = f
  out.rec = await T.rec(p, f.iid)
  const before = await T.see(p, `${tag}-0-filed`)
  t.add(`${idp}.0`, `${tag}: ${type} filed for ${CSN} for Tuesday on the Inputs page — form read ${JSON.stringify(f.form)}; stored: ${out.rec}; asked ${f.asked.join(',') || 'nothing'}`, T.says(before), T.silent(before) ? 'RECORDED' : 'RECORDED', before.pics)
  let g = await groundRowsOf(p, TUE, f.iid)
  let acc = 'already on the Ground Programme when filed (acc g), no button needed'
  if (!g.length) { acc = await P6.accBtn(L, p, TUE, f.iid, 'g'); g = await groundRowsOf(p, TUE, f.iid) }
  const own = await T.see(p, `${tag}-1-ground`)
  out.own = own
  const ownWarn = own.held.filter(x => /but tasked|clashes|Training|Meeting/i.test(x))
  t.add(`${idp}.1`, `${tag}: the request on the Ground Programme (${acc}); its row: ${JSON.stringify(g)}`, T.says(own), (g.length === 1 && ownWarn.length === 0) ? 'PASS' : 'FAIL', own.pics)
  return out
}

/* seat X on a further blank seat and read; `name`, `re` = the sentence the oracle expects for that seat family */
export async function onSeat(p, t, idp, tag, name, how, re, ringWhere = null, minSolid = 1, nExpect = 1) {
  const info = await how()
  const s = await T.see(p, `${tag}-${name.replace(/\W+/g, '')}`)
  const hit = s.held.filter(x => re.test(x))
  const ring = ringWhere ? s.pk.filter(x => x.where === ringWhere && x.solid).length >= minSolid : s.pk.some(x => x.solid)
  t.add(idp, `${tag}: ${CSN} put on ${name} (${info})`, T.says(s, 190), hit.length === nExpect && s.lines.some(x => re.test(x)) && ring && !s.nan ? 'PASS' : 'FAIL', s.pics)
  return s
}

/* ---------- several days: a blank flying line (and optionally a blank duty row) with X on it, on each day given ---------- */
export async function seatDays(p, days, { duty = false } = {}) {
  const out = {}
  for (const di of days) {
    const b = await T.blankLine(p, di)
    let d = null
    if (duty) d = await T.blankRow(p, 'duty', di)
    out[di] = { gi: b.gi, took: b.took, duty: d ? d.took : null }
  }
  return out
}
export const DOW = ['Mon 13', 'Tue 14', 'Wed 15', 'Thu 16', 'Fri 17', 'Sat 18', 'Sun 19']
const absRe = /leave|Downchit|medical|but tasked|but planned|clashes|but on BB|standing SC/i
/* one day read: the warnings naming X that talk about being away */
export async function readDay(p, di, tag, { noPics = true, id = T.ID, cs = T.CSN } = {}) {
  const s = await T.see(p, `${tag}-${DOW[di].slice(0, 3)}`, { di, id, cs, noPics })
  return { s, away: s.held.filter(x => absRe.test(x)), all: s.held }
}
export const shortDay = (di, r) => `${DOW[di]}: ${r.away.length ? JSON.stringify(r.away.map(x => x.replace(/^(hard|adv|note)\//, '').slice(0, 120))) : 'silent'}${r.s.ring ? ' [ring]' : ''}${r.s.chips.length ? ' chip ' + [...new Set(r.s.chips)].join('/') : ''}`
