/* W2 N10, N-R, N17 — a Ground Programme row's ⓘ and red box; the phone's desktop layout.  node n10-ground.mjs phone|desk */
import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('n10-ground v1')
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
const T = size
const DI = 1
const check = (id, want, got0, pic) => {
  const got = got0 && got0.text && parseFloat(got0.opacity) > 0.5 ? got0 : null
  console.log(`== ${id} [${T}] ${got && got.text === want ? 'PASS' : 'FAIL'}\n   want: ${JSON.stringify(want)}\n   saw : ${got ? JSON.stringify(got.text) + ' opacity ' + got.opacity : 'NO NOTE SHOWING (last text ' + JSON.stringify(got0 && got0.text) + ' opacity ' + (got0 && got0.opacity) + ')'}\n   pic : ${pic}`)
}
const act = async sel => {
  const b = p.locator(sel).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(250)
  await clearToast(p)
  await w.press(b)
  return toastShown(p)
}
try {
  await openBoard(w, DI)
  const gcount = () => p.locator(`#schedBoard [data-ginfo]:visible`).count()
  console.log('   ground info buttons before', await gcount())
  await sleep(600)
  const info = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.getBoundingClientRect().width > 0 && /data-g/.test([...b.attributes].map(a => a.name).join(' '))).map(b => `${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}|${b.textContent.trim()}|${b.title}`))
  console.log('   ground buttons after add:\n   ' + info.join('\n   '))
  const infoSel = '#schedBoard [data-grinfo="1.0"]:visible', flagSel = '#schedBoard [data-grflag="1.0"]:visible'
  const ginfo = await p.locator(infoSel).count()
  console.log('   ginfo count', ginfo, 'gflag count', await p.locator(flagSel).count())
  let t = await act(infoSel)
  await sleep(300)
  let pic = await L.pic(w, `n10-${T}-info-on`)
  check('N10 on', 'This item is info only: no longer checked against the rules, and earns nobody any OIL', t, pic)
  t = await act(infoSel)
  await sleep(300)
  pic = await L.pic(w, `n10-${T}-info-off`)
  check('N10 off', 'This item is checked against the rules again and can earn OIL', t, pic)
  if (w.phone) {
    t = await act(flagSel)
    await sleep(300)
    pic = await L.pic(w, `nr-${T}-red-box`)
    check('N-R', 'Red box: flagged for the next scheduler', t, pic)
    /* N17: the desktop layout behind the ⋯ */
    await p.evaluate(() => window.scrollTo(0, 0)); await p.locator('#schedBoard').first().evaluate(e => { e.scrollTop = 0 })
    await sleep(300)
    await clearToast(p)
    await w.press('#sbMore'); await sleep(400)
    await w.press('#sbMoreWide')
    t = await toastShown(p)
    await sleep(400)
    pic = await L.pic(w, `n17-${T}-desktop-layout`)
    check('N17', 'Desktop layout: pan sideways to read the whole day', t, pic)
  }
} finally { await L.close(w) }
