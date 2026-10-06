/* Walker E — OIL-WORK-START D606 (an SC shift's typed B). Shared helpers on top of ows-D-lib (which stands on stk-A/B-lib).
   Every fixture goes through the app's own controls; window.* only to GET somewhere and to READ. */
import * as D from './ows-D-lib.mjs'
export * from './ows-D-lib.mjs'
const { A, R, W, L, P, oilOf, dayState, pend, signsOf, sleep, ISO } = D
export const SATI = '2026-07-18', SUNI = '2026-07-19', FRII = '2026-07-17'
export const say = (...a) => console.log('>>', ...a)

/* every "HH:MM–HH:MM" the tracker row prints */
export const times = row => [...(row || '').matchAll(/(\d\d:\d\d)\s*[–-]\s*(\d\d:\d\d)/g)].map(m => m[1] + '–' + m[2])
export const count18 = row => ((row || '').match(/18 Jul/g) || []).length

/* the three places: Leave War cell + tracker row (worked times, balance), and the day itself (tag, pending, sign-offs, To go out) */
export async function look(p, id, iso, di, name, o = {}) {
  const oil = await oilOf(p, id, iso, name)
  const day = await dayState(p, di, name, { list: o.list !== false })
  const L_ = { oil, day, cell: oil.letters, cellText: (oil.cell && oil.cell.text) || String(oil.cell), times: times(oil.row), bal: oil.bal, rowTxt: oil.row,
    tag: day.head && day.head.tag, pend: pend(day.head), pendTxt: day.head && day.head.pending, signs: signsOf(day.head), list: day.list || '', n18: count18(oil.row),
    pics: [...oil.pics, ...day.pics] }
  return L_
}
export const sum = L_ => `cell ${L_.cell} · tracker worked ${L_.times.join(', ') || '(no row)'} bal ${L_.bal} (rows for 18 Jul: ${L_.n18}) · day tag ${L_.tag} · pending "${L_.pendTxt || ''}" · sign-offs ${L_.signs}` + (L_.list ? ` · To go out: "${L_.list.slice(0, 420)}"` : '')

/* the SC wave's B box: type it on the board (committed by leaving the box) */
export async function setB(p, di, gi, fi, v, { close = true } = {}) {
  await A.toBoard(p, di)
  await W.boardText(p, `ff:${di}.${gi}.${fi}.br`, v)
  const held = await readB(p, di, gi, fi)
  if (close) await A.closeBoard(p)
  return held
}
export async function readB(p, di, gi, fi) {
  return p.evaluate(([i, g, f]) => {
    const key = `ff:${i}.${g}.${f}.br`
    const el = [...document.querySelectorAll(`#schedBoard [data-bfld="${key}"]`)].find(e => e.offsetParent !== null)
    return { stored: window.DAYS[i].waves[g].formations[f].br, box: el ? el.value : null, cls: el ? String(el.className) : null, title: el ? el.title : null }
  }, [di, gi, fi])
}
/* the written start / end of a shift line, as stored */
export const lineOf = (p, di, gi, fi) => p.evaluate(([i, g, f]) => { const x = window.DAYS[i].waves[g].formations[f]; return `${x.cs} ${x.msn || ''} ${x.to}-${x.ld} B "${x.br}" rows ${x.aircraft.map(a => (a.role || '') + ':' + (a.p || '-')).join(' ')}` }, [di, gi, fi])
export const toastNow = () => null
export async function toastText(p) { return D.toast(p) }
/* the face of the published day: the man's puck edge */
export const faceOf = (p, di, id) => D.face(p, di, id)
/* an SC wave with the man in the first row of shift AM (rowIx 0 = first MAIN, 2 = first SPARE); returns {gi, took} */
export async function scWave(p, di, rowIx, who = 'bane') {
  const sc = await R.addStandby(p, di, 'sc')
  const s = await R.seat(p, di, sc.gi, 0, rowIx, 'p', who)
  return { gi: sc.gi, took: s.took }
}
export { A, R, W, L, P, oilOf, dayState, pend, signsOf, sleep, ISO }
