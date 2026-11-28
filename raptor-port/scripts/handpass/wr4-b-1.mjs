// Walker b, B1 — lines the OLD build wrote, read on the NEW build; each tapped; then the same inputs changed again on NEW.
// Run from raptor-port:  node scripts/handpass/wr4-b-1.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-1 v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b1-run1'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
process.env.WR4_OLD ||= 'D:/rw4/build-main'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, log, facts, press, recOf, bundleOf, sleep, RANGER, HEX, WED, THU, NEW_DIR, OLD_DIR } = L
const c = 'B1'
const TUE = '2026-07-14'
const out = {}
try {
  // ---- on OLD: Ranger files two LLs; Saber makes one OL, the other AM; Saber files a group Training and makes the three-change save
  let w = await newPage('desk', undefined, OLD_DIR); await signIn(w, 'us')
  log(c, 'OLD bundle: ' + await bundleOf(w.page))
  const ll1 = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
  const ll2 = await fileInput(w, c, TUE, { type: 'LL', span: 'all', remarks: 'Second leave' })
  if (!ll1 || !ll2) throw new Error('fixture: Ranger could not file his two LLs on OLD')
  w = await handOver(w, 'desk', 'ad', OLD_DIR)
  await editInput(w, c, ll1, WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  await editInput(w, c, ll2, TUE, () => press(w, '#inpEditSpan [data-span="am"]'))
  const tr = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' })
  if (!tr) throw new Error('fixture: Saber could not file the group Training on OLD')
  await editInput(w, c, tr, WED, async () => {
    await press(w, `#inpEdCal [data-iso="${THU}"]`)
    await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
    await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water')
  })
  out.ids = { ll1, ll2, tr }
  out.oldRecs = { ll1: await recOf(w.page, ll1), ll2: await recOf(w.page, ll2), tr: await recOf(w.page, tr) }
  log(c, 'OLD records after Saber: ' + JSON.stringify(out.oldRecs))
  await sleep(1200)
  const state = await w.ctx.storageState({ indexedDB: true })
  await w.ctx.close()

  // ---- read on NEW: phone, then desktop, each from the same carried world
  for (const size of ['phone', 'desk']) {
    const r = await newPage(size, state, NEW_DIR); await signIn(r, 'us')
    log(c, `${size} read bundle: ` + await bundleOf(r.page))
    out['stored_' + size] = await B.stored(r.page, RANGER)
    await openBell(r)
    const lines = await B.readLines(r.page)
    out['lines_' + size] = B.said(lines)
    out['fit_' + size] = await L.bellFit(r.page)
    log(c, `${size} Ranger's bell: ` + JSON.stringify(B.said(lines)))
    await B.bellPic(r, c, `B1-1-bell-old-lines-${size}`, lines)
    const has = re => lines.some(l => re.test(l.what))
    log(c, `${has(/^Renamed — was LL · Saber$/) ? 'PASS' : 'FAIL'} old kind line "Renamed — was LL · Saber" (${size})`)
    log(c, `${has(/^Now 00:00–12:00 am · Saber$/) ? 'PASS' : 'FAIL'} old half line "Now 00:00–12:00 am · Saber" (${size})`)
    log(c, `RECORD three-part (${size}): ` + JSON.stringify(lines.filter(l => /^Now Thu/.test(l.what)).map(l => l.what)))
    // tap each change line (not the "You were added" line, also tapped last for completeness)
    await r.page.keyboard.press('Escape'); await sleep(300)   // v2: close the list first, or openBell's press shuts it
    const targets = lines.map(l => l.what)
    for (let k = 0; k < targets.length; k++) {
      await openBell(r)
      const now = await B.readLines(r.page)
      const L2 = now.find(x => x.what === targets[k])
      if (!L2) { log(c, `NOT FOUND line ${targets[k]} on reopen`); continue }
      const before = L2.unread
      const shows = await B.tapLine(r, c, L2.i, `B1-2-tap${k}-${size}`)
      const iidOf = (await B.stored(r.page, RANGER)).find(n => n.id && `bell-line-${n.id}` === L2.id)
      const rec = iidOf ? await recOf(r.page, iidOf.iid) : null
      const errs = facts.errors.length
      log(c, `tap "${L2.what}" (${size}): unread before ${before}; window ${JSON.stringify(shows)}; record now ${JSON.stringify(rec)}; errors so far ${errs}`)
      ;(out['taps_' + size] ||= []).push({ line: L2.what, unreadBefore: before, shows, rec })
      await B.closeWin(r)
      await openBell(r)
      const after = (await B.readLines(r.page)).find(x => x.what === targets[k])
      log(c, `  after: that line unread=${after && after.unread}; bell ${JSON.stringify(await B.bellState(r.page))}`)
      ;(out['taps_' + size].at(-1)).unreadAfter = after && after.unread
      await r.page.keyboard.press('Escape'); await sleep(250)
    }
    await openBell(r)
    await B.bellPic(r, c, `B1-3-bell-after-taps-${size}`, await B.readLines(r.page))
    await r.ctx.close()
  }

  // ---- on NEW: Saber changes the same inputs again; Ranger reads on the phone
  let s = await newPage('desk', state, NEW_DIR); await signIn(s, 'ad')
  log(c, 'NEW (Saber) bundle: ' + await bundleOf(s.page))
  await editInput(s, c, ll1, WED, () => s.page.selectOption('#inpEditPop #inpEditType', 'LL'))
  await editInput(s, c, ll2, TUE, () => press(s, '#inpEditSpan [data-span="pm"]'))
  await editInput(s, c, tr, THU, async () => {
    await press(s, `#inpEdCal [data-iso="${WED}"]`)
    await s.page.fill('#inpEditPop #inpEditOwnTitle', 'Range day')
    await s.page.fill('#inpEditPop #inpEditRmk', 'Bring lunch')
  })
  out.newRecs = { ll1: await recOf(s.page, ll1), ll2: await recOf(s.page, ll2), tr: await recOf(s.page, tr) }
  const r = await handOver(s, 'phone', 'us', NEW_DIR)
  out.stored_after = await B.stored(r.page, RANGER)
  await openBell(r)
  const lines = await B.readLines(r.page)
  out.lines_after = B.said(lines)
  log(c, 'after the NEW changes, Ranger\'s bell: ' + JSON.stringify(B.said(lines)))
  await B.bellPic(r, c, 'B1-4-bell-new-beside-old-phone', lines)
  const has = re => lines.some(l => re.test(l.what))
  log(c, `${has(/^OL changed to LL · Saber$/) ? 'PASS' : 'FAIL'} new kind line "OL changed to LL · Saber"`)
  log(c, `${has(/^Now LL \(PM\) · Saber$/) ? 'PASS' : 'FAIL'} new half line "Now LL (PM) · Saber"`)
  log(c, `RECORD new three-part: ` + JSON.stringify(lines.filter(l => /^Now Wed/.test(l.what)).map(l => l.what)))
  log(c, `old lines still there: ${has(/^Renamed — was LL · Saber$/)} / ${has(/^Now 00:00–12:00 am · Saber$/)}`)
  await r.ctx.close()
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b1.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
