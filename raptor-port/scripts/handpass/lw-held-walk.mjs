// THE WALK OF [LW-HELD-DAY-ADD] (his D1548, D1552, D1553 — a day filled from the Inputs page opens the bid window). Written as
// assertions of the RIGHT behaviour (a PASS means correct), so a re-run on a fixed build is the re-walk. The built bundle on
// LW_PORT; desktop 1536 x 864 (Chromium) and an iPhone 402 x 874 (Chromium touch, and WebKit for his phone's engine).
// Fixtures through the app's own controls (the Inputs page's form, the war's open-dates window), never injected (§7.7).
// Run: LW_PORT=4173 LW_OUT=2026-11-01-lw-held-day/walk node scripts/handpass/lw-held-walk.mjs   (PART=d,p,m,k for some)
process.env.LW_PORT ||= '4173'
process.env.LW_OUT ||= '2026-11-01-lw-held-day/walk'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
const parts = (process.env.PART || 'd,p,m,k').split(',')
const run = id => parts.includes(id)
console.log('lw-held-walk →', H.OUT, parts.join(' '))
const ids = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
const sheetOf = P => P.evaluate(() => ['bid-picker', 'raptor-sheet', 'daylist-sheet', 'remarks-sheet', 'closed-note'].find(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }) ?? null)
const lines = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid="bid-heldday"]')].map(e => e.textContent.replace(/\s+/g, ' ').trim()))
const has = (P, id) => P.evaluate(id => { const e = document.querySelector(`[data-testid="bid-picker"] [data-testid="${id}"]`); return !!e && e.getBoundingClientRect().width > 0 }, id)
const close = async w => { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(400) }
const neutral = P => P.evaluate(() => document.activeElement?.blur?.())
const recs = []
const rec = (id, size, ok, said, pics = []) => { recs.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} [${size}]  ${said}`) }
const winPic = async (w, name) => { await neutral(w.page); await w.page.waitForTimeout(150); return H.pic(w, name, [T('bid-picker')], { pad: 6, scale: 'device' }) }
const cellPic = (w, name, who, iso) => H.pic(w, name, [T(`cell-${who}-${iso}`)], { pad: 40, scale: 'device' })
const bodyText = P => P.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.textContent || '').replace(/\s+/g, ' '))

/** the Inputs form's own Duration buttons (All day · AM · PM · Custom), Custom's two times typed */
async function span(w, m, times = null) {
  await L.press(w, `#inpEditSpan [data-span="${m}"]`); await w.page.waitForTimeout(200)
  if (times) { await w.page.locator('#inpEditStart').fill(times[0]); await w.page.locator('#inpEditEnd').fill(times[1]) }
}
/** a fresh world, signed in as the admin, the clock at 13 Jul 26 for July's demo week (members' today) */
async function freshDesk() { const w = await H.deskFrom(undefined, 1); await L.signInPlain(w, 'admin', '2026-07-13'); return w }
async function freshPhone(engine = 'chromium') { const w = await H.phoneCtx(engine); await L.signInPlain(w, 'admin', '2026-07-13'); return w }

/* ================= d: an admin on a desktop ================= */
if (run('d')) {
  const w = await freshDesk(), P = w.page
  const id = await ids(P)
  const G = id.Gambit, Q = id.Quill, N = id.Nomad, CO = id.Comet, DR = id.Drifter, CB = id.Cobra
  /* fixtures through the Inputs page's own form: an Other under Unavailable, two halves of different kinds, a medical with hours */
  await H.fileInput(w, { who: 'Comet', type: 'Other', from: '2026-07-21', remarks: 'Station board', goes: 'u', tag: 'fx-oth', oil: 'no' })
  await H.fileInput(w, { who: 'Drifter', type: 'LL', from: '2026-07-21', remarks: 'Dentist run', beforeSave: () => span(w, 'am'), tag: 'fx-am', oil: 'no' })
  await H.fileInput(w, { who: 'Drifter', type: 'OML', from: '2026-07-21', remarks: 'Medically down', beforeSave: () => span(w, 'pm'), tag: 'fx-pm', oil: 'no' })
  await H.fileInput(w, { who: 'Hex', type: 'LL', from: '2026-07-20', remarks: 'School run', beforeSave: () => span(w, 'am'), tag: 'fx-mixam', oil: 'no' })
  await H.fileInput(w, { who: 'Hex', type: 'Other', from: '2026-07-20', remarks: 'Station board', goes: 'u', times: ['13:00', '17:00'], tag: 'fx-mixpm', oil: 'no' })   // an OD takes no half (D1350): an afternoon Other under Unavailable
  await H.fileInput(w, { who: 'Cobra', type: 'ATT C', from: '2026-07-22', remarks: 'Clinic', beforeSave: () => span(w, 'custom', ['09:00', '14:00']), tag: 'fx-hrs', oil: 'no' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)

  /* D1 his own case: Gambit's whole-day OML (23 Jul) */
  await L.openCellR(w, G, '2026-07-23')
  let s = await sheetOf(P), ls = await lines(P)
  rec('D1-open', 'desk', s === 'bid-picker' && ls.length === 1 && /OML/.test(ls[0]) && /Whole day/.test(ls[0]) && /change it on the Inputs page/.test(ls[0]),
    `opened ${s}; line: ${ls.join(' | ')}`, [await winPic(w, 'd1-gambit-oml')])
  rec('D1-buttons', 'desk', !(await has(P, 'bid-leave-grid')) && await has(P, 'bid-oil') && await has(P, 'bid-file-CSE') && await has(P, 'bid-file-OD') && await has(P, 'bid-more')
    && !(await has(P, 'decide-approve')) && !(await has(P, 'bid-clear')) && !(await has(P, 'decide-shift')),
    `leave grid ${await has(P, 'bid-leave-grid')}, Grant OIL ${await has(P, 'bid-oil')}, Approve ${await has(P, 'decide-approve')}, Delete ${await has(P, 'bid-clear')}, Move ${await has(P, 'decide-shift')}`)
  /* D2 Grant OIL through the window's own controls: half a day, a reason */
  await L.press(w, `${T('bid-picker')} ${T('bid-oil')}`); await P.waitForTimeout(300)
  await P.locator(T('oil-why')).fill('Recall on medical'); await L.press(w, T('oil-pick-ho')); await P.waitForTimeout(150)
  const giveWords = await L.txt(P, T('oil-give'))
  await L.press(w, T('oil-give')); await P.waitForTimeout(700)
  const after = await L.cellInfo(P, G, '2026-07-23')
  rec('D2-grant', 'desk', (await sheetOf(P)) === null && /HO/.test(after?.text || '') && /OML/.test(after?.text || ''),
    `pressed "${giveWords}"; window ${await sheetOf(P) ?? 'closed'}; cell now ${after?.text}`, [await cellPic(w, 'd2-gambit-after-grant', G, '2026-07-23')])
  /* D3 reopened: OML + an award is a day the war wrote on too — the day's list, each entry with its own buttons */
  await L.openCellR(w, G, '2026-07-23')
  s = await sheetOf(P)
  rec('D3-reopen', 'desk', s === 'daylist-sheet', `reopened with the award: ${s}`, [await H.pic(w, 'd3-gambit-reopen', [T(s || 'x')], { pad: 6, scale: 'device' })])
  await close(w)
  /* D4 Undo takes the award back; the window comes again */
  await L.press(w, '#undoBtn'); await P.waitForTimeout(600)
  const undone = await L.cellInfo(P, G, '2026-07-23')
  await L.openCellR(w, G, '2026-07-23'); s = await sheetOf(P)
  rec('D4-undo', 'desk', !/HO/.test(undone?.text || '') && s === 'bid-picker', `after Undo the cell reads ${undone?.text}; a tap opens ${s}`)
  /* D5 Pick a range from the held day across two free days: the leave buttons come back; LL lands on the free days only */
  await L.press(w, `${T('bid-picker')} ${T('span-range')}`); await P.waitForTimeout(300)
  await L.press(w, T('span-day-2026-07-25')); await P.waitForTimeout(300)
  const gridBack = await has(P, 'bid-leave-grid')
  if (gridBack) { await L.press(w, `${T('bid-picker')} ${T('bid-LL')}`); await P.waitForTimeout(700) }
  const note = await L.txt(P, T('span-note'))
  const c24 = await L.cellInfo(P, G, '2026-07-24'), c23 = await L.cellInfo(P, G, '2026-07-23')
  rec('D5-range', 'desk', gridBack && /LL/.test(c24?.text || '') && !/LL/.test(c23?.text || ''),
    `leave grid back with the range: ${gridBack}; note "${note ?? ''}"; 24 Jul ${c24?.text}; 23 Jul ${c23?.text}`, [await H.pic(w, 'd5-range-note', [T('bid-picker'), T(`cell-${G}-2026-07-23`)], { pad: 6, scale: 'device' })])
  await close(w)
  await L.press(w, '#undoBtn'); await P.waitForTimeout(600)
  /* D6 an Inputs-filed whole day of leave: Quill's LL (14 Jul) — no Approve, the Remarks box empty for something new */
  await L.openCellR(w, Q, '2026-07-14')
  ls = await lines(P)
  const rmk = await P.evaluate(() => document.querySelector('[data-testid="bid-picker"] [data-testid="bid-remarks"]')?.value ?? null)
  rec('D6-leave', 'desk', (await sheetOf(P)) === 'bid-picker' && /LL/.test(ls[0] || '') && !(await has(P, 'decide-approve')) && !(await has(P, 'bid-leave-grid')) && rmk === '',
    `line: ${ls.join(' | ')}; Remarks box "${rmk}"`, [await winPic(w, 'd6-quill-ll')])
  await close(w)
  /* D7 an overseas duty: Nomad (15 Jul) — the leave buttons stay; LL pressed lands beside the OD */
  await L.openCellR(w, N, '2026-07-15')
  ls = await lines(P)
  const grid7 = await has(P, 'bid-leave-grid')
  rec('D7-od', 'desk', (await sheetOf(P)) === 'bid-picker' && /OD/.test(ls[0] || '') && grid7, `line: ${ls.join(' | ')}; leave buttons ${grid7}`, [await winPic(w, 'd7-nomad-od')])
  if (grid7) { await L.press(w, `${T('bid-picker')} ${T('bid-LL')}`); await P.waitForTimeout(700) }
  const c7 = await L.cellInfo(P, N, '2026-07-15')
  rec('D7-leave-over-od', 'desk', /LL/.test(c7?.text || '') && /OD/.test(c7?.text || ''), `cell now ${c7?.text}; window ${await sheetOf(P) ?? 'closed'}`, [await cellPic(w, 'd7-nomad-after', N, '2026-07-15')])
  await close(w); await L.press(w, '#undoBtn'); await P.waitForTimeout(600)
  /* D8 a whole-day Other under Unavailable (Comet, 21 Jul) */
  await L.openCellR(w, CO, '2026-07-21')
  ls = await lines(P)
  rec('D8-other', 'desk', (await sheetOf(P)) === 'bid-picker' && /OTH/.test(ls[0] || '') && /Station board/.test(ls[0] || '') && await has(P, 'bid-leave-grid'),
    `opened ${await sheetOf(P)}; line: ${ls.join(' | ')}`, [await winPic(w, 'd8-comet-other')])
  await close(w)
  /* D9 two halves of different kinds (Drifter, 21 Jul): a line each, AM then PM, no leave buttons */
  await L.openCellR(w, DR, '2026-07-21')
  ls = await lines(P)
  rec('D9-halves', 'desk', (await sheetOf(P)) === 'bid-picker' && ls.length === 2 && /LL/.test(ls[0]) && /OML/.test(ls[1]) && !(await has(P, 'bid-leave-grid')),
    `opened ${await sheetOf(P)}; lines: ${ls.join(' | ')}`, [await winPic(w, 'd9-drifter-halves')])
  /* D10 the page behind the window pressed (§7.11 lesson 4): another man's cell — what lights matches the window */
  await L.press(w, T(`cell-${N}-2026-07-16`)); await P.waitForTimeout(500)
  const title = (await L.txt(P, `${T('bid-picker')} .bidsheet-hd`)) || ''
  const marked = await P.evaluate(() => [...document.querySelectorAll('td.selcell')].map(e => e.getAttribute('data-testid')))
  /* the window closes on a press outside it (the app's popup rule, as on every bid window) — and nothing stays lit */
  rec('D10-behind', 'desk', !title && marked.length === 0,
    `window ${title ? 'still open: ' + title : 'closed'}; cyan marks left on ${marked.join(', ') || 'nothing'}`, [await H.pic(w, 'd10-behind', [T('bid-picker')], { pad: 6, scale: 'device' })])
  await close(w)
  /* D11 a medical with hours (Cobra ATT C 09:00–14:00, 22 Jul): its hours in the line, no leave buttons */
  await L.openCellR(w, CB, '2026-07-22')
  ls = await lines(P)
  rec('D11-hours', 'desk', (await sheetOf(P)) === 'bid-picker' && /09:00–14:00/.test(ls[0] || '') && !(await has(P, 'bid-leave-grid')),
    `line: ${ls.join(' | ')}`, [await winPic(w, 'd11-cobra-hours')])
  await close(w)
  /* D12 file an OD from the window over the medical (the ⋯'s neighbour), then Undo — one Undo takes it back */
  await L.openCellR(w, G, '2026-07-23')
  await L.press(w, `${T('bid-picker')} ${T('bid-file-OD')}`); await P.waitForTimeout(900)
  const ask = await P.evaluate(() => !!document.querySelector('[data-testid="oilconf"]'))
  if (ask) { await P.keyboard.press('Escape'); await P.waitForTimeout(300) }
  const c12 = await L.cellInfo(P, G, '2026-07-23')
  await L.press(w, '#undoBtn'); await P.waitForTimeout(700)
  const c12u = await L.cellInfo(P, G, '2026-07-23')
  rec('D12-file-od', 'desk', /OD/.test(c12?.text || '') && !/OD/.test(c12u?.text || ''), `after OD: ${c12?.text}; after Undo: ${c12u?.text}${ask ? ' (OIL asked, put away)' : ''}`)
  /* D13 the scenario designer's 1: Hex's morning LL beside an afternoon Other under Unavailable (20 Jul) — Whole day greyed, PM lit, OL lands there */
  const HX = id.Hex
  await L.openCellR(w, HX, '2026-07-20')
  ls = await lines(P)
  const fullOff = await P.evaluate(() => document.querySelector('[data-testid="bid-picker"] [data-testid="portion-full"]')?.disabled ?? null)
  const pmLit = await P.evaluate(() => document.querySelector('[data-testid="bid-picker"] [data-testid="portion-pm"]')?.getAttribute('aria-pressed'))
  const pic13 = await winPic(w, 'd13-hex-mixed')
  /* his OIL (0.5 left — his OL is below zero, whose first press only asks first, the existing below-zero confirm) */
  if (await has(P, 'bid-OIL')) { await L.press(w, `${T('bid-picker')} ${T('bid-OIL')}`); await P.waitForTimeout(700) }
  const c13 = await L.cellInfo(P, HX, '2026-07-20')
  /* the record, not the box: the OL and the Other share the afternoon, so the cell draws two boxes and a corner mark */
  const ol13 = await P.evaluate(hx => (window.INPUTS || []).filter(r => (r.person === hx || (r.people || []).some(x => x.p === hx)) && /Jul 20/.test(String(r.date)) && !/^(LL|Other)$/.test(String(r.type))).map(r => `${r.type} ${r.allday ? 'all day' : `${r.s}-${r.e}`}${r.lw ? ' (approved on the war)' : ''}`), HX)
  rec('D13-mixed', 'desk', ls.length === 2 && fullOff === true && pmLit === 'true' && ol13.length === 1,
    `lines ${ls.join(' | ')}; Whole day greyed ${fullOff}; PM lit ${pmLit}; OIL saved: ${ol13.join(', ') || 'none'}; cell draws ${c13?.text}`, [pic13, await cellPic(w, 'd13-hex-after', HX, '2026-07-20')])
  await close(w); await L.press(w, '#undoBtn'); await P.waitForTimeout(600)
  rec('D-errors', 'desk', !w.errs.length, w.errs.slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}

/* ================= p: an admin on an iPhone (Chromium touch, then WebKit) ================= */
if (run('p')) {
  for (const engine of ['chromium', 'webkit']) {
    const w = await freshPhone(engine), P = w.page
    const G = (await ids(P)).Gambit
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
    await L.reachCell(w, G, '2026-07-23')
    await L.press(w, T(`cell-${G}-2026-07-23`), engine === 'chromium' ? 'p1-quick' : null); await P.waitForTimeout(700)
    const s = await sheetOf(P), ls = await lines(P)
    /* D1290: the day tapped stands in view above the window */
    const geo = await P.evaluate(id => { const c = document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect(); const s = document.querySelector('[data-testid="bid-picker"]')?.getBoundingClientRect(); return c && s ? { cellBottom: Math.round(c.bottom), cellTop: Math.round(c.top), winTop: Math.round(s.top), winBottom: Math.round(s.bottom), h: innerHeight } : null }, `cell-${G}-2026-07-23`)
    const shot = await P.screenshot({ path: `${H.OUT}/p1-${engine}-gambit-oml.png`, scale: 'device' }).then(() => `p1-${engine}-gambit-oml.png`)
    rec('P1-open', engine, s === 'bid-picker' && ls.length === 1 && /OML/.test(ls[0]) && !(await has(P, 'bid-leave-grid')) && await has(P, 'bid-oil'),
      `opened ${s}; line ${ls.join(' | ')}`, [shot])
    /* the designer's 21 (§7.11 lesson 17): Pick a range on and off brings the leave buttons in and out — the window stays on screen */
    const fits = () => P.evaluate(() => { const r = document.querySelector('[data-testid="bid-picker"]')?.getBoundingClientRect(); return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), h: innerHeight, wide: document.documentElement.scrollWidth <= innerWidth } : null })
    await L.press(w, `${T('bid-picker')} ${T('span-range')}`); await P.waitForTimeout(400)
    const on = await fits(); const gridOn = await has(P, 'bid-leave-grid')
    await P.screenshot({ path: `${H.OUT}/p2-${engine}-range-on.png`, scale: 'device' })
    await L.press(w, `${T('bid-picker')} ${T('span-range')}`); await P.waitForTimeout(400)
    const off = await fits()
    rec('P2-range-onoff', engine, !!on && !!off && on.top >= 0 && on.bottom <= on.h && off.top >= 0 && off.bottom <= off.h && on.wide && off.wide,
      `range on: window ${on?.top}–${on?.bottom} of ${on?.h}, leave buttons ${gridOn}; back off: ${off?.top}–${off?.bottom}; no sideways scroll ${on?.wide && off?.wide}`, [`p2-${engine}-range-on.png`])
    rec('P1-in-view', engine, !!geo && geo.cellTop >= 0 && geo.cellBottom <= geo.winTop && geo.winBottom <= geo.h, `cell ${geo?.cellTop}–${geo?.cellBottom}, window ${geo?.winTop}–${geo?.winBottom} of ${geo?.h}`)
    rec('P-errors', engine, !w.errs.length, w.errs.slice(0, 4).join(' | ') || 'none')
    await w.ctx.close()
  }
}

/* ================= m: a member — his own leave on an open day, on a closed day, another man's day ================= */
if (run('m')) {
  const w = await freshPhone(), P = w.page
  const id = await ids(P), me = id.Ranger, G = id.Gambit
  /* July opened for bidding by the admin, through the "Open for bidding" window (his today is 13 Jul: open from today) */
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900); await P.evaluate(() => window.scrollTo(0, 0))
  await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
  if ((await P.locator(T('od-month-2026-07')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-07')); await P.waitForTimeout(500) }
  await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
  /* his leave on 28 Jul (open) and 8 Jul (before his today, so closed — D1211), filed on the Inputs page's form, whose calendar opens on July */
  await H.fileInput(w, { who: 'Ranger', type: 'LL', from: '2026-07-28', remarks: 'Family wedding', tag: 'm-open', oil: 'no' })
  await H.fileInput(w, { who: 'Ranger', type: 'LL', from: '2026-07-08', remarks: 'Closed day leave', tag: 'm-closed', oil: 'no' })
  await L.signInPlain(w, 'member', '2026-07-13')
  /* M1 his own leave on an open day: the window, his words in the box, no Grant OIL, CSE · OD · ⋯ (Attach) */
  await L.openCellR(w, me, '2026-07-28', 'm1-quick'); await P.waitForTimeout(500)
  let s = await sheetOf(P), ls = await lines(P)
  const box = await P.evaluate(() => document.querySelector('[data-testid="bid-picker"] [data-testid="bid-remarks"]')?.value ?? null)
  rec('M1-open', 'phone', s === 'bid-picker' && ls.length === 1 && !/Family wedding/.test(ls[0]) && box === 'Family wedding' && !(await has(P, 'bid-oil')) && await has(P, 'bid-file-CSE') && !(await has(P, 'bid-leave-grid')),
    `opened ${s}; line ${ls.join(' | ')}; box "${box}"; Grant OIL ${await has(P, 'bid-oil')}`, [await winPic(w, 'm1-ranger-open')])
  /* M2 his words changed in the window are saved onto his leave on the Inputs page */
  await P.locator(`${T('bid-picker')} ${T('bid-remarks')}`).evaluate((e, v) => { const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set ?? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }, 'Family wedding, Penang')
  await P.locator(`${T('bid-picker')} ${T('bid-remarks')}`).evaluate(e => e.blur()); await P.waitForTimeout(500)
  await close(w)
  const saved = await P.evaluate(() => (window.INPUTS || []).filter(r => /Family wedding/.test(String(r.remarks))).map(r => r.remarks))
  rec('M2-words', 'phone', saved.some(r => /Penang/.test(r)), `his leave's remarks now: ${saved.join(' | ')}`)
  /* M3 the ⋯ holds Attach alone for him */
  await L.openCellR(w, me, '2026-07-28'); await P.waitForTimeout(400)
  await L.press(w, `${T('bid-picker')} ${T('bid-more')}`); await P.waitForTimeout(300)
  const menu = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [role="menu"] button, [data-testid="bid-more-menu"] button')].map(b => b.textContent.trim()))
  rec('M3-more', 'phone', menu.length === 1 && /Attach/.test(menu[0]), `the ⋯ holds: ${menu.join(', ')}`, [await winPic(w, 'm3-ranger-more')])
  await close(w); await close(w)
  /* M4 his own leave on a closed day: his remarks window, as before */
  await L.openCellR(w, me, '2026-07-08'); await P.waitForTimeout(400)
  s = await sheetOf(P)
  rec('M4-closed', 'phone', s === 'remarks-sheet', `opened ${s}`, [await H.pic(w, 'm4-ranger-closed', [T(s || 'x')], { pad: 6, scale: 'device' })])
  await close(w)
  /* M5 another man's held day (Gambit's OML): read only, never this window */
  await L.openCellR(w, G, '2026-07-23'); await P.waitForTimeout(400)
  s = await sheetOf(P)
  rec('M5-other-man', 'phone', s !== 'bid-picker', `opened ${s}`, s ? [await H.pic(w, 'm5-gambit-as-member', [T(s)], { pad: 6, scale: 'device' })] : [])
  rec('M-errors', 'phone', !w.errs.length, w.errs.slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}

/* ================= k: the keyboard — the window opened by a click, used and closed by keys ================= */
if (run('k')) {
  const w = await freshDesk(), P = w.page
  const G = (await ids(P)).Gambit
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.openCellR(w, G, '2026-07-23')
  const focusIn = await P.evaluate(() => !!document.activeElement?.closest('[data-testid="bid-picker"]'))
  const tabs = []
  for (let i = 0; i < 12; i++) { await P.keyboard.press('Tab'); tabs.push(await P.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName)) }
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  /* the same window on an ordinary free day, for comparison: where focus stands when a click opens it is the window's own */
  await L.openCellR(w, G, '2026-07-27')
  const focusFree = await P.evaluate(() => !!document.activeElement?.closest('[data-testid="bid-picker"]'))
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  rec('K1-keys', 'desk', focusIn === focusFree && tabs.includes('bid-oil') && (await sheetOf(P)) === null,
    `focus in the window on open: held day ${focusIn}, a free day ${focusFree} (the same); Tab reaches ${tabs.join(' → ')}; Escape closes it`)
  await w.ctx.close()
}

fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify(recs, null, 1))
console.log(`\n${recs.filter(r => r.verdict === 'PASS').length}/${recs.length} PASS`)
await H.closeBrowser()
