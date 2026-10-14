/* W2 N9, N11, N12, N-L, N10, N-R, N17 — the Scheduler Board's notes.  node n9-oil.mjs phone|desk */
import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('n9-oil v1')
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
const T = size
const check = (id, want, got0, pic) => {
  const got = got0 && got0.text && parseFloat(got0.opacity) > 0.5 ? got0 : null
  console.log(`== ${id} [${T}] ${got && got.text === want ? 'PASS' : 'FAIL'}\n   want: ${JSON.stringify(want)}\n   saw : ${got ? JSON.stringify(got.text) + ' opacity ' + got.opacity : 'NO NOTE SHOWING (last text ' + JSON.stringify(got0 && got0.text) + ' opacity ' + (got0 && got0.opacity) + ')'}\n   pic : ${pic}`)
}
const OILB = w.phone ? '#schedBoard [data-oilmode="5"]:visible' : '#sbOil'
const act = async (sel, scroll = true) => {
  const b = p.locator(sel).first()
  if (scroll) await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await clearToast(p)
  await w.press(b)
  return toastShown(p)
}
try {
  await openBoard(w, 5)
  if (!w.phone) {
    /* something to undo OUTSIDE OIL Earn, so the Undo button is live: a note line added with the board's own "+ Note" */
    await w.press('#schedBoard [data-nadd="5"]:visible'); await sleep(600)
    console.log('   Undo enabled before OIL Earn:', await p.locator('#sbUndo').isEnabled())
  }
  /* N9 */
  let t = await act(OILB)
  await sleep(400)
  let pic = await L.pic(w, `n9-${T}-oil-earn-on`)
  check('N9', 'OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning', t, pic)
  if (!w.phone) {
    /* N-L: Undo with nothing changed in OIL Earn */
    t = await act('#sbUndo', false)
    await sleep(400)
    pic = await L.pic(w, `nl-${T}-undo-leaves-oil-earn`)
    check('N-L', 'Left OIL Earn without undoing. The next undo would change the day itself.', t, pic)
    console.log('   oil mode still on?', await p.locator('#schedBoard .daybar.oilon').count())
  } else {
    /* N11, N12 */
    t = await act('#schedBoard [data-oilblank="5"]:visible')
    await sleep(400)
    pic = await L.pic(w, `n11-${T}-day-off`)
    check('N11 off', 'Nothing on this day earns OIL, including anything added later', t, pic)
    /* N12: tap a puck with the day off */
    console.log('   puck count', await p.locator('#schedBoard .puck[data-person]:visible').count(), await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 3).map(e => e.outerHTML.slice(0, 160)).join(' || ')))
    t = await act('#schedBoard .puck[data-person="plasma"]')
    await sleep(400)
    pic = await L.pic(w, `n12-${T}-puck-with-day-off`)
    check('N12 (tap on Fable\'s puck)', 'Nothing on this day earns. Turn that off first.', t, pic)
    /* the same sentence is raised by the item (the row's name) in the older build: read it too, as a record */
    t = await act('#schedBoard [data-oilitem]')
    await sleep(300)
    pic = await L.pic(w, `n12-${T}-item-with-day-off`)
    check('N12 (tap on the item SDO instead, for the record)', 'Nothing on this day earns. Turn that off first.', t, pic)
    t = await act('#schedBoard [data-oilblank="5"]:visible')
    await sleep(400)
    pic = await L.pic(w, `n11-${T}-day-on`)
    check('N11 on', 'This day can earn OIL again, and the marks underneath are back', t, pic)
  }
  /* leave OIL mode */
  await p.locator(OILB).first().evaluate(e => e.click()); await sleep(500)
  console.log('   oil mode on after leaving?', await p.locator('#schedBoard .daybar.oilon').count())
} finally { await L.close(w) }
