/* [DB-READINESS] phase 7 walk — walker C, C37 (vi): the other stored records, each made through its own controls, then
   a reload and a look. One fresh world each (P7_PART = pi | outback | event | doc | tracker | all).
     pi       a Post In with no Post Out (Leave War: a man's box → PI → Post in)
     outback  a full out-and-back (PO from a date, then PI from a later date)
     event    a sixth Leave War event row (⚙ → ＋ Event row ×4) with a band (a range of days) on it
     doc      a medical document attached to a downchit (Inputs: ATT C with a PDF)
     tracker  a ball's typed details, a re-ordered chart list and a hidden (deleted built-in) chart */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const PART = process.env.P7_PART || 'all'
const want = k => PART === 'all' || PART === k
const allErrors = []
const reloadLine = id => { const rr = L.results.filter(r => r.name.startsWith(id + ' ')); return { ok: rr.length > 0 && rr.every(r => r.ok), text: rr.map(r => (r.ok ? 'ok: ' : 'FAIL: ') + r.name.split('— ')[1] + (r.ok ? '' : ' ' + r.detail)).join(' · ') } }
const lwRows = r => Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('leavewar/')))
const sheetText = p => p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth); const s = d[d.length - 1]; return s ? (s.getAttribute('data-testid') || '') + ': ' + (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400) : 'nothing open' })
const closeSheets = async p => { for (let i = 0; i < 4; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } else break } }
async function toWar(p, mon = 'JUL') { await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800); const b = p.locator(`[data-testid="month-${mon}"]:visible`).first(); if (await b.count()) { await b.click().catch(() => {}); await L.sleep(900) } }
const cellsOf = (p, id, dates) => p.evaluate(([id, ds]) => Object.fromEntries(ds.map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return [d, c ? `"${(c.innerText || '').replace(/\s+/g, ' ').trim()}" [${String(c.className).trim()}]` : 'NO BOX'] })), [id, dates])
async function tapCell(p, id, iso) { const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await c.click(); await L.sleep(500) }
async function setDate(p, testid, iso) { const i = p.locator(`[data-testid="${testid}"]`); await i.fill(iso); await i.blur().catch(() => {}); await L.sleep(250) }

/* ---------------------------------------------------------------- a Post In with no Post Out */
if (want('pi')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  const ID = 'slash', DS = ['2026-07-14', '2026-07-17', '2026-07-20', '2026-07-21']
  await toWar(p)
  const r0 = await L.rows(p), c0 = await cellsOf(p, ID, DS)
  await tapCell(p, ID, '2026-07-20'); await p.click('[data-testid="bid-postin"]'); await L.sleep(400)
  const sheet = await sheetText(p)
  await pic('C37vi-pi-01-sheet')
  await p.click('[data-testid="pi-confirm"]'); await L.sleep(900); await closeSheets(p)
  await L.settle(p)
  const ts = await C.toasts(p), c1 = await cellsOf(p, ID, DS)
  const r1 = await L.rows(p); const d = L.diff(r0, r1)
  await p.locator(`[data-testid="cell-${ID}-2026-07-20"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
  await pic('C37vi-pi-02-posted-in')
  const stored = d.put.filter(k => /leavewar|people/.test(k)).map(k => k + ' = ' + String(r1[k]).slice(0, 200))
  await L.reloadCompare(p, 'C37vi-pi reload', 'a', { page: 'leavewar' })
  await toWar(p)
  const c2 = await cellsOf(p, ID, DS)
  await p.locator(`[data-testid="cell-${ID}-2026-07-20"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await L.sleep(300)
  await pic('C37vi-pi-03-after-reload')
  const rl = reloadLine('C37vi-pi reload')
  C.row('C37-vi-a', 'Leave War: Blade\'s box for Mon 20 Jul → PI → "Post in" (PI from 20 Jul), with no Post Out before it; reload',
    `the sheet: "${sheet.slice(0, 260)}"; toast ${JSON.stringify(ts)}; Blade's boxes before: ${JSON.stringify(c0)}; after the Post In: ${JSON.stringify(c1)}; AFTER THE RELOAD: ${JSON.stringify(c2)}`,
    `rows written: ${stored.join(' ; ') || d.put.join(', ') || '(none)'}; the boxes read the same after the reload: ${JSON.stringify(c1) === JSON.stringify(c2)}; ${rl.text}`,
    JSON.stringify(c1) === JSON.stringify(c2) && JSON.stringify(c0) !== JSON.stringify(c1) && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'pi: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- a full out-and-back */
if (want('outback')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const W2 = await import('./dbrA-W2-lib.mjs')
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  const ID = 'slash', DS = ['2026-07-10', '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-20']
  await toWar(p)
  const r0 = await L.rows(p), c0 = await cellsOf(p, ID, DS)
  /* OUT: posted out from Mon 13 Jul (today is Wed 15 Jul here, so the posting takes effect at once) */
  await tapCell(p, ID, '2026-07-13'); await p.click('[data-testid="bid-postout"]'); await L.sleep(400)
  await setDate(p, 'po-date', '2026-07-13')
  if ((await p.getAttribute('[data-testid="po-overseas"]', 'aria-pressed')) !== 'true') { await p.click('[data-testid="po-overseas"]'); await L.sleep(250) }
  const poLine = await p.locator('[data-testid="po-line"]').innerText().catch(() => '')
  await pic('C37vi-ob-01-post-out-sheet')
  await p.click('[data-testid="po-confirm"]'); await L.sleep(1200); await closeSheets(p); await L.settle(p)
  const tOut = await C.toasts(p), c1 = await cellsOf(p, ID, DS)
  const archived = await p.evaluate(id => !!window.PEOPLE[id].archived, ID)
  /* the Leave War's own PI on a posted-out man, tried first: what the app says */
  let piSaid = '(not tried)'
  await tapCell(p, ID, '2026-07-15')
  if (await p.locator('[data-testid="postout-place"]:visible').count()) { await p.click('[data-testid="postout-place"]'); await L.sleep(500) }
  if (await p.locator('[data-testid="bid-postin"]:visible').count()) { await p.click('[data-testid="bid-postin"]'); await L.sleep(400); await setDate(p, 'pi-date', '2026-07-15'); await p.click('[data-testid="pi-confirm"]'); await L.sleep(800); piSaid = (await sheetText(p)).slice(-110); await pic('C37vi-ob-02-leavewar-pi-refused') }
  await closeSheets(p)
  /* BACK: Admin → Users → ▸ Archived → Blade → Restore */
  await W2.usersPane(p); await W2.openPersonRow(p, ID, true)
  const panel = await p.evaluate(() => { const e = document.querySelector('#accArRestore'); const host = e ? (e.closest('.acc-open, .acc-row, li, tr, div') || e.parentElement) : null; return host ? [...host.querySelectorAll('input, select, button')].filter(x => x.offsetWidth).map(x => (x.id || x.className) + (x.type ? '(' + x.type + ')' : '') + ':' + (x.value || x.innerText || '').trim().slice(0, 18)) : 'no Restore button' })
  const dateIn = p.locator('#accArDate:visible, #accArFrom:visible, #accArchList input[type="date"]:visible').first()
  let piDate = '(no date asked)'
  if (await dateIn.count()) { piDate = await dateIn.inputValue() }
  await pic('C37vi-ob-03-admin-restore')
  await p.click('#accArRestore'); await L.sleep(900)
  const rErr = await p.locator('#accArErr').innerText().catch(() => '')
  await L.settle(p)
  const tIn = await C.toasts(p)
  const back = await p.evaluate(id => !window.PEOPLE[id].archived, ID)
  await toWar(p)
  const c2 = await cellsOf(p, ID, DS)
  const r1 = await L.rows(p); const d = L.diff(r0, r1)
  await p.locator(`[data-testid="cell-${ID}-2026-07-14"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await L.sleep(300)
  await pic('C37vi-ob-04-out-and-back')
  const stored = d.put.filter(k => /leavewar/.test(k)).map(k => k + ' = ' + String(r1[k]).slice(0, 260))
  await L.reloadCompare(p, 'C37vi-ob reload', 'a', { page: 'leavewar' })
  await toWar(p)
  const c3 = await cellsOf(p, ID, DS)
  await p.locator(`[data-testid="cell-${ID}-2026-07-14"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await L.sleep(300)
  await pic('C37vi-ob-05-after-reload')
  const rl = reloadLine('C37vi-ob reload')
  C.row('C37-vi-b', 'Leave War: Blade\'s box for Mon 13 Jul → PO, "Overseas Sqn", PO from 13 Jul → Post out (today is Wed 15 Jul in this walk); the war\'s own PI tried on his 15 Jul box; then Admin → Users → ▸ Archived → Blade → Restore; Leave War; reload',
    `the post-out line: "${poLine}", toast ${JSON.stringify(tOut)}; archived on Quals at once: ${archived}; boxes before ${JSON.stringify(c0)}; after the Post Out ${JSON.stringify(c1)}; the war's own PI on the posted-out man answered: "${piSaid}"; Admin's restore panel: ${JSON.stringify(panel).slice(0, 300)}, its post-in date ${piDate}, error line "${rErr}", toast ${JSON.stringify(tIn)}; back on the roster: ${back}; boxes after the restore ${JSON.stringify(c2)}; AFTER THE RELOAD ${JSON.stringify(c3)}`,
    `rows written: ${stored.join(' ; ') || d.put.join(', ') || '(none)'}; the boxes read the same after the reload: ${JSON.stringify(c2) === JSON.stringify(c3)}; ${rl.text}`,
    back && JSON.stringify(c2) === JSON.stringify(c3) && JSON.stringify(c1) !== JSON.stringify(c0) && JSON.stringify(c2) !== JSON.stringify(c1) && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'outback: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- a sixth event row with a band */
if (want('event')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  await toWar(p)
  const rowsNow = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^="event-row-"]')].map(e => e.getAttribute('data-testid')))
  const r0 = await L.rows(p), ev0 = await rowsNow()
  let adds = 0, addState = ''
  for (let i = 0; i < 6 && (await rowsNow()).length < 6; i++) {
    if (!(await p.locator('[data-testid="settings-sheet"]:visible').count())) { await p.click('[data-testid="settings-open"]'); await L.sleep(350) }
    const b = p.locator('[data-testid="event-add"]:visible')
    if (await b.isDisabled()) { addState = 'the ＋ Event row button went disabled: ' + (await b.getAttribute('title')); break }
    await b.click(); await L.sleep(400); adds++
  }
  await closeSheets(p)
  const ev1 = await rowsNow()
  const last = ev1.length - 1
  const D = ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23']
  /* a filled box is called event-band-<row>-<first day> and is as many days wide as its bar */
  const evCells = () => p.evaluate(([n, ds]) => Object.fromEntries(ds.map(d => { const c = document.querySelector(`[data-testid="event-band-${n}-${d}"]`) || document.querySelector(`[data-testid="event-${n}-${d}"]`); return [d, c ? `"${(c.innerText || '').replace(/\s+/g, ' ').trim()}" [${String(c.className).trim()}${c.getAttribute('colspan') ? ', ' + c.getAttribute('colspan') + ' days wide' : ''}]` : 'under the bar (no box of its own)'] })), [last, D])
  const ec = p.locator(`[data-testid="event-${last}-2026-07-20"]`).first()
  await ec.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await ec.click(); await L.sleep(500)
  await p.locator('[data-testid="event-text"]').fill('P7 SIXTH')
  await p.click('[data-testid="event-tag-work"]'); await L.sleep(200)
  await p.click('[data-testid="event-scope-range"]'); await L.sleep(400)
  const rangeUi = await p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth); const s = d[d.length - 1]; return s ? [...s.querySelectorAll('input, button')].filter(e => e.offsetWidth).map(e => e.tagName + ':' + (e.getAttribute('data-testid') || '?') + ':' + (e.type || '') + ':' + (e.value || e.innerText || '').trim().slice(0, 16)) : [] })
  /* "A range" opens a month of day buttons and two ways to draw it; "One merged bar" is the band */
  const modes = await p.evaluate(() => ['event-mode-merge', 'event-mode-repeat'].map(t => { const b = document.querySelector(`[data-testid="${t}"]`); return b ? b.innerText.trim() : null }))
  if (await p.locator('[data-testid="event-mode-merge"]:visible').count()) { await p.click('[data-testid="event-mode-merge"]'); await L.sleep(200) }
  await p.click('[data-testid="event-day-2026-07-22"]'); await L.sleep(300)
  const rangeSays = await sheetText(p)
  await pic('C37vi-ev-01-event-sheet-range')
  await p.click('[data-testid="event-apply"]'); await L.sleep(700)
  /* a range picked on the grid instead of in the sheet: a tap on its last day */
  const stillAsking = await sheetText(p)
  await closeSheets(p); await L.settle(p)
  const ts = await C.toasts(p), e1 = await evCells()
  const r1 = await L.rows(p); const d = L.diff(r0, r1)
  await p.locator(`[data-testid="event-${last}-2026-07-21"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await L.sleep(300)
  await pic('C37vi-ev-02-sixth-row-with-band')
  const stored = d.put.filter(k => /leavewar/.test(k)).map(k => k + ' (' + String(r1[k]).length + ' chars)' + (/P7 SIXTH/.test(r1[k]) ? ' holds "P7 SIXTH"' : ''))
  await L.reloadCompare(p, 'C37vi-ev reload', 'a', { page: 'leavewar' })
  await toWar(p)
  const ev2 = await rowsNow(), e2 = await evCells()
  await p.locator(`[data-testid="event-${last}-2026-07-21"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await L.sleep(300)
  await pic('C37vi-ev-03-after-reload')
  const rl = reloadLine('C37vi-ev reload')
  const band = /P7 SIXTH/.test(e1['2026-07-20']) && /3 days wide/.test(e1['2026-07-20']) ? 1 : 0
  C.row('C37-vi-c', `Leave War → ⚙ Settings → ＋ Event row until there are six (${adds} presses${addState ? '; ' + addState : ''}); the last row's box for 20 Jul → "P7 SIXTH", tag Work, "A range" 20–22 Jul → Save; reload`,
    `event rows before ${ev0.length}, after ${ev1.length} (${ev1.join(', ')}); "A range" offered ${JSON.stringify(modes)} and a month of day buttons (${rangeUi.length} controls); after picking 22 Jul the sheet's last words: "${rangeSays.slice(-60)}"; after Save the sheet read "${stillAsking.slice(0, 120)}"; toast ${JSON.stringify(ts)}; the last row's boxes 20–23 Jul: ${JSON.stringify(e1)}; AFTER THE RELOAD rows ${ev2.length}, boxes ${JSON.stringify(e2)}`,
    `rows written: ${stored.join(' ; ') || '(none)'}; the same after the reload: ${JSON.stringify(e1) === JSON.stringify(e2) && ev1.length === ev2.length}; ${rl.text}`,
    ev1.length === 6 && ev2.length === 6 && band >= 1 && JSON.stringify(e1) === JSON.stringify(e2) && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'event: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- a medical document attached to a downchit */
if (want('doc')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const W2 = await import('./dbrA-W2-lib.mjs')
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  const pdf = Buffer.from('%PDF-1.4\n% P7-C-DOC\n1 0 obj << /Type /Catalog >> endobj\n' + 'x'.repeat(4000) + '\n%%EOF\n')
  await W2.inputsList(p)
  await p.selectOption('#inPerson', 'slash'); await p.selectOption('#inType', 'ATT C'); await L.sleep(250)
  const field = await p.locator('.docfield input[type=file]').count()
  if (field) { await p.locator('.docfield input[type=file]').first().setInputFiles([{ name: 'p7-c-cert.pdf', mimeType: 'application/pdf', buffer: pdf }]); await L.sleep(700) }
  const chips = await p.locator('.docfield .docchip').allInnerTexts().catch(() => [])
  await pic('C37vi-doc-01-form-with-document')
  const r = await W2.fileReq(p, { person: 'slash', type: 'ATT C', from: '2026-07-21', remarks: 'P7 downchit with a document' })
  await L.settle(p)
  const idb = () => p.evaluate(() => new Promise(res => { try { const rq = indexedDB.open('raptor-docs'); rq.onsuccess = () => { const db = rq.result; const names = [...db.objectStoreNames]; if (!names.length) { res('no document drawer'); return } const tx = db.transaction(names, 'readonly'); const out = []; let left = names.length; names.forEach(s => { const c = tx.objectStore(s).getAll(); c.onsuccess = () => { for (const v of c.result) out.push(`${v.name || v.id || '?'} (${v.type || ''}, ${v.size || (v.blob && v.blob.size) || (v.data && v.data.length) || '?'} bytes)`); if (!--left) res(out) }; c.onerror = () => { if (!--left) res(out) } }) }; rq.onerror = () => res('cannot open') } catch (e) { res('threw ' + e.message) } }))
  const rowDocs = async () => { await W2.inputsAll(p); return p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); if (!t) return { row: 'NOT LISTED' }; const b = [...t.querySelectorAll('button, a, [role=button]')].filter(e => /doc|clip|📎|attach/i.test((e.className || '') + (e.title || '') + (e.getAttribute('aria-label') || '') + e.innerText)).map(e => (e.title || e.getAttribute('aria-label') || e.className).slice(0, 80)); return { row: t.innerText.replace(/\s+/g, ' ').trim(), docControls: b } }, r.iid) }
  const before = await rowDocs(), store1 = await idb()
  const meta1 = await p.evaluate(i => { const x = window.INPUTS.find(q => q.iid === i); return x ? JSON.stringify(x.docs || x.doc || null) : null }, r.iid)
  /* open it through the row's own paperclip */
  const openDoc = async tag => { const clip = p.locator(`#inBody tr[data-iid="${r.iid}"] button, #inBody tr[data-iid="${r.iid}"] [role=button]`).filter({ has: p.locator('svg') }).first(); const any = p.locator(`#inBody tr[data-iid="${r.iid}"] [title*="ocument"], #inBody tr[data-iid="${r.iid}"] [aria-label*="ocument"]`).first(); const c = (await any.count()) ? any : clip; if (!(await c.count())) return 'no paperclip on the row'; await c.scrollIntoViewIfNeeded(); await c.click(); await L.sleep(700); const txt = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog], .modal, .docview, .docsheet, .airpop:not([hidden])')].filter(e => e.getClientRects().length); const s = d[d.length - 1]; if (!s) return 'nothing opened'; const fr = [...s.querySelectorAll('iframe, embed, object, img')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)}${e.getAttribute('type') ? ' ' + e.getAttribute('type') : ''}${e.getAttribute('title') ? ' "' + e.getAttribute('title') + '"' : ''}` }); return (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) + ' — the document drawn in it: ' + (fr.join(', ') || 'NOTHING') }); await pic(`C37vi-doc-${tag}`); await p.keyboard.press('Escape'); await L.sleep(300); return txt }
  const opened1 = await openDoc('02-document-opened')
  await L.reloadCompare(p, 'C37vi-doc reload', 'a', { page: 'inputs' })
  const after = await rowDocs(), store2 = await idb()
  const meta2 = await p.evaluate(i => { const x = window.INPUTS.find(q => q.iid === i); return x ? JSON.stringify(x.docs || x.doc || null) : null }, r.iid)
  const opened2 = await openDoc('03-after-reload-document-opened')
  const rl = reloadLine('C37vi-doc reload')
  C.row('C37-vi-d', 'Inputs: person Blade, type ATT C (a downchit), the form\'s Document field given a PDF "p7-c-cert.pdf", Tue 21 Jul, Add; the row\'s paperclip opened; reload; the paperclip again',
    `document field on the form: ${field ? 'yes' : 'NO'}; chips after choosing the file: ${JSON.stringify(chips)}; the form asked: ${JSON.stringify(r.asked)}; the row: "${before.row}", its document controls ${JSON.stringify(before.docControls)}; the paperclip opened: "${opened1}"; AFTER THE RELOAD the row: "${after.row}", controls ${JSON.stringify(after.docControls)}; the paperclip opened: "${opened2}"`,
    `the request's document note: ${meta1} → after the reload ${meta2}; the browser's document drawer: ${JSON.stringify(store1)} → after the reload ${JSON.stringify(store2)}; ${rl.text}`,
    field && r.iid && /drawn in it: (iframe|embed|object|img)/.test(opened1) && opened1 === opened2 && JSON.stringify(store1) === JSON.stringify(store2) && JSON.stringify(store1).includes('p7-c-cert.pdf') && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'doc: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- the Tracker: a ball's details, the chart order, a hidden chart */
if (want('tracker')) {
  const T = await import('./dbrA-W5-lib.mjs')
  const { browser, p, errors } = await world(L)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  let said = '', stored = '', ok = false
  try {
    await T.toTracker(p); await L.settle(p)
    const r0 = await L.rows(p)
    const charts0 = await T.opts(p, '#sylSel')
    const typedOn = String(await T.picked(p, '#sylSel')).replace(/ ✎$/, '')
    const ball = (await T.firstBalls(p, 1))[0]
    /* (1) details typed on a ball: ☰ Show All → Edit → Name → Save */
    await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await L.sleep(250)
    await p.fill('#saSearch', ball); await L.sleep(300)
    const srow = p.locator('#saBody .sarow').filter({ has: p.locator('.sid', { hasText: new RegExp('^' + ball.replace(/[()]/g, '\\$&') + '$') }) }).first()
    await srow.locator('button.sedit').click(); await L.sleep(250)
    const labels = await p.locator('.saedit label').allInnerTexts()
    await p.locator('.saedit label', { hasText: 'Name' }).locator('input, textarea').first().fill('P7 TYPED DETAIL')
    await pic('C37vi-trk-01-details-typed')
    await p.locator('.saedit .saedit-btns button.primary').click(); await L.sleep(500)
    const rowAfter = (await srow.innerText()).replace(/\s+/g, ' ').trim()
    await p.click('#saClose'); await L.sleep(250)
    /* (2) the chart list re-ordered: the last chart to the top */
    await T.menu(p, 'syl', 'ordSyl'); await p.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
    const n = (await T.ordRows(p)).length
    await T.ordMove(p, n - 1, 0)
    await pic('C37vi-trk-02-reorder-window')
    await p.click('#ordSave'); await L.sleep(500)
    const charts1 = await T.opts(p, '#sylSel')
    /* (3) a chart hidden: a built-in deleted (it stays restorable under Reorder) */
    const victim = charts1.map(s => s.replace(/ ✎$/, '')).find(s => s !== typedOn && s === '2024') || charts1.map(s => s.replace(/ ✎$/, '')).find(s => s !== typedOn)
    await T.pickFrom(p, '#sylSel', victim)
    await T.menu(p, 'syl', 'delSyl'); const q = await T.dlg(p, {}); await p.evaluate(() => window.__coreForTests.whenLoaded()); await L.sleep(400)
    const charts2 = await T.opts(p, '#sylSel')
    await L.settle(p)
    await pic('C37vi-trk-03-chart-hidden')
    const r1 = await L.rows(p); const d = L.diff(r0, r1)
    const rr = await T.trkReload(p, 'C37vi-trk reload')
    const charts3 = await T.opts(p, '#sylSel')
    await T.menu(p, 'syl', 'ordSyl'); await p.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
    const hidden = await T.ordHidden(p)
    await pic('C37vi-trk-04-after-reload-reorder-window')
    await p.keyboard.press('Escape'); await L.sleep(200); const cancel = p.locator('#ordCancel:visible, #ordModal button:has-text("Cancel"):visible').first(); if (await cancel.count()) await cancel.click().catch(() => {})
    await L.sleep(300)
    /* the typed detail, read back from Show All after the reload (on the chart it was typed on) */
    const firstChart = typedOn
    let detailBack = '(its chart is the hidden one)'
    if (charts3.map(s => s.replace(/ ✎$/, '')).includes(firstChart)) {
      await T.pickFrom(p, '#sylSel', firstChart)
      await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await L.sleep(250)
      await p.fill('#saSearch', ball); await L.sleep(300)
      detailBack = (await p.locator('#saBody .sarow').first().innerText()).replace(/\s+/g, ' ').trim().slice(0, 160)
      await pic('C37vi-trk-05-after-reload-detail')
      await p.click('#saClose'); await L.sleep(250)
    }
    const rl = reloadLine('C37vi-trk reload')
    said = `charts as shipped: [${charts0.join(', ')}]; the ball ${ball} on chart ${typedOn}: the editor's fields ${JSON.stringify(labels.map(s => s.replace(/\s+/g, ' ').trim().slice(0, 14)))}, its Show All row after Save: "${rowAfter.slice(0, 140)}"; after the re-order: [${charts1.join(', ')}]; the delete asked "${String(q).replace(/\s+/g, ' ').slice(0, 140)}"; after it: [${charts2.join(', ')}]; AFTER THE RELOAD: charts [${charts3.join(', ')}], the Reorder window lists as hidden/deleted ${JSON.stringify(hidden)}, the ball's Show All row: "${detailBack}"`
    stored = `rows written: ${d.put.filter(k => k.startsWith('tracker/')).slice(0, 8).join(', ')}; ${rl.text}`
    ok = rl.ok && JSON.stringify(charts2) === JSON.stringify(charts3) && /P7 TYPED DETAIL/.test(detailBack) && hidden.includes(victim)
  } catch (e) { said = 'THE STEP DID NOT RUN TO ITS END: ' + String(e && e.message || e).split('\n')[0].slice(0, 300) + ' — so far: ' + said; await pic('C37vi-trk-X-error').catch(() => {}) }
  C.row('C37-vi-e', 'Tracker: ☰ Show All → the first ball\'s Edit → Name "P7 TYPED DETAIL" → Save; Syllabus ✎ → ⇅ Reorder syllabi (the last chart to the top, Save order); Syllabus ✎ → 🗑 Delete syllabus on a built-in chart (it is hidden, restorable); reload', said, stored, ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'tracker: ' + e)); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
C.savePart('misc-' + PART, { errors: allErrors })
