// sa208-wB-probe — walker B's proof of the borrowed helpers' first steps on the chat 208 build (walk-scripts §1), and a
// read of the demo week's SANS filings, sims and SANS lines. Run from raptor-port/:  SZ=d|p node scripts/handpass/sa208-wB-probe.mjs
import './sa208-wB-env.mjs'
const B = await import('./scc-w1B-lib.mjs')
const { Z, T, L, W5, J, sleep, OUT, fileS } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wB-probe 1 · size', SZ, '· out', OUT)
await T.run('probe', SZ, Z.scene(async (p, W) => {
  const bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(' '))
  W.rec('bundle', 'the served bundle', 'REC', bundle)
  /* the week's SANS filings (read only) */
  const f = await p.evaluate(() => (window.INPUTS || []).filter(r => r.sans).map(r => ({ iid: r.iid, who: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p).join('+') || (window.PEOPLE[r.person] || {}).cs, date: r.date, end: r.endDate || r.to || '', sans: r.sans, allday: r.allday, half: r.half, s: r.s, e: r.e })))
  W.rec('filings', 'SANS filings in the store', 'REC', J(f))
  const sansMen = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([, q]) => q.san || q.sanFrom).map(([id, q]) => `${id}=${q.cs}${q.sanFrom ? ' from ' + q.sanFrom : ''}${q.seat ? ' ' + q.seat : ''}`))
  W.rec('sansmen', 'the SANS men', 'REC', J(sansMen))
  for (let di = 0; di < 7; di++) {
    const sims = await p.evaluate(i => { const s = window.DAYS[i].sims || {}; return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, (v || []).map(r => ({ label: r.label, str: r.str, end: r.end, ppl: JSON.stringify(r).match(/"(p|w|x\d*)":"[a-z]+"/g) }))])) }, di)
    const l = await Z.readOpen(p, W, '#eWeek', di)
    W.rec('day' + di, `day ${di}: sims and SANS lines`, 'REC', `sims ${J(sims)} · ${Z.listSay({ ...l, lines: l.lines.filter(x => /SANS/.test(x.text)) })}`)
  }
  /* helper steps: a sim row added and timed, a man tapped in, the line read, hidden */
  const s = await W5.addSim(p, W, 3, 'oft', 'EP-9', '10:00', '11:00')
  W.rec('addSim', 'W5.addSim on Thu: OFT EP-9 10:00–11:00', s.r && s.r.str === '10:00' ? true : false, J(s))
  const t = await Z.plan(p, W, 3, `s:3.oft.${s.ri}.p`, 'cards', 'probe-plant')
  W.rec('plan', 'Marlin tapped into it', t.placed, `note "${t.toast}"`, t.pic)
  await L.closeBoard(p, W)
  const l = await Z.readOpen(p, W, '#eWeek', 3)
  const m = l.lines.find(x => /Marlin/.test(x.text) && /SANS/.test(x.text))
  W.rec('line', 'his SANS line on Thu', !!m, Z.listSay(l), await Z.listPic(p, W, '#eWeek', 3, 'probe-list'))
  if (m) { await Z.tapLine(p, W, '#eWeek', 3, m.ix, 'probe-hide'); const l2 = await Z.readOpen(p, W, '#eWeek', 3); W.rec('hide', 'hidden by its ✕', !!l2.lines.find(x => x.ix === m.ix && x.hid), Z.listSay(l2)) }
  const fi = await fileS(p, W, '2026-07-16', 'cards', ['oft'], 'all')
  W.rec('fileS', 'fileS: Marlin OFT all day Thu', !!fi.iid, J(fi))
}))
console.log('DONE')
process.exit(0)
