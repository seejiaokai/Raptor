/* rcf-w3 explore2 v1 — Friday board controls */
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/w3/explore'
const L = await import('../lib.mjs')
console.log('rcf-w3-explore2 v1', L.BASE)
const { browser, page, errors } = await L.open({ width: 1536, height: 864 })
await L.board(page, 4)
const btns = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-wvadd], #schedBoard [data-sblkadd], #schedBoard [data-dwadd]')].filter(e => e.offsetWidth > 0).map(e => (e.innerText || e.title || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30) + ' ||' + e.getAttributeNames().filter(a => a.startsWith('data-')).map(a => a + '=' + e.getAttribute(a)).join(',').slice(0, 60)))
console.log(btns.join('\n'))
console.log(await page.evaluate(() => document.querySelector('#sbSide')?.innerText.slice(0, 600)))
await L.shot(page, 'fri-board')
await browser.close()
