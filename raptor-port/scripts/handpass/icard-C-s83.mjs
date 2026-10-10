import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const OLD = '[data-edit], [data-inx], [data-save], .rmx, tr.ined'
const act = () => p.evaluate(() => {
  const e = document.activeElement
  if (!e || e === document.body) return null
  const cs = getComputedStyle(e)
  const r = e.getBoundingClientRect()
  return { tag: e.tagName, id: e.id || '', tid: e.dataset.testid || '', cal: e.dataset.cal || '', cls: (e.className || '').toString().slice(0, 30), txt: (e.innerText || e.value || '').toString().replace(/\s+/g, ' ').slice(0, 24), ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none', bc: cs.borderTopColor, vis: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0', old: !!e.closest('[data-edit], [data-inx], [data-save], .rmx, tr.ined'), inWin: !!e.closest('[data-testid="win-inputedit"]'), inert: !!e.closest('[inert]') }
})
async function tabUntil(pred, max = 400) {
  const seen = []
  for (let i = 0; i < max; i++) {
    await p.keyboard.press('Tab')
    const a = await act()
    seen.push(a)
    if (a && pred(a)) return { ok: true, n: i + 1, seen }
  }
  return { ok: false, n: max, seen }
}
const fmt = r => r ? `${r.type} "${r.title}" rmk "${r.remarks}" ${r.date} ${r.s}-${r.e} oil ${JSON.stringify(r.oil)}` : 'GONE'
try {
  await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', title: 'Key duty', s: '09:00', e: '12:00', oil: 'yes' })
  await L.fileNew(w, { iso: '2026-07-22', type: 'ATT C', doc: L.SAMPLE })
  const duty = await L.recBy(p, { title: 'Key duty' })
  const att = await L.recBy(p, { type: 'ATT C', date: 'Jul 22' })
  parts.push('filed an own weekend Duty "Key duty" (answered Yes) and an ATT C with a document: ' + fmt(duty))
  // ---- admin: Tab to the Name of the Key duty row
  await L.toList(w)
  await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0) })
  const t = await tabUntil(a => a.tid === 'in-open' && a.txt.length > 0 && false || (a.tid === 'in-open'), 400)
  // walk until the Name of the target row
  let reached = null, stops = []
  await p.evaluate(() => { document.activeElement && document.activeElement.blur() })
  for (let i = 0; i < 500; i++) {
    await p.keyboard.press('Tab')
    const a = await act(); stops.push(a)
    const isTarget = await p.evaluate(iid => { const e = document.activeElement; return !!e && e.matches('[data-testid="in-open"]') && !!e.closest(`tr[data-iid="${iid}"]`) }, duty.iid)
    if (isTarget) { reached = { n: i + 1, a }; break }
  }
  const oldStops = stops.filter(a => a && a.old).length
  const invisStops = stops.filter(a => a && !a.vis).length
  parts.push(`Tab reached the Name button of the Key duty row after ${reached ? reached.n : 'NEVER'} presses; of ${stops.length} stops, ${oldStops} were old pencil/tick/cross controls and ${invisStops} were invisible; the Name button shows a focus ring: ${reached && reached.a.ring}`)
  if (!reached) fail('could not reach the row Name by Tab')
  else {
    if (oldStops || invisStops) fail('focus landed on old/invisible controls: old ' + oldStops + ', invisible ' + invisStops)
    if (!reached.a.ring) fail('the Name button shows no visible focus ring')
    pics.push(await L.pic(w, '83-1-name-focused'))
    await p.keyboard.press('Enter'); await L.win(p).waitFor(); await sleep(400)
    const title = await p.locator(`${L.WIN} #inpEditOwnTitle`).inputValue()
    parts.push(`Enter opened the window for "${title}"`)
    if (title !== 'Key duty') fail('the wrong input opened: ' + title)
    // walk the editor by keyboard
    const edStops = []
    for (let i = 0; i < 80; i++) {
      await p.keyboard.press('Tab')
      const a = await act(); edStops.push(a)
      if (a && a.id === 'inpEditSave') break
    }
    const names = edStops.map(a => a ? (a.id || a.tid || (a.cal ? 'day ' + a.cal.slice(8) : a.tag + '.' + a.cls.split(' ')[0])) : '-')
    parts.push('keyboard stops inside the window: ' + names.join(' > '))
    const need = ['inpEditRmk', 'inpEditSave', 'inpEditCancel']
    for (const n of need) if (!names.includes(n)) fail('keyboard never reached ' + n)
    if (!names.some(n => /^day /.test(n))) fail('keyboard never reached a day of the date calendar')
    if (!names.some(n => n === 'oil-revise')) fail('keyboard never reached the OIL Change… button')
    const noRing = edStops.filter(a => a && !a.ring).map(a => a.id || a.tid || a.cls)
    parts.push('stops without a visible focus ring: ' + JSON.stringify(noRing))
    parts.push('(outline/shadow absent on those fields; their focus look is judged on the pictures 83-4/83-5)')
    if (edStops.some(a => a && (a.old || !a.vis))) fail('focus landed on an old/invisible control in the window')
    pics.push(await L.pic(w, '83-2-save-focused'))
    await p.locator('#inpEditRmk').focus(); pics.push(await L.pic(w, '83-4-remarks-focused'))
    await p.locator('#inpEditSave').focus(); pics.push(await L.pic(w, '83-5-save-focused'))
    // use them: Dates by keyboard (a day button Enter), Remarks typed, Save by Enter
    await p.locator(`${L.WIN} #inpEdCal [data-cal="2026-07-19"]`).focus()
    await p.keyboard.press('Enter'); await sleep(250)
    const line = (await p.locator(`${L.WIN} .rc-read`).innerText()).replace(/\s+/g, ' ')
    await p.locator('#inpEditRmk').focus(); await p.keyboard.type('typed by keyboard')
    await p.locator('#inpEditSave').focus(); await p.keyboard.press('Enter'); await sleep(700)
    const q = await L.oilText(p)
    parts.push(`keyboard: Enter on day 19 gave the line "${line}"; remark typed; Enter on Save -> ${q ? 'OIL question appeared' : 'no question'}`)
    if (q) { await p.locator('[data-testid="oil-yes"]').focus(); await p.keyboard.press('Enter'); await p.locator('[data-testid="oilconf-save"]').focus(); await p.keyboard.press('Enter'); await sleep(600) }
    const r = await L.recId(p, duty.iid)
    parts.push('saved by keyboard: ' + fmt(r))
    if (!(r.date === 'Jul 19' && r.remarks === 'typed by keyboard')) fail('the keyboard edit was not saved: ' + fmt(r))
    await L.closeWins(p)
    // Undo / Redo
    const u = await L.undo(w); const rU = await L.recId(p, duty.iid)
    const rd = await L.redo(w); const rR = await L.recId(p, duty.iid)
    parts.push(`Undo ${u}: ${rU.date}; Redo ${rd}: ${rR.date}`)
    if (rU.date !== 'Jul 18' || rR.date !== 'Jul 19') fail('Undo/Redo of the keyboard edit wrong')
  }
  // ---- a keyboard-only paperclip on the ATT C row
  await L.toList(w)
  const clip = p.locator(`#inBody tr[data-iid="${att.iid}"] .rclip`)
  await clip.focus()
  const cf = await act()
  const clipInfo = await clip.evaluate(e => ({ tag: e.tagName, tabindex: e.getAttribute("tabindex"), role: e.getAttribute("role"), cls: e.className }))
  parts.push(`the row paperclip (${JSON.stringify(clipInfo)}) takes keyboard focus: ${JSON.stringify(cf && { tag: cf.tag, ring: cf.ring })}`)
  await p.keyboard.press('Enter'); await sleep(500)
  const viewer = await p.locator('#docViewPop:not([hidden])').count()
  parts.push(`Enter on the paperclip opened the viewer: ${viewer}; the window did not open: ${(await L.win(p).count()) === 0}`)
  if (viewer) await p.locator('#docViewClose').click()
  // ---- read-only row as Ranger
  await L.switchUser(w, 'us')
  await L.toList(w); await L.showEveryone(w)
  await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0) })
  let rreach = null
  const rstops = []
  for (let i = 0; i < 500; i++) {
    await p.keyboard.press('Tab')
    const a = await act(); rstops.push(a)
    const tgt = await p.evaluate(iid => { const e = document.activeElement; return !!e && e.matches('[data-testid="in-open"]') && !!e.closest(`tr[data-iid="${iid}"]`) }, duty.iid)
    if (tgt) { rreach = i + 1; break }
  }
  parts.push(`Ranger: Tab reached the Name of Saber's row after ${rreach || 'NEVER'} presses; old/invisible stops: ${rstops.filter(a => a && (a.old || !a.vis)).length}`)
  if (!rreach) fail('Ranger could not reach the row by Tab')
  else {
    await p.keyboard.press('Enter'); await L.win(p).waitFor(); await sleep(400)
    const stops2 = []
    for (let i = 0; i < 60; i++) { await p.keyboard.press('Tab'); const a = await act(); stops2.push(a); if (!a || (a.id === 'inpEditCancel')) break }
    const nm = stops2.map(a => a ? (a.id || a.tid || a.tag + '.' + a.cls.split(' ')[0]) : '-')
    parts.push('Ranger keyboard stops inside the read-only window: ' + nm.join(' > '))
    const live = stops2.filter(a => a && a.inWin && ['INPUT', 'SELECT', 'TEXTAREA'].includes(a.tag))
    if (live.length) fail('a form field took keyboard focus in the read-only window: ' + live.map(a => a.id).join(','))
    if (nm.includes('inpEditSave') || nm.includes('inpEditDel')) fail('Save/Delete reachable by keyboard in the read-only window')
    // try to type into the remark and into the title by keyboard
    await p.keyboard.type('hack')
    const rm = await p.locator('#inpEditRmk').inputValue(); const tt = await p.locator('#inpEditOwnTitle').inputValue()
    const rec2 = await L.recId(p, duty.iid)
    parts.push(`typing into the read-only window: remark "${rm}", title "${tt}"; saved record ${fmt(rec2)}`)
    if (/hack/.test(rm + tt) || /hack/.test(rec2.remarks || '')) fail('keyboard typing changed a read-only field')
    pics.push(await L.pic(w, '83-3-readonly-keyboard'))
    await p.keyboard.press('Enter'); await sleep(300)
  }
  L.row(83, 'desktop 1440x900', 'Admin (Saber) and Member (Ranger)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '83-err'))
  L.row(83, 'desktop 1440x900', 'Admin / Member', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
