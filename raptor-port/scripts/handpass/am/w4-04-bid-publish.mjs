/* w4 · AM48c + Astra rank 15 (branches A, B, C) + Astra rank 1 — a weekend that EARNS for a man who has an
   UNDECIDED Leave War bid on that very day.
     A = Fable (plasma), the Saturday SDO 08:00-18:00.   B = Cotter (spanner), ground crew, nothing on Saturday.
   0  the everything week (Saturday issued as its Original)
   1  Unpublish the Original (the day becomes a draft, the OIL goes)
   2  A files an undecided LL bid for 18 Jul on the war
   3  Publish day            — AM48c: the bid is KEPT and the day FLAGGED; the admin is told      (rank 15 A)
   4  Unpublish, then publish again — credit off, then on; the bid kept, never doubled              (rank 15 B)
   5  Undo the publish, then Redo — the same, through the one timeline                             (rank 15 C)
   6  AL1 takes A off the desk      7  AL2 gives the desk to B                                     (rank 1)
   8  Unpublish AL2 (two taps if warned)   9  Unpublish AL1   10  Undo that second unpublish       (rank 1)
   After every step: the edit week's Saturday, the view page's Saturday, both men's Leave War boxes, and
   A's tap list (the bid must never be deleted). The version tag, the viewer's face, the marks and the OIL
   must agree. Rules: AM48c, AM46/D142, AM47, AM32–AM34, AM37c, AM39, AM4, AM44/D44.
   Usage: node w4-04-bid-publish.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, SAT, SATISO, lwOpen, lwCell, lwOilFig, lwCloseSheet, lwShot, lwBid, lwTap, editWeek, board,
  closeBoard, head, viewDay, signDay, publishDay, publishAL, unpublish, shot, toastNow, clearToast, checker, go, frame, alPanel,
  marks, put, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('BID ' + w)
const A = 'plasma', B = 'spanner'
const pic = s => `bid-${w}-${s}`
let n = 0

/** Unpublish through as many taps as the day asks for (the warning arms on the first). */
async function unpublishAll(label) {
  await editWeek(page)
  await clearToast(page)
  const first = await unpublish(page, SAT, { confirm: false })
  const t1 = await toastNow(page)
  const h = await head(page, SAT)
  let second = null
  if (/confirm/i.test(h.unpub?.text || '')) { second = await unpublish(page, SAT, { confirm: false }) }
  const r = { taps: second ? 2 : 1, firstToast: t1, tagAfter: (await head(page, SAT)).tag }
  note(label + ' — unpublish', r)
  return r
}
async function signAnd(kind, label) {
  await editWeek(page)
  const s = await signDay(page, SAT)
  await clearToast(page)
  const r = kind === 'day' ? await publishDay(page, SAT) : await publishAL(page, SAT)
  const out = { signed: s, ...r, toast: await toastNow(page) }
  note(label + ' — publish', out)
  return out
}
async function undoRedo(which) {
  await go(page, 'editsched')
  await clearToast(page)
  const b = page.locator(which === 'undo' ? '#undoBtn' : '#redoBtn').first()
  const title = await b.getAttribute('title')
  await b.click(); await page.waitForTimeout(900)
  const r = { title, toast: await toastNow(page) }
  note(which, r)
  return r
}

/** The whole picture after a step. */
async function look(label, want = {}) {
  n++
  const tag = pic(String(n).padStart(2, '0') + '-' + label)
  await editWeek(page)
  const h = await head(page, SAT)
  const mk = await marks(page, `#eWeek .day[data-day="${SAT}"]`)
  const desk = await page.evaluate(() => { const r = window.DAYS[5].dutywaves[0].rows[0]; return r.id || '(empty)' })
  const panel = await alPanel(page)
  await frame(page, `#eWeek .day[data-day="${SAT}"]`)
  await shot(page, tag + '-edit')
  const v = await viewDay(page, SAT)
  await frame(page, `#vWeek .day[data-day="${SAT}"]`)
  await shot(page, tag + '-view')
  const viewDesk = await page.evaluate(() => {
    const d = document.querySelector('#vWeek .day[data-day="5"]')
    const row = d && [...d.querySelectorAll('*')].find(e => e.children.length < 40 && /^SDO/.test((e.innerText || '').trim()) && e.querySelector('[data-person]'))
    const p = row && row.querySelector('[data-person]')
    return p ? p.dataset.person : '(no one shown)'
  })
  await lwOpen(page)
  const ca = await lwCell(page, A), cb = await lwCell(page, B)
  await lwShot(page, tag + '-lw', A)
  const t = await lwTap(page, A)
  const bidLines = t.lines.filter(l => /bid/i.test(l))
  await shot(page, tag + '-lw-taplist')
  await lwCloseSheet(page)
  const rec = { tag: h.tag, pending: h.pending, deskWorking: desk, viewTag: v?.tag, viewDesk, A: ca.box + (ca.mark ? ' ' + ca.mark : ''), B: cb.box + (cb.mark ? ' ' + cb.mark : ''),
    tapOpened: t.opened, tapLines: t.lines, panel: w === 'desktop' ? panel : undefined,
    marksPending: mk.pending.map(m => m.text).slice(0, 6), marksIssued: mk.issued.map(m => m.text + '@' + m.alc).slice(0, 6) }
  note(label, rec)
  if (want.tag) ck(label + ': version tag', h.tag === want.tag, want.tag, h.tag)
  if (want.viewTag !== undefined) ck(label + ': viewer face', want.viewTag === null ? !v?.picker?.length : v?.tag === want.viewTag, want.viewTag ?? 'draft (no issued face)', (v?.tag || '') + ' ' + (v?.picker || []).join('|'))
  if (want.A) ck(label + ': A\'s box', want.A.test(rec.A), String(want.A), rec.A)
  if (want.B) ck(label + ': B\'s box', want.B.test(rec.B), String(want.B), rec.B)
  if (want.bid) {
    /* the undecided bid is never deleted, and never doubled */
    const one = t.opened === 'daylist' ? bidLines.length === 1 : /LL/.test(ca.box) || /LL/.test(t.head)
    ck(label + ': A\'s LL bid still there, once', one, 'exactly one undecided LL bid', t.opened + ' · ' + (t.lines.join(' / ') || t.head) + ' · box ' + ca.box)
  }
  if (want.viewDesk) ck(label + ': the viewer\'s SDO', rec.viewDesk === want.viewDesk, want.viewDesk, rec.viewDesk)
  return rec
}

/* 0 */ await look('baseline', { tag: 'ORIG', viewTag: 'ORIG', A: /^FO\*$/, B: /^$/ })
/* 1 */ await unpublishAll('1 Original'); await look('draft', { tag: 'DRAFT', viewTag: null, A: /^$/, B: /^$/ })
/* 2 */
await lwOpen(page)
const bid = await lwBid(page, A, SATISO, 'LL')
note('A bids LL on 18 Jul', bid)
ck('A\'s undecided LL bid is placed', bid.placed, 'placed', bid)
await look('bid-on-draft', { tag: 'DRAFT', A: /LL/, bid: true })
/* 3 — AM48c */
const p3 = await signAnd('day', '3 Original')
ck('AM48c: the admin is told the bid sits on published work and is still live', /still live|sits on published work/i.test(p3.toast || ''), 'toast names the bid, "still live"', p3.toast)
const r3 = await look('published-with-bid', { tag: 'ORIG', viewTag: 'ORIG', A: /^FO\* !$/, B: /^$/, bid: true })
/* 4 — rank 15 branch B */
await unpublishAll('4 Original again'); await look('unpublished-with-bid', { tag: 'DRAFT', viewTag: null, A: /LL/, bid: true })
await signAnd('day', '4 republish'); await look('republished-with-bid', { tag: 'ORIG', viewTag: 'ORIG', A: /^FO\* !$/, bid: true })
/* 5 — rank 15 branch C */
await undoRedo('undo'); await look('undo-publish', { tag: 'DRAFT', viewTag: null, A: /LL/, bid: true })
await undoRedo('redo'); await look('redo-publish', { tag: 'ORIG', viewTag: 'ORIG', A: /^FO\* !$/, bid: true })
/* 6 — AL1 takes A off the desk */
await board(page, SAT)
const seat = page.locator(`#schedBoard .seat[data-slot^="d:${SAT}.0.0"]:visible`).first()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
if (w === 'desktop') await seat.click({ button: 'right' })
else {
  const b = await seat.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down()
  for (let i = 1; i <= 12; i++) { await page.mouse.move(b.x + b.width / 2 + i * 4, b.y + b.height / 2 - i * 22); await page.waitForTimeout(30) }
  await page.mouse.up()
}
await page.waitForTimeout(600)
note('A off the desk', { toast: await toastNow(page) })
await closeBoard(page)
await signAnd('al', '6 AL1')
const r6 = await look('al1-A-off', { tag: 'AL1', viewTag: 'AL1', B: /^$/, bid: true })
ck('AL1: A no longer earns the desk\'s full day', !/^FO/.test(r6.A), 'not FO* (at most the FAMILY DAY half day, if the crowd frozen at AL1 holds him)', r6.A)
/* 7 — AL2 gives the desk to B */
await board(page, SAT)
const putB = await put(page, `[data-fill="d:${SAT}.0.0.+"]`, [B])
note('B onto the desk', { put: putB, desk: await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].id) })
ck('B placed on the SDO desk', putB === B, B, putB)
await closeBoard(page)
await signAnd('al', '7 AL2')
const r7 = await look('al2-B-on', { tag: 'AL2', viewTag: 'AL2', B: /^FO\*$/, bid: true, viewDesk: B })
/* 8 — Unpublish AL2 */
const u8 = await unpublishAll('8 AL2')
const r8 = await look('al2-unpublished', { tag: 'AL1', viewTag: 'AL1', B: /^$/, bid: true })
ck('8: the AL2-shaped working copy is pending against AL1 (AM37c)', /pending/.test(r8.pending || '') && r8.deskWorking === B, 'B still on the working desk, day pending', r8.pending + ' · desk ' + r8.deskWorking)
ck('8: A reads what AL1 pays again', r8.A === r6.A, r6.A, r8.A)
/* 9 — Unpublish AL1 */
await unpublishAll('9 AL1')
const r9 = await look('al1-unpublished', { tag: 'ORIG', viewTag: 'ORIG', A: /^FO\* !$/, B: /^$/, bid: true })
/* 10 — Undo that second unpublish */
await undoRedo('undo')
const r10 = await look('undo-second-unpublish', { tag: 'AL1', viewTag: 'AL1', B: /^$/, bid: true })
ck('10: Undo restores AL1, not AL2 (rank 1)', r10.tag === 'AL1' && r10.A === r6.A, 'AL1 and A as AL1 paid', r10.tag + ' · A ' + r10.A)

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
