/* Published-day independence (the paragraph after the orders table): publish Tuesday leaving Monday unpublished, change Monday's
   late end; and the converse — a published Monday's working copy changed before its amendment. Desktop. */
import * as K from './rbl-B-lib.mjs'
const { B, W, L, R, pic, sleep } = K
const T = K.TUE, M = K.MON
const w0 = process.argv[2] || 'all'
K.cleanPics(w0 === 'a' ? ['ind-a'] : w0 === 'b' ? ['ind-b'] : ['ind-a', 'ind-b'])
const fullMsg = s => (s.held.find(x => x.code === 'CREW_REST' && !x.off) || {}).msg || '(no crew-rest warning)'
const same = (a, b) => a.tag === b.tag && a.pending === b.pending && a.nys === b.nys && a.signed === b.signed && JSON.stringify(a.signs) === JSON.stringify(b.signs)

async function indA() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, K.X)
    const b = await K.baseB(p)
    await B.toEdit(p)
    const pt = await B.pubOrig(p, T)
    const a0 = await K.see(p, 'ind-a0')
    const h0 = a0.head
    a0.pics.push(await K.headPic(p, '#eWeek', T, 'ind-a0-head'))
    R('IND-A0', `Baseline B (took ${b.tookM}/${b.tookT}); sign-offs + Publish on TUESDAY only (${JSON.stringify(pt.r)}); Monday left unpublished`,
      `${K.says(a0)} · Tue ${K.hd(h0)} · Mon ${K.hd(a0.headMon)}`, K.whole(a0) && h0.tag === 'ORIG' && /CUR CK\S/.test(h0.signed) ? 'PASS' : 'FAIL', a0.pics)

    /* Monday's landing 22:30 -> 21:00 */
    await K.ff(p, M, b.m.gi, 0, 'ld', '21:00')
    const a1 = await K.see(p, 'ind-a1'); a1.pics.push(await K.headPic(p, '#eWeek', T, 'ind-a1-head'))
    R('IND-A1', `Monday (still a draft): the landing of ZM typed 22:30 -> 21:00 through the board`,
      `${K.says(a1)} · warning text "${fullMsg(a1)}" · Tue ${K.hd(a1.head)}`,
      a1.breach && /21:00/.test(fullMsg(a1)) && a1.ringTue && a1.dotMon && same(h0, a1.head) ? 'PASS' : 'FAIL', a1.pics)
    /* 21:00 -> 14:00 : clear */
    await K.ff(p, M, b.m.gi, 0, 'to', '09:00'); await K.ff(p, M, b.m.gi, 0, 'ld', '10:30')
    const a2 = await K.see(p, 'ind-a2'); a2.pics.push(await K.headPic(p, '#eWeek', T, 'ind-a2-head'))
    const v2 = await K.see(p, 'ind-a2-view', { surf: '#vWeek' })
    R('IND-A2', `Monday's ZM take-off typed 20:00 -> 09:00 and landing 21:00 -> 10:30 (flight now ends 12:30, rest clear); then View-only Sched`,
      `Edit: ${K.says(a2)} · Tue ${K.hd(a2.head)} || View-only: ${K.says(v2)}`,
      !a2.breach && !a2.lines.length && !a2.dotMon && !v2.breach && !v2.lines.length && same(h0, a2.head) ? 'PASS' : 'FAIL', [...a2.pics, ...v2.pics])
    /* back to 22:30 */
    await K.ff(p, M, b.m.gi, 0, 'to', '20:00'); await K.ff(p, M, b.m.gi, 0, 'ld', '22:30')
    const a3 = await K.see(p, 'ind-a3'); a3.pics.push(await K.headPic(p, '#eWeek', T, 'ind-a3-head'))
    const v3 = await K.see(p, 'ind-a3-view', { surf: '#vWeek' })
    R('IND-A3', `Monday's take-off typed back to 20:00 and landing to 22:30; Edit Schedule then View-only Sched`,
      `Edit: ${K.says(a3)} · warning "${fullMsg(a3)}" · Tue ${K.hd(a3.head)} || View-only: ${K.says(v3)}`,
      K.whole(a3) && fullMsg(a3) === fullMsg(a0) && same(h0, a3.head) && v3.breach && v3.ringTue && v3.dotMon ? 'PASS' : 'FAIL', [...a3.pics, ...v3.pics])
    /* a REAL edit on the published day's own line (the control for "pending") */
    await K.ff(p, T, b.t.gi, 0, 'to', '07:30')
    const a4 = await K.see(p, 'ind-a4', { pics: false }); a4.pics.push(await K.headPic(p, '#eWeek', T, 'ind-a4-head'))
    R('IND-A4', `control: a REAL edit on Tuesday's own published line — ZT take-off 07:00 -> 07:30`,
      `Tue ${K.hd(a4.head)} (before: ${K.hd(h0)}) · warning "${fullMsg(a4)}"`, 'RECORDED', a4.pics)
  } catch (e) { R('IND-A', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'ind-a-X')]) }
  R('IND-A.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function indB() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, K.X)
    const b = await K.baseB(p)
    await B.toEdit(p)
    await B.pubOrig(p, M); await B.pubOrig(p, T)
    const b0 = await K.see(p, 'ind-b0'); const h0 = b0.head, m0 = b0.headMon
    b0.pics.push(await K.headPic(p, '#eWeek', M, 'ind-b0-monhead'))
    R('IND-B0', `Baseline B (took ${b.tookM}/${b.tookT}); Monday AND Tuesday published (Original)`,
      `${K.says(b0)} · Tue ${K.hd(h0)} · Mon ${K.hd(m0)}`, K.whole(b0) ? 'PASS' : 'FAIL', b0.pics)
    /* Monday's WORKING copy changes: landing 22:30 -> 14:00 — not yet amended */
    await K.ff(p, M, b.m.gi, 0, 'to', '09:00'); await K.ff(p, M, b.m.gi, 0, 'ld', '10:30')
    const b1 = await K.see(p, 'ind-b1'); b1.pics.push(await K.headPic(p, '#eWeek', M, 'ind-b1-monhead'))
    const v1 = await K.see(p, 'ind-b1-view', { surf: '#vWeek' })
    R('IND-B1', `Monday (published, working copy only): ZM take-off 20:00 -> 09:00 and landing 22:30 -> 10:30 (rest would be clear), NOT amended`,
      `Edit Schedule (working copy): ${K.says(b1)} · warning "${fullMsg(b1)}" · Tue ${K.hd(b1.head)} · Mon ${K.hd(b1.headMon)} || View-only Sched (issued face): ${K.says(v1)}`,
      /* the verdict is the ISSUED face (View-only Sched): Monday's issued end must hold until its amendment; Edit Schedule is the working copy and is only recorded */
      v1.ringTue && v1.dotMon && v1.lines.some(x => /22:30/.test(x.text)) && same(h0, b1.head) && /pending/.test(b1.headMon.pending || '') ? 'PASS' : 'FAIL', [...b1.pics, ...v1.pics])
    /* amend Monday */
    const pa = await B.pubAL(p, M)
    const b2 = await K.see(p, 'ind-b2'); b2.pics.push(await K.headPic(p, '#eWeek', T, 'ind-b2-head'))
    const v2 = await K.see(p, 'ind-b2-view', { surf: '#vWeek' })
    R('IND-B2', `Monday's amendment published (sign-offs + Publish AL: ${JSON.stringify(pa.r)})`,
      `Edit: ${K.says(b2)} · Tue ${K.hd(b2.head)} · Mon ${K.hd(b2.headMon)} || View-only: ${K.says(v2)}`,
      !b2.breach && !b2.lines.length && !b2.dotMon && !v2.breach && same(h0, b2.head) ? 'PASS' : 'FAIL', [...b2.pics, ...v2.pics])
  } catch (e) { R('IND-B', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'ind-b-X')]) }
  R('IND-B.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
const w = process.argv[2] || 'all'
if (w === 'a' || w === 'all') await indA()
if (w === 'b' || w === 'all') await indB()
B.savePart('indep-' + w)
