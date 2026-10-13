/* W2 N29 — Quals, Edit quals: remove one column.  node n29-quals.mjs */
import { L, sleep, toastNow, toastShown, clearToast } from './w2lib.mjs'
console.log('n29-quals v1')
const w = await L.world('desk')
const p = w.page
try {
  await L.go(w, 'quals')
  await p.click('#qEdit'); await sleep(400)
  await p.click('#qEditQuals'); await sleep(800)
  const cols = await p.evaluate(() => [...document.querySelectorAll('#page-quals .qdel')].map(e => e.dataset.del + ':' + e.parentElement.querySelector('.qlbl').textContent))
  console.log('columns', cols.join(', '))
  const target = p.locator('#page-quals .qdel[data-del="tf"]').first()
  const label = await target.evaluate(e => e.parentElement.querySelector('.qlbl').textContent)
  await target.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  await clearToast(p)
  await target.click()
  let t = await toastShown(p, 2000)
  console.log('first read', JSON.stringify(t && [t.text, t.opacity]))
  if (!t || !t.text || parseFloat(t.opacity) < 0.5) {
    // may ask a confirm
    console.log('dialogs:', await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .airpop, .confirm')].map(e => e.innerText.slice(0, 200)).join(' || ')))
  }
  await sleep(300)
  const pic = await L.pic(w, 'n29-desk-column-removed')
  const want = `${label} removed from the LoX. Nobody's record changed. Add it back and the ticks return.`
  const alt = `${label} removed from the LoX. Nobody’s record changed. Add it back and the ticks return.`
  console.log(`== N29 ${t && t.text === want ? 'PASS' : 'FAIL'}\n   want ${JSON.stringify(want)}\n   saw  ${JSON.stringify(t && t.text)} opacity ${t && t.opacity}\n   (curly-apostrophe form matches: ${t && t.text === alt})\n   pic ${pic}`)
} finally { await L.close(w) }
