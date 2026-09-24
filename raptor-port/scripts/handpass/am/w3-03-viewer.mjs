/* w3-03 — what a VIEWER sees, and the quiet correction, at desktop AND phone.
     S20 (cell level) — the pending change on Monday: absent from the issued face, present (dashed hint) on the
       working draft; picture of the same row both ways.
     Astra 26 — the viewer's "Working draft" choice across leaving the page (it may stay, but must stay
       labelled), never leaking onto the edit page / board, and gone for the next person after a logout.
     S21 — after Unpublish AL1: the view page reads "Original — as issued", no trace of AL1; the ⓘ panel says
       "No amendment has touched this day yet"; the Amendments panel lists no AL1 (desktop).
     S29 — the quiet correction round trip: Unpublish AL1 → fix → sign → "Publish AL1" under the SAME label →
       the panel lists AL1 once, the ⓘ once, the view page "AL1 — as issued" with the fix.
     S39 — the next-week peek on the view page, as the admin and as a member, after the admin publishes and then
       edits next Monday: what it shows (filed [FLAG-EXPORT] "label the peek working-vs-signed" — recorded, not
       re-filed). Desktop only (the peek is not drawn on a phone — checked).
   Usage: node w3-03-viewer.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, book, signDay, publishDay, publishAL, shot, viewDay, pickView,
  dayInfo, tapUnpub, logout, signIn, navTo, changeWeek, weekNow, editText, closePops, board, closeBoard } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']

for (const w of which) {
  const { check, note, summary } = checker('w3-03 ' + w)
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  await watchToasts(page)
  const P = s => `w3-03-${w}-${s}`
  const dayShot = async (s, di, root = '#eWeek') => {
    const d = page.locator(`${root} .day[data-day="${di}"]`).first()
    await d.evaluate(e => { e.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollBy(0, -(window.innerWidth < 820 ? 64 : 150)) }); await page.waitForTimeout(350)
    await shot(page, P(s))
  }
  /* the row that carries Monday's pending change on the view page (the working face marks it) */
  const pendRow = async () => page.evaluate(() => {
    const c = document.querySelector('#vWeek .day[data-day="0"] [data-alp]'); if (!c) return null
    const row = c.closest('.fl, .fline, tr, .pl-row, .wv-line, .line') || c.parentElement
    return { cell: (c.innerText || '').trim(), rowText: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120), cls: c.className }
  })
  const markRow = async (name) => {
    const loc = page.locator('#vWeek .day[data-day="0"] [data-alp]').first()
    if (!(await loc.count())) return false
    await loc.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await page.waitForTimeout(300)
    await shot(page, P(name)); return true
  }
  try {
    /* ---------------- S20 at cell level + Astra 26 ---------------- */
    await navTo(page, 'viewsched')
    await pickView(page, 0, 'working')
    const wr = await pendRow()
    note('S20 working face: the pending cell', wr)
    check('S20/AM19: the working draft marks the pending change (a dashed hint on the view page)', !!wr, JSON.stringify(wr))
    await markRow('a-view-working-pending-cell')
    /* the SAME row on the issued face — find it by the row text around the cell, minus the changed value */
    await pickView(page, 0, 'issued')
    const iv = await page.evaluate(() => ({ alp: document.querySelectorAll('#vWeek .day[data-day="0"] [data-alp]').length,
      has0745: /07:45/.test((document.querySelector('#vWeek .day[data-day="0"]') || {}).innerText || '') }))
    note('S20 issued face', iv)
    check('S20/AM4/AM5: the issued face carries no pending mark', iv.alp === 0, JSON.stringify(iv))
    /* the SAME formation row, close up, on both faces (found by its place among the day's formation rows) */
    await pickView(page, 0, 'working')
    const fi = await page.evaluate(() => { const c = document.querySelector('#vWeek .day[data-day="0"] [data-alp]'); const f = c && c.closest('.form')
      return f ? [...document.querySelectorAll('#vWeek .day[data-day="0"] .form')].indexOf(f) : -1 })
    const formShot = async (name) => { const f = page.locator('#vWeek .day[data-day="0"] .form').nth(fi)
      await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); await shot(page, P(name), f)
      return page.evaluate(i => ((document.querySelectorAll('#vWeek .day[data-day="0"] .form')[i] || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 90), fi) }
    const wRow = fi >= 0 ? await formShot('a2-view-working-row-closeup') : null
    await pickView(page, 0, 'issued')
    const iRow = fi >= 0 ? await formShot('b2-view-issued-row-closeup') : null
    note('S20 the changed flying line, working vs issued', { working: wRow, issued: iRow })
    check('S20/AM4: the issued face shows the line as issued, the working draft shows the change', !!wRow && !!iRow && wRow !== iRow, `working="${wRow}" | issued="${iRow}"`)
    await page.locator('#vWeek .day[data-day="0"] .form').nth(Math.max(0, fi)).evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
    await shot(page, P('b-view-issued-same-row'))

    /* Astra 26: the Working choice across a page change, the edit page and a session */
    await pickView(page, 0, 'working')
    await navTo(page, 'inputs')
    await navTo(page, 'viewsched')
    const v26 = await viewDay(page, 0)
    note('Astra26 after leaving the page and coming back', v26)
    check('Astra26: after leaving the page the Working choice is either cleared or still clearly labelled', (v26.picker[0] === '*AL1 — as issued') || (/Working draft/.test(v26.stamp) && /not issued/.test(v26.bar)), `${v26.picker.join(' / ')} | stamp=${v26.stamp} | bar=${v26.bar}`)
    await navTo(page, 'editsched')
    const e0 = await head(page, 0)
    const e0stamp = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .dbeak.work')].length)
    check('Astra26: the viewer\'s Working choice does not leak onto the edit page (no "Working draft" stamp there)', e0stamp === 0 && e0.tag === 'AL1', `stamps=${e0stamp} tag=${e0.tag}`)
    await board(page, 0)
    const bstamp = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .dbeak.work')].length)
    const bh = await head(page, 0)
    check('Astra26: nor onto the board\'s strip', bstamp === 0 && bh.tag === 'AL1', `stamps=${bstamp} tag=${bh.tag}`)
    await shot(page, P('c-board-mon-while-viewer-on-working'))
    await closeBoard(page)
    await logout(page); await signIn(page, 'm')
    const vm = await viewDay(page, 0)
    check('Astra26: the next person (a member) starts on "AL1 — as issued", not the admin\'s Working choice', vm.picker[0] === '*AL1 — as issued', vm.picker.join(' / '))
    await logout(page); await signIn(page, 'a')

    /* ---------------- S21: Unpublish AL1 on Monday ---------------- */
    await navTo(page, 'editsched')
    const before = await head(page, 0)
    const u = await tapUnpub(page, 0)
    const h0 = await head(page, 0)
    note('S21 Mon after Unpublish AL1', { before, u, h0 })
    check('AM37c/AM34: Unpublish AL1 → Monday back at ORIG (one tap, weekday)', h0.tag === 'ORIG', h0.tag)
    check('AM37c: AL1\'s change re-opens as pending beside the pending time change (2 pending)', /2\s+pending/.test(h0.pending), h0.pending)
    check('AM33/AM34: the button now offers "Publish AL1" (same label) and the sign-offs are cleared', h0.alpub && /Publish AL1/.test(h0.alpub.text) && /4 to sign/.test(h0.signState), `${h0.alpub && h0.alpub.text} | ${h0.signState}`)
    await dayShot('d-edit-mon-after-unpublish', 0)
    const di0 = await dayInfo(page, 0, P('e-edit-mon-dayinfo-after-unpublish'))
    note('S21 ⓘ (edit page)', di0)
    check('S21: the ⓘ says "No amendment has touched this day yet"', /No amendment has touched this day yet/.test(di0), di0.slice(0, 200))
    check('S21: the ⓘ no longer says "at AL1"', !/at AL1/.test(di0), di0.slice(0, 120))
    if (w === 'desktop') {
      const panel = await page.evaluate(() => (document.querySelector('#alPanel') || {}).innerText || 'NO PANEL')
      note('S21 Amendments panel', panel.replace(/\s+/g, ' '))
      check('S21: the Amendments panel lists no AL1 for Monday any more', !/AL1\s*Mon/.test(panel.replace(/\s+/g, ' ')), panel.replace(/\s+/g, ' ').slice(0, 300))
    }
    const vv = await viewDay(page, 0)
    note('S21 view page Mon', vv)
    check('S21: the view page reads "Original — as issued"', vv.picker[0] === '*Original — as issued', vv.picker.join(' / '))
    check('S21/AM35: no trace of AL1 on the issued face (tag ORIG, no AL1-coloured mark)', vv.tag === 'ORIG' && vv.issued === 0, `tag=${vv.tag} issued-marks=${vv.issued}`)
    const noteIssued = await page.evaluate(() => { const n = document.querySelector('#vWeek .day[data-day="0"] .pl-hint, #vWeek .day[data-day="0"] .dnote, #vWeek .day[data-day="0"] [class*=note]'); return n ? (n.innerText || '').trim().slice(0, 80) : null })
    note('S21 the issued face\'s day note', noteIssued)
    await dayShot('f-view-mon-original-after-unpublish', 0, '#vWeek')
    const div = await dayInfo(page, 0, P('g-view-mon-dayinfo-after-unpublish'))
    check('S21: the view page ⓘ agrees (no amendment)', /No amendment has touched this day yet/.test(div), div.slice(0, 160))

    /* ---------------- S29: fix → sign → Publish AL1 under the same label ---------------- */
    await navTo(page, 'editsched')
    await editText(page, 'dn:0.0', 'MON NOTE — AL1 CORRECTED')
    await signDay(page, 0)
    const hs = await head(page, 0)
    note('S29 signed', hs)
    const pa = await publishAL(page, 0)
    const ts = await toasts(page)
    const h1 = await head(page, 0)
    note('S29 publish', { pa, ts, h1 })
    check('S29/AM33: the correction republishes under the SAME label (AL1, not AL2)', pa.pressed && /AL1/.test(pa.label || '') && h1.tag === 'AL1', `${pa.label} → tag ${h1.tag}`)
    const bk = await book(page)
    note('S29 book', bk)
    check('S29/AM3: Monday has exactly ONE issued AL1 record', bk.als.filter(a => / d0 /.test(a)).length === 1, JSON.stringify(bk.als))
    check('S29/AM4: the pulled-back AL1 is kept as its own snapshot (the retired log)', bk.retired.some(k => /^2026-07-13#1~/.test(k)), JSON.stringify(bk.retired))
    if (w === 'desktop') {
      const panel2 = (await page.evaluate(() => (document.querySelector('#alPanel') || {}).innerText || '')).replace(/\s+/g, ' ')
      note('S29 panel', panel2)
      check('S29: the Amendments panel lists AL1 Monday ONCE', (panel2.match(/AL1\s*Mon/g) || []).length === 1, panel2.slice(0, 300))
      await page.locator('#alPanel').evaluate(e => e.scrollIntoView({ block: 'center' })); await shot(page, P('h-panel-after-correction'), page.locator('#alPanel'))
    }
    const di1 = await dayInfo(page, 0, P('i-edit-mon-dayinfo-after-correction'))
    check('S29: the ⓘ lists AL1 once', (di1.match(/AL1\s*\d+ items?/g) || []).length === 1, di1.slice(0, 200))
    const vv2 = await viewDay(page, 0)
    check('S29: the view page reads "AL1 — as issued"', vv2.picker[0] === '*AL1 — as issued', vv2.picker.join(' / '))
    const hasFix = await page.evaluate(() => /MON NOTE — AL1 CORRECTED/.test((document.querySelector('#vWeek .day[data-day="0"]') || {}).innerText || ''))
    check('S29: the issued face carries the correction', hasFix, String(hasFix))
    await dayShot('j-view-mon-al1-corrected', 0, '#vWeek')
    note('S29 toasts', ts)

    /* ---------------- S39: the next-week peek ---------------- */
    await navTo(page, 'editsched')
    await changeWeek(page, '2026-07-20')
    await signDay(page, 0)
    const p20 = await publishDay(page, 0)
    const k20 = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt).find(k => /^dn:0\./.test(k)) || null)
    if (k20) await editText(page, k20, 'NEXT MON WORKING EDIT')
    const h20 = await head(page, 0)
    note('S39 next Monday', { p20, k20, h20 })
    await changeWeek(page, '2026-07-13')
    await navTo(page, 'viewsched')
    const peek = await page.evaluate(() => {
      const ds = [...document.querySelectorAll('#vWeek .day.peek')]
      return { n: ds.length, visible: ds.filter(d => d.offsetWidth).length, first: ds[0] ? (ds[0].innerText || '').replace(/\s+/g, ' ').slice(0, 220) : null,
        tag: ds[0] ? !!ds[0].querySelector('.verchip') : null, label: (document.querySelector('#vWeek .peek-nextwk') || {}).innerText || '' }
    })
    note('S39 the peek (admin)', peek)
    if (w === 'desktop') {
      check('S39 (record): the peek is drawn on the desktop view page', peek.visible > 0, JSON.stringify({ n: peek.n, visible: peek.visible }))
      note('S39 (filed [FLAG-EXPORT], not re-filed): what the peek shows for a PUBLISHED next Monday with an unpublished edit',
        `${/NEXT MON WORKING EDIT/.test(peek.first || '') ? 'the WORKING edit ("NEXT MON WORKING EDIT"), not the issued Original' : 'the issued content'}; version tag on the peek: ${peek.tag}; label: "${peek.label}"`)
      const pk = page.locator('#vWeek .day.peek').first()
      await pk.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400)
      await shot(page, P('k-view-peek-admin'))
      await logout(page); await signIn(page, 'm')
      await navTo(page, 'viewsched')
      const pm = await page.evaluate(() => { const d = document.querySelector('#vWeek .day.peek'); return d ? (d.innerText || '').replace(/\s+/g, ' ').slice(0, 220) : null })
      note('S39 the peek (member)', pm)
      const pk2 = page.locator('#vWeek .day.peek').first()
      if (await pk2.count()) { await pk2.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400); await shot(page, P('l-view-peek-member')) }
      /* and what the member sees on next week's own Monday (its issued face) */
      await changeWeek(page, '2026-07-20')
      const nm = await viewDay(page, 0)
      const nmHas = await page.evaluate(() => /NEXT MON WORKING EDIT/.test((document.querySelector('#vWeek .day[data-day="0"]') || {}).innerText || ''))
      note('S39 member on next week\'s Monday itself', { nm, workingEditVisible: nmHas })
      check('AM5: on next week\'s own page the member sees next Monday\'s issued face (no working edit)', nm.picker[0] === '*Original — as issued' && !nmHas, `${nm.picker.join(' / ')} working-edit-visible=${nmHas}`)
    } else {
      check('S39 (record): the peek is not drawn at phone width', peek.visible === 0, JSON.stringify({ n: peek.n, visible: peek.visible }))
    }
  } catch (e) { check('script ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash')).catch(() => {}) }
  check('no console errors during the walk', errors.length === 0, JSON.stringify(errors).slice(0, 400))
  summary()
  await browser.close()
}
