// shr-c-c5 v1 — Share C, C5 (Astra S10, S21; Fable S12 in one window): his part taken away by another door, in ONE tab
// (people take turns by signing out and in, same tab). Desktop Chromium.
//   H  Hex's part gone: the fixture (LL Ranger + Hex 08:00–10:00, Wed 15 Jul); Ranger splits by a remark in his own window;
//      the admin deletes Hex's leave on the Inputs page; Ranger comes back: his window, words again; the admin: the Board,
//      Ranger's row, start 0900 Tab.
//   R  Ranger's own gone: a fresh fixture; Ranger splits by a remark; the admin holds Ranger's row on the Board (caret in
//      his end box), opens his leave from the row's name, Deletes it; then types on the row that still shows him (if any);
//      then the Leave War: whatever still shows Ranger there.
// EXPECTED: Ranger's own stays editable after Hex's is deleted; with Ranger's own gone, nothing is saved and nothing of Hex's
// changes.
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 node scripts/handpass/shr-c-c5.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = 'desk', ENG = 'chromium', tg = `${SZ}-${ENG}`
console.log('shr-c-c5 v1', tg, L.OUT)
const WED = '2026-07-15', DAYS = ['Jul 15']
const WIN = T('remarks-sheet'), BOX = T('remarks-remarks')
const st = P => C.store(P, ['bane', 'rocky'], DAYS)
/* the Board's Unavailable rows of the two men (shr-w3 rows()) */
const rows = P => P.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld$=".str"]')].map(e => { const row = e.closest('tr, .sb-arow, .sb-row') || e.parentElement; const who = (row.innerText || '').replace(/\s+/g, ' '); return /Ranger|Hex/.test(who) ? `${/Ranger/.test(who) ? 'Ranger' : 'Hex'} ${e.value}-${row.querySelector('[data-ifld$=".end"]')?.value} "${row.querySelector('[data-ifld$=".rmks"]')?.value || ''}" [${e.getAttribute('data-ifld')}]` : null }).filter(Boolean))
const boardBox = async (P, f) => { const r = (await rows(P)).find(r => r.startsWith('Ranger')); if (!r) return null; return `#schedBoard [data-ifld="${r.match(/\[(.+)\]/)[1].replace(/\.str$/, '.' + f)}"]` }
const toBoard = async w => { await L.go(w.page, 'editsched'); await w.page.evaluate(() => window.openScheduler(2)); await sleep(1000) }
const unavPic = (w, name) => C.pic(w, name, ['#sbBoard > [data-secmove$=".unav"]'], 8)
async function fixtureAndSplit(w, c) {
  const P = w.page
  await C.signIn(w, 'ad')
  const iid = await L.fileInput(w, c, WED, { type: 'LL', people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })
  if (!iid) throw new Error('fixture did not land')
  await C.signOutIn(w, 'us'); await C.toWar(w); await C.openCell(w, 'bane', WED)
  if (!(await C.vis(P, WIN))) throw new Error('Ranger\'s window did not open ' + J(await C.sheet(P)))
  await C.typeInto(w, BOX, 'Split'); await P.keyboard.press('Enter'); await sleep(700)
  await C.closeAny(w)
  const s = await st(P)
  const rOwn = s.find(x => /^Ranger LL .*rmk="Split"/.test(x)), hex = s.find(x => /^Hex LL /.test(x))
  if (!rOwn || !hex) throw new Error('the split did not land ' + J(s))
  return { iid, ownIid: rOwn.match(/\[(.+)\]$/)[1], hexIid: hex.match(/\[(.+)\]$/)[1], split: s }
}
async function deleteFromWindow(w, c) {
  const P = w.page
  await C.press(w, '#inpEditDel'); await sleep(500)
  const asked = []
  for (const sel of ['[data-testid="inped-delall-yes"]', '[data-testid="inped-delall"] button', '[data-testid="inped-delconfirm"]', '[data-testid="inped-del-yes"]']) {
    const b = P.locator(`${sel}:visible`).first()
    if (await b.count()) { asked.push(`${sel}: ${(await P.locator('[data-testid="inped-delall"]:visible').first().innerText().catch(() => '')).replace(/\s+/g, ' ')}`); await b.click(); await sleep(500); break }
  }
  const note = await L.shownToast(P)
  console.log(`[${c}] delete: asked ${J(asked)} note ${J(note)}`)
  return { asked, note }
}

/* ---- H ---- */
{
  let w = null; const pics = [], log = []
  try {
    w = await C.world(SZ, ENG); const P = w.page
    const f = await fixtureAndSplit(w, 'c5H'); log.push(['split', f.split])
    await C.signOutIn(w, 'ad')
    await L.openDay(w, WED)
    await C.press(w, `[data-testid="win-inputsday"] [data-iid="${f.hexIid}"], [data-testid="win-inputsday"] [data-popiid="${f.hexIid}"]`)
    await P.locator('#inpEditPop').waitFor({ timeout: 5000 }); await sleep(400)
    const winText = (await C.txt(P, '#inpEditPop .airpop-box, [data-testid="win-inputedit"]'))?.slice(0, 200)
    pics.push(await C.pic(w, `c5-${tg}-H-01-hex-window`, ['#inpEditPop .airpop-box', '[data-testid="win-inputedit"]'], 8))
    const d = await deleteFromWindow(w, 'c5H')
    if (await P.locator('[data-testid="win-inputsday-x"]').count()) await C.press(w, '[data-testid="win-inputsday-x"]')
    const s1 = await st(P); log.push(['Hex deleted', s1, d])
    if (s1.some(x => x.includes(f.hexIid))) throw new Error('Hex\'s leave was not deleted ' + J(s1))
    /* Ranger, his own window again */
    await C.signOutIn(w, 'us'); await C.toWar(w); await C.openCell(w, 'bane', WED)
    const sh = await C.sheet(P), box0 = await C.valueOf(P, BOX)
    await C.typeInto(w, BOX, 'After Hex gone'); await P.keyboard.press('Enter'); await sleep(700)
    const s2 = await st(P), box1 = await C.valueOf(P, BOX), note = await L.shownToast(P); log.push(['Ranger words', s2, note])
    pics.push(await C.pic(w, `c5-${tg}-H-02-ranger-window`, [WIN], 12))
    await C.closeAny(w)
    /* the admin, the Board, Ranger's row */
    await C.signOutIn(w, 'ad'); await toBoard(w)
    const r0 = await rows(P)
    const sel = await boardBox(P, 'str')
    let s3 = null, r1 = null
    if (sel) { const b = P.locator(sel).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); await b.click(); await sleep(200); await P.keyboard.press('Control+A'); await P.keyboard.type('0900'); await P.keyboard.press('Tab'); await sleep(700); s3 = await st(P); r1 = await rows(P); log.push(['Board start 0900', s3, r1]) }
    pics.push(await unavPic(w, `c5-${tg}-H-03-board`))
    const ok = s2.some(x => x.includes(f.ownIid) && /rmk="After Hex gone"/.test(x)) && box1 === 'After Hex gone' && !!s3 && s3.some(x => x.includes(f.ownIid) && / 540-600 /.test(x)) && s3.length === 1
    C.rec('C5-H Hex\'s part deleted on the Inputs page after Ranger\'s split: Ranger\'s window words again; the Board, his row, start 0900', tg, ok ? 'PASS' : 'FAIL',
      `Hex's window said ${J(winText)}; delete ${J(d)}; Ranger's window ${sh?.id} "${sh?.text?.slice(0, 120)}" box before ${J(box0)} after ${J(box1)} note ${J(note)}; Board rows before ${J(r0)} after ${J(r1)}; store after each: ${J(log)}`, pics)
  } catch (e) { C.rec('C5-H', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' ' + J(log), pics) }
  if (w) await w.ctx.close().catch(() => {})
}

/* ---- R ---- */
{
  let w = null; const pics = [], log = []
  try {
    w = await C.world(SZ, ENG); const P = w.page
    const f = await fixtureAndSplit(w, 'c5R'); log.push(['split', f.split])
    await C.signOutIn(w, 'ad'); await toBoard(w)
    const r0 = await rows(P); log.push(['board rows', r0])
    const endSel = await boardBox(P, 'end')
    if (!endSel) throw new Error('no Ranger row on the Board ' + J(r0))
    const b = P.locator(endSel).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); await b.click(); await sleep(300)
    const held = await P.evaluate(() => document.activeElement?.getAttribute('data-ifld'))
    /* the row's own name button (the leave's kind) */
    const nameBtn = await P.evaluate(sel => { const e = document.querySelector(sel); const row = e.closest('tr, .sb-arow, .sb-row') || e.parentElement; const bs = [...row.querySelectorAll('button, [role=button]')].filter(x => x.getBoundingClientRect().width > 0); const n = bs.find(x => /^LL$/.test((x.innerText || '').trim())) || bs.find(x => /LL/.test(x.innerText || '')); if (!n) return { none: bs.map(x => (x.innerText || x.getAttribute('aria-label') || '').trim()).slice(0, 8) }; n.setAttribute('data-shrc', 'rname'); return { sel: '[data-shrc="rname"]', text: n.innerText.trim() } }, endSel)
    console.log('NAME BUTTON', J(nameBtn), 'held', held)
    if (!nameBtn.sel) throw new Error('no LL name button on Ranger\'s Board row: ' + J(nameBtn))
    await C.press(w, nameBtn.sel); await sleep(600)
    const winUp = await C.vis(P, '#inpEditPop')
    const winText = (await C.txt(P, '#inpEditPop .airpop-box'))?.slice(0, 240)
    pics.push(await C.pic(w, `c5-${tg}-R-01-window-from-row`, ['#inpEditPop .airpop-box'], 8))
    if (!winUp) throw new Error('no window opened from the row\'s name')
    const d = await deleteFromWindow(w, 'c5R')
    const s1 = await st(P); const r1 = await rows(P); log.push(['Ranger deleted', s1, r1, d])
    pics.push(await unavPic(w, `c5-${tg}-R-02-board-after-delete`))
    /* the row that still shows him, if any */
    const stillSel = await boardBox(P, 'end')
    let s2 = null, r2 = null, note = null
    if (stillSel) {
      const e = P.locator(stillSel).first(); await e.click(); await sleep(200); await P.keyboard.press('Control+A'); await P.keyboard.type('1100'); await P.keyboard.press('Tab'); await sleep(700)
      note = await L.shownToast(P); s2 = await st(P); r2 = await rows(P); log.push(['typed 1100 on the row that still shows him', s2, r2, note])
      pics.push(await unavPic(w, `c5-${tg}-R-03-typed-on-stale`))
    }
    /* the Leave War: what still shows Ranger on 15 Jul */
    await L.go(P, 'viewsched'); await C.toWar(w); await C.reachCell(w, 'bane', WED)
    console.log('WAR month', await C.monthShown(P), 'cell drawn', await P.locator(T(`cell-bane-${WED}`)).count())
    const cellR = await C.cellSays(P, 'bane', WED), cellH = await C.cellSays(P, 'rocky', WED)
    pics.push(await C.pic(w, `c5-${tg}-R-04-war`, [T(`cell-bane-${WED}`), T(`cell-rocky-${WED}`)], 60))
    const fin = await st(P)
    const hexOk = fin.some(x => x.includes(f.hexIid) && /^Hex LL Jul 15 480-600 rmk="" till=- docs=0 /.test(x))
    const noRanger = !fin.some(x => /^Ranger/.test(x))
    C.rec('C5-R Ranger\'s own part deleted from the Board (his held row → the leave\'s name → Delete), then typed on what still shows him', tg, hexOk && noRanger ? 'PASS' : 'FAIL',
      `caret held in ${held}; the window from the row's name said ${J(winText)}; delete ${J(d)}; Board rows before ${J(r0)}, after delete ${J(r1)}; ${stillSel ? `a row still shows him — typed 1100: note ${J(note)} rows ${J(r2)} store ${J(s2)}` : 'no row shows him after the delete (nothing left to type on)'}; Leave War 15 Jul Ranger ${J(cellR)} Hex ${J(cellH)}; final store ${J(fin)}`, pics)
  } catch (e) { C.rec('C5-R', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' ' + J(log), pics) }
  if (w) await w.ctx.close().catch(() => {})
}
console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c5-${tg}.json`)
await L.finish()
