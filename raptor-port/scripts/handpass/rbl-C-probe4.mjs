import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
const chain = e => { const o = []; let x = e; for (let i = 0; i < 5 && x; i++) { o.push((x.tagName + '.' + (x.className || '').toString().replace(/\s+/g, '.')).slice(0, 40)); x = x.parentElement } return o.join(' < ') }
try {
  const { m, t } = await C.baselineB(p)
  const x = await C.extraLine(p, TUE, t.gi)
  const f = await C.fileInput(p, { type: 'SANS Availability', di: TUE, allday: true, sans: [0] })
  console.log('sans filed', JSON.stringify(f), await C.inputRowText(p, f.iid))
  const f2 = await C.fileInput(p, { type: 'Personal', di: TUE, allday: true, remarks: 'dentist' })
  console.log('personal filed', JSON.stringify(f2), await C.inputRowText(p, f2.iid))
  await B.toEdit(p); await W.showDay(p, TUE)
  await B.pic(p, 'p4-week')
  const rep = await p.evaluate(() => {
    const out = []
    const chain = e => { const o = []; let x = e; for (let i = 0; i < 6 && x; i++) { o.push((x.tagName + '.' + (x.className || '').toString().replace(/\s+/g, '.')).slice(0, 44)); x = x.parentElement } return o.join(' < ') }
    for (const e of document.querySelectorAll('#eWeek .day[data-day="1"] .puck[data-person="waldo"]')) out.push((e.offsetParent ? 'VIS ' : 'hid ') + chain(e))
    return out
  })
  console.log(rep.join('\n'))
  await W.boardOn(p, TUE)
  await C.sleep(500)
  await B.pic(p, 'p4-board')
  const rep2 = await p.evaluate(() => {
    const out = []
    const chain = e => { const o = []; let x = e; for (let i = 0; i < 6 && x; i++) { o.push((x.tagName + '.' + (x.className || '').toString().replace(/\s+/g, '.')).slice(0, 44)); x = x.parentElement } return o.join(' < ') }
    for (const e of document.querySelectorAll('#schedBoard .puck[data-person="waldo"], #schedBoard .rpuck[data-person="waldo"]')) out.push((e.offsetParent ? 'VIS ' : 'hid ') + chain(e))
    return out
  })
  console.log(rep2.join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
