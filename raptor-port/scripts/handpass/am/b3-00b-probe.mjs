/* b3-00b — survey for B3: the accepted requests and where their rows stand; the Original's filing record on the
   published days; and whether Chromium's CDP can shrink ONLY the visual viewport (the keyboard emulation). Read-only. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, STATE, DESK, PHONE } = L
const { browser, page, ctx, errors } = await openHi({ ...DESK, state: STATE, dpr: 1 })
await editWeek(page)
const s = await page.evaluate(() => {
  const S = window.SCHED
  const acc = window.INPUTS.filter(x => x.acc).map(x => {
    const rows = window.DAYS.map((d, i) => (d.ground || []).some(g => g && g.src === (x.iid || x.id)) ? i : -1).filter(i => i >= 0)
    return { iid: x.iid, who: (window.PEOPLE[x.person] || {}).cs, keys: Object.keys(x).join(','), dates: x.dates || [x.start, x.end, x.sd, x.ed, x.d0, x.d1].join('/'), acc: x.acc, rowsOn: rows }
  })
  const fil = Object.fromEntries(Object.entries(S.orig || {}).map(([k, v]) => [k, v && v.fil ? v.fil : (v && v.snap && v.snap.fil) || Object.keys(v || {})]))
  return { acc, fil }
})
console.log(JSON.stringify(s, null, 1).slice(0, 4000))
/* the keyboard emulation: does CDP's setVisibleSize shrink the visual viewport alone? */
const cdp = await ctx.newCDPSession(page)
const before = await page.evaluate(() => ({ ih: innerHeight, vh: visualViewport.height, vt: visualViewport.offsetTop }))
let r1 = 'ok'
try { await cdp.send('Emulation.setVisibleSize', { width: 1440, height: 500 }) } catch (e) { r1 = 'ERR ' + e.message }
await page.waitForTimeout(300)
const after = await page.evaluate(() => ({ ih: innerHeight, vh: visualViewport.height, vt: visualViewport.offsetTop }))
console.log('setVisibleSize', r1, JSON.stringify({ before, after }))
console.log('errors', errors)
await browser.close()
