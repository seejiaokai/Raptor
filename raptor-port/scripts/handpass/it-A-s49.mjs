// Scenario 49 — Undo stays on the visible item (admin, desktop).
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, win, gotoInputs, toCal, month, tapAt, norm, recs } from './it-A-lib.mjs'
import { calDoor, penDoor, showAll } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s49')
const { ctx, page } = await open(browser, 'desk')
const P = await people(page)
const say = []; let ok = true; const pics = []
const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
const d = calDoor()
const topBarBottom = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); let e = b; while (e && e.parentElement && getComputedStyle(e).position !== 'fixed' && getComputedStyle(e).position !== 'sticky') e = e.parentElement; const r = (e && e !== document.body ? e : b).getBoundingClientRect(); return Math.round(r.bottom) })
const rowInfo = iid => page.evaluate(iid => { const t = document.querySelector(`#inBody tr[data-iid="${iid}"]`); if (!t) return null; const r = t.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, sy: Math.round(document.scrollingElement.scrollTop), title: (t.querySelector('[data-testid="in-title"]') || {}).textContent || null, kind: (t.querySelector('.intag') || {}).textContent, idx: [...t.parentElement.children].indexOf(t), n: t.parentElement.children.length } }, iid)
const retitleViaPencil = async (iid, title) => {
  const tr = page.locator(`#inBody tr[data-iid="${iid}"]`).first(); await tr.scrollIntoViewIfNeeded()
  await press(page, tr.locator('[data-edit]')); await page.locator('#inBody tr.ined').waitFor()
  await page.locator('#inBody tr.ined input[data-ed="title"]').fill(title)
  await press(page, page.locator('#inBody tr.ined [data-save]')); await sleep(page, 600)
  const sh = page.locator('[data-testid="oilconf"]'); if (await sh.count()) { await press(page, sh.locator('[data-testid="oil-no"]')); await press(page, sh.locator('[data-testid="oilconf-save"]')); await sleep(page, 400) }
}
try {
  // an Event midway down the List (an Event for Ranger on 17 Jul sits in the middle of the date-ordered list)
  const before = new Set((await allRecs(page)).map(r => r.iid))
  await d.openNew(page, { iso: '2026-07-17', person: P.Ranger, type: 'Event', st: '10:00', en: '11:00' }); await d.submit(page); await closeAnyWin(page)
  const rec = (await allRecs(page)).find(r => !before.has(r.iid))
  await gotoInputs(page); await press(page, page.locator('#inListBtn')); await showAll(page)
  await retitleViaPencil(rec.iid, 'Mid retitle')
  const tb = await topBarBottom()
  // (a) row fully visible: undo and redo must not move it
  await page.locator(`#inBody tr[data-iid="${rec.iid}"]`).first().scrollIntoViewIfNeeded()
  await page.evaluate(iid => document.querySelector(`#inBody tr[data-iid="${iid}"]`).scrollIntoView({ block: 'center' }), rec.iid); await sleep(page, 300)
  const a0 = await rowInfo(rec.iid)
  need(a0.title === 'Mid retitle' && a0.idx > 10 && a0.top >= tb && a0.bottom <= a0.vh, `the retitled row is ${a0.idx + 1} of ${a0.n}, fully on screen (top ${a0.top}, bottom ${a0.bottom}, screen ${a0.vh}, top bar ends ${tb}), reads "${a0.title}"`)
  pics.push(await shot(page, 's49-1-before-undo'))
  await press(page, page.locator('#undoBtn')); await sleep(page, 600)
  const a1 = await rowInfo(rec.iid)
  need(a1 && a1.title === null && a1.kind === 'Event' && Math.abs(a1.top - a0.top) <= 3 && Math.abs(a1.sy - a0.sy) <= 3, `Undo with the row in view: the row now reads kind "${a1 && a1.kind}" with no title and stayed where it was (top ${a0.top} to ${a1 && a1.top}, page scroll ${a0.sy} to ${a1 && a1.sy})`)
  pics.push(await shot(page, 's49-2-after-undo-visible'))
  await press(page, page.locator('#redoBtn')); await sleep(page, 600)
  const a2 = await rowInfo(rec.iid)
  need(a2 && a2.title === 'Mid retitle' && Math.abs(a2.top - a0.top) <= 3 && Math.abs(a2.sy - a0.sy) <= 3, `Redo with the row in view: it reads "${a2 && a2.title}" and stayed where it was (top ${a0.top} to ${a2 && a2.top}, page scroll ${a0.sy} to ${a2 && a2.sy})`)
  pics.push(await shot(page, 's49-3-after-redo-visible'))
  // (b) the row out of view: scroll to the top of the list, then Undo - it must be brought into view below the top bar
  await page.evaluate(() => { document.scrollingElement.scrollTop = 0 }); await sleep(page, 300)
  const b0 = await rowInfo(rec.iid)
  need(b0.top > b0.vh, `out of view: the row is below the screen (top ${b0.top}, screen ${b0.vh})`)
  await press(page, page.locator('#undoBtn')); await sleep(page, 900)
  const b1 = await rowInfo(rec.iid)
  need(b1 && b1.top >= tb - 1 && b1.bottom <= b1.vh && b1.kind === 'Event' && b1.title === null, `Undo with the row out of view: the row was brought on screen below the top bar (top ${b1 && b1.top}, bottom ${b1 && b1.bottom}, top bar ends ${tb}) and reads kind "${b1 && b1.kind}", title ${JSON.stringify(b1 && b1.title)}`)
  pics.push(await shot(page, 's49-4-undo-out-of-view'))
  await page.evaluate(() => { document.scrollingElement.scrollTop = 0 }); await sleep(page, 300)
  await press(page, page.locator('#redoBtn')); await sleep(page, 900)
  const b2 = await rowInfo(rec.iid)
  need(b2 && b2.top >= tb - 1 && b2.bottom <= b2.vh && b2.title === 'Mid retitle', `Redo with the row out of view: brought on screen (top ${b2 && b2.top}, bottom ${b2 && b2.bottom}) reading "${b2 && b2.title}"`)
  pics.push(await shot(page, 's49-5-redo-out-of-view'))
  // (c) the Calendar: an in-month retitle, then Undo - the month and the tab stay
  await press(page, page.locator('#inCalBtn')); await sleep(page, 300); await month(page, 2026, 7)
  await d.openSaved(page, rec)
  await page.fill('#inpEditTitle', 'Calendar retitle'); await press(page, page.locator('#inpEditSave')); await sleep(page, 600)
  const sh = page.locator('[data-testid="oilconf"]'); if (await sh.count()) { await press(page, sh.locator('[data-testid="oil-no"]')); await press(page, sh.locator('[data-testid="oilconf-save"]')); await sleep(page, 400) }
  await closeAnyWin(page)
  const m0 = norm(await page.locator('#inpCal .ic-mon').innerText())
  pics.push(await shot(page, 's49-6-calendar-before-undo'))
  await press(page, page.locator('#undoBtn')); await sleep(page, 700)
  const m1 = norm(await page.locator('#inpCal .ic-mon').innerText().catch(() => 'GONE')), pg = await page.evaluate(() => window.CURPAGE), calVis = await page.locator('#inpCal').isVisible().catch(() => false)
  const t1 = (await recs(page, { iid: rec.iid }))[0].title
  need(m1 === m0 && calVis && pg === 'inputs' && t1 === 'Mid retitle', `Calendar Undo: month "${m0}" to "${m1}", page "${pg}", calendar still showing ${calVis}, stored title back to "${t1}"`)
  pics.push(await shot(page, 's49-7-calendar-after-undo'))
  // and from another month: view August, then Undo a July retitle
  await press(page, page.locator('#redoBtn')); await sleep(page, 500)
  await press(page, page.locator('#icNext')); await sleep(page, 300)
  const m2 = norm(await page.locator('#inpCal .ic-mon').innerText())
  await press(page, page.locator('#undoBtn')); await sleep(page, 700)
  const m3 = norm(await page.locator('#inpCal .ic-mon').innerText().catch(() => 'GONE')), pg3 = await page.evaluate(() => window.CURPAGE)
  say.push(`NOTE viewing ${m2} and pressing Undo of a July retitle: the month shows "${m3}", page "${pg3}"`)
  pics.push(await shot(page, 's49-8-undo-from-another-month'))
} catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's49-err').catch(() => {}) }
T.add({ n: 49, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
T.save()
await ctx.close(); await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
