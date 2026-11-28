// Walker b — B7 (Astra S17): who counts as away. The fixture leave (Ranger + Hex 08:00–10:00); an ALL AVAIL Meeting
// "Brief" 10:30–10:45 filed on the Inputs page; on the Board a ground "+ Item" 10:30–10:45 with an empty place. Read
// BEFORE and AFTER Ranger's leave is extended to 11:00 on his Board row: the crew list with that place picked (each man's
// puck class and words), the ALL AVAIL window's "Who's available", the day's warnings, the Leave War's figures for 15 Jul.
// EXPECTED: each reads Ranger's new hours (away 10:30–10:45 after) and Hex's unchanged (free). RECORD the words.
console.log('shr-b-b7 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b7-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, boardRows, store, pic, J, judge, openDay, ids, press, answerAsks, shownToast } = B
const c = 'B7', P = `b7-${SZ}-${ENG}`
let w
const out = {}
/* an ALL AVAIL Meeting through the Inputs page's own window (copied from allavail-common-walk.mjs fileOne) */
async function fileAllAvail() {
  await openDay(w, B.WED)
  const before = await ids(w.page)
  await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', 'Meeting'); await sleep(300)
  if (await w.page.locator('#inpEditAllday').count() && await w.page.locator('#inpEditAllday').isChecked()) await w.page.locator('#inpEditAllday').uncheck()
  if ((await w.page.locator('[data-testid="pp-several"]').getAttribute('aria-checked')) !== 'true') await press(w, '#inpEditPop [data-testid="pp-several"]')
  const phs = await w.page.locator('#inpEditPop button[data-ph]').evaluateAll(bs => bs.map(b => ({ id: b.dataset.ph, label: b.getAttribute('aria-label'), dis: b.disabled })))
  const a = phs.find(p => /all\s*avail/i.test(p.label || ''))
  if (!a || a.dis) throw new Error('no ALL AVAIL choice: ' + J(phs))
  await press(w, `#inpEditPop button[data-ph="${a.id}"]`)
  const t = w.page.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill('Brief')
  await w.page.fill('#inpEditPop #inpEditStart', '10:30'); await w.page.fill('#inpEditPop #inpEditEnd', '10:45')
  await press(w, '#inpEditSave'); const asked = await answerAsks(w)
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  log(c, `ALL AVAIL Meeting filed: ${J(made)} asked ${J(asked)}`)
  return made[0]
}
const roster = () => w.page.evaluate(() => Object.fromEntries(['bane', 'rocky'].map(id => { const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${id}"]`)].find(x => x.getBoundingClientRect().width > 1); return [id === 'bane' ? 'Ranger' : 'Hex', e ? { cls: e.className, title: e.getAttribute('title'), why: e.getAttribute('data-why'), shown: (e.querySelector('.rwhy')?.textContent || '').trim() } : 'not in the crew list'] })))
const warns = () => w.page.evaluate(() => [...document.querySelectorAll('#schedBoard .witem, #schedBoard [class*="wln"]')].filter(e => e.getBoundingClientRect().width > 1 && /Ranger|Hex/.test(e.textContent || '')).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160)))
async function readAll(tag, place, iidAA, di) {
  const r = {}
  /* the crew list with the empty place picked */
  const pl = w.page.locator(`#schedBoard [data-slot="${place}"], #schedBoard [data-fill="${place}"]`).first()
  if (await pl.count()) { await pl.scrollIntoViewIfNeeded(); await pl.click(); await sleep(500); r.crew = await roster(); r.picCrew = await pic(w, c, `${P}-${tag}-crew`, ['#sbRoster .rpuck[data-person="bane"]', '#sbRoster .rpuck[data-person="rocky"]'], r.crew, { noScroll: true }); await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300) }
  else r.crew = 'the place is gone: ' + place
  /* the ALL AVAIL window from its counter */
  const chip = w.page.locator(`#schedBoard [data-oilsent]`).filter({ visible: true })
  const chips = await chip.evaluateAll(es => es.map(e => (e.closest('.sb-arow, .pl-row, tr')?.textContent || '').replace(/\s+/g, ' ').slice(0, 60) + ' :: ' + e.getAttribute('data-oilsent')))
  const ix = chips.findIndex(t => /Brief/i.test(t))
  if (ix >= 0) {
    await chip.nth(ix).scrollIntoViewIfNeeded(); await chip.nth(ix).click(); await sleep(600)
    r.avail = await w.page.evaluate(() => { const wn = document.querySelector('.availwin:not([hidden])'); if (!wn) return null; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; return { title: t(wn.querySelector('.win-ttl')), tab: t(wn.querySelector('.win-tab.on, .win-one')), ranger: [...wn.querySelectorAll('.puck[data-person="bane"]')].map(e => e.className + ' | ' + (e.getAttribute('title') || '') + ' | ' + t(e.closest('.aw-p, .aw-row, li, div'))), hex: [...wn.querySelectorAll('.puck[data-person="rocky"]')].map(e => e.className + ' | ' + (e.getAttribute('title') || '') + ' | ' + t(e.closest('.aw-p, .aw-row, li, div'))), foot: t(wn.querySelector('.win-foot')) } })
    r.picAvail = await pic(w, c, `${P}-${tag}-allavail`, ['.availwin:not([hidden])'], r.avail, { noScroll: true })
    await w.page.locator('.availwin:not([hidden]) .win-x').first().click().catch(() => {}); await sleep(300)
  } else r.avail = { none: 'no counter chip on the Brief row', chips }
  r.warnings = await warns()
  r.picWarn = await pic(w, c, `${P}-${tag}-warnings`, ['#schedBoard [class*="wln"]', '#schedBoard .witem'], r.warnings)
  return r
}
try {
  w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
  const aa = await fileAllAvail()
  await go(w.page, 'editsched'); await sleep(500)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
  await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  /* a ground "+ Item" 10:30–10:45 (as wr4-c-c4.mjs plant()) */
  const emptyNow = () => w.page.evaluate(() => [...document.querySelectorAll('#schedBoard .seat[data-slot], #schedBoard [data-fill]')].filter(x => x.getBoundingClientRect().width > 4 && !x.querySelector('.puck[data-person]')).map(e => e.getAttribute('data-slot') || e.getAttribute('data-fill')))
  const e0 = await emptyNow()
  const add = w.page.locator(`#schedBoard [data-gradd="${di}"]`).first()
  if (!(await add.count())) throw new Error('no "+ Item" on the Board')
  await add.scrollIntoViewIfNeeded(); await add.click(); await sleep(700)
  for (const [f, v] of [['str', '1030'], ['end', '1045']]) {
    const box = w.page.locator(`#schedBoard [data-txt^="gr:${di}."][data-txt$=".${f}"], #schedBoard [data-bfld^="gr:${di}."][data-bfld$=".${f}"]`).last()
    await box.scrollIntoViewIfNeeded(); await box.click(); const tg = await box.evaluate(e => e.tagName); if (tg === 'INPUT') await box.fill(v); else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v) } await w.page.keyboard.press('Tab'); await sleep(300)
  }
  await w.page.mouse.click(3, 3); await sleep(500)
  const e1 = await emptyNow()
  const place = e1.find(x => !e0.includes(x))
  log(c, `ground item added; new empty place ${place} (before ${J(e0)}, after ${J(e1)})`)
  if (!place) throw new Error('no new empty place after "+ Item"')
  out.before = await readAll('1-before', place, aa, di)
  log(c, 'BEFORE ' + J(out.before))
  /* Ranger's end 1100 on his Board row */
  const k = (await boardRows(w.page)).find(r => r.startsWith('Ranger')).match(/\[(.+)\]/)[1].replace(/\.str$/, '.end')
  const b = w.page.locator(`#schedBoard [data-ifld="${k}"]`).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); await b.click(); await sleep(200)
  await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('1100'); await w.page.keyboard.press('Tab'); await sleep(600)
  await w.page.mouse.click(3, 3); await sleep(700)
  out.store = await store(w.page); out.rows = await boardRows(w.page)
  log(c, 'after 1100: ' + J({ store: out.store, rows: out.rows }))
  out.after = await readAll('2-after', place, aa, di)
  log(c, 'AFTER ' + J(out.after))
  /* the Leave War's figures for 15 Jul */
  await w.page.locator('#sbDone:visible, #sbClose:visible').first().click().catch(() => {}); await sleep(500)
  await go(w.page, 'leavewar'); await sleep(1200)
  const mon = w.page.locator('[data-testid="month-Jul"]').first(); if (await mon.count()) { await mon.click(); await sleep(1200) }
  out.lw = await w.page.evaluate(() => { const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim(); return { cells: Object.fromEntries(['bane', 'rocky'].map(p => [p, (() => { const td = document.querySelector(`[data-testid="cell-${p}-2026-07-15"]`); return td ? t(td) + ' {' + td.className + '}' : null })()])), col: [...document.querySelectorAll('[data-testid$="2026-07-15"]')].filter(e => !/^cell-/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid') + ': ' + t(e)).slice(0, 12) } })
  await w.page.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-07-15"]')?.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  out.picLW = await pic(w, c, `${P}-3-leavewar`, ['[data-testid="cell-bane-2026-07-15"]', '[data-testid="cell-rocky-2026-07-15"]'], out.lw, { noScroll: true })
  log(c, 'Leave War ' + J(out.lw))
  const crewOk = out.before.crew?.Ranger?.cls && !/\bno\b/.test(out.before.crew.Ranger.cls) && /\bno\b/.test(out.after.crew?.Ranger?.cls || '') && !/\bno\b/.test(out.after.crew?.Hex?.cls || 'no')
  judge(c, cfg, crewOk ? 'PASS' : 'FAIL', { store: out.store, crewBefore: out.before.crew, crewAfter: out.after.crew }, [out.before.picCrew, out.after.picCrew].filter(Boolean).join(', '))
  judge(c + ' words', cfg, 'RECORD', { before: { avail: out.before.avail, warnings: out.before.warnings }, after: { avail: out.after.avail, warnings: out.after.warnings }, leaveWar: out.lw }, [out.before.picAvail, out.after.picAvail, out.before.picWarn, out.after.picWarn, out.picLW].filter(Boolean).join(', '))
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400) + ' :: ' + J(out).slice(0, 600)) }
try { await w?.ctx.close() } catch {}
await B.done()
