// Chat 208 — [LW-POSTIN-BALANCE] walker A: the DESKTOP (1536 x 860 at 1.25, his PC), admin and member.
// Written as assertions of the RIGHT behaviour (his rulings D2745–D2747, D2749/D2812, D2810, D1541): PASS means correct.
// Each scenario runs in a FRESH browser context (a clean saved world), on real storage, the war's today pinned to 26 Nov 26.
// Serves nothing: points at the build already served on PORT (4757). Run from raptor-port/:
//   node scripts/handpass/lw-postin-build-a.mjs            (every scenario; empties the a/ folder first)
//   ONLY=s3 node scripts/handpass/lw-postin-build-a.mjs    (one scenario, into a/only-s3/)
const ONLY = process.env.ONLY || ''
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-27-lw-postin-build/a' + (ONLY ? `/only-${ONLY}` : '')
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, vis, shot } = L
console.log('[lw-postin-build-a v5]', ONLY ? `ONLY=${ONLY}` : 'all scenarios')
if (!ONLY) L.clearOut()
const log = (...a) => console.log(...a)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rec = (id, verdict, said, pics = []) => L.rec(id, 'desk', verdict, said, pics)

/* ---------------------------------------------------------------- helpers ---------------------------------------------- */
async function signInAs(w, user, pass, rowId) {
  const P = w.page
  await P.goto(L.PLAIN); await P.waitForSelector('#luser')
  await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), L.LW_TODAY)
  await P.fill('#luser', user); await P.fill('#lpass', pass)
  await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), L.LW_TODAY)
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector(`[data-testid="row-${rowId}"], ${T('balances-page')}, ${T('lw-tab-grid')}`, { state: 'attached', timeout: 20000 })
  await P.waitForTimeout(800)
}
const goWar = async w => { await w.page.evaluate(() => window.go('leavewar')); await w.page.waitForSelector(T('lw-tab-grid'), { state: 'attached', timeout: 15000 }); await w.page.waitForTimeout(600) }
async function openBalances(w) { await goWar(w); await press(w, T('lw-tab-balances')); await w.page.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await w.page.waitForTimeout(500) }
async function openGrid(w) { await goWar(w); await press(w, T('lw-tab-grid')); await w.page.waitForTimeout(700) }
async function openApprovals(w) { await goWar(w); await press(w, T('lw-tab-approvals')); await w.page.waitForSelector(T('approvals-page'), { state: 'visible' }); await w.page.waitForTimeout(500) }
const pidOf = (w, cs) => w.page.evaluate(cs => { const P = window.PEOPLE || {}; for (const [id, q] of Object.entries(P)) if (q && q.cs === cs) return id; for (const [id, q] of Object.entries(P)) if (q && (q.callsign === cs || q.name === cs)) return id; return null }, cs)

/* the app's one date calendar: open the box, walk the months by its own heading, press the date */
async function pickDate(w, boxSel, iso) {
  const P = w.page
  await press(w, boxSel); await P.waitForSelector(T('dcal-card'), { state: 'visible', timeout: 5000 }); await P.waitForTimeout(250)
  for (let i = 0; i < 30; i++) {
    const d = P.locator(`${T('dcal-card')} [data-iso="${iso}"]`)
    if (await d.count()) { await d.first().click(); await P.waitForTimeout(500); return true }
    const m = await P.locator(`${T('dcal-card')} [data-month]`).first().getAttribute('data-month')
    const dir = m < iso.slice(0, 7) ? 'Next month' : 'Previous month'
    await P.locator(`${T('dcal-card')} button[aria-label="${dir}"]`).first().click(); await P.waitForTimeout(300)
  }
  log('   !! date never reached', iso); return false
}
/* Admin → Users: add a man with a post-in date (and a sign-in when `signin` is given) */
async function addMan(w, cs, ini, postIn, { seat = 'FCP', cat = 'OCU', signin = '' } = {}) {
  const P = w.page
  /* what the add created is named by the difference in ids (walk-scripts §3) — a demo archived man may share the callsign */
  const before = await P.evaluate(() => Object.keys(window.PEOPLE || {}))
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(800)
  if (!(await P.locator('#accAddBlock').count())) { const u = P.locator('.adm-cat', { hasText: 'Users' }).first(); if (await u.count()) { await u.click(); await P.waitForTimeout(500) } }
  await P.locator('#accAddBlock').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', cs); await P.fill('#accAddIni', ini)
  await P.selectOption('#accAddSeat', seat); await P.selectOption('#accAddCat', cat)
  if (signin) await P.fill('#accAddName', signin)
  if (postIn) await pickDate(w, '#accAddPostIn', postIn)
  await P.click('#accAdd'); await P.waitForTimeout(900)
  const fresh = await P.evaluate(b => Object.keys(window.PEOPLE || {}).filter(k => !b.includes(k)), before)
  const pid = fresh.length === 1 ? fresh[0] : null
  if (!pid) { await shot(w, `zz-add-${cs}-failed`); throw new Error(`adding ${cs} made ${fresh.length} new people`) }
  log(`   added ${cs} (${pid}) post-in ${postIn || 'today'}${signin ? ' sign-in ' + signin : ''}`)
  return pid
}
async function typeBox(w, sel, fig) {
  const P = w.page
  await press(w, sel); await P.waitForTimeout(150)
  await P.keyboard.press('Control+A'); await P.keyboard.type(String(fig), { delay: 30 }); await P.keyboard.press('Enter'); await P.waitForTimeout(600)
}
/* the Balances page's row, read from what is drawn (boxes' values; read-only figures' words) */
const balRow = (w, pid) => w.page.evaluate(pid => {
  const v = id => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; return e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim() }
  const nt = id => { const e = document.querySelector(`[data-testid="${id}"]`); return !!e && e.classList.contains('nt') }
  return { off: v(`bal-LVE-${pid}`), cf: v(`bal-cf-${pid}`), pend: v(`bal-pend-${pid}`), war: v(`bal-war-${pid}`), offNt: nt(`bal-LVE-${pid}`) }
}, pid)
async function balShot(w, pid, name) {
  const P = w.page
  const row = P.locator(T(`bal-row-${pid}`)); await row.scrollIntoViewIfNeeded(); await P.waitForTimeout(250)
  const b = await row.boundingBox()
  await P.screenshot({ path: `${L.OUT}/${name}.png`, clip: { x: 0, y: Math.max(0, b.y - 60), width: 1200, height: b.height + 100 } })
  return name
}
/* his person window, opened by his name on the Balances page, read and pictured, then closed */
async function pwRead(w, pid, name) {
  const P = w.page
  await openBalances(w)
  await press(w, T(`bal-name-${pid}`)); await P.waitForSelector(T('person-window'), { state: 'visible', timeout: 8000 }); await P.waitForTimeout(500)
  const r = await P.evaluate(() => {
    const pw = document.querySelector('[data-testid="person-window"]')
    const v = id => { const e = pw.querySelector(`[data-testid="${id}"]`); if (!e) return null; return e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim() }
    const lab = [...pw.querySelectorAll('[data-testid="pw-tile-LVE"] .h')].map(e => e.textContent.trim())
    return { off: v('pw-LVE'), cf: v('pw-LVE-cf'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), taken: v('pw-taken'), line: v('pw-postin'), labels: lab.join('|') }
  })
  if (name) await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/${name}.png` })
  await press(w, T('pw-close')); await P.waitForTimeout(400)
  return r
}
/* the figure beside his name on the grid */
const gridFig = async (w, pid) => { await openGrid(w); return w.page.evaluate(pid => { const e = document.querySelector(`[data-testid="bal-${pid}"]`); return e ? e.innerText.trim().split(/\n+/).map(x => x.trim()).join(' / ') : null }, pid) }
const cellText = (w, pid, iso) => w.page.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null }, `cell-${pid}-${iso}`)

async function setSwitch(w, testid, on) {
  const s = w.page.locator(T(testid)).first()
  if (!(await s.count())) return null
  const now = (await s.getAttribute('aria-checked')) === 'true' || (await s.getAttribute('aria-pressed')) === 'true'
  if (now !== on) { await s.click(); await w.page.waitForTimeout(300) }
  return on
}
/* one day's leave from the one-day window (through the Post in sheet's own door on a day before his post-in).
   opts.approve: the Auto-approve switch; opts.answer: press the same leave again if the below-zero line shows.
   Returns { placed, note } — note: the below-zero line's words if it showed after the FIRST tap */
async function leaveDay(w, pid, iso, code, { approve = true, answer = true, pic = null } = {}) {
  const P = w.page
  await openGrid(w)
  await L.openCell(w, pid, iso)
  await P.waitForSelector(`${T('postin-sheet')}, ${T('bid-picker')}, ${T('postout-sheet')}`, { state: 'visible', timeout: 8000 }).catch(() => null)
  let viaSheet = false
  if (await vis(P, T('postin-sheet'))) { viaSheet = true; if (pic) await shot(w, pic + '-postin-sheet'); await press(w, T('postin-place')); await P.waitForTimeout(500) }
  if (await vis(P, T('postout-sheet'))) { const pl = P.locator(T('postout-place')); if (await pl.count()) { await press(w, T('postout-place')); await P.waitForTimeout(500) } }
  await setSwitch(w, 'bid-approve-tick', approve)
  const left = await P.evaluate(c => { const e = document.querySelector(`[data-testid="bid-${c}-left"]`); return e ? e.textContent.trim() : null }, code)
  await press(w, T(`bid-${code}`)); await P.waitForTimeout(600)
  let note = null
  if (await vis(P, T('bid-picker'))) {
    note = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="span-note"]')].find(x => x.getBoundingClientRect().width > 0); return e ? e.textContent.trim() : null })
    if (pic) await shot(w, pic + '-after-first-tap')
    if (note && answer) { await press(w, T(`bid-${code}`)); await P.waitForTimeout(600) }
  }
  const placed = !(await vis(P, T('bid-picker')))
  if (!placed) await L.closeWin(w)
  log(`   ${code} ${iso} on ${pid}: placed=${placed} viaPostInSheet=${viaSheet} note=${JSON.stringify(note)} left-before=${left}`)
  return { placed, note, viaSheet, left }
}
/* a drag across one row (or two) on the grid: from cell A to cell B, the select window then */
async function dragCells(w, pidA, isoA, pidB, isoB) {
  const P = w.page
  await openGrid(w)
  await L.reachCell(w, pidA, isoA)
  const a = P.locator(T(L.cellId(pidA, isoA))).first(); await a.scrollIntoViewIfNeeded(); await P.waitForTimeout(300)
  const ba = await a.boundingBox(); const bb = await P.locator(T(L.cellId(pidB, isoB))).first().boundingBox()
  if (!ba || !bb) return false
  await P.mouse.move(ba.x + ba.width / 2, ba.y + ba.height / 2); await P.mouse.down()
  await P.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 12 }); await P.mouse.up()
  await P.waitForSelector(T('sel-who'), { state: 'visible', timeout: 5000 }).catch(() => null)
  await P.waitForTimeout(400)
  return await vis(P, T('sel-who'))
}
async function selLeave(w, code, { approve = true, answer = true, pic = null } = {}) {
  const P = w.page
  await setSwitch(w, 'sel-approve-tick', approve)
  await press(w, T(`sel-${code}`)); await P.waitForTimeout(600)
  let note = null
  if (await vis(P, T('sel-who'))) {
    note = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="sel-note"]')].find(x => x.getBoundingClientRect().width > 0); return e ? e.textContent.trim() : null })
    if (pic) await shot(w, pic)
    if (note && answer) { await press(w, T(`sel-${code}`)); await P.waitForTimeout(600) }
  }
  const placed = !(await vis(P, T('sel-who')))
  if (!placed) { await press(w, T('sel-cancel')); await P.waitForTimeout(300) }
  return { placed, note }
}
/* the Post in sheet, opened on a day before his post-in; the date moved by its own calendar */
async function movePostIn(w, pid, tapIso, toIso, pic) {
  const P = w.page
  await openGrid(w)
  await L.openCell(w, pid, tapIso)
  await P.waitForSelector(T('postin-sheet'), { state: 'visible', timeout: 6000 }).catch(() => null)
  if (!(await vis(P, T('postin-sheet')))) { log('   !! no Post in sheet on', tapIso); await L.closeWin(w); return false }
  const before = await P.locator(T('postin-date')).getAttribute('data-value')
  await pickDate(w, T('postin-date'), toIso)
  const after = await P.locator(T('postin-date')).getAttribute('data-value')
  const err = await P.evaluate(() => { const e = document.querySelector('[data-testid="postin-err"]'); return e ? e.textContent.trim() : null })
  if (pic) await shot(w, pic)
  log(`   post-in ${before} -> ${after}${err ? ' err: ' + err : ''}`)
  await press(w, T('postin-cancel')); await P.waitForTimeout(400)
  return after === toIso
}
const undo = async w => { await press(w, '#undoBtn'); await w.page.waitForTimeout(700) }
const redo = async w => { await press(w, '#redoBtn'); await w.page.waitForTimeout(700) }
/* the LVE figures of one man, read on the Balances page AND in his person window — two surfaces that must agree */
async function lve(w, pid, tag) {
  await openBalances(w)
  const b = await balRow(w, pid)
  const pics = []
  if (tag) pics.push(await balShot(w, pid, tag + '-bal'))
  const p = await pwRead(w, pid, tag ? tag + '-pw' : null)
  if (tag) pics.push(tag + '-pw')
  return { b, p, pics, s: `Balances off=${b.off} cf=${b.cf} pend=${b.pend} war=${b.war} | window off=${p.off} pend=${p.pend} war=${p.war} taken="${p.taken}"` }
}
const num = s => (s == null ? NaN : Number(String(s).replace('−', '-').replace(/[^\d.\-]/g, '')))
function expectLve(id, r, off, war, extra = '') {
  const ok = num(r.b.off) === off && num(r.b.war) === war && num(r.p.off) === off && num(r.p.war) === war
  rec(id, ok ? 'PASS' : 'FAIL', `expected Official ${off} / War ${war} on both surfaces${extra}; saw ${r.s}`, r.pics)
  return ok
}

async function newWorld(signin = 'admin') {
  const w = await L.newCtx('desk')
  if (signin === 'admin') await L.signIn(w, 'admin')
  return w
}

/* ------------------------------------------------------------- scenarios ----------------------------------------------- */
const S = {}

/* s1 — his example, both orders (Astra 7, Opus SC10a/SC4): post-in Mon 7 Dec through Admin → Users; Lynx: LL Wed 2 Dec through
   the Post in sheet's own door, approved, THEN 24 typed; Pelican: 24 typed THEN LL 2 Dec. Both 24. Then LL Mon 7 Dec each:
   23 (the post-in day itself counts). The 2 Dec leave still drawn on the grid (D2747 "still shows").
   s1 continues (Astra 8, Opus SC4): the post-in date moved after typing, Undo / Redo. */
S.s1 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const lx = await addMan(w, 'Lynx', 'LX', '2026-12-07')
    const pe = await addMan(w, 'Pelican', 'PN', '2026-12-07')
    await L.openWar(w, 'admin')
    /* Lynx: leave first, through the Post in sheet */
    const a = await leaveDay(w, lx, '2026-12-02', 'LL', { pic: 's1-01-lynx' })
    rec('s1.0 the Post in sheet opens on a day before his post-in and hands the day to the leave window', a.viaSheet && a.placed ? 'PASS' : 'FAIL', `Post in sheet shown=${a.viaSheet}, leave placed=${a.placed}`, ['s1-01-lynx-postin-sheet'])
    await openBalances(w); await typeBox(w, T(`bal-LVE-${lx}`), 24)
    /* Pelican: typed first */
    await typeBox(w, T(`bal-LVE-${pe}`), 24)
    await leaveDay(w, pe, '2026-12-02', 'LL')
    let r = await lve(w, lx, 's1-02-lynx-24')
    expectLve('s1.1 Lynx: leave 2 Dec (before post-in) THEN 24 typed — nothing deducted', r, 24, 24)
    r = await lve(w, pe, 's1-03-pelican-24')
    expectLve('s1.2 Pelican: 24 typed THEN leave 2 Dec (before post-in) — nothing deducted', r, 24, 24)
    /* the 2 Dec leave still shows on the grid */
    await openGrid(w); await L.reachCell(w, lx, '2026-12-02')
    const c1 = await cellText(w, lx, '2026-12-02'), c2 = await cellText(w, pe, '2026-12-02')
    await (async () => { const row = P.locator(T(`row-${lx}`)).first(); await row.scrollIntoViewIfNeeded(); const b = await row.boundingBox(); await P.screenshot({ path: `${L.OUT}/s1-04-grid-2dec.png`, clip: { x: 0, y: Math.max(0, b.y - 120), width: 1536, height: 220 } }) })()
    rec('s1.3 the 2 Dec leave still drawn on the grid for both', /LL/.test(c1 || '') && /LL/.test(c2 || '') ? 'PASS' : 'FAIL', `Lynx 2 Dec cell "${c1}", Pelican "${c2}"`, ['s1-04-grid-2dec'])
    /* the post-in day itself */
    await leaveDay(w, lx, '2026-12-07', 'LL'); await leaveDay(w, pe, '2026-12-07', 'LL')
    r = await lve(w, lx, 's1-05-lynx-7dec'); expectLve('s1.4 Lynx: LL on the post-in day Mon 7 Dec is deducted', r, 23, 23)
    r = await lve(w, pe, 's1-06-pelican-7dec'); expectLve('s1.5 Pelican: LL on the post-in day Mon 7 Dec is deducted', r, 23, 23)
    const gl = await gridFig(w, lx), gp = await gridFig(w, pe)
    rec('s1.6 the grid figure beside the name agrees (its top line)', num((gl || '').split(' / ')[0]) === 23 && num((gp || '').split(' / ')[0]) === 23 ? 'PASS' : 'FAIL', `grid: Lynx "${gl}", Pelican "${gp}" (top / second line)`)
    rec('s1.6r the grid\'s second line (leave used) counts the 2 Dec leave before post-in? — RECORD', 'RECORD', `grid: Lynx "${gl}", Pelican "${gp}" — each has LL 2 Dec (before post-in) and LL 7 Dec`)

    /* ---- the post-in date moved after typing (Lynx's figure captured the 2 Dec leave; Pelican's did not) */
    const m1 = await movePostIn(w, lx, '2026-12-01', '2026-11-30', 's1-07-lynx-postin-30nov')
    const m2 = await movePostIn(w, pe, '2026-12-01', '2026-11-30', 's1-08-pelican-postin-30nov')
    rec('s1.7 the Post in sheet moved both post-in dates to Mon 30 Nov', m1 && m2 ? 'PASS' : 'FAIL', `Lynx moved=${m1} Pelican moved=${m2}`, ['s1-07-lynx-postin-30nov', 's1-08-pelican-postin-30nov'])
    r = await lve(w, lx, 's1-09-lynx-30nov'); expectLve('s1.8 Lynx after the move to 30 Nov: 2 Dec was in the figure typed, so it does not come off again', r, 23, 23)
    r = await lve(w, pe, 's1-10-pelican-30nov'); expectLve('s1.9 Pelican after the move to 30 Nov: 2 Dec now after his post-in, placed after typing — deducted', r, 22, 22)
    await undo(w)
    r = await lve(w, pe, 's1-11-pelican-undo'); expectLve('s1.10 Undo (top bar) puts Pelican\'s post-in back to 7 Dec: 23 again, without a reload', r, 23, 23)
    await redo(w)
    r = await lve(w, pe, 's1-12-pelican-redo'); expectLve('s1.11 Redo: 22 again', r, 22, 22)
    /* both to Thu 10 Dec: the 7 Dec leave now before post-in */
    await movePostIn(w, lx, '2026-11-27', '2026-12-10'); await movePostIn(w, pe, '2026-11-27', '2026-12-10')
    r = await lve(w, lx, 's1-13-lynx-10dec'); expectLve('s1.12 Lynx post-in moved to Thu 10 Dec: the 7 Dec leave (placed after typing) now before post-in — not deducted', r, 24, 24)
    r = await lve(w, pe, 's1-14-pelican-10dec'); expectLve('s1.13 Pelican post-in Thu 10 Dec: neither leave deducted', r, 24, 24)
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s1 STOPPED:', e.message); await shot(w, 's1-zz-stopped'); rec('s1 STOPPED', 'FAIL', e.message, ['s1-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s2 — a leave across the post-in date (Astra 9, Opus SC10): Kite, post-in Mon 7 Dec, 24 typed first; one approved LL Thu 3 –
   Wed 9 Dec dragged on his row: 3 working days on or after 7 Dec → 21; the days before still drawn. Then halves (Plover):
   LL AM Fri 4 Dec → 24; LL PM Mon 7 Dec → 23.5 */
S.s2 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const ki = await addMan(w, 'Kite', 'KT', '2026-12-07')
    const os = await addMan(w, 'Plover', 'PV', '2026-12-07')
    await L.openWar(w, 'admin')
    await openBalances(w); await typeBox(w, T(`bal-LVE-${ki}`), 24); await typeBox(w, T(`bal-LVE-${os}`), 24)
    const ok = await dragCells(w, ki, '2026-12-03', ki, '2026-12-09')
    const span = ok ? await P.locator(T('sel-span')).innerText() : null
    await shot(w, 's2-01-drag-window')
    const r1 = ok ? await selLeave(w, 'LL') : { placed: false }
    rec('s2.0 a drag across Thu 3 – Wed 9 Dec opens the drag window and places one LL', ok && r1.placed ? 'PASS' : 'FAIL', `window "${span}", placed=${r1.placed}`, ['s2-01-drag-window'])
    let r = await lve(w, ki, 's2-02-kite-across'); expectLve('s2.1 LL 3–9 Dec across a 7 Dec post-in: only 7, 8, 9 Dec deducted', r, 21, 21)
    await openGrid(w); await L.reachCell(w, ki, '2026-12-03')
    const cells = []; for (const d of ['03', '04', '07', '08', '09']) cells.push(`${d}:${await cellText(w, ki, '2026-12-' + d)}`)
    { const row = P.locator(T(`row-${ki}`)).first(); await row.scrollIntoViewIfNeeded(); const b = await row.boundingBox(); await P.screenshot({ path: `${L.OUT}/s2-03-grid-across.png`, clip: { x: 0, y: Math.max(0, b.y - 120), width: 1536, height: 220 } }) }
    rec('s2.2 the days before post-in still drawn on the grid as part of the leave', 'RECORD', `cells ${cells.join(' ')} (a joined bar writes its code once)`, ['s2-03-grid-across'])
    /* halves: AM Fri 4 Dec (before) */
    await openGrid(w); await L.openCell(w, os, '2026-12-04')
    if (await vis(P, T('postin-sheet'))) { await press(w, T('postin-place')); await P.waitForTimeout(500) }
    await press(w, T('portion-am')).catch(() => null); await P.waitForTimeout(300)
    await setSwitch(w, 'bid-approve-tick', true); await press(w, T('bid-LL')); await P.waitForTimeout(600); await L.closeWin(w)
    r = await lve(w, os, 's2-04-plover-am-4dec'); expectLve('s2.3 LL AM Fri 4 Dec (before post-in): nothing deducted', r, 24, 24)
    await openGrid(w); await L.openCell(w, os, '2026-12-07')
    await press(w, T('portion-pm')).catch(() => null); await P.waitForTimeout(300)
    await setSwitch(w, 'bid-approve-tick', true); await press(w, T('bid-LL')); await P.waitForTimeout(600); await L.closeWin(w)
    r = await lve(w, os, 's2-05-plover-pm-7dec'); expectLve('s2.4 LL PM Mon 7 Dec (the post-in day): half a day deducted', r, 23.5, 23.5)
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s2 STOPPED:', e.message); await shot(w, 's2-zz-stopped'); rec('s2 STOPPED', 'FAIL', e.message, ['s2-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s3 — a man away twice (Astra 2, Opus SC6; the fault both found, fixed in this build): Hawk, post-in Mon 5 Jan 26, 24 typed,
   approved LL Mon 13 Apr; posted out Overseas Sqn from Wed 1 Apr (runs at once — a past date); Restore on Admin → Users with
   post-in Mon 1 Jun; posted out again from Tue 1 Sep; Restore with post-in Mon 2 Nov: 24 throughout once back; a reload. */
async function postOut(w, pid, iso, chip, pic) {
  const P = w.page
  await openGrid(w); await L.openCell(w, pid, iso)
  await P.waitForSelector(T('bid-picker'), { state: 'visible', timeout: 6000 }).catch(() => null)
  if (!(await vis(P, T('bid-picker')))) { await shot(w, pic + '-no-window'); return 'no bid window' }
  await press(w, T('bid-more')); await P.waitForTimeout(300)
  await press(w, T('bid-postout')); await P.waitForTimeout(400)
  const d = await P.locator(T('po-date')).getAttribute('data-value')
  if (d !== iso) await pickDate(w, T('po-date'), iso)
  const on = await P.locator(`[data-testid^="po-"][aria-pressed="true"]`).first().getAttribute('data-testid').catch(() => null)
  if (on !== `po-${chip}`) await press(w, T(`po-${chip}`))
  const line = await P.evaluate(() => { const e = document.querySelector('[data-testid="po-line"]'); return e ? e.textContent.trim() : '' })
  await shot(w, pic)
  await press(w, T('po-confirm')); await P.waitForTimeout(1000)
  const err = await P.evaluate(() => { const e = document.querySelector('[data-testid="post-err"]'); return e ? e.textContent.trim() : '' })
  await L.closeWin(w)
  log(`   post out ${pid} from ${iso} (${chip}): "${line}" ${err ? 'ERR ' + err : ''}`)
  return err || 'ok'
}
async function restore(w, pid, postIn, pic) {
  const P = w.page
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(800)
  if (!(await P.locator('#accList').count())) { const u = P.locator('.adm-cat', { hasText: 'Users' }).first(); if (await u.count()) { await u.click(); await P.waitForTimeout(500) } }
  if ((await P.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') { await P.click('#accArchToggle'); await P.waitForTimeout(400) }
  const row = P.locator(`#accArchList [data-person="${pid}"] .acc-main`).first()
  if (!(await row.count())) { await shot(w, pic + '-not-archived'); return 'not in the archived list' }
  await row.scrollIntoViewIfNeeded(); await row.click(); await P.waitForTimeout(400)
  await pickDate(w, '#accArPostIn', postIn)
  await P.locator(`[data-restoring="${pid}"]`).screenshot({ path: `${L.OUT}/${pic}.png` }).catch(() => null)
  await P.click('#accArRestore'); await P.waitForTimeout(900)
  const err = await P.evaluate(() => { const e = document.querySelector('#accArErr'); return e ? e.textContent.trim() : '' })
  log(`   restore ${pid} post-in ${postIn}: ${err || 'ok'}`)
  return err || 'ok'
}
S.s3 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const hk = await addMan(w, 'Hawk', 'HK', '2026-01-05')
    await L.openWar(w, 'admin')
    await openBalances(w); await typeBox(w, T(`bal-LVE-${hk}`), 24)
    await leaveDay(w, hk, '2026-04-13', 'LL')
    let r = await lve(w, hk, 's3-01-typed-13apr'); expectLve('s3.0 Hawk, here since 5 Jan, 24 typed, LL Mon 13 Apr approved: deducted', r, 23, 23)
    let x = await postOut(w, hk, '2026-04-01', 'overseas', 's3-02-postout-1apr')
    rec('s3.1 posted out Overseas Sqn from Wed 1 Apr (the bid window\'s ⋯ → Post out)', x === 'ok' ? 'PASS' : 'FAIL', x, ['s3-02-postout-1apr'])
    x = await restore(w, hk, '2026-06-01', 's3-03-restore-1jun')
    rec('s3.2 Restore on Admin → Users with post-in Mon 1 Jun', x === 'ok' ? 'PASS' : 'FAIL', x, ['s3-03-restore-1jun'])
    await goWar(w)
    r = await lve(w, hk, 's3-04-back-once'); expectLve('s3.3 back once: 13 Apr was a day away — not deducted', r, 24, 24)
    x = await postOut(w, hk, '2026-09-01', 'overseas', 's3-05-postout-1sep')
    rec('s3.4 posted out again Overseas Sqn from Tue 1 Sep', x === 'ok' ? 'PASS' : 'FAIL', x, ['s3-05-postout-1sep'])
    x = await restore(w, hk, '2026-11-02', 's3-06-restore-2nov')
    rec('s3.5 Restore again with post-in Mon 2 Nov', x === 'ok' ? 'PASS' : 'FAIL', x, ['s3-06-restore-2nov'])
    await goWar(w)
    r = await lve(w, hk, 's3-07-back-twice'); expectLve('s3.6 back twice: 13 Apr (the FIRST gap) still not deducted', r, 24, 24)
    await P.reload(); await P.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 20000 })
    if (await P.locator('#luser').count()) await L.signIn(w, 'admin'); else await L.openWar(w, 'admin')
    r = await lve(w, hk, 's3-08-after-reload'); expectLve('s3.7 after a reload: the same', r, 24, 24)
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s3 STOPPED:', e.message); await shot(w, 's3-zz-stopped'); rec('s3 STOPPED', 'FAIL', e.message, ['s3-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s4 — a SANS man hidden from the war (Astra 1, Opus SC1; the fault both found, fixed in this build): Gull, a sign-in
   "gull", post-in Mon 7 Dec; "+ SANS" ON; LL 2 Dec approved through the Post in sheet, 24 typed, a PENDING LL Tue 15 Dec →
   Official 24, Pending 1, War 23. SANS ticked on Quals; "+ SANS" OFF (he has no row): Approvals' LVE BAL and, signed in as
   him, My leave and his window: 23 / 24 / 23 still. "+ SANS" on again: the same. */
async function sansGroup(w, on, pic) {
  const P = w.page
  await goWar(w)
  await press(w, T('settings-open')); await P.waitForSelector(T('settings-sheet'), { state: 'visible' }); await P.waitForTimeout(400)
  const has = await P.locator(T('grow-SANS')).count()
  if (on && !has) await press(w, T('gadd-SANS'))
  if (!on && has) await press(w, T('gdrop-SANS'))
  await P.waitForTimeout(400)
  const now = await P.locator(T('grow-SANS')).count()
  if (pic) await shot(w, pic)
  await press(w, T('settings-close')); await P.waitForTimeout(400)
  return now > 0
}
S.s4 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const gu = await addMan(w, 'Gull', 'GU', '2026-12-07', { signin: 'gull' })
    await L.openWar(w, 'admin')
    await leaveDay(w, gu, '2026-12-02', 'LL')
    await openBalances(w); await typeBox(w, T(`bal-LVE-${gu}`), 24)
    await leaveDay(w, gu, '2026-12-15', 'LL', { approve: false })
    let r = await lve(w, gu, 's4-01-shown'); const okA = num(r.p.off) === 24 && Math.abs(num(r.p.pend)) === 1 && num(r.p.war) === 23
    rec('s4.0 Gull on the war: Official 24, Pending 1 (15 Dec), War 23 — 2 Dec never deducted', okA ? 'PASS' : 'FAIL', r.s, r.pics)
    /* SANS ticked on Quals */
    await P.evaluate(() => window.go('quals')); await P.waitForTimeout(900)
    const keys = await P.evaluate(pid => [...document.querySelectorAll(`[data-q^="${pid}|"]`)].map(e => e.getAttribute('data-q').split('|')[1]), gu)
    const sk = keys.find(k => /^san/i.test(k))
    log('   Quals columns on his row:', keys.slice(0, 8).join(','), '→ SANS key', sk)
    if (sk) {
      /* the table ticks only in its Edit mode (the "✎ Edit" button on Quals' own row) */
      const ed = P.locator('button', { hasText: /^\s*✎?\s*Edit\s*$/ }).first()
      if (await ed.count()) { await ed.click(); await P.waitForTimeout(500) }
      const cell = P.locator(`[data-q="${gu}|${sk}"]`).first(); await cell.scrollIntoViewIfNeeded(); await cell.click(); await P.waitForTimeout(700)
      await shot(w, 's4-02-quals-sans')
      /* a question may follow the tick (from when?) — answer it with its first button, pictured */
      const ask = P.locator('.ask-card button, .modal button.primary, [role="dialog"] button.primary').first()
      if (await ask.count() && await ask.isVisible()) { await shot(w, 's4-02b-quals-ask'); await ask.click(); await P.waitForTimeout(600) }
    }
    const isSans = await P.evaluate(pid => { const q = (window.PEOPLE || {})[pid]; return q ? JSON.stringify({ san: q.san, sanFrom: q.sanFrom }) : null }, gu)
    log('   Gull after the tick:', isSans)
    const shownOff = await sansGroup(w, false, 's4-03-sans-off')
    await openGrid(w)
    const hasRow = await P.locator(T(`row-${gu}`)).count()
    rec('s4.1 SANS ticked, "+ SANS" off: Gull has no row on the grid (the premise)', !shownOff && hasRow === 0 ? 'PASS' : 'FAIL', `SANS group shown=${shownOff}, his rows=${hasRow}, his record ${isSans}`, ['s4-02-quals-sans', 's4-03-sans-off'])
    await openApprovals(w)
    const line = await P.evaluate(pid => { const e = document.querySelector(`[data-testid="appr-line-${pid}"] .appr-bal`); return e ? e.textContent.trim() : null }, gu)
    { const l = P.locator(T(`appr-line-${gu}`)).first(); if (await l.count()) { await l.scrollIntoViewIfNeeded(); await l.screenshot({ path: `${L.OUT}/s4-04-approvals-hidden.png` }) } }
    rec('s4.2 hidden: Approvals\' LVE BAL on his 15 Dec line reads 23 (2 Dec still not deducted)', num(line) === 23 ? 'PASS' : 'FAIL', `LVE BAL "${line}"`, ['s4-04-approvals-hidden'])
    /* signed in as him */
    await P.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await P.waitForSelector('#luser', { timeout: 15000 })
    await signInAs(w, 'gull', 'gull1', gu)
    await goWar(w)
    /* the member's own doors while he has no row: My leave (if drawn) and the Balances page (if he is on it) */
    const hasMl = await vis(P, T('my-leave'))
    const ml = await P.evaluate(() => { const e = document.querySelector('[data-testid="my-leave-lve"]'); return e ? e.textContent.trim() : null })
    await shot(w, 's4-05-gull-signed-in-hidden')
    let pwv = null
    if (hasMl) {
      await press(w, T('my-leave')); await P.waitForTimeout(600)
      if (await vis(P, T('person-window'))) {
        pwv = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); const v = id => { const e = pw.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.trim()) : null }; return { off: v('pw-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), line: v('pw-postin') } })
        await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/s4-06-his-window-hidden.png` })
        await press(w, T('pw-close')).catch(() => null)
      }
      rec('s4.3 hidden, signed in as Gull: My leave LVE 23; his window Official 24 / War 23', num(ml) === 23 && pwv && num(pwv.off) === 24 && num(pwv.war) === 23 ? 'PASS' : 'FAIL', `My leave "${ml}", window ${JSON.stringify(pwv)}`, ['s4-05-gull-signed-in-hidden', 's4-06-his-window-hidden'])
    } else {
      await openBalances(w)
      const own = await P.locator(T(`bal-row-${gu}`)).count()
      const b = own ? await balRow(w, gu) : null
      await shot(w, 's4-06-gull-balances-hidden')
      rec('s4.3 hidden, signed in as Gull: no My leave on his top row (a SANS man with no row on the war) — RECORD; his Balances row', 'RECORD', `My leave drawn=${hasMl}; his Balances row ${own ? JSON.stringify(b) : 'not on the page'}`, ['s4-05-gull-signed-in-hidden', 's4-06-gull-balances-hidden'])
    }
    /* back as admin, "+ SANS" on */
    await P.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await P.waitForSelector('#luser', { timeout: 15000 })
    await L.signIn(w, 'admin')
    const shownOn = await sansGroup(w, true, 's4-07-sans-on')
    r = await lve(w, gu, 's4-08-shown-again')
    rec('s4.4 "+ SANS" on again: Official 24, War 23 — the switch changes no figure', shownOn && num(r.p.off) === 24 && num(r.p.war) === 23 && num(r.b.war) === 23 ? 'PASS' : 'FAIL', `group shown=${shownOn}; ${r.s}`, r.pics)
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s4 STOPPED:', e.message); await shot(w, 's4-zz-stopped'); rec('s4 STOPPED', 'FAIL', e.message, ['s4-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s5 — a day after a posting OUT is still deducted (D1541; Astra 13, Opus SC13): Swift posted in today, 24 typed, posted out
   Overseas Sqn from Mon 7 Dec (not run yet); LL Tue 8 Dec approved → 23. Pending bids before the post-in date through Approve
   (Astra 11, Opus SC11): Tern, post-in 7 Dec, 24 typed; bids LL 2 Dec and LL 8 Dec (Auto-approve off): Pending 1, War 23,
   Approvals LVE BAL 23 on both lines; Approve each on Approvals → Official 23, Pending –, War 23. */
S.s5 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const sw = await addMan(w, 'Swift', 'SW', '')
    const tn = await addMan(w, 'Tern', 'TN', '2026-12-07')
    await L.openWar(w, 'admin')
    await openBalances(w); await typeBox(w, T(`bal-LVE-${sw}`), 24); await typeBox(w, T(`bal-LVE-${tn}`), 24)
    const x = await postOut(w, sw, '2026-12-07', 'overseas', 's5-01-postout-7dec')
    const a = await leaveDay(w, sw, '2026-12-08', 'LL')
    let r = await lve(w, sw, 's5-02-swift-after-po')
    expectLve('s5.1 Swift posted out from 7 Dec (Overseas Sqn), LL Tue 8 Dec approved: still deducted (D1541)', r, 23, 23, ` (post out: ${x}; placed=${a.placed})`)
    /* Tern: two bids */
    await leaveDay(w, tn, '2026-12-02', 'LL', { approve: false }); await leaveDay(w, tn, '2026-12-08', 'LL', { approve: false })
    r = await lve(w, tn, 's5-03-tern-bids')
    const okB = num(r.p.off) === 24 && Math.abs(num(r.p.pend)) === 1 && num(r.p.war) === 23 && num(r.b.pend) === 1 && num(r.b.war) === 23
    rec('s5.2 Tern, bids 2 Dec (before post-in) and 8 Dec: Pending 1 (only 8 Dec), War 23', okB ? 'PASS' : 'FAIL', r.s, r.pics)
    await openApprovals(w)
    const lines = await P.evaluate(pid => [...document.querySelectorAll(`[data-testid="appr-line-${pid}"]`)].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), bal: (e.querySelector('.appr-bal') || {}).textContent })), tn)
    await P.locator(T(`appr-line-${tn}`)).first().scrollIntoViewIfNeeded().catch(() => null); await P.waitForTimeout(300); await shot(w, 's5-04-approvals-tern')
    rec('s5.3 Approvals: Tern\'s two lines, LVE BAL 23 on both', lines.length === 2 && lines.every(l => num(l.bal) === 23) ? 'PASS' : 'FAIL', JSON.stringify(lines), ['s5-04-approvals-tern'])
    for (let i = 0; i < 2; i++) {
      const b = P.locator(`[data-testid="appr-line-${tn}"] [data-testid="appr-approve"]:not(.lit)`).first()
      if (await b.count()) { await b.scrollIntoViewIfNeeded(); await b.click(); await P.waitForTimeout(600) }
    }
    await P.locator(T(`appr-line-${tn}`)).first().scrollIntoViewIfNeeded().catch(() => null); await P.waitForTimeout(300); await shot(w, 's5-05-approvals-approved')
    r = await lve(w, tn, 's5-06-tern-approved')
    const okC = num(r.p.off) === 23 && num(r.p.war) === 23 && !(num(r.p.pend) > 0)
    rec('s5.4 both approved on Approvals: Official 23, nothing pending, War 23 (2 Dec\'s approval deducts nothing)', okC ? 'PASS' : 'FAIL', r.s, ['s5-05-approvals-approved', ...r.pics])
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s5 STOPPED:', e.message); await shot(w, 's5-zz-stopped'); rec('s5 STOPPED', 'FAIL', e.message, ['s5-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s6 — the below-zero question waits for a figure (D2746; Astra 6, Opus SC7): Wren never typed, Finch 0 typed. One-day
   window: LL Wed 9 Dec — Wren places at one tap, no question; Finch asks "That takes Finch to −1 LVE…". The drag window: 3
   days each, the same. A drag over both rows: the question names only Finch. The leave buttons' "left" for Wren: RECORD. */
S.s6 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const wr = await addMan(w, 'Wren', 'WR', '')
    const fi = await addMan(w, 'Finch', 'FI', '')
    await L.openWar(w, 'admin')
    await openBalances(w); await typeBox(w, T(`bal-LVE-${fi}`), 0)
    const fb = await balRow(w, fi)
    rec('s6.0 a 0 typed saves as a typed figure (Finch: Official 0, War 0, no "Not typed")', num(fb.off) === 0 && num(fb.war) === 0 && !fb.offNt ? 'PASS' : 'FAIL', JSON.stringify(fb), [await balShot(w, fi, 's6-00-finch-0')])
    let a = await leaveDay(w, wr, '2026-12-09', 'LL', { answer: false, pic: 's6-01-wren-day' })
    rec('s6.1 one-day window, never-typed Wren, LL Wed 9 Dec: placed at the first tap, no below-zero question', a.placed && !a.note ? 'PASS' : 'FAIL', `placed=${a.placed} note=${JSON.stringify(a.note)}`, ['s6-01-wren-day-after-first-tap'])
    rec('s6.1r the leave buttons\' "left" for never-typed Wren (deliberately unchanged)', 'RECORD', `LL button read "${a.left}" before the tap`)
    a = await leaveDay(w, fi, '2026-12-09', 'LL', { answer: false, pic: 's6-02-finch-day' })
    rec('s6.2 one-day window, Finch at a typed 0: the below-zero question shows and the leave waits', !a.placed && /Tap the same leave again/.test(a.note || '') ? 'PASS' : 'FAIL', `placed=${a.placed} note=${JSON.stringify(a.note)}`, ['s6-02-finch-day-after-first-tap'])
    /* drag windows, one row each */
    let ok = await dragCells(w, wr, '2026-12-14', wr, '2026-12-16'); let s = ok ? await selLeave(w, 'LL', { answer: false, pic: 's6-03-wren-drag' }) : { placed: false }
    rec('s6.3 drag window, Wren 14–16 Dec: placed at the first tap, no question', ok && s.placed && !s.note ? 'PASS' : 'FAIL', `opened=${ok} placed=${s.placed} note=${JSON.stringify(s.note)}`, ['s6-03-wren-drag'])
    ok = await dragCells(w, fi, '2026-12-14', fi, '2026-12-16'); s = ok ? await selLeave(w, 'LL', { answer: false, pic: 's6-04-finch-drag' }) : { placed: false }
    rec('s6.4 drag window, Finch 14–16 Dec: the question shows', ok && !s.placed && /Tap the same leave again/.test(s.note || '') ? 'PASS' : 'FAIL', `opened=${ok} placed=${s.placed} note=${JSON.stringify(s.note)}`, ['s6-04-finch-drag'])
    /* both rows in one drag (rows in between are the roster's own) */
    ok = await dragCells(w, wr, '2026-12-21', fi, '2026-12-22')
    const who = ok ? await P.locator(T('sel-who')).innerText() : ''
    s = ok ? await selLeave(w, 'LL', { answer: false, pic: 's6-05-both-drag' }) : { placed: false }
    const namesWren = /Wren/.test(s.note || ''), namesFinch = /Finch/.test(s.note || '')
    rec('s6.5 one drag over both rows: the question names Finch only', ok && namesFinch && !namesWren ? 'PASS' : 'FAIL', `window "${who}", note=${JSON.stringify(s.note)}`, ['s6-05-both-drag'])
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s6 STOPPED:', e.message); await shot(w, 's6-zz-stopped'); rec('s6 STOPPED', 'FAIL', e.message, ['s6-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s7 — the first figure typed, Undo, the change history line (Astra 21, 23; Opus SC8): Robin never typed. Carried fwd first:
   RECORD the refusal "Type the Official bal first". Official 0 → saved, "Not typed" gone; Undo → "Not typed" back, boxes
   empty and dashed; Redo → 0; then 24 typed; the change history: "LVE balance → …" with no invented "0 →". */
S.s7 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const rb = await addMan(w, 'Robin', 'RB', '')
    await L.openWar(w, 'admin'); await openBalances(w)
    let b = await balRow(w, rb)
    rec('s7.0 never typed: both LVE boxes empty with the dashed amber edge, War bal "Not typed"', b.off === '' && b.cf === '' && b.offNt && b.war === 'Not typed' ? 'PASS' : 'FAIL', JSON.stringify(b), [await balShot(w, rb, 's7-00-never')])
    await typeBox(w, T(`bal-cf-${rb}`), 5)
    const refusal = await P.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const c = getComputedStyle(e); return `${e.textContent.trim()} (shown ${e.getBoundingClientRect().width > 0}, colour ${c.color}, fill ${c.backgroundColor})` }, `bal-cf-${rb}-err`)
    await balShot(w, rb, 's7-01-cf-first')
    b = await balRow(w, rb)
    rec('s7.1 carried fwd typed first: refused at its box — RECORD its words and look', 'RECORD', `refusal shown "${refusal}"; row after: ${JSON.stringify(b)}`, ['s7-01-cf-first'])
    rec('s7.1b the refusal saved nothing (still "Not typed")', b.war === 'Not typed' && b.off === '' ? 'PASS' : 'FAIL', JSON.stringify(b))
    await typeBox(w, T(`bal-LVE-${rb}`), 0)
    b = await balRow(w, rb)
    rec('s7.2 Official bal 0 typed: saved, War bal 0, the amber edge gone', num(b.off) === 0 && num(b.war) === 0 && !b.offNt ? 'PASS' : 'FAIL', JSON.stringify(b), [await balShot(w, rb, 's7-02-zero')])
    await undo(w); await openBalances(w); b = await balRow(w, rb)
    rec('s7.3 Undo (top bar): back to never typed — empty dashed boxes, "Not typed"', b.off === '' && b.offNt && b.war === 'Not typed' ? 'PASS' : 'FAIL', JSON.stringify(b), [await balShot(w, rb, 's7-03-undo')])
    await redo(w); await openBalances(w); b = await balRow(w, rb)
    rec('s7.4 Redo: 0 again', num(b.off) === 0 && num(b.war) === 0 && !b.offNt ? 'PASS' : 'FAIL', JSON.stringify(b), [await balShot(w, rb, 's7-04-redo')])
    await typeBox(w, T(`bal-LVE-${rb}`), 24); await typeBox(w, T(`bal-cf-${rb}`), 2)
    b = await balRow(w, rb)
    rec('s7.5 24 typed, then carried 2: Official 24, carried 2, War 24', num(b.off) === 24 && num(b.cf) === 2 && num(b.war) === 24 ? 'PASS' : 'FAIL', JSON.stringify(b), [await balShot(w, rb, 's7-05-24')])
    /* the change history (Edit Schedule's clock — the admin's door) */
    await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1200)
    let lines = ''
    const chgText = () => P.evaluate(() => { const e = [...document.querySelectorAll('.chgwin')].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText.replace(/\s+/g, ' ') : '' })
    if (await P.locator('#histBtn').count()) {
      await P.click('#histBtn'); await P.waitForTimeout(800)
      /* the lines are dated the day the figure was typed: walk the week forward (its own › button) to the week holding it,
         reading the window's own heading ("week of 23/11") */
      /* the window stands over the week's › — close it (its own clock button), step, reopen */
      for (let i = 0; i < 30 && !/week of 23\/11/.test(await chgText()); i++) {
        if (await chgText()) { await P.click('#histBtn'); await P.waitForTimeout(400) }
        await P.click('#weekNext'); await P.waitForTimeout(500)
        await P.click('#histBtn'); await P.waitForTimeout(500)
      }
      log('   changes window on:', (await chgText()).slice(0, 40))
      const all = P.locator('.chgwin button, .chgwin [role="tab"]', { hasText: /All/ }).first()
      if (await all.count()) { await all.click(); await P.waitForTimeout(600) }
      lines = await P.evaluate(() => { const e = [...document.querySelectorAll('.chgwin')].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText.replace(/\s+/g, ' ') : '' })
      await shot(w, 's7-06-history')
    }
    const mine = (lines.match(/[^.]{0,80}(LVE balance|carried fwd)[^.]{0,60}/g) || []).join(' ‖ ')
    rec('s7.6 the change history names the first figure with no invented "from" (no "0 → 0", no "0 → 24")', mine ? (/\b0\s*→\s*0\b/.test(mine) ? 'FAIL' : 'RECORD') : 'RECORD', `history lines about the balance: ${mine || '(none found on the changes window — ' + lines.slice(0, 200) + ')'}`, ['s7-06-history'])
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s7 STOPPED:', e.message); await shot(w, 's7-zz-stopped'); rec('s7 STOPPED', 'FAIL', e.message, ['s7-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s8 — the looks, admin and member (D2746, D2749/D2812, D2810): the person window and Balances page for a typed and a
   never-typed man; "Official bal"; the one line (once above the rows, Balances view only; under the LVE box where a box is);
   no "App bal" anywhere; the member: his own window unlocked (line), another man's (no line, amber dash), locked (none). */
S.s8 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const ny = await addMan(w, 'Lark', 'LK', '')
    await L.openWar(w, 'admin'); await openBalances(w)
    /* the page: heading, the one line, Days taken */
    const page = await P.evaluate(() => {
      const pg = document.querySelector('[data-testid="balances-page"]')
      const lines = [...pg.querySelectorAll('[data-testid="bal-postin"]')].filter(e => e.getBoundingClientRect().height > 0)
      const ths = [...pg.querySelectorAll('th, .bp-head span')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
      const first = pg.querySelector('[data-testid^="bal-row-"]')
      const l = lines[0]
      return { n: lines.length, text: l ? l.textContent : null, lineBottom: l ? l.getBoundingClientRect().bottom : null, firstRowTop: first ? first.getBoundingClientRect().top : null, official: ths.filter(t => /OFFICIAL/.test(t)), appBal: /App bal/i.test(document.body.innerText), fs: l ? getComputedStyle(l).fontSize : null, col: l ? getComputedStyle(l).color : null }
    })
    await shot(w, 's8-01-balances-admin')
    rec('s8.1 Balances (admin): "Only leave after post-in is deducted." once, above the rows', page.n === 1 && page.text === 'Only leave after post-in is deducted.' && page.lineBottom < page.firstRowTop ? 'PASS' : 'FAIL', JSON.stringify(page), ['s8-01-balances-admin'])
    rec('s8.2 the heading reads OFFICIAL BAL; "App bal" nowhere on the page', page.official.some(t => t === 'OFFICIAL BAL') && !page.appBal ? 'PASS' : 'FAIL', `headings with OFFICIAL: ${JSON.stringify(page.official)}; "App bal" in page text=${page.appBal}`)
    const dt = P.locator('button', { hasText: /^Days taken$/ }).first()
    if (await dt.count()) {
      await dt.click(); await P.waitForTimeout(500)
      const n = await P.locator(`${T('bal-postin')}:visible`).count()
      await shot(w, 's8-03-days-taken')
      rec('s8.3 Days taken view: no line', n === 0 ? 'PASS' : 'FAIL', `lines shown ${n}`, ['s8-03-days-taken'])
      await P.locator(`${T('balances-page')} button`, { hasText: /^Balances$/ }).first().click(); await P.waitForTimeout(400)
    } else rec('s8.3 Days taken view: no line', 'NOT WALKED', 'no Days taken switch found')
    /* the never-typed man's row and window */
    const b = await balRow(w, ny)
    const pics = [await balShot(w, ny, 's8-04-lark-row')]
    const p = await pwRead(w, ny, 's8-05-lark-window')
    const amber = await (async () => { await openBalances(w); await press(w, T(`bal-name-${ny}`)); await P.waitForTimeout(500); const c = await P.evaluate(() => { const e = document.querySelector('[data-testid="pw-LVE-war"]'); const bx = document.querySelector('[data-testid="pw-LVE"]'); const cs = e && getComputedStyle(e); const bs = bx && getComputedStyle(bx); return { color: cs && cs.color, nowrap: e && e.getBoundingClientRect().height < 26, tileRight: document.querySelector('[data-testid="pw-tile-LVE"]').getBoundingClientRect().right, warRight: e.getBoundingClientRect().right, boxEdge: bs && `${bs.borderTopStyle} ${bs.borderTopColor}` } }); await press(w, T('pw-close')); await P.waitForTimeout(300); return c })()
    rec('s8.4 never typed — his window: label "Official bal", boxes empty, War bal "Not typed" in amber inside the tile, the one line under the LVE box', p.labels.includes('Official bal') && !p.labels.includes('App bal') && p.off === '' && p.war === 'Not typed' && p.line === 'Only leave after post-in is deducted.' && amber.warRight <= amber.tileRight ? 'PASS' : 'FAIL', `${JSON.stringify(p)} look ${JSON.stringify(amber)}`, ['s8-05-lark-window'])
    rec('s8.5 never typed — his Balances row: empty dashed boxes, "Not typed"', b.off === '' && b.offNt && b.war === 'Not typed' ? 'PASS' : 'FAIL', JSON.stringify(b), pics)
    /* "No grade"'s dashed amber edge on EVERY never-typed box (D2746: "every kind of leave") — the Balances page's and his
       window's, LVE and a small kind (CCL) alike; read from the drawn box's computed edge */
    const edgeOf = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return `${c.borderTopStyle} ${c.borderTopColor} value="${e.value ?? ''}"` }, sel)
    await openBalances(w)
    const eBal = { LVE: await edgeOf(`[data-testid="bal-LVE-${ny}"]`), CCL: await edgeOf(`[data-testid="bal-CCL-${ny}"]`), controlTypedRangerLVE: await edgeOf('[data-testid="bal-LVE-bane"]') }
    await press(w, T(`bal-name-${ny}`)); await P.waitForTimeout(500)
    const ePw = { LVE: await edgeOf('[data-testid="person-window"] [data-testid="pw-LVE"]'), CCL: await edgeOf('[data-testid="person-window"] [data-testid="pw-CCL"]') }
    { const t = P.locator(T('pw-tile-CCL')).first(); if (await t.count()) await t.screenshot({ path: `${L.OUT}/s8-05b-lark-window-ccl.png` }) }
    await press(w, T('pw-close')); await P.waitForTimeout(300)
    const dashedAmber = s => !!s && /^dashed rgba?\(242, 200, 121/.test(s)
    rec('s8.5b never typed — the Balances page\'s boxes (LVE, CCL) wear the dashed amber edge', dashedAmber(eBal.LVE) && dashedAmber(eBal.CCL) ? 'PASS' : 'FAIL', JSON.stringify(eBal), pics)
    rec('s8.5c never typed — his window\'s boxes (LVE, CCL) wear the dashed amber edge', dashedAmber(ePw.LVE) && dashedAmber(ePw.CCL) ? 'PASS' : 'FAIL', JSON.stringify(ePw), ['s8-05-lark-window', 's8-05b-lark-window-ccl'])
    /* deliberately unchanged readers, recorded */
    const gf = await gridFig(w, ny)
    const ml = await P.evaluate(() => { const e = document.querySelector('[data-testid="my-leave"]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null })
    { const row = P.locator(T(`row-${ny}`)).first(); await row.scrollIntoViewIfNeeded(); const bx = await row.boundingBox(); if (bx) await P.screenshot({ path: `${L.OUT}/s8-06-grid-never.png`, clip: { x: 0, y: Math.max(0, bx.y - 60), width: 700, height: 120 } }) }
    rec('s8.6 deliberately unchanged: the grid figure beside a never-typed name', 'RECORD', `grid "${gf}" (the admin's My leave reads "${ml}")`, ['s8-06-grid-never'])
    /* the member (Ranger, bane): his own window unlocked, another man's, then locked */
    await P.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await P.waitForSelector('#luser', { timeout: 15000 })
    await L.signIn(w, 'member'); await openBalances(w)
    const mpage = await P.evaluate(() => ({ n: [...document.querySelectorAll('[data-testid="bal-postin"]')].filter(e => e.getBoundingClientRect().height > 0).length, app: /App bal/i.test(document.body.innerText) }))
    await shot(w, 's8-07-member-balances-unlocked')
    rec('s8.7 member, unlocked: the line once on the Balances page (his own row has boxes)', mpage.n === 1 && !mpage.app ? 'PASS' : 'FAIL', JSON.stringify(mpage), ['s8-07-member-balances-unlocked'])
    const own = await pwRead(w, 'bane', 's8-08-member-own-window')
    rec('s8.8 member, unlocked, his own window: the line under the LVE box; "Official bal"', own.line === 'Only leave after post-in is deducted.' && own.labels.includes('Official bal') ? 'PASS' : 'FAIL', JSON.stringify(own), ['s8-08-member-own-window'])
    const other = await pwRead(w, ny, 's8-09-member-other-never')
    /* a read-only figure carries no test id of its own: read the row's read-only marks (`.bp-ro`) — the first is Official bal */
    const dash = await (async () => { await openBalances(w); return P.evaluate(pid => { const row = document.querySelector(`[data-testid="bal-row-${pid}"]`); if (!row) return null; const ro = [...row.querySelectorAll('.bp-ro')]; const e = ro[0]; return e ? { tag: e.tagName, text: e.textContent.trim(), title: e.getAttribute('title'), nt: e.classList.contains('nt'), color: getComputedStyle(e).color, dashes: ro.filter(x => x.classList.contains('nt')).length, inputs: row.querySelectorAll('input').length } : null }, ny) })()
    await balShot(w, ny, 's8-10-member-sees-never-row')
    rec('s8.9 member, another man never typed: his window has no line, War bal "Not typed"; his Balances box an amber "–" read only, named "Not typed"', other.line === null && other.war === 'Not typed' && dash && dash.inputs === 0 && dash.text === '–' && dash.title === 'Not typed' && dash.color === 'rgb(242, 200, 121)' ? 'PASS' : 'FAIL', `window ${JSON.stringify(other)}; Balances ${JSON.stringify(dash)}`, ['s8-09-member-other-never', 's8-10-member-sees-never-row'])
    /* locked: the admin's switch, then the member again */
    await P.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await P.waitForSelector('#luser', { timeout: 15000 })
    await L.signIn(w, 'admin'); await openBalances(w)
    const lk = P.locator(`${T('bal-lock')}, [aria-label*="Lock for members"], button:has-text("Lock for members")`).first()
    let locked = false
    if (await lk.count()) { await lk.click(); await P.waitForTimeout(500); locked = true }
    const adminLine = await P.locator(`${T('bal-postin')}:visible`).count()
    await shot(w, 's8-11-admin-locked')
    rec('s8.10 admin with the lock on: still the line (an admin always has boxes)', locked && adminLine === 1 ? 'PASS' : 'FAIL', `lock pressed=${locked}, lines ${adminLine}`, ['s8-11-admin-locked'])
    await P.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await P.waitForSelector('#luser', { timeout: 15000 })
    await L.signIn(w, 'member'); await openBalances(w)
    const ln = await P.locator(`${T('bal-postin')}:visible`).count()
    await shot(w, 's8-12-member-locked')
    const ownL = await pwRead(w, 'bane', 's8-13-member-own-locked')
    rec('s8.11 member, locked: no line on the page, none in his own window', ln === 0 && ownL.line === null ? 'PASS' : 'FAIL', `page lines ${ln}; window ${JSON.stringify(ownL)}`, ['s8-12-member-locked', 's8-13-member-own-locked'])
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s8 STOPPED:', e.message); await shot(w, 's8-zz-stopped'); rec('s8 STOPPED', 'FAIL', e.message, ['s8-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s9 — the desktop drawing check (walk-scripts §10, done by pixels beside the approved drawings' own raw pictures): the
   drawing's world rebuilt (Pelican, FCP OCU, post-in today, 24 typed — and his five small kinds typed 0, as the drawing,
   drawn before "Not typed", showed them) and his window pictured as the drawing script pictured it; the Balances page top
   pictured as its drawing. The comparing is done afterwards by drawcmp-a.py. */
S.s9 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const pe = await addMan(w, 'Pelican', 'PN', '2026-11-27')
    await L.openWar(w, 'admin'); await openBalances(w)
    await typeBox(w, T(`bal-LVE-${pe}`), 24)
    for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) await typeBox(w, T(`bal-${k}-${pe}`), 0)
    await openBalances(w)
    await press(w, T(`bal-name-${pe}`)); await P.waitForSelector(T('person-window'), { state: 'visible', timeout: 8000 }); await P.waitForTimeout(600)
    await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/s9-build-desk-pw.png` })
    const m = await P.evaluate(() => {
      const pw = document.querySelector('[data-testid="person-window"]').getBoundingClientRect()
      const r = s => { const e = document.querySelector(`[data-testid="${s}"]`); if (!e) return null; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return { x: Math.round(b.x - pw.x), y: Math.round(b.y - pw.y), w: Math.round(b.width), h: Math.round(b.height), fs: c.fontSize, col: c.color } }
      return { line: r('pw-postin'), cf: r('pw-LVE-cf'), box: r('pw-LVE'), tile: r('pw-tile-LVE') }
    })
    log('   build window measures:', JSON.stringify(m))
    await press(w, T('pw-close')); await P.waitForTimeout(400)
    /* the drawing was taken with the list at its top: the page AND the list's own scroller back to the top */
    await openBalances(w); await P.evaluate(() => { window.scrollTo(0, 0); const s = document.querySelector('[data-testid="bal-scroll"]'); if (s) s.scrollTop = 0 }); await P.waitForTimeout(400)
    const cols = await P.evaluate(() => { const pg = document.querySelector('[data-testid="balances-page"]'); const x = t => { const e = [...pg.querySelectorAll('th, .bp-head span')].find(h => h.textContent.replace(/\s+/g, ' ').trim() === t); return e ? Math.round(e.getBoundingClientRect().left) + '..' + Math.round(e.getBoundingClientRect().right) + ' h' + Math.round(e.getBoundingClientRect().height) : null }; return { warBal: x('WAR BAL'), oil: x('OIL'), ccl: x('CCL'), cl: x('CL'), nt: [...pg.querySelectorAll('.bp-nt')].filter(e => e.getBoundingClientRect().height > 0).length } })
    log('   Balances headings (x from..to, height):', JSON.stringify(cols))
    await shot(w, 's9-build-desk-bal')
    rec('s9.0 the drawing\'s world rebuilt and pictured (the comparing follows)', 'RECORD', `window measures ${JSON.stringify(m)}`, ['s9-build-desk-pw', 's9-build-desk-bal'])
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s9 STOPPED:', e.message); await shot(w, 's9-zz-stopped'); rec('s9 STOPPED', 'FAIL', e.message, ['s9-zz-stopped']) }
  finally { await w.ctx.close() }
}

/* s10 — a lead seen in passing in s1/s3's pictures, reproduced: with LVE typed and CCL never typed, his WINDOW's empty CCL box
   wears a plain grey edge while the Balances page's CCL box for the same man wears the dashed amber edge. Calibrated against
   a man with NOTHING typed (Lark-like: dashed in both places). D2746: "every kind of leave" — two surfaces that must agree. */
let n10 = 0
S.s10 = async () => {
  const w = await newWorld(); const P = w.page
  try {
    const a = await addMan(w, 'Jay', 'JY', process.env.JAY_PI || '2026-12-07')
    const z = await addMan(w, 'Ibis', 'IB', '')
    await L.openWar(w, 'admin')
    /* s1's Lynx exactly: a leave on 2 Dec through the Post in sheet first, then 24 typed */
    if (process.env.JAY_LEAVE_FIRST) await leaveDay(w, a, '2026-12-02', 'LL')
    await openBalances(w)
    await typeBox(w, T(`bal-LVE-${a}`), 24)
    if (process.env.JAY_LEAVE_FIRST) { const r0 = await lve(w, a, 's10-0-jay-as-lynx'); log('   as s1:', r0.s) }
    const read = async pid => {
      await openBalances(w)
      const bal = await P.evaluate(pid => { const e = document.querySelector(`[data-testid="bal-CCL-${pid}"]`); const c = e && getComputedStyle(e); return e ? `"${e.value}" ${c.borderTopStyle} ${c.borderTopColor} class=${e.className}` : null }, pid)
      await press(w, T(`bal-name-${pid}`)); await P.waitForSelector(T('person-window'), { state: 'visible' }); await P.waitForTimeout(500)
      const pw = await P.evaluate(() => { const e = document.querySelector('[data-testid="person-window"] [data-testid="pw-CCL"]'); const c = e && getComputedStyle(e); return e ? `"${e.value}" ${c.borderTopStyle} ${c.borderTopColor} class=${e.className} focused=${document.activeElement === e}` : null })
      await P.locator(T('pw-tile-CCL')).first().screenshot({ path: `${L.OUT}/s10-${++n10}-${pid === a ? 'jay-lve-typed' : 'ibis-nothing-typed'}-ccl-window.png` })
      await press(w, T('pw-close')); await P.waitForTimeout(300)
      return { bal, pw }
    }
    const ra = await read(a), rz = await read(z)
    await openBalances(w); await balShot(w, a, 's10-balances-jay-ibis')
    const dashed = s => /dashed rgba?\(242, 200, 121/.test(s || '')
    rec('s10.0 calibration: Ibis, nothing typed — his CCL box dashed amber on the Balances page and in his window', dashed(rz.bal) && dashed(rz.pw) ? 'PASS' : 'FAIL', JSON.stringify(rz), ['s10-2-ibis-nothing-typed-ccl-window', 's10-balances-jay-ibis'])
    rec('s10.1 Jay, LVE typed, CCL never typed — his CCL box dashed amber in BOTH places (D2746 every kind; two surfaces agree)', dashed(ra.bal) && dashed(ra.pw) ? 'PASS' : 'FAIL', JSON.stringify(ra), ['s10-1-jay-lve-typed-ccl-window', 's10-balances-jay-ibis'])
    /* the difference from s1/s3's men: they had an approved LL in the year — place one on Jay and Ibis and read again */
    await leaveDay(w, a, '2026-12-09', 'LL'); await leaveDay(w, z, '2026-12-09', 'LL')
    const rb = await read(a), ry = await read(z)
    await openBalances(w); await balShot(w, a, 's10-balances-after-leave')
    rec('s10.2 Jay (LVE typed) with an approved LL: CCL still dashed amber in BOTH places', dashed(rb.bal) && dashed(rb.pw) ? 'PASS' : 'FAIL', JSON.stringify(rb), ['s10-3-jay-lve-typed-ccl-window', 's10-balances-after-leave'])
    rec('s10.3 Ibis (nothing typed) with an approved LL: CCL still dashed amber in BOTH places', dashed(ry.bal) && dashed(ry.pw) ? 'PASS' : 'FAIL', JSON.stringify(ry), ['s10-4-ibis-nothing-typed-ccl-window', 's10-balances-after-leave'])
    log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
  } catch (e) { log('s10 STOPPED:', e.message); await shot(w, 's10-zz-stopped'); rec('s10 STOPPED', 'FAIL', e.message, ['s10-zz-stopped']) }
  finally { await w.ctx.close() }
}

try {
  for (const [k, f] of Object.entries(S)) {
    if (ONLY && !ONLY.split(',').includes(k)) continue
    log(`\n==== ${k}`); const t0 = Date.now(); await f(); log(`==== ${k} took ${Math.round((Date.now() - t0) / 1000)} s`)
  }
} finally {
  L.writeResults('results')
  const c = { PASS: 0, FAIL: 0, RECORD: 0, 'NOT WALKED': 0 }; for (const r of L.results) c[r.verdict] = (c[r.verdict] || 0) + 1
  log('\nTOTAL', JSON.stringify(c))
  await L.closeBrowser()
}
