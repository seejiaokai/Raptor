/* S23 — saved plans and versions. Part "plans": B + a blank crewed line on Tuesday; "+ Alt Plan" (a saved copy), clean it, switch back and
   forth. Part "versions": publish a version with the blank line, publish a second, look at the first and load it onto the working copy. Desktop. */
import * as K from './rbl-B-lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const T = K.TUE, M = K.MON
const part = process.argv[2] || 'all'
K.cleanPics(part === 'plans' ? ['s23p'] : part === 'versions' ? ['s23v'] : ['s23p', 's23v'])
const fm = s => (s.held.find(x => x.code === 'CREW_REST' && !x.off) || {}).msg || '(no crew-rest warning)'

async function menuRows(p, di) {
  await B.toEdit(p); await W.showDay(p, di)
  const m = p.locator(`#eWeek [data-planmenu="${di}"]:visible`).first()
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await sleep(400)
  return p.evaluate(() => [...document.querySelectorAll('.wm')].filter(e => e.offsetParent !== null).map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), sel: e.dataset.plansel || null, live: e.dataset.plangolive != null, pv: e.dataset.planpv || null, dup: e.dataset.plandup != null })))
}
async function plansPart() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, K.X)
    const b = await K.baseB(p)
    await K.addLine(p, T, b.t.gi); const fi = (await K.nLines(p, T, b.t.gi)) - 1
    const sb = await K.seat(p, T, b.t.gi, fi, 0, 'w', K.X)
    const s0 = await K.see(p, 's23p-0-orig')
    R('S23.P0', `Baseline B plus a blank "+ Line" on Tuesday (line ${fi}), ${cs} seated (took ${sb.took}) — the saved plan's contents`, K.says(s0), K.whole(s0) ? 'PASS' : 'FAIL', s0.pics)
    /* + Alt Plan */
    const rows0 = await menuRows(p, T)
    await p.locator('[data-plandup]:visible').first().click(); await sleep(900)
    const rows1 = await menuRows(p, T); await p.keyboard.press('Escape'); await sleep(250)
    const s1 = await K.see(p, 's23p-1-alt')
    R('S23.P1', `the plans menu "+ Alt Plan" (menu before: ${rows0.map(r => r.text.slice(0, 40)).join(' / ')}; after: ${rows1.map(r => r.text.slice(0, 40)).join(' / ')}) — the copy is now the live day`, K.says(s1), K.whole(s1) ? 'PASS' : 'FAIL', s1.pics)
    /* clean the alt plan: take him off Tuesday's timed line */
    const tk = await K.takeOff(p, T, `${T}.${b.t.gi}.0.0.w`)
    const s2 = await K.see(p, 's23p-2-clean')
    R('S23.P2', `in the copy, ${cs} dragged off Tuesday's ZT line (${tk}); he stays only on the blank line`, K.says(s2), !s2.breach && !s2.lines.length && !K.solidRing(s2.tuePaint) ? 'PASS' : 'FAIL', s2.pics)
    /* switch back to the first plan */
    const rows2 = await menuRows(p, T)
    const other = rows2.find(r => r.sel)
    if (!other) throw new Error('no other plan row: ' + JSON.stringify(rows2))
    await p.locator(`[data-plansel="${other.sel}"]:visible`).first().click(); await sleep(900)
    const s3 = await K.see(p, 's23p-3-switch-orig')
    R('S23.P3', `the plans menu: switched to "${other.text.slice(0, 50)}" (the first plan)`, K.says(s3), K.whole(s3) ? 'PASS' : 'FAIL', s3.pics)
    /* and back to the clean copy, then to the first again, then a reload */
    const rows3 = await menuRows(p, T); const o2 = rows3.find(r => r.sel)
    await p.locator(`[data-plansel="${o2.sel}"]:visible`).first().click(); await sleep(900)
    const s4 = await K.see(p, 's23p-4-switch-clean')
    R('S23.P4', `switched back to "${o2.text.slice(0, 50)}" (the clean copy)`, K.says(s4), !s4.breach && !s4.lines.length && !K.solidRing(s4.tuePaint) ? 'PASS' : 'FAIL', s4.pics)
    const rows4 = await menuRows(p, T); const o3 = rows4.find(r => r.sel)
    await p.locator(`[data-plansel="${o3.sel}"]:visible`).first().click(); await sleep(900)
    await B.reloadAs(p, 'a')
    const s5 = await K.see(p, 's23p-5-reload')
    R('S23.P5', `switched to the first plan again, then the page reloaded and signed in again`, K.says(s5), K.whole(s5) ? 'PASS' : 'FAIL', s5.pics)
  } catch (e) { R('S23.P', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 's23p-X')]) }
  R('S23.P.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
async function versionsPart() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, K.X)
    const b = await K.baseB(p)
    await K.addLine(p, T, b.t.gi); const fi = (await K.nLines(p, T, b.t.gi)) - 1
    const sb = await K.seat(p, T, b.t.gi, fi, 0, 'w', K.X)
    await B.toEdit(p); await B.pubOrig(p, M); await B.pubOrig(p, T)
    const v0 = await K.see(p, 's23v-0-orig'); v0.pics.push(await K.headPic(p, '#eWeek', T, 's23v-0-head'))
    R('S23.V0', `Baseline B plus a blank Tuesday line (${cs} seated, took ${sb.took}); Monday and Tuesday published (Original)`, `${K.says(v0)} · Tue ${K.hd(v0.head)}`, K.whole(v0) ? 'PASS' : 'FAIL', v0.pics)
    /* second version: the Tuesday Brief 05:00 -> 06:30, amended */
    await K.ff(p, T, b.t.gi, 0, 'br', '06:30')
    const pa = await B.pubAL(p, T)
    const v1 = await K.see(p, 's23v-1-al1'); v1.pics.push(await K.headPic(p, '#eWeek', T, 's23v-1-head'))
    R('S23.V1', `Tuesday's Brief typed 05:00 -> 06:30, sign-offs + Publish AL (${JSON.stringify(pa.r)})`, `${K.says(v1)} · warning "${fm(v1)}" · Tue ${K.hd(v1.head)}`, v1.breach && /06:30/.test(fm(v1)) && K.solidRing(v1.tuePaint) ? 'PASS' : 'FAIL', v1.pics)
    /* look at the Original — preview alone changes nothing */
    const vs = await B.versions(p, T); await p.keyboard.press('Escape'); await sleep(250)
    const lk = await B.look(p, T, /Original|ORIG/i)
    await sleep(500)
    const face = await B.lookFace(p, T)
    await B.openList(p, '#eWeek', T)
    const list = await B.readList(p, '#eWeek', T)
    const lines = (list.lines || []).filter(x => /Crew rest/i.test(x.text) && x.text.includes(cs))
    const fullL = await p.evaluate(([i, c]) => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .witem`)].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /Crew rest/.test(t) && t.includes(c)), [T, cs])
    const pkL = await B.dayPucks(p, '#eWeek', T, K.X)
    const pL = await picEl(p, `#eWeek .day[data-day="${T}"]`, 's23v-2-look-orig', { pad: 8, maxH: 800 })
    const full = await p.evaluate(([i, who]) => (window.WARN.byDay[i].warns || []).filter(w => (w.who || []).includes(who) && w.code === 'CREW_REST').map(w => w.msg), [T, K.X])
    R('S23.V2', `plans menu "Original" (read-only 👁 look) — versions offered: ${(vs.vs || []).map(x => x.label).join(' / ')}`, `look ${lk.err || lk.label} · face ${JSON.stringify(face)} · his crew rest line in the look, in full ${JSON.stringify(fullL)} · the working copy's own warning while looking: ${JSON.stringify(full)} · pucks [${B.pk(pkL)}]`, lines.length >= 1 ? 'RECORDED' : 'FAIL', [pL])
    const bk = await B.backLive(p, T)
    const v2 = await K.see(p, 's23v-3-back');
    R('S23.V3', `"Back to live copy" (${bk}) — the working copy must be unchanged by having looked`, `${K.says(v2)} · warning "${fm(v2)}"`, v2.breach && /06:30/.test(fm(v2)) ? 'PASS' : 'FAIL', v2.pics)
    /* load the Original onto the working copy */
    const lk2 = await B.look(p, T, /Original|ORIG/i); await sleep(400)
    const ld = await B.load(p, T, { confirm: true }); await sleep(900)
    const v3 = await K.see(p, 's23v-4-loaded'); v3.pics.push(await K.headPic(p, '#eWeek', T, 's23v-4-head'))
    R('S23.V4', `look at Original again and press "Load onto working copy" (${JSON.stringify(ld.said)}; confirm: ${ld.armed})`, `${K.says(v3)} · warning "${fm(v3)}" · Tue ${K.hd(v3.head)}`, v3.breach && /05:00/.test(fm(v3)) && /4h30/.test(fm(v3)) && K.solidRing(v3.tuePaint) ? 'PASS' : 'FAIL', v3.pics)
    await B.reloadAs(p, 'a')
    const v4 = await K.see(p, 's23v-5-reload')
    R('S23.V5', `the page reloaded and signed in again`, `${K.says(v4)} · warning "${fm(v4)}"`, v4.breach && /05:00/.test(fm(v4)) ? 'PASS' : 'FAIL', v4.pics)
  } catch (e) { R('S23.V', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 's23v-X')]) }
  R('S23.V.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
if (part === 'plans' || part === 'all') await plansPart()
if (part === 'versions' || part === 'all') await versionsPart()
B.savePart('s23-' + part)
