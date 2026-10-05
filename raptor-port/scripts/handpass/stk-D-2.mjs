/* Walker D, world 2: the 'everything Saturday' (built by stk-D-build.mjs through the app's controls) on desktop —
   P4c-07, 13, 08, 03, 09, 04 (real keys). */
import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, walkForward, walkBack, clickBox, caret, caretIdx, label, snap, same, sleep, pic, row, savePart, scopeSel, valueOf, ensureHelper, tap } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
page.setDefaultTimeout(9000)
const wk = scopeSel('week', 5), sb = scopeSel('board', 5)
const kk = c => (c.kind || c.tag) + ':' + c.key
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 300) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world2')
}
const seq = () => page.evaluate(() => window.commandStreamLen())
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }
const surfOpen = async surf => { if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 5) }
const popups = () => page.evaluate(() => ({
  arm: !!(window.ARM && window.ARM.key),
  q: document.querySelectorAll('.mission-role-question').length,
  pops: [...document.querySelectorAll('.wavemenu,#inpEditPop,.pop,.popup,.stpop,.areapop,.rosterpop,[role=dialog],[role=menu]')].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').filter(e => e.getBoundingClientRect().width > 0).map(e => e.className.toString().slice(0, 30)).slice(0, 6),
}))

await nav(page, 'editsched')

/* ---------------- P4c-07 ---------------- */
for (const surf of ['week', 'board']) {
  await surfOpen(surf)
  const scope = surf === 'week' ? wk : sb
  await S('P4c-07-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Saturday (tracking ON): typed DS FOR RU into the Remarks of an SC row, an AVALON row and a BB row; then clicked into each standalone wave's first box and Tabbed through to its last box and one more`, async () => {
    const list = await boxList(page, scope)
    const checks = [], pics = []
    for (const [w, nm] of [[1, 'SC'], [2, 'AVALON'], [3, 'BB']]) {
      const mine = list.map((b, i) => ({ ...b, i })).filter(b => new RegExp('^(ff|fr|wl):5[.]' + w + '([.]|$)').test(b.key) || (b.kind === 'itline' && b.key.startsWith('5|' + w + '|')) || (/^(area|atime|bombs)$/.test(b.kind) && b.key.startsWith('5.' + w + '.')))
      const first = mine[0].i, last = mine[mine.length - 1].i
      // type the DS remark into the first Remarks box of the wave
      const rIx = mine.find(b => /^fr:/.test(b.key)).i
      await clickBox(page, scope, rIx); await typeNow('DS FOR RU'); await page.keyboard.press('Tab'); await sleep(350)
      const pq = await popups()
      // route
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
      checks.push([`${nm}: route visits exactly the wave's ${mine.length} open boxes in order, then leaves to ${list[last + 1] ? list[last + 1].kind + '=' + list[last + 1].key : 'the next control'}`, bad.length === 0, { bad: bad.slice(0, 3), boxKinds: kinds.join(',') }])
      checks.push([`${nm}: no In-time/Rally box (itline) in the wave, no stores/area boxes, no role question or popup after typing DS FOR RU`, !mine.some(b => b.kind === 'itline' || b.kind === 'area' || b.kind === 'bombs') && pq.q === 0 && pq.pops.length === 0 && !pq.arm, { itline: mine.filter(b => b.kind === 'itline').length, bombs: mine.filter(b => b.kind === 'bombs').length, popups: pq }])
      checks.push([`${nm}: Brief box present among the wave's boxes?`, true, { brief: mine.filter(b => /\.br$/.test(b.key)).length + ' box(es) with key ff:*.br' }])
      checks.push([`${nm}: nothing written by the Tab route`, same(s0, s1)])
    }
    return { checks, pics }
  })
}

/* ---------------- P4c-13 ---------------- */
await openBoard(page, 5)
await S('P4c-13', 'Board then Week, Saturday: pressed + Line on the flying wave (an EMPTY formation) and CX on the COBRA line (cancelled); Tabbed the whole wave in both editors and compared with what is enabled', async () => {
  await page.locator('#sbBoard [data-gline="5.0"]:visible').first().click(); await sleep(600)
  const cx = await page.evaluate(() => { const c = document.querySelector('#sbBoard [data-bfld="ff:5.0.1.cs"]'); const row = c && c.closest('.sb-line, .sbl, .sb-row, tr, .arow') ; const b = (row || c.parentElement.parentElement).querySelector('[data-lcx]'); return b ? b.getAttribute('data-lcx') : null })
  const lcxAll = await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-lcx]')].map(e => e.getAttribute('data-lcx') + (e.classList.contains('on') ? ':ON' : '')))
  await page.locator(`#sbBoard [data-lcx="${cx}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.locator(`#sbBoard [data-lcx="${cx}"]`).first().click(); await sleep(500)
  await page.locator('#cxReason').fill('WX'); await page.keyboard.press('Enter'); await sleep(500)
  if (await page.locator('#cxPop:visible').count()) { await page.locator('#cxPop .airpop-foot button:not([hidden]):not(#cxUn)').last().click(); await sleep(500) }
  console.log('cx popup still open:', await page.locator('#cxPop:visible').count())
  const cxAfter = await page.evaluate(k => [...document.querySelectorAll('#sbBoard [data-lcx]')].map(e => e.getAttribute('data-lcx') + (e.classList.contains('on') ? ':ON' : '')), cx)
  const pics = [await pic(page, 'P4c-13-board-cx-and-empty-line')]
  const out = {}
  for (const surf of ['board', 'week']) {
    await surfOpen(surf)
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
    ['no write by either route; the cancellation (CX) state after the routes is unchanged', out.board.noWrite && out.week.noWrite && JSON.stringify(cxState) === JSON.stringify(await page.evaluate(() => window.DAYS[5].waves[0].formations.map(f => f.aircraft.map(a => !!a.cx)))), cxState],
  ], pics }
})

/* ---------------- P4c-08 ---------------- */
for (const surf of ['board', 'week']) {
  await surfOpen(surf)
  const scope = surf === 'week' ? wk : sb
  await S('P4c-08-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Saturday (duty desks, sims, ground, Common Programme, the five notes): clicked into the first box, Tabbed through all of them, then Shift+Tab all the way back`, async () => {
    await ensureHelper(page)
    const list = await boxList(page, scope)
    const p0 = await popups()
    const fw = await walkForward(page, scope, { keepStops: true })
    const bk = await walkBack(page, scope)
    const p1 = await popups()
    const secSeq = fw.list.map(b => b.sec).filter((x, i, a) => i === 0 || a[i - 1] !== x)
    const screenOrder = await page.evaluate(([s]) => [...document.querySelectorAll(`${s} [data-secmove]`)].map(e => ({ k: e.getAttribute('data-secmove'), top: e.getBoundingClientRect().top + scrollY, left: e.getBoundingClientRect().left })).sort((a, b) => a.top - b.top || a.left - b.left).map(e => e.k), [surf === 'week' ? wk : sb])
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
await openBoard(page, 5)
await S('P4c-03', 'Saturday: the timed personal input filed on the Inputs page (Training 11:00–12:00, remarks TAB INPUT) sits on the programme; on the Board Tabbed through its start, end and Remarks (typed 10:15, 11:45, text), also through the Personal Inputs echo; then the same on the Week', async () => {
  const iid = await page.evaluate(() => window.INPUTS.find(i => i.remarks === 'TAB INPUT' || /TAB/.test(i.remarks || '')).iid)
  const gi = await page.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)
  const nIn0 = await page.evaluate(() => window.INPUTS.length)
  // open Personal Inputs on the board
  const tog = page.locator('#sbBoard [data-pitog="5"]:visible').first()
  const rowsNow = () => page.evaluate(() => document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length)
  if (!(await rowsNow())) { await tog.click(); await sleep(500) }
  const list = await boxList(page, sb)
  const keys = list.filter(b => b.key.startsWith(iid) || b.key.startsWith(`gr:5.${gi}.`)).map(b => b.kind + '=' + b.key)
  const rd = () => page.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return { s: x.s, e: x.e, remarks: x.remarks, n: window.INPUTS.length } }, iid)
  const r0 = await rd()
  const seq0 = await seq()
  // forward: ground row start -> end -> remarks
  const ixStr = list.findIndex(b => b.key === `gr:5.${gi}.str`)
  await clickBox(page, sb, ixStr); await typeNow('10:15'); await page.keyboard.press('Tab'); await sleep(350)
  const c1 = await caret(page); await typeNow('11:45'); await page.keyboard.press('Tab'); await sleep(350)
  const c2 = await caret(page); await typeNow('INPUT TABBED'); await page.keyboard.press('Tab'); await sleep(450)
  const r1 = await rd(), seq1 = await seq()
  const echo = await page.evaluate(i => [...document.querySelectorAll(`#sbBoard [data-ifld^="${i}."]`)].map(e => e.getAttribute('data-ifld') + '=' + e.value), iid)
  const grRow = await page.evaluate(([g]) => { const r = window.DAYS[5].ground[g]; return { str: r.str, end: r.end, rmks: r.rmks, src: r.src } }, [gi])
  const pics = [await pic(page, 'P4c-03-board-after-ground-row-edit')]
  // via the echo in Personal Inputs
  const list2 = await boxList(page, sb)
  const ixE = list2.findIndex(b => b.key === `${iid}.rmks`)
  await clickBox(page, sb, ixE); await typeNow('ECHO EDITED'); await page.keyboard.press('Tab'); await sleep(450)
  const r2 = await rd()
  const grAfterEcho = await page.evaluate(([i]) => [...document.querySelectorAll(`#sbBoard [data-bfld^="gr:5."][data-bfld$=".rmks"]`)].map(e => e.getAttribute('data-bfld') + '=' + e.value).filter(x => /ECHO/.test(x)), [iid])
  pics.push(await pic(page, 'P4c-03-board-after-echo-edit'))
  // week
  await nav(page, 'editsched')
  const wlist = await boxList(page, wk)
  const wkeys = wlist.filter(b => b.key.startsWith(iid) || b.key.startsWith(`gr:5.${gi}.`)).map(b => b.kind + '=' + b.key)
  const wStr = wlist.findIndex(b => b.key === `gr:5.${gi}.str`)
  await clickBox(page, wk, wStr); await typeNow('10:30'); await page.keyboard.press('Tab'); await sleep(350)
  const wc1 = await caret(page); await typeNow('11:50'); await page.keyboard.press('Tab'); await sleep(350)
  const wc2 = await caret(page); await typeNow('WEEK TABBED'); await page.keyboard.press('Tab'); await sleep(450)
  const r3 = await rd()
  pics.push(await pic(page, 'P4c-03-week-after-edit'))
  return { checks: [
    ['the input\'s boxes found (board): ' + keys.join(' '), keys.length >= 3, keys],
    ['Board: Tab from start went to end, then Remarks; typed values saved into the SAME input (s=10:15=615, e=11:45=705, remarks)', c1.key === `gr:5.${gi}.end` && c2.key === `gr:5.${gi}.rmks` && r1.s === 615 && r1.e === 705 && r1.remarks === 'INPUT TABBED', { c1: label(c1), c2: label(c2), r0, r1 }],
    ['no second input appeared (count unchanged) and each edit was one command', r1.n === nIn0 && seq1 - seq0 === 3, { n0: nIn0, n1: r1.n, commands: seq1 - seq0 }],
    ['the other displayed occurrence (Personal Inputs echo) shows the saved values', echo.length >= 3 && echo.some(x => /str=10:15/.test(x)) && echo.some(x => /INPUT TABBED/.test(x)), echo],
    ['the schedule row (programme) carries the same values', true, grRow],
    ['editing through the echo saved the same input and the ground row\'s Remarks box shows it', r2.remarks === 'ECHO EDITED' && grAfterEcho.length > 0, { r2, grAfterEcho }],
    ['Week: Tab start→end→Remarks saved the same input (s=630, e=710)', wc1.key === `gr:5.${gi}.end` && wc2.key === `gr:5.${gi}.rmks` && r3.s === 630 && r3.e === 710 && r3.remarks === 'WEEK TABBED' && r3.n === nIn0, { wc1: label(wc1), wc2: label(wc2), r3, weekKeys: wkeys }],
  ], pics }
})

/* ---------------- P4c-09 ---------------- */
for (const surf of ['board', 'week']) {
  await surfOpen(surf)
  const scope = surf === 'week' ? wk : sb
  await S('P4c-09-' + surf, `${surf === 'week' ? 'Week' : 'Board'}, Saturday: ${surf === 'board' ? 'Personal Inputs opened then folded; Available crew folded; ' : ''}Tabbed the whole route and compared with the boxes drawn; looked for opened popups`, async () => {
    const pics = []
    let withIn = null
    if (surf === 'board') {
      const rowsNow = () => page.evaluate(() => document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length)
      if (!(await rowsNow())) { await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500) }
      withIn = (await boxList(page, sb)).filter(b => b.kind === 'ifld').length
      await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500)
      const av = page.locator('#sbBoard [data-avtog]:visible').first()
      if (await av.count()) { await av.click(); await sleep(400) }
    }
    const list = await boxList(page, scope)
    const folded = await page.evaluate(() => ({ pinRows: document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length, avRows: document.querySelectorAll('#sbBoard .avgrid .puck, #sbBoard .avail .puck').length }))
    const p0 = await popups()
    const fw = await walkForward(page, scope, { keepStops: false })
    await page.keyboard.press('Tab'); await sleep(200)
    const p1 = await popups()
    const stillFolded = await page.evaluate(() => ({ pinRows: document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length, avRows: document.querySelectorAll('#sbBoard .avgrid .puck, #sbBoard .avail .puck').length }))
    pics.push(await pic(page, `P4c-09-${surf}-after-route`))
    return { checks: [
      surf === 'board' ? ['with Personal Inputs OPEN its echo boxes joined the route (ifld count), folded they are absent', withIn > 0 && list.filter(b => b.kind === 'ifld').length === 0, { open: withIn, folded: list.filter(b => b.kind === 'ifld').length }] : ['week has no Personal Inputs fold; ifld boxes none', list.filter(b => b.kind === 'ifld').length === 0],
      [`route over the ${fw.n} drawn boxes in order, nothing hidden visited`, fw.bad.length === 0, fw.bad.slice(0, 4)],
      ['folds and popups stayed closed (fold rows 0 before and after; no popup open)', JSON.stringify(folded) === JSON.stringify(stillFolded) && p1.pops.length === 0 && !p1.arm, { folded, stillFolded, popups: p1 }],
      ['nothing written', fw.noWrite],
    ], pics }
  })
}

console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world2', 'console / page errors / 4xx during world 2', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world2', { errors })
await browser.close()
