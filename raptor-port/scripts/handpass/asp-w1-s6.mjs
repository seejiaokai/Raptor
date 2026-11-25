// asp-w1-s6 — S6: from S1's published Saturday, OIL Earn: Hex's earning on the event switched off, the amendment
// published; switched on again, amended again; the crowd read both ways ("+ SANS" on and off) after each.
// Run from raptor-port/:  ONLY=d|p node scripts/handpass/asp-w1-s6.mjs
import * as L from './asp-w1-lib.mjs'
const { sleep, J, HEX, SAT, SAT_ISO, B } = L
const VERSION = 'asp-w1-s6 v2'
const ONLY = (process.env.ONLY || 'd,p').split(',')
console.log(VERSION, L.URL_, ONLY.join(','))

/* in OIL Earn, the window's "Who earns OIL" tab: tap Hex's seat; returns his seat's state before and after */
async function flipHex(p, W, ri) {
  const o = await L.openChip(p, W, '#schedBoard', SAT, ri)
  const seatSel = `.availwin .seat.oilpk[data-oilp="${HEX}"]`
  if (!(await p.locator(seatSel + ':visible').count())) { const t = p.locator('.availwin .win-tab').nth(1); if (await t.count()) await W.press(p, t, 'earn-tab') }
  const before = (await L.readWin(p)).earnSeat
  const picBefore = await W.pic(p, 'earn-before')
  await W.press(p, p.locator(seatSel).filter({ visible: true }).first(), 'hex-seat'); await sleep(500)
  const after = await L.readWin(p)
  const picAfter = await W.pic(p, 'earn-after')
  /* the who-is-available half: Hex still there */
  const t0 = p.locator('.availwin .win-tab').nth(0); if (await t0.count()) await W.press(p, t0, 'avail-tab')
  const avail = await L.readWin(p)
  const picAvail = await W.pic(p, 'avail-tab')
  await L.closeWin(p, W)
  return { chip: o.chip, before, after: after.earnSeat, avail, pics: [picBefore, picAfter, picAvail].join(', ') }
}

async function run(k) {
  const sz = L.SIZES[k], RUN = 's6-' + sz.name
  L.clearRun(RUN)
  const W = L.mk(RUN, 's6', sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    const F = await L.publishedFixture(p, W)
    const cells = [F.lw]
    for (const [i, want] of [[1, 'off'], [2, 'on']]) {
      await L.openBoard(p, W, SAT)
      const om = await L.oilEarn(p, W, true)
      const f = await flipHex(p, W, F.evRi)
      W.rec(`s6-0${i}a`, `OIL Earn (${om}): Hex's earning on the event switched ${want}; he stays in the who-is-available half`, f.after === want && f.avail.has === true && f.avail.n === F.base.n, `seat ${f.before} → ${f.after} · avail tab Hex ${f.avail.has} n ${f.avail.n} (published ${F.base.n}) · chip ${J(f.chip)}`, f.pics)
      await L.oilEarn(p, W, false)
      const pe = await L.pendingOf(p, SAT)
      await L.signAll(p)
      const pt = await L.publish(p, W, SAT, 'publish-al')
      const pe2 = await L.pendingOf(p, SAT)
      W.rec(`s6-0${i}b`, `the amendment published (${pt})`, pe.pend >= 1 && pe2.pend === 0, `before ${J(pe)} · after ${J(pe2)}`, await W.pic(p, `0${i}b-al-published`))
      await L.closeBoard(p, W)
      const lw = await L.lwCell(p, W, HEX, SAT_ISO)
      cells.push(lw.text)
      W.rec(`s6-0${i}c`, `RECORD — Hex's Leave War cell Sat 18 Jul after the amendment with his event earning ${want}`, null, `cell "${lw.text}"`, await W.pic(p, `0${i}c-lw-cell`))
      for (const on of [true, false]) {
        const s = await L.sansOnWar(p, W, on, `0${i}d-sans-${on ? 'on' : 'off'}`)
        const S = await L.satLook(p, W, `0${i}e-${on ? 'on' : 'off'}`, F.evRi)
        W.rec(`s6-0${i}${on ? 'd' : 'e'}`, `"+ SANS" ${on ? 'on' : 'off'}: Hex in the window, same count, nothing pending`, s.groupAfter === on && S.win.has === true && S.win.n === F.base.n && S.pe.pend === 0, `pending ${S.pe.pend} · window ${J(S.win)}`, [s.pic, S.picDay, S.picWin].join(', '))
      }
    }
    W.rec('s6-03', 'RECORD — Hex\'s cell through the three publications (published → earning off → earning on)', /^FO/.test(cells[0]) && /^FO/.test(cells[2]) ? null : null, cells.join(' → '))
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}
for (const k of ONLY) await run(k)
L.saveResults('s6-' + ONLY.join('_'))
console.log('done')
