// THE LOOK FOR OTHER COUNTS, DRAWN ON THE REAL APP (his D2603 — a look, nothing changed; chat 170's night of 25 Nov 26,
// job 2). Each place the app gives a count where it could name the things is made by the app's own controls on a frozen
// build of main and pictured at his iPhone's size (402x874, sharp at 2x), the words asked about ringed amber. Where
// naming the things would make the words longer, the fuller words are put into the app's own element on the screen (round
// 4's way: the letters and the wrapping are the app's; only the text changed), ringed green, and their rows counted.
// Built over the round-4 walk's lib (wr4-lib.mjs): the build is served inside the test browser, no server, no port.
//   node scripts/handpass/cnt-draw.mjs <S|P|L>      (env WR4_NEW = the build folder, WR4_OUT = the run's folder)
//   world S: an input of several people — the note when it is filed, Undo's words, the window's title, its delete question
//   world P: the publish notes — inputs with no OIL answer; an amendment published while another day still holds changes
//   world L: the Leave War — the OIL tracker's credit heading, the Grades window's delete question
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
console.log('cnt-draw v1')
const WORLD = (process.argv[2] || 'S').toUpperCase()
if (!process.env.WR4_OUT || !process.env.WR4_NEW) throw new Error('set WR4_OUT and WR4_NEW')
const L = await import('./wr4-lib.mjs')
L.SIZES.phone.deviceScaleFactor = 2                     // his iPhone's size, sharp (the brief: device scale 2)
L.SIZE_SAYS.phone = 'phone 402x874 @2x'
const { newPage, signIn, openDay, press, sleep, go, log, catchToast, releaseToast, answerAsks, ids, facts, OUT } = L
const out = { world: WORLD, cases: {}, notes: [] }
const T = id => `[data-testid="${id}"]`
const AMBER = '#ffc83d'

/* ---------- reading and picturing one element ---------- */
/* tag the first element matching `sel` (or, with `text`, the smallest one inside it whose words match) as data-cnt=<tag> */
const tag = (page, sel, t, text) => page.evaluate(([sel, t, src]) => {
  document.querySelectorAll(`[data-cnt="${t}"]`).forEach(e => e.removeAttribute('data-cnt'))
  const root = document.querySelector(sel); if (!root) return null
  let e = root
  if (src) {
    const re = new RegExp(src)
    const all = [root, ...root.querySelectorAll('*')].filter(x => { const b = x.getBoundingClientRect(); return re.test((x.textContent || '').replace(/\s+/g, ' ')) && b.width > 0 && b.height > 0 })
    if (!all.length) return null
    e = all.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0]
  }
  e.setAttribute('data-cnt', t)
  return (e.textContent || '').replace(/\s+/g, ' ').trim()
}, [sel, t, text ? text.source : null])
/* its rows: the distinct line boxes its words stand on */
const rowsOf = (page, t) => page.evaluate(t => {
  const e = document.querySelector(`[data-cnt="${t}"]`); if (!e) return null
  const r = document.createRange(); r.selectNodeContents(e)
  const tops = [...r.getClientRects()].filter(x => x.width > 0.5 && x.height > 0.5).map(x => x.top + x.height / 2)
  const lines = []
  for (const y of tops.sort((a, b) => a - b)) if (!lines.length || y - lines[lines.length - 1] > 6) lines.push(y)
  return lines.length
}, t)
const ring = (page, t, col) => page.evaluate(([t, col]) => { const e = document.querySelector(`[data-cnt="${t}"]`); if (e) { e.style.outline = `2px solid ${col}`; e.style.outlineOffset = '2px'; e.style.borderRadius = '3px' } }, [t, col])
const unring = (page, t) => page.evaluate(t => { const e = document.querySelector(`[data-cnt="${t}"]`); if (e) e.style.outline = '' }, t)
/* put fuller words into the tagged element, ringed green (round 4's swap); returns what it now says */
const swapTo = (page, t, words) => page.evaluate(([t, words]) => {
  const e = document.querySelector(`[data-cnt="${t}"]`); if (!e) return null
  e.textContent = words; e.style.outline = '2px solid #34c759'; e.style.outlineOffset = '2px'; e.style.borderRadius = '3px'
  return (e.textContent || '').replace(/\s+/g, ' ').trim()
}, [t, words])
/* a picture of the tagged element with `pad` around it (and any other selectors), kept on the screen */
async function pic(w, c, name, sels, pad = 18, extra = {}, opts = {}) {
  const clip = await L.boxOf(w.page, sels, pad, opts)
  await L.shot(w.page, c, name, clip, extra.text || '', w.size, extra)
  return name + '.png'
}
/* is the tagged element's text cut off (itself or a box round it narrower than its words)? */
const cutOf = (page, t) => page.evaluate(t => {
  let e = document.querySelector(`[data-cnt="${t}"]`)
  for (let i = 0; e && i < 4; i++, e = e.parentElement) { const cs = getComputedStyle(e); if (e.scrollWidth > e.clientWidth + 1 && (cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis')) return { cut: true, tag: e.tagName, cls: String(e.className), textOverflow: cs.textOverflow, whiteSpace: cs.whiteSpace } }
  return { cut: false }
}, t)
function rec(c, k, v) { (out.cases[c] ||= {})[k] = v; log(c, `${k}: ${JSON.stringify(v)}`) }

/* a passing note, caught and held: its words, a picture ringed amber, and (optional) the fuller words swapped in */
async function notePics(w, c, re, fuller, timeout = 7000) {
  const said = await catchToast(w.page, re, timeout)
  if (!said) { const now = await L.shownToast(w.page); rec(c, 'missing', `no note matching ${re}; showing: ${JSON.stringify(now)}`); return null }
  await w.page.mouse.move(2, 2).catch(() => {})
  await tag(w.page, '#toastEl', c)
  await ring(w.page, c, AMBER)
  rec(c, 'today', { text: said, rows: await rowsOf(w.page, c), picture: await pic(w, c, `${c}-today`, [`[data-cnt="${c}"]`], 24, { text: said }) })
  if (fuller) {
    const words = typeof fuller === 'function' ? fuller(said) : fuller
    const now = await swapTo(w.page, c, words)
    rec(c, 'named', { text: now, rows: await rowsOf(w.page, c), picture: await pic(w, c, `${c}-named`, [`[data-cnt="${c}"]`], 24, { text: now }) })
  }
  await releaseToast(w.page)
  return said
}

/* ---------- filing through the Inputs calendar, as the round-4 lib does, but the note is caught at the Save ---------- */
async function fileSeveral(w, c, iso, spec, noteRe) {
  await openDay(w, iso)
  const before = await ids(w.page)
  await press(w, '#icPopAdd')
  await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', spec.type)
  await press(w, '#inpEditPop [data-testid="pp-several"]')
  for (const id of spec.people) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
  const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (!spec.people.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
  const ad = w.page.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await w.page.fill('#inpEditPop #inpEditStart', spec.from); await w.page.fill('#inpEditPop #inpEditEnd', spec.to)
  if (spec.remarks) await w.page.fill('#inpEditPop #inpEditRmk', spec.remarks)
  await w.page.locator('#inpEditSave').first().tap()
  const asked = await answerAsks(w)
  if (noteRe) await notePics(w, c, noteRe.re, noteRe.fuller)
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  await sleep(500)
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  log(c, `filed ${JSON.stringify(spec)} on ${iso}: ${JSON.stringify(made)}; asked ${JSON.stringify(asked)}`)
  return made.length === 1 ? made[0] : null
}
async function openInput(w, iid, iso) {
  await openDay(w, iso)
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  await press(w, card)
  await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 }); await sleep(500)
}
const csOf = (page, idsList) => page.evaluate(l => l.map(i => (window.PEOPLE[i] && window.PEOPLE[i].cs) || i), idsList)
const az = names => [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
const joinAnd = n => (n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`)

/* ---------- world S: an input of several people ---------- */
async function worldS() {
  let w = await newPage('phone'); await signIn(w, 'ad')
  out.bundle = await L.bundleOf(w.page); log('setup', `world S — bundle ${out.bundle}`)
  const THREE = ['bane', 'rocky', 'dj']
  const three = await csOf(w.page, THREE)
  /* s-added: the note when an input of three is filed — "Input added for 3 people" */
  const iid = await fileSeveral(w, 's-added', '2026-07-15', { type: 'Training', people: THREE, from: '09:00', to: '10:00', remarks: 'Bring your kit' },
    { re: /Input added/, fuller: said => said.replace(/for 3 people/, `for ${joinAnd(az(three))}`) })
  if (!iid) throw new Error('the input of three was not filed')
  /* s-undo: Undo's words for it — "Undid: Training for 3 people" (and Redo's) */
  await press(w, '#undoBtn')
  await notePics(w, 's-undo', /Undid/, said => said.replace(/Training for 3 people/, `${joinAnd(az(three))}’s Training`))
  await press(w, '#redoBtn'); await sleep(600)
  rec('s-undo', 'redo', await L.shownToast(w.page))
  /* s-title: the window's title — "Ace +2 · 15 Jul" — and the count of picked people under it (a B: the pucks show them) */
  await openInput(w, iid, '2026-07-15')
  const tt = await tag(w.page, '[data-testid="win-inputedit"]', 's-title', /\+\d+ · /)
  await tag(w.page, '[data-testid="win-inputedit"]', 's-picked', /^\s*\d+ picked\s*$/)
  await ring(w.page, 's-title', AMBER)
  rec('s-title', 'today', { text: tt, rows: await rowsOf(w.page, 's-title'), cut: await cutOf(w.page, 's-title'), picture: await pic(w, 's-title', 's-title-today', ['[data-cnt="s-title"]', '[data-cnt="s-picked"]'], 16, { text: tt }, { fullWidth: true }) })
  const named = `${az(three).join(', ')} · 15 Jul`
  const now = await swapTo(w.page, 's-title', named)
  rec('s-title', 'named', { text: now, rows: await rowsOf(w.page, 's-title'), cut: await cutOf(w.page, 's-title'), picture: await pic(w, 's-title', 's-title-named', ['[data-cnt="s-title"]'], 16, { text: now }, { fullWidth: true }) })
  /* s-delete: the delete question — "Delete this input for all 3 people?" — and where the people are when it asks */
  await press(w, '#inpEditDel'); await sleep(400)
  const ask = await tag(w.page, T('inped-delall'), 's-delete', /Delete this input/)
  await ring(w.page, 's-delete', AMBER)
  rec('s-delete', 'today', { text: ask, rows: await rowsOf(w.page, 's-delete'), picture: await pic(w, 's-delete', 's-delete-today', [T('inped-delall'), '#inpEditDel'], 16, { text: ask }) })
  const peopleInView = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].some(b => { const r = b.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.height > 0 }))
  rec('s-delete', 'peopleInView', peopleInView)
  await swapTo(w.page, 's-delete', `Delete this input for ${joinAnd(az(three))}?`)
  rec('s-delete', 'named', { text: await tag(w.page, T('inped-delall'), 's-delete', /Delete this input/), rows: await rowsOf(w.page, 's-delete'), picture: await pic(w, 's-delete', 's-delete-named', [T('inped-delall'), '#inpEditDel'], 16) })
  await press(w, T('inped-delall-no')); await sleep(300)
  await press(w, '#inpEditCancel').catch(() => {}); await w.page.keyboard.press('Escape').catch(() => {}); await sleep(400)
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')

  /* the worst case of the title: an input of ten — the longest callsigns the window offers — its title with every name */
  const offer = await w.page.evaluate(() => Object.entries(window.PEOPLE).filter(([, p]) => p && p.cs && !p.arch && !p.ph).map(([id, p]) => ({ id, cs: String(p.cs) })))
  await openDay(w, '2026-07-16'); await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await press(w, '#inpEditPop [data-testid="pp-several"]')
  const can = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].map(b => b.getAttribute('data-pp')))
  await press(w, '#inpEditCancel').catch(() => {}); await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300)
  const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {})
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  const TEN = offer.filter(o => can.includes(o.id) && !/^(all|allavail)$/i.test(o.id) && !['stiff'].includes(o.id)).sort((a, b) => b.cs.length - a.cs.length || a.cs.localeCompare(b.cs)).slice(0, 10).map(o => o.id)
  const ten = await csOf(w.page, TEN)
  const iid10 = await fileSeveral(w, 's-added10', '2026-07-16', { type: 'Training', people: TEN, from: '09:00', to: '10:00' },
    { re: /Input added/, fuller: said => said.replace(/for 10 people/, `for ${joinAnd(az(ten))}`) })
  if (iid10) {
    await openInput(w, iid10, '2026-07-16')
    const t10 = await tag(w.page, '[data-testid="win-inputedit"]', 's-title10', /\+\d+ · /)
    await ring(w.page, 's-title10', AMBER)
    rec('s-title10', 'today', { text: t10, rows: await rowsOf(w.page, 's-title10'), cut: await cutOf(w.page, 's-title10'), picture: await pic(w, 's-title10', 's-title10-today', ['[data-cnt="s-title10"]'], 16, { text: t10 }, { fullWidth: true }) })
    const n10 = await swapTo(w.page, 's-title10', `${az(ten).join(', ')} · 16 Jul`)
    rec('s-title10', 'named', { text: n10, rows: await rowsOf(w.page, 's-title10'), cut: await cutOf(w.page, 's-title10'), picture: await pic(w, 's-title10', 's-title10-named', ['[data-cnt="s-title10"]'], 16, { text: n10 }, { fullWidth: true }) })
    /* how far the window's own content is pushed down: the "picked" line's top before and after */
    rec('s-title10', 'people', ten)
    await press(w, '#inpEditDel'); await sleep(400)
    const a10 = await tag(w.page, T('inped-delall'), 's-delete10', /Delete this input/)
    await swapTo(w.page, 's-delete10', `Delete this input for ${joinAnd(az(ten))}?`)
    rec('s-delete10', 'named', { was: a10, text: await tag(w.page, T('inped-delall'), 's-delete10', /Delete this input/), rows: await rowsOf(w.page, 's-delete10'), picture: await pic(w, 's-delete10', 's-delete10-named', [T('inped-delall'), '#inpEditDel'], 16) })
    await press(w, T('inped-delall-no')).catch(() => {}); await sleep(300)
    /* s-deleted: the note when it is deleted for everyone — "Input deleted for 10 people" (said whether or not the input
       was in view; "Input added for …" is said only where the new input is not in view, so it is silent here) */
    await press(w, '#inpEditDel'); await sleep(400)
    await w.page.locator(T('inped-delall-yes')).first().tap()
    await notePics(w, 's-deleted', /Input deleted/, said => said.replace(/for 10 people/, `for ${joinAnd(az(ten))}`))
  }
  await w.ctx.close()
}

/* ---------- world P: the publish notes ---------- */
const B = sel => `#schedBoard ${sel}:visible`
async function toWeek(w, mon) {
  const p = w.page
  if (await p.evaluate(() => window.DAYS[0].dt) === mon) return
  const dd = mon.split(' ')[1].padStart(2, '0')
  const wk = p.locator(`[data-wk="${dd}/07/2026"]:visible`).first()
  if (await wk.count()) await press(w, wk)
  else { await press(w, '.filt-cal:visible'); await press(w, `[data-testid="wcal-day-2026-07-${dd}"]:visible`) }
  await sleep(900)
  log('week', `now ${await p.evaluate(() => window.DAYS[0].dt)} (wanted ${mon})`)
}
async function openBoard(w, di) {
  const p = w.page
  await go(p, 'editsched'); await toWeek(w, 'Jul 13')
  const open = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && !b.hidden && !!b.getClientRects().length })
  if (open) { await p.evaluate(() => document.querySelector('#sbDone')?.click()); await sleep(450) }
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await d.tap(); await p.waitForSelector('#schedBoard'); await sleep(800)
}
async function closeBoard(w) {
  const p = w.page
  const open = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && !b.hidden && !!b.getClientRects().length })
  if (open) { await p.evaluate(() => document.querySelector('#sbDone')?.click()); await sleep(450) }
}
async function signAll(w) {
  const p = w.page, roles = ['cur', 'sked', 'plan', 'appr'], nth = [0, 0, 1, 2]
  for (let i = 0; i < 4; i++) {
    const sel = p.locator(`#schedBoard .sb-sign select[data-sign="${roles[i]}"]:visible`).first()
    if (!(await sel.count())) { log('sign', `no ${roles[i]} box`); continue }
    await sel.scrollIntoViewIfNeeded().catch(() => {})
    const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth[i])
    await sel.selectOption(v); await sleep(400)
    const later = p.locator('[data-testid="win-oilday"] [data-testid="odl-later"]')
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(300) }
  }
}
async function publishBtn(w, di) {
  for (const s of [`[data-alpub="${di}"]`, `[data-beak="${di}"]`]) { const x = w.page.locator(B(s)).first(); if (await x.count()) { const label = (await x.innerText()).trim(); await x.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); return label } }
  return null
}
async function cancelRow(w, di, iid) {
  const p = w.page
  const sel = await p.evaluate(([di, id]) => { const ri = window.DAYS[di].ground.findIndex(g => String(g.src) === id); return ri < 0 ? null : `#schedBoard [data-grcx="${di}.${ri}"]` }, [di, iid])
  if (!sel) { log('cx', `no row for ${iid} on day ${di}`); return false }
  await p.locator(sel).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await sleep(400)
  await p.fill('#cxReason', 'WX'); await p.locator('#cxSave').evaluate(e => e.click()); await sleep(600)
  return true
}
async function worldP() {
  let w = await newPage('phone'); await signIn(w, 'ad')
  out.bundle = await L.bundleOf(w.page); log('setup', `world P — bundle ${out.bundle}`)
  /* THE FIXTURES, AS CHAT 140'S WALK OF THE PUBLISH NOTE MADE THEM (sfd-w2.mjs s6): the bridge's own filing command, the
     window's record without its OIL answer (the window itself always asks it) — four Trainings of one person each on Sat
     18 Jul, and one Training of three on Sun 19 Jul */
  const TR = (date, people, iid) => ({ type: 'Training', allday: false, s: 480, e: 1020, date, yr: 2026, remarks: '', acc: 'g', people: people.map(p => ({ p })), iid })
  const FOUR = ['bane', 'rocky', 'dj', 'nick']
  await w.page.evaluate(rows => { for (const r of rows) window.fileInput(r); window.afterSchedMutate() },
    [...FOUR.map((p, i) => TR('Jul 18', [p], `cnt-sat-${i}`)), TR('Jul 19', ['bane', 'rocky', 'dj'], 'cnt-sun-3')])
  const four = await csOf(w.page, FOUR), three = await csOf(w.page, ['bane', 'rocky', 'dj'])
  out.notes.push(`planted: Sat 18 Jul ${four.join(', ')} (one Training each), Sun 19 Jul ${three.join(', ')} (one Training of three); no OIL answer`)
  /* p-four: Saturday published — "4 inputs have no OIL answer, so nobody on them earns OIL." */
  await openBoard(w, 5); await signAll(w)
  rec('p-four', 'button', await publishBtn(w, 5))
  await notePics(w, 'p-four', /no OIL answer/, said => said.replace(/4 inputs have/, `${joinAnd(four.map(c => `${c}’s Training`))} have`))
  /* p-three: Sunday published — "Training for 3 people has no OIL answer, so nobody on it earns OIL." */
  await openBoard(w, 6); await signAll(w)
  rec('p-three', 'button', await publishBtn(w, 6))
  await notePics(w, 'p-three', /no OIL answer/, said => said.replace(/Training for 3 people has/, `${joinAnd(az(three))}’s Training has`))
  /* p-held: a change on each published day, then Saturday's amendment published while Sunday still holds its change —
     "Published AL1 · 1 item on Sat only · 1 day with changes still held" */
  await openBoard(w, 6); const okSun = await cancelRow(w, 6, 'cnt-sun-3')
  await openBoard(w, 5); const okSat = await cancelRow(w, 5, 'cnt-sat-0')
  rec('p-held', 'changes', { sat: okSat, sun: okSun })
  /* the B picture: the day's own count of changes waiting, on the board's day head ("1 pending") */
  try {
    await w.page.evaluate(() => document.querySelector('#schedBoard')?.scrollTo?.(0, 0))
    const pend = await tag(w.page, '#schedBoard', 'b-pending', /^\s*\d+\s*pending\s*$/)
    if (pend) {
      await w.page.evaluate(() => document.querySelector('[data-cnt="b-pending"]')?.scrollIntoView({ block: 'center' })); await sleep(300)
      await ring(w.page, 'b-pending', AMBER); rec('b-pending', 'today', { text: pend, picture: await pic(w, 'b-pending', 'b-pending', ['[data-cnt="b-pending"]'], 40, { text: pend }, { fullWidth: true }) }); await unring(w.page, 'b-pending')
    } else rec('b-pending', 'missing', 'no "N pending" on the board')
  } catch (e) { rec('b-pending', 'error', String(e && e.message || e).split('\n')[0]) }
  await signAll(w)
  rec('p-held', 'button', await publishBtn(w, 5))
  await notePics(w, 'p-held', /Published AL/, said => said.replace(/1 day with changes still held/, 'Sun with changes still held'))
  await closeBoard(w)
  await w.ctx.close()
}

/* ---------- world L: the Leave War ---------- */
async function worldL() {
  let w = await newPage('phone'); await signIn(w, 'ad')
  out.bundle = await L.bundleOf(w.page); log('setup', `world L — bundle ${out.bundle}`)
  const p = w.page
  await go(p, 'leavewar'); await sleep(1200)
  /* l-oil: the OIL tracker — four names picked; the credit heading "OIL credits · Ace, Anvil +2" */
  try {
    await press(w, T('oil-tracker')); await sleep(900)
    const rows = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-name-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.getAttribute('data-testid').slice(9)))
    const pick = rows.slice(0, 4)
    for (const id of pick) { await press(w, T(`oil-name-${id}`)); await sleep(250) }
    const head = await tag(p, 'body', 'l-oil', /OIL credits · /)
    if (head) {
      await p.evaluate(() => document.querySelector('[data-cnt="l-oil"]')?.scrollIntoView({ block: 'center' })); await sleep(300)
      await ring(p, 'l-oil', AMBER)
      const names = await p.evaluate(ids => ids.map(id => (document.querySelector(`[data-testid="oil-name-${id}"] .who`)?.textContent || id).trim()), pick)
      rec('l-oil', 'today', { text: head, picked: names, rows: await rowsOf(p, 'l-oil'), cut: await cutOf(p, 'l-oil'), picture: await pic(w, 'l-oil', 'l-oil-today', ['[data-cnt="l-oil"]'], 30, { text: head }, { fullWidth: true }) })
      const n = await swapTo(p, 'l-oil', `OIL credits · ${names.join(', ')}`)
      rec('l-oil', 'named', { text: n, rows: await rowsOf(p, 'l-oil'), cut: await cutOf(p, 'l-oil'), picture: await pic(w, 'l-oil', 'l-oil-named', ['[data-cnt="l-oil"]'], 30, { text: n }, { fullWidth: true }) })
      /* the names picked, lit in the list above the heading (the context picture) */
      await swapTo(p, 'l-oil', head); await ring(p, 'l-oil', AMBER)
      rec('l-oil', 'context', { picture: await pic(w, 'l-oil', 'l-oil-context', ['[data-cnt="l-oil"]', ...pick.map(id => T(`oil-name-${id}`))], 10, {}, { fullWidth: true }) })
      /* the picked names, as the page shows them, with the heading (the context picture) */
      await unring(p, 'l-oil')
    } else rec('l-oil', 'missing', 'no "OIL credits ·" heading after picking ' + JSON.stringify(pick))
  } catch (e) { rec('l-oil', 'error', String(e && e.message || e).split('\n')[0]) }
  /* l-grade: Balances → Grades… → delete a grade people hold: "8 people hold Junior pilot: they become No grade" */
  try {
    await go(p, 'leavewar'); await sleep(600)
    await press(w, T('lw-tab-balances')); await p.waitForSelector(T('balances-page'), { state: 'visible', timeout: 8000 }); await sleep(700)
    /* who holds the grade, read from the Balances page's own rows before the window opens */
    await press(w, T('bal-grades')); await sleep(700)
    const gid = await p.evaluate(() => { const r = [...document.querySelectorAll('[data-testid^="grade-holds-"]')].map(e => ({ id: e.getAttribute('data-testid').slice(12), n: parseInt(e.textContent, 10) || 0 })).filter(x => x.n > 1).sort((a, b) => a.n - b.n); return r.length ? r[0].id : null })
    if (!gid) throw new Error('no grade held by two or more')
    const gname = await p.evaluate(id => (document.querySelector(`[data-testid="grade-name-${id}"]`)?.value || document.querySelector(`[data-testid="grade-name-${id}"]`)?.textContent || '').trim(), gid)
    /* who holds it, read from the Balances page's own rows (the grade box of each row), the window shut for the read */
    await press(w, T('grades-close')).catch(() => {}); await sleep(400)
    const holders = await p.evaluate(g => [...document.querySelectorAll('[data-testid="balances-page"] tr, [data-testid="balances-page"] [data-testid^="bal-row-"]')]
      .filter(r => (r.textContent || '').includes(g)).map(r => (r.querySelector('.who, [class*="cs"], [class*="name"]')?.textContent || '').trim()).filter(Boolean), gname)
    rec('l-grade', 'holders', holders)
    await press(w, T('bal-grades')); await sleep(700)
    await press(w, T(`grade-del-${gid}`)); await sleep(500)
    const ask = await tag(p, T('grade-ask'), 'l-grade', /hold/)
    await ring(p, 'l-grade', AMBER)
    rec('l-grade', 'today', { text: ask, grade: gname, rows: await rowsOf(p, 'l-grade'), picture: await pic(w, 'l-grade', 'l-grade-today', [T('grade-ask')], 16, { text: ask }, { fullWidth: true }) })
    if (holders.length > 1 && /^\d+ people hold/.test(ask)) {
      const n = await swapTo(p, 'l-grade', ask.replace(/^\d+ people hold/, `${joinAnd(az(holders))} hold`))
      rec('l-grade', 'named', { text: n, rows: await rowsOf(p, 'l-grade'), picture: await pic(w, 'l-grade', 'l-grade-named', [T('grade-ask')], 16, { text: n }, { fullWidth: true }) })
    }
    /* the B picture beside it: the Grades window's own "N people" beside each grade */
    await tag(p, `[data-testid="grade-holds-${gid}"]`, 'b-holds')
    await press(w, T('grade-del-keep')).catch(() => {}); await sleep(300)
    await tag(p, `[data-testid="grade-holds-${gid}"]`, 'b-holds')
    await ring(p, 'b-holds', AMBER)
    rec('b-holds', 'today', { text: await p.evaluate(() => document.querySelector('[data-cnt="b-holds"]')?.textContent), picture: await pic(w, 'b-holds', 'b-holds', [`[data-testid="grade-row-${gid}"]`], 12, {}, { fullWidth: true }) })
  } catch (e) { rec('l-grade', 'error', String(e && e.message || e).split('\n')[0]) }
  await w.ctx.close()
}

try {
  if (WORLD === 'S') await worldS()
  else if (WORLD === 'P') await worldP()
  else if (WORLD === 'L') await worldL()
} catch (e) { facts.errors.push(`${WORLD}: ` + String(e && e.stack || e).slice(0, 600)); log('run', 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
writeFileSync(join(OUT, 'cnt.json'), JSON.stringify(out, null, 1))
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
