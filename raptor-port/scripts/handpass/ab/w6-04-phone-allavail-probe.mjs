/* W6 — probe: placing ALL AVAIL on Thursday's SODB row on a PHONE board by finger (the driver's mouse put() missed). */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const o = await W4.openW4({ phone: true, who: 'a', state: `${SCR}/world.json` })
const page = o.page
await L.board(page, 3)
const arm = '#schedBoard [data-fill="a:3.0.+"]'
const t1 = await W4.fingerTap(page, arm)
const s1 = await page.evaluate(() => ({ arm: window.ARM && window.ARM.key, drawer: !!document.querySelector('.ros-open, #schedBoard .sb-ros.open, body.ros-open') }))
const pk = '#sbRoster .rpuck[data-person="allavail"]'
const vis = await page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetWidth); if (!e) return 'none'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r: [r.left, r.top, r.width, r.height], hit: h ? h.tagName + '.' + h.className : '' } }, pk)
const t2 = await W4.fingerTap(page, pk + ':visible')
await page.waitForTimeout(600)
const who = await page.evaluate(() => window.DAYS[3].allhands[0].who)
await L.shot(page, 'w6-phone-probe-allavail')
console.log(JSON.stringify({ t1, s1, vis, t2, who }))
console.log('errors', o.errors)
await o.browser.close()
