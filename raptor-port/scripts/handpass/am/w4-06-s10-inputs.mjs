/* w4 · S10 (Fable) + Astra rank 22 + Astra rank 10 + roll-call R21 + AM43 — inputs landing on a PUBLISHED day.
   Tuesday 14 Jul is issued as its Original with nothing pending; Friday 17 Jul is a draft.
   Rules (register): AM41 (a request filed live on a published day lands on the WORKING copy as a pending
   amendment; the issued face stays frozen), AM14 (a filing-only change clears the sign-offs and cannot
   publish on signatures given before it; putting it back restores them), AM11, AM15/AM15b, AM21b (an
   accepted input's ground row rides the next AL), AM25 (the panel counts input filings), AM43 (NOT BUILT —
   a new absence silently changing the issued Unavailable list: observed, not judged), and Fable's door list
   ("Load the current version — content only; a filing change stays").
   Part 1  the ground path: file → lands → Undo → → Ground → sign → Publish AL1 → sign on AL1 → Undo (rank 22)
           → → Ground (signatures back) → Undo → load AL1 onto the working copy (rank 10's disproof)
   Part 2  the Unavailable path: a second Other → Undo → → Unavail (the pure filing axis) → sign → the issued
           face's Unavailable list (AM43) → the door back out
   Part 3  rank 10 branch A: file on the DRAFT Friday first, then publish
   Part 4  the member files his own leave on the published Tuesday (S10 action D; AM41 / AM43)
   Usage: node w4-06-s10-inputs.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, editWeek, board, closeBoard, head, signDay, publishDay, publishAL, shot, toastNow, clearToast,
  checker, go, frame, alPanel, fileInput, viewDay, readUnav, readPinp, relogin, marks, planMenuItems, book, openInputs } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('S10 ' + w)
const TUE = 1, TUEISO = '2026-07-14', FRI = 4, FRIISO = '2026-07-17', X = 'rocky'   // Hex
const REM = 'W4 OTHER ' + w, REM2 = 'W4 UNAV ' + w
const pic = s => `s10-${w}-${s}`
const blank = s => s.split('/').every(x => /name/.test(x))
const named = s => s.split('/').every(x => !/name/.test(x))

/** Where a piece of text shows on a day card: in the Unavailable block, Personal Inputs, or on the programme. */
const where = (daySel, txt) => page.evaluate(([s, t]) => {
  const d = document.querySelector(s); if (!d) return 'NO DAY'
  return [...new Set([...d.querySelectorAll('*')].filter(e => e.children.length === 0 && ((e.innerText || e.value || '') + '').includes(t))
    .map(e => e.closest('.sec-unav') ? 'unavailable' : e.closest('.sec-inp') ? 'personal-inputs' : 'programme'))]
}, [daySel, txt])
const inputState = rem => page.evaluate(r => { const i = window.INPUTS.find(x => (x.remarks || '') === r); return i ? (i.acc || 'fresh') : 'NO INPUT' }, rem)

/** Tuesday on the edit week, the view page's issued face and (for the record) the input's filing state. */
async function tue(label, rem = REM) {
  await editWeek(page)
  const h = await head(page, TUE)
  const p = await alPanel(page)
  const ew = await where(`#eWeek .day[data-day="${TUE}"]`, rem)
  await frame(page, `#eWeek .day[data-day="${TUE}"]`)
  await shot(page, pic(label + '-edit'))
  const v = await viewDay(page, TUE)
  const vw = await where(`#vWeek .day[data-day="${TUE}"]`, rem)
  const vu = await readUnav(page, `#vWeek .day[data-day="${TUE}"]`)
  await frame(page, `#vWeek .day[data-day="${TUE}"]`)
  await shot(page, pic(label + '-view'))
  const rec = { tag: h.tag, pending: h.pending, nys: h.nys, sign: h.signState, signs: h.signs.join('/'),
    alpub: h.alpub ? h.alpub.text + (h.alpub.disabled ? ' (locked)' : '') : '', panelTue: w === 'desktop' ? (p.match(/Tue ·[^A-Z]*?(?=Publish|$)/) || [''])[0] + ' || ' + (p.match(/AL\d Tue[^A]*/g) || []).join(' | ') : '(the panel is hidden on a phone)',
    editShows: ew, viewTag: v?.tag, viewShows: vw, viewUnav: vu, filing: await inputState(rem) }
  note(label, rec)
  return rec
}
/** Press an accept control of an input on the board's Personal Inputs panel (g = → Ground, u = → Unavail, x = Undo). */
async function acc(which, label, rem = REM) {
  await board(page, TUE)
  await openInputs(page, TUE)
  const iid = await page.evaluate(r => { const i = window.INPUTS.find(x => (x.remarks || '') === r); return i ? String(i.iid || '') : '' }, rem)
  const b = page.locator(`#schedBoard [data-acc="${which}"][data-acck="${iid}"]:visible`).first()
  const n = await b.count()
  let t = null
  if (n) { await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await clearToast(page); await b.click(); await page.waitForTimeout(700); t = await toastNow(page) }
  await shot(page, pic(label + '-board'))
  await closeBoard(page)
  note(label + ' — press ' + which, { found: n, toast: t, filingNow: await inputState(rem) })
  return n > 0
}

/* ==== Part 1 — the ground path ======================================================================= */
await editWeek(page)
await clearToast(page)
note('sign Tue (nothing to publish)', await signDay(page, TUE))
const t0 = await toastNow(page)
await tue('0-signed')
ck('AM15b: signing a published day with nothing to publish says so', /no changes to publish/i.test(t0 || ''), 'the note', t0)

const f1 = await fileInput(page, { person: X, type: 'Other', from: TUEISO, start: '10:00', end: '11:00', remarks: REM })
note('Inputs page: Other for Hex on Tue 10:00-11:00', f1)
ck('R21: the Inputs page files it', f1.added === 1, 'one input', f1)
const r1 = await tue('1-filed')
ck('AM41: it lands on the working copy as a pending amendment', /pending/.test(r1.pending) && r1.editShows.includes('programme'), 'N pending; the row on the working programme', r1.pending + ' · ' + r1.editShows)
ck('AM41: the issued face stays frozen', !r1.viewShows.includes('programme'), 'not on the issued face', r1.viewShows)
ck('AM14 / AM11: the signatures given before the filing are cleared', blank(r1.signs), 'all four blank', r1.signs)
ck('AM14: Publish AL1 is locked until signed again', /locked/.test(r1.alpub), 'locked', r1.alpub)
if (w === 'desktop') ck('AM25: the panel lists Tuesday with its input filing', /Tue ·.*input filing/.test(r1.panelTue), '"Tue · … · 1 input filing"', r1.panelTue)

await acc('x', '2-undo')
const r2 = await tue('2-undone')
ck('AM14: landed-then-removed still counts as a filing change (the input went dormant)', /pending/.test(r2.pending) && r2.filing === 'r', 'N pending; filing r', r2.pending + ' · ' + r2.filing)

await acc('g', '3-reaccept')
await editWeek(page)
note('sign after the filing', await signDay(page, TUE))
await clearToast(page)
const p3 = await publishAL(page, TUE)
note('Publish AL1', { ...p3, toast: await toastNow(page) })
const r3 = await tue('3-al1')
ck('the filing went out as AL1 (the row on the issued face)', r3.tag === 'AL1' && r3.viewShows.includes('programme'), 'AL1; the row on the issued Tuesday', r3.tag + ' · ' + r3.viewShows)
const m3 = await marks(page, `#eWeek .day[data-day="${TUE}"]`)
note('AL1 marks on Tuesday (the accepted row is SOLID in AL1\'s colour)', { issued: m3.issued.map(m => m.text + '@AL' + m.alc), pending: m3.pending.map(m => m.text) })
if (w === 'desktop') note('the panel\'s issued tag for Tuesday', r3.panelTue)

await editWeek(page)
await clearToast(page)
note('sign on AL1, nothing pending', await signDay(page, TUE))
const t4 = await toastNow(page)
ck('AM15b at AL1', /no changes to publish/i.test(t4 || ''), 'the note', t4)
await acc('x', '4-unaccept-after-signing')
const r4 = await tue('4-unaccepted-after-signing')
ck('Astra 22 / AM14: un-accepting after signing needs fresh signatures', blank(r4.signs) && /locked/.test(r4.alpub), 'four blank; Publish AL2 locked', r4.signs + ' · ' + r4.alpub)
await acc('g', '5-reaccept-after-signing')
const r5 = await tue('5-reaccepted')
ck('AM11: putting it back restores the four signatures', named(r5.signs) && !/pending/.test(r5.pending), 'four named again; nothing pending', r5.signs + ' · ' + (r5.pending || '(none)'))

/* rank 10's disproof: load the issued AL1 onto the working copy while the filing is changed (un-accepted) */
await acc('x', '6a-unaccept-again')
await editWeek(page)
note('Tue plans menu', await planMenuItems(page, TUE))
const al1Row = page.locator(`.wm[data-planpv="2026-07-14#1"]:visible`).first()
if (await al1Row.count()) {
  await al1Row.click(); await page.waitForTimeout(700)
  const ld = page.locator(`#eWeek [data-restore="${TUE}"]:visible`).first()
  const lbl1 = (await ld.count()) ? (await ld.innerText()).trim() : 'NO LOAD BUTTON'
  await frame(page, `#eWeek .day[data-day="${TUE}"]`)
  await shot(page, pic('6b-preview-al1'))
  if (await ld.count()) { await clearToast(page); await ld.click(); await page.waitForTimeout(600) }
  const ld2 = page.locator(`#eWeek [data-restore="${TUE}"]:visible`).first()
  const lbl2 = (await ld2.count()) ? (await ld2.innerText()).trim() : '(gone)'
  if ((await ld2.count()) && /confirm/i.test(lbl2)) { await shot(page, pic('6c-load-armed')); await clearToast(page); await ld2.click(); await page.waitForTimeout(700) }
  note('Load AL1 onto the working copy', { first: lbl1, second: lbl2, toast: await toastNow(page) })
  const r6 = await tue('6-after-load')
  note('Personal Inputs after the load', await readPinp(page, `#eWeek .day[data-day="${TUE}"]`))
  ck('rank 10: loading a version keeps the Inputs record', r6.filing !== 'NO INPUT', 'the input still exists', r6.filing)
  note('rank 10 / Fable door list: after the load — the content is AL1\'s; the filing state and the count', { filing: r6.filing, pending: r6.pending, editShows: r6.editShows })
} else note('load', 'NO AL1 ROW IN THE PLANS MENU')

/* ==== Part 2 — the Unavailable path (a second input) =============================================== */
const f2 = await fileInput(page, { person: X, type: 'Other', from: TUEISO, start: '12:00', end: '13:00', remarks: REM2 })
note('Inputs page: a second Other for Hex on Tue 12:00-13:00', f2)
await acc('x', '7a-undo-landing', REM2)
await acc('u', '7b-to-unavail', REM2)
const r7 = await tue('7-filed-unavail', REM2)
ck('AM14: filed under Unavailable (the pure filing axis) is pending and needs signatures', /pending/.test(r7.pending) && blank(r7.signs), 'pending; four blank', r7.pending + ' · ' + r7.signs)
note('AM43 (NOT BUILT) — the ISSUED face\'s Unavailable after the filing', { viewUnav: r7.viewUnav, viewShows: r7.viewShows })
/* the door back out of Unavailable: the row must carry an Undo (or → Ground) control somewhere */
await board(page, TUE)
const door = await page.evaluate(r => {
  const leaf = [...document.querySelectorAll('#schedBoard *')].find(e => e.children.length === 0 && ((e.value || e.innerText || '') + '').includes(r))
  const row = leaf && leaf.closest('.sb-arow, .inprow')
  if (!row) return 'NO ROW'
  row.scrollIntoView({ block: 'center' })
  return [...row.querySelectorAll('button')].map(b => (b.innerText || b.title || '').trim().slice(0, 30) + (b.dataset.acc ? ' [acc=' + b.dataset.acc + ']' : '') + (b.dataset.inpedit ? ' [edit]' : ''))
}, REM2)
await page.waitForTimeout(300)
await shot(page, pic('7c-unavail-row-on-board'))
await closeBoard(page)
note('the controls on the filed row (board Unavailable panel)', door)
ck('R21 / door check: a filed Other can be taken back out of Unavailable from its row', Array.isArray(door) && door.some(c => /acc=/.test(c)), 'an Undo / → Ground on the row', door)

/* ==== Part 3 — Astra rank 10 branch A: file on the DRAFT Friday first, then publish =============== */
const f8 = await fileInput(page, { person: X, type: 'Other', from: FRIISO, start: '10:00', end: '11:00', remarks: REM + ' FRI' })
note('Inputs page: Other for Hex on the draft Friday', f8)
await editWeek(page)
note('Fri head after the filing (a draft day — no marks, AM18)', await head(page, FRI))
note('sign Fri', await signDay(page, FRI))
await clearToast(page)
const p8 = await publishDay(page, FRI)
const h8 = await head(page, FRI)
note('Publish day Fri', { ...p8, toast: await toastNow(page), head: h8 })
await viewDay(page, FRI)
const vw8 = await where(`#vWeek .day[data-day="${FRI}"]`, REM + ' FRI')
await frame(page, `#vWeek .day[data-day="${FRI}"]`)
await shot(page, pic('8-fri-issued'))
ck('rank 10 A: filed before publishing, it IS the Original (nothing pending after)', h8.tag === 'ORIG' && !/pending/.test(h8.pending) && vw8.includes('programme'), 'ORIG; nothing pending; the row on the issued face', h8.tag + ' · ' + (h8.pending || '(none)') + ' · ' + vw8)

/* ==== Part 4 — the member files his own leave on the published Tuesday ============================== */
await relogin(page, 'm')
await go(page, 'inputs')
const me = await page.evaluate(() => ((document.querySelector('#inPersonFixed') || {}).innerText || '').trim())
const f9 = await fileInput(page, { type: 'LL', from: TUEISO, span: 'all', remarks: 'W4 MEMBER LL ' + w })
note('the member (' + me + ') files LL on Tuesday', f9)
await shot(page, pic('9-member-inputs'))
ck('R21: the member\'s filing is accepted by the Inputs page', f9.added >= 1, 'filed', f9)
const vm = await viewDay(page, TUE)
const vmu = await readUnav(page, `#vWeek .day[data-day="${TUE}"]`)
await frame(page, `#vWeek .day[data-day="${TUE}"]`)
await shot(page, pic('9b-member-view-issued'))
note('the member\'s view of the ISSUED Tuesday straight after', { tag: vm.tag, unavail: vmu })
await relogin(page, 'a')
const r9 = await tue('9c-admin-after-member-leave', 'W4 MEMBER LL ' + w)
note('edit week Unavailable (working copy)', await readUnav(page, `#eWeek .day[data-day="${TUE}"]`))
note('AM43 (NOT BUILT) — the ISSUED face\'s Unavailable after the member\'s leave', r9.viewUnav)
note('AM41 — does a LEAVE filed on the published day raise "pending"? (only activity inputs auto-land; a leave stays unfiled)', { pending: r9.pending, sign: r9.sign, filing: r9.filing })

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
