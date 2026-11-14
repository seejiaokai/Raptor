/* Re-walk helpers (12 Nov 26) — prefix rcf-rw. Env (HP_URL, HP_SHOTS) must be set by the caller BEFORE this is imported. */
import { mkdirSync, writeFileSync } from 'node:fs'
import * as W from './rcf-w2-lib.mjs'
export { W }
export const { L, sleep, check, PASSIF, shot } = W
export const results = W.results

export async function bundle(page) {
  return page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-.*\.js/.test(s)).join(','))
}
/* a flying line on a new wave */
export async function sortie(page, DI, { cs = 'VL', msn = 'BFM', to = '1200', ld = '1300', who = null, rl = null } = {}) {
  const gi = await W.addWave(page, DI, '')
  if (gi < 0) throw new Error('no wave made')
  await W.setF(page, `ff:${DI}.${gi}.0.cs`, cs)
  await W.setF(page, `ff:${DI}.${gi}.0.msn`, msn)
  if (to) await W.setF(page, `ff:${DI}.${gi}.0.to`, to)
  if (ld) await W.setF(page, `ff:${DI}.${gi}.0.ld`, ld)
  let r = null
  if (who) r = await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [who])
  return { gi, put: r }
}
export async function ground(page, DI, { prog = 'BRIEFING', str = '1200', end = '1230', who = null } = {}) {
  const ri = await W.addGround(page, DI)
  if (ri < 0) throw new Error('no ground row made')
  await W.setF(page, `gr:${DI}.${ri}.prog`, prog)
  if (str) await W.setF(page, `gr:${DI}.${ri}.str`, str)
  if (end) await W.setF(page, `gr:${DI}.${ri}.end`, end)
  let r = null
  if (who) r = await L.put(page, `[data-fill="g:${DI}.${ri}.+"]`, [who])
  return { ri, put: r }
}
const ringWord = r => { const c = r.cls.split(' '); return c.includes('hard') ? ' RED' : r.warn ? ' AMBER' : ' plain' }
/* everything a person reads: the board's list (with each line's class), the pucks of one man on the board and on the week */
export async function read(page, DI, id, label) {
  const board = await W.warnList(page)
  const bR = await W.ring(page, id, '#schedBoard')
  const wR = await W.ring(page, id, '#eWeek .day[data-day="' + DI + '"]')
  const sev = c => / hard\b/.test(' ' + c) ? 'RED' : / adv\b/.test(' ' + c) ? 'AMBER' : '?'
  const o = {
    label, head: board.head,
    lines: board.lines.map(l => ({ ix: l.ix, state: l.hid ? 'HID' : 'live', struck: l.struck, btn: l.btn, sev: sev(l.cls), cls: l.cls, text: l.text })),
    boardRings: bR.map(r => `${r.where}${ringWord(r)}`),
    weekRings: wR.map(r => `${r.where}${ringWord(r)}`)
  }
  console.log('READ', JSON.stringify(o))
  return o
}
export const notPub = l => !/not published/.test(l.text)
export const warnCrop = (page, name) => page.locator('#schedBoard .sb-warn').first().screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }).then(() => name + '.png')
export const crop = async (page, sel, name) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await W.sleep(150); await l.screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }); return name + '.png' }
export function finish(extra = {}) {
  writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify({ results: W.results, errors: W.errorsAll, ...extra }, null, 1))
  console.log('ERRORS', JSON.stringify(W.errorsAll.slice(0, 8)))
  console.log('DONE', W.results.filter(r => r.verdict === 'PASS').length + '/' + W.results.length)
}
