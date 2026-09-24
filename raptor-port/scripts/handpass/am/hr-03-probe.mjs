/* probe for hr-03: where the saved everything-week's placeholder pucks sit on the published Saturday */
process.env.HP_SHOTS = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/hr3'
const L = await import('./w2-lib.mjs')
const { browser, page } = await L.openHi({ width: 1440, height: 900, dpr: 1, state: L.STATE })
const r = await page.evaluate(() => {
  const d = window.DAYS[5], out = []
  const S = /^(all|allavail)$/i
  ;(d.allhands || []).forEach((a, i) => { const w = Array.isArray(a.who) ? a.who : [a.who]; if (w.some(x => S.test(String(x)))) out.push(['a', i, a.prog, w]) })
  ;(d.ground || []).forEach((g, i) => { if (S.test(String(g.who)) || (g.more || []).some(x => S.test(String(x)))) out.push(['g', i, g.prog, g.who, g.more]) })
  ;(d.dutywaves || []).forEach((b, bi) => (b.rows || []).forEach((r, ri) => { if (S.test(String(r.id)) || (r.more || []).some(x => S.test(String(x)))) out.push(['d', bi, ri, r.role, r.id, r.more]) }))
  return { out, pub: !!(window.SCHED.orig && window.SCHED.orig[5]), ah: (d.allhands || []).map((a, i) => i + ':' + a.prog + ':' + JSON.stringify(a.who)) }
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
