// Walker b, B2 — a member's own save, and the permissions gate.
// v2: (i) Ranger files a Training for himself and Hex; (ii-a) Ranger opens Saber's Training for both (refused, no Save) and
// presses Close with changes typed; (ii-b) Ranger opens the one HE filed and makes four changes in one save. Hex and Saber read.
// Run from raptor-port:  node scripts/handpass/wr4-b-2.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-2 v4')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b2-run2'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, openDay, openBell, log, facts, press, recOf, bundleOf, sleep, shot, boxOf, shownToast, answerAsks, catchToast, RANGER, HEX, WED, NEW_DIR } = L
const c = 'B2'
const out = {}
const full = w => ({ x: 0, y: 0, width: w.page.viewportSize().width, height: w.page.viewportSize().height })
const pic = async (w, name) => shot(w.page, c, name, full(w), await shownToast(w.page), w.size)
async function openCard(w, iid) {
  await openDay(w, WED)
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  if (!(await card.count())) throw new Error('no card for ' + iid)
  await press(w, card)
  await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 }); await sleep(400)
}
async function four(w, tag) {
  const tries = []
  for (const [k, f] of [['kind', () => w.page.selectOption('#inpEditPop #inpEditType', 'Meeting', { timeout: 3000 })], ['title', () => w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief', { timeout: 3000 })], ['hours', async () => { await w.page.fill('#inpEditPop #inpEditStart', '10:00', { timeout: 3000 }); await w.page.fill('#inpEditPop #inpEditEnd', '11:00', { timeout: 3000 }) }], ['remark', () => w.page.fill('#inpEditPop #inpEditRmk', 'Bring water', { timeout: 3000 })]]) {
    try { await f(); tries.push(k) } catch (e) { tries.push(k + ' refused') }
  }
  log(c, `${tag}: changes typed: ${JSON.stringify(tries)}`)
  return tries
}
try {
  let w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'ad')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const sab = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' })
  if (!sab) throw new Error('fixture: Saber could not file the Training')
  w = await handOver(w, 'desk', 'us', NEW_DIR)
  // (i)
  const mine = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '13:00', to: '14:00', title: 'Training', remarks: 'Bring your kit' })
  out.i = { iid: mine, rec: mine ? await recOf(w.page, mine) : null }
  log(c, '(i) RECORD Ranger filed a Training for himself and Hex: ' + JSON.stringify(out.i))
  // (ii-a) Saber's Training: the gate
  await openCard(w, sab)
  out.iia_save = await w.page.locator('#inpEditSave:visible').count()
  out.iia_words = await w.page.evaluate(() => (document.querySelector('[data-testid="win-inputedit"]')?.innerText || '').split('\n').filter(s => /Only|admin|filed/i.test(s)))
  await four(w, '(ii-a) Saber\'s input')
  await pic(w, 'B2-1-member-opens-sabers-training-desk')
  const close = w.page.getByRole('button', { name: /^Close$/ }).last()
  await close.click(); await sleep(500)
  out.iia_afterClose = { winOpen: await w.page.locator('[data-testid="win-inputedit"]:visible').count(), note: await shownToast(w.page), asks: await w.page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /Discard|Close it|Keep/i.test(b.textContent)).map(b => b.textContent.trim())), rec: await recOf(w.page, sab) }
  await pic(w, 'B2-2-after-close-desk')
  log(c, '(ii-a) Save buttons ' + out.iia_save + '; words ' + JSON.stringify(out.iia_words) + '; after Close ' + JSON.stringify(out.iia_afterClose))
  await B.closeWin(w)
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  // (ii-b) his own
  if (!mine) throw new Error('(ii-b) no input of Ranger\'s own to change')
  await openCard(w, mine)
  out.iib_save = await w.page.locator('#inpEditSave:visible').count()
  await four(w, '(ii-b) his own input')
  await press(w, '#inpEditSave')
  const t1 = await catchToast(w.page, /./, 2500)
  await pic(w, 'B2-3-member-saves-own-desk')
  await L.releaseToast(w.page)
  const asked = await answerAsks(w)
  out.iib = { noteAtSave: t1, asked, winOpen: await w.page.locator('[data-testid="win-inputedit"]:visible').count(), rec: await recOf(w.page, mine) }
  log(c, '(ii-b) RECORD the save: ' + JSON.stringify(out.iib))
  log(c, `${/could not be saved/i.test(String(t1)) ? 'FAIL' : 'PASS'} no "could not be saved" note: ${JSON.stringify(t1)}`)
  await B.closeWin(w)
  await w.page.reload(); await w.page.waitForFunction(() => document.querySelector('#luser') || window.CURPAGE, null, { timeout: 30000 }); await sleep(1500)
  out.reloadShows = await w.page.evaluate(() => ({ signIn: !!document.querySelector('#luser'), page: window.CURPAGE }))
  log(c, 'after the reload the screen shows: ' + JSON.stringify(out.reloadShows))
  await pic(w, 'B2-3b-after-reload-desk')
  out.iib_afterReload = await recOf(w.page, mine)
  log(c, '(ii-b) after a reload: ' + JSON.stringify(out.iib_afterReload))
  for (const user of ['hex', 'ad']) {
    w = await handOver(w, 'phone', user, NEW_DIR)
    await openBell(w)
    const ls = await B.readLines(w.page)
    out['bell_' + user] = B.said(ls)
    log(c, `${user}'s bell: ` + JSON.stringify(B.said(ls)))
    if (ls.length) await B.bellPic(w, c, `B2-4-bell-${user}-phone`, ls)
    else await pic(w, `B2-4-bell-${user}-phone`)
    const hit = ls.find(l => /more change/.test(l.what) && /Ranger$/.test(l.what))
    log(c, `${user}: ${hit ? 'line found' : 'NO "… more change(s) · Ranger" line'}: ${hit ? JSON.stringify(hit.what) : ''}`)
    await w.page.keyboard.press('Escape'); await sleep(250)
  }
  await w.ctx.close()
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b2.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
