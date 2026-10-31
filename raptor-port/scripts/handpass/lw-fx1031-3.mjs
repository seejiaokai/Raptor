// Leave War fixes of 31 Oct 26 — scenario R3: a sheet that offers what the war then refuses (before-fix walk; re-run later as the re-walk).
//  R3a  an AM LL placed by the admin (Auto-approve on) on Drifter's Thu D2; the day tapped again — which Duration and leave buttons are
//       offered — then Whole day + LL pressed: the exact words.
//  R3b  a morning LL filed on the Inputs page by the member Ranger (us) on Fri D2b; the Leave War's day tapped (as the member, then as the admin):
//       which halves are offered.
//  R3c  a pending LL for Ranger on Wed D3 refused; Ranger files a medical over D3 on the Inputs page; the admin taps D3: which buttons
//       the refused bid offers; Approve pressed: the exact words.
// Run from raptor-port:  SIZE=desk|phone  LW_DIST=<build>  [LW_OUT=<folder under docs/img/handpass>]  [ONLY=r3a,r3b,r3c]
//   node scripts/handpass/lw-fx1031-3.mjs
process.env.LW_OUT ||= '2026-10-31-lw-fixes/before'
process.env.LW_TOASTS ||= '1' /* passing notes stay drawn, so a picture shows what the app said */
const L = await import('./lw-rr-lib.mjs')
const F = await import('./lw-fx1031-lib.mjs')
const SIZE = F.SIZE
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-fx1031-3 v1]', SIZE, 'today', L.TODAY)
F.clearMine(`r3a-${SIZE}-`); F.clearMine(`r3b-${SIZE}-`); F.clearMine(`r3c-${SIZE}-`); F.clearMine(`r3c2-${SIZE}-`); F.clearMine(`r3-fileform-${SIZE}`)
const D2 = L.day(8), D2B = L.day(9), D3 = L.day(7)
const errsAll = []

/* every visible control of the open window (the one-day sheet or the day's list), as drawn */
const winState = w => w.page.evaluate(() => {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const root = [...document.querySelectorAll('[data-testid="bid-picker"],[data-testid="daylist-sheet"]')].find(vis) || [...document.querySelectorAll('[role=dialog],[data-testid$="-sheet"],[data-testid^="win-"],[data-testid$="-win"]')].filter(vis).filter(e => !/^(settings|lw-)/.test(e.dataset.testid || '')).pop()
  if (!root) return null
  const lit = e => (e.getAttribute('aria-pressed') || e.getAttribute('aria-checked') || '') + (/\b(on|lit|sel|active|picked|cur)\b/.test(e.className) ? ' cls:' + (e.className.match(/\b(on|lit|sel|active|picked|cur)\b/g) || []).join('+') : '')
  return { root: root.dataset.testid, text: root.innerText.replace(/\s+/g, ' ').trim().slice(0, 400),
    buttons: [...root.querySelectorAll('button')].filter(vis).map(b => (b.dataset.testid || '?') + (b.disabled ? '(disabled)' : '') + '[' + lit(b) + '|' + (b.className.match(/lit-\w+|s-\w|is-\w+|off|dim/g) || []).join('+') + ']:' + b.innerText.replace(/\s+/g, ' ').trim().slice(0, 24)) }
})
const saidSince = (w, n) => w.page.evaluate(n => (window.__said || []).slice(n), n)
const saidLen = w => w.page.evaluate(() => (window.__said || []).length)
const cellSum = async (w, pid, d) => ({ cell: await F.cellWords(w, pid, d), inputs: (await L.inputsOf(w.page, pid)).filter(r => /(Nov|Dec)/.test(r.date || '')) })

/* ---------------- R3a ---------------- */
async function r3a() {
  const pre = `r3a-${SIZE}-`; const log = []
  const note = (k, v) => { log.push([k, v]); console.log(`  r3a ${k}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
  const w = await F.world('admin'); const P = w.page
  const id = await L.pidOf(P, 'Drifter')
  note('who', `Drifter (${id}), D2 = ${D2} (${L.dm(D2)}), cell before: ${await F.cellWords(w, id, D2)}`)
  await L.openCell(w, id, D2)
  note('Auto-approve on', await L.autoApprove(w, true))
  await L.press(w, L.T('portion-am')); await P.waitForTimeout(300)
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(700)
  const stillOpen = await L.vis(P, L.T('bid-picker'))
  note('1 pressed AM then LL (Auto-approve on)', { windowStillOpen: stillOpen, said: await L.lastSaid(w, 2), ...(await cellSum(w, id, D2)) })
  await F.settle(w)
  await L.reachCell(w, id, D2); await L.rowShot(w, id, L.day(5), L.day(11), pre + '1-row-after-am-ll')
  /* the day tapped again */
  await L.openCell(w, id, D2)
  const st = await winState(w)
  await L.shot(w, pre + '2-window-tapped-again')
  note('2 the window tapped again', st)
  /* Whole day + LL */
  const n0 = await saidLen(w)
  const fullOk = await L.vis(P, L.T('portion-full'))
  if (fullOk) await L.press(w, L.T('portion-full')); await P.waitForTimeout(300)
  const st2 = await winState(w)
  await L.shot(w, pre + '3-whole-day-picked')
  note('3 Whole day pressed', { offered: fullOk, window: st2 })
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(700)
  await L.shot(w, pre + '4-after-whole-day-ll')
  const st3 = await winState(w)
  note('4 then LL pressed', { windowStillOpen: !!st3, windowText: st3 && st3.text, buttons: st3 && st3.buttons, said: await saidSince(w, n0), ...(await cellSum(w, id, D2)) })
  /* the same with an approved leave tapped as the day's other half: Whole day + OL / CCL for comparison of the wording */
  if (st3) { await L.press(w, L.T('bid-OL')); await P.waitForTimeout(700); const st4 = await winState(w); await L.shot(w, pre + '5-whole-day-ol'); note('5 Whole day then OL pressed', { windowStillOpen: !!st4, windowText: st4 && st4.text, said: await saidSince(w, n0), ...(await cellSum(w, id, D2)) }) }
  await F.settle(w)
  errsAll.push(...w.errs.map(e => 'r3a ' + e)); note('errors', w.errs.length ? w.errs : 'none')
  L.rec('R3a AM LL then the sheet tapped again', SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
  await w.ctx.close()
}

/* the member files one input on the Inputs page: the day tapped, + Input, the type, the portion, Add */
async function fileOnInputs(w, d, type, portion) {
  const P = w.page
  await L.goPage(w, 'inputs', 'Inputs')
  /* the calendar's month, by its own heading */
  const want = +d.slice(0, 4) * 12 + +d.slice(5, 7) - 1
  const MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  for (let i = 0; i < 12; i++) {
    const lab = (await P.locator('#inpCal .ic-mon, .ic-mon').first().getAttribute('aria-label').catch(() => null)) || ''
    const m = lab.match(/^(\w+) (\d{4})$/); if (!m) break
    const at = +m[2] * 12 + MONS.indexOf(m[1]); if (at === want) break
    await L.press(w, at > want ? '#icPrev' : '#icNext'); await P.waitForTimeout(300)
  }
  await L.press(w, `[data-icday="${d}"]`); await P.waitForTimeout(600)
  await L.press(w, '#icPopAdd'); await P.waitForTimeout(800)
  const opts = await P.locator('#inpEditType option').allInnerTexts()
  let chose = type
  if (typeof type === 'function') chose = type(opts)
  await P.selectOption('#inpEditType', { label: chose }).catch(async () => { await P.selectOption('#inpEditType', chose) })
  await P.waitForTimeout(400)
  if (portion) {
    const b = P.locator('[data-testid="win-inputedit"] button').filter({ hasText: new RegExp(`^${portion}$`) }).first()
    if (await b.count()) { await b.evaluate(e => e.setAttribute('data-fxpress', '1')); await L.press(w, '[data-fxpress="1"]'); await P.waitForTimeout(300) }
  }
  const dateOk = await P.locator(L.T(`inpEdCal-day-${d}`)).count() ? await P.locator(L.T(`inpEdCal-day-${d}`)).first().evaluate(e => e.className + '|' + e.getAttribute('aria-pressed')) : 'no day button'
  await L.shot(w, `r3-fileform-${SIZE}-${w.tag || ''}${chose.replace(/\W/g, '')}`)
  const before = await P.evaluate(() => (window.__said || []).length)
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(700)
  if (await L.vis(P, L.T('docconf-nodoc'))) { await L.press(w, L.T('docconf-nodoc')); await P.waitForTimeout(600) }
  const stillOpen = await L.vis(P, '#inpEditSave')
  /* the day's window stays open behind the form; on a phone it covers the top bar — a person closes it with its ✕ before going on */
  const dayStays = await L.vis(P, L.T('win-inputsday'))
  await L.shot(w, `r3-afterfile-${SIZE}-${w.tag || ''}${chose.replace(/\W/g, '')}`)
  if (dayStays) { await L.press(w, L.T('win-inputsday-x')); await P.waitForTimeout(400) }
  return { options: opts.join(','), chose, dateButton: dateOk, saidAfterSave: await P.evaluate(n => (window.__said || []).slice(n), before), formStillOpen: stillOpen, dayWindowStayedOpenAfterAdd: dayStays }
}

/* ---------------- R3b ---------------- */
async function r3b() {
  const pre = `r3b-${SIZE}-`; const log = []
  const note = (k, v) => { log.push([k, v]); console.log(`  r3b ${k}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
  const w = await F.world('member'); const P = w.page
  const id = await L.pidOf(P, 'Ranger')
  note('who', `Ranger (${id}) as the member us; D2b = ${D2B} (${L.dm(D2B)}); inputs of his in Nov/Dec before: ${JSON.stringify((await L.inputsOf(P, id)).filter(r => /(Nov|Dec)/.test(r.date || '')))}`)
  const f = await fileOnInputs(w, D2B, 'LL', 'AM')
  note('1 filed on the Inputs page (LL, AM)', f)
  await L.shot(w, pre + '1-inputs-after-filing')
  note('1 his inputs now', (await L.inputsOf(P, id)).filter(r => /(Nov|Dec)/.test(r.date || '')))
  /* as the member, on the Leave War: his own day */
  try { await L.toWar(w) } catch (e) {
    await L.shot(w, pre + '2-zz-toWar-failed').catch(() => {})
    note('2 NOT WALKED as the member: opening the Leave War failed', { error: String(e).split('\n').slice(0, 3).join(' ## ').slice(0, 300), page: await P.evaluate(() => window.CURPAGE), visibleDialogs: await P.evaluate(() => [...document.querySelectorAll('[role=dialog],[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid || e.id)) })
    /* the walk goes on as the admin */
    await L.signOut(w); await L.signInSaved(w, 'admin'); await L.toWar(w)
  }
  await L.openGrid(w); await L.reachCell(w, id, D2B)
  note('2 his cell on the grid', await F.cellWords(w, id, D2B))
  await L.rowShot(w, id, L.day(6), L.day(12), pre + '2-row-member')
  await L.openCell(w, id, D2B)
  note('3 the window tapped as the member', await winState(w)); await L.shot(w, pre + '3-window-member')
  await F.settle(w)
  /* as the admin */
  await L.signOut(w); await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D2B)
  note('4 his cell, as the admin', await F.cellWords(w, id, D2B))
  await L.openCell(w, id, D2B)
  note('5 the window tapped as the admin', await winState(w)); await L.shot(w, pre + '5-window-admin')
  const n0 = await saidLen(w)
  if (await L.vis(P, L.T('portion-full'))) { await L.press(w, L.T('portion-full')); await P.waitForTimeout(300) }
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(700)
  await L.shot(w, pre + '6-admin-whole-day-ll')
  const st = await winState(w)
  note('6 admin: Whole day + LL', { windowText: st && st.text, said: await saidSince(w, n0), ...(await cellSum(w, id, D2B)) })
  await F.settle(w)
  errsAll.push(...w.errs.map(e => 'r3b ' + e)); note('errors', w.errs.length ? w.errs : 'none')
  L.rec('R3b AM LL filed on the Inputs page, then the day tapped', SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
  await w.ctx.close()
}

/* ---------------- R3c ---------------- */
async function r3c(medType = 'OML', tag = 'r3c') {
  const pre = `${tag}-${SIZE}-`; const log = []
  const note = (k, v) => { log.push([k, v]); console.log(`  ${tag} ${k}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
  const w = await F.world('admin'); const P = w.page
  const id = await L.pidOf(P, 'Ranger')
  note('who', `Ranger (${id}), D3 = ${D3} (${L.dm(D3)}), cell before ${await F.cellWords(w, id, D3)}`)
  const ok = await L.pendingLL(w, id, D3)
  await F.toApprovals(w)
  const before = await F.apprRead(w, id)
  /* his line is found by its date words ("11 Nov"), never by the day number alone — "11" is also inside a balance like 11.5 */
  const i = before.findIndex(l => l.text.includes(L.dm(D3) + ' ›') || l.text.includes(L.dm(D3) + ','))
  const pressed = i >= 0 ? await L.apprPress(w, id, 'appr-refuse', i) : false
  await P.waitForTimeout(400)
  await L.shot(w, pre + '1-approvals-refused')
  note('1 a pending LL placed and refused on Approvals', { placed: ok, lineIndex: i, pressed, linesBefore: before, linesAfter: await F.apprRead(w, id) })
  await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D3)
  note('1 his cell', await F.cellWords(w, id, D3))
  await L.rowShot(w, id, L.day(4), L.day(10), pre + '1-row-refused')
  /* the member files a medical over D3 */
  await L.signOut(w); await L.signInSaved(w, 'member')
  const pick = opts => opts.map(s => s.trim()).includes(medType) ? medType : opts[opts.length - 1]
  w.tag = 'c-'
  const f = await fileOnInputs(w, D3, pick, null)
  note('2 the member filed a medical over D3 on the Inputs page', f)
  await L.shot(w, pre + '2-inputs-after-medical')
  note('2 his inputs now', (await L.inputsOf(P, id)).filter(r => /(Nov|Dec)/.test(r.date || '')))
  /* back as the admin */
  await L.signOut(w); await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D3)
  note('3 his cell on D3, as the admin', await F.cellWords(w, id, D3))
  await L.rowShot(w, id, L.day(4), L.day(10), pre + '3-row-after-medical')
  await L.openCell(w, id, D3)
  const st = await winState(w); await L.shot(w, pre + '4-window-d3')
  note('4 the window tapped', st)
  const n0 = await saidLen(w)
  /* the window is the one-day sheet (decide-approve) or the day's list (dl-approve-<record>) */
  const apprSel = st ? await P.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="decide-approve"],[data-testid^="dl-approve-"]')].find(e => e.getBoundingClientRect().width > 0); if (!b) return null; b.setAttribute('data-fxpress', '1'); return '[data-fxpress="1"]' }) : null
  if (apprSel) {
    await L.press(w, apprSel); await P.waitForTimeout(700)
    await L.shot(w, pre + '5-after-approve')
    const st2 = await winState(w)
    note('5 Approve pressed', { windowText: st2 && st2.text, buttons: st2 && st2.buttons, said: await saidSince(w, n0), ...(await cellSum(w, id, D3)) })
  } else note('5 Approve', 'not offered in the window (no decide-approve / dl-approve button visible)')
  await F.settle(w)
  await F.toApprovals(w)
  note('6 Approvals lines for him after', await F.apprRead(w, id)); await L.shot(w, pre + '6-approvals-after')
  errsAll.push(...w.errs.map(e => tag + ' ' + e)); note('errors', w.errs.length ? w.errs : 'none')
  L.rec(`${tag.toUpperCase()} a refused bid under a medical (${medType}) filed since`, SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
  await w.ctx.close()
}

for (const [id, fn] of [['r3a', r3a], ['r3b', r3b], ['r3c', () => r3c('OML', 'r3c')], ['r3c2', () => r3c('ATT C', 'r3c2')]]) {
  if (!want(id)) continue
  try { await fn() } catch (e) { console.log(`  ${id} STEP-ERROR (NOT WALKED beyond here):`, String(e).split('\n')[0].slice(0, 400)); errsAll.push(id + ' STEP-ERROR ' + String(e).split('\n')[0].slice(0, 200)) }
}
L.writeResults(`r3-${SIZE}`)
console.log('ALL ERRORS:', errsAll.length ? errsAll : 'none')
await L.closeBrowser()
