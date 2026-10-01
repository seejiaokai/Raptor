/* walker B — a first look at the ALL AVAIL window on Tuesday (not a walk step) */
import * as B from './wh-b-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W, TUE } = B
const { browser, p, errors } = await B.world()
await B.toEdit(p)
await W.boardOn(p, TUE); await L.sleep(500)
for (const key of ['a:1.1.+', 'g:1.0.+']) {
  const r = await S.handPut(p, key, 'allavail')
  console.log('PUT', key, JSON.stringify(r))
}
console.log('ROWS', JSON.stringify(await p.evaluate(() => ({ a: window.DAYS[1].allhands, g: window.DAYS[1].ground }))).slice(0, 1500))
console.log('CHIPS', JSON.stringify(await A.chips(p, '#schedBoard')))
await B.pic(p, 'probe3-board')
for (let n = 0; n < 2; n++) {
  const w = await A.openChip(p, '#schedBoard', null, n)
  console.log('WIN', n, JSON.stringify({ title: w.title, one: w.one, heads: w.heads, foot: w.foot, from: w.from, n: w.n, flagged: w.flagged, body: w.body }))
  console.log('MEN', JSON.stringify((w.men || []).filter(m => /salsa|casper|wolf/.test(m.id) || m.why)))
  console.log('HTML', await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden); return w ? w.outerHTML.slice(0, 2500) : null }))
  await B.pic(p, 'probe3-win' + n)
  await A.closeWin(p)
}
console.log('ERR', JSON.stringify(errors))
await browser.close()
