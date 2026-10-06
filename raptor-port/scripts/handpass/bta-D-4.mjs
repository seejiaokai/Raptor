/* Walker D — S30: Insights counts from Edit Schedule, the Board and View-only Sched, with a pending absence addition / removal and a hide. */
import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const T = 'S30'
const { browser, p, errors } = await K.fresh()

async function surf(name) {
  if (name === 'edit') { await W.boardOff(p).catch(() => {}); await B.toEdit(p) }
  else if (name === 'board') { await B.toEdit(p); await K.boardTo(p, TUE) }
  else { await W.boardOff(p).catch(() => {}); await L.go(p, 'viewsched'); await sleep(400) }
}
const typeLines = r => (Object.entries(r.secs).find(([k]) => /^conflicts/i.test(k)) || ['', []])[1]
const tueLine = r => ((Object.entries(r.secs).find(([k]) => /^by day/i.test(k)) || ['', []])[1].find(x => /^tue/i.test(x))) || '(no Tue row)'
async function readAll(tag) {
  const out = {}
  for (const s of ['edit', 'board', 'view']) {
    await surf(s)
    let r
    if (s === 'board') {
      /* the board covers the top bar's Insights button; it has its own (#sbInsights) */
      const b = p.locator('#sbInsights:visible').first()
      if (await b.count()) { await b.click(); await sleep(500); r = await K.readIns(p); r.how = "the board's own Insights button"; r.shot = await B.pic(p, `${tag}-${s}`); await K.closeIns(p) }
      else r = { none: true, how: 'no Insights button on the open board', shot: await B.pic(p, `${tag}-${s}-nobtn`) }
    } else r = await K.look(p, `${tag}-${s}`)
    out[s] = r
    if (s === 'board') await W.boardOff(p).catch(() => {})
  }
  await B.toEdit(p)
  return out
}
const brief = a => ['edit', 'board', 'view'].map(s => a[s].none ? `${s}: NO WINDOW (${a[s].how || ''})` : `${s}: tiles [${a[s].tiles.map(x => x.n + ' ' + x.l).join(' | ')}] Tue "${tueLine(a[s])}" leave-types [${typeLines(a[s]).filter(x => /leave|Downchit|but tasked/i.test(x)).join('; ') || '-'}] all types [${typeLines(a[s]).join('; ').slice(0, 220)}]`).join('  ||  ')
const fpOf = a => ['edit', 'board', 'view'].map(s => a[s].none ? 'NONE' : K.fp(a[s])).join('###')
const same3 = a => { const f = ['edit', 'board', 'view'].map(s => a[s].none ? 'NONE' : K.fp(a[s])); return f[0] === f[1] && f[1] === f[2] }
const shots = a => ['edit', 'board', 'view'].map(s => a[s].shot).filter(Boolean)
const lc = r => { if (r.none) return -1; const x = typeLines(r).find(t => /^On leave \+ flying/i.test(t)); const m = x && /(\d+)$/.exec(x); return m ? +m[1] : 0 }
const counts = a => ['edit', 'board', 'view'].map(s => lc(a[s]))
const hasLeave = a => counts(a).map(n => n)
try {
  const s0 = await D.seatBlank(p)
  const pub = await D.pub(p)
  const a = await readAll('dk-s30-a')
  R(`${T}.a`, `${CSN} on a blank flying line (took ${s0.took}), no absence; Tuesday signed and published. Insights opened from Edit Schedule, the Board and View-only Sched`, brief(a) + ` · "On leave + flying" count [edit, board, view]: ${JSON.stringify(counts(a))}`, 'RECORDED', shots(a))

  await D.file(p, 'LL', 'Walker D')
  const pw = await D.work(p, 'dk-s30-b-W', { puck: false })
  const b = await readAll('dk-s30-b')
  const eq = fpOf(b) === fpOf(a)
  R(`${T}.b`, `local leave all Tuesday filed AFTER publishing (working copy: "${pw.hd.pend}", ${pw.lines.length} absence line(s)); Insights re-read on all three`, brief(b) + ` · unchanged from step a: ${eq}`, eq && pw.lines.length === 1 ? 'PASS' : 'FAIL', [...shots(b), pw.shot].filter(Boolean))

  const am = await D.amend(p)
  const c = await readAll('dk-s30-c')
  R(`${T}.c`, `Publish AL1 (${JSON.stringify(am.r)}); Insights re-read`, brief(c) + ` · "On leave + flying" count on each surface [edit, board, view]: ${JSON.stringify(counts(c))} (step a: ${JSON.stringify(counts(a))}) · all three agree: ${same3(c)}`, same3(c) && counts(c).every(n => n === counts(a)[0] + 1) ? 'PASS' : 'FAIL', shots(c))

  const h = await B.hide(p, TUE, /On leave/)
  const hw = await D.work(p, 'dk-s30-d-W', { puck: false })
  const d = await readAll('dk-s30-d')
  R(`${T}.d`, `after AL1 the new warning's ✕ pressed on the working copy (${h}; working: "${hw.hd.pend}", line ${hw.lines.join(' / ').slice(0, 80)}); Insights re-read`, brief(d) + ` · unchanged from step c: ${fpOf(d) === fpOf(c)}`, fpOf(d) === fpOf(c) ? 'PASS' : 'FAIL', [...shots(d), hw.shot].filter(Boolean))

  const am2 = await D.amend(p)
  const e = await readAll('dk-s30-e')
  R(`${T}.e`, `Publish AL2 with the warning hidden (${JSON.stringify(am2.r)}); Insights re-read`, brief(e) + ` · "On leave + flying" count [edit, board, view]: ${JSON.stringify(counts(e))} · equals step a: ${fpOf(e) === fpOf(a)} · all three agree: ${same3(e)}`, same3(e) && counts(e).every(n => n === counts(a)[0]) ? 'PASS' : 'FAIL', shots(e))

  const u = await B.again(p, TUE, /On leave/)
  const uw = await D.work(p, 'dk-s30-f-W', { puck: false })
  const f = await readAll('dk-s30-f')
  R(`${T}.f`, `the ↺ pressed (${u}; working: "${uw.hd.pend}", line ${uw.lines.join(' / ').slice(0, 80)}); Insights re-read`, brief(f) + ` · unchanged from step e: ${fpOf(f) === fpOf(e)}`, fpOf(f) === fpOf(e) ? 'PASS' : 'FAIL', [...shots(f), uw.shot].filter(Boolean))

  const am3 = await D.amend(p)
  const g = await readAll('dk-s30-g')
  R(`${T}.g`, `Publish AL3 with the warning showing again (${JSON.stringify(am3.r)}); Insights re-read`, brief(g) + ` · "On leave + flying" count: ${JSON.stringify(counts(g))} · equals step c: ${fpOf(g) === fpOf(c)}`, same3(g) && counts(g).every(n => n === counts(a)[0] + 1) ? 'PASS' : 'FAIL', shots(g))

  const iids = await D.inputsOf(p)
  const mine = iids.find(x => x.includes(':' + ID + ':LL'))
  const lf = await D.lift(p, mine.split(':')[0])
  const lw = await D.work(p, 'dk-s30-h-W', { puck: false })
  const h2 = await readAll('dk-s30-h')
  R(`${T}.h`, `the leave lifted on the Inputs page (${lf}; working: "${lw.hd.pend}", ${lw.lines.length} absence line(s)); Insights re-read`, brief(h2) + ` · unchanged from step g: ${fpOf(h2) === fpOf(g)}`, fpOf(h2) === fpOf(g) && lw.lines.length === 0 ? 'PASS' : 'FAIL', [...shots(h2), lw.shot].filter(Boolean))

  const am4 = await D.amend(p)
  const i = await readAll('dk-s30-i')
  R(`${T}.i`, `Publish AL4 with the leave lifted (${JSON.stringify(am4.r)}); Insights re-read`, brief(i) + ` · "On leave + flying" count: ${JSON.stringify(counts(i))} · equals step a: ${fpOf(i) === fpOf(a)}`, same3(i) && counts(i).every(n => n === counts(a)[0]) ? 'PASS' : 'FAIL', shots(i))
} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 's30-X')]) }
R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-s30')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2400)}\n      pics ${(r.pics || []).join(' ')}`)
