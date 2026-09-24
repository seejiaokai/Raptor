/* b3-02 — ITEM 6 (D98): "Load onto working copy" puts back what the loaded version had FILED, so the day reads exactly
   as that version (nothing pending); the confirm's "Discard N edits" counts the filing it will put back; a request
   filed AFTER the version reads fresh again after the load; a request covering two published days (Mon–Tue) is left
   as filed by a load of Monday, Tuesday is untouched, and the message says so. Walker B3, 25 Sep 26.
   Every fixture through the app: the request's own buttons on the board, the Inputs page form, the plans menu, the
   preview bar. Usage (from raptor-port/): node scripts/handpass/am/b3-02-load.mjs [desktop|phone] */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, closeBoard, openInputs, head, check, note, summary, installToasts, takeToasts, lookAt, pvBar, pvTap, screen, clip, dayInfo, STATE, DESK, PHONE, RESULTS } = L
const { fileInput } = W4
import { writeFileSync } from 'node:fs'
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const SAINT = 'imuf4y13gfkdyd8'     // Saint's "Dental appt", accepted onto published Tuesday's programme in the saved week

const inp = (page, pred) => page.evaluate(p => {
  const f = new Function('x', 'return ' + p)
  const x = window.INPUTS.find(y => f(y)); if (!x) return null
  const id = x.iid || x.id
  return { iid: id, acc: x.acc || 'fresh', date: x.date, rows: window.DAYS.map((d, i) => (d.ground || []).some(g => g && g.src === id) ? i : -1).filter(i => i >= 0) }
}, pred)
const dayDig = (page, di) => page.evaluate(i => JSON.stringify(window.DAYS[i]), di)
const nOf = s => +(((s || '').match(/(\d+)/) || [0, 0])[1])
async function takeOff(page, di, iid) {
  await board(page, di); await openInputs(page, di)
  const b = page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]:visible`).first()
  const had = await b.count()
  const label = had ? (await b.innerText()).trim() + ' / ' + (await b.getAttribute('title')) : 'NO BUTTON'
  if (had) { await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(700) }
  await closeBoard(page); await editWeek(page)
  return label
}
/* preview the issued version `re` of day di from the plans menu, then press Load once (arms when edits would be
   discarded) and read the bar; press again to confirm. Returns what each step read. */
async function load(page, di, re, P, tag) {
  const opened = await lookAt(page, di, re)
  const bar0 = await pvBar(page, di)
  await pvTap(page, di, 'data-restore')
  const bar1 = await pvBar(page, di)
  await clip(page, `${P}-L-${tag}-confirm`, `#eWeek .day[data-day="${di}"] .day-head`, { pad: 6, extraH: 140 })
  let bar2 = null
  if (bar1 && /confirm/.test(bar1.load || '')) { await pvTap(page, di, 'data-restore'); bar2 = await pvBar(page, di) }
  const toasts = await takeToasts(page)
  return { opened, bar0, bar1, bar2, toasts }
}

for (const w of which) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### item 6 — ${w} #####`)
  const { browser, page, errors } = await openHi({ ...W, state: STATE, dpr: w === 'phone' ? 3 : 1 })
  await installToasts(page); await editWeek(page)

  /* ---- A. an accepted request taken off, then the issued Original loaded back ---- */
  let h1 = await head(page, 1), s = await inp(page, `(x.iid||x.id)==='${SAINT}'`)
  check(`${P}.L1 fixture: Tue published ORIG, nothing pending; Saint's dental request on the programme (row on Tue)`, h1.tag.includes('ORIG') && !h1.pending && s && s.acc === 'g' && s.rows.includes(1), JSON.stringify({ tag: h1.tag, pend: h1.pending, s }))
  const btn = await takeOff(page, 1, SAINT)
  h1 = await head(page, 1); s = await inp(page, `(x.iid||x.id)==='${SAINT}'`)
  check(`${P}.L1 taken off the programme through the request's own button (${btn}): the row leaves Tue and the day reads pending`, s.acc !== 'g' && !s.rows.includes(1) && nOf(h1.pending) >= 1, JSON.stringify({ pend: h1.pending, s }))
  await clip(page, `${P}-L1-tue-request-taken-off`, `#eWeek .day[data-day="1"] .day-head`, { pad: 6, extraH: 60 })
  const pendBefore = nOf(h1.pending)
  const r = await load(page, 1, /Original/, P, 'A-orig')
  note(`${P}.L1 the load`, JSON.stringify(r))
  check(`${P}.L1 the preview opened on the issued Original with "Load onto working copy"`, r.opened && r.bar0 && /Load onto working copy/.test(r.bar0.load || ''), JSON.stringify(r.bar0))
  const nConfirm = nOf(r.bar1 && r.bar1.load)
  check(`${P}.L1 the first tap ARMS a confirm reading "Discard N edits & load — confirm", N counting the taken-off request (N = the head's ${pendBefore})`, r.bar1 && /Discard \d+ edits? & load — confirm/.test(r.bar1.load || '') && nConfirm === pendBefore && nConfirm >= 1, JSON.stringify(r.bar1))
  h1 = await head(page, 1); s = await inp(page, `(x.iid||x.id)==='${SAINT}'`)
  check(`${P}.L1 after the load: Saint's request is BACK on the programme (filed "g", its row on Tue)`, s.acc === 'g' && s.rows.includes(1), JSON.stringify(s))
  check(`${P}.L1 after the load: the day reads 0 pending — exactly the Original`, !h1.pending && h1.tag.includes('ORIG'), JSON.stringify({ tag: h1.tag, pend: h1.pending, nys: h1.nys }))
  check(`${P}.L1 the load's message says what happened (loaded, N replaced) and nothing about a request left as filed`, r.toasts.some(t => /Original loaded onto the working copy/.test(t) && /replaced/.test(t) && !/left as filed/.test(t)), JSON.stringify(r.toasts))
  const info = await dayInfo(page, 1)
  check(`${P}.L1 the ⓘ day panel agrees: no unpublished edits`, !/[1-9]\d* unpublished edit/.test(info), info.slice(0, 200))
  await clip(page, `${P}-L1-tue-after-load`, `#eWeek .day[data-day="1"] .day-head`, { pad: 6, extraH: 60 })
  /* the board strip agrees, and the request row reads accepted there */
  await board(page, 1); await openInputs(page, 1)
  const bh = await head(page, 1)
  const reqRow = await page.evaluate(id => { const b = document.querySelector(`#schedBoard [data-acck="${id}"]`); const row = b && (b.closest('.sb-arow, .sbi-row, tr, .pl-row') || b.parentElement); return row ? row.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) : 'NO ROW' }, SAINT)
  check(`${P}.L1 the board strip agrees: ORIG, nothing pending`, bh && bh.tag.includes('ORIG') && !bh.pending, JSON.stringify(bh && { tag: bh.tag, pend: bh.pending }))
  note(`${P}.L1 the request's row on the board after the load`, reqRow)
  await screen(page, `${P}-L1-board-after-load`)
  await closeBoard(page); await editWeek(page)

  if (w === 'desktop') {
    /* ---- B. a request filed AFTER the version: the load makes it fresh again ---- */
    const hexId = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex'))
    const f = await fileInput(page, { person: hexId, type: 'Other', from: '2026-07-14', span: 'custom', start: '10:00', end: '11:00', remarks: 'B3 LATE' })
    await takeToasts(page); await editWeek(page)
    let x = await inp(page, `x.remarks==='B3 LATE'`); h1 = await head(page, 1)
    note('d.L2 filed after the Original (Hex, Tue 10:00–11:00, "B3 LATE")', JSON.stringify({ f, x, pend: h1.pending }))
    check('d.L2 fixture: the late request landed on published Tue as a waiting change', x && x.acc === 'g' && x.rows.includes(1) && nOf(h1.pending) >= 1, JSON.stringify({ x, pend: h1.pending }))
    const r2 = await load(page, 1, /Original/, 'd', 'B-orig')
    x = await inp(page, `x.remarks==='B3 LATE'`); h1 = await head(page, 1)
    note('d.L2 the load', JSON.stringify(r2))
    check('d.L2 the confirm counted it ("Discard N edits", N ≥ 1)', r2.bar1 && /Discard [1-9]\d* edits? & load — confirm/.test(r2.bar1.load || ''), JSON.stringify(r2.bar1))
    check('d.L2 after loading the Original, the late request reads FRESH again (not filed, no row on Tue)', x && x.acc === 'fresh' && !x.rows.includes(1), JSON.stringify(x))
    check('d.L2 …and Tue reads 0 pending', !h1.pending, h1.pending)
    await clip(page, 'd-L2-tue-after-load-late-request', `#eWeek .day[data-day="1"] .day-head`, { pad: 6, extraH: 60 })
    await board(page, 1); await openInputs(page, 1)
    const lateRow = await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .pinp *')].find(n => n.children.length === 0 && /B3 LATE/.test(n.innerText || n.value || '')); const row = e && (e.closest('.sb-arow, .sbi-row') || e.parentElement); return row ? row.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : 'NOT LISTED' })
    note('d.L2 the late request on the board\'s Personal Inputs after the load', lateRow)
    await screen(page, 'd-L2-board-personal-inputs-after-load')
    await closeBoard(page); await editWeek(page)

    /* ---- C. a request covering TWO published days (Mon–Tue): a load of Monday leaves it as filed ---- */
    const talId = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Talisman'))
    const f3 = await fileInput(page, { person: talId, type: 'Other', from: '2026-07-13', to: '2026-07-14', span: 'all', remarks: 'B3 TWODAY' })
    await takeToasts(page); await editWeek(page)
    let y = await inp(page, `x.remarks==='B3 TWODAY'`)
    const h0 = await head(page, 0); h1 = await head(page, 1)
    note('d.L3 filed Mon–Tue (Talisman, all day, "B3 TWODAY")', JSON.stringify({ f3, y, mon: h0.pending, tue: h1.pending }))
    if (!y || y.acc === 'fresh' || !y.rows.length) {
      note('d.L3 could not make it through the app', 'the two-day request did not land on the programme of both days — see the note above; the Mon–Tue load was not walked with a landed request')
    }
    const tueBefore = await dayDig(page, 1), accBefore = y && y.acc, tuePend = h1.pending
    const r3 = await load(page, 0, /AL1/, 'd', 'C-mon-al1')
    y = await inp(page, `x.remarks==='B3 TWODAY'`)
    const tueAfter = await dayDig(page, 1), h0b = await head(page, 0), h1b = await head(page, 1)
    note('d.L3 the load of Monday AL1', JSON.stringify({ r3, y, mon: h0b.pending, tue: h1b.pending }))
    check('d.L3 loading Monday did NOT change Tuesday (its content and its pending count)', tueAfter === tueBefore && h1b.pending === tuePend, JSON.stringify({ same: tueAfter === tueBefore, tue: [tuePend, h1b.pending] }))
    check('d.L3 …nor the request\'s filing (left as filed)', y && y.acc === accBefore, JSON.stringify({ before: accBefore, after: y && y.acc }))
    check('d.L3 the load\'s message says the request was left as filed ("… also covers another day — left as filed")', r3.toasts.some(t => /1 request also covers another day — left as filed/.test(t)), JSON.stringify(r3.toasts))
    await clip(page, 'd-L3-mon-after-load', `#eWeek .day[data-day="0"] .day-head`, { pad: 6, extraH: 60 })
  }
  check(`${P}.L: no browser errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
const f = summary('b3-02-load')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-02.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = f ? 1 : 0
