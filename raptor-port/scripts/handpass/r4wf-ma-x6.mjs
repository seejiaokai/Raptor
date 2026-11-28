// r4wf-ma-x6 — merge walk, walker A, X6: his puck armed on the held row, the caret then moved to another section, then
// a name. Shared leave Ranger + Hex 08:00–17:00. Ranger's End 1000, tap his Remark box; tap his puck; tap a Ground
// Programme remark box; picture; tap Outlaw on the crew list.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit node scripts/handpass/r4wf-ma-x6.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-x6 v1', A.TAG, 'bundle', A.EXPECT_BUNDLE)
const ID = 'X6', steps = [], pics = []
let p, ids
/* the arm strip, and each watched puck's classes on the Unavailable rows */
const armRead = () => p.evaluate(() => ({
  strip: [...document.querySelectorAll('.ros-arm')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()),
  pucks: [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].map(r => `${r.getAttribute('data-inprow')}: ` + [...r.querySelectorAll('.seat [data-person]')].map(e => `${e.querySelector('.nm')?.textContent.trim()} [${e.className}] seat[${e.closest('.seat')?.className}]`).join(' ')),
  drawer: !!document.querySelector('#sbRoster') && document.querySelector('#sbRoster').getBoundingClientRect().height > 0,
}))
const rd = async (label, extra = {}) => { const r = { ...(await A.read(p, label, ids)), arm: await armRead(), note: await A.note(p), ...extra }; steps.push(r); console.log('  arm', J(r.arm)); return r }
try {
  const w = await A.world(); p = w.page
  const outlaw = await A.idOf(p, 'Outlaw'); A.NAMES[outlaw] = 'Outlaw'; ids = ['bane', 'rocky', outlaw]
  await A.fixture(w, [L.RANGER, L.HEX], { from: '08:00', to: '17:00' })
  await A.openBoard(w)
  await rd('filed')
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'end'), '1000', null, 'r-end-tap')
  await A.pressAt(w, await A.boxSel(p, 'Ranger', 'rmks'), 'r-rmks-tap')
  await rd('Ranger End 1000, his Remark box tapped')
  const row = await A.rowSel(p, 'Ranger')
  /* his puck tapped at its measured middle (a locator tap timed out here: the puck never counted as stable) */
  const pk = p.locator(`${row} .seat [data-person="bane"]`).first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  const pb = await pk.boundingBox()
  const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-person]')?.getAttribute('data-person') || '') + ' ' + e.tagName + '.' + e.className : 'none' }, [pb.x + pb.width / 2, pb.y + pb.height / 2])
  if (w.tap) await p.touchscreen.tap(pb.x + pb.width / 2, pb.y + pb.height / 2); else await p.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2)
  if (w.tap) await p.screenshot({ path: `${L.OUT}/x6-puck-lift.png`, scale: 'css' })
  await sleep(700)
  await rd('Ranger\'s puck tapped', { under })
  pics.push(await A.pic(w, 'X6-1-armed', ['body']))
  const g = await A.groundRmks(p)
  /* is the Ground box reachable with the crew list open? (elementFromPoint at its middle) */
  await p.locator(g).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  const gHit = await p.evaluate(s => { const e = document.querySelector(s), r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e ? 'the box' : (h ? (h.closest('[id]')?.id || '') + ' ' + h.tagName + '.' + h.className : 'none') }, g)
  if (gHit !== 'the box') {
    pics.push(await A.pic(w, 'X6-2-ground-box-covered', ['body']))
    throw new Error(`COVERED: the Ground Programme remark box lies under "${gHit}" while the puck is armed — it cannot be tapped`)
  }
  await A.tapBox(w, g, 'x6-ground')
  await rd(`Ground Programme remark box tapped (${g.match(/"(.+)"/)[1]})`)
  pics.push(await A.pic(w, 'X6-2-after-ground-tap', ['body']))
  pics.push(await A.pic(w, 'X6-2b-unav-after-ground-tap'))
  const armed = steps.at(-1).arm.strip.length > 0
  const tgt = p.locator(`#sbRoster .rpuck[data-person="${outlaw}"]`).filter({ visible: true }).first()
  let said = null
  if (await tgt.count()) {
    await tgt.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
    const bb = await tgt.boundingBox()
    if (w.tap) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
    said = await L.catchToast(p, /./, 3000); await L.releaseToast(p); await sleep(600)
    await rd('Outlaw tapped on the crew list', { said })
  } else await rd('Outlaw not shown on any crew list (the drawer closed)')
  pics.push(await A.pic(w, 'X6-3-after-outlaw'))
  await A.away(w); await rd('blank tapped')
  pics.push(await A.pic(w, 'X6-4-caret-left'))
  const s = steps.at(-1).store
  const hexIntact = s.filter(x => /^LL Hex Jul 15 480-1020 ""/.test(x)).length === 1
  const hexReplaced = !s.some(x => /^LL Hex /.test(x)) || s.some(x => /Outlaw/.test(x) && / 480-1020 /.test(x))
  const ringOnHex = steps.slice(-4).some(r => r.arm.pucks.some(x => /Hex \[[^\]]*(arm|pick|sel|ring)/i.test(x)))
  const outlawOnRanger = s.filter(x => /^LL Outlaw Jul 15 480-600/.test(x)).length === 1 && !s.some(x => /Ranger/.test(x))
  const v = hexReplaced || ringOnHex ? 'FAIL' : !armed ? 'RECORD (the Ground tap put the arm down)' : outlawOnRanger && hexIntact ? 'PASS' : 'RECORD'
  A.res(ID, v, { armedAfterGroundTap: armed, said, hexIntact, hexReplaced, ringOnHex, outlawOnRanger, final: s, steps }, pics)
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin('x6')
