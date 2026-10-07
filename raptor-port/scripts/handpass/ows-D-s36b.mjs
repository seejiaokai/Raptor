/* S36 (second part) — SC SPARE: default off, then the SC row's own OIL switch ("part of this row earns"), then amend */
import * as D from './ows-D-lib.mjs'
import * as K from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, SAT, ISO } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const log = (...a) => console.log('>>', ...a)
const sc = await R.addStandby(p, SAT, 'sc')
const m = await K.handPut(p, `${SAT}.${sc.gi}.0.0.p`, 'bane')
const s = await K.handPut(p, `${SAT}.${sc.gi}.0.3.p`, 'stiff')
log('seats', m.took, s.took)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const a1 = await D.oilOf(p, 'bane', ISO[SAT], 'S36b-bane')
const a2 = await D.oilOf(p, 'stiff', ISO[SAT], 'S36b-stiff-default')
judge('S36.sc-spare-default', 'SC wave: Ranger on MAIN (jet 1), Saber on SPARE (jet 4), 07:00–13:00; published', [
  ['seated through the crew list', m.took && s.took, { m: m.took, s: s.took }],
  ['MAIN: HO 07:00–13:00', a1.letters === 'HO' && /07:00.13:00/.test(a1.row), `${a1.cell.text} | ${a1.row.slice(0, 120)}`],
  ['SPARE (default off): nothing', a2.letters !== 'HO' && a2.letters !== 'FO', `${a2.cell.text} | ${a2.row.slice(0, 120)}`],
], [...a1.pics, ...a2.pics])
/* OIL Earn on the working copy: the SC line's own switch */
await A.toBoard(p, SAT)
await D.oilMode(p, true)
const sw = await D.switches(p)
log('switches', JSON.stringify(sw.filter(x => /^SC/.test(x.txt)).map(x => `${x.txt}|${x.item}|${x.cls}|${x.title}`)))
const figsBefore = await p.evaluate(() => ['bane', 'stiff'].map(id => [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => id + ': ' + e.innerText.replace(/\s+/g, ' ').trim() + ' {' + e.className + '} title=' + (e.getAttribute('title') || '').slice(0, 100)).join('')))
log('before opt-in', JSON.stringify(figsBefore))
const pBefore = await P(p, 'S36b-oilmode-before')
/* tap each SC line's switch that says "Part of this row earns" */
const part = sw.filter(x => /^SC/.test(x.txt) && /Part of this row/.test(x.title))
for (const x of part) { const loc = p.locator(`#schedBoard [data-oilitem="${x.item}"]:visible`).first(); await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await loc.click(); await sleep(600); log('tapped', x.item, '→', await D.toast(p)) }
const figsAfter = await p.evaluate(() => ['bane', 'stiff'].map(id => [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => id + ': ' + e.innerText.replace(/\s+/g, ' ').trim() + ' {' + e.className + '}').join('')))
log('after opt-in', JSON.stringify(figsAfter))
const pAfter = await P(p, 'S36b-oilmode-after')
await D.oilMode(p, false)
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const b1 = await D.oilOf(p, 'bane', ISO[SAT], 'S36b-bane-al')
const b2 = await D.oilOf(p, 'stiff', ISO[SAT], 'S36b-stiff-al')
judge('S36.sc-spare-optin', 'OIL Earn → tapped the SC line switch ("Part of this row earns — tap to make all of it earn"); four sign again; Publish AL', [
  ['a switch with the "part of this row" words was offered', part.length > 0, part.map(x => x.title)],
  ['the mode figure for SPARE now HO', /HO/.test(figsAfter[1]), figsAfter[1]],
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['MAIN still HO 07:00–13:00', b1.letters === 'HO' && /07:00.13:00/.test(b1.row), `${b1.cell.text} | ${b1.row.slice(0, 120)}`],
  ['SPARE: HO 07:00–13:00', b2.letters === 'HO' && /07:00.13:00/.test(b2.row), `${b2.cell.text} | ${b2.row.slice(0, 120)}`],
], [pBefore, pAfter, ...b1.pics, ...b2.pics])

/* the Logic page words about standby work (F3 is a known finding of the scenario reader: record the words) */
await L.go(p, 'logic'); await sleep(600)
const words = await p.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('.lgrow, .lg-row, tr, li, .lgitem, .lgrule, p, div')) {
    if (e.children.length > 6) continue
    const t = (e.innerText || '').replace(/\s+/g, ' ').trim()
    if (t.length < 400 && /OIL/.test(t) && /(SC SPARE|AVALON|BB)/.test(t) && /earn/i.test(t)) out.push(t)
  }
  return [...new Set(out)].slice(0, 10)
})
log('Logic OIL words', JSON.stringify(words, null, 1))
await P(p, 'S36b-logic')
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s36b', { errors: D.cleanErr(errors), logicWords: words, pics: D.pics.saved })
await browser.close()
