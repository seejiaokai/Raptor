/* Walker P re-walk, the 'everything Saturday' (STK_STATE, built through the app's controls) on desktop, each scenario in a fresh copy:
   P4c-07, 13, 08, 03, 09, 04. ONLY=P4c-07,... to choose. */
import * as R from './stk2-P-run.mjs'
const { S, finish, nav, openBoard, boxList, walkForward, walkBack, clickBox, caret, caretIdx, label, snap, same, sleep, pic, scopeSel, valueOf, ensureHelper, typeNow, kk, seqN, tap, type } = R
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)
const PART = 'sat' + (ONLY ? '-' + ONLY.join('+') : '')
const ST = { state: process.env.STK_STATE }
const wk = scopeSel('week', 5), sb = scopeSel('board', 5)
const popups = page => page.evaluate(() => ({
  arm: !!(window.ARM && window.ARM.key),
  q: document.querySelectorAll('.mission-role-question').length,
  pops: [...document.querySelectorAll('.wavemenu,#inpEditPop,.pop,.popup,.stpop,.areapop,.rosterpop,#cxPop,[role=dialog],[role=menu]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className.toString().slice(0, 30)).slice(0, 6),
}))
const surfOpen = async (page, surf) => { if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 5) }

/* ---------------- P4c-07 ---------------- */
for (const surf of ['week', 'board']) {
  if (!want('P4c-07')) break
  await S(PART, 'P4c-07-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Saturday (tracking ON): typed DS FOR RU into the Remarks of an SC row, an AVALON row and a BB row; clicked into each standalone wave's first box and Tabbed through to its last box and one more`, ST, async page => {
    await surfOpen(page, surf)
    const scope = surf === 'week' ? wk : sb
    const list = await boxList(page, scope)
    const checks = [], pics = [], info = []
    let briefSeen = false
    for (const [w, nm] of [[1, 'SC'], [2, 'AVALON'], [3, 'BB']]) {
      const mine = list.map((b, i) => ({ ...b, i })).filter(b => new RegExp('^(ff|fr|wl):5[.]' + w + '([.]|$)').test(b.key) || (b.kind === 'itline' && b.key.startsWith('5|' + w + '|')) || (/^(area|atime|bombs)$/.test(b.kind) && b.key.startsWith('5.' + w + '.')))
      const first = mine[0].i, last = mine[mine.length - 1].i
      const rIx = mine.find(b => /^fr:/.test(b.key)).i
      await clickBox(page, scope, rIx); await typeNow(page, 'DS FOR RU'); await page.keyboard.press('Tab'); await sleep(350)
      const pq = await popups(page)
      const s0 = await snap(page)
      await clickBox(page, scope, first)
      const stops = [await caret(page)], bad = []
      for (let k = first + 1; k <= last + 1; k++) {
        await page.keyboard.press('Tab'); await sleep(60); const c = await caret(page), ix = await caretIdx(page, scope)
        stops.push(c); if (ix !== k) bad.push({ want: k, got: ix, c: label(c) })
        if (k <= last && (!c.onScreen || !c.topmost)) bad.push({ hidden: label(c) })
      }
      const s1 = await snap(page)
      const kinds = mine.map(b => b.key.replace(/^(\w+):5\.\d\./, '$1:').replace(/\.\d$/, '.n')).filter((x, i, a) => a.indexOf(x) === i)
      if (w === 1) pics.push(await pic(page, `P4c-07-${surf}-SC-after-route`))
      if (w === 3) pics.push(await pic(page, `P4c-07-${surf}-BB-after-route`))
      checks.push([`${nm}: route visits exactly the wave's ${mine.length} open boxes in order, then leaves to ${list[last + 1] ? list[last + 1].kind + '=' + list[last + 1].key : 'the next control'}`, bad.length === 0, { bad: bad.slice(0, 3), boxKinds: kinds.join(',') }])
      checks.push([`${nm}: no In-time/Rally box in the wave, no stores/area boxes, no role question or popup after typing DS FOR RU`, !mine.some(b => b.kind === 'itline' || b.kind === 'area' || b.kind === 'bombs') && pq.q === 0 && pq.pops.length === 0 && !pq.arm, { itline: mine.filter(b => b.kind === 'itline').length, bombs: mine.filter(b => b.kind === 'bombs').length, popups: pq }])
      info.push(`${nm}: the wave draws and the route visits ${mine.filter(b => /\.br$/.test(b.key)).length} Brief (B) box(es) on this surface`); if (mine.some(b => /\.br$/.test(b.key))) briefSeen = true
      checks.push([`${nm}: nothing written by the Tab route`, same(s0, s1)])
    }
    for (const i of info) checks.push(['OBSERVED: ' + i, true])
    const bad = checks.some(c => !c[1])
    return { checks, pics, verdict: bad ? 'FAIL' : briefSeen ? 'PARTIAL' : 'PASS' }
  })
}

/* ---------------- P4c-13 ---------------- */
if (want('P4c-13')) await S(PART, 'P4c-13', 'Board then Week, Saturday: pressed + Line on the flying wave (an EMPTY formation) and CX on the COBRA line (cancelled); Tabbed the whole wave in both editors and compared with what is enabled', ST, async page => {
  await openBoard(page, 5)
  await page.locator('#sbBoard [data-gline="5.0"]:visible').first().click(); await sleep(600)
  const cx = await page.evaluate(() => { const c = document.querySelector('#sbBoard [data-bfld="ff:5.0.1.cs"]'); const row = c && c.closest('.sb-line, .sbl, .sb-row, tr, .arow'); const b = (row || c.parentElement.parentElement).querySelector('[data-lcx]'); return b ? b.getAttribute('data-lcx') : null })
  const lcxAll = await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-lcx]')].map(e => e.getAttribute('data-lcx') + (e.classList.contains('on') ? ':ON' : '')))
  await page.locator(`#sbBoard [data-lcx="${cx}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.locator(`#sbBoard [data-lcx="${cx}"]`).first().click(); await sleep(500)
  await page.locator('#cxReason').fill('WX'); await page.keyboard.press('Enter'); await sleep(500)
  if (await page.locator('#cxPop:visible').count()) { await page.locator('#cxPop .airpop-foot button:not([hidden]):not(#cxUn)').last().click(); await sleep(500) }
  const cxAfter = await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-lcx]')].map(e => e.getAttribute('data-lcx') + (e.classList.contains('on') ? ':ON' : '')))
  const pics = [await pic(page, 'P4c-13-board-cx-and-empty-line')]
  const out = {}
  for (const surf of ['board', 'week']) {
    await surfOpen(page, surf)
    const scope = surf === 'week' ? wk : sb
    const list = await boxList(page, scope)
    const mine = list.map((b, i) => ({ ...b, i })).filter(b => /^(ff|fr):5\.0\./.test(b.key) || /^(area|atime|bombs)/.test(b.kind) && /^5\.0\./.test(b.key))
    const allVisible = await page.evaluate(([s, rx]) => [...document.querySelectorAll(`${s} [data-txt],${s} [data-bfld],${s} [data-bombs],${s} [data-area],${s} [data-atime]`)].filter(e => { const k = e.getAttribute('data-txt') || e.getAttribute('data-bfld') || e.getAttribute('data-bombs') || e.getAttribute('data-area') || e.getAttribute('data-atime'); return new RegExp(rx).test(k) && e.getBoundingClientRect().width > 0 }).map(e => ({ k: e.getAttribute('data-txt') || e.getAttribute('data-bfld') || e.getAttribute('data-bombs') || e.getAttribute('data-area') || e.getAttribute('data-atime'), dis: !!e.disabled, ro: !!e.readOnly, ce: e.getAttribute('contenteditable') })), [scope, '^(ff|fr):5[.]0[.]|^5[.]0[.]'])
    const skipped = allVisible.filter(v => v.dis || v.ro || v.ce === 'false')
    const first = mine[0].i, last = mine[mine.length - 1].i
    const s0b = await snap(page)
    await clickBox(page, scope, first)
    const bad = [], stops = []
    for (let k = first + 1; k <= last; k++) { await page.keyboard.press('Tab'); await sleep(60); const c = await caret(page), ix = await caretIdx(page, scope); stops.push(kk(c)); if (ix !== k) bad.push({ want: k, got: ix, c: label(c) }) }
    const s1b = await snap(page)
    const emptyFormBoxes = mine.filter(b => /^ff:5\.0\.2\./.test(b.key) || /^fr:5\.0\.2\./.test(b.key)).map(b => b.key)
    const cobraBoxes = mine.filter(b => /^(ff|fr):5\.0\.1\./.test(b.key)).map(b => b.key)
    pics.push(await pic(page, `P4c-13-${surf}-after-route`))
    out[surf] = { n: mine.length, bad, skipped, emptyFormBoxes, cobraBoxes, noWrite: same(s0b, s1b), visibleAll: allVisible.length }
  }
  const cxState = await page.evaluate(() => window.DAYS[5].waves[0].formations.map(f => f.aircraft.map(a => !!a.cx)))
  const fmt = await page.evaluate(() => window.DAYS[5].waves[0].formations.length)
  return { checks: [
    ['setup: a third (empty) formation exists and COBRA\'s CX button went ON', fmt === 3 && cxAfter.some(x => x.startsWith(cx) && x.endsWith(':ON')), { cx, before: lcxAll.filter(x => x.startsWith('5.0')), after: cxAfter.filter(x => x.startsWith('5.0')), cxState }],
    ['Board: every enabled visible box of the wave is reached in order (cancelled COBRA row boxes and the empty formation boxes included if enabled)', out.board.bad.length === 0, { n: out.board.n, bad: out.board.bad.slice(0, 3), empty: out.board.emptyFormBoxes.length, cobra: out.board.cobraBoxes.length }],
    ['Board: disabled / read-only boxes drawn in the wave (skipped by the route)', true, out.board.skipped],
    ['Week: every enabled visible box reached in order', out.week.bad.length === 0, { n: out.week.n, bad: out.week.bad.slice(0, 3), empty: out.week.emptyFormBoxes.length, cobra: out.week.cobraBoxes.length }],
    ['Week: disabled / read-only boxes drawn in the wave', true, out.week.skipped],
    ['no write by either route; the cancellation state after the routes is unchanged', out.board.noWrite && out.week.noWrite && JSON.stringify(cxState) === JSON.stringify(await page.evaluate(() => window.DAYS[5].waves[0].formations.map(f => f.aircraft.map(a => !!a.cx)))), cxState],
  ], pics }
})

/* ---------------- P4c-08 ---------------- */
for (const surf of ['board', 'week']) {
  if (!want('P4c-08')) break
  await S(PART, 'P4c-08-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Saturday (duty desks, sims, ground, Common Programme, the five notes): clicked into the first box, Tabbed through all of them, then Shift+Tab all the way back`, ST, async page => {
    await surfOpen(page, surf)
    const scope = surf === 'week' ? wk : sb
    await ensureHelper(page)
    const list = await boxList(page, scope)
    const p0 = await popups(page)
    const fw = await walkForward(page, scope, { keepStops: true })
    const bk = await walkBack(page, scope)
    const p1 = await popups(page)
    const secSeq = fw.list.map(b => b.sec).filter((x, i, a) => i === 0 || a[i - 1] !== x)
    const screenOrder = await page.evaluate(([s]) => [...document.querySelectorAll(`${s} [data-secmove]`)].map(e => ({ k: e.getAttribute('data-secmove'), top: e.getBoundingClientRect().top + scrollY, left: e.getBoundingClientRect().left })).sort((a, b) => a.top - b.top || a.left - b.left).map(e => e.k), [scope])
    const kinds = {}
    for (const b of list) { const p = b.key.split(/[.:]/)[0]; kinds[p] = (kinds[p] || 0) + 1 }
    const pics = [await pic(page, `P4c-08-${surf}-after-route`)]
    return { checks: [
      [`forward: all ${fw.n} open boxes visited in displayed order`, fw.bad.length === 0, fw.bad.slice(0, 4)],
      ['backward: exact reverse', bk.bad.length === 0, bk.bad.slice(0, 4)],
      ['sections in the route (document order) = sections as laid out on screen', JSON.stringify(secSeq.filter(s => screenOrder.includes(s))) === JSON.stringify(screenOrder.filter(s => secSeq.includes(s))), { route: secSeq, screen: screenOrder }],
      ['every kind present: duty (dl/dr), sim (sr), ground (gr), Common Programme (ap), notes (dn, pn, dtn, sn, gn)', ['dl', 'dr', 'sr', 'gr', 'ap', 'dn', 'pn', 'dtn', 'sn', 'gn'].every(k => kinds[k]), kinds],
      ['no crew puck/picker was activated and nothing written', p1.arm === false && p1.pops.length === 0 && fw.noWrite && bk.noWrite, { before: p0, after: p1 }],
    ], pics }
  })
}

/* ---------------- P4c-03 ---------------- */
const inputIds = async page => { const iid = await page.evaluate(() => window.INPUTS.find(i => /TAB/.test(i.remarks || '')).iid); const gi = await page.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid); return { iid, gi } }
async function threeBoxes(page, iid, gi, scope, firstKey, vals, surf) {
  const rd = () => page.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return { s: x.s, e: x.e, remarks: x.remarks, n: window.INPUTS.length } }, iid)
  const grRow = () => page.evaluate(([g]) => { const r = window.DAYS[5].ground[g]; return { str: r.str, end: r.end, rmks: r.rmks } }, [gi])
  const echoes = () => page.evaluate(([s, i]) => [...document.querySelectorAll(`${s} [data-ifld^="${i}."],${s} [data-inp^="${i}."]`)].map(e => (e.getAttribute('data-ifld') || e.getAttribute('data-inp')).split('.')[1] + '=' + (e.value !== undefined && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText)), [scope, iid])
  const groundBoxes = () => page.evaluate(([s, g]) => ['str', 'end', 'rmks'].map(k => { const e = document.querySelector(`${s} [data-bfld="gr:5.${g}.${k}"],${s} [data-txt="gr:5.${g}.${k}"]`); return k + '=' + (e ? (e.value !== undefined && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText) : 'NONE') }), [scope, gi])
  const list = await boxList(page, scope)
  const ix = list.findIndex(b => b.key === firstKey)
  const n0 = await seqN(page), r0 = await rd(), g0 = await grRow()
  await clickBox(page, scope, ix)
  const at = [await caret(page)]
  for (let i = 0; i < 3; i++) { await typeNow(page, vals[i]); await page.keyboard.press('Tab'); await sleep(400); at.push(await caret(page)) }
  const n1 = await seqN(page), r1 = await rd(), g1 = await grRow()
  return { n0, n1, r0, r1, g0, g1, at: at.map(label), echo: await echoes(), ground: await groundBoxes() }
}
const p3 = [
  ['board-programme-row', 'board', i => `gr:5.${i.gi}.str`, ['10:15', '11:45', 'PROG ROW TEXT'], 615, 705, x => x.ground.join(' ') === 'str=10:15 end=11:45 rmks=PROG ROW TEXT', 'ground'],
  ['board-echo', 'board', i => `${i.iid}.str`, ['10:20', '11:50', 'ECHO TEXT'], 620, 710, x => x.ground.join(' ') === 'str=10:20 end=11:50 rmks=ECHO TEXT', 'ground'],
  ['week-programme-row', 'week', i => `gr:5.${i.gi}.str`, ['10:25', '11:55', 'WEEK PROG TEXT'], 625, 715, x => x.ground.join(' ') === 'str=10:25 end=11:55 rmks=WEEK PROG TEXT', 'ground'],
  ['week-echo', 'week', i => `${i.iid}.str`, ['10:35', '11:45', 'WEEK ECHO TEXT'], 635, 705, x => x.ground.join(' ') === 'str=10:35 end=11:45 rmks=WEEK ECHO TEXT', 'ground'],
]
for (const [nm, surf, keyFn, vals, s, e, otherOk] of p3) {
  if (!want('P4c-03')) break
  await S(PART, 'P4c-03-' + nm, `${surf === 'board' ? 'Board' : 'Week'}, Saturday: the timed personal input (Training 11:00–12:00, remarks TAB INPUT, filed on the Inputs page and accepted onto the programme): clicked into the ${nm.includes('echo') ? "input's own start box" : "programme row's start box"}, typed ${vals.join(' / ')} with Tab after each`, ST, async page => {
    const { iid, gi } = await inputIds(page)
    await surfOpen(page, surf)
    if (surf === 'board') { const rowsNow = () => page.evaluate(() => document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length); if (!(await rowsNow())) { await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500) } }
    if (surf === 'week') { const t = page.locator('#eWeek .day[data-day="5"] [data-pitog="5"]').first(); await t.evaluate(e => e.scrollIntoView({ block: 'center' })); await t.click(); await sleep(600) }
    const scope = surf === 'board' ? sb : wk
    const x = await threeBoxes(page, iid, gi, scope, keyFn({ iid, gi }), vals, surf)
    const pics = [await pic(page, 'P4c-03-' + nm)]
    // reload and read the input again (saved across a reload)
    await page.waitForTimeout(1500); await page.reload(); await R.login(page, 'a'); await sleep(800)
    const after = await page.evaluate(([i]) => { const x = window.INPUTS.find(y => y.iid === i); const r = window.DAYS[5].ground.find(q => q.src === i); return x ? { s: x.s, e: x.e, remarks: x.remarks, n: window.INPUTS.length, programmeRow: r ? { str: r.str, end: r.end, rmks: r.rmks } : 'no row' } : null }, [iid])
    return { checks: [
      ['Tab order start → end → Remarks', /\.end/.test(x.at[1]) && /\.rmks/.test(x.at[2]), x.at],
      [`the SAVED INPUT (the same input) took the values (s=${s}, e=${e}, text)`, x.r1.s === s && x.r1.e === e && x.r1.remarks === vals[2], { before: x.r0, after: x.r1 }],
      ['the other displayed occurrence shows them too', otherOk(x), { ground: x.ground, echo: x.echo }],
      ['no second input appeared; three commands', x.r1.n === x.r0.n && x.n1 - x.n0 === 3, { n0: x.r0.n, n1: x.r1.n, commands: x.n1 - x.n0 }],
      ['after a reload the same input still holds the values (one input)', after && after.s === s && after.e === e && after.remarks === vals[2] && after.n === x.r0.n, after],
    ], pics }
  })
}

/* ---------------- P4c-09 ---------------- */
for (const surf of ['board', 'week']) {
  if (!want('P4c-09')) break
  await S(PART, 'P4c-09-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Saturday: ${surf === 'board' ? 'Personal Inputs opened then folded; Available crew folded; ' : ''}Tabbed the whole route and compared with the boxes drawn; looked for opened popups`, ST, async page => {
    await surfOpen(page, surf)
    const scope = surf === 'week' ? wk : sb
    const pics = []
    const state = () => page.evaluate(() => ({
      pin: document.querySelectorAll('#sbBoard [data-secmove$=".inputs"] .sb-arow, #sbBoard [data-secmove$=".inputs"] .sbi-row').length,
      avail: document.querySelectorAll('#sbBoard [data-secmove$=".avail"] .puck').length,
    }))
    let withIn = null, open0 = null
    if (surf === 'board') {
      const rowsNow = () => page.evaluate(() => document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length)
      if (!(await rowsNow())) { await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500) }
      open0 = await state()
      withIn = (await boxList(page, sb)).filter(b => b.kind === 'ifld').length
      pics.push(await pic(page, 'P4c-09-board-open-state'))
      await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500)
      const av = page.locator('#sbBoard [data-avtog]:visible').first()
      if (await av.count()) { await av.click(); await sleep(400) }
    }
    const list = await boxList(page, scope)
    const folded = await state()
    const p0 = await popups(page)
    const fw = await walkForward(page, scope, { keepStops: false })
    await page.keyboard.press('Tab'); await sleep(200)
    const p1 = await popups(page)
    const stillFolded = await state()
    pics.push(await pic(page, `P4c-09-${surf}-after-route`))
    return { checks: [
      surf === 'board' ? ['with Personal Inputs OPEN its echo boxes joined the route (3), folded they are absent', withIn === 3 && list.filter(b => b.kind === 'ifld').length === 0, { open: withIn, folded: list.filter(b => b.kind === 'ifld').length, open0, folded }] : ['week has no Personal Inputs fold; ifld boxes none', list.filter(b => b.kind === 'ifld').length === 0],
      [`route over the ${fw.n} drawn boxes in order, nothing hidden visited`, fw.bad.length === 0, fw.bad.slice(0, 4)],
      ['folds and popups stayed closed (fold rows the same before and after; no popup open)', JSON.stringify(folded) === JSON.stringify(stillFolded) && p1.pops.length === 0 && !p1.arm, { folded, stillFolded, popups: p1 }],
      ['nothing written', fw.noWrite],
    ], pics }
  })
}

/* ---------------- P4c-04: reorder Sunday's sections, then Tab ---------------- */
if (want('P4c-04')) await S(PART, 'P4c-04', 'Sunday: added a flying wave; dragged Ground before Flying, and Common Programme to after Flying (before Sims), by their grips; then on the Board and on the Week Tabbed forward over the whole day (headings and notes) and Shift+Tab back', ST, async page => {
  await page.setViewportSize({ width: 1440, height: 2100 })
  await nav(page, 'editsched')
  await openBoard(page, 6)
  await tap(page, '[data-wvadd="6"]')
  await page.getByRole('button', { name: 'Flying wave', exact: true }).click(); await sleep(600)
  await type(page, '[data-bfld="ff:6.0.0.cs"]', 'SUNDAY')
  await type(page, '[data-bfld="ff:6.0.0.to"]', '10:00')
  await type(page, '[data-bfld="ff:6.0.0.ld"]', '11:00')
  const order = scope => page.evaluate(s => [...document.querySelectorAll(`${s} [data-secmove]`)].map(e => ({ k: e.getAttribute('data-secmove').split('.')[1], top: Math.round(e.getBoundingClientRect().top + scrollY) })).sort((a, b) => a.top - b.top).map(e => e.k), scope)
  async function grab(scope, fromK, toK, where = 'top') {
    const g = page.locator(`${scope} [data-secmove="6.${fromK}"] .secgrip`).first()
    await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    const a = await g.boundingBox(); const t = await page.locator(`${scope} [data-secmove="6.${toK}"]`).first().boundingBox()
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
    await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
    await page.mouse.move(t.x + Math.min(t.width / 2, 200), where === 'top' ? t.y + 6 : t.y + t.height - 6, { steps: 14 }); await sleep(150)
    await page.mouse.up(); await sleep(700)
  }
  const o0 = await order('#sbBoard')
  const pics = [await pic(page, 'P4c-04-board-before')]
  await grab('#sbBoard', 'ground', 'waves', 'top')
  const o1 = await order('#sbBoard')
  await grab('#sbBoard', 'prog', 'duty', 'top')
  const o2 = await order('#sbBoard')
  pics.push(await pic(page, 'P4c-04-board-after-drags'))
  const checks = [['setup: the sections were reordered by the real drag (before → after)', JSON.stringify(o0) !== JSON.stringify(o2), { o0, o1, o2 }]]
  for (const surf of ['board', 'week']) {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 6)
    const scope = surf === 'board' ? '#sbBoard' : scopeSel('week', 6)
    await ensureHelper(page)
    const sc = await order(surf === 'board' ? '#sbBoard' : '#eWeek > .day[data-day="6"]')
    const fw = await walkForward(page, scope, { keepStops: true })
    await page.keyboard.press('Tab'); await sleep(150)
    const bk = await walkBack(page, scope)
    const secSeq = fw.list.map(b => b.sec).filter((x, i, a) => i === 0 || a[i - 1] !== x).map(s => s.split('.')[1])
    pics.push(await pic(page, `P4c-04-${surf}-after-route`))
    const exp = sc.filter(k => secSeq.includes(k))
    checks.push([`${surf}: the displayed section order after the drags has Ground before Flying and Common Programme after Flying`, sc.indexOf('ground') < sc.indexOf('waves') && sc.indexOf('waves') < sc.indexOf('prog'), sc])
    checks.push([`${surf}: forward route: all ${fw.n} open boxes in order, section by section = the displayed order`, fw.bad.length === 0 && JSON.stringify(secSeq) === JSON.stringify(exp), { bad: fw.bad.slice(0, 3), routeSections: secSeq, displayed: exp }])
    checks.push([`${surf}: backward route is the exact mirror`, bk.bad.length === 0, bk.bad.slice(0, 3)])
    checks.push([`${surf}: each section's own note box is reached inside the route`, ['dn', 'pn', 'dtn', 'sn', 'gn'].every(k => fw.list.some(b => b.key.startsWith(k + ':'))), fw.list.filter(b => /^(dn|pn|dtn|sn|gn):/.test(b.key)).map(b => b.key + '@' + b.sec)])
    checks.push([`${surf}: nothing written`, fw.noWrite && bk.noWrite])
  }
  return { checks, pics }
})
await finish(PART)
