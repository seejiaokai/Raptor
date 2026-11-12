/* rcsb-w2-probe5 v1 — W2: find the controls for a Common Programme row and the Logic key of "Debrief after landing". Read-only. */
const C = await import('./rcsb-w2-common.mjs')
C.setShots('probe5')
console.log('rcsb-w2-probe5 v1', process.env.HP_SHOTS)
const Q = await C.load()
const { R, X, L, sleep } = Q
const w = await R.world('pc')
const { page } = w
await L.go(page, 'logic'); await sleep(700)
await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500)
console.log('logic keys', C.j(await page.evaluate(() => [...document.querySelectorAll('#lgBody input[data-lgset]')].map(e => e.dataset.lgset + '=' + e.value))))
await X.press(w, '#lgDone', { scope: 'page' }).catch(() => {})
await L.board(page, 1)
console.log('data attrs with add', C.j(await page.evaluate(() => { const s = new Set(); document.querySelectorAll('#schedBoard *').forEach(e => { if (!e.offsetWidth) return; for (const a of e.attributes) if (/^data-.*(add|prog|ap)/i.test(a.name)) s.add(a.name + '=' + a.value) }); return [...s].slice(0, 60) })))
console.log('programme rows', C.j(await page.evaluate(() => window.DAYS[1].prog ? JSON.stringify(window.DAYS[1].prog).slice(0, 600) : Object.keys(window.DAYS[1]).join(','))))
console.log('day keys', C.j(Object.keys(await page.evaluate(() => window.DAYS[1]))))
await R.shot(page, 'p5-board-tue')
await w.browser.close()
