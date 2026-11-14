/* pdl-w1-lib v1 — W1's helpers for the published-day / Logic-settings walk (12 Nov 26).
   Set HP_URL / HP_SHOTS BEFORE importing (the drivers read them once). */
import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs'
export const X = await import('../rcf/rcf-w1-lib.mjs')
export const W = await import('../rcf/rcf-w2-lib.mjs')
export const { L, sleep, norm } = X
export const SHOTS = process.env.HP_SHOTS
mkdirSync(SHOTS, { recursive: true })
export const ROWS = []
export function row(id, verdict, saw, pic = '') {
  ROWS.push({ id, verdict, saw, pic })
  const line = `${verdict}  ${id}  ${saw}${pic ? '  [' + pic + ']' : ''}`
  console.log(line)
  appendFileSync(SHOTS + '/rows.txt', line + '\n')
}
export const shotPage = async (page, name) => { await page.screenshot({ path: `${SHOTS}/${name}.png` }); return name + '.png' }

/* a flying line on a NEW wave of day di (the board must be open on di): cs, msn, to, ld, one man in the front seat */
export async function line(w, di, { cs = 'VL', msn = 'BFM', to, ld, who }) {
  const gi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.cs"]`, cs)
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.msn"]`, msn)
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.to"]`, to)
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.ld"]`, ld)
  const s = await X.seatPhoneAware(w, `[data-slot="${di}.${gi}.0.0.p"]`, who)
  const f = await w.page.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return `${f.cs} ${f.msn} to ${f.to} ld ${f.ld} B=${JSON.stringify(f.br)} p=${f.aircraft[0].p}` }, [di, gi])
  return { gi, seat: s, f }
}
/* open the board for day di (works on a phone too) */
export async function openBoard(w, di) { await X.L.board(w.page, di); await sleep(300) }

export async function ringsOf(page, scope) {
  return page.evaluate(([s]) => [...document.querySelectorAll(`${s} .puck[data-person]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster') && !e.closest('#eRoster')).map(e => ({ who: (window.PEOPLE[e.dataset.person] || {}).cs, cls: e.className.replace(/\s+/g, ' ').slice(0, 90) })), [scope])
}
export const restOf = (s) => (s.items || []).filter(t => /rest/i.test(t))
/* a puck's severity word */
export const sevWord = r => / hard\b/.test(' ' + r.cls) ? 'RED' : / adv\b/.test(' ' + r.cls) ? 'AMBER' : / warn\b/.test(' ' + r.cls) ? 'warn' : 'plain'

/* the day's strip + rings on the edit week and on View-only Sched (board closed) */
export async function strips(w, di, id) {
  const page = w.page
  const out = {}
  await W.L.go(page, 'editsched'); await sleep(500)
  out.edit = await X.stripItems(page, '#eWeek', di)
  out.editRings = (await ringsOf(page, '#eWeek .day[data-day="' + di + '"]')).filter(r => r.who === w.CS[id])
  out.editHead = await X.L.head(page, di)
  await W.L.go(page, 'viewsched'); await sleep(500)
  out.view = await X.stripItems(page, '#vWeek', di)
  out.viewRings = (await ringsOf(page, '#vWeek .day[data-day="' + di + '"]')).filter(r => r.who === w.CS[id])
  out.viewHead = await page.evaluate(i => { const s = document.querySelector(`#vWeek .day[data-day="${i}"] .day-head`); return s ? s.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO HEAD' }, di)
  return out
}
export async function boardRead(w, di, id) {
  await openBoard(w, di)
  const wl = await W.warnList(w.page)
  const bw = await X.boardWarn(w.page, w)
  const rings = (await ringsOf(w.page, '#schedBoard')).filter(r => r.who === w.CS[id])
  const hd = await X.L.head(w.page, di)
  return { warnList: wl, boardWarn: bw, rings, head: hd }
}
export function finish(w, extra = {}) {
  writeFileSync(SHOTS + '/results.json', JSON.stringify({ rows: ROWS, errors: w.errors, ...extra }, null, 1))
  console.log('ERRORS', JSON.stringify(w.errors.slice(0, 10)))
}
