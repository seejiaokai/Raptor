// scc-w1B — walker B of the crew list's SANS words and F / O / A column walk (his D2584 Q2, D2581, D2582, D2750, D2751),
// chat 207, 27 Nov 26. Fable's list (A, C, H, R, S groups) and Astra's (A01–A21) walked together, each case once with
// both ids. Each scenario a fresh browser world, Saber signed in, clock started 15 Jul 2026 09:00 and left running.
// Brief: docs/superpowers/briefs/2026-11-27-sans-crewcol-walk-brief.md. Every filing is made on the SANS tab, every place
// pressed on the screen. Run from raptor-port/:  SZ=d|p SCCB_RUN=run1 [ONLY=col,combo] node scripts/handpass/scc-w1B.mjs
import './scc-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const B = await import('./scc-w1B-lib.mjs')
const { Z, T, L, A, W5, J, sleep, OUT, path, ID, SUN, SAT, FRI, WK, R17N, quiet, nowPic, openB, closeB, fileS, editS, sansDayRows, arm, unarm,
  showList, listW, readSec, rowOf, rowSay, secSay, colJudge, secPic, crop, dragHold, pickMan, holds, saveJ, asR, asS, postR, clean, noteWatch, notesSeen } = B
const SZ = process.env.SZ || 'd'
T.L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
/* his PC's display at 125% (C-11): a browser STARTED at 125% (memory: an emulated picture scale hides it) */
T.L.SIZES.d125 = { name: 'desktop125', eng: T.L.SIZES.d.eng, launch: { ...T.L.SIZES.d.launch, args: ['--force-device-scale-factor=1.25'] }, opts: { viewport: { width: 1229, height: 800 } } }
console.log('VERSION scc-w1B 1 · size', SZ, '· run', process.env.SCCB_RUN || 'run1', '· only', process.env.ONLY || 'all')
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const nw = (W, id, what, note) => W.rec(id, what, 'NW', note)
/* a step that cannot stop the rest of its scenario: a script failure is recorded NOT WALKED with its cause */
async function step(W, id, fn) { try { await fn() } catch (e) { nw(W, id, 'step stopped by the script', String(e && e.message || e).split('\n')[0].slice(0, 300)) } }
const pics = (...a) => a.filter(Boolean).join(', ')
const DI = 6
const MEN_COL = [['yeti', ['fly'], null], ['romeo', ['oft'], null], ['ipman', ['amt'], ['08:00', '10:00']], ['krait', ['fly', 'oft'], null], ['vinci', ['amt'], null]]
const WORDS = {
  flyOnlyNotAmt: 'SANS — offered Fly only, not AMT', oftOnlyNotAmt: 'SANS — offered OFT only, not AMT', flyOftNotAmt: 'SANS — offered Fly and OFT only, not AMT',
  hours: h => `SANS — available ${h} only`,
}
/* Fable's words table (D2584 Q2 — the events in the order F, O, A): what a man who offered `k` reads against a place of
   event `ev` ('fly' | 'oft' | 'amt' | 'sb' standby); null = plain (no SANS reason) */
const NAME = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }
const want = (kinds, ev) => {
  if (ev === 'sb') return null
  if (kinds.includes(ev)) return null
  const offered = ['fly', 'oft', 'amt'].filter(k => kinds.includes(k)).map(k => NAME[k])
  if (!offered.length) return `SANS — not offering ${NAME[ev]}`
  return `SANS — offered ${offered.join(' and ')} only, not ${NAME[ev]}`
}
const isSans = s => /^SANS\b/.test(s || '')

/* the drawing's scene (Fable C-01 = Astra A01): five filings for Sun 19 made on the SANS tab, an AMT box 13:00–14:00 */
async function colScene(p, W, men = MEN_COL, o = {}) {
  const made = {}
  for (const [id, kinds, span, rmk] of men) {
    const f = await fileS(p, W, SUN, id, kinds, span, { rmk })
    Z.need(W, 'set.' + id, `${id} filed ${kinds.join('+') || '(nothing ticked)'}${span ? ' ' + span.join('–') : ' all day'} for Sun 19 on the SANS tab`, !!f.iid, f.iid ? J(f.made) : f.refused)
    made[id] = f.iid
  }
  const s = await W5.addSim(p, W, DI, 'amt', 'AMT', '13:00', '14:00')
  Z.need(W, 'set.amt', 'an AMT box 13:00–14:00 on Sun 19 (+ on the board, times typed)', s.r && s.r.str === '13:00' && s.r.end === '14:00', J(s))
  let oft = null
  if (o.oft) { oft = await W5.addSim(p, W, DI, 'oft', 'OFT', '10:00', '11:00'); Z.need(W, 'set.oft', 'an OFT box 10:00–11:00 on Sun 19', oft.r && oft.r.str === '10:00', J(oft)) }
  if (W.isPhone) { await T.reload(p, 'ad', 'a'); await sleep(500) }
  rec(W, 'set.sday', 'the SANS calendar\'s Sun 19 window, what each man filed (read on screen)', await sansDayRows(p, W, SUN))
  return { made, ri: s.ri, oft: oft && oft.ri }
}
const amtAdd = ri => `[data-fill="s:${DI}.amt.${ri}.+"]`
/* the C-01 expectations judged on one read (B or W) */
function judgeCol(W, id, label, s, pic) {
  const by = x => rowOf(s, ID[x]) || {}
  chk(W, id + '.bolt', `${label}: Bolt (Fly only) struck "${WORDS.flyOnlyNotAmt}", letters "F"`, by('Bolt').struck && by('Bolt').why === WORDS.flyOnlyNotAmt && by('Bolt').badge === 'F', rowSay(by('Bolt')), pic)
  chk(W, id + '.rebel', `${label}: Rebel (OFT only) struck "${WORDS.oftOnlyNotAmt}", letters "O"`, by('Rebel').struck && by('Rebel').why === WORDS.oftOnlyNotAmt && by('Rebel').badge === 'O', rowSay(by('Rebel')))
  chk(W, id + '.kraken', `${label}: Kraken (Fly + OFT) struck "${WORDS.flyOftNotAmt}", letters "F/O"`, by('Kraken').struck && by('Kraken').why === WORDS.flyOftNotAmt && by('Kraken').badge === 'F/O', rowSay(by('Kraken')))
  chk(W, id + '.jester', `${label}: Jester (AMT 08:00–10:00) struck "${WORDS.hours('08:00–10:00')}", "A" with "08:00–10:00" on the line under it`, by('Jester').struck && by('Jester').why === WORDS.hours('08:00–10:00') && by('Jester').l === 'A' && by('Jester').h === '08:00–10:00', rowSay(by('Jester')))
  const j = by('Jester')
  chk(W, id + '.hours', `${label}: the hours whole, under the "A" (left edges within 0.5px, next line), the letter's own look`, j.h === '08:00–10:00' && !j.cut && !j.past && Math.abs(j.hMinusL) <= 0.5 && j.hTopMinusLBot >= -0.5 && j.hTopMinusLBot <= 3 && j.sameLook, J({ hMinusL: j.hMinusL, top: j.hTopMinusLBot, same: j.sameLook, h: j.hLook, l: j.lLook, cut: j.cut, past: j.past }))
  chk(W, id + '.zenith', `${label}: Zenith (AMT all day) plain, no reason, letters "A" in the column`, !by('Zenith').struck && !by('Zenith').why && by('Zenith').badge === 'A', rowSay(by('Zenith')))
  chk(W, id + '.head', `${label}: the heading "SANS Avail · 1 free"`, s.head === 'SANS Avail · 1 free', s.head)
  const c = colJudge(s)
  chk(W, id + '.col', `${label}: the letters in one column (left edges within 0.5px), straight after the widest reason — not at the row's right edge`, c.ok, c.why)
  const cut = s.rows.filter(r => r.cut || r.past)
  chk(W, id + '.cut', `${label}: no letter, hours or reason cut or past the list's edge; no sideways scroll`, !cut.length && !s.sideways.length && !s.pageWide, cut.map(rowSay).join(' · ') + (s.sideways.length ? ' sideways ' + s.sideways.join(',') : '') + (s.pageWide ? ' PAGE WIDE' : ''))
  chk(W, id + '.nofile', `${label}: no line tells the scheduler to file (D2420, D2587)`, !s.toFile.length, s.toFile.join(' | ') || 'none')
  const nf = s.rows.filter(r => !Object.values(ID).slice(0, 5).includes(r.id) && r.id !== 'bane')
  rec(W, id + '.nothing', `${label}: the nothing-filed men's line under the struck name (RECORDED — D2420's reading "as built"), and whether it is the widest`, `${nf.map(rowSay).join(' · ')} · the widest: ${s.widest}`)
  const wide = s.rows.filter(r => r.whyLines > 1)
  rec(W, id + '.wrap', `${label}: reasons that run onto a second line`, wide.length ? wide.map(r => `${r.cs} "${r.why}" ${r.whyLines} lines (reason ${r.whyL}–${r.whyR}, column at ${s.colL})`).join(' · ') : 'none — every reason on one line')
  chk(W, id + '.titles', `${label}: each struck man's hover words (his name's own title) are his line — "<callsign> — <the same words>"`, s.rows.filter(r => r.why).every(r => r.title === `${r.cs} — ${r.why}`), s.rows.filter(r => r.why && r.title !== `${r.cs} — ${r.why}`).map(r => `${r.cs}: title "${r.title}" vs line "${r.why}"`).join(' · ') || 'all match')
}

const SC = {}

/* C-01 = A01, C-02, C-07, H-01, S-01, R-01, R-03, R-04, S-04, S-06, S-03 + H-02 (desktop), C-12 (desktop) */
SC.col = async (p, W) => {
  const { ri } = await colScene(p, W)
  /* C-07 / A01 unpicked — the board's list (B) and Edit Schedule's (W) */
  for (const surf of ['B', 'W']) await step(W, 'c07' + surf, async () => {
    if (surf === 'B') { await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B') } else rec(W, 'c07W.day', "Edit Schedule's crew panel turned to Sunday", await listW(p, W, 'Sun'))
    const s = await readSec(p, surf)
    const pic = await secPic(p, W, surf, 'c07-nopick-' + surf)
    const j = rowOf(s, 'ipman') || {}
    chk(W, `c07${surf}.why`, `Fable C-07 / Astra A01 (${surf}), no place picked: no reason line on any SANS row (D2750's reading, N-08)`, s.rows && s.rows.every(r => !r.why), secSay(s), pic)
    chk(W, `c07${surf}.jester`, `Fable C-07 / H-01 / Astra A01 (${surf}), no place picked: Jester's "A · 08:00–10:00" on one line, whole`, j.badge === 'A · 08:00–10:00' && j.bLines === 1 && !j.cut && !j.past, rowSay(j))
    const nf = s.rows.filter(r => ['cards', 'wrangler', 'badger'].includes(r.id))
    chk(W, `c07${surf}.nf`, `Fable A-05a / N-09 / Astra A04 (${surf}), no place picked: the nothing-filed men struck, no line, no letters`, nf.length && nf.every(r => r.struck && !r.why && !r.badge), nf.map(rowSay).join(' · '))
    rec(W, `c07${surf}.col`, `Fable C-07 / Q6 (${surf}), no place picked: where the letters stand (one column or not — RECORDED, his question)`, colJudge(s).why)
    chk(W, `c07${surf}.free`, `N-17 (${surf}): the heading's "N free" counts no struck man`, (() => { const m = /(\d+)\s*free/.exec(s.head); return m && +m[1] === s.rows.filter(r => !r.struck && !/tasked|busy|dim|fade/.test(r.cls)).length })(), s.head + ' · plain rows ' + s.rows.filter(r => !r.struck).map(r => r.cs).join(','))
  })
  /* C-01 / A01 on the board: the AMT box's "+ add" pressed */
  let sB = null
  await step(W, 'c01B', async () => {
    const a = await arm(p, W, 'B', DI, amtAdd(ri), { now: true, tag: 'c01B' })
    Z.need(W, 'c01B.arm', "the AMT box's + add pressed on the board (armed)", !!a.armed, J(a))
    sB = await readSec(p, 'B')
    const pic = await secPic(p, W, 'B', 'c01-picked-B')
    judgeCol(W, 'c01B', 'Fable C-01 / Astra A01 (B, the board)', sB, pics(pic, a.now))
    saveJ(`c01B-${W.sz.name}.json`, sB)
  })
  /* S-01 / A12 / H-01: every way of unpicking; the phone's drawer closed and opened with the place still picked */
  await step(W, 's01', async () => {
    const back = async (how) => { const s = await readSec(p, 'B'); const j = rowOf(s, 'ipman') || {}; chk(W, 's01.' + how.split(' ')[0], `Fable S-01 / H-01 / Astra A12: unpicked by ${how} — no reason left, Jester's hours back on the letter's line, his row back to one height, the letters in one column`, !s.armed && s.rows.every(r => !r.why) && j.badge === 'A · 08:00–10:00' && j.bLines === 1, `armed ${s.armed} · ` + rowSay(j) + ' · rows ' + s.rows.map(r => r.rowH).join('/') + ' · ' + colJudge(s).why) }
    if (W.isPhone) {
      await W5.boardDrawer(p, W, false); await W5.boardDrawer(p, W, true)
      const s = await readSec(p, 'B')
      chk(W, 's01.drawer', 'Fable S-01: the phone\'s crew drawer closed and opened with the place still picked keeps the reasons and the column', !!s.armed && rowOf(s, 'yeti') && rowOf(s, 'yeti').why === WORDS.flyOnlyNotAmt && colJudge(s).ok, secSay(s))
    }
    await p.keyboard.press('Escape'); await sleep(400); await showList(p, W, 'B'); await back('Escape')
    await arm(p, W, 'B', DI, amtAdd(ri))
    const z = p.locator(L.B(amtAdd(ri))).first(); const ab = await z.locator('.addz').first().boundingBox().catch(() => null), zb = await z.boundingBox()
    const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
    await showList(p, W, 'B', false)
    if (W.isPhone) await z.tap({ position: pos }); else await z.click({ position: pos })
    await sleep(500); await showList(p, W, 'B'); await back('the same place pressed again')
    await arm(p, W, 'B', DI, amtAdd(ri)); await showList(p, W, 'B', false)
    await closeB(p, W); await openB(p, W, DI); await showList(p, W, 'B'); await back("the board's Done, then the board opened again")
    await arm(p, W, 'B', DI, amtAdd(ri)); await showList(p, W, 'B', false)
    await L.closeBoard(p, W); await L.go(p, 'inputs'); await L.go(p, 'editsched'); await openB(p, W, DI); await showList(p, W, 'B'); await back('leaving for Inputs and back')
  })
  /* C-02: the same place pressed on Edit Schedule's week, its own crew panel read */
  await step(W, 'c02W', async () => {
    let a = await arm(p, W, 'W', DI, amtAdd(ri), { now: true, tag: 'c02W' })
    if (!a.armed) a = await arm(p, W, 'W', DI, `[data-fill^="s:${DI}.amt.${ri}"]`, { now: true, tag: 'c02W' })
    Z.need(W, 'c02W.arm', "Sunday's AMT box + add pressed on Edit Schedule's week (armed)", !!a.armed, J(a))
    const s = await readSec(p, 'W')
    const pic = await secPic(p, W, 'W', 'c02-picked-W')
    judgeCol(W, 'c02W', "Fable C-02 / Astra A01 (W, Edit Schedule's crew panel)", s, pics(pic, a.now))
    if (sB) chk(W, 'c02W.same', 'Fable C-02: the panel reads as the board does — the same words, letters and hours for each SANS man', s.rows.every(r => { const b = rowOf(sB, r.id); return b && b.why === r.why && b.badge === r.badge }), s.rows.filter(r => { const b = rowOf(sB, r.id); return !b || b.why !== r.why || b.badge !== r.badge }).map(r => `${r.cs}: W "${r.why}" [${r.badge}] / B ${b2(rowOf(sB, r.id))}`).join(' · ') || 'all the same')
    await unarm(p, W, 'W')
  })
  function b2(r) { return r ? `"${r.why}" [${r.badge}]` : 'absent' }
  /* R-04: Bolt picked first (his crew puck pressed, nothing armed) — what the AMT place and a flying place say to him */
  await step(W, 'r04', async () => {
    await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B')
    const pk = p.locator('#schedBoard .rpuck[data-person="yeti"]:visible').first()
    if (W.isPhone) await pk.tap(); else await pk.click()
    await sleep(450)
    const r = await p.evaluate(ri => {
      const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
      const z = [...document.querySelectorAll(`#schedBoard [data-fill="s:6.amt.${ri}.+"]`)].find(e => e.getBoundingClientRect().width > 0)
      const seats = [...document.querySelectorAll(`#schedBoard [data-fill^="s:6.amt.${ri}."]`)].filter(e => e.getBoundingClientRect().width > 0)
      const w = [...document.querySelectorAll('.dragover-why, .dzwhy, [class*="why"]')].filter(e => e.getBoundingClientRect().width > 0 && !e.closest('.rsans, .ros-body, .sb-ros')).map(t)
      return { pick: (window.PICK && (window.PICK.id || window.PICK.person)) || (window.ARM && window.ARM.person) || null, zone: z ? { cls: String(z.className), title: z.getAttribute('title') || '' } : null, seats: seats.map(e => `${e.dataset.fill} [${String(e.className)}] "${e.getAttribute('title') || ''}"`), whys: w.slice(0, 6) }
    }, ri)
    const pic = await crop(p, W, [`#schedBoard [data-fill="s:6.amt.${ri}.+"]`, '#schedBoard .rpuck[data-person="yeti"]'], 'r04-bolt-picked', 30)
    rec(W, 'r04', 'Fable R-04: Bolt picked first — what the AMT box (closed to him) shows and says (expected the same words as his line, "SANS — offered Fly only, not AMT")', J(r), pic)
    await p.keyboard.press('Escape'); await sleep(300)
  })
  /* R-03 / A17: the drop's note — the AMT + armed, struck Bolt pressed (and on the desktop, dragged and dropped) */
  await step(W, 'r03', async () => {
    await arm(p, W, 'B', DI, amtAdd(ri))
    const h0 = await holds(p, DI, 'yeti')
    const k = await pickMan(p, W, 'B', 'yeti', 'r03-bolt', { now: true, pic: true })
    const h1 = await holds(p, DI, 'yeti')
    const wantN = `Bolt — ${WORDS.flyOnlyNotAmt}`
    chk(W, 'r03.note', `Fable R-03 / Astra A17: the note after pressing struck Bolt for the AMT place reads "${wantN}" (one source with his line)`, k.toast === wantN || (k.seen || []).includes(wantN), `note "${k.toast}" · seen ${J(k.seen)} · ${h1 > h0 ? 'PLANTED' : 'not planted'}`, pics(k.tpic, k.now))
    rec(W, 'r03.planted', 'Fable R-03: whether Bolt was planted or refused (as built)', h1 > h0 ? 'planted on the AMT box' : 'refused — not planted')
    if (h1 > h0) { await openB(p, W, DI); await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(500); rec(W, 'r03.undo', "the board's Undo takes him off again", (await holds(p, DI, 'yeti')) === h0 ? 'off again' : 'STILL ON') }
    await unarm(p, W, 'B')
    if (!W.isPhone) {
      const d = await dragHold(p, W, 'B', 'yeti', amtAdd(ri), 'r02-bolt-amt', { pic: true })
      chk(W, 'r02.amt', `Fable R-02 / Astra A17: dragging Bolt and holding him over the AMT box — the drag's words "${WORDS.flyOnlyNotAmt}" (the same as his line)`, d.ok && (d.hover.why === WORDS.flyOnlyNotAmt || (d.hover.over || []).some(x => x.includes(WORDS.flyOnlyNotAmt))), J(d.hover), d.hpic)
      const e = await dragHold(p, W, 'B', 'yeti', amtAdd(ri), 'r03-bolt-drop', { drop: true })
      const h2 = await holds(p, DI, 'yeti')
      chk(W, 'r03.drop', `Fable R-03: Bolt dragged and DROPPED on the AMT box — the note "${wantN}"`, e.note === wantN || (e.seen || []).includes(wantN), `note "${e.note}" · seen ${J(e.seen)} · ${h2 > h0 ? 'planted' : 'not planted'}`)
      if (h2 > h0) { await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(500) }
    }
  })
  /* S-06: Zenith planted on the AMT box's seat; then the + add pressed: Zenith faded as tasked, his "A" in the column */
  await step(W, 's06', async () => {
    const a = await arm(p, W, 'B', DI, amtAdd(ri))
    if (!a.armed) { nw(W, 's06', 'Fable S-06', 'the AMT seat did not arm: ' + J(a)); return }
    await pickMan(p, W, 'B', 'vinci', 's06-zenith')
    await unarm(p, W, 'B')
    await arm(p, W, 'B', DI, amtAdd(ri))
    const s = await readSec(p, 'B'), z = rowOf(s, 'vinci')
    const pic = await secPic(p, W, 'B', 's06-zenith-tasked')
    rec(W, 's06', 'Fable S-06: Zenith on the AMT seat, the + add pressed — his row (faded as tasked?), no SANS reason, his "A" in the column; the heading leaves him out', `${rowSay(z)} cls "${z && z.cls}" · head "${s.head}" · ${colJudge(s).why}`, pic)
    chk(W, 's06.col', 'Fable S-06: the letters still in one column with Zenith tasked', colJudge(s).ok, colJudge(s).why)
    await unarm(p, W, 'B')
    await openB(p, W, DI); await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(500)
  })
  /* S-04 / A19: the + add pressed, then the board moved to Sat 18 and back */
  await step(W, 's04', async () => {
    await arm(p, W, 'B', DI, amtAdd(ri))
    const go = async di => { if (W.isPhone) { await W5.boardDrawer(p, W, false); await W.press(p, di < DI ? '#sbPrevDay' : '#sbNextDay', 'day') } else await W.press(p, `#sbDays [data-sbtab="${di}"]`, 'day-tab'); await sleep(800); await showList(p, W, 'B') }
    await go(5)
    const s5 = await readSec(p, 'B')
    chk(W, 's04.sat', 'Fable S-04 / Astra A19: moved to Sat 18 with Sunday\'s place picked — never Sunday\'s reasons over Saturday\'s men', !(s5.rows || []).some(r => [WORDS.flyOnlyNotAmt, WORDS.oftOnlyNotAmt, WORDS.flyOftNotAmt, WORDS.hours('08:00–10:00')].includes(r.why)), `day ${await p.evaluate(() => window.SBDAY)} armed ${s5.armed} · ${secSay(s5)}`)
    await go(6)
    const s6 = await readSec(p, 'B')
    rec(W, 's04.back', 'Fable S-04: back on Sun 19 — the list now', `armed ${s6.armed} · ${secSay(s6)}`)
    await unarm(p, W, 'B')
  })
  if (!W.isPhone) {
    /* S-03 + H-02: a free man dropped on the + add, Undo, Redo; then the AMT box's times changed to 08:30–09:30 (Jester's
       hours cover it) and back by Undo */
    await step(W, 's03', async () => {
      await arm(p, W, 'B', DI, amtAdd(ri))
      await pickMan(p, W, 'B', 'vinci', 's03-zenith')
      const s1 = await readSec(p, 'B')
      await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(500); const s2 = await readSec(p, 'B')
      await W.press(p, '#sbRedo:visible', 'sb-redo'); await sleep(500); const s3 = await readSec(p, 'B')
      rec(W, 's03', 'Fable S-03: Zenith planted on the + add, then Undo, then Redo — the list after each (the reasons, count and column those of the state shown)', `planted: ${s1.head}, armed ${s1.armed}, ${colJudge(s1).why} · undo: ${s2.head}, armed ${s2.armed}, ${colJudge(s2).why} · redo: ${s3.head}, armed ${s3.armed}, ${colJudge(s3).why}`)
      chk(W, 's03.col', 'Fable S-03: after each step the letters stand in one column', [s1, s2, s3].every(s => colJudge(s).ok || colJudge(s).why.startsWith('no letters')), [s1, s2, s3].map(s => colJudge(s).why).join(' / '))
      await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400); await unarm(p, W, 'B')
      await L.typeBox(p, W, `[data-bfld="sr:${DI}.amt.${ri}.str"]`, '08:30'); await L.typeBox(p, W, `[data-bfld="sr:${DI}.amt.${ri}.end"]`, '09:30')
      await arm(p, W, 'B', DI, amtAdd(ri))
      const s4 = await readSec(p, 'B'), j = rowOf(s4, 'ipman')
      const pic = await secPic(p, W, 'B', 'h02-covered')
      chk(W, 'h02', 'Fable H-02 / Astra A13: the AMT box 08:30–09:30 (inside his 08:00–10:00) pressed — Jester plain, no reason', j && !j.struck && !j.why, rowSay(j), pic)
      rec(W, 'h02.split', 'Fable H-02 / Q5: his badge with a place picked that he is not struck for (the split follows the pick? — RECORDED)', `${rowSay(j)} · his row ${j && j.rowH}px, others ${s4.rows.filter(r => r.id !== 'ipman').map(r => r.rowH).join('/')}`)
      await unarm(p, W, 'B')
      await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400); await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400)
      await arm(p, W, 'B', DI, amtAdd(ri))
      const s5 = await readSec(p, 'B')
      chk(W, 's03.undoTimes', 'Fable S-03: the times put back by Undo — Jester struck for his hours again, no line from the step before', rowOf(s5, 'ipman') && rowOf(s5, 'ipman').why === WORDS.hours('08:00–10:00'), `AMT box ${J(await p.evaluate(r => { const x = window.DAYS[6].sims.amt[r]; return x && [x.str, x.end] }, ri))} · ${rowSay(rowOf(s5, 'ipman'))}`)
    })
    /* C-12: the window drawn in to 1100, 821 and 820 wide with the place picked */
    await step(W, 'c12', async () => {
      await arm(p, W, 'B', DI, amtAdd(ri))
      const out = []
      for (const w of [1100, 821, 820]) {
        await p.setViewportSize({ width: w, height: 1000 }); await sleep(700)
        await showList(p, W, 'B')
        /* at 820 the phone layout takes over: the crew list is the board's drawer, opened on its tab */
        if (w <= 820 && await p.locator('#schedBoard .sb-ros .ros-tab:visible').count()) {
          const out = await p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-ros .ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < innerWidth - 60 })
          if (!out) { await W.press(p, '#schedBoard .sb-ros .ros-tab:visible', 'aircrew'); await sleep(500) }
        }
        const s = await readSec(p, 'B')
        const pic = w === 820 || w === 1100 ? await secPic(p, W, 'B', 'c12-' + w) : ''
        const c = colJudge(s)
        out.push(w)
        chk(W, 'c12.' + w, `Fable C-12 / Astra A20: the window ${w} wide — one column, nothing cut, nothing over another row, no sideways scroll`, s.rows && c.ok && !s.rows.some(r => r.cut || r.past) && !s.sideways.length, `${c.why} · ${s.rows ? s.rows.filter(r => r.cut || r.past || r.whyLines > 1).map(rowSay).join(' · ') : J(s)}${s.sideways.length ? ' sideways ' + s.sideways : ''}`, pic)
      }
      await p.setViewportSize({ width: 1536, height: 1000 }); await sleep(500)
      await unarm(p, W, 'B')
    })
  }
}

/* A-01, A-02, A-03, A-05(b–d), A02, A04, A18, C-06 / A12, C-10 / A09, R-02, R-05, S-05, A-10 — every filing against every
   place on one day */
const MEN_ALL = [['yeti', ['fly']], ['romeo', ['oft']], ['vinci', ['amt']], ['krait', ['fly', 'oft']], ['cards', ['fly', 'amt']], ['wrangler', ['oft', 'amt']], ['ipman', ['fly', 'oft', 'amt']]]
SC.combo = async (p, W) => {
  for (const [id, kinds] of MEN_ALL) { const f = await fileS(p, W, SUN, id, kinds, null); Z.need(W, 'set.' + id, `${id} filed ${kinds.join('+')} all day for Sun 19`, !!f.iid, f.iid ? J(f.made) : f.refused) }
  const l = await Z.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  Z.need(W, 'set.line', 'a flying line VL BFM 13:00–14:00 on Sun 19', l.wi >= 0 && l.f.to === '13:00', J(l.f))
  const oft = await W5.addSim(p, W, DI, 'oft', 'OFT', '10:00', '11:00'), amt = await W5.addSim(p, W, DI, 'amt', 'AMT', '13:00', '14:00')
  Z.need(W, 'set.sims', 'an OFT box 10:00–11:00 and an AMT box 13:00–14:00 on Sun 19', oft.r.str === '10:00' && amt.r.str === '13:00', J([oft.r, amt.r]))
  const sc = await A.addLine(p, W, DI, { kind: 'SC' })
  Z.need(W, 'set.sc', '+ Wave → SC on Sun 19', sc.wi > l.wi, J(sc))
  const g = await L.groundRow(p, W, DI, 'B GROUND', '10:00', '11:00', null).catch(e => ({ ri: -1, err: String(e).slice(0, 100) }))
  if (W.isPhone) { await T.reload(p, 'ad', 'a'); await sleep(500) }
  rec(W, 'set.sday', "the SANS calendar's Sun 19 window", await sansDayRows(p, W, SUN))
  const PL = [
    ['fly-front', 'fly', `[data-slot="${l.fcp}"]`], ['fly-rear', 'fly', `[data-slot="${l.rcp}"]`],
    /* run 1: a sim box on this build has no seat places of its own — its people are put in at its "+ add" alone */
    ['oft-add', 'oft', `[data-fill="s:${DI}.oft.${oft.ri}.+"]`], ['amt-add', 'amt', `[data-fill="s:${DI}.amt.${amt.ri}.+"]`],
    ['sc-main', 'sb', `[data-slot="${DI}.${sc.wi}.0.0.p"]`],
  ]
  /* PL: 0 fly-front, 1 fly-rear, 2 oft-add, 3 amt-add, 4 sc-main. Otter and Marlin are WSOs: the rear seat is theirs */
  const PICS = W.isPhone ? ['fly-rear', 'amt-add'] : ['fly-rear', 'oft-add', 'amt-add', 'sc-main']
  const reads = {}
  for (const [nm, ev, sel] of PL) await step(W, 'a01.' + nm, async () => {
    const a = await arm(p, W, 'B', DI, sel, { now: PICS.includes(nm), tag: 'a01-' + nm })
    if (!a.armed) { nw(W, 'a01.' + nm, `the ${nm} place`, 'did not arm: ' + J(a)); return }
    const s = await readSec(p, 'B'); reads[nm] = s
    const pic = PICS.includes(nm) ? await secPic(p, W, 'B', 'a01-' + nm) : ''
    const bad = [], seatOnly = []
    for (const [id, kinds] of MEN_ALL) {
      const r = rowOf(s, id), w = want(kinds, ev)
      if (!r) { bad.push(id + ' NOT IN THE SANS SECTION'); continue }
      if (w === null) { if (isSans(r.why)) bad.push(`${r.cs} should be plain of SANS, reads "${r.why}"`); else if (r.why) seatOnly.push(`${r.cs} "${r.why}"`) }
      else if (r.why !== w) { if (r.why && !isSans(r.why)) seatOnly.push(`${r.cs} "${r.why}" (wanted "${w}" — another reason outranks)`); else bad.push(`${r.cs}: "${r.why}" ≠ "${w}"`) }
    }
    const ids = { 'fly-front': 'Fable A-01 / Astra A02', 'fly-rear': 'Fable A-02 / Astra A02', 'oft-p': 'Fable A-01 / Astra A02', 'oft-w': 'Fable A-02 / Astra A02', 'oft-add': 'Fable A-02 / Astra A02', 'amt-p': 'Fable A-01 / Astra A02', 'amt-w': 'Fable A-02 / Astra A02', 'amt-add': 'Fable A-02 / A-03 / Astra A02', 'sc-main': 'Fable A-05d / S-05 / Astra A18' }[nm]
    chk(W, 'a01.' + nm, `${ids}: the ${nm} place pressed — every filed man reads his cell of the words table (D2584 Q2, events F, O, A)${ev === 'sb' ? ' — a standby place strikes no SANS man (D2584 Q4)' : ''}`, !bad.length, (bad.length ? 'WRONG: ' + bad.join(' · ') + ' || ' : '') + MEN_ALL.map(([id]) => rowSay(rowOf(s, id))).join(' · ') + (seatOnly.length ? ' || other reasons: ' + seatOnly.join(' · ') : ''), pics(pic, a.now))
    const j = rowOf(s, 'ipman')
    chk(W, 'a03.' + nm, `Fable A-03 / Astra A02: Jester (Fly + OFT + AMT) never struck for a SANS reason; letters "F/O/A", no hours line (${nm})`, j && !isSans(j.why) && j.badge === 'F/O/A' && !j.h, rowSay(j))
    const nf = s.rows.filter(r => ['badger'].includes(r.id) || (!MEN_ALL.some(m => m[0] === r.id) && r.id !== 'bane'))
    if (ev === 'sb') chk(W, 'a05d.' + nm, 'Fable A-05d / N-10 / Astra A04, A18: a standby place — the nothing-filed men are not struck for SANS, no SANS line', nf.every(r => !isSans(r.why)), nf.map(rowSay).join(' · '))
    else rec(W, 'a05.' + nm, `Fable A-05b,c / Astra A04: the nothing-filed men with the ${nm} place picked (their line RECORDED, never telling to file)`, nf.map(rowSay).join(' · ') + (s.toFile.length ? ' · TELLS TO FILE ' + s.toFile.join('|') : ''))
    const c = colJudge(s)
    chk(W, 'col.' + nm, `Fable C-06 / N-05 / Astra A10: the letters in one column after the widest reason (${nm})`, c.ok, c.why)
    chk(W, 'nofile.' + nm, `N-01: no line in the list tells the scheduler to file (${nm})`, !s.toFile.length, s.toFile.join(' | ') || 'none')
    const cut = s.rows.filter(r => r.cut || r.past)
    chk(W, 'cut.' + nm, `N-06 / N-12: nothing cut or past the list's edge, no sideways scroll (${nm})`, !cut.length && !s.sideways.length && !s.pageWide, cut.map(rowSay).join(' · ') + ' ' + s.sideways.join(','))
    if (nm === 'fly-rear') {
      const o = rowOf(s, 'wrangler')
      rec(W, 'c10B', `Fable C-10 / Astra A09 (B${W.isPhone ? ', 402' : ''}): "SANS — offered OFT and AMT only, not Fly" under struck Otter — one line or wrapped (a wrap is his question, a cut a FAIL)`, rowSay(o) + ` · reason ${o && o.whyL}–${o && o.whyR}, section ${s.secL}–${s.secR}, screen ${s.vw}, his letters at ${o && o.bL}`, pic)
      chk(W, 'c10B.whole', 'Fable C-10 / Astra A09: the longest line whole — never cut, never past the drawer or the screen; his "O/A" in the column', o && o.why === 'SANS — offered OFT and AMT only, not Fly' && !o.cut && !o.past && o.badge === 'O/A' && Math.abs(o.bL - s.colL) <= 0.5, rowSay(o))
    }
  })
  /* C-06 / A12: from the AMT + add, straight to the OFT + add, then the flying seat, then back — no unpick between */
  await step(W, 'c06', async () => {
    await arm(p, W, 'B', DI, PL[3][2])
    const out = []
    for (const [nm, ev, sel] of [PL[2], PL[1], PL[3]]) {
      const z = p.locator(L.B(sel)).first()
      await showList(p, W, 'B', false)
      await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
      const ab = await z.locator('.addz').first().boundingBox().catch(() => null), zb = await z.boundingBox()
      const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
      if (W.isPhone) await z.tap({ position: pos }); else await z.click({ position: pos })
      await sleep(500); await showList(p, W, 'B')
      const s = await readSec(p, 'B')
      const bad = MEN_ALL.filter(([id, k]) => { const r = rowOf(s, id), w = want(k, ev); return !r || (w === null ? isSans(r.why) : (isSans(r.why) && r.why !== w)) }).map(([id]) => rowSay(rowOf(s, id)))
      out.push(`${nm}: armed ${s.armed}; ${bad.length ? 'WRONG ' + bad.join(' · ') : 'all as the table'}; ${colJudge(s).why}`)
      chk(W, 'c06.' + nm, `Fable C-06 / Astra A12: switched straight to ${nm} (no unpick) — the reasons are the new place's at once, none left from the place before; the column re-settles`, s.armed && !bad.length && colJudge(s).ok, out[out.length - 1])
    }
    await unarm(p, W, 'B')
  })
  /* C-10 / A09 on Edit Schedule's crew panel: the week's flying seat pressed */
  await step(W, 'c10W', async () => {
    const a = await arm(p, W, 'W', DI, `[data-slot="${l.rcp}"]`, { now: W.isPhone, tag: 'c10W' })
    if (!a.armed) { nw(W, 'c10W', 'the week\'s flying seat', 'did not arm ' + J(a)); return }
    const s = await readSec(p, 'W'), o = rowOf(s, 'wrangler')
    const pic = await secPic(p, W, 'W', 'c10-fly-W')
    chk(W, 'c10W', `Fable C-10 / H-07 / Astra A09 (W${W.isPhone ? ', 402' : ''}): Otter's "SANS — offered OFT and AMT only, not Fly" whole in Edit Schedule's panel, his "O/A" in the column, nothing sideways`, o && o.why === 'SANS — offered OFT and AMT only, not Fly' && !o.cut && !o.past && !s.sideways.length && colJudge(s).ok, `${rowSay(o)} · ${colJudge(s).why}${s.sideways.length ? ' sideways ' + s.sideways : ''}`, pics(pic, a.now))
    const rb = reads['fly-rear'] && rowOf(reads['fly-rear'], 'wrangler')
    if (rb) chk(W, 'r05.W', 'Fable R-05: the panel (W) and the board (B) give Otter the same words for the flying (rear) seat', o && o.why === rb.why, `W "${o && o.why}" · B "${rb.why}"`)
    await unarm(p, W, 'W')
  })
  if (!W.isPhone) await step(W, 'r02', async () => {
    /* R-02 / R-05 / A17: drag hover with nothing picked — Bolt over OFT, AMT, the flying seat, SC MAIN; Otter over the flying
       seat; Otter dropped on the flying seat (the note), then Undo */
    await openB(p, W, DI); await unarm(p, W, 'B')
    const cases = [['yeti', PL[2], want(['fly'], 'oft')], ['yeti', PL[3], want(['fly'], 'amt')], ['yeti', PL[0], null], ['yeti', PL[4], null], ['wrangler', PL[1], want(['oft', 'amt'], 'fly')]]
    for (const [id, [nm, , sel], w] of cases) {
      const d = await dragHold(p, W, 'B', id, sel, `r02-${id}-${nm}`, { pic: w !== null && (nm === 'fly-rear' || nm === 'oft-add') })
      const words = d.ok ? [d.hover.why, ...(d.hover.over || [])].filter(Boolean).join(' | ') : d.why
      chk(W, `r02.${id}.${nm}`, `Fable R-02 / R-05 / Astra A17: ${id} dragged, held over ${nm} — the drag's words ${w ? `"${w}"` : 'carry no SANS reason'}`, d.ok && (w ? words.includes(w) && !words.includes('not offering') : !/SANS/.test(words)), `ghost "${d.hover && d.hover.ghostWords}" · why "${d.hover && d.hover.why}" · over ${J(d.hover && d.hover.over)}`, d.hpic)
    }
    const h0 = await holds(p, DI, 'wrangler')
    const e = await dragHold(p, W, 'B', 'wrangler', PL[1][2], 'r05-otter-drop', { drop: true })
    const wantN = 'Otter — ' + want(['oft', 'amt'], 'fly')
    chk(W, 'r05.drop', `Fable R-05 / R-03: Otter dropped on the flying seat — the note "${wantN}"`, e.note === wantN || (e.seen || []).includes(wantN), `note "${e.note}" · seen ${J(e.seen)} · ${(await holds(p, DI, 'wrangler')) > h0 ? 'planted' : 'not planted'}`)
    if ((await holds(p, DI, 'wrangler')) > h0) { await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400) }
    const t = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .rpuck[data-person="wrangler"]')].find(x => x.getBoundingClientRect().width > 0); return e ? e.getAttribute('title') : null })
    rec(W, 'r05.hoverNoPick', 'Fable R-01 / R-05: Otter\'s hover words with nothing picked', `"${t}"`)
  })
  /* A-10: a ground row's place pressed — no SANS man struck for SANS, the letters stay in one column */
  await step(W, 'a10', async () => {
    if (!(g && g.ri >= 0)) { nw(W, 'a10', 'Fable A-10', 'no ground row made ' + J(g)); return }
    const a = await arm(p, W, 'B', DI, `[data-fill="g:${DI}.${g.ri}.+"]`)
    const s = await readSec(p, 'B')
    chk(W, 'a10', 'Fable A-10: a ground row\'s place pressed — no SANS man struck for a SANS reason, no SANS line; the letters in one column', a.armed && s.rows.every(r => !isSans(r.why)) && colJudge(s).ok, `armed ${a.armed} · ${secSay(s)}`)
    await unarm(p, W, 'B')
  })
}

/* A-06 = A05, A-07 = A06, A07 (the clock moved to Fri 17), C-05a = A11, R-01 / R-03 for Ranger */
SC.ranger = async (p, W) => {
  await postR(p, W, 'post')
  const s3 = await W5.addSim(p, W, 3, 'oft', 'OFT', '10:00', '11:00'), s4 = await W5.addSim(p, W, 4, 'oft', 'OFT', '10:00', '11:00'), s5 = await W5.addSim(p, W, 5, 'oft', 'OFT', '10:00', '11:00')
  const l5 = await Z.mkLine(p, W, 5, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  const l3 = await Z.mkLine(p, W, 3, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  Z.need(W, 'set', 'OFT boxes 10:00–11:00 on Thu 16, Fri 17, Sat 18; flying lines VL BFM 13:00–14:00 on Thu 16 and Sat 18', [s3, s4, s5].every(s => s.r.str === '10:00') && l5.wi >= 0 && l3.wi >= 0, J([s3.r, s4.r, s5.r, l5.f, l3.f]))
  if (W.isPhone) { await T.reload(p, 'ad', 'a'); await sleep(500) }
  /* the coordinator's addition: the note after Ranger is tap-planted into a flying seat on Sat 18 (on / after his SANS
     date, nothing filed) and on Thu 16 (before it) */
  for (const [di, l, nm] of [[5, l5, 'Sat 18 (after his date, nothing filed)'], [3, l3, 'Thu 16 (before his date)']]) await step(W, 'rnote.' + di, async () => {
    const a = await arm(p, W, 'B', di, `[data-slot="${l.fcp}"]`)
    const h0 = await holds(p, di, 'bane')
    const k = await pickMan(p, W, 'B', 'bane', `rnote-${di}`, { now: true, pic: true })
    const h1 = await holds(p, di, 'bane')
    rec(W, 'rnote.' + di, `coordinator: Ranger tap-planted into the flying seat on ${nm} — the note`, `armed ${a.armed} · note "${k.toast}" · seen ${J(k.seen)} · ${h1 > h0 ? 'PLANTED' : 'not planted'}${di === 5 ? ` (his line's words: "${R17N}")` : ''}`, pics(k.tpic, k.now))
    if (h1 > h0) { await openB(p, W, di); await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400); rec(W, 'rnote.' + di + '.undo', 'the board\'s Undo takes him off', (await holds(p, di, 'bane')) === h0 ? 'off' : 'STILL ON') }
    await unarm(p, W, 'B')
  })
  await step(W, 'a06.thu', async () => {
    await arm(p, W, 'B', 3, `[data-fill="s:3.oft.${s3.ri}.+"]`)
    const s = await readSec(p, 'B'), me = await Z.listOf(p, '#schedBoard', 'bane')
    chk(W, 'a06.thu', 'Fable A-06 / Astra A05: Thu 16 (before his date), an OFT place picked — Ranger not under SANS Avail, no SANS reason', !rowOf(s, 'bane') && (me.me || []).every(x => x.where !== 'SANS Avail' && !/SANS/.test(x.printed)), `where ${J((me.me || []).map(x => x.where + (x.printed ? ' "' + x.printed + '"' : '')))}`)
    await unarm(p, W, 'B')
  })
  const look = async (di, sel, nm, tag, picIt) => {
    const a = await arm(p, W, 'B', di, sel, { now: picIt, tag })
    const s = await readSec(p, 'B'), r = rowOf(s, 'bane')
    const pic = picIt ? await secPic(p, W, 'B', tag) : ''
    return { a, s, r, pic }
  }
  for (const [di, sel, nm, picIt] of [[4, `[data-fill="s:4.oft.${s4.ri}.+"]`, 'Fri 17 OFT', true], [5, `[data-fill="s:5.oft.${s5.ri}.+"]`, 'Sat 18 OFT', false], [5, `[data-slot="${l5.fcp}"]`, 'Sat 18 flying seat', false]]) await step(W, 'a06.' + nm, async () => {
    const { a, s, r, pic } = await look(di, sel, nm, 'a06-' + nm.replace(/\s+/g, '-'), picIt)
    chk(W, 'a06.' + nm.replace(/\s+/g, ''), `Fable A-06 / Astra A05 (B): ${nm} picked — Ranger under SANS Avail, struck, exactly "${R17N}" (no full stop, never "File it…"), no letters`, a.armed && r && r.struck && r.why === R17N && !r.badge && !s.toFile.length, rowSay(r) + ' · ' + colJudge(s).why, pics(pic, a.now))
    if (di === 4) {
      chk(W, 'c05a', 'Fable C-05a / Astra A11: Ranger\'s line (no letters) the widest — the column stands after it', colJudge(s).ok, colJudge(s).why + ' · ' + secSay(s))
      rec(W, 'r01.ranger', "Fable R-01: Ranger's hover words (his name's title) with the place picked", `"${r && r.title}"`)
      if (!W.isPhone) {
        await unarm(p, W, 'B')
        const d = await dragHold(p, W, 'B', 'bane', sel, 'r02-ranger', { pic: true })
        chk(W, 'r02.ranger', `Fable R-02 / Astra A17: Ranger dragged over Fri 17's OFT — the drag's words "${R17N}"`, d.ok && [d.hover.why, ...(d.hover.over || [])].some(x => x && x.includes(R17N)), J(d.hover), d.hpic)
        await arm(p, W, 'B', 4, sel)
      }
      const k = await pickMan(p, W, 'B', 'bane', 'r03-ranger', { now: true, pic: true })
      chk(W, 'r03.ranger', `Fable R-03 / Astra A17: Ranger pressed for Fri 17's OFT — the note "Ranger — ${R17N}"`, k.toast === 'Ranger — ' + R17N || (k.seen || []).includes('Ranger — ' + R17N), `note "${k.toast}" · seen ${J(k.seen)}`, pics(k.tpic, k.now))
      if ((await holds(p, 4, 'bane')) > 0 && !k.toast) { }
      await openB(p, W, 4); if (await p.locator('#sbUndo:visible:not([disabled])').count()) { await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400) }
      /* the same on Edit Schedule's crew panel (W) */
      const aw = await arm(p, W, 'W', 4, sel, { now: W.isPhone, tag: 'a06W' })
      const sw = await readSec(p, 'W'), rw = rowOf(sw, 'bane')
      const pw = await secPic(p, W, 'W', 'a06-Fri-17-OFT-W')
      chk(W, 'a06.FriW', `Fable A-06 / Astra A05 (W): Fri 17 OFT picked on the week — Ranger reads exactly "${R17N}"`, aw.armed && rw && rw.why === R17N, rowSay(rw), pics(pw, aw.now))
      await unarm(p, W, 'W')
    }
    await unarm(p, W, 'B')
  })
  /* A-07 / A06: Ranger files Sat 18 Fly only (his own sign-in); then OFT added; then deleted */
  await step(W, 'a07', async () => {
    await asR(p, W)
    const f = await fileS(p, W, SAT, null, ['fly'], null)
    await asS(p, W)
    Z.need(W, 'a07.file', 'Ranger (signed in) filed Sat 18 Fly only, all day, on his SANS tab', !!f.iid, f.iid ? J(f.made) : f.refused)
    const o = await look(5, `[data-fill="s:5.oft.${s5.ri}.+"]`, 'Sat OFT', 'a07-sat-oft', true)
    chk(W, 'a07.oft', 'Fable A-07 / Astra A06: Sat 18 OFT picked — Ranger "SANS — offered Fly only, not OFT", letter "F" in the column', o.r && o.r.why === 'SANS — offered Fly only, not OFT' && o.r.badge === 'F' && colJudge(o.s).ok, rowSay(o.r) + ' · ' + colJudge(o.s).why, pics(o.pic, o.a.now))
    await unarm(p, W, 'B')
    const fl = await look(5, `[data-slot="${l5.fcp}"]`, 'Sat fly', 'a07-sat-fly', false)
    chk(W, 'a07.fly', 'Fable A-07 / Astra A06: Sat 18 flying seat picked — Ranger plain of SANS', fl.r && !isSans(fl.r.why), rowSay(fl.r))
    await unarm(p, W, 'B')
    const fr = await look(4, `[data-fill="s:4.oft.${s4.ri}.+"]`, 'Fri OFT', 'a07-fri', false)
    chk(W, 'a07.fri', `Fable A-07: Fri 17 (nothing filed for it) keeps "${R17N}"`, fr.r && fr.r.why === R17N, rowSay(fr.r))
    await unarm(p, W, 'B')
    await asR(p, W); const e1 = await editS(p, W, SAT, f.iid, { kinds: ['fly', 'oft'] }); await asS(p, W)
    const o2 = await look(5, `[data-fill="s:5.oft.${s5.ri}.+"]`, 'Sat OFT', 'a07-sat-oft2', false)
    chk(W, 'a06b.oft', 'Astra A06: his filing changed to Fly + OFT — Sat 18 OFT picked, Ranger plain, letters "F/O"', o2.r && !isSans(o2.r.why) && o2.r.badge === 'F/O', `${J(e1.now)} · ${rowSay(o2.r)}`)
    await unarm(p, W, 'B')
    await asR(p, W); const e2 = await editS(p, W, SAT, f.iid, { del: true }); await asS(p, W)
    const o3 = await look(5, `[data-fill="s:5.oft.${s5.ri}.+"]`, 'Sat OFT', 'a07-sat-oft3', false)
    chk(W, 'a06c.del', `Astra A06: his filing deleted — Sat 18 OFT picked reads "${R17N}" again, no letters`, o3.r && o3.r.why === R17N && !o3.r.badge, `deleted ${e2.ok} "${e2.toast}" · ${rowSay(o3.r)}`)
    await unarm(p, W, 'B')
  })
  /* Astra A07: the posting's day arrives — the clock moved to Fri 17 09:00 */
  await step(W, 'a07astra', async () => {
    await T.moveClock(p, W, '2026-07-17T09:00:00')
    const o = await look(4, `[data-fill="s:4.oft.${s4.ri}.+"]`, 'Fri OFT', 'a07astra-fri', true)
    chk(W, 'A07.fri', 'Astra A07: on Fri 17 itself (his posting run), the OFT place picked — "SANS — no availability filed for today", no "SANS from Fri 17 Jul" prefix', o.r && o.r.why === 'SANS — no availability filed for today', `${rowSay(o.r)} · today ${await p.evaluate(() => new Date().toDateString())}`, pics(o.pic, o.a.now))
    await unarm(p, W, 'B')
    const s = await readSec(p, 'B')
    chk(W, 'A07.unpick', 'Astra A07: unpicked — the line goes', !rowOf(s, 'bane') || !rowOf(s, 'bane').why, rowSay(rowOf(s, 'bane')))
  })
}

/* H-03 = A14, H-04, H-05 = A15, H-06, A13: hours, AM / PM, two sets of hours */
SC.hours = async (p, W) => {
  const sp = {}
  for (const [id, kinds, span] of [['yeti', ['fly'], 'AM'], ['krait', ['fly'], 'PM'], ['romeo', ['fly'], null], ['cards', ['fly', 'oft'], ['08:00', '10:00']], ['wrangler', ['fly', 'oft', 'amt'], ['14:00', '17:30']], ['ipman', ['amt'], ['08:00', '10:00']]]) {
    const f = await fileS(p, W, SUN, id, kinds, span)
    sp[id] = f
    if (!f.iid) rec(W, 'set.' + id, `${id} filed ${kinds.join('+')} ${J(span)}`, 'NOT MADE: ' + f.refused)
  }
  rec(W, 'set.read', 'what each filing window said before Save (its read-out)', Object.entries(sp).map(([k, f]) => `${k}: "${f.read}"`).join(' · '))
  const am = await Z.mkLine(p, W, DI, { cs: 'AM', msn: 'BFM', to: '08:00', ld: '09:00' }), pm = await Z.mkLine(p, W, DI, { cs: 'PM', msn: 'BFM', to: '14:00', ld: '15:00' })
  const oft = await W5.addSim(p, W, DI, 'oft', 'OFT', '10:00', '11:00'), amt = await W5.addSim(p, W, DI, 'amt', 'AMT', '13:00', '14:00')
  Z.need(W, 'set.places', 'flying lines AM 08:00–09:00 and PM 14:00–15:00, OFT 10:00–11:00, AMT 13:00–14:00 on Sun 19', am.wi >= 0 && pm.wi >= 0 && oft.r.str === '10:00' && amt.r.str === '13:00', J([am.f, pm.f, oft.r, amt.r]))
  if (W.isPhone) { await T.reload(p, 'ad', 'a'); await sleep(500) }
  rec(W, 'set.sday', "the SANS calendar's Sun 19 window", await sansDayRows(p, W, SUN))
  await step(W, 'h03.none', async () => {
    await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B')
    const s = await readSec(p, 'B')
    const pic = await secPic(p, W, 'B', 'h03-nopick')
    const by = id => rowOf(s, id) || {}
    rec(W, 'h03.none', 'Fable H-03 / Astra A14, nothing picked: the AM, PM and whole-day men\'s letters ("F · AM", "F · PM", "F" expected), Marlin and Otter with hours', `Bolt [${by('yeti').badge}] · Kraken [${by('krait').badge}] · Rebel [${by('romeo').badge}] · Marlin [${by('cards').badge}] · Otter [${by('wrangler').badge}] · Jester [${by('ipman').badge}] · ${colJudge(s).why}`, pic)
    chk(W, 'h03.none.ok', 'Fable H-03 nothing picked: "F · AM", "F · PM", "F"; nothing on a second line (N-08)', by('yeti').badge === 'F · AM' && by('krait').badge === 'F · PM' && by('romeo').badge === 'F' && s.rows.every(r => r.bLines <= 1 && !r.why), s.rows.filter(r => r.badge).map(rowSay).join(' · '))
  })
  const P = [['am-fly', 'fly', `[data-slot="${am.fcp}"]`, true], ['pm-fly', 'fly', `[data-slot="${pm.fcp}"]`, true], ['oft', 'oft', `[data-fill="s:${DI}.oft.${oft.ri}.+"]`, false], ['amt', 'amt', `[data-fill="s:${DI}.amt.${amt.ri}.+"]`, true]]
  for (const [nm, ev, sel, picIt] of P) await step(W, 'h.' + nm, async () => {
    const a = await arm(p, W, 'B', DI, sel, { now: picIt && W.isPhone, tag: 'h-' + nm })
    const s = await readSec(p, 'B'), by = id => rowOf(s, id) || {}
    const pic = picIt ? await secPic(p, W, 'B', 'h-' + nm) : ''
    rec(W, 'h.' + nm, `Fable H-03 / H-04 / Astra A13, A14: ${nm} picked — each man's words and letters (AM / PM under the letter: the builder's reading, his question Q3)`, `armed ${a.armed} · ` + ['yeti', 'krait', 'romeo', 'cards', 'wrangler', 'ipman'].map(id => rowSay(by(id))).join(' · ') + ' · ' + colJudge(s).why, pics(pic, a.now))
    const cut = s.rows.filter(r => r.cut || r.past)
    chk(W, 'h.' + nm + '.cut', `Fable N-06 / N-07 (${nm}): no hours, AM / PM or letters cut; no " · " left behind; hours under the right man`, !cut.length && s.rows.every(r => !/(^| )·$|^· /.test(r.badge) && !(r.l || '').endsWith('·')), cut.map(rowSay).join(' · ') || s.rows.filter(r => r.h).map(r => `${r.cs} ${r.l}/${r.h}`).join(' · '))
    chk(W, 'h.' + nm + '.col', `the letters in one column (${nm})`, colJudge(s).ok, colJudge(s).why)
    if (ev === 'oft') chk(W, 'h03.oft', 'Fable H-03: the OFT place — the AM, PM and whole-day men "SANS — offered Fly only, not OFT"', ['yeti', 'krait', 'romeo'].every(id => by(id).why === 'SANS — offered Fly only, not OFT'), ['yeti', 'krait', 'romeo'].map(id => rowSay(by(id))).join(' · '))
    if (ev === 'amt') {
      chk(W, 'h04.amt', 'Fable H-04: AMT 13:00 — Marlin (Fly + OFT 08:00–10:00) "SANS — offered Fly and OFT only, not AMT", "F/O" over "08:00–10:00"; Otter (F/O/A 14:00–17:30) "SANS — available 14:00–17:30 only", "F/O/A" over "14:00–17:30"', by('cards').why === WORDS.flyOftNotAmt && by('cards').l === 'F/O' && by('cards').h === '08:00–10:00' && by('wrangler').why === WORDS.hours('14:00–17:30') && by('wrangler').l === 'F/O/A' && by('wrangler').h === '14:00–17:30', `${rowSay(by('cards'))} · ${rowSay(by('wrangler'))}`)
      chk(W, 'a13.amt', 'Astra A13: Jester AMT 08:00–10:00 against AMT 13:00 — "SANS — available 08:00–10:00 only", never "not offered AMT"', by('ipman').why === WORDS.hours('08:00–10:00'), rowSay(by('ipman')))
    }
    await unarm(p, W, 'B')
  })
  /* H-05 / A15: a second filing for Jester on Sun 19, OFT 13:00–15:00 (his first is AMT 08:00–10:00) */
  await step(W, 'h05', async () => {
    const f = await fileS(p, W, SUN, 'ipman', ['oft'], ['13:00', '15:00'])
    rec(W, 'h05.file', 'Fable H-05 / Astra A15: can a second filing be made for Jester on Sun 19 (OFT 13:00–15:00 beside his AMT 08:00–10:00)?', f.iid ? `MADE (${J(f.made)}) — the SANS day now: ${await sansDayRows(p, W, SUN)}` : 'REFUSED: ' + f.refused)
    if (!f.iid) return
    await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B')
    const s0 = await readSec(p, 'B')
    const pic0 = await secPic(p, W, 'B', 'h05-nopick')
    const out = [`nothing picked: ${rowSay(rowOf(s0, 'ipman'))}`]
    for (const [nm, , sel] of [P[0], P[2], P[3]]) { await arm(p, W, 'B', DI, sel); const s = await readSec(p, 'B'); out.push(`${nm}: ${rowSay(rowOf(s, 'ipman'))}`); await unarm(p, W, 'B') }
    rec(W, 'h05', 'Fable H-05 / Astra A15 (his question Q2): what the crew list shows for Jester with two filings on one day', out.join(' · '), pic0)
  })
  /* H-06: hours typed 00:00–23:59, and 22:00–02:00 (past midnight) */
  await step(W, 'h06', async () => {
    const f1 = await fileS(p, W, SUN, 'badger', ['fly'], ['00:00', '23:59'])
    const f2 = await fileS(p, W, SAT, 'badger', ['fly'], ['22:00', '02:00'])
    await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B')
    const s = await readSec(p, 'B')
    rec(W, 'h06', 'Fable H-06: Pixel Fly 00:00–23:59 (Sun 19) and 22:00–02:00 (Sat 18) — made or refused, and his letters', `00:00–23:59: ${f1.iid ? 'made ' + J(f1.made) : 'refused ' + f1.refused} · Sun list: ${rowSay(rowOf(s, 'badger'))} · 22:00–02:00: ${f2.iid ? 'made ' + J(f2.made) : 'refused ' + f2.refused}`)
  })
}

/* A-04 = A03 (nothing ticked), C-09 = A16 (remarks) */
SC.empty = async (p, W) => {
  const f = await fileS(p, W, SUN, 'yeti', [], null)
  rec(W, 'a04.file', 'Fable A-04 / Astra A03 / Q8: a filing for Bolt with Fly, OFT and AMT all unticked — can it be saved?', f.iid ? 'SAVED: ' + J(f.made) : 'REFUSED: ' + f.refused + ' (read-out "' + f.read + '")')
  const r1 = await fileS(p, W, SUN, 'romeo', ['fly'], null, { rmk: 'Can stay late if needed, call me before 0700 please' })
  const r2 = await fileS(p, W, SUN, 'vinci', ['amt'], ['08:00', '10:00'], { rmk: 'Gym' })
  const r3 = await fileS(p, W, SUN, 'wrangler', ['oft', 'amt'], ['08:00', '10:00'], { rmk: 'Can stay late if needed, call me before 0700 please' })
  Z.need(W, 'set.rmk', 'Rebel Fly (long remark), Zenith AMT 08:00–10:00 ("Gym"), Otter OFT + AMT 08:00–10:00 (long remark) filed for Sun 19', r1.iid && r2.iid && r3.iid, J([r1.refused, r2.refused, r3.refused]))
  const l = await Z.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  const oft = await W5.addSim(p, W, DI, 'oft', 'OFT', '10:00', '11:00'), amt = await W5.addSim(p, W, DI, 'amt', 'AMT', '13:00', '14:00')
  if (W.isPhone) { await T.reload(p, 'ad', 'a'); await sleep(500) }
  if (f.iid) for (const [nm, ev, sel] of [['oft', 'oft', `[data-fill="s:${DI}.oft.${oft.ri}.+"]`], ['fly', 'fly', `[data-slot="${l.fcp}"]`], ['amt', 'amt', `[data-fill="s:${DI}.amt.${amt.ri}.+"]`]]) await step(W, 'a04.' + nm, async () => {
    await arm(p, W, 'B', DI, sel); const s = await readSec(p, 'B'), r = rowOf(s, 'yeti')
    chk(W, 'a04.' + nm, `Fable A-04 / Astra A03: the ${nm} place — Bolt (nothing ticked) "SANS — not offering ${NAME[ev]}"`, r && r.why === `SANS — not offering ${NAME[ev]}`, rowSay(r) + ' · ' + colJudge(s).why)
    await unarm(p, W, 'B')
  })
  for (const [label, sel, tag] of [['nothing picked', null, 'c09-nopick'], ['the flying seat', `[data-slot="${l.fcp}"]`, 'c09-fly'], ['the AMT + add', `[data-fill="s:${DI}.amt.${amt.ri}.+"]`, 'c09-amt']]) await step(W, tag, async () => {
    if (sel) await arm(p, W, 'B', DI, sel, { now: W.isPhone, tag }); else { await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B') }
    const s = await readSec(p, 'B')
    const pic = tag !== 'c09-amt' ? await secPic(p, W, 'B', tag) : ''
    const rs = ['romeo', 'vinci', 'wrangler'].map(id => rowOf(s, id))
    chk(W, tag, `Fable C-09 / A16 / Astra A16 (${label}): a remark never pushes the letters out of the column, never past the list's edge, never covers the hours; letters and hours never shortened`, colJudge(s).ok && rs.every(r => r && !r.cut && !r.past) && !s.sideways.length, rs.map(rowSay).join(' · ') + ' · ' + colJudge(s).why, pic)
    rec(W, tag + '.rmk', `Fable C-09 (${label}): where each remark stands and whether it is shortened (a remark may be)`, rs.map(r => r ? `${r.cs}: ${r.others.map(o => `"${o.text}" right ${o.right}${o.cut ? ' shortened' : ''}${o.title ? ' title "' + o.title + '"' : ''}`).join(' ') || 'no remark drawn'}` : 'absent').join(' · '))
    if (sel) await unarm(p, W, 'B')
  })
}

/* C-03 / C-04 = A10, S-02 = A21: the widest reason appears and goes; a filing changed, then deleted; a reload */
SC.widest = async (p, W) => {
  const men = MEN_COL.filter(m => m[0] !== 'krait')
  const { made, ri } = await colScene(p, W, men)
  const at = async (tag, picIt) => { await arm(p, W, 'B', DI, amtAdd(ri)); const s = await readSec(p, 'B'); const pic = picIt ? await secPic(p, W, 'B', tag) : ''; await unarm(p, W, 'B'); return { s, pic } }
  let k = null
  await step(W, 'c03', async () => {
    const b = await at('c03-before', true)
    const f = await fileS(p, W, SUN, 'krait', ['fly', 'oft'], null); k = f.iid
    const a = await at('c03-after', true)
    chk(W, 'c03', 'Fable C-03 / Astra A10: Kraken\'s longer reason appears — the whole column moves to just after the new widest reason, every row together', colJudge(b.s).ok && colJudge(a.s).ok && (a.s.colL >= b.s.colL || a.s.widestEnd <= b.s.widestEnd), `before: ${colJudge(b.s).why} · after: ${colJudge(a.s).why}`, pics(b.pic, a.pic))
  })
  await step(W, 'c04', async () => {
    if (k) await editS(p, W, SUN, k, { del: true })
    await editS(p, W, SUN, made.yeti, { kinds: ['amt'] })
    const c = await at('c04-after', true)
    chk(W, 'c04', 'Fable C-04 / Astra A10: Kraken\'s filing deleted and Bolt changed to AMT — the column stands after what is now the widest, not where Kraken\'s put it', colJudge(c.s).ok, `${colJudge(c.s).why} · ${secSay(c.s)}`, c.pic)
    rec(W, 'c04.which', 'Fable C-04 / Q1: which line now sets the column', c.s.widest)
  })
  await step(W, 's02', async () => {
    const a1 = await at('s02-1', false)
    await editS(p, W, SUN, made.romeo, { kinds: ['oft', 'amt'] })
    const a2 = await at('s02-2', false)
    await editS(p, W, SUN, made.romeo, { del: true })
    const a3 = await at('s02-3', false)
    const r = s => rowOf(s, 'romeo')
    chk(W, 's02', 'Fable S-02 / Astra A21: Rebel struck "offered OFT only, not AMT" → his filing changed to OFT + AMT: plain with "O/A" → deleted: struck as a nothing-filed man, his letters gone; the heading follows', r(a1.s) && r(a1.s).why === WORDS.oftOnlyNotAmt && r(a2.s) && !r(a2.s).struck && r(a2.s).badge === 'O/A' && r(a3.s) && r(a3.s).struck && !r(a3.s).badge, `${rowSay(r(a1.s))} "${a1.s.head}" → ${rowSay(r(a2.s))} "${a2.s.head}" → ${rowSay(r(a3.s))} "${a3.s.head}"`)
    await T.reload(p, 'ad', 'a'); await sleep(500)
    const a4 = await at('s02-4', false)
    chk(W, 's02.reload', 'Astra A21: after a reload and sign-in the same', JSON.stringify(a4.s.rows.map(x => [x.id, x.why, x.badge])) === JSON.stringify(a3.s.rows.map(x => [x.id, x.why, x.badge])), `${rowSay(r(a4.s))} "${a4.s.head}"`)
  })
}

/* A-08 = A08: places with no times yet (desktop) */
SC.untimed = async (p, W) => {
  for (const [id, kinds, span] of [['romeo', ['oft'], null], ['yeti', ['fly'], null], ['krait', ['fly'], ['08:00', '10:00']]]) { const f = await fileS(p, W, SUN, id, kinds, span); Z.need(W, 'set.' + id, `${id} ${kinds} ${J(span)}`, !!f.iid, f.refused) }
  const l = await Z.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM' })
  await openB(p, W, DI)
  await W.press(p, L.B(`[data-sradd="${DI}.oft"]`), 'sradd-oft'); await sleep(400)
  const ori = await p.evaluate(i => window.DAYS[i].sims.oft.length - 1, DI)
  const r = async (nm, sel) => { await arm(p, W, 'B', DI, sel); const s = await readSec(p, 'B'); await unarm(p, W, 'B'); return s }
  const f1 = await r('fly', `[data-slot="${l.fcp}"]`)
  chk(W, 'a08.fly', 'Fable A-08 / Astra A08: the untimed flying seat — Rebel "SANS — offered OFT only, not Fly"; Bolt plain; Kraken (Fly 08:00–10:00) plain (no times to hold his hours against, D2585)', rowOf(f1, 'romeo').why === 'SANS — offered OFT only, not Fly' && !isSans(rowOf(f1, 'yeti').why) && !isSans(rowOf(f1, 'krait').why), ['romeo', 'yeti', 'krait'].map(id => rowSay(rowOf(f1, id))).join(' · '))
  const f2 = await r('oft', `[data-fill="s:${DI}.oft.${ori}.+"]`)
  chk(W, 'a08.oft', 'Fable A-08 / Astra A08: the untimed OFT place — Bolt "SANS — offered Fly only, not OFT"; Rebel plain', rowOf(f2, 'yeti').why === 'SANS — offered Fly only, not OFT' && !isSans(rowOf(f2, 'romeo').why), ['romeo', 'yeti', 'krait'].map(id => rowSay(rowOf(f2, id))).join(' · '))
  await openB(p, W, DI)
  await L.typeBox(p, W, `[data-bfld="ff:${DI}.${l.wi}.0.to"]`, '13:00'); await L.typeBox(p, W, `[data-bfld="ff:${DI}.${l.wi}.0.ld"]`, '14:00')
  await arm(p, W, 'B', DI, `[data-slot="${l.fcp}"]`)
  const f3 = await readSec(p, 'B')
  const pic = await secPic(p, W, 'B', 'a08-timed')
  chk(W, 'a08.timed', 'Fable A-08 / Astra A08: the flight\'s times typed 13:00–14:00 — Kraken (Fly 08:00–10:00) struck "SANS — available 08:00–10:00 only"; the column follows', rowOf(f3, 'krait').why === WORDS.hours('08:00–10:00') && colJudge(f3).ok, rowSay(rowOf(f3, 'krait')) + ' · ' + colJudge(f3).why, pic)
  await unarm(p, W, 'B')
}

/* C-11: his PC's display at 125% (a browser started at 1.25) — run as SZ=d125 */
SC.c125 = async (p, W) => {
  const { ri } = await colScene(p, W)
  const a = await arm(p, W, 'B', DI, amtAdd(ri))
  const s = await readSec(p, 'B')
  const pic = await secPic(p, W, 'B', 'c11-125')
  chk(W, 'c11', 'Fable C-11: at 125% — one column, nothing cut (judged as C-01)', a.armed && colJudge(s).ok && !s.rows.some(r => r.cut || r.past), `dpr ${await p.evaluate(() => devicePixelRatio)} · ${secSay(s)}`, pic)
  judgeCol(W, 'c11', 'Fable C-11 at 125%', s, '')
}

/* the brief's plain-user round (= Fable S-07): Edit Schedule's crew panel, a flying seat, an OFT seat, an AMT extra
   place, the SANS section read each time, unpick, close; a SANS man dragged (desktop) or tapped (phone) onto a place he
   cannot take; the Board, its crew list, a place picked, ✓ Done. A picture of each, and the one right after each press. */
SC.plain = async (p, W) => {
  /* the line first (run 3: typed into after the phone's reload, its box was drawn again under the typing) */
  const l = await Z.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  const { ri } = await colScene(p, W, MEN_COL, { oft: true })
  const oftRi = await p.evaluate(() => window.DAYS[6].sims.oft.length - 1)
  const PL = [['fly', `[data-slot="${l.fcp}"]`], ['oft', `[data-fill="s:${DI}.oft.${oftRi}.+"]`], ['amt', amtAdd(ri)]]
  await step(W, 'pu.open', async () => {
    await L.closeBoard(p, W); await L.go(p, 'editsched')
    if (W.isPhone) { await sleep(600); await showList(p, W, 'W'); await nowPic(p, W, 'pu-crew-tab') }
    const day = await T.S.crewPanelTo(p, W, 'Sun').catch(() => 'n/a')
    const s = await readSec(p, 'W')
    const pic = await secPic(p, W, 'W', 'pu-1-panel')
    chk(W, 'pu.open', `plain-user round: Edit Schedule's crew panel opened (${day}) — the SANS section, no reasons`, s.rows && s.rows.every(r => !r.why), secSay(s), pic)
  })
  for (const [nm, sel] of PL) await step(W, 'pu.' + nm, async () => {
    const a = await arm(p, W, 'W', DI, sel, { now: true, tag: 'pu-' + nm })
    const s = await readSec(p, 'W')
    const pic = await secPic(p, W, 'W', 'pu-2-' + nm)
    chk(W, 'pu.' + nm, `plain-user round: the ${nm} place pressed on the week — the section reads, the letters in one column, nothing cut, nothing tells to file`, a.armed && colJudge(s).ok && !s.rows.some(r => r.cut || r.past) && !s.toFile.length, `armed ${a.armed} · ${secSay(s)}`, pics(pic, a.now))
  })
  await step(W, 'pu.unpick', async () => {
    await p.keyboard.press('Escape'); await sleep(400)
    const s = await readSec(p, 'W')
    const day = ((await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')) || '').trim()
    chk(W, 'pu.unpick', 'plain-user round: unpicked (Escape on the desktop; on the phone the panel stays open) — no reason left', !s.armed && s.rows.every(r => !r.why), `the panel now shows "${day}" · armed ${s.armed} · ${secSay(s)}`, await secPic(p, W, 'W', 'pu-unpicked'))
    if (W.isPhone) { await showList(p, W, 'W', false); const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 }); chk(W, 'pu.close', 'plain-user round: the crew panel closes on its tab', !shown, 'shown ' + shown, await nowPic(p, W, 'pu-closed')) }
  })
  await step(W, 'pu.drag', async () => {
    if (!W.isPhone) {
      await openB(p, W, DI); await unarm(p, W, 'B')
      const d = await dragHold(p, W, 'B', 'yeti', amtAdd(ri), 'pu-3-drag', { drop: true, pic: true })
      const pic = await crop(p, W, ['#toastEl'], 'pu-3-note', 16)
      rec(W, 'pu.drag', 'plain-user round: Bolt (Fly only) dragged over the AMT box and dropped — the hover and the note', `hover ${J(d.hover)} · note "${d.note}" · seen ${J(d.seen)}`, pics(d.hpic, pic))
      if (await p.locator('#sbUndo:visible:not([disabled])').count()) { await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400) }
    } else {
      await arm(p, W, 'B', DI, amtAdd(ri))
      const k = await pickMan(p, W, 'B', 'yeti', 'pu-3-tap', { now: true, pic: true })
      rec(W, 'pu.drag', 'plain-user round (phone): the AMT box armed, struck Bolt tapped — the note (the phone has no drag hover)', `note "${k.toast}" · seen ${J(k.seen)}`, pics(k.now, k.tpic))
      await openB(p, W, DI); if (await p.locator('#sbUndo:visible:not([disabled])').count()) { await W.press(p, '#sbUndo:visible', 'sb-undo'); await sleep(400) }
    }
  })
  await step(W, 'pu.board', async () => {
    await L.closeBoard(p, W); await L.go(p, 'editsched')
    const d = p.locator(`#eWeek [data-sbday="${DI}"]`).first()
    await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
    if (W.isPhone) { await d.tap(); await nowPic(p, W, 'pu-4-board-press') } else await d.click()
    await p.waitForSelector('#schedBoard'); await sleep(800)
    const a = await arm(p, W, 'B', DI, amtAdd(ri), { now: true, tag: 'pu-5' })
    const s = await readSec(p, 'B')
    const pic = await secPic(p, W, 'B', 'pu-5-board-picked')
    chk(W, 'pu.board', "plain-user round: the board's crew list with the AMT place picked reads as the panel did", a.armed && colJudge(s).ok, secSay(s), pics(pic, a.now))
    await showList(p, W, 'B', false)
    await W.press(p, '#sbDone:visible', 'done', true)
    await sleep(600)
    chk(W, 'pu.done', 'plain-user round: ✓ Done closes the board', !(await p.locator('#schedBoard').count()) || !(await p.locator('#schedBoard:visible').count()), 'board ' + (await p.locator('#schedBoard:visible').count()))
  })
}

/* S-08: the other places that draw SANS availability, with C-01's filings (letters and hours on one line there) */
SC.roll = async (p, W) => {
  const { ri } = await colScene(p, W)
  await step(W, 's08.cal', async () => {
    const r = await T.sansRead(p, W, SUN, 's08-sday')
    rec(W, 's08.cal', "Fable S-08: the SANS calendar's Sunday — the cell and the day's lines (Jester \"A\" with \"08:00–10:00\" on one line expected)", `${T.cellLine(r.cell)} · ${T.rowsLine(r.day)}`)
    const pic = await crop(p, W, ['[data-testid="win-sansday"]'], 's08-sday', 8)
    const two = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-sansday"] .rsans-h, [data-testid="win-sansday"] .rsans-b2')].length)
    chk(W, 's08.cal2', 'Fable S-08: no two-line badge in the SANS day window', two === 0, 'two-line badges ' + two, pic)
    await T.closeAll(p, W)
  })
  await step(W, 's08.week', async () => {
    await L.closeBoard(p, W); await L.go(p, 'editsched'); await unarm(p, W, 'W')
    const t = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="6"]'); return d ? [...d.querySelectorAll('*')].filter(e => /SANS/.test(e.textContent || '') && e.children.length < 3).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 6) : 'no day' })
    const two = await p.evaluate(() => [...document.querySelectorAll('#eWeek .rsans-h, #eWeek .rsans-b2, #vWeek .rsans-h')].filter(e => e.getBoundingClientRect().width > 0).length)
    rec(W, 's08.week', "Fable S-08: Sunday's card on Edit Schedule's week — what it says of SANS", J(t))
    chk(W, 's08.week2', 'Fable S-08: no two-line badge on the week', two === 0, 'two-line badges ' + two)
    await L.go(p, 'viewsched'); await sleep(800)
    const v = await p.evaluate(() => [...document.querySelectorAll('.rsans-h, .rsans-b2')].filter(e => e.getBoundingClientRect().width > 0).length)
    chk(W, 's08.view', 'Fable S-08: View-only Sched — no two-line badge', v === 0, 'two-line badges ' + v)
  })
  await step(W, 's08.allavail', async () => {
    /* a Common Programme row for ALL AVAIL (asp-w2 progRow), its count chip pressed (asp-w2 readCount) */
    await openB(p, W, DI)
    const pr = await L.progRow(p, W, DI, 'SQN EVENT', '10:00', '17:00')
    const rc = await L.readCount(p, W, pr.row && pr.row.rid, '#schedBoard', 'ipman')
    rec(W, 's08.allavail.win', 'Fable S-08: the ALL AVAIL window opened from its row\'s count chip', `chip "${rc.chip}" · ${J(rc.win)}`)
    const two = await p.evaluate(() => [...document.querySelectorAll('.availwin .rsans-h, .availwin .rsans-b2')].filter(e => e.getBoundingClientRect().width > 0).length)
    const pic = await crop(p, W, ['.availwin'], 's08-allavail', 8)
    chk(W, 's08.allavail', 'Fable S-08: the ALL AVAIL window — no two-line badge, no reason line', two === 0, 'two-line badges ' + two, pic)
    await p.keyboard.press('Escape'); await sleep(300)
  })
}

/* the coordinator's addition: each SANS man's pressable box (his crew-list puck entry) against his name and reason, with
   a place picked and without, on both lists; a press / drag from a point right of a short reason but before the column */
SC.hitbox = async (p, W) => {
  const { ri } = await colScene(p, W)
  const r1 = x => x == null ? '-' : Math.round(x * 10) / 10
  for (const surf of ['B', 'W']) for (const picked of [false, true]) await step(W, `hb.${surf}.${picked ? 'picked' : 'none'}`, async () => {
    const tag = `hb-${surf}-${picked ? 'picked' : 'none'}`
    if (picked) { const a = await arm(p, W, surf, DI, amtAdd(ri)); if (!a.armed) { nw(W, tag, 'the AMT + add', 'did not arm'); return } }
    else if (surf === 'B') { await openB(p, W, DI); await unarm(p, W, 'B'); await showList(p, W, 'B') }
    else { await listW(p, W, 'Sun'); await showList(p, W, 'W') }
    const s = await readSec(p, surf)
    const boxes = s.rows.map(r => `${r.cs}: press box ${r.pkL}–${r.pkR} (${r1(r.pkR - r.pkL)}px), name ends ${r.puckR}, reason ${r.why ? r.whyL + '–' + r.whyR : 'none'}, letters at ${r.bL ?? '-'}`)
    const asWide = s.rows.every(r => r.pkR >= s.widestEnd - 0.5)
    rec(W, tag + '.boxes', `coordinator (${surf === 'B' ? 'the Board' : "Edit Schedule's panel"}, ${picked ? 'the AMT + add picked' : 'nothing picked'}): each SANS man's pressable box against his name and reason — as wide as the widest reason (ends ${s.widestEnd}, ${s.widest})? ${asWide ? 'YES, every box reaches it' : 'NO'}`, boxes.join(' · '))
    for (const id of ['vinci', 'yeti']) {
      const r = rowOf(s, id); if (!r) continue
      const own = Math.max(r.puckR || 0, r.whyR || 0)
      if (s.colL == null || s.colL - own < 6) { rec(W, `${tag}.${id}`, `coordinator: a point right of ${r.cs}'s own words but before the column`, `no room: his words end ${own}, the column at ${s.colL}`); continue }
      const x = own + (s.colL - own) / 2, y = (r.pkT + r.pkB) / 2
      const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const pk = e && e.closest('.rpuck'); return { el: e ? e.tagName.toLowerCase() + '.' + String(e.className).split(' ').join('.') : null, person: pk ? pk.dataset.person : null } }, [x, y])
      await p.evaluate(([x, y]) => { const d = document.createElement('div'); d.id = 'scc-dot'; d.style.cssText = `position:fixed;left:${x - 4}px;top:${y - 4}px;width:8px;height:8px;border-radius:50%;background:#FF3EA5;z-index:2147483647;pointer-events:none`; document.body.appendChild(d) }, [x, y])
      const pic = await crop(p, W, [`${(B.ROOT[surf])} .rpuck[data-person="${id}"]`, `${(B.ROOT[surf])} .rsans-row:has(.rpuck[data-person="${id}"]) .rsans-b`, '#scc-dot'], `${tag}-${id}`, 12)
      await p.evaluate(() => { const d = document.getElementById('scc-dot'); if (d) d.remove() })
      const h0 = await holds(p, DI, id)
      let what = ''
      await noteWatch(p)
      if (picked) {
        if (W.isPhone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y)
        await sleep(500)
        what = `pressed there: note "${await L.toastSaid(p)}" seen ${J(await notesSeen(p))}, ${(await holds(p, DI, id)) > h0 ? 'PLANTED on the AMT box' : 'not planted'}, still armed ${await p.evaluate(() => (window.ARM && window.ARM.key) || null)}`
      } else if (!W.isPhone) {
        const dst = await p.locator(`${surf === 'B' ? '#schedBoard' : '#eWeek'} ${amtAdd(ri)}:visible`).first().boundingBox()
        if (dst) { await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 8, y + 8, { steps: 3 }); await p.mouse.move(dst.x + Math.min(dst.width / 2, 30), dst.y + dst.height / 2, { steps: 16 }); await sleep(400)
          const g = await p.evaluate(() => !![...document.querySelectorAll('.dragimg, .tdghost')].find(e => e.getBoundingClientRect().width > 1)); await p.mouse.up(); await sleep(600)
          what = `dragged from there to the AMT + add: a drag ghost ${g ? 'SHOWED' : 'did not show'}; ${(await holds(p, DI, id)) > h0 ? 'PLANTED' : 'not planted'}; note "${await L.toastSaid(p)}"` } else what = 'the AMT place not on screen to drag to'
      } else {
        const c0 = await p.evaluate(id => { const e = [...document.querySelectorAll(`.rpuck[data-person="${id}"]`)].find(x => x.getBoundingClientRect().width > 0); return e ? String(e.className) : '' }, id)
        await p.touchscreen.tap(x, y); await sleep(500)
        const c1 = await p.evaluate(id => { const e = [...document.querySelectorAll(`.rpuck[data-person="${id}"]`)].find(x => x.getBoundingClientRect().width > 0); return e ? String(e.className) : '' }, id)
        what = `tapped there (nothing armed): his entry's look ${c0 === c1 ? 'unchanged' : `"${c0}" → "${c1}"`}; armed ${await p.evaluate(() => (window.ARM && window.ARM.key) || null)}; note "${await L.toastSaid(p)}"`
      }
      rec(W, `${tag}.${id}`, `coordinator (${surf}, ${picked ? 'picked' : 'nothing picked'}, ${W.sz.name}): ${r.cs} — a point (${r1(x)}, ${r1(y)}) right of his own words (end ${own}) but before the column (${s.colL}): what is under it, and does a ${picked ? 'press' : W.isPhone ? 'tap' : 'drag'} there take him`, `under the point: ${hit.el} (man ${hit.person || 'none'}) · ${what}`, pic)
      if ((await holds(p, DI, id)) > h0) { if (surf === 'B') { await openB(p, W, DI); await W.press(p, '#sbUndo:visible', 'sb-undo') } else await W.press(p, '#undoBtn:visible', 'undo'); await sleep(500) }
      if (!picked) { await p.keyboard.press('Escape').catch(() => {}); await sleep(250) }
      if (picked) { const a = await arm(p, W, surf, DI, amtAdd(ri)); if (!a.armed) break }
    }
    await unarm(p, W, surf)
  })
}

const only = (process.env.ONLY || '').split(',').filter(Boolean)
const SZK = SZ
for (const n of Object.keys(SC)) {
  if (only.length && !only.includes(n)) continue
  if (n === 'c125' && SZK !== 'd125') continue
  if (SZK === 'd125' && n !== 'c125') continue
  console.log('=== SCENARIO', n, SZK)
  await T.run(n, SZK, Z.scene(async (p, W, ctx) => { quiet(W); await SC[n](p, W, ctx) }))
}
writeFileSync(path.join(OUT, `results-all-${SZK}${only.length ? '-' + only.join('_') : ''}.json`), JSON.stringify(L.results, null, 1))
console.log('DONE', SZK)
process.exit(0)
