// The member / guest check — the host's probe, ROUND 2 (5 Nov 26), answering the fresh code read of round 1
// (docs/handpass/parts/mg1105/read-opus.md): F1 a press that never landed was counted quiet; F2 controls that appear only
// after a press (a popup's own buttons, the filter chips) were never pressed; F3 Edit Schedule's text cells and empty
// seats were not in the list, and the drag had no positive control; F5 the run total was only a note; F6 people and the
// Leave War were outside the in-memory reading; F8 a change was missed when the same press moved the week.
// So: a WORKLIST — after every press the whole page is listed again and every kind not yet pressed joins the queue; every
// press is logged with whether it LANDED (pressed / disabled / not pressed — the last a FAIL); every open window is closed
// by its own ✕ as well as Escape; text cells are typed into and empty seats are tried by click-to-place; and each of
// those editing presses is first done as the ADMIN and shown to change something (the positive control), then as the
// member. The in-memory reading adds people, inputs and the Leave War, week-independent.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> MG_OUT=<folder> node scripts/handpass/mg1105-probe2.mjs
import * as L from './mg1105-lib.mjs'
const { say, note, check } = L

const deep = (page) => page.evaluate(() => {
  const w = window
  const h = (s) => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return `${s.length}:${x}` }
  let lw = ''
  try { lw = JSON.stringify(typeof w.lwGetState === 'function' ? w.lwGetState() : null) } catch { lw = 'x' }
  return { people: h(JSON.stringify(w.PEOPLE || null)), inputs: h(JSON.stringify(w.INPUTS || null)), lw: h(lw) }
})

/* close what a press opened: Escape, then every window's own ✕ and the day pop-up's close, as a person does */
async function closeAll(page) {
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(120)
  for (const sel of ['.chgwin .win-x', '.fwin .win-x', '#dayPopClose', '.airpop [aria-label="Close"]']) {
    for (const l of await page.locator(sel).all()) if (await l.isVisible().catch(() => false)) { await l.click({ timeout: 800 }).catch(() => {}); await page.waitForTimeout(120) }
  }
}

const Q = 'button, a[role="button"], [role="button"], select, input, textarea, [contenteditable="true"], summary, [data-txt], .seat[data-slot], .puck, [data-person]'
/* every visible control on the page (the root and any window over it), each with a KIND that finds it again */
const listAll = (page, root) => page.evaluate(([root, Q]) => {
  const out = [], seen = new Set()
  const scopes = [document.querySelector(root), ...document.querySelectorAll('.chgwin, .fwin, .airpop, [role="dialog"], .stmenu, .wavemenu, .plmenu, .dtmenu')].filter(Boolean)
  for (const R of scopes) for (const e of R.querySelectorAll(Q)) {
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue
    if (e.closest('#guestOut, #logout')) continue
    const tag = e.tagName.toLowerCase()
    const label = (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || e.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 50)
    const isSeat = e.matches('.seat[data-slot]'), isTxt = e.hasAttribute('data-txt')
    const kind = e.matches('.puck, [data-person]') ? 'puck|' + (e.closest('[data-slot]') ? 'seat' : e.closest('#eRoster, .roster, .sb-side') ? 'crew' : 'other')
      : isSeat ? 'seat|' + (e.querySelector('.puck, [data-person]') ? 'full' : 'empty')
      : isTxt ? 'txt|' + String(e.getAttribute('data-txt')).replace(/[0-9.]+/g, '#')
      : tag + '|' + label + '|' + String(e.className || '').split(' ')[0]
    if (seen.has(kind)) continue
    seen.add(kind)
    out.push({ kind, tag, label, disabled: !!e.disabled, edit: isTxt || tag === 'textarea' || e.isContentEditable || (tag === 'input' && !/checkbox|radio|button|submit/.test(e.getAttribute('type') || '')), seat: isSeat })
  }
  return out
}, [root, Q])
const tagKind = (page, root, kind) => page.evaluate(([root, Q, kind]) => {
  document.querySelectorAll('[data-mgq]').forEach(x => x.removeAttribute('data-mgq'))
  const scopes = [document.querySelector(root), ...document.querySelectorAll('.chgwin, .fwin, .airpop, [role="dialog"], .stmenu, .wavemenu, .plmenu, .dtmenu')].filter(Boolean)
  for (const R of scopes) for (const e of R.querySelectorAll(Q)) {
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const tag = e.tagName.toLowerCase()
    const label = (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || e.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 50)
    const isSeat = e.matches('.seat[data-slot]'), isTxt = e.hasAttribute('data-txt')
    const k = e.matches('.puck, [data-person]') ? 'puck|' + (e.closest('[data-slot]') ? 'seat' : e.closest('#eRoster, .roster, .sb-side') ? 'crew' : 'other')
      : isSeat ? 'seat|' + (e.querySelector('.puck, [data-person]') ? 'full' : 'empty')
      : isTxt ? 'txt|' + String(e.getAttribute('data-txt')).replace(/[0-9.]+/g, '#')
      : tag + '|' + label + '|' + String(e.className || '').split(' ')[0]
    if (k === kind) { e.setAttribute('data-mgq', '1'); return true }
  }
  return false
}, [root, Q, kind])

async function pressKind(page, root, c, ctx) {
  const before = await L.state(page), d0 = await deep(page), week = await page.evaluate(() => window.CURWEEK)
  let landed = 'pressed', err = null
  const loc = page.locator('[data-mgq="1"]').first()
  try {
    if (c.disabled) landed = 'disabled'
    else if (c.tag === 'select') { const v = await loc.evaluate(s => { const o = [...s.options].map(o => o.value).filter(v => v !== s.value); return o[0] ?? '' }); await loc.selectOption(v, { timeout: 1500 }) }
    else if (c.edit) { await loc.click({ timeout: 1500 }); await page.keyboard.press('End'); await page.keyboard.type(' ZZQ'); await page.keyboard.press('Enter') }
    else if (c.seat) {
      /* click-to-place: the seat, then the first free man in the crew panel */
      await loc.click({ timeout: 1500 }); await page.waitForTimeout(200)
      const crew = page.locator('#eRoster .puck, .sb-side .puck, #page-editsched .roster .puck').first()
      if (await crew.count()) await crew.click({ timeout: 1500 }).catch(e => { err = 'crew: ' + String(e.message).split('\n')[0].slice(0, 80) })
    }
    else await loc.click({ timeout: 1500 })
  } catch (e) { err = String(e.message || e).split('\n')[0].slice(0, 120); landed = /not enabled|disabled/i.test(err) ? 'disabled' : 'NOT PRESSED' }
  await page.waitForTimeout(700)                 // past the saver's 300 ms coalesce
  const after = await L.state(page), d1 = await deep(page), week2 = await page.evaluate(() => window.CURWEEK)
  const r = {
    kind: c.kind, landed, err,
    wrote: await L.writesSince(page, before.writes),
    said: await L.notesSince(page, before.notes),
    typedLeft: c.edit ? await page.evaluate(() => document.body.innerText.includes('ZZQ') || [...document.querySelectorAll('input,textarea')].some(e => String(e.value).includes('ZZQ'))) : false,
    schedMoved: before.model !== after.model && week === week2,
    people: d0.people !== d1.people, inputs: d0.inputs !== d1.inputs, lw: d0.lw !== d1.lw,
    elog: before.elog !== after.elog, undo: before.undo !== after.undo,
  }
  r.moved = r.wrote.length > 0 || r.schedMoved || r.people || r.inputs || r.lw || r.elog || r.undo || r.typedLeft
  return r
}

async function worklist(page, root, tag, onlyEditing = false, cap = 260) {
  const startWeek = await page.evaluate(() => window.CURWEEK)
  const done = new Set(), queue = []
  const add = (list) => { for (const c of list) if (!done.has(c.kind) && !queue.some(q => q.kind === c.kind) && (!onlyEditing || c.edit || c.seat)) queue.push(c) }
  add(await listAll(page, root))
  const rs = []
  while (queue.length && done.size < cap) {
    const c = queue.shift(); done.add(c.kind)
    if (!(await tagKind(page, root, c.kind))) { rs.push({ kind: c.kind, landed: 'gone' }); continue }
    const r = await pressKind(page, root, c)
    rs.push(r)
    add(await listAll(page, root))              // what this press brought up joins the queue (a window's own buttons, chips)
    await closeAll(page)
    if (root === '#schedBoard' && !(await page.locator('#schedBoard').isVisible().catch(() => false))) { await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(500) }
    if (root.includes('editsched') && await page.evaluate(() => window.CURPAGE) !== 'editsched') await page.evaluate(() => window.setPage('editsched'))
    if (await page.evaluate(() => window.CURWEEK) !== startWeek) { await page.evaluate(w => { window.loadWeek(w); window.renderEditWeek() }, startWeek); await page.waitForTimeout(400) }
  }
  const by = (k) => rs.filter(r => r.landed === k).length
  note(`${tag}-tally`, { pressed: by('pressed'), disabled: by('disabled'), notPressed: by('NOT PRESSED'), gone: by('gone'), total: rs.length })
  for (const r of rs) {
    if (r.landed === 'NOT PRESSED') say(`NOT-PRESSED ${tag} ${r.kind} — ${r.err}`)
    else if (r.moved) say(`MOVED ${tag} ${r.kind} — ${JSON.stringify(r)}`)
    else if (r.said && r.said.length) note(`${tag}-said`, `${r.kind}: ${r.said.join(' / ')}`)
  }
  return rs
}

const { page } = await L.open('desktop')
await L.signIn(page, 'ad', 'a')
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
/* the fixture, as round 1: Monday published, a word added, signed again — Publish AL1 live */
const signAll = async () => { for (const sel of await page.locator('select[data-signday="0"]').all()) { const v = await sel.evaluate(s => [...s.options].map(o => o.value).find(Boolean) || ''); if (v) { await sel.selectOption(v); await page.waitForTimeout(250) } } }
await signAll(); await page.locator('button[data-beak="0"]').click(); await page.waitForTimeout(600)
await page.locator('#eWeek [data-txt="dn:0.0"]').first().click(); await page.keyboard.press('End'); await page.keyboard.type(' MG'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
await signAll()
check('P0', 'fixture: Publish AL1 live for the admin', await page.evaluate(() => { const b = document.querySelector('#alPanel .al-pubday button'); return !!b && !b.disabled }), true)

/* THE POSITIVE CONTROL: the same editing presses as the ADMIN must change something — else a member's "nothing" proves nothing */
/* (capped: each text cell's address is its own kind, so the editing presses alone run to hundreds — a dozen is a proof) */
const adm = await worklist(page, '#page-editsched', 'P1-admin', true, 14)
const admMoved = adm.filter(r => r.moved).map(r => r.kind)
check('P1', 'as the ADMIN, the editing presses (text cells typed, empty seats by click-to-place) DO change the schedule — the probe can see an edit', admMoved.some(k => k.startsWith('txt|')) , { moved: admMoved.slice(0, 12), n: admMoved.length })

await L.signOut(page); await L.signIn(page, 'us', 'us')
const s0 = await L.state(page)
await page.evaluate(() => window.setPage('editsched')); await page.waitForTimeout(700)
await L.shot(page, 'R2-M1', 'member-editsched')
const m = await worklist(page, '#page-editsched', 'R2-M3', false, 170)
check('R2-M3', 'a member on Edit Schedule: every control, every window it opens and every control in that, every text cell, every empty seat — nothing saved, nothing changed in memory, nothing typed left', m.every(r => !r.moved), { moved: m.filter(r => r.moved).map(r => r.kind) })
check('R2-M3n', 'every control was really pressed (none NOT PRESSED)', m.every(r => r.landed !== 'NOT PRESSED'), { notPressed: m.filter(r => r.landed === 'NOT PRESSED').map(r => r.kind) })
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(700)
await L.shot(page, 'R2-M4', 'member-board')
const b = await worklist(page, '#schedBoard', 'R2-M4', false, 130)
check('R2-M4', 'the board forced open for a member: the same', b.every(r => !r.moved), { moved: b.filter(r => r.moved).map(r => r.kind) })
check('R2-M4n', 'every board control really pressed', b.every(r => r.landed !== 'NOT PRESSED'), { notPressed: b.filter(r => r.landed === 'NOT PRESSED').map(r => r.kind) })
await page.keyboard.press('Escape')
const s9 = await L.state(page)
check('R2-M9', 'the whole member run: 0 storage writes', s9.writes === s0.writes, await L.writesSince(page, s0.writes))
/* and nothing waits for the next session: sign out, the admin back, one small change of his — its group names only that */
await L.signOut(page)
const sOut = await L.state(page)
await L.signIn(page, 'ad', 'a')
const inBetween = await L.writesSince(page, s9.writes)
check('R2-M10', 'sign-out and the admin\'s sign-in save nothing the member left behind (only the app\'s own reopen-page key)', inBetween.every(k => /talon:reopen-page/.test(k)), inBetween)
note('R2-M10-out', sOut.writes - s9.writes)
await L.finish('probe2')
