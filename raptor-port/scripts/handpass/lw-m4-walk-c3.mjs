// walker C, scenario 5 — bidding opened and closed: the bell's Leave War lines (desktop)
const CL = await import('./lw-m4-walk-c-lib.mjs')
const L = await CL.setup('c', 's5')
const H = CL.mk(L)
const { T, rec, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c3 v3 SEED=' + (process.env.SEED || '') + ']')
L.clearOut()
const size = 'desk'
const w = await L.newCtx(size)
const P = w.page
let before = []
const say = (...a) => console.log(...a)
const wait = ms => P.waitForTimeout(ms)
const monthState = k => P.locator(T(`od-month-${k}`)).getAttribute('data-state')
async function openDates() { await press(w, T('open-chip')); await P.waitForSelector(T('open-dates'), { state: 'visible' }); await wait(500) }
async function closeDates() { await press(w, T('open-dates-close')); await wait(400) }
async function memberBell(id, label) {
  await L.switchTo(w, 'member')
  const after = await H.bell(w)
  const fresh = H.bellDiff(before, after)
  await shot(w, `${id}-bell`)
  say(`   bell after ${label}: all=${after.length} new=${fresh.length}`, fresh.map(l => `${l.unread ? '*' : ''}${l.text}`).join(' | '))
  const gone = before.filter(b => !after.some(a => a.id === b.id))
  if (gone.length) say(`   lines gone: ${gone.map(g => g.text).join(' | ')}`)
  before = after
  return { fresh, after, gone }
}
try {
  await L.signIn(w, 'member')
  /* a write first (the order's 7.7): Ranger bids, so the saved world is whole */
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
  before = await H.bell(w); await L.closeBell(w)
  await L.switchTo(w, 'admin')
  await shot(w, '5-start-grid')
  await openDates()
  await shot(w, '5-opendates-start')
  /* v2: the seed already holds Jan-Mar open, so Apr-Jun would join it ("1 Jan - 30 Jun", seen in v1);
     to walk the brief's case literally close Jan, Feb, Mar first (three taps), read his bell, then open Apr-Jun */
  if (!process.env.SEED) {
  for (const k of ['2026-01', '2026-02', '2026-03']) { await press(w, T(`od-month-${k}`)); await wait(500) }
  await shot(w, '5-pre-closed-janmar')
  say('   after closing Jan-Mar:', await txt(P, T('od-lines')), '| states', await Promise.all(['2026-01', '2026-02', '2026-03'].map(async k => k + '=' + await monthState(k))))
  await closeDates()
  let pre = await memberBell('5-pre', 'close Jan, Feb, Mar')
  rec('5-pre closing Jan-Mar (set-up) -> what the bell says', size, 'PASS', `${pre.fresh.length} new: ` + pre.fresh.map(l => l.text).join(' | ') + ` ;; gone: ` + pre.gone.map(g => g.text).join(' | '), ['5-pre-bell'])
  await L.switchTo(w, 'admin')
  await openDates()
  }
  say('   months at start:', await Promise.all(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'].map(async k => k + '=' + await monthState(k))))
  /* 5a: open Apr, May, Jun by three month taps */
  for (const k of ['2026-04', '2026-05', '2026-06']) { await press(w, T(`od-month-${k}`)); await wait(500) }
  await shot(w, '5a-opendates-after-three')
  say('   lines:', await txt(P, T('od-lines')))
  await closeDates()
  let r = await memberBell('5a', 'open Apr, May, Jun')
  const aprJun = r.after.filter(l => /bidding/i.test(l.text))
  rec('5a Apr+May+Jun opened by three taps -> ONE line', size, r.fresh.length === 1 && /Leave War.*1 Apr.*30 Jun.*bidding open.*Saber/.test(r.fresh[0].text) ? 'PASS' : 'FAIL', `${r.fresh.length} new: ` + r.fresh.map(l => l.text).join(' | '), ['5a-bell'])
  /* tap the bidding line -> the war with the stretch in view */
  if (r.fresh.length) {
    await H.pressLoc(w, P.locator(T(`bell-line-${r.fresh[0].id}`)).first()); await wait(900)
    await shot(w, '5a-tap')
    const vp = await P.evaluate(() => { const first = [...document.querySelectorAll('[data-testid^="head-2026-"]')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.left > 215 && b.right < innerWidth }); return { first: first[0]?.dataset.testid, last: first[first.length - 1]?.dataset.testid, n: first.length, tabs: [...document.querySelectorAll('[data-testid^="lw-tab-"]')].map(e => e.dataset.testid).join(' ') } })
    say('   tap: view', JSON.stringify(vp))
    rec('5a tap on the bidding line -> the war with that stretch in view', size, vp.first && /2026-0[4-6]/.test(vp.first) ? 'PASS' : 'FAIL', JSON.stringify(vp), ['5a-tap'])
  }
  /* 5b: close May */
  await L.switchTo(w, 'admin')
  await openDates()
  await press(w, T('od-month-2026-05')); await wait(600)
  await shot(w, '5b-opendates-closed-may')
  say('   lines:', await txt(P, T('od-lines')))
  await closeDates()
  r = await memberBell('5b', 'close May')
  const liveBid = r.after.filter(l => /bidding open/i.test(l.text))
  say('   all bidding lines now:', liveBid.map(l => l.text).join(' | '))
  rec('5b close May -> TWO live lines, Apr and Jun, none saying Apr-Jun', size,
    r.fresh.length === 2 && r.fresh.some(l => /1 – 30 Apr|1 Apr – 30 Apr|1–30 Apr/.test(l.text) || /Apr/.test(l.text)) && r.fresh.some(l => /Jun/.test(l.text)) && !r.after.some(l => /1 Apr.*30 Jun/.test(l.text)) ? 'PASS' : 'FAIL',
    `${r.fresh.length} new: ` + r.fresh.map(l => l.text).join(' | ') + ` ;; any Apr-Jun line left: ${r.after.some(l => /1 Apr.*30 Jun/.test(l.text))} ;; gone: ${r.gone.map(g => g.text).join(' | ')}`, ['5b-bell'])
  /* 5c: close Apr and Jun */
  await L.switchTo(w, 'admin')
  await openDates()
  await press(w, T('od-month-2026-04')); await wait(500)
  await press(w, T('od-month-2026-06')); await wait(600)
  await shot(w, '5c-opendates-closed-apr-jun')
  await closeDates()
  const adminBell = await H.bell(w)
  await shot(w, '5c-admin-bell')
  rec('5d the admin bell gets no bidding line of his own', size, adminBell.every(l => !/bidding/i.test(l.text)) ? 'PASS' : 'FAIL', `${adminBell.length} lines: ` + adminBell.map(l => l.text).join(' | '), ['5c-admin-bell'])
  await L.closeBell(w)
  r = await memberBell('5c', 'close Apr and Jun')
  rec('5c close Apr and Jun -> closed', size, r.fresh.length >= 1 && r.after.filter(l => /bidding closed/i.test(l.text)).length >= 1 && !r.after.some(l => /Apr.*bidding open|Jun.*bidding open/.test(l.text)) ? 'PASS' : 'FAIL',
    `${r.fresh.length} new: ` + r.fresh.map(l => l.text).join(' | ') + ` ;; open lines left: ` + r.after.filter(l => /bidding open/.test(l.text)).map(l => l.text).join(' | '), ['5c-bell'])
  /* 5e: Undo takes the line back � in the SAME admin session (D148: the undo list clears at sign-out, so a switch between
     the change and the Undo would leave nothing to undo � v1 of this step undid nothing) */
  await L.switchTo(w, 'admin')
  await openDates(); await press(w, T('od-month-2026-07')); await wait(500); await closeDates()
  await shot(w, '5e-after-open-jul')
  await L.undo(w)
  await shot(w, '5e-after-undo')
  const julState = await P.evaluate(() => document.querySelector('[data-testid="open-chip"]')?.innerText.replace(/\s+/g, ' '))
  say('   chip after undo:', julState)
  r = await memberBell('5e', 'open Jul then Undo (line never read)')
  rec('5e Undo of an opening in the same admin session -> no line for it', size, !r.after.some(l => /Jul/.test(l.text)) && r.fresh.length === 0 ? 'PASS' : 'FAIL', `chip "${julState}"; new: ${r.fresh.map(l => l.text).join(' | ')}; any Jul line: ${r.after.some(l => /Jul/.test(l.text))}`, ['5e-bell', '5e-after-undo'])
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 400))
  await shot(w, 'error').catch(() => {})
}
if (w.errs.length) rec('console', size, 'FAIL', w.errs.join(' || ').slice(0, 800))
L.writeResults('s5')
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
