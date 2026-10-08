/* WALKER G — X-08: an input editor follows Leave War and Undo writers, not only List edits */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('x08')
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const P = 'dj'
const cellOf = d => tid(`cell-${P}-${d}`)
const say = (n, o) => console.log(n, JSON.stringify(o).slice(0, 1600))
const navTo = async pg => { await p.locator(`.nav a[data-page="${pg}"]`).click(); await sleep(1000) }
const showMonth = async mon => { await tid(`month-${mon}`).first().click(); await sleep(1300) }
const dragSelect = async (from, to) => {
  for (let i = 0; i < 4; i++) {
    await cellOf(from).scrollIntoViewIfNeeded(); await sleep(200)
    const a = await cellOf(from).boundingBox(), b = await cellOf(to).boundingBox()
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
    await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await p.mouse.up()
    try { await tid('select-sheet').waitFor({ state: 'visible', timeout: 1800 }); await sleep(300); return true } catch { if (await tid('sheet-scrim').count()) await p.keyboard.press('Escape'); await sleep(300) }
  }
  return false
}
const recs = () => p.evaluate(id => window.INPUTS.filter(x => x.person === id && /^LL/.test(x.type) && /Aug/.test(x.date)).map(x => ({ iid: x.iid, date: x.date, end: x.endDate || '', remarks: x.remarks })), P)
const editorState = () => p.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]'), dlg = document.querySelector('#inpEditPop')
  const root = w || dlg
  if (!root) return { up: false }
  const rm = root.querySelector('#inpEditRmk')
  return { up: true, kind: w ? 'window' : 'dialog', title: (root.querySelector('.win-ttl, .airpop-head') || {}).innerText, remarks: rm ? rm.value : null, clash: !!root.querySelector('[data-testid="inped-clash"]'), clashText: (root.querySelector('[data-testid="inped-clash"]') || {}).innerText, text: root.innerText.replace(/\s+/g, ' ').slice(0, 500) }
})

/* a fresh 3-day leave for Ace (Aug 5-7), approved on the Leave War */
await L.go(p, 'leavewar'); await sleep(1200); await showMonth('AUG')
await dragSelect('2026-08-05', '2026-08-07'); await tid('sel-LL').click(); await sleep(800)
await dragSelect('2026-08-05', '2026-08-07'); await tid('sel-approve').click(); await sleep(900)
say('recs', await recs())
/* open its editor on the Inputs page and type a remark locally */
await navTo('inputs'); if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(300) }
await G.toInputsCal(p); await G.monthTo(p, 2026, 7)
const bar = p.locator('#inpCal .ib-bar').filter({ hasText: 'Ace' }).first(); await bar.click(); await tid('win-inputedit').waitFor(); await sleep(500)
await p.fill('#inpEditRmk', 'typed in the editor — mine'); await sleep(300)
say('editor opened + typed', await editorState()); const f1 = await G.shot(p, 'editor-typed')

const ED = () => editorState()
const dateOf = async () => (await recs())
/* (A) a bar dragged by the real mouse while the window is up: the window follows the days and keeps what was typed */
const barNow = () => p.locator('#inpCal .ib-bar').filter({ hasText: 'Ace' }).first()
const cellBox = async iso => p.locator(`[data-icday="${iso}"]`).boundingBox()
{
  const b = await barNow().boundingBox(), c12 = await cellBox('2026-08-12')
  const sx = b.x + 20, sy = b.y + b.height / 2
  await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + 10, sy + 6, { steps: 3 })
  await p.mouse.move(c12.x + 20, c12.y + 30, { steps: 12 }); await p.mouse.up(); await sleep(900)
}
say('A. after the bar drag: records', await recs()); say('A. editor', await ED()); const fA = await G.shot(p, 'A-after-drag-editor-up')
/* (B) Undo of that drag from the top bar, window still up */
const un = await G.undo(p); say('B. undo', un); say('B. records', await recs()); say('B. editor', await ED()); const fB = await G.shot(p, 'B-after-undo-editor-up')
/* (C) the Leave War's own clear writer (the war's grid is blocked while the editor dialog is up elsewhere - the writer is the bridge's lwSetCell: SEEDED), the middle day */
await p.evaluate(() => window.lwSetCell('dj', '2026-08-06', '')); await sleep(900)
say('C. after the Leave War cleared 6 Aug: records', await recs()); say('C. editor', await ED()); const fC = await G.shot(p, 'C-after-leavewar-clear-editor-up')
/* try Save: it must not put the removed day back unnoticed */
const saveBtn = p.locator('#inpEditSave')
if (await saveBtn.count()) { await saveBtn.click(); await sleep(900); await G.answerOil(p, 'no').catch(() => {}) }
say('C2. after Save: records', await recs()); say('C2. editor', await ED()); const fC2 = await G.shot(p, 'C2-after-save')
G.saveRows('x08-raw-a')
console.log('errors', JSON.stringify(errors))
await browser.close()
