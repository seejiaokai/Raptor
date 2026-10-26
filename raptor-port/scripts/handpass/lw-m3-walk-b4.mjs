// M3 walk, walker B, part 4 — scenario 16 (a bid with a file moved; an approved leave with a file moved; LL re-typed to OL keeps the file)
// Run: node scripts/handpass/lw-m3-walk-b4.mjs   (SIZES=desk,phone env to narrow)
import { L, T, switchTo, fresh, setDoc, placeLeave, sleep, makeRunner, finish, chips, winText, rowHasFile, placeRange, inputsList, listRows, toWar } from './lw-m3-walk-b-h.mjs'
console.log('lw-m3-walk-b4 v1 — build addf330a5 on :4302')
const run = makeRunner(process.argv[2] ? new Set(process.argv[2].split(',')) : null)
const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : ['desk', 'phone']
const tq = async (w, sel, name) => { if (w.phone && name) { await L.tapQuick(w, sel, name); await sleep(w, 400) } else await L.press(w, sel) }
async function moveTo(w, who, toIso, name) {
  await tq(w, T('decide-shift'), name)
  await w.page.waitForSelector(T('move-banner'), { timeout: 5000 })
  await sleep(w, 600)
  await L.press(w, T(L.cellId(who, toIso))); await sleep(w, 600)
  if (await L.vis(w.page, T('move-confirm'))) { await L.press(w, T('move-confirm')); await sleep(w, 700) }
}
const fileOn = (c, re = /walk-b\.pdf/) => c.some(t => re.test(t))

for (const size of SIZES) {
  console.log(`\n=== ${size} chromium ===`)
  const tag = `${size}-cr`
  // ---- the member's bid
  let w = await fresh(size, 'member')
  await run(16, size, w, async (w, S) => {
    await L.gotoMonth(w, 'JAN')
    // (a) a pending bid with a file, moved to another day
    await L.openCell(w, 'bane', '2026-01-14')
    await setDoc(w)
    S.ok(await placeLeave(w, 'LL'), 'member placed LL on 14 Jan with a file')
    await L.openCell(w, 'bane', '2026-01-14'); await sleep(w, 300)
    await moveTo(w, 'bane', '2026-01-19', `s16-move-bid-${tag}`)
    await L.closeAny(w)
    const a14 = await L.cellInfo(w.page, 'bane', '2026-01-14'), a19 = await L.cellInfo(w.page, 'bane', '2026-01-19')
    S.ok(!a14?.boxes?.length && a19?.boxes?.length === 1, `the bid moved: 14 Jan has ${a14?.boxes?.length} box(es), 19 Jan has ${a19?.boxes?.length}`)
    await L.openCell(w, 'bane', '2026-01-19'); await sleep(w, 400)
    let c = await chips(w)
    S.ok(fileOn(c), `the moved bid (now on 19 Jan) keeps its file: ${JSON.stringify(c)} — "${((await winText(w)) || '').slice(0, 90)}"`)
    await L.shot(w, `s16-moved-bid-${tag}`); S.pic(`s16-moved-bid-${tag}`)
    await L.closeAny(w)
    // (c) re-type LL → OL on a bid with a file
    await L.openCell(w, 'bane', '2026-01-15')
    await setDoc(w)
    S.ok(await placeLeave(w, 'LL'), 'member placed LL on 15 Jan with a file')
    await L.openCell(w, 'bane', '2026-01-15'); await sleep(w, 300)
    S.ok(await placeLeave(w, 'OL'), 'member tapped OL on the same day (re-type)')
    const k15 = await L.cellInfo(w.page, 'bane', '2026-01-15')
    S.ok(/k-ol/.test(k15?.boxes?.[0]?.cls || ''), `15 Jan now reads OL: ${k15?.boxes?.[0]?.cls} "${k15?.boxes?.[0]?.text}"`)
    await L.openCell(w, 'bane', '2026-01-15'); await sleep(w, 400)
    c = await chips(w)
    S.ok(fileOn(c), `after LL → OL the file is kept: ${JSON.stringify(c)} — "${((await winText(w)) || '').slice(0, 70)}"`)
    await L.shot(w, `s16-retyped-bid-${tag}`); S.pic(`s16-retyped-bid-${tag}`)
    await L.closeAny(w)
  })
  finish('b4m-' + tag)
  await L.closeBrowser()
  // ---- the admin's approved leave
  w = await fresh(size, 'admin')
  await run(16, size, w, async (w, S) => {
    S.say('(admin, approved leave)')
    await L.gotoMonth(w, 'JAN')
    S.ok(await placeRange(w, '2026-01-20', '2026-01-20', { remark: 'rmk16' }), 'admin placed an approved LL on 20 Jan with a file and a remark')
    await L.openCell(w, 'bane', '2026-01-20'); await sleep(w, 300)
    await moveTo(w, 'bane', '2026-01-21', `s16-move-approved-${tag}`)
    await L.closeAny(w)
    const i20 = await L.cellInfo(w.page, 'bane', '2026-01-20'), i21 = await L.cellInfo(w.page, 'bane', '2026-01-21')
    S.ok(!i20?.boxes?.length && /s-a/.test(i21?.boxes?.[0]?.cls || ''), `the approved leave moved: 20 Jan ${i20?.boxes?.length} box, 21 Jan ${i21?.boxes?.[0]?.cls}`)
    await inputsList(w)
    let rows = await listRows(w)
    const m = rows.filter(r => /21 Jan/.test(r.text))
    const mk = m.length ? await rowHasFile(w, m[0]) : false
    S.ok(m.length === 1 && mk, `the Inputs row for 21 Jan keeps the file (clip on the row=${m[0]?.clip}, file=${mk}): ${JSON.stringify(m.map(r => r.text + ' clip=' + r.clip))}`)
    await L.shot(w, `s16-inputs-after-move-${tag}`); S.pic(`s16-inputs-after-move-${tag}`)
    await toWar(w, 'JAN')
    // re-type an approved LL to OL: the war's window refuses it ("clear it first"); the Inputs page edits the kind
    await L.openCell(w, 'bane', '2026-01-21'); await sleep(w, 300)
    await L.press(w, T('bid-OL')); await sleep(w, 700)
    const rt = (await winText(w)) || ''
    S.say('the war window, OL tapped on the approved LL: ' + (/already taken by LL — clear it first/.test(rt) ? 'refused with "That time is already taken by LL — clear it first."' : 'no refusal text: ' + rt.slice(0, 160)))
    await L.shot(w, `s16-approved-retype-refused-${tag}`); S.pic(`s16-approved-retype-refused-${tag}`)
    await L.closeAny(w)
    await inputsList(w)
    await w.page.locator('tr[data-iid] .in-open, .icard[data-iid] [data-testid="inl-open"]').first().click(); await sleep(w, 800)
    await L.shot(w, `s16-input-window-${tag}`); S.pic(`s16-input-window-${tag}`)
    const tsel = w.page.locator('#inpEditType')
    await tsel.selectOption('OL'); await sleep(w, 400)
    await L.press(w, '#inpEditSave'); await sleep(w, 900)
    await L.shot(w, `s16-input-saved-${tag}`); S.pic(`s16-input-saved-${tag}`)
    rows = await listRows(w)
    const m2 = rows.filter(r => /21 Jan/.test(r.text))
    const mk2 = m2.length ? await rowHasFile(w, m2[0]) : false
    S.ok(m2.length === 1 && mk2 && /OL/.test(m2[0].text), `after changing the kind to OL on the Inputs page the 21 Jan row reads OL and keeps its file (file=${mk2}): ${JSON.stringify(m2.map(r => r.text + ' clip=' + r.clip))}`)
  })
  finish('b4a-' + tag)
  await L.closeBrowser()
}
