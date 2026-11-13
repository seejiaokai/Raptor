/* d-06-probe-cal v1 — probe: the phone's top-row buttons on Edit Schedule. */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe-cal'
console.log('d-06-probe-cal v1')
const D = await import('./d-lib.mjs')
const { L, sleep } = D
const w = await D.world('phone')
const { page } = w
await L.go(page, 'editsched'); await sleep(600)
console.log(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && b.getBoundingClientRect().top > 40 && b.getBoundingClientRect().top < 100).map(b => `${b.id}|${b.className}|${b.getAttribute('aria-label')}|${b.title}`).join('\n')))
await w.browser.close()
