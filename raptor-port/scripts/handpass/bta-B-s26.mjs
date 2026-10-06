/* S26 — ATT C Mon–Fri; blank flying lines Mon..Fri with X; all five days published; an Upchit filed effective Wednesday;
   then the Upchit's date moved to Thursday. Which days read "N pending", what each day's working copy and issued face say. */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, P6, W2, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s26')
const DAYS = [0, 1, 2, 3, 4]
const down = r => r.away.some(x => /Downchit but planned to fly/.test(x))

async function snap(p, tag, noPics = true) {
  const out = {}
  for (const di of DAYS) {
    const r = await Q.readDay(p, di, tag, { noPics })
    await B.toEdit(p); await W.showDay(p, di)
    const h = await B.head(p, di)
    out[di] = { r, pend: (h && h.pending) || '', tagv: (h && h.tag) || '', signs: h ? h.signs.filter(s => s && !/name/i.test(s)).length : -1 }
  }
  return out
}
const line = (o, di) => `${Q.DOW[di]}: working ${o[di].r.away.length ? (down(o[di].r) ? 'DOWN (Downchit but planned to fly this line)' : JSON.stringify(o[di].r.away)) : 'silent'} · version "${o[di].tagv}" · pending "${o[di].pend || 'none'}" · sign-offs filled ${o[di].signs}/4`
const sayAll = o => DAYS.map(di => line(o, di)).join(' || ')

const { browser, p, errors } = await K.fresh()
try {
  const seats = await Q.seatDays(p, DAYS)
  const f = await T.file(p, { type: 'ATT C', di: 0, toDi: 4, allday: true, remarks: 'Flu week' })
  const s0 = await snap(p, 's26-0')
  t.add('S26.0', `blank flying lines Mon–Fri (${CSN} on each, took ${DAYS.map(d => seats[d].took).join('/')}); ATT C Mon 13 → Fri 17 filed (stored: ${await T.rec(p, f.iid)}; asked ${f.asked.join(',') || 'nothing'})`, sayAll(s0), DAYS.every(d => down(s0[d].r)) ? 'PASS' : 'FAIL', [...s0[1].r.s.pics])

  const pubs = []
  for (const di of DAYS) { const x = await B.pubOrig(p, di); pubs.push(`${Q.DOW[di].slice(0, 3)}: ${JSON.stringify(x.r)}`) }
  const s1 = await snap(p, 's26-1', false)
  t.add('S26.1', `all five days signed (the four selects) and published (${pubs.join('; ')})`, sayAll(s1), DAYS.every(d => down(s1[d].r) && !/pending/i.test(s1[d].pend)) ? 'PASS' : 'FAIL', [...s1[2].r.s.pics])

  const u = await T.file(p, { type: 'Upchit', di: 2, allday: true, remarks: 'Fit from Wed' })
  const s2 = await snap(p, 's26-2', false)
  const wins = {}
  for (const di of [0, 2]) { const a = await B.auth(p, di); wins[di] = a.win && a.win.out ? `${a.win.out.outHead} — ${a.win.out.out.map(o => o.where + ' ' + o.chg).join(' || ') || '(nothing listed)'}` : 'window not opened' }
  t.add('S26.2', `the pending lists the day's own count opens — Mon: ${wins[0]} | Wed: ${wins[2]}; an Upchit filed effective Wed 15 (sheet: "${u.upSheet}"; stored: ${await T.rec(p, u.iid)}; his inputs now ${JSON.stringify(await T.recAll(p))})`, sayAll(s2),
    down(s2[0].r) && down(s2[1].r) && !down(s2[2].r) && !down(s2[3].r) && !down(s2[4].r) && !/pending/i.test(s2[0].pend) && !/pending/i.test(s2[1].pend) && /pending/i.test(s2[2].pend) && /pending/i.test(s2[3].pend) && /pending/i.test(s2[4].pend) ? 'PASS' : 'FAIL', [u.upPic, ...s2[2].r.s.pics, ...s2[1].r.s.pics])

  /* move the Upchit to Thursday through the Inputs row's own editor */
  let moved = 'not done'
  if (await W2.openEdit(p, u.iid)) {
    await T.walkCal(p, '#inedCal', T.ISO(3))
    if ((await p.locator('#inBody tr.ined .rc-read').first().innerText()).includes('→')) await T.walkCal(p, '#inedCal', T.ISO(3))
    const readCal = (await p.locator('#inBody tr.ined .rc-read').first().innerText()).trim()
    await pic(p, 's26-move-editor'); await T.W2.toastSpy(p); await p.locator('#inBody tr.ined [data-save]').first().click(); await sleep(700)
    const asked = []
    for (let i = 0; i < 4; i++) {
      if (await p.locator('[data-testid="upconf"]:visible').count()) { asked.push('upchit-sheet: ' + (await p.locator('[data-testid="upconf"]:visible').first().innerText()).replace(/\s+/g, ' ')); await pic(p, 's26-move-sheet'); const nl = await p.locator('[data-testid^="upconf-left-"]:visible').count(); for (let k = 0; k < nl; k++) await p.locator(`[data-testid="upconf-left-${k}"] button.upconf-seg`).nth(0).click(); await p.locator('[data-testid="upconf-save"]:visible').click(); await sleep(700); continue }
      const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await sleep(500); continue }
      break
    }
    const tt = await T.W2.toasts(p)
    moved = `toasts ${JSON.stringify(tt)}; editor calendar read "${readCal}"; asked ${asked.join(' | ') || 'nothing'}`
  }
  const s3 = await snap(p, 's26-3', false)
  const wins3 = {}
  for (const di of [0, 2, 3]) { const a = await B.auth(p, di); wins3[di] = a.win && a.win.out ? `${a.win.out.outHead} — ${a.win.out.out.map(o => o.where + ' ' + o.chg).join(' || ') || '(nothing listed)'}` : 'window not opened' }
  t.add('S26.3', `the pending lists after the move — Mon: ${wins3[0]} | Wed: ${wins3[2]} | Thu: ${wins3[3]}; the Upchit's date moved from Wed 15 to Thu 16 in the Inputs row editor (${moved}); his inputs now ${JSON.stringify(await T.recAll(p))}`, sayAll(s3),
    down(s3[0].r) && down(s3[1].r) && down(s3[2].r) && !down(s3[3].r) && !down(s3[4].r) && !/pending/i.test(s3[0].pend) && !/pending/i.test(s3[1].pend) && !/pending/i.test(s3[2].pend) && /pending/i.test(s3[3].pend) && /pending/i.test(s3[4].pend) ? 'PASS' : 'FAIL', [...s3[2].r.s.pics, ...s3[3].r.s.pics])

  await B.reloadAs(p, 'a'); await B.toEdit(p)
  const s4 = await snap(p, 's26-4')
  t.add('S26.4', 'reload and sign in again', sayAll(s4), DAYS.every(d => down(s4[d].r) === down(s3[d].r) && (/pending/i.test(s4[d].pend) === /pending/i.test(s3[d].pend))) ? 'PASS' : 'FAIL')

  /* the issued face of Wed and Thu as the member sees it */
  const mem = {}
  for (const di of [2, 3]) { mem[di] = await B.member(p, di, [ID], `s26-face-${Q.DOW[di].slice(0, 3)}`); }
  t.add('S26.5', "View-only Sched (signed in as the member) — the issued face of Wed 15 and Thu 16", [2, 3].map(di => `${Q.DOW[di]}: bar "${mem[di].list.bar}" lines ${JSON.stringify(mem[di].list.lines.filter(x => x.text.includes(CSN)).map(x => x.text.slice(0, 100)))} pucks ${B.pk(mem[di].pks[ID])} head ${JSON.stringify(mem[di].hd && { tag: mem[di].hd.tag, pend: mem[di].hd.pend, signed: mem[di].hd.signed })}`).join(' || '), 'RECORDED', [mem[2].shot, mem[3].shot])
  await B.admin(p)
} catch (e) { R('S26.X', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's26-X')]) }
R('S26.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s26')
