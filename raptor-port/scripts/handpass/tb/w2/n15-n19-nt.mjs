/* W2 N15 (hide a warning), N19 (brief removed), N-T (not a time) on the desktop board.  node n15-n19-nt.mjs */
import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('n15-n19-nt v1')
const w = await L.world('desk')
const p = w.page
const DI = 1
const verdict = (id, want, t, pic) => console.log(`== ${id} ${t && t.text === want ? 'PASS' : 'FAIL'}\n   want ${JSON.stringify(want)}\n   saw  ${JSON.stringify(t && t.text)} opacity ${t && t.opacity}\n   pic  ${pic}`)
try {
  await openBoard(w, DI)
  /* N15 */
  const hdr = p.locator('#schedBoard #sbWarn, #sbWarn').first()
  console.log('warn text', JSON.stringify(await p.evaluate(() => document.querySelector('#sbWarn').innerText.slice(0, 80))))
  const woff = p.locator('#schedBoard [data-woff]:visible')
  console.log('woff visible before open', await woff.count())
  if (!(await woff.count())) { await hdr.evaluate(e => { const h = e.querySelector('.wl-head, .wsum, summary, [data-wtoggle], div'); (h || e).click() }); await sleep(500) }
  console.log('woff visible after open', await woff.count())
  const first = p.locator('#schedBoard [data-woff]:visible').first()
  await first.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await clearToast(p)
  await w.press(first)
  let t = await toastShown(p)
  await sleep(300)
  let pic = await L.pic(w, 'n15-desk-warning-hidden')
  verdict('N15', 'Warning hidden: no flag, not counted. It returns if the warning changes.', t, pic)
  /* N19 */
  await clearToast(p)
  const br = p.locator('#schedBoard [data-bfld="ff:1.0.0.br"]').first(), to = p.locator('#schedBoard [data-bfld="ff:1.0.0.to"]').first()
  await br.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  console.log('take-off', await to.inputValue(), 'brief before', JSON.stringify(await br.inputValue()))
  await br.click(); await br.fill('0800'); await br.press('Enter'); await br.blur(); await sleep(500)
  console.log('brief now', JSON.stringify(await br.inputValue()), 'note:', JSON.stringify((await toastNow(p))?.text))
  await clearToast(p)
  await to.click(); await to.fill('0730'); await to.press('Enter')
  t = await toastShown(p)
  await to.blur(); await sleep(300)
  console.log('take-off now', await to.inputValue(), 'brief now', JSON.stringify(await br.inputValue()))
  pic = await L.pic(w, 'n19-desk-brief-removed')
  verdict('N19', 'The 08:00 brief was after the new take-off, so it was removed', t, pic)
  /* N-T */
  await clearToast(p)
  const tb = p.locator('#schedBoard [data-bfld="ap:1.0.str"]').first()
  await tb.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await tb.click(); await tb.fill('2590'); await tb.press('Enter')
  t = await toastShown(p)
  await tb.blur(); await sleep(300)
  console.log('box now', JSON.stringify(await tb.inputValue()))
  pic = await L.pic(w, 'nt-desk-not-a-time')
  verdict('N-T', '2590 is not a time. Try 0900 or 09:00.', t, pic)
} finally { await L.close(w) }
