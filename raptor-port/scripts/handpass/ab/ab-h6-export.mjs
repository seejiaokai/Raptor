/* The absence-record re-test — HOST H6 (26 Sep 26): the Inputs page's "Export to Excel" after a leave was cut by a
   medical (R22; Fable S36; Astra 39). The file must carry each piece as stored — its own dates and its own words.
   (The schedule's CSV and print carry no absences at all — flying lines only, `[FLAG-EXPORT]` / AM50; recorded.)
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/ab-h6-export.mjs */
process.env.AB_WHO = 'host/h6'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { fileInput, inputsWindow, resultBook, ROOT, shot } = L
const R = resultBook('H6', `${ROOT}/docs/handpass/parts/2026-09-26-absence-h6.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
const P = 'bapster'
await fileInput(page, { person: P, type: 'LL', from: '2026-07-20', to: '2026-07-24', remarks: 'H6 Bali' })
await fileInput(page, { person: P, type: 'ATT C', from: '2026-07-22', remarks: 'H6 sick' })
await inputsWindow(page, '2026-07-20', '2026-07-24')
await shot(page, 'h6-inputs-table')
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.locator('#inExport').click()])
const path = await dl.path()
const { readFileSync } = await import('node:fs')
const csv = readFileSync(path, 'utf8').replace(/^﻿/, '')
const lines = csv.split(/\r?\n/).filter(l => /Wildcard/.test(l))
R.note('csv-name', dl.suggestedFilename())
R.note('csv-wildcard-lines', lines)
const ll = lines.filter(l => /,LL,|"LL"/.test(l) || /\bLL\b/.test(l))
R.ck('csv-pieces', ll.length === 2 && lines.some(l => /ATT C/.test(l)), 'the file carries the two leave pieces and the medical, each as stored', lines)
R.note('errors', errors.slice(0, 10))
R.save()
await browser.close()
