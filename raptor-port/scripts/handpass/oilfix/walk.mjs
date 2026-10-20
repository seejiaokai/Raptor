/* The OIL batch's walk (20 Oct 26) — the exact production build, driven through the app's own controls, written as
   assertions of the RIGHT behaviour (a PASS means correct), pictures to disk. Run against a served build:
     HP_SHOTS=<dir> node scripts/handpass/oilfix/walk.mjs [part]      part: Z | U | all (default)
   Z — [OIL-ZERO-SPAN-SORTIE]: a Saturday flying line with take-off = landing = its own rally, the Logic page's debrief
       set to 0 → the day's warning list, the marked box's words on the board and the week, OIL Earn, the publish note;
       then the debrief back → the D49 words return. Desktop 1440 and phone 390.
   U — [UNPUB-WARN-AL-RESTORES]: the Saturday SDO desk (plasma) published, his OIL drawn down by a −1 correction in the
       OIL tracker's own bar, then the real Unpublish button pressed — the Original; an AL1 withdrawn to a HIGHER credit
       (no warning); to a LOWER one (two taps, the amendment's words, the armed button's own words); the Leave War's
       cell read after each. Desktop 1440; the lower case also at phone 390. */
import { open, go, board, closeBoard, put, publish, warnings, oilMode, shot } from '../lib.mjs'

const PART = (process.argv[2] || 'all').toUpperCase()
const results = []
const check = (name, ok, info) => { results.push({ name, ok: !!ok, info }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info !== undefined ? ' — ' + JSON.stringify(info).slice(0, 400) : '')) }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const SAT = 5, ISO = '2026-07-18'

async function toastNow(page) { return page.evaluate(() => ((document.getElementById('toastEl') || {}).innerText || '').replace(/\s+/g, ' ').trim()) }
async function fld(page, f, v) {
  const l = page.locator(`#schedBoard [data-bfld="${f}"]:visible`).first()
  await l.click(); await l.fill(v); await l.press('Tab'); await sleep(350)
}
async function logicSet(page, key, v) {
  await go(page, 'logic')
  if (await page.locator('#lgEdit:visible').count()) await page.locator('#lgEdit').click()
  const box = page.locator(`[data-lgset="${key}"]`).first()
  await box.scrollIntoViewIfNeeded()
  const was = await box.inputValue()
  await box.click(); await box.fill(v); await box.press('Tab'); await sleep(500)
  const now = await page.locator(`[data-lgset="${key}"]`).first().inputValue()
  if (await page.locator('#lgDone:visible').count()) { await page.locator('#lgDone').click(); await sleep(300) }
  if (await page.locator('#lgDone:visible').count()) { await page.locator('#lgDone').click(); await sleep(300) }   // [LOGIC-DONE-FIRST-PRESS]
  return { was, now }
}
async function lwCellNow(page, who) {
  await go(page, 'leavewar'); await sleep(900)
  const mon = page.locator('[data-testid="month-JUL"]')
  if (await mon.count()) { await mon.first().click(); await sleep(900) }
  /* the grid's own star after an earned credit's code ("FO*") is dropped: the check is the code */
  return page.evaluate(([w, d]) => { const c = document.querySelector(`[data-testid="cell-${w}-${d}"]`); return c ? (c.innerText || '').trim().replace(/\*$/, '') : 'NO CELL' }, [who, ISO])
}
async function correction(page, who, amt) {
  await go(page, 'leavewar'); await sleep(700)
  await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await sleep(1100)
  const nm = page.locator(`[data-testid="oil-name-${who}"]`).first()
  await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await sleep(400)
  await page.locator('[data-testid="oil-sign"]').click()
  await page.fill('[data-testid="oil-amt"]', String(amt))
  await page.fill('[data-testid="oil-reason"]', 'walk: OIL spent')
  await page.locator('[data-testid="oil-credit-save"]').click(); await sleep(600)
  const bal = await page.locator(`[data-testid="oil-row-${who}"]`).innerText()
  await page.locator('[data-testid="oil-close"]:visible').first().click(); await sleep(400)
  return bal.replace(/\s+/g, ' ').slice(0, 80)
}
async function unpubPress(page, onBoard = false) {
  const root = onBoard ? '#schedBoard' : '#eWeek'
  if (onBoard) await board(page, SAT); else { await go(page, 'editsched'); await sleep(500) }
  const b = page.locator(`${root} [data-unpub="${SAT}"]:visible`).first()
  await b.scrollIntoViewIfNeeded()
  const title = await b.getAttribute('title')
  await b.click(); await sleep(500)
  const said = await toastNow(page)
  /* the note is seen, not only written: inside the screen and fully shown (it takes no presses, so the element under its
     middle is what lies beneath it — the pictures show it drawn over the week and the Board) */
  const seen = await page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return false; const r = t.getBoundingClientRect(), cs = getComputedStyle(t); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.5 })
  if (said) check('the note is in the screen and shown' + (onBoard ? ' (over the Board)' : ''), seen)
  const after = page.locator(`${root} [data-unpub="${SAT}"]:visible`).first()
  const armedTitle = (await after.count()) ? await after.getAttribute('title') : null
  const face = (await after.count()) ? (await after.innerText()).trim() : null
  return { titleBefore: title, said, armedTitle, face }
}
const verOf = page => page.evaluate(d => window.verLabel(window.dayCurVer(d)), SAT)

/* ───────────────────────────── Z ───────────────────────────── */
async function partZ(label, width, height) {
  const { browser, page, errors } = await open({ width, height, fresh: true })
  const lg = await logicSet(page, 'debrief', '0')
  check(`Z ${label}: Logic's debrief set to nothing`, /^0/.test(lg.now) || lg.now === '0' || lg.now === '00:00', lg)
  await board(page, SAT)
  await page.locator(`#schedBoard [data-wvadd="${SAT}"]`).first().click(); await sleep(500)
  await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
  for (const [k, v] of [['cs', 'RAP 1'], ['to', '09:00'], ['ld', '09:00'], ['rl', '09:00']]) await fld(page, `ff:${SAT}.0.0.${k}`, v)
  const seated = await put(page, `[data-slot="${SAT}.0.0.0.p"]`, ['bane', 'reaper', 'anvil'])
  check(`Z ${label}: a pilot seated on the line`, !String(seated).startsWith('FAILED'), seated)
  await sleep(500)
  let all
  if (label === 'phone') {
    const head = page.locator('#schedBoard').getByText(/\d+ issues?/).first()
    await head.click(); await sleep(600)
    all = (await page.locator('#schedBoard').innerText()).replace(/\s+/g, ' ')
    await shot(page, 'Z-phone-issues-open')
  } else all = (await warnings(page)).lines.join(' | ')
  check(`Z ${label}: the advisory says the line earns nobody any OIL`, /RAP 1 takes off and lands at the same time \(09:00\).*earns nobody any OIL/.test(all), all)
  check(`Z ${label}: the advisory no longer promises the report and debrief`, !/still earns from the report and debrief/.test(all), all)
  check(`Z ${label}: the day's no-usable-times warning names the line`, /RAP 1 line has no usable times/.test(all), all)
  const boxTitle = await page.evaluate(d => { const b = document.querySelector(`#schedBoard [data-warnkey="ff:${d}.0.0.ld"]`); return b ? b.getAttribute('title') : null }, SAT)
  check(`Z ${label}: the board's marked box says the same`, /earns nobody any OIL/.test(boxTitle || ''), boxTitle)
  await shot(page, `Z-${label}-board`)
  if (label === 'desk') {
    const om = await oilMode(page, true)
    const sw = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => (e.getAttribute('title') || e.innerText || '').slice(0, 80)))
    check('Z desk: OIL Earn offers no switch on the line that measures nothing (D31)', !sw.some(t => /RAP 1/.test(t)), { items: om.items, sw })
    await shot(page, 'Z-desk-oilearn')
    await oilMode(page, false)
  }
  await closeBoard(page)
  await go(page, 'editsched'); await sleep(500)
  const weekTitle = await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-warnkey="ff:${d}.0.0.ld"]`); return b ? b.getAttribute('title') : null }, SAT)
  check(`Z ${label}: the week's marked box says the same`, /earns nobody any OIL/.test(weekTitle || ''), weekTitle)
  await shot(page, `Z-${label}-week`)
  if (label === 'desk') {
    await board(page, SAT)
    const pub = await publish(page, SAT)
    await sleep(300)
    const said = await toastNow(page)
    check('Z desk: published, and the note names the line among those that earn nobody', pub.published && /RAP 1 line/.test(said), { pub, said })
    await shot(page, 'Z-desk-published')
    await closeBoard(page)
    /* the control: the debrief back → D49's words return, the line leaves the list */
    const lg2 = await logicSet(page, 'debrief', lg.was)
    await board(page, SAT)
    const w2 = (await warnings(page)).lines.join(' | ')
    check('Z desk: debrief back — the advisory says the day still earns from the report and debrief (D49)', /still earns from the report and debrief/.test(w2), { lg2, w2 })
    check('Z desk: debrief back — the no-usable-times warning no longer names the line', !/RAP 1 line has no usable times/.test(w2), w2)
    await shot(page, 'Z-desk-control')
  }
  check(`Z ${label}: no page errors`, !errors.length, errors)
  await browser.close()
}

/* ───────────────────────────── U ───────────────────────────── */
async function partU(label, width, height, cases) {
  for (const c of cases) {
    const { browser, page, errors } = await open({ width, height, fresh: true })
    const tag = `U ${label} ${c.name}`
    await board(page, SAT)
    await fld(page, `dr:${SAT}.0.0.end`, c.orig)
    const p1 = await publish(page, SAT)
    await closeBoard(page)
    const cell0 = await lwCellNow(page, 'plasma')
    check(`${tag}: the Original published and credited`, p1.published && cell0 === c.origCell, { p1, cell0 })
    if (c.al) {
      await board(page, SAT)
      await fld(page, `dr:${SAT}.0.0.end`, c.al)
      const p2 = await publish(page, SAT)
      await closeBoard(page)
      const cell1 = await lwCellNow(page, 'plasma')
      check(`${tag}: AL1 published and credited`, p2.published && (await verOf(page)) === 'AL1' && cell1 === c.alCell, { p2, cell1 })
    }
    const bal = await correction(page, 'plasma', 1)
    check(`${tag}: his OIL drawn down by a −1 correction (the tracker's own bar)`, true, bal)
    const t1 = await unpubPress(page, !!c.onBoard)
    await shot(page, `U-${label}-${c.name}-tap1`)
    if (c.warns) {
      check(`${tag}: the first tap only warns, in its case's words`, t1.said === c.warn && (await verOf(page)) === (c.al ? 'AL1' : 'Original'), t1)
      check(`${tag}: the armed button says the same case`, t1.armedTitle === c.armed && t1.face === 'Withdraw — confirm', { armedTitle: t1.armedTitle, face: t1.face })
      const t2 = await unpubPress(page, !!c.onBoard)
      if (c.onBoard) await closeBoard(page)
      await shot(page, `U-${label}-${c.name}-tap2`)
      check(`${tag}: the second tap withdraws and says what the war now credits`, t2.said === c.done, t2.said)
    } else {
      check(`${tag}: one tap withdraws, no warning, no OIL sentence`, t1.said === c.done && (await verOf(page)) === 'Original', t1)
    }
    if (!c.warns && c.onBoard) await closeBoard(page)
    const cell2 = await lwCellNow(page, 'plasma')
    check(`${tag}: the Leave War now holds what the warning reckoned`, cell2 === c.after, cell2)
    await shot(page, `U-${label}-${c.name}-war`)
    check(`${tag}: no page errors`, !errors.length, errors)
    await browser.close()
  }
}
const FULL = '18:00', HALF = '12:00'
const CASES = [
  { name: 'original', orig: FULL, origCell: 'FO', warns: true,
    warn: 'Some of Saturday’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm.',
    armed: 'Withdraw Original on Saturday. Its OIL credits are already spent on the Leave War, and republishing restores them. Tap to confirm.',
    done: 'Saturday unpublished. It is a draft again, and publishing reissues the Original. Its OIL credits are withdrawn from the Leave War until it is republished.',
    after: '' },
  { name: 'al-higher', orig: FULL, origCell: 'FO', al: HALF, alCell: 'HO', warns: false,
    done: 'Saturday: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1.',
    after: 'FO' },
  { name: 'al-lower', orig: HALF, origCell: 'HO', al: FULL, alCell: 'FO', warns: true,
    warn: 'Withdrawing AL1 brings back the Original’s OIL for Saturday. Some of AL1’s OIL credits are already spent on the Leave War, and the Original credits less. Tap again to confirm.',
    armed: 'Withdraw AL1 on Saturday. The Original’s OIL comes back, and some of AL1’s is already spent on the Leave War. Tap to confirm.',
    done: 'Saturday: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1. The Leave War credits the Original’s OIL for the day until AL1 is republished.',
    after: 'HO' },
]

if (PART === 'Z' || PART === 'ALL') { await partZ('desk', 1440, 900); await partZ('phone', 390, 844) }
if (PART === 'U' || PART === 'ALL') { await partU('desk', 1440, 900, CASES); await partU('phone', 390, 844, CASES.filter(c => c.name === 'al-lower'))
  const onB = CASES.filter(c => c.name === 'al-lower').map(c => ({ ...c, name: 'al-lower-board', onBoard: true }))
  await partU('desk', 1440, 900, onB); await partU('phone', 390, 844, onB) }
const bad = results.filter(r => !r.ok)
console.log(`\n${results.length - bad.length}/${results.length} PASS`)
process.exit(bad.length ? 1 : 0)
