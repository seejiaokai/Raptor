/* CHAT 9 — the Tracker's walk, part E: S30–S34 (Restore's arrow in the order windows, the plain-user rounds; S32 the drawing check,
   partly the host's). */
import * as L from './trk-chat9-lib.mjs'
const { scn, ok, note, row, mkWorld, closeW, geo, pic, tapXY, land, closePop, pressTraced, checkW, wsay, undoState, sleep, PHONE, PCREAL, PC } = L
const CLOCK = '2026-07-13T09:00:00'
const tapEl = async (w, loc) => { if (w.touch) await loc.tap(); else await loc.click() }
const vis = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => (e.id || e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 40)).join(' | '), sel)
const menuDo = async (w, btn, item, dlg) => { await tapEl(w, w.page.locator(btn)); await sleep(400); await tapEl(w, w.page.locator(item)); await sleep(700); if (dlg) { if (dlg.type) { await w.page.locator('#dlgInput').fill(dlg.type) } await tapEl(w, w.page.locator('#dlgOk')); await sleep(1200) } }
const sylOpts = page => page.evaluate(() => [...document.getElementById('sylSel').options].map(o => o.text))
const R = page => page.evaluate(() => {
  const rows = [...document.querySelectorAll('#ordHidden .ordrow')]
  return rows.map(r => {
    const b = r.querySelector('button'); const bb = b.getBoundingClientRect(); const rr = r.getBoundingClientRect(); const svg = b.querySelector('svg'); const sb = svg && svg.getBoundingClientRect()
    const tn = [...b.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); let wl = null, wh = null, lines = null
    if (tn) { const rg = document.createRange(); rg.selectNodeContents(tn); const rs = [...rg.getClientRects()]; wl = Math.min(...rs.map(x => x.left)); wh = rs[0].height; lines = new Set(rs.map(x => Math.round(x.top))).size }
    const cs = getComputedStyle(b); const ss = svg && getComputedStyle(svg)
    return { name: r.querySelector('.onm').textContent, rowH: Math.round(rr.height * 10) / 10, btn: [bb.left, bb.top, bb.width, bb.height].map(x => Math.round(x * 10) / 10), svgBox: sb ? [sb.left, sb.top, sb.width, sb.height].map(x => Math.round(x * 10) / 10) : null, svgPaths: svg ? svg.querySelectorAll('path').length : 0, wordLeft: wl, wordH: wh, lines, txt: b.textContent, color: cs.color, stroke: ss ? ss.stroke : null, fs: cs.fontSize, aria: svg && svg.getAttribute('aria-hidden') }
  })
})

/* ---------------- S30 ---------------- */
async function syllabusFixture(w, wide) {
  const page = w.page
  await menuDo(w, '#sylMenuBtn', '#dupSyl', { type: 'Tx 2026 copy for the long-name fit check, Wednesday 28 October' })
  const after = await sylOpts(page)
  await menuDo(w, '#sylMenuBtn', '#delSyl', {})
  const afterConfirm = await vis(page, '#dlgModal #dlgOk'); if (afterConfirm) { await tapEl(w, page.locator('#dlgOk')); await sleep(1200) }
  await page.selectOption('#sylSel', 'sbtx2026'); await sleep(800); await menuDo(w, '#sylMenuBtn', '#delSyl', {}); if (await vis(page, '#dlgModal #dlgOk')) { await tapEl(w, page.locator('#dlgOk')); await sleep(1200) }
  await page.selectOption('#sylSel', 'sbagaa2026'); await sleep(800); await menuDo(w, '#sylMenuBtn', '#renSyl', { type: 'A/G - A/A 2026 renamed for the long-name fit check, Wednesday 28 October' }); await menuDo(w, '#sylMenuBtn', '#delSyl', {}); if (await vis(page, '#dlgModal #dlgOk')) { await tapEl(w, page.locator('#dlgOk')); await sleep(1200) }
  await page.selectOption('#sylSel', 'sb2024'); await sleep(800); await menuDo(w, '#sylMenuBtn', '#delSyl', {}); if (await vis(page, '#dlgModal #dlgOk')) { await tapEl(w, page.locator('#dlgOk')); await sleep(1200) }
  return { after, left: await sylOpts(page) }
}
await scn('s30', 'The Syllabus order window — Restore', async () => {
  for (const [name, o] of [['phone', { size: PHONE, touch: true, wide: true }], ['pc', { size: PC, dpr: 1.25 }], ['phone-webkit', { size: PHONE, touch: true, wide: true, engine: 'webkit' }]]) {
    const w = await mkWorld(o); const page = w.page; const pc = !o.touch
    const fx = await syllabusFixture(w, !pc)
    note(`${name} fixture`, `after Duplicate the picker listed ${JSON.stringify(fx.after)}; after the three deletes it lists ${JSON.stringify(fx.left)}`)
    await menuDo(w, '#sylMenuBtn', '#ordSyl', null); await sleep(500)
    const rows = await R(page); const n = rows.length
    await pic(w, `s30-${name}-window`)
    const first = rows[0]
    const checks = []
    for (const r of rows) {
      const r1ok = r.svgPaths >= 1 && r.svgBox && r.svgBox[2] > 8 && !/[↺↻]/.test(r.txt)
      const r2ok = r.svgBox && r.wordLeft != null && (r.svgBox[0] + r.svgBox[2]) <= r.wordLeft + 0.5 && Math.abs((r.svgBox[1] + r.svgBox[3] / 2) - (r.btn[1] + r.btn[3] / 2)) <= 2
      const r3ok = r.lines === 1
      const r4ok = r.stroke && r.color && (r.stroke === r.color)
      checks.push({ n: r.name.slice(0, 22), r1ok, r2ok, r3ok, r4ok, h: r.btn[3], rowH: r.rowH, svg: r.svgBox && r.svgBox[2] })
    }
    const hs = [...new Set(rows.map(r => r.btn[3]))], rh = [...new Set(rows.map(r => r.rowH))]
    ok(`${name} R1–R4 on every deleted row (${n} rows)`, n >= 3 && checks.every(c => c.r1ok && c.r2ok && c.r3ok && c.r4ok) && hs.length === 1, `${checks.map(c => `${c.n}: arrow ${c.r1ok}, before word ${c.r2ok}, one line ${c.r3ok}, word's colour ${c.r4ok}, btn h ${c.h}, row h ${c.rowH}`).join(' | ')}; button heights ${JSON.stringify(hs)}; row heights ${JSON.stringify(rh)} (a long name may make its row taller); font ${first.fs}`)
    /* R5: spoken name */
    const snap = await page.locator('#ordHidden .ordrow button').first().ariaSnapshot().catch(e => 'ERR ' + e.message)
    ok(`${name} R5 spoken name is "Restore", the arrow silent`, /button "Restore"/.test(snap) && !/↺/.test(snap), `aria snapshot: ${String(snap).replace(/\s+/g, ' ').slice(0, 160)}`)
    /* close-up at 2x beside the chart's Reset layout button */
    const bb = rows[0].btn; const pad = 10
    await pic(w, `s30-${name}-closeup`, { clip: { x: Math.max(0, bb[0] - pad), y: Math.max(0, bb[1] - pad), width: bb[2] + 2 * pad, height: bb[3] + 2 * pad } })
    /* R4 hover and keys */
    if (pc) { await page.locator('#ordHidden .ordrow button').first().hover(); await sleep(250); const hv = await page.evaluate(() => { const b = document.querySelector('#ordHidden .ordrow button'); return { c: getComputedStyle(b).color, s: getComputedStyle(b.querySelector('svg')).stroke } }); ok(`${name} R4 on hover the arrow follows the word`, hv.c === hv.s, JSON.stringify(hv), await pic(w, `s30-${name}-hover`, { clip: { x: Math.max(0, bb[0] - pad), y: Math.max(0, bb[1] - pad), width: bb[2] + 2 * pad, height: bb[3] + 2 * pad } })) }
    await page.locator('#ordAlpha').focus().catch(() => {}); await page.keyboard.press('Shift+Tab'); await sleep(250)
    const fk = await page.evaluate(() => { const b = document.activeElement; if (!b || !b.closest('#ordHidden')) return null; const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return { out: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, sh: cs.boxShadow.slice(0, 80), c: cs.color, s: getComputedStyle(b.querySelector('svg')).stroke, r: [r.left, r.top, r.width, r.height] } })
    note(`${name} R4 with the keys on it (Shift+Tab from A–Z)`, JSON.stringify(fk), fk ? await pic(w, `s30-${name}-keys`, { clip: { x: Math.max(0, fk.r[0] - 30), y: Math.max(0, fk.r[1] - 30), width: fk.r[2] + 60, height: fk.r[3] + 60 } }) : '')
    const rowh = await page.evaluate(() => [...document.querySelectorAll('#ordHidden .ordrow')].map(r => ({ n: r.querySelector('.onm').textContent, row: r.getBoundingClientRect().height, onm: r.querySelector('.onm').getBoundingClientRect().height, tag: r.querySelector('.otag').getBoundingClientRect().height, btn: r.querySelector('button').getBoundingClientRect().height, cs: getComputedStyle(r).display + ' ' + getComputedStyle(r).paddingTop + ' ' + getComputedStyle(r).alignItems }))); note(`${name} row parts`, JSON.stringify(rowh))
    /* R6: press Restore on Tx 2026 */
    const idx = rows.findIndex(r => /^Tx 2026$/.test(r.name))
    if (idx >= 0) {
      await tapEl(w, page.locator('#ordHidden .ordrow').nth(idx).locator('button')); await sleep(900)
      const after = await R(page); const sel = await sylOpts(page).catch(() => null)
      ok(`${name} R6 Restore on "Tx 2026": gone from the deleted list, the others keep the arrow`, after.length === n - 1 && !after.some(r => /^Tx 2026$/.test(r.name)) && after.every(r => r.svgPaths >= 1), `deleted rows ${n} → ${after.length}; picker now ${JSON.stringify(sel)}`, await pic(w, `s30-${name}-restored`))
    } else note(`${name} R6`, `no "Tx 2026" row among ${JSON.stringify(rows.map(r => r.name))}`)
    /* closing by each way */
    const way = []
    await page.keyboard.press('Escape'); await sleep(500); way.push('Escape: ' + (await vis(page, '#ordModal') ? 'still open' : 'closed'))
    if (!(await vis(page, '#ordModal'))) await menuDo(w, '#sylMenuBtn', '#ordSyl', null)
    await tapEl(w, page.locator('#ordCancel')); await sleep(500); way.push('Cancel: ' + (await vis(page, '#ordModal') ? 'still open' : 'closed'))
    await menuDo(w, '#sylMenuBtn', '#ordSyl', null); await tapXY(w, 8, 400); await sleep(500); way.push('a press on the shade: ' + (await vis(page, '#ordModal') ? 'still open' : 'closed'))
    note(`${name} the window's ways of closing`, way.join(' | '))
    ok(`${name} errors`, w.errors.length === 0, w.errors.join(' / ') || 'none'); await closeW(w)
  }
})

/* ---------------- S31 ---------------- */
await scn('s31', 'The Course order window, and nowhere else', async () => {
  for (const [name, o] of [['phone', { size: PHONE, touch: true }], ['pc', { size: PC, dpr: 1.25 }]]) {
    const w = await mkWorld(o); const page = w.page
    await tapEl(w, page.locator('#courseMenuBtn')); await sleep(400)
    const items = await vis(page, '#courseMenuPanel button'); note(`${name} 1 the course pencil's items`, items)
    const dup = page.locator('#addCourse')
    if (!(await dup.count())) { row(`${name} 1 Duplicate course`, 'NOTRUN', 'the course pencil has no Duplicate item: ' + items); await closeW(w); continue }
    await tapEl(w, dup); await sleep(700); const d1 = await vis(page, '#dlgModal, #dlgInput'); if (await page.locator('#dlgInput').count()) { await page.locator('#dlgInput').fill('26ABSG copy (added for the Restore check)'); } await tapEl(w, page.locator('#dlgOk')); await sleep(1500)
    const cur = await page.evaluate(() => { const s = document.getElementById('courseSel'); return s ? [...s.options].map(o => o.text + (o.selected ? '*' : '')) : null })
    note(`${name} 1 the course pencil has no Duplicate item, so a course was ADDED instead (a deleted course keeps its students and marks; the added one has none)`, `dialog ${d1}; the course picker now lists ${JSON.stringify(cur)}`)
    await tapEl(w, page.locator('#courseMenuBtn')); await sleep(400); await tapEl(w, page.locator('#delCourse')); await sleep(700)
    const confirmText = await page.evaluate(() => { const m = document.getElementById('dlgModal'); return m ? m.innerText.replace(/\s+/g, ' ') : null })
    note(`${name} C10 the delete-course question`, `its words carry typed marks: ${JSON.stringify(confirmText)}`, await pic(w, `s31-${name}-delete-question`))
    await tapEl(w, page.locator('#dlgOk')); await sleep(1500)
    await tapEl(w, page.locator('#courseMenuBtn')); await sleep(400); await tapEl(w, page.locator('#ordCourse')); await sleep(800)
    const rows = await R(page); await pic(w, `s31-${name}-window`)
    const okAll = rows.length >= 1 && rows.every(r => r.svgPaths >= 1 && !/[↺↻]/.test(r.txt) && r.lines === 1 && r.svgBox && (r.svgBox[0] + r.svgBox[2]) <= r.wordLeft + 0.5 && r.stroke === r.color)
    ok(`${name} 1 Deleted courses: R1–R4 on each row`, okAll, JSON.stringify(rows.map(r => ({ n: r.name, svg: r.svgBox, btn: r.btn, lines: r.lines }))))
    if (rows.length) { const bb = rows[0].btn; await pic(w, `s31-${name}-closeup`, { clip: { x: Math.max(0, bb[0] - 10), y: Math.max(0, bb[1] - 10), width: bb[2] + 20, height: bb[3] + 20 } })
      const snap = await page.locator('#ordHidden .ordrow button').first().ariaSnapshot().catch(e => 'ERR ' + e.message); ok(`${name} 1 R5 spoken name`, /button "Restore"/.test(snap), String(snap).replace(/\s+/g, ' ').slice(0, 120))
      const students0 = await page.evaluate(() => (document.getElementById('studentSel') ? document.getElementById('studentSel').options.length : -1))
      await tapEl(w, page.locator('#ordHidden .ordrow button').first()); await sleep(1200)
      const left = await R(page).catch(() => []); const cur2 = await page.evaluate(() => { const s = document.getElementById('courseSel'); return s ? [...s.options].map(o => o.text) : null })
      ok(`${name} 1 R6 Restore: the course back in the picker, gone from the deleted list`, left.length === rows.length - 1 && (cur2 || []).some(t => /added for the restore/i.test(t)), `deleted rows ${rows.length} → ${left.length}; picker ${JSON.stringify(cur2)}`, await pic(w, `s31-${name}-restored`)) }
    await page.keyboard.press('Escape'); await sleep(400)
    /* 2 the crew window */
    if (!(await page.locator('#ordCrew').count()) || !(await page.locator('#ordCrew').isVisible().catch(() => false))) { const info = page.locator('#viewtabs button', { hasText: 'Info' }); if (await info.count() && await info.isVisible().catch(() => false)) { await tapEl(w, info); await sleep(700) } }
    if (await page.locator('#ordCrew').isVisible().catch(() => false) && await page.locator('#ordCrew').isEnabled().catch(() => false)) {
      await tapEl(w, page.locator('#ordCrew')); await sleep(700)
      const wrap = await page.locator('#ordHiddenWrap').count(); const rest = await vis(page, '#ordModal button'); const grips = await page.evaluate(() => ({ grip: [...document.querySelectorAll('#ordModal .grip')].map(g => g.textContent).slice(0, 2), mv: [...document.querySelectorAll('#ordModal .ordrow button')].map(b => b.textContent).slice(0, 4) }))
      ok(`${name} 2 (C8, C9) the crew window: no deleted list, no Restore; ⠿ ▲ ▼ typed`, wrap === 0 && !/Restore/.test(rest) && grips.grip.every(g => g === '⠿') && grips.mv.includes('▲') && grips.mv.includes('▼'), `deleted list ${wrap}; buttons ${rest.slice(0, 160)}; marks ${JSON.stringify(grips)}`, await pic(w, `s31-${name}-crew`))
      await page.keyboard.press('Escape'); await sleep(300)
    } else note(`${name} 2 the crew window`, 'Reorder (crew) was not reachable here: ' + (await vis(page, '#ordCrew')))
    /* C9 in the syllabus window: grip and ▲ ▼ typed */
    await menuDo(w, '#sylMenuBtn', '#ordSyl', null)
    const g9 = await page.evaluate(() => ({ grip: [...document.querySelectorAll('#ordList .grip')].map(g => g.textContent).slice(0, 2), mv: [...document.querySelectorAll('#ordList .ordrow button')].map(b => b.textContent).slice(0, 4), svgIn: document.querySelectorAll('#ordList .grip svg, #ordList .ordrow button svg').length }))
    ok(`${name} 4 (C9) ⠿ ▲ ▼ in the syllabus window stay typed`, g9.grip.every(g => g === '⠿') && g9.mv.includes('▲') && g9.svgIn === 0, JSON.stringify(g9), await pic(w, `s31-${name}-syl-window`))
    ok(`${name} errors`, w.errors.length === 0, w.errors.join(' / ') || 'none'); await closeW(w)
  }
  note('3 (C10) the typed ↺ ↻ still in src/tracker', 'The host’s search of the code: ↺ stands in comments (core.js 1045, 5882, 6659, 7198) and in TWO on-screen sentences — the delete-course question ("↺ Restore in ⇅ Reorder courses brings it back…", core.js 5893, shown and pictured in step 1) and the import message ("…(↺ Restore in ⇅ Reorder brings it/them back)", core.js 7278, not reached here: it needs a backup file with deleted charts). D1792 names the button; these sentences keep the typed marks. Put to him, not judged here.')
})

/* ---------------- S32 ---------------- */
await scn('s32', 'The drawing check (partial — the host’s)', async () => {
  row('1 the drawcheck specs (scripts/drawcheck/specs) for the three drawings', 'NOTRUN', 'no part list exists for these drawings and the brief says the host writes them and records them on the drawing’s own build (main at 6e6c55667); I did not write specs. What was done instead: the slide’s numbers against the drawing are in S1 step 4 (window top 220.3 vs drawn 214; foot 649.7 vs 643 — the notes’ 4px under the ball against the drawing’s 2px over it); the Find ✕ end-state and Restore pictures (s24-*, s30-*) are for the host to lay beside q-trkfind-ph-A-drawn and q-r5c-*-restore-drawn.')
})

/* ---------------- S33 ---------------- */
const failsCard = page => page.evaluate(() => { const e = document.getElementById('failsCard'); return e ? e.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : null })
const wedge = page => page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09'); const w = g && g.querySelector('path.wedge[data-wi="0"]'); return w ? w.getAttribute('fill') : null })
const dayBtn = (page, n) => page.locator('.dcal-d:not(.is-out):not(.is-blank)').filter({ hasText: new RegExp('^' + n + '$') }).first()
async function round(w, tag) {
  const page = w.page; const pc = !w.touch; const P = n => pic(w, `s${tag}-${n}`)
  const g0 = await geo(page); note(`${tag} (a)(b) in the Tracker, Student A`, `student box "${await page.evaluate(() => document.getElementById('activeSel') ? document.getElementById('activeSel').selectedOptions[0].text : (document.querySelector('select') || {}).value)}"; chart ${g0.st}`, await P('a-start'))
  const g = await land(w, 'ACG-09', pc ? 'enter' : 'pick'); note(`${tag} (c) Find → ACG-09 → ${pc ? 'Enter' : 'pick'}`, `Find strip gone: ${!(await page.evaluate(pc => { const p = document.getElementById('hSearchPanel'); return pc ? false : p && p.classList.contains('on') }, pc))}; chart ${g.st}`, await P('c-found'))
  let g1 = await geo(page); if (pc && g1.ball.b + 434 <= g1.board.b) g1 = await L.placeAt(w, 'ACG-09', g1.board.b - 40)
  const u0 = await undoState(page)
  await tapXY(w, g1.ball.x, g1.ball.y); await sleep(120); await P('d-tap-120ms'); await sleep(1500)
  const gd = await geo(page); const c = await checkW(w, 'ACG-09', { slid: true, undo: u0 }); ok(`${tag} (d) the tap: the slide, the window`, c.fails.length === 0, wsay(c), await P('d-open'))
  /* (e) Failed on → Fri 10 Jul → + */
  await tapEl(w, page.locator('#popFailDate')); await sleep(600); await P('e-cal'); await tapEl(w, dayBtn(page, 10)); await sleep(500); await tapEl(w, page.locator('#popFailPlus')); await sleep(800)
  ok(`${tag} (e) Failed on Fri 10 Jul +`, Number(await page.evaluate(() => document.getElementById('failCount').textContent)) === 1, `count ${await page.evaluate(() => document.getElementById('failCount').textContent)}; Failures card: ${await failsCard(page)}`, await P('e-failed'))
  /* (f) Done on → Sun 12 Jul → DCO */
  await tapEl(w, page.locator('#popDoneDate')); await sleep(500); await tapEl(w, dayBtn(page, 12)); await sleep(500); await tapEl(w, page.locator('#pop .opts button[data-g="dco"]')); await sleep(900)
  ok(`${tag} (f) Done on Sun 12 Jul → DCO`, (await wedge(page)) !== '#ffffff', `wedge ${await wedge(page)}; window ${await page.evaluate(() => { const p = document.getElementById('pop'); return p && getComputedStyle(p).display !== 'none' ? 'open' : 'closed' })}`, await P('f-dco'))
  /* (g) Edit details → read → Cancel */
  if (!(await page.locator('#pop').isVisible().catch(() => false))) { const gg = await geo(page); await tapXY(w, gg.ball.x, gg.ball.y); await sleep(1400) }
  const ed = page.locator('#pop button', { hasText: /Edit details/ }).first()
  if (await ed.count()) { await tapEl(w, ed); await sleep(700); const txt = await page.evaluate(() => { const m = document.getElementById('infoModal'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 160) : null }); note(`${tag} (g) Edit details read`, JSON.stringify(txt), await P('g-details')); await tapEl(w, page.locator('#ifCancel')); await sleep(600) } else note(`${tag} (g) Edit details`, 'no button in the window')
  /* (h) Close */
  if (await page.locator('#pop').isVisible().catch(() => false)) await closePop(w)
  /* (i) every place that should show it */
  const gi = await geo(page); await P('i-chart')
  const ballRed = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09'); return g ? g.innerHTML.match(/#[0-9a-f]{6}/gi).slice(0, 8).join(' ') : null })
  note(`${tag} (i) the ball`, `wedge ${await wedge(page)}; colours ${ballRed}`)
  const info = page.locator('#viewtabs button', { hasText: 'Info' }); if (!pc && await info.count()) { await tapEl(w, info); await sleep(700) }
  const lf = await page.evaluate(() => { const t = document.getElementById('side') ? document.getElementById('side').innerText.replace(/\s+/g, ' ') : ''; const m = t.match(/Last Flown[^]{0,60}/); return { last: m && m[0], fails: (document.getElementById('failsCard') || {}).textContent } })
  note(`${tag} (i) the Info half`, `Failures card: ${(lf.fails || '').replace(/\s+/g, ' ').slice(0, 160)}; ${lf.last}`, await P('i-info'))
  const fl = page.locator('#viewtabs button', { hasText: 'Flow chart' }); if (!pc && await fl.count()) { await tapEl(w, fl); await sleep(700) }
  const save = await page.evaluate(() => { const s = document.getElementById('saveStat'); return s ? s.textContent.trim() : null }); const uw = await page.evaluate(() => { const b = document.getElementById('trUndoBtn') || document.querySelector('[id*=ndo]'); return b ? (b.title || b.getAttribute('aria-label')) : null })
  note(`${tag} (i) the save corner and Undo's words`, `save "${save}"; Undo "${uw}"`)
  /* (j) Undo / Redo */
  const st = (await geo(page)).st
  if (pc) { await page.keyboard.press('Control+z') } else { await tapEl(w, page.locator('#trUndoBtn')) } await sleep(800); const w1 = await wedge(page); const st1 = (await geo(page)).st; await P('j-undo')
  if (pc) { await page.keyboard.press('Control+y') } else { await tapEl(w, page.locator('#trRedoBtn')) } await sleep(800); const w2 = await wedge(page); await P('j-redo')
  ok(`${tag} (j) Undo takes DCO away, the chart unmoved; Redo brings it back`, w1 === '#ffffff' && w2 !== '#ffffff' && Math.abs(st1 - st) <= 1, `wedge ${w1} after Undo, ${w2} after Redo; chart ${st} → ${st1}`)
  return w
}
await scn('s33', 'The everyday round on his iPhone’s size', async () => {
  const w = await mkWorld({ size: PHONE, touch: true, clock: CLOCK, wide: true }); const page = w.page
  await round(w, '33')
  /* (k) every control that opens or closes */
  const k = []
  const probe = async (lab, openFn, openSel) => { try { await openFn(); await sleep(600); const up = await vis(page, openSel); await pic(w, `s33-k-${lab.replace(/[^A-Za-z]/g, '')}`); await page.keyboard.press('Escape').catch(() => {}); await sleep(300); if (await vis(page, openSel)) { await tapXY(w, 6, 500); await sleep(400) } k.push(`${lab}: ${up ? 'opened' : 'DID NOT OPEN'}, ${(await vis(page, openSel)) ? 'STILL OPEN' : 'closed'}`) } catch (e) { k.push(`${lab}: ERROR ${e.message.split('\n')[0]}`) } }
  await probe('Course pencil', () => page.locator('#courseMenuBtn').tap(), '#courseMenuPanel')
  await probe('Syllabus pencil', () => page.locator('#sylMenuBtn').tap(), '#sylMenuPanel')
  await probe('Legend', () => page.locator('#legendBtn').tap(), '#trkLegend')
  await probe('Flex settings', () => page.locator('#flexBtn').tap(), '#trkFlexWin')
  await probe('Find', () => page.locator('#hSearchBtn').tap(), '#hSearchPanel.on')
  await probe('Reorder syllabi', async () => { await page.locator('#sylMenuBtn').tap(); await sleep(300); await page.locator('#ordSyl').tap() }, '#ordModal')
  await probe('Reorder courses', async () => { await page.locator('#courseMenuBtn').tap(); await sleep(300); await page.locator('#ordCourse').tap() }, '#ordModal')
  for (const half of ['Info', 'Show All', 'Flow chart']) { await page.locator('#viewtabs button', { hasText: half }).tap(); await sleep(700); await pic(w, `s33-k-tab-${half.replace(/ /g, '')}`); k.push(`${half} tab: shown`) ; if (half === 'Show All') { await page.keyboard.press('Escape'); await sleep(300); if (await vis(page, '#showAllPanel')) { const cl = page.locator('#showAllPanel button', { hasText: /Close|✕/ }).first(); if (await cl.count()) await cl.tap().catch(() => {}); await sleep(400) } } }
  note('33 (k) every control that opens or closes', k.join(' | '))
  /* (l) reload */
  await page.reload(); await sleep(2500); const li = await page.locator('#luser').count(); if (li) await L.login(page, 'a'); await L.navTracker(page).catch(() => {}); await sleep(1500)
  const g = await geo(page); const wd = await wedge(page)
  ok('33 (l) reload and sign in: the DCO is still there', wd !== null && wd !== '#ffffff', `wedge ${wd}; Failures card ${await failsCard(page)}; student/course/chart as before: ${await page.evaluate(() => [...document.querySelectorAll('#activeSel, #courseSel, #sylSel')].map(s => s.selectedOptions[0].text).join(' / '))}`, await pic(w, 's33-l-reload'))
  ok('33 errors', w.errors.length === 0, w.errors.join(' / ') || 'none'); await closeW(w)
  /* the closes again in WebKit */
  const x = await mkWorld({ size: PHONE, touch: true, clock: CLOCK, wide: true, engine: 'webkit' }); const xp = x.page
  const kk = []
  for (const [lab, o, sel] of [['Course pencil', () => xp.locator('#courseMenuBtn').tap(), '#courseMenuPanel'], ['Syllabus pencil', () => xp.locator('#sylMenuBtn').tap(), '#sylMenuPanel'], ['Legend', () => xp.locator('#legendBtn').tap(), '#trkLegend'], ['Find', () => xp.locator('#hSearchBtn').tap(), '#hSearchPanel.on']]) {
    try { await o(); await sleep(600); const up = await vis(xp, sel); await xp.keyboard.press('Escape').catch(() => {}); await sleep(300); if (await vis(xp, sel)) { await tapXY(x, 6, 500); await sleep(400) } kk.push(`${lab}: ${up ? 'opened' : 'DID NOT OPEN'}, ${(await vis(xp, sel)) ? 'STILL OPEN' : 'closed'}`) } catch (e) { kk.push(`${lab}: ERROR ${e.message.split('\n')[0]}`) }
  }
  note('33 (k) WebKit: the closes again', kk.join(' | '), await pic(x, 's33-k-webkit')); await closeW(x)
})

/* ---------------- S34 ---------------- */
await scn('s34', 'The same round on his PC', async () => {
  const w = await mkWorld({ size: PCREAL, dpr: 1.25, clock: CLOCK }); const page = w.page
  await round(w, '34')
  /* once by keys: Tab to the chart, arrows, Enter, Escape */
  const before = await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))
  await page.evaluate(() => { const b = document.getElementById('barHideBtn'); if (b) b.focus() }); await page.keyboard.press('Tab'); await sleep(300); const tabs = 0; const onBoard = await page.evaluate(() => document.activeElement && document.activeElement.id)
  note('34 by keys: one Tab from the bar’s last control reaches the chart (D980)', `keys on "${onBoard}"`)
  await page.keyboard.press('ArrowRight'); await sleep(300); await page.keyboard.press('Enter'); await sleep(1500); const open = await page.evaluate(() => { const p = document.getElementById('pop'); return !!p && getComputedStyle(p).display !== 'none' && getComputedStyle(p).visibility !== 'hidden' })
  await pic(w, 's34-keys-open'); await page.keyboard.press('Escape'); await sleep(500); const open2 = await page.evaluate(() => { const p = document.getElementById('pop'); return !!p && getComputedStyle(p).display !== 'none' && getComputedStyle(p).visibility !== 'hidden' })
  note('34 by keys: Tab to the chart, → , Enter, Escape', `one Tab from the bar's last control (keys then on "${onBoard}"); → then Enter opened the window ${open}; Escape closed it ${!open2}; keys now on ${await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))}`, await pic(w, 's34-keys-escape'))
  await page.reload(); await sleep(2500); if (await page.locator('#luser').count()) await L.login(page, 'a'); await L.navTracker(page).catch(() => {}); await sleep(1500)
  const wd = await wedge(page); ok('34 reload: the DCO is still there', wd !== null && wd !== '#ffffff', `wedge ${wd}`, await pic(w, 's34-reload'))
  ok('34 errors', w.errors.length === 0, w.errors.join(' / ') || 'none'); await closeW(w)
})

console.log('part E done')
