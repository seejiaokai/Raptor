// shr-c-c1 v1 — Share C, C1: THE MEMBER'S OWN WINDOW (Astra S01, Opus S6, Fable S4). The fixture leave (LL, Ranger + Hex,
// 08:00–10:00) over Mon 13 – Wed 15 Jul 26, filed by the admin on the Inputs page's own window. Ranger signed in (same tab):
// his own Tuesday cell → the remark typed and left; typed again (Enter); a document added (Chromium only); the till ticked;
// the remark changed; ✕; reopened. Then Hex signed in: his Tuesday cell. Then the admin: the Inputs page and the bell.
// EXPECTED: all of it on Ranger's own leave; the box shows what he typed after every step; Hex's window empty, his leave
// untouched; two leaves on the Inputs page. RECORD who the bell tells on the first save.
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 SZ=phone|desk ENG=chromium|webkit node scripts/handpass/shr-c-c1.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = process.env.SZ || 'phone', ENG = process.env.ENG || 'chromium', tg = `${SZ}-${ENG}`
console.log('shr-c-c1 v1', tg, L.OUT)
const w = await C.world(SZ, ENG)
const P = w.page
const DAYS = ['Jul 13', 'Jul 14', 'Jul 15']
const TUE = '2026-07-14'
const BOX = T('remarks-remarks'), WIN = T('remarks-sheet')
const steps = []
const read = async label => {
  const s = {
    step: label, store: await C.store(P, ['bane', 'rocky'], DAYS),
    box: await C.valueOf(P, BOX), boxAttrs: await P.evaluate(sel => { const e = document.querySelector(sel); return e ? [...e.attributes].filter(a => /^data-|^id$|^name$/.test(a.name)).map(a => `${a.name}=${a.value}`).join(' ') : null }, BOX),
    till: await P.evaluate(() => { const e = document.querySelector('[data-testid="remarks-till"]'); return e ? (e.checked ?? e.getAttribute('aria-checked') ?? e.getAttribute('aria-pressed')) : null }),
    docs: await P.evaluate(() => [...document.querySelectorAll('[data-testid="remarks-doc-row"] .docchip, [data-testid="remarks-doc-row"] [data-testid*="doc"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText || e.dataset.testid).replace(/\s+/g, ' ').trim()).slice(0, 6)),
    caret: await C.active(P), win: await C.vis(P, WIN), note: await L.shownToast(P),
  }
  steps.push(s); console.log('STEP', J(s)); return s
}
const shot = async name => C.pic(w, `c1-${tg}-${name}`, [WIN], 14)
const caretAround = async (label, fn) => { const b = await C.active(P); await fn(); const a = await C.active(P); console.log(`CARET ${label}: before ${b} after ${a}`); return `${b} → ${a}` }
const pics = []
try {
  /* the fixture, by the admin */
  await C.signIn(w, 'ad')
  const iid = await C.fileRange(w, 'c1', '2026-07-13', '2026-07-15')
  const f0 = await C.store(P, ['bane', 'rocky'], DAYS)
  console.log('FIXTURE', iid, J(f0))
  if (!iid || !f0.some(s => s.startsWith('Ranger+Hex LL Jul 13–Jul 15 480-600'))) throw new Error('fixture did not land: ' + J(f0))
  /* Ranger, same tab */
  await C.signOutIn(w, 'us')
  await C.toWar(w)
  const reach = await C.reachCell(w, 'bane', TUE)
  console.log('WAR reached', J(reach), 'Ranger cell', J(await C.cellSays(P, 'bane', TUE)), 'Hex cell', J(await C.cellSays(P, 'rocky', TUE)))
  await C.openCell(w, 'bane', TUE, w.phone ? `c1-${tg}-01-open-q` : null)
  const sh = await C.sheet(P)
  console.log('WINDOW', J(sh))
  if (!(await C.vis(P, WIN))) throw new Error('the member window did not open: ' + J(sh))
  pics.push(await shot('01-opened')); await read('opened')
  /* 1: "Dental", left by a tap on the window's own heading (outside the box, the window stays) */
  await C.typeInto(w, BOX, 'Dental')
  await read('typed Dental (caret in box)')
  console.log('LEFT at', J(await C.leaveBox(w, WIN, w.phone ? `c1-${tg}-02-left-q` : null)))
  const s1 = await read('save 1: Dental, box left by a tap on the heading'); pics.push(await shot('02-save1'))
  /* 2: "Dental then gym", Enter */
  await C.typeInto(w, BOX, 'Dental then gym'); await P.keyboard.press('Enter'); await sleep(700)
  const s2 = await read('save 2: Dental then gym, Enter'); pics.push(await shot('03-save2'))
  /* 3: a document (Chromium only — the test WebKit keeps no file) */
  let s3 = null
  if (ENG === 'chromium') {
    const docBtn = await P.evaluate(() => { const r = document.querySelector('[data-testid="remarks-doc-row"]'); const b = r && [...r.querySelectorAll('button, label')].find(b => b.getBoundingClientRect().width > 0 && /Document|\+|Add/i.test(b.innerText || b.getAttribute('aria-label') || '')); return b ? (b.dataset.testid || b.innerText.trim()) : null })
    console.log('DOC button', docBtn)
    let viaChooser = false
    try {
      const fcP = P.waitForEvent('filechooser', { timeout: 3000 })
      await caretAround('Document tapped', async () => { await C.press(w, `${T('remarks-doc-row')} button, ${T('remarks-doc-row')} label`, w.phone ? `c1-${tg}-04-doc-q` : null) })
      const fc = await fcP; await fc.setFiles(C.pdfPath('c1-dental-note.pdf')); viaChooser = true
    } catch (e) { console.log('no file chooser (' + String(e).slice(0, 80) + ') — the file set on the row\'s input'); await P.locator(`${T('remarks-doc-row')} input[type=file]`).first().setInputFiles(C.pdfPath('c1-dental-note.pdf')) }
    await sleep(1200); await L.answerAsks(w)
    s3 = await read(`save 3: a document added (${viaChooser ? 'the Document button\'s own file chooser' : 'the row\'s file input'})`); pics.push(await shot('04-save3-doc'))
  }
  /* 4: the till ticked */
  const tillWas = steps.at(-1).till
  const cr = await caretAround('till tapped', async () => C.press(w, T('remarks-till'), w.phone ? `c1-${tg}-05-till-q` : null))
  await sleep(700)
  const s4 = await read(`save 4: the till tapped (was ${tillWas})`); pics.push(await shot('05-save4-till'))
  /* 5: the remark changed, left by a tap on the heading */
  await C.typeInto(w, BOX, 'Dental pm')
  console.log('LEFT at', J(await C.leaveBox(w, WIN, w.phone ? `c1-${tg}-06-left-q` : null)))
  const s5 = await read('save 5: Dental pm, left'); pics.push(await shot('06-save5'))
  /* close by ✕, reopen */
  await C.press(w, T('remarks-cancel'), w.phone ? `c1-${tg}-07-close-q` : null); await sleep(600)
  const sc = await read('closed by ✕')
  pics.push(await C.pic(w, `c1-${tg}-07-grid-after-close`, [T(`cell-bane-${TUE}`), T(`cell-rocky-${TUE}`)], 60))
  await C.openCell(w, 'bane', TUE, w.phone ? `c1-${tg}-08-reopen-q` : null)
  const sr = await read('reopened'); pics.push(await shot('08-reopened'))
  await C.closeAny(w)
  /* Hex, same tab */
  await C.signOutIn(w, 'hex')
  await C.toWar(w)
  await C.reachCell(w, 'rocky', TUE)
  await C.openCell(w, 'rocky', TUE, w.phone ? `c1-${tg}-09-hex-q` : null)
  const hsh = await C.sheet(P)
  const hx = { sheet: hsh?.id, text: hsh?.text, box: await C.valueOf(P, BOX), till: await P.evaluate(() => document.querySelector('[data-testid="remarks-till"]')?.checked ?? null), store: await C.store(P, ['bane', 'rocky'], DAYS) }
  console.log('HEX', J(hx)); pics.push(await shot('09-hex-window'))
  await C.closeAny(w)
  const hexBell = await C.bellLines(w)
  console.log('HEX BELL', J(hexBell)); pics.push(await C.pic(w, `c1-${tg}-10-hex-bell`))
  /* the admin, same tab: the Inputs page */
  await C.signOutIn(w, 'ad')
  const adBell = await C.bellLines(w)
  console.log('ADMIN BELL', J(adBell)); pics.push(await C.pic(w, `c1-${tg}-11-admin-bell`))
  await L.openDay(w, TUE)
  const day = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-iid], [data-testid="win-inputsday"] [data-popiid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.iid || e.dataset.popiid) + ' :: ' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140)))
  console.log('INPUTS DAY', J(day)); pics.push(await C.pic(w, `c1-${tg}-12-inputs-day`, ['[data-testid="win-inputsday"]'], 10))
  const fin = await C.store(P, ['bane', 'rocky'], DAYS)
  /* judge */
  const rOwn = fin.filter(s => /^Ranger LL /.test(s)), hexS = fin.filter(s => /^Hex LL /.test(s)), both = fin.filter(s => /^Ranger\+Hex|^Hex\+Ranger/.test(s))
  const boxOk = s1.box === 'Dental' && s2.box === 'Dental then gym' && (!s3 || s3.box === 'Dental then gym') && s4.box === 'Dental then gym' && s5.box === 'Dental pm' && sr.box === 'Dental pm'
  const storeOk = rOwn.length === 1 && /Jul 13–Jul 15 480-600 rmk="Dental pm"/.test(rOwn[0]) && (ENG !== 'chromium' || /docs=docIds?:("doc-|1)/.test(rOwn[0])) && hexS.length === 1 && /Jul 13–Jul 15 480-600 rmk="" till=- docs=(0|\S*:0) /.test(hexS[0]) && !both.length
  const firstOk = s1.store.some(s => /^Ranger LL .*rmk="Dental" /.test(s)) && s1.store.some(s => /^Hex LL .*rmk="" /.test(s)) && s2.store.some(s => /^Ranger LL .*rmk="Dental then gym" /.test(s)) && s4.store.some(s => /^Ranger LL .*till=false/.test(s))
  console.log('JUDGE', J({ boxOk, storeOk, firstOk }))
  const hexOk = firstOk && hx.sheet === 'remarks-sheet' && hx.box === ''
  const twoLeaves = day.filter(d => /(Ranger|Hex)LL/.test(d)).length
  console.log('JUDGE2', J({ hexOk, twoLeaves }))
  C.rec('C1 the member\'s own window: Dental (left), Dental then gym (Enter), document, till, Dental pm, ✕, reopen; then Hex; then the Inputs page', tg,
    boxOk && storeOk && hexOk && twoLeaves === 2 ? 'PASS' : 'FAIL',
    `boxes after each save: ${J(steps.filter(s => /^save|reopen/.test(s.step)).map(s => s.box))}; saved after each: ${J(steps.filter(s => /^save|closed|reopen/.test(s.step)).map(s => [s.step.slice(0, 12), s.store]))}; till caret ${cr}; final store ${J(fin)}; Hex's window ${J(hx)}; Inputs day ${J(day)}`, pics)
  C.rec('C1 RECORD the bell after Ranger\'s saves (Hex, the admin)', tg, 'RECORDED', `Hex's bell: ${J(hexBell)}; the admin's bell: ${J(adBell)}`, [`c1-${tg}-10-hex-bell.png`, `c1-${tg}-11-admin-bell.png`])
} catch (e) { C.rec('C1', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' | steps ' + J(steps), pics); await C.pic(w, `c1-${tg}-zz-stopped`) }
console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c1-${tg}.json`)
await L.finish()
