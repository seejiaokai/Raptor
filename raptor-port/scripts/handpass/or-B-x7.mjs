import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toWeek, openBoard, boardLines, weekLines } from './or-B-lib2.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
const t3 = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-13', to: '2026-07-15', timed: ['17:00', '18:00'] })
console.log('t3', JSON.stringify(t3))
const fw = await fileInput(p, { type: 'Fly with', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['10:00', '11:00'] })
console.log('fw', JSON.stringify(fw))
const pe = await fileInput(p, { type: 'Personal', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] })
console.log('pe', JSON.stringify(pe))
for (const [n, r, di] of [['t3', t3, 0], ['t3b', t3, 1], ['fw', fw, 3], ['pe', pe, 3]]) {
  const iid = r[0] && r[0].iid; if (!iid) continue
  console.log(n, 'ground idx', await rowIdx(p, di, iid), 'input', JSON.stringify(await inputOf(p, iid)))
  console.log(n, 'unavail', await p.evaluate(([di, iid]) => JSON.stringify((window.DAYS[di].unavail || window.DAYS[di].absent || []).filter(u => u.src === iid || u.iid === iid).length), [di, iid]))
}
await openBoard(p, 3)
console.log('board lines Thu', JSON.stringify(await boardLines(p, 3)))
console.log('board unavail', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.unav .sb-arow, #schedBoard .sb-panel.una .sb-arow')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 100)))))
console.log('panels', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel')].filter(e => e.offsetParent).map(e => e.className))))
console.log('DAYS[3] keys', await p.evaluate(() => Object.keys(window.DAYS[3]).join(',')))
await browser.close()
