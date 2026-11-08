// W2 part P: does a moved changes window keep its place on reopen in a PLAIN world (storage works)? Compares with S6 in the refused world.
console.log('nk28-w2p v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const rectOf = (p, sel) => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility() }); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }, sel)
for (const [name, locked] of [['plain', false], ['refused', true]]) {
  const w = await world({ locked }); const p = w.page
  try {
    await L.login(p, 'a'); await sleep(500)
    await nav(p, 'editsched'); await sleep(800)
    await p.tap('#histBtn'); await sleep(900)
    const h1 = await rectOf(p, '.win-hide')
    const grip = await rectOf(p, '.win-grip, .win-drag, .win-ttl')
    const x = (grip.l + grip.r) / 2, y = (grip.t + grip.b) / 2
    await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x, y - 120, { steps: 8 }); await p.mouse.up(); await sleep(500)
    const h2 = await rectOf(p, '.win-hide')
    await p.tap('.win-x >> visible=true'); await sleep(700)
    await p.tap('#histBtn'); await sleep(900)
    const h3 = await rectOf(p, '.win-hide'); const f = await pic(p, 'S6-reopen-' + name)
    note('6', `moved window reopen, ${name} world`, `Hide button top: first open ${h1 && h1.t}, after a drag ${h2 && h2.t}, reopened ${h3 && h3.t}`, f)
  } catch (e) { note('6', `reopen ${name}`, 'NOTRUN ' + String(e.message).split('\n')[0]) }
  await w.ctx.close()
}
await closeAll()
