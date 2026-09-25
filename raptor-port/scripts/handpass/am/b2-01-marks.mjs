/* Walker B2, items 1 + 2 (D92, D93, D94) — tags, not rings; the board's rings. 25 Sep 26.
   Monday of the everything-week (published, AL1, one time edit waiting) is taken through AL2 (published) with a
   changed puck on EVERY kind of seat, several of them wearing a warning ring, then a second round left WAITING as AL3.
   Every change is the app's own gesture on the board: a roster puck dragged onto a seat, or a row's people cell
   tapped then a roster puck tapped (arm-then-pick). Signed through the four selects, published by Publish AL2.
   Then read, with computed style, every changed seat on the edit week, the board and View-only Sched (issued face and
   the working-draft peek): the tag, the puck's edge. A PASS is the right behaviour. Saves the world for b2-02. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2'
const L = await import('./b2-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishAL, go, STATE, dragOnto, appendTo, seatMarks, HEX, rgb,
  check, summary, screen, viewPick, head, editText, idOf } = L
const SAVE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b2-world-al3wait.json'
const { browser, ctx, page, errors } = await openHi({ width: 1440, height: 900, state: STATE, dpr: 1 })
await editWeek(page)
const P = async (label, p) => { const r = await p; console.log('STEP', label, '→', typeof r === 'string' ? r : JSON.stringify(r)); return r }

/* ---- round 1: AL2, every kind of seat ------------------------------------------------------------------------ */
await board(page, 0)
await P('RCP 0.0.0.1.w <- Tally', dragOnto(page, '0.0.0.1.w', 'Tally'))
await P('FCP 0.0.1.0.p <- Saber', dragOnto(page, '0.0.1.0.p', 'Saber'))
await P('duty desk d:0.1.0 <- Piston', dragOnto(page, 'd:0.1.0', 'Piston'))
await P('duty extra d:0.0.0.+ <- Reaper', appendTo(page, 'd:0.0.0.+', 'Reaper'))
await P('sim seat s:0.oft.0.p <- Ranger', dragOnto(page, 's:0.oft.0.p', 'Ranger'))
await P('sim pax s:0.amt.1.pax.0 <- Havoc', dragOnto(page, 's:0.amt.1.pax.0', 'Havoc'))
await P('ground g:0.0 <- Nomad', dragOnto(page, 'g:0.0', 'Nomad'))
await P('programme a:0.1.+ <- Comet', appendTo(page, 'a:0.1.+', 'Comet'))
console.log('head before AL2', JSON.stringify(await head(page, 0)))
await P('sign AL2', signDay(page, 0, 0))
await P('publish AL2', publishAL(page, 0))
console.log('head after AL2', JSON.stringify(await head(page, 0)))

/* ---- round 2: waiting as AL3 ----------------------------------------------------------------------------------- */
await P('FCP night 0.1.0.0.p <- Warden (breaks his Tuesday rest)', dragOnto(page, '0.1.0.0.p', 'Warden'))
await P('duty extra d:0.1.1.+ <- Warden', appendTo(page, 'd:0.1.1.+', 'Warden'))
await P('duty desk d:0.0.1 <- Saber', dragOnto(page, 'd:0.0.1', 'Saber'))
await P('sim seat s:0.oft.1.w <- Dash', dragOnto(page, 's:0.oft.1.w', 'Dash'))
await P('sim pax s:0.amt.1.pax.1 <- Fable', dragOnto(page, 's:0.amt.1.pax.1', 'Fable'))
await P('ground g:0.1 <- Saint', dragOnto(page, 'g:0.1', 'Saint'))
await P('programme a:0.2.+ <- Ryder', appendTo(page, 'a:0.2.+', 'Ryder'))
await closeBoard(page)
await editText(page, 'fr:0.0.0.0', '1A: BFM-3 // WALK B2')
console.log('head waiting', JSON.stringify(await head(page, 0)))

/* the rings the engine holds for the men (read, for the evidence) */
const ids = {}
for (const cs of ['Tally', 'Saber', 'Piston', 'Reaper', 'Ranger', 'Havoc', 'Nomad', 'Comet', 'Warden', 'Dash', 'Fable', 'Saint', 'Ryder']) ids[cs] = await idOf(page, cs)
const warn = await page.evaluate(ids => {
  const W = window.WARN, o = {}
  for (const [cs, id] of Object.entries(ids)) o[cs] = { sev: (W.sev[0] || {})[id] || '', chip: (W.chip[0] || {})[id] || '', trace: !!(W.trace[0] || {})[id], dash: !!((W.dash || [])[0] || {})[id] }
  return o
}, ids)
console.log('WARN', JSON.stringify(warn))

/* ---- the verdict on one surface ------------------------------------------------------------------------------- */
const AMBER_ADV = 'rgb(229, 168, 59)'
const kinds = { flyP: /^0\.\d\.\d\.\d\.p$/, flyW: /^0\.\d\.\d\.\d\.w$/, desk: /^d:0\.\d\.\d$/, extra: /^d:0\.\d\.\d\.x\d$/, sim: /^s:0\.oft\.\d\.[pw]$/, pax: /^s:0\.amt\.\d\.pax\.\d$/, ground: /^g:0\.\d$/, prog: /^a:0\.\d\.\d$/ }
const kindOf = k => (Object.entries(kinds).find(([, re]) => re.test(k)) || ['other'])[0]
function judge(surface, rows) {
  const seen = {}
  for (const r of rows) {
    const n = r.alc || r.aln, kind = kindOf(r.key)
    ;(seen[kind + (r.alc ? ':out' : ':wait')] ||= []).push(r.who)
    const alRgb = rgb(HEX[n] || '#E5872B')
    const edgeHasAL = !!r.edge && (r.edge.shadow.includes(alRgb) || r.edge.outline.includes(alRgb))
    const seatHasRing = r.seatEdge.shadow !== 'none' || !r.seatEdge.outline.startsWith('none')
    const tagOK = r.alc
      ? r.tag.bg === alRgb && r.tag.border.startsWith('none') && r.tag.content !== 'none'
      : r.tag.border.startsWith('dotted') && r.tag.color === alRgb && r.tag.bg !== alRgb && r.tag.content !== 'none'
    const ringNote = /boxdot/.test(r.pcls) ? 'dotted' : /boxdash/.test(r.pcls) ? 'dashed' : /boxred|hard/.test(r.pcls) ? 'red' : /warn/.test(r.pcls) ? 'amber/grey' : 'none'
    const ringOK = ringNote === 'dotted' ? r.edge.outline.startsWith('dotted')
      : ringNote === 'dashed' ? r.edge.outline.startsWith('dashed')
      : ringNote === 'red' ? !r.edge.shadow.includes(alRgb) && r.edge.shadow !== 'none'
      : ringNote === 'amber/grey' ? (r.edge.shadow.includes(AMBER_ADV) || r.edge.shadow.includes('138, 150, 163')) : true
    check(`${surface} | ${kind} | ${r.alc ? 'AL' + r.alc + ' out' : 'AL' + r.aln + ' waiting'} | ${r.who} (${r.key})`, !edgeHasAL && !seatHasRing && tagOK && ringOK,
      `tag ${r.tag.content} bg=${r.tag.bg} border=${r.tag.border} colour=${r.tag.color} · ring=${ringNote} shadow=${r.edge && r.edge.shadow} outline=${r.edge && r.edge.outline} · seat shadow=${r.seatEdge.shadow} outline=${r.seatEdge.outline}`)
  }
  return seen
}
const need = ['flyP:out', 'flyW:out', 'desk:out', 'extra:out', 'sim:out', 'pax:out', 'ground:out', 'prog:out', 'flyP:wait', 'extra:wait', 'desk:wait', 'sim:wait', 'pax:wait', 'ground:wait', 'prog:wait']
function coverage(surface, seen, list = need) {
  const miss = list.filter(k => !seen[k])
  check(`${surface} | every seat kind carries its tag`, !miss.length, miss.length ? 'MISSING: ' + miss.join(', ') : Object.keys(seen).join(' '))
}
async function sectionShots(prefix, rootSel) {
  for (const [nm, sel] of [['waves', `${rootSel} .seat[data-slot^="0."]`], ['duties', `${rootSel} [data-slot^="d:0."]`], ['sims', `${rootSel} [data-slot^="s:0."]`], ['ground', `${rootSel} [data-slot^="g:0."]`], ['prog', `${rootSel} [data-slot^="a:0."]`]]) {
    const el = page.locator(sel).first()
    if (!(await el.count())) { console.log('no', sel); continue }
    await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await page.waitForTimeout(250); await screen(page, `${prefix}-${nm}`)
  }
}

/* ---- the edit week ---------------------------------------------------------------------------------------------- */
await editWeek(page)
const wk = await seatMarks(page, '#eWeek .day[data-day="0"]')
coverage('week', judge('week', wk))
const cells = await page.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="0"]')
  return [...d.querySelectorAll('[data-alc],[data-aln]')].filter(e => !e.classList.contains('seat') && !e.classList.contains('verchip'))
    .map(e => { const s = getComputedStyle(e); return `${String(e.className).split(' ')[0]} alc=${e.dataset.alc || ''} aln=${e.dataset.aln || ''} outline=${s.outlineStyle} ${s.outlineColor} deco=${s.textDecorationLine}/${s.textDecorationStyle} "${(e.innerText || '').trim().slice(0, 24)}"` })
})
console.log('TEXT CELLS\n  ' + cells.join('\n  '))
check('week | time/remark cells keep their own marks (solid for AL2, dotted for the waiting AL3)', cells.some(c => /alc=2/.test(c) && /outline=solid|deco=underline\/solid/.test(c)) && cells.some(c => /aln=3/.test(c) && /dotted/.test(c)), cells.length + ' marked cells')
await sectionShots('b2-01-week-dpr1', '#eWeek .day[data-day="0"]')

/* ---- the board ---------------------------------------------------------------------------------------------------- */
await board(page, 0)
const bd = await seatMarks(page, '#schedBoard')
coverage('board', judge('board', bd))
const rings = await page.evaluate(w => {
  const pick = root => [...document.querySelectorAll(`${root} .puck[data-person="${w}"]`)].filter(e => (e.offsetWidth || e.offsetHeight) && !e.closest('#sbRoster') && !e.closest('#eRoster'))
    .map(e => ({ cls: e.className, flag: (e.querySelector('.flag') || {}).innerText || '', outline: getComputedStyle(e).outlineStyle, title: (e.getAttribute('title') || '').slice(0, 100) }))
  return { board: pick('#schedBoard'), week: pick('#eWeek .day[data-day="0"]') }
}, ids.Warden)
console.log('WARDEN RINGS', JSON.stringify(rings))
check('board | Warden (breaks his Tuesday rest) wears the dotted ring on every Monday puck (D94)', rings.board.length >= 2 && rings.board.every(r => /boxdot/.test(r.cls) && r.outline === 'dotted'), rings.board.map(r => r.cls + ' flag=' + r.flag).join(' | '))
/* Warden's own conflict chip ("C") outranks the trace for the printed chip, so the trace's caption rides on the puck's title — the same words on both surfaces */
check('board | the same crew-rest caption the week carries (D94)', rings.board.every(r => /Crew rest — Tuesday is broken/.test(r.title)) && JSON.stringify(rings.board.map(r => r.title + r.flag).sort()) === JSON.stringify(rings.week.map(r => r.title + r.flag).sort()), 'board [' + rings.board.map(r => r.flag + '|' + r.title).join(' ; ') + ']')
await sectionShots('b2-01-board-dpr1', '#schedBoard')
await closeBoard(page)

/* ---- View-only Sched: the issued face (AL2) and the working-draft peek (AL3 waiting) ---------------------------------- */
await go(page, 'viewsched'); await page.waitForTimeout(600)
const vIss = await seatMarks(page, '#vWeek .day[data-day="0"]')
check('view issued face | no waiting tag at all', vIss.every(r => !r.aln), vIss.filter(r => r.aln).map(r => r.who).join(','))
judge('view-issued', vIss)
/* the issued face drops the seat keys (nothing there is a write target), so the kinds are counted, not named: AL2 carried 8 changed pucks, one of each kind */
check('view-issued | all eight published changes (one per seat kind) carry their solid AL2 tag', vIss.filter(r => r.alc === '2').length === 8, vIss.map(r => r.who + '/AL' + r.alc).join(','))
await sectionShots('b2-01-view-issued-dpr1', '#vWeek .day[data-day="0"]')
await viewPick(page, 0, 'working')
const vWork = await seatMarks(page, '#vWeek .day[data-day="0"]')
coverage('view-peek', judge('view-peek', vWork))
const wardenPeek = vWork.find(r => r.who === 'Warden' && /boxdot/.test(r.pcls))
check('view-peek | Warden: a waiting change on a man wearing the dotted ring — hollow tag, dotted ring intact', !!wardenPeek && wardenPeek.tag.border.startsWith('dotted') && wardenPeek.edge.outline.startsWith('dotted'), JSON.stringify(wardenPeek || 'not found'))
await sectionShots('b2-01-view-peek-dpr1', '#vWeek .day[data-day="0"]')
if (wardenPeek) {
  const s = page.locator(`#vWeek .day[data-day="0"] .seat[data-slot="${wardenPeek.key}"]`).first()
  await s.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  const b = await s.boundingBox()
  await page.screenshot({ path: `${process.env.HP_SHOTS}/b2-01-view-peek-warden-dpr1.png`, clip: { x: b.x - 60, y: b.y - 30, width: b.width + 120, height: b.height + 60 } })
}
await viewPick(page, 0, 'issued')

await ctx.storageState({ path: SAVE })
console.log('saved', SAVE)
console.log('errors', JSON.stringify(errors))
check('no browser errors', errors.length === 0, errors.join(' | '))
summary('b2-01')
await browser.close()
