// Scenarios 15 and 16 — a second edit behind an open window (admin, desktop).
// 15: the List pencil saves another title behind the window -> "Changed while this window was open", Keep mine / Take theirs.
// 16: the List pencil saves only the remark behind the window -> no invented conflict, nothing lost.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, win, norm, toCal, tapAt, gotoInputs, recs, month } from './it-A-lib.mjs'
import { calDoor, penDoor, showAll, mateIds } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s15')
const { ctx, page } = await open(browser, 'desk')
const P = await people(page)
const d = calDoor()
const iso = '2026-07-22'
const mk = async (st, en, person) => {
  const before = new Set((await allRecs(page)).map(r => r.iid))
  await d.openNew(page, { iso, person, type: 'Event', st, en }); await d.submit(page)
  await closeAnyWin(page)
  return (await allRecs(page)).find(r => !before.has(r.iid))
}
const get = async iid => (await recs(page, { iid }))[0]
/** the window open on the saved input with a draft title; then, BEHIND it, the List pencil saves `change` */
async function windowThenPencil(rec, draftTitle, change) {
  await d.openSaved(page, rec)
  if (draftTitle != null) await page.fill('#inpEditTitle', draftTitle)
  // behind the window: the List toggle, the row's pencil
  await press(page, page.locator('#inListBtn')); await sleep(page, 300)
  await showAll(page)
  const tr = page.locator(`#inBody tr[data-iid="${rec.iid}"]`).first(); await tr.waitFor(); await tr.scrollIntoViewIfNeeded()
  await press(page, tr.locator('[data-edit]')); await page.locator('#inBody tr.ined').waitFor()
  if (change.title != null) await page.locator('#inBody tr.ined input[data-ed="title"]').fill(change.title)
  if (change.remarks != null) await page.locator('#inBody tr.ined input[data-ed="remarks"], #inBody tr.ined [data-ed="remarks"]').first().fill(change.remarks)
  await press(page, page.locator('#inBody tr.ined [data-save]')); await sleep(page, 600)
  const sh = page.locator('[data-testid="oilconf"]'); if (await sh.count()) { await press(page, sh.locator('[data-testid="oil-no"]')); await press(page, sh.locator('[data-testid="oilconf-save"]')); await sleep(page, 400) }
}
const clashBox = () => page.locator('[data-testid="inped-clash"]')

/* ---------- 15 ---------- */
{
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  try {
    for (const choice of ['mine', 'theirs']) {
      const rec = await mk(choice === 'mine' ? '08:00' : '10:00', choice === 'mine' ? '09:00' : '11:00', P.Ranger)
      await windowThenPencil(rec, 'Window choice', { title: 'List choice' })
      await sleep(page, 400)
      const shown = await win(page).count() > 0 && await clashBox().isVisible().catch(() => false)
      const txt = norm(await clashBox().innerText().catch(() => ''))
      need(shown, `${choice}: the window stayed open and shows "Changed while this window was open"`)
      need(/Changed while this window was open/.test(txt) && /title/i.test(txt) && /List choice/.test(txt) && /Window choice/.test(txt), `${choice}: the notice reads "${txt}"`)
      pics.push(await shot(page, `s15-${choice}-1-notice`))
      // Save before choosing is refused
      await press(page, page.locator('#inpEditSave')); await sleep(page, 700)
      const s1 = await get(rec.iid)
      need(s1.title === 'List choice' && (await win(page).count()) > 0 && await clashBox().isVisible().catch(() => false), `${choice}: Save before choosing was refused - stored title stays "${s1.title}", the notice stays (toast "${norm(await page.locator('#toastEl').innerText().catch(() => ''))}")`)
      pics.push(await shot(page, `s15-${choice}-2-save-refused`))
      await press(page, page.locator(`[data-testid="inped-clash-${choice}-title"]`)); await sleep(page, 300)
      const boxNow = await page.inputValue('#inpEditTitle')
      need(boxNow === (choice === 'mine' ? 'Window choice' : 'List choice'), `${choice}: after choosing, the Title box reads "${boxNow}"`)
      await press(page, page.locator('#inpEditSave')); await sleep(page, 700)
      const sh = page.locator('[data-testid="oilconf"]'); if (await sh.count()) { await press(page, sh.locator('[data-testid="oil-no"]')); await press(page, sh.locator('[data-testid="oilconf-save"]')); await sleep(page, 400) }
      const s2 = await get(rec.iid)
      need(s2.title === (choice === 'mine' ? 'Window choice' : 'List choice'), `${choice}: saved - stored title "${s2.title}"`)
      need((await win(page).count()) === 0, `${choice}: the window closed on the save`)
      pics.push(await shot(page, `s15-${choice}-3-saved`))
      await closeAnyWin(page)
    }
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's15-err').catch(() => {}) }
  T.add({ n: 15, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
}
/* ---------- 16 ---------- */
{
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  try {
    const rec = await mk('12:00', '13:00', P.Ranger)
    await windowThenPencil(rec, 'Window choice', { remarks: 'Remark behind' })
    await sleep(page, 400)
    const open1 = (await win(page).count()) > 0
    need(open1 && !(await clashBox().isVisible().catch(() => false)), `the window stayed open and shows no conflict notice (notice visible: ${await clashBox().isVisible().catch(() => false)})`)
    need((await page.inputValue('#inpEditTitle')) === 'Window choice', `the draft title is still "${await page.inputValue('#inpEditTitle')}"`)
    need((await page.inputValue('#inpEditRmk')) === 'Remark behind', `the window's Remarks box now reads "${await page.inputValue('#inpEditRmk')}"`)
    pics.push(await shot(page, 's16-1-window-after-remark-change'))
    await press(page, page.locator('#inpEditSave')); await sleep(page, 700)
    const s = await get(rec.iid)
    need(s.title === 'Window choice' && s.remarks === 'Remark behind', `after the window's Save: title "${s.title}", remark "${s.remarks}" - both kept`)
    pics.push(await shot(page, 's16-2-saved'))
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's16-err').catch(() => {}) }
  T.add({ n: 16, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
}
await ctx.close(); await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
