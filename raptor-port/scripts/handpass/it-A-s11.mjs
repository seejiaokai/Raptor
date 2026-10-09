// Scenario 11 — Other, three distinct cases (admin): titled + remark, untitled + remark = the title text, titled + same remark.
import { launch, open, table, errs, people, shot, elShot, sleep, press, allRecs, openNew, saveWin, win, tapAt, closeAnyWin, gotoInputs, DAYWIN, norm } from './it-A-lib.mjs'
import { showAll } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s11')
for (const size of (process.argv[2] || 'desk,phone').split(',')) {
  const { ctx, page } = await open(browser, size)
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  try {
    const P = await people(page)
    const cases = [
      { k: 'a', title: 'Dental visit', rmk: 'Bring letter', st: '08:00', en: '09:00', wantName: 'Dental visit', wantRmk: 'Bring letter' },
      { k: 'b', title: null, rmk: 'Dental visit', st: '10:00', en: '11:00', wantName: 'Other', wantRmk: 'Dental visit' },
      { k: 'c', title: 'Dental visit', rmk: 'Dental visit', st: '12:00', en: '13:00', wantName: 'Dental visit', wantRmk: 'Dental visit' },
    ]
    const ids = {}
    for (const c of cases) {
      const before = new Set((await allRecs(page)).map(r => r.iid))
      await openNew(page, '2026-07-22')
      await page.selectOption('#inpEditPerson', P.Ranger); await page.selectOption('#inpEditType', 'Other')
      await page.fill('#inpEditStart', c.st); await page.fill('#inpEditEnd', c.en)
      if (c.title) await page.fill('#inpEditTitle', c.title)
      await page.fill('#inpEditRmk', c.rmk)
      await saveWin(page)
      const r = (await allRecs(page)).find(x => !before.has(x.iid))
      ids[c.k] = r && r.iid
      need(!!r && r.type === 'Other' && (c.title ? r.title === c.title : r.title == null) && r.remarks === c.rmk, `case ${c.k}: stored Other, title ${JSON.stringify(r && r.title)}, remark ${JSON.stringify(r && r.remarks)}`)
    }
    /* the opened day */
    if (!(await page.locator(DAYWIN).count())) await tapAt(page, page.locator('#inpCal [data-icday="2026-07-22"]'), { x: 8, y: 8 })
    await sleep(page, 300)
    const day = await page.evaluate(ids => Object.fromEntries(Object.entries(ids).map(([k, id]) => { const c = document.querySelector(`[data-testid="idy-row-${id}"]`); return [k, c && { name: (c.querySelector('.idy-kind') || {}).textContent, tag: (c.querySelector('[data-testid="idy-kindtag"]') || {}).textContent || null, rmk: (c.querySelector('.sd-rmk') || {}).textContent || null }] })), ids)
    for (const c of cases) {
      const d = day[c.k]
      need(!!d && d.name === c.wantName && d.rmk === c.wantRmk, `opened day, case ${c.k}: named "${d && d.name}", kind tag ${JSON.stringify(d && d.tag)}, remark shown "${d && d.rmk}" (wanted "${c.wantName}" / "${c.wantRmk}")`)
    }
    pics.push(await elShot(page, DAYWIN, `s11-${size}-day`))
    await closeAnyWin(page)
    /* the List */
    await gotoInputs(page); await press(page, page.locator('#inListBtn')); await showAll(page)
    const list = await page.evaluate(ids => Object.fromEntries(Object.entries(ids).map(([k, id]) => { const t = document.querySelector(`#inBody tr[data-iid="${id}"]`); return [k, t && { title: (t.querySelector('[data-testid="in-title"]') || {}).textContent || null, kind: (t.querySelector('.intag') || {}).textContent, rmk: (t.querySelector('[data-label="Remarks"]') || {}).textContent }] })), ids)
    for (const c of cases) {
      const d = list[c.k]
      const nameShown = d && (d.title || d.kind)
      need(!!d && nameShown === c.wantName && (d.rmk || '').includes(c.wantRmk), `List, case ${c.k}: title line ${JSON.stringify(d && d.title)}, kind "${d && d.kind}", remarks cell "${norm(d && d.rmk).slice(0, 60)}"`)
    }
    await page.locator(`#inBody tr[data-iid="${ids.a}"]`).first().scrollIntoViewIfNeeded()
    pics.push(await shot(page, `s11-${size}-list`))
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 4).join(' | ')); await shot(page, `s11-${size}-err`).catch(() => {}) }
  T.add({ n: 11, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
