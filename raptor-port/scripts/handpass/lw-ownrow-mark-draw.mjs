// The drawing of [LW-OWN-ROW-SELMARK] (his D1568, 2 Nov 26): on his own Leave War row the day a window acts on cannot be
// seen, because his row's own cyan lines sit over the selection's cyan ring and the faint cyan wash left reads as part of
// the row (his iPhone picture: Saber, Mon 30 Nov tapped). Drawn on the real app (the build served on PORT, default 4180),
// signed in as Saber, at his iPhone's size in WebKit (402) and a desktop's (1536), two cases on his own row:
//   one day tapped (Tue 14 Jul) — and a three-day LL bid (21–23 Jul) placed by the app's own writer, opened whole (D1461).
//   Today — the real look.
//   A (recommended) — on his own row only, the selection's own stronger look, the one a drag wears while it grabs
//     (matrix.css `.mx-wrap.selecting .mx td.selcell`: the brighter wash and a 2px ring), laid over the row's lines.
//   B — on his own row only, the same wash with a 2px white ring in place of the cyan.
// Nothing in the app changes: one <style> is laid on the page for A and B, taken off between them.
// Run from raptor-port/: PORT=4180 node scripts/handpass/lw-ownrow-mark-draw.mjs
// CHECK=1 pictures the BUILT look beside drawing A instead (the build checked beside its drawing, D1495): `*-built.png`,
// and the sheets `check-<dev>-<case>.png`.
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { compose, neutral, open as openApp, sleep } from '../../docs/img/mock/2026-11-02-year/lib.mjs'

const OUT = path.resolve('docs/img/mock/2026-11-02-ownrow-mark')
const RAW = path.join(OUT, 'raw')
mkdirSync(RAW, { recursive: true })
const q = t => `[data-testid="${t}"]`
const ROW = '#page-leavewar .mx tbody tr.me td.selcell'
const STYLE = {
  A: `${ROW} { background: rgba(59, 198, 232, .34) !important; box-shadow: inset 0 0 0 2px rgba(59, 198, 232, .95) !important; }`,
  B: `${ROW} { background: rgba(59, 198, 232, .22) !important; box-shadow: inset 0 0 0 2px #fff !important; }`,
}

async function open(dev) {
  const { b, P } = await openApp(dev)
  await P.clock.setFixedTime(new Date('2026-06-20T09:00:00+08:00'))
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(q('month-strip'))
  await P.selectOption(q('war-picker'), 'y2026'); await sleep(900)
  await P.locator(q('month-JUL')).click(); await sleep(900)
  return { b, P }
}
const myRow = P => P.evaluate(() => {
  const tr = document.querySelector('.mx tbody tr.me')
  const c = tr?.querySelector('td[data-testid^="cell-"]')
  return c ? c.dataset.testid.replace(/^cell-/, '').slice(0, -11) : null
})

async function shoot(dev, kase, kind) {
  const { b, P } = await open(dev)
  const phone = dev === 'phone'
  const id = await myRow(P)
  if (!id) throw new Error(dev + ': no row of his own (tr.me)')
  const cell = d => P.locator(`[data-testid="cell-${id}-${d}"]`)
  const day = kase === 'run' ? '2026-07-22' : '2026-07-14'
  if (kase === 'run') {
    await P.evaluate(i => { for (const d of ['2026-07-21', '2026-07-22', '2026-07-23']) if (!window.lwSetCell(i, d, 'LL')) throw new Error('not placed ' + d) }, id)
    await sleep(400)
  }
  /* the day in the middle of the grid, so no picture cuts it at the edge */
  await P.evaluate(([i, d]) => document.querySelector(`[data-testid="cell-${i}-${d}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), [id, day]); await sleep(400)
  if (phone) await cell(day).tap(); else await cell(day).click()
  await sleep(900)
  if (!(await P.$(q('bid-picker')))) throw new Error(`${dev} ${kase}: his day did not open the bid window`)
  if (STYLE[kind]) await P.addStyleTag({ content: STYLE[kind] })
  await sleep(200)
  await neutral(P)
  /* the premise, asserted before the picture: his own row, the day(s) marked */
  const marked = await P.evaluate(i => [...document.querySelectorAll(`tr.me td.selcell[data-testid^="cell-${i}-"]`)].length, id)
  if (marked !== (kase === 'run' ? 3 : 1)) throw new Error(`${dev} ${kase} ${kind}: ${marked} days marked on his row`)
  const rowBox = await P.evaluate(i => { const r = document.querySelector(`td[data-testid^="cell-${i}-"]`).closest('tr').getBoundingClientRect(); return { y: r.top, h: r.height } }, id)
  const pk = await P.locator(q('bid-picker')).boundingBox()
  const vw = phone ? 402 : 1536, vh = phone ? 874 : 864
  /* cut to what the question is about (D1222): a few rows round his own, and the window's title */
  const y0 = Math.max(0, Math.min(rowBox.y - 110, pk.y - 10))
  const y1 = Math.min(vh, Math.max(rowBox.y + rowBox.h + 110, pk.y + 60))
  const file = path.join(RAW, `${dev}-${kase}-${kind}.png`)
  await P.screenshot({ path: file, clip: { x: 0, y: y0, width: vw, height: y1 - y0 } })
  await b.close()
  return file
}

const shots = {}
const CHECK = !!process.env.CHECK
for (const dev of ['phone', 'desktop']) for (const kase of ['day', 'run']) for (const kind of CHECK ? ['A', 'built'] : ['today', 'A', 'B']) {
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one picture after another, each in a fresh page
  shots[`${dev}-${kase}-${kind}`] = await shoot(dev, kase, kind)
}
if (CHECK) {
  for (const dev of ['phone', 'desktop']) for (const kase of ['day', 'run']) {
    const w = dev === 'phone' ? 330 : 900
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one sheet after another
    await compose(path.join(OUT, `check-${dev}-${kase}.png`), {
      title: `The build beside drawing A — ${kase === 'day' ? 'one day' : 'a three-day LL'}, ${dev === 'phone' ? 'the iPhone' : 'a desktop'}`,
      items: [{ tag: 'A', cap: 'the approved drawing', src: shots[`${dev}-${kase}-A`], w }, { tag: 'Built', cap: 'the app as built', src: shots[`${dev}-${kase}-built`], w }],
      colW: w, ...(dev === 'desktop' ? { stack: true } : {}),
    })
  }
  console.log('checked:', Object.keys(shots).length)
  process.exit(0)
}
const caps = { today: 'Today: the picked day is lost in his row', A: 'A (recommended): the selection\'s own stronger look, on his row only', B: 'B: a white ring, on his row only' }
for (const dev of ['phone', 'desktop']) for (const kase of ['day', 'run']) {
  const w = dev === 'phone' ? 330 : 900
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one sheet after another
  await compose(path.join(OUT, `${dev}-${kase}.png`), {
    title: `${kase === 'day' ? 'One day tapped (Tue 14 Jul)' : 'A three-day LL opened whole (21–23 Jul)'} on Saber’s own row — ${dev === 'phone' ? 'the iPhone' : 'a desktop'}`,
    sub: 'Real app. A and B change only how the picked days look on his own row; every other row stays as it is.',
    items: ['today', 'A', 'B'].map(k => ({ tag: k === 'today' ? 'Today' : k, cap: caps[k], src: shots[`${dev}-${kase}-${k}`], w })),
    colW: w, ...(dev === 'desktop' ? { stack: true } : {}),
  })
}
console.log('drawn:', Object.keys(shots).length)
