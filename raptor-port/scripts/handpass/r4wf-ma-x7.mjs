// r4wf-ma-x7 — merge walk, walker A, X7: Undo / Redo with the caret parked in another section. Shared leave Ranger + Hex
// 08:00–17:00. Cut Ranger (End 1000, Tab); tap a Ground remark box; Undo, Redo, Undo (keeping the caret where it can);
// tap Ranger's Start, 0900, Tab; blank.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit KEEP=tap node scripts/handpass/r4wf-ma-x7.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-x7 v2', A.TAG, 'KEEP', process.env.KEEP || 'tap', 'bundle', A.EXPECT_BUNDLE)
const ID = 'X7', steps = [], pics = [], keeps = []
let p
const order = r => r.screen.map(x => x.split(' ')[1])
const rd = async (label, extra = {}) => { const r = { ...(await A.read(p, label)), note: await A.note(p), ...extra }; steps.push(r); return r }
try {
  const w = await A.world(); p = w.page
  await A.fixture(w, [L.RANGER, L.HEX], { from: '08:00', to: '17:00' })
  await A.openBoard(w)
  await rd('filed')
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'end'), '1000', 'Tab', 'r-end-tap')
  await rd('Ranger End 1000, Tab')
  const g = await A.groundRmks(p); await A.tapBox(w, g, 'x7-ground')
  await rd('Ground remark box tapped')
  pics.push(await A.pic(w, 'X7-0-cut-caret-in-ground'))
  const want = ['two', 'one', 'two', 'one']   // after filed+cut: two leaves; Undo → one; Redo → two; Undo → one
  let i = 0
  for (const [b, lab] of [['#sbUndo', 'Undo'], ['#sbRedo', 'Redo'], ['#sbUndo', 'Undo-2']]) {
    const k = await A.keepPress(w, b, `X7-${lab}`); keeps.push({ lab, ...k })
    await rd(`${lab} pressed`, { keep: k })
    pics.push(await A.pic(w, `X7-${++i}-after-${lab}`))
  }
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'str'), '0900', 'Tab', 'r-str-tap')
  await rd('Ranger Start 0900, Tab')
  await A.away(w); await rd('blank tapped')
  pics.push(await A.pic(w, 'X7-5-caret-left'))
  const per = steps.slice(3).map(r => ({ step: r.step, n: r.store.length, order: order(r), agree: r.agree, hex: r.store.filter(x => /Hex/.test(x)) }))
  const counts = steps.slice(3, 6).map(r => r.store.length)            // after Undo, Redo, Undo (steps 3–5)
  const orderOk = steps.every(r => { const o = order(r); return o.indexOf('Ranger') < o.indexOf('Hex') || !o.includes('Hex') })
  const agreeOk = steps.slice(3, 6).every(r => r.agree.bad.length === 0)
  const hexTimes = steps.every(r => r.store.filter(x => /Hex/.test(x)).every(x => / 480-1020 /.test(x)))
  const fin = steps.at(-1).store
  const endOk = fin.length === 2 && fin.some(x => /^LL Ranger Jul 15 540-1020/.test(x)) && fin.some(x => /^LL Hex Jul 15 480-1020/.test(x))
  const subst = J(counts) === J([1, 2, 1]) && orderOk && agreeOk && hexTimes && endOk
  const kept = keeps.every(k => k.kept)
  A.res(ID, (kept ? '' : 'COULD NOT BE MADE (caret lost at the presses); substance with the caret lost → ') + (subst ? 'PASS' : 'FAIL'), { counts, orderOk, agreeOk, hexTimes, endOk, final: fin, keeps, per, steps }, pics)
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin(`x7-${process.env.KEEP || 'tap'}`)
