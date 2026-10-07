import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
const dump = async (scope) => p.evaluate(s => {
  const out = []
  const chain = e => { const o = []; let x = e; for (let i = 0; i < 6 && x; i++) { o.push((x.tagName + '.' + (x.className || '').toString().replace(/\s+/g, '.')).slice(0, 44)); x = x.parentElement } return o.join(' < ') }
  for (const e of document.querySelectorAll(`${s} .puck[data-person="waldo"]`)) out.push((e.offsetParent ? 'VIS ' : 'hid ') + chain(e))
  return out
}, scope)
try {
  const { m, t } = await C.baselineB(p)
  for (const di of [MON, TUE]) {
    const f = await C.fileInput(p, { type: 'SANS Availability', di, allday: true, sans: [0] })
    console.log('sans', di, f.iid)
    const f2 = await C.fileInput(p, { type: 'Personal', di, allday: true, remarks: 'dentist' + di })
    console.log('personal', di, f2.iid, await C.inputRowText(p, f2.iid))
  }
  await W.boardOn(p, TUE); await C.sleep(500)
  const heads = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel')].map(e => e.className + ' :: ' + (e.querySelector('.sb-ph, .sb-ptitle, h3, b') || e).innerText.replace(/\s+/g, ' ').slice(0, 60)))
  console.log('PANELS', heads.join('\n'))
  const tog = p.locator('#schedBoard [data-pitog]:visible').first()
  console.log('pitog count', await p.locator('#schedBoard [data-pitog]').count())
  if (await tog.count()) { await tog.click(); await C.sleep(500) }
  await B.pic(p, 'p6-board-tue')
  console.log((await dump('#schedBoard')).join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
