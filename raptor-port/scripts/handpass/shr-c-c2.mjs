// shr-c-c2 v1 — Share C, C2 (Astra S02): Ranger's own window (the member's Remarks window on his Inputs-page leave) — the
// remark, a document and the till in other orders than C1's, each order on a fresh fixture; then a document opened and the
// viewer closed by each of its ways (Close, ✕, Escape, a tap outside it), the window under it read each time.
// EXPECTED: Ranger's latest words, documents and tick survive every later save; Hex's leave untouched; the viewer alone
// closes, the window under it as it was. Chromium only (the test WebKit keeps no file).
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 SZ=phone|desk node scripts/handpass/shr-c-c2.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = process.env.SZ || 'phone', ENG = 'chromium', tg = `${SZ}-${ENG}`
console.log('shr-c-c2 v1', tg, L.OUT)
const DAYS = ['Jul 13', 'Jul 14', 'Jul 15'], TUE = '2026-07-14'
const BOX = T('remarks-remarks'), WIN = T('remarks-sheet')
const tillOf = P => P.evaluate(() => document.querySelector('[data-testid="remarks-till"]')?.checked ?? null)
const chips = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="remarks-doc-row"] .docchip')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
async function setup(c) {
  const w = await C.world(SZ, ENG); const P = w.page
  await C.signIn(w, 'ad')
  const iid = await C.fileRange(w, c, '2026-07-13', '2026-07-15')
  const st = await C.store(P, ['bane', 'rocky'], DAYS)
  if (!iid || !st.some(s => s.startsWith('Ranger+Hex LL Jul 13–Jul 15 480-600'))) throw new Error('fixture did not land ' + J(st))
  await C.signOutIn(w, 'us'); await C.toWar(w)
  await C.openCell(w, 'bane', TUE)
  if (!(await C.vis(P, WIN))) throw new Error('the member window did not open: ' + J(await C.sheet(P)))
  return w
}
const read = async (w, label, steps) => { const P = w.page; const s = { step: label, store: await C.store(P, ['bane', 'rocky'], DAYS), box: await C.valueOf(P, BOX), till: await tillOf(P), chips: await chips(P), caret: await C.active(P), win: await C.vis(P, WIN), note: await L.shownToast(P) }; steps.push(s); console.log('STEP', J(s)); return s }
async function addDoc(w, name, q) {
  const P = w.page
  /* the row's own Document / Add button — never a chip (a chip opens the viewer) */
  await P.evaluate(() => { const r = document.querySelector('[data-testid="remarks-doc-row"]'); const b = [...r.querySelectorAll('button, label')].find(b => b.getBoundingClientRect().width > 0 && !b.closest('.docchip') && /Document|Add/i.test(b.innerText)); document.querySelectorAll('[data-shrc="addoc"]').forEach(e => e.removeAttribute('data-shrc')); b?.setAttribute('data-shrc', 'addoc') })
  try { const fcP = P.waitForEvent('filechooser', { timeout: 3000 }); await C.press(w, '[data-shrc="addoc"]', q); const fc = await fcP; await fc.setFiles(C.pdfPath(name)) }
  catch { await P.locator(`${T('remarks-doc-row')} input[type=file]`).first().setInputFiles(C.pdfPath(name)) }
  await sleep(1200); await L.answerAsks(w)
}
const leave = (w, q) => C.leaveBox(w, WIN, q)

/* the two orders */
for (const [oid, order] of [['O1', ['doc', 'remark', 'till', 'remark2']], ['O2', ['till', 'doc', 'remark', 'doc2']]]) {
  let w = null
  const steps = [], pics = []
  try {
    w = await setup(`c2${oid}`); const P = w.page
    for (const [i, s] of order.entries()) {
      const q = w.phone ? `c2-${tg}-${oid}-${i + 1}-${s}-q` : null
      if (s === 'doc') await addDoc(w, `c2-${oid}-first.pdf`, q)
      if (s === 'doc2') await addDoc(w, `c2-${oid}-second.pdf`, q)
      if (s === 'till') { await C.press(w, T('remarks-till'), q); await sleep(700) }
      if (s === 'remark') { await C.typeInto(w, BOX, `${oid} words`); await leave(w, q) }
      if (s === 'remark2') { await C.typeInto(w, BOX, `${oid} words again`); await P.keyboard.press('Enter'); await sleep(700) }
      await read(w, `${i + 1}: ${s}`, steps)
      pics.push(await C.pic(w, `c2-${tg}-${oid}-${i + 1}-${s}`, [WIN], 12))
    }
    await C.press(w, T('remarks-cancel')); await sleep(500)
    await C.openCell(w, 'bane', TUE)
    const re = await read(w, 'closed and reopened', steps)
    pics.push(await C.pic(w, `c2-${tg}-${oid}-9-reopened`, [WIN], 12))
    await C.closeAny(w)
    const left = await C.sheet(P); if (left) { console.log('a window still up before signing out:', J(left)); for (let i = 0; i < 3; i++) { await P.keyboard.press('Escape'); await sleep(300) } }
    /* Hex */
    await C.signOutIn(w, 'hex'); await C.toWar(w); await C.openCell(w, 'rocky', TUE)
    const hx = await read(w, 'Hex\'s own window', steps)
    pics.push(await C.pic(w, `c2-${tg}-${oid}-10-hex`, [WIN], 12))
    const fin = hx.store
    const rOwn = fin.filter(s => /^Ranger LL /.test(s)), hexS = fin.filter(s => /^Hex LL /.test(s))
    const wantWords = oid === 'O1' ? `${oid} words again` : `${oid} words`
    const wantDocs = oid === 'O1' ? 1 : 2
    const ok = rOwn.length === 1 && rOwn[0].includes(`rmk="${wantWords}"`) && /till=false/.test(rOwn[0]) && re.box === wantWords && re.till === false && re.chips.length === wantDocs && hexS.length === 1 && /rmk="" till=- docs=0 /.test(hexS[0]) && hx.box === '' && hx.chips.length === 0
      && steps.slice(0, order.length).every(s => s.store.some(x => /^Ranger LL /.test(x)) && s.store.some(x => /^Hex LL .*rmk="" till=- docs=0 /.test(x)))
    C.rec(`C2-${oid} Ranger's own window, the order ${order.join(' → ')}, then close and reopen; Hex's window`, tg, ok ? 'PASS' : 'FAIL',
      steps.map(s => `[${s.step}] box ${J(s.box)} till ${s.till} chips ${J(s.chips)} caret ${s.caret} store ${J(s.store)}${s.note ? ' note ' + J(s.note) : ''}`).join(' ; '), pics)
  } catch (e) { C.rec(`C2-${oid}`, tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' ' + J(steps), pics) }
  if (w) await w.ctx.close().catch(() => {})
}

/* the viewer, closed each way */
{
  let w = null; const pics = []
  try {
    w = await setup('c2V'); const P = w.page
    await addDoc(w, 'c2-viewer.pdf')
    await C.typeInto(w, BOX, 'Viewer words'); await leave(w)
    const base = await read(w, 'before the viewer', [])
    const hows = ['Close', '✕', 'Escape', 'outside']
    for (const how of hows) {
      const chip = `${T('remarks-doc-row')} .docchip`
      if (!(await C.up(P, chip))) { C.rec(`C2-V ${how}`, tg, 'NOT WALKED', 'no document chip in the window to open', []); continue }
      /* the chip's name, not its ✕ */
      const nameSel = await P.evaluate(() => { const c = document.querySelector('[data-testid="remarks-doc-row"] .docchip'); const b = [...c.querySelectorAll('button, a, span')].find(e => e.getBoundingClientRect().width > 20 && !/✕|×/.test(e.innerText)); if (b) { b.setAttribute('data-shrc', 'docname'); return '[data-shrc="docname"]' } return null })
      const tgt = nameSel || chip
      await C.press(w, tgt, w.phone ? `c2-${tg}-V-${how}-1-open-q` : null); await sleep(600)
      const opened = await C.viewerUp(P)
      const vTitle = await C.txt(P, '#docViewPop .airpop-box')
      pics.push(await C.pic(w, `c2-${tg}-V-${how}-1-open`))
      if (!opened) { C.rec(`C2-V the document viewer, closed by ${how}`, tg, 'FAIL', `the chip ${tgt} pressed: no viewer opened (window up ${await C.vis(P, WIN)})`, pics.slice(-1)); continue }
      if (how === 'Close') await C.press(w, '#docViewDone', w.phone ? `c2-${tg}-V-${how}-2-q` : null)
      else if (how === '✕') await C.press(w, '#docViewClose', w.phone ? `c2-${tg}-V-x-2-q` : null)
      else if (how === 'Escape') { await P.keyboard.press('Escape') }
      else { const b = await P.locator('#docViewPop .airpop-box').boundingBox(); const x = 8, y = Math.max(6, Math.round(b.y / 2)); if (w.phone) await C.finger(w, x, y, `c2-${tg}-V-outside-2-q`); else await P.mouse.click(x, y) }
      await sleep(500)
      const v = await C.viewerUp(P), under = await C.vis(P, WIN), box = await C.valueOf(P, BOX), st = await C.store(P, ['bane', 'rocky'], DAYS)
      const p2 = await C.pic(w, `c2-${tg}-V-${how === '✕' ? 'x' : how}-3-after`); pics.push(p2)
      const ok = !v && under && box === 'Viewer words' && J(st) === J(base.store)
      C.rec(`C2-V the document viewer from Ranger's window, closed by ${how}${w.phone && how === 'Escape' ? ' (a keyboard key — no phone has one)' : ''}`, tg, ok ? 'PASS' : 'FAIL',
        `viewer said ${J(vTitle?.slice(0, 120))}; after one ${how}: viewer ${v ? 'STILL OPEN' : 'closed'}, the window under it ${under ? 'still open' : 'CLOSED'}, its box ${J(box)}, the store ${J(st) === J(base.store) ? 'unchanged' : 'CHANGED ' + J(st)}`, [pics.at(-2), p2])
      if (v) { await P.keyboard.press('Escape').catch(() => {}); await sleep(300) }
      if (!(await C.vis(P, WIN))) await C.openCell(w, 'bane', TUE)
    }
  } catch (e) { C.rec('C2-V', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300), pics) }
  if (w) await w.ctx.close().catch(() => {})
}
console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c2-${tg}.json`)
await L.finish()
