/* W5 — ORDER 4: AWARD then WORK / WORK then AWARD (Fable S10, Astra 8), on Saturday 18 Jul — the demo's one aircrew duty
   desk (Fable, `plasma`) — in two fresh worlds, one per order, then UNPUBLISH (world 1) and an AL that takes him off the
   desk (world 2), with undo / redo / reload. Assertions of the RIGHT behaviour.
   Rules: N16 / D82 (an award and a worked day ADD UP — a 3-day award plus the schedule's credit is 4, and neither changes
   the other), N13 / D80 (an award flags nothing — no amber from it, it counts nobody on duty), N17 (manning counts bodies;
   the duty line counts a man the schedule credited, never an award), the box shows the schedule's credit with the award
   behind +1, the tap list names the two kinds apart (N16), D142 (a day's OIL is its latest published version: unpublishing,
   or an AL taking him off, takes his EARNED credit; the award stays — an award is never removed automatically).
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-04-award-work.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, closeSheets, shot, toastSpy, toasts, resultBook, ROOT, lwShot, lwAward, lwTracker, board, closeBoard, publishAL, signDay, unpublish, go } = L
const { undo, redo, reload, snap } = X
const PHONE = W === 'phone'
const R = resultBook(`W5-04-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-04-${W}.txt`)
const pic = n => `w5-04-${W}-${n}`
const SAT = 5, SISO = '2026-07-18', M = 'plasma'
const oil = s => s && s.figs ? +s.figs.oil : NaN
const size = { width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, dpr: PHONE ? 2 : 1 }
let page, errors, R2 = {}
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, pic(`THREW-${name}`)).catch(() => {}) } }
async function readDay(tag) {
  await lwOpen(page, SISO)
  const s = await snap(page, M, [SISO])
  const t = await tapCell(page, M, SISO)
  await shot(page, pic(`${tag}-sheet`))
  await closeSheets(page)
  return { ...s, open: t.open, lines: t.lines && t.lines.length ? t.lines : [(t.text || '').slice(0, 300)] }
}

/* ================= WORLD 1: AWARD then WORK */
{
  const w = await openHi({ ...size, who: 'a' }); page = w.page; errors = w.errors
  await toastSpy(page)
  let a0, a1, a2
  await step('W1-award-first', async () => {
    a0 = await readDay('A0-before')
    const g = await lwAward(page, M, SISO, '3', 'W5 award before work')
    a1 = await readDay('A1-after-award')
    R.ck('W1-award', g.given && oil(a1) === oil(a0) + 3 && !/!/.test(a1.run[0]) && JSON.stringify(a1.man) === JSON.stringify(a0.man),
      'a 3-day award on Fable\'s Saturday: +OIL rises by 3, no amber, the manning cells unchanged (N13)', { given: g, before: { oil: oil(a0), run: a0.run }, after: { oil: oil(a1), run: a1.run, lines: a1.lines }, manBefore: a0.man, manAfter: a1.man })
  })
  await step('W1-then-publish', async () => {
    await toasts(page)
    const p = await S.pubOnBoard(page, SAT)
    const ts = await toasts(page)
    a2 = await readDay('A2-after-publish')
    await lwShot(page, pic('A2-cell-award-then-work'), M, SISO)
    R.ck('W1-add-up', p.p.pressed && oil(a2) === oil(a0) + 4, 'published: the schedule\'s credit and the award ADD UP — +OIL is 4 (N16)', { oil: [oil(a0), oil(a1), oil(a2)], toasts: ts })
    R.ck('W1-box', /FO/.test(a2.run[0]) && /\+1/.test(a2.run[0]) && !/!/.test(a2.run[0]), 'the box shows the schedule\'s credit with the award behind +1, no amber', a2.run)
    R.ck('W1-two-kinds', (a2.lines || []).some(l => /OIL earned/.test(l)) && (a2.lines || []).some(l => /OIL award/.test(l)), 'the tap list names the two apart: "OIL earned … From the published schedule" and "OIL award · given by …"', a2.lines)
    R.note('W1-manning', { before: a0.man, afterAward: a1.man, afterPublish: a2.man })
  })
  await step('W1-undo-redo-reload', async () => {
    await lwOpen(page, SISO)
    const u = await undo(page)
    const su = await snap(page, M, [SISO])
    R.ck('W1-undo-publish', u.pressed && oil(su) === oil(a1), 'Undo (of the publish) takes the earned credit back; the award stays (+OIL 3)', { undo: u, oil: oil(su), run: su.run })
    const r = await redo(page)
    const sr = await snap(page, M, [SISO])
    R.ck('W1-redo', r.pressed && oil(sr) === oil(a2), 'Redo publishes again: +OIL back to 4', { redo: r, oil: oil(sr), run: sr.run })
    const rl = await reload(page, 'a')
    await lwOpen(page, SISO)
    const sl = await snap(page, M, [SISO])
    R.ck('W1-reload', oil(sl) === oil(a2) && JSON.stringify(sl.run) === JSON.stringify(a2.run), 'a reload keeps both credits (+OIL 4)', { rl, oil: oil(sl), run: sl.run })
    const tr = await lwTracker(page, M, pic('A3-oil-tracker'))
    R.note('W1-tracker', tr)
  })
  await step('W1-unpublish', async () => {
    await board(page, SAT)
    await toasts(page)
    const u = await unpublish(page, SAT)
    const ts = await toasts(page)
    await closeBoard(page)
    const s = await readDay('A4-after-unpublish')
    await lwShot(page, pic('A4-cell-after-unpublish'), M, SISO)
    R.ck('W1-unpublish-keeps-award', u.pressed && oil(s) === oil(a1) && /FO|HO/.test(s.run[0]) && !/\*|\+1/.test(s.run[0]) && (s.lines || []).join(' ').includes('W5 award before work') && !/OIL earned|Earned off the published schedule/.test((s.lines || []).join(' ')),
      'unpublishing takes his EARNED credit; the award stays (+OIL 3) (D142)', { unpublish: u, toasts: ts, oil: oil(s), run: s.run, lines: s.lines })
  })
  R2.w1errors = errors.slice(0, 20)
  await w.browser.close()
}

/* ================= WORLD 2: WORK then AWARD, then an AL that takes him off the desk */
{
  const w = await openHi({ ...size, who: 'a' }); page = w.page; errors = w.errors
  await toastSpy(page)
  let b0, b1, b2
  await step('W2-publish-first', async () => {
    b0 = await readDay('B0-before')
    const p = await S.pubOnBoard(page, SAT)
    b1 = await readDay('B1-after-publish')
    R.ck('W2-credit', p.p.pressed && oil(b1) === oil(b0) + 1, 'published: Fable earns 1 day on his Saturday desk', { oil: [oil(b0), oil(b1)], run: b1.run })
    R.note('W2-tap-on-a-schedule-credited-day', { open: b1.open, lines: b1.lines })
  })
  await step('W2-then-award', async () => {
    const g = await lwAward(page, M, SISO, '3', 'W5 award after work')
    b2 = await readDay('B2-after-award')
    await lwShot(page, pic('B2-cell-work-then-award'), M, SISO)
    R.ck('W2-award-door', g.given, 'an admin can award OIL on a day the schedule already credits (the tap opens the bid sheet with +OIL)', { given: g, open: b1.open })
    R.ck('W2-add-up', oil(b2) === oil(b0) + 4 && /FO/.test(b2.run[0]) && /\+1/.test(b2.run[0]) && !/!/.test(b2.run[0]),
      'the other order reaches the same day: +OIL 4, the schedule\'s credit in the box, the award behind +1, no amber', { oil: oil(b2), run: b2.run, lines: b2.lines })
    const u = await undo(page)
    const su = await snap(page, M, [SISO])
    R.ck('W2-undo-award', u.pressed && oil(su) === oil(b1), 'Undo takes only the award back (+OIL 1)', { undo: u, oil: oil(su) })
    const r = await redo(page)
    const sr = await snap(page, M, [SISO])
    R.ck('W2-redo-award', r.pressed && oil(sr) === oil(b2), 'Redo gives it again (+OIL 4)', { redo: r, oil: oil(sr) })
  })
  await step('W2-AL-takes-him-off', async () => {
    const slot = await page.evaluate(([di, m]) => {
      const d = window.DAYS[di]
      for (let b = 0; b < (d.dutywaves || []).length; b++) for (let r = 0; r < d.dutywaves[b].rows.length; r++) if (d.dutywaves[b].rows[r].id === m) return `d:${di}.${b}.${r}`
      return null
    }, [SAT, M])
    await L.editWeek(page)
    const sel = `#eWeek .seat[data-slot="${slot}"]:visible, #eWeek [data-slot="${slot}"]:visible`
    let how = 'none'
    if (!PHONE && await page.locator(sel).count()) {
      const seat = page.locator(sel).first()
      await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await seat.click({ button: 'right' }); how = 'right-click on the week'
    } else {
      await board(page, SAT)
      how = 'drag off on the board → ' + await L.dragOffSeat(page, `#schedBoard [data-slot="${slot}"]:visible`)
      await closeBoard(page)
    }
    await page.waitForTimeout(600)
    const now = await page.evaluate(s => { const [di, b, r] = s.slice(2).split('.'); return window.DAYS[+di].dutywaves[+b].rows[+r].id || '(empty)' }, slot)
    const c = await S.counts(page, SAT)
    await board(page, SAT); await signDay(page, SAT, 0)
    await toasts(page)
    const a = await publishAL(page, SAT)
    const ts = await toasts(page)
    await closeBoard(page)
    const s = await readDay('B3-after-AL-off')
    await lwShot(page, pic('B3-cell-after-AL-off'), M, SISO)
    R.note('W2-AL', { slot, how, deskNow: now, pending: c.n, al: a, toasts: ts })
    R.ck('W2-AL-takes-earned-keeps-award', now !== M && a.pressed && oil(s) === oil(b0) + 3 && !/\*|\+1/.test(s.run[0]) && (s.lines || []).join(' ').includes('W5 award after work') && !/OIL earned|Earned off the published schedule/.test((s.lines || []).join(' ')),
      'an AL that takes him off the desk takes his EARNED credit (D142); the award stays: +OIL 3', { oil: oil(s), run: s.run, lines: s.lines })
    const rl = await reload(page, 'a')
    await lwOpen(page, SISO)
    const sl = await snap(page, M, [SISO])
    R.ck('W2-reload', oil(sl) === oil(s), 'a reload keeps +OIL 3', { rl, oil: oil(sl), run: sl.run })
  })
  R2.w2errors = errors.slice(0, 20)
  await w.browser.close()
}
R.note('errors', R2)
R.save()
