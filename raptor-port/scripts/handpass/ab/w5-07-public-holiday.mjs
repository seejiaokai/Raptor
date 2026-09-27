/* W5 — a PUBLIC HOLIDAY declared on the war's event row AFTER the leave / AFTER publishing (Fable S38). Assertions of the
   RIGHT behaviour.
   Rules: the charge rules (charge.ts — a weekend or PH day charges no leave unless a pilot's run of 15+; figures read the
   records, so declaring a PH gives the day back AT ONCE), D2 / R-1 (only the issued schedule earns OIL, both directions: a
   holiday declared after publishing WAITS for a republication, and the day says so — "Became a holiday after publishing —
   republish for its OIL", OIL_STALE_DAY), D21 (only "PH" makes a day earn; the Off day does not).
     (a) an approved LL on a WEEKDAY (Wed 22 Jul), then PH on that day: +LVE gives the day back at once; undo / redo / reload;
     (b) an approved LL on a SATURDAY (25 Jul), then PH there: nothing to give back (a weekend charges nothing) — RECORD;
     (c) Friday 17 Jul PUBLISHED with men at work, then PH on 17 Jul: the day says its OIL waits for a republication, and no
         credit lands until it is published again.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-07-public-holiday.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, shot, toastSpy, toasts, resultBook, ROOT, lwShot, bidOn, go, board, closeBoard, signDay, publishAL, publishDay } = L
const { undo, redo, reload, snap } = X
const PHONE = W === 'phone'
const R = resultBook(`W5-07-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-07-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w5-07-${W}-THREW-${name}`).catch(() => {}) } }
const pic = n => `w5-07-${W}-${n}`
const P = 'bane'
const lve = s => s && s.figs ? +s.figs.lve : NaN

/** Declare PH on the war's first event line for one date, through the event sheet (tap → type PH → Save). */
async function declarePH(iso, word = 'PH') {
  await lwOpen(page, iso)
  const c = page.locator(`[data-testid="event-0-${iso}"]`).first()
  if (!(await c.count())) return { done: false, why: 'no event cell for ' + iso }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
  await c.click(); await page.waitForTimeout(500)
  const t = page.locator('[data-testid="event-text"]')
  if (!(await t.count())) return { done: false, why: 'the event sheet did not open' }
  await t.fill(word); await page.waitForTimeout(150)
  const tag = await page.evaluate(() => ((document.querySelector('[data-testid="event-tag-current"]') || {}).innerText || '').trim())
  await page.locator('[data-testid="event-apply"]').click(); await page.waitForTimeout(700)
  const cell = await page.evaluate(d => ((document.querySelector(`[data-testid="event-0-${d}"]`) || {}).innerText || '').trim(), iso)
  return { done: true, tag, cell }
}
/** Approve a whole-day LL for P on iso (bid, then the one window's Approve). */
async function approvedLeave(iso) {
  const b = await bidOn(page, P, iso, 'LL')
  const t = await tapCell(page, P, iso)
  const a = await sheetPress(page, 'decide-approve')
  await closeSheets(page)
  return { bid: b.placed, approved: a.pressed }
}
const dayPanel = async (di) => {
  await L.editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] .dinfobtn[data-dayinfo="${di}"]:visible`).first()
  if (!(await b.count())) return 'no ⓘ'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(500)
  const txt = await page.evaluate(() => ((document.querySelector('#dayPop:not([hidden])') || {}).innerText || '').replace(/\s+/g, ' ').trim())
  await shot(page, pic(`panel-day${di}`))
  const c = page.locator('#dayPopClose:visible').first(); if (await c.count()) { await c.click(); await page.waitForTimeout(300) }
  return txt
}

/* (a) weekday */
await step('a-weekday-ph-after-approved-leave', async () => {
  const D = '2026-07-22'
  await lwOpen(page, D)
  const s0 = await snap(page, P, [D])
  const a = await approvedLeave(D)
  const s1 = await snap(page, P, [D])
  const ph = await declarePH(D)
  const s2 = await snap(page, P, [D])
  await lwShot(page, pic('a1-weekday-ph-over-leave'), P, D)
  R.ck('a-charge-excused', a.bid && a.approved && lve(s1) === lve(s0) - 1 && ph.done && lve(s2) === lve(s0),
    'an approved LL on Wed 22 Jul charges 1; declaring PH on that day gives it back AT ONCE', { approve: a, ph, lve: [lve(s0), lve(s1), lve(s2)], run: [s1.run, s2.run] })
  const u = await undo(page); const su = await snap(page, P, [D])
  R.ck('a-undo', u.pressed && lve(su) === lve(s1), 'Undo takes the PH back — the day charges again', { undo: u, lve: lve(su) })
  const r = await redo(page); const sr = await snap(page, P, [D])
  R.ck('a-redo', r.pressed && lve(sr) === lve(s0), 'Redo declares it again — excused', { redo: r, lve: lve(sr) })
  const rl = await reload(page, 'a'); await lwOpen(page, D); const sl = await snap(page, P, [D])
  R.ck('a-reload', lve(sl) === lve(s0), 'a reload keeps the PH and the excused charge', { rl, lve: lve(sl) })
})
/* (b) Saturday */
await step('b-saturday-ph-after-approved-leave', async () => {
  const D = '2026-07-25'
  await lwOpen(page, D)
  const s0 = await snap(page, P, [D])
  const a = await approvedLeave(D)
  const s1 = await snap(page, P, [D])
  const ph = await declarePH(D)
  const s2 = await snap(page, P, [D])
  await lwShot(page, pic('b1-saturday-ph-over-leave'), P, D)
  R.note('b-saturday-RECORD', { approve: a, ph, lve: [lve(s0), lve(s1), lve(s2)], note: 'a Saturday charges nothing for a run under 15 days, so the PH has nothing to give back' })
  R.ck('b-no-charge-either-way', lve(s1) === lve(s0) && lve(s2) === lve(s0), 'the Saturday leave charged nothing and the PH changes nothing', { lve: [lve(s0), lve(s1), lve(s2)] })
})
/* (c) a PH declared after Friday is published */
await step('c-ph-after-publishing', async () => {
  const FRI = 4, D = '2026-07-17'
  /* the demo Friday flies no waves: the men at work are on its duty desks, sims and ground rows (READ, for the table) */
  const workers = await page.evaluate(di => { const d = window.DAYS[di], P = window.PEOPLE, out = new Set()
    d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) out.add(a.p); if (a.w) out.add(a.w) })))
    ;(d.dutywaves || []).forEach(b => b.rows.forEach(r => { if (r.id) out.add(r.id) }))
    ;(d.ground || []).forEach(g => g.who && out.add(g.who))
    return [...out].filter(k => P[k] && (P[k].seat === 'FCP' || P[k].seat === 'RCP')).slice(0, 4) }, FRI)
  const pub = await S.pubAndSign(page, FRI)
  await lwOpen(page, D)
  const before = {}; for (const w of workers) before[w] = (await snap(page, w, [D])).run[0]
  const ph = await declarePH(D)
  const after = {}; for (const w of workers) after[w] = (await snap(page, w, [D])).run[0]
  await lwShot(page, pic('c1-war-after-ph-on-published-friday'), workers[0], D)
  const panelTxt = await dayPanel(FRI)
  const c = await S.counts(page, FRI)
  await board(page, FRI)
  const hd = await L.head(page, FRI)
  await shot(page, pic('c2-board-after-ph'))
  await closeBoard(page)
  R.ck('c-oil-waits', pub.pub.p.pressed && ph.done && workers.length > 0 && Object.values(after).every(x => !/FO|HO/.test(x)) && /republish|publish it again/i.test(panelTxt),
    'PH on a published Friday: no OIL lands yet, and the day says it waits for a republication (D2, OIL_STALE_DAY)', { workers, before, after, panel: panelTxt.slice(0, 500) })
  R.note('c-counts-and-head', { n: c.n, signs: c.signs, head: hd })
  /* republish the way the head offers it */
  await board(page, FRI)
  await signDay(page, FRI, 0)
  let rp = await publishAL(page, FRI)
  if (!rp.pressed) rp = await publishDay(page, FRI)
  await closeBoard(page)
  await lwOpen(page, D)
  const again = {}; for (const w of workers) again[w] = (await snap(page, w, [D])).run[0]
  await lwShot(page, pic('c3-war-after-republish'), workers[0], D)
  R.ck('c-republish-lands', rp.pressed && Object.values(again).some(x => /FO|HO/.test(x)), 'publishing again (AL1) lands the OIL for the men at work on the new holiday', { how: rp, before: after, after: again })
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
