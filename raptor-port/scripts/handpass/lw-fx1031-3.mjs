// Leave War fixes of 31 Oct 26 — scenario R3: a sheet that offers what the war then refuses (before-fix walk; re-run later as the re-walk).
//  R3a  an AM LL placed by the admin (Auto-approve on) on Drifter's Thu D2; the day tapped again — which Duration and leave buttons are
//       offered — then Whole day + LL pressed: the exact words.
//  R3b  a morning LL filed on the Inputs page by the member Ranger (us) on Fri D2b; the Leave War's day tapped (as the member, then as the admin):
//       which halves are offered.
//  R3c  a pending LL for Ranger on Wed D3 refused; Ranger files a medical over D3 on the Inputs page; the admin taps D3: which buttons
//       the refused bid offers; Approve pressed: the exact words.
// THE RE-WALK (his D1543, D1544, 31 Oct 26): R3a — AM lit, Whole day greyed (a tap on it changes nothing), LL pressed says
// "The morning is LL. Pick PM to place the afternoon." and writes nothing, PM + OL then lands; R3b — only PM offered, as
// before; R3c — the refused bid's Approve greyed, its title "OML holds 11 Nov, so the bid can't be approved", a tap on it
// changes nothing, Refuse and Delete still there. Each recorded PASS / FAIL.
// Run from raptor-port:  SIZE=desk|phone  LW_DIST=<build>  [LW_OUT=<folder under docs/img/handpass>]  [ONLY=r3a,r3b,r3c]
//   node scripts/handpass/lw-fx1031-3.mjs
process.env.LW_OUT ||= '2026-10-31-lw-fixes/before'
process.env.LW_TOASTS ||= '1' /* passing notes stay drawn, so a picture shows what the app said */
const L = await import('./lw-rr-lib.mjs')
const F = await import('./lw-fx1031-lib.mjs')
const SIZE = F.SIZE
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-fx1031-3 v2]', SIZE, 'today', L.TODAY)
/* only the pictures of the scenarios this run walks are emptied (ONLY=r3d must not wipe R3a–R3c's) */
for (const t of ['r3a', 'r3b', 'r3c', 'r3c2', 'r3d']) if (want(t)) F.clearMine(`${t}-${SIZE}-`)
if (!ONLY.length) F.clearMine(`r3-fileform-${SIZE}`)
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
/* the Duration row as drawn: each half's button — there, pressed, greyed */
const durState = w => w.page.evaluate(() => Object.fromEntries(['full', 'am', 'pm'].map(k => {
  const b = [...document.querySelectorAll(`[data-testid="portion-${k}"]`)].find(e => e.getBoundingClientRect().width > 0)
  return [k, b ? { on: b.getAttribute('aria-pressed') === 'true', disabled: b.disabled, opacity: getComputedStyle(b).opacity } : null]
})))
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
  const d2 = await durState(w)
  F.check('R3a-2 D1543 an approved morning: AM lit, Whole day greyed, PM offered', SIZE, !!d2.am?.on && !!d2.full?.disabled && +d2.full.opacity < 1 && !!d2.pm && !d2.pm.disabled,
    JSON.stringify(d2), [pre + '2-window-tapped-again'])
  /* a tap on the greyed Whole day: nothing changes */
  const n0 = await saidLen(w)
  const cell0 = await F.cellWords(w, id, D2)
  if (d2.full) await L.press(w, L.T('portion-full')); await P.waitForTimeout(300)
  const d3 = await durState(w)
  await L.shot(w, pre + '3-whole-day-tapped')
  F.check('R3a-3 D1543 a tap on the greyed Whole day changes nothing', SIZE, !!d3.am?.on && !d3.full?.on, JSON.stringify(d3), [pre + '3-whole-day-tapped'])
  /* LL pressed with the held morning lit */
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(700)
  await L.shot(w, pre + '4-held-half-ll')
  const st3 = await winState(w)
  const cell4 = await F.cellWords(w, id, D2)
  note('4 LL pressed with the held morning lit', { windowStillOpen: !!st3, windowText: st3 && st3.text, said: await saidSince(w, n0), ...(await cellSum(w, id, D2)) })
  F.check('R3a-4 D1543 a leave pressed on the held half says which half to pick, and writes nothing', SIZE,
    !!st3 && st3.text.includes('The morning is LL. Pick PM to place the afternoon.') && !/clear it first/.test(st3.text) && cell4 === cell0,
    JSON.stringify({ text: st3 && st3.text.slice(0, 200), cellBefore: cell0, cellAfter: cell4 }), [pre + '4-held-half-ll'])
  /* the free half picked, a leave lands there */
  if (st3) {
    await L.press(w, L.T('portion-pm')); await P.waitForTimeout(300)
    await L.press(w, L.T('bid-OL')); await P.waitForTimeout(700)
    await F.settle(w)
    await L.reachCell(w, id, D2); await L.rowShot(w, id, L.day(5), L.day(11), pre + '5-row-pm-ol')
    const cell5 = await F.cellWords(w, id, D2)
    note('5 PM then OL pressed', { cell: cell5, ...(await cellSum(w, id, D2)) })
    F.check('R3a-5 the free half picked: OL lands in the afternoon beside the approved morning', SIZE, /LL/.test(cell5) && /OL/.test(cell5), cell5, [pre + '5-row-pm-ol'])
  }
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
  const dm3 = await durState(w)
  /* his November dates are not open for him (D1177), so his own day opens his leave's Remarks window (D1354), as on main —
     the check is that no window offers him the held morning or a whole day; where his dates are open, only PM */
  const root3 = (await winState(w))?.root
  F.check('R3b-3 a morning filed on the Inputs page: neither Whole day nor AM offered (the member)', SIZE,
    !dm3.full && !dm3.am && (!!dm3.pm?.on || root3 === 'remarks-sheet'), JSON.stringify({ window: root3, ...dm3 }), [pre + '3-window-member'])
  await F.settle(w)
  /* as the admin */
  await L.signOut(w); await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D2B)
  note('4 his cell, as the admin', await F.cellWords(w, id, D2B))
  await L.openCell(w, id, D2B)
  note('5 the window tapped as the admin', await winState(w)); await L.shot(w, pre + '5-window-admin')
  const da5 = await durState(w)
  F.check('R3b-5 a morning filed on the Inputs page: only PM offered (the admin)', SIZE, !da5.full && !da5.am && !!da5.pm?.on, JSON.stringify(da5), [pre + '5-window-admin'])
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
  const apprBtn = apprSel ? await P.evaluate(() => { const b = document.querySelector('[data-fxpress="1"]'); return { disabled: b.disabled, title: b.title, opacity: getComputedStyle(b).opacity } }) : null
  const others = await P.evaluate(() => [...document.querySelectorAll('[data-testid="decide-refuse"],[data-testid^="dl-refuse-"],[data-testid^="dl-clear-"],[data-testid="sel-clear"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + (e.disabled ? '(disabled)' : '')))
  /* the holder as the grid's box writes it — ATT B and ATT C are his B and C (engine/codes.ts boxText) */
  const holder = ({ 'ATT B': 'B', 'ATT C': 'C' })[medType] || medType
  F.check(`${tag.toUpperCase()}-4 D1544 the refused bid's Approve greyed under ${medType}, its title naming the holder; Refuse and Delete there`, SIZE,
    !!apprBtn && apprBtn.disabled && +apprBtn.opacity < 1 && apprBtn.title === `${holder} holds ${L.dm(D3)}, so the bid can’t be approved` && others.some(t => /refuse/.test(t) && !/disabled/.test(t)) && others.some(t => /clear/.test(t)),
    JSON.stringify({ approve: apprBtn, others }), [pre + '4-window-d3'])
  if (apprSel) {
    await L.press(w, apprSel); await P.waitForTimeout(700)
    await L.shot(w, pre + '5-after-approve')
    const st2 = await winState(w)
    const c5 = await cellSum(w, id, D3)
    note('5 Approve pressed', { windowText: st2 && st2.text, buttons: st2 && st2.buttons, said: await saidSince(w, n0), ...c5 })
    F.check(`${tag.toUpperCase()}-5 D1544 a tap on the greyed Approve changes nothing`, SIZE, !c5.inputs.some(r => r.type === 'LL'), JSON.stringify(c5), [pre + '5-after-approve'])
  } else note('5 Approve', 'not offered in the window (no decide-approve / dl-approve button visible)')
  await F.settle(w)
  await F.toApprovals(w)
  note('6 Approvals lines for him after', await F.apprRead(w, id)); await L.shot(w, pre + '6-approvals-after')
  errsAll.push(...w.errs.map(e => tag + ' ' + e)); note('errors', w.errs.length ? w.errs : 'none')
  L.rec(`${tag.toUpperCase()} a refused bid under a medical (${medType}) filed since`, SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
  await w.ctx.close()
}

/* ---------------- R3d — the fresh read's F1 (31 Oct 26): a refused leave of several days, a medical on its middle day ---------------- */
async function r3d() {
  const tag = 'r3d', pre = `${tag}-${SIZE}-`; const log = []
  const note = (k, v) => { log.push([k, v]); console.log(`  ${tag} ${k}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
  const D4 = L.day(14), D5 = L.day(15), D6 = L.day(16)
  const w = await F.world('admin'); const P = w.page
  const id = await L.pidOf(P, 'Ranger')
  note('who', `Ranger (${id}), ${D4}…${D6} (${L.dm(D4)}–${L.dm(D6)})`)
  /* three next-door pending LL, each placed in the one-day window (Auto-approve off) — one leave on Approvals (D1339, D1346) */
  const placed = []
  for (const d of [D4, D5, D6]) placed.push(await L.pendingLL(w, id, d))
  await F.toApprovals(w)
  const before = await F.apprRead(w, id)
  const i = before.findIndex(l => l.text.includes(L.dm(D4).split(' ')[0]) && l.text.includes(L.dm(D6).split(' ')[0]))
  const pressed = i >= 0 ? await L.apprPress(w, id, 'appr-refuse', i) : false
  await P.waitForTimeout(400)
  await L.shot(w, pre + '1-approvals-refused')
  note('1 three pending LL placed, refused as one line', { placed, lineIndex: i, pressed, lines: await F.apprRead(w, id) })
  /* the member files a medical on the middle day */
  await L.signOut(w); await L.signInSaved(w, 'member')
  w.tag = 'd-'
  const f = await fileOnInputs(w, D5, opts => (opts.map(x => x.trim()).includes('OML') ? 'OML' : opts[opts.length - 1]), null)
  note('2 the member filed OML on the middle day', f)
  /* back as the admin: the first day tapped — the whole leave's window */
  await L.signOut(w); await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D4)
  await L.rowShot(w, id, L.day(12), L.day(18), pre + '3-row')
  note('3 his cells', { d4: await F.cellWords(w, id, D4), d5: await F.cellWords(w, id, D5), d6: await F.cellWords(w, id, D6) })
  await L.openCell(w, id, D4)
  await L.shot(w, pre + '4-window-all')
  const all = await P.evaluate(() => {
    const vis = e => e && e.getBoundingClientRect().width > 0
    const ap = [...document.querySelectorAll('[data-testid="decide-approve"]')].find(vis)
    const sc = [...document.querySelectorAll('[data-testid="scope-all"]')].find(vis)
    return { scopeAll: sc ? sc.getAttribute('aria-pressed') : null, scopeText: sc ? sc.innerText.trim() : null, approve: ap ? { disabled: ap.disabled, title: ap.title, opacity: getComputedStyle(ap).opacity } : null }
  })
  F.check('R3d-4 F1 / D1544 a refused leave opened whole, a medical on one of its days: Approve greyed, naming that day', SIZE,
    all.scopeAll === 'true' && !!all.approve && all.approve.disabled && +all.approve.opacity < 1 && all.approve.title === `OML holds ${L.dm(D5)}, so the bid can’t be approved`,
    JSON.stringify(all), [pre + '4-window-all'])
  /* the day tapped alone: nothing over it, so Approve is offered */
  if (all.scopeAll) { await L.press(w, L.T('scope-day')); await P.waitForTimeout(300) }
  await L.shot(w, pre + '5-window-day')
  const one = await P.evaluate(() => { const ap = [...document.querySelectorAll('[data-testid="decide-approve"]')].find(e => e.getBoundingClientRect().width > 0); return ap ? { disabled: ap.disabled, title: ap.title } : null })
  F.check('R3d-5 the day tapped alone, nothing over it: Approve offered', SIZE, !!one && !one.disabled, JSON.stringify(one), [pre + '5-window-day'])
  await F.settle(w)
  errsAll.push(...w.errs.map(e => tag + ' ' + e)); note('errors', w.errs.length ? w.errs : 'none')
  L.rec('R3D a refused leave of several days, a medical on its middle day', SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
  await w.ctx.close()
}

for (const [id, fn] of [['r3a', r3a], ['r3b', r3b], ['r3c', () => r3c('OML', 'r3c')], ['r3c2', () => r3c('ATT C', 'r3c2')], ['r3d', r3d]]) {
  if (!want(id)) continue
  try { await fn() } catch (e) { console.log(`  ${id} STEP-ERROR (NOT WALKED beyond here):`, String(e).split('\n')[0].slice(0, 400)); errsAll.push(id + ' STEP-ERROR ' + String(e).split('\n')[0].slice(0, 200)) }
}
L.writeResults(ONLY.length ? `r3-${SIZE}-${ONLY.join("-")}` : `r3-${SIZE}`)
console.log('ALL ERRORS:', errsAll.length ? errsAll : 'none')
await L.closeBrowser()
