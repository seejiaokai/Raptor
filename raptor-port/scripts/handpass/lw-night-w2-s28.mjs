// Walker 2 — scenarios 28, 29, 30: the member's own approved leave window, round 3's one row (D1354). usage: node lw-night-w2-s28.mjs <desk|phone|webkit> [28,29,30]
// The fixture (approved leaves on Ranger's row) is built ONCE as admin on a desktop context and walked from its saved storage at the size asked.
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, dayWindow, closeSheet, sleep, inputsOf, inputsOn, warRecs } = H
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone'
const engine = which === 'webkit' ? 'webkit' : 'chromium'
const ONLY = process.argv[3] ? new Set(process.argv[3].split(',')) : null
const tag = `s28-${which === 'desk' ? 'dk' : which === 'webkit' ? 'wk' : 'ph'}`
console.log('lw-night-w2-s28 v1', which, tag, ONLY ? [...ONLY].join(',') : 'all')
if (!ONLY) H.clearPics(tag)
H.KEEP.toasts = true
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const nv = n => `2026-11-${String(n).padStart(2, '0')}`
const ME = 'bane'
/* a real PNG (1 px) for "a picture added" */
const PNG = path.join(L.OUT, 'w2-pic.png')
writeFileSync(PNG, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'))

// ---------------- the fixture, once, as admin on a desktop chromium context
const fx = await L.newCtx('desk')
await H.signInAs(fx, 'admin')
const ids = await H.people(fx.page)
if (ids.Ranger !== ME) throw new Error('Ranger is not bane: ' + ids.Ranger)
for (const [iso, rm] of [[dd(14)], [dd(16)], [dd(18)], [dd(21)], [dd(23)], [dd(25)], [dd(28)], [dd(30), 'To empty'], [nv(25)], [nv(27)], [nv(16)], [nv(18)]]) await place(fx, ME, iso, 'LL', { approve: true, remarks: rm || null })
await place(fx, ME, nv(3), 'LL', { approve: true, range: [nv(3), nv(5)] })
const fxIn = (await inputsOf(fx.page, ME)).filter(i => i.from >= '2026-11-01').map(i => `${i.type} ${i.from.slice(5)}..${i.to.slice(5)}${i.lw ? '' : ' [inputs]'} "${i.remarks}"`)
console.log('fixture inputs', JSON.stringify(fxIn))
const STATE = await fx.ctx.storageState()
await fx.ctx.close()

// ---------------- the walk
const w = await H.ctxFrom(size, engine, STATE)
const P = w.page
await H.signInAs(w, 'member')
const shots = []
const snap = async (n, opts) => { await L.shot(w, `${tag}-${n}`, opts); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const run = id => !ONLY || ONLY.has(id)
const sc = async (id, fn) => { if (!run(id.replace(/[a-z].*$/, ''))) return; console.log(`-- ${id} [${which}]`); try { await fn() } catch (e) { rec(id, which, 'NOT DONE', String(e).slice(0, 400), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w) } }
const stored = async iso => { const i = (await inputsOn(P, ME, iso)).filter(x => /^(LL|OL|OIL|CCL|FCL|PL|EL|CL)$/.test(x.type)); return i.map(x => ({ remarks: x.remarks, till: x.till, docs: x.docs.length, span: `${x.from.slice(5)}..${x.to.slice(5)}`, lw: x.lw })) }
const geom = () => P.evaluate(() => {
  const r = s => document.querySelector(s)
  const b = e => { if (!e) return null; const x = e.getBoundingClientRect(); return { l: Math.round(x.left * 10) / 10, t: Math.round(x.top * 10) / 10, r: Math.round(x.right * 10) / 10, b: Math.round(x.bottom * 10) / 10, w: Math.round(x.width), h: Math.round(x.height) } }
  const sheet = r('[data-testid="remarks-sheet"]'); if (!sheet) return null
  const row = r('[data-testid="remarks-rmk-row"]'), ta = r('[data-testid="remarks-remarks"]'), tl = r('[data-testid="remarks-tl"]'), docRow = r('[data-testid="remarks-doc-row"]')
  const docBtn = docRow?.querySelector('button.docbtn') || docRow?.querySelector('button')
  const cs = ta && getComputedStyle(ta)
  const lum = c => { const m = (c || '').match(/\d+(\.\d+)?/g); return m ? Math.round((0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2])) : null }
  return { sheet: b(sheet), row: b(row), ta: b(ta), tl: b(tl), doc: b(docBtn), taBg: cs?.backgroundColor, taLum: lum(cs?.backgroundColor), labels: [...sheet.querySelectorAll('.lab')].map(e => e.innerText.trim()), save: !!r('[data-testid="remarks-save"]') || [...sheet.querySelectorAll('button')].some(x => /^save$/i.test(x.innerText.trim())), text: sheet.innerText.replace(/\s+/g, ' ').trim(), tillText: r('[data-testid="remarks-tilldate"]')?.innerText, tillChecked: r('[data-testid="remarks-till"]')?.checked, ph: ta?.placeholder, vp: [innerWidth, innerHeight], hasScroll: document.documentElement.scrollWidth > innerWidth + 1 }
})
const oneLine = g => g && g.ta && g.tl && g.doc && [g.tl, g.doc].every(e => (e.t + e.b) / 2 >= g.ta.t - 1 && (e.t + e.b) / 2 <= g.ta.b + 1) && g.row.h <= g.ta.h + 12
const openOwn = async (iso, q = null) => { await L.openCellR(w, ME, iso, q); let s = await H.sheetOf(P); for (let i = 0; i < 6 && s === 'nothing'; i++) { await sleep(w, 300); s = await H.sheetOf(P) } if (s !== 'remarks-sheet') { await snap(`open-${iso.slice(5)}-failed`).catch(() => {}); throw new Error(`${iso} opened ${s}`) } return s }
const val = () => P.locator(T('remarks-remarks')).inputValue()
const closeX = async (name = null) => { if (w.phone && name) await L.step(w, `${tag}-${name}`, T('remarks-cancel')); else { await L.press(w, T('remarks-cancel')); await sleep(w, 400) } }
const typeBox = async text => { await L.press(w, T('remarks-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.press('Delete'); if (text) await P.keyboard.type(text); await sleep(w, 200) }
const fmtS = a => JSON.stringify(a)

// ================= 28 =================
await sc('28', async () => {
  const iso = dd(14)
  await openOwn(iso, w.phone ? `${tag}-01-tap-q` : null)
  await sleep(w, 400)
  const g = await geom(); await snap('01-open')
  console.log('geom', JSON.stringify(g))
  const noLabels = !g.labels.includes('Remarks') && !g.labels.includes('Document') && !/\bRemarks\b/.test(g.text.replace(/Remarks$/, '').slice(0, 0)) // labels = .lab elements only
  const lightBox = g.taLum != null && g.taLum > 120
  rec('28a', which, oneLine(g) && !g.save && !lightBox && g.labels.length === 0 && g.tillChecked === true ? 'PASS' : 'FAIL',
    `the open window (${g.sheet.w} wide): row ${fmtS(g.row)}, box ${fmtS(g.ta)} (colour ${g.taBg}), till tick ${fmtS(g.tl)}, Document ${fmtS(g.doc)}; all on one line: ${oneLine(g)}; labels (.lab) in the window: ${fmtS(g.labels)}; a Save button: ${g.save}; the till reads "${g.tillText}", ticked ${g.tillChecked}; placeholder "${g.ph}"; the window text: "${g.text}"; the page scrolls sideways: ${g.hasScroll}`, [`${tag}-01-open`])
  await typeBox('At home, call me')
  const before = await stored(iso)
  await snap('02-typed')
  await P.keyboard.press('Enter'); await sleep(w, 500)
  const after = await stored(iso)
  const toast = await L.txt(P, '#toastEl, .toast')
  const sig = await P.evaluate(() => ({ active: document.activeElement?.tagName + '#' + (document.activeElement?.dataset?.testid || ''), statuses: [...document.querySelectorAll('[role=status],[aria-live]')].map(e => e.innerText.trim()).filter(Boolean), sheetOpen: !!document.querySelector('[data-testid="remarks-sheet"]'), sheetText: document.querySelector('[data-testid="remarks-sheet"]')?.innerText.replace(/\s+/g, ' ') }))
  await snap('03-after-enter')
  rec('28b', which, after[0]?.remarks === 'At home, call me' ? 'PASS' : 'FAIL', `typed "At home, call me" (saved before Enter: ${fmtS(before)}), Enter → saved: ${fmtS(after)}`, [`${tag}-02-typed`, `${tag}-03-after-enter`])
  rec('28c', which, 'RECORD', `what tells him it saved (lesson 3): right after Enter — toast "${toast}"; focus on ${sig.active}; live regions ${fmtS(sig.statuses)}; the window ${sig.sheetOpen ? 'stays open' : 'closed'}: "${sig.sheetText}"`, [`${tag}-03-after-enter`])
  await closeX('04-close')
  // reopen
  await openOwn(iso); const v = await val(); const g2 = await geom(); await snap('05-reopened')
  rec('28d', which, v === 'At home, call me' ? 'PASS' : 'FAIL', `reopened: the box reads "${v}", till "${g2.tillText}"`, [`${tag}-05-reopened`])
  await closeX()
  // the Inputs page
  const rows = await H.inputsPageRows(w, 'Ranger', `${tag}-06-inputs`)
  const row14 = rows.filter(r => /14 Dec/.test(r))
  rec('28e', which, row14.some(r => /At home, call me/.test(r)) ? 'PASS' : 'FAIL', `the Inputs page (Ranger): ${fmtS(row14.map(r => r.slice(0, 160)))}`, [`${tag}-06-inputs`])
  await H.toWar(w, 'member')
})

// ================= 29 =================
const check29 = async (id, iso, desc, want, extra = '') => {
  const st = await stored(iso)
  await openOwn(iso); const v = await val(); const g = await geom(); await snap(`${id}-reopened`)
  await closeSheet(w)
  rec(`29${id}`, which, st[0]?.remarks === want && v === want ? 'PASS' : 'FAIL', `${desc}: saved ${fmtS(st)}; reopened box "${v}" (want "${want}")${extra}`, [`${tag}-${id}-reopened`])
}
await sc('29a', async () => {
  const iso = dd(16); await openOwn(iso); await typeBox('title press words')
  await P.locator('[data-testid="remarks-sheet"] .bidsheet-hd .who').click().catch(() => {}); await sleep(w, 500)
  const mid = await stored(iso)
  await closeX(); await check29('a', iso, 'typed, then a press on the title (leaving the box); saved before closing: ' + fmtS(mid) + '; then ✕', 'title press words')
})
await sc('29b', async () => {
  const iso = dd(18); await openOwn(iso); await typeBox('closed by x'); await snap('b-typed'); await closeX('b-x'); await sleep(w, 400)
  await check29('b', iso, 'typed, then ✕', 'closed by x')
})
await sc('29c', async () => {
  const iso = dd(21); await openOwn(iso); await typeBox('closed by escape'); await snap('c-typed'); await P.keyboard.press('Escape'); await sleep(w, 500)
  const open = await H.sheetOf(P)
  await check29('c', iso, `typed, then Escape (window ${open === 'remarks-sheet' ? 'STAYED OPEN' : 'closed'})`, 'closed by escape')
})
await sc('29d', async () => {
  const iso = dd(23); await openOwn(iso); await typeBox('closed by outside tap'); await snap('d-typed')
  const x = w.phone ? 200 : 700, y = w.phone ? 60 : 60
  if (w.phone) await L.tapAt(w, x, y, `${tag}-d-tap-q`); else await P.mouse.click(x, y)
  await sleep(w, 600)
  const open = await H.sheetOf(P); await snap('d-after-tap')
  await check29('d', iso, `typed, then a tap outside at (${x}, ${y}) (window then: ${open})`, 'closed by outside tap')
})
await sc('29e', async () => {
  const iso = dd(25); await openOwn(iso)
  await P.locator('[data-testid="remarks-doc-row"] input[type=file]').first().setInputFiles(PNG); await sleep(w, 900)
  const st1 = await stored(iso)
  const g = await geom(); await snap('e-added')
  const chip = await P.locator('[data-testid="remarks-sheet"] .docchip').count()
  // the chip opens the viewer (D1292)
  const dom0 = await P.evaluate(() => document.body.children.length)
  await P.locator('[data-testid="remarks-sheet"] .docchip .docname').first().click().catch(() => {}); await sleep(w, 800)
  const viewer = await P.evaluate(() => { const v = [...document.querySelectorAll('[class*=viewer],[class*=docview],[data-testid*=viewer],[role=dialog]')].filter(e => e.getBoundingClientRect().height > 0 && !e.matches('[data-testid="remarks-sheet"]')).map(e => (e.dataset.testid || e.className).toString().slice(0, 40)); return v })
  await snap('e-viewer')
  await P.keyboard.press('Escape'); await sleep(w, 400)
  const stillSheet = (await H.sheetOf(P)) === 'remarks-sheet'
  rec('29e1', which, st1[0]?.docs === 1 && chip === 1 ? 'PASS' : 'FAIL', `a picture added: the chip count ${chip}; saved at once (before closing): ${fmtS(st1)}; the row now ${fmtS(g.row)} Document button ${fmtS(g.doc)} (one line: ${oneLine(g)}); the chip tapped opens: ${fmtS(viewer)} (window still open after Escape: ${stillSheet})`, [`${tag}-e-added`, `${tag}-e-viewer`])
  rec('29e-viewer', which, 'RECORD', `a tap on the chip's name opened ${viewer.length ? fmtS(viewer) : 'no viewer or dialog'} (the chip is a plain label with its ✕; D1292, ruled 24 Oct 26, says it opens the app's document viewer); Escape then ${stillSheet ? 'left the window open' : 'closed the window'}`, [`${tag}-e-viewer`])
  if (!stillSheet) await openOwn(iso)
  await P.locator('[data-testid="remarks-sheet"] .docchip .docdel').first().click(); await sleep(w, 700)
  const st2 = await stored(iso); await snap('e-removed')
  const chipsLeft = await P.locator('[data-testid="remarks-sheet"] .docchip').count(); const btnWord = await L.txt(P, '[data-testid="remarks-doc-row"] button.docbtn')
  rec('29e2', which, st2[0]?.docs === 0 && chipsLeft === 0 ? 'PASS' : 'FAIL', `its ✕: saved at once ${fmtS(st2)}; on screen the chips left: ${chipsLeft} and the button reads "${btnWord}" (a removed file should leave no chip and the button read Document)`, [`${tag}-e-removed`])
  await closeSheet(w); await openOwn(iso); const chipsAfter = await P.locator('[data-testid="remarks-sheet"] .docchip').count(); rec('29e3', which, 'RECORD', `the window reopened after the ✕: chips ${chipsAfter}`, [])
  await closeSheet(w)
})
await sc('29f', async () => {
  const iso = dd(28); await openOwn(iso)
  const scr = async () => { const g = await geom(); return { checked: g.tillChecked, text: g.tillText, struck: await P.evaluate(() => document.querySelector('[data-testid="remarks-tilldate"]')?.classList.contains('off')) } }
  const g0 = await scr()
  await L.press(w, T('remarks-till')); await sleep(w, 600)
  const st1 = await stored(iso); const g1 = await scr(); await snap('f-unticked')
  await L.press(w, T('remarks-till')); await sleep(w, 800)
  const st2 = await stored(iso); const g2 = await scr(); await snap('f-reticked-in-window')
  const inWinOk = g1.checked === false && g1.struck === true && st1[0]?.till === false && g2.checked === true && g2.struck === false && st2[0]?.till !== false
  rec('29f1', which, inWinOk ? 'PASS' : 'FAIL', `in one open window: start ${fmtS(g0)}; tick pressed → screen ${fmtS(g1)}, saved till ${fmtS(st1.map(x => x.till))}; tick pressed again → screen ${fmtS(g2)}, saved till ${fmtS(st2.map(x => x.till))}`, [`${tag}-f-unticked`, `${tag}-f-reticked-in-window`])
  /* the Inputs page prints no till for an unticked one */
  if (st2[0]?.till === false || g2.checked === false) { /* make it ticked again for the next step if the screen and the store disagree */ }
  await closeSheet(w); await openOwn(iso)
  const reopened = await scr(); const stR = await stored(iso)
  await L.press(w, T('remarks-till')); await sleep(w, 600)
  const stU = await stored(iso)
  await closeSheet(w)
  const rowsA = await H.inputsPageRows(w, 'Ranger', `${tag}-f-inputs-unticked`)
  const a = rowsA.filter(r => /28 Dec/.test(r)).map(r => r.slice(0, 120))
  await H.toWar(w, 'member'); await openOwn(iso)
  await L.press(w, T('remarks-till')); await sleep(w, 600)
  const stT = await stored(iso)
  await closeSheet(w)
  const rowsB = await H.inputsPageRows(w, 'Ranger', `${tag}-f-inputs-reticked`)
  const b = rowsB.filter(r => /28 Dec/.test(r)).map(r => r.slice(0, 120))
  await H.toWar(w, 'member')
  rec('29f2', which, stU[0]?.till === false && !/till/.test(a.join(' ')) && stT[0]?.till !== false && /till/.test(b.join(' ')) ? 'PASS' : 'FAIL', `reopened after the two presses the window reads ${fmtS(reopened)} (saved ${fmtS(stR.map(x => x.till))}); unticked: saved till ${fmtS(stU.map(x => x.till))}, the Inputs page row ${fmtS(a)}; ticked again: saved till ${fmtS(stT.map(x => x.till))}, the Inputs page row ${fmtS(b)}`, [`${tag}-f-inputs-unticked`, `${tag}-f-inputs-reticked`])
})
await sc('29g', async () => {
  const iso = dd(30); await openOwn(iso)
  const v0 = await val()
  await typeBox(''); await P.keyboard.press('Enter'); await sleep(w, 600)
  const st = await stored(iso); await snap('g-emptied')
  await closeSheet(w); await openOwn(iso); const v1 = await val(); await snap('g-reopened'); await closeSheet(w)
  rec('29g', which, v0 === 'To empty' && st[0]?.remarks === '' && v1 === '' ? 'PASS' : 'FAIL', `the box held "${v0}", emptied then Enter: saved ${fmtS(st)}; reopened "${v1}"`, [`${tag}-g-emptied`, `${tag}-g-reopened`])
})
await sc('29h', async () => {
  const long = Array.from({ length: 40 }, (_, i) => 'word' + String(i + 1).padStart(2, '0')).join(' ').slice(0, 199) + 'z'   // exactly 200 chars, the last not a space
  const big = Array.from({ length: 40 }, (_, i) => 'w' + String(i + 1).padStart(3, '0') + 'xx').join(' ').slice(0, 250)   // 250 chars pasted (200 are kept)
  const iso = nv(25); await openOwn(iso)
  await L.press(w, T('remarks-remarks')); await P.keyboard.insertText(long); await sleep(w, 400)
  const g = await geom(); const lines = await P.evaluate(() => { const t = document.querySelector('[data-testid="remarks-remarks"]'); return { sh: t.scrollHeight, ch: t.clientHeight, lh: parseFloat(getComputedStyle(t).lineHeight) || 0 } })
  await snap('h-200')
  await P.keyboard.press('Enter'); await sleep(w, 500)
  const st = await stored(iso)
  await closeSheet(w); await openOwn(iso); const v = await val(); await snap('h-200-reopened'); await closeSheet(w)
  rec('29h1', which, st[0]?.remarks === long && v === long && lines.sh <= lines.ch + 1 ? 'PASS' : 'FAIL', `200 characters typed: the box ${g.ta.w} × ${g.ta.h} (scrollHeight ${lines.sh}, clientHeight ${lines.ch}, line ${lines.lh}) shows all of it: ${lines.sh <= lines.ch + 1}; saved length ${st[0]?.remarks?.length}; reopened length ${v.length}; the row ${fmtS(g.row)}, Document ${fmtS(g.doc)}`, [`${tag}-h-200`, `${tag}-h-200-reopened`])
  const iso2 = nv(27); await openOwn(iso2)
  await L.press(w, T('remarks-remarks')); await P.keyboard.insertText(big); await sleep(w, 400)
  const typedLen = (await val()).length
  await snap('h-250')
  await P.keyboard.press('Enter'); await sleep(w, 500)
  const st2 = await stored(iso2)
  await closeSheet(w); await openOwn(iso2); const v2 = await val(); await closeSheet(w)
  rec('29h2', which, typedLen === 200 && st2[0]?.remarks?.length === 200 && v2.length === 200 ? 'PASS' : 'FAIL', `250 characters pasted: the box kept ${typedLen}; saved length ${st2[0]?.remarks?.length}; reopened length ${v2.length}; the kept text is the first 200 of what was pasted: ${v2 === big.slice(0, 200)}`, [`${tag}-h-250`])
})
await sc('29i', async () => {
  // the keyboard's Done (leaving the box) and return (Enter) — on the iPhone engine a tap elsewhere in the window / the Enter key
  const iso = dd(16)
  await openOwn(iso); await typeBox('done press')
  /* the on-screen keyboard's Done blurs the box: blur() is that, as the engine sees it */
  await P.evaluate(() => document.activeElement?.blur()); await sleep(w, 500)
  const s1 = await stored(iso)
  await snap('i-blurred')
  await typeBox('return press'); await P.keyboard.press('Enter'); await sleep(w, 500)
  const s2 = await stored(iso)
  await closeSheet(w)
  rec('29i', which, s1[0]?.remarks === 'done press' && s2[0]?.remarks === 'return press' ? 'PASS' : 'FAIL', `${which}: the box left (what the keyboard's Done does): saved ${fmtS(s1)}; then typed and the Return key: saved ${fmtS(s2)}`, [`${tag}-i-blurred`])
})

// ================= 30 =================
await sc('30', async () => {
  // two approved leaves 16 and 18 Nov: open 16, type "A words", no Enter, tap 18 Nov on the grid behind
  const a = nv(16), b = nv(18)
  await openOwn(a); await typeBox('A words'); await snap('a-typed')
  await L.reachCell(w, ME, b)
  const bb = await P.locator(T(L.cellId(ME, b))).first().boundingBox()
  const vis = bb && bb.y >= 0 && bb.y + bb.height <= (w.phone ? 874 : 900)
  const covered = await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-testid]')?.dataset.testid || e.className || e.tagName) : null }, [bb.x + bb.width / 2, bb.y + bb.height / 2])
  if (w.phone) await L.tapAt(w, bb.x + bb.width / 2, bb.y + bb.height / 2, `${tag}-30-tap-q`); else await P.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
  await sleep(w, 800)
  const sheet = await H.sheetOf(P)
  const win = sheet === 'remarks-sheet' ? { remarks: await val(), who: await L.txt(P, '[data-testid="remarks-sheet"] .dt') } : { sheet }
  await snap('30-tapped-window')
  /* the first tap only closed the first window (a scrim); a second tap on the same day opens its own window */
  let win2 = null
  if (sheet !== 'remarks-sheet') { await L.openCellR(w, ME, b); const s2 = await H.sheetOf(P); win2 = s2 === 'remarks-sheet' ? { sheet: s2, remarks: await val(), who: await L.txt(P, '[data-testid="remarks-sheet"] .dt') } : { sheet: s2 }; await snap('30-second-tap-window') }
  await closeSheet(w)
  const sa = await stored(a), sb = await stored(b)
  rec('30a', which, sa[0]?.remarks === 'A words' && !/A words/.test(sb[0]?.remarks ?? '') && (sheet !== 'remarks-sheet' || win.remarks !== 'A words') ? 'PASS' : 'FAIL', `"A words" typed on ${a} (no Enter), then a tap on the grid at ${b} (the element at that point: ${covered}; cell in view: ${vis}): the window then is ${sheet} ${fmtS(win)}; saved ${a}: ${fmtS(sa)}; saved ${b}: ${fmtS(sb)}; a second tap on ${b} then opens: ${fmtS(win2)}`, [`${tag}-a-typed`].concat(w.phone ? [`${tag}-30-tap-q`] : []).concat([`${tag}-30-tapped-window`, `${tag}-30-second-tap-window`]))
  // the approved run Nov 3–5: type on the 4th
  const run = [nv(3), nv(4), nv(5)]
  await openOwn(run[1]); const before = await val(); await typeBox('run note'); await P.keyboard.press('Enter'); await sleep(w, 500); await snap('30-run-typed'); await closeSheet(w)
  const sr = []; for (const d of run) sr.push(await stored(d))
  const win3 = await dayWindow(w, ME, run[0]); await closeSheet(w)
  const win5 = await dayWindow(w, ME, run[2]); await closeSheet(w)
  rec('30b', which, sr.every(x => x.length === 1 && x[0].remarks === 'run note') && sr[0][0].span === sr[2][0].span ? 'PASS' : 'FAIL', `the approved run 3–5 Nov (box held "${before}"), typed "run note" on 4 Nov: saved on each day ${fmtS(sr)}; 3 Nov's window reads "${win3.remarks}", 5 Nov's "${win5.remarks}"`, [`${tag}-30-run-typed`])
})
rec('28-30-errors', which, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag + (ONLY ? '-' + [...ONLY].join('') : ''))
await w.ctx.close()
await H.finish()
