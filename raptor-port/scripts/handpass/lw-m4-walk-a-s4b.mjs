// Walker A, route 2b: how many Undo steps does Approve all leave — two slow taps against two taps under 150 ms. Demo lines only, admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s4b'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc } = A
const { T, rec, shot } = L
console.log('[lw-m4-walk-a-s4b v1]')
L.clearOut()
const size = 'desk'
async function oneWorld(label, gapMs) {
  const w = await L.newCtx('desk')
  const P = w.page
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  const allBtn = P.locator(T('appr-approve-all'))
  const lit = () => P.evaluate(() => [...document.querySelectorAll('.appr-line')].filter(e => /lit-approved/.test(e.className)).length)
  const total = await P.evaluate(() => document.querySelectorAll('.appr-line').length)
  const b = await allBtn.boundingBox(); const x = b.x + b.width / 2, y = b.y + b.height / 2
  const t0 = Date.now()
  await P.mouse.click(x, y)
  if (gapMs > 0) await P.waitForTimeout(gapMs)
  await P.mouse.click(x, y)
  const took = Date.now() - t0
  await P.waitForTimeout(800)
  const afterTaps = { lit: await lit(), btn: (await allBtn.innerText()).trim() }
  await shot(w, `a-s4b-${label}-after-taps`)
  const steps = []
  for (let i = 0; i < 6; i++) {
    const dis = await P.evaluate(() => document.querySelector('#undoBtn').disabled || document.querySelector('#undoBtn').getAttribute('aria-disabled') === 'true')
    if (dis) { steps.push('undo disabled'); break }
    await A.topbarUndo(w)
    const toast = await P.evaluate(() => [...document.querySelectorAll('[class*="toast"], [role="status"]')].map(e => e.innerText.trim()).filter(Boolean).join(' | '))
    steps.push(`undo${i + 1}: lit ${await lit()} "${toast}"`)
  }
  console.log(label, `(${took} ms for the taps)`, JSON.stringify(afterTaps), 'of', total, '\n   ', steps.join('\n    '))
  if (w.errs.length) console.log('errs', w.errs)
  await w.ctx.close()
  return { afterTaps, steps, took, total }
}
const slow = await oneWorld('slow', 1000)
const fast = await oneWorld('fast', 0)
const mid = await oneWorld('mid', 100)
const nSlow = slow.steps.filter(s => /^undo\d/.test(s) && /decision/.test(s)).length
const nFast = fast.steps.filter(s => /^undo\d/.test(s) && /decision/.test(s)).length
const nMid = mid.steps.filter(s => /^undo\d/.test(s) && /decision/.test(s)).length
rec('4c fast taps: Undo steps left by Approve all', size, nFast === nSlow && nSlow === 1 ? 'PASS' : 'FAIL', `two slow taps (1 s): ${slow.afterTaps.lit}/${slow.total} lit, ${nSlow} decision step(s) on the Undo list; two taps back to back (${fast.took} ms): ${fast.afterTaps.lit}/${fast.total} lit, ${nFast} step(s); two taps 100 ms apart: ${mid.afterTaps.lit}/${mid.total} lit, ${nMid} step(s)`, ['a-s4b-slow-after-taps', 'a-s4b-fast-after-taps', 'a-s4b-mid-after-taps'])
L.writeResults('s4b')
await L.closeBrowser()
console.log('DONE')
