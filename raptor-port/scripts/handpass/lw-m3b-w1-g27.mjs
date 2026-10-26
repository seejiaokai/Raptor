// W1 part g — scenarios 27, 28 and A4 (desktop 1536x864): the drag window's ⋯ -> Other / Attach.
// 27: Ranger's free day + his whole-day OTH day + a third free day; ⋯ -> Other: the free days are filed, the OTH day "already holds an Other —
//     left as it is", the run split; two new inputs.
// 28: three men x two days; ⋯ shows no Post out; Other: one input a man, six OTH boxes, one Undo takes back all.
// A4: one man, two days: ⋯ reads Attach, Other, Post out; Attach: one input over both days, two ATCH boxes joined as one bar.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-g27.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s27-', 's28-', 'a4-']) L.clearPrefix(p)
console.log('lw-m3b-w1-g27 desktop 1536x864 out', L.OUT)
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const brief = c => (c?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|')[2] + '/' + b.split('|').pop()).join(' + ') || '(empty)'
const inputsOf = (P, type, ids) => P.evaluate(([type, ids]) => (window.INPUTS || []).filter(r => r.type === type && (r.people || []).some(x => ids.includes(x.p))).map(r => ({ date: r.date, endDate: r.endDate, who: (r.people || []).map(x => x.p).join('+'), acc: r.acc, rmk: r.remarks, allday: r.allday, half: r.half })), [type, ids])
const sc = async (id, fn) => { console.log(`-- ${id}`); try { await fn() } catch (e) { say(`${id} NOT DONE — ${String(e).slice(0, 300)}`) } }
const selMenu = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="sel-more-menu"] [role="menuitem"], [data-testid="sel-more-menu"] button')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.dataset.testid || '') + '=' + e.textContent.trim()))

/* ---------------- 27 ---------------- */
await sc('27', async () => {
  const w = await M.start('desk'); const P = w.page
  const A = '2026-11-17', B = '2026-11-18', C = '2026-11-19'
  // the whole-day OTH on B, through the one-day window's ⋯
  await L.openCellR(w, 'bane', B); await P.waitForSelector(T('bid-picker'))
  await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu')); await L.press(w, T('bid-file-OTH')); await P.waitForTimeout(800)
  say(`27 fixture: ${B} -> ${brief(await M.cellWords(P, 'bane', B))}`)
  judge(/^OTH\//.test(brief(await M.cellWords(P, 'bane', B))), '27 the whole-day OTH stands on the middle day')
  const open = await M.dragCells(w, ['bane', A], ['bane', C])
  say(`27 the drag over ${A}..${C} opened the drag window: ${open}`)
  say('27 the drag window reads: ' + (await L.txt(P, T('select-sheet'))).slice(0, 220))
  await L.press(w, T('sel-more')); await P.waitForSelector(T('sel-more-menu'), { timeout: 3000 })
  say('27 the ⋯ holds: ' + (await selMenu(P)).join(' · '))
  await M.winPic(w, 's27-1-drag-more', { sel: T('select-sheet'), above: 60 })
  await P.mouse.click((await L.centre(P, T('sel-file-OTH'))).x, (await L.centre(P, T('sel-file-OTH'))).y)
  await P.waitForTimeout(150)
  const q = { note: await L.txt(P, T('sel-note')), toast: await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast, .secdef-snack')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)), open: await L.vis(P, T('select-sheet')) }
  await P.screenshot({ path: path.join(L.OUT, 's27-2-after-other-q.png'), scale: 'css' })
  await P.waitForTimeout(900)
  const settled = { note: await L.txt(P, T('sel-note')), toast: await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast, .secdef-snack')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)), open: await L.vis(P, T('select-sheet')), wins: await M.anyWindowOpen(P) }
  say('27 right after: ' + JSON.stringify(q) + '; settled: ' + JSON.stringify(settled))
  await P.screenshot({ path: path.join(L.OUT, 's27-3-settled.png'), scale: 'css' })
  const cells = {}
  for (const d of [A, B, C]) cells[d] = brief(await M.cellWords(P, 'bane', d))
  say('27 cells: ' + JSON.stringify(cells))
  const inps = await inputsOf(P, 'Other', ['bane'])
  say('27 the Other inputs of Ranger: ' + JSON.stringify(inps))
  const said = JSON.stringify([q, settled])
  judge(/already holds an Other/i.test(said) && /left as it is/i.test(said), `27 the window / note says the day "already holds an Other — left as it is": ${said.slice(0, 300)}`)
  judge(cells[A].startsWith('OTH') && cells[B].startsWith('OTH') && cells[C].startsWith('OTH'), '27 all three days read OTH')
  judge(inps.length === 3 && inps.filter(i => i.date === 'Nov 17').length === 1 && inps.filter(i => i.date === 'Nov 19').length === 1 && inps.filter(i => i.date === 'Nov 18').length === 1 && !inps.some(i => i.endDate), `27 two new inputs (17 and 19 Nov, not one run over the 18th) beside the old one: ${JSON.stringify(inps.map(i => i.date + (i.endDate ? '–' + i.endDate : '')))}`)
  await L.cellShot(w, 'bane', B, 's27-4-cells')
  console.log('   errors:', JSON.stringify(w.errs)); await w.ctx.close()
})

/* ---------------- 28 ---------------- */
await sc('28', async () => {
  const w = await M.start('desk'); const P = w.page
  const ids = await M.ids(P)
  const men = [['bane', 'Ranger'], ['stiff', 'Saber'], ['mamba', 'Sidewinder']]
  const d1 = '2026-11-24', d2 = '2026-11-25'
  const open = await M.dragCells(w, ['bane', d1], ['mamba', d2])
  say(`28 the drag Ranger..Sidewinder × ${d1}..${d2} opened the drag window: ${open}`)
  say('28 the drag window reads: ' + (await L.txt(P, T('select-sheet'))).slice(0, 220))
  await L.press(w, T('sel-more')); await P.waitForSelector(T('sel-more-menu'), { timeout: 3000 })
  const menu = await selMenu(P)
  say('28 the ⋯ holds: ' + menu.join(' · '))
  await M.winPic(w, 's28-1-drag-more', { sel: T('select-sheet'), above: 60 })
  judge(!menu.some(m => /Post out/i.test(m)) && menu.some(m => /Other/.test(m)), `28 ⋯ shows no Post out over several men: ${menu.join(', ')}`)
  const wr0 = (await M.recsOf(P, 'bane', d1)).length
  await P.mouse.click((await L.centre(P, T('sel-file-OTH'))).x, (await L.centre(P, T('sel-file-OTH'))).y)
  await P.waitForTimeout(1000)
  say('28 windows after: ' + JSON.stringify(await M.anyWindowOpen(P)) + '; note: ' + (await L.txt(P, T('sel-note'))))
  await P.screenshot({ path: path.join(L.OUT, 's28-2-after-other.png'), scale: 'css' })
  const boxes = {}
  let n = 0
  for (const [id] of men) for (const d of [d1, d2]) { const b = brief(await M.cellWords(P, id, d)); boxes[id + '@' + d] = b; if (/^OTH\//.test(b)) n++ }
  say('28 cells: ' + JSON.stringify(boxes))
  const inps = await inputsOf(P, 'Other', men.map(m => m[0]))
  say('28 the Other inputs: ' + JSON.stringify(inps))
  judge(n === 6, `28 six OTH boxes on the war: ${n}`)
  judge(inps.length === 3 && new Set(inps.map(i => i.who)).size === 3 && inps.every(i => !i.who.includes('+')), `28 one input a man (${inps.length} inputs, people ${JSON.stringify(inps.map(i => i.who))})`)
  await M.winPic(w, 's28-3-cells', { sel: T('cell-bane-' + d1), above: 0 }).catch(() => {})
  await L.cellShot(w, 'stiff', d1, 's28-3-cells')
  // one Undo
  await L.undo(w)
  const n2 = []; for (const [id] of men) for (const d of [d1, d2]) n2.push(brief(await M.cellWords(P, id, d)))
  const inps2 = await inputsOf(P, 'Other', men.map(m => m[0]))
  say(`28 after ONE Undo: cells ${JSON.stringify(n2)}; Other inputs left: ${inps2.length}; the screen is still the Leave War: ${await P.evaluate(() => { const e = document.querySelector('#page-leavewar'); return !!e && e.getBoundingClientRect().height > 0 })}`)
  judge(n2.every(b => b === '(empty)') && inps2.length === 0, `28 one Undo takes back all six boxes and the three inputs`)
  await L.cellShot(w, 'stiff', d1, 's28-4-after-undo')
  await L.redo(w)
  const n3 = []; for (const [id] of men) for (const d of [d1, d2]) n3.push(brief(await M.cellWords(P, id, d)))
  say(`28 after Redo: ${n3.filter(b => /^OTH/.test(b)).length} OTH boxes back`)
  console.log('   errors:', JSON.stringify(w.errs)); await w.ctx.close()
})

/* ---------------- A4 ---------------- */
await sc('A4', async () => {
  const w = await M.start('desk'); const P = w.page
  const ids = await M.ids(P)
  const who = ids.Drifter, d1 = '2026-11-26', d2 = '2026-11-27'
  const open = await M.dragCells(w, [who, d1], [who, d2])
  say(`A4 the drag over Drifter ${d1}..${d2} opened the drag window: ${open}`)
  await L.press(w, T('sel-more')); await P.waitForSelector(T('sel-more-menu'), { timeout: 3000 })
  const menu = await selMenu(P)
  say('A4 the ⋯ reads: ' + menu.join(' · '))
  await M.winPic(w, 'a4-1-drag-more', { sel: T('select-sheet'), above: 60 })
  judge(menu.map(m => m.split('=')[1]).join('|') === 'Attach|Other|Post out', `A4 the ⋯ reads Attach, Other, Post out: ${menu.join(', ')}`)
  const att = await L.centre(P, T('sel-file-ATCH'))
  await P.mouse.click(att.x, att.y); await P.waitForTimeout(1000)
  say('A4 windows after: ' + JSON.stringify(await M.anyWindowOpen(P)))
  const c1 = await L.cellInfo(P, who, d1), c2 = await L.cellInfo(P, who, d2)
  say('A4 day 1 box: ' + JSON.stringify(c1.boxes.map(b => ({ t: b.text, cls: b.cls, bs: b.bs, w: b.w, x: b.x })))); say('A4 day 2 box: ' + JSON.stringify(c2.boxes.map(b => ({ t: b.text, cls: b.cls, bs: b.bs, w: b.w, x: b.x }))))
  const inps = await inputsOf(P, 'Attach', [who])
  say('A4 the Attach inputs: ' + JSON.stringify(inps))
  const r1 = await P.evaluate(([w, d1, d2]) => { const a = document.querySelector(`[data-testid="cell-${w}-${d1}"] .c`).getBoundingClientRect(), b = document.querySelector(`[data-testid="cell-${w}-${d2}"] .c`).getBoundingClientRect(); return { aRight: Math.round(a.right * 10) / 10, bLeft: Math.round(b.left * 10) / 10, gap: Math.round((b.left - a.right) * 10) / 10 } }, [who, d1, d2])
  say('A4 the gap between the two boxes: ' + JSON.stringify(r1))
  await L.cellShot(w, who, d1, 'a4-2-boxes')
  judge(inps.length === 1 && inps[0].date === 'Nov 26' && /Nov 27/.test(inps[0].endDate || ''), `A4 one input over both days: ${JSON.stringify(inps)}`)
  judge(/^ATCH\//.test(brief(c1 && { boxes: c1.boxes.map(b => b.text + '|' + b.cls.match(/k-\w+/)?.[0] + '|' + (b.cls.match(/s-[awr]/) || [''])[0] + '|x|x|x|whole') })) && c2.boxes[0]?.text === 'ATCH' || c2.boxes[0]?.text === '', `A4 two ATCH boxes: ${c1.boxes.map(b => b.text)} / ${c2.boxes.map(b => b.text)}`)
  judge(r1.gap <= 1.5, `A4 the two boxes join as one bar (gap ${r1.gap}px; the bar's classes: ${c1.boxes[0]?.cls} / ${c2.boxes[0]?.cls})`)
  console.log('   errors:', JSON.stringify(w.errs)); await w.ctx.close()
})
console.log(`SUMMARY [desktop]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
await M.closeBrowser()
