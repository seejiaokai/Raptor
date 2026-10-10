import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()

async function fileSetup(p, T) {
  await openDay(p, '2026-07-28', T)
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Duty'); await p.selectOption('#inpEditPerson', await csId(p, 'Anvil'))
  await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:30'); await p.fill('#inpEditOwnTitle', 'ZS card title'); await p.fill('#inpEditRmk', 'ZS card remark')
  await saveWin(p, T, 'no')
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Meeting')
  await press(T, p.locator(`${WIN} [data-testid="pp-several"]`))
  for (const cs of ['Anvil', 'Basher', 'Cinch']) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(T, b) }
  const sab = p.locator(`${WIN} [data-pp="${await csId(p, 'Saber')}"]`); if ((await sab.getAttribute('aria-pressed')) === 'true') await press(T, sab)
  await p.fill('#inpEditStart', '11:00'); await p.fill('#inpEditEnd', '12:00'); await p.fill('#inpEditOwnTitle', 'ZS shared')
  await saveWin(p, T, 'no')
  await p.keyboard.press('Escape'); await p.waitForTimeout(250)
}
const winInfo = p => p.evaluate(() => ({ n: document.querySelectorAll('[data-testid="win-inputedit"]').length, title: (document.querySelector('#inpEditOwnTitle') || {}).value, head: (document.querySelector('[data-testid="win-inputedit"] .win-ttl') || {}).textContent }))
async function closeWin(p, T) { if (await p.locator(WIN).count()) { await press(T, p.locator('#inpEditCancel')); await p.waitForTimeout(250) } }

async function run(label, vp, T, surfaces) {
  const { ctx, page: p } = await open(browser, vp, 'ad', 'a', T)
  await fileSetup(p, T)
  const target = await rec(p, { title: 'ZS card title' })
  const shared = (await recAll(p, { title: 'ZS shared' }))
  console.log(label, 'target', target.iid, 'shared records', shared.length)
  const probs = []; const pics = []; const log = []
  const goto = kind => (kind === 'day' ? openDay(p, '2026-07-28', T) : toList(p, T))
  for (const [surf, tid, root, kind] of surfaces) {
    const getTo = () => goto(kind)
    await getTo()
    const sel = `${root} [data-testid="${tid}-row-${target.iid}"]`
    const parts = ['who', 'kind', 'title', 'rmk', 'when', 'by']
    const els = []
    for (const k of parts) els.push([k, `${sel} [data-testid="${tid}-${k}"]`])
    els.push(['padding', null])
    for (const [k, selk] of els) {
      await getTo()
      const card = p.locator(sel); await card.scrollIntoViewIfNeeded()
      if (selk) { const e = p.locator(selk).first(); if (!(await e.count())) { probs.push(`${surf}/${k}: part not on the card`); continue }; await press(T, e) }
      else { const b = await card.boundingBox(); if (T) await card.tap({ position: { x: 10, y: b.height - 3 } }); else await card.click({ position: { x: 10, y: b.height - 3 } }) }
      await p.waitForTimeout(400)
      const w = await winInfo(p)
      log.push(`${surf}/${k}: windows ${w.n}, title "${w.title}"`)
      if (w.n !== 1) probs.push(`${surf}/${k}: ${w.n} input windows opened`)
      else if (w.title !== 'ZS card title') probs.push(`${surf}/${k}: opened the wrong input ("${w.title}" / ${w.head})`)
      if (k === 'rmk' && surf === surfaces[0][0]) pics.push(await shot(p, `25-${label}-tap-remark-opens-window`))
      await closeWin(p, T)
      // the day window must still be there (day) and a second tap must not have been needed
    }
    // LATE explains only
    await getTo()
    const late = p.locator(`${sel} [data-testid="${tid}-late"]`)
    if (await late.count()) {
      await late.scrollIntoViewIfNeeded(); await press(T, late); await p.waitForTimeout(300)
      const note = await p.locator(`${sel} [data-testid="${tid}-latenote"]`).innerText().catch(() => null)
      const w = await winInfo(p)
      log.push(`${surf}/LATE: note "${note}", windows ${w.n}`)
      if (!note) probs.push(`${surf}/LATE: no explanation`); if (w.n) probs.push(`${surf}/LATE: opened a window`)
      await press(T, late)
    } else probs.push(`${surf}: no LATE button on a card filed after the cut-off`)
    // keyboard: Tab to the name button, Enter then Space
    for (const key of ['Enter', 'Space']) {
      await getTo()
      await p.locator(sel).scrollIntoViewIfNeeded()
      // start from a known place before the card: focus the control that stands first in the root and Tab forward
      await p.evaluate(root => { const r = document.querySelector(root); const f = r.querySelector('button, [tabindex="0"], input'); if (f) f.focus() }, root)
      let reached = false
      for (let i = 0; i < 400; i++) {
        const ok = await p.evaluate(iid => { const a = document.activeElement; return !!a && a.getAttribute('data-testid') && /-open$/.test(a.getAttribute('data-testid')) && (a.closest('[data-testid^="idy-row-"], [data-testid^="inl-row-"]') || {}).getAttribute && ((a.closest('[data-testid^="idy-row-"], [data-testid^="inl-row-"]').getAttribute('data-testid')).endsWith(iid)) }, target.iid)
        if (ok) { reached = true; break }
        await p.keyboard.press('Tab')
      }
      if (!reached) { probs.push(`${surf}/keyboard ${key}: Tab never reached the card's name button`); continue }
      await p.keyboard.press(key === 'Space' ? 'Space' : 'Enter'); await p.waitForTimeout(400)
      const w = await winInfo(p)
      log.push(`${surf}/keyboard ${key}: windows ${w.n}, title "${w.title}"`)
      if (w.n !== 1 || w.title !== 'ZS card title') probs.push(`${surf}/keyboard ${key}: windows ${w.n}, title "${w.title}"`)
      await closeWin(p, T)
    }
    if (surf === 'day') pics.push(await shot(p, `25-${label}-day-after-keyboard`))
  }
  // the day's Delete question on a shared input: Delete, Keep; Delete, confirm
  await goto(surfaces[0][3])
  const sc = p.locator(`${surfaces[0][2]} [data-testid^="${surfaces[0][1]}-row-"]`).filter({ hasText: 'ZS shared' }).first()
  await sc.scrollIntoViewIfNeeded(); await press(T, sc.locator(`[data-testid="${surfaces[0][1]}-title"]`)); await p.locator(WIN).waitFor()
  await p.locator('#inpEditDel').scrollIntoViewIfNeeded(); await press(T, p.locator('#inpEditDel')); await p.waitForTimeout(400)
  const q = await p.locator('[data-testid="inped-delall"]').innerText().catch(() => null)
  pics.push(await shot(p, `25-${label}-delete-question`))
  log.push('delete question: ' + (q || 'none').replace(/\s+/g, ' '))
  if (!q) probs.push('Delete on a shared input asked nothing')
  await press(T, p.locator('[data-testid="inped-delall-no"]')); await p.waitForTimeout(400)
  const after1 = (await recAll(p, { title: 'ZS shared' })).length
  const stillOpen = await p.locator(WIN).count()
  log.push(`after Keep: ${after1} records, window open ${stillOpen}`)
  if (after1 !== 3) probs.push(`Keep changed the data: ${after1} records (3 expected)`)
  if (await p.locator('[data-testid="inped-delall"]').count()) probs.push('the question stayed on screen after Keep')
  await press(T, p.locator('#inpEditDel')); await p.waitForTimeout(400)
  const yes = p.locator('[data-testid="inped-delall-yes"]')
  if (!(await yes.count())) probs.push('no confirm button on the second Delete question')
  else {
    await press(T, yes); await p.waitForTimeout(600)
    const after2 = (await recAll(p, { title: 'ZS shared' })).length
    log.push(`after confirm: ${after2} records`)
    if (after2 !== 0) probs.push(`confirming removed ${3 - after2} of 3 records`)
    const other = await rec(p, { title: 'ZS card title' }); if (!other) probs.push('confirming the shared delete also removed the other input')
    // undo / redo of the delete
    await p.keyboard.press('Escape').catch(() => {})
    if (await p.locator(DAYWIN).count()) await p.keyboard.press('Escape')
    await press(T, p.locator('#undoBtn')); await p.waitForTimeout(500)
    const u = (await recAll(p, { title: 'ZS shared' })).length
    await press(T, p.locator('#redoBtn')); await p.waitForTimeout(500)
    const r = (await recAll(p, { title: 'ZS shared' })).length
    log.push(`Undo -> ${u}, Redo -> ${r}`)
    if (u !== 3 || r !== 0) probs.push(`Undo/Redo of the shared delete: ${u} then ${r} records (3 then 0 expected)`)
  }
  console.log(log.join('\n'))
  judge(25, label, 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || log.slice(0, 40).join(' ## ').slice(0, 900), pics)
  await ctx.close()
}
{
  await run('phone 390', { width: 390, height: 844 }, true, [['day', 'idy', DAYWIN, 'day'], ['list', 'inl', '#inList', 'list']])
  await run('desktop 1440', { width: 1440, height: 900 }, false, [['day', 'idy', DAYWIN, 'day']])
}
await browser.close()
saveRows('s25')
console.log('ERRS', JSON.stringify(errs))
