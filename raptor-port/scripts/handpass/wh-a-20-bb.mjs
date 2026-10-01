/* [WARN-HIDE-KEPT] walker A — scenario 8's third exempt kind: a BB flying seat. "+ Wave" → BB on the board; a
   medically down WSO picked onto its first front seat and onto a ground item; the seat's own lines hidden. One world. */
import { world, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, judge, row, savePart, pic, guard, warnsOf, addWave, L, W } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const S = '#eWeek', TUE = 1
const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
const nolit = ps => ps.map(x => ({ ...x, out: /dotted|dashed/.test(x.out) ? x.out : '' }))
const at = (ps, re) => ps.filter(x => re.test(x.slot) || re.test(x.where))
await guard('8-bb', 'a BB flying seat', async () => {
  await L.go(p, 'editsched'); await W.boardOn(p, TUE)
  const aw = await addWave(p, TUE, 'BB')
  const seat = await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); const s = g.querySelector('[data-slot$=".p"]'); return s ? s.dataset.slot : null })
  const head = await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); return g.innerText.replace(/\s+/g, ' ').slice(0, 120) })
  const put1 = await handPut(p, seat, 'sufa'); const put2 = await handPut(p, 'g:1.0.+', 'sufa'); await boardOpenFold(p)
  const w0 = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa')); const form = seat.split('.').slice(0, 3).join('.'); const own = w0.filter(w => w.key === seat || w.key === form || w.key.startsWith(form + '.'))
  const reSeat = new RegExp('^' + seat.split('.').slice(0, 2).join('\\.') + '\\.')
  const g0 = await pk(p, '#schedBoard', 'sufa')
  await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
  const f0 = await pic(p, '8b-a-board-bb-flagged')
  for (let i = 0; i < 6; i++) { const b = await readBoard(p); const l = b.lines.find(x => !x.struck && /Grit/.test(x.text) && own.some(w => x.text.includes(w.msg.slice(0, 30)))); if (!l) break; await tapBoardLine(p, TUE, l.ix); await boardOpenFold(p) }
  const g1 = await pk(p, '#schedBoard', 'sufa')
  await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
  const f1 = await pic(p, '8b-b-board-own-hidden')
  await W.boardOff(p); const gw = await pk(p, `${S} .day[data-day="1"]`, 'sufa')
  await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
  const f2 = await pic(p, '8b-c-week-own-hidden')
  const left = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa') && !w.off)
  if (!own.length) { row('8 (BB)', `Scheduler Board, Tuesday: "+ Wave" → BB (${aw}; "${head}"); Grit picked onto its front seat ${seat} (${put1.took ? 'seated' : 'NOT seated: ' + (put1.msg || '')})`, `the BB seat raised no warning of its own for him (he carries: ${w0.map(w => w.code + '@' + w.key).join(' | ')}); Edit Schedule draws the BB copy ${sum(at(gw, reSeat))}, the board ${sum(at(g0, reSeat))}`, 'NOT WALKED (the BB seat raised nothing to hide)', [f0, f2]); return }
  judge('8 (BB — Edit Schedule)', `Scheduler Board, Tuesday: "+ Wave" → BB (${aw}); Grit picked onto its front seat ${seat} (${put1.took ? 'seated' : 'NOT seated'}) and onto the first ground item (${put2.took ? 'added' : 'NOT added'}); ✕ on every line anchored to the BB seat (${own.length}: ${own.map(w => w.code).join()}); board closed`, [
    ['the BB seat raised warnings of its own, and he carries another elsewhere', own.length >= 1 && w0.length > own.length, w0.map(w => w.code + '@' + w.key).join(' | ')],
    ['Edit Schedule: the BB copy is PLAIN once its own are hidden', at(gw, reSeat).length >= 1 && marked(nolit(at(gw, reSeat))).length === 0, sum(at(gw, reSeat))],
    ['Edit Schedule: his ground copy is still ringed red', at(gw, /^g:/).some(x => x.ring === 'red') && left.length >= 1, `${sum(at(gw, /^g:/))} · still showing: ${left.map(w => w.code + '@' + w.key).join()}`],
  ], [f0, f2])
  row('8 (BB — the board)', 'the same moment, read on the board before it was closed', `the board drew the BB copy ${sum(at(g1, reSeat)) || '(not found)'} (before the hides: ${sum(at(g0, reSeat))}); his ground copy ${sum(at(g1, /^g:/))}`, marked(nolit(at(g1, reSeat))).length === 0 ? 'PASS' : 'FAIL (same as finding 1: the board rings an exempt flying seat with his flags from elsewhere)', [f1])
}, () => pic(p, '8b-error'))
console.log('ERRORS', JSON.stringify(errors))
if (errors.length) row('errors (20-bb)', 'the browser\'s error list through this file', errors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('20-bb', { errors })
await browser.close()
