/* d-12-probe-view-buttons v1 — probe: the View-only page's buttons (where print / CSV live). */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe-view'
console.log('d-12 v1')
const D = await import('./d-lib.mjs')
const { L, sleep } = D
const w = await D.world('pc')
const { page } = w
await L.go(page, 'viewsched'); await sleep(700)
console.log(await page.evaluate(() => [...document.querySelectorAll('button, a')].filter(b => b.offsetWidth && b.getBoundingClientRect().top < 140).map(b => `${b.id}|${b.className}|${b.getAttribute('aria-label')}|${b.title}|${b.innerText.trim().slice(0, 20)}`).join('\n')))
await D.shot(page, 'p-view')
await w.browser.close()
