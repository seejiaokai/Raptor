/* walker E — E08 (SC MAIN, B 06:00 typed before publishing) and E14 (the member's view of it) */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, lineOf, scWave, SAT, SATI } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)

const w = await scWave(p, SAT, 0, 'bane')
const held = await setB(p, SAT, w.gi, 0, '06:00', { close: false })
await A.closeBoard(p)
const lineA = await lineOf(p, SAT, w.gi, 0)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const e8 = await look(p, 'bane', SATI, SAT, 'E08')
say('E08', lineA, sum(e8))
judge('E08', 'Saturday SC wave; Ranger first MAIN row AM; B 06:00 typed BEFORE publishing; four sign-offs, Publish', [
  ['seated + B typed', w.took === true && held.stored === '06:00', lineA],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War FO', e8.cell === 'FO', e8.cellText],
  ['tracker worked 06:00–13:00', e8.times.join(',') === '06:00–13:00', e8.times],
  ['tracker +1', e8.bal === '1' || /\+1\b/.test(e8.rowTxt), { bal: e8.bal, row: e8.rowTxt.slice(0, 140) }],
], e8.pics)

/* ---------- E14: the member, in place ---------- */
await p.evaluate(() => window.raptorRole('member')); await sleep(600)
await L.go(p, 'viewsched'); await sleep(600); await W.showDay(p, SAT, '#vWeek')
const mv = await p.evaluate(i => {
  const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
  const vis = e => e.offsetParent !== null
  const pk = [...d.querySelectorAll('[data-person="bane"]')].filter(vis)
  const ctl = [...d.querySelectorAll('input, textarea, select, [contenteditable="true"], [data-beak], [data-alpub], [data-unpub], [data-bfld], [data-txt]')].filter(vis).map(e => (e.tagName + ' ' + (e.dataset.txt || e.dataset.bfld || e.dataset.beak || e.dataset.alpub || e.dataset.unpub || '') + ' cls=' + String(e.className).slice(0, 40) + ' attrs=' + [...e.attributes].map(a => a.name).filter(n => /^data-/.test(n)).join(',') + (e.tagName === 'SELECT' ? ' options=' + [...e.options].map(o => o.text).join('/') : '')))
  return { tag: (d.querySelector('.verchip') || {}).innerText || '', pucks: pk.map(e => (e.className.match(/oilbar-(fo|ho)/) || ['none'])[0]), sc: (d.innerText || '').replace(/\s+/g, ' ').slice(0, 400), ctl, page: window.CURPAGE }
}, SAT)
const pM = await P(p, 'E14-member-viewsched')
say('E14', JSON.stringify(mv))
/* try to type into the SC line's B on the view-only page, if any box is there */
let typed = 'no box to type into'
const cand = p.locator('#vWeek .day[data-day="5"] [data-txt$=".br"]:visible, #vWeek .day[data-day="5"] [data-bfld$=".br"]:visible').first()
if (await cand.count()) { await cand.click().catch(() => {}); await p.keyboard.type('0500').catch(() => {}); await p.keyboard.press('Tab'); await sleep(400); typed = 'typed 0500 into a B box' }
const after = await p.evaluate(i => window.DAYS[i].waves.map(w => w.formations.map(f => f.br)), SAT)
/* the Leave War as the member */
await A.lwOpenMonth(p, 'JUL')
const cellM = await A.lwCellOf(p, 'bane', SATI)
const pL = await P(p, 'E14-member-leavewar')
judge('E14', 'member (role switched in place): View-only Sched Saturday', [
  ['the published SC line is shown with Ranger\'s puck', !!mv && mv.pucks.length > 0, mv && mv.pucks],
  ['puck wears the green edge FO', !!mv && mv.pucks.some(x => /oilbar-fo/.test(x)), mv && mv.pucks],
  ['no control of his changes the B / OIL (no publish / unpublish / editable box; a version picker is view-only)', !!mv && mv.ctl.every(x => /SELECT/.test(x) && /options=/.test(x) && !/data-sign|beak|alpub/.test(x)), mv && mv.ctl],
  ['the B is unchanged (06:00)', after[w.gi][0] === '06:00', { after, typed }],
  ['Leave War cell FO for the member too', cellM !== 'NO CELL DRAWN' && /FO/.test(cellM.text), cellM],
], [pM, pL])
const errs = E.cleanErr(errors)
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s2', { errors: errs, pics: E.pics.saved })
await browser.close()
