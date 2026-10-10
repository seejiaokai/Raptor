// Scenario 12 — shared membership changes (member filer, desktop): Team session -> Team review + a third person, then remove the
// first-sorting callsign; Undo, Redo, reload. A STORED world (no ?fresh=1) so a reload keeps what was saved.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, enableMemberFiling, asMember, closeAnyWin, win, saveWin, norm, toCal, month, tapAt } from './it-A-lib.mjs'
import { calDoor, setSeveral, recOf } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s12')
const { ctx, page } = await open(browser, 'desk', 'ad', 'a', { fresh: false })
const say = []; let ok = true; const pics = []
const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
const P = await people(page)
const nameOf = Object.fromEntries(Object.entries(P).map(([k, v]) => [v, k]))
const mates = async grp => (await allRecs(page)).filter(r => r.grp === grp)
const desc = async grp => (await mates(grp)).map(r => `${nameOf[r.person]}:${r.title == null ? '-' : r.title}`).sort().join(', ')
try {
  await enableMemberFiling(page)
  await asMember(page, 'Ranger')
  // 1 file the shared Event for Saber and Vapor
  const d = calDoor(); const before = new Set((await allRecs(page)).map(r => r.iid))
  await d.openNew(page, { iso: '2026-07-21', type: 'Event', st: '14:00', en: '15:00', several: [P.Saber, P.Vapor] })
  await page.fill('#inpEditTitle', 'Team session')
  await d.submit(page)
  const fx = (await allRecs(page)).filter(r => !before.has(r.iid))
  need(fx.length === 3 && fx[0].grp && fx.every(r => r.grp === fx[0].grp), `filed one shared Event (the member's own callsign cannot be switched off in the picker, so Ranger is in it with Saber and Vapor): ${await desc(fx[0].grp)}`)
  const grp = fx[0].grp
  pics.push(await shot(page, 's12-1-filed'))
  // 2 reopen, retitle and add Wisp in the same save
  await closeAnyWin(page)
  await d.openSaved(page, fx[0])
  need((await page.inputValue('#inpEditTitle')) === 'Team session', `reopened: Title "${await page.inputValue('#inpEditTitle')}"`)
  await page.fill('#inpEditTitle', 'Team review')
  await setSeveral(page, [P.Ranger, P.Saber, P.Vapor, P.Ace])
  pics.push(await shot(page, 's12-2-retitled-and-added'))
  await d.submit(page)
  need((await mates(grp)).length === 4 && (await mates(grp)).every(r => r.title === 'Team review'), `after the save (Ranger stayed in his own entry; Ace added): ${await desc(grp)}`)
  // 3 remove the first-sorting callsign (Ace, of Ace Ranger Saber Vapor)
  await closeAnyWin(page)
  const live = (await mates(grp))[0]
  await d.openSaved(page, live)
  await setSeveral(page, [P.Ranger, P.Saber, P.Vapor])
  pics.push(await shot(page, 's12-3-removing-ace'))
  const r3 = await d.submit(page)
  const left = await mates(grp)
  need(left.length === 3 && left.every(r => r.title === 'Team review' && r.grp === grp), `after removing Ace: ${await desc(grp)} (one entry, ${left.length} people)`)
  pics.push(await shot(page, 's12-4-after-removal'))
  await closeAnyWin(page)
  // 4 Undo
  await press(page, page.locator('#undoBtn')); await sleep(page, 500)
  need((await mates(grp)).length === 4 && (await mates(grp)).every(r => r.title === 'Team review'), `Undo: ${await desc(grp)}`)
  pics.push(await shot(page, 's12-5-after-undo'))
  await press(page, page.locator('#redoBtn')); await sleep(page, 500)
  need((await mates(grp)).length === 3 && (await mates(grp)).every(r => r.title === 'Team review'), `Redo: ${await desc(grp)}`)
  // 5 reload (a stored world): sign in again as Ranger
  await sleep(page, 1200)
  await page.reload(); await page.waitForSelector('#loginForm, #vWeek .day')
  if (await page.locator('#loginForm').count()) { await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day') }
  const g2 = (await allRecs(page)).filter(r => r.grp === grp)
  need(g2.length === 3 && g2.every(r => r.title === 'Team review'), `after a reload: ${g2.map(r => nameOf[r.person] + ':' + r.title).sort().join(', ')}`)
  await page.evaluate(() => window.go('inputs')); await toCal(page); await month(page, 2026, 7)
  await tapAt(page, page.locator('#inpCal [data-icday="2026-07-21"]'), { x: 8, y: 8 }); await sleep(page, 600)
  pics.push(await shot(page, 's12-6-after-reload'))
} catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's12-err').catch(() => {}) }
T.add({ n: 12, size: page.sizeName, role: 'member filer (Ranger)', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
T.save()
await ctx.close(); await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
