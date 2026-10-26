// THE WALK OF THE M3 BATCH OF 26 OCT 26 (his D1384–D1396: items 1–9 of the HANDOFF block) — written as assertions of the
// RIGHT behaviour, so a PASS means correct and re-running it on a fixed build is the re-walk (bug-check order §5). Each step
// pictures what it checked; on a phone a picture is taken right after each new control's tap, its touched state held (D1281).
// Run on a served build: LW_PORT=4173 node scripts/handpass/lw-m3c-walk.mjs  (pictures: docs/img/handpass/2026-10-26-lw-m3-batch/walk/)
process.env.LW_PORT ||= '4173'
process.env.LW_OUT ||= '2026-10-26-lw-m3-batch/walk'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
const only = (process.env.ONLY || 'w1,w2,w3,w4,w5,w6,w7,w8').split(',')
const run = id => only.includes(id)
const rec = (id, size, ok, said, pics = []) => L.rec(id, size, ok ? 'PASS' : 'FAIL', said, pics)
const TODAY = '2026-07-13'
const sizes = (process.env.SIZES || 'desk,phone').split(',')
async function ctxFor(sz) { const w = sz === 'phone' ? await H.phoneCtx() : await H.deskCtx(); await L.signInPlain(w, 'admin', TODAY); return w }
const tagOf = sz => sz === 'phone' ? 'phone' : 'desk'

for (const sz of sizes) {
  const w = await ctxFor(sz), P = w.page, tg = tagOf(sz)
  /* the seed's overseas duty is filed for the id "pike" (engine/inputs.ts seed: Wed 15 – Fri 17 Jul) */
  const pike = 'pike', comet = await H.idOf(P, 'Comet')
  /* Personal Inputs folds to a one-line count on the week by default (html.ts inGrp, PIOPEN): opened before its rows are read */
  const openPI = async () => { const shut = await P.evaluate(() => { const d = document.querySelector('#eWeek section.day[data-day="2"]'); return !!d && !d.querySelector('.sec-inp .pl-row') && !!d.querySelector('.sec-inp [data-pitog]') }); if (shut) { await P.locator('#eWeek section.day[data-day="2"] .sec-inp [data-pitog]').first().click(); await P.waitForTimeout(600) } }
  const odOf = () => P.evaluate(p => { const r = (window.INPUTS || []).find(x => x.type === 'OD' && (x.person === p || (x.people || []).some(y => y && y.p === p))); return r ? { acc: r.acc ?? null, odGround: !!r.odGround } : null }, pike)

  /* ---- w1 (item 1, D1393): an overseas duty gets Reject, then → Ground or → Unavail; the war and the crew list agree ---- */
  if (run('w1')) {
    const iso = '2026-07-15'
    await H.warOpen(w, pike, iso); const avail0 = await H.availP(P, iso)
    await H.goEdit(w)
    let t = await H.tagRow(P, 2, 'sec-unav', 'data-wk1', 'overseas duty|^OD|Pike')
    await H.centreOn(P, ['[data-wk1="1"]']).catch(() => {})
    await H.pic(w, `w1-${tg}-1-under-unavailable`, ['[data-wk1="1"]'], { pad: 12 })
    rec('w1.reject-offered', tg, (t.btns || []).includes('Reject'), `Pike's overseas duty under Unavailable: buttons ${JSON.stringify(t.btns)}`, [`w1-${tg}-1-under-unavailable`])
    const pressed = await H.pressRowBtn(w, 'data-wk1', 'Reject')
    const s1 = await odOf()
    await openPI(); t = await H.tagRow(P, 2, 'sec-inp', 'data-wk1', 'overseas|\\bOD\\b')
    if (!t.btns) console.log('   sec-inp on Wed:', JSON.stringify(t), JSON.stringify(await H.rowsOf(P, 2, 'sec-inp')), await P.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] [class*="sec-"]')].map(e => e.className).join(' | ')))
    await H.centreOn(P, ['[data-wk1="1"]']).catch(() => {})
    await H.pic(w, `w1-${tg}-2-rejected-personal-inputs`, ['[data-wk1="1"]'], { pad: 12 })
    rec('w1.reject', tg, pressed && s1?.acc === 'r' && (t.btns || []).join('·') === '→ Ground·→ Unavail', `after Reject: ${JSON.stringify(s1)}; Personal Inputs row buttons ${JSON.stringify(t.btns)}`, [`w1-${tg}-2-rejected-personal-inputs`])
    await H.warOpen(w, pike, iso); const avail1 = await H.availP(P, iso)
    await H.pic(w, `w1-${tg}-3-war-counted-in`, [T('avail-p-' + iso), T(L.cellId(pike, iso))], { pad: 10 })
    rec('w1.war-in', tg, avail0 !== avail1, `Available P on 15 Jul: before ${avail0}, after Reject ${avail1} (he counts back in)`, [`w1-${tg}-3-war-counted-in`])
    await H.goEdit(w)
    await openPI(); await H.tagRow(P, 2, 'sec-inp', 'data-wk1', 'overseas|\\bOD\\b')
    await H.pressRowBtn(w, 'data-wk1', '→ Ground')
    const s2 = await odOf()
    const gp = await P.evaluate(p => { const r = (window.INPUTS || []).find(x => x.type === 'OD' && (x.person === p || (x.people || []).some(y => y && y.p === p))); return (window.DAYS || []).some(d => (d.ground || []).some(g => g && r && g.src === r.iid)) }, pike)
    await openPI(); t = await H.tagRow(P, 2, 'sec-inp', 'data-wk1', 'overseas|\\bOD\\b')
    await H.centreOn(P, ['[data-wk1="1"]']).catch(() => {})
    await H.pic(w, `w1-${tg}-4-on-ground`, [`#eWeek section.day[data-day="2"] .sec-prog, [data-wk1="1"]`], { pad: 8 })
    rec('w1.ground', tg, s2?.acc === 'g' && s2.odGround && gp && (t.btns || []).some(b => /^Reject/.test(b)), `→ Ground: ${JSON.stringify(s2)}, a row on the Ground Programme ${gp}; Personal Inputs buttons ${JSON.stringify(t.btns)}`, [`w1-${tg}-4-on-ground`])
    /* the next week and back: the mark keeps him in (the course's F1) */
    await L.signInPlain(w, 'admin', TODAY); await P.waitForTimeout(800)   // a fresh load of the stored world: the week's marks worked out again
    await H.warOpen(w, pike, iso); const avail2 = await H.availP(P, iso)
    rec('w1.ground-war', tg, avail2 === avail1, `on the Ground Programme, after a week away and back: Available P ${avail2} (still counted in, as rejected: ${avail1})`)
    await H.goEdit(w)
    await openPI(); await H.tagRow(P, 2, 'sec-inp', 'data-wk1', 'overseas|\\bOD\\b')
    const rj = await P.evaluate(() => { const b = [...document.querySelectorAll('[data-wk1="1"] .accb')].find(x => /^Reject/.test(x.textContent.trim())); if (b) { b.scrollIntoView({ block: 'center' }); b.click(); return true } return false })
    await P.waitForTimeout(900)
    await openPI(); await H.tagRow(P, 2, 'sec-inp', 'data-wk1', 'overseas|\\bOD\\b')
    await H.pressRowBtn(w, 'data-wk1', '→ Unavail')
    const s3 = await odOf()
    t = await H.tagRow(P, 2, 'sec-unav', 'data-wk1', 'overseas duty|^OD|Pike')
    await H.centreOn(P, ['[data-wk1="1"]']).catch(() => {})
    await H.pic(w, `w1-${tg}-5-back-under-unavailable`, ['[data-wk1="1"]'], { pad: 12 })
    await H.warOpen(w, pike, iso); const avail3 = await H.availP(P, iso)
    rec('w1.unavail', tg, rj && s3?.acc === 'u' && !s3.odGround && (t.btns || []).includes('Reject') && avail3 === avail0, `Reject then → Unavail: ${JSON.stringify(s3)}; under Unavailable again with ${JSON.stringify(t.btns)}; Available P ${avail3} (as at first, ${avail0})`, [`w1-${tg}-5-back-under-unavailable`])
  }

  /* ---- w2 (items 2–3, D1392, D1394, D1395 H): Grant OIL's amount control, the one-day window and the drag window ---- */
  if (run('w2')) {
    const iso = '2026-07-16', iso2 = '2026-07-17'
    await H.warOpen(w, comet, iso)
    await L.openCellR(w, comet, iso)
    await L.press(w, T('bid-oil'), w.phone ? `w2-${tg}-0-touch-grant` : null); await P.waitForTimeout(400)
    const fo = await P.locator(T('oil-pick-fo')).getAttribute('aria-pressed').catch(() => null)
    const half = await L.vis(P, T('oil-half-am'))
    await H.pic(w, `w2-${tg}-1-grant-panel`, [T('bid-picker')], { pad: 4 })
    rec('w2.opens', tg, fo === 'true' && !half, `Grant OIL opens on FO · 1 lit (${fo}); no Half row (${!half})`, [`w2-${tg}-1-grant-panel`])
    await L.press(w, T('oil-pick-ho'), w.phone ? `w2-${tg}-2-touch-ho` : null); await P.waitForTimeout(300)
    const give1 = await L.txt(P, T('oil-give'))
    await P.locator(T('oil-days')).fill('2'); await P.waitForTimeout(250)
    const give2 = await L.txt(P, T('oil-give'))
    const fits = await P.evaluate(() => { const r = document.querySelector('.oil-amount'); return r ? [...r.children].every(c => { const a = c.getBoundingClientRect(), b = r.getBoundingClientRect(); return a.right <= b.right + 1 && a.left >= b.left - 1 }) : false })
    await H.pic(w, `w2-${tg}-3-two-typed`, [T('bid-picker')], { pad: 4 })
    rec('w2.words', tg, give1 === 'Give HO' && give2 === 'Give FO · 2 days' && fits, `the button: "${give1}" for HO · ½, "${give2}" for 2 typed; the row inside the window ${fits}`, [`w2-${tg}-3-two-typed`])
    await P.locator(T('oil-days')).fill(''); await L.press(w, T('oil-pick-ho')); await L.press(w, T('oil-give')); await P.waitForTimeout(700)
    const b1 = await H.cellBoxes(w, comet, iso)
    await H.warPic(w, `w2-${tg}-4-ho-given`, comet, [iso])
    rec('w2.ho', tg, (b1 || []).some(b => /^HO\|/.test(b)), `the day after Give HO: ${JSON.stringify(b1)}`, [`w2-${tg}-4-ho-given`])
    {
      /* a drag across four of Comet's days opens the drag window (lw-1025-drag-remarks.mjs dragCells: the first day centred,
         a mouse drag on a desktop, a held finger on a phone) */
      await L.reachCell(w, comet, iso2)
      await P.locator(T(L.cellId(comet, iso2))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
      const bA = await P.locator(T(L.cellId(comet, iso2))).first().boundingBox(), bZ = await P.locator(T(L.cellId(comet, '2026-07-20'))).first().boundingBox()
      const a = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, bb = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
      if (w.phone) await L.holdDrag(w, [a, { x: (a.x + bb.x) / 2, y: a.y }, bb])
      else { await P.mouse.move(a.x, a.y); await P.mouse.down(); await P.mouse.move(bb.x, bb.y, { steps: 10 }); await P.mouse.up() }
      await P.waitForTimeout(600)
      const up = await L.vis(P, T('sel-oil'))
      if (up) { await L.press(w, T('sel-oil')); await P.waitForTimeout(300) }
      const fo2 = up ? await P.locator(T('sel-oil-pick-fo')).getAttribute('aria-pressed').catch(() => null) : null
      await P.locator(T('sel-oil-why')).fill('Exercise weekend').catch(() => {})
      await H.pic(w, `w2-${tg}-5-drag-grant`, [T('select-sheet')], { pad: 4 })
      await L.press(w, T('sel-oil-give')).catch(() => {}); await P.waitForTimeout(800)
      const days = ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']
      const got = []; for (const d of days) got.push(((await H.cellBoxes(w, comet, d)) || []).some(b => /^FO\|/.test(b)))
      await H.warPic(w, `w2-${tg}-6-drag-given`, comet, days)
      rec('w2.drag', tg, up && fo2 === 'true' && got.every(Boolean), `drag window: Grant OIL there ${up}, opens on FO · 1 (${fo2}); an FO on each of 17–20 Jul: ${JSON.stringify(got)}`, [`w2-${tg}-5-drag-grant`, `w2-${tg}-6-drag-given`])
    }
  }

  /* ---- w3 (item 4, D1395 C): "Delete — sure?" on two lines inside its button ---- */
  if (run('w3')) {
    const iso = '2026-07-16'
    await H.warOpen(w, comet, iso)
    await L.openCellR(w, comet, iso)
    if (await L.vis(P, T('bid-clear'))) {
      await L.press(w, T('bid-clear'), w.phone ? `w3-${tg}-0-touch-delete` : null); await P.waitForTimeout(350)
      const m = await P.evaluate(() => { const b = document.querySelector('[data-testid="bid-clear"]'); if (!b) return null; const r = b.getBoundingClientRect(); const ls = [...b.querySelectorAll('.del-l')].map(s => s.getBoundingClientRect()); return { armed: b.classList.contains('armed'), lines: ls.length, inside: ls.every(s => s.left >= r.left && s.right <= r.right + 0.5 && s.top >= r.top && s.bottom <= r.bottom + 0.5), twoRows: ls.length === 2 && ls[1].top > ls[0].top, over: b.scrollWidth - b.clientWidth } })
      await H.pic(w, `w3-${tg}-1-delete-sure`, [T('bid-clear')], { pad: 14 })
      rec('w3.fits', tg, !!m && m.armed && m.lines === 2 && m.inside && m.twoRows && m.over <= 0, `asking Delete: ${JSON.stringify(m)}`, [`w3-${tg}-1-delete-sure`])
      await L.closeAny(w)
    } else rec('w3.fits', tg, false, 'no Delete on the day holding the HO given in w2 (run w2 first)')
  }

  /* ---- w4 (item 5, D1395): a tap on a course day opens the bid window, the course's line on top ---- */
  if (run('w4')) {
    const iso = '2026-07-14'
    await H.fileInput(w, { who: 'Comet', type: 'CSE', from: iso, remarks: 'Instructor course', tag: 'w4', oil: 'no' })
    await H.warOpen(w, comet, iso)
    await L.openCellR(w, comet, iso, w.phone ? `w4-${tg}-0-touch-course` : null)
    const line = await L.txt(P, T('bid-heldday'))
    const oil = await L.vis(P, T('bid-oil'))
    const ro = await L.vis(P, T('raptor-note'))
    await H.pic(w, `w4-${tg}-1-course-day`, [T('bid-picker')], { pad: 4 })
    rec('w4.window', tg, /CSE/.test(line || '') && /Whole day/.test(line || '') && /Instructor course/.test(line || '') && oil && !ro, `the window's top line: "${line}"; Grant OIL ${oil}; the read-only sheet ${ro}`, [`w4-${tg}-1-course-day`])
    await L.closeAny(w)
  }

  /* ---- w5 (item 6, D1382, D1395): the day panel's figures in columns of four ---- */
  if (run('w5')) {
    const iso = '2026-07-15'
    await H.warOpen(w, comet, iso)
    const th = P.locator(`th.day[data-d="${iso}"]`).first()
    await th.scrollIntoViewIfNeeded(); await th.click(); await P.waitForTimeout(800)
    const m = await P.evaluate(() => {
      const f = document.querySelector('[data-testid="lwday-figs"]'); if (!f) return null
      const rows = [...f.querySelectorAll('.dl-row')].map(r => { const b = r.getBoundingClientRect(), n = r.querySelector('.dl-name').getBoundingClientRect(), g = r.querySelector('.dl-fig').getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), nameLeft: Math.round(n.left - b.left), figRight: Math.round(b.right - g.right), over: r.scrollWidth - r.clientWidth } })
      const cols = [...new Set(rows.map(r => r.l))].sort((a, b) => a - b)
      const per = cols.map(c => rows.filter(r => r.l === c).length)
      const tops = cols.map(c => rows.filter(r => r.l === c).map(r => r.t))
      return { n: rows.length, cols: cols.length, per, firstColFull: per[0] === Math.min(4, rows.length), linedUp: tops.slice(1).every(ts => ts.every((t, i) => Math.abs(t - tops[0][i]) <= 1)), edges: rows.every(r => r.nameLeft <= 1 && r.figRight <= 1), over: Math.max(...rows.map(r => r.over)) }
    })
    await H.pic(w, `w5-${tg}-1-day-panel`, [T('win-lwday')], { pad: 4 })
    rec('w5.columns', tg, !!m && m.per.every(k => k <= 4) && m.firstColFull && m.linedUp && m.edges && m.over <= 0, `figures ${JSON.stringify(m)}`, [`w5-${tg}-1-day-panel`])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  }

  /* ---- w6 (item 7, D1386, D1396): ⤢ shows every input in the month ---- */
  if (run('w6')) {
    /* on a phone, his iPhone's visible height under Safari's bars (the drawing's d4): there July's busy days say "+n more" */
    const vp0 = P.viewportSize()
    if (w.phone) { await P.setViewportSize({ width: vp0.width, height: 660 }); await P.waitForTimeout(700) }
    await H.inCalMonth(w, 2026, 7); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const moreN =() => P.evaluate(() => document.querySelectorAll('#inpCal .ib-more').length)
    const m0 = await moreN()
    await H.pic(w, `w6-${tg}-1-compact`, ['#inpCal'], { pad: 4 })
    await L.press(w, T('ib-expand'), w.phone ? `w6-${tg}-0-touch-expand` : null); await P.waitForTimeout(700)
    const m1 = await moreN(), pressed = await P.locator(T('ib-expand')).getAttribute('aria-pressed')
    await H.pic(w, `w6-${tg}-2-expanded`, ['#inpCal'], { pad: 4 })
    /* remembered: away to the Leave War and back */
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(700); await H.inCalMonth(w, 2026, 7)
    const kept = await P.locator(T('ib-expand')).getAttribute('aria-pressed')
    await L.press(w, T('ib-expand')); await P.waitForTimeout(600)
    const m2 = await moreN()
    rec('w6.expand', tg, (m0 > 0 || !w.phone) && m1 === 0 && pressed === 'true' && kept === 'true' && m2 === m0,   /* a desktop's July has no "+n more" day (seven lines): the toggle and its memory are what it shows there */ `"+n more" compact ${m0}, expanded ${m1} (pressed ${pressed}); kept after leaving ${kept}; compact again ${m2}`, [`w6-${tg}-1-compact`, `w6-${tg}-2-expanded`])
  }

  /* ---- w7 (item 8, D1385, D1396 — phone): the opened day's cards stand where the list's do; the SANS day alike ---- */
  if (run('w7') && w.phone) {
    await H.openInputsList(w)
    if (await L.vis(P, '#inListBtn') && (await P.locator('#inListBtn').getAttribute('aria-pressed')) !== 'true') { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
    if (!(await P.locator('#inList .icard').count())) { await L.press(w, '#inRangeBtn'); await P.waitForTimeout(400); await L.press(w, '#inRangeAll'); await P.waitForTimeout(700) }
    const list = await P.evaluate(() => { const c = document.querySelector('#inBody .icard, #inList .icard'); const r = c?.getBoundingClientRect(); return r ? { l: Math.round(r.left), r: Math.round(innerWidth - r.right) } : null })
    await H.inCalMonth(w, 2026, 7)
    const day = P.locator('#inpCal [data-icday="2026-07-15"]').first(); const b = await day.boundingBox()
    await P.mouse.click(b.x + 10, b.y + 7); await P.waitForTimeout(800)
    const dayIn = await P.evaluate(() => { const win = document.querySelector('[data-testid="win-inputsday"]'); const c = win?.querySelector('.icard'); const r = c?.getBoundingClientRect(), wr = win?.getBoundingClientRect(); return r && wr ? { l: Math.round(r.left), r: Math.round(innerWidth - r.right), win: { l: Math.round(wr.left), r: Math.round(innerWidth - wr.right) } } : null })
    await P.screenshot({ path: `${H.OUT}/w7-${tg}-1-day-edge.png`, scale: 'css' })
    rec('w7.width', tg, !!list && !!dayIn && dayIn.l === list.l && dayIn.r === list.r && dayIn.win.l === 0 && dayIn.win.r === 0, `the list's cards ${JSON.stringify(list)}; the opened day's ${JSON.stringify(dayIn)}`, [`w7-${tg}-1-day-edge`])
    /* ---- w8 (item 9): the squares in their kind's colour, on the same day ---- */
    const sq = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].map(c => { const r = (window.INPUTS || []).find(x => String(x.iid) === c.getAttribute('data-popiid')); const s = c.querySelector('.icard-sq'); return { type: r?.type, cls: s?.className, bg: s ? getComputedStyle(s).backgroundColor : '' } }))
    await P.screenshot({ path: `${H.OUT}/w8-${tg}-1-day-squares.png`, scale: 'css' })
    const ok8 = sq.length > 0 && sq.every(x => /kd k-|duty/.test(x.cls || '')) && new Set(sq.map(x => x.bg)).size > 1
    rec('w8.squares', tg, ok8, `the day's squares: ${JSON.stringify(sq.slice(0, 8))}`, [`w8-${tg}-1-day-squares`])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  }
  if (run('w8') && !w.phone) {
    await H.openInputsList(w)
    if (!(await P.locator('#inList .icard, #inBody tr').count())) { await L.press(w, '#inRangeBtn'); await P.waitForTimeout(400); await L.press(w, '#inRangeAll'); await P.waitForTimeout(700) }
    await H.inCalMonth(w, 2026, 7)
    const day = P.locator('#inpCal [data-icday="2026-07-15"]').first(); const b = await day.boundingBox()
    await P.mouse.click(b.x + 10, b.y + 7); await P.waitForTimeout(800)
    const sq = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard .icard-sq')].map(s => s.className))
    await H.pic(w, `w8-${tg}-1-day-squares`, [T('win-inputsday')], { pad: 4 })
    rec('w8.squares', tg, sq.length > 0 && sq.every(c => /kd k-|duty/.test(c)), `the day's squares: ${JSON.stringify(sq)}`, [`w8-${tg}-1-day-squares`])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  }
  /* ---- w9 (item 8, D1396 — "the SANS calendar's day alike", phone): its opened day edge to edge too ---- */
  if (run('w9') && w.phone) {
    await H.sansOpen(w); await H.sansMonth(w, 2026, 7)
    await P.locator(T('sc-day-2026-07-15')).first().scrollIntoViewIfNeeded()
    const b = await P.locator(T('sc-day-2026-07-15')).first().boundingBox()
    await P.mouse.click(b.x + 10, b.y + 7); await P.waitForTimeout(800)
    const g = await P.evaluate(() => { const win = document.querySelector('[data-testid="win-sansday"]'); const wr = win?.getBoundingClientRect(); const list = win?.querySelector('.sd-list'); const pl = list ? getComputedStyle(list).paddingLeft : null; return wr ? { l: Math.round(wr.left), r: Math.round(innerWidth - wr.right), listPad: pl } : null })
    await P.screenshot({ path: `${H.OUT}/w9-${tg}-1-sans-day-edge.png`, scale: 'css' })
    rec('w9.sansday', tg, !!g && g.l === 0 && g.r === 0 && g.listPad === '8px', `the SANS day's window ${JSON.stringify(g)}`, [`w9-${tg}-1-sans-day-edge`])
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  }
  if (w.errs.length) rec('errors', tg, false, w.errs.slice(0, 6).join(' | '))
  await w.ctx.close()
}
fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify(L.results, null, 1))
const fails = L.results.filter(r => r.verdict !== 'PASS')
console.log(`\n${L.results.length - fails.length} PASS · ${fails.length} FAIL`)
await L.closeBrowser()
process.exit(0)
