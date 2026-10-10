// Scenario 27 — excluded surfaces (admin and member, desktop): no Title control on SANS's commitment editor, a leave, a medical entry, an Upchit;
// Events titled "LL", "ATT B", "SANS Availability" create no leave, medical or SANS record and stay Events.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, win, gotoInputs, toCal, month, tapAt, norm, DAYWIN } from './it-A-lib.mjs'
import { calDoor, penDoor, showAll } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s27')
for (const role of ['admin', 'member']) {
  const { ctx, page } = await open(browser, 'desk', role === 'admin' ? 'ad' : 'us', role === 'admin' ? 'a' : 'us')
  const P = await people(page)
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  try {
    const counts = () => page.evaluate(() => { const c = {}; for (const r of window.INPUTS) c[r.type] = (c[r.type] || 0) + 1; return c })
    const c0 = await counts()
    const badges = () => page.evaluate(() => (document.querySelector('#inMedBtn') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim())
    // the existing kinds, opened in the Inputs window through their ordinary route (the month's day card)
    const target = { LL: null, OML: null, 'ATT C': null, Upchit: null }
    const all = await allRecs(page)
    for (const k of Object.keys(target)) target[k] = all.find(r => r.type === k)
    for (const [k, r] of Object.entries(target)) {
      if (!r) { say.push(`NOTE no ${k} input exists in the demo to open`); continue }
      await gotoInputs(page); await toCal(page); await closeAnyWin(page)
      if (role === 'member') { if (!(await page.locator('#inFPerson').isVisible())) await press(page, page.locator('#inFiltersBtn')); await page.selectOption('#inFPerson', 'all').catch(() => {}) ; await sleep(page, 200) }
      const MONN = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8 }; const [mm, dd] = r.date.split(' ')
      const iso = `2026-${String(MONN[mm]).padStart(2, '0')}-${String(+dd).padStart(2, '0')}`
      await month(page, 2026, MONN[mm])
      await tapAt(page, page.locator(`#inpCal [data-icday="${iso}"]`), { x: 8, y: 8 })
      const ids = (await allRecs(page)).filter(x => x.date === r.date && x.type === k).map(x => x.iid)
      const open1 = page.locator(ids.map(i => `[data-testid="idy-row-${i}"] [data-testid="idy-open"]`).join(', ')).first()
      await open1.waitFor({ timeout: 8000 }); await press(page, open1); await win(page).waitFor(); await sleep(page, 250)
      const n = await page.locator('[data-testid="win-inputedit"] #inpEditTitle').count()
      const ty = await page.locator('[data-testid="win-inputedit"] #inpEditType').inputValue().catch(async () => norm(await page.locator('[data-testid="win-inputedit"] #inpEditTypeFixed').innerText().catch(() => '?')))
      need(n === 0, `${k} (${r.date}) opened in its window as ${role}: Type "${ty}", Title controls found ${n}`)
      pics.push(await shot(page, `s27-${role}-${k.replace(' ', '')}`))
      await closeAnyWin(page)
    }
    // the SANS commitment editor
    await gotoInputs(page); await closeAnyWin(page)
    await press(page, page.locator('#inSansMode')); await page.locator('[data-testid="sanscal"]').waitFor()
    await press(page, page.locator('[data-testid="sc-day-2026-07-22"]').first().or(page.locator('[data-testid^="sc-day-"]').first())); await page.locator('[data-testid="win-sansday"]').waitFor()
    const add = page.locator('[data-testid="sd-add"]')
    if (await add.isEnabled()) {
      await press(page, add); await win(page).waitFor(); await sleep(page, 300)
      const n = await page.locator('[data-testid="win-inputedit"] #inpEditTitle').count()
      need(n === 0, `SANS "+ Commitment" editor as ${role}: Title controls found ${n}`)
      pics.push(await shot(page, `s27-${role}-sans-editor`))
      await closeAnyWin(page)
    } else say.push(`NOTE the SANS "+ Commitment" button is disabled for ${role} (${norm(await page.locator('[data-testid="sd-addwhy"]').innerText().catch(() => ''))}), so no SANS editor opens - nothing to look at there`)
    // an existing SANS commitment's editor, if the demo has one
    const sans = all.find(r => r.type === 'SANS Availability')
    if (sans) say.push(`NOTE the demo has ${all.filter(r => r.type === 'SANS Availability').length} SANS availability input(s)`)
    const sx = page.locator('[data-testid="win-sansday-x"]'); if (await sx.count()) await press(page, sx.first())
    await gotoInputs(page); await closeAnyWin(page); await toCal(page)
    // Events titled LL / ATT B / SANS Availability
    const c = calDoor(); const who = role === 'admin' ? P.Ranger : undefined
    const before = await counts(); const b0 = await badges()
    let h = 8
    for (const t of ['LL', 'ATT B', 'SANS Availability']) {
      await c.openNew(page, { iso: '2026-07-22', person: who, type: 'Event', st: `0${h}:00`.slice(-5), en: `0${h + 1}:00`.slice(-5) }); h++
      await page.fill('#inpEditTitle', t); await c.submit(page); await closeAnyWin(page)
    }
    const after = await counts()
    const diff = Object.fromEntries(Object.keys({ ...before, ...after }).map(k => [k, (after[k] || 0) - (before[k] || 0)]).filter(([, v]) => v))
    need(JSON.stringify(diff) === JSON.stringify({ Event: 3 }), `after filing Events titled LL, ATT B and SANS Availability the stored kinds changed by ${JSON.stringify(diff)} (only 3 Events wanted)`)
    const evs = (await allRecs(page)).filter(r => ['LL', 'ATT B', 'SANS Availability'].includes(r.title))
    need(evs.length === 3 && evs.every(r => r.type === 'Event'), `the three are ${evs.map(r => r.type + ' "' + r.title + '"').join(', ')}`)
    // SANS calendar and the badges: no offer on that date, no new medical/leave count
    const b1 = await badges(); say.push(`tab badges before "${b0}" after "${b1}"`)
    need(b0 === b1 && b0 !== '', `the Medical tab's counts did not move ("${b0}" before, "${b1}" after)`)
    await press(page, page.locator('#inSansMode')); await page.locator('[data-testid="sanscal"]').waitFor()
    await press(page, page.locator('[data-testid="sc-day-2026-07-22"]').first()); await page.locator('[data-testid="win-sansday"]').waitFor(); await sleep(page, 250)
    const rows = await page.locator('[data-testid^="sd-row-"]').count()
    say.push(`the SANS day window for 22 Jul lists ${rows} commitment row(s)`)
    need(rows === 0, `no SANS offer was made by an Event titled "SANS Availability" (rows ${rows})`)
    pics.push(await shot(page, `s27-${role}-sans-day`))
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, `s27-${role}-err`).catch(() => {}) }
  T.add({ n: 27, size: page.sizeName, role: role === 'admin' ? 'admin' : 'member (Ranger)', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
