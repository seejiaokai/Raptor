/* [HUMAN-RETEST] Tracker — walker w1, walk F: EVENT DETAILS across the wipe,
   read on BOTH charts (Fable #21, #23; ruling R83; D120).

   The short course (Tx 2026) ships its own wording for some events (its BFM-5
   flies the BFM-7 profile; its BFM-3 crew reads "UP / IW" where 2026 reads
   "UP / IP"). Three edits, each through a real door:
     a. Tx — BFM-5's Name, through the grading pop-up → ✎ Edit details;
     b. Tx — BFM-3's Crew set to EXACTLY 2026's wording, so it differs from Tx's
        own (the case the app keeps a marker for);
     c. 2026 — BFM-5's Hours, through ☰ Show All → Edit.
   Read each through the details bubble AND Show All on BOTH charts, before and
   after export → wipe → import. R83: an edit on one chart never rewrites
   another chart's wording. */
import { open, shot, save, log, DESK, sleep, pickSyl, bubble, showAllRow, showAllEdit, popEditDetails,
  exportVia, importVia, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-f-export.json')
const NAME5 = 'TX NAME FIVE', CREW3 = 'IP / UW, UP / IP', HRS5 = '7.7 Hrs'

async function readAll(page, tag) {
  const out = {}
  for (const chart of ['2026', 'Tx 2026']) {
    await pickSyl(page, chart)
    for (const id of ['BFM-5', 'BFM-3']) out[`${chart} · ${id}`] = { bubble: await bubble(page, id), showAll: await showAllRow(page, id) }
    if (tag) {
      await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await page.fill('#saSearch', 'BFM-'); await sleep(300)
      await shot(page, `w1-09-${tag}-${chart.replace(/\s+/g, '')}-showall`)
      await page.click('#saClose'); await sleep(200)
    }
  }
  return out
}
const show = r => Object.entries(r).map(([k, v]) => `${k}: ${v.showAll}`).join('  ‖  ')

/* ================= WORLD A ================= */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
const base = await readAll(pa, null)
L.note('A: before any edit', show(base))

/* a. Tx — BFM-5 Name through the pop-up's ✎ Edit details */
await pickSyl(pa, 'Tx 2026')
const ea = await popEditDetails(pa, 'BFM-5', { name: NAME5 }, 'w1-09-A-tx-bfm5-details-window')
L.note('a: Tx BFM-5 → ✎ Edit details', `pop-up "${ea.title}"; the window was filled with name "${ea.before && ea.before.name}"`)
/* b. Tx — BFM-3 Crew = 2026's exact wording */
const eb = await popEditDetails(pa, 'BFM-3', { crew: CREW3 })
L.note('b: Tx BFM-3 → ✎ Edit details', `crew was "${eb.before && eb.before.crew}" → "${CREW3}"`)
/* R83, straight away: did the Tx name reach 2026? */
await pickSyl(pa, '2026')
const leak = await showAllRow(pa, 'BFM-5')
await shot(pa, 'w1-09-A-2026-after-tx-name-edit')
L.ok('R83: renaming BFM-5 on Tx leaves 2026\'s BFM-5 name alone', !leak.includes(NAME5), `2026 BFM-5 now reads: ${leak}`)
/* c. 2026 — BFM-5 Hours through Show All → Edit */
const ec = await showAllEdit(pa, 'BFM-5', { Hours: HRS5 }, 'w1-09-A-2026-showall-edit')
L.note('c: 2026 BFM-5 → Show All → Edit', `the editor was filled with ${JSON.stringify(ec.before)} → now "${ec.after}"`)
const beforeExport = await readAll(pa, 'A')
L.note('A: after the three edits', show(beforeExport))
L.ok('R83: the Hours edit made on 2026 stays on 2026 (Tx\'s BFM-5 does not take it)', !beforeExport['Tx 2026 · BFM-5'].showAll.includes(HRS5), `Tx BFM-5: ${beforeExport['Tx 2026 · BFM-5'].showAll}`)
L.ok('b: Tx BFM-3 reads the crew typed on Tx', beforeExport['Tx 2026 · BFM-3'].showAll.includes(CREW3), beforeExport['Tx 2026 · BFM-3'].showAll)
const ex = await exportVia(pa, { tick: 'all', file: FILE })
L.note('A: the file\'s details for BFM-5 / BFM-3', JSON.stringify(ex.json.charts.eventInfo['BFM-5']) + ' / ' + JSON.stringify(ex.json.charts.eventInfo['BFM-3']))
await A.browser.close()

/* ================= WORLD B — the wiped app ================= */
const B = await open({ size: DESK, who: 'a' })
const pb = B.page
await importVia(pb, FILE)
const after = await readAll(pb, 'B')
L.note('B: after export → wipe → import', show(after))
for (const k of Object.keys(beforeExport)) {
  L.ok(`round trip: ${k} reads the same in the bubble and Show All`, after[k].bubble === beforeExport[k].bubble && after[k].showAll === beforeExport[k].showAll,
    after[k].showAll === beforeExport[k].showAll ? after[k].showAll : `before "${beforeExport[k].showAll}" after "${after[k].showAll}"`)
}
L.ok('Fable #21: Tx BFM-5 shows the Tx name after the wipe', after['Tx 2026 · BFM-5'].showAll.includes(NAME5), after['Tx 2026 · BFM-5'].showAll)
L.ok('Fable #21: 2026 BFM-5 shows the LONG-course name and the Hours edit after the wipe', !after['2026 · BFM-5'].showAll.includes(NAME5) && after['2026 · BFM-5'].showAll.includes(HRS5), after['2026 · BFM-5'].showAll)
L.ok('Fable #23: Tx BFM-3 still reads 2026\'s crew wording after the wipe (the "kept on purpose" marker rode the file)', after['Tx 2026 · BFM-3'].showAll.includes(CREW3), after['Tx 2026 · BFM-3'].showAll)
save('w1-f-details', { rows: L.rows, base, beforeExport, after, errorsA: A.errors, errorsB: B.errors })
console.log(`errors A ${A.errors.length} B ${B.errors.length}: ${[...A.errors, ...B.errors].slice(0, 4).join(' | ')}`)
await B.browser.close()
