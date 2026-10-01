/* W3 part I — the scenario designer's no. 14: an OIL award and a correction, desktop 1440×900, one fresh demo world,
   the admin, on Warden (no award on the days used). Each save is one L.step — ONE `leavewar/ledger:<id>` row (plus its
   history line), never a war record — and a reload after which the grid and the OIL tracker say the same thing.
     I1  the OIL tracker: credit Warden 1 day (today, 30 Sep 26), a reason, given by
     I2  the tracker: tap the credit → change days (0.5), reason, given by → Save  (its date is shown, never editable — D260)
     I3  the tracker: Delete (asks once)
     I4  the grid: +OIL on Warden 10 Mar (1 day) and an LL bid beside it
     I5  the grid: the day's list → the award's Edit… → 0.5 day, a new reason → Save
     I6  the grid: the day's list → Delete the award (the bid stays)
     I7  the grid: +OIL on Warden 12 Mar alone → the one-day sheet's Remove
     I8  the tracker: a CORRECTION (−1, a reason), then its date moved to 29 Sep, then deleted
   Run from scripts/handpass:  node dbrA-W3-i.mjs */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-i.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, bidOn, cells, lwReload, pic, row, rowsSummary } = W
const EL = /^settings\/elog:/
const LED = /^leavewar\/ledger:/

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
const passNow = (from) => L.results.slice(from).every(r => r.ok)
async function run(name, fn) {
  try { await fn() } catch (e) {
    L.check(`${name} — the step ran`, false, 'THREW ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 400))
    await pic(page, `I-THREW-${name}`).catch(() => {})
    row({ step: name, width: 'desktop', did: 'THREW', screen: String(e && e.message || e).slice(0, 200), rows: '', ok: false })
    await closeTracker().catch(() => {}); await closeSheets(page).catch(() => {})
  }
}
const P = 'nact', TODAY = '2026-09-30'
async function openTracker() { await lwOpen(page, TODAY); await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await L.sleep(1300) }
async function closeTracker() { const x = page.locator('[data-testid="oil-close"]:visible').first(); if (await x.count()) { await x.click(); await L.sleep(500) } }
/** Warden's row in the tracker: his balance and every box it draws */
async function trackerRow() {
  await openTracker()
  const r = await page.evaluate(p => {
    const row = document.querySelector(`[data-testid="oil-row-${p}"]`)
    if (!row) return { bal: 'NO ROW' }
    row.scrollIntoView({ block: 'center' })
    return { bal: (row.querySelector(`[data-testid="oil-bal-${p}"]`) || {}).textContent, boxes: [...row.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => `${e.getAttribute('data-testid').slice(10)}|${(e.innerText || '').replace(/\s+/g, ' ').trim()}`) }
  }, P)
  await closeTracker()
  return r
}
/* a credit's box in Warden's tracker row, found by its ledger id: the box itself names it on its delete button once
   open, but closed it carries the credit's own id — so it is found by what the ledger row says (its reason) */
let REASON = {}
const entry = id => page.locator(`[data-testid="oil-row-${P}"] [data-testid^="oil-entry-"]`).filter({ hasText: REASON[id] || id }).first()
const ledgerOf = r => Object.entries(r).filter(([k]) => LED.test(k)).map(([k, v]) => ({ key: k, ...JSON.parse(v) })).filter(e => e.personId === P)
/** one OIL save: its rows (a ledger row + history line only, ONE batch, no war record), a reload, the grid and the tracker */
async function oil(name, did, fn, { put = [], del = [] } = {}, dates = [TODAY]) {
  const k0 = L.results.length
  const a = await L.step(page, name, fn, { put, del, also: [LED, EL], only: true })
  L.check(`${name} — one ledger row (and its history line), ONE batch, no war record`, a.put.filter(k => LED.test(k)).length + a.del.filter(k => LED.test(k)).length === 1 && !a.put.some(k => k.startsWith('leavewar/rec:')) && a.batches.length === 1, { put: a.put, del: a.del, batches: a.batches, ret: a.ret })
  const rr = await lwReload(page, name, 'a', dates.map(d => [P, d]))
  const tr = await trackerRow()
  await lwOpen(page, dates[0]); await page.locator(`[data-testid="cell-${P}-${dates[0]}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await pic(page, `I-${name.split(' ')[0]}-after-reload`)
  return { a, rr, tr, k0, did, name }
}
const line = r => row({ step: r.name, width: 'desktop', did: r.did, screen: `grid ${JSON.stringify(Object.fromEntries(Object.entries(r.rr.after).map(([k, v]) => [k, v.text])))} · tracker bal ${r.tr.bal} boxes ${JSON.stringify(r.tr.boxes)}`, rows: rowsSummary(r.a), ok: passNow(r.k0) })

await L.signIn(page, 'a')
await L.settle(page)
{
  const r0 = await L.rows(page)
  const b = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r0[k]))
  const ok = L.check('I0 first boot — ONE change-log batch, of type boot', b.length === 1 && b[0].type === 'boot', b.map(x => ({ type: x.type, n: (x.items || []).length })))
  row({ step: 'I0 first boot', width: 'desktop', did: 'fresh world, Saber', screen: '—', rows: `batches ${b.map(x => x.type + '/' + (x.items || []).length).join(' ')}`, ok, pics: [] })
}
let L1 = null
await run('I1', async () => {
  const r = await oil('I1 tracker: credit Warden 1 day, today', 'OIL tracker → tap Warden → 1, reason "I award", given by "OC Ops" → Save', async () => {
    await openTracker()
    const nm = page.locator(`[data-testid="oil-name-${P}"]`).first(); await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await L.sleep(400)
    await page.fill('[data-testid="oil-amt"]', '1'); await page.fill('[data-testid="oil-reason"]', 'I award'); await page.fill('[data-testid="oil-given"]', 'OC Ops')
    await page.locator('[data-testid="oil-credit-save"]').click(); await L.sleep(700)
    await closeTracker()
  }, { put: [LED] })
  L1 = r.a.put.find(k => LED.test(k)); REASON[L1.slice(16)] = 'I award'
  L.check('I1 — the grid shows FO on 30 Sep and the tracker a +1 box "I award" (they agree)', /FO/.test(r.rr.after[`${P}@${TODAY}`].text) && r.tr.boxes.some(b => /\+1.*30 Sep.*I award/.test(b)), { grid: r.rr.after, tracker: r.tr })
  line(r)
})
await run('I2', async () => {
  const id = L1.slice('leavewar/ledger:'.length)
  let dateIsInput = null
  const r = await oil('I2 tracker: edit the award — 0.5 day, reason, given by', 'OIL tracker → tap the credit → 0.5, "I award edited", "OC Flying" → Save', async () => {
    await openTracker()
    await entry(id).click(); await L.sleep(400)
    dateIsInput = await page.locator('[data-testid="oil-edit-date"]').evaluate(e => e.tagName !== 'SPAN')
    await page.fill('[data-testid="oil-edit-amt"]', '0.5'); await page.fill('[data-testid="oil-edit-reason"]', 'I award edited'); await page.fill('[data-testid="oil-edit-given"]', 'OC Flying')
    await pic(page, 'I2-tracker-edit')
    await page.locator('[data-testid="oil-edit-save"]').click(); await L.sleep(600)
    await closeTracker()
  }, { put: [LED] })
  const e = JSON.parse((await L.rows(page))[L1])
  L.check('I2 — the SAME ledger row now 0.5 day, the new reason and given by; its date unchanged and shown read-only (D260)', r.a.put.includes(L1) && e.amount === 0.5 && e.reason === 'I award edited' && e.givenBy === 'OC Flying' && e.date === TODAY && dateIsInput === false, { e, dateIsInput })
  L.check('I2 — the grid shows HO on 30 Sep and the tracker a +0.5 box (they agree)', /HO/.test(r.rr.after[`${P}@${TODAY}`].text) && r.tr.boxes.some(b => /\+0\.5.*I award edited/.test(b)), { grid: r.rr.after, tracker: r.tr })
  line(r)
})
await run('I3', async () => {
  const id = L1.slice('leavewar/ledger:'.length)
  const r = await oil('I3 tracker: delete the award', 'OIL tracker → tap the credit → Delete → Really delete?', async () => {
    await openTracker()
    await entry(id).click(); await L.sleep(400)
    await page.locator(`[data-testid="oil-del-${id}"]`).click(); await L.sleep(300)
    await page.locator(`[data-testid="oil-del-${id}"]`).click(); await L.sleep(600)
    await closeTracker()
  }, { del: [LED] })
  L.check('I3 — its row removed; the grid empty on 30 Sep and the tracker without the box (they agree)', r.a.del.includes(L1) && r.rr.after[`${P}@${TODAY}`].text === '' && !r.tr.boxes.some(b => /I award/.test(b)), { grid: r.rr.after, tracker: r.tr })
  line(r)
})
const D4 = '2026-03-10'
let L4 = null
await run('I4', async () => {
  const r = await oil('I4 grid: +OIL on Warden 10 Mar (1 day)', 'tap Warden 10 Mar → +OIL, "I grid award", 1 → Give FO', async () => {
    await tapCell(page, P, D4); await sheetPress(page, 'bid-oil')
    await page.fill('[data-testid="oil-why"]', 'I grid award'); await page.fill('[data-testid="oil-days"]', '1')
    await sheetPress(page, 'oil-give'); const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
  }, { put: [LED] }, [D4])
  L4 = r.a.put.find(k => LED.test(k))
  L.check('I4 — the grid shows FO on 10 Mar and the tracker a +1 box on 10 Mar (they agree)', /FO/.test(r.rr.after[`${P}@${D4}`].text) && r.tr.boxes.some(b => /\+1.*10 Mar.*I grid award/.test(b)), { grid: r.rr.after, tracker: r.tr })
  line(r)
  /* and a bid beside it, so the day holds two records and the day's list is where the award is edited */
  await L.step(page, 'I4 an LL bid beside the award (10 Mar)', async () => bidOn(page, P, D4, 'LL'), { put: [/^leavewar\/rec:/], only: true })
})
await run('I5', async () => {
  const id = L4.slice('leavewar/ledger:'.length)
  const r = await oil('I5 grid: the day\'s list → the award\'s Edit… → 0.5 day, new reason → Save', 'tap Warden 10 Mar → the day\'s list → Edit… on the award → 0.5, "I grid edited" → Save', async () => {
    const t = await tapCell(page, P, D4)
    const ed = t.buttons.find(b => /^dl-oil-edit-/.test(b)); const rid = ed ? ed.split(':')[0].slice('dl-oil-edit-'.length) : null
    await sheetPress(page, `dl-oil-edit-${rid}`)
    await page.fill(`[data-testid="oil-edit-days-${rid}"]`, '0.5'); await page.fill(`[data-testid="oil-edit-why-${rid}"]`, 'I grid edited')
    await pic(page, 'I5-daylist-edit')
    await page.locator(`[data-testid="oil-edit-save-${rid}"]`).click(); await L.sleep(600)
    const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, lines: t.lines, rid }
  }, { put: [LED] }, [D4])
  const e = JSON.parse((await L.rows(page))[L4])
  L.check('I5 — the SAME ledger row now 0.5 day and the new reason; the grid HO on 10 Mar and the tracker +0.5 (they agree)', r.a.put.includes(L4) && e.amount === 0.5 && e.reason === 'I grid edited' && /HO/.test(r.rr.after[`${P}@${D4}`].text) && r.tr.boxes.some(b => /\+0\.5.*I grid edited/.test(b)), { e, grid: r.rr.after, tracker: r.tr, ret: r.a.ret })
  line(r)
})
await run('I6', async () => {
  const r0 = await L.rows(page)
  const bidKey = Object.keys(r0).find(k => k.startsWith('leavewar/rec:') && JSON.parse(r0[k]).pid === P && JSON.parse(r0[k]).date === D4)
  const r = await oil('I6 grid: the day\'s list → Delete the award', 'tap Warden 10 Mar → the day\'s list → Delete on the award line', async () => {
    const t = await tapCell(page, P, D4)
    const first = t.buttons.find(b => /^dl-clear-/.test(b)); const btn = first ? first.split(':')[0] : null
    let p = await sheetPress(page, btn); let s = await sheetNow(page)
    if (s.open !== 'nothing' && s.buttons.some(b => b.startsWith(btn) && /sure/i.test(b))) { p = await sheetPress(page, btn); s = await sheetNow(page) }
    if (s.open !== 'nothing') await closeSheets(page)
    return { lines: t.lines, btn }
  }, { del: [LED] }, [D4])
  const r1 = await L.rows(page)
  L.check('I6 — the award\'s row removed, the bid\'s row untouched; the grid shows the LL only and the tracker no 10 Mar box', r.a.del.includes(L4) && bidKey && r1[bidKey] === r0[bidKey] && /LL/.test(r.rr.after[`${P}@${D4}`].text) && !/FO|HO/.test(r.rr.after[`${P}@${D4}`].text) && !r.tr.boxes.some(b => /10 Mar/.test(b)), { grid: r.rr.after, tracker: r.tr, ret: r.a.ret })
  line(r)
})
const D7 = '2026-03-12'
await run('I7', async () => {
  const g = await oil('I7a grid: +OIL on Warden 12 Mar, alone', 'tap Warden 12 Mar → +OIL, "I lone award" → Give FO', async () => {
    await tapCell(page, P, D7); await sheetPress(page, 'bid-oil')
    await page.fill('[data-testid="oil-why"]', 'I lone award'); await page.fill('[data-testid="oil-days"]', '1')
    await sheetPress(page, 'oil-give'); const s = await sheetNow(page); if (s.open !== 'nothing') await closeSheets(page)
  }, { put: [LED] }, [D7])
  line(g)
  const key = g.a.put.find(k => LED.test(k))
  const r = await oil('I7b grid: the one-day sheet\'s Remove', 'tap Warden 12 Mar → +OIL → Remove', async () => {
    const t = await tapCell(page, P, D7)
    if (!(await page.locator('[data-testid="oil-clear"]:visible').count())) await sheetPress(page, 'bid-oil')
    await pic(page, 'I7-oneday-remove')
    let p = await sheetPress(page, 'oil-clear'); let s = await sheetNow(page)
    if (s.open !== 'nothing' && await page.locator('[data-testid="oil-clear"]:visible').count() && /sure/i.test(await page.locator('[data-testid="oil-clear"]:visible').innerText())) { await sheetPress(page, 'oil-clear'); s = await sheetNow(page) }
    if (s.open !== 'nothing') await closeSheets(page)
    return { opened: t.open, buttons: t.buttons }
  }, { del: [LED] }, [D7])
  L.check('I7 — Remove took the award\'s row away; the grid and the tracker both clear on 12 Mar', r.a.del.includes(key) && r.rr.after[`${P}@${D7}`].text === '' && !r.tr.boxes.some(b => /12 Mar/.test(b)), { grid: r.rr.after, tracker: r.tr, ret: r.a.ret })
  line(r)
})
await run('I8', async () => {
  const c = await oil('I8a tracker: a correction of −1 day, today', 'OIL tracker → tap Warden → − → 1, reason "I correction" → Save', async () => {
    await openTracker()
    const nm = page.locator(`[data-testid="oil-name-${P}"]`).first(); await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await L.sleep(400)
    await page.locator('[data-testid="oil-sign"]').click(); await L.sleep(150)
    await page.fill('[data-testid="oil-amt"]', '1'); await page.fill('[data-testid="oil-reason"]', 'I correction')
    await page.locator('[data-testid="oil-credit-save"]').click(); await L.sleep(700)
    await closeTracker()
  }, { put: [LED] })
  const key = c.a.put.find(k => LED.test(k)), id = key.slice('leavewar/ledger:'.length)
  REASON[id] = 'I correction'
  L.check('I8a — a −1 correction stored, dated today; the tracker shows it', JSON.parse((await L.rows(page))[key]).amount === -1 && c.tr.boxes.some(b => /I correction/.test(b)), { tracker: c.tr })
  line(c)
  /* I8b — re-date the correction through its own date chip. Probes p6 / p7 (30 Sep 26): the chip turns "open" and its
     calendar's days exist on the page, but nothing of it is drawn where a person looks — the point where 29 Sep sits is
     covered by the tracker's rows above (what is under it is another row's box). So the date cannot be changed through
     the app: the step asserts the calendar is ON SCREEN (the day is what sits under the pointer), says so when it is
     not, cancels, and never forces a click a person could not make. */
  {
    const k0 = L.results.length
    await openTracker()
    await entry(id).click(); await L.sleep(400)
    const chip = page.locator('[data-testid="oil-edit-date"]:visible').first()
    if ((await chip.getAttribute('aria-expanded')) !== 'true') await chip.click()
    await L.sleep(600)
    const reach = await page.evaluate(() => {
      const d = document.querySelector('[data-testid="oileditdate-day-2026-09-29"]')
      if (!d) return { inDom: false }
      const b = d.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
      return { inDom: true, box: [Math.round(b.left), Math.round(b.top)], onTop: !!h && (h === d || d.contains(h)), under: h ? (h.getAttribute('data-testid') || h.tagName + '.' + String(h.className).slice(0, 30)) : 'nothing' }
    })
    await pic(page, 'I8-correction-date-chip-open')
    const ok = L.check('I8b — the correction\'s date chip opens a calendar a person can see and tap (29 Sep is what sits under the pointer)', reach.inDom && reach.onTop, reach)
    let d = null
    if (ok) {
      d = await oil('I8b tracker: move the correction\'s date to 29 Sep', 'OIL tracker → tap the correction → its date chip → 29 → Save', async () => {
        await page.locator('[data-testid="oileditdate-day-2026-09-29"]').first().click(); await L.sleep(300)
        await page.locator('[data-testid="oil-edit-save"]').click(); await L.sleep(600)
        await closeTracker()
      }, { put: [LED] })
      L.check('I8b — the SAME row, now dated 29 Sep', d.a.put.includes(key) && JSON.parse((await L.rows(page))[key]).date === '2026-09-29' && d.tr.boxes.some(b => /29 Sep/.test(b)), { tracker: d.tr })
      line(d)
    } else {
      await page.locator('[data-testid="oil-edit-cancel"]:visible').first().click().catch(() => {}); await L.sleep(300)
      await closeTracker()
      row({ step: 'I8b tracker: re-date the correction', width: 'desktop', did: 'OIL tracker → tap the −1 correction → tap its date chip "📅 30 Sep 26 ▾"', screen: `the chip reads open, but no calendar is drawn — the spot where 29 Sep sits shows ${reach.under}`, rows: 'none (not walked — no way to pick the day)', ok: false, pics: ['I8-correction-date-chip-open.png'] })
    }
  }
  const x = await oil('I8c tracker: delete the correction', 'OIL tracker → tap the correction → Delete → Really delete?', async () => {
    await openTracker()
    await entry(id).click(); await L.sleep(400)
    await page.locator(`[data-testid="oil-del-${id}"]`).click(); await L.sleep(300); await page.locator(`[data-testid="oil-del-${id}"]`).click(); await L.sleep(600)
    await closeTracker()
  }, { del: [LED] })
  L.check('I8c — its row removed; the tracker without it', x.a.del.includes(key) && !x.tr.boxes.some(b => /I correction/.test(b)), { tracker: x.tr })
  line(x)
})

{
  const r = await L.rows(page)
  L.check('part I — Warden holds no stray ledger row at the end (every award and correction made here is gone)', ledgerOf(r).filter(e => /^I /.test(e.reason || '')).length === 0, ledgerOf(r))
}
L.check('part I — no console errors, page errors, failed requests or native dialogs', !errors.length, errors.slice(0, 20))
L.save({ table: W.TABLE, errors })
await browser.close()
