import * as L from './ibl.mjs'
const b = await L.launch()
const s = await L.session(b, 'side'), { page } = s
const iid = await L.fileIt(s, L.FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
await L.makeHoliday(s, 'later')
await L.openBoard(s, L.FRI_DI)
await L.takeOff(s, L.FRI_DI, iid)
await L.pressAccept(s, L.FRI_DI, iid)
for (let i = 0; i < 10; i++) {
  const r = await page.evaluate(() => {
    const e = document.querySelector('[data-testid="oilconf-cancel"]'); if (!e) return 'no sheet'
    const bb = e.getBoundingClientRect(); const h = document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2)
    const toast = [...document.querySelectorAll('body *')].find(x => /Ground item removed/.test(x.innerText || '') && x.children.length === 0 && x.getBoundingClientRect().width > 0)
    return { btnTop: h === e || e.contains(h), hit: h ? h.tagName + '.' + String(h.className).slice(0, 30) : null, toast: toast ? { op: getComputedStyle(toast.closest('[class*=toast],[id*=toast],[role=status]') || toast).opacity, pe: getComputedStyle(toast.closest('[class*=toast],[id*=toast],[role=status]') || toast).pointerEvents, cls: (toast.closest('[class*=toast],[id*=toast],[role=status]') || toast).className } : null, btn: [bb.left, bb.top, bb.right, bb.bottom].map(Math.round) }
  })
  console.log(i * 500, 'ms', JSON.stringify(r))
  if (i === 0) console.log(await L.shot(s, '14b-side-toast-over-sheet'))
  await page.waitForTimeout(500)
}
await b.close()
