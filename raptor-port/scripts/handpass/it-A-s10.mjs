// Scenario 10 — cancel and a refused save (admin, desktop): "Must stay here" with equal start and end times.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, recs, closeAnyWin, win, norm } from './it-A-lib.mjs'
import { calDoor, listDoor, penDoor, listD, boardDoor, closeBoardAny } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s10')
const size = 'desk'
const { ctx, page } = await open(browser, size)
const P = await people(page)
const names = ['Ace', 'Anvil', 'Basher', 'Blade', 'Bolt', 'Cinch', 'Cinder', 'Cobra', 'Comet', 'Cotter']
let ni = 0; const nextP = () => P[names[ni++ % names.length]]
const TIMES = {
  cal: { set: async (p, a, b) => { await p.fill('#inpEditStart', a); await p.fill('#inpEditEnd', b) } },
  list: { set: async (p, a, b) => { await p.fill('#inStartT', a); await p.fill('#inEndT', b) } },
  pencil: { set: async (p, a, b) => { await p.locator('#inBody tr.ined input[data-ed="stime"]').fill(a); await p.locator('#inBody tr.ined input[data-ed="etime"]').fill(b) } },
  board: { set: async (p, a, b) => { await p.fill('#inpEditPop #inpEditStart', a); await p.fill('#inpEditPop #inpEditEnd', b) } },
}
const open_ = async (p, door) => door.isNewDoor ? (await p.locator(door.form).count()) > 0 : (await p.locator(door.form).count()) > 0
const typeInto = async (loc, text) => { await loc.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete'); await page.keyboard.type(text) }
const stillOpen = async door => {
  if (door.key === 'cal') return (await win(page).count()) > 0
  if (door.key === 'board') return page.locator('#inpEditPop').isVisible().catch(() => false)
  if (door.key === 'pencil') return (await page.locator('#inBody tr.ined').count()) > 0
  if (door.key === 'list') return (await door.title(page).inputValue().catch(() => '')) !== ''
}
const toastText = () => page.locator('#toastEl').innerText().catch(() => '')

const results = []
const doors = [
  { name: 'Calendar window - new', door: calDoor(), t: 'cal', mode: 'new', base: { iso: '2026-07-20' } },
  { name: 'Calendar window - existing', door: calDoor(), t: 'cal', mode: 'existing', base: { iso: '2026-07-21' } },
  { name: 'List Add form', door: listDoor(), t: 'list', mode: 'new', base: { iso: '2026-07-22' } },
  { name: 'List pencil editor', door: listD(), t: 'pencil', mode: 'existing', base: { iso: '2026-07-23' } },
  { name: 'Board + Inputs - new', door: boardDoor(2), t: 'board', mode: 'new', base: {} },
  { name: 'Board Personal Inputs editor - existing', door: boardDoor(2), t: 'board', mode: 'existing', base: { iso: '2026-07-15' } },
]
for (const D of doors) {
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  const door = D.door
  const tag = `s10-${D.t}-${D.mode}`
  try {
    let fx = null
    if (D.mode === 'existing') {
      // a fixture through this door's own create path (calendar window / board)
      const mk = D.t === 'board' ? boardDoor(2) : calDoor()
      const before = new Set((await allRecs(page)).map(r => r.iid))
      await mk.openNew(page, { iso: D.base.iso, person: nextP(), type: 'Event', st: '10:00', en: '11:00' }); await mk.submit(page)
      fx = (await allRecs(page)).filter(r => !before.has(r.iid))[0]
      await closeAnyWin(page); await closeBoardAny(page)
      await door.openSaved(page, fx)
    } else {
      await door.openNew(page, { ...D.base, person: nextP(), type: 'Event', st: '10:00', en: '11:00' })
    }
    const nBefore = (await allRecs(page)).length
    const T1 = door.title(page); await T1.waitFor({ state: 'visible' })
    await typeInto(T1, 'Must stay here')
    await TIMES[D.t].set(page, '10:00', '10:00')
    // press the save control WITHOUT the helper's OIL handling
    await door.saveBtn(page).click(); await sleep(page, 800)
    const toast = norm(await toastText())
    const why = norm(await page.locator('[data-testid="pp-why"], .inped-err, [role="alert"]').first().innerText().catch(() => ''))
    const nAfter = (await allRecs(page)).length
    const open1 = await stillOpen(door)
    const tv = await door.title(page).inputValue().catch(() => '(box gone)')
    pics.push(await shot(page, `${tag}-1-refused`))
    need(nAfter === nBefore, `equal start and end: ${nBefore} to ${nAfter} inputs stored (nothing added)`)
    need(open1, 'the form stayed open')
    need(tv === 'Must stay here', `the Title draft is still "${tv}"`)
    say.push(`the screen said: "${toast || why || '(no message read)'}"`)
    if (D.mode === 'existing') { const s = (await recs(page, { iid: fx.iid }))[0]; need(!s.title && s.st === 600 && s.en === 660, `the saved input unchanged (title ${JSON.stringify(s.title)}, ${s.st}-${s.en})`) }
    // correct the times and save: the title survives
    await TIMES[D.t].set(page, '12:00', '13:00')
    const r = await door.submit ? await (door.saveSaved && D.mode === 'existing' ? door.saveSaved(page) : door.submit(page)) : null
    const all = await allRecs(page)
    const stored = D.mode === 'existing' ? all.find(x => x.iid === fx.iid) : all.slice(nBefore).find(x => x.title === 'Must stay here') || all.find(x => x.title === 'Must stay here')
    need(!!stored && stored.title === 'Must stay here', `after the times were corrected the title survived: ${JSON.stringify(stored && stored.title)}`)
    if (D.mode === 'new') need(all.length === nBefore + 1, `exactly one new input (${nBefore} to ${all.length})`)
    pics.push(await shot(page, `${tag}-2-saved`))
    // cancel a title edit: reopen shows the previous saved title (existing), or no input is made (new)
    if (D.mode === 'existing') {
      await closeAnyWin(page); await closeBoardAny(page)
      await door.openSaved(page, stored)
      await typeInto(door.title(page), 'Cancelled title')
      pics.push(await shot(page, `${tag}-3-typed-before-cancel`))
      await door.cancel(page)
      await closeAnyWin(page); await closeBoardAny(page)
      await door.openSaved(page, stored)
      const v = await door.title(page).inputValue()
      need(v === 'Must stay here', `after Cancel the reopened Title box reads "${v}"`)
      const s2 = (await recs(page, { iid: stored.iid }))[0]; need(s2.title === 'Must stay here', `stored title after Cancel: ${JSON.stringify(s2.title)}`)
      await door.cancel(page)
    } else {
      const n0 = (await allRecs(page)).length
      await door.openNew(page, { ...D.base, person: nextP(), type: 'Event', st: '14:00', en: '15:00' })
      await typeInto(door.title(page), 'Cancelled title')
      await door.cancel(page)
      need((await allRecs(page)).length === n0, 'Cancel on a new input wrote nothing')
    }
    pics.push(await shot(page, `${tag}-4-end`))
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 4).join(' | ')); await shot(page, `${tag}-err`).catch(() => {}) }
  results.push({ name: D.name, ok, say: say.join(' · '), pics })
  console.log(ok ? 'ok ' : 'NO ', D.name, say.join(' · ').slice(0, 700))
  try { await closeAnyWin(page); await closeBoardAny(page) } catch {}
}
const bad = results.filter(r => !r.ok)
T.add({ n: 10, size: page.sizeName, role: 'admin', verdict: bad.length ? 'FAIL' : 'PASS',
  say: results.map(r => `[${r.name}: ${r.ok ? 'ok' : 'MISSED'}] ${r.ok ? '' : r.say}`).join(' '), pics: results.flatMap(r => r.pics), detail: results })
T.save()
await ctx.close(); await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
