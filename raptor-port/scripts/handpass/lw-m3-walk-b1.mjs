// M3 walk, walker B, part 1 — scenarios 12, 13 (documents on a bid, both orders; the chip's cross). Run: node scripts/handpass/lw-m3-walk-b1.mjs
import { L, T, switchTo, fresh, setDoc, placeLeave, sleep, makeRunner, finish, chips, winText, P } from './lw-m3-walk-b-h.mjs'
console.log('lw-m3-walk-b1 v1 — build addf330a5 on :4302')
const run = makeRunner(process.argv[2] ? new Set(process.argv[2].split(',')) : null)
const RUNS = [['desk', 'chromium'], ['phone', 'chromium'], ['phone', 'webkit']]
const tapLL = async (w, name) => {
  // the leave tap, with a quick picture on a phone; a below-zero ask is answered by a second tap
  if (w.phone) await L.tapQuick(w, T('bid-LL'), name); else { await L.press(w, T('bid-LL')); await sleep(w, 500) }
  if (await L.vis(w.page, T('bid-picker'))) { if (w.phone && name) await L.tapQuick(w, T('bid-LL'), name + '-again'); else await L.press(w, T('bid-LL')); await sleep(w, 600) }
  return !(await L.vis(w.page, T('bid-picker')))
}
const openOn = async (w, iso, name) => { if (w.phone && name) await L.tapQuick(w, T(L.cellId('bane', iso)), name); else await L.openCell(w, 'bane', iso); await L.sheetDump(w.page); await sleep(w, 300) }
for (const [size, engine] of RUNS) {
  console.log(`\n=== ${size} ${engine} ===`)
  const tag = `${size}-${engine === 'webkit' ? 'wk' : 'cr'}`
  const w = await fresh(size, 'member', engine)
  await L.gotoMonth(w, 'JAN')
  await run(12, size, w, async (w, S) => {
    // A: file first, then LL (Jan 14)
    await openOn(w, '2026-01-14', `s12a-open-${tag}`)
    await setDoc(w)
    let c = await chips(w); S.ok(c.some(t => /walk-b\.pdf/.test(t)), `A: Document picked before LL — the window's Document row reads ${JSON.stringify(c)}`)
    await L.shot(w, `s12a-picked-${tag}`); S.pic(`s12a-picked-${tag}`)
    const placed = await tapLL(w, `s12a-ll-${tag}`)
    S.ok(placed, 'A: LL placed (window closed)')
    await L.shot(w, `s12a-placed-${tag}`); S.pic(`s12a-placed-${tag}`)
    await openOn(w, '2026-01-14')
    c = await chips(w); S.ok(c.some(t => /walk-b\.pdf/.test(t)), `A: reopened — the bid's Document row reads ${JSON.stringify(c)}`)
    S.ok(/NOW LL/i.test(await winText(w) || ''), `A: the window says NOW LL: "${(await winText(w) || '').slice(0, 90)}"`)
    await L.shot(w, `s12a-reopened-${tag}`); S.pic(`s12a-reopened-${tag}`)
    await L.closeAny(w)
    // B: LL first, then reopen and Document (Jan 15)
    await openOn(w, '2026-01-15')
    S.ok(await tapLL(w, null), 'B: LL placed with no file')
    await openOn(w, '2026-01-15', `s12b-reopen-${tag}`)
    c = await chips(w); S.ok(!c.some(t => /walk-b\.pdf/.test(t)), `B: before adding, the Document row reads ${JSON.stringify(c)} (no file)`)
    await setDoc(w)
    c = await chips(w); S.ok(c.some(t => /walk-b\.pdf/.test(t)), `B: after Document on the placed bid, the row reads ${JSON.stringify(c)}`)
    await L.shot(w, `s12b-added-${tag}`); S.pic(`s12b-added-${tag}`)
    await L.closeAny(w); await sleep(w, 300)
    await openOn(w, '2026-01-15')
    c = await chips(w); S.ok(c.some(t => /walk-b\.pdf/.test(t)), `B: closed and reopened — the same bid still has it: ${JSON.stringify(c)}`)
    await L.shot(w, `s12b-reopened-${tag}`); S.pic(`s12b-reopened-${tag}`)
    await L.closeAny(w)
    // the grid cell, for any mark of the file
    await L.cellShot(w, 'bane', '2026-01-14', `s12-cell14-${tag}`); S.pic(`s12-cell14-${tag}`)
  }, { engine })
  if (engine === 'webkit') { finish('b1-' + tag); await L.closeBrowser(); continue }
  await run(13, size, w, async (w, S) => {
    await openOn(w, '2026-01-16')
    await setDoc(w)
    let c = await chips(w); S.ok(c.some(t => /walk-b\.pdf/.test(t)), `file picked: ${JSON.stringify(c)}`)
    const x = w.page.locator('[data-testid="bid-doc-row"] button', { hasText: '✕' }).first()
    S.ok(await x.count() > 0, 'the chip has a ✕')
    if (w.phone) { const b = await x.boundingBox(); await L.finger(w, b.x + b.width / 2, b.y + b.height / 2) } else await x.click()
    await sleep(w, 400)
    c = await chips(w); S.ok(!c.some(t => /walk-b\.pdf/.test(t)), `after ✕ the Document row reads ${JSON.stringify(c)}`)
    await L.shot(w, `s13-removed-${tag}`); S.pic(`s13-removed-${tag}`)
    S.ok(await tapLL(w, null), 'LL placed')
    await openOn(w, '2026-01-16')
    c = await chips(w); S.ok(!c.some(t => /walk-b\.pdf/.test(t)), `the placed bid's Document row reads ${JSON.stringify(c)} (no file)`)
    await L.shot(w, `s13-bid-${tag}`); S.pic(`s13-bid-${tag}`)
    await L.closeAny(w)
  })
  finish('b1-' + tag)
  await L.closeBrowser()
}
