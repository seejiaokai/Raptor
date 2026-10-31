// Leave War fixes of 31 Oct 26 — scenario R2: a clash note's link for a man with no row (before-fix walk; re-run later as the re-walk).
// The clash of w2d.mjs scenario 33, adapted to today's app: a SANS man (Zenith) on a ground row of the loaded week's Saturday
// (18 Jul 26), that day published, his bid LL on it placed while "+ SANS" is on, then SANS taken off (⚙ Settings, the SANS
// group's ✕). The note names him; the row / its link is pressed with SANS off, then with "+ SANS" back on.
// THE RE-WALK (his D1542, 31 Oct 26): with no row for him the bid's link reads "Decide it in Approvals ›" and opens Approvals
// with his request ringed; "+ SANS" back on, "Decide the bid ›" opens his day as before. Then (R2b) his bid approved and SANS
// off again: "Change the leave on Inputs ›" opens that leave's own window on the Inputs page. Each recorded PASS / FAIL.
// Run from raptor-port:  SIZE=desk|phone  LW_DIST=<build>  [LW_OUT=<folder under docs/img/handpass>]
//   node scripts/handpass/lw-fx1031-2.mjs
process.env.LW_OUT ||= '2026-10-31-lw-fixes/before'
const L = await import('./lw-rr-lib.mjs')
const F = await import('./lw-fx1031-lib.mjs')
const SIZE = F.SIZE
console.log('[lw-fx1031-2 v2]', SIZE, 'today', L.TODAY)
F.clearMine(`r2-${SIZE}-`)
const pre = `r2-${SIZE}-`
const DAY = '2026-07-18', S = 'vinci', SCS = 'Zenith'
const w = await F.world('admin'); const P = w.page
const TOUCH = SIZE === 'phone'
const log = []
const note = (k, v) => { log.push([k, v]); console.log(`  ${k}:`, typeof v === 'string' ? v : JSON.stringify(v)) }

/* the project's own clash fixture (e2e twoClashes; w2d's fixtureDay): Saturday published with the men on a programme row —
   the one step with no control (D608 allows it for the published-Saturday fixture) */
await P.evaluate(ids => {
  const W = window, di = 5
  W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate()
  for (const id of ids) { W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, id); W.afterSchedMutate() }
  const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  W.setDayApproved(di, true); W.afterSchedMutate()
  if (W.clearToast) W.clearToast()
}, [S, 'pump'])
note('fixture', await P.evaluate(([S, DAY]) => ({ day5: window.DAYS[5].date, man: window.PEOPLE[S] && window.PEOPLE[S].cs, ground: window.DAYS[5].ground.map(g => g.prog + ' ' + (g.who || '')) }), [S, DAY]))

const toJul = async () => { await L.toWar(w); await L.openGrid(w); await L.gotoMonth(w, 'JUL'); await L.reachCell(w, 'pump', DAY) }
async function setSans(on) {
  await L.press(w, L.T('settings-open')); await P.waitForTimeout(500)
  const has = await P.locator(L.T('grow-SANS')).count()
  const addVis = await L.vis(P, L.T('gadd-SANS'))
  let how = 'already ' + (on ? 'on' : 'off')
  if (on && !has) { await L.press(w, L.T('gadd-SANS')); how = 'pressed "+ SANS"'; await P.waitForTimeout(500) }
  if (!on && has) { await L.press(w, L.T('gdrop-SANS')); how = "pressed the SANS group's ✕"; await P.waitForTimeout(500) }
  const hasAfter = await P.locator(L.T('grow-SANS')).count()
  await L.shot(w, pre + (on ? 'sans-on-settings' : 'sans-off-settings'))
  await L.press(w, L.T('settings-close')); await P.waitForTimeout(600)
  return { how, groupBefore: has, offerChipVisible: addVis, groupAfter: hasAfter }
}
async function readNote() {
  if (!(await P.locator(L.T('sync-clashes')).count())) return { found: 0 }
  if (TOUCH) {
    if ((await P.locator(L.T('clash-line')).getAttribute('aria-expanded')) !== 'true') { await L.press(w, L.T('clash-line')); await P.waitForTimeout(400) }
    return P.evaluate(() => ({ found: 1, head: document.querySelector('[data-testid="clash-line"]').innerText.replace(/\s+/g, ' ').trim(), rows: [...document.querySelectorAll('[data-testid^="clash-row-"]')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }))
  }
  return P.evaluate(() => ({ found: 1, head: (document.querySelector('[data-testid="sync-clashes"] .n') || document.querySelector('[data-testid="sync-clashes"]')).innerText.replace(/\s+/g, ' ').trim(), rows: [...document.querySelectorAll('[data-testid="sync-clashes"] .row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()), links: [...document.querySelectorAll('[data-testid^="clash-go-"]')].map(e => e.dataset.testid + ':' + e.innerText.trim()) }))
}
const clashPic = async name => { await P.locator(L.T('sync-clashes')).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await P.waitForTimeout(300); await L.shot(w, pre + name) }
const surface = () => P.evaluate(() => {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const day = document.querySelector('[data-testid="daylist-sheet"]'), one = document.querySelector('[data-testid="bid-picker"]'), win = [...document.querySelectorAll('[role=dialog]')].filter(vis)
  const ring = [...document.querySelectorAll('td[data-testid^="cell-"]')].filter(td => /ring|just|flash|sel/i.test(td.className)).map(td => td.dataset.testid).slice(0, 5)
  return { dayList: vis(day) ? day.innerText.replace(/\s+/g, ' ').slice(0, 160) : null, oneDay: vis(one) ? one.innerText.replace(/\s+/g, ' ').slice(0, 160) : null, dialogs: win.map(d => (d.getAttribute('data-testid') || d.id || d.className) + ': ' + d.innerText.replace(/\s+/g, ' ').slice(0, 100)), page: window.CURPAGE, highlighted: ring, said: (window.__said || []).slice(-2) }
})
async function tapNote(name) {
  const sel = TOUCH ? L.T('clash-row-0') : L.T('clash-go-0')
  if (!(await P.locator(sel).count())) return { pressed: false, why: `no ${sel}` }
  await P.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await P.waitForTimeout(250)
  const text = await P.locator(sel).first().innerText().then(t => t.replace(/\s+/g, ' ').trim())
  const said0 = await P.evaluate(() => (window.__said || []).length)
  await L.press(w, sel, TOUCH ? pre + name + '-quick' : null); await P.waitForTimeout(1000)
  await L.shot(w, pre + name)
  return { pressed: true, text, ...(await surface()), newNotes: await P.evaluate(n => (window.__said || []).slice(n), said0) }
}
/* the Approvals page as drawn: up or not, and which lines wear the ring (D1542) */
const apprState = () => P.evaluate(() => {
  const pg = document.querySelector('[data-testid="approvals-page"]')
  const up = !!pg && !pg.hidden && pg.getBoundingClientRect().height > 0
  return { up, ringed: up ? [...pg.querySelectorAll('.appr-line.lw-ring')].map(e => e.dataset.testid) : [], ringInView: up ? [...pg.querySelectorAll('.appr-line.lw-ring')].some(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }) : false }
})
const linkWords = n => JSON.stringify(n.links || n.rows || []).replace(/ /g, ' ')   /* the app writes a no-break space before its › */
async function closeAll() {
  await L.closeWin(w)
  for (const id of ['dl-close']) if (await L.vis(P, L.T(id))) await L.press(w, L.T(id))
  await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
}

try {
  await toJul()
  note('1 + SANS on', await setSans(true))
  note('1 his row drawn', await P.locator(`tr[data-testid="row-${S}"]`).count())
  await L.reachCell(w, S, DAY)
  const okBid = await L.pendingLL(w, S, DAY).catch(e => 'ERR ' + e)  // opens his cell, Auto-approve off, presses LL
  await toJul(); await L.reachCell(w, S, DAY)
  note('2 his bid LL placed (Auto-approve off → pending)', { ok: okBid, cell: await F.cellWords(w, S, DAY), inputs: await L.warLeave(w, S) })
  await L.rowShot(w, S, L.day(0) && '2026-07-15', '2026-07-21', pre + '2-his-row-sans-on')
  const nOn = await readNote()
  note('3 clash note, SANS on', nOn)
  if (nOn.found) await clashPic('3-note-sans-on')
  if (nOn.found) { const t = await tapNote('3b-tap-sans-on'); note('3b tap with SANS on', t); await closeAll() }
  note('4 SANS taken off', await setSans(false))
  note('4 his row drawn', await P.locator(`tr[data-testid="row-${S}"]`).count())
  await P.waitForTimeout(600)
  await toJul()
  const nOff = await readNote()
  note('5 clash note, SANS off (opened)', nOff)
  if (nOff.found) await clashPic('5-note-sans-off')
  if (nOff.found) {
    const names = JSON.stringify(nOff.rows)
    note('5 names the man', { Zenith: names.includes(SCS) })
    F.check('R2-5 D1542 the link for a man with no row reads "Decide it in Approvals ›"', SIZE, linkWords(nOff).includes('Decide it in Approvals ›') && !linkWords(nOff).includes('Decide the bid'), linkWords(nOff), [pre + '5-note-sans-off'])
    const t = await tapNote('6-tap-sans-off')
    const ap = await apprState()
    note('6 tap with SANS off (no row for him)', { ...t, approvals: ap })
    F.check('R2-6 D1542 its tap opens Approvals with his request ringed, in view', SIZE, ap.up && ap.ringed.includes(`appr-line-${S}`) && ap.ringInView && !t.dayList && !t.oneDay, JSON.stringify(ap), [pre + '6-tap-sans-off'])
    await L.openGrid(w)
    await closeAll()
    note('6 after closing: page, windows', await surface())
  }
  await L.openGrid(w)
  note('7 + SANS back on', await setSans(true))
  await P.waitForTimeout(600)
  await toJul()
  const nBack = await readNote()
  note('7 clash note, SANS back on', nBack)
  if (nBack.found) {
    await clashPic('7-note-sans-back')
    F.check('R2-7 D1542 a man with a row keeps "Decide the bid ›"', SIZE, linkWords(nBack).includes('Decide the bid ›'), linkWords(nBack), [pre + '7-note-sans-back'])
    const t = await tapNote('8-tap-sans-back'); note('8 tap with "+ SANS" back on', t)
    F.check('R2-8 his day opens for him, as before', SIZE, !!(t.dayList || t.oneDay), JSON.stringify({ dayList: t.dayList, oneDay: t.oneDay }), [pre + '8-tap-sans-back'])
    await closeAll()
  }
  /* R2b — his bid approved (SANS on, his row there), then SANS off: the approved leave's own window on the Inputs page */
  note('9 his bid approved on Approvals', await L.approveOn(w, S, DAY))
  note('9 his war leave', await L.warLeave(w, S))
  note('10 SANS taken off again', await setSans(false))
  await P.waitForTimeout(600)
  await toJul()
  const nApp = await readNote()
  note('10 clash note, approved leave, SANS off', nApp)
  if (nApp.found) {
    await clashPic('10-note-approved-sans-off')
    F.check('R2-10 D1542 approved leave, no row: "Change the leave on Inputs ›"', SIZE, linkWords(nApp).includes('Change the leave on Inputs ›') && !linkWords(nApp).includes('Change the approved leave'), linkWords(nApp), [pre + '10-note-approved-sans-off'])
    const leave = (await L.warLeave(w, S))[0]
    const t = await tapNote('11-tap-approved-sans-off')
    const win = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-inputedit"]'); return e && e.getBoundingClientRect().width > 0 ? { type: document.querySelector('#inpEditType')?.value, text: e.innerText.replace(/\s+/g, ' ').slice(0, 140) } : null })
    note('11 tap: the leave own window', { page: t.page, window: win, leave })
    F.check('R2-11 D1542 its tap opens that leave own window on the Inputs page', SIZE, t.page === 'inputs' && !!win && win.type === 'LL', JSON.stringify({ page: t.page, win }), [pre + '11-tap-approved-sans-off'])
    if (win) { await L.press(w, '#inpEditCancel').catch(() => {}); await P.waitForTimeout(400) }
  } else F.check('R2-10 D1542 approved leave, no row: the clash note', SIZE, false, 'no clash note drawn', [])
} catch (e) { note('STEP-ERROR (NOT WALKED beyond here)', String(e).split('\n')[0].slice(0, 300)); await L.shot(w, pre + 'zz-step-error').catch(() => {}) }
note('errors', w.errs.length ? w.errs : 'none')
L.rec('R2 clash note link for a man with no row', SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
L.writeResults(`r2-${SIZE}`)
await L.closeBrowser()
