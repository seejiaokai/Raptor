// sa208-wA-repro2 — walker A's measure of the letters' INK in the crew list's SANS column (lesson 9, chat 208): Tue 14 with
// Bolt and Zenith Fly only, Jester OFT only, Kraken OFT + AMT, an AMT BOX 13:00–14:00 front seat picked — each row's letter
// box left edge and the left edge of the letters as drawn. window.* only READ. Run: SZ=d|p node …/sa208-wA-repro2.mjs
import './sa208-wA-env.mjs'
const H = await import('./sa208-wA-lib.mjs')
const { B, Y, L, J, ID, ISO, rec, file, mkSim, sim, saveRaw } = H
const SZ = process.env.SZ || 'd'
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
console.log('VERSION sa208-wA-repro2 1 ·', SZ)
await Y.run('R2', SZ, async (p, W) => {
  const di = 1
  await file(p, W, ISO[di], ID.Bolt, ['fly'], 'all', 'bolt')
  await file(p, W, ISO[di], ID.Zenith, ['fly'], 'all', 'zenith')
  await file(p, W, ISO[di], ID.Jester, ['oft'], 'all', 'jester')
  await file(p, W, ISO[di], ID.Kraken, ['oft', 'amt'], 'all', 'kraken')
  const box = await mkSim(p, W, di, 'amt', 'BOX', '13:00', '14:00')
  for (const [tag, sel] of [['amt-front', sim(di, 'amt', box, 'p')], ['none', null]]) {
    if (sel) await B.arm(p, W, 'B', di, sel); else { await B.openB(p, W, di); await B.unarm(p, W, 'B'); await B.showList(p, W, 'B') }
    const s = await B.readSec(p, 'B')
    const pic = await B.secPic(p, W, 'B', 'r2-' + tag).catch(() => '')
    const rows = s.rows.filter(r => r.badge).map(r => `${r.cs}${r.struck ? '(x)' : ''} "${r.badge}" box ${r.bL} ink ${r.bInkL}–${r.bInkR}`)
    const inks = s.rows.filter(r => r.badge).map(r => r.bInkL)
    rec(W, 'R2.' + tag, `${tag === 'none' ? 'nothing picked' : 'AMT BOX front picked'}: each row's letter box left edge and its letters' ink left edge (lesson 9: one column as drawn)`, `ink spread ${Math.round((Math.max(...inks) - Math.min(...inks)) * 10) / 10}px · ${rows.join(' · ')}`, pic)
  }
})
saveRaw(`results-repro2-${SZ}.json`, L.results)
process.exit(0)
