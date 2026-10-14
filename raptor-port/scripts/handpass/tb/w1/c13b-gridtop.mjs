import * as F from './fx.mjs'
const { L } = F
console.log('w1 c13b v1')
const w = await L.world('phone')
try {
  const fx = await F.c6Fixture(w)
  await w.press('[data-testid="clash-line"]'); await L.sleep(400)
  const n = await F.readNote(w.page)
  console.log('two clashes open: gridTop', n.gridTop, 'screen h', await w.page.evaluate(() => innerHeight), 'noteBox', n.box, 'no-clash gridTop', fx.baseline.gridTop)
} finally { await L.close(w) }
