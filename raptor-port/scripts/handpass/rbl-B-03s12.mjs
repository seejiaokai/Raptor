/* S12 — a hidden crew-rest breach and blank crewed lines, in both orders (blank-then-hide, hide-then-blank), reload,
   sign out / in, unhide, a real report-time change; and the published-day door (D471). Argument: hidefirst | blankfirst | published */
import * as K from './rbl-B-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const T = K.TUE, M = K.MON
const mode = process.argv[2] || 'hidefirst'
const sz = B.PHONE ? 'phone' : 'desktop'
const ID = `S12-${mode}-${sz}`
K.cleanPics([`s12${mode}`])
const P = s => `s12${mode}-${s}`
const RE = /Crew rest.*Scribe/
const redChip = ps => ps.some(x => x.chip === 'R')
const redAny = a => a.some(x => (x.oc || '').includes('240, 85, 95') || (x.bs || '').includes('240, 85, 95'))
const hiddenOK = s => !s.breach && s.breachHid && s.lines.some(x => x.struck && /Crew rest/.test(x.text)) && !s.lines.some(x => !x.struck && /Crew rest/.test(x.text)) && !redAny(s.tuePaint) && !redAny(s.monPaint) && !redChip(s.tue) && !redChip(s.mon) && !(s.monTrace || []).some(x => /Scribe/.test(x.text))
const nIss = s => (/(\d+) issue/.exec(s.list.bar || '') || [])[1] || '?'
const rest = s => `${K.says(s)} · issues ${nIss(s)}`

const { browser, p, errors } = await K.fresh()
async function blankOn(di, gi, mon = false) {
  await K.addLine(p, di, gi); const fi = (await K.nLines(p, di, gi)) - 1
  const st = await K.seat(p, di, gi, fi, 0, 'w', K.X)
  return { fi, took: st.took }
}
try {
  const cs = await B.csOf(p, K.X)
  const b = await K.baseB(p)
  const s0 = await K.see(p, P('0-base'))
  R(`${ID}.0`, `${sz}: Baseline B (took ${b.tookM}/${b.tookT}), nothing hidden`, rest(s0), K.whole(s0) ? 'PASS' : 'FAIL', s0.pics)
  let tb = null, mb = null
  if (mode === 'blankfirst') {
    tb = await blankOn(T, b.t.gi); mb = await blankOn(M, b.m.gi)
    const s = await K.see(p, P('1-blank'))
    R(`${ID}.1`, `${sz}: "+ Line" on Tuesday and on Monday, ${cs} seated on each (took ${tb.took}/${mb.took})`, rest(s), K.whole(s) ? 'PASS' : 'FAIL', s.pics)
  }
  if (mode === 'published') {
    await B.toEdit(p); await B.pubOrig(p, M); await B.pubOrig(p, T)
    const s = await K.see(p, P('1-pub')); s.pics.push(await K.headPic(p, '#eWeek', T, P('1-pub-head')))
    R(`${ID}.1`, `${sz}: Monday and Tuesday published (Original)`, `${rest(s)} · Tue ${K.hd(s.head)}`, K.whole(s) ? 'PASS' : 'FAIL', s.pics)
  }
  /* hide the breach */
  const h = await B.hide(p, T, RE)
  const s2 = await K.see(p, P('2-hidden'))
  if (mode === 'published') {
    s2.pics.push(await K.headPic(p, '#eWeek', T, P('2-hidden-head')))
    const v = await K.see(p, P('2-hidden-view'), { surf: '#vWeek' })
    R(`${ID}.2`, `${sz}: on the PUBLISHED Tuesday press ✕ on the breach line (${h})`,
      `Edit Schedule: ${rest(s2)} · Tue ${K.hd(s2.head)} || View-only Sched: ${rest(v)}`, 'RECORDED', [...s2.pics, ...v.pics])
  } else {
    R(`${ID}.2`, `${sz}: press ✕ on Scribe's breach line on Tuesday (${h})`, rest(s2), hiddenOK(s2) ? 'PASS' : 'FAIL', s2.pics)
  }
  if (mode === 'hidefirst') {
    /* add a blank crewed line on Tuesday (and Monday) AFTER hiding */
    tb = await blankOn(T, b.t.gi)
    const s3 = await K.see(p, P('3-blankTue'))
    R(`${ID}.3`, `${sz}: then "+ Line" on Tuesday, ${cs} seated on it (took ${tb.took})`, rest(s3), hiddenOK(s3) ? 'PASS' : 'FAIL', s3.pics)
    /* Undo / Redo of that step: the top bar's own buttons */
    const u = await W.door(p, 'top', 'undo'); const s3u = await K.see(p, P('3-undo'), { pics: false })
    const r = await W.door(p, 'top', 'redo'); const s3r = await K.see(p, P('3-redo'))
    R(`${ID}.3u`, `${sz}: top-bar Undo (${u.pressed ? 'pressed' : JSON.stringify(u)}) then Redo (${r.pressed ? 'pressed' : JSON.stringify(r)})`,
      `after Undo: ${rest(s3u)} || after Redo: ${rest(s3r)}`, hiddenOK(s3u) && hiddenOK(s3r) ? 'PASS' : 'FAIL', s3r.pics)
    mb = await blankOn(M, b.m.gi)
    const s4 = await K.see(p, P('4-blankMon'))
    R(`${ID}.4`, `${sz}: "+ Line" on Monday, ${cs} seated (took ${mb.took})`, rest(s4), hiddenOK(s4) ? 'PASS' : 'FAIL', s4.pics)
  }
  if (mode !== 'published') {
    /* take him off the blank Tuesday line, add a blank WAVE with him on it, then Sort all */
    const tk = await K.takeOff(p, T, `${T}.${b.t.gi}.${tb.fi}.0.w`)
    const w2 = await K.addFlyWave(p, T); const sw = await K.seat(p, T, w2.gi, 0, 0, 'w', K.X)
    let sortMsg = 'not pressed'
    await W.boardOn(p, T); await sleep(300)
    if (B.PHONE) { await p.locator('#sbMore').click(); await sleep(250); const it = p.locator('#sbMoreSort:visible').first(); if (await it.count()) { await it.click(); sortMsg = 'pressed via ... menu' } }
    else { const bt = p.locator('#sbSortAll:visible').first(); if (await bt.count()) { await bt.click(); sortMsg = 'pressed' } }
    await sleep(500)
    const cf = p.locator('#sortAllConfirm:visible').first(); if (await cf.count()) { await cf.click(); sortMsg += ' + confirmed'; await sleep(700) }
    const s5 = await K.see(p, P('5-wave-sort'))
    R(`${ID}.5`, `${sz}: took ${cs} off the blank Tuesday line (${tk}), "+ Wave" with ${cs} on its blank line (took ${sw.took}), Sort all (${sortMsg})`, rest(s5), hiddenOK(s5) ? 'PASS' : 'FAIL', s5.pics)
    /* reload, then sign out and in */
    await B.reloadAs(p, 'a'); await B.toEdit(p)
    const s6 = await K.see(p, P('6-reload'))
    R(`${ID}.6`, `${sz}: the page reloaded and signed in again`, rest(s6), hiddenOK(s6) ? 'PASS' : 'FAIL', s6.pics)
    await W2.signOut(p); await L.signIn(p, 'a', { goto: false }); await B.toEdit(p)
    const s7 = await K.see(p, P('7-signout'))
    R(`${ID}.7`, `${sz}: signed out and signed in again`, rest(s7), hiddenOK(s7) ? 'PASS' : 'FAIL', s7.pics)
  }
  /* unhide */
  const u1 = await B.again(p, T, RE)
  const s8 = await K.see(p, P('8-unhid'))
  if (mode === 'published') {
    s8.pics.push(await K.headPic(p, '#eWeek', T, P('8-unhid-head')))
    R(`${ID}.8`, `${sz}: press ↺ on the published Tuesday's line (${u1})`, `${rest(s8)} · Tue ${K.hd(s8.head)}`, K.whole(s8) ? 'PASS' : 'FAIL', s8.pics)
  } else {
    R(`${ID}.8`, `${sz}: press ↺ on the struck line (${u1})`, rest(s8), K.whole(s8) ? 'PASS' : 'FAIL', s8.pics)
  }
  if (mode !== 'published') {
    /* hide again, then a REAL report-time change: Brief 05:00 -> 05:30 */
    const h2 = await B.hide(p, T, RE)
    const s9 = await K.see(p, P('9-hidden-again'), { pics: false })
    const gz = await p.evaluate(i => window.DAYS[i].waves.findIndex(w => w.formations.some(f => f.cs === 'ZT')), T)   /* Sort all moves waves: find ZT again */
    await K.ff(p, T, gz, 0, 'br', '05:30')
    const s10 = await K.see(p, P('10-newtime'))
    const m10 = (s10.held.find(x => x.code === 'CREW_REST' && !x.off) || {}).msg || '(none live)'
    R(`${ID}.10`, `${sz}: hid it again (${h2}; hidden: ${hiddenOK(s9)}), then typed the Tuesday Brief 05:00 -> 05:30 (a real report-time change)`,
      `${rest(s10)} · live warning "${m10}"`, s10.breach && /05:30/.test(m10) && redAny(s10.tuePaint) && s10.lines.some(x => !x.struck && /Crew rest/.test(x.text)) ? 'PASS' : 'FAIL', s10.pics)
  }
} catch (e) { R(`${ID}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, P('X'))]) }
R(`${ID}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('s12-' + mode)
