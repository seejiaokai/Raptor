// probe - exploration only (not a fact script): the top bar's controls and the visible buttons on a page after a sign-in
//   node raptor-port/scripts/handpass/n166/probe.mjs <size> [user] [pass] [page]
import { mk, closeAll, signIn, pic, roleNow, covered, boxOf, go } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const s = await mk(SZ)
try {
  await signIn(s, process.argv[3] || 'ad', process.argv[4] || 'a')
  if (process.argv[5]) await go(s, process.argv[5])
  await s.page.waitForTimeout(1500)
  const btns = await s.page.evaluate(() => [...document.querySelectorAll('.page.on button, .page.on [data-testid], .page.on select')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e).visibility !== 'hidden' }).map(e => `${e.id || e.dataset.testid || String(e.className).slice(0, 20)}:${e.textContent.trim().slice(0, 24)}`))
  console.log(JSON.stringify(btns))
  console.log(JSON.stringify(await roleNow(s)), await covered(s, '#sqnMenuBtn'), JSON.stringify(await boxOf(s, '#sqnMenuBtn')))
  await pic(s, 'probe-' + SZ + '-' + (process.argv[5] || 'home'))
} finally { await closeAll() }
