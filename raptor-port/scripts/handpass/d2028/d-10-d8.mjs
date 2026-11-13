/* d-10-d8 v1 — D8: a real change still shows (desktop): a whole-day local leave filed on the published Saturday, then deleted.
   usage (from raptor-port/): node scripts/handpass/d2028/d-10-d8.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d8-' + KIND
console.log('d-10-d8 v1', KIND, process.env.HP_SHOTS)
const F = await import('./d-lib2.mjs')
const A = await import('../aa-A-lib.mjs')
const { D, X, L, sleep, j, SAT } = F
const w = await D.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'P' : 'D'
console.log('bundle', await D.bundle(page))
const iso = D.ISO[SAT]
await F.buildD1(w, { logic: true })
const rr = (tag) => D.readOne(w, 'view', tag, SAT, /Briefing/)
const base = { view: await rr('d8-0-base'), face: await D.face(w, 'd8-0-base', SAT) }
console.log('BASE', j(base))
const man = (base.view.people || []).find(x => x !== 'Ranger')
const manId = Object.keys(w.CS).find(k => w.CS[k] === man)
console.log('man behind the puck', man, manId)
// file the leave through the Inputs page
await A.toInputs(page); await A.calView(page)
await A.openDay(page, iso)
await D.shot(page, 'd8-1-day-open')
await page.locator('#icPopAdd').click()
await page.waitForSelector('[data-testid="win-inputedit"], #inpEditPop', { timeout: 5000 }); await sleep(300)
const types = await page.locator('#inpEditType option').evaluateAll(os => os.map(o => o.value + '=' + o.text))
console.log('types', j(types))
const lt = types.find(t => t.startsWith('LL='))
console.log('chosen type', lt)
await page.selectOption('#inpEditType', lt.split('=')[0])
await page.selectOption('#inpEditPerson', manId)
console.log('allday', await page.locator('#inpEditAllday').count() ? await page.locator('#inpEditAllday').isChecked() : 'no allday box')
await D.shot(page, 'd8-2-editor-filled')
await page.locator('#inpEditSave').click(); await sleep(800)
const asked = await page.locator('[data-testid="oilconf"]:visible').count()
console.log('OIL asked?', asked)
await D.shot(page, 'd8-3-after-save')
await A.closeWins(page)
const after = { view: await rr('d8-4-filed'), face: await D.face(w, 'd8-4-filed', SAT) }
console.log('FILED', j(after))
// delete the leave: from the day's own list
await A.toInputs(page); await A.calView(page); await A.openDay(page, iso); await sleep(400)
await D.shot(page, 'd8-5-day-before-delete')
console.log('day buttons', await page.evaluate(() => [...document.querySelectorAll('[data-testid*="win-inputsday"] button, [data-testid*="win-inputsday"] [data-inpedit], #icPop button')].filter(b => b.offsetWidth).map(b => (b.id || '') + '|' + (b.dataset.inpedit || '') + '|' + (b.getAttribute('aria-label') || '') + '|' + b.innerText.trim().slice(0, 20)).join('\n')))
row: {
  const edit = page.locator('[data-inpedit]:visible').first()
  if (await edit.count()) { await edit.click(); await sleep(600) }
  await D.shot(page, 'd8-6-editor-for-delete')
  console.log('editor buttons', await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] button, #inpEditPop button')].filter(b => b.offsetWidth).map(b => b.id + '|' + b.innerText.trim().slice(0, 20)).join('\n')))
  const del = page.locator('#inpEditDelete:visible, [data-testid="inpedit-delete"]:visible, button:visible:has-text("Delete")').first()
  if (await del.count()) { await del.click(); await sleep(600); await D.shot(page, 'd8-7-delete-asked')
    const yes = page.locator('button:visible', { hasText: /^(Delete|Yes|Confirm|Delete it)/ }).last()
    if (await yes.count()) { await yes.click(); await sleep(800) } }
  await A.closeWins(page)
}
const gone = { view: await rr('d8-8-deleted'), face: await D.face(w, 'd8-8-deleted', SAT) }
console.log('DELETED', j(gone))
D.row(`D8-${P}`, 'RECORD', j({ base, man, lt, asked, after, gone }))
D.finish(w, 'd8-' + KIND)
await w.browser.close()
