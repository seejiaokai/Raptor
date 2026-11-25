// F1–F6 — six sentences on screen that are not true under rulings he already made, each pictured as the app prints it
// today and then with only its words changed (the element the app drew, its words replaced; nothing else touched).
// Staging follows the audit's reproduction (raptor-port/docs/superpowers/briefs/2026-11-25-rulings-audit-repro-1.md and
// -2.md, on the branch claude/readings-lapse-fix-fdbb3c), through the app's own controls on the DESKTOP; the store is then
// handed to the phone (its saved state), where nothing is typed.
// Hover words are never painted by a browser: where a sentence lives only in a control's hover words, the script reads them
// off the control and draws them in a yellow label under it, saying so on the label.
//
// Run from raptor-port/, against the live build:  GW_URL=http://localhost:4791/ GW_ONLY=f4,f5 node docs/mock/2026-11-25-guardrail-wording/draw-f.mjs
import * as K from './kit.mjs'

export const W = {
  f1window: what => `The OIL answer for this ${what} is No, so by default nobody behind it earns. Tap an unlit puck to credit a man; tap a lit one to stop his credit.`,
  f1own: (cs, thing) => `The OIL answer for ${thing} is No — tap to put ${cs} on it anyway`,
  f1filer: (cs, thing) => `${cs} — the OIL answer for ${thing} is No; tap to credit him anyway`,
  f2: 'Earned off the published schedule. To change it, change the schedule and publish the day again.',
  f3open: (who, by) => `Only ${who}, ${by} (who filed it) or an admin can change this.`,
  f3delete: (who, by) => `Only ${who}, ${by} (who filed it) or an admin can delete this input`,
  f4: { 'misses flight brief': 'overlap flight brief', 'misses sim brief': 'overlap sim brief', 'misses flight debrief': 'overlap flight debrief', 'misses sim debrief': 'overlap sim debrief' },
  f5note: 'Warning hidden: no flag, not counted. It returns only if another man or another item is in the clash.',
  f5x: 'Hide this warning — it flags no puck and is not counted; it comes back only if another man or another item is in the clash',
  f6: 'Every input closes the man for the hours it covers, from the moment it is filed. One a scheduler has taken off the programme, cancelled (CX) or marked information only closes nothing.',
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
const sleep = K.wait

/* replace the words of every visible text node under `root` that matches, keeping the element the app drew */
const swapWords = (p, root, pairs) => p.evaluate(([root, pairs]) => {
  let n = 0
  for (const r of document.querySelectorAll(root)) {
    if (!r.getBoundingClientRect().width) continue
    const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT)
    let t; while ((t = tw.nextNode())) { for (const [a, b] of pairs) if (t.nodeValue.includes(a)) { t.nodeValue = t.nodeValue.split(a).join(b); n++ } }
  }
  return n
}, [root, pairs])

/* ---------------------------------------------------------------- F6: the Logic page line ---------------------------------------- */
async function f6(key) {
  const { b, p, sz } = await K.world(key)
  await K.signIn(p); await K.go(p, 'logic')
  const found = await p.evaluate(() => {
    const els = [...document.querySelectorAll('#page-logic *')].filter(e => e.children.length === 0 && /^Every input closes the man/.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 0)
    if (!els.length) return null
    const e = els[0]; e.setAttribute('data-gwf6', 'line')
    let row = e; for (let i = 0; i < 6 && row && !/An input closes its hours/.test(row.textContent || ''); i++) row = row.parentElement
    if (row) row.setAttribute('data-gwf6row', '1')
    e.scrollIntoView({ block: 'center' })
    return { line: e.textContent.trim(), row: row ? row.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) : null }
  })
  K.fact('F6', sz.name, 'the Logic line today', found)
  if (!found) throw new Error('F6: the line is not on the Logic page')
  await sleep(p, 400)
  await K.markEl(p, '[data-gwf6="line"]', '1')
  await K.shot(p, sz, 'f6-today', ['[data-gwf6row]', '[data-gwf6="line"]'], 14)
  await p.evaluate(w => { document.querySelector('[data-gwf6="line"]').textContent = w }, W.f6)
  await K.shot(p, sz, 'f6-proposed', ['[data-gwf6row]', '[data-gwf6="line"]'], 14)
  await b.close()
}

/* ------------------------------------------------- F4: the Legend, the warnings' short names, the Logic page's flag key ----------- */
async function f4(key) {
  const { b, p, sz } = await K.world(key)
  await K.signIn(p)
  await K.weekDay(p, sz, 0)
  /* the Legend */
  const sum = p.locator('summary.legend-sum').filter({ visible: true }).first()
  await sum.evaluate(e => e.scrollIntoView({ block: 'center' })); await sum.click(); await sleep(p, 500)
  const labs = await p.evaluate(() => {
    const ls = [...document.querySelectorAll('span')].filter(e => e.getBoundingClientRect().width > 0 && e.querySelector(':scope > .qk') && /misses /.test(e.textContent))
    ls.forEach((e, i) => e.setAttribute('data-gwleg', String(i)))
    const leg = ls[0] && ls[0].closest('details'); if (leg) leg.setAttribute('data-gwlegend', '1')
    ls[0] && ls[0].scrollIntoView({ block: 'center' })
    return ls.map(e => e.textContent.trim())
  })
  K.fact('F4', sz.name, 'Legend labels today', labs)
  if (labs.length !== 4) throw new Error('F4: expected four Legend labels, found ' + labs.length)
  await sleep(p, 300); await K.neutral(p)
  for (let i = 0; i < 4; i++) await K.markEl(p, `[data-gwleg="${i}"]`, i === 0 ? '1' : '', { inset: false })
  const legSels = ['[data-gwleg="0"]', '[data-gwleg="1"]', '[data-gwleg="2"]', '[data-gwleg="3"]', 'summary.legend-sum']
  await K.shot(p, sz, 'f4-legend-today', legSels, 14)
  await swapWords(p, '[data-gwleg]', Object.entries(W.f4))
  await K.shot(p, sz, 'f4-legend-proposed', legSels, 14)
  await K.unmark(p)
  await sum.click(); await sleep(p, 300)
  /* Monday's warning list, opened: each group's short name */
  const dw = p.locator('#eWeek .day[data-day="0"] .daywarn').filter({ visible: true }).first()
  await dw.evaluate(e => e.scrollIntoView({ block: 'center' })); await dw.click(); await sleep(p, 600)
  const codes = await p.evaluate(() => {
    const cs = [...document.querySelectorAll('#eWeek .day[data-day="0"] .wcode')].filter(e => e.getBoundingClientRect().width > 0 && /^Misses/.test(e.textContent.trim()))
    cs.forEach((e, i) => { e.setAttribute('data-gwcode', String(i)); e.closest('.witem')?.setAttribute('data-gwline', String(i)) })
    cs[0] && cs[0].scrollIntoView({ block: 'center' })
    return cs.map(e => e.textContent.trim() + ' | ' + (e.closest('.witem')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140))
  })
  K.fact('F4', sz.name, 'warning short names today (Monday)', codes)
  await sleep(p, 300); await K.neutral(p)
  const n = Math.min(codes.length, K.isPhone(sz) ? 3 : 5)
  for (let i = 0; i < n; i++) await K.markEl(p, `[data-gwcode="${i}"]`, String(i + 2))
  const lineSels = []; for (let i = 0; i < n; i++) lineSels.push(`[data-gwline="${i}"]`)
  await K.shot(p, sz, 'f4-warnings-today', lineSels, 10)
  await swapWords(p, '[data-gwcode]', Object.entries(W.f4).map(([a, b]) => [cap(a), cap(b)]))
  await K.shot(p, sz, 'f4-warnings-proposed', lineSels, 10)
  await K.unmark(p)
  /* the Logic page's key of flags (the same short names, read from one list) */
  await K.go(p, 'logic')
  const lk = await p.evaluate(() => {
    const ls = [...document.querySelectorAll('#page-logic span')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length && /^\s*\S+\s*Misses /.test(e.textContent))
    ls.forEach((e, i) => e.setAttribute('data-gwlk', String(i)))
    ls[0] && ls[0].scrollIntoView({ block: 'center' })
    return ls.map(e => e.textContent.trim())
  })
  K.fact('F4', sz.name, 'Logic page: the checks\' names and the flag key today', lk)
  /* two places on the Logic page: the four checks' own names ("Advisory:" is their colour said in words) and the key of flags */
  const groups = [['f4-logic-checks', lk.map((t, i) => /^Advisory/.test(t) ? i : -1).filter(i => i >= 0)], ['f4-logic-key', lk.map((t, i) => /^Advisory/.test(t) ? -1 : i).filter(i => i >= 0)]]
  let tagN = n + 2
  for (const [nm, idx] of groups) {
    if (!idx.length) continue
    await p.evaluate(i => document.querySelector(`[data-gwlk="${i}"]`).scrollIntoView({ block: 'center' }), idx[0]); await sleep(p, 300)
    for (const i of idx) await K.markEl(p, `[data-gwlk="${i}"]`, i === idx[0] ? String(tagN) : '')
    tagN++
    const sels = idx.map(i => `[data-gwlk="${i}"]`)
    await K.shot(p, sz, nm + '-today', sels, 30)
    await swapWords(p, sels.join(','), Object.entries(W.f4).map(([a, b]) => [cap(a), cap(b)]))
    await K.shot(p, sz, nm + '-proposed', sels, 30)
    await K.unmark(p)
  }
  await b.close()
}

/* ------------------------------------------------- F5: hiding a clash (Monday, Ranger's VL BFM & Sim EP-4) --------------------- */
async function f5(key) {
  const { b, p, sz } = await K.world(key)
  await K.signIn(p)
  await K.weekDay(p, sz, 0)
  const day = '#eWeek .day[data-day="0"]'
  const dw = p.locator(`${day} .daywarn`).filter({ visible: true }).first()
  await dw.evaluate(e => e.scrollIntoView({ block: 'center' })); await dw.click(); await sleep(p, 600)
  const line = await p.evaluate(day => {
    const l = [...document.querySelectorAll(`${day} .witem`)].find(e => e.getBoundingClientRect().width > 0 && /Ranger/.test(e.textContent) && /Conflict/.test(e.textContent) && /Sim EP-4/.test(e.textContent))
    if (!l) return null
    l.setAttribute('data-gwf5', 'line'); l.querySelector('.witem-mute')?.setAttribute('data-gwf5', 'x'); l.scrollIntoView({ block: 'center' })
    return { text: l.textContent.replace(/\s+/g, ' ').trim(), x: l.querySelector('.witem-mute')?.title }
  }, day)
  K.fact('F5', sz.name, 'the clash line and its ✕ hover words (today)', line)
  if (!line) throw new Error('F5: no Ranger clash line on Monday')
  await sleep(p, 300); await K.neutral(p)
  await K.markEl(p, '[data-gwf5="x"]', '1')
  await K.hoverLabel(p, '[data-gwf5="x"]', line.x)
  await K.shot(p, sz, 'f5-x-today', ['[data-gwf5="line"]', '#gw-hover'], 10)
  await K.hoverLabel(p, '[data-gwf5="x"]', W.f5x)
  await K.shot(p, sz, 'f5-x-proposed', ['[data-gwf5="line"]', '#gw-hover'], 10)
  await K.hoverOff(p); await K.unmark(p)
  /* the real press of ✕, then its note */
  await p.locator('[data-gwf5="x"]').click(); await sleep(p, 300)
  const note = await K.holdNote(p)
  K.fact('F5', sz.name, 'the note after ✕ (today)', note)
  if (!/Warning hidden/.test(note || '')) throw new Error('F5: no hidden note')
  const hid = await p.evaluate(day => { const l = [...document.querySelectorAll(`${day} .witem`)].find(e => e.getBoundingClientRect().width > 0 && /Sim EP-4/.test(e.textContent) && /Ranger/.test(e.textContent)); if (l) l.setAttribute('data-gwf5', 'hid'); return l ? l.className : null }, day)
  K.fact('F5', sz.name, 'the line after ✕', hid)
  await K.markEl(p, '#toastEl', '2')
  const sels = ['#toastEl', '[data-gwf5="hid"]']
  await K.shot(p, sz, 'f5-note-today', K.isPhone(sz) ? ['#toastEl'] : sels, 12)
  await p.evaluate(w => { const t = document.getElementById('toastEl'); t.textContent = w }, W.f5note)
  await K.shot(p, sz, 'f5-note-proposed', K.isPhone(sz) ? ['#toastEl'] : sels, 12)
  await b.close()
}

/* ------------------------------------------------- F3: Hex opens a Training Ranger filed for Ace ------------------------------- */
async function inputsCal(p) {
  await K.go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click()
  await p.locator('#inpCal').waitFor(); await sleep(p, 400)
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 30 && !(await p.locator('[data-icday="2026-07-16"]').count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MON.findIndex(x => x.startsWith(m)), want = 2026 * 12 + 6
    await p.locator(at < want ? '#icNext' : '#icPrev').click(); await sleep(p, 350)
  }
}
async function dayOpen(p, iso) {
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]'); await sleep(p, 500)
}
async function f3(key, state) {
  const { b, ctx, p, sz } = await K.world(key, state)
  let saved = null
  if (!state) {
    await K.signIn(p, 'us', 'us')
    await inputsCal(p); await dayOpen(p, '2026-07-16')
    await p.locator('#icPopAdd').click(); await p.waitForSelector('#inpEditPop #inpEditType')
    await p.selectOption('#inpEditPop #inpEditType', 'Training'); await sleep(p, 300)
    await p.selectOption('#inpEditPop #inpEditPerson', { label: 'Ace' }); await sleep(p, 300)
    await p.locator('#inpEditOwnTitle').fill('Range brief')
    await p.locator('#inpEditSave').click(); await sleep(p, 900)
    for (let k = 0; k < 3; k++) { if (await p.locator('[data-testid="docconf"]').count()) { await p.locator('[data-testid="docconf-nodoc"]').click(); await sleep(p, 400) } }
    const rec = await p.evaluate(() => window.INPUTS.filter(r => r.title === 'Range brief').map(r => ({ who: (r.people || []).map(x => window.PEOPLE[x.p || x]?.cs), by: window.PEOPLE[r.by]?.cs })))
    K.fact('F3', sz.name, 'staged: the input Ranger filed', rec)
    if (rec.length !== 1 || rec[0].by !== 'Ranger') throw new Error('F3: the input did not land ' + JSON.stringify(rec))
    saved = await K.saveState(ctx, 'f3-staged')
    await K.switchUser(p, 'hex', 'x')
  } else await K.signIn(p, 'hex', 'x')
  await inputsCal(p)
  /* the calendar's person filter, set to Ace (its own select) */
  const sel = p.locator('#inpCal select, #page-inputs select').first()
  await sel.selectOption({ label: 'Ace' }, { force: true }).catch(async () => { await p.evaluate(() => { const s = document.querySelector('#page-inputs select'); const o = [...s.options].find(o => o.text === 'Ace'); s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })) }) })
  await sleep(p, 600)
  await dayOpen(p, '2026-07-16')
  await p.locator('[data-testid="win-inputsday"]').getByText('Range brief').first().click(); await sleep(p, 900)
  const ro = p.locator('[data-testid="inped-ro"]')
  const roText = (await ro.count()) ? K.clean(await ro.innerText()) : null
  K.fact('F3', sz.name, 'Hex opens it: the line (today)', roText)
  if (!roText) throw new Error('F3: no refusal line')
  await p.evaluate(() => document.querySelector('[data-testid="inped-ro"]').scrollIntoView({ block: 'center' })); await sleep(p, 300)
  await K.markEl(p, '[data-testid="inped-ro"]', '1')
  const winSels = ['#inpEditPop .inped-head, #inpEditPop h2, #inpEditPop .win-h', '[data-testid="inped-ro"]', '#inpEditCancel', '#inpEditPop [class*="placed"], #inpEditPop [data-testid="inped-by"]']
  await K.shot(p, sz, 'f3-open-today', winSels, 14)
  await p.evaluate(w => { document.querySelector('[data-testid="inped-ro"]').textContent = w }, W.f3open('Ace', 'Ranger'))
  await K.shot(p, sz, 'f3-open-proposed', winSels, 14)
  await K.unmark(p)
  await p.evaluate(() => document.getElementById('inpEditCancel')?.click()); await sleep(p, 500)
  /* the Delete key on its card in the opened day (a keyboard's door: the desktop only) */
  if (!K.isPhone(sz)) {
    if (!(await p.locator('[data-testid="win-inputsday"]').count())) await dayOpen(p, '2026-07-16')
    const card = p.locator('[data-testid="win-inputsday"] .icard').filter({ hasText: 'Range brief' }).first()
    await card.locator('[data-testid="idy-open"]').focus(); await p.keyboard.press('Delete'); await sleep(p, 400)
    const note = await K.holdNote(p)
    K.fact('F3', sz.name, 'the Delete key on its card (today)', note)
    await card.evaluate(e => e.setAttribute('data-gwf3', 'card'))
    await K.markEl(p, '#toastEl', '2')
    await K.shot(p, sz, 'f3-delete-today', ['[data-gwf3="card"]', '#toastEl'], 14)
    await p.evaluate(w => { document.getElementById('toastEl').textContent = w }, W.f3delete('Ace', 'Ranger'))
    await K.shot(p, sz, 'f3-delete-proposed', ['[data-gwf3="card"]', '#toastEl'], 14)
  }
  await b.close()
  return saved
}

/* ------------------------------------------------- F1: an admin's "No to all" named as the filer's No -------------------------- */
async function fileIt(p, iso, spec) {
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  await inputsCal(p); await dayOpen(p, iso)
  await p.locator('#icPopAdd').click(); await p.waitForSelector('#inpEditPop #inpEditType')
  await p.selectOption('#inpEditPop #inpEditType', spec.type)
  await p.selectOption('#inpEditPop #inpEditPerson', spec.person)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', spec.from); await p.fill('#inpEditPop #inpEditEnd', spec.to)
  await p.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  await p.locator('#inpEditSave').click(); await sleep(p, 500)
  for (let k = 0; k < 3; k++) {
    if (await p.locator('[data-testid="oilconf"]').count()) { await p.locator('[data-testid="oilconf"] [data-testid="oil-yes"]').first().click(); await p.locator('[data-testid="oilconf-save"]').click(); await sleep(p, 400) }
    else if (await p.locator('[data-testid="docconf"]').count()) { await p.locator('[data-testid="docconf-nodoc"]').click(); await sleep(p, 400) }
  }
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await sleep(p, 250) }
  const made = await p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
  if (!made.length) throw new Error('F1: nothing filed for ' + spec.title)
  return made[0]
}
async function makeHoliday(p, iso, name = 'National Day') {
  await K.go(p, 'inputs')
  await p.locator('#inGear').click(); await sleep(p, 400)
  await p.locator('[data-testid="iset-days"]').click(); await sleep(p, 600)
  if (await p.locator('[data-testid="days-tab-holidays"]').count()) { await p.locator('[data-testid="days-tab-holidays"]').click(); await sleep(p, 300) }
  await p.locator('[data-testid="hol-add"]').click(); await sleep(p, 400)
  await p.locator('[data-testid="hol-kind-ph"]').click()
  await p.fill('[data-testid="hol-name"]', name)
  for (let i = 0; i < 14 && !(await p.locator(`[data-testid="holcal-day-${iso}"]`).count()); i++) { await p.locator('[data-testid="holcal-prev"]').click(); await sleep(p, 150) }
  for (let i = 0; i < 40 && !(await p.locator(`[data-testid="holcal-day-${iso}"]`).count()); i++) { await p.locator('[data-testid="holcal-next"]').click(); await sleep(p, 150) }
  await p.locator(`[data-testid="holcal-day-${iso}"]`).click(); await sleep(p, 200)
  await p.locator('[data-testid="hol-save"]').click(); await sleep(p, 900)
}
async function f1(key, state) {
  const { b, ctx, p, sz } = await K.world(key, state)
  let saved = null, ids
  if (!state) {
    await K.signIn(p, 'us', 'us')
    const all = await fileIt(p, '2026-07-17', { type: 'Training', person: 'allavail', from: '09:00', to: '12:00', title: 'Range brief' })
    const one = await fileIt(p, '2026-07-17', { type: 'Training', person: 'bane', from: '13:00', to: '15:00', title: 'Sim prep' })
    ids = { all, one }
    await K.switchUser(p, 'ad', 'a')
    await makeHoliday(p, '2026-07-17')
    const odl = p.locator('[data-testid="win-oilday"]')
    K.fact('F1', sz.name, 'the day\'s OIL list opened by itself', await odl.count())
    await p.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
    await p.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {})
    await p.locator('[data-testid="odl-noall"]').click(); await sleep(p, 300)
    await p.locator('[data-testid="odl-save"]').click(); await sleep(p, 600)
    const recs = await p.evaluate(ids => window.INPUTS.filter(r => [ids.all, ids.one].includes(r.iid)).map(r => {
      const o = {}; for (const [k, v] of Object.entries(r)) if (!['people'].includes(k)) o[k] = v; return o }), ids)
    K.fact('F1', sz.name, 'the two records after Saber\'s "No to all" (every field: is anything stamped with who answered?)', recs)
    await p.evaluate(ids => localStorage.setItem('gw-f1-ids', JSON.stringify(ids)), ids)
    saved = await K.saveState(ctx, 'f1-staged')
  } else {
    await K.signIn(p, 'ad', 'a')
    ids = await p.evaluate(() => JSON.parse(localStorage.getItem('gw-f1-ids')))
  }
  await K.board(p, sz, 4)
  await p.locator('#sbOil, #schedBoard [data-oilmode="4"]').filter({ visible: true }).first().click(); await sleep(p, 900); await K.hideNote(p)
  /* (a) the ALL AVAIL count window on Range brief's row */
  const chip = p.locator(`#schedBoard [data-oilsent="i:${ids.all}"]`).filter({ visible: true }).first()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await chip.click(); await sleep(p, 800)
  const hint = await p.evaluate(() => {
    const e = [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length === 0 && /^Whoever filed this/.test((e.textContent || '').trim()))[0]
    if (!e) return null
    e.setAttribute('data-gwf1', 'hint')
    let w = e; for (let i = 0; i < 14 && w && !((w.getAttribute('data-testid') || '').startsWith('win-') || w.getAttribute('role') === 'dialog'); i++) w = w.parentElement
    if (w) w.setAttribute('data-gwf1', 'win')
    return { hint: e.textContent.trim(), win: w ? (w.getAttribute('data-testid') || w.className) : null }
  })
  K.fact('F1', sz.name, 'the ALL AVAIL window (today)', hint)
  if (!hint) throw new Error('F1: no "Whoever filed" line')
  await K.markEl(p, '[data-gwf1="hint"]', '1')
  const winSel = hint.win ? '[data-gwf1="win"]' : '[data-gwf1="hint"]'
  await K.shot(p, sz, 'f1-window-today', [winSel, '[data-gwf1="hint"]'], 10)
  /* (c) a man behind the ALL AVAIL in the window: his puck's hover words */
  const behind = await p.evaluate(() => {
    const e = [...document.querySelectorAll('[data-gwf1="win"] [title]')].find(x => x.getBoundingClientRect().width > 0 && /whoever filed/.test(x.title))
    if (!e) return null; e.setAttribute('data-gwf1', 'behind'); return e.title
  })
  K.fact('F1', sz.name, 'a man behind ALL AVAIL in the window: hover words (today)', behind)
  await p.evaluate(w => { document.querySelector('[data-gwf1="hint"]').textContent = w }, W.f1window('“Range brief”'))
  await K.shot(p, sz, 'f1-window-proposed', [winSel, '[data-gwf1="hint"]'], 10)
  await K.unmark(p)
  if (behind) {
    const cs = behind.split(' — ')[0]
    await K.markEl(p, '[data-gwf1="behind"]', '2')
    await K.hoverLabel(p, '[data-gwf1="behind"]', behind)
    await K.shot(p, sz, 'f1-behind-today', ['[data-gwf1="behind"]', '#gw-hover'], 16)
    await K.hoverLabel(p, '[data-gwf1="behind"]', W.f1filer(cs, 'this “Range brief”'))
    await K.shot(p, sz, 'f1-behind-proposed', ['[data-gwf1="behind"]', '#gw-hover'], 16)
    await K.hoverOff(p); await K.unmark(p)
  }
  await p.keyboard.press('Escape'); await sleep(p, 400)
  /* (b) Ranger's own puck on Sim prep: its hover words */
  const pk = `#schedBoard [data-oilitem="i:${ids.one}"][data-oilp="bane"]`
  await p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); e && e.scrollIntoView({ block: 'center' }) }, pk); await sleep(p, 400)
  const title = await p.locator(pk).filter({ visible: true }).first().getAttribute('title')
  K.fact('F1', sz.name, 'Ranger\'s puck on Sim prep: hover words (today)', title)
  await p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); const r = e.closest('.sb-arow, .sb-line, .sb-row') || e.parentElement.parentElement; r.setAttribute('data-gwf1', 'row') }, pk)
  await K.markEl(p, pk, '3')
  await K.hoverLabel(p, pk, title)
  /* the row's own name box beside the puck (the whole row runs the board's width) */
  await p.evaluate(() => { const r = document.querySelector('[data-gwf1="row"]'); const n = r && [...r.querySelectorAll('input, textarea, [contenteditable]')].find(e => e.getBoundingClientRect().width > 0); n && n.setAttribute('data-gwf1', 'name') })
  const ownSels = K.isPhone(sz) ? ['[data-gwf1="row"]', '#gw-hover'] : ['[data-gwf1="name"]', pk, '#gw-hover']
  await K.shot(p, sz, 'f1-own-today', ownSels, 12)
  await K.hoverLabel(p, pk, W.f1own('Ranger', 'this “Sim prep”'))
  await K.shot(p, sz, 'f1-own-proposed', ownSels, 12)
  await K.hoverOff(p); await K.unmark(p)
  await b.close()
  return saved
}

/* ------------------------------------------------- F2: the Leave War's OIL card -------------------------------------------------- */
/* from the guard rail's staged Saturday (draw-g.mjs; its store in the scratch folder): the four signed, Publish day pressed;
   Hunter's (and Ranger's) HO* on Sat 18 Jul on the Leave War */
async function f2(key, state) {
  const { b, ctx, p, sz } = await K.world(key, state)
  let saved = null
  if (key === 'd') {
    await K.signIn(p, 'ad', 'a')
    await K.weekDay(p, sz, 5)
    for (const role of ['cur', 'sked', 'plan', 'appr']) {
      const s = p.locator(`#eWeek [data-signbar="5"] select[data-sign="${role}"]`).first()
      const opts = await s.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
      await s.selectOption(opts[0]); await sleep(p, 500)
    }
    await p.locator('#eWeek [data-beak="5"]').click(); await sleep(p, 1000)
    K.fact('F2', sz.name, 'Saturday published: the note', await K.noteText(p))
    saved = await K.saveState(ctx, 'f2-staged')
  } else await K.signIn(p, 'ad', 'a')
  const card = async (who, tag) => {
    await K.go(p, 'leavewar')
    await p.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(p, 900)
    const bar = p.locator('[data-testid="figures-toggle"]')
    if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(p, 300) }
    const m = p.locator('[data-testid="month-july"]').filter({ visible: true }).first()
    if (await m.count()) { await m.click(); await sleep(p, 900) }
    const cell = p.locator(`[data-testid="cell-${who}-2026-07-18"]`).first()
    await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(p, 400)
    K.fact('F2', sz.name, `${who}'s Sat 18 box`, K.clean(await cell.innerText()))
    await cell.click(); await sleep(p, 900)
    const where = await p.evaluate(() => {
      const ns = [...document.querySelectorAll('[data-testid="raptor-note"]')].filter(e => e.getBoundingClientRect().width > 0)
      const e = ns[ns.length - 1]; if (!e) return null
      e.setAttribute('data-gwf2', 'note'); const row = e.closest('.bidsheet-row'); row && row.setAttribute('data-gwf2', 'row')
      const sheet = e.closest('.bidsheet, [role="dialog"], [data-testid^="win-"]') || e.parentElement.parentElement.parentElement
      sheet.setAttribute('data-gwf2', 'sheet'); e.scrollIntoView({ block: 'center' })
      return e.textContent.trim()
    })
    K.fact('F2', sz.name, `${who}'s card: "Where it came from" (today)`, where)
    if (!where) return false
    await sleep(p, 300); await K.neutral(p); await K.hideNote(p)
    await K.markEl(p, '[data-gwf2="note"]', '1')
    const sels = ['[data-gwf2="sheet"]', '[data-gwf2="row"]']
    await K.shot(p, sz, `f2-${tag}-today`, sels, 8)
    await p.evaluate(w => { document.querySelector('[data-gwf2="note"]').textContent = w }, W.f2)
    await K.shot(p, sz, `f2-${tag}-proposed`, sels, 8)
    await K.unmark(p)
    return true
  }
  await card('prowler', 'admin')
  /* the member's own read-only sheet: Ranger, on the same flight, taps his own box */
  await K.switchUser(p, 'us', 'us')
  await card('bane', 'member')
  await b.close()
  return saved
}

const SCENES = { f6, f4, f5, f3, f1, f2 }
const only = (process.env.GW_ONLY || 'f6,f4,f5,f3,f1,f2').split(',')
const sizes = (process.env.GW_SIZES || 'd,p').split(',')
for (const name of only) {
  K.log('=== ' + name)
  try {
    if (name === 'f6' || name === 'f4' || name === 'f5') { for (const s of sizes) await SCENES[name](s) }
    else if (name === 'f2') {
      const g = `${K.STATE}/g-staged.json`
      let st = null
      if (sizes.includes('d')) st = await f2('d', g)
      if (sizes.includes('p')) await f2('p', st || `${K.STATE}/f2-staged.json`)
    } else {
      let st = null
      if (sizes.includes('d')) st = await SCENES[name]('d', null)
      if (sizes.includes('p')) await SCENES[name]('p', st || `${K.STATE}/${name}-staged.json`)
    }
  } catch (e) { K.fact(name, '-', 'STOPPED', String(e && e.message || e).slice(0, 400)) }
  K.saveFacts('f-' + only.join('-'))
}
K.log('done')
