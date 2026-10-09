const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world(); const { page } = w
await go(page, 'editsched'); await sleep(500)
console.log(await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt).filter(k => !/^(dn|ap|pn|dtn|sn|gn|wl)/.test(k)).slice(0, 20)))
await w.browser.close()
