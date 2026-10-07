/* The action pairs of my share, the order NOT covered by S03 / S12 / S23 / S27: a Logic setting changed BEFORE the blank line (and the blank line
   before the setting); a blank line added AFTER Publish and AFTER the amendment; a blank line added inside a saved plan (plan first). Desktop. */
import * as K from './rbl-B-lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const T = K.TUE, M = K.MON
const which = process.argv[2] || 'all'
K.cleanPics(['ord'])
const msgOf = s => (s.held.find(x => x.code === 'CREW_REST' && !x.off) || {}).msg || '(no crew-rest warning)'
const sameHead = (a, b) => !!a && !!b && a.tag === b.tag && a.pending === b.pending && a.nys === b.nys && a.signed === b.signed

async function logicOrders() {
  /* ORDER 1: the setting first, then the blank line */
  {
    const { browser, p, errors } = await K.fresh()
    try {
      const cs = await B.csOf(p, K.X)
      const orig = await K.logicRead(p, 'crewRest')
      const r = await K.logicSet(p, 'crewRest', '10h')
      const b = await K.baseB(p)
      const s1 = await K.see(p, 'ord-l1-a')
      R('ORD-LOGIC.1a', `setting first: Logic "Crew rest" ${r.before} -> 10h, then Baseline B built (took ${b.tookM}/${b.tookT})`, `${K.says(s1)} · warning "${msgOf(s1)}"`, s1.breach && /clear at 10:30/.test(msgOf(s1)) && s1.ringTue ? 'PASS' : 'FAIL', s1.pics)
      await K.addLine(p, T, b.t.gi); const fi = (await K.nLines(p, T, b.t.gi)) - 1
      const sb = await K.seat(p, T, b.t.gi, fi, 0, 'w', K.X)
      const s2 = await K.see(p, 'ord-l1-b')
      R('ORD-LOGIC.1b', `then a blank "+ Line" on Tuesday, ${cs} seated (took ${sb.took})`, `${K.says(s2)} · warning "${msgOf(s2)}"`, s2.breach && msgOf(s2) === msgOf(s1) && s2.ringTue ? 'PASS' : 'FAIL', s2.pics)
      await K.logicSet(p, 'crewRest', orig)
      const s3 = await K.see(p, 'ord-l1-c')
      R('ORD-LOGIC.1c', `then the setting restored to ${orig}`, `${K.says(s3)} · warning "${msgOf(s3)}"`, s3.breach && /clear at 12:30/.test(msgOf(s3)) && /only 4h30/.test(msgOf(s3)) && K.whole(s3) ? 'PASS' : 'FAIL', s3.pics)
    } catch (e) { R('ORD-LOGIC.1', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'ord-l1-X')]) }
    R('ORD-LOGIC.1.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
    await browser.close()
  }
  /* ORDER 2: the blank line first, then the setting */
  {
    const { browser, p, errors } = await K.fresh()
    try {
      const cs = await B.csOf(p, K.X)
      const b = await K.baseB(p)
      await K.addLine(p, T, b.t.gi); const fi = (await K.nLines(p, T, b.t.gi)) - 1
      const sb = await K.seat(p, T, b.t.gi, fi, 0, 'w', K.X)
      const s0 = await K.see(p, 'ord-l2-a')
      R('ORD-LOGIC.2a', `blank first: Baseline B built (took ${b.tookM}/${b.tookT}), a blank Tuesday line with ${cs} (took ${sb.took})`, `${K.says(s0)} · warning "${msgOf(s0)}"`, K.whole(s0) ? 'PASS' : 'FAIL', s0.pics)
      const orig = await K.logicRead(p, 'crewRest')
      const r = await K.logicSet(p, 'crewRest', '10h')
      const s1 = await K.see(p, 'ord-l2-b')
      R('ORD-LOGIC.2b', `then Logic "Crew rest" ${r.before} -> 10h`, `${K.says(s1)} · warning "${msgOf(s1)}"`, s1.breach && /clear at 10:30/.test(msgOf(s1)) && s1.ringTue ? 'PASS' : 'FAIL', s1.pics)
      await K.logicSet(p, 'crewRest', orig)
      const s2 = await K.see(p, 'ord-l2-c')
      R('ORD-LOGIC.2c', `then the setting restored to ${orig}`, `${K.says(s2)} · warning "${msgOf(s2)}"`, K.whole(s2) && msgOf(s2) === msgOf(s0) ? 'PASS' : 'FAIL', s2.pics)
    } catch (e) { R('ORD-LOGIC.2', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'ord-l2-X')]) }
    R('ORD-LOGIC.2.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
    await browser.close()
  }
}

async function pubOrders() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, K.X)
    const b = await K.baseB(p)
    await B.toEdit(p); await B.pubOrig(p, M); await B.pubOrig(p, T)
    const s0 = await K.see(p, 'ord-p-0'); const hT0 = s0.head, hM0 = s0.headMon
    s0.pics.push(await K.headPic(p, '#eWeek', T, 'ord-p-0-head'))
    R('ORD-PUB.0', `Baseline B (took ${b.tookM}/${b.tookT}); Monday and Tuesday published (Original)`, `${K.says(s0)} · Tue ${K.hd(hT0)} · Mon ${K.hd(hM0)}`, K.whole(s0) ? 'PASS' : 'FAIL', s0.pics)
    /* a blank line added to MONDAY (the day before) after both are published */
    await K.addLine(p, M, b.m.gi); const fm = (await K.nLines(p, M, b.m.gi)) - 1
    const sm = await K.seat(p, M, b.m.gi, fm, 0, 'w', K.X)
    const s1 = await K.see(p, 'ord-p-1'); s1.pics.push(await K.headPic(p, '#eWeek', T, 'ord-p-1-tuehead')); s1.pics.push(await K.headPic(p, '#eWeek', M, 'ord-p-1-monhead'))
    const v1 = await K.see(p, 'ord-p-1-view', { surf: '#vWeek' })
    R('ORD-PUB.1', `after publishing: a blank "+ Line" on the PUBLISHED Monday, ${cs} seated (took ${sm.took}) — a real edit of Monday's lines`,
      `Edit: ${K.says(s1)} · Tue ${K.hd(s1.head)} (was ${K.hd(hT0)}) · Mon ${K.hd(s1.headMon)} (was ${K.hd(hM0)}) || View-only: ${K.says(v1)}`,
      K.whole(s1) && sameHead(hT0, s1.head) && /pending/.test(s1.headMon.pending || '') && v1.lines.some(x => /Crew rest/.test(x.text)) && v1.dotMon ? 'PASS' : 'FAIL', [...s1.pics, ...v1.pics])
    /* a blank line added to TUESDAY after publication */
    await K.addLine(p, T, b.t.gi); const ft = (await K.nLines(p, T, b.t.gi)) - 1
    const st = await K.seat(p, T, b.t.gi, ft, 0, 'w', K.X)
    const s2 = await K.see(p, 'ord-p-2'); s2.pics.push(await K.headPic(p, '#eWeek', T, 'ord-p-2-tuehead'))
    const v2 = await K.see(p, 'ord-p-2-view', { surf: '#vWeek' })
    R('ORD-PUB.2', `a blank "+ Line" on the PUBLISHED Tuesday too, ${cs} seated (took ${st.took}) — a real edit of Tuesday's lines`,
      `Edit: ${K.says(s2)} · Tue ${K.hd(s2.head)} || View-only (the issued face): ${K.says(v2)}`,
      K.whole(s2) && /pending/.test(s2.head.pending || '') && v2.lines.some(x => /Crew rest/.test(x.text)) && v2.dotMon ? 'PASS' : 'FAIL', [...s2.pics, ...v2.pics])
    /* amend both */
    const pm = await B.pubAL(p, M); const pt = await B.pubAL(p, T)
    const s3 = await K.see(p, 'ord-p-3'); s3.pics.push(await K.headPic(p, '#eWeek', T, 'ord-p-3-tuehead'))
    const v3 = await K.see(p, 'ord-p-3-view', { surf: '#vWeek' })
    R('ORD-PUB.3', `Publish AL on Monday (${JSON.stringify(pm.r)}) then on Tuesday (${JSON.stringify(pt.r)})`,
      `Edit: ${K.says(s3)} · Tue ${K.hd(s3.head)} · Mon ${K.hd(s3.headMon)} || View-only: ${K.says(v3)}`,
      K.whole(s3) && !/pending/.test(s3.head.pending || '') && /AL1/.test(s3.head.tag) && v3.lines.some(x => /Crew rest/.test(x.text)) && v3.dotMon ? 'PASS' : 'FAIL', [...s3.pics, ...v3.pics])
  } catch (e) { R('ORD-PUB', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'ord-p-X')]) }
  R('ORD-PUB.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function planOrders() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, K.X)
    const b = await K.baseB(p)
    /* the plan first: + Alt Plan on Tuesday, THEN the blank line inside the copy */
    await B.toEdit(p); await W.showDay(p, T)
    const m = p.locator(`#eWeek [data-planmenu="${T}"]:visible`).first(); await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await sleep(400)
    await p.locator('[data-plandup]:visible').first().click(); await sleep(900)
    const s0 = await K.see(p, 'ord-q-0')
    R('ORD-PLAN.0', `Baseline B (took ${b.tookM}/${b.tookT}); plans menu "+ Alt Plan" on Tuesday (the copy is now live)`, K.says(s0), K.whole(s0) ? 'PASS' : 'FAIL', s0.pics)
    await K.addLine(p, T, b.t.gi); const fi = (await K.nLines(p, T, b.t.gi)) - 1
    const sb = await K.seat(p, T, b.t.gi, fi, 0, 'w', K.X)
    const s1 = await K.see(p, 'ord-q-1')
    R('ORD-PLAN.1', `inside the copy: a blank "+ Line", ${cs} seated (took ${sb.took})`, K.says(s1), K.whole(s1) ? 'PASS' : 'FAIL', s1.pics)
    const rows = async () => { await B.toEdit(p); await W.showDay(p, T); const mm = p.locator(`#eWeek [data-planmenu="${T}"]:visible`).first(); await mm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await mm.click(); await sleep(400); return p.evaluate(() => [...document.querySelectorAll('.wm')].filter(e => e.offsetParent !== null).map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), sel: e.dataset.plansel || null }))) }
    const r1 = await rows(); const o = r1.find(r => r.sel)
    await p.locator(`[data-plansel="${o.sel}"]:visible`).first().click(); await sleep(900)
    const n1 = await K.nLines(p, T, b.t.gi)
    const s2 = await K.see(p, 'ord-q-2')
    R('ORD-PLAN.2', `switched to the first plan "${o.text.slice(0, 40)}" (no blank line there: Tuesday's last wave now has ${n1} line(s))`, K.says(s2), K.whole(s2) && n1 === 1 ? 'PASS' : 'FAIL', s2.pics)
    const r2 = await rows(); const o2 = r2.find(r => r.sel)
    await p.locator(`[data-plansel="${o2.sel}"]:visible`).first().click(); await sleep(900)
    const n2 = await K.nLines(p, T, b.t.gi)
    const s3 = await K.see(p, 'ord-q-3')
    R('ORD-PLAN.3', `switched back to the copy "${o2.text.slice(0, 40)}" (Tuesday's last wave has ${n2} lines)`, K.says(s3), K.whole(s3) && n2 === 2 ? 'PASS' : 'FAIL', s3.pics)
  } catch (e) { R('ORD-PLAN', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'ord-q-X')]) }
  R('ORD-PLAN.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
if (which === 'logic' || which === 'all') await logicOrders()
if (which === 'pub' || which === 'all') await pubOrders()
if (which === 'plan' || which === 'all') await planOrders()
B.savePart('orders-' + which)
