// #51, #52, #53, #55 - Saber (admin), desktop 1440x900, each in a fresh world
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
const span = r => r ? `${r.date}${r.endDate ? '→' + r.endDate : ''}` : 'none'
/* a real mouse drag of a month bar onto a date cell */
async function dragBar(p, iid, toIso) {
  const bar = p.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first()
  await bar.scrollIntoViewIfNeeded()
  const from = await bar.boundingBox(), to = await p.locator(`#inpCal [data-icday="${toIso}"]`).boundingBox()
  await p.mouse.move(from.x + 12, from.y + from.height / 2); await p.mouse.down()
  await p.mouse.move(from.x + 30, from.y + from.height / 2, { steps: 4 })
  await p.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 14 }); await p.mouse.up()
  await p.waitForTimeout(500)
}
/* drag the window aside by its title strip */
async function moveWinAside(p) {
  const b = await p.locator(L.WIN).boundingBox()
  if (!b) return 'no window'
  await p.mouse.move(b.x + 14, b.y + 22); await p.mouse.down()
  await p.mouse.move(b.x + 14, b.y + 122, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250)
  const b2 = await p.locator(L.WIN).boundingBox()
  return `window moved from y=${Math.round(b.y)} to y=${Math.round(b2.y)}`
}
async function openFromMonth(p, iid, iso) {
  await L.toCal(p, T)
  await p.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first().click({ position: { x: 20, y: 6 } })
  await p.locator(L.WIN).waitFor()
}

/* ---------------- 51 ---------------- */
await L.scn(51, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Drag one' })
  const d = await L.rec(p, { person: sab, type: 'Duty' })
  await openFromMonth(p, d.iid)
  notes.push('window opens on ' + await L.calRead(p))
  await p.fill('#inpEditRmk', 'typed while behind')
  notes.push(await moveWinAside(p))
  await dragBar(p, d.iid, '2026-07-22')
  const mid = await L.recId(p, d.iid)
  const winRead = await L.calRead(p)
  pics.push(await L.shot(p, 'B51-1-after-bar-drag'))
  notes.push(`bar dragged to 22 Jul: saved record now ${span(mid)}; window still open ${await p.locator(L.WIN).count()}; its calendar reads "${winRead}"; remark box "${await p.inputValue('#inpEditRmk').catch(() => '?')}"`)
  await L.saveWin(p, T, 'no')
  const fin = await L.recId(p, d.iid)
  notes.push(`after Save: ${span(fin)} remark "${fin.remarks}"`)
  await L.undo(p); const u = await L.recId(p, d.iid); await L.redo(p)
  notes.push(`Undo -> ${span(u)} "${u.remarks || ''}"`)
  await ctx.close()
  return { ok: span(mid) === 'Jul 22' && /22/.test(winRead) && span(fin) === 'Jul 22' && fin.remarks === 'typed while behind', saw: notes.join(' || '), pics }
})

/* ---------------- 52 ---------------- */
await L.scn(52, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Compete' })
  const d = await L.rec(p, { person: sab, type: 'Duty' })
  const runs = [['mine-after-new-date', 21, 'mine', 'Jul 21'], ['theirs-after-new-date', 21, 'theirs', 'Jul 23'], ['saved-day-tap', 20, 'both', null]]
  for (const [label, tapDay, choice, want] of runs) {
    // reset the input to 20 Jul first
    const cur = await L.recId(p, d.iid)
    if (cur.date !== 'Jul 20') { await L.openFromList(p, T, d.iid); await L.tapDate(p, T, '2026-07-20'); await L.saveWin(p, T, 'no') }
    await openFromMonth(p, d.iid)
    await L.tapDate(p, T, `2026-07-${tapDay}`)
    const read = await L.calRead(p)
    await dragBar(p, d.iid, '2026-07-23')
    const saved = await L.recId(p, d.iid)
    const clash = p.locator('[data-testid="inped-clash"]')
    const up = await clash.waitFor({ timeout: 2500 }).then(() => true, () => false)
    const ctext = up ? (await clash.innerText()).replace(/\s+/g, ' ') : ''
    pics.push(await L.shot(p, `B52-${label}-clash`))
    notes.push(`[${label}] tapped ${tapDay} Jul (window reads "${read}"), then bar dragged to 23 Jul: saved is ${span(saved)}; clash shown ${up}: "${ctext.slice(0, 200)}"`)
    // Save while the clash is outstanding
    await L.clearToasts(p)
    await p.click('#inpEditSave'); await p.waitForTimeout(800)
    const afterSave = await L.recId(p, d.iid)
    const t = await L.toasts(p)
    notes.push(`[${label}] Save with the clash outstanding: toasts ${JSON.stringify(t)}; saved ${span(afterSave)}; window open ${await p.locator(L.WIN).count()}; clash still up ${await clash.count()}`)
    ck.push(up && await clash.count() > 0 === (await p.locator(L.WIN).count() > 0))
    if (choice === 'mine' || choice === 'theirs') {
      if (await clash.count()) await p.locator(`[data-testid="inped-clash-${choice}-dates"]`).click().catch(async () => { await clash.locator('button', { hasText: choice === 'mine' ? /Keep mine/ : /theirs|Keep theirs|Take theirs/i }).first().click() })
      await p.waitForTimeout(300)
      const rd = await L.calRead(p)
      await L.saveWin(p, T, 'no')
      const fin = await L.recId(p, d.iid)
      notes.push(`[${label}] chose ${choice}: window read "${rd}", final ${span(fin)}`)
      ck.push(span(fin) === want)
    } else {
      ck.push(up)
      await p.click('#inpEditCancel').catch(() => {}); await p.waitForTimeout(300)
    }
    await L.closeAll(p)
  }
  await ctx.close()
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}`, pics }
})

/* ---------------- 53 ---------------- */
await L.scn(53, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  const pics = [], notes = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Vanish', rmk: 'saved remark' })
  const d = await L.rec(p, { person: sab, type: 'Duty' })
  const n0 = await p.evaluate(() => window.INPUTS.length)
  await L.openFromList(p, T, d.iid)
  await p.fill('#inpEditRmk', 'abandoned remark')
  await L.clearToasts(p)
  await p.locator('#undoBtn').click(); await p.waitForTimeout(700)
  const closed = (await p.locator(L.WIN).count()) === 0
  const gone = !(await L.recId(p, d.iid))
  const toast = await L.toasts(p)
  pics.push(await L.shot(p, 'B53-1-after-undo'))
  notes.push(`Undo with the editor open: editor closed ${closed}; input gone ${gone}; message(s) ${JSON.stringify(toast)}; INPUTS ${n0} -> ${await p.evaluate(() => window.INPUTS.length)}`)
  const body = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  const explained = /removed|no longer|gone|undone|was taken|closed/i.test(toast.join(' ')) || /no longer there|was removed/i.test(body)
  await L.redo(p)
  const back = await L.recId(p, d.iid)
  notes.push(`Redo: input back ${!!back}; remark "${back && back.remarks}"; window open ${await p.locator(L.WIN).count()}; INPUTS ${await p.evaluate(() => window.INPUTS.length)}`)
  pics.push(await L.shot(p, 'B53-2-after-redo'))
  await ctx.close()
  return { ok: closed && gone && explained && !!back && back.remarks === 'saved remark' && n0 === 0 + n0, saw: notes.join(' || ') + ` || explained=${explained}`, pics }
})

/* ---------------- 55 ---------------- */
await L.scn(55, SZ, ROLE, async () => {
  const { ctx, p, sab } = await world()
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(L.BASE).origin }).catch(() => {})
  const pics = [], notes = [], ck = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Cell test', rmk: 'Select this remark text please' })
  await L.fileInput(p, T, { iso: '2026-07-21', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Other row' })
  const d = await L.rec(p, { person: sab, type: 'Duty', title: 'Cell test' })
  await L.toList(p, T)
  const row = p.locator(`#inBody tr[data-iid="${d.iid}"]`)
  for (const col of ['Name', 'Start', 'End', 'Type', 'Remarks', 'Modified']) {
    const cell = row.locator(`td[data-label="${col}"]`)
    if (!(await cell.count())) { notes.push(`${col}: no such cell`); ck.push(false); continue }
    await cell.click({ position: { x: 6, y: 6 } }); await p.waitForTimeout(350)
    const n = await p.locator(L.WIN).count()
    const title = n ? await p.inputValue('#inpEditOwnTitle').catch(() => '?') : null
    notes.push(`${col}: windows ${n}${n ? ' opened on "' + title + '"' : ''}`)
    ck.push(n === 1 && title === 'Cell test')
    await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(250)
    await L.toList(p, T)
  }
  // the title (in the Type cell's second line) and the empty End
  const tcell = await row.locator('[data-label="Type"] .intitle, [data-testid="in-title"]').first()
  if (await tcell.count()) { await tcell.click(); await p.waitForTimeout(300); const n = await p.locator(L.WIN).count(); notes.push(`title text: windows ${n}`); ck.push(n === 1); await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(250); await L.toList(p, T) }
  // drag across the remark text and copy it
  const rc = row.locator('td[data-label="Remarks"]')
  const tb = await rc.evaluate(td => { const w = document.createTreeWalker(td, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (/Select this remark/.test(n.textContent)) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height } } } return null })
  notes.push('remark text sits at ' + JSON.stringify(tb))
  await p.mouse.move(tb.x + 1, tb.y + tb.h / 2); await p.mouse.down(); await p.mouse.move(tb.x + tb.w - 1, tb.y + tb.h / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(300)
  const sel = await p.evaluate(() => window.getSelection().toString())
  const winAfter = await p.locator(L.WIN).count()
  pics.push(await L.shot(p, 'B55-1-text-selected'))
  await p.keyboard.press('Control+C'); await p.waitForTimeout(200)
  const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => '(no clipboard)'))
  notes.push(`drag-select over the remark: selection "${sel}"; window opened ${winAfter}; clipboard after Ctrl+C "${clip}"`)
  ck.push(sel.length > 3 && clip === sel)
  const after = await L.recId(p, d.iid)
  notes.push(`record unchanged: ${after.remarks === 'Select this remark text please' && after.title === 'Cell test'}; INPUTS still ${await p.evaluate(() => window.INPUTS.filter(r => r.title === 'Cell test' || r.title === 'Other row').length)} of 2`)
  ck.push(after.remarks === 'Select this remark text please')
  await ctx.close()
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}`, pics }
})
L.save('desk3')
console.log(L.errs)
await browser.close()
