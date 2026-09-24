/* w4 · S7 (Fable) + Astra rank 15 branch C — WALK THE MONEY on the published Saturday.
   Unpublish the Original → publish it again → amend Fable (plasma) off his SDO desk → Publish AL1 →
   Unpublish AL1 → Undo → Undo → Redo → Redo → reload. After EVERY step: the edit week's Saturday head,
   the view page's Saturday face, and Fable's Leave War box + OIL figure, photographed.
   A Leave War box that lags until a reload is a finding (the step re-reads after a reload when the
   first read disagrees with the version tag).

   Rules judged (register): AM46/D142 (a day's OIL comes from its LATEST PUBLISHED version), AM47/D2
   (a working-copy change moves nothing until published), AM32–AM34, AM37c (unpublish), AM39/AM39c
   (undo of a publish runs unpublish; redo lands published with the sign-offs cleared), AM48.
   Usage: node w4-01-s7-money.mjs [desktop|phone]    (desktop removes by right-click, phone by drag-off) */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, login, STATE, PHONE, DESK, SAT, lwOpen, lwCell, lwOilFig, lwCloseSheet, lwShot, editWeek, board, closeBoard,
  head, viewDay, signDay, publishDay, publishAL, unpublish, shot, book, toastNow, clearToast, checker, go, frame, alPanel } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('S7 ' + w)
const P = 'plasma'   // callsign Fable — the Saturday SDO 08:00-18:00
let n = 0

/** Everything one step changes, read in the order a person would look: the day, the viewer, the money. */
async function readAll(label, want) {
  n++
  const tag = `s7-${w}-${String(n).padStart(2, '0')}-${label}`
  await editWeek(page)
  const h = await head(page, SAT)
  const panel = await alPanel(page)
  await frame(page, `#eWeek .day[data-day="${SAT}"]`)
  await shot(page, tag + '-edit')
  const v = await viewDay(page, SAT)
  await frame(page, `#vWeek .day[data-day="${SAT}"]`)
  await shot(page, tag + '-view')
  await lwOpen(page)
  let cell = await lwCell(page, P)
  await lwShot(page, tag + '-lw', P)
  const fig = await lwOilFig(page, P)
  await lwCloseSheet(page)
  const eng = await page.evaluate(() => ({ cur: window.SCHED.cur[5] || null, ok: !!(window.SCHED.dayOK || {})[5], pend: Object.keys(window.SCHED.pending || {}).filter(k => /^[^:]*:?5\./.test(k) || k.startsWith('5.')) }))
  const rec = { tag: h.tag, pending: h.pending, nys: h.nys, sign: h.signState, signs: h.signs.join('/'), beak: h.beak?.text || '', alpub: h.alpub ? h.alpub.text + (h.alpub.disabled ? ' (locked)' : '') : '', unpub: h.unpub?.text || '',
    viewTag: v?.tag, viewPick: (v?.picker || []).join(' | '), lwBox: cell.box, lwMark: cell.mark, oil: fig.oil, panel, eng }
  note(label, rec)
  if (want) {
    ck(label + ': version tag', rec.tag === want.tag, want.tag, rec.tag)
    ck(label + ': viewer face', want.viewTag == null ? !rec.viewTag || /DRAFT|^$/.test(rec.viewTag) : rec.viewTag === want.viewTag, want.viewTag ?? 'no issued face (draft)', rec.viewTag + ' · ' + rec.viewPick)
    let okBox = want.box.test(cell.box)
    if (!okBox) {
      /* THE LAG TEST — the box disagrees with the version tag. Look again after a moment, then after a reload. */
      await page.waitForTimeout(1500)
      const again = await lwCell(page, P)
      await page.reload(); await login(page); await lwOpen(page)
      const afterReload = await lwCell(page, P)
      note(label + ': LW box re-read', { after1500ms: again.box, afterReload: afterReload.box })
      ck(label + ': Leave War box (no lag)', false, String(want.box), `first read ${cell.box}, +1.5s ${again.box}, after reload ${afterReload.box}` + (want.box.test(afterReload.box) ? ' — LAGGED UNTIL A RELOAD' : ' — WRONG EVEN AFTER A RELOAD'))
      await go(page, 'editsched')
    } else ck(label + ': Leave War box', true, String(want.box), cell.box)
    if (want.oil !== '__any') ck(label + ': OIL figure', String(fig.oil) === String(want.oil), want.oil, fig.oil)
    if (want.signsBlank != null) ck(label + ': sign-offs ' + (want.signsBlank ? 'cleared' : 'kept'), want.signsBlank ? h.signs.every(s => /name/.test(s)) : h.signs.every(s => !/name/.test(s)), want.signsBlank ? 'all four blank' : 'all four named', rec.signs)
    if (want.pending != null) ck(label + ': pending chip', want.pending.test(h.pending || ''), String(want.pending), h.pending || '(none)')
  }
  await editWeek(page)
  return rec
}

/* ---- 0. the everything week as saved: Saturday issued as its Original, Fable earning a full day --- */
const deskId = await page.evaluate(() => { const r = window.DAYS[5].dutywaves[0].rows[0]; return { role: r.role, id: r.id, str: r.str, end: r.end, rid: r.rid } })
note('the SDO desk', deskId)
await readAll('baseline', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1 })

/* ---- 1. Unpublish the Original: the day goes back to a draft and its OIL is withdrawn (D142) ------ */
await clearToast(page)
const u0 = await unpublish(page, SAT, { confirm: true })
note('unpublish Original — press', { ...u0, toast: await toastNow(page) })
await readAll('unpublished-orig', { tag: 'DRAFT', viewTag: null, box: /^$/, oil: 0 })

/* ---- 2. Publish it again (sign four → Publish day) — the credit lands again ------------------------ */
note('sign', await signDay(page, SAT))
await clearToast(page)
const p1 = await publishDay(page, SAT)
note('publish day — press', { ...p1, toast: await toastNow(page) })
ck('publish day pressed', p1.pressed, 'Publish day pressed', p1)
await readAll('republished-orig', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1, signsBlank: true })

/* ---- 3. Amend Fable off his desk on the working copy — nothing moves on the war yet (AM47) --------- */
await board(page, SAT)
const seat = page.locator(`#schedBoard .seat[data-slot^="d:${SAT}.0.0"]:visible`).first()
const seatInfo = await seat.evaluate(e => ({ slot: e.dataset.slot, who: (e.querySelector('[data-person]') || {}).dataset?.person || e.dataset.person || '' })).catch(() => null)
note('Fable\'s seat on the board', seatInfo)
await clearToast(page)
if (w === 'desktop') {
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await seat.click({ button: 'right' })
} else {
  /* the phone has no right-click: pick the puck up and put it down on empty board space (drag.ts — a
     seat puck dropped nowhere leaves the seat) */
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const b = await seat.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) { await page.mouse.move(b.x + b.width / 2 + i * 4, b.y + b.height / 2 - i * 22); await page.waitForTimeout(30) }
  await page.mouse.up()
}
await page.waitForTimeout(700)
const rm = await page.evaluate(() => { const r = window.DAYS[5].dutywaves[0].rows[0]; return { id: r.id } })
note('amend Fable off — toast / desk now', { toast: await toastNow(page), deskNow: rm })
ck('Fable is off the SDO desk', rm.id !== P, 'desk no longer holds plasma', rm)
await shot(page, `s7-${w}-03a-board-after-removal`)
await closeBoard(page)
await readAll('amended-working-copy', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1, pending: /pending/ })

/* ---- 4. Sign + Publish AL1 — the version that no longer has him on the desk pays ------------------- */
note('sign', await signDay(page, SAT))
await clearToast(page)
const a1 = await publishAL(page, SAT)
note('publish AL1 — press', { ...a1, toast: await toastNow(page) })
ck('Publish AL1 pressed', a1.pressed, 'pressed', a1)
/* what AL1 pays him: nothing from the desk. If the ALL AVAIL FAMILY DAY crowd frozen at AL1 now has him
   (he is free all day), he earns that row's half day instead — recorded, then judged against the window. */
const r4 = await readAll('published-al1', { tag: 'AL1', viewTag: 'AL1', box: /^(|HO\*)$/, oil: '__any', signsBlank: true })

/* ---- 5. Unpublish AL1 — the Original is current again and pays the full day again (D142) ----------- */
await clearToast(page)
const u1 = await unpublish(page, SAT, { confirm: true })
note('unpublish AL1 — press', { ...u1, toast: await toastNow(page) })
await readAll('unpublished-al1', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1, pending: /pending/, signsBlank: true })

/* ---- 6–9. Undo, Undo, Redo, Redo — from the top bar on the desktop, from the Leave War's own pair on the
   phone (so the phone watches the box change in place, with no page change to repaint it) ------------- */
async function undoRedo(which) {
  await clearToast(page)
  if (w === 'desktop') {
    await go(page, 'editsched')
    const b = page.locator(which === 'undo' ? '#undoBtn' : '#redoBtn').first()
    const t = await b.getAttribute('title')
    await b.click(); await page.waitForTimeout(900)
    return { control: which === 'undo' ? '#undoBtn' : '#redoBtn', title: t, toast: await toastNow(page) }
  }
  await lwOpen(page)
  const before = await lwCell(page, P)
  const b = page.locator(`[data-testid="lw-${which}"]:visible`).first()
  if (!(await b.count())) {
    await go(page, 'editsched')
    const tb = page.locator(which === 'undo' ? '#undoBtn' : '#redoBtn').first()
    const tt = await tb.getAttribute('title')
    await tb.click(); await page.waitForTimeout(900)
    return { control: (which === 'undo' ? '#undoBtn' : '#redoBtn') + ' (the war has no visible Undo at this width)', title: tt, toast: await toastNow(page) }
  }
  const t = await b.getAttribute('title')
  await b.click(); await page.waitForTimeout(900)
  const inPlace = await lwCell(page, P)
  await lwShot(page, `s7-${w}-${which}-in-place-${n}`, P)
  return { control: 'lw-' + which, title: t, toast: await toastNow(page), boxBefore: before.box, boxInPlace: inPlace.box }
}
note('undo #1', await undoRedo('undo'))
await readAll('undo1-unpublish-undone', { tag: 'AL1', viewTag: 'AL1', box: new RegExp('^' + r4.lwBox.replace('*', '\\*') + '$'), oil: r4.oil })
note('undo #2', await undoRedo('undo'))
await readAll('undo2-al1-publish-undone', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1, pending: /pending/, signsBlank: true })
note('redo #1', await undoRedo('redo'))
await readAll('redo1-al1-republished', { tag: 'AL1', viewTag: 'AL1', box: new RegExp('^' + r4.lwBox.replace('*', '\\*') + '$'), oil: r4.oil, signsBlank: true })
note('redo #2', await undoRedo('redo'))
await readAll('redo2-unpublish-redone', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1, pending: /pending/ })

/* ---- 10. Reload — the published record and the money survive ------------------------------------- */
await page.reload(); await login(page)
await readAll('after-reload', { tag: 'ORIG', viewTag: 'ORIG', box: /^FO\*$/, oil: 1, pending: /pending/ })

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
