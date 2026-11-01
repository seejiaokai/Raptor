/* The Tracker plain-user round (D1557 §7.0a, D1558 — 2 Nov 26): a person's everyday Tracker work start to finish,
   every window and menu opened and closed by each of its ways, each result looked for where else it should show,
   and again after a reload.  UR_PHONE=1 → WebKit 402x874 touch; UR_WHO=u → the member.  ONLY=a,b → those sections. */
import { open, toTracker, shot, press, core, vis, check, finish, log, login } from './trk-ur-lib.mjs'
console.log('trk-ur-walk v3')
const phone = process.env.UR_PHONE === '1'
const who = process.env.UR_WHO || 'a'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const run = s => !ONLY.length || ONLY.includes(s)
const { browser, page, errors } = await open({ phone, who })
await toTracker(page)
await shot(page, 'landing')
const W = phone ? 402 : 1536, H = phone ? 874 : 864

/* ---------- helpers ---------- */
const tap = async (sel, name, o) => press(page, phone, sel, name, o)
const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(300) }
const view = async v => { if (!phone) return; const t = page.locator(`#viewtabs [data-view="${v}"]`); if (await t.isVisible().catch(() => false)) { await t.tap({ timeout: 5000 }); await page.waitForTimeout(400) } }
/* a point outside `sel`'s box, on the page, not inside it */
async function outsidePoint(sel) {
  return page.evaluate(([sel, W, H]) => {
    const el = document.querySelector(sel); const r = el ? el.getBoundingClientRect() : { left: 0, right: 0, top: 0, bottom: 0 }
    const cands = [[24, Math.round(H * 0.45)], [W - 24, Math.round(H * 0.45)], [Math.round(W / 2), H - 30], [24, H - 60], [Math.round(W / 2), 130]]
    for (const [x, y] of cands) {
      if (x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4) continue
      const at = document.elementFromPoint(x, y)
      if (at && el && el.contains(at)) continue
      return { x, y, at: at ? (at.id || at.className && String(at.className).slice(0, 30) || at.tagName) : null }
    }
    return null
  }, [sel, W, H])
}
async function tapAt(pt, name) {
  if (phone) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y)
  if (phone && name) await shot(page, name + '-tap')
  await page.waitForTimeout(400)
  if (name) await shot(page, name)
}
const popOpen = () => vis(page, '#pop')
/* Test each way of closing a window. openFn opens it; sel is its box; ways: list of {k:'x', sel} | {k:'esc'} | {k:'out'} */
async function closeWays(label, openFn, sel, ways) {
  for (const w of ways) {
    const name = `${label}-${w.k}${w.tag ? '-' + w.tag : ''}`
    try {
      await openFn()
      const opened = await vis(page, sel)
      if (!opened) { check(name, null, `${label} did not open (${sel})`); await shot(page, name + '-notopen'); continue }
      await shot(page, name + '-open')
      if (w.k === 'x' && w.coords) { const bb = await page.locator(w.sel).first().boundingBox(); await tapAt({ x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }, name + '-closed') }
      else if (w.k === 'x') await tap(w.sel, name + '-closed')
      else if (w.k === 'esc') { await key('Escape'); await shot(page, name + '-closed') }
      else if (w.k === 'out') { const pt = await outsidePoint(sel); log(`  outside point for ${label}: ${JSON.stringify(pt)}`); await tapAt(pt, name + '-closed') }
      const still = await vis(page, sel)
      const extraPop = (sel !== '#pop') && await popOpen()
      const extraDlg = (sel !== '#dlgModal') && await vis(page, '#dlgModal')
      check(name, !still && !extraPop && !extraDlg, `closed=${!still}; a marking pop-up opened behind=${extraPop}; a question opened=${extraDlg}`)
      if (extraPop) await key('Escape')
      if (still) { await key('Escape') }
    } catch (e) { check(name, false, 'error: ' + e.message.split('\n')[0]); await shot(page, name + '-error').catch(() => {}); await key('Escape') }
  }
}
/* bring a ball into the chart's view (scroll the board element), then return its centre */
async function ballAt(id) {
  await view('flow')
  return page.evaluate(id => {
    const bd = document.getElementById('board'); const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
    if (!bd || !g) return null
    let r = g.getBoundingClientRect(); const b = bd.getBoundingClientRect()
    bd.scrollTop += (r.top + r.height / 2) - (b.top + b.height / 2); bd.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2)
    r = g.getBoundingClientRect()
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }
  }, id)
}
async function openBall(id, name) {
  const p = await ballAt(id); if (!p) return false
  await page.waitForTimeout(250)
  if (phone) await page.touchscreen.tap(p.x, p.y); else await page.mouse.click(p.x, p.y)
  if (phone && name) await shot(page, name + '-tap')
  await page.waitForTimeout(450)
  if (name) await shot(page, name)
  return popOpen()
}
const grade = async id => { const g = await page.evaluate(id => window.__undoForTests().grade(id), id); return { g: g || null } }
const fails = async () => (await sideText('#failsCard')).replace(/^.*?—/, '')
const sideText = async sel => (await page.locator(sel).first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
async function reloadBack() {
  await page.reload(); await page.waitForTimeout(800)
  if (await vis(page, '#luser')) await login(page, who)
  const onTr = await page.evaluate(() => window.CURPAGE === 'tracker')
  if (!onTr) await toTracker(page); else await page.waitForSelector('#flowSvg .ball', { timeout: 20000, state: 'attached' })
  await page.waitForTimeout(600)
}
const topUndo = () => page.locator('button[aria-label="Undo"]:visible').first()
const topRedo = () => page.locator('button[aria-label="Redo"]:visible').first()

const EV = 'ST-01', EV2 = 'ACG-01'
const who0 = await page.evaluate(() => { const a = window.__undoForTests().active, c = window.__coreForTests; return { active: a, name: c.nameOf(a), roster: c.rosterNow().map(r => r.name) } })
log('world:', who0)

/* ---------- A. pick a student ---------- */
if (run('a')) {
  try {
    const names = await page.locator('#activeSel option').allInnerTexts()
    await page.selectOption('#activeSel', { index: 1 }); await page.waitForTimeout(500)
    await shot(page, 'a-crew-picked-second')
    const a1 = await page.evaluate(() => window.__coreForTests.nameOf(window.__undoForTests().active))
    const panelWho = await sideText('.c-pace .who')
    check('a-crew-dropdown', a1 === names[1] && panelWho.includes(names[1]), `picked "${names[1]}"; store active="${a1}"; Pace card says "${panelWho}"`)
    await page.selectOption('#activeSel', { index: 0 }); await page.waitForTimeout(500)
    const a0 = await page.evaluate(() => window.__coreForTests.nameOf(window.__undoForTests().active))
    check('a-crew-back', a0 === names[0], `back to "${a0}"`)
  } catch (e) { check('a', false, e.message.split('\n')[0]) }
}

/* ---------- B. mark an event, look for it everywhere, undo/redo ---------- */
if (run('b')) {
  try {
    const before = await grade(EV)
    const doneBefore = await sideText('.c-overall, .card:has(h3:text("Overall"))')
    const ok = await openBall(EV, 'b-pop-open')
    check('b-pop-opens', ok, 'the marking pop-up opened on ' + EV)
    if (ok) {
      await tap('#pop button[data-g="dco"]', 'b-dco-pressed')
      const after = await grade(EV)
      const popGone = !(await popOpen())
      const ballCls = await page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? g.getAttribute('class') : null }, EV)
      check('b-dco-marks', after.g === 'dco', `grade before=${before.g} after=${after.g}; pop-up closed=${popGone}; ball class="${ballCls}"`)
      await view('info')
      const overall = await sideText('#side')
      await shot(page, 'b-info-after-dco', { el: phone ? null : '#side' })
      const m = overall.match(/(\d+(?:\.\d)?)%\s*COMPLETE\s*(\d+)\s*DONE/i)
      check('b-overall-shows', !!m && Number(m[2]) >= 1, `Overall reads: ${m ? m[0] : overall.slice(0, 120)}`)
      /* undo in the top bar */
      const u = topUndo()
      const uOk = await u.isVisible().catch(() => false)
      if (uOk) {
        const title = await u.getAttribute('title')
        await tap(u, 'b-undo-pressed')
        const g2 = await grade(EV)
        check('b-undo', g2.g == null || g2.g === before.g, `top bar Undo ("${title}") → grade ${g2.g}`)
        await view('flow'); await shot(page, 'b-chart-after-undo')
        const r = topRedo()
        await tap(r, 'b-redo-pressed')
        const g3 = await grade(EV)
        check('b-redo', g3.g === 'dco', `Redo → grade ${g3.g}`)
      } else check('b-undo', false, 'no Undo in the top bar')
    }
  } catch (e) { check('b', false, e.message.split('\n')[0]) }
}

/* ---------- C. the marking pop-up: every way to close it, fails, dates ---------- */
if (run('c')) {
  await closeWays('c-pop', async () => { if (!(await popOpen())) await openBall(EV2) }, '#pop', [
    { k: 'x', sel: '#pop button:text-is("Close")', tag: 'Close' }, { k: 'esc' }, { k: 'out' }])
  /* tapping the same ball again / another ball */
  try {
    await openBall(EV2, 'c-pop-again')
    const p2 = await ballAt(EV)
    if (phone) await page.touchscreen.tap(p2.x, p2.y); else await page.mouse.click(p2.x, p2.y)
    await page.waitForTimeout(450); await shot(page, 'c-pop-other-ball')
    const title = await page.locator('#popTitle').innerText().catch(() => '')
    check('c-pop-other-ball', title.includes(EV), `a press on another ball while one pop-up is up shows: "${title}"`)
    await key('Escape')
  } catch (e) { check('c-pop-other-ball', false, e.message.split('\n')[0]) }
  /* a failure */
  try {
    await openBall(EV2, 'c-fail-pop')
    const f0 = Number((await page.locator('#failCount').innerText().catch(() => 'NaN')).trim())
    await tap('#popFailPlus', 'c-fail-plus')
    const f1 = Number((await page.locator('#failCount').innerText().catch(() => 'NaN')).trim())
    const dates = await sideText('#popFailDates')
    check('c-fail-plus', f1 === f0 + 1 && dates.includes(EV2), `pop-up Fails ${f0} → ${f1}; its list reads "${dates}"`)
    await key('Escape')
    await view('info')
    const chips = await page.locator('#failChips .failchip').allInnerTexts()
    const tot = await sideText('#failTotal')
    await page.locator('#failsCard').scrollIntoViewIfNeeded()
    await shot(page, 'c-failures-card')
    check('c-failures-card', chips.some(t => t.includes(EV2)) && /1 fail/i.test(tot), `Failures card chips=${JSON.stringify(chips)} total="${tot}"`)
    /* tap the failure chip — what does it show */
    if (chips.length) {
      await tap('#failChips .failchip', 'c-failchip-tapped')
      const tip = await page.evaluate(() => { const t = document.querySelector('.chiptip, .tip, [role=tooltip]'); return t ? t.innerText : null })
      log('  fail chip tap shows:', tip)
    }
    /* the full failures list: every way to close */
    await closeWays('c-faillog', async () => { await view('info'); await tap('#failTitle') }, '#failLog', [
      { k: 'x', sel: '#failLogClose' }, { k: 'esc' }, { k: 'out' }])
  } catch (e) { check('c-fail', false, e.message.split('\n')[0]) }
}

/* ---------- D. details of an event (Edit details) ---------- */
if (run('d')) {
  const openInfo = async () => { if (!(await popOpen())) await openBall(EV2); await tap('#popEditInfo') }
  await closeWays('d-details', openInfo, '#infoModal', [{ k: 'x', sel: '#ifCancel', tag: 'Cancel' }, { k: 'esc' }, { k: 'out' }])
  try {
    await openInfo(); await shot(page, 'd-details-open')
    await page.fill('#ifHrs', '1.7 Hrs')
    await tap('#ifSave', 'd-details-saved')
    const gone = !(await vis(page, '#infoModal'))
    await openBall(EV2, 'd-pop-shows-hours')
    const info = await sideText('#popInfo')
    check('d-details-save', gone && info.includes('1.7'), `window closed=${gone}; pop-up details read "${info.slice(0, 140)}"`)
    await key('Escape')
  } catch (e) { check('d-details-save', false, e.message.split('\n')[0]) }
}

/* ---------- E. Show All, Legend, the ⓘ details switch ---------- */
if (run('e')) {
  const openSA = async () => { if (phone) { const t = page.locator('#viewtabs >> text=Show All'); await t.first().tap() } else await tap('#showAllBtn'); await page.waitForTimeout(300) }
  await closeWays('e-showall', openSA, '#showAllPanel', [{ k: 'x', sel: '#saClose' }, { k: 'esc' }, { k: 'out' }])
  try {
    await openSA()
    await page.fill('#saSearch', EV2); await page.waitForTimeout(300)
    await shot(page, 'e-showall-filtered')
    const rows = await page.locator('#saBody tr, #saBody .sarow').count()
    const body = await sideText('#saBody')
    check('e-showall-filter', body.includes(EV2) && body.includes('1.7'), `filter "${EV2}" leaves ${rows} rows; shows hours typed in D: ${body.includes('1.7')}`)
    await key('Escape')
  } catch (e) { check('e-showall-filter', false, e.message.split('\n')[0]) }
  if (!phone || await vis(page, '#legendBtn')) {
    await closeWays('e-legend', async () => tap('#legendBtn'), '#trkLegend', [{ k: 'x', sel: '#legendBtn', tag: 'button-again', coords: true }, { k: 'esc' }, { k: 'out' }])
  } else check('e-legend', null, 'no Legend button on this screen')
  try {
    if (await vis(page, '#detailsBtn')) {
      await tap('#detailsBtn', 'e-details-on')
      const on = await page.getAttribute('#detailsBtn', 'aria-pressed')
      await tap('#detailsBtn', 'e-details-off')
      const off = await page.getAttribute('#detailsBtn', 'aria-pressed')
      check('e-details-switch', on === 'true' && off === 'false', `ⓘ pressed=${on}, then ${off}`)
    } else check('e-details-switch', null, 'ⓘ not on screen')
  } catch (e) { check('e-details-switch', false, e.message.split('\n')[0]) }
}

/* ---------- F. flex settings ---------- */
if (run('f')) {
  await view('flow')
  if (await vis(page, '#flexBtn')) {
    await closeWays('f-flex', async () => tap('#flexBtn'), '#trkFlexWin', [
      { k: 'x', sel: '[data-testid="trk-flex-x"]', tag: 'x' }, ...(who === 'a' ? [{ k: 'x', sel: '[data-testid="trk-flex-cancel"]', tag: 'Cancel' }] : []), { k: 'esc' }, { k: 'out' }])
    try {
      await tap('#flexBtn', 'f-flex-open')
      const inputs = await page.locator('#trkFlexWin input[type=text], #trkFlexWin input:not([type])').count()
      const canSave = await vis(page, '[data-testid="trk-flex-save"]')
      if (who === 'a') {
        /* change the first From day by one and save; look for it on the Info panel; then put it back */
        const first = page.locator('#trkFlexWin input').filter({ hasNot: page.locator('[type=checkbox]') })
        const sw = null
        const inp = page.locator('[data-testid="trk-flex-from-1"] input, input[data-testid="trk-flex-from-1"]').first()
        const has = await inp.count()
        log('  flex setting before:', sw, 'inputs:', inputs, 'from-1 input:', has)
        if (has) {
          const v0 = await inp.inputValue(); await inp.fill(String(Number(v0) + 1))
          await tap('[data-testid="trk-flex-save"]', 'f-flex-saved')
          const closed = !(await vis(page, '#trkFlexWin'))
          await tap('#flexBtn', 'f-flex-reopened')
          const v1 = await inp.inputValue()
          check('f-flex-save', closed && v1 === String(Number(v0) + 1), `From ${v0} typed ${Number(v0) + 1}; window closed on Save=${closed}; reopened reads ${v1}`)
          await inp.fill(v0); await tap('[data-testid="trk-flex-save"]', 'f-flex-put-back')
        } else check('f-flex-save', null, 'no typed From box found')
        /* the switch: off → the flex bar leaves the Info panel */
        await tap('#flexBtn'); await tap('[data-testid="trk-flex-on"]', 'f-flex-switch-off'); await tap('[data-testid="trk-flex-save"]')
        await view('info'); await page.locator('.c-curr').scrollIntoViewIfNeeded().catch(() => {})
        await shot(page, 'f-info-flex-off')
        const bar = await page.locator('[data-testid="trk-flexbar"]').count()
        check('f-flex-off-info', bar === 0, `flex bars on the Info panel with flex off: ${bar}`)
        await view('flow'); await tap('#flexBtn'); await tap('[data-testid="trk-flex-on"]'); await tap('[data-testid="trk-flex-save"]', 'f-flex-switch-on')
        const bar2 = await page.locator('[data-testid="trk-flexbar"]').count()
        check('f-flex-on-info', bar2 === 1, `flex bars with flex on again: ${bar2}`)
      } else {
        check('f-flex-member-readonly', !canSave && inputs === 0, `member: Save shown=${canSave}, typed boxes=${inputs}`)
        await key('Escape')
      }
    } catch (e) { check('f-flex', false, e.message.split('\n')[0]); await key('Escape') }
  } else check('f-flex', null, '⚙ not on screen')
}

/* ---------- G. students: + Add, rename, remove (cancelled), reorder ---------- */
if (run('g')) {
  await view('info')
  await closeWays('g-add', async () => tap('#addStu'), '#dlgModal', [{ k: 'x', sel: '#dlgCancel' }, { k: 'esc' }, { k: 'out' }])
  try {
    const n0 = await page.evaluate(() => window.__coreForTests.rosterNow().length)
    await tap('#addStu', 'g-add-open')
    const items = await page.locator('#dlgList .dlg-item').allInnerTexts()
    log('  roster offered:', items.slice(0, 6))
    if (items.length) {
      await tap('#dlgList .dlg-item', 'g-add-picked')
      const n1 = await page.evaluate(() => { const r = window.__coreForTests.rosterNow(); return { n: r.length, names: r.map(x => x.name) } })
      const chips = await page.locator('.c-students .chip').count()
      const crew = await page.locator('#activeSel option').count()
      check('g-add', n1.n === n0 + 1 && chips === n1.n && crew === n1.n, `roster ${n0} → ${n1.n} (${n1.names.join(', ')}); chips=${chips}; Crew list=${crew}`)
      await shot(page, 'g-after-add')
    } else check('g-add', null, 'nobody offered on the roster')
    /* rename the new one (last chip) */
    const pens = page.locator('.c-students .ren')
    await tap(pens.last(), 'g-rename-open')
    const asked = await vis(page, '#dlgModal')
    if (asked) {
      await page.fill('#dlgInput', 'RENAMED UR'); await tap('#dlgOk', 'g-renamed')
      const names = await page.evaluate(() => window.__coreForTests.rosterNow().map(r => r.name))
      const crewTxt = await page.locator('#activeSel').innerText()
      check('g-rename', names.includes('RENAMED UR') && crewTxt.includes('RENAMED UR'), `names=${names.join(', ')}; Crew list has it=${crewTxt.includes('RENAMED UR')}`)
    } else check('g-rename', false, 'the pencil opened no question')
    /* remove — every way of saying no, then yes */
    await closeWays('g-remove', async () => tap(page.locator('.c-students .chip .x').last()), '#dlgModal', [{ k: 'x', sel: '#dlgCancel' }, { k: 'esc' }, { k: 'out' }])
    const nBefore = await page.evaluate(() => window.__coreForTests.rosterNow().length)
    await tap(page.locator('.c-students .chip .x').last(), 'g-remove-ask')
    await tap('#dlgOk', 'g-removed')
    const nAfter = await page.evaluate(() => window.__coreForTests.rosterNow().length)
    check('g-remove', nAfter === nBefore - 1, `roster ${nBefore} → ${nAfter}`)
  } catch (e) { check('g-students', false, e.message.split('\n')[0]); await key('Escape') }
  await closeWays('g-reorder', async () => { await view('info'); await tap('#ordCrew') }, '#ordModal', [{ k: 'x', sel: '#ordCancel' }, { k: 'esc' }, { k: 'out' }])
}

/* ---------- H. dates, pace, lull, down days ---------- */
if (run('h')) {
  await view('info')
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const pick = async (box, name) => {
    await tap(box, name + '-cal-open')
    const calOpen = await page.locator('.dcal-grid').first().isVisible().catch(() => false)
    if (!calOpen) return false
    const d = page.locator(`.dcal-grid [data-iso="${today}"]`).first()
    await tap(d, name + '-picked')
    return true
  }
  try {
    const ok = await pick('#lastSyll', 'h-lastsyll')
    const txt = await sideText('#lastSyll')
    const since = await sideText('.c-curr .curKv')
    check('h-lastsyll', ok && !/Pick a date/.test(txt) && /0d/.test(since), `calendar opened=${ok}; box reads "${txt}"; ${since}`)
    /* calendar closed by Escape and outside */
    await closeWays('h-cal', async () => tap('#lastCurr'), '.dcal-grid', [{ k: 'esc' }, { k: 'out' }])
  } catch (e) { check('h-lastsyll', false, e.message.split('\n')[0]); await key('Escape') }
  try {
    await page.locator('#epwIn').scrollIntoViewIfNeeded()
    await page.fill('#epwIn', '3'); await page.waitForTimeout(500)
    await page.locator('#epwIn').blur()
    await shot(page, 'h-pace-set')
    const proj = await sideText('.c-pace')
    check('h-pace', /projected end/.test(proj) && !/— projected end/.test(proj), `card: ${proj.slice(0, 160)}`)
  } catch (e) { check('h-pace', false, e.message.split('\n')[0]) }
  try {
    const ok = await pick('#targetIn', 'h-enddate-a')
    const ta = await sideText('#targetIn'); const card = await sideText('.c-pace')
    check('h-enddate-a', ok && !/Pick a date/.test(ta), `End date A reads "${ta}"; card: ${card.slice(0, 200)}`)
  } catch (e) { check('h-enddate-a', false, e.message.split('\n')[0]); await key('Escape') }
  try { const ok = await pick('#courseStart', 'h-coursestart'); const cs = await sideText('#courseStart'); const dd = await sideText('#downDays'); check('h-coursestart', ok && !/Pick a date/.test(cs), `Course start reads "${cs}"; No. of Down Days reads "${dd}"`) } catch (e) { check('h-coursestart', false, e.message.split('\n')[0]); await key('Escape') }
  /* a man from the roster: his down days come from the Inputs (D1005) — add one, his course start set in + Add */
  try {
    await tap('#addStu', 'h-add-roster-man')
    const it = page.locator('#dlgList .dlg-item').nth(1)
    const nm = (await it.innerText()).split(/\n/)[0]
    await tap(it, 'h-added')
    await page.selectOption('#activeSel', { label: nm.toUpperCase() }).catch(async () => { const o = await page.locator('#activeSel option').allInnerTexts(); await page.selectOption('#activeSel', { index: o.length - 1 }) })
    await page.waitForTimeout(500)
    const dd = await sideText('#downDays'); const cs = await sideText('#courseStart')
    await page.locator('#downDays').scrollIntoViewIfNeeded(); await shot(page, 'h-roster-man-info')
    check('h-roster-man', !/Pick a date/.test(cs), `added "${nm}"; Course start reads "${cs}"; No. of Down Days reads "${dd}"`)
  } catch (e) { check('h-roster-man', false, e.message.split(/\n/)[0]); await key('Escape') }
  await closeWays('h-downdays', async () => { await view('info'); await tap('#downDays') }, '#downLog', [{ k: 'x', sel: '#downLogClose' }, { k: 'esc' }, { k: 'out' }])
  await closeWays('h-lull', async () => { await view('info'); await tap('#setLullBtn') }, '#lullCal', [{ k: 'x', sel: '#lullClose' }, { k: 'esc' }, { k: 'out' }])
  try {
    await tap('#setLullBtn', 'h-lull-open')
    const days = page.locator('#lullCal button.day:not(.blank), #lullCal .day[data-iso]')
    const n = await days.count()
    await tap(days.nth(10), 'h-lull-start'); await tap(days.nth(14), 'h-lull-end')
    const l = await page.locator('#lullChips .lullchip').allInnerTexts()
    const chips = await sideText('#lullChips')
    await shot(page, 'h-lull-set')
    check('h-lull-set', l.length >= 1 && chips.length > 0, `days in calendar=${n}; lulls stored=${JSON.stringify(l)}; chips "${chips}"`)
    if (await vis(page, '#lullCal')) await key('Escape')
    await closeWays('h-lullcopy', async () => { await view('info'); await tap('#copyLullBtn') }, '#lullCopy', [{ k: 'x', sel: '#lullCopyClose' }, { k: 'esc' }, { k: 'out' }])
    /* tap the lull chip's dates to edit it */
    const lc = page.locator('#lullChips button.lullopen, #lullChips .lullopen').first()
    if (await lc.count()) { await tap(lc, 'h-lull-chip-tapped'); check('h-lull-chip-opens', await vis(page, '#lullCal'), 'a tap on the lull period opens its calendar'); await key('Escape') }
  } catch (e) { check('h-lull', false, e.message.split('\n')[0]); await key('Escape') }
}

/* ---------- I. menus: course, syllabus, file; search ---------- */
if (run('i')) {
  if (run('h')) { await page.selectOption('#activeSel', { index: 0 }); await page.waitForTimeout(500); log('  back to the first student for the rest: ' + await page.locator('#activeSel option:checked').innerText()) }
  await view('flow')
  for (const m of ['courseMenuBtn', 'sylMenuBtn', 'fileMenuBtn']) {
    if (!(await vis(page, '#' + m))) { check('i-' + m, null, 'not on screen'); continue }
    const panel = '#' + m.replace('MenuBtn', 'MenuPanel')
    await closeWays('i-' + m.replace('MenuBtn', ''), async () => tap('#' + m), panel + '.on', [{ k: 'x', sel: '#' + m, tag: 'button-again', coords: true }, { k: 'esc' }, { k: 'out' }])
  }
  /* Export: the window, every way to close, then really export a file */
  try {
    const openEx = async () => { await tap('#fileMenuBtn'); await tap('#exportBtn') }
    await closeWays('i-export', openEx, '#copyModal', [{ k: 'x', sel: '#copyCancel' }, { k: 'esc' }, { k: 'out' }])
    const gBeforeEx = await page.evaluate(() => window.__undoForTests().grade('ST-01'))
    const ovBeforeEx = await sideText('#side')
    await openEx(); if (!(await page.locator('#copyStudents').isChecked())) await tap('#copyStudents'); await tap('#copyTickAll'); await shot(page, 'i-export-open')
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), tap('#copyOk', 'i-export-ok')])
    const path = dl ? await dl.path() : null
    check('i-export', !!path, `a file was handed over: ${dl ? dl.suggestedFilename() : 'none'}`)
    if (await vis(page, '#dlgModal')) { log('  after export: ' + (await sideText('#dlgMsg'))); await tap('#dlgOk', 'i-export-told') }
    if (path) {
      /* Import it back */
      const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null), (async () => { await tap('#fileMenuBtn'); await tap('#importFileBtn') })()])
      if (fc) {
        await fc.setFiles(path); await page.waitForTimeout(900)
        await shot(page, 'i-import-asked')
        const qs = []
        for (let i = 0; i < 14 && await vis(page, '#dlgModal'); i++) {
          const msg = (await page.locator('#dlgMsg').innerText()).replace(/\s+/g, ' ').slice(0, 160)
          const btns = await page.locator('#dlgModal button:visible').allInnerTexts()
          qs.push(msg + ' [' + btns.join('|') + ']')
          /* the whole backup back in, as he would after the database move: Replace each chart, yes to students & marks */
          const yes = page.locator('#dlgModal button:visible').filter({ hasText: /^(Replace|Yes|Bring|Import|OK)/i })
          if (await yes.count()) await tap(yes.first(), 'i-import-q' + i); else await tap('#dlgOk', 'i-import-q' + i)
          await page.waitForTimeout(600)
        }
        log('  import questions:', qs)
        const gAfter = await page.evaluate(() => window.__undoForTests().grade('ST-01'))
        const ovAfter = await sideText('#side')
        await shot(page, 'i-after-import')
        check('i-import-keeps-marks', gAfter === gBeforeEx && /1 DONE/i.test(ovAfter) === /1 DONE/i.test(ovBeforeEx), `ST-01 grade before export=${gBeforeEx}, after import=${gAfter}; "1 DONE" before=${/1 DONE/i.test(ovBeforeEx)} after=${/1 DONE/i.test(ovAfter)}`)
        check('i-import', qs.length > 0,`Import asked ${qs.length} question(s): ${qs.join(' // ').slice(0, 300)}`)
      } else check('i-import', false, 'no file picker opened from Import…')
    }
  } catch (e) { check('i-export', false, e.message.split('\n')[0]); await key('Escape') }
  /* search */
  try {
    const s = page.locator('#hSearch')
    if (!(await s.isVisible().catch(() => false)) && await vis(page, '#hSearchBtn')) await tap('#hSearchBtn', 'i-search-btn')
    await page.locator('#hSearch').fill('ACG-05'); await page.waitForTimeout(400)
    await shot(page, 'i-search-typed')
    const rows = await page.locator('#hSearchList .findrow').count()
    await page.keyboard.press('Enter'); await page.waitForTimeout(700)
    await shot(page, 'i-search-landed')
    const inView = await page.evaluate(() => { const bd = document.getElementById('board'); const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-05'); if (!bd || !g) return null; const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect(); return r.top >= b.top && r.bottom <= b.bottom && r.left >= b.left && r.right <= b.right })
    check('i-search', rows >= 1 && inView, `rows offered=${rows}; ACG-05 in the chart's view=${inView}`)
    if (await vis(page, '#hSearchClear')) await tap('#hSearchClear', 'i-search-cleared')
    const q = await page.locator('#hSearch').inputValue().catch(() => '?')
    check('i-search-clear', q === '', `box after ✕ reads "${q}"`)
  } catch (e) { check('i-search', false, e.message.split('\n')[0]) }
  /* on a phone the box is a panel under the bar, opened by 🔍: every way to put it away */
  if (await vis(page, '#hSearchBtn')) {
    if (await vis(page, '#hSearchPanel.on')) { await key('Escape') }
    await closeWays('i-searchpanel', async () => tap('#hSearchBtn'), '#hSearchPanel.on', [{ k: 'x', sel: '#hSearchBtn', tag: 'magnifier-again', coords: true }, { k: 'esc' }, { k: 'out' }])
    if (await vis(page, '#hSearchPanel.on')) { await key('Escape'); log('  search panel still open after its close tests: pressed Escape') }
  }
}

/* ---------- J. the bar hide, zoom ---------- */
if (run('j')) {
  try {
    await view('flow')
    if (await vis(page, '#barHideBtn')) {
      await tap('#barHideBtn', 'j-bar-hidden')
      const back = await vis(page, '#barShowBtn')
      await tap('#barShowBtn', 'j-bar-back')
      check('j-bar', back && await vis(page, '#barHideBtn'), `hidden, show button there=${back}; back again`)
    } else check('j-bar', null, 'no hide button')
    if (await vis(page, '#fzIn')) {
      const z0 = await page.locator('#fzPct').innerText()
      await tap('#fzIn', 'j-zoom-in'); const z1 = await page.locator('#fzPct').innerText()
      await tap('#fzReset', 'j-zoom-reset'); const z2 = await page.locator('#fzPct').innerText()
      check('j-zoom', z1 !== z0 && z2 === z0, `chart zoom ${z0} → ${z1} → reset ${z2}`)
    } else check('j-zoom', null, 'no chart zoom buttons on this screen')
  } catch (e) { check('j', false, e.message.split('\n')[0]) }
}

/* ---------- K. next-event chips ---------- */
if (run('k')) {
  try {
    await view('info')
    const chip = page.locator('#side .evchip').first()
    const id = await chip.innerText()
    await tap(chip, 'k-evchip-tapped')
    await page.waitForTimeout(500)
    await view('flow')
    await shot(page, 'k-chart-after-chip')
    const ring = await page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); const bd = document.getElementById('board'); if (!g || !bd) return null; const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect(); return { inView: r.top >= b.top && r.bottom <= b.bottom, cls: g.getAttribute('class') } }, id.trim())
    check('k-evchip', !!ring && ring.inView, `chip "${id.trim()}" → ball in view: ${JSON.stringify(ring)}; pop-up open=${await popOpen()}`)
    if (await popOpen()) await key('Escape')
  } catch (e) { check('k-evchip', false, e.message.split('\n')[0]) }
}

/* ---------- L. reload: what was done is still there ---------- */
if (run('l')) {
  try {
    const snap = async ids => { await view('info'); return page.evaluate(ids => { const u = window.__undoForTests(), c = window.__coreForTests, t = s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }; const v = s => { const e = document.querySelector(s); return e ? e.value : null }
      return { who: c.nameOf(u.active), g: u.grade(ids[0]), roster: c.rosterNow().map(r => r.name), lastSyll: t('#lastSyll'), pace: v('#epwIn'), endA: t('#targetIn'), fails: t('#failsCard'), lulls: t('#lullChips'), overall: t('.c-overall') || null } }, ids) }
    const before = await snap([EV, EV2])
    await reloadBack()
    await shot(page, 'l-after-reload')
    const after = await snap([EV, EV2])
    check('l-reload', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`)
    await view('info'); await shot(page, 'l-info-after-reload')
  } catch (e) { check('l-reload', false, e.message.split('\n')[0]) }
}

/* ---------- M. leave the tab and come back; log out and in ---------- */
if (run('m')) {
  try {
    const g0 = await page.evaluate(() => ({ g: window.__undoForTests().grade('ST-01'), who: window.__coreForTests.nameOf(window.__undoForTests().active) }))
    const { toPage } = await import('./trk-ur-lib.mjs')
    await toPage(page, 'leavewar'); await toTracker(page); await shot(page, 'm-back-from-leavewar')
    const g1 = await page.evaluate(() => ({ g: window.__undoForTests().grade('ST-01'), who: window.__coreForTests.nameOf(window.__undoForTests().active) }))
    check('m-tab-away-back', JSON.stringify(g0) === JSON.stringify(g1), `before ${JSON.stringify(g0)} after ${JSON.stringify(g1)}`)
    /* log out (desk: top bar; phone: the drawer) */
    const lo = page.locator('.topbar button:has-text("Logout"):visible, #logoutBtn:visible')
    if (await lo.count()) await tap(lo.first(), 'm-logout')
    else { await tap('#burger', 'm-drawer'); await tap(page.locator('#drawer').getByText(/Log ?out/i).first(), 'm-logout') }
    if (await vis(page, '#dlgModal')) { log('  logout asked: ' + await sideText('#dlgMsg')); await shot(page, 'm-logout-asked') }
    await page.waitForSelector('#luser', { timeout: 8000 })
    await login(page, who); await toTracker(page); await shot(page, 'm-back-after-login')
    const g2 = await page.evaluate(() => ({ g: window.__undoForTests().grade('ST-01'), who: window.__coreForTests.nameOf(window.__undoForTests().active) }))
    check('m-logout-login', JSON.stringify(g0) === JSON.stringify(g2), `before ${JSON.stringify(g0)} after sign-in ${JSON.stringify(g2)}`)
  } catch (e) { check('m', false, e.message.split(/\n/)[0]) }
}

/* page errors along the way */
check('z-no-page-errors', errors.filter(e => !/Couldn.t save that document|IndexedDB|NATIVE DIALOG/.test(e)).length === 0, `${errors.length} console/page errors`)
finish(errors)
await browser.close()
