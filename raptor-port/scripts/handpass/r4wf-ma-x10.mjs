// r4wf-ma-x10 — merge walk, walker A, X10: the long word on his row. Shared leave Ranger + Hex 08:00–17:00; Ranger cut
// (End 1000, Tab); 60 letters with no space typed in Ranger's End, Tab (the note measured on its ink); then a Ground
// Programme box tapped (another section), and his row read. SZ=phone (402) or p320 (320 wide, touch).
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=p320 ENG=chromium node scripts/handpass/r4wf-ma-x10.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
L.SIZES.p320 = { viewport: { width: 320, height: 700 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
console.log('r4wf-ma-x10 v1', A.TAG, 'bundle', A.EXPECT_BUNDLE)
const LONG = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567'
const ID = 'X10', steps = [], pics = []
let p
const inkOf = () => p.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = document.createRange(); r.selectNodeContents(t); const rs = [...r.getClientRects()].filter(x => x.width > 0)
  const box = t.getBoundingClientRect(); const cs = getComputedStyle(t)
  const inR = box.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth)
  const inL = box.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth)
  return { box: { l: Math.round(box.left), r: Math.round(box.right), w: Math.round(box.width), top: Math.round(box.top), bottom: Math.round(box.bottom) }, innerL: Math.round(inL), innerR: Math.round(inR), inkL: rs.length ? Math.round(Math.min(...rs.map(x => x.left))) : null, inkR: rs.length ? Math.round(Math.max(...rs.map(x => x.right))) : null, lines: new Set(rs.map(x => Math.round(x.top))).size, vw: innerWidth, vh: innerHeight }
})
const rd = async (label, extra = {}) => { const r = { ...(await A.read(p, label)), ...extra }; steps.push(r); return r }
try {
  const w = await A.world(); p = w.page
  await A.fixture(w, [L.RANGER, L.HEX], { from: '08:00', to: '17:00' })
  await A.openBoard(w)
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'end'), '1000', 'Tab', 'r-end-tap')
  await rd('Ranger End 1000, Tab (cut)')
  const end = await A.boxSel(p, 'Ranger', 'end')
  await A.tapBox(w, end, 'r-end-tap2')
  await p.keyboard.press('Control+A'); await p.keyboard.type(LONG); await p.keyboard.press('Tab')
  const said = await L.catchToast(p, /not a time/i, 4000)
  const ink = await inkOf()
  pics.push(await A.pic(w, 'X10-1-note', ['#toastEl']))
  pics.push(await A.pic(w, 'X10-1b-note-whole', ['body']))
  await L.releaseToast(p)
  await rd('60 letters in his End, Tab', { said, ink })
  const g = await A.groundRmks(p); await A.tapBox(w, g, 'x10-ground')
  await rd('a Ground Programme box tapped')
  pics.push(await A.pic(w, 'X10-2-unav-after-ground'))
  const s = steps.at(-1)
  const inside = !!(said && ink && ink.inkR <= ink.innerR + 1 && ink.inkL >= ink.innerL - 1 && ink.box.l >= 0 && ink.box.r <= ink.vw)
  const r = s.screen.find(x => / Ranger /.test(x)), healed = !!r && / 08:00-10:00 /.test(r)
  const hexOk = s.store.filter(x => /^LL Hex Jul 15 480-1020/.test(x)).length === 1 && s.store.filter(x => /^LL Ranger Jul 15 480-600/.test(x)).length === 1
  const inPlace = s.screen.length === 2 && / Ranger /.test(s.screen[0])
  A.res(ID, inside && healed && hexOk && inPlace ? 'PASS' : 'FAIL', { noteInside: inside, said, ink, healedToHisEnd: healed, rangerRow: r, hexOk, rowInPlace: inPlace, screen: s.screen, store: s.store, agree: s.agree }, pics)
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin('x10')
