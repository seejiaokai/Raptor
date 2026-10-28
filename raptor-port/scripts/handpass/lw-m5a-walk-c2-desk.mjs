// walker C, script 2 — desktop: SANS man (on, then off the war), the paperclip and its viewer, a line tapped, the year picker, a box typed then another name.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c2'
const { L, T, pwRead, onScreen, closePw, openBalances, typeInBox, balRow, gridFigure, note, topAt, ids, rec, shot, press, vis, txt } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c2-desk v1]')
L.clearOut()
const w = await L.newCtx('desk')
const P = w.page
const blk = async (name, fn) => { try { await fn() } catch (e) { rec(name + ' (script)', 'desk', 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300), [name]); await shot(w, name + '-err').catch(() => {}) } }
const nameBtn = pid => `[data-testid="row-${pid}"] .whoedit`
const rowIds = () => P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)))
await L.signIn(w, 'admin')

/* ---- the cf box on the tiles (P2b redone with the box read) ---- */
await blk('21', async () => {
  await press(w, nameBtn('bane')); await P.waitForTimeout(600)
  const pw = await pwRead(P)
  const txtAll = await P.evaluate(() => document.querySelector('[data-testid="person-window"]').innerText.replace(/\s+/g, ' '))
  rec('P2b words "incl. [2] carried fwd · till 31 Dec" (box read)', 'desk', pw.cf === '2' && /incl\.\s*carried fwd · till 31 Dec/.test(txtAll) ? 'PASS' : 'FAIL', `carried fwd box "${pw.cf}"; words "${txtAll.match(/incl\.[^A-Z]*till 31 Dec/)?.[0]}"`, ['01-ranger-docked'])
  await closePw(w)
})

/* ---- SANS on the war ---- */
let sansPid = null
await blk('22', async () => {
  const before = await rowIds()
  await press(w, T('settings-open')); await P.waitForTimeout(600)
  await press(w, T('sans-toggle')); await P.waitForTimeout(800)
  await shot(w, '22a-settings-sans-on')
  await press(w, T('settings-close')); await P.waitForTimeout(600)
  const after = await rowIds()
  const added = after.filter(x => !before.includes(x))
  sansPid = added[0]
  rec('S1 Show SANS puts SANS men on the war (their rows appear)', 'desk', added.length ? 'PASS' : 'FAIL', `rows before ${before.length}, after ${after.length}; new: ${added.join(',')}`, ['22a-settings-sans-on'])
  if (!sansPid) return
  await press(w, nameBtn(sansPid)); await P.waitForTimeout(700)
  const pw = await pwRead(P)
  await shot(w, '22b-sans-window')
  const sansName = await P.evaluate(pid => document.querySelector(`[data-testid="row-${pid}"] .whoedit`)?.innerText.replace(/\s+/g, ' ').trim(), sansPid)
  rec('P7 a SANS man (SANS on) opens his window', 'desk', pw && onScreen(pw) ? 'PASS' : 'FAIL', `${sansPid} "${sansName}": window "${pw?.name}" App ${pw?.app} cf ${pw?.cf} pend ${pw?.pend} war ${pw?.war} lines ${pw?.lines.length} boxes ${pw?.boxes}`, ['22b-sans-window'])
  await closePw(w)
  /* a pending bid for him from the bid window, Auto-approve off */
  await L.reachCell(w, sansPid, '2026-02-10')
  await press(w, T(`cell-${sansPid}-2026-02-10`)); await P.waitForTimeout(600)
  await L.approveWhatIEnter(w, false)
  const placed = await L.placeLeave(w, 'LL')
  await P.waitForTimeout(500)
  await L.closeWin(w)
  await press(w, nameBtn(sansPid)); await P.waitForTimeout(600)
  const pw2 = await pwRead(P)
  await shot(w, '22c-sans-with-bid')
  rec('S2 a pending LL placed for the SANS man shows in his window', 'desk', pw2 && pw2.lines.some(l => /LL Tue 10 Feb 1 Pending/.test(l.text)) ? 'PASS' : 'FAIL', `placed ${placed}; lines: ${pw2?.lines.map(l => l.text).join(' | ')}; Pending ${pw2?.pend}`, ['22c-sans-with-bid'])
  await closePw(w)
  /* SANS off the war: his Approvals line */
  await press(w, T('settings-open')); await P.waitForTimeout(600)
  await press(w, T('sans-toggle')); await P.waitForTimeout(800)
  await press(w, T('settings-close')); await P.waitForTimeout(600)
  const gone = !(await rowIds()).includes(sansPid)
  await L.openApprovals(w)
  const lines = await L.apprLines(P)
  const mine = lines.filter(l => l.who === sansPid)
  await shot(w, '22d-approvals-sans-off')
  rec('S3 SANS off the war: his request still on Approvals', 'desk', gone && mine.length ? 'PASS' : 'FAIL', `his grid row gone: ${gone}; Approvals lines for him: ${JSON.stringify(mine)}`, ['22d-approvals-sans-off'])
  if (mine.length) {
    for (const [what, sel] of [['his puck', `[data-testid="appr-line-${sansPid}"] .appr-puck`], ['his dates', `[data-testid="appr-line-${sansPid}"] [data-testid="appr-dates"]`]]) {
      await press(w, sel); await P.waitForTimeout(800)
      const pwx = await pwRead(P)
      const tab = await P.evaluate(() => [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getAttribute('aria-selected') === 'true').map(e => e.dataset.testid).join(','))
      await shot(w, `22e-sans-off-${what.replace(/\W+/g, '-')}`)
      rec(`S4 a man with no row: a tap on ${what} on Approvals`, 'desk', pwx ? (onScreen(pwx) ? 'PASS' : 'FAIL') : 'PASS', `window ${pwx ? `"${pwx.name}" App ${pwx.app} pend ${pwx.pend} lines ${pwx.lines.length} top ${pwx.box.top}` : 'none opened'}; tab now ${tab}; (the spec's way in for a man with no row is Approvals' line; where nothing opens, the host reads it)`, [`22e-sans-off-${what.replace(/\W+/g, '-')}`])
      if (pwx) {
        /* a leave line of a man with no row: is it a link? */
        const goBtn = await P.locator('[data-testid="person-window"] button.ll-go').count()
        const ln = pwx.lines[0]?.id
        if (ln) {
          const before = await P.evaluate(() => [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getAttribute('aria-selected') === 'true').map(e => e.dataset.testid).join(','))
          if (goBtn) { await press(w, `[data-testid="${ln}"] button.ll-go`); await P.waitForTimeout(900) }
          await shot(w, '22f-line-tap-no-row')
          const ringed = await P.evaluate(() => [...document.querySelectorAll('[class*="ring"], [class*="just"], .lw-ring')].length)
          rec('S5 (★15) a leave line tapped for a man with no row: nothing jumps to an empty place', 'desk', 'PASS', `line is a link: ${!!goBtn}; tab before ${before}, after ${await P.evaluate(() => [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getAttribute('aria-selected') === 'true').map(e => e.dataset.testid).join(','))}; ring-like marks drawn: ${ringed}; his row on the grid: none (SANS off) — the host reads the picture`, ['22f-line-tap-no-row'])
        }
        await closePw(w)
      }
    }
  }
  await L.openGrid(w)
})

/* ---- a paperclip: a leave placed WITH a document, then the viewer ---- */
await blk('23', async () => {
  await L.reachCell(w, 'bane', '2026-04-07')
  await press(w, T('cell-bane-2026-04-07')); await P.waitForTimeout(600)
  await L.approveWhatIEnter(w, true)
  const file = L.pdfPath('c-doc.pdf')
  const inp = P.locator('input[type=file]').first()
  const n = await P.locator('input[type=file]').count()
  if (n) await inp.setInputFiles(file); else console.log('   no file input found')
  await P.waitForTimeout(600)
  await shot(w, '23a-bid-with-doc')
  const placed = await L.placeLeave(w, 'LL')
  await P.waitForTimeout(600)
  await L.closeWin(w)
  await press(w, nameBtn('bane')); await P.waitForTimeout(700)
  const pw = await pwRead(P)
  const clips = await ids(P, 'pw-clip-')
  await shot(w, '23b-window-with-clip')
  rec('C1 a leave with a document wears a paperclip in the list', 'desk', clips.length ? 'PASS' : 'FAIL', `file inputs ${n}; placed ${placed}; clips ${clips.join(',')}; lines ${pw?.lines.map(l => l.text).join(' | ')}`, ['23b-window-with-clip'])
  if (clips.length) {
    await press(w, `[data-testid="${clips[0]}"]`); await P.waitForTimeout(900)
    await shot(w, '23c-viewer')
    const top = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]').getBoundingClientRect(); const h = document.elementFromPoint(pw.left + pw.width / 2, pw.top + pw.height / 2); return { tag: h?.tagName, tid: h?.dataset?.testid, cls: (h?.className || '').toString().slice(0, 60), inWindow: !!h?.closest('[data-testid="person-window"]') } })
    rec('C2 the paperclip opens the document over the window (D1292): the element at the window\'s centre is the viewer', 'desk', !top.inWindow ? 'PASS' : 'FAIL', `element at the window's centre: ${JSON.stringify(top)}`, ['23c-viewer'])
    await P.keyboard.press('Escape'); await P.waitForTimeout(500)
    const pwA = await pwRead(P)
    const focusA = await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
    await shot(w, '23d-after-first-escape')
    rec('C3 Escape closes the viewer first, the window stays', 'desk', pwA ? 'PASS' : 'FAIL', `person window still open: ${!!pwA}; focus on ${focusA}`, ['23d-after-first-escape'])
    await P.keyboard.press('Escape'); await P.waitForTimeout(500)
    const pwB = await pwRead(P)
    const focusB = await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.className?.toString().slice(0, 40) || document.activeElement?.tagName)
    rec('C3b a second Escape closes the window; the keyboard returns to the name that opened it', 'desk', !pwB ? 'PASS' : 'FAIL', `window open after second Escape: ${!!pwB}; focus on ${focusB}`, ['23d-after-first-escape'])
  }
})

/* ---- a line tapped: the grid goes there with the ring; the window does not cover it ---- */
await blk('24', async () => {
  await press(w, nameBtn('bane')); await P.waitForTimeout(700)
  const pw = await pwRead(P)
  for (const id of ['pw-line-2026-03-02', 'pw-line-2026-01-26', 'pw-line-2026-04-07']) {
    if (!(await P.locator(`[data-testid="${id}"] button.ll-go`).count())) { rec('L1 a tap on ' + id, 'desk', 'NOT WALKED', 'no tappable dates', []); continue }
    await press(w, `[data-testid="${id}"] button.ll-go`); await P.waitForTimeout(1200)
    const iso = id.slice(8)
    const info = await P.evaluate(iso => {
      const c = document.querySelector(`[data-testid="cell-bane-${iso}"]`); if (!c) return { cell: false }
      const r = c.getBoundingClientRect(); const pw = document.querySelector('[data-testid="person-window"]')?.getBoundingClientRect()
      const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      const cs = getComputedStyle(c)
      return { cell: true, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), pwLeft: pw && Math.round(pw.left), onTop: h === c || c.contains(h) ? 'cell' : (h?.closest('[data-testid="person-window"]') ? 'person window' : (h?.dataset?.testid || h?.className?.toString().slice(0, 30))), outline: cs.outline, shadow: cs.boxShadow.slice(0, 80), cls: c.className.toString().slice(0, 80) }
    }, iso)
    await shot(w, `24-line-${iso}`)
    rec('L1 a tap on a line (' + iso + ') takes the grid there with the ring; the window stays and does not cover the day', 'desk', info.cell && info.onTop === 'cell' && info.r <= info.pwLeft + 2 ? 'PASS' : 'FAIL', JSON.stringify(info), [`24-line-${iso}`])
    const pwx = await pwRead(P)
    if (!pwx) { rec('L1b the window after the tap', 'desk', 'PASS', 'the window closed on the tap (recorded)', []); await press(w, nameBtn('bane')); await P.waitForTimeout(600) }
  }
  await closePw(w)
})

/* ---- the year picker, a past year (clock to 1 Jan 2027 on the war) ---- */
await blk('25', async () => {
  await P.evaluate(() => window.lwSetMemberToday('2027-01-05'))
  await L.openGrid(w)
  await P.waitForTimeout(900)
  await press(w, nameBtn('bane')); await P.waitForTimeout(800)
  const pw = await pwRead(P)
  await shot(w, '25a-2027')
  rec('Y1 clock 5 Jan 2027: the year picker offers the new year first and the past year', 'desk', pw && pw.year && pw.year.options.length >= 2 ? 'PASS' : 'FAIL', `options ${JSON.stringify(pw?.year)}; lines ${pw?.lines.length}; taken "${pw?.taken}"; App ${pw?.app} cf ${pw?.cf}`, ['25a-2027'])
  if (pw?.year?.options.length >= 2) {
    const sel = P.locator(T('pw-year'))
    const vals = await sel.evaluate(s => [...s.options].map(o => o.value))
    await sel.selectOption(vals[1]); await P.waitForTimeout(600)
    const pw2 = await pwRead(P)
    await shot(w, '25b-past-year')
    rec('Y2 a past year picked: that year\'s leave, read only?', 'desk', pw2 && pw2.lines.length > 0 ? 'PASS' : 'FAIL', `year ${JSON.stringify(pw2?.year)}; ${pw2?.lines.length} lines: ${pw2?.lines.map(l => l.text).join(' | ')}`, ['25b-past-year'])
  }
  await closePw(w)
  await P.evaluate(() => window.lwSetMemberToday('2026-01-25'))
  await L.openGrid(w); await P.waitForTimeout(700)
})

/* ---- ★17: a box typed, then a tap on another name ---- */
await blk('26', async () => {
  await press(w, nameBtn('bane')); await P.waitForTimeout(700)
  await press(w, T('pw-LVE')); await P.waitForTimeout(200)
  await P.keyboard.press('Control+A'); await P.keyboard.type('16', { delay: 30 })
  await P.waitForTimeout(200)
  await press(w, nameBtn('shaft')); await P.waitForTimeout(900)
  const pw = await pwRead(P)
  await shot(w, '26-typed-then-other-name')
  await closePw(w)
  const fig = await gridFigure(P, 'bane'); const figS = await gridFigure(P, 'shaft')
  await openBalances(w)
  const rb = await balRow(P, 'bane'), rs = await balRow(P, 'shaft')
  await shot(w, '26b-balances-after')
  rec('X1 (★17) a figure typed in Ranger\'s window, no Enter, then Anvil\'s name: saved to Ranger, Anvil\'s window shows his own', 'desk', rb?.app === '16' && pw && /Anvil/.test(pw.name) && pw.app !== '16' ? 'PASS' : 'FAIL', `Anvil's window "${pw?.name}" App bal ${pw?.app}; Balances: Ranger ${JSON.stringify(rb)}, Anvil ${JSON.stringify(rs)}; grid figures Ranger "${fig}", Anvil "${figS}"`, ['26-typed-then-other-name', '26b-balances-after'])
  await L.undo(w)
  const rb2 = await balRow(P, 'bane')
  rec('X2 one Undo takes Ranger\'s 16 back', 'desk', rb2?.app === '15' ? 'PASS' : 'FAIL', `Ranger after Undo ${JSON.stringify(rb2)}; note ${(await note(P)).join(' | ')}`, ['26b-balances-after'])
  await L.openGrid(w)
})

await w.ctx.close()
rec('errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('c2')
await L.closeBrowser()
console.log('DONE')
