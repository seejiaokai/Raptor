/* rcf-w3 explore3 v1 — + Wave on Friday, what appears */
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/w3/explore'
const L = await import('../lib.mjs')
console.log('rcf-w3-explore3 v1', L.BASE)
const { browser, page, errors } = await L.open({ width: 1536, height: 864 })
await L.board(page, 4)
await L.tap(page, '[data-wvadd="4"]')
await page.waitForTimeout(500)
await L.shot(page, 'wave-menu')
const menu = await page.evaluate(() => [...document.querySelectorAll('[role=menu] *, .menu *, .tplmenu *, #schedBoard [data-wsplit], [data-wvadd]')].filter(e => e.offsetWidth > 0 && e.children.length === 0).map(e => (e.innerText || '').trim() + ' ||' + e.getAttributeNames().join(',')).slice(0, 40))
console.log(menu.join('\n'))
console.log(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetWidth > 0 && /Blank wave|Standard|Template|Empty/i.test(e.innerText || '') && e.children.length < 3).map(e => e.tagName + '.' + e.className + ':' + (e.innerText || '').slice(0, 40)).slice(0, 20).join('\n')))
await browser.close()
