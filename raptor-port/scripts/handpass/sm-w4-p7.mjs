// W4 scenario 7b: the wave templates window: is the show/hide mark a drawn eye or a typed 👁? Env ORIGIN, TAG
import * as L from './sm-lib.mjs'
const TAG = process.env.TAG || 'job'
console.log('sm-w4-p7 v2', TAG, L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch('pc', { origin: process.env.ORIGIN || 'http://localhost:4398' })
const { page } = W
const res = { tag: TAG }
try {
  await L.signIn(W)
  await L.openBoard(W, 2)
  await L.press(W, page.locator('[data-wvadd="2"]')); await L.sleep(800)
  await L.pic(W, OUT, `s7b-${TAG}-1-menu`, {})
  res.menu = await page.evaluate(() => [...document.querySelectorAll('.wavemenu *')].filter(e => e.getBoundingClientRect().height > 0 && e.children.length === 0).map(e => e.tagName + '|' + String(e.getAttribute("class") || "").slice(0, 20) + '|' + (e.title || '') + '|' + e.textContent.trim().slice(0, 20)))
  console.log('menu', JSON.stringify(res.menu))
  const gear = page.locator('.wavemenu [title*="emplate" i], .wavemenu [data-wvtplgear], .wavemenu .gear, .wavemenu svg').filter({ visible: true }).first()
  res.gearCount = await gear.count()
  if (res.gearCount) {
    await gear.click(); await L.sleep(900)
    await L.pic(W, OUT, `s7b-${TAG}-2-window`, {})
    res.eye = await page.evaluate(() => {
      const wins = [...document.querySelectorAll('[class*=win], [data-testid^="win-"], .modal')].filter(e => e.getBoundingClientRect().height > 0)
      const w = wins[wins.length - 1]; if (!w) return 'no window'
      return { win: (w.dataset.testid || w.className).slice(0, 40), text: w.innerText.replace(/\s+/g, ' ').slice(0, 200), eyeGlyph: /👁/.test(w.textContent), svgs: [...w.querySelectorAll('svg')].map(s => (s.closest('button') || s).title + '|' + String((s.closest("button") || s).getAttribute("class"))).slice(0, 8) }
    })
    console.log('eye', JSON.stringify(res.eye))
  }
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR', res.err); try { await L.pic(W, OUT, `s7b-${TAG}-err`, {}) } catch {} }
res.errs = W.errs
console.log('RESULT', JSON.stringify(res).slice(0, 1500))
await L.closeAll(W)
