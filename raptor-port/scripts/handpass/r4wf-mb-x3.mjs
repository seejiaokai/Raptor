// r4wf-mb-x3 — merge walk, Share B, X3 (Fable's X3): the caret hops between sections mid-flow, three men on one leave
// (Ranger, Hex, Outlaw — LL 08:00–17:00 on Wed 15 Jul; Hex flies wave 1, which the leave overlaps). Hex's Start 0900,
// no Tab, click a Ground Programme remark box (picture at once and after 1s); Hex's End 1100, click the Ground box again;
// Outlaw's Remark "C", click an Overall notes line; click blank.
// EXPECTED (brief): one click puts the caret in the box clicked; the Unavailable rows read what is saved the moment the
// caret is in the other section, order Ranger, Hex, Outlaw; at the end three leaves — Ranger alone on the first, Hex
// 09:00–11:00, Outlaw's own with "C". RECORD Available crew and the warning count at each picture.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/r4wf-mb-x3.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, pic, away, fixture, idOf, NAMES, caretAt, around, heldRows, clickNow, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-x3 v1', BUILD, TAG)
const steps = [], pics = [], probs = []
const GR = '#schedBoard [data-bfld="gr:2.0.rmks"]', DN = '#schedBoard [data-bfld="dn:2.0"]'
try {
  const w = await world(); const p = w.page
  const outlaw = await idOf(p, 'Outlaw'); NAMES[outlaw] = 'Outlaw'
  const ids = ['bane', 'rocky', outlaw]
  const iid = await fixture(w, [L.RANGER, L.HEX, outlaw], { from: '08:00', to: '17:00' })
  await openBoard(w)
  const look = async (label, want) => {
    const r = await read(p, label, ids)
    const o = { ...r, caretAt: await caretAt(p), around: await around(p, ids), held: await heldRows(p) }
    if (want && o.caretAt !== want) probs.push(`${label}: caret at ${o.caretAt}, clicked ${want}`)
    const order = o.screen.map(s => s.split(' ')[1]).join(',')
    o.order = order
    steps.push(o); return o
  }
  await look('filed')
  pics.push(await pic(w, 'x3-0-filed'))
  /* 1. Hex's Start 0900, no Tab */
  const hs = await boxSel(p, 'Hex', 'str')
  await clickNow(w, hs); await sleep(w.tap ? 650 : 250)
  await p.keyboard.press('Control+A'); await p.keyboard.type('0900')
  await look('Hex start 0900 typed, not left', hs.match(/"(.+)"/)[1])
  /* 2. click a Ground Programme remark box: picture at once and after 1s */
  await clickNow(w, GR)
  pics.push(await pic(w, 'x3-1-ground-at-once', ['#sbBoard > [data-secmove$=".unav"]']))
  await look('Ground remark clicked (at once)', 'gr:2.0.rmks')
  await sleep(1000)
  pics.push(await pic(w, 'x3-2-ground-after-1s', ['#sbBoard > [data-secmove$=".unav"]']))
  pics.push(await pic(w, 'x3-2b-ground-section', ['#sbBoard > [data-secmove$=".ground"]']))
  await look('Ground remark clicked (after 1s)', 'gr:2.0.rmks')
  /* 3. Hex's End 1100, click the Ground box again */
  const he = await boxSel(p, 'Hex', 'end')
  await clickNow(w, he); await sleep(w.tap ? 650 : 250)
  await look('Hex end clicked', he.match(/"(.+)"/)[1])
  await p.keyboard.press('Control+A'); await p.keyboard.type('1100')
  await clickNow(w, GR); await sleep(w.tap ? 650 : 400)
  pics.push(await pic(w, 'x3-3-after-hex-end'))
  await look('Hex end 1100, Ground clicked again', 'gr:2.0.rmks')
  /* 4. Outlaw's Remark C, click an Overall notes line */
  const orm = await boxSel(p, 'Outlaw', 'rmks')
  await clickNow(w, orm); await sleep(w.tap ? 650 : 250)
  await look('Outlaw remark clicked', orm.match(/"(.+)"/)[1])
  await p.keyboard.press('Control+A'); await p.keyboard.type('C')
  await clickNow(w, DN); await sleep(w.tap ? 650 : 400)
  pics.push(await pic(w, 'x3-4-after-outlaw-remark'))
  await look('Outlaw remark C, Overall notes clicked', 'dn:2.0')
  /* 5. blank */
  await away(w)
  pics.push(await pic(w, 'x3-5-caret-left'))
  const end = await look('caret left (blank)')
  const s = end.store
  const ranger = s.filter(x => /^LL Ranger Jul 15 480-1020 ""/.test(x))
  const hex = s.filter(x => /^LL Hex Jul 15 540-660 ""/.test(x))
  const out = s.filter(x => /^LL Outlaw Jul 15 480-1020 "C"/.test(x))
  const threeOk = s.length === 3 && ranger.length === 1 && hex.length === 1 && out.length === 1
  /* the order and the agreement once the caret is in another section (the merged build's promise) */
  const inOther = steps.filter(x => /Ground remark clicked|Ground clicked again|Overall notes clicked|blank/.test(x.step))
  const orderOk = inOther.every(x => x.order === 'Ranger,Hex,Outlaw')
  const agreeOk = inOther.every(x => x.agree.bad.length === 0 && x.held.length === 0)
  const verdict = threeOk && orderOk && agreeOk && !probs.length ? 'PASS' : 'FAIL'
  add('X3', verdict, { threeOk, orderOk, agreeOk, caretProblems: probs, steps: steps.map(x => ({ step: x.step, caretAt: x.caretAt, order: x.order, store: x.store, screen: x.screen, agree: x.agree, held: x.held, around: x.around })) }, pics)
} catch (e) { add('X3', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J(steps.map(x => ({ step: x.step, caretAt: x.caretAt, store: x.store, screen: x.screen }))).slice(0, 3000), pics) }
await done('x3')
