/* d-05-probe-week v1 — probe: the week buttons on Edit Schedule, pc and phone. */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe-week-' + KIND
console.log('d-05-probe-week v1', KIND)
const D = await import('./d-lib.mjs')
const { L, sleep, j } = D
const w = await D.world(KIND)
const { page } = w
await L.go(page, 'editsched'); await sleep(600)
console.log(await page.evaluate(() => [...document.querySelectorAll('button.wk')].map(b => { const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return `${b.dataset.wk} ${b.className} vis=${!!b.offsetWidth} box=${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)} top=${e && (e.className || e.tagName)} "${b.innerText}"` }).join('\n')))
await D.shot(page, 'p-week')
await w.browser.close()
