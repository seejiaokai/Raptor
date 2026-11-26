/* THE COMPLEX DAY's pictures of the real running app (stage2.mjs staged it), in HIS look: his seven colours, colour and a
   line, only the newest amendment out and the waiting ones lined, the number on the newest puck and a tab on older ones,
   and the missing-time outline on the boxes staged empty. Each screen is pictured whole, cut into slices at the tops of
   its sections so no picture is taller than about two phone screens.
     img/cx-{edit,view,board}-{phone,desktop}-N.png        Monday, AL7 waiting (View-only Sched shows AL6 as its newest)
     img/cxd-{edit,board}-{phone,desktop}-N.png            Tuesday, the draft: grey outlines, no amendments
     capture/complex.json                                  how many slices each has, and what was counted on each screen
   Run from raptor-port/: GW_URL=… GW_STATE=… node docs/mock/2026-11-26-al-colours/shoot2.mjs */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const HERE = dirname(fileURLToPath(import.meta.url)), IMG = join(HERE, 'img'); mkdirSync(IMG, { recursive: true })
const CSS = readFileSync(join(HERE, 'src/looks.css'), 'utf8'), JS = readFileSync(join(HERE, 'src/looks.js'), 'utf8'), MJS = readFileSync(join(HERE, 'src/measure.js'), 'utf8')
for (const f of readdirSync(IMG)) if (/^cxd?-/.test(f)) rmSync(join(IMG, f))
const out = { slices: {}, counts: {}, clearance: [] }

async function his(p, root, miss) {
  return p.evaluate(([root, miss, CSS, JS, MJS]) => {
    if (!document.getElementById('alx-css')) { const s = document.createElement('style'); s.id = 'alx-css'; s.textContent = CSS; document.head.appendChild(s) }
    if (!window.ALX) (0, eval)(JS)
    if (!window.ALXmeasure) (0, eval)(MJS)
    const A = window.ALX, r = document.querySelector(root)
    document.querySelectorAll('.alx-key').forEach(k => k.remove())
    A.palette(A.HIS); A.look(document.documentElement, { look: 'c', puck: 'mix' }); A.key(r); A.underline(r, '3')
    const boxes = A.missing(r, miss)
    /* what is on this screen: marks by amendment, lined or colour only, pucks, outlines */
    const c = { outlines: boxes, lined: {}, colourOnly: {}, pucks: {}, waiting: 0 }
    for (const e of r.querySelectorAll('[data-alc]:not(.verchip):not(.alx-k), [data-aln]')) { if (!e.getBoundingClientRect().width || e.closest('.alpanel')) continue
      const n = e.getAttribute('data-aln') || e.getAttribute('data-alc')
      if (e.classList.contains('seat')) c.pucks[n] = (c.pucks[n] || 0) + 1
      else if (e.hasAttribute('data-aln')) c.waiting++
      else { const k = e.classList.contains('alx-nl') ? 'colourOnly' : 'lined'; c[k][n] = (c[k][n] || 0) + 1 } }
    return c
  }, [root, miss, CSS, JS, MJS])
}
/* the whole of one screen's day, in slices cut at section tops */
async function whole(p, sz, name, root) {
  const vw = sz.opts.viewport.width
  let h = 3000
  for (let i = 0; i < 3; i++) {
    await p.setViewportSize({ width: vw, height: h }); await K.wait(p, 500)
    const need = await p.evaluate(root => { const r = document.querySelector(root); let extra = 0
      for (const e of [r, ...r.querySelectorAll('*')]) { const cs = getComputedStyle(e); if (/auto|scroll/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4) extra = Math.max(extra, e.scrollHeight - e.clientHeight) }
      const b = r.getBoundingClientRect(); return { extra, bottom: b.bottom + scrollY, vh: innerHeight, docExtra: document.documentElement.scrollHeight - innerHeight } }, root)
    const want = Math.ceil(Math.max(need.vh + need.extra, need.bottom + 40, need.vh + need.docExtra))
    if (want <= h + 4) break
    h = Math.min(want + 60, 14000)
  }
  const info = await p.evaluate(root => { const r = document.querySelector(root); r.scrollIntoView({ block: 'start' }); window.scrollTo(0, 0)
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    const b = r.getBoundingClientRect()
    const tops = [...r.querySelectorAll('.sec, .sb-sec, .go, .sb-go')].map(e => e.getBoundingClientRect().top).filter(t => t > b.top + 40 && t < b.bottom - 40).sort((x, y) => x - y)
    return { x: b.left, y: b.top, w: b.width, h: b.height, tops } }, root)
  await K.wait(p, 400)
  const MAX = K.isPhone(sz) ? 1500 : 1400, cuts = [info.y]
  const end = Math.min(info.y + info.h, h)
  for (;;) { const from = cuts[cuts.length - 1]; if (end - from <= MAX) break
    const fit = info.tops.filter(t => t > from + 300 && t <= from + MAX); cuts.push(fit.length ? fit[fit.length - 1] - 6 : from + MAX) }
  cuts.push(end)
  const x = Math.max(0, info.x - 4), width = Math.min(vw - x, info.w + 8)
  for (let i = 0; i < cuts.length - 1; i++) await p.screenshot({ path: join(IMG, `${name}-${sz.name}-${i + 1}.png`), clip: { x, y: Math.max(0, cuts[i]), width, height: cuts[i + 1] - Math.max(0, cuts[i]) } })
  out.slices[`${name}-${sz.name}`] = cuts.length - 1
  K.log('  pictures', `${name}-${sz.name}`, cuts.length - 1, 'slices of a day', Math.round(info.h), 'tall')
  await p.setViewportSize(sz.opts.viewport)
}
const EDIT = n => `#eWeek .day[data-day="${n}"]`, VIEW = n => `#vWeek .day[data-day="${n}"]`, BOARD = '#schedBoard'
const toView = async (p, di) => { await p.evaluate(di => { const d = document.querySelector(`#vWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollTo(0, 0) }, di); await K.wait(p, 600) }
const measure = async (p, sz, surface, root) => out.clearance.push({ surface, size: sz.name, rows: await p.evaluate(r => window.ALXmeasure(r), root) })

for (const key of ['d', 'p']) {
  const w = await K.world(key, join(K.STATE, 'cx-waiting.json')), p = w.p, sz = w.sz
  await K.signIn(p)
  /* View-only Sched: the published face (AL6 its newest), no outline */
  await toView(p, 0); out.counts[`view-${sz.name}`] = await his(p, VIEW(0), 'off'); await whole(p, sz, 'cx-view', VIEW(0)); await his(p, VIEW(0), 'off'); await measure(p, sz, 'View Schedule', VIEW(0))
  /* Edit Schedule: Monday with AL7 waiting, then Tuesday the draft */
  await K.weekDay(p, sz, 0); await K.neutral(p)
  out.counts[`edit-${sz.name}`] = await his(p, EDIT(0), 'red'); await whole(p, sz, 'cx-edit', EDIT(0)); await his(p, EDIT(0), 'red'); await measure(p, sz, 'Edit Schedule', EDIT(0))
  await K.weekDay(p, sz, 1); await K.neutral(p)
  out.counts[`draft-edit-${sz.name}`] = await his(p, EDIT(1), 'grey'); await whole(p, sz, 'cxd-edit', EDIT(1))
  /* the Scheduler Board: the same two days */
  await K.board(p, sz, 0); await K.neutral(p)
  out.counts[`board-${sz.name}`] = await his(p, BOARD, 'red'); await whole(p, sz, 'cx-board', BOARD); await his(p, BOARD, 'red'); await measure(p, sz, 'Scheduler Board', BOARD)
  if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
  await w.b.close()
  const w2 = await K.world(key, join(K.STATE, 'cx-waiting.json')), q = w2.p
  await K.signIn(q); await K.weekDay(q, w2.sz, 1); await K.board(q, w2.sz, 1); await K.neutral(q)
  out.counts[`draft-board-${sz.name}`] = await his(q, BOARD, 'grey'); await whole(q, w2.sz, 'cxd-board', BOARD)
  if (q.errs.length) K.log('ERRORS', q.errs.join(' | '))
  await w2.b.close()
}
writeFileSync(join(HERE, 'capture', 'complex.json'), JSON.stringify(out, null, 1))
let worst = { gap: 1e9 }, n = 0
for (const c of out.clearance) for (const r of c.rows) { n++; if (r.gap != null && r.gap < worst.gap) worst = { ...r, at: c.surface + ', ' + c.size } }
K.log('clearance on the complex day:', n, 'lines, tightest', worst.gap, worst.place, worst.at, '→', worst.to)
K.log('counts', JSON.stringify(out.counts))
