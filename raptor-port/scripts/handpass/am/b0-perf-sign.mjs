/* The amendment batch (25 Sep 26) — what D103's signature axis costs a repaint (Fable F9). The speed probe
   (probes/perf-port.cjs) runs on the unpublished demo week, where no signature is bound and the new work never runs.
   This publishes Mon–Fri, makes a change on each, signs each through the app's sign-off selects (so every role
   carries a binding, and every read recomputes the pending comparison), then times one edit's repaint under a 4×
   CPU slowdown (the phone figure the probe uses) — with the bindings, and again after the four are cleared.
   Usage (the build served on :4173):  node scripts/handpass/am/b0-perf-sign.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b0'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: null, dpr: 1 })
await editWeek(page)
for (const di of [0, 1, 2, 3, 4]) {
  await page.evaluate((di) => { const g = window.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; window.setDayApproved(di, true) }, di)
  await page.evaluate((di) => { window.txtSet(`dn:${di}.0`, 'AFTER PUBLISH ' + di); window.afterSchedMutate() }, di)
}
await page.waitForTimeout(600)
for (const di of [0, 1, 2, 3, 4]) await signDay(page, di)          // the app's own selects: real bindings
const bound = await page.evaluate(() => [0, 1, 2, 3, 4].map(di => Object.keys((window.SCHED.signBind || {})[di] || {}).length))
console.log('roles bound per day', JSON.stringify(bound))
const cdp = await page.context().newCDPSession(page)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
async function time(label) {
  const ms = []
  for (let i = 0; i < 7; i++) {
    ms.push(await page.evaluate(async (i) => {
      const t0 = performance.now()
      window.txtSet('dn:2.0', 'EDIT ' + i + ' ' + Math.random()); window.afterSchedMutate()
      await new Promise(r => setTimeout(r, 0)); document.body.offsetHeight
      return performance.now() - t0
    }, i))
  }
  ms.sort((a, b) => a - b)
  console.log(label, 'median', ms[3].toFixed(1), 'ms', JSON.stringify(ms.map(x => Math.round(x))))
  return ms[3]
}
const withB = await time('one edit, 5 published days signed (bindings live)')
await page.evaluate(() => { [0, 1, 2, 3, 4].forEach(di => { window.SCHED.signBind[di] = {} }) ; window.afterSchedMutate() })
const without = await time('one edit, same days, bindings cleared')
console.log('difference', (withB - without).toFixed(1), 'ms at 4x')
console.log('errors', JSON.stringify(errors))
await browser.close()
