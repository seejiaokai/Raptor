import * as C from './stk-C-lib.mjs'
const { L, W } = C
const { browser, p } = await C.world({ w: 844, h: 390, phone: true })
try {
  await p.setViewportSize({ width: 844, height: 390 })
  await C.tracking(p, true)
  await C.toWeek(p, 0)
  await C.fset(p, 'ff:0.0.0.msn', 'ACM'); await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU')
  console.log(await p.evaluate(() => { const q = document.querySelector('.mission-role-question'); if (!q) return 'no q'; const r = q.getBoundingClientRect(); let x = q, c = []; while (x && x !== document.body) { const cs = getComputedStyle(x); c.push(x.tagName + '.' + x.className.toString().slice(0, 20) + ':' + cs.display + '/' + cs.overflow); x = x.parentElement } return JSON.stringify({ r: [r.x, r.y, r.width, r.height], off: q.offsetParent !== null, chain: c.slice(0, 7) }) }))
  console.log(await C.reach(p))
  await p.locator('.mission-role-question').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await C.sleep(300)
  await C.pic(p, 'week-q')
  console.log(await C.reach(p))
} finally { await browser.close() }
