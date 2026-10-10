// S20 part B - delete a test person and reuse his callsign for a newly created person
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, pubSat, closeBoard, editWeek, face, fs, cr, crS, pidOf, reload, earnRead, closeWins } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const w = await world(); const { page } = w
async function usersOpen() { await go(page, 'admin'); await sleep(500); if (!(await page.locator('#accList:visible').count())) { await page.getByText('Sign-in and roster').first().click(); await sleep(600) } }
async function addPerson(cs, postIn) {
  await usersOpen()
  await page.fill('#accAddCs', cs); await page.selectOption('#accAddSeat', { label: 'Pilot' }); await page.selectOption('#accAddCat', { label: 'C' }).catch(async () => { const o = await page.locator('#accAddCat option').allInnerTexts(); say('cat options', o); await page.selectOption('#accAddCat', { index: 1 }) })
  if (postIn) await page.fill('#accAddPostIn', postIn)
  await page.locator('#accAdd').click(); await sleep(800)
  return pidOf(page, cs)
}
const zed1 = await addPerson('Zed', '2026-06-01')
say('1 Zed created', zed1)
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S20 b', oil: 'yes' })
await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
say('2 July issued', fs(await face(page, 5))); say('2 credits incl Zed', crS(await cr(page, '2026-07-18', ['Ranger', 'Saber', 'Zed'])))
say('2 earn window shows Zed', await earnRead(page, [zed1])); await closeBoard(page)
// delete Zed
await usersOpen()
await page.locator(`#accList [data-person="${zed1}"]`).first().click(); await sleep(500)
await page.getByRole('button', { name: 'Delete', exact: true }).first().click(); await sleep(700)
await shot(page, 'S20-06-delete-ask')
say('3 delete dialog', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.innerText.trim()).filter(t => /delete|keep|cancel|yes|sure|confirm/i.test(t))))
for (let i = 0; i < 3; i++) {
  const b = page.getByRole('button', { name: /^(Tap again to delete|Delete|Yes|Confirm)/ }).filter({ visible: true }).last()
  if (!(await b.count())) break
  const t = await b.innerText(); await b.click(); await sleep(700); say('3 pressed', t)
  if (!(await page.locator(`#accList [data-person="${zed1}"]`).count())) break
}
say('3 Zed still listed?', await page.locator(`#accList [data-person="${zed1}"]`).count())
await go(page, 'editsched'); await sleep(400)
say('4 July face after delete', fs(await face(page, 5)))
await editWeek(page)
const b = page.locator('#eWeek [data-pendlist="5"]:visible').first()
if (await b.count()) { await b.click(); await sleep(800); await shot(page, 'S20-07-pending-after-delete'); say('4 window', await page.evaluate(() => [...document.querySelectorAll('.floatwin')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 300)).join(' || '))); await closeWins(page) }
say('4 credits (Zed removed from cr: others)', crS(await cr(page, '2026-07-18', ['Ranger', 'Saber'])))
// recreate with the same callsign
const before = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => p.cs === 'Zed').map(([k, p]) => ({ id: k, del: !!p.deleted, arch: !!p.archived, keys: Object.keys(p).filter(x => /del|arch|hid|out/i.test(x)) })))
say('5 PEOPLE named Zed before re-adding', before)
await addPerson('Zed', '')
const after = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => p.cs === 'Zed').map(([k, p]) => ({ id: k, del: !!p.deleted, arch: !!p.archived })))
say('5 PEOPLE named Zed after re-adding', after)
const ids = after.map(x => x.id)
await go(page, 'leavewar'); await sleep(1200)
const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await sleep(1000) }
say('5 Leave War: cells for each Zed id on 18 Jul', await page.evaluate(([ids]) => Object.fromEntries(ids.map(i => { const c = document.querySelector(`[data-testid="cell-${i}-2026-07-18"]`); return [i, c ? c.innerText.trim() : 'NO CELL'] })), [ids]))
say('5 Leave War: rows named Zed', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].filter(r => /^Zed/.test(r.innerText.trim())).map(r => r.dataset.testid)))
await shot(page, 'S20-08-new-zed-lw')
await go(page, 'editsched'); await sleep(400)
say('5 July face', fs(await face(page, 5)))
say('5 July earn window (frozen crowd)', await earnRead(page, ids)); await closeBoard(page)
await reload(page)
await go(page, 'leavewar'); await sleep(1200)
if (await page.locator('[data-testid="month-JUL"]').count()) { await page.locator('[data-testid="month-JUL"]').first().click(); await sleep(1000) }
say('6 after reload cells', await page.evaluate(([ids]) => Object.fromEntries(ids.map(i => { const c = document.querySelector(`[data-testid="cell-${i}-2026-07-18"]`); return [i, c ? c.innerText.trim() : 'NO CELL'] })), [ids]))
say('errors', w.errors); await w.browser.close()
