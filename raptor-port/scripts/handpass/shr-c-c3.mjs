// shr-c-c3 v1 — Share C, C3: THE ADMIN'S WINDOW on Ranger's cell (Fable S3, Astra S11, Opus S6), each branch on a fresh
// fixture in a fresh browser. The admin (ad).
//   A  the fixture (LL Ranger + Hex 08:00–10:00, Wed 15 Jul): the bid window — words typed and left, changed (Tab), the till;
//      then ✕ and reopen. A-LL: words typed, then LL pressed without leaving the box.
//   B  an all-day shared LL (Thu 16 Jul): the same two branches.
//   C  the day's list: the fixture plus an approved PM LL placed on Ranger's 15 Jul in the war — the war leave's words typed,
//      then (fresh each) Delete / Refuse / Approved / Move without closing.
//   F  Fable's route: a war-approved LL for Ranger, Hex added in its window on the Inputs page — RECORD what the app says.
// EXPECTED: the words on Ranger's own leave; each button acts on RANGER's leave or refuses in words — never Hex's, never
// silent. RECORD which buttons each window offers and every note.
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 SZ=desk|phone ONLY=A,ALL,B,BLL,C,F node scripts/handpass/shr-c-c3.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', tg = `${SZ}-${ENG}`
const ONLY = new Set((process.env.ONLY || 'A,ALL,B,BLL,CDelete,CRefuse,CApproved,CMove,F').split(','))
console.log('shr-c-c3 v1', tg, L.OUT, [...ONLY])
const WED = '2026-07-15', THU = '2026-07-16', FRI = '2026-07-17'
const DAYS = ['Jul 15', 'Jul 16', 'Jul 17']
const BID = T('bid-picker'), LIST = T('daylist-sheet')
const acts = P => P.evaluate(() => { const s = [...document.querySelectorAll('[data-testid="bid-picker"], [data-testid="daylist-sheet"]')].find(e => e.getBoundingClientRect().height > 0); return s ? [...s.querySelectorAll('button, [role=switch], input[type=checkbox]')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.dataset.testid || '') + ':' + (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24)) : [] })
async function fresh(c, kind) {
  const w = await C.world(SZ, ENG); const P = w.page
  await C.signIn(w, 'ad')
  let iid
  if (kind === 'allday') iid = await L.fileInput(w, c, THU, { type: 'LL', people: [L.RANGER, L.HEX] })
  else iid = await L.fileInput(w, c, WED, { type: 'LL', people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })
  const st = await C.store(P, ['bane', 'rocky'], DAYS)
  if (!iid || !st.some(s => /^Ranger\+Hex LL/.test(s))) throw new Error('fixture did not land ' + J(st))
  await C.toWar(w)
  return { w, P, iid }
}
const read = async (w, label, box, steps) => { const P = w.page; const s = { step: label, store: await C.store(P, ['bane', 'rocky'], DAYS), box: box ? await C.valueOf(P, box) : null, caret: await C.active(P), sheet: (await C.sheet(P))?.id || null, note: await L.shownToast(P), cellR: await C.cellSays(P, 'bane', WED), cellH: await C.cellSays(P, 'rocky', WED) }; steps.push(s); console.log('STEP', J(s)); return s }
const own = (st, re) => st.filter(s => /^Ranger [A-Z]/.test(s) && re.test(s))
const hexUntouched = (st, rng) => st.some(s => new RegExp(`^Hex LL ${rng}.*rmk="" till=- docs=0 `).test(s)) || st.some(s => new RegExp(`^Ranger\\+Hex LL ${rng}.*rmk="" till=- docs=0 `).test(s))
async function branch(id, fn) {
  if (!ONLY.has(id)) return
  let w = null
  try { const r = await fn(x => (w = x)); } catch (e) { C.rec(`C3-${id}`, tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300), []); if (w) await C.pic(w, `c3-${tg}-${id}-zz-stopped`).catch(() => {}) }
  if (w) await w.ctx.close().catch(() => {})
}

/* A / B — words in the bid window */
for (const [id, kind, day, rng] of [['A', 'timed', WED, 'Jul 15 480-600'], ['B', 'allday', THU, 'Jul 16 allday']]) {
  await branch(id, async set => {
    const steps = [], pics = []
    const { w, P } = await fresh(`c3${id}`, kind); set(w)
    await C.openCell(w, 'bane', day, w.phone ? `c3-${tg}-${id}-01-open-q` : null)
    const sh = await C.sheet(P); const offer = await acts(P)
    console.log('WINDOW', J(sh)); console.log('OFFERS', J(offer))
    pics.push(await C.pic(w, `c3-${tg}-${id}-01-window`, [BID], 10))
    await C.typeInto(w, T('bid-remarks'), 'Dental')
    console.log('LEFT', J(await C.leaveBox(w, BID, w.phone ? `c3-${tg}-${id}-02-left-q` : null)))
    const s1 = await read(w, 'Dental, left', T('bid-remarks'), steps); pics.push(await C.pic(w, `c3-${tg}-${id}-02-save1`, [BID], 10))
    await C.typeInto(w, T('bid-remarks'), 'Dental, gym'); await P.keyboard.press('Tab'); await sleep(700)
    const s2 = await read(w, 'Dental, gym, Tab', T('bid-remarks'), steps); pics.push(await C.pic(w, `c3-${tg}-${id}-03-save2`, [BID], 10))
    const tillB = await P.evaluate(() => document.querySelector('[data-testid="bid-till"]')?.checked ?? null)
    await C.press(w, T('bid-till'), w.phone ? `c3-${tg}-${id}-04-till-q` : null); await sleep(700)
    const s3 = await read(w, `till tapped (was ${tillB}; now ${await P.evaluate(() => document.querySelector('[data-testid="bid-till"]')?.checked ?? null)})`, T('bid-remarks'), steps); pics.push(await C.pic(w, `c3-${tg}-${id}-04-till`, [BID], 10))
    await C.press(w, T('bid-cancel'), w.phone ? `c3-${tg}-${id}-05-close-q` : null); await sleep(600)
    const s4 = await read(w, 'closed by ✕', null, steps)
    await C.openCell(w, 'bane', day)
    const s5 = await read(w, 'reopened', T('bid-remarks'), steps); pics.push(await C.pic(w, `c3-${tg}-${id}-06-reopened`, [BID], 10))
    const fin = s5.store
    const onRanger = own(fin, /rmk="Dental, gym"/).length === 1
    const hexOk = hexUntouched(fin, rng)
    const verdict = onRanger && hexOk && s5.box === 'Dental, gym' ? 'PASS' : 'FAIL'
    C.rec(`C3-${id} the admin's window on Ranger's ${kind} shared leave: words typed and left, changed (Tab), till, ✕, reopen`, tg, verdict,
      `window ${sh?.id}: "${sh?.text?.slice(0, 220)}"; offers ${J(offer)}; ${steps.map(s => `[${s.step}] box ${J(s.box)} caret ${s.caret} store ${J(s.store)} note ${J(s.note)}`).join(' ; ')}`, pics)
  })
  await branch(id + 'LL', async set => {
    const steps = [], pics = []
    const { w, P } = await fresh(`c3${id}LL`, kind); set(w)
    await C.openCell(w, 'bane', day)
    await C.typeInto(w, T('bid-remarks'), 'Typed then LL')
    const before = await C.active(P)
    const lb = await C.vis(P, T('bid-LL'))
    if (!lb) { C.rec(`C3-${id}LL`, tg, 'RECORDED', `the window offers no LL button on this ${kind} leave (${J(await acts(P))}) — not pressable`, [await C.pic(w, `c3-${tg}-${id}LL-01-nobutton`, [BID], 10)]); return }
    await C.press(w, T('bid-LL'), w.phone ? `c3-${tg}-${id}LL-01-LL-q` : null); await sleep(700)
    if (await C.vis(P, BID)) { console.log('window still open after LL:', J(await C.sheet(P))); }
    const s1 = await read(w, `LL pressed (caret before ${before})`, null, steps); pics.push(await C.pic(w, `c3-${tg}-${id}LL-02-after`, [T(`cell-bane-${day}`), T(`cell-rocky-${day}`), BID], 60))
    await C.closeAny(w); await C.openCell(w, 'bane', day)
    const s2 = await read(w, 'reopened', null, steps); const sh = await C.sheet(P); pics.push(await C.pic(w, `c3-${tg}-${id}LL-03-reopened`, [BID, LIST], 10))
    const hexOk = hexUntouched(s2.store, rng)
    C.rec(`C3-${id}LL the admin's window, ${kind} shared leave: words typed, then LL pressed (box not left) — RECORD where the words land`, tg, hexOk ? 'RECORDED' : 'FAIL',
      `after LL: store ${J(s1.store)}; note ${J(s1.note)}; reopened ${sh?.id}: "${sh?.text?.slice(0, 260)}"; Hex untouched ${hexOk}`, pics)
  })
}

/* C — the day's list: the shared AM leave + an approved PM war LL; the war leave's words typed, then one button */
for (const btn of ['Delete', 'Refuse', 'Approved', 'Move']) {
  await branch('C' + btn, async set => {
    const steps = [], pics = []
    const { w, P, iid } = await fresh(`c3C${btn}`, 'timed'); set(w)
    await C.openCell(w, 'bane', WED)
    const sw = await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')
    if (sw !== 'true') await C.press(w, T('bid-approve-tick'))
    await C.press(w, T('bid-LL')); await sleep(600); if (await C.vis(P, BID)) { await C.press(w, T('bid-LL')); await sleep(600) }
    const st0 = await C.store(P, ['bane', 'rocky'], DAYS)
    const war = (await P.evaluate(() => (window.INPUTS || []).filter(r => r.date === 'Jul 15' && r.type === 'LL' && (r.people || []).length <= 1 && ((r.people || [])[0]?.p === 'bane' || r.person === 'bane')).map(r => r.iid)))[0]
    if (!war) throw new Error('the PM war leave did not land ' + J(st0))
    await C.openCell(w, 'bane', WED, w.phone ? `c3-${tg}-C${btn}-01-list-q` : null)
    const sh = await C.sheet(P); const offer = await acts(P)
    if (sh?.id !== 'daylist-sheet') throw new Error('the day\'s list did not open: ' + J(sh))
    console.log('LIST', J(sh)); console.log('OFFERS', J(offer))
    pics.push(await C.pic(w, `c3-${tg}-C${btn}-01-list`, [LIST], 10))
    const box = T(`dl-${war}-remarks`)
    await C.typeInto(w, box, 'Dental')
    console.log('LEFT', J(await C.leaveBox(w, LIST)))
    await read(w, 'war leave words Dental, left', box, steps)
    await C.typeInto(w, box, `Words then ${btn}`)
    const id = { Delete: `dl-remove-${war}`, Refuse: `dl-refuse-${war}`, Approved: `dl-approve-${war}`, Move: `dl-move-${war}` }[btn]
    const cb = await C.active(P)
    await C.press(w, T(id), w.phone ? `c3-${tg}-C${btn}-02-press-q` : null); await sleep(800)
    const ca = await C.active(P)
    const after = await C.sheet(P)
    const s = await read(w, `${btn} pressed (caret ${cb} → ${ca})`, null, steps)
    pics.push(await C.pic(w, `c3-${tg}-C${btn}-03-after`, [LIST, BID, '[role=dialog]', T(`cell-bane-${WED}`), T(`cell-rocky-${WED}`)], 30))
    /* a confirmation, a Move window: record it, then put it away */
    const more = after ? `window now ${after.id}: "${after.text?.slice(0, 260)}"` : 'no window'
    await C.closeAny(w)
    const fin = await C.store(P, ['bane', 'rocky'], DAYS)
    const sharedOk = fin.some(x => new RegExp(`^Ranger\\+Hex LL Jul 15 480-600 rmk="" till=- docs=0 \\[${iid}\\]`).test(x))
    const warNow = fin.find(x => x.includes(`[${war}]`)) || '(gone)'
    C.rec(`C3-C${btn} the day's list (shared AM leave + Ranger's approved PM war LL): words typed on the war leave, then ${btn} without closing`, tg, sharedOk ? 'PASS' : 'FAIL',
      `list offers ${J(offer)}; list text "${sh.text.slice(0, 260)}"; after ${btn}: ${more}; note ${J(s.note)}; the war leave now ${warNow}; the shared leave (both men) untouched ${sharedOk}; store ${J(fin)}; cells R ${J(s.cellR)} H ${J(s.cellH)}`, pics)
  })
}

/* F — Fable's route: a war-approved LL for Ranger, Hex added on the Inputs page */
await branch('F', async set => {
  const pics = []
  const w = await C.world(SZ, ENG); set(w); const P = w.page
  await C.signIn(w, 'ad'); await L.fileInput(w, 'c3F', WED, { type: 'LL', people: [L.HEX], from: '08:00', to: '09:00' })   // a write as the admin first
  await C.toWar(w)
  await C.openCell(w, 'bane', FRI)
  if ((await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')) !== 'true') await C.press(w, T('bid-approve-tick'))
  await C.press(w, T('bid-LL')); await sleep(600); if (await C.vis(P, BID)) { await C.press(w, T('bid-LL')); await sleep(600) }
  const war = (await P.evaluate(() => (window.INPUTS || []).filter(r => r.date === 'Jul 17' && ((r.people || []).some(x => x.p === 'bane') || r.person === 'bane')).map(r => r.iid)))[0]
  if (!war) throw new Error('no war leave on 17 Jul')
  await L.openDay(w, FRI)
  await C.press(w, `[data-testid="win-inputsday"] [data-iid="${war}"], [data-testid="win-inputsday"] [data-popiid="${war}"]`)
  await P.locator('#inpEditPop').waitFor({ timeout: 5000 }); await sleep(500)
  await C.press(w, '#inpEditPop [data-testid="pp-several"]'); await sleep(300)
  await C.press(w, '#inpEditPop [data-pp="rocky"]'); await sleep(300)
  await C.press(w, '#inpEditSave')
  const note = await L.catchToast(P, /./, 4000)
  pics.push(await C.pic(w, `c3-${tg}-F-01-refused`, ['#toastEl', '#inpEditPop .airpop-box'], 20)); await L.releaseToast(P)
  const st = await C.store(P, ['bane', 'rocky'], ['Jul 17'])
  C.rec('C3-F Fable\'s set-up: a war-approved leave of Ranger\'s, Hex added on the Inputs page — RECORD', tg, 'RECORDED', `the note: ${J(note)}; the window still open ${await C.vis(P, '#inpEditPop')}; 17 Jul store ${J(st)} — so no war-approved leave can hold two men; C3's shared windows are the Inputs-page leave's`, pics)
})

console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c3-${tg}.json`)
await L.finish()
