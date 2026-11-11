/* rcf-w3 explore4 v1 — add a flying wave on Friday; list its controls */
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/w3/explore'
const L = await import('../lib.mjs')
console.log('rcf-w3-explore4 v1', L.BASE)
const { browser, page, errors } = await L.open({ width: 1536, height: 864 })
await L.board(page, 4)
await L.tap(page, '[data-wvadd="4"]')
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click()
await page.waitForTimeout(600)
console.log(JSON.stringify(await page.evaluate(() => window.DAYS[4].waves)).slice(0, 1500))
const els = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-slot], #schedBoard [data-ifld], #schedBoard [data-fill]')].filter(e => e.offsetWidth > 0).map(e => e.tagName + ' ' + e.getAttributeNames().filter(a => a.startsWith('data-')).map(a => a + '=' + e.getAttribute(a)).join(' ')))
console.log(els.join('\n'))
const bt = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .wave, #schedBoard [class*=wave] button')].filter(e => e.offsetWidth > 0).map(e => (e.innerText || e.title).trim().slice(0, 20) + ' ||' + e.getAttributeNames().filter(a => a.startsWith('data-')).map(a => a + '=' + e.getAttribute(a)).join(' ')))
console.log(bt.join('\n'))
await L.shot(page, 'wave-added')
await browser.close()
