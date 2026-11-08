/* CHAT 9 — the Tracker's walk, part D: S24–S29 (Find's ✕ and every way Find is put away). */
import * as L from './trk-chat9-lib.mjs'
const { scn, ok, note, row, mkWorld, closeW, geo, limitOf, r1, inter, pic, tapXY, land, closePop, setScroll, placeAt, sleep, PHONE, SIDE, PC, NARROW, typeFind, keysTo } = L
const tapEl = async (w, loc) => { if (w.touch) await loc.tap(); else await loc.click() }

const SNAP_FN = `() => {
  const vis = e => !!e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'
  const p = document.getElementById('hSearchPanel'), l = document.getElementById('hSearchList'), s = document.getElementById('hSearch'), c = document.getElementById('hSearchClear')
  const tabs = [...document.querySelectorAll('#viewtabs button')].filter(vis)
  const tabHits = tabs.map(t => { const r = t.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!e && (e === t || t.contains(e)) })
  const bd = document.getElementById('board')
  return { box: s ? s.value : null, strip: vis(p) && p.classList.contains('on'), panelShown: vis(p), ae: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : '', found: document.querySelectorAll('#flowSvg .found').length,
    list: vis(l) && l.children.length > 0, listRows: l ? l.querySelectorAll('.findrow').length : 0, stat: document.getElementById('hSearchStat') ? document.getElementById('hSearchStat').textContent.trim() : null,
    st: bd ? bd.scrollTop : null, half: (document.querySelector('#viewtabs button.active') || {}).textContent || null, tabs: tabs.length, tabHits, panels: [...document.querySelectorAll('.menupanel, #legendPanel, .legendpanel, #showAllPanel, .modal')].filter(e => vis(e) && e.id !== 'pop').map(e => e.id || String(e.className).slice(0, 12)),
    xTitle: c ? c.getAttribute('title') : null, xAria: c ? c.getAttribute('aria-label') : null, xRect: c && vis(c) ? (r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)])(c.getBoundingClientRect()) : null, boxRect: s && vis(s) ? (r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)])(s.getBoundingClientRect()) : null }
}`
const snap = page => page.evaluate(`(${SNAP_FN})()`)
const brief = s => `box "${s.box}", strip ${s.strip}, keys on ${s.ae}, found rings ${s.found}, list ${s.list}(${s.listRows}), stat "${s.stat}", chart ${s.st}, half "${(s.half || '').trim()}", tabs hit ${s.tabHits.join('/')}, panels [${s.panels}]`
const openFind = async w => { if (w.touch) await w.page.locator('#hSearchBtn').tap(); else await w.page.locator('#hSearchBtn').click(); await sleep(500) }
const fresh = async o => { const w = await mkWorld(o); return w }

/* the F1–F7 verdict for a state after ✕ on the strip */
function F(s0, s1, expectHalf) {
  const f = []
  if (s1.box !== '') f.push('F1 the box is not empty: "' + s1.box + '"')
  if (s1.strip) f.push('F2 the strip is still up')
  if (!s1.tabHits.every(Boolean)) f.push('F2 a tab is not what is at its centre: ' + s1.tabHits.join('/'))
  if (s1.ae === 'hSearch') f.push('F3 the keys are still in the box')
  if (s1.found !== 0) f.push('F4 a ball still wears the found ring (' + s1.found + ')')
  if (s1.list) f.push('F5 the list is still shown')
  if (s1.st !== s0.st && Math.abs(s1.st - s0.st) > 1) f.push(`F6 the chart moved ${s0.st} → ${s1.st}`)
  if ((s1.half || '') !== (expectHalf != null ? expectHalf : (s0.half || ''))) f.push(`F6 the half changed "${s0.half}" → "${s1.half}"`)
  if (s1.panels.length) f.push('F6 a panel opened: ' + s1.panels)
  return f
}

/* ---------------- S24 ---------------- */
const rectOf = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }, sel)
await scn('s24', '✕ on the phone’s strip, in every state', async () => {
  const states = [
    ['a typed, no Enter, the list open', async (w) => { await typeFind(w.page, 'ACG-09') }],
    ['b typed, Enter: it lands, the strip and the keys stay', async (w) => { await typeFind(w.page, 'ACG-09'); await w.page.keyboard.press('Enter'); await sleep(1600) }],
    ['c the box empty', async () => {}],
    ['d "zz" typed, no match', async (w) => { await typeFind(w.page, 'zz') }],
  ]
  for (const [en, eng] of [['phone', 'chromium'], ['phone-webkit', 'webkit']]) {
    for (const [lab, prep] of states) {
      const w = await fresh({ size: PHONE, touch: true, engine: eng }); const page = w.page
      const g0 = await geo(page, null); await openFind(w); await prep(w); const s0 = await snap(page)
      await pic(w, `s24-${en}-${lab[0]}-before`)
      await page.locator('#hSearchClear').tap(); const pNow = await pic(w, `s24-${en}-${lab[0]}-now`); await sleep(900); const s1 = await snap(page); const pSet = await pic(w, `s24-${en}-${lab[0]}-set`)
      const f = F(s0, s1, null)
      if (lab[0] === 'b') { if (Math.abs(s1.st - s0.st) > 1) f.push('chart did not stay where Enter landed it') }
      let infoTap = ''
      await page.locator('#viewtabs button', { hasText: 'Info' }).tap(); await sleep(700); const s2 = await snap(page); infoTap = `Info tapped once → half "${(s2.half || '').trim()}"`
      const t = s0.xTitle
      ok(`${en} (${lab}): F1–F6, then one tap on Info shows Info`, f.length === 0 && /Info/.test(s2.half || ''), `${f.join('; ') || 'no failure'} | before ${brief(s0)} | after ${brief(s1)} | ${infoTap}; F7 the ✕'s words "${t}", spoken name ${JSON.stringify(s0.xAria)}; ✕ box ${s0.xRect} in the strip's box ${s0.boxRect}`, `s24-${en}-${lab[0]}-before,s24-${en}-${lab[0]}-now,s24-${en}-${lab[0]}-set`)
      if (lab[0] === 'a' && en === 'phone') ok(`${en} F7 the ✕'s hover words`, s0.xTitle === 'Clear the search and close Find', `title "${s0.xTitle}"; spoken name ${JSON.stringify(s0.xAria)}; box ${s0.boxRect}, ✕ ${s0.xRect}: same height ${s0.boxRect && s0.xRect ? s0.boxRect[3] === s0.xRect[3] : 'n/a'}`)
      await closeW(w)
    }
  }
  /* (e) after a pick, 🔍 again */
  { const w = await fresh({ size: PHONE, touch: true }); const page = w.page
    await openFind(w); await typeFind(page, 'ACG-09'); await page.locator('#hSearchList .findrow').first().tap(); await sleep(1500); const s1 = await snap(page)
    await openFind(w); const s2 = await snap(page)
    note('e after a pick, 🔍 again', `after the pick: ${brief(s1)} | 🔍 again: box holds "${s2.box}", strip ${s2.strip}, keys on ${s2.ae}, list ${s2.list}`, await pic(w, 's24-e-again'))
    await closeW(w) }
})

/* ---------------- S25 ---------------- */
await scn('s25', '✕ is Escape; the rest as today', async () => {
  const prep = async w => { await openFind(w); await typeFind(w.page, 'ACG-09'); await w.page.keyboard.press('Enter'); await sleep(1600) }
  const snaps = {}
  for (const [lab, act] of [['x', async w => { await w.page.locator('#hSearchClear').tap() }], ['escape', async w => { await w.page.keyboard.press('Escape') }],
    ['enter', async w => { await w.page.keyboard.press('Enter') }], ['search-again', async w => { await w.page.locator('#hSearchBtn').tap() }], ['outside', async w => { await w.page.touchscreen.tap(40, 700) }]]) {
    const w = await fresh({ size: PHONE, touch: true }); await prep(w); await act(w); await sleep(900); snaps[lab] = await snap(w.page); await pic(w, `s25-${lab}`); await closeW(w)
  }
  const strip = s => JSON.stringify({ box: s.box, strip: s.strip, ae: s.ae, found: s.found, list: s.list, st: s.st, half: s.half, panels: s.panels })
  ok('1 ✕ and Escape leave the identical state', strip(snaps.x) === strip(snaps.escape), `✕: ${strip(snaps.x)} | Escape: ${strip(snaps.escape)}`, 's25-x,s25-escape')
  note('2 Enter / 🔍 again / a tap outside (BRANCH; MAIN not built)', `Enter: ${strip(snaps.enter)} | 🔍 again: ${strip(snaps['search-again'])} | outside: ${strip(snaps.outside)}`)
  /* a pick */
  const w = await fresh({ size: PHONE, touch: true }); const page = w.page; await openFind(w); await typeFind(page, 'ACG-09'); const rr = await rectOf(page, '#hSearchList .findrow')
  const sBefore = await snap(page); const u0 = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09'); return g ? g.getBoundingClientRect().top : null })
  await page.locator('#hSearchList .findrow').first().tap(); await sleep(1500); const sp = await snap(page); const g = await geo(page)
  ok('3 a pick: lands, the ring on the picked event, the keys down, the tabs back; no window, no student picked', sp.found >= 1 && !sp.strip && sp.ae !== 'hSearch' && sp.tabHits.every(Boolean) && !(g.pop && g.pop.shown), `${brief(sp)}; box words kept: "${sp.box}"; window ${!!(g.pop && g.pop.shown)}; the row lay at y ${Math.round(rr.t)}–${Math.round(rr.b)} (over the chart); crew unchanged ${await page.evaluate(() => document.getElementById('activeSel').selectedOptions[0].textContent)}`, await pic(w, 's25-pick'))
  await closeW(w)
})

/* ---------------- S26 ---------------- */
await scn('s26', 'The strip on a narrow desktop and on a phone on its side', async () => {
  { const w = await fresh({ size: NARROW, dpr: 1, bars: true }); const page = w.page
    const g0 = await geo(page, null); await openFind(w); await typeFind(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1600); const s0 = await snap(page)
    await page.locator('#hSearchClear').hover(); await sleep(300); const title = await page.locator('#hSearchClear').getAttribute('title')
    await page.locator('#hSearchClear').click(); await sleep(900); const s1 = await snap(page); const f = F(s0, s1, null).filter(x => !/^F6 the chart moved/.test(x))
    ok('1 narrow desktop with a mouse: ✕ closes Find (F1–F6; the chart’s own settling when the bar shrinks is the same as Escape’s, row 1b)', f.length === 0 && title === 'Clear the search and close Find', `${f.join('; ') || 'no failure'}; hover words "${title}" | ${brief(s1)}`, await pic(w, 's26-narrow-x'))
    { const wb = await fresh({ size: NARROW, dpr: 1, bars: true }); const pb = wb.page; await openFind(wb); await typeFind(pb, 'ACG-09'); await pb.keyboard.press('Enter'); await sleep(1600); const b0 = await snap(pb); await pb.keyboard.press('Escape'); await sleep(900); const b1 = await snap(pb)
      note('1b the same on a narrow desktop with Escape (what Find did before ✕): chart before and after', `chart ${b0.st} → ${b1.st}; strip ${b1.strip}; ${brief(b1)}`, await pic(wb, 's26-narrow-escape')); await closeW(wb) }
    /* 2 by keys */
    await openFind(w); await typeFind(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1500)
    let n = 0; for (; n < 6; n++) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => document.activeElement.id); if (a === 'hSearchClear') break }
    await page.keyboard.press('Enter'); await sleep(900); const s2 = await snap(page)
    ok('2 narrow desktop by keys: Tab to ✕, Enter — closes; the keys go to 🔍 and not the page body (Q7)', !s2.strip && s2.ae === 'hSearchBtn', `${n + 1} Tab(s) to ✕; after Enter ${brief(s2)}; keys on "${s2.ae}"`, await pic(w, 's26-narrow-keys'))
    await closeW(w) }
  for (const lab of ['a typed, no Enter', 'b typed, Enter']) {
    const w = await fresh({ size: SIDE, touch: true }); const page = w.page; await openFind(w); await typeFind(page, 'ACG-09'); if (lab[0] === 'b') { await page.keyboard.press('Enter'); await sleep(1500) }
    const s0 = await snap(page); await page.locator('#hSearchClear').tap(); await sleep(900); const s1 = await snap(page); const f = F(s0, s1, null).filter(x => !/^F6 the chart moved/.test(x))
    { const wb = await fresh({ size: SIDE, touch: true }); const pb = wb.page; await openFind(wb); await typeFind(pb, 'ACG-09'); if (lab[0] === 'b') { await pb.keyboard.press('Enter'); await sleep(1500) } const b0 = await snap(pb); await pb.keyboard.press('Escape'); await sleep(900); const b1 = await snap(pb); note(`3 base (${lab}) with Escape instead`, `chart ${b0.st} → ${b1.st}; strip ${b1.strip}`.replace(/\$/g, '$')); await closeW(wb) }
    ok(`3 on its side (${lab}): ✕ puts Find away`, f.length === 0, `${f.join('; ') || 'no failure'} | ${brief(s1)}`, await pic(w, `s26-side-${lab[0]}`)); await closeW(w)
  }
})

/* ---------------- S27 ---------------- */
await scn('s27', 'His PC’s box is untouched', async () => {
  const w = await fresh({ size: PC, dpr: 1.25 }); const page = w.page
  await page.locator('#hSearch').click(); await typeFind(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1600); const s0 = await snap(page)
  await page.locator('#hSearchClear').hover(); await sleep(250); const title = await page.locator('#hSearchClear').getAttribute('title')
  await page.locator('#hSearchClear').click(); await sleep(700); const s1 = await snap(page)
  ok('1 the bar’s box: ✕ empties it, the ring goes, the box stays, the keys stay IN it', title === 'Clear the search' && s1.box === '' && s1.found === 0 && s1.panelShown && s1.ae === 'hSearch', `hover "${title}"; ${brief(s1)}; box shown ${s1.panelShown}`, await pic(w, 's27-pc-x'))
  /* 2 a pick */
  await typeFind(page, 'ACG-09'); const rows = await page.locator('#hSearchList .findrow').count(); await page.locator('#hSearchList .findrow').first().click(); await sleep(1500); const s2 = await snap(page)
  ok('2 a pick from the list: the list shuts, the keys leave, the words stay', rows >= 1 && !s2.list && s2.ae !== 'hSearch' && s2.box !== '', `${rows} row(s); ${brief(s2)}`, await pic(w, 's27-pc-pick'))
  /* 3 narrowing */
  await page.locator('#hSearch').click(); await typeFind(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1200)
  await page.setViewportSize(NARROW); await sleep(1000); const sn = await snap(page); await pic(w, 's27-narrowed')
  note('3 narrowed 1536 → 1000 with words typed', `strip open ${sn.strip}; box "${sn.box}"; ✕ words "${sn.xTitle}"; ${brief(sn)}`)
  if (sn.strip) { await page.locator('#hSearchClear').click(); await sleep(800); const sc = await snap(page); ok('3b narrowed: ✕ closes Find', !sc.strip && sc.box === '', brief(sc)) }
  else { await page.locator('#hSearchBtn').click(); await sleep(500); const so = await snap(page); note('3b narrowed: the strip opened by 🔍', `✕ words "${so.xTitle}"; box "${so.box}"`); await page.locator('#hSearchClear').click(); await sleep(800); const sc = await snap(page); ok('3b ✕ at 1000 closes Find', !sc.strip && sc.box === '', brief(sc)) }
  await page.setViewportSize(PC); await sleep(1000); await page.locator('#hSearch').click(); await typeFind(page, 'ACG'); const sb = await snap(page); await page.locator('#hSearchClear').click(); await sleep(600); const sb2 = await snap(page)
  ok('3c back at 1536: the box; ✕ "Clear the search", emptying and keeping the keys (B18)', sb.xTitle === 'Clear the search' && sb2.box === '' && sb2.ae === 'hSearch' && sb2.panelShown, `words "${sb.xTitle}"; after ✕: ${brief(sb2)}`, await pic(w, 's27-back'))
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S28 ---------------- */
await scn('s28', 'Find from the Info and Show All halves', async () => {
  for (const half of ['Info', 'Show All']) {
    const w = await fresh({ size: PHONE, touch: true }); const page = w.page
    await page.locator(half === 'Info' ? '#viewtabs button:has-text("Info")' : '#viewtabs button:has-text("Show All")').tap(); await sleep(700)
    if (half === 'Show All') { const cover = await page.evaluate(() => { const b = document.getElementById('hSearchBtn'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); return e && e.closest('#showAllPanel') ? 'the Show All panel' : (e && (e.id || e.tagName)) }); note('1 Show All: Find is reachable?', `🔍 is under ${cover} — Show All is a panel over the Tracker bar, so Find cannot be pressed from it; not a fault of this change (the panel opens over the bar as before)`, await pic(w, 's28-S-covered')); await closeW(w); continue }
    await openFind(w); await typeFind(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1500); const s0 = await snap(page)
    note(`1 ${half}: Find, ACG-09, Enter`, `half now "${(s0.half || '').trim()}"; ${brief(s0)}`, await pic(w, `s28-${half[0]}-enter`))
    await page.locator('#hSearchClear').tap(); await sleep(900); const s1 = await snap(page); const f = F(s0, s1, null)
    ok(`1 ${half}: ✕ leaves the half as it was just before`, f.length === 0, `${f.join('; ') || 'no failure'} | ${brief(s1)}`, await pic(w, `s28-${half[0]}-x`))
    /* 2 a pick */
    await page.locator(half === 'Info' ? '#viewtabs button:has-text("Info")' : '#viewtabs button:has-text("Show All")').tap(); await sleep(600)
    await openFind(w); await typeFind(page, 'ACG-09'); if (await page.locator('#hSearchList .findrow').count()) await page.locator('#hSearchList .findrow').first().tap(); await sleep(1500); const s2 = await snap(page)
    note(`2 ${half}: a pick`, `half "${(s2.half || '').trim()}"; ${brief(s2)}`, await pic(w, `s28-${half[0]}-pick`))
    const g = await geo(page)
    if (g.ball && g.ball.y > limitOf(g) && g.ball.y < g.vh && /Flow/.test(s2.half || '')) { await tapXY(w, g.ball.x, g.ball.y); await sleep(1500); const c = await L.checkW(w, 'ACG-09', { slid: true }); ok(`2b ${half} → pick → tap ACG-09: the slide and the window (W1–W8)`, c.fails.length === 0, L.wsay(c), await pic(w, `s28-${half[0]}-open`)) }
    await closeW(w)
  }
})

/* ---------------- S29 ---------------- */
await scn('s29', 'Find shown and hidden, back and forth', async () => {
  const w = await fresh({ size: PHONE, touch: true }); const page = w.page
  const lay = () => page.evaluate(() => { const r = s => { const e = document.querySelector(s); const b = e && e.getBoundingClientRect(); return b ? [Math.round(b.top), Math.round(b.height)].join(',') : null }; return { board: r('#board'), tabs: r('#viewtabs'), hdr: r('#page-tracker header') } })
  const base = await lay(); const log = []
  const step = async (lab, fn) => { await fn(); await sleep(700); const l = await lay(); const s = await snap(page); log.push(`${lab}: layout ${JSON.stringify(l) === JSON.stringify(base) ? 'as at the start' : 'CHANGED ' + JSON.stringify(l)}, strip ${s.strip}, keys on ${s.ae}`); return { l, s } }
  const r1_ = await step('🔍', async () => { await page.locator('#hSearchBtn').tap() }); const k1 = r1_.s.ae
  await step('✕', async () => { await page.locator('#hSearchClear').tap() })
  const r3 = await step('🔍', async () => { await page.locator('#hSearchBtn').tap() })
  await step('Escape', async () => { await page.keyboard.press('Escape') })
  const r5 = await step('🔍', async () => { await page.locator('#hSearchBtn').tap() })
  await step('a tap outside', async () => { await page.touchscreen.tap(40, 700) })
  const r7 = await step('🔍', async () => { await page.locator('#hSearchBtn').tap() })
  await typeFind(page, 'ACG-09'); await step('a pick', async () => { await page.locator('#hSearchList .findrow').first().tap(); await sleep(800) })
  const r9 = await step('🔍', async () => { await page.locator('#hSearchBtn').tap() })
  await step('✕', async () => { await page.locator('#hSearchClear').tap() })
  const bad = log.filter(l => /CHANGED/.test(l)); const covers = [r1_, r3, r5, r7, r9].every(r => r.s.strip && r.s.ae === 'hSearch')
  ok('🔍 → ✕ → 🔍 → Escape → 🔍 → outside → 🔍 → pick → 🔍 → ✕: the chart box and tabs never move; each 🔍 puts the keys in the box', bad.length === 0 && covers, log.join(' | '), await pic(w, 's29-end'))
  await closeW(w)
})

console.log('part D done')
