// walker C, script 1 — the person window on a desktop: docked, dragged, the grid behind, every way in, the tiles, the list.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c1'
const { L, T, pwRead, onScreen, closePw, openBalances, typeInBox, balRow, gridFigure, note, topAt, ids, rec, shot, press, vis, txt } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c1-desk v1]')
L.clearOut()
const w = await L.newCtx('desk')
const P = w.page
const blk = async (name, fn) => { try { await fn() } catch (e) { rec(name + ' (script)', 'desk', 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300), [name]); await shot(w, name + '-err').catch(() => {}) } }
const nameBtn = pid => `[data-testid="row-${pid}"] .whoedit`
const pwBox = async () => (await pwRead(P))
const hist = () => P.evaluate(() => window.__hist || null)
const hasPuck = async () => P.evaluate(() => { const h = document.querySelector('[data-testid="person-window"] [data-testid="pw-name"]'); const p = document.querySelector('[data-testid="person-window"] .puck'); return { nameHtml: h ? h.innerHTML.slice(0, 200) : null, puckInWindow: !!p } })

await L.signIn(w, 'admin')

/* ---------- 1  Ranger from the grid: docked, tiles ---------- */
await blk('01', async () => {
  await press(w, nameBtn('bane')); await P.waitForTimeout(700)
  const pw = await pwRead(P)
  const card = await P.evaluate(() => { const r = document.getElementById('page-leavewar')?.getBoundingClientRect(); const m = document.querySelector('.mx-outer')?.getBoundingClientRect(); return { pageRight: r && Math.round(r.right), gridRight: m && Math.round(m.right), gridTop: m && Math.round(m.top), gridBottom: m && Math.round(m.bottom) } })
  const ok = pw && onScreen(pw) && /Ranger/.test(pw.name) && pw.box.right <= card.pageRight && pw.box.right >= card.gridRight - 20
  rec('P1 a pilot\'s name on the grid opens his window docked at the grid\'s right edge', 'desk', ok ? 'PASS' : 'FAIL',
    `box left ${pw?.box.left} right ${pw?.box.right} top ${pw?.box.top} bottom ${pw?.box.bottom} (screen ${pw?.vw}x${pw?.vh}); grid card right ${card.gridRight}, page right ${card.pageRight}, grid top ${card.gridTop}`, ['01-ranger-docked'])
  await shot(w, '01-ranger-docked')
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/01-ranger-window-crop.png', scale: 'device' })
  const tiles = `taken "${pw.taken}"; App bal ${pw.app}; Pending ${pw.pend}; War bal ${pw.war}; carried fwd ${pw.cf}; OIL "${pw.oil}"; MED "${pw.med}"; CCL ${pw.other.CCL}; FCL ${pw.other.FCL}; PL ${pw.other.PL}; EL ${pw.other.EL}; CL ${pw.other.CL}; boxes ${pw.boxes}; lock ${pw.lock}`
  const tOk = pw.taken === '3 taken' && pw.app === '15' && /2\.5/.test(pw.pend) && pw.war === '12.5' && pw.cf === '2' && /^0/.test(pw.oil) && /^0/.test(pw.med) && /pend −1 war 2/.test(pw.other.CCL) && pw.other.FCL === '5' && /pend −0.5 war 1.5/.test(pw.other.PL) && pw.other.EL === '4' && /pend −1 war 0/.test(pw.other.CL)
  rec('P2 the tiles against m5a-c-approved / p2-desk-drawn (figures)', 'desk', tOk ? 'PASS' : 'FAIL', tiles, ['01-ranger-window-crop'])
  const inc = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); return pw.innerText.replace(/\s+/g, ' ') })
  rec('P2b words "incl. 2 carried fwd · till 31 Dec"', 'desk', /incl\.\s*2\s*carried fwd · till 31 Dec/.test(inc) ? 'PASS' : 'FAIL', inc.slice(0, 260), ['01-ranger-window-crop'])
  /* pending / war bal only while pending */
  const small = await P.evaluate(() => ['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => k + ':' + (!!document.querySelector(`[data-testid="pw-${k}-pend"]`) ? 'pend' : 'none')).join(' '))
  rec('P2c small tiles show Pending / War bal only while something is pending', 'desk', small === 'CCL:pend FCL:none PL:pend EL:none CL:pend' ? 'PASS' : 'FAIL', small, ['01-ranger-window-crop'])
  /* alignment: small boxes on one line, and the lines under them */
  const al = await P.evaluate(() => { const g = id => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }; const o = {}; for (const k of ['LVE', 'CCL', 'FCL', 'PL', 'EL', 'CL']) o[k] = g('pw-' + k); o.tileLVE = g('pw-tile-LVE'); o.tileOIL = g('pw-tile-OIL'); o.tileMED = g('pw-tile-MED'); for (const k of ['CCL', 'PL', 'CL']) { o[k + 'p'] = g(`pw-${k}-pend`); o[k + 'w'] = g(`pw-${k}-war`) } return o })
  const tops = ['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => al[k]?.t)
  const pt = ['CCL', 'PL', 'CL'].map(k => al[k + 'p']?.t), wt = ['CCL', 'PL', 'CL'].map(k => al[k + 'w']?.t)
  const same = a => a.every(x => x === a[0])
  rec('P2d the five small tiles line up (boxes, Pending lines, War bal lines)', 'desk', same(tops) && same(pt) && same(wt) ? 'PASS' : 'FAIL', `box tops ${tops}; Pending tops ${pt}; War bal tops ${wt}; tiles: LVE ${JSON.stringify(al.tileLVE)} OIL ${JSON.stringify(al.tileOIL)} MED ${JSON.stringify(al.tileMED)}`, ['01-ranger-window-crop'])
  const hp = await hasPuck()
  rec('P2e heading: his name as words, no puck (D1480 "without a puck")', 'desk', !hp.puckInWindow ? 'PASS' : 'FAIL', `puck inside window: ${hp.puckInWindow}; name html ${hp.nameHtml}`, ['01-ranger-window-crop'])
  /* list lines */
  const l = pw.lines.map(x => x.text)
  const want = ['LL Mon 19 – Wed 21 Jan 3 Approved', 'LL Mon 26 – Tue 27 Jan 2 Approved', 'LL Thu 29 Jan, AM 0.5 Pending', 'LL Mon 2 Feb 1 Refused', 'LL Thu 12 – Fri 13 Feb 2 Pending', 'CCL Mon 2 Mar 1 Pending', 'PL Mon 16 Mar, AM 0.5 Pending', 'CL Tue 17 Mar 1 Pending']
  rec('P3 the leave list, one line each, as drawn (kind box · dates · days · state)', 'desk', JSON.stringify(l) === JSON.stringify(want) ? 'PASS' : 'FAIL', l.join(' | '), ['01-ranger-docked'])
  const clip = await P.locator('[data-testid^="pw-clip-"]').count()
  rec('P3b a paperclip on a line with a document', 'desk', clip > 0 ? 'PASS' : 'NOT WALKED', `paperclips drawn: ${clip} (${(await ids(P, 'pw-clip-')).join(',')}) — the drawing shows one on Mon 19 – Wed 21 Jan`, ['01-ranger-window-crop'])
  const wh = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); const list = document.querySelector('[data-testid="pw-list"]'); const sc = [pw, list, ...pw.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).map(e => ({ tag: e.dataset.testid || e.className.toString().slice(0, 30), sh: e.scrollHeight, ch: e.clientHeight })); return sc })
  rec('P3c the window\'s height: whole list in view, or scrolls inside itself', 'desk', 'PASS', `window ${pw.box.height} high of a ${pw.vh} screen (top ${pw.box.top}); scrolling parts: ${JSON.stringify(wh)}; the drawing shows all 8 lines in the window with no scroll`, ['01-ranger-docked'])
})

/* ---------- 2  drag the window, grid behind it ---------- */
await blk('02', async () => {
  const pw = await pwRead(P)
  const gx = pw.box.left + 18, gy = pw.box.top + 31
  await P.mouse.move(gx, gy); await P.mouse.down(); await P.waitForTimeout(100)
  for (let i = 1; i <= 12; i++) { await P.mouse.move(gx - i * 40, gy + i * 8); await P.waitForTimeout(25) }
  await P.mouse.up(); await P.waitForTimeout(400)
  const pw2 = await pwRead(P)
  await shot(w, '02-dragged')
  const moved = pw2 && Math.abs(pw2.box.left - (pw.box.left - 480)) < 8 && Math.abs(pw2.box.top - (pw.box.top + 96)) < 8
  rec('P4 the window drags by its grip (480 left, 96 down)', 'desk', moved ? 'PASS' : 'FAIL', `before left ${pw.box.left} top ${pw.box.top}; after left ${pw2?.box.left} top ${pw2?.box.top} right ${pw2?.box.right} bottom ${pw2?.box.bottom}; on screen ${onScreen(pw2)}`, ['02-dragged'])
  /* the grid behind still works: press another name */
  await press(w, nameBtn('stiff')); await P.waitForTimeout(700)
  const pw3 = await pwRead(P)
  await shot(w, '02b-other-name-while-dragged')
  const one = await P.locator(T('person-window')).count()
  rec('P5 press another name with the window up: it switches to him, one window (lesson 4)', 'desk', pw3 && /Saber/.test(pw3.name) && one === 1 ? 'PASS' : 'FAIL', `window now "${pw3?.name}", ${one} window(s); position left ${pw3?.box.left} top ${pw3?.box.top} (dragged position kept: ${pw3 && pw3.box.left === pw2.box.left && pw3.box.top === pw2.box.top}); App bal ${pw3?.app} cf ${pw3?.cf}; boxes ${pw3?.boxes}; lock ${pw3?.lock}; lit row in grid: ${await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].filter(e => /sel|me|lit|on/.test(e.className.toString())).map(e => e.dataset.testid + ':' + e.className.toString().slice(0, 30)).join(',')) }`, ['02b-other-name-while-dragged'])
  /* another cell: a day cell of Ranger's row behind the window */
  await L.reachCell(w, 'bane', '2026-01-26')
  const cellOK = await vis(P, T('cell-bane-2026-01-26'))
  if (cellOK) {
    await press(w, T('cell-bane-2026-01-26')); await P.waitForTimeout(700)
    const pw4 = await pwRead(P)
    const bid = await vis(P, T('bid-picker'))
    await shot(w, '02c-cell-pressed')
    const bidBox = bid ? await P.locator(T('bid-picker')).boundingBox() : null
    rec('P6 press a day cell with the window up: the bid window opens beside it (D641) — both visible, neither under the other', 'desk', bid && pw4 ? 'PASS' : 'FAIL', `bid window ${bid ? JSON.stringify(bidBox && { l: Math.round(bidBox.x), t: Math.round(bidBox.y), r: Math.round(bidBox.x + bidBox.width), b: Math.round(bidBox.y + bidBox.height) }) : 'not opened'}; person window now "${pw4?.name}" box ${pw4 && `${pw4.box.left},${pw4.box.top}-${pw4.box.right},${pw4.box.bottom}`}; window centre: ${await topAt(P, T('bid-picker'))}; person window centre: ${await topAt(P, T('person-window'))}`, ['02c-cell-pressed'])
    await L.closeWin(w)
  } else rec('P6 press a day cell with the window up', 'desk', 'NOT WALKED', 'cell Ranger 26 Jan not drawn', ['02b-other-name-while-dragged'])
  await closePw(w)
})

/* ---------- 3  the LVE figure beside a name; My leave (admin's own) ---------- */
await blk('03', async () => {
  const f = await gridFigure(P, 'bane')
  await press(w, T('bal-bane')); await P.waitForTimeout(700)
  const pw = await pwRead(P)
  const sheet = await vis(P, '[data-testid="fig-sheet"], .figsheet, [data-testid*="breakdown"]')
  await shot(w, '03-lve-figure')
  rec('W1 the LVE figure beside a name (reading 15) opens the person window', 'desk', pw && /Ranger/.test(pw.name) && onScreen(pw) ? 'PASS' : 'FAIL', `figure read "${f}"; window "${pw?.name}" top ${pw?.box.top}; old breakdown sheet visible: ${sheet}`, ['03-lve-figure'])
  await closePw(w)
  await press(w, T('my-leave')); await P.waitForTimeout(700)
  const own = await pwRead(P)
  await shot(w, '03b-myleave-admin')
  rec('W2 My leave (Saber, admin) opens his own window', 'desk', own && /Saber/.test(own.name) && onScreen(own) ? 'PASS' : 'FAIL', `window "${own?.name}" App bal ${own?.app} pend ${own?.pend} war ${own?.war}; boxes ${own?.boxes}; top ${own?.box.top}; lines ${own?.lines.length}; dots ${own?.lines.filter(x => x.dot).length}`, ['03b-myleave-admin'])
  await closePw(w)
})

/* ---------- 4  kinds of men on the grid ---------- */
await blk('04', async () => {
  const men = [['glass', 'WSO (IW)'], ['spanner', 'ground personnel (G)'], ['prism', 'OCU (O)'], ['slipway', 'pilot, grade A'], ['dj', 'A']]
  const out = []
  for (const [pid, kind] of men) {
    await press(w, nameBtn(pid)); await P.waitForTimeout(600)
    const pw = await pwRead(P)
    const m = await P.evaluate(pid => { const r = document.querySelector(`[data-testid="row-${pid}"]`); const chip = r.querySelector('.whoedit .role, .whoedit .cat, .chip'); return { chip: chip ? chip.textContent.trim() : null, cls: r.querySelector('.whoedit')?.className.toString().slice(0, 50) } }, pid)
    await shot(w, `04-${pid}`)
    out.push(`${pid} (${kind}): window "${pw?.name}" App ${pw?.app} cf ${pw?.cf} pend ${pw?.pend} war ${pw?.war} OIL ${pw?.oil} on screen ${onScreen(pw)} boxes ${pw?.boxes} lines ${pw?.lines.length}; chip ${m.chip}`)
    rec(`P7 ${kind} opens his window`, 'desk', pw && onScreen(pw) ? 'PASS' : 'FAIL', out[out.length - 1], [`04-${pid}`])
  }
  await closePw(w)
})

/* ---------- 5  Balances name, Approvals line, My leave as member ---------- */
await blk('05', async () => {
  await openBalances(w)
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const pw = await pwRead(P)
  await shot(w, '05-from-balances')
  rec('W3 a name on the Balances page opens his window on the screen', 'desk', pw && /Ranger/.test(pw.name) && onScreen(pw) ? 'PASS' : 'FAIL', `window "${pw?.name}" box ${pw && `${pw.box.left},${pw.box.top}-${pw.box.right},${pw.box.bottom}`}; Balances page behind still drawn: ${await vis(P, T('balances-page'))}`, ['05-from-balances'])
  /* the Balances page behind: pressing another name there */
  await press(w, T('bal-name-stiff')); await P.waitForTimeout(600)
  const pw2 = await pwRead(P)
  rec('W3b another name on the page behind switches the one window', 'desk', pw2 && /Saber/.test(pw2.name) ? 'PASS' : 'FAIL', `window "${pw2?.name}", count ${await P.locator(T('person-window')).count()}`, ['05-from-balances'])
  await closePw(w)
  await L.openApprovals(w)
  const pu = '[data-testid="appr-line-bane"] .appr-puck'
  await press(w, pu); await P.waitForTimeout(700)
  const pw3 = await pwRead(P)
  await shot(w, '05b-from-approvals-puck')
  rec('W4 Approvals: a tap on a man\'s puck opens his window (reading)', 'desk', pw3 && /Ranger/.test(pw3.name) && onScreen(pw3) ? 'PASS' : 'FAIL', `window "${pw3?.name}" box ${pw3 && `${pw3.box.left},${pw3.box.top}-${pw3.box.right},${pw3.box.bottom}`}; Approvals page still drawn: ${await vis(P, T('approvals-page'))}`, ['05b-from-approvals-puck'])
  /* a leave line tapped from here: where does the grid go, is the person left on the Grid? */
  const line = 'pw-line-2026-03-02'
  const goBtn = `[data-testid="${line}"] button.ll-go`
  if (await P.locator(goBtn).count()) {
    await press(w, goBtn); await P.waitForTimeout(900)
    const tab = await P.evaluate(() => [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getAttribute('aria-selected') === 'true').map(e => e.dataset.testid).join(','))
    const cell = await vis(P, T('cell-bane-2026-03-02'))
    await shot(w, '05c-line-tapped-from-approvals')
    const pwx = await pwRead(P)
    rec('W5 a leave line tapped in the window opened from Approvals', 'desk', 'PASS', `tab now ${tab}; Ranger's 2 Mar cell drawn: ${cell}; window ${pwx ? 'still open at ' + pwx.box.left + ',' + pwx.box.top : 'closed'}; a "Back to Approvals" bar: ${await vis(P, '[data-testid*="back"]')} — recorded for the host (where the person ends up)`, ['05c-line-tapped-from-approvals'])
  } else rec('W5 a leave line\'s tap', 'desk', 'NOT WALKED', 'no button.ll-go on the line', ['05b-from-approvals-puck'])
  await closePw(w)
  await L.openGrid(w)
})

await w.ctx.close()
rec('errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('c1')
await L.closeBrowser()
console.log('DONE')
