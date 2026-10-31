// The night of 30–31 Oct 26, job 2 — fix 1, [SYSTEM-PASS-SAVES-ROSTER]: the posting pass saves only its own change to the
// roster. Scenarios RR-P1 to RR-P4 of docs/handpass/2026-10-31-lw-roster-restore.md §5, on a SAVED world (a reload shows what
// was saved), the browser's clock running from Wed 4 Nov 26 and moved to the next morning so a posting dated tomorrow comes
// due while the page is open — as it does for a man who leaves the app open overnight. Pressed through the app's own
// controls: the bid window's ⋯ → Post out (Overseas Sqn, Delete), the main tabs, Quals' Edit and a tick, Logout and sign-in,
// Admin → Users. The one step no control can make is RR-P1's stray change — a person changed in memory outside every
// command, which only a browser's console can do (the fault's premise, D608 allows it: the step that matters after it, the
// pass, runs from a press on screen). Written as the RIGHT behaviour (a PASS means correct) — on origin/main's build RR-P1
// is expected to FAIL (the fault), every other scenario to PASS on both.
// Run from raptor-port:  SIZE=desk|phone  LW_DIST=dist|<main's build>  LW_OUT=<folder under docs/img/handpass>  ONLY=rr-p1,…
//   node scripts/handpass/lw-rr-s2.mjs
process.env.LW_OUT ||= '2026-10-31-lw-roster-restore/s2'
const L = await import('./lw-rr-lib.mjs')
const SIZE = process.env.SIZE || 'desk'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-rr-s2 v2]', SIZE, ONLY.join(',') || 'all', 'today', L.TODAY)
L.clearOut()
const TOMORROW = L.day(1)
let w = null, P = null
async function world(who = 'admin') {
  if (w) await w.ctx.close()
  w = await L.newWorld(SIZE === 'phone' ? 'phone' : 'desk'); P = w.page
  await L.signInSaved(w, who); await L.toWar(w)
}
const person = id => P.evaluate(id => { const p = window.PEOPLE[id]; return p ? { archived: !!p.archived, archivedBy: p.archivedBy || null, deleted: !!p.deleted, mgmt: !!(p.quals && p.quals.mgmt), tf: !!(p.quals && p.quals.tf) } : null }, id)
const tagOf = id => P.evaluate(id => { const r = document.querySelector(`[data-testid="row-${id}"]`); return r ? r.innerText.replace(/\s+/g, ' ').trim().slice(0, 80) : null }, id)
/* the morning after: the clock moved on, then a press on screen (the Leave War's tab) — the app's next turn runs the pass */
async function nextMorning(pic) {
  await P.clock.setSystemTime(L.at9(1)); await P.waitForTimeout(300)
  await L.goPage(w, 'quals', 'Quals'); await L.toWar(w)
  if (pic) await L.shot(w, pic)
}

/* ---------- RR-P1 — the fault: a member's console changes another man; the posting pass runs; is it saved? ---------- */
if (want('rr-p1')) {
  await world('admin')
  const id = await L.pidOf(P, 'Drifter'), ace = 'dj'
  const po = await L.postOutFrom(w, id, TOMORROW, 'overseas', 'rr-p1-a-postout')
  const p0 = await person(id)
  await L.signOut(w); await L.signInSaved(w, 'member'); await L.toWar(w)
  const h0 = await person(ace)
  /* the stray change — Ace's Management tick, which a member may never make (D1510, D149) — straight into memory */
  await P.evaluate(() => { window.PEOPLE.dj.quals.mgmt = true })
  await nextMorning('rr-p1-b-next-morning')
  const p1 = await person(id), h1 = await person(ace)
  /* what was SAVED: a reload, the admin, Quals */
  await L.reloadAs(w, 'admin'); await L.toQuals(w)
  const h2 = await L.qTicked(w, ace, 'mgmt').catch(() => null)
  await L.qShot(w, 'rr-p1-c-quals-after-reload', ace, 'mgmt')
  await L.adminUsers(w)
  const row = await L.usersRow(w, id)
  await L.shot(w, 'rr-p1-d-users')
  L.rec('RR-P1 a change made outside every command is not saved by the posting pass', SIZE,
    po.line && !p0.archived && h0 && !h0.mgmt && p1.archived && p1.archivedBy === 'po' && h1 && !h1.mgmt && h2 === false ? 'PASS' : 'FAIL',
    `posting ${po.date}: "${po.line}"; before the date archived ${p0.archived}; Ace's Management saved ${h0?.mgmt}; planted in memory; the next morning: Drifter archived ${p1.archived} (${p1.archivedBy}); Ace's Management in memory ${h1?.mgmt}; after a reload, on Quals ${h2}; Admin → Users "${row}"`,
    ['rr-p1-a-postout', 'rr-p1-b-next-morning', 'rr-p1-c-quals-after-reload', 'rr-p1-d-users'])
}

/* ---------- RR-P2 — an ordinary change, made on Quals as the posting comes due, is saved and kept ---------- */
if (want('rr-p2')) {
  await world('admin')
  const id = await L.pidOf(P, 'Drifter'), ace = 'dj'
  await L.postOutFrom(w, id, TOMORROW, 'overseas')
  await L.toQuals(w)
  await L.press(w, '#qEdit'); await P.waitForTimeout(300)
  const tf0 = await L.qTicked(w, ace, 'tf')
  /* the date comes while Quals is open; the tick is the press that wakes the pass */
  await P.clock.setSystemTime(L.at9(1)); await P.waitForTimeout(300)
  await L.press(w, L.qcell(ace, 'tf')); await P.waitForTimeout(500)
  const tf1 = await L.qTicked(w, ace, 'tf')
  await L.qShot(w, 'rr-p2-a-ticked', ace, 'tf')
  await L.press(w, '#qSave'); await P.waitForTimeout(300)   // Done
  const p1 = await person(id)
  await L.reloadAs(w, 'admin'); await L.toQuals(w)
  const tf2 = await L.qTicked(w, ace, 'tf')
  await L.qShot(w, 'rr-p2-b-after-reload', ace, 'tf')
  const p2 = await person(id)
  L.rec('RR-P2 an admin’s Quals tick made as the posting comes due is saved; the posting runs', SIZE,
    tf1 === !tf0 && tf2 === !tf0 && p1.archived && p2.archived ? 'PASS' : 'FAIL',
    `Ace's TF ${tf0} → ticked ${tf1} → after a reload ${tf2}; Drifter archived ${p1.archived} → after a reload ${p2.archived}`, ['rr-p2-a-ticked', 'rr-p2-b-after-reload'])
}

/* ---------- RR-P3 — a posting dated today runs at once, inside the Post out (unchanged) ---------- */
if (want('rr-p3')) {
  await world('admin')
  const id = await L.pidOf(P, 'Drifter')
  const po = await L.postOutFrom(w, id, L.TODAY, 'overseas', 'rr-p3-a-postout')
  const p1 = await person(id)
  await L.reloadAs(w, 'admin')
  const p2 = await person(id)
  await L.adminUsers(w)
  const row = await L.usersRow(w, id)
  await L.shot(w, 'rr-p3-b-users')
  L.rec('RR-P3 a posting dated today runs at once and is saved', SIZE, p1.archived && p2.archived ? 'PASS' : 'FAIL',
    `posting ${po.date}: "${po.line}"; archived at once ${p1.archived}; after a reload ${p2.archived}; Admin → Users "${row}"`, ['rr-p3-a-postout', 'rr-p3-b-users'])
}

/* ---------- RR-P4 — a Delete posting dated tomorrow, run by the pass the next morning (unchanged) ---------- */
if (want('rr-p4')) {
  await world('admin')
  const id = await L.pidOf(P, 'Drifter')
  const po = await L.postOutFrom(w, id, TOMORROW, 'delete', 'rr-p4-a-postout')
  const tag0 = await tagOf(id)
  const p0 = await person(id)
  await nextMorning('rr-p4-b-next-morning')
  const p1 = await person(id)
  await L.reloadAs(w, 'admin')
  const p2 = await person(id)
  await L.adminUsers(w)
  const row = await L.usersRow(w, id)
  /* the place in the A–Z list where his row stood, brought into view: the row before it outlined (the walk of 31 Oct 26: a
     picture of the list's top did not show where he would be) */
  const near = await P.evaluate(() => {
    const rows = [...document.querySelectorAll('#accList [data-person]')].filter(e => e.getBoundingClientRect().height > 0)
    const cs = e => (e.querySelector('.acc-main')?.textContent || e.textContent || '').trim()
    const before = rows.filter(e => cs(e).localeCompare('Drifter', undefined, { sensitivity: 'base' }) < 0).pop()
    if (!before) return null
    before.scrollIntoView({ block: 'center' }); before.style.outline = '2px dashed #ff4fd8'; before.style.outlineOffset = '-3px'
    const next = before.nextElementSibling
    return { before: cs(before).slice(0, 30), next: next ? cs(next).slice(0, 30) : null }
  })
  await P.waitForTimeout(200)
  await L.shot(w, 'rr-p4-c-users')
  console.log('   Admin → Users around his place:', JSON.stringify(near))
  L.rec('RR-P4 a Delete posting runs the next morning and is saved', SIZE, !p0.deleted && p1.deleted && p2.deleted && row === null ? 'PASS' : 'FAIL',
    `posting ${po.date}: "${po.line}"; his row "${tag0}"; deleted before the date ${p0.deleted}; the next morning ${p1.deleted}; after a reload ${p2.deleted}; his Admin → Users row ${JSON.stringify(row)}`, ['rr-p4-a-postout', 'rr-p4-b-next-morning', 'rr-p4-c-users'])
}

console.log('errors:', w?.errs.length ? w.errs : 'none')
L.writeResults('s2-' + SIZE)
await L.closeBrowser()
