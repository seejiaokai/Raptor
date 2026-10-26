// W1 part e4 — scenario 10 (desktop 1536x864): a second bid on a day already red raises the bubble again, with its figures (D1345).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-e10.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
L.clearPrefix('s10-')
console.log('lw-m3b-w1-e10 desktop 1536x864 out', L.OUT)
const w = await M.start('desk')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const shot = async name => { await P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
const H = await import('./lw-night-w1-lib.mjs')
const ids = await M.ids(P)
const D = '2026-12-15'
const f = await M.f1(w, D)
say(`10 fixture: Required P ${f.req}, Available P ${f.cell.text} (${f.level}); the Manning rows are ${await M.rowsOpen(P) ? 'open' : 'folded'} on a desktop`)
async function bid(who, name, label) {
  await L.openCellR(w, who, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await M.setSwitch(w, false)
  const c = await L.centre(P, T('bid-LL'))
  await P.mouse.click(c.x, c.y)
  await P.waitForTimeout(120)
  let q = await M.bub(P)
  await shot(name)
  await P.waitForTimeout(400)
  if (await L.vis(P, T('bid-picker'))) {   // the below-zero ask: the same leave again
    const c2 = await L.centre(P, T('bid-LL')); await P.mouse.click(c2.x, c2.y); await P.waitForTimeout(120)
    q = await M.bub(P); await shot(name); await P.waitForTimeout(400)
  }
  const ap = await H.rowCell(P, `avail-p-${D}`)
  say(`10 ${label}: Available P now ${ap.text} (${H.levelOf(ap)}); bubble ${M.bubLine(q)}`)
  return { q, ap }
}
const r1 = await bid(ids.Drifter, 's10-1-first-bid', 'first bid')
judge(M.isRed(r1.q) && /^This bid: Available P \d+ → \d+$/.test(r1.q?.label || ''), `10 first bid: "${r1.q?.label}"`)
await P.mouse.click(700, 8); await P.waitForTimeout(250)
say('10 a click elsewhere takes it down: ' + ((await M.bub(P)) ? 'STILL UP' : 'gone'))
const r2 = await bid(ids.Ridge, 's10-2-second-bid', 'second bid')
const a1 = Number((r1.q?.label || '').match(/→ (\d+)/)?.[1]), a2 = Number((r2.q?.label || '').match(/(\d+) →/)?.[1]), a2b = Number((r2.q?.label || '').match(/→ (\d+)/)?.[1])
judge(M.isRed(r2.q) && /^This bid: Available P \d+ → \d+$/.test(r2.q?.label || '') && a2 === a1 && a2b === a1 - 1, `10 second bid on the day already red: bubble raised again, "${r2.q?.label}" (from ${a2} to ${a2b}; the first bid left it at ${a1})`)
await P.keyboard.press('ArrowDown'); await P.waitForTimeout(250)
const r3 = await bid(ids.Trident, 's10-3-third-bid', 'third bid')
const a3 = Number((r3.q?.label || '').match(/(\d+) →/)?.[1]), a3b = Number((r3.q?.label || '').match(/→ (\d+)/)?.[1])
judge(M.isRed(r3.q) && a3 === a2b && a3b === a2b - 1, `10 third bid: "${r3.q?.label}" (from ${a3} to ${a3b}; the second left it at ${a2b})`)
const b = await M.bub(P)
say('10 desktop bubble placement: ' + (b ? `box ${b.rect.x},${b.rect.y} ${b.rect.w}x${b.rect.h} of ${b.vw}x${b.vh}, ${b.gapBelow}px above the foot, Show ${b.show ? (b.show.visible ? 'drawn' : 'hidden') : 'not there'}` : 'gone'))
judge(!!b && b.gapBelow <= 40, '10 on a desktop the bubble stands at the foot of the screen, not under the Manning button')
console.log(`SUMMARY [desktop]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
