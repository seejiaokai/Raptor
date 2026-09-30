/* [DB-READINESS] group A FULL walk — W2 part F: the rest of a request's life and the roles (the independent designer's
   scenarios 18 and 27), and the phone (brief §W2 step 12):
   - a request REASSIGNED to another man (the table's ✎ editor, Person); a request TAKEN OFF its day (the board's Ground
     Programme ✕ on a landed Training) and the week left and returned to; a medical request with two DOCUMENTS attached, one
     removed, then the last one — the document's bytes must never reach the app's saved rows (only the request's docIds);
   - roles: a member's own save lands, a member's refused save writes nothing; the admin's member view (switching writes
     nothing; a refused save there writes nothing); a guest and a man waiting for access save nothing;
   - the phone (390×844): a request filed on the Inputs page, reload.
   Run from raptor-port/scripts/handpass: node dbrA-W2-f.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-f.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, W, sleep } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await L.page(ctx, errors, 'A')
await L.signIn(A, 'a'); await L.settle(A); await H.toastSpy(A)
const ELOG = /^settings\/elog:/
const row = iid => `#inBody tr[data-iid="${iid}"]`

/* ====== reassign ====== */
let iR = null
await W(A, {
  id: 'W2-13a', focus: () => row(iR), what: 'fixture — Inputs page: an LL for Ranger, Tue 13 Oct', reload: false,
  fn: async () => { const r = await H.fileReq(A, { person: 'bane', type: 'LL', from: '2026-10-13', remarks: 'W2 reassign' }); iR = r.iid; return r },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
})
await W(A, {
  id: 'W2-13b', focus: () => row(iR), what: 'its ✎ editor: the Person changed from Ranger to Saint → ✓',
  fn: async () => { if (!(await H.openEdit(A, iR))) return 'no editor'; await A.selectOption('#inBody tr.ined [data-ed="person"]', 'salsa'); await A.locator('#inBody tr.ined [data-save]').first().click(); await sleep(700); return { toasts: await H.toasts(A) } },
  expect: { put: [new RegExp('^inputs/' + '')], also: [ELOG], only: true },
  check: async (a) => { const r = await H.inputRow(A, iR); await H.inputsAll(A); return { what: 'the same request row, now Saint\'s — its row only', ok: r && r.person === 'salsa' && a.put.filter(k => k.startsWith('inputs/')).length === 1 && a.put.includes('inputs/' + iR), detail: { r, put: a.put } } },
  after: async () => { await H.inputsAll(A); const r = await H.inputRow(A, iR); return { what: 'still Saint\'s after the reload', ok: r && r.person === 'salsa', detail: r, said: `${await H.rowText(A, iR)}` } },
})

/* ====== take a landed request off its day ====== */
let iT = null
await W(A, {
  id: 'W2-13c', what: 'fixture — a Training for Ranger on Wed 15 Jul (it lands on Wednesday\'s Ground Programme)', reload: false,
  fn: async () => { const r = await H.fileReq(A, { person: 'bane', type: 'Training', from: '2026-07-15', remarks: 'W2 take off' }); iT = r.iid; return r },
  expect: { put: [/^inputs\//], also: [ELOG, /^weeks\//], only: true },
})
const groundHas = () => A.evaluate(i => window.DAYS[2].ground.some(g => JSON.stringify(g).includes(i)), iT)
const accOf = () => A.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? (r.acc ?? null) : 'GONE' }, iT)
await W(A, {
  id: 'W2-13d', focus: '#eWeek .day[data-day="2"] .sec-unav, #eWeek .day[data-day="2"]', what: 'the scheduler board (Wednesday): the landed Training\'s ✕ on the Ground Programme — taken off the day',
  fn: async () => {
    await H.closeBoard(A); await L.go(A, 'editsched')
    await A.locator('#eWeek [data-sbday="2"]:visible').first().click(); await A.waitForSelector('#schedBoard'); await sleep(600)
    const ri = await A.evaluate(i => window.DAYS[2].ground.findIndex(g => JSON.stringify(g).includes(i)), iT)
    const x = A.locator(`#schedBoard [data-grdel="2.${ri}"]:visible`).first()
    await x.scrollIntoViewIfNeeded(); await x.click(); await sleep(700)
    const t = await H.toasts(A)
    await H.pic(A, 'W2-13d-board')
    await H.closeBoard(A)
    return { ri, toasts: t }
  },
  expect: { put: [/^inputs\//, /^weeks\/[^#:]+#2$/], also: [ELOG], only: true },
  check: async () => ({ what: 'off Wednesday\'s Ground Programme; the request kept, marked taken off', ok: !(await groundHas()) && (await accOf()) === 'r', detail: { ground: await groundHas(), acc: await accOf() } }),
  pg: 'editsched',
  after: async () => { const g = await groundHas(), acc = await accOf(); return { what: 'still off the day after the reload (no re-landing)', ok: !g && acc === 'r', detail: { g, acc }, said: `Wednesday Ground Programme ${g ? 'HAS it again' : 'without it'}; the request ${acc === 'r' ? 'kept, taken off' : acc}` } },
})
await W(A, {
  id: 'W2-13e', what: 'the week left (Jul 20) and returned to (Jul 13) — the taken-off request must not land again',
  fn: async () => { await H.closeBoard(A); await L.go(A, 'editsched'); await A.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await sleep(900); await A.locator('[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await sleep(900); return { week: await A.evaluate(() => window.CURWEEK) } },
  expect: { none: true },
  check: async () => ({ what: 'back on the week, still off Wednesday', ok: !(await groundHas()) && (await accOf()) === 'r', detail: { ground: await groundHas(), acc: await accOf() } }),
  pg: 'editsched',
  after: async () => { const g = await groundHas(), acc = await accOf(); return { what: 'still off after the reload', ok: !g && acc === 'r', detail: { g, acc }, said: `Wednesday ${g ? 'HAS it again' : 'without it'}` } },
})

/* ====== medical documents: the bytes never in the saved rows ====== */
const MARK = 'W2DOCMARKER-' + Date.now().toString(36)
const pdf = n => Buffer.from(`%PDF-1.4\n% ${MARK}-${n}\n1 0 obj << /Type /Catalog >> endobj\n` + 'x'.repeat(4000) + '\n%%EOF\n')
const b64chunk = n => pdf(n).toString('base64').slice(0, 40)
const leak = async () => A.evaluate(([m, c1, c2]) => { const hit = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; if (v.includes(m) || v.includes(c1) || v.includes(c2)) hit.push(k) } return hit }, [MARK, b64chunk(1), b64chunk(2)])
const idbCount = () => A.evaluate(() => new Promise(res => { try { const rq = indexedDB.open('raptor-docs'); rq.onsuccess = () => { const db = rq.result; const names = [...db.objectStoreNames]; if (!names.length) { res({ stores: [], n: 0 }); return } const tx = db.transaction(names, 'readonly'); let n = 0, left = names.length; names.forEach(s => { const c = tx.objectStore(s).count(); c.onsuccess = () => { n += c.result; if (!--left) res({ stores: names, n }) } }) }; rq.onerror = () => res({ err: 'open failed' }) } catch (e) { res({ err: String(e) }) } }))
let iD = null
await W(A, {
  id: 'W2-13f', focus: () => row(iD), what: 'Inputs page: an ATT B for Ranger, Thu 22 Oct, with TWO documents attached (the form\'s Document button, two PDFs)',
  fn: async () => {
    await H.inputsList(A)
    await A.selectOption('#inPerson', 'bane'); await A.selectOption('#inType', 'ATT B'); await sleep(200)
    await A.locator('.docfield input[type=file]').first().setInputFiles([{ name: 'w2-cert-1.pdf', mimeType: 'application/pdf', buffer: pdf(1) }, { name: 'w2-cert-2.pdf', mimeType: 'application/pdf', buffer: pdf(2) }])
    await sleep(700)
    const chips = await A.locator('.docfield .docchip').count()
    const before = await A.evaluate(() => window.INPUTS.map(x => x.iid))
    const r = await H.fileReq(A, { person: 'bane', type: 'ATT B', from: '2026-10-22', remarks: 'W2 documents' })
    iD = r.iid
    return { chips, asked: r.asked, iD }
  },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async (a) => {
    const r = await A.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return x ? { docIds: x.docIds || (x.docId ? [x.docId] : []) } : null }, iD)
    const stored = await A.evaluate(i => localStorage.getItem('raptor:inputs/' + i), iD)
    return { what: 'ONE request row carrying two document ids — and no byte of either document in any saved row (they sit in the browser\'s document drawer)', ok: r && r.docIds.length === 2 && !(await leak()).length && stored && stored.length < 2000, detail: { ret: a.ret, docIds: r && r.docIds, rowBytes: stored && stored.length, leak: await leak(), drawer: await idbCount() } }
  },
  after: async () => { await H.inputsAll(A); const r = await A.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return x ? (x.docIds || (x.docId ? [x.docId] : [])).length : -1 }, iD); const clip = await A.locator(`${row(iD)} .rclip`).count(); return { what: 'the two documents still on the request (its 📎 drawn); still no document bytes in the saved rows', ok: r === 2 && clip === 1 && !(await leak()).length, detail: { docIds: r, clip, drawer: await idbCount() }, said: `${r} documents on it, 📎 ${clip ? 'shown' : 'MISSING'}` } },
})
await W(A, {
  id: 'W2-13g', focus: () => row(iD), what: 'its ✎ editor: one document\'s ✕ → ✓ (one left)',
  fn: async () => { if (!(await H.openEdit(A, iD))) return 'no editor'; await A.locator('#inBody tr.ined .docfield .docdel').first().click(); await sleep(300); await A.locator('#inBody tr.ined [data-save]').first().click(); await sleep(700); return { toasts: await H.toasts(A) } },
  expect: { put: [/^inputs\//], also: [ELOG], only: true },
  check: async () => { const n = await A.evaluate(i => ((r => r.docIds || (r.docId ? [r.docId] : []))(window.INPUTS.find(y => y.iid === i))).length, iD); await H.inputsAll(A); return { what: 'one document id left on the request row; still no bytes in the rows', ok: n === 1 && !(await leak()).length, detail: { n } } },
  after: async () => { const n = await A.evaluate(i => ((r => r.docIds || (r.docId ? [r.docId] : []))(window.INPUTS.find(y => y.iid === i))).length, iD); await H.inputsAll(A); return { what: 'one document after the reload', ok: n === 1, detail: n, said: `${n} document on it` } },
})
await W(A, {
  id: 'W2-13h', focus: () => row(iD), what: 'its ✎ editor: the LAST document\'s ✕ → ✓ (a medical request keeps at least one — refused)',
  fn: async () => { if (!(await H.openEdit(A, iD))) return 'no editor'; await A.locator('#inBody tr.ined .docfield .docdel').first().click(); await sleep(300); await A.locator('#inBody tr.ined [data-save]').first().click(); await sleep(700); const t = await H.toasts(A); const still = await A.locator('#inBody tr.ined').count(); await H.pic(A, 'W2-13h-refused'); if (still) { await A.locator('#inBody tr.ined [data-cancel]').first().click().catch(() => {}); await sleep(300) } return { toasts: t, editorStayed: !!still } },
  expect: { none: true },
  check: async (a) => { const n = await A.evaluate(i => ((r => r.docIds || (r.docId ? [r.docId] : []))(window.INPUTS.find(y => y.iid === i))).length, iD); return { what: 'refused with a reason; nothing written; the document stays', ok: n === 1 && (a.ret.toasts || []).length > 0, detail: { n, ret: a.ret } } },
  reload: false,
})

/* ====== roles ====== */
/* a member: his own save lands; a save on someone else's row is refused and writes nothing */
const M = await L.page(ctx, errors, 'M')
await L.signIn(M, 'm'); await L.settle(M); await H.toastSpy(M)
async function qualsEdit(pg) { await L.go(pg, 'quals'); await pg.click('#qViewA').catch(() => {}); await sleep(200); if (await pg.locator('#qEdit:visible').count()) { await pg.click('#qEdit'); await sleep(300) } }
const qk = await (async () => { await qualsEdit(M); return M.evaluate(() => { const c = [...document.querySelectorAll('#qtbl td[data-q^="bane|"]')].map(x => x.getAttribute('data-q').split('|')[1]).filter(k => !['san', 'sxo', 'sched'].includes(k) && !/^sc|aar/i.test(k)); return c[0] }) })()
const held = (pg, id) => pg.evaluate(([i, k]) => !!(window.PEOPLE[i].quals || {})[k], [id, qk])
const hb0 = await held(M, 'bane'), hs0 = await held(M, 'stiff')
await W(M, {
  id: 'W2-14a', who: 'm', focus: '#qtbl td.qname[data-person="bane"]', what: `Ranger (member), Quals (Enable editing): his OWN ${String(qk).toUpperCase()} ticked`,
  fn: async () => { await qualsEdit(M); const c = M.locator(`#qtbl td[data-q="bane|${qk}"]`).first(); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(500); return held(M, 'bane') },
  expect: { put: [/^people\/bane$/], also: [ELOG], only: true },
  check: async () => ({ what: 'his own row changed', ok: (await held(M, 'bane')) !== hb0, detail: {} }),
  after: async () => ({ what: 'kept after the reload', ok: (await held(M, 'bane')) !== hb0, detail: {}, said: `${String(qk).toUpperCase()} ${(await held(M, 'bane')) ? 'ticked' : 'clear'}` }),
})
await W(M, {
  id: 'W2-14b', who: 'm', focus: '#qtbl td.qname[data-person="stiff"]', what: 'Ranger (member), Quals: a tap on SABER\'s box — refused',
  fn: async () => { await qualsEdit(M); const c = M.locator(`#qtbl td[data-q="stiff|${qk}"]`).first(); if (await c.count()) { await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(500) } return { toasts: await H.toasts(M), body: /only edit your own row/i.test(await M.locator('body').innerText()) } },
  expect: { none: true },
  check: async (a) => ({ what: 'nothing changed, no row, no batch; the reason said on screen', ok: (await held(M, 'stiff')) === hs0 && !a.newBatches.length && ((a.ret.toasts || []).some(t => /own/i.test(t)) || a.ret.body), detail: a.ret }),
  reload: false,
})
await W(M, {
  id: 'W2-14c', who: 'm', what: 'Ranger (member), the Inputs page: another man\'s request offers no ✎ / ✕ (checked on every row that is not his)',
  fn: async () => { await H.inputsAll(M); await M.selectOption('#inFPerson', 'all').catch(() => {}); await sleep(300); return M.evaluate(() => { const rows = [...document.querySelectorAll('#inBody tr[data-iid]')]; const mine = window.INPUTS.filter(x => x.person === 'bane').map(x => x.iid); const others = rows.filter(r => !mine.includes(r.dataset.iid)); return { rows: rows.length, others: others.length, withControls: others.filter(r => r.querySelector('[data-edit], .rmx')).length } }) },
  expect: { none: true },
  check: async (a) => ({ what: 'no edit or delete control on anyone else\'s request', ok: a.ret.others > 0 && a.ret.withControls === 0, detail: a.ret }),
  reload: false,
})
/* the admin's member view: switching writes nothing; a refused save in it writes nothing; switching back writes nothing */
/* tab A reloads first: the member's tab has just changed his own row, which tab A (open since before) has not read */
await A.reload(); await L.signIn(A, 'a', { goto: false }); await L.settle(A); await H.toastSpy(A)
await W(A, {
  id: 'W2-14d', what: 'Saber: the name badge → the member view',
  fn: async () => { await H.closeBoard(A); await L.go(A, 'viewsched'); await A.click('#roleBadge'); await sleep(700); return (await A.locator('#roleBadge').innerText()).trim() },
  expect: { none: true },
  check: async (a) => ({ what: 'the badge says the member view; nothing written', ok: /member/i.test(a.ret), detail: a.ret }),
  reload: false,
})
await W(A, {
  id: 'W2-14e', focus: '#qtbl td.qname[data-person="dj"]', what: 'Saber in the member view, Quals: a tap on ACE\'s box — refused',
  fn: async () => { await qualsEdit(A); const h0 = await held(A, 'dj'); const c = A.locator(`#qtbl td[data-q="dj|${qk}"]`).first(); if (await c.count()) { await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(500) } return { h0, h1: await held(A, 'dj'), toasts: await H.toasts(A) } },
  expect: { none: true },
  check: async (a) => ({ what: 'nothing changed, nothing written', ok: a.ret.h0 === a.ret.h1, detail: a.ret }),
  reload: false,
})
await W(A, {
  id: 'W2-14f', what: 'Saber: the badge again → back to Admin',
  fn: async () => { await L.go(A, 'viewsched'); await A.click('#roleBadge'); await sleep(700); return (await A.locator('#roleBadge').innerText()).trim() },
  expect: { none: true },
  check: async (a) => ({ what: 'admin again; nothing written', ok: /admin/i.test(a.ret), detail: a.ret }),
  reload: false,
})
/* a man waiting for access, then the same man as a guest */
const G = await L.page(ctx, errors, 'G')
await G.goto(L.BASE + '/'); await G.waitForSelector('#luser')
await W(G, {
  id: 'W2-14g', what: 'a man on no list (kite@mail) signs in → "Request access"; he signs out without asking',
  fn: async () => { await H.cardSignIn(G, 'kite@mail'); const f = await G.locator('#accessRequest').count(); await H.pic(G, 'W2-14g-card'); await G.click('#accOut').catch(() => {}); await sleep(400); return { form: f } },
  expect: { none: true },
  check: async (a) => ({ what: 'the request form was offered; signing in and out wrote nothing', ok: a.ret.form === 1, detail: a.ret }),
  reload: false,
})
await W(G, {
  id: 'W2-14h', what: 'kite@mail asks for access → the waiting screen (one request row); he can do nothing else',
  fn: async () => { await H.cardSignIn(G, 'kite@mail'); await G.fill('#accCs', 'Kite'); await G.fill('#accIni', 'KIT'); await G.selectOption('#accSeat', 'FCP'); await G.selectOption('#accCat', 'C'); await G.click('#accSend'); await G.waitForSelector('#accessWaiting'); await sleep(300); return { buttons: await G.evaluate(() => [...document.querySelectorAll('#accessWaiting button')].map(b => b.innerText.trim())) } },
  expect: { put: [/^settings\/accessreq:/], only: true },
  check: async (a) => ({ what: 'one request row; the only thing on his screen to press is Sign out', ok: a.put.length === 1 && a.ret.buttons.every(b => /sign out/i.test(b)), detail: a.ret }),
  reload: false,
})
await W(A, {
  id: 'W2-14i', what: 'Saber: Admin → Users → Guest view on ("Let people waiting for access view the schedule")',
  fn: async () => { await H.usersPane(A); await A.check('#admGuestView'); await sleep(500); return { toasts: await H.toasts(A) } },
  expect: { put: [/^settings\/guestview$/], also: [ELOG, /^settings\/reqseen:/], only: true },
  check: async () => ({ what: 'the switch on', ok: await A.isChecked('#admGuestView'), detail: {} }),
  after: async () => { await H.usersPane(A); const on = await A.isChecked('#admGuestView'); return { what: 'still on after the reload', ok: on, detail: { on }, said: `guest view ${on ? 'on' : 'OFF'}` } },
  afterExpect: { also: [/^settings\/reqseen:/], only: true },
})
await W(G, {
  id: 'W2-14j', what: 'kite@mail signs in again — the guest view: the week read-only; he taps round it',
  fn: async () => {
    /* this tab was opened before the admin switched the guest view on (and the app never re-reads storage while
       open): it reloads first, as a man opening the app later would */
    await G.reload(); await sleep(800)
    if (!(await G.locator('#luser:visible').count())) await G.click('#accOut').catch(() => {})
    await H.cardSignIn(G, 'kite@mail'); await G.waitForSelector('#guestApp', { timeout: 8000 })
    const pucks = G.locator('#guestApp .puck'); const n = await pucks.count()
    for (let i = 0; i < Math.min(4, n); i++) { await pucks.nth(i).click({ force: true }).catch(() => {}); await sleep(150) }
    const days = G.locator('#guestApp .day'); if (await days.count()) await days.first().click({ force: true }).catch(() => {})
    await sleep(300)
    return { guest: await G.locator('#guestApp').count(), buttons: await G.evaluate(() => [...document.querySelectorAll('#guestApp button')].map(b => b.innerText.trim()).slice(0, 12)) }
  },
  expect: { none: true },
  check: async (a) => ({ what: 'the guest view is up; tapping round it wrote nothing', ok: a.ret.guest === 1, detail: a.ret }),
  reload: false,
})

/* ====== the phone: a request filed, reload ====== */
{
  const pctx = await L.context(browser, { phone: true })
  const P = await L.page(pctx, errors, 'P')
  await L.signIn(P, 'a'); await L.settle(P); await H.toastSpy(P)
  H.setWidth('phone 390×844')
  let iP = null
  await W(P, {
    id: 'W2-12', focus: () => iP ? row(iP) : null, what: 'PHONE — Inputs page: Saber files an LL for Ranger, Thu 8 Oct',
    fn: async () => { const r = await H.fileReq(P, { person: 'bane', type: 'LL', from: '2026-10-08', remarks: 'W2 phone' }); iP = r.iid; return r },
    expect: { put: [/^inputs\//], also: [ELOG], only: true },
    check: async (a) => { const o = await H.inputsAll(P); const over = await P.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); return { what: 'one request row; listed; the page fits the phone', ok: a.put.filter(k => k.startsWith('inputs/')).length === 1 && o.includes(iP) && !over, detail: { iP, over } } },
    after: async () => { const o = await H.inputsAll(P); const r = await H.inputRow(P, iP); return { what: 'there after the reload, listed', ok: o.includes(iP) && r && r.date === 'Oct 8', detail: r, said: `LL Oct 8 for Ranger ${o.includes(iP) ? 'listed' : 'MISSING'}` } },
  })
  H.setWidth('desktop')
}

console.log('\nerrors:', errors.length ? errors : 'none')
H.save({ errors })
await browser.close()
process.exit(0)
