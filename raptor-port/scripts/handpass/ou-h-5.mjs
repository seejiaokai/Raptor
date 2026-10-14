/* exploration: which input kinds land where on Saturday's board and which offer CX / info (prints only) */
import { L, J, board, file, fileSev, inputsCal, openAdd, fillForm } from './ou-h-0.mjs'
const w = await L.world('desk'), p = w.page
try {
  const ids = {}
  for (const [type, who, title] of [['LL', 'bane', 'leave'], ['Personal', 'bane', 'personal'], ['Other', 'pike', 'other'], ['Duty', 'dj', 'duty'], ['Event', 'bane', 'event'], ['OD', 'pike', 'od']]) {
    await inputsCal(w, '2026-07-13'); await openAdd(w, '2026-07-18')
    await fillForm(w, type === 'LL' ? { type, person: who, allday: true } : { type, person: who, start: '09:00', end: '10:00', title })
    const before = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
    await w.press('#inpEditSave'); await L.sleep(700)
    let asked = false
    if (await p.locator('[data-testid="oilconf"]').count()) { asked = true; await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(600) }
    ids[type] = await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? { id: String(n.iid), acc: n.acc || '', oil: n.oil || null } : null }, before)
    if (ids[type]) ids[type].asked = asked
    const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(250)
  }
  console.log(J(ids))
  await board(w, 5)
  const r = await p.evaluate(() => {
    const d = window.DAYS[5]
    return { ground: d.ground.map((g, i) => `${i}:${g.prog}|src=${g.src || ''}`), btn: [...document.querySelectorAll('#schedBoard [data-grcx]')].length, unav: (document.querySelector('#schedBoard')?.innerText.match(/UNAVAILABLE[\s\S]{0,400}/) || [''])[0].replace(/\s+/g, ' ') }
  })
  console.log(J(r))
  await L.pic(w, 'x-kinds-sat')
} finally { await L.close(w) }
