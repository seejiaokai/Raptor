// M3 walk, walker B, part 2 — scenario 14 (a member's pending bid on a day since closed: Document and Remarks save, Undo / Redo, Delete, a new bid refused)
import { L, T, switchTo, fresh, setDoc, placeLeave, sleep, makeRunner, finish, chips, winText } from './lw-m3-walk-b-h.mjs'
console.log('lw-m3-walk-b2 v1 — build addf330a5 on :4302')
const run = makeRunner(process.argv[2] ? new Set(process.argv[2].split(',')) : null)
const RUNS = [['desk', 'chromium'], ['phone', 'chromium'], ['phone', 'webkit']]
const tapq = async (w, sel, name) => { if (w.phone && name) await L.tapQuick(w, sel, name); else await L.press(w, sel) ; await sleep(w, 400) }
for (const [size, engine] of RUNS) {
  console.log(`\n=== ${size} ${engine} ===`)
  const tag = `${size}-${engine === 'webkit' ? 'wk' : 'cr'}`
  const w = await fresh(size, 'member', engine)
  await run(14, size, w, async (w, S) => {
    await L.gotoMonth(w, 'MAR')
    await L.openCell(w, 'bane', '2026-03-10')
    S.ok(await placeLeave(w, 'LL'), 'member placed a pending LL on Tue 10 Mar')
    await switchTo(w, 'admin')
    await tapq(w, T('open-chip'), null); await L.shot(w, `s14-opendates-${tag}`); S.pic(`s14-opendates-${tag}`)
    await tapq(w, T('od-month-2026-03'), null); await sleep(w, 400)
    const st = await w.page.locator(T('od-month-2026-03')).getAttribute('data-state')
    S.ok(st === 'closed' || st === 'shut' || st !== 'open', `the March month button state after the tap: ${st}`)
    await L.shot(w, `s14-march-closed-${tag}`); S.pic(`s14-march-closed-${tag}`)
    await L.press(w, T('open-dates-close')); await sleep(w, 400)
    await switchTo(w, 'member')
    await L.gotoMonth(w, 'MAR')
    // open the closed day with his pending bid
    if (w.phone) await L.tapQuick(w, T(L.cellId('bane', '2026-03-10')), `s14-open-${tag}`); else await L.openCell(w, 'bane', '2026-03-10')
    await sleep(w, 400)
    let d = await L.sheetDump(w.page)
    S.ok(d?.id === 'closed-note' && /pending/.test(d.text), `the day opens the closed-day note with his pending bid: ${d?.id} — ${(d?.text || '').slice(0, 150)}`)
    await L.shot(w, `s14-closednote-${tag}`); S.pic(`s14-closednote-${tag}`)
    // Document
    await setDoc(w, 'walk-b.pdf', '[data-testid="closed-doc-row"]')
    let c = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="closed-doc-row"] *')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.textContent.trim()))
    S.ok(c.some(t => /walk-b\.pdf/.test(t)), `Document picked on the closed day: ${JSON.stringify(c)}`)
    await L.shot(w, `s14-doc-${tag}`); S.pic(`s14-doc-${tag}`)
    // Remarks
    const rm = w.page.locator(T('closed-remarks'))
    await rm.fill('walk remark 14'); await rm.press('Enter').catch(() => {}); await sleep(w, 500)
    await L.shot(w, `s14-remark-${tag}`); S.pic(`s14-remark-${tag}`)
    await L.closeAny(w); await sleep(w, 400)
    await L.openCell(w, 'bane', '2026-03-10'); await sleep(w, 300)
    c = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="closed-doc-row"] *')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.textContent.trim()))
    const rv = await w.page.locator(T('closed-remarks')).inputValue().catch(() => null)
    S.ok(c.some(t => /walk-b\.pdf/.test(t)) && rv === 'walk remark 14', `closed and reopened: Document ${JSON.stringify(c)}, Remarks "${rv}"`)
    await L.shot(w, `s14-reopened-${tag}`); S.pic(`s14-reopened-${tag}`)
    await L.closeAny(w)
    // Undo takes one back (the remark first), again the file; Redo puts them back
    const readOpen = async () => { await L.openCell(w, 'bane', '2026-03-10'); await sleep(w, 300); const cc = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="closed-doc-row"] *')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.textContent.trim())); const r = await w.page.locator(T('closed-remarks')).inputValue().catch(() => null); const dd = await L.sheetDump(w.page); return { file: cc.some(t => /walk-b\.pdf/.test(t)), remark: r, id: dd?.id } }
    await tapq(w, '#undoBtn', w.phone ? `s14-undo1-${tag}` : null); await sleep(w, 300)
    let s1 = await readOpen(); await L.shot(w, `s14-after-undo1-${tag}`); S.pic(`s14-after-undo1-${tag}`); await L.closeAny(w)
    await tapq(w, '#undoBtn', w.phone ? `s14-undo2-${tag}` : null); await sleep(w, 300)
    let s2 = await readOpen(); await L.shot(w, `s14-after-undo2-${tag}`); S.pic(`s14-after-undo2-${tag}`); await L.closeAny(w)
    S.say(`after Undo 1: ${JSON.stringify(s1)}; after Undo 2: ${JSON.stringify(s2)}`)
    S.ok(!s2.file, `after Undo (twice) the file is taken back: ${JSON.stringify(s2)}`)
    S.ok(!s2.remark || s2.remark === '', `after Undo (twice) the remark is taken back: ${JSON.stringify(s2)}`)
    await tapq(w, '#redoBtn', w.phone ? `s14-redo1-${tag}` : null); await sleep(w, 300)
    await tapq(w, '#redoBtn', w.phone ? `s14-redo2-${tag}` : null); await sleep(w, 300)
    let s3 = await readOpen(); await L.shot(w, `s14-after-redo-${tag}`); S.pic(`s14-after-redo-${tag}`)
    S.ok(s3.file && s3.remark === 'walk remark 14', `after Redo (twice) the file and remark are back: ${JSON.stringify(s3)}`)
    // Delete still works
    await tapq(w, T('closed-delete'), w.phone ? `s14-delete-${tag}` : null); await sleep(w, 500)
    await L.shot(w, `s14-deleted-${tag}`); S.pic(`s14-deleted-${tag}`)
    await L.closeAny(w)
    const cell = await L.cellInfo(w.page, 'bane', '2026-03-10')
    S.ok(!cell?.boxes?.length, `after Delete the Mar 10 cell holds no box: ${JSON.stringify(cell?.boxes?.map(b => b.text))}`)
    // a new bid on a closed day is refused
    await L.openCell(w, 'bane', '2026-03-11'); await sleep(w, 400)
    d = await L.sheetDump(w.page)
    S.ok(d?.id !== 'bid-picker' && !(d?.tids || []).includes('bid-LL'), `a closed empty day (11 Mar) offers no leave buttons: ${d?.id} — ${(d?.text || '').slice(0, 160)}`)
    await L.shot(w, `s14-newbid-refused-${tag}`); S.pic(`s14-newbid-refused-${tag}`)
    await L.closeAny(w)
  }, { engine })
  finish('b2-' + tag)
  await L.closeBrowser()
}
