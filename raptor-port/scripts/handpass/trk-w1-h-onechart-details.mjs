/* [HUMAN-RETEST] Tracker — walker w1, walk H: importing ONE chart must not
   change ANOTHER chart's event details (Astra #5; R17, R83).

   The owner's other use of Import (R15, R26): a chart drawn up or baked
   elsewhere comes back as a file and goes in — "every other syllabus … stay[s]
   exactly as [it is]" (R17). Here:
     1. On 2026, BFM-3's Name → "A-SIDE NAME" (Show All → Edit).
     2. Export 2026 ONLY (charts only — the window's own default tick).
     3. Afterwards, locally: Tx 2026's BFM-3 Name → "B-SIDE NAME"; and an event
        that is NOT EVEN ON 2026 — A/G - A/A 2026's DAAR — Name → "AG ONLY EDIT".
     4. Import the 2026-only file, Replace it.
   Are Tx's BFM-3 and A/G's DAAR unchanged? */
import { open, shot, save, log, DESK, sleep, pickSyl, showAllRow, showAllEdit, exportVia, importVia, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-h-2026-only.json')
const { browser, page, errors } = await open({ size: DESK, who: 'a' })

await pickSyl(page, '2026')
await showAllEdit(page, 'BFM-3', { Name: 'A-SIDE NAME' })
L.note('1: 2026 BFM-3 after the edit', await showAllRow(page, 'BFM-3'))
await pickSyl(page, 'Tx 2026')
L.note('1: …and Tx 2026 BFM-3 at the same moment', await showAllRow(page, 'BFM-3'))

await pickSyl(page, '2026')
const ex = await exportVia(page, { tick: 'as-opened', file: FILE })
L.note('2: exported', `${Object.keys(ex.json.charts.syllabi).join(', ')} — the file also carries event details for ${Object.keys(ex.json.charts.eventInfo || {}).length} events (incl. DAAR: ${!!(ex.json.charts.eventInfo || {}).DAAR})`)

await pickSyl(page, 'Tx 2026')
await showAllEdit(page, 'BFM-3', { Name: 'B-SIDE NAME' })
const txBefore = await showAllRow(page, 'BFM-3')
await pickSyl(page, 'A/G - A/A 2026')
await showAllEdit(page, 'DAAR', { Name: 'AG ONLY EDIT' })
const agBefore = await showAllRow(page, 'DAAR')
await pickSyl(page, '2026')
const a2026Before = await showAllRow(page, 'BFM-3')
L.note('3: before the import', `Tx BFM-3: ${txBefore}  ‖  A/G DAAR: ${agBefore}  ‖  2026 BFM-3: ${a2026Before}`)

const asked = await importVia(page, FILE)
L.note('4: the import asked / said', asked.map(a => `"${a.msg.slice(0, 90)}" → ${a.ans}`).join(' || '))
await pickSyl(page, 'Tx 2026')
const txAfter = await showAllRow(page, 'BFM-3', { close: false }); await shot(page, 'w1-12-tx-bfm3-after-import'); await page.click('#saClose'); await sleep(200)
await pickSyl(page, 'A/G - A/A 2026')
const agAfter = await showAllRow(page, 'DAAR', { close: false }); await shot(page, 'w1-12-ag-daar-after-import'); await page.click('#saClose'); await sleep(200)
L.ok('12: Tx 2026\'s BFM-3 is unchanged by importing a 2026-only file', txAfter === txBefore, `before: ${txBefore}  |  after: ${txAfter}`)
L.ok('12: A/G - A/A 2026\'s DAAR (not on 2026 at all) is unchanged by importing a 2026-only file', agAfter === agBefore, `before: ${agBefore}  |  after: ${agAfter}`)
save('w1-h-onechart-details', { rows: L.rows, asked, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 4).join(' | ')}`)
await browser.close()
