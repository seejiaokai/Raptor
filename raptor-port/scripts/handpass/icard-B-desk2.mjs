// #48, #50 - Saber (admin), desktop 1440x900, each in a fresh world
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = false
const SZ = '1440x900', ROLE = 'Saber (admin)'
async function world() {
  const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
  await L.watchToasts(p)
  const sab = await L.csId(p, 'Saber')
  return { ctx, p, sab }
}
const span = r => `${r.date}${r.endDate ? '→' + r.endDate : ''}`
const trio = p => p.evaluate(() => window.INPUTS.filter(r => /^Trio/.test(r.title || '')).map(r => ({ person: window.PEOPLE[r.person].cs, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, grp: r.grp })).sort((a, b) => a.person.localeCompare(b.person)))
const tsay = a => a.map(x => `${x.person}:${x.title}|${x.remarks}|${x.date}${x.endDate ? '→' + x.endDate : ''}|${x.s}-${x.e}`).join(' ; ')

/* ---------------- 48 ---------------- */
await L.scn(48, SZ, ROLE, async () => {
  const { ctx, p } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Meeting', several: ['Ace', 'Blade', 'Cinch'], from: '10:00', to: '11:00', title: 'Trio', rmk: 'first remark' })
  const a0 = await trio(p); notes.push('filed: ' + tsay(a0))
  await L.toList(p, T)
  await p.locator('#inBody tr').filter({ hasText: 'Trio' }).first().locator('[data-testid="in-open"]').click(); await p.locator(L.WIN).waitFor()
  const head = await p.locator(`${L.WIN} .win-ttl`).innerText().catch(() => '')
  await p.fill('#inpEditOwnTitle', 'Trio two'); await p.fill('#inpEditRmk', 'second remark')
  await L.setTimes(p, '13:00', '14:00')
  await L.tapDate(p, T, '2026-07-21'); await L.tapDate(p, T, '2026-07-22')
  const read = await L.calRead(p)
  pics.push(await L.shot(p, 'B48-1-shared-edited'))
  await L.saveWin(p, T)
  const a1 = await trio(p); notes.push(`window head "${head}"; read "${read}"; saved: ` + tsay(a1))
  const okEdit = a1.length === 3 && a1.every(x => x.title === 'Trio two' && x.remarks.startsWith('second remark') && x.date === 'Jul 21' && x.endDate === 'Jul 22' && x.s === 780 && x.e === 840)
  await L.toList(p, T)
  const rows = await p.locator('#inBody tr').filter({ hasText: 'Trio two' }).count()
  notes.push(`list rows for it: ${rows}`)
  // delete: Keep first
  await p.locator('#inBody tr').filter({ hasText: 'Trio two' }).first().locator('[data-testid="in-open"]').click(); await p.locator(L.WIN).waitFor()
  await p.locator('#inpEditDel').click()
  const ask = await p.locator('[data-testid="inped-delall"]').innerText().catch(() => '')
  pics.push(await L.shot(p, 'B48-2-delete-question'))
  await p.locator('[data-testid="inped-delall-no"]').click(); await p.waitForTimeout(300)
  const kept = (await trio(p)).length
  notes.push(`delete question: "${ask.replace(/\s+/g, ' ')}"; after Keep: ${kept} records, window open ${await p.locator(L.WIN).count()}`)
  await p.locator('#inpEditDel').click(); await p.locator('[data-testid="inped-delall-yes"]').click(); await p.waitForTimeout(500)
  const gone = (await trio(p)).length
  notes.push(`after confirmed Delete: ${gone} records`)
  await L.undo(p); const a2 = await trio(p); notes.push('after ONE Undo: ' + tsay(a2))
  await L.redo(p); const a3 = (await trio(p)).length
  notes.push(`Redo: ${a3} records`)
  await ctx.close()
  const ok = okEdit && rows === 1 && /3 people|all 3|for all/i.test(ask) && kept === 3 && gone === 0 && tsay(a2) === tsay(a1) && a3 === 0
  return { ok, saw: notes.join(' || '), pics }
})

/* ---------------- 50 ---------------- */
await L.scn(50, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Input A', rmk: 'a remark' })
  await L.fileInput(p, T, { iso: '2026-07-22', type: 'Duty', who: sab, from: '11:00', to: '12:00', title: 'Input B', rmk: 'b remark' })
  const A = await L.rec(p, { type: 'Duty', title: 'Input A' }), B = await L.rec(p, { type: 'Duty', title: 'Input B' })
  const swap = p.locator('[data-testid="inped-swap"]')
  for (const kind of ['date', 'person', 'remark']) {
    await L.toList(p, T)
    await L.openFromList(p, T, A.iid)
    if (kind === 'date') await L.tapDate(p, T, '2026-07-21')
    if (kind === 'person') await p.selectOption('#inpEditPerson', await L.csId(p, 'Ranger'))
    if (kind === 'remark') await p.fill('#inpEditRmk', 'a remark edited')
    // tap input B's row behind the window
    await p.locator(`#inBody tr[data-iid="${B.iid}"] td[data-label="Remarks"]`).click()
    const up = await swap.waitFor({ timeout: 3000 }).then(() => true, () => false)
    const sw = up ? (await swap.innerText()).replace(/\s+/g, ' ') : ''
    const top = up && await swap.evaluate(e => { const b = e.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!hit && (e === hit || e.contains(hit)) })
    pics.push(await L.shot(p, `B50-${kind}-question`))
    // keep editing -> A retained
    if (up) await p.locator('[data-testid="inped-swap-stay"]').click()
    await p.waitForTimeout(250)
    const stillA = await p.inputValue('#inpEditOwnTitle')
    const draft = kind === 'date' ? await L.calRead(p) : kind === 'person' ? await p.inputValue('#inpEditPerson') : await p.inputValue('#inpEditRmk')
    // tap B again, discard
    await p.locator(`#inBody tr[data-iid="${B.iid}"] td[data-label="Remarks"]`).click()
    await swap.waitFor({ timeout: 3000 }).catch(() => {})
    await p.locator('[data-testid="inped-swap-go"]').click().catch(() => notes.push('no discard button'))
    await p.waitForTimeout(400)
    const nowTitle = await p.inputValue('#inpEditOwnTitle'), nowRmk = await p.inputValue('#inpEditRmk')
    const calB = await L.calRead(p)
    const rA = await L.recId(p, A.iid)
    notes.push(`${kind}: question up ${up} on top ${top} "${sw.slice(0, 140)}"; after Keep editing: title "${stillA}", draft ${draft}; after Discard: window shows title "${nowTitle}" remark "${nowRmk}" dates "${calB}"; A saved unchanged: ${span(rA)} ${rA.remarks} person ${rA.person === A.person}`)
    ck.push(up && top && stillA === 'Input A' && nowTitle === 'Input B' && nowRmk === 'b remark' && calB === 'Jul 22' && span(rA) === span(A) && rA.remarks === A.remarks && rA.person === A.person)
    await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(250)
  }
  // ordinary Cancel leaves A unchanged
  await L.openFromList(p, T, A.iid); await L.tapDate(p, T, '2026-07-23'); await p.locator('#inpEditCancel').click(); await p.waitForTimeout(300)
  const rA2 = await L.recId(p, A.iid)
  notes.push(`Cancel after a date change: A is ${span(rA2)}`)
  ck.push(span(rA2) === span(A))
  await ctx.close()
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}`, pics }
})
L.save('desk2')
console.log(L.errs)
await browser.close()
