/* S22 — a wave template carries no reporting text: the nominal report, then the typed IN TIME */
import * as D from './ows-D-lib.mjs'
import * as KB from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, ISO } = D
const SAT = 5
const log = (...a) => console.log('>>', ...a)
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
await A.toBoard(p, SAT)
/* the + Wave menu's gear → the Flying waves sheet → "+ New wave template" */
await p.locator(`#schedBoard [data-wvadd="${SAT}"]`).first().click(); await sleep(500)
await p.locator('[data-wvedit]:visible').first().click(); await sleep(800)
await p.locator('#waveTplModal button', { hasText: /New wave template/ }).first().click(); await sleep(800)
const m = p.locator('#waveTplModal')
await m.locator('.tpl-name').first().fill('WT-A'); await m.locator('.tpl-name').first().blur()
await m.locator('.wcs').first().fill('VIPER'); await m.locator('.wcs').first().blur()
const tms = m.locator('.tm'); await tms.nth(0).fill('12:00'); await tms.nth(0).blur(); await tms.nth(1).fill('13:00'); await tms.nth(1).blur(); await sleep(400)
const picTpl = await P(p, 'S22-template-editor')
await m.locator('button', { hasText: /^Done$/ }).first().click(); await sleep(700)
/* apply it from the + Wave menu */
await A.toBoard(p, SAT)
await p.locator(`#schedBoard [data-wvadd="${SAT}"]`).first().click(); await sleep(500)
const tplBtn = p.locator('[data-wmtpl]:visible').first()
log('menu template button', (await tplBtn.count()) ? (await tplBtn.innerText()).replace(/\s+/g, ' ') : '(none)')
await tplBtn.click(); await sleep(900)
const wave = await p.evaluate(i => { const d = window.DAYS[i]; return d.waves.map(w => ({ label: w.label, f: w.formations.map(f => `${f.cs} ${f.to}-${f.ld}`), it: (w.intimes || []).slice() })) }, SAT)
log('Saturday waves:', JSON.stringify(wave))
const gi = wave.length - 1
const seat = await KB.seat(p, SAT, gi, 0, 0, 'p', 'bane')
const picPlaced = await P(p, 'S22-wave-placed')
await D.oilMode(p, true)
const figA = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
await D.oilMode(p, false); await A.closeBoard(p)
const c1 = await D.oilOf(p, 'bane', ISO[SAT], 'S22-before-publish')
log('before publish: figure', JSON.stringify(figA), '| cell', c1.cell.text)
/* issue it: the nominal report */
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const o1 = await D.oilOf(p, 'bane', ISO[SAT], 'S22-orig')
/* now type IN TIME 08:30 through "+ In-time / Rally" and its box */
await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, gi)
const lineBefore = await A.intimes(p, SAT, gi)
await A.setItLine(p, SAT, gi, 0, 'IN TIME 0830')
const lineAfter = await A.intimes(p, SAT, gi)
const d2 = await D.dayState(p, SAT, 'S22-typed')
const o2 = await D.oilOf(p, 'bane', ISO[SAT], 'S22-typed')
log('lines after "+ In-time / Rally"', JSON.stringify(lineBefore), '→', JSON.stringify(lineAfter), '| pending', d2.head.pending, '| paid', o2.cell.text, o2.row.slice(0, 150))
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const o3 = await D.oilOf(p, 'bane', ISO[SAT], 'S22-al')
judge('S22', 'wave template WT-A (VIPER 12:00–13:00) made in the Flying waves sheet, dropped on Saturday from + Wave; Ranger seated; published; then "+ In-time / Rally" typed IN TIME 0830; Publish AL', [
  ['the dropped wave has no in-time line (the template stores none)', wave[gi] && wave[gi].it.length === 0 && /12:00-13:00/.test(wave[gi].f.join(' ')), wave[gi]],
  ['Ranger seated', seat.took, seat.took],
  ['before issue: OIL Earn shows HO (the nominal report), Leave War empty', /HO/.test(figA.join(' ')) && !/HO|FO/.test(c1.cell.text), { figA, cell: c1.cell.text }],
  ['published ORIG: HO, worked 09:00–15:00', pub.head && pub.head.tag === 'ORIG' && o1.letters === 'HO' && /09:00.15:00/.test(o1.row), `${o1.cell.text} | ${o1.row.slice(0, 150)}`],
  ['"+ In-time / Rally" then the typed line IN TIME 08:30', lineAfter.length === 1 && /0?8:?30/.test(lineAfter[0]), { lineBefore, lineAfter }],
  ['typed after issue: the day reads pending and the paid HO holds', pend(d2.head) !== '0' && o2.letters === 'HO' && /09:00.15:00/.test(o2.row), { chip: d2.head.pending, paid: o2.cell.text }],
  ['AL1: FO, worked 08:30–15:00', am.head && /AL\s*1/.test(am.head.tag) && o3.letters === 'FO' && /08:30.15:00/.test(o3.row), `${o3.cell.text} | ${o3.row.slice(0, 150)}`],
], [picTpl, picPlaced, ...o1.pics, ...d2.pics, ...o2.pics, ...o3.pics])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s22', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
