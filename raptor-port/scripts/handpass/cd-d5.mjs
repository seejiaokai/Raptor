/* D5 — a request filed on a day that is already published.  F27 / C10. */
import { open, board, shot, tap, go } from './lib.mjs'
import { bars, modeSnap, warCells, cellDetail, publishAL, pendingPanel, history, PUB_STATE } from './cd-lib.mjs'
import { fileInputFromBoard } from './fixture.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
say('head at the start:', await headTxt(page))

/* a man who is free today and has a row on the Leave War */
const Q = await page.evaluate(() => {
  const d = window.DAYS[5], busy = new Set()
  d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { busy.add(a.p); busy.add(a.w) })))
  d.dutywaves.forEach(b => b.rows.forEach(r => busy.add(r.id)))
  d.ground.forEach(g => busy.add(g.who)); d.allhands.forEach(a => [].concat(a.who).forEach(x => busy.add(x)))
  const free = Object.keys(window.PEOPLE).filter(id => !busy.has(id))
  return free.slice(0, 8).map(id => ({ id, cs: window.PEOPLE[id].cs }))
})
await go(page, 'leavewar'); await page.waitForTimeout(800)
const on = await page.evaluate(ids => ids.filter(i => document.querySelector(`[data-testid="row-${i}"]`)), Q.map(q => q.id))
const man = Q.find(q => on.includes(q.id))
say('filing for:', JSON.stringify(man))
say('his Saturday before:', JSON.stringify(await warCells(page, [[man.id, SAT]])))
await board(page, di)

const r = await fileInputFromBoard(page, di, { person: man.id, type: 'Training', st: '08:00', en: '17:00', oil: 'yes' })
say('filed:', JSON.stringify(r))
await page.waitForTimeout(800)
say('GROUND rows now:', JSON.stringify(await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`), di)))
say('head after filing:', await headTxt(page))
await shot(page, 'CD-D5-01-filed-on-published-day')
say('his bar on the scheduler board:', JSON.stringify((await bars(page)).filter(b => b.who === man.cs)))
const pp = await pendingPanel(page)
say('PENDING CHIP:', pp.chip)
say('PANEL:', pp.text.slice(0, 600))
await shot(page, 'CD-D5-02-pending-panel')

/* the issued face — the View-only schedule */
await go(page, 'viewsched'); await page.waitForTimeout(900)
const issued = await page.evaluate(([cs]) => {
  const txt = (document.body.innerText || '')
  const has = txt.includes('TRAINING') || txt.includes('Training')
  const pucks = [...document.querySelectorAll('.puck[data-person]')].map(e => ({ p: e.dataset.person, cls: e.className }))
  return { mentionsTraining: has, pucks: pucks.length }
}, [man.cs])
say('the issued (View-only) page:', JSON.stringify(issued))
const onIssued = await page.evaluate(id => {
  const ps = [...document.querySelectorAll(`.puck[data-person="${id}"]`)]
  return ps.map(e => ({ bar: /oilbar-(fo|ho)/.exec(e.className)?.[1] || (/oilbar/.test(e.className) ? 'plain' : null), row: ((e.closest('tr,.arow,.line') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 40) }))
}, man.id)
say('his pucks on the issued page:', JSON.stringify(onIssued))
await shot(page, 'CD-D5-03-issued-face')

say('WAR before the amendment:', JSON.stringify(await warCells(page, [[man.id, SAT]])))
await board(page, di)
const p = await publishAL(page, di)
say('PUBLISH:', p.label, '->', await headTxt(page), '| why:', p.why)
say('WAR after the amendment:', JSON.stringify(await warCells(page, [[man.id, SAT]])))
await shot(page, 'CD-D5-04-war-after-al')
const det = await cellDetail(page, man.id, SAT)
say('THE DAY DETAIL SAYS:', JSON.stringify(det).slice(0, 800))
await shot(page, 'CD-D5-05-day-detail')
await board(page, di)
say('HISTORY:', JSON.stringify((await history(page) || {}).top))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
