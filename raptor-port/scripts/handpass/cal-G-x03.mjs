/* WALKER G — X-03: a shared weekend duty gives each person the right earned leave (OIL) */
import * as G from './cal-G-lib.mjs'
import { writeFileSync } from 'node:fs'
const { L, W, sleep } = G
G.setTag('x03')
const S = process.env.G_SCRATCH
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const IDS = ['bane', 'pump', 'slash'] // Ranger, Piston, Blade
const ALL = [...IDS, 'stiff']          // + Saber, the filer
const fmt = o => Object.entries(o).map(([k, v]) => `${k}: cell="${v.cell}" bal=${v.bal} entries=${JSON.stringify(v.ents)}`).join(' || ')
const shotTracker = async n => G.shot(p, n)

/* ---- opening balances (Sat 18 and Sun 19) ---- */
const o18 = await G.lwOil(p, ALL, '2026-07-18'); const fo1 = await shotTracker('opening-tracker-sat'); await G.closeOilTracker(p)
await sleep(300); const fo1b = await G.shot(p, 'opening-lw-grid-sat')
const o19 = await G.lwOil(p, ALL, '2026-07-19'); await G.closeOilTracker(p)
console.log('OPEN 18', fmt(o18)); console.log('OPEN 19', fmt(o19))

/* ---- file the all-day shared duty on Sat 18 (three people), answer Yes once ---- */
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
let had = await G.iidsNow(p)
await G.openDay(p, '2026-07-18'); await G.plusInput(p)
await G.fillShared(p, { type: 'Duty', ids: IDS, allday: true, remarks: 'X03 all-day duty' })
const fe = await G.shot(p, 'sat-editor-filled')
await p.click('#inpEditSave'); await sleep(900)
const fAsk = await G.shot(p, 'sat-oil-question')
const said = await G.answerOil(p, 'yes')
const madeSat = await G.inputsAfter(p, had)
console.log('SAT MADE', JSON.stringify(madeSat.map(m => ({ p: m.person, acc: m.acc, oil: m.oil, grp: m.grp }))))
const fMonth = await G.shot(p, 'sat-month-after')
// before publishing: does anything move?
const pre = await G.lwOil(p, ALL, '2026-07-18'); const fpre = await shotTracker('sat-tracker-before-publish'); await G.closeOilTracker(p)
console.log('SAT before publish', fmt(pre))

/* ---- the board for Sat: the three are on the programme; sign four, publish ---- */
await L.go(p, 'editsched'); await W.showDay(p, 5)
await p.evaluate(() => window.openScheduler(5)); await p.waitForSelector('#schedBoard'); await sleep(700)
const fold = p.locator('#schedBoard [data-pitog="5"]').first()
if (await fold.count()) { await fold.click(); await sleep(400) }
const pinp = await p.evaluate(() => { const e = document.querySelector('#schedBoard .pinp'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 600) : 'none' })
const fb = await G.shot(p, 'sat-board-personal-inputs')
console.log('PINP', pinp)
const sg = await W.signDay(p, 5); const pub = await W.publishDay(p, 5); await sleep(900)
const hSat = await W.head(p, 5)
const fpub = await G.shot(p, 'sat-board-published')
console.log('SAT published', JSON.stringify(sg), JSON.stringify(pub), JSON.stringify(hSat))
await W.boardOff(p)
const post = await G.lwOil(p, ALL, '2026-07-18'); const fpost = await shotTracker('sat-tracker-after-publish'); await G.closeOilTracker(p)
const fpostg = await G.shot(p, 'sat-lw-grid-after-publish')
console.log('SAT after publish', fmt(post))
await G.reload(p)
const postR = await G.lwOil(p, ALL, '2026-07-18'); const fpostR = await shotTracker('sat-tracker-after-reload'); await G.closeOilTracker(p)
console.log('SAT after reload', fmt(postR))
const d = (a, b, k) => Number(b[k].bal) - Number(a[k].bal)
const satDelta = Object.fromEntries(Object.keys(post).map(k => [k, d(o18, post, k)]))
console.log('SAT deltas', JSON.stringify(satDelta))
const okSat = ['Ranger', 'Piston', 'Blade'].every(k => satDelta[k] === 1 && /FO/.test(post[k].cell)) && satDelta.Saber === 0 && !/FO|HO/.test(post.Saber.cell)
G.row('X-03 (all-day duty, Sat 18 Jul)', 'Opened each man\'s OIL (Leave War cell on 18 Jul + OIL tracker balance) for Ranger, Piston, Blade and the filer Saber; Inputs > 18 Jul > + Input > Several people (the three) > Duty all day > Add > OIL question answered ONCE "Yes - credit FO" > the three read "on programme" on the board > four sign-offs > Publish day; re-read the cell and tracker; reload; re-read',
  `OIL question said: "${said}". Opening (cell/balance): ${fmt(o18)}. Before publishing: ${fmt(pre)}. After publishing: ${fmt(post)}. After reload: ${fmt(postR)}. Deltas ${JSON.stringify(satDelta)}. Board Personal Inputs: ${pinp}. Sat head ${JSON.stringify(hSat)}`,
  okSat ? 'PASS' : 'FAIL', [fo1, fo1b, fe, fAsk, fMonth, fpre, fb, fpub, fpost, fpostg, fpostR], { o18, pre, post, postR, satDelta })
G.saveRows('x03-sat')

/* ---- timed duty on Sun 19 (below the full-day threshold) ---- */
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
had = await G.iidsNow(p)
await G.openDay(p, '2026-07-19'); await G.plusInput(p)
await G.fillShared(p, { type: 'Duty', ids: IDS, allday: false, start: '08:00', end: '10:00', remarks: 'X03 timed duty' })
const fe2 = await G.shot(p, 'sun-editor-filled')
await p.click('#inpEditSave'); await sleep(900)
const fAsk2 = await G.shot(p, 'sun-oil-question')
const said2 = await G.answerOil(p, 'yes')
const madeSun = await G.inputsAfter(p, had)
console.log('SUN MADE', JSON.stringify(madeSun.map(m => ({ p: m.person, acc: m.acc, oil: m.oil }))))
await L.go(p, 'editsched'); await W.showDay(p, 6)
const sg2 = await W.signDay(p, 6); const pub2 = await W.publishDay(p, 6); await sleep(900)
const hSun = await W.head(p, 6)
const fpub2 = await G.shot(p, 'sun-published-head')
const post2 = await G.lwOil(p, ALL, '2026-07-19'); const fpost2 = await shotTracker('sun-tracker-after-publish'); await G.closeOilTracker(p)
const fpost2g = await G.shot(p, 'sun-lw-grid-after-publish')
console.log('SUN after publish', fmt(post2))
await G.reload(p)
const postR2 = await G.lwOil(p, ALL, '2026-07-19'); await G.closeOilTracker(p)
const sunDelta = Object.fromEntries(Object.keys(post2).map(k => [k, Number(post2[k].bal) - Number(o19[k].bal)]))
// Sun 19 opening o19 was read BEFORE the Sat credits landed; Sat credit is +1 for the three, so compare against opening + Sat credit
const sunDelta2 = Object.fromEntries(Object.keys(post2).map(k => [k, Number(post2[k].bal) - Number(post[k].bal)]))
console.log('SUN deltas vs opening', JSON.stringify(sunDelta), 'vs after-Sat', JSON.stringify(sunDelta2))
const okSun = ['Ranger', 'Piston', 'Blade'].every(k => sunDelta2[k] === 0.5 && /HO/.test(post2[k].cell)) && sunDelta2.Saber === 0 && !/FO|HO/.test(post2.Saber.cell)
G.row('X-03 (timed duty 08:00-10:00, Sun 19 Jul)', 'Same three, Sunday 19 Jul, Duty 08:00-10:00, OIL question answered once "Yes - credit HO", published day 6; re-read cells and tracker',
  `OIL question said: "${said2}". Cell/balance after publishing: ${fmt(post2)}. After reload ${fmt(postR2)}. Balance change since Saturday's reading ${JSON.stringify(sunDelta2)}. Sun head ${JSON.stringify(hSun)}`,
  okSun ? 'PASS' : 'FAIL', [fe2, fAsk2, fpub2, fpost2, fpost2g], { o19, post2, postR2, sunDelta2 })
G.saveRows('x03')
await ctx.storageState({ path: S + (G.PHONE ? '/x03-state-ph.json' : '/x03-state.json') })
console.log('errors', JSON.stringify(errors))
await browser.close()
