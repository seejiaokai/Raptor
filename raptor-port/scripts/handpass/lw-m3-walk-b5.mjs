// M3 walk, walker B, part 5 — scenarios 17, 18 (the Inputs page: a new leave with no document asks; "No document"; a later Add; the type filter's families)
// Run: node scripts/handpass/lw-m3-walk-b5.mjs [17,18]   (SIZES=desk,phone env to narrow)
import { L, T, switchTo, fresh, setDoc, placeLeave, sleep, makeRunner, finish, chips, winText, rowHasFile, placeRange, inputsList, listRows, toWar } from './lw-m3-walk-b-h.mjs'
console.log('lw-m3-walk-b5 v1 — build addf330a5 on :4302')
const run = makeRunner(process.argv[2] ? new Set(process.argv[2].split(',')) : null)
const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : ['desk', 'phone']
const tq = async (w, sel, name) => { if (w.phone && name) { await L.tapQuick(w, sel, name); await sleep(w, 450) } else await L.press(w, sel) }
const bell = async w => {
  const badge = await w.page.evaluate(() => (document.querySelector('#notifyBell')?.innerText || '').replace(/\s+/g, ' ').trim())
  await L.press(w, '#notifyBell'); await sleep(w, 600)
  const menu = await w.page.evaluate(() => [...document.querySelectorAll('[role=menu], .belllist, [data-testid*=bell]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' || '))
  await w.page.keyboard.press('Escape'); await sleep(w, 300)
  if (await L.vis(w.page, '[role=menu]')) { await w.page.mouse.click(5, 450); await sleep(w, 300) }
  return { badge, menu }
}
const julCell = w => L.cellInfo(w.page, 'bane', '2026-07-20').then(i => JSON.stringify(i?.boxes?.map(b => [b.cls, b.text, b.bg, b.color, b.ol, b.bs])) + '|' + (i?.tdcls || ''))
const MAIN = '.floatwin'

for (const size of SIZES) {
  console.log(`\n=== ${size} chromium ===`)
  const tag = `${size}-cr`
  let w = await fresh(size, 'admin')
  await run(17, size, w, async (w, S) => {
    await toWar(w, 'JUL')
    const before = await julCell(w)
    S.say('Ranger 20 Jul on the war before filing: ' + before)
    await w.page.evaluate(() => window.go('inputs')); await sleep(w, 1000)
    await L.press(w, '#inListBtn'); await sleep(w, 500)
    await tq(w, '[data-testid="in-new"]', null); await sleep(w, 700)
    await w.page.locator('#inpEditPerson').selectOption({ label: 'Ranger' })
    await w.page.locator('#inpEditType').selectOption('LL'); await sleep(w, 300)
    await L.press(w, '[data-testid="inpEdCal-day-2026-07-20"]'); await sleep(w, 400)
    await L.shot(w, `s17-new-window-${tag}`); S.pic(`s17-new-window-${tag}`)
    await tq(w, '#inpEditSave', w.phone ? `s17-add-${tag}` : null); await sleep(w, 900)
    S.ok(await L.vis(w.page, T('docconf')), 'a new LL with no document raises the ask')
    const ask = await w.page.evaluate(() => document.querySelector('[data-testid="docconf"]')?.innerText.replace(/\s+/g, ' ').trim() || '')
    S.ok(/no document\s*[—-]\s*ranger,\s*ll/i.test(ask), `the ask's head reads "No document — Ranger, LL": "${ask}"`)
    S.ok(/attach the approval from the leave app now, or file it and attach it later\./i.test(ask), `the ask's words: "${ask}"`)
    S.ok(await L.vis(w.page, T('docconf-upload')) && await L.vis(w.page, T('docconf-nodoc')), 'the ask has [Upload] and [No document]')
    await L.shot(w, `s17-ask-${tag}`); S.pic(`s17-ask-${tag}`)
    await tq(w, T('docconf-nodoc'), w.phone ? `s17-nodoc-${tag}` : null); await sleep(w, 900)
    S.ok(!(await L.vis(w.page, T('docconf'))), 'the ask is gone after "No document"')
    await inputsList(w, 'Ranger')
    let rows = await listRows(w)
    const mine = rows.find(r => /20 Jul/.test(r.text) && /LL/.test(r.text))
    S.ok(!!mine, `the leave is filed: ${JSON.stringify(rows.map(r => r.text.replace(/\s+/g, ' ')))}`)
    S.ok(/No doc/.test(mine?.text || ''), `its row reads a quiet "No document": "${(mine?.text || '').replace(/\s+/g, ' ')}"`)
    await L.shot(w, `s17-filed-${tag}`); S.pic(`s17-filed-${tag}`)
    // the war's cell after filing (the leave itself may change it) and the member's bell baseline
    await toWar(w, 'JUL')
    const afterFile = await julCell(w)
    S.say('Ranger 20 Jul on the war after filing: ' + afterFile)
    await L.cellShot(w, 'bane', '2026-07-20', `s17-war-cell-filed-${tag}`); S.pic(`s17-war-cell-filed-${tag}`)
    await switchTo(w, 'member'); const bellM0 = await bell(w); await switchTo(w, 'admin'); const bellA0 = await bell(w)
    S.say(`bells after the filing — Ranger: ${JSON.stringify(bellM0)}; Saber: ${JSON.stringify(bellA0)}`)
    // edit it later and Add a file
    await inputsList(w, 'Ranger')
    rows = await listRows(w)
    const row = rows.find(r => /20 Jul/.test(r.text) && /LL/.test(r.text))
    await w.page.locator(`[data-iid="${row.iid}"] .in-open, [data-iid="${row.iid}"] [data-testid="inl-open"]`).first().click(); await sleep(w, 900)
    await L.shot(w, `s17-edit-window-${tag}`); S.pic(`s17-edit-window-${tag}`)
    await setDoc(w, 'walk-b.pdf', `${MAIN} .docfield`)
    const dc = await w.page.evaluate(() => document.querySelectorAll('.floatwin .docchip').length)
    S.ok(dc === 1, `the window shows the new file chip (${dc})`)
    await tq(w, '#inpEditSave', w.phone ? `s17-save-${tag}` : null); await sleep(w, 900)
    S.ok(!(await L.vis(w.page, T('docconf'))), 'saving an edit of a saved leave raises no ask')
    S.ok(!(await L.vis(w.page, '#inpEditPop')), 'the window closed (saved)')
    await inputsList(w, 'Ranger')
    rows = await listRows(w)
    const row2 = rows.find(r => /20 Jul/.test(r.text) && /LL/.test(r.text))
    const kept = row2 ? await rowHasFile(w, row2) : false
    S.ok(kept && !/No doc/.test(row2?.text || ''), `the row now has the file and no "No document": "${(row2?.text || '').replace(/\s+/g, ' ')}" file=${kept}`)
    await L.shot(w, `s17-added-${tag}`); S.pic(`s17-added-${tag}`)
    await toWar(w, 'JUL')
    const afterDoc = await julCell(w)
    S.ok(afterDoc === afterFile, `the war's cell is unchanged by the documents-only edit: before "${afterFile.slice(0, 120)}" after "${afterDoc.slice(0, 120)}"`)
    await L.cellShot(w, 'bane', '2026-07-20', `s17-war-cell-doc-${tag}`); S.pic(`s17-war-cell-doc-${tag}`)
    await switchTo(w, 'member'); const bellM1 = await bell(w); await switchTo(w, 'admin'); const bellA1 = await bell(w)
    S.ok(JSON.stringify(bellM1) === JSON.stringify(bellM0), `Ranger's bell is unchanged by the documents-only edit: before ${JSON.stringify(bellM0)} after ${JSON.stringify(bellM1)}`)
    S.ok(JSON.stringify(bellA1) === JSON.stringify(bellA0), `Saber's bell is unchanged: before ${JSON.stringify(bellA0)} after ${JSON.stringify(bellA1)}`)
  })
  finish('b5a-' + tag)
  await L.closeBrowser()
  // ---- 18: the type filter's families, "No document" on bare leave and medical rows, the calendar follows
  w = await fresh(size, 'admin')
  await run(18, size, w, async (w, S) => {
    const LEAVE = new Set(['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL']), MED = new Set(['HL', 'OML', 'ATT C', 'ATT B', 'UPCHIT']), OTHER = new Set(['TRAINING', 'CSE', 'MEETING', 'FLY WITH', 'PERSONAL', 'APPOINTMENT', 'DUTY', 'EVENT', 'OD', 'OTHER'])
    await L.gotoMonth(w, 'JAN')
    S.ok(await placeRange(w, '2026-01-20', '2026-01-20', { doc: 'walk-b.png' }), 'admin placed an approved LL with a file on 20 Jan, so one leave carries a document')
    await inputsList(w, '')
    const setFilter = async v => { if (w.phone && !(await L.vis(w.page, '#inFType'))) { await L.press(w, '#inFiltersBtn'); await sleep(w, 400) } await w.page.locator('#inFType').selectOption(v); await sleep(w, 800) }
    const listRead = () => w.page.evaluate(() => [...document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs .icard[data-iid]')].map(r => ({ kind: (r.querySelector('.icard-kind, .intag')?.innerText || '').replace(/\s+/g, ' ').trim().toUpperCase(), nodoc: r.querySelectorAll('.in-nodoc').length, clip: r.querySelectorAll('.rclip').length, text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 50) })))
    const title = () => w.page.evaluate(() => (document.querySelector('#page-inputs .ib-top')?.innerText || '').replace(/\s+/g, ' '))
    const barRead = () => w.page.evaluate(() => [...document.querySelectorAll('#page-inputs .ib-bar')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText.split('·').pop() || '').replace(/\s+/g, ' ').trim().toUpperCase()))
    const allList = await listRead()
    S.say('the unfiltered list has ' + allList.length + ' rows; kinds: ' + [...new Set(allList.map(r => r.kind))].join(', '))
    for (const [fam, val, set, label] of [['leave', 'grp:leave', LEAVE, 'All leave'], ['medical', 'grp:med', MED, 'All medical'], ['duty', 'grp:other', OTHER, 'All duty & commitments']]) {
      await setFilter(val)
      const rows = await listRead()
      const kinds = [...new Set(rows.map(r => r.kind))]
      S.ok(rows.length > 0 && rows.every(r => set.has(r.kind)), '"' + label + '" shows only ' + fam + ' kinds: ' + rows.length + ' rows, kinds ' + kinds.join(', '))
      const bare = rows.filter(r => !r.clip)
      if (fam === 'duty') S.ok(rows.every(r => r.nodoc === 0), 'no duty row says "No document" (' + rows.filter(r => r.nodoc).length + ' do)')
      else {
        S.ok(bare.length > 0 && bare.every(r => r.nodoc === 1), '"No document" stands on every ' + fam + ' row without a file: ' + bare.filter(r => r.nodoc === 1).length + ' of ' + bare.length + ' bare rows carry it')
        S.ok(rows.filter(r => r.clip).every(r => r.nodoc === 0), 'a row with a file never also says "No document"')
      }
      await L.shot(w, 's18-list-' + fam + '-' + tag); S.pic('s18-list-' + fam + '-' + tag)
      // the calendar follows the same value
      await L.press(w, '#inCalBtn'); await sleep(w, 900)
      for (let i = 0; i < 14 && !/JANUARY 2026/i.test(await title()); i++) { await L.press(w, '#icPrev'); await sleep(w, 250) }
      const bars = await barRead()
      S.ok(/JANUARY 2026/i.test(await title()) && bars.length > 0 && bars.every(b => set.has(b)), 'the calendar (' + ((await title()).match(/[A-Z]+ 20\d\d/i) || [''])[0] + ') with "' + label + '" shows only ' + fam + ' bars: ' + bars.length + ' bars, kinds ' + [...new Set(bars)].join(', '))
      await L.shot(w, 's18-cal-' + fam + '-' + tag); S.pic('s18-cal-' + fam + '-' + tag)
      await L.press(w, '#inListBtn'); await sleep(w, 700)
    }
  })
  finish('b5b-' + tag)
  await L.closeBrowser()
  // ---- 17p: a published day the leave covers reads no extra "pending" after a documents-only change
  w = await fresh(size, 'admin')
  await run('17p', size, w, async (w, S) => {
    const DI = 1, day = `#eWeek .day[data-day="${DI}"]`
    await w.page.evaluate(() => window.go('editsched')); await sleep(w, 1500)
    if (!(await w.page.locator(day).count())) { S.notrun = 'the Edit Schedule week has no day card at this size to publish from'; return }
    for (const role of ['cur', 'sked', 'plan', 'appr']) {
      const sel = w.page.locator(`${day} select[data-sign="${role}"][data-signday="${DI}"]`).first()
      await sel.scrollIntoViewIfNeeded()
      const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
      await sel.selectOption(opts[0]); await sleep(w, 200)
    }
    const pub = w.page.locator(`${day} [data-beak="${DI}"]`).first()
    await pub.evaluate(e => e.scrollIntoView({ block: 'center' })); await pub.click(); await sleep(w, 1200)
    const pend = async () => w.page.evaluate(d => { const e = document.querySelector(d); const t = e.innerText.replace(/\s+/g, ' '); return { chip: (t.match(/\d+ changes?|No changes|pending/gi) || []).join(' / '), al: [...document.querySelectorAll('.al-pend')].map(x => x.innerText).join(' / '), ver: (e.querySelector('.verchip')?.innerText || '').trim() } }, day)
    const p0 = await pend()
    S.ok(/ORIG/.test(p0.ver), `Tue 14 Jul is published: ${JSON.stringify(p0)}`)
    await L.shot(w, `s17p-published-${tag}`); S.pic(`s17p-published-${tag}`)
    // file Ranger LL on 14 Jul with no document
    await w.page.evaluate(() => window.go('inputs')); await sleep(w, 1000)
    await L.press(w, '#inListBtn'); await sleep(w, 500)
    await tq(w, '[data-testid="in-new"]', null); await sleep(w, 700)
    await w.page.locator('#inpEditPerson').selectOption({ label: 'Ranger' })
    await w.page.locator('#inpEditType').selectOption('LL'); await sleep(w, 300)
    await L.press(w, '[data-testid="inpEdCal-day-2026-07-14"]'); await sleep(w, 400)
    await L.press(w, '#inpEditSave'); await sleep(w, 900)
    if (await L.vis(w.page, T('docconf-nodoc'))) { await L.press(w, T('docconf-nodoc')); await sleep(w, 900) }
    await w.page.evaluate(() => window.go('editsched')); await sleep(w, 1500)
    const p1 = await pend()
    S.say(`after the leave was filed (no document): ${JSON.stringify(p1)}`)
    await L.shot(w, `s17p-after-filing-${tag}`); S.pic(`s17p-after-filing-${tag}`)
    // add a file to it
    await inputsList(w, 'Ranger')
    const rows = await listRows(w)
    const row = rows.find(r => /14 Jul/.test(r.text) && /LL/.test(r.text))
    S.ok(!!row, `the 14 Jul leave is on the list: ${JSON.stringify(rows.map(r => r.text.replace(/s+/g, ' ')))}`)
    await w.page.locator(`[data-iid="${row.iid}"] .in-open, [data-iid="${row.iid}"] [data-testid="inl-open"]`).first().click(); await sleep(w, 900)
    await setDoc(w, 'walk-b.pdf', `${MAIN} .docfield`)
    await L.press(w, '#inpEditSave'); await sleep(w, 900)
    await w.page.evaluate(() => window.go('editsched')); await sleep(w, 1500)
    const p2 = await pend()
    S.ok(JSON.stringify(p2) === JSON.stringify(p1), `the published day reads the same after the documents-only change: before ${JSON.stringify(p1)} after ${JSON.stringify(p2)}`)
    await L.shot(w, `s17p-after-doc-${tag}`); S.pic(`s17p-after-doc-${tag}`)
  })
  finish('b5p-' + tag)
  await L.closeBrowser()
}
