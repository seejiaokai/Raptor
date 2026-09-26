/* W3-06 — AB3 on the war side (Fable S5 / F3): a multi-day bid approved on the war becomes ONE Input whose remark
   the war writes itself — "till 31 Jul". Then (a) a medical filed over its middle, (b) one middle day un-approved
   (Refuse) on the war, (c) one middle day deleted from the war (drag + Delete), (d) its last two days moved by the
   drag-selection's Move. Each surviving piece's "till" must name ITS OWN last day (D189's reading, register §11).
   Assertions of the RIGHT behaviour. Usage: node scripts/handpass/ab/w3-06-till.mjs */
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts, dragRect, selPress, lwHist } = L
const R = resultBook('W3-06', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-06.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w3-06-THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const D = ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31']
const MON = { Jul: 7, Aug: 8 }
const lastDay = (x) => { const s = (x.endDate || x.date).split(' '); return `${s[1]} ${s[0]}` }   // "31 Jul"
const tillOk = (x) => { const m = /till (\d{1,2}) ([A-Za-z]{3})/.exec(x.remarks); return !m || `${+m[1]} ${m[2]}` === lastDay(x).replace(/^0/, '') }
const pieces = async (p) => (await inputsOf(page, p)).filter(x => x.type === 'LL').map(x => ({ ...x, show: `${x.date}${x.endDate ? '–' + x.endDate : ''}: "${x.remarks}"` }))

/* a five-day bid, placed day by day with a drag and approved with a drag — the war writes one Input */
async function approvedRun(p) {
  await lwOpen(page, D[0])
  const s1 = await dragRect(page, p, D[0], p, D[4])
  const f = await selPress(page, 'sel-LL')
  await closeSheets(page)
  const s2 = await dragRect(page, p, D[0], p, D[4])
  const a = await selPress(page, 'sel-approve')
  await closeSheets(page)
  const pc = await pieces(p)
  return { fill: f.note, approve: a.note, pieces: pc.map(x => x.show) }
}
const cases = [
  ['a-medical', 'haowen', async (p) => fileInput(page, { person: p, type: 'ATT C', from: D[2], remarks: 'W3 sick mid-leave' })],
  ['b-refuse', 'bapster', async (p) => { await tapCell(page, p, D[2]); const r = await sheetPress(page, 'decide-refuse'); await closeSheets(page); return r.sheet.open }],
  ['c-delete', 'prism', async (p) => { await dragRect(page, p, D[2], p, D[2]); await selPress(page, 'sel-delete'); const r = await selPress(page, 'sel-delete'); await closeSheets(page); return r.note }],
  ['d-move', 'divot', async (p) => {
    await dragRect(page, p, D[3], p, D[4]); await selPress(page, 'sel-move')
    const tc = page.locator(`[data-testid="cell-${p}-2026-08-03"]`).first()
    await tc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    const bb = await tc.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 4 }); await page.waitForTimeout(300)
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(900)
    const banner = await page.locator('[data-testid="move-banner"]').allInnerTexts()
    if (banner.length) await page.locator('[data-testid="move-cancel"]').click().catch(() => {})
    return banner.join(' ') || 'moved'
  }],
]
for (const [id, p, act] of cases) {
  await step(id, async () => {
    const run = await approvedRun(p)
    R.note(`${id}-approved`, run)
    R.ck(`${id}-war-writes-till`, run.pieces.length === 1 && /till 31 Jul/.test(run.pieces[0]), 'a five-day run approved on the war is one Input reading "till 31 Jul"', run)
    const r = await act(p)
    await lwOpen(page, D[0])
    const pc = await pieces(p)
    await L.lwShot(page, `w3-06-${id}-after`, p, D[2])
    await L.inputsWindow(page, '2026-07-27', '2026-08-07')
    await shot(page, `w3-06-${id}-inputs-page`)
    R.ck(`AB3-${id}`, pc.length >= 1 && pc.every(tillOk), `after ${id.slice(2)}, every surviving piece's "till" names its own last day (F3 / AB3 — the war's own remark)`, { act: r, pieces: pc.map(x => x.show) })
  })
}
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
