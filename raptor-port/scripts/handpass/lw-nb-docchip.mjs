// [LW-DOCFIELD-CHIP-OPENS] — his D1292 (24 Oct 26): "After I upload the document. I should be able to click on the image to
// preview what I uploaded". Every window where a person ADDS a document draws the app's one Document button, each file a chip
// with its ✕; a tap on the chip's NAME now opens the app's document viewer on that file — straight after it is added, before
// anything is saved, as well as later — and the ✕ still only takes it off. Walked at every place (the roll-call in the sheet):
//   E1 the one-day bid window on an empty day (a file just added, nothing placed) · E2 the same window reopened on the held bid ·
//   E3 an approved leave's own row (the admin's bid window) · E4 the day's list (a day with two bids) · E5 the drag window ·
//   E6 the Inputs page's input window (a new input, nothing saved) · M1 a member's own bid window · M2 his approved-leave window
//   (D1354) · M3 his closed day's window (D1354).
// At each: the chip tapped → the viewer opens on the file, titled with whose, which kind, which days → closed each way (Close,
// ✕, its own dark surround, Escape on a desktop) → only the viewer goes, the window under it as it was, the chip still there
// (lesson 19, drafted 2 Nov 26). And the plain-user round around it (D1557): add, open, take off with ✕ (opens nothing), add
// again, save, then look where the document should show afterwards — the held bid's chip, the person window's paperclip,
// Approvals' paperclip, the Inputs page's input window.
// Written as the RIGHT behaviour (a PASS means correct); run on the build before the fix, every "opens" row fails.
// Run from raptor-port: LW_PORT=<a served build> LW_OUT=2026-11-01-lw-next-batch/docchip node scripts/handpass/lw-nb-docchip.mjs
//   (PART=d,p,m for some; ENGINES=chromium,webkit)
process.env.LW_PORT ||= '4173'
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/docchip'
const fs = await import('node:fs')
const path = await import('node:path')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
for (const f of fs.readdirSync(H.OUT)) if (f.endsWith('.png')) fs.unlinkSync(`${H.OUT}/${f}`)
const parts = (process.env.PART || 'd,p,m').split(',')
const engines = (process.env.ENGINES || 'chromium,webkit').split(',')
console.log('[lw-nb-docchip v1] →', H.OUT, parts.join(' '), engines.join(' '), 'bundle on', process.env.LW_PORT)
const recs = []
const real = errs => errs.filter(e => !/requestfailed: blob:/.test(e))
const sizeOf = w => w.phone ? `phone/${w.engine}` : `desk ${w.page.viewportSize().width}/${w.engine}`
const rec = (id, w, ok, said, pics = []) => { const size = typeof w === 'string' ? w : sizeOf(w); recs.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
const viewerUp = P => P.evaluate(() => { const v = document.getElementById('docViewPop'); return !!v && !v.hidden && v.getBoundingClientRect().width > 0 })
const up = (P, sel) => P.evaluate(sel => { const e = document.querySelector(sel); return !!e && e.getBoundingClientRect().width > 0 && !e.closest('[hidden]') }, sel)
const count = (P, sel) => P.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).length, sel)
const title = P => L.txt(P, '#docViewTitle')
const shown = P => P.evaluate(() => { const i = document.querySelector('#docViewPop .docview-img, #docViewPop iframe, #docViewPop embed, #docViewPop object'); return i ? i.tagName.toLowerCase() : 'nothing' })
const shot = async (w, name) => { await w.page.screenshot({ path: `${H.OUT}/${name}.png`, scale: 'css' }); return name + '.png' }
const tap = async (w, sel, name) => { await L.press(w, sel, w.phone && name ? name + '-q' : null); await w.page.waitForTimeout(450) }
const tapSurround = async (w, name) => {
  const b = await w.page.locator('#docViewPop .airpop-box').boundingBox()
  const x = 8, y = Math.max(6, Math.round(b.y / 2))
  if (w.phone) await L.finger(w, x, y, 0, name + '-q'); else await w.page.mouse.click(x, y)
  await w.page.waitForTimeout(450)
}
/* a real photo to attach (a picture the person took): drawn once on a canvas, saved as a PNG */
let PHOTO = null
async function photo(P) {
  if (PHOTO) return PHOTO
  const b64 = await P.evaluate(() => { const c = document.createElement('canvas'); c.width = 600; c.height = 400; const g = c.getContext('2d'); g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, 600, 400); g.fillStyle = '#1d3b58'; g.fillRect(0, 0, 600, 70); g.fillStyle = '#fff'; g.font = 'bold 30px sans-serif'; g.fillText('LEAVE APPROVAL', 24, 46); g.fillStyle = '#222'; g.font = '24px sans-serif'; g.fillText('Ranger — LL — approved', 24, 140); g.fillText('Ref 2026-0412', 24, 190); g.strokeStyle = '#2a7d3a'; g.lineWidth = 6; g.strokeRect(380, 230, 180, 120); g.fillStyle = '#2a7d3a'; g.font = 'bold 34px sans-serif'; g.fillText('OK', 440, 305); return c.toDataURL('image/png').split(',')[1] })
  PHOTO = path.join(H.OUT, 'leave-approval.png'); fs.writeFileSync(PHOTO, Buffer.from(b64, 'base64'))
  return PHOTO
}
const addPhoto = async (w, scope) => { await w.page.locator(`${scope} input[type=file]`).first().setInputFiles(await photo(w.page)); await w.page.waitForTimeout(700) }
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const putAway = async w => { for (let i = 0; i < 3; i++) { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(250) } }

/* THE CHECK at one place: the chip in `scope` tapped → the viewer up on the file, its title matching `want`; closed by each
   way; after each, the viewer gone, `behind` still up, the chip still there */
async function chipOpens(w, id, scope, behind, want, tag) {
  const P = w.page
  const chip = `${scope} .docchip .docname`
  const hows = w.phone ? ['Close', '✕', 'surround'] : ['Close', '✕', 'surround', 'Escape']
  for (const how of hows) {
    const htag = `${tag}-${how === '✕' ? 'x' : how.toLowerCase()}`
    if (!(await up(P, chip))) { rec(`${id} — ${how}`, w, false, `NOT WALKED — no chip at ${scope}`, [await shot(w, `${htag}-no-chip`)]); return }
    await tap(w, chip, `${htag}-1-tap`)
    const opened = await viewerUp(P), t = opened ? await title(P) : null, what = opened ? await shown(P) : null
    const onTop = opened ? await P.evaluate(() => { const b = document.getElementById('docViewDone'); if (!b) return 'no Close'; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e === b || b.contains(e) ? 'its Close' : (e?.closest('[data-testid]')?.getAttribute('data-testid') || e?.className || e?.tagName) }) : null
    const p1 = await shot(w, `${htag}-2-viewer`)
    if (!opened) { rec(`${id} — opens (${how} round)`, w, false, 'a tap on the chip opened NOTHING', [p1]); continue }
    if (how === 'Close') await tap(w, '#docViewDone', `${htag}-3-close`)
    else if (how === '✕') await tap(w, '#docViewClose', `${htag}-3-x`)
    else if (how === 'surround') await tapSurround(w, `${htag}-3-surround`)
    else { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
    const v = await viewerUp(P), b = await up(P, behind), still = await count(P, `${scope} .docchip`)
    const p2 = await shot(w, `${htag}-4-after`)
    /* a file this browser's drawer never kept (the WebKit test browser stores no files: the app says "Couldn't save that
       document" at the pick, and after a reload the chip reads "document" — lw-nb-docchip-idb.mjs) opens on the viewer's own "No
       document on file" statement: the right page for it, said so */
    const lost = what === 'nothing' && /^document( |$)/.test((await L.txt(P, `${scope} .docchip .docname`)) || '')
    const ok = want.test(t || '') && (what !== 'nothing' || lost) && onTop === 'its Close' && !v && b && still > 0
    rec(`${id} — ${how}`, w, ok, `opened: "${t}" showing ${lost ? 'the "No document on file" statement (this test browser kept no file — side check)' : what}, ${onTop} on top; one ${how}: viewer ${v ? 'STILL OPEN' : 'closed'}, the window ${b ? 'as it was' : 'CLOSED'}, chips ${still}`, [p1, ...(w.phone ? [`${htag}-3-${how === '✕' ? 'x' : how === 'Close' ? 'close' : how}-q.png`] : []), p2])
    if (v) await putAway(w)
  }
}

/* SECTION A — the admin, members' today 15 Feb 26, on Ranger (bane) */
async function sectionA(w, tg) {
  const P = w.page, me = 'bane'
  await L.signInPlain(w, 'admin', '2026-02-15')
  /* E1 — the one-day bid window on an empty day: add, open each way, ✕ off (opens nothing), add again, place a pending LL */
  await L.openCellR(w, me, '2026-02-23'); await P.waitForSelector(T('bid-picker'))
  await setSwitch(w, false)
  await addPhoto(w, T('bid-doc-row'))
  await chipOpens(w, 'E1 the bid window, a file just added (nothing placed yet)', T('bid-doc-row'), T('bid-picker'), /· Bid · Feb 23$/, `${tg}-e1`)
  await tap(w, `${T('bid-doc-row')} .docchip .docdel`, `${tg}-e1-del`)
  const gone = await count(P, `${T('bid-doc-row')} .docchip`), vAfterDel = await viewerUp(P)
  rec('E1 its ✕ takes the file off and opens nothing', w, gone === 0 && !vAfterDel && await up(P, T('bid-picker')), `chips ${gone}; viewer ${vAfterDel ? 'OPENED' : 'not opened'}`, [await shot(w, `${tg}-e1-5-after-del`)])
  await addPhoto(w, T('bid-doc-row'))
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Family trip'); await P.waitForTimeout(150)
  const placed = await L.placeLeave(w, 'LL')
  rec('E1 saved: LL placed pending with its file', w, placed, `the window closed on the leave ${placed}`, [await shot(w, `${tg}-e1-6-placed`)])
  /* E2 — the same window reopened on the held bid: its own row's chip */
  await L.openCellR(w, me, '2026-02-23'); await P.waitForSelector(T('bid-picker'))
  await chipOpens(w, 'E2 the bid window reopened on the held bid', T('bid-doc-row'), T('bid-picker'), /· LL · Feb 23$/, `${tg}-e2`)
  await putAway(w)
  /* afterwards — where the document shows: the person window's paperclip, Approvals' paperclip */
  await L.press(w, `[data-testid="row-${me}"] .whoedit`); await P.waitForTimeout(800)
  const clip = `[data-testid="person-window"] [data-testid="pw-clip-2026-02-23"]`
  if (await up(P, clip)) { await tap(w, clip, `${tg}-pw-open`); const t = await title(P); rec('After: the person window’s paperclip on the 23 Feb leave opens it', w, (await viewerUp(P)) && /LL/.test(t || ''), `"${t}"`, [await shot(w, `${tg}-pw-viewer`)]) }
  else rec('After: the person window’s paperclip on the 23 Feb leave', w, false, 'NO paperclip on the leave line', [await shot(w, `${tg}-pw-none`)])
  await putAway(w)
  await L.press(w, T('lw-tab-approvals')); await P.waitForTimeout(900)
  const n = await count(P, T('appr-clip'))
  if (n) { await tap(w, T('appr-clip'), `${tg}-ap-open`); rec('After: Approvals shows the document icon, and it opens', w, await viewerUp(P), `paperclips ${n}; "${await title(P)}"`, [await shot(w, `${tg}-ap-viewer`)]) }
  else rec('After: Approvals shows the document icon', w, false, 'NO paperclip on Approvals', [await shot(w, `${tg}-ap-none`)])
  await putAway(w)
  await L.press(w, T('lw-tab-grid')).catch(() => {}); await P.waitForTimeout(900)
  /* E3 — an approved leave: Auto-approve on, a file added and opened before the leave is placed, then the window reopened on the
     approved leave (its own row — D1307: saved onto the leave on the Inputs page) */
  await L.openCellR(w, me, '2026-02-25'); await P.waitForSelector(T('bid-picker'))
  await setSwitch(w, true)
  await addPhoto(w, T('bid-doc-row'))
  const placedA = await L.placeLeave(w, 'LL')
  await L.openCellR(w, me, '2026-02-25'); await P.waitForSelector(T('bid-picker'))
  rec('E3 set-up: an approved LL with its file, reopened', w, placedA && await up(P, `${T('bid-doc-row')} .docchip`), `placed ${placedA}`, [await shot(w, `${tg}-e3-0-open`)])
  await chipOpens(w, 'E3 an approved leave’s own row (the admin’s bid window)', T('bid-doc-row'), T('bid-picker'), /· LL · Feb 25$/, `${tg}-e3`)
  await putAway(w)
  /* afterwards — the Inputs page: the leave's own input window carries the file, and its chip opens there too (E6b) */
  const iid = await P.evaluate(() => (window.INPUTS || []).find(r => (r.person === 'bane' || (r.people || []).some(e => e && e.p === 'bane')) && r.type === 'LL' && r.date === 'Feb 25')?.iid)
  if (iid) {
    await H.openInputBy(w, iid, 'list', { y: 2026, m: 2 })
    await chipOpens(w, 'After (E6b): the Inputs page’s input window of that leave, its chip', `${H.WIN} .docfield`, '#inpEditPop', /Ranger · LL · Feb 25/, `${tg}-e6b`)
    await putAway(w)
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  } else rec('After (E6b): the leave on the Inputs page', w, false, 'NO input found for the approved LL', [await shot(w, `${tg}-e6b-none`)])
  /* E4 — the day's list: a morning bid with a file, an afternoon bid */
  await L.openCellR(w, me, '2026-02-26'); await P.waitForSelector(T('bid-picker'))
  await setSwitch(w, false)
  await L.press(w, T('portion-am')); await P.waitForTimeout(250)
  await addPhoto(w, T('bid-doc-row'))
  await L.placeLeave(w, 'LL')
  await L.openCellR(w, me, '2026-02-26'); await P.waitForTimeout(300)
  if (await up(P, T('bid-picker'))) { await L.press(w, T('portion-pm')); await P.waitForTimeout(250); await setSwitch(w, false); await L.placeLeave(w, 'LL') }
  await L.openCellR(w, me, '2026-02-26'); await P.waitForTimeout(400)
  const dl = await up(P, T('daylist-sheet'))
  rec('E4 set-up: a day of two bids opens the day’s list', w, dl, `day's list ${dl}`, [await shot(w, `${tg}-e4-0-list`)])
  if (dl) await chipOpens(w, 'E4 the day’s list, the morning bid’s chip', T('daylist-sheet'), T('daylist-sheet'), /· LL · Feb 26$/, `${tg}-e4`)
  await putAway(w)
  /* E5 — the drag window over 2–4 Mar (one person): a file just added */
  const reach = async (who, iso) => { await L.reachCell(w, who, iso); await P.locator(T(L.cellId(who, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300); return P.locator(T(L.cellId(who, iso))).first().boundingBox() }
  const bA = await reach(me, '2026-03-02'), bZ = await P.locator(T(L.cellId(me, '2026-03-04'))).first().boundingBox()
  if (bA && bZ) {
    const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
    /* a finger's hold and drag where the engine can be driven by touch (Chromium); WebKit has no touch drag in the driver, so its
       drag is the pointer's (the same pointer events the grid listens to) */
    if (w.phone && w.cdp) await L.holdDrag(w, [A, { x: (A.x + Z.x) / 2, y: A.y }, Z])
    else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
    await P.waitForTimeout(600)
  }
  const ss = await up(P, T('select-sheet'))
  if (ss) {
    await addPhoto(w, T('sel-doc-row'))
    await chipOpens(w, 'E5 the drag window (2–4 Mar), a file just added', T('sel-doc-row'), T('select-sheet'), /· Bid · Mar 2 → Mar 4$/, `${tg}-e5`)
  } else rec('E5 the drag window', w, false, 'the drag opened no drag window', [await shot(w, `${tg}-e5-none`)])
  await putAway(w)
  /* E6 — the Inputs page's input window: a NEW input, its file picked and opened before Save; Escape / Close only the viewer */
  await H.fileInput(w, { who: 'Ranger', type: 'LL', from: '2026-07-14', to: '2026-07-15', remarks: 'Inputs page leave', tag: `${tg}-e6f`, oil: 'no',
    beforeSave: async () => {
      await addPhoto(w, H.WIN)
      await chipOpens(w, 'E6 the Inputs page’s input window, a new input (nothing saved)', `${H.WIN} .docfield`, '#inpEditPop', /Ranger · LL · Jul 14 → Jul 15/, `${tg}-e6`)
    } })
  const saved = await P.evaluate(() => (window.INPUTS || []).find(r => (r.person === 'bane' || (r.people || []).some(e => e && e.p === 'bane')) && r.type === 'LL' && r.date === 'Jul 14'))
  rec('E6 saved: the input carries its file', w, !!saved && ((saved.docIds?.length ?? 0) + (saved.docId ? 1 : 0)) > 0, saved ? `docs ${JSON.stringify(saved.docIds ?? saved.docId)}` : 'NOT SAVED', [await shot(w, `${tg}-e6-saved`)])
  await putAway(w)
  /* the closed day's fixture for section M: a pending bid with a file on 12 Feb (before his today, so closed to him) */
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  await L.openCellR(w, me, '2026-02-12'); await P.waitForSelector(T('bid-picker'))
  await setSwitch(w, false); await addPhoto(w, T('bid-doc-row')); await L.placeLeave(w, 'LL')
  await putAway(w)
}

/* SECTION M — Ranger himself (a member), after section A's world was written */
async function sectionM(w, tg) {
  const P = w.page, me = 'bane'
  await L.signInPlain(w, 'member', '2026-02-15')
  /* M1 his own bid window on an open day: add, open, place */
  await L.openCellR(w, me, '2026-02-27'); await P.waitForTimeout(400)
  if (await up(P, T('bid-picker'))) {
    await addPhoto(w, T('bid-doc-row'))
    await chipOpens(w, 'M1 his own bid window, a file just added', T('bid-doc-row'), T('bid-picker'), /^Ranger · Bid · Feb 27$/, `${tg}-m1`)
    const placed = await L.placeLeave(w, 'LL')
    rec('M1 saved: his LL placed with its file', w, placed, `placed ${placed}`, [await shot(w, `${tg}-m1-placed`)])
  } else rec('M1 his own bid window', w, false, 'NO bid window on 27 Feb', [await shot(w, `${tg}-m1-none`)])
  await putAway(w)
  /* M2 his approved leave (25 Feb — section A): his approved-leave window's row (D1354) */
  await L.openCellR(w, me, '2026-02-25'); await P.waitForTimeout(400)
  const rs = await up(P, T('remarks-sheet')) ? T('remarks-sheet') : await up(P, T('bid-picker')) ? T('bid-picker') : null
  if (rs) await chipOpens(w, `M2 his approved leave’s window (${rs.includes('remarks') ? 'the approved-leave window' : 'a bid window'})`, `${rs} [data-testid$="-doc-row"]`, rs, /^Ranger · LL · Feb 25$/, `${tg}-m2`)
  else rec('M2 his approved leave’s window', w, false, 'NO window on 25 Feb', [await shot(w, `${tg}-m2-none`)])
  await putAway(w)
  /* M3 his closed day (12 Feb, a pending bid with a file): the closed day's window (D1354) */
  await L.openCellR(w, me, '2026-02-12'); await P.waitForTimeout(400)
  if (await up(P, T('closed-note'))) await chipOpens(w, 'M3 his closed day’s window, his pending bid’s chip', T('closed-doc-row'), T('closed-note'), /^Ranger · LL · Feb 12( → Feb 13)?$/, `${tg}-m3`)
  else rec('M3 his closed day’s window', w, false, 'NO closed-day window on 12 Feb', [await shot(w, `${tg}-m3-none`)])
  await putAway(w)
  /* afterwards — his person window's paperclips (his own leave of 27 Feb) */
  await L.press(w, `[data-testid="row-${me}"] .whoedit`); await P.waitForTimeout(800)
  const clip = `[data-testid="person-window"] [data-testid="pw-clip-2026-02-27"]`
  if (await up(P, clip)) { await tap(w, clip, `${tg}-pw-open`); rec('After: his person window’s paperclip on the 27 Feb leave opens it', w, await viewerUp(P), `"${await title(P)}"`, [await shot(w, `${tg}-pw-viewer`)]) }
  else rec('After: his person window’s paperclip on the 27 Feb leave', w, false, 'NO paperclip', [await shot(w, `${tg}-pw-none`)])
  await putAway(w)
}

if (parts.includes('d')) {
  const w = await H.deskCtx()
  await sectionA(w, 'd')
  if (parts.includes('m')) await sectionM(w, 'dm')
  rec('D-errors', w, !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}
if (parts.includes('p')) {
  for (const engine of engines) {
    const w = await H.phoneCtx(engine)
    await sectionA(w, `p-${engine}`)
    if (parts.includes('m')) await sectionM(w, `pm-${engine}`)
    rec('P-errors', w, !real(w.errs).length, real(w.errs).slice(0, 4).join(' | ') || 'none')
    await w.ctx.close()
  }
}
fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify(recs, null, 1))
console.log(`\n${recs.filter(r => r.verdict === 'PASS').length}/${recs.length} PASS`)
await H.closeBrowser()
