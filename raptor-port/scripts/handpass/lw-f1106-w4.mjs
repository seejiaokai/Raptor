// Walker script 4 (6 Nov 26): S5 (f) the member view after a refused change; S6 (g) the bubble above a resting day panel (phone).
// SIZE=desk|phone  ONLY=s5|s6   LW_DIST=dist-before for the before run
process.env.LW_OUT ||= process.env.LW_DIST === 'dist-before' ? '2026-11-06-lw-faults/walk-before' : '2026-11-06-lw-faults/walk'
process.env.WNAME = 'w4' + (process.env.LW_DIST === 'dist-before' ? 'b' : '')
const { L, row, rows, T, openNow, elAt, fresh, finish } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w4 v1]', L.SIZE, L.DIST)
const SIZE = L.SIZE, PH = SIZE === 'phone', ONLY = process.env.ONLY || ''
const TAG = SIZE + (process.env.LW_DIST === 'dist-before' ? 'B' : '')
const w = await fresh(SIZE)
const P = w.page
const roleRead = () => P.evaluate(() => ({
  badge: document.querySelector('#roleBadge')?.textContent?.trim() || null,
  approvalsTab: !!document.querySelector('[data-testid="lw-tab-approvals"]') && document.querySelector('[data-testid="lw-tab-approvals"]').getBoundingClientRect().width > 0,
  gear: [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /settings/i.test((b.title || '') + (b.getAttribute('aria-label') || '') + (b.dataset.testid || ''))).map(b => b.dataset.testid || b.title || b.getAttribute('aria-label')).slice(0, 3),
  autoApprove: !!document.querySelector('[data-testid="bid-approve-tick"]'),
  tabs: [...document.querySelectorAll('[data-testid^="lw-tab-"]')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.testid)
}))
async function switchRole() {
  if (PH) {
    await P.tap('#burger'); await P.waitForTimeout(400)
    const b = P.getByText(/Switch to the member view|Back to the admin view/).locator('visible=true').first()
    const t = await b.innerText(); await b.tap(); await P.waitForTimeout(600); return t
  }
  const t = await P.locator('#roleBadge').innerText(); await P.click('#roleBadge'); await P.waitForTimeout(600); return t
}
try {
  if (!ONLY || ONLY === 's5') {
    const sid = await L.pidOf(P, 'Saber')
    console.log('Saber pid', sid)
    const D = L.day(8)
    await L.openCell(w, sid, D); await L.autoApprove(w, false)
    const placed = await L.placeLeave(w, 'OL'); await L.settle(w)
    await L.openCell(w, sid, D)
    await L.press(w, T('decide-refuse')); await P.waitForTimeout(500)
    await L.shot(w, `s5-${TAG}-1-refused`)
    const cellRef = await L.cellWords(w, sid, D)
    await L.settle(w)
    const r0 = await roleRead()
    const sw = await switchRole()
    const r1 = await roleRead()
    await L.shot(w, `s5-${TAG}-2-member-view`)
    // member view: tap the day
    await L.openCell(w, sid, D)
    const opened = await openNow(P)
    await L.shot(w, `s5-${TAG}-3-day-opened`)
    const inputs = await P.evaluate(() => [...document.querySelectorAll('input[type=text],input:not([type]),textarea')].filter(e => e.getBoundingClientRect().width > 0 && !/search/i.test(e.id + (e.dataset.testid || ''))).map(e => (e.dataset.testid || e.id || e.name) + '=' + e.value))
    const winText = await P.evaluate(() => (document.querySelector('[data-testid="closed-note"],[data-testid="bid-picker"],[data-testid="pending-note"]')?.closest('[role=dialog],.sheet,.win')?.innerText || document.querySelector('[data-testid="closed-note"],[data-testid="bid-picker"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300))
    let typed = null, tryNote = ''
    const box = P.locator('input[type=text]:visible, textarea:visible').filter({ hasNot: P.locator('#searchE') })
    const bx = P.locator('[data-testid="closed-remarks"], [data-testid="remarks-remarks"], [data-testid="bid-remarks"], [data-testid$="-remarks"]').first()
    if (await bx.count() && await bx.isVisible()) {
      await bx.click(); await P.keyboard.type('Wx'); await P.waitForTimeout(150)
      await P.locator('[data-testid="closed-note-close"], [data-testid="bid-cancel"]').first().click().catch(() => {})
      await P.waitForTimeout(600)
      typed = 'typed Wx into ' + await bx.getAttribute('data-testid').catch(() => '?')
    } else tryNote = 'no Remarks box visible in the opened window'
    await L.shot(w, `s5-${TAG}-4-after-words`)
    const r2 = await roleRead()
    // reopen and read the words
    await L.openCell(w, sid, D)
    const words2 = await P.evaluate(() => [...document.querySelectorAll('input[type=text],input:not([type]),textarea')].filter(e => e.getBoundingClientRect().width > 0 && !/search/i.test(e.id + (e.dataset.testid || ''))).map(e => (e.dataset.testid || e.id) + '=' + e.value))
    await L.shot(w, `s5-${TAG}-5-reopened`)
    await L.settle(w)
    const r3 = await roleRead()
    const memberOk = x => x.approvalsTab === false && /Member/i.test(x.badge || (PH ? 'Member' : '')) && !x.tabs.includes('lw-tab-approvals')
    row('S5', TAG, `Saber own row ${D}: OL (placed=${placed}) → Refuse (cell ${cellRef}); badge switch "${sw}"; as member tapped the day (opened ${JSON.stringify(opened)}); ${typed || tryNote}`,
      `admin before=${JSON.stringify(r0)}; member after switch=${JSON.stringify(r1)}; window said "${winText}" inputs ${JSON.stringify(inputs)}; after words: ${JSON.stringify(r2)}; reopened inputs ${JSON.stringify(words2)}; final ${JSON.stringify(r3)}`,
      (typed ? (memberOk(r1) && memberOk(r3)) : false) ? (words2.some(x => /Wx/.test(x)) ? 'RECORD' : 'PASS') : (typed ? 'FAIL' : 'NOT REACHED'), [`s5-${TAG}-1-refused`, `s5-${TAG}-2-member-view`, `s5-${TAG}-3-day-opened`, `s5-${TAG}-4-after-words`, `s5-${TAG}-5-reopened`])
    await switchRole().catch(() => {})
    await L.settle(w).catch(() => {})
    console.log('role after switch back', JSON.stringify(await roleRead()))
  }
  if (!ONLY || ONLY === 's5') {
    // ROUTE B: the admin's own approval, then the member view, then the top bar's Undo (a member may not take an approval back)
    await L.settle(w)
    const sid = await L.pidOf(P, 'Saber'), D = L.day(9)
    const radm = await roleRead()
    if (!radm.approvalsTab) { await switchRole(); await P.waitForTimeout(400) }
    await L.openCell(w, sid, D); await L.autoApprove(w, false)
    const placed = await L.placeLeave(w, 'OL'); await L.settle(w)
    await L.openCell(w, sid, D)
    await L.press(w, T('decide-approve')); await P.waitForTimeout(500)
    const cellA = await L.cellWords(w, sid, D)
    await L.settle(w)
    const sw = await switchRole()
    const m1 = await roleRead()
    await L.shot(w, `s5-${TAG}-6-member-before-undo`)
    const said0 = await L.lastSaid(w, 2)
    await L.undo(w)
    await P.waitForTimeout(500)
    const m2 = await roleRead()
    const said1 = await L.lastSaid(w, 3)
    const cellB = await L.cellWords(w, sid, D)
    await L.shot(w, `s5-${TAG}-7-member-after-undo`)
    const bandAdminLook = m2.approvalsTab || m2.gear.length > 0 || /Admin/i.test(m2.badge || '')
    row('S5-undo-route', TAG, `Saber own row ${D}: OL (placed=${placed}) -> Approve (cell ${cellA}); badge switch "${sw}"; as member press the top bar's Undo`, `member view before Undo=${JSON.stringify(m1)}; passing notes before ${JSON.stringify(said0)}, after ${JSON.stringify(said1)}; cell after=${cellB}; role after Undo=${JSON.stringify(m2)}`, bandAdminLook ? 'FAIL' : ((said1.join('|') !== said0.join('|') || cellB !== cellA) ? 'PASS' : 'RECORD'), [`s5-${TAG}-6-member-before-undo`, `s5-${TAG}-7-member-after-undo`])
    await L.redo(w).catch(() => {})
    const m3 = await roleRead()
    console.log('after Redo', JSON.stringify(m3))
    await L.shot(w, `s5-${TAG}-8-member-after-redo`)
    if (!m3.approvalsTab) await switchRole().catch(() => {})
  }
  if (!ONLY || ONLY === 's5') {
    // ROUTE C and D: the member view, words typed on his own closed day — C a pending bid (note + Remarks), D an approved leave (Remarks window)
    for (const [tag, dn, approve] of [['C', 10, false], ['D', 11, true]]) {
      await L.settle(w)
      const sid = await L.pidOf(P, 'Saber'), D = L.day(dn)
      if (!(await roleRead()).approvalsTab) { await switchRole(); await P.waitForTimeout(400) }
      await L.openCell(w, sid, D); await L.autoApprove(w, false)
      await L.placeLeave(w, 'OL'); await L.settle(w)
      if (approve) { await L.openCell(w, sid, D); await L.press(w, T('decide-approve')); await P.waitForTimeout(400); await L.settle(w) }
      const cell0 = await L.cellWords(w, sid, D)
      await switchRole()
      await L.openCell(w, sid, D)
      const opened = await openNow(P)
      await L.shot(w, `s5-${TAG}-${tag}1-open`)
      const bx = P.locator('[data-testid$="-remarks"]:visible').first()
      let words = null, typed = false
      if (await bx.count()) {
        await bx.click(); await P.keyboard.type('Wx'); await P.waitForTimeout(200)
        await L.shot(w, `s5-${TAG}-${tag}2-typed`)
        await L.closeWin(w); await P.waitForTimeout(500)
        typed = true
      }
      const r1 = await roleRead()
      await L.openCell(w, sid, D)
      words = await P.evaluate(() => [...document.querySelectorAll('[data-testid$="-remarks"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.value))
      await L.shot(w, `s5-${TAG}-${tag}3-reopen`)
      await L.settle(w)
      const r2 = await roleRead()
      const memberOk = x => !x.approvalsTab && x.gear.length === 0 && !/Admin/i.test(x.badge || '')
      row('S5-' + tag, TAG, `Saber ${D}: ${approve ? 'approved' : 'pending'} OL (${cell0}); member view; tapped the day (opened ${JSON.stringify(opened)}); typed Wx=${typed}`, `Remarks on reopen=${JSON.stringify(words)}; role after typing ${JSON.stringify(r1)}; final ${JSON.stringify(r2)}`, !typed ? 'NOT REACHED' : (memberOk(r1) && memberOk(r2) ? 'PASS' : 'FAIL'), [`s5-${TAG}-${tag}1-open`, `s5-${TAG}-${tag}2-typed`, `s5-${TAG}-${tag}3-reopen`])
      await switchRole().catch(() => {})
    }
  }
  if (PH && (!ONLY || ONLY === 's6')) {
    await L.settle(w)
    // open the day panel on a December day, rest at the foot; scroll the grid so Manning is out of view; place a bid
    for (const dn of [43, 44, 42]) {
      const dd = L.day(dn)
      await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
      await L.reachCell(w, await L.pidOf(P, 'Drifter'), dd)
      const th = P.locator(`th.day[data-d="${dd}"]`).first(); await th.scrollIntoViewIfNeeded().catch(() => {})
      const tb = await th.boundingBox()
      await L.finger(w, tb.x + tb.width / 2, tb.y + tb.height / 2); await P.waitForTimeout(700)
      const up = await L.vis(P, T('win-lwday'))
      const wb = up ? await P.locator(T('win-lwday')).boundingBox() : null
      await L.shot(w, `s6-${TAG}-1-panel-${dn}`)
      // scroll the grid down so the Manning button is out of view
      const man = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /Manning/.test(b.textContent || '') && b.getBoundingClientRect().width > 0); return b ? Math.round(b.getBoundingClientRect().top) : null })
      const id = await L.pidOf(P, 'Drifter')
      const c = P.locator(T(L.cellId(id, dd))).first()
      await c.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await P.evaluate(() => window.scrollBy(0, -170)); await P.waitForTimeout(400)
      const man2 = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /Manning/.test(b.textContent || '') && b.getBoundingClientRect().width > 0); return b ? Math.round(b.getBoundingClientRect().top) : null })
      const cb = await c.boundingBox()
      const cellFree = cb && wb ? cb.y + cb.height < wb.y : null
      if (cb) console.log('point holds', await elAt(P, cb.x + cb.width / 2, cb.y + cb.height / 2)); console.log(`day ${dd}: panel up=${up} box=${JSON.stringify(wb)} Manning top before=${man} after=${man2} cell box=${JSON.stringify(cb)} cellFree=${cellFree}`)
      if (!cb) continue
      await L.finger(w, cb.x + cb.width / 2, cb.y + cb.height / 2); await P.waitForTimeout(600)
      const now = await openNow(P)
      await L.shot(w, `s6-${TAG}-2-bid-open-${dn}`)
      if (!now.includes('bid-picker')) { console.log('bid window did not open: ' + JSON.stringify(now)); await L.settle(w); continue }
      await L.autoApprove(w, false)
      const ok = await L.placeLeave(w, 'LL')
      await P.waitForTimeout(500)
      const bub = await P.evaluate(() => { const e = document.querySelector('[data-testid="manning-bubble"]'); if (!e) return null; const b = e.getBoundingClientRect(); const pw = document.querySelector('[data-testid="win-lwday"]'); const pb = pw ? pw.getBoundingClientRect() : null; const cs = getComputedStyle(e); return { text: e.innerText.replace(/\s+/g, ' ').slice(0, 120), top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), panelTop: pb ? Math.round(pb.top) : null, vis: cs.visibility + '/' + cs.opacity, vh: innerHeight } })
      await L.shot(w, `s6-${TAG}-3-bubble-${dn}`)
      console.log(`day ${dd}: placed=${ok} bubble=${JSON.stringify(bub)}`)
      if (bub) {
        const wholly = bub.bottom <= (bub.panelTop ?? bub.vh) + 0 && bub.top >= 0
        row('S6', TAG, `day panel up (${up}), Manning button top ${man2} (out of view if <0 or > ${bub.vh}), bid placed on ${dd}`, `bubble "${bub.text}" top ${bub.top} bottom ${bub.bottom}; panel top ${bub.panelTop}; vis ${bub.vis}`, bub.panelTop !== null ? (wholly ? 'PASS' : 'FAIL') : 'RECORD (panel gone when bubble measured)', [`s6-${TAG}-1-panel-${dn}`, `s6-${TAG}-2-bid-open-${dn}`, `s6-${TAG}-3-bubble-${dn}`])
        break
      }
      await L.settle(w)
    }
    if (!rows_has('S6')) row('S6', TAG, 'tried Dec days 43, 44, 42 with the day panel up', 'no manning bubble was raised by the bids (see log); NOT REACHED', 'NOT WALKED', [])
  }
} catch (e) { console.log('ERR', e.stack); row('S5S6', TAG, 'script', 'stopped: ' + String(e).slice(0, 300), 'NOT WALKED') }
function rows_has(id) { return rows.some(r => r.id === id) }
console.log('errs', JSON.stringify(w.errs))
finish('w4-' + TAG)
await L.closeBrowser()
