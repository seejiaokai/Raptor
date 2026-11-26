// bell190 walker A — group 5: a several-day input, a man added on its middle day [A10]; group 6: the input's own window
// opened from the schedule, a person added [F19, A11], and the Board's "+ Inputs" filing for him [A12]; group 7: an add
// waiting on the OIL question (Saturday) [F8, A37] and a refused drop [F10, A36]. Usage: node bell190-a-g567.mjs [filter]
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g567 v2', L.LIBV)
const R = L.recorder('bell190-a-g567')
const only = process.argv[2] || ''
const { ID, J } = L
const goesU = async w => { if (await w.page.locator('[data-testid="inpEdit-goes-u"]').count()) await L.press(w, '[data-testid="inpEdit-goes-u"]') }
/* the input window's range: Tue then Thu on its own calendar */
const tueThu = extra => async w => { if (extra) await extra(w); for (const iso of [L.TUE, L.THU]) { const b = w.page.locator(`#inpEdCal [data-iso="${iso}"]`).first(); if (await b.count()) await b.click(); else console.log('  NOTE: no day ' + iso + ' on the window calendar'); await L.sleep(250) } }
const visDialogs = p => p.evaluate(() => { const vis = e => e && e.getBoundingClientRect().width > 3 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'; return [...document.querySelectorAll('[data-testid="oilconf"], [data-testid^="oilwait"], .oilwait, [data-testid*="confirm"], [role="dialog"], [role="alertdialog"]')].filter(vis).map(x => ({ id: x.getAttribute('data-testid') || x.id || String(x.className).slice(0, 30), text: (x.innerText || '').replace(/\s+/g, ' ').slice(0, 300), btns: [...x.querySelectorAll('button')].filter(vis).map(b => (b.getAttribute('data-testid') || b.id || '') + '|' + (b.textContent || '').trim().slice(0, 30)) })) })
async function ranger(w, c, pb, re, judge) {
  const rr = await L.readAs(w, 'us', pb + '-4-ranger', re)
  const lines = (rr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what} | ${l.cls}`)
  const v = judge ? judge(rr.bell.lines || []) : 'RECORD'
  R(c, 'Ranger\'s bell on screen', v, { lit: rr.bell.lit, lines, toast: rr.bell.toast }, '', [rr.bell.lift, rr.bell.pic].filter(Boolean))
  if (rr.tap) R(c, 'a tap on Ranger\'s line', rr.tap.editor ? 'PASS' : 'FAIL', { type: rr.tap.type, people: rr.tap.people, person: rr.tap.person, page: rr.tap.page }, 'opens the input', [rr.tap.pic])
  return rr
}
const oneAdded = re => lines => { const m = lines.filter(l => re.test(l.name) && /You were/.test(l.what)); return m.length === 1 && /^You were added · Saber$/.test(m[0].what) ? 'PASS' : 'FAIL' }

/* ---------- group 5: a several-day input ---------- */
for (const shape of ['ground', 'unav']) {
  const c = `A5-tue-thu-${shape}-week-desk`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  const w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const iid = shape === 'ground'
      ? await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally, ID.Hex], from: '09:00', to: '11:00', before: tueThu() })
      : await L.fileInput(w, L.WED, { type: 'Other', people: [ID.Tally], title: 'Course', before: tueThu(goesU) })
    const r0 = await L.rec(w.page, iid)
    R(c, 'fixture', r0 && r0.endDate ? 'DONE' : 'NOTE', r0)
    const p = w.page
    await L.go(p, 'editsched')
    const n0 = await L.allNotices(p)
    const pb = `a-${c}`
    let d, target
    if (shape === 'ground') {
      const place = await L.rowPlace(p, 2, iid, null)
      R(c, 'its rows on Tue / Wed / Thu', 'RECORD', { tue: await L.rowsOf(p, 1, iid), wed: await L.rowsOf(p, 2, iid), thu: await L.rowsOf(p, 3, iid) })
      if (!place) { R(c, 'fixture', 'NOT WALKED', 'no Wed row'); await w.ctx.close(); continue }
      target = `#eWeek ${place.sel}`
    } else {
      const k = await p.evaluate(iid => { const e = [...document.querySelectorAll(`#eWeek .day:nth-child(3) [data-inpseat^="${iid}"], #eWeek [data-inpseat^="${iid}"]`)].filter(x => x.getBoundingClientRect().width > 3); return e.map(x => x.getAttribute('data-inpseat') + '@' + Math.round(x.getBoundingClientRect().left)) }, iid)
      R(c, 'its Unavailable places on the week', 'RECORD', k)
      /* Wednesday's column: the middle one of the three drawn (Tue, Wed, Thu by their left edge) */
      const xs = [...new Set(k.map(s => +s.split('@')[1]))].sort((a, b) => a - b)
      target = { iid, x: xs[1] ?? xs[0] }
    }
    if (typeof target === 'string') d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', target, pb + '-2')
    else {
      /* mark Wednesday's own puck so the drag aims at it */
      await p.evaluate(([iid, x]) => { const e = [...document.querySelectorAll(`#eWeek [data-inpseat^="${iid}"]`)].find(y => Math.round(y.getBoundingClientRect().left) === x); if (e) e.setAttribute('data-bell190', 'wed') }, [target.iid, target.x])
      d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', '#eWeek [data-bell190="wed"] .puck[data-person="nick"]', pb + '-2')
    }
    const note = await L.toast(p)
    await L.sleep(600)
    await L.shot(w, pb + '-3-after')
    const fresh = L.newSince(n0, await L.allNotices(p))
    const r1 = await L.rec(p, iid)
    const allIds = await L.ids(p)
    R(c, 'the drop on Wednesday', d.ok ? 'DONE' : 'BLOCKED', { drag: d, note, before: r0 && r0.people, after: r1, inputsNow: allIds.length })
    const exp = shape === 'ground' ? { bane: 'in', nick: 'add:bane', rocky: 'add:bane', stiff: null } : { bane: 'in', nick: 'out', stiff: null }
    const j = L.judgeLines(fresh, exp, iid)
    R(c, 'one line each, not one a day', j.ok ? 'PASS' : 'FAIL', { judged: j.out, lines: fresh.map(L.fmtN) }, J(exp))
    if (shape === 'ground') { const rows = { tue: await L.rowsOf(p, 1, iid), wed: await L.rowsOf(p, 2, iid), thu: await L.rowsOf(p, 3, iid) }; R(c, 'Tue and Thu looked at after', 'RECORD', Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.map(r => [r.who, r.more])]))) }
    for (const di of [1, 3]) { await p.evaluate(([di, iid]) => { const e = [...document.querySelectorAll(`#eWeek [data-slot^="g:${di}."], #eWeek [data-inpseat^="${iid}"]`)].find(x => x.getBoundingClientRect().width > 3); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, [di, iid]); await L.sleep(300); await L.shot(w, pb + `-3-day${di}`) }
    await ranger(w, c, pb, /Training|Course|Other/, oneAdded(/Training|Course|Other/))
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}

/* ---------- group 6: the input's own window opened from the schedule ---------- */
for (const [door, kind, withTime, shared] of [['week', 'desk', false, false], ['board', 'desk', true, false], ['board', 'phone', false, false], ['week', 'desk', false, true], ['board', 'desk', true, true], ['board', 'phone', false, true]]) {
  const c = `A6-window-${shared ? 'shared-' : 'one-'}${door}-${kind}${withTime ? '-and-time' : ''}`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  let w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const iid = await L.fileInput(w, L.WED, { type: 'Training', people: shared ? [ID.Tally, ID.Hex] : [ID.Tally], from: '09:00', to: '11:00' })
    if (kind === 'phone') { w = await L.handOver(w, 'phone'); await L.signIn(w, 'ad') }
    const p = w.page
    let root
    if (door === 'week') { await L.go(p, 'editsched'); root = '#eWeek' } else { await L.openBoard(w, 2); root = '#schedBoard' }
    const pb = `a-${c}`
    /* Personal Inputs is folded by default: unfold Wednesday's, then the input's own label */
    let lab = p.locator(`${root} [data-inpedit="${iid}"]`).filter({ visible: true }).first()
    if (!(await lab.count())) { const fold = p.locator(`${root} [data-pitog="2"]`).filter({ visible: true }).first(); if (await fold.count()) { await L.press(w, fold); await L.sleep(400) } lab = p.locator(`${root} [data-inpedit="${iid}"]`).filter({ visible: true }).first() }
    if (!(await lab.count())) { R(c, 'the input\'s label on the schedule', 'BLOCKED', 'no [data-inpedit] label for the input on ' + root); await w.ctx.close(); continue }
    await L.shot(w, pb + '-1-label')
    await L.press(w, lab)
    /* from the schedule the input opens as a window hanging from its label (#inpEditPop), not the Inputs page's own */
    await p.locator('#inpEditPop').filter({ visible: true }).first().waitFor({ timeout: 5000 })
    await L.sleep(400)
    if (w.tap) await L.shot(w, pb + '-2-window-lift')
    const n0 = await L.allNotices(p)
    /* what this window offers for its people: a people list (a shared input) or one Person box with no "Several people" */
    const offer = await p.evaluate(() => ({ list: [...document.querySelectorAll('#inpEditPop [data-pp]')].filter(b => b.getBoundingClientRect().width > 0).length, several: !!document.querySelector('#inpEditPop [data-testid="pp-several"]') || [...(document.querySelector('#inpEditPop #inpEditPerson')?.options || [])].some(o => /Several/i.test(o.textContent)), personBox: !!document.querySelector('#inpEditPop #inpEditPerson') }))
    await L.shot(w, pb + '-2-window-opened')
    let mode
    if (offer.list) { mode = 'add'; await L.press(w, p.locator('#inpEditPop [data-pp="bane"]').filter({ visible: true }).first()) }
    else { mode = 'person'; R(c, 'what the window from the schedule offers', 'RECORD', offer, 'F19 wanted "Several people" turned on: this window has one Person box and no "Several people" — so the person is CHANGED (F20)', [pb + '-2-window-opened.png']); await p.selectOption('#inpEditPop #inpEditPerson', 'bane'); await L.sleep(300) }
    if (withTime) { await p.fill('#inpEditPop #inpEditStart', '10:00'); await L.sleep(200) }
    const lit = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')).concat([document.querySelector('#inpEditPop #inpEditPerson')?.value || '']))
    await L.shot(w, pb + '-2-window')
    await L.press(w, '#inpEditSave')
    const asked = await L.answerAsks(w)
    const note = await L.toast(p)
    await L.sleep(500)
    await L.shot(w, pb + '-3-after')
    const fresh = L.newSince(n0, await L.allNotices(p))
    const r1 = await L.rec(p, iid)
    R(c, 'added in the window, saved', r1 && r1.people.includes('bane') ? 'DONE' : 'BLOCKED', { picked: lit, asked, note, after: r1 })
    const ran = fresh.filter(n => [].concat(n.to).includes('bane')), sab = fresh.filter(n => [].concat(n.to).includes('stiff'))
    const others = shared ? ['nick', 'rocky'] : ['nick']
    if (mode === 'add') {
      const okO = others.every(o => { const t = fresh.filter(n => [].concat(n.to).includes(o)); return t.length === 1 && t[0].what.some(x => x.k === 'add') && (!withTime || t[0].what.some(x => x.k === 'when')) })
      const ok = ran.length === 1 && L.kinds(ran[0].what) === 'in' && okO && !sab.length
      R(c, 'lines written (the store)', ok ? 'PASS' : 'FAIL', fresh.map(L.fmtN), withTime ? 'F19: Ranger only "You were added" (nothing about the time); Tally and Hex one line each "Now 10:00–11:00, Ranger added" · Saber' : 'Ranger "You were added"; Tally and Hex "Ranger added"; Saber none')
    } else {
      const tal = fresh.filter(n => [].concat(n.to).includes('nick'))
      const ok = ran.length === 1 && L.kinds(ran[0].what) === 'in' && tal.length === 1 && L.kinds(tal[0].what) === 'out' && !sab.length
      R(c, 'the person changed in the window: lines (the store)', ok ? 'PASS' : 'FAIL', fresh.map(L.fmtN), 'F20 (D776): Ranger "You were added"; Tally "You were taken off"; Saber none' + (withTime ? ' — the time changed in the same save is new to Ranger, and Tally is out' : ''))
    }
    if (door === 'board') await L.closeBoard(w)
    await ranger(w, c, pb, /Training/, oneAdded(/Training/))
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}
/* the Board's "+ Inputs" filing for Ranger [A12] */
{
  const c = 'A6-board-plus-inputs-desk'
  if (!only || c.includes(only)) {
    console.log('\n=====', c)
    const w = await L.newWorld('desk')
    try {
      await L.signIn(w, 'ad')
      const p = w.page
      await L.openBoard(w, 2)
      const pb = `a-${c}`
      const n0 = await L.allNotices(p), i0 = await L.ids(p)
      await L.press(w, '#schedBoard [data-inpadd="2.g"]')
      await L.sleep(600)
      await L.shot(w, pb + '-1-opened')
      const open = await p.locator('#inpEditPop #inpEditType').count()
      if (!open) { R(c, '"+ Inputs"', 'BLOCKED', 'no input window opened: ' + J(await visDialogs(p))); throw new Error('stop') }
      await p.selectOption('#inpEditPop #inpEditType', 'Training'); await L.sleep(200)
      if (await p.locator('#inpEditPop #inpEditPerson').count()) await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
      else { await L.press(w, '#inpEditPop [data-pp="bane"]') }
      const ad = p.locator('#inpEditPop #inpEditAllday'); if (await p.locator('#inpEditSpan [data-span="custom"]').count()) await L.press(w, '#inpEditSpan [data-span="custom"]'); else if (await ad.count() && await ad.isChecked()) await ad.click()
      if (await p.locator('#inpEditPop #inpEditStart').count()) { await p.fill('#inpEditPop #inpEditStart', '09:00'); await p.fill('#inpEditPop #inpEditEnd', '10:00') }
      await L.shot(w, pb + '-2-filled')
      await L.press(w, '#inpEditSave')
      const asked = await L.answerAsks(w)
      const note = await L.toast(p)
      await L.sleep(500)
      await L.shot(w, pb + '-3-after')
      const made = (await L.ids(p)).filter(x => !i0.includes(x))
      const fresh = L.newSince(n0, await L.allNotices(p))
      R(c, 'filed from the Board', made.length === 1 ? 'DONE' : 'BLOCKED', { made, rec: made[0] && await L.rec(p, made[0]), asked, note })
      const j = L.judgeLines(fresh, { bane: 'in', stiff: null }, made[0])
      R(c, 'lines written (the store)', j.ok ? 'PASS' : 'FAIL', j.out, 'Ranger "You were added" · Saber; nobody else')
      await L.closeBoard(w)
      await ranger(w, c, pb, /Training/, oneAdded(/Training/))
    } catch (e) { if (e.message !== 'stop') R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
    await w.ctx.close().catch(() => {})
  }
}

/* ---------- group 7: the OIL question (Saturday), and a refused drop ---------- */
for (const how of ['answer', 'back']) {
  const c = `A7-sat-oil-${how}-week-desk`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  const w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const iid = await L.fileInput(w, L.SAT, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00', oil: 'yes' })
    const p = w.page
    await L.go(p, 'editsched')
    const place = await L.rowPlace(p, 5, iid, ID.Tally)
    if (!place) { R(c, 'fixture', 'NOT WALKED', await L.groundDump(p, 5)); await w.ctx.close(); continue }
    const pb = `a-${c}`
    const n0 = await L.allNotices(p)
    const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
    await L.sleep(600)
    const q = await visDialogs(p)
    const qpic = await L.shot(w, pb + '-3-question')
    const r1 = await L.rec(p, iid)
    const f1 = L.newSince(n0, await L.allNotices(p))
    R(c, 'the drop raises the OIL question; nothing moves', q.length && J(r1.people) === J(['nick']) ? 'PASS' : 'FAIL', { drag: d.ok ? d.under : d.why, question: q, input: r1.people, note: await L.toast(p) }, 'D780/D783: not made until answered', [qpic])
    R(c, 'no line while the question is up', f1.length ? 'FAIL' : 'PASS', f1.map(L.fmtN), 'none (F8)')
    if (how === 'answer') {
      const y = p.locator('[data-testid="oil-yes"]:visible, [data-testid="oil-all"]:visible').first()
      if (await y.count()) await y.click()
      await p.locator('[data-testid="oilconf-save"]:visible').first().click().catch(() => {})
      await L.sleep(900)
      const r2 = await L.rec(p, iid)
      const f2 = L.newSince(n0, await L.allNotices(p))
      await L.shot(w, pb + '-4-answered')
      const j = L.judgeLines(f2, { bane: 'in', nick: 'out', stiff: null }, iid)
      R(c, 'answered Yes: the change made, one line each', j.ok ? 'PASS' : 'FAIL', { input: r2.people, judged: j.out, note: await L.toast(p) }, 'Ranger one "You were added"; Tally "You were taken off"')
      await ranger(w, c, pb, /Training/, oneAdded(/Training/))
    } else {
      const b = p.locator('[data-testid="oilconf-cancel"]:visible, [data-testid="oilconf"] button:has-text("Don")').first()
      const bt = await b.count() ? await b.textContent() : null
      if (await b.count()) await b.click()
      await L.sleep(900)
      const q2 = await visDialogs(p)
      const bar = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => /Answer OIL/i.test(b.textContent || '') && b.getBoundingClientRect().width > 3).map(b => (b.closest('[class]')?.className || '') + '|' + b.textContent.trim()))
      await L.shot(w, pb + '-4-backed')
      const r2 = await L.rec(p, iid)
      const f2 = L.newSince(n0, await L.allNotices(p))
      R(c, 'left without an answer: nothing made, nobody told', f2.length === 0 && J(r2.people) === J(['nick']) ? 'PASS' : 'FAIL', { pressed: bt, after: q2, answerBar: bar, input: r2.people, lines: f2.map(L.fmtN) }, 'no line for Ranger or Tally (F8 b)')
      await ranger(w, c, pb, /Training/, lines => lines.filter(l => /Training/.test(l.name)).length === 0 ? 'PASS' : 'FAIL')
    }
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}
{
  const c = 'A7-refused-already-on-week-desk'
  if (!only || c.includes(only)) {
    console.log('\n=====', c)
    const w = await L.newWorld('desk')
    try {
      await L.signIn(w, 'ad')
      const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally, ID.Ranger], from: '09:00', to: '11:00' })
      const p = w.page
      await L.go(p, 'editsched')
      const place = await L.rowPlace(p, 2, iid, null)
      const pb = `a-${c}`
      const n0 = await L.allNotices(p)
      const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
      const note = await L.toast(p)
      await L.sleep(300)
      const pic = await L.shot(w, pb + '-3-refused')
      const f = L.newSince(n0, await L.allNotices(p))
      R(c, 'Ranger dropped where he is already on the input', /already/.test(note) && f.length === 0 ? 'PASS' : 'FAIL', { drag: d.ok ? d.under : d.why, note, input: (await L.rec(p, iid)).people, lines: f.map(L.fmtN) }, 'its refusal said ("Ranger is already on this input"); no line for anyone (F10, A36)', [pic])
    } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
    await w.ctx.close().catch(() => {})
  }
}
await L.closeAll()
