/* D114's FULL check — the WALK (25 Sep 26, afternoon; evidence sheet 2026-09-25-amendment-batch.md §9).
   A request taken off (or put on) a published day is ONE pending change on every count, and ONE line in the list.
   Written as assertions of the RIGHT behaviour, so a PASS means correct and re-running it on the fixed build IS the
   re-walk (bug-check order §5). Fresh world (the seed week: Monday carries three accepted requests as ground rows);
   everything through the app's own controls — the sign-off selects, Publish, ✕ on the row, the request's Accept /
   Undo buttons in the Personal Inputs group, the Inputs page's ✕, a version's Load, the top bar's Undo / Redo.
     1  ✕ on a request's row                  → 1 on every count (week, board, both ⓘ, Amendments panel, sign line,
                                                 "Discard N edits"), ONE line "whose · what: on the programme → taken off"
     2  Accept it again                        → 0 (AM20: back to what was issued)
     3  Undo → 1 · Redo → 0
     4  the other door: "Undo" beside the request in the Personal Inputs group → 1
     5  sign + Publish AL1                     → "Published AL1 · 1 item"; the AL's line "1 item · 1 removal", no filing
     6  the mirror on AL1: Accept it back      → 1, one line, a button that takes you to the row and stays on the page
     7  delete ANOTHER request on the Inputs page → +1, and its line still says whose and what
     8  load AL1 onto the working copy         → "Discard N edits" = the day head's N; what is left afterwards, noted
   Usage (from raptor-port/, a preview on 4173): node scripts/handpass/am/d114-walk.mjs [desktop|phone]
   HP_REWALK=<folder> sends the pictures to a re-walk folder, so the first walk's stay as the defects' evidence. */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS = process.env.HP_REWALK
  ? `${process.env.HP_REWALK}/${W}`
  : `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/d114/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const { openHi, editWeek, board, closeBoard, openInputs, signDay, publishDay, publishAL, head, go, check, note, summary, screen, lookAt, pvBar, pvTap } = L
const { toastSpy, toasts, panel, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }

const { browser, page, errors } = await openHi({ ...SIZE, dpr: PHONE ? 3 : 1, state: null })
await toastSpy(page)
const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
/* the seed's accepted requests on Monday, each with its row */
const REQS = await page.evaluate(() => (window.DAYS[0].ground || []).filter(g => g && g.src).map(g => {
  const i = window.INPUTS.find(x => (x.iid || x.id) === g.src)
  return { id: g.src, prog: g.prog, person: i && i.person, type: i && i.type }
}))
const R1 = REQS.find(r => /FLY WITH/.test(r.prog)) || REQS[0], R2 = REQS.find(r => r !== R1)
note('FIX-requests', `Monday's accepted requests: ${REQS.map(r => `${CS[r.person]}'s ${r.type} (row ${r.prog})`).join(', ')}; walking ${CS[R1.person]}'s ${R1.type}, deleting ${CS[R2.person]}'s ${R2.type}`)

const rowIx = (id) => page.evaluate(id => (window.DAYS[0].ground || []).findIndex(g => g && g.src === id), id)
const accOf = (id) => page.evaluate(id => { const i = window.INPUTS.find(x => (x.iid || x.id) === id); return i ? (i.acc || 'fresh') : 'GONE' }, id)
const undo = async () => { await editWeek(page); await page.locator('#undoBtn').click(); await page.waitForTimeout(800) }
const redo = async () => { await editWeek(page); await page.locator('#redoBtn').click(); await page.waitForTimeout(800) }

/* ---- every count a person can read for Monday ---- */
async function counts(tag, { discard = null, sign = true } = {}) {
  const c = {}
  await editWeek(page)
  c.week = norm((await head(page, MON)).pending)
  const iw = await W1.dayInfo(page, MON, 'week'); c.infoWeek = iw.pend || '(none)'; await W1.closeDayInfo(page)
  const P = await panel(page)
  c.panel = P.visible ? ((P.days.find(d => (d.text || '').startsWith('Mon')) || {}).text || '(not listed)') : null
  await board(page, MON)
  const hb = await head(page, MON)
  c.board = norm(hb.pending)
  if (sign && num(c.board)) await signDay(page, MON, 0)   // the sign-off line says "N changes to publish" once all four are signed
  c.signLine = norm((await head(page, MON)).signState)
  const ib = await W1.dayInfo(page, MON, 'board'); c.infoBoard = ib.pend || '(none)'; await W1.closeDayInfo(page)
  if (discard) {
    const ok = await lookAt(page, MON, discard)
    if (ok) {
      await pvTap(page, MON, 'data-restore')
      const b = await pvBar(page, MON); c.discard = b ? b.load : '(no bar)'
      await shotUnion(page, `d114-${tag}-discard`, ['#schedBoard .dprev-bar'])
      await pvTap(page, MON, 'data-restcancel')
      await pvTap(page, MON, 'data-golive')
    } else c.discard = '(could not open the version)'
  }
  return c
}
function agreeAll(id, c, want, what) {
  const n = { week: num(c.week), board: num(c.board), infoWeek: num(c.infoWeek), infoBoard: num(c.infoBoard) }
  if (c.panel != null) n.panel = /Mon · (\d+) change/.test(c.panel) ? +/Mon · (\d+) change/.exec(c.panel)[1] : 0
  if (want) n.signLine = /(\d+) changes? to publish/.test(c.signLine) ? +/(\d+) changes? to publish/.exec(c.signLine)[1] : 0
  if (c.discard != null) n.discard = /Discard (\d+) edit/.test(c.discard) ? +/Discard (\d+) edit/.exec(c.discard)[1] : 0
  const bad = Object.entries(n).filter(([, v]) => v !== want)
  check(id, !bad.length, `${what}: every count reads ${want}` + (bad.length ? ` — DISAGREE: ${bad.map(([k, v]) => k + '=' + v).join(', ')}` : '') + ` · ${JSON.stringify(c)}`)
  return n
}
async function openList() {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${MON}"] [data-pendlist="${MON}"]:visible`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  await b.click(); await page.waitForTimeout(500)
  return page.evaluate(() => {
    const p = document.querySelector('#pendList'); if (!p) return { open: false }
    const r = p.getBoundingClientRect(), vv = window.visualViewport
    return { open: true, head: p.querySelector('.pl-head')?.innerText.replace(/\s+/g, ' ').trim(),
      rows: [...p.querySelectorAll('.pl-item')].map(e => ({ btn: e.tagName === 'BUTTON', where: e.querySelector('.pl-where')?.innerText.replace(/\s+/g, ' ').trim(), chg: e.querySelector('.pl-chg')?.innerText.replace(/\s+/g, ' ').trim() })),
      box: { left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), vw: vv ? vv.width : innerWidth, vh: vv ? vv.height : innerHeight } }
  })
}
const closeList = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
/* the request's own buttons in the board's Personal Inputs group (Accept / Undo) */
async function reqButton(id, dest) {
  await board(page, MON); await openInputs(page, MON)
  const b = page.locator(`#schedBoard [data-acc="${dest}"][data-acck="${id}"]:visible`).first()
  if (!(await b.count())) return 'NO BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(700)
  return (await toasts(page)).join(' / ')
}

try {
  /* ================= FIXTURE: Monday signed and published on the board ================= */
  await editWeek(page); await board(page, MON)
  const sg = await signDay(page, MON, 0)
  const pub = await publishDay(page, MON)
  const h0 = await head(page, MON)
  check('0 publish', pub.pressed && /ORIG/.test(h0.tag) && !h0.pending, `Monday published (${JSON.stringify(sg)}): tag "${h0.tag}", pending "${norm(h0.pending)}"`)

  /* ================= 1. ✕ on the request's row ================= */
  const ri = await rowIx(R1.id)
  const x = page.locator(`#schedBoard [data-grdel="${MON}.${ri}"]:visible`).first()
  let said = 'NO ✕'
  if (await x.count()) {
    await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await page.waitForTimeout(700)
    if ((await rowIx(R1.id)) >= 0 && await x.count()) { await x.click(); await page.waitForTimeout(700) }
    said = (await toasts(page)).join(' / ')
  }
  note('1 gesture', `✕ on ${R1.prog}: row now at ${await rowIx(R1.id)}, request ${await accOf(R1.id)}; said "${said}"`)
  await shotUnion(page, 'd114-1-board-strip', ['#sbSignBar'])
  agreeAll('1 counts', await counts('1', { discard: /ORIG|Original/ }), 1, `✕ on ${CS[R1.person]}'s ${R1.type} row`)
  let o = await openList()
  await screen(page, 'd114-1-list')
  check('1 list: one line', o && o.open && /· 1 change$/.test(o.head || '') && o.rows.length === 1, `head "${o && o.head}", ${o && o.rows.length} line(s): ${JSON.stringify(o && o.rows)}`)
  check('1 list: whose request, taken off', o && o.rows[0] && o.rows[0].where.includes(CS[R1.person]) && /on the programme\s*→\s*taken off/.test(o.rows[0].chg || ''), JSON.stringify(o && o.rows[0]))
  if (PHONE) check('1 list fits the phone', o && o.box.left >= 0 && o.box.right <= o.box.vw && o.box.bottom <= o.box.vh, JSON.stringify(o && o.box))
  await closeList()

  /* ================= 2. Accept it again → back to what was issued ================= */
  said = await reqButton(R1.id, 'g')
  note('2 gesture', `Accept: request ${await accOf(R1.id)}, row at ${await rowIx(R1.id)}; said "${said}"`)
  const c2 = await counts('2')
  const h2 = await head(page, MON)
  check('2 back to issued: nothing pending', [c2.week, c2.board].every(s => !num(s)) && !(await page.locator('#schedBoard .nysmark:visible').count()), `✕ then Accept: week "${c2.week}", board "${c2.board}", sign line "${c2.signLine}", marker ${await page.locator('#schedBoard .nysmark:visible').count()}`)

  /* ================= 3. Undo / Redo ================= */
  await undo()
  const c3a = await counts('3a', { sign: false })   // signing here would clear the Redo
  check('3 Undo → 1', num(c3a.week) === 1 && num(c3a.board) === 1, `after Undo: week "${c3a.week}", board "${c3a.board}"`)
  await redo()
  const c3b = await counts('3b', { sign: false })
  check('3 Redo → 0', !num(c3b.week) && !num(c3b.board), `after Redo: week "${c3b.week}", board "${c3b.board}"`)

  /* ================= 4. the other door: "Undo" beside the request ================= */
  said = await reqButton(R1.id, 'x')
  note('4 gesture', `the request's Undo: request ${await accOf(R1.id)}, row at ${await rowIx(R1.id)}; said "${said}"`)
  agreeAll('4 counts', await counts('4'), 1, `the request's own Undo button`)

  /* ================= 5. publish AL1 with it ================= */
  await board(page, MON)
  await signDay(page, MON, 0)
  const p5 = await publishAL(page, MON)
  const t5 = (await toasts(page)).join(' / ')
  check('5 publish message', p5.pressed && /Published AL1 · 1 item\b/.test(t5), `pressed ${JSON.stringify(p5)}; said "${t5}"`)
  await editWeek(page)
  const P5 = await panel(page)
  if (P5.visible) {
    const tag = (P5.tags.find(t => /AL1/.test(t)) || '')
    check('5 the AL\'s line', /1 item · 1 removal/.test(tag) && !/input filing/.test(tag), `Amendments panel: "${tag}"`)
    await shotUnion(page, 'd114-5-panel', ['#alPanel'])
  } else note('5 panel', 'the Amendments panel is not on this width')
  const h5 = await head(page, MON)
  check('5 nothing pending after', !num(h5.pending), `head "${norm(h5.pending)}", tag "${h5.tag}"`)

  /* ================= 6. the mirror on AL1: Accept it back ================= */
  said = await reqButton(R1.id, 'g')
  note('6 gesture', `Accept on AL1: request ${await accOf(R1.id)}, row at ${await rowIx(R1.id)}; said "${said}"`)
  agreeAll('6 counts', await counts('6', { discard: /AL1/ }), 1, `Accept on the AL1 day`)
  o = await openList()
  await screen(page, 'd114-6-list')
  check('6 list: one line, taken off → on the programme', o && o.rows.length === 1 && o.rows[0].where.includes(CS[R1.person]) && /taken off\s*→\s*on the programme/.test(o.rows[0].chg || ''), JSON.stringify(o && o.rows))
  check('6 the line is a tap', o && o.rows[0] && o.rows[0].btn, JSON.stringify(o && o.rows[0]))
  if (o && o.rows[0] && o.rows[0].btn) {
    await page.locator('#pendList .pl-item').first().click(); await page.waitForTimeout(700)
    const j = await page.evaluate(() => ({ page: window.CURPAGE, board: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth),
      flash: [...document.querySelectorAll('.chgflash')].map(e => { const r = e.getBoundingClientRect(); return { txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40), inView: r.top >= 0 && r.bottom <= innerHeight && r.right > 0 && r.left < innerWidth } }) }))
    await screen(page, 'd114-6-jump')
    check('6 the tap stays on Edit Schedule and marks the row', j.page === 'editsched' && !j.board && j.flash.some(f => f.inView), JSON.stringify(j))
  }

  /* ================= 7. delete ANOTHER request on the Inputs page ================= */
  await closeBoard(page)
  await go(page, 'inputs'); await page.waitForTimeout(500)
  /* the Inputs page lists a date window by default; the demo week is in July, so widen it to All (its own control) */
  if (await page.locator('#inRangeBtn').count()) { await page.locator('#inRangeBtn').click(); await page.waitForTimeout(250); await page.locator('#inRangeAll').click(); await page.waitForTimeout(400) }
  const ix = await page.evaluate(id => window.INPUTS.findIndex(x => (x.iid || x.id) === id), R2.id)
  const del = page.locator(`.rmx[data-inx="${ix}"]`).first()
  let d7 = 'NO ✕ ON THE INPUTS PAGE'
  if (await del.count()) { await del.evaluate(e => e.scrollIntoView({ block: 'center' })); await del.click(); await page.waitForTimeout(700); d7 = (await toasts(page)).join(' / ') }
  note('7 gesture', `deleted ${CS[R2.person]}'s ${R2.type} (index ${ix}): request ${await accOf(R2.id)}, its row at ${await rowIx(R2.id)}; said "${d7}"`)
  agreeAll('7 counts', await counts('7', { discard: /AL1/ }), 2, `AL1 + Accept + a request deleted on the Inputs page`)
  o = await openList()
  await screen(page, 'd114-7-list')
  const gone = o && o.rows.find(r => !r.where.includes(CS[R1.person]))
  check('7 the deleted request\'s line says whose and what', !!gone && gone.where.includes(CS[R2.person]) && new RegExp(R2.type, 'i').test(gone.where + ' ' + gone.chg), JSON.stringify(o && o.rows))
  await closeList()

  /* ================= 8. load AL1 onto the working copy ================= */
  const before = num((await head(page, MON)).pending)
  await board(page, MON)
  const ok8 = await lookAt(page, MON, /AL1/)
  let bar8 = null
  if (ok8) {
    await pvTap(page, MON, 'data-restore'); bar8 = await pvBar(page, MON)
    await shotUnion(page, 'd114-8-discard', ['#schedBoard .dprev-bar'])
    check('8 "Discard N edits" = the day head', num(/Discard (\d+)/.exec((bar8 && bar8.load) || '')?.[1]) === before, `head ${before}, bar "${bar8 && bar8.load}"`)
    if (bar8 && /confirm/.test(bar8.load || '')) await pvTap(page, MON, 'data-restore')
  }
  const t8 = (await toasts(page)).join(' / ')
  await editWeek(page)
  const h8 = await head(page, MON)
  o = h8.pending ? await openList() : null
  note('8 after the load', `said "${t8}"; head "${norm(h8.pending)}"; ${CS[R1.person]}'s request ${await accOf(R1.id)} (row at ${await rowIx(R1.id)}); ${CS[R2.person]}'s request ${await accOf(R2.id)} (row at ${await rowIx(R2.id)}); list ${JSON.stringify(o && o.rows)}`)
  check('8 the walked request is as AL1 issued it (taken off, no row)', (await accOf(R1.id)) === 'r' && (await rowIx(R1.id)) < 0, `request ${await accOf(R1.id)}, row at ${await rowIx(R1.id)}`)
  /* the deleted request cannot be put back by a load; its line stays, and still says whose and what (named from the row
     the load put back) */
  const left8 = o && o.rows.find(r => /deleted/.test(r.chg || ''))
  check('8 what the load could not put back still names the request', !o || (left8 && left8.where.includes(CS[R2.person]) && new RegExp(R2.type, 'i').test(left8.where)), JSON.stringify(o && o.rows))
  if (o) await closeList()
  await screen(page, 'd114-8-after-load')

  /* ================= 9. Fable's O1 — a request filed on the published day, then taken off ================= */
  /* recorded, not asserted: the day reads what the filing comparison says today; whether it should read 0 is his call */
  const W4 = await import('./w4-lib.mjs')
  const R9 = 'D114 WALK O1'
  await W4.fileInput(page, { person: R1.person, type: 'Meeting', from: '2026-07-13', to: '2026-07-13', span: 'all', remarks: R9 })
  await toasts(page); await editWeek(page)
  const id9 = await page.evaluate(r => { const x = window.INPUTS.find(y => y.remarks === r); return x ? (x.iid || x.id) : null }, R9)
  const h9a = norm((await head(page, MON)).pending)
  note('9 filed', `request ${await accOf(id9)}, row at ${await rowIx(id9)}; head "${h9a}"`)
  if ((await rowIx(id9)) >= 0) {
    await board(page, MON)
    const x9 = page.locator(`#schedBoard [data-grdel="${MON}.${await rowIx(id9)}"]:visible`).first()
    if (await x9.count()) { await x9.evaluate(e => e.scrollIntoView({ block: 'center' })); await x9.click(); await page.waitForTimeout(700) }
  } else await reqButton(id9, 'x')
  await toasts(page)
  const h9b = norm((await head(page, MON)).pending)
  o = await openList()
  await screen(page, 'd114-9-filed-then-off')
  note('9 after ✕', `request ${await accOf(id9)}, row at ${await rowIx(id9)}; head "${h9b}"; list ${JSON.stringify(o && o.rows)}`)
  if (o) await closeList()
} catch (e) { check('CRASH', false, String(e && e.stack || e)) }

check('errors', !errors.length, errors.length ? errors.slice(0, 5).join(' | ') : 'the browser error list stayed empty')
summary(`d114-${W}`)
await browser.close()
