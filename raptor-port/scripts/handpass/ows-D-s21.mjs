/* S21 — a day template carries the reporting text onto another day (the app's own Templates menu) */
import * as D from './ows-D-lib.mjs'
import * as K from './wh-b-lib.mjs'
import * as KB from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, ISO } = D
const SAT = 5, SUN = 6
const log = (...a) => console.log('>>', ...a)
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const s0 = await D.oilOf(p, 'bane', ISO[SAT], 'S21-source')
/* the Templates menu on Saturday's day head: "+ Save this day as a template" */
await A.toWeek(p); await W.showDay(p, SAT)
const tb = p.locator(`#eWeek .day[data-day="${SAT}"] .dhbtn:visible`, { hasText: /Templates/ }).first()
await tb.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await tb.click(); await sleep(500)
const menu1 = await p.evaluate(() => [...document.querySelectorAll('[data-daytplpick],[data-daytplsave],[data-daytpledit]')].filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
log('menu', JSON.stringify(menu1))
await p.locator('[data-daytplsave]:visible').first().click(); await sleep(900)
const picSave = await P(p, 'S21-saved-template')
const modal = await p.evaluate(() => { const m = document.querySelector('.modal:not([hidden]), [role=dialog]:not([hidden])'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 400) : '(no modal)' })
log('after save:', modal)
await p.locator('#daytplModal button', { hasText: /^Done$/ }).first().click(); await sleep(600)
/* Sunday: apply it */
await A.toWeek(p); await W.showDay(p, SUN)
const tb2 = p.locator(`#eWeek .day[data-day="${SUN}"] .dhbtn:visible`, { hasText: /Templates/ }).first()
await tb2.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await tb2.click(); await sleep(500)
const picks = await p.evaluate(() => [...document.querySelectorAll('[data-daytplpick]')].filter(e => e.offsetParent !== null).map(e => ({ id: e.dataset.daytplpick, t: (e.innerText || '').replace(/\s+/g, ' ').trim() })))
log('templates offered on Sunday', JSON.stringify(picks))
await p.locator(`[data-daytplpick="${picks[picks.length - 1].id}"]:visible`).first().click(); await sleep(1200)
const toast = await D.toast(p)
const sundayContent = await p.evaluate(i => { const d = window.DAYS[i]; return { waves: d.waves.map(w => w.formations.map(f => `${f.cs} ${f.to}-${f.ld} p="${(f.aircraft[0] || {}).p || ''}"`)), it: d.waves.map(w => (w.intimes || []).slice()) } }, SUN)
log('Sunday now:', JSON.stringify(sundayContent), '| toast', toast)
const picApplied = await P(p, 'S21-sunday-applied')
/* seat the test person if the template cleared the names */
const gi = sundayContent.waves.length - 1
let seated = sundayContent.waves.flat().some(x => /p="bane"/.test(x))
if (!seated) { const r = await KB.seat(p, SUN, 0, 0, 0, 'p', 'bane'); seated = r.took; await A.closeBoard(p) }
await A.toBoard(p, SUN); await D.oilMode(p, true)
const fig = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
const picMode = await P(p, 'S21-sunday-mode'); await D.oilMode(p, false); await A.closeBoard(p)
const pre = await D.oilOf(p, 'bane', ISO[SUN], 'S21-sunday-before')
const pub2 = await A.publishNew(p, SUN); await A.closeBoard(p)
const o2 = await D.oilOf(p, 'bane', ISO[SUN], 'S21-sunday-published')
const sSrc = await D.oilOf(p, 'bane', ISO[SAT], 'S21-source-after')
log('Sunday published:', o2.cell.text, o2.row.slice(0, 200), '| source', sSrc.cell.text, sSrc.row.slice(0, 200))
judge('S21.template', 'Saturday (IN TIME 08:30, VIPER 12:00–13:00, Ranger) published; saved as a day template through Templates → "+ Save this day as a template"; on Sunday 19 Jul applied it through Templates → the template', [
  ['source published FO 08:30–15:00', s0.letters === 'FO' && /08:30.15:00/.test(s0.row), `${s0.cell.text} | ${s0.row.slice(0, 140)}`],
  ['Sunday received the wave with its IN TIME line 08:30', sundayContent.it.flat().some(x => /0?8:?30/.test(x)) && sundayContent.waves.flat().some(x => /12:00-13:00/.test(x)), sundayContent],
  ['Ranger seated on Sunday' + (seated ? '' : ' (not seated!)'), seated, seated],
  ['before issue: OIL Earn shows FO, Leave War has no Sunday credit', /FO/.test(fig.join(' ')) && !/FO|HO/.test(pre.cell.text), { fig, cell: pre.cell.text }],
  ['Sunday published: FO, worked 08:30–15:00', o2.letters === 'FO' && /08:30.15:00/.test(o2.row), `${o2.cell.text} | ${o2.row.slice(0, 160)}`],
  ['Saturday\'s credit unchanged', sSrc.letters === 'FO' && /08:30.15:00/.test(sSrc.row), `${sSrc.cell.text} | ${sSrc.row.slice(0, 160)}`],
], [picSave, picApplied, picMode, ...pre.pics, ...o2.pics])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s21', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
