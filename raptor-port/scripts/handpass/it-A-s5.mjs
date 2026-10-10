// Scenario 5 — the Scheduler Board's new and existing windows (admin). T2 T3 T5 T6 T8 at each door.
import { launch, open, table, errs, people, shot, sleep, press, allRecs } from './it-A-lib.mjs'
import { boardDoor, runCase, closeBoardAny, geometry } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s5')
const SIZE = process.argv[2] || 'desk,phone'
for (const size of SIZE.split(',')) {
  const { ctx, page } = await open(browser, size)
  const P = await people(page)
  const names = ['Ace', 'Anvil', 'Basher', 'Blade', 'Bolt', 'Cinch', 'Cinder', 'Cobra', 'Comet', 'Cotter', 'Cutter', 'Dash', 'Diesel', 'Echo']
  let ni = 0
  const nextP = () => P[names[ni++ % names.length]]
  const tagS = (size === 'phone' ? 'p' : 'd')
  const door = boardDoor(2)
  const res = { new: [], ex: [] }
  const cases = ['T2', 'T3', 'T5a', 'T5b', 'T6', 'T8']
  /* A. the new window */
  for (const c of cases) {
    try {
      const r = await runCase(page, door, c, { person: nextP(), st: '10:00', en: '11:00' }, `s5-${tagS}-new`)
      res.new.push({ c, ...r }); console.log('new', c, r.ok ? 'ok' : 'NO', r.say.slice(0, 400))
    } catch (e) { res.new.push({ c, ok: false, say: 'SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 3).join(' | '), pics: [] }); console.log('new', c, 'ERR', String(e.message).split('\n')[0]); await shot(page, `s5-${tagS}-new-${c}-err`).catch(() => {}) }
    await closeBoardAny(page)
  }
  /* the picker's kinds */
  await door.openNew(page, { person: nextP() })
  const kinds = await page.locator('#inpEditPop #inpEditType option').allInnerTexts()
  await shot(page, `s5-${tagS}-new-picker`)
  await door.cancel(page)
  /* B. the existing window: a fresh untitled Event for each case, made through the Board's own + Inputs, opened from its Personal Inputs card */
  for (const c of cases) {
    try {
      const before = new Set((await allRecs(page)).map(r => r.iid))
      await door.openNew(page, { person: nextP(), st: '12:00', en: '13:00' })
      await door.submit(page)
      const fx = (await allRecs(page)).filter(r => !before.has(r.iid))[0]
      await closeBoardAny(page)
      const r = await runCase(page, door, c, { rec: fx }, `s5-${tagS}-ex`)
      res.ex.push({ c, ...r }); console.log('ex', c, r.ok ? 'ok' : 'NO', r.say.slice(0, 400))
    } catch (e) { res.ex.push({ c, ok: false, say: 'SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 3).join(' | '), pics: [] }); console.log('ex', c, 'ERR', String(e.message).split('\n')[0]); await shot(page, `s5-${tagS}-ex-${c}-err`).catch(() => {}) }
    await closeBoardAny(page)
  }
  const bad = [...res.new.map(x => ({ ...x, d: 'new' })), ...res.ex.map(x => ({ ...x, d: 'existing' }))].filter(x => !x.ok)
  T.add({ n: 5, size: page.sizeName, role: 'admin', verdict: bad.length ? 'FAIL' : 'PASS',
    say: (bad.length ? 'Cases missed: ' + bad.map(b => `${b.d} ${b.c}: ${b.say}`).join(' || ') : 'T2 T3 T5 (typed and pasted) T6 T8 all behaved at the Board’s new window and at the saved input’s editor') + ` · new-window kinds offered: ${kinds.join(', ')}`,
    pics: [...res.new, ...res.ex].flatMap(x => x.pics), detail: { new: res.new, existing: res.ex, kinds } })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
