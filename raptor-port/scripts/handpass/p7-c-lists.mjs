/* [DB-READINESS] phase 7 walk — walker C, C37 (i)–(iv): THE STORED LISTS, each emptied or filled through its own editor,
   then a reload, then a LOOK. What right looks like after this phase:
   (i)(ii)(iii) a list emptied on purpose is STILL EMPTY after a reload (before, the standard entries came back);
   (iv) the Leave War's counter form refuses a counter past 60 with its own sentence and a dead Add button, and a reload
   keeps every counter. One fresh world per list (P7_PART = stores | cx | quals | counters | all). */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const PART = process.env.P7_PART || 'all'
const want = k => PART === 'all' || PART === k
const allErrors = []
const changed = (a, b) => { const d = L.diff(a, b); return [...d.put, ...d.del.map(k => 'DEL ' + k)].filter(k => !/^settings\/elog:/.test(k)) }
const reloadLine = id => { const rr = L.results.filter(r => r.name.startsWith(id + ' ')); return { ok: rr.every(r => r.ok), text: rr.map(r => (r.ok ? 'ok: ' : 'FAIL: ') + r.name.split('— ')[1] + (r.ok ? '' : ' ' + r.detail)).join(' · ') } }

/* ---------------------------------------------------------------- (i) the stores list */
if (want('stores')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  await W.boardOn(p, 1)
  const openMenu = async () => { const cfg = p.locator('#schedBoard [data-stcfg]:visible').first(); await cfg.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await cfg.click(); await L.sleep(400) }
  const chips = () => p.evaluate(() => [...document.querySelectorAll('.stmenu [data-cfg]')].map(e => e.innerText.trim()))
  const r0 = await L.rows(p)
  await openMenu()
  const before = await chips()
  await pic('C37i-01-stores-as-shipped')
  await p.locator('.stmenu .st-pen').click(); await L.sleep(300)
  let n = 0
  while (await p.locator('.stmenu .st-del').count()) { await p.locator('.stmenu .st-del').first().click(); await L.sleep(250); if (++n > 40) break }
  const editorText = await p.evaluate(() => (document.querySelector('.stmenu') || {}).innerText || '')
  await pic('C37i-02-every-store-removed')
  await p.locator('.stmenu .st-pen').click(); await L.sleep(300)
  const afterDone = await chips()
  const jets = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-store]')].filter(e => e.offsetParent !== null).slice(0, 6).map(e => e.dataset.store + ':' + (e.innerText || '').trim()))
  await pic('C37i-03-menu-with-no-stores')
  await p.keyboard.press('Escape'); await L.sleep(300); await p.mouse.click(700, 300); await L.sleep(200)
  await L.settle(p)
  const r1 = await L.rows(p); const wrote = changed(r0, r1)
  const storedVal = wrote.filter(k => !k.startsWith('DEL ')).map(k => k + ' = ' + String(r1[k]).slice(0, 160))
  await W.boardOff(p)
  await L.reloadCompare(p, 'C37i reload', 'a', { page: 'editsched' }); await C.toastSpy(p)
  await W.boardOn(p, 1); await openMenu()
  const afterReload = await chips()
  await pic('C37i-04-after-reload')
  const penThere = await p.locator('.stmenu .st-pen').count()
  /* put one back through the editor's own Add (it has no Reset) */
  let addBack = 'no pencil'
  if (penThere) { await p.locator('.stmenu .st-pen').click(); await L.sleep(250); await p.locator('.stmenu .st-new').fill('TPOD'); await p.locator('.stmenu .st-add').click(); await L.sleep(300); await p.locator('.stmenu .st-pen').click(); await L.sleep(250); addBack = (await chips()).join(', ') }
  await pic('C37i-05-one-added-back')
  const rl = reloadLine('C37i reload')
  C.row('C37-i', 'board, Tuesday: a jet\'s "C / Config…" → Stores configuration → ✎ → ✕ on every store → ✎ (done) → reload → the same menu again',
    `shipped list: [${before.join(', ')}] (${before.length}); after ${n} removals the editor read: "${editorText.replace(/\s+/g, ' ').slice(0, 160)}"; the menu then offered [${afterDone.join(', ')}]; the jets that carried a store still print it: ${JSON.stringify(jets).slice(0, 200)}; AFTER THE RELOAD the menu offers: [${afterReload.join(', ')}] (${afterReload.length}); the editor's Add put back: [${addBack}] (this editor has no Reset)`,
    `rows written by the removals: ${storedVal.join(' ; ') || '(none)'}; ${rl.text}`, afterReload.length === 0 && afterDone.length === 0 && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'stores: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- (ii) the cancel-reason list */
if (want('cx')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  await W.boardOn(p, 1)
  const openCx = async () => { const b = p.locator('#schedBoard button.mbtn:visible').filter({ hasText: /^CX$/ }).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await b.click(); await L.sleep(400); return p.locator('#cxPop:not([hidden])').count() }
  const reasons = () => p.evaluate(() => [...document.querySelectorAll('#cxQuick [data-cxq]')].map(e => e.innerText.trim()))
  const r0 = await L.rows(p)
  const opened = await openCx()
  const title = await p.locator('#cxTitle').innerText().catch(() => '')
  const before = await reasons()
  await pic('C37ii-01-cx-sheet-as-shipped')
  await p.locator('[data-cxedit]').click(); await L.sleep(300)
  let n = 0
  while (await p.locator('#cxEdit [data-cxdel]').count()) { await p.locator('#cxEdit [data-cxdel]').first().click(); await L.sleep(250); if (++n > 40) break }
  const emptyWords = await p.locator('#cxEdit .cxedit-empty').innerText().catch(() => '(no empty line)')
  await pic('C37ii-02-every-reason-removed')
  await p.locator('[data-cxdone]').click(); await L.sleep(300)
  const afterDone = await reasons()
  await p.locator('#cxClose').click(); await L.sleep(300)
  await L.settle(p)
  const r1 = await L.rows(p); const wrote = changed(r0, r1)
  const storedVal = wrote.filter(k => !k.startsWith('DEL ')).map(k => k + ' = ' + String(r1[k]).slice(0, 160))
  await W.boardOff(p)
  await L.reloadCompare(p, 'C37ii reload', 'a', { page: 'editsched' }); await C.toastSpy(p)
  await W.boardOn(p, 1); await openCx()
  const afterReload = await reasons()
  await pic('C37ii-03-after-reload')
  /* put the standard set back with the editor's own Reset (two taps) */
  await p.locator('[data-cxedit]').click(); await L.sleep(300)
  const rs = p.locator('[data-cxreset]'); const rsWords = [await rs.innerText()]
  await rs.click(); await L.sleep(250); rsWords.push(await rs.innerText()); await rs.click(); await L.sleep(300)
  await p.locator('[data-cxdone]').click(); await L.sleep(300)
  const afterReset = await reasons()
  await pic('C37ii-04-reset-to-standard')
  await p.locator('#cxClose').click(); await L.sleep(300)
  const rl = reloadLine('C37ii reload')
  C.row('C37-ii', `board, Tuesday: CX on the first flying line (the sheet "${title}", ${opened ? 'opened' : 'DID NOT OPEN'}) → ✎ Edit → ✕ on every reason → Done → ✕ (the line is NOT cancelled) → reload → the sheet again → Reset to standard (two taps)`,
    `shipped quick reasons: [${before.join(', ')}] (${before.length}); after ${n} removals the editor said "${emptyWords}"; the sheet then offered [${afterDone.join(', ')}]; AFTER THE RELOAD it offers [${afterReload.join(', ')}] (${afterReload.length}); Reset ("${rsWords.join('" → "')}") brought back [${afterReset.join(', ')}]`,
    `rows written by the removals: ${storedVal.join(' ; ') || '(none)'}; ${rl.text}`, afterReload.length === 0 && afterDone.length === 0 && afterReset.length === before.length && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'cx: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- (iii) the Quals page's qualification columns */
if (want('quals')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  await L.go(p, 'quals'); await L.sleep(500)
  /* the qualification headings, read the same way with editing on or off: every heading that is not one of the page's
     five fixed ones */
  const cols = () => p.evaluate(() => [...document.querySelectorAll('#qtbl thead th')].map(e => ((e.querySelector('.qlbl') || e).innerText || '').replace(/[⋮✕▲▼]/g, '').trim().toUpperCase()).filter(t => t && !['CALLSIGN/NAME', 'INITIALS', 'FLIGHT', 'CAT', 'REMARKS'].includes(t)))
  const r0 = await L.rows(p)
  const before = await cols()
  await p.click('#qEdit'); await L.sleep(300); await p.click('#qEditQuals'); await L.sleep(400)
  await pic('C37iii-01-edit-quals-as-shipped')
  const keys = await p.evaluate(() => [...document.querySelectorAll('#qtbl thead th.qcol')].map(e => e.dataset.col))
  const asked = []
  for (const k of keys) {
    for (let t = 0; t < 3; t++) {
      const x = p.locator(`#qtbl thead .qdel[data-del="${k}"]`).first()
      if (!(await x.count())) break
      await C.toasts(p)
      await x.click(); await L.sleep(350)
      const still = await p.locator(`#qtbl thead th.qcol[data-col="${k}"]`).count()
      const ts = await C.toasts(p)
      const xNow = still ? await p.locator(`#qtbl thead .qdel[data-del="${k}"]`).first().evaluate(e => (e.getAttribute('title') || '') + ' | ' + e.className + ' | ' + e.innerText).catch(() => '') : ''
      const dlg = await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .airpop:not([hidden]), .modal, .qconf')].filter(e => e.getClientRects().length).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 200)))
      if (still) { asked.push({ col: k, tap: t + 1, toast: ts, x: xNow, dialog: dlg }); if (t === 0 && asked.length === 1) await pic('C37iii-02-a-wired-column-asks-again') }
      if (dlg.length) { const yes = p.locator('[role=dialog] button, .airpop:not([hidden]) button').filter({ hasText: /Remove|Yes|Delete|Confirm/ }).first(); if (await yes.count()) { await yes.click(); await L.sleep(300) } }
    }
  }
  const afterRemove = await cols()
  await pic('C37iii-03-every-column-removed')
  const saveWords = await p.locator('#qSave').innerText().catch(() => '(no Save button)')
  await p.click('#qEditQuals').catch(() => {}); await L.sleep(300)
  await p.locator('#qSave').click({ timeout: 4000 }).catch(() => {}); await L.sleep(600)
  const saveToast = await C.toasts(p)
  await L.settle(p)
  const r1 = await L.rows(p); const wrote = changed(r0, r1)
  const storedVal = wrote.filter(k => !k.startsWith('DEL ') && /qual/i.test(k)).map(k => k + ' = ' + String(r1[k]).slice(0, 160))
  await L.reloadCompare(p, 'C37iii reload', 'a', { page: 'quals' }); await C.toastSpy(p)
  await L.sleep(400)
  const afterReload = await cols()
  await pic('C37iii-04-after-reload')
  /* this editor has no Reset: one column added back through its own Add */
  await p.click('#qEdit'); await L.sleep(300); await p.click('#qEditQuals'); await L.sleep(400)
  const addIn = p.locator('input[placeholder*="LOW LEVEL"]').first()
  let addBack = 'no Add box'
  if (await addIn.count()) { await addIn.fill('NVG'); await p.locator('button:visible', { hasText: /^Add$/ }).first().click(); await L.sleep(400); addBack = (await cols()).join(', ') }
  await pic('C37iii-05-one-added-back')
  const rl = reloadLine('C37iii reload')
  C.row('C37-iii', 'Quals → Enable editing → Edit quals → ✕ on every qualification column (a second tap where the column asked again) → Save changes → reload → Quals',
    `shipped columns: [${before.join(', ')}] (${before.length}); columns that did not go on the first tap: ${asked.length ? asked.map(a => `${a.col} (tap ${a.tap}: toast ${JSON.stringify(a.toast)}${a.dialog.length ? ', dialog ' + JSON.stringify(a.dialog) : ''}${a.x ? ', the ✕ now reads "' + a.x + '"' : ''})`).join('; ') : 'none'}; after the removals: [${afterRemove.join(', ')}]; the save button read "${saveWords}", toast ${JSON.stringify(saveToast)}; AFTER THE RELOAD the page shows [${afterReload.join(', ')}] (${afterReload.length}) qualification columns; its Add put back: [${addBack}] (this editor has no Reset)`,
    `rows written: ${storedVal.join(' ; ') || wrote.slice(0, 6).join(', ') || '(none)'}; ${rl.text}`, afterReload.length === 0 && afterRemove.length === 0 && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'quals: ' + e)); await browser.close()
}

/* ---------------------------------------------------------------- (iv) the Leave War's counters, to the limit */
if (want('counters')) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  const pics = []; const pic = async n => { await L.shot(p, n); pics.push(n + '.png') }
  await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800)
  const onGrid = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^="manning-info-"]')].map(e => e.innerText.trim()))
  const stored = () => p.evaluate(() => { const out = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!/^raptor:leavewar\//.test(k)) continue; const v = localStorage.getItem(k); if (/manningdefs|counter/i.test(k)) { try { const j = JSON.parse(v); out[k.slice(7)] = Array.isArray(j) ? j.length : (j && Array.isArray(j.value) ? j.value.length : (j && typeof j === 'object' ? Object.keys(j).length : String(v).length)) } catch (e) { out[k.slice(7)] = 'unparsed' } } } return out })
  const r0 = await L.rows(p)
  const g0 = await onGrid()
  const openForm = async () => {
    if (!(await p.locator('[data-testid="settings-sheet"]:visible').count())) { await p.click('[data-testid="settings-open"]'); await L.sleep(350) }
    const add = p.locator('[data-testid="counter-add"]')
    const st = { disabled: await add.isDisabled(), title: await add.getAttribute('title'), words: (await add.innerText()).trim() }
    if (!st.disabled) { await add.click(); await L.sleep(300) }
    return st
  }
  let added = 0, full = null, guard = 0
  while (guard++ < 80) {
    const st = await openForm()
    const form = p.locator('[data-testid="counter-form"]:visible')
    const formText = (await form.count()) ? (await form.innerText()).replace(/\s+/g, ' ') : ''
    const sheetText = (await p.locator('[data-testid="settings-sheet"]:visible').count()) ? await p.locator('[data-testid="settings-sheet"]:visible').innerText() : ''
    if (/60 counters is the most/.test(formText + ' ' + sheetText) || st.disabled) {
      const save = p.locator('[data-testid="cform-save"]')
      const name = p.locator('[data-testid="cform-name"]')
      if (await name.count()) { await name.fill('ONE TOO MANY'); await L.sleep(200) }
      full = { where: /60 counters is the most/.test(formText) ? 'in the counter form' : /60 counters is the most/.test(sheetText) ? 'on the Settings sheet' : 'nowhere', sentence: ((formText + ' ' + sheetText).match(/60 counters is the most[^.]*\.[^.]*\./) || [''])[0], addCounterButton: st, formAddDisabledWithAName: (await save.count()) ? await save.isDisabled() : '(no form)', formAddWords: (await save.count()) ? (await save.innerText()).trim() : '' }
      break
    }
    await p.locator('[data-testid="cform-name"]').fill('P7 C' + String(added + 1).padStart(2, '0'))
    await L.sleep(80)
    const save = p.locator('[data-testid="cform-save"]')
    if (await save.isDisabled()) { await p.locator('[data-testid="cf-seat-pilot"]').click(); await L.sleep(80) }
    if (await save.isDisabled()) { full = { where: 'the form\'s Add stayed disabled with a name and a pick', formText: formText.slice(0, 300) }; break }
    await save.click(); await L.sleep(220); added++
    if (added === 1) { await pic('C37iv-01-first-counter-added') }
  }
  await pic('C37iv-02-the-list-is-full')
  const fullToasts = await C.toasts(p)
  for (let i = 0; i < 3; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } }
  await L.settle(p)
  const g1 = await onGrid(), s1 = await stored()
  const r1 = await L.rows(p); const wrote = changed(r0, r1).filter(k => /manningdefs|counter/i.test(k))
  await pic('C37iv-03-grid-with-every-counter')
  await L.reloadCompare(p, 'C37iv reload', 'a', { page: 'leavewar' }); await C.toastSpy(p)
  await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(900)
  const g2 = await onGrid(), s2 = await stored()
  await pic('C37iv-04-after-reload')
  const st2 = await openForm()
  const form2 = (await p.locator('[data-testid="counter-form"]:visible').count()) ? await p.locator('[data-testid="counter-form"]:visible').innerText() : ''
  await pic('C37iv-05-after-reload-still-full')
  const lost = g1.filter(x => !g2.includes(x))
  const rl = reloadLine('C37iv reload')
  C.row('C37-iv', 'Leave War → ⚙ Settings → ＋ Counter, a name typed and Add counter pressed, again and again through the form until it refused; then a reload',
    `counters on the grid before: ${g0.length}; added through the form: ${added}; at the limit: ${JSON.stringify(full)}; toasts ${JSON.stringify(fullToasts.slice(-3))}; counters on the grid at the limit: ${g1.length}; AFTER THE RELOAD: ${g2.length} (missing: ${lost.length ? lost.join(', ') : 'none'}); the form after the reload: Add-counter button ${JSON.stringify(st2)}, form says "${form2.replace(/\s+/g, ' ').match(/60 counters[^.]*\.[^.]*\./) || ''}"`,
    `stored counters row(s) at the limit: ${JSON.stringify(s1)}; after the reload: ${JSON.stringify(s2)}; rows written: ${wrote.join(', ')}; ${rl.text}`,
    full && /60 counters is the most the app keeps\. Delete one to add another\./.test(full.sentence || '') && full.formAddDisabledWithAName === true && g1.length === 60 && g2.length === 60 && !lost.length && rl.ok ? 'PASS' : 'FAIL', pics)
  allErrors.push(...errors.map(e => 'counters: ' + e)); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
C.savePart('lists-' + PART, { errors: allErrors })
