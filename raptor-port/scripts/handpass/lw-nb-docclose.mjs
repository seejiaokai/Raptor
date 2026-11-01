// His find on his iPhone, 2 Nov 26 — "When I press close. The window behind closes first then the document page closes on a
// 2nd tap." The document viewer opened from a Leave War window: one tap on its Close (its ✕, its own dark surround, Escape)
// must close the viewer ONLY, the window behind it left open as it was. Walked at every place the app opens the viewer over
// a window (the roll-call in the night's sheet, his find's section), on a desktop (1536, Chromium) and an iPhone (402,
// Chromium touch and WebKit), as the admin and as a member. Written as the RIGHT behaviour (a PASS means correct); run on
// the build before the fix, the phone rows fail. Fixtures through the app's own controls (§7.7), the seed's own document on
// Gambit's OML of 23 Jul (the day in his picture).
// Run from raptor-port: LW_PORT=<a served build> LW_OUT=2026-11-01-lw-next-batch/docclose node scripts/handpass/lw-nb-docclose.mjs
//   (PART=d,p,m for some; ENGINES=chromium,webkit)
process.env.LW_PORT ||= '4173'
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/docclose'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
for (const f of fs.readdirSync(H.OUT)) if (f.endsWith('.png')) fs.unlinkSync(`${H.OUT}/${f}`)
const parts = (process.env.PART || 'd,p,m').split(',')
const engines = (process.env.ENGINES || 'chromium,webkit').split(',')
console.log('[lw-nb-docclose v1] →', H.OUT, parts.join(' '), engines.join(' '), 'bundle on', process.env.LW_PORT)
const recs = []
/* the viewer hands back its file's address when it closes (ui/DocViewer.tsx revokes it), so a picture or frame still loading
   is cut off: the browser lists that as a failed request. Not a fault; every other error counts */
const real = errs => errs.filter(e => !/requestfailed: blob:/.test(e))
const rec = (id, size, ok, said, pics = []) => { recs.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
const ids = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
const viewerUp = P => P.evaluate(() => { const v = document.getElementById('docViewPop'); return !!v && !v.hidden && v.getBoundingClientRect().width > 0 })
const up = (P, sel) => P.evaluate(sel => { const e = document.querySelector(sel); return !!e && e.getBoundingClientRect().width > 0 && !e.closest('[hidden]') }, sel)
const shot = async (w, name) => { await w.page.screenshot({ path: `${H.OUT}/${name}.png`, scale: 'css' }); return name + '.png' }
/* a press the person makes: a finger on a phone (a picture taken right after the tap, D1281), the mouse on a desktop */
const tap = async (w, sel, name) => { await L.press(w, sel, w.phone && name ? name + '-q' : null); await w.page.waitForTimeout(450) }
/* a tap on the viewer's own dark surround, beside its box (near the top of the screen, clear of the box) */
const tapSurround = async (w, name) => {
  const b = await w.page.locator('#docViewPop .airpop-box').boundingBox()
  const x = 8, y = Math.max(6, Math.round(b.y / 2))
  if (w.phone) await L.finger(w, x, y, 0, name + '-q'); else await w.page.mouse.click(x, y)
  await w.page.waitForTimeout(450)
}
/* open the viewer from `opener`, close it by `how`, and read: the viewer gone at once, the window behind (`behind`) still up */
async function check(w, id, opener, behind, how, tag) {
  const P = w.page, size = w.phone ? `phone/${w.engine}` : `desk ${w.page.viewportSize().width}/${w.engine}`
  if (!(await up(P, opener))) { rec(id, size, false, `NOT WALKED — nothing to open the viewer at ${opener}`, [await shot(w, `${tag}-no-opener`)]); return }
  await tap(w, opener, `${tag}-open`)
  const opened = await viewerUp(P)
  const p1 = await shot(w, `${tag}-1-viewer-open`)
  if (!opened) { rec(id, size, false, 'the viewer did not open', [p1]); return }
  if (how === 'Close') await tap(w, '#docViewDone', `${tag}-2-close`)
  else if (how === '✕') await tap(w, '#docViewClose', `${tag}-2-x`)
  else if (how === 'surround') await tapSurround(w, `${tag}-2-surround`)
  else { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
  const v = await viewerUp(P), b = await up(P, behind)
  const p2 = await shot(w, `${tag}-3-after-one-${how === '✕' ? 'x' : how.toLowerCase()}`)
  rec(id, size, !v && b, `one ${how}: viewer ${v ? 'STILL OPEN' : 'closed'}; the window behind ${b ? 'still open' : 'CLOSED'}`, [p1, ...(w.phone ? [`${tag}-2-${how === '✕' ? 'x' : how === 'Close' ? 'close' : how}-q.png`] : []), p2])
  if (v) { await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300) }
}
/* the Leave War's open window, if any, put away (Escape peels the topmost) */
const putAway = async w => { for (let i = 0; i < 3; i++) { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(250) } }
const HELD = '[data-testid="bid-picker"] .docchip'

/* section 1 — the admin, members' today 13 Jul 26: Gambit's whole-day OML (the seed's own document — his picture), Comet's
   morning Other filed with a document (the held half's line), and the Inputs page's input window */
async function section1(w, tagPre) {
  const P = w.page
  await L.signInPlain(w, 'admin', '2026-07-13')
  const id = await ids(P)
  await H.fileInput(w, { who: 'Comet', type: 'Other', from: '2026-07-21', to: '2026-07-22', remarks: 'Station board', goes: 'u', times: ['07:00', '12:00'], beforeSave: () => L.setDoc(w, '[data-testid="win-inputedit"]', 'board.pdf'), tag: 'dc-oth', oil: 'no' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  const hows = w.phone ? ['Close', '✕', 'surround'] : ['Close', '✕', 'surround', 'Escape']
  for (const how of hows) {
    await L.openCellR(w, id.Gambit, '2026-07-23'); await P.waitForTimeout(300)
    await check(w, `R1 the bid window, a whole day held (Gambit's OML 23 Jul) — ${how}`, HELD, '[data-testid="bid-picker"]', how, `${tagPre}-r1-${how === '✕' ? 'x' : how.toLowerCase()}`)
    await putAway(w)
  }
  await L.openCellR(w, id.Comet, '2026-07-21'); await P.waitForTimeout(300)
  await check(w, 'R2 the bid window, the held half’s line (Comet’s morning Other 21 Jul) — Close', '[data-testid="bid-picker"] [data-testid="bid-heldhalf"] .docchip', '[data-testid="bid-picker"]', 'Close', `${tagPre}-r2`)
  await putAway(w)
  /* the Inputs page's input window: Gambit's OML opened from the list, its paperclip */
  const iid = await P.evaluate(() => (window.INPUTS || []).find(r => r.person === 'bruise' && r.type === 'OML' && r.date === 'Jul 23')?.iid)
  await H.openInputBy(w, iid, 'list')
  /* (the window is a movable window on a desktop and the phone's own shape there: `#inpEditPop` stands in both, visible) */
  await check(w, 'R8 the Inputs page’s input window, its paperclip — Close', '#inpEditPop button[aria-label="View the document"]', '#inpEditPop', 'Close', `${tagPre}-r8`)
  await putAway(w)
  /* R9 the RAISED bid window (the fresh read's finding 1): with a window that leaves the grid working up — the person window —
     a bid window opens raised over it (Sheet.tsx `over`), at 481, and the viewer it opens was drawn at 460, UNDER it. Asked:
     is the viewer's Close the thing under the finger, and does one press close the viewer only */
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  await L.reachCell(w, id.Gambit, '2026-07-23')   // July in view first: the month strip may stand under the window once it is up
  await L.press(w, `[data-testid="row-${id.Gambit}"] .whoedit`); await P.waitForTimeout(800)
  const pwUp = await up(P, '[data-testid="person-window"]')
  /* (on a phone the person window may stand over the day: then the day cannot be pressed with it up, and nothing is raised) */
  const reach = await P.evaluate(sel => { const c = document.querySelector(sel); if (!c) return 'no cell drawn'; c.scrollIntoView({ block: 'center', inline: 'center' }); const r = c.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && (e === c || c.contains(e)) ? 'ok' : `covered by ${e?.closest('[data-testid]')?.getAttribute('data-testid') || e?.tagName}` }, `[data-testid="cell-${id.Gambit}-2026-07-23"]`).catch(e => String(e))
  if (reach !== 'ok') { rec('R9 a raised bid window', w.phone ? `phone/${w.engine}` : `desk ${w.page.viewportSize().width}/${w.engine}`, true, `not reachable here — Gambit's 23 Jul ${reach} with the person window up (person window up ${pwUp}); nothing can be raised`, [await shot(w, `${tagPre}-r9-unreachable`)]); await putAway(w); return }
  await L.openCellR(w, id.Gambit, '2026-07-23'); await P.waitForTimeout(400)
  const raised = await P.evaluate(() => !!document.querySelector('[data-testid="bid-picker"].raised'))
  if (await up(P, HELD)) {
    await tap(w, HELD, `${tagPre}-r9-open`)
    const onTop = await P.evaluate(() => { const b = document.getElementById('docViewDone'); if (!b) return 'no Close'; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e === b || b.contains(e) ? 'the Close' : (e?.closest('[data-testid]')?.getAttribute('data-testid') || e?.className || e?.tagName) })
    const p1 = await shot(w, `${tagPre}-r9-1-viewer-over-raised`)
    rec('R9a a raised bid window (person window up): the viewer’s Close is on top', w.phone ? `phone/${w.engine}` : `desk ${w.page.viewportSize().width}/${w.engine}`, onTop === 'the Close', `person window up ${pwUp}; bid window raised ${raised}; under the Close's middle: ${onTop}`, [p1])
    await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
    await check(w, 'R9b a raised bid window (person window up), its held line’s chip — Close', HELD, '[data-testid="bid-picker"]', 'Close', `${tagPre}-r9`)
  } else rec('R9 a raised bid window', w.phone ? `phone/${w.engine}` : `desk ${w.page.viewportSize().width}/${w.engine}`, false, `NOT WALKED — no chip (person window up ${pwUp}; raised ${raised}; sheet ${await up(P, '[data-testid="bid-picker"]')})`, [await shot(w, `${tagPre}-r9-none`)])
  await putAway(w)
}

/* section 2 — the admin, members' today 25 Jan 26: a pending LL with a document placed on Ranger's 7 Apr through the bid
   window's own Document row; then the bid window reopened on it, his person window's paperclip, and Approvals' paperclip */
async function section2(w, tagPre) {
  const P = w.page
  await L.signInPlain(w, 'admin', '2026-01-25')
  const me = 'bane'
  await L.openCellR(w, me, '2026-04-07'); await P.waitForTimeout(400)
  const tick = P.locator(T('bid-approve-tick')).first()
  if (await tick.count()) { const on = (await tick.getAttribute('aria-checked')) === 'true' || (await tick.getAttribute('aria-pressed')) === 'true'; if (on) { await L.press(w, T('bid-approve-tick')); await P.waitForTimeout(300) } }
  await L.setDoc(w, '[data-testid="bid-picker"]', 'leave-note.pdf')
  await L.placeLeave(w, 'LL'); await P.waitForTimeout(500); await putAway(w)
  /* (the bid window reopened on it shows the file in its own Document row — an EDITABLE chip, which opens nothing yet: D1292's
     other half, filed; so it is no place the viewer opens from today) */
  await L.press(w, `[data-testid="row-${me}"] .whoedit`); await P.waitForTimeout(800)
  await check(w, 'R5 the person window, a leave line’s paperclip — Close', '[data-testid="person-window"] [data-testid^="pw-clip-"]', '[data-testid="person-window"]', 'Close', `${tagPre}-r5`)
  await putAway(w)
  await L.press(w, T('lw-tab-approvals')); await P.waitForTimeout(900)
  await check(w, 'R7 Approvals, a request’s paperclip — Close (a page, not a window: the page stays)', '[data-testid="appr-clip"]', '[data-testid="approvals-page"]', 'Close', `${tagPre}-r7`)
  return me
}

if (parts.includes('d')) {
  const w = await H.deskCtx()
  await section1(w, 'd')
  await w.ctx.close()
  const w2 = await H.deskCtx()
  await section2(w2, 'd')
  rec('D-errors', 'desk 1536', !real(w.errs).length && !real(w2.errs).length, [...real(w.errs), ...real(w2.errs)].slice(0, 4).join(' | ') || 'none')
  await w2.ctx.close()
}
/* k: section 1 in WebKit at a desktop's size (1440) — the raised window's R9, which a phone cannot reach with the person
   window up, measured in the iPhone's engine too (the pop-ups' lift is a `:has` rule) */
if (parts.includes('k')) {
  const w = await L.newCtx('desk', 'webkit')
  await section1(w, 'k-webkit')
  rec('K-errors', 'desk/webkit', !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}
if (parts.includes('p')) {
  for (const engine of engines) {
    const w = await H.phoneCtx(engine)
    await section1(w, `p-${engine}`)
    await w.ctx.close()
    const w2 = await H.phoneCtx(engine)
    await section2(w2, `p-${engine}`)
    rec('P-errors', `phone/${engine}`, !real(w.errs).length && !real(w2.errs).length, [...real(w.errs), ...real(w2.errs)].slice(0, 4).join(' | ') || 'none')
    await w2.ctx.close()
  }
}
/* section 3 — a member (Ranger) on his iPhone: his own day's bid window and his own person window, after the admin placed the
   pending LL with its document (section 2's fixture, made again in this world) */
if (parts.includes('m')) {
  for (const engine of engines) {
    const w = await H.phoneCtx(engine), P = w.page
    /* the fixtures, by the admin: Comet's morning Other with a document (a commitment on ANOTHER man's day: a member's tap
       there opens the day's list, D1356), and the pending LL with a document on Ranger's own 7 Apr */
    await L.signInPlain(w, 'admin', '2026-07-13')
    await H.fileInput(w, { who: 'Comet', type: 'Other', from: '2026-07-21', to: '2026-07-22', remarks: 'Station board', goes: 'u', times: ['07:00', '12:00'], beforeSave: () => L.setDoc(w, '[data-testid="win-inputedit"]', 'board.pdf'), tag: 'dc-m-oth', oil: 'no' })
    await section2(w, `m-setup-${engine}`)
    await L.signInPlain(w, 'member', '2026-01-25')
    await L.openCellR(w, 'beams', '2026-07-21'); await P.waitForTimeout(400)
    await check(w, 'M1 the day’s list (a member on Comet’s morning Other), its document chip — Close', '[data-testid="daylist-sheet"] .docchip', '[data-testid="daylist-sheet"]', 'Close', `m-${engine}-m1`)
    await putAway(w)
    await L.press(w, `[data-testid="row-bane"] .whoedit`); await P.waitForTimeout(800)
    await check(w, 'M2 the member’s own person window, the paperclip — Close', '[data-testid="person-window"] [data-testid^="pw-clip-"]', '[data-testid="person-window"]', 'Close', `m-${engine}-m2`)
    rec('M-errors', `phone/${engine}`, !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
    await w.ctx.close()
  }
}
fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify(recs, null, 1))
console.log(`\n${recs.filter(r => r.verdict === 'PASS').length}/${recs.length} PASS`)
await H.closeBrowser()
