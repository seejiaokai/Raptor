// Scenario 6 — several people: a shared Event for Ranger and Saber through the Calendar window and the List's Add form,
// admin and member filer. T2 T3 T5 T6 T8 on creation and on the saved shared window.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, enableMemberFiling, asMember, gotoInputs, closeAnyWin, month } from './it-A-lib.mjs'
import { calDoor, listDoor, runCase, showAll } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s6')
const SIZES = (process.argv[2] || 'desk,phone').split(',')
const ROLES = (process.argv[3] || 'admin,member').split(',')
const cases = ['T2', 'T3', 'T5a', 'T5b', 'T6', 'T8']
const CAL_DAYS = ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-27']
const LIST_DAYS = ['2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31', '2026-08-03', '2026-08-04']
const SAVED_DAYS = ['2026-08-05', '2026-08-06', '2026-08-07', '2026-08-10', '2026-08-11', '2026-08-12']

for (const size of SIZES) for (const role of ROLES) {
  const { ctx, page } = await open(browser, size)
  const P = await people(page)
  const pair = [P.Ranger, P.Saber]
  if (role === 'member') { await enableMemberFiling(page); await asMember(page, 'Ranger') }
  const tag = `s6-${size === 'phone' ? 'p' : 'd'}-${role === 'admin' ? 'a' : 'm'}`
  const out = []
  const run = async (label, door, c, base, t) => {
    try { const r = await runCase(page, door, c, base, t); out.push({ label, c, ...r }); console.log(label, c, r.ok ? 'ok' : 'NO', r.say.slice(0, 500)); return r }
    catch (e) { out.push({ label, c, ok: false, say: 'SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 6).join(' | '), pics: [] }); console.log(label, c, 'ERR', String(e.message).split('\n').slice(0, 6).join(' | ')); await shot(page, `${t}-${c}-err`).catch(() => {}); try { await closeAnyWin(page) } catch {} }
  }
  /* creation: the Calendar window, then the List's Add form */
  for (const [i, c] of cases.entries()) await run('create/cal', calDoor(), c, { iso: CAL_DAYS[i], several: pair, st: '14:00', en: '15:00', expectCount: 2 }, `${tag}-cal-new`)
  for (const [i, c] of cases.entries()) await run('create/list', listDoor(), c, { iso: LIST_DAYS[i], several: pair, st: '14:00', en: '15:00', expectCount: 2 }, `${tag}-list-new`)
  /* the saved shared window: a fresh untitled shared Event for each case, then retitled in its window */
  for (const [i, c] of cases.entries()) {
    try {
      const before = new Set((await allRecs(page)).map(r => r.iid))
      const d0 = calDoor()
      await d0.openNew(page, { iso: SAVED_DAYS[i], several: pair, type: 'Event', st: '14:00', en: '15:00' })
      await d0.submit(page)
      const fx = (await allRecs(page)).filter(r => !before.has(r.iid))
      if (fx.length !== 2) { out.push({ label: 'saved/cal', c, ok: false, say: `fixture made ${fx.length} rows`, pics: [] }); continue }
      await run('saved/cal', calDoor(), c, { rec: fx[0] }, `${tag}-cal-saved`)
    } catch (e) { out.push({ label: 'saved/cal', c, ok: false, say: 'SCRIPT ERROR (fixture) ' + String(e.message).split('\n').slice(0, 4).join(' | '), pics: [] }); console.log('saved fixture', c, 'ERR', String(e.message).split('\n')[0]); await closeAnyWin(page).catch(() => {}) }
  }
  /* both people, through the List's person filter: the same titles, one entry each */
  let filt = {}
  try {
    await gotoInputs(page); await closeAnyWin(page)
    await press(page, page.locator('#inListBtn')); await showAll(page)
    if (!(await page.locator('#inFPerson').isVisible())) await press(page, page.locator('#inFiltersBtn'))
    for (const [nm, id] of [['Ranger', P.Ranger], ['Saber', P.Saber]]) {
      await page.selectOption('#inFPerson', id); await sleep(page, 300)
      filt[nm] = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => ({ d: (t.querySelector('[data-label="Start"]') || {}).textContent.trim().slice(0, 7), t: (t.querySelector('[data-testid="in-title"]') || {}).textContent || '', k: (t.querySelector('.intag') || {}).textContent })))
    }
    await shot(page, `${tag}-filter-saber`)
  } catch (e) { filt = { err: String(e.message).split('\n')[0] } }
  const evOnly = a => (a || []).filter(x => x.k === 'Event')
  const sameTitles = JSON.stringify(evOnly(filt.Ranger)) === JSON.stringify(evOnly(filt.Saber))
  const bad = out.filter(x => !x.ok)
  console.log('FILTER', JSON.stringify(filt).slice(0, 1500), 'same', sameTitles)
  T.add({ n: 6, size: page.sizeName, role: role === 'admin' ? 'admin' : 'member filer (Ranger)', verdict: bad.length || !sameTitles ? 'FAIL' : 'PASS',
    say: (bad.length ? 'Missed: ' + bad.map(b => `${b.label} ${b.c}: ${b.say}`).join(' || ') : 'T2 T3 T5 T6 T8 held at the Calendar window and List Add (creation) and at the saved shared window: both people carry one title, one shared group') + ` · person filter, Event rows of Ranger vs Saber identical (dates, titles): ${sameTitles} (Ranger ${evOnly(filt.Ranger).length} Event rows, Saber ${evOnly(filt.Saber).length})`,
    pics: out.flatMap(x => x.pics), detail: { out, filt } })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
