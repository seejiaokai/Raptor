/* b3-00 — survey the saved everything-week (STATE) for walker B3: which days are published, at what version,
   what is pending, what inputs are accepted, the day templates. Read-only. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, head, STATE, DESK } = L
const { browser, page, errors } = await openHi({ ...DESK, state: STATE, dpr: 1 })
await editWeek(page)
const s = await page.evaluate(() => {
  const S = window.SCHED
  return {
    days: window.DAYS.map((d, i) => ({ i, dow: d.dow, dt: d.dt, ok: !!(S.dayOK || {})[i], cur: (S.cur || {})[i] ?? null })),
    als: (S.als || []).map(a => `${a.id} d${a.di}`),
    tpls: (window.DAYTPL_CFG || []).length,
    inputs: window.INPUTS.filter(x => x.acc).map(x => ({ iid: x.iid, who: (window.PEOPLE[x.person] || {}).cs, type: x.type, from: x.from, to: x.to, acc: x.acc, rm: x.remarks })).slice(0, 40),
  }
})
console.log(JSON.stringify(s, null, 1))
for (let i = 0; i < 7; i++) console.log(i, JSON.stringify(await head(page, i)))
console.log('errors', errors)
await browser.close()
