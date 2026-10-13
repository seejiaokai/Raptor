import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('dbg-toast v1')
const w = await L.world('phone')
const p = w.page
try {
  await openBoard(w, 5)
  console.log('clearToast type', await p.evaluate(() => typeof window.clearToast), await p.evaluate(() => String(window.clearToast).slice(0, 300)))
  await p.evaluate(() => window.toast('hello probe'))
  for (let i = 0; i < 8; i++) { console.log(i, JSON.stringify((await toastNow(p))?.opacity), (await toastNow(p))?.text); await sleep(700) }
  await p.evaluate(() => window.toast('second probe'))
  await sleep(200)
  await p.evaluate(() => window.clearToast())
  for (const ms of [0, 100, 300, 700]) { await sleep(ms); const t = await toastNow(p); console.log('after clear', ms, t.opacity, t.text, await p.evaluate(() => document.getElementById('toastEl').className)) }
} finally { await L.close(w) }
