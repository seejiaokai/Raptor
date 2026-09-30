/* [DB-READINESS] group A FULL walk — W2 part C: people (brief §W2 steps 5, 6, 7) — Quals (a qualification, a CAT, SXO;
   the Leave War shows SXO read only and offers no Edit person), Admin → Users (a new person with his sign-in in one step,
   archive, restore, delete asked twice), and a posting out through the Leave War's post-out sheet dated today.
   Run from raptor-port/scripts/handpass: node dbrA-W2-c.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-c.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, W, sleep, TODAY } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a')
await L.settle(p)
await H.toastSpy(p)
const ELOG = /^settings\/elog:/
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const PID = 'bruise'   // Gambit
const PERSON = new RegExp('^people/' + PID + '$')

/* ================= step 5 — Quals: a qualification, his CAT, SXO ================= */
async function qualsEditing() {
  await H.closeBoard(p); await L.go(p, 'quals')
  await p.click('#qViewA').catch(() => {}); await sleep(250)
  if (await p.locator('#qEdit:visible').count()) { await p.click('#qEdit'); await sleep(300) }
}
const qualKey = await (async () => { await qualsEditing(); return p.evaluate(id => { const c = [...document.querySelectorAll(`#qtbl td[data-q^="${id}|"]`)].map(x => x.getAttribute('data-q').split('|')[1]).filter(k => !['san', 'sxo', 'sched'].includes(k)); return c.find(k => !window.PEOPLE[id].quals[k]) || c[0] }, PID) })()
const held = () => p.evaluate(([id, k]) => ({ q: !!(window.PEOPLE[id].quals || {})[k], cat: window.PEOPLE[id].q, sxo: !!window.PEOPLE[id].sxo }), [PID, qualKey])
const h0 = await held()
const qFocus = `#qtbl td.qname[data-person="${PID}"]`
await W(p, {
  id: 'W2-05a', focus: qFocus, what: `Quals (Enable editing): Gambit's ${qualKey.toUpperCase()} ticked`,
  fn: async () => { await qualsEditing(); const c = p.locator(`#qtbl td[data-q="${PID}|${qualKey}"]`).first(); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(400); return held() },
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async () => { const h = await held(); return { what: 'his qualification changed', ok: h.q !== h0.q, detail: { before: h0, after: h } } },
  after: async () => { await L.go(p, 'quals'); await p.click('#qViewA').catch(() => {}); const h = await held(); return { what: 'still ticked', ok: h.q !== h0.q, detail: h, said: `${qualKey.toUpperCase()} ${h.q ? 'ticked' : 'clear'}` } },
})
const catNow = (await held()).cat
let catTo = null
await W(p, {
  id: 'W2-05b', focus: qFocus, what: 'Quals: Gambit\'s CAT changed on his row',
  fn: async () => {
    await qualsEditing()
    const sel = p.locator(`#qtbl select[data-lvl="${PID}"]`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value || o.textContent))
    catTo = opts.find(o => o !== catNow)
    await sel.scrollIntoViewIfNeeded(); await sel.selectOption(catTo); await sleep(500)
    return { from: catNow, to: catTo }
  },
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async () => { const h = await held(); return { what: `his CAT reads ${catTo}`, ok: h.cat === catTo, detail: h } },
  after: async () => { await L.go(p, 'quals'); await p.click('#qViewA').catch(() => {}); const h = await held(); return { what: `CAT ${catTo} kept`, ok: h.cat === catTo, detail: h, said: `CAT ${h.cat}` } },
})
await W(p, {
  id: 'W2-05c', focus: qFocus, what: 'Quals: Gambit\'s SXO ticked',
  fn: async () => { await qualsEditing(); const c = p.locator(`#qtbl td[data-q="${PID}|sxo"]`).first(); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(400); return held() },
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async () => { const h = await held(); return { what: 'he is SXO', ok: h.sxo !== h0.sxo && h.sxo, detail: h } },
  after: async () => { await L.go(p, 'quals'); await p.click('#qViewA').catch(() => {}); const h = await held(); return { what: 'still SXO', ok: h.sxo, detail: h, said: `SXO ${h.sxo ? 'ticked' : 'clear'}` } },
})
/* the Leave War: he shows as SXO (read only); the name sheet offers no Edit person (D460, D461) — reading only */
{
  const n0 = L.results.length
  let seen = null
  await L.step(p, 'W2-05d the Leave War read (nothing may be written by looking)', async () => {
    await L.go(p, 'leavewar'); await sleep(1200)
    const chip = p.locator(`[data-testid="cat-${PID}"]`).first()
    await chip.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
    await sleep(300)
    const cls = await chip.getAttribute('class').catch(() => null)
    const inSxo = await p.evaluate(id => { const g = document.querySelector('[data-testid="group-SXO"]'); if (!g) return 'no SXO heading'; const rows = [...document.querySelectorAll('[data-testid^="row-"], [data-testid^="person-"]')]; return !!g && !!document.querySelector(`[data-testid="person-${id}"]`) }, PID)
    await H.pic(p, 'W2-05d-a')
    await p.locator(`[data-testid="person-${PID}"]`).first().click(); await sleep(500)
    const sheet = await p.locator('[data-testid="person-figures"]:visible').count()
    const edit = await p.locator('[data-testid="person-edit"], [data-testid="person-sheet"]').count()
    const words = await p.evaluate(() => { const s = document.querySelector('[data-testid="person-figures"]'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 400) : '' })
    const btns = await p.evaluate(() => { const s = document.querySelector('[data-testid="person-figures"]'); return s ? [...s.querySelectorAll('button')].map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean) : [] })
    await H.pic(p, 'W2-05d-b')
    const x = p.locator('[data-testid="pfig-close"]:visible').first(); if (await x.count()) await x.click(); else await p.keyboard.press('Escape')
    seen = { cls, inSxo, sheet, edit, btns, words }
  }, { none: true })
  L.check('W2-05d the Leave War shows Gambit as SXO (the gold SXO chip, under the SXO heading)', seen && /q-sxo/.test(seen.cls || '') && seen.inSxo === true, seen)
  L.check('W2-05d his name sheet opens his figures and offers NO "Edit person"', seen && seen.sheet === 1 && seen.edit === 0 && !seen.btns.some(b => /edit person|edit aircrew|^\s*edit\s*$/i.test(b)), { btns: seen && seen.btns })
  const rs = L.results.slice(n0)
  H.TABLE.push({ step: 'W2-05d', width: 'desktop', what: 'the Leave War: Gambit shows as SXO; tapping his callsign opens his figures, no Edit person', afterReload: '(read only — no reload needed; the SXO read above came after 05c\'s reload)', rows: 'none (looking wrote nothing)', pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`.slice(0, 500)), pics: ['W2-05d-a.png', 'W2-05d-b.png'] })
}

/* Astra's scenario 13 — a callsign RENAME on Quals: one people row; every picker and the war use the new name */
const csEverywhere = async (pid) => {
  const q = await (async () => { await H.closeBoard(p); await L.go(p, 'quals'); await p.click('#qViewA').catch(() => {}); return p.evaluate(id => { const e = document.querySelector(`#qtbl td.qname[data-person="${id}"]`); return e ? (e.querySelector('input') ? e.querySelector('input').value : e.textContent.trim()) : null }, pid) })()
  await H.inputsList(p)
  const picker = await p.evaluate(id => { const o = document.querySelector(`#inPerson option[value="${id}"]`); return o ? o.textContent.trim() : null }, pid)
  await L.go(p, 'editsched')
  const palette = await p.evaluate(id => { const e = document.querySelector(`#eRoster .rpuck[data-person="${id}"]`); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null }, pid)
  await L.go(p, 'leavewar'); await sleep(1000)
  const war = await p.evaluate(id => { const e = document.querySelector(`[data-testid="person-${id}"] .cs`); return e ? e.textContent.trim() : null }, pid)
  const el = p.locator(`[data-testid="person-${pid}"]`).first(); if (await el.count()) await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  return { quals: q, picker, palette, war }
}
await W(p, {
  id: 'W2-05e', what: 'Quals (editing): Gambit\'s callsign box renamed "Gambol"',
  fn: async () => { await qualsEditing(); const b = p.locator(`#qtbl input[data-cs="${PID}"]`).first(); await b.scrollIntoViewIfNeeded(); await b.fill('Gambol'); await b.press('Enter'); await b.blur().catch(() => {}); await sleep(600); return { toasts: await H.toasts(p) } },
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async (a) => { const c = await csEverywhere(PID); return { what: 'ONE person row; Quals, the Inputs picker, the palette and the Leave War read "Gambol"', ok: a.put.filter(k => k.startsWith('people/')).length === 1 && c.quals === 'Gambol' && c.picker === 'Gambol' && /Gambol/.test(c.palette || '') && c.war === 'Gambol', detail: c } },
  after: async () => { const c = await csEverywhere(PID); return { what: 'every place still reads "Gambol"', ok: c.quals === 'Gambol' && c.picker === 'Gambol' && /Gambol/.test(c.palette || '') && c.war === 'Gambol', detail: c, said: `Quals ${c.quals} · picker ${c.picker} · palette ${c.palette} · war ${c.war}` } },
})
/* Astra's scenario 19 — Undo and Redo of a Quals change (the one Undo, the top bar's ↶ / ↷) */
const qk2 = await (async () => { await qualsEditing(); return p.evaluate(([id, k0]) => { const c = [...document.querySelectorAll(`#qtbl td[data-q^="${id}|"]`)].map(x => x.getAttribute('data-q').split('|')[1]).filter(k => !['san', 'sxo', 'sched', k0].includes(k)); return c.find(k => !window.PEOPLE[id].quals[k]) || c[0] }, [PID, qualKey]) })()
const hq = () => p.evaluate(([id, k]) => !!(window.PEOPLE[id].quals || {})[k], [PID, qk2])
const q0 = await hq()
async function topBar(which) {
  const b = p.locator(`${which === 'undo' ? '#undoBtn' : '#redoBtn'}:visible`).first()
  const title = await b.getAttribute('title').catch(() => null), off = await b.isDisabled().catch(() => true)
  if (!off) { await b.click(); await sleep(800) }
  return { title, pressed: !off, toasts: await H.toasts(p) }
}
await W(p, {
  id: 'W2-05f', focus: qFocus, what: `Quals: Gambol's ${String(qk2).toUpperCase()} ticked (to undo next)`,
  fn: async () => { await qualsEditing(); const c = p.locator(`#qtbl td[data-q="${PID}|${qk2}"]`).first(); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(400); return hq() },
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async () => ({ what: 'ticked', ok: (await hq()) !== q0, detail: { was: q0 } }), reload: false,
})
await W(p, {
  id: 'W2-05g', focus: qFocus, what: 'the top bar\'s Undo (↶) takes the tick back',
  fn: () => topBar('undo'),
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async (a) => ({ what: 'the tick is back as it was; the Undo named it', ok: (await hq()) === q0 && a.ret && a.ret.pressed, detail: a.ret }),
  after: async () => { await L.go(p, 'quals'); await p.click('#qViewA').catch(() => {}); const h = await hq(); return { what: 'after the reload the tick stays taken back', ok: h === q0, detail: { h }, said: `${String(qk2).toUpperCase()} ${h ? 'ticked' : 'clear'} (as before the tick)` } },
})
await W(p, {
  id: 'W2-05h', focus: qFocus, what: `Quals: the ${String(qk2).toUpperCase()} ticked again, then Undo (both before any reload)`,
  fn: async () => { await qualsEditing(); const c = p.locator(`#qtbl td[data-q="${PID}|${qk2}"]`).first(); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(500); const u = await topBar('undo'); return { u, now: await hq() } },
  expect: { also: [PERSON, ELOG], only: true },
  check: async (a) => ({ what: 'ticked and taken back', ok: (await hq()) === q0 && a.ret.u.pressed, detail: a.ret }), reload: false,
})
await W(p, {
  id: 'W2-05i', focus: qFocus, what: 'the top bar\'s Redo (↷) puts the tick back',
  fn: () => topBar('redo'),
  expect: { put: [PERSON], also: [ELOG], only: true },
  check: async (a) => ({ what: 'ticked again; the Redo named it', ok: (await hq()) !== q0 && a.ret.pressed, detail: a.ret }),
  after: async () => { await L.go(p, 'quals'); await p.click('#qViewA').catch(() => {}); const h = await hq(); return { what: 'after the reload the redone tick stays', ok: h !== q0, detail: { h }, said: `${String(qk2).toUpperCase()} ${h ? 'ticked' : 'clear'}` } },
})

/* ================= step 6 — Admin → Users ================= */
async function orders() { return { quals: await H.qualsOrder(p), pickers: await H.pickerOrders(p), users: await (async () => { await H.usersPane(p); return H.usersRows(p) })() } }
let ord0 = null, newPid = null, newAcct = null
const accOf = async pid => (H.accountRows(await L.rows(p)).find(a => a.pid === pid) || null)
await W(p, {
  id: 'W2-06a', what: 'Admin → Users → Add a person: "Kestrel" (KES · Pilot · CAT C) with a sign-in kestrel@mail, Member — one step',
  fn: async () => {
    await H.usersPane(p)
    await H.addPerson(p, { cs: 'Kestrel', ini: 'KES', seat: 'FCP', cat: 'C', signin: 'kestrel@mail', role: 'main' })
    newPid = await H.pidOf(p, 'Kestrel')
    return { toasts: await H.toasts(p), newPid }
  },
  expect: { put: [/^people\//, /^settings\/account:/], also: [ELOG, /^leavewar\//], only: true },
  check: async (a) => {
    const acct = await accOf(newPid); newAcct = acct && acct.key
    const oneBatch = a.batches.length === 1 && a.batches[0].n >= 2
    const people = a.put.filter(k => k.startsWith('people/')), accts = a.put.filter(k => k.startsWith('settings/account:'))
    ord0 = await orders()
    await H.usersPane(p)
    const row = p.locator(`#accList [data-person="${newPid}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    /* the FIRST account write on a demo store stores the whole seeded list it holds in memory (accounts.ts writeAccounts —
       "no rows = the seeded list"), so the other account rows here are the seeded accounts, stored for the first time */
    return { what: 'his person row AND his account row, in ONE batch (the other account rows: the seeded list, stored by this first account write)', ok: oneBatch && same(people, ['people/' + newPid]) && accts.includes(newAcct) && acct.name === 'kestrel@mail', detail: { batches: a.batches, people, accts, others: a.put.filter(k => !/^(people|settings\/account|settings\/elog)/.test(k)) } }
  },
  after: async () => {
    const o = await orders()
    const row = p.locator(`#accList [data-person="${newPid}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    const txt = await p.evaluate(id => { const r = document.querySelector(`#accList [data-person="${id}"]`); return r ? r.innerText.replace(/\s+/g, ' ') : null }, newPid)
    return { what: 'Kestrel listed with his sign-in; Quals, the Inputs pickers, the palette and Admin → Users in the same order', ok: !!txt && /kestrel@mail/.test(txt) && same(o, ord0), detail: { txt, quals: same(o.quals, ord0.quals), pickers: same(o.pickers, ord0.pickers), users: same(o.users, ord0.users) }, said: `"${txt}" · every list in the same order` }
  },
})
let merlin = null
await W(p, {
  id: 'W2-06a2', what: 'Admin → Users → Add a person again, now the accounts are stored: "Merlin" (MER · WSO · CAT C), sign-in merlin@mail',
  fn: async () => { await H.usersPane(p); await H.addPerson(p, { cs: 'Merlin', ini: 'MER', seat: 'RCP', cat: 'C', signin: 'merlin@mail', role: 'main' }); merlin = await H.pidOf(p, 'Merlin'); return { merlin, toasts: await H.toasts(p) } },
  expect: { put: [/^people\//, /^settings\/account:/], also: [ELOG, /^leavewar\/profile:/], only: true },
  check: async (a) => {
    const acct = await accOf(merlin)
    const accts = a.put.filter(k => k.startsWith('settings/account:')), people = a.put.filter(k => k.startsWith('people/'))
    ord0 = await orders(); await H.usersPane(p)
    const row = p.locator(`#accList [data-person="${merlin}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    return { what: 'exactly his person row and his ONE account row, in ONE batch', ok: a.batches.length === 1 && same(people, ['people/' + merlin]) && accts.length === 1 && acct && accts[0] === acct.key, detail: { batches: a.batches, people, accts, others: a.put.filter(k => !/^(people|settings\/account|settings\/elog)/.test(k)) } }
  },
  after: async () => { const o = await orders(); const row = p.locator(`#accList [data-person="${merlin}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' })); const txt = await p.evaluate(id => { const r = document.querySelector(`#accList [data-person="${id}"]`); return r ? r.innerText.replace(/\s+/g, ' ') : null }, merlin); return { what: 'Merlin listed with his sign-in; every list in the same order', ok: !!txt && /merlin@mail/.test(txt) && same(o, ord0), detail: { txt, quals: same(o.quals, ord0.quals), pickers: same(o.pickers, ord0.pickers), users: same(o.users, ord0.users) }, said: `"${txt}"` } },
})
await W(p, {
  id: 'W2-06b', what: 'Admin → Users: Kestrel\'s row → Archive',
  fn: async () => { await H.usersPane(p); await H.openPersonRow(p, newPid); await p.click('#accEdArchive'); await sleep(600); return { toasts: await H.toasts(p) } },
  expect: { put: [new RegExp('^people/' + newPid + '$')], also: [ELOG, /^settings\/account:/, /^leavewar\//], only: true },
  check: async (a) => {
    const P = await p.evaluate(id => ({ archived: !!window.PEOPLE[id].archived }), newPid)
    const acct = await accOf(newPid)
    ord0 = await orders()
    await H.usersPane(p); if (!(await p.locator('#accArchList').count())) { await p.click('#accArchToggle'); await sleep(300) }
    const row = p.locator(`#accArchList [data-person="${newPid}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    return { what: 'he is archived and his sign-in suspended — his rows only', ok: P.archived && acct && acct.on === false, detail: { P, acct: acct && { on: acct.on }, put: a.put, del: a.del } }
  },
  after: async () => {
    const o = await orders()
    if (!(await p.locator('#accArchList').count())) { await p.click('#accArchToggle').catch(() => {}); await sleep(300) }
    const txt = await p.evaluate(id => { const r = document.querySelector(`#accArchList [data-person="${id}"]`); return r ? r.innerText.replace(/\s+/g, ' ') : null }, newPid)
    const row = p.locator(`#accArchList [data-person="${newPid}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    return { what: 'Kestrel under ▸ Archived; every list in the same order', ok: !!txt && same(o, ord0), detail: { txt, quals: same(o.quals, ord0.quals), pickers: same(o.pickers, ord0.pickers), users: same(o.users, ord0.users) }, said: `Archived: "${txt}"` }
  },
})
await W(p, {
  id: 'W2-06c', what: 'Admin → Users → ▸ Archived → Kestrel → Restore (post-in today)',
  fn: async () => { await H.usersPane(p); await H.openPersonRow(p, newPid, true); await p.click('#accArRestore'); await sleep(700); return { toasts: await H.toasts(p), err: await p.locator('#accArErr').innerText().catch(() => '') } },
  expect: { put: [new RegExp('^people/' + newPid + '$')], also: [ELOG, /^settings\/account:/, /^leavewar\//], only: true },
  check: async (a) => {
    const P = await p.evaluate(id => ({ archived: !!window.PEOPLE[id].archived }), newPid)
    const acct = await accOf(newPid)
    ord0 = await orders()
    await H.usersPane(p)
    const row = p.locator(`#accList [data-person="${newPid}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    return { what: 'back on the roster, his sign-in back on', ok: !P.archived && acct && acct.on !== false, detail: { P, acct: acct && { on: acct.on }, put: a.put } }
  },
  after: async () => {
    const o = await orders()
    const row = p.locator(`#accList [data-person="${newPid}"]`).first(); if (await row.count()) await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    const txt = await p.evaluate(id => { const r = document.querySelector(`#accList [data-person="${id}"]`); return r ? r.innerText.replace(/\s+/g, ' ') : null }, newPid)
    return { what: 'Kestrel on the roster again; every list in the same order', ok: !!txt && same(o, ord0), detail: { txt, quals: same(o.quals, ord0.quals), pickers: same(o.pickers, ord0.pickers), users: same(o.users, ord0.users) }, said: `"${txt}"` }
  },
})
/* delete a man (D287: it asks twice) — Kestrel, who has a sign-in */
let delAsk = null
await W(p, {
  id: 'W2-06d', what: 'Admin → Users → Kestrel → Delete, then "Tap again to delete Kestrel"',
  fn: async () => {
    await H.usersPane(p); await H.openPersonRow(p, newPid)
    const r0 = await L.rows(p)
    await p.click('#accEdDel'); await sleep(300)
    const first = { btn: (await p.locator('#accEdDel').innerText()).trim(), note: await p.locator('#accEdDelNote').innerText().catch(() => ''), wrote: L.diff(r0, await L.rows(p)) }
    await H.pic(p, 'W2-06d-ask')
    await p.click('#accEdDel'); await sleep(700)
    delAsk = first
    return { first, toasts: await H.toasts(p) }
  },
  expect: { del: [/^settings\/account:/], also: [ELOG, /^people\//, /^settings\/account:/, /^leavewar\//, /^weeks\//, /^inputs\//, /^plan\//, /^settings\/reqseen:/, /^settings\/seen:/], only: true },
  check: async (a) => {
    const P = await p.evaluate(id => window.PEOPLE[id] ? { deleted: !!window.PEOPLE[id].deleted } : 'gone', newPid)
    const acct = await accOf(newPid)
        ord0 = await orders()
    await H.usersPane(p)
    return { what: 'the first tap asked (naming him, saying what goes) and wrote nothing; the second deleted him — his account row removed, his person row kept as a hidden mark', ok: /Tap again to delete Kestrel/.test(delAsk.btn) && !(delAsk.wrote.put.length + delAsk.wrote.del.length) && !acct && (P === 'gone' || P.deleted), detail: { ask: delAsk, P, acctLeft: acct, put: a.put, del: a.del } }
  },
  after: async () => {
    const o = await orders()
    const txt = await p.evaluate(id => { const r = document.querySelector(`#accList [data-person="${id}"], #accArchList [data-person="${id}"]`); return r ? r.innerText : null }, newPid)
    return { what: 'Kestrel not listed; every list in the same order', ok: !txt && same(o, ord0), detail: { txt, quals: same(o.quals, ord0.quals), pickers: same(o.pickers, ord0.pickers), users: same(o.users, ord0.users) }, said: 'Kestrel gone from Admin → Users; lists unchanged' }
  },
})
/* a man of the demo, who flew days and has requests: Blade (slash) — delete, asked twice */
let bladeRows = null
await W(p, {
  id: 'W2-06e', what: 'Admin → Users → Blade (a man of the demo: requests, pucks on the week) → Delete, twice',
  fn: async () => { await H.usersPane(p); const acct = await accOf('slash'); await H.openPersonRow(p, 'slash'); await p.click('#accEdDel'); await sleep(300); await p.click('#accEdDel'); await sleep(900); return { hadAccount: !!acct, toasts: await H.toasts(p) } },
  expect: { put: [/^people\/slash$/], also: [ELOG, /^people\//, /^settings\/account:/, /^leavewar\//, /^weeks\//, /^inputs\//, /^plan\//, /^settings\/reqseen:/, /^settings\/seen:/], only: true },
  check: async (a) => { bladeRows = { put: a.put, del: a.del }; const P = await p.evaluate(() => window.PEOPLE.slash ? { deleted: !!window.PEOPLE.slash.deleted } : 'gone'); ord0 = await orders(); await H.usersPane(p); return { what: 'Blade deleted (his mark kept)', ok: P === 'gone' || P.deleted, detail: { P, put: a.put.length, del: a.del.length, kinds: [...new Set([...a.put, ...a.del].map(k => k.split(/[/:#]/).slice(0, 2).join('/')))] } } },
  after: async () => { const o = await orders(); return { what: 'every list in the same order, Blade not in them', ok: same(o, ord0) && !o.quals.includes('slash') && !o.users.includes('slash'), detail: { quals: same(o.quals, ord0.quals), pickers: same(o.pickers, ord0.pickers), users: same(o.users, ord0.users) }, said: 'Blade gone; lists unchanged' } },
})

/* ================= step 7 — posting out, an outcome dated today ================= */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
async function lwMonth(iso) {
  await H.closeBoard(p); await L.go(p, 'leavewar'); await sleep(900)
  const m = p.locator(`[data-testid="month-${MON[Number(iso.slice(5, 7)) - 1]}"]`)
  if (await m.count()) { await m.first().click(); await sleep(900) }
}
const PO = 'rocky'   // Hex
let poLine = null
await W(p, {
  id: 'W2-07', focus: `[data-testid="row-${PO}"], [data-testid="person-${PO}"]`, what: `the Leave War: Hex's box for today (${TODAY}) → PO → "Overseas Sqn" (archived on Quals, account suspended — today) → Post out`,
  fn: async () => {
    await lwMonth(TODAY)
    const c = p.locator(`[data-testid="cell-${PO}-${TODAY}"]`).first()
    await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(500)
    await p.click('[data-testid="bid-postout"]'); await sleep(300)
    /* Overseas Sqn is the chip already chosen when the sheet opens — a press on it would un-choose it */
    if ((await p.getAttribute('[data-testid="po-overseas"]', 'aria-pressed').catch(() => null)) !== 'true') { await p.click('[data-testid="po-overseas"]').catch(() => {}); await sleep(200) }
    poLine = await p.locator('[data-testid="po-line"]').innerText().catch(() => '')
    await H.pic(p, 'W2-07-sheet')
    await p.click('[data-testid="po-confirm"]'); await sleep(1200)
    return { line: poLine, toasts: await H.toasts(p) }
  },
  expect: { put: [/^leavewar\/profile:rocky$/, /^people\/rocky$/], also: [ELOG, /^settings\/account:/, /^leavewar\//, /^people\//, /^inputs\//, /^weeks\//, /^plan\//], only: true },
  check: async (a) => {
    const P = await p.evaluate(id => ({ archived: !!window.PEOPLE[id].archived, by: window.PEOPLE[id].archivedBy || '' }), PO)
    const acct = await accOf(PO)
    return { what: 'on its date (today) he is archived and his sign-in suspended; the posting kept on his war profile', ok: P.archived && (!acct || acct.on === false), detail: { line: poLine, P, acct: acct && { on: acct.on, name: acct.name }, put: a.put, del: a.del } }
  },
  after: async () => {
    const P = await p.evaluate(id => ({ archived: !!window.PEOPLE[id].archived }), PO)
    const acct = await accOf(PO)
    await lwMonth(TODAY)
    const cls = await p.locator(`[data-testid="cell-${PO}-${TODAY}"]`).getAttribute('class').catch(() => 'no cell drawn')
    return { what: 'still posted out: archived, sign-in suspended', ok: P.archived && (!acct || acct.on === false), detail: { P, acct: acct && acct.on, cell: cls }, said: `Hex archived, sign-in ${acct ? (acct.on ? 'ON' : 'suspended') : 'none'}; his box today: ${cls}` }
  },
})

/* Astra's scenario 12 — the other outcomes a posting out offers, dated today: SANS (Outlaw) and Delete (Echo) */
let echoRow = null
/* a man's row on the war this month: drawn or not, and the first day wearing the PO hatch */
const warRow = pid => p.evaluate(id => { const r = document.querySelector(`[data-testid="person-${id}"]`); if (!r) return { drawn: false }; const po = [...document.querySelectorAll(`[data-testid^="cell-${id}-"]`)].filter(c => /PO/.test(c.innerText || '')).map(c => c.getAttribute('data-testid').slice(-10)); return { drawn: true, poFrom: po[0] || null, poDays: po.length } }, pid)
async function postOut(pid, chip, twice = false) {
  await lwMonth(TODAY)
  const c = p.locator(`[data-testid="cell-${pid}-${TODAY}"]`).first()
  await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(500)
  await p.click('[data-testid="bid-postout"]'); await sleep(300)
  if ((await p.getAttribute(`[data-testid="po-${chip}"]`, 'aria-pressed').catch(() => null)) !== 'true') { await p.click(`[data-testid="po-${chip}"]`); await sleep(250) }
  const line = await p.locator('[data-testid="po-line"]').innerText().catch(() => '')
  await H.pic(p, `W2-07-${chip}-sheet`)
  await p.click('[data-testid="po-confirm"]'); await sleep(700)
  let ask = null
  if (twice) { ask = (await p.locator('[data-testid="po-confirm"]').innerText().catch(() => '')).trim(); await p.click('[data-testid="po-confirm"]'); await sleep(1200) }
  return { line, ask, toasts: await H.toasts(p) }
}
await W(p, {
  id: 'W2-07b', focus: '[data-testid="person-casper"]', what: `the Leave War: Outlaw's box for today → PO → "SANS" → Post out`,
  fn: () => postOut('casper', 'sans'),
  expect: { put: [/^leavewar\/profile:casper$/], also: [ELOG, /^settings\/account:/, /^leavewar\//, /^people\//, /^inputs\//, /^weeks\//, /^plan\//], only: true },
  check: async (a) => { const P = await p.evaluate(() => ({ san: !!window.PEOPLE.casper.san, archived: !!window.PEOPLE.casper.archived })); return { what: 'he is a SANS man from today (the rows it says)', ok: P.san && !P.archived, detail: { ret: a.ret, P, put: a.put, del: a.del } } },
  after: async () => { const P = await p.evaluate(() => ({ san: !!window.PEOPLE.casper.san, archived: !!window.PEOPLE.casper.archived })); await lwMonth(TODAY); return { what: 'still SANS after the reload', ok: P.san && !P.archived, detail: P, said: `Outlaw SANS ${P.san}` } },
})
await W(p, {
  id: 'W2-07c', focus: `[data-testid="person-freak"]`, what: `the Leave War: Echo's box for today → PO → "Delete" → Post out, and "Tap again"`,
  fn: () => postOut('freak', 'delete', true),
  expect: { put: [/^people\/freak$/], also: [ELOG, /^settings\/account:/, /^leavewar\//, /^people\//, /^inputs\//, /^weeks\//, /^plan\//, /^settings\/reqseen:/, /^settings\/seen:/], only: true },
  check: async (a) => { const P = await p.evaluate(() => window.PEOPLE.freak ? { deleted: !!window.PEOPLE.freak.deleted } : 'gone'); await lwMonth(TODAY); echoRow = await warRow('freak'); return { what: 'the first press asked again ("Tap again to delete Echo"); the second deleted him (D299: this month still shows his past days, PO from today)', ok: /Tap again/.test((a.ret && a.ret.ask) || '') && (P === 'gone' || P.deleted), detail: { ret: a.ret, P, put: a.put, del: a.del, echoRow } } },
  after: async () => { const P = await p.evaluate(() => window.PEOPLE.freak ? { deleted: !!window.PEOPLE.freak.deleted } : 'gone'); await lwMonth(TODAY); const r = await warRow('freak'); return { what: 'still deleted; his war row this month the same as before the reload (his past kept, PO from today — D299)', ok: (P === 'gone' || P.deleted) && JSON.stringify(r) === JSON.stringify(echoRow), detail: { P, before: echoRow, after: r }, said: `Echo ${JSON.stringify(P)}; war row ${r.drawn ? 'this month, PO from ' + r.poFrom : 'not drawn'} (same as before)` } },
})

console.log('\nerrors:', errors.length ? errors : 'none')
H.save({ errors, bladeRows })
await browser.close()
process.exit(0)
