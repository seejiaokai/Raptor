import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, TUE, sleep } = T
const { browser, p, errors } = await K.fresh()
try {
  await T.blankLine(p, TUE)
  const f = await T.file(p, { type: 'LL', di: TUE, allday: true, remarks: 'Board probe' })
  await K.boardTo(p, TUE); await sleep(600)
  console.log('UNAV', await p.evaluate(() => { const s = document.querySelector('#schedBoard .sec-unav, #schedBoard [class*=unav]'); if (!s) return 'no unav section'; const rows = [...s.querySelectorAll('.puck')].filter(e => e.dataset.person === 'split').map(e => e.closest('.ppl').parentElement); return s.className + ' || ' + (rows[0] ? rows[0].outerHTML.replace(/\s+/g, ' ').slice(0, 1800) : 'no row; text: ' + s.innerText.replace(/\s+/g, ' ').slice(0, 400)) }))
  await T.pic(p, 'probe-board-unav')
} catch (e) { console.log('ERR', e.stack) }
console.log(errors)
await browser.close()
