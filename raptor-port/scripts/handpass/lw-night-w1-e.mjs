// WALKER 1 — scenarios 13 (the member's closed-day window) and 16 (the member's own bid), both on real storage: the admin builds the
// fixtures, signs out, Ranger signs in. Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=13,16] node scripts/handpass/lw-night-w1-e.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-e v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s1[36]-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s${o}-`)))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const redConds = (b, words) => [
  ['a bubble is up', b.where !== 'none', b.where],
  [`words "${words}"`, b.text === words, b.text],
  ['data-level red', b.level === 'red', b.level],
  ['red border / fill / words', RED.border.test(b.border || '') && RED.bg.test(b.bg || '') && RED.ink.test(b.color || ''), `${b.border} ${b.bg} ${b.color}`],
  ['box inside the screen', !!b.inside, JSON.stringify(b.rect)],
  ['not both notes', !(b.all?.mid && b.all?.foot), JSON.stringify(b.all)],
  ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
]
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function signOut(P) { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') }
async function memberIn(w) {
  const P = w.page
  await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(900)
  await H.hideTransient(P)
}
async function f1(w, iso) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0)); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
async function foldRows(w) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
  if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) }
  return !(await rowsOpen(P))
}

for (const size of SIZES) {
  const phone = size === 'phone'
  const sc = async (w, id, fn) => { if (!run(id)) return; console.log(`-- S${id} [${size}]`); try { await fn() } catch (e) { rec(`S${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}) } }
  const w = await L.newCtx(size)
  const P = w.page
  await L.signInPlain(w, 'admin'); await H.hideTransient(P)
  const ids = await H.peopleIds(P)
  const me = ids.Ranger
  const N3 = '2026-11-03', N4 = '2026-11-04', N5 = '2026-11-05', D16 = '2026-12-16'
  const fx = {}
  try {
    /* ---- the admin's fixtures (real storage) ---- */
    fx.f3 = await f1(w, N3)                                           // A: a closed day holding nothing of his, F1
    fx.f4 = await f1(w, N4); fx.f5 = await f1(w, N5)                  // B, C: F2 days — Hunter's pending bid first, then Ranger's
    for (const d of [N4, N5]) { await H.bidType(w, ids.Hunter, d, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w) }
    const kb = await H.bidType(w, me, N4, { type: 'LL', inView: true, approve: false, portion: 'am' }); await H.dismissBubble(w)
    const kc = await H.bidType(w, me, N5, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    fx.k4 = kb.k; fx.k5 = kc.k
    /* S16's day: December opened for bidding (Ranger's open day), 16 Dec at F1 */
    fx.f16 = await f1(w, D16)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
    if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-12')); await P.waitForTimeout(500) }
    await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
    fx.afterA = [await availCell(P, N3), await availCell(P, N4), await availCell(P, N5), await availCell(P, D16)]
    console.log('fixtures', JSON.stringify({ k4: fx.k4, k5: fx.k5, avail: fx.afterA }))
    await signOut(P); await memberIn(w)
  } catch (e) { rec('fixtures', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await w.ctx.close(); continue }

  /* ============ S13: the member's closed-day window ============ */
  await sc(w, 13, async () => {
    const readA = async iso => { await L.reachCell(w, 'bane', iso); if (!(await P.locator(T(`avail-p-${iso}`)).count())) { await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } return availCell(P, iso) }
    /* (A) a closed day with nothing of his, Available P at F1 */
    const a3 = await readA(N3)
    await P.evaluate(() => window.scrollTo(0, 0))
    if (phone) await foldRows(w)
    await L.openCellR(w, 'bane', N3)
    const sheetA = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())
    await H.setManningView(w, true)
    const sA = await H.tapPic(w, T('closed-file-OD'), `s13-${size}-A-after-tap`)
    await P.waitForTimeout(700)
    const bA = await H.bubbleNow(P), aA = await availCell(P, N3), kA = await H.kinds(w, 'bane', N3)
    const pA = await H.cropPic(w, `s13-${size}-A-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${N3}`)])
    judge('S13 (A) closed day, nothing of his: OD', size, [
      ['the closed note opened', sheetA === 'closed-note', sheetA],
      ['the OD on his cell', kA.some(x => /^OD\|k-od/.test(x)), JSON.stringify(kA)],
      ['Available P turned red', /red$/.test(aA || '') && Number((aA || '').split(' ')[0]) === Number(fx.f3.a0) - 1, `${a3} → ${aA}`],
      ...redConds(bA, 'This overseas duty turns Available P red.'),
    ], `Available P ${a3} → ${aA}; right after the tap: ${H.bubbleLine(sA)}; settled: ${H.bubbleLine(bA)}`, [`s13-${size}-A-after-tap.png`, pA].filter(Boolean))
    await H.dismissBubble(w)
    /* (B) a morning pending LL on a red day, words typed (no Enter), then OD */
    const a4 = await readA(N4)
    await P.evaluate(() => window.scrollTo(0, 0)); if (phone) await foldRows(w)
    await L.openCellR(w, 'bane', N4)
    const sheetB = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())
    const hasBox = await L.vis(P, T('closed-remarks'))
    if (hasBox) { await L.press(w, T('closed-remarks')); await P.keyboard.type('Dentist call'); await P.waitForTimeout(200) }
    const typed = hasBox ? await P.locator(T('closed-remarks')).inputValue() : null
    await H.setManningView(w, true)
    const sB = await H.tapPic(w, T('closed-file-OD'), `s13-${size}-B-after-tap`)
    await P.waitForTimeout(700)
    const bB = await H.bubbleNow(P), aB = await availCell(P, N4), kB = await H.kinds(w, 'bane', N4)
    const pB = await H.cropPic(w, `s13-${size}-B-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${N4}`)])
    await H.dismissBubble(w)
    /* reopen: the typed words on the morning bid */
    await L.openCellR(w, 'bane', N4)
    const sheetB2 = await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())
    const vals2 = await P.evaluate(() => [...document.querySelectorAll('.bidsheet textarea, .bidsheet input[type=text], .bidsheet input:not([type])')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.value))
    const words2 = vals2.find(v => v === 'Dentist call') ?? (vals2.join(' | ') || null)
    const reopenPic = await H.settled(w, `s13-${size}-B-reopened`)
    await L.closeAny(w)
    judge('S13 (B) morning pending LL on a red day, words typed (no Enter), then OD', size, [
      ['his window held a Remarks box and the words went in', hasBox && typed === 'Dentist call', `box=${hasBox} typed="${typed}" sheet=${sheetB}`],
      ['the OD is on his cell', kB.some(x => /OD\|k-od/.test(x)), JSON.stringify(kB)],
      ['Available P lower, still red', /red$/.test(aB || '') && Number((aB || '').split(' ')[0]) < Number((a4 || '').split(' ')[0]), `${a4} → ${aB}`],
      ['NOT "This bid …"', !/^This bid/.test(bB.text || ''), bB.text],
      ...redConds(bB, 'This overseas duty takes Available P lower, still red.'),
      ['the typed words are on the morning bid after reopening', words2 === 'Dentist call', `reopened ${sheetB2}: "${words2}"`],
    ], `Available P ${a4} → ${aB}; cells ${JSON.stringify(kB)}; right after the tap: ${H.bubbleLine(sB)}; settled: ${H.bubbleLine(bB)}; reopened window words "${words2}"`, [`s13-${size}-B-after-tap.png`, pB, reopenPic].filter(Boolean))
    /* (C) a whole-day pending LL on a red day, OD: RECORD */
    const a5 = await readA(N5)
    await P.evaluate(() => window.scrollTo(0, 0)); if (phone) await foldRows(w)
    await L.openCellR(w, 'bane', N5)
    await H.setManningView(w, true)
    const sC = await H.tapPic(w, T('closed-file-OD'), `s13-${size}-C-after-tap`)
    await P.waitForTimeout(700)
    const bC = await H.bubbleNow(P)
    let aC = await availCell(P, N5)
    const wasFolded = aC === null
    if (wasFolded) { await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, T('counts-toggle')); await P.waitForTimeout(700); aC = await availCell(P, N5) }
    const kC = await H.kinds(w, 'bane', N5)
    const pC = await H.cropPic(w, `s13-${size}-C-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${N5}`)])
    const moved = a5 !== aC
    rec('S13 (C) whole-day pending LL on a red day, OD (RECORD)', size, 'RECORD', `Available P ${a5} → ${aC} (${moved ? 'it moved' : 'unchanged'}${wasFolded ? '; the Manning rows were still folded after the filing — opened by hand to read the figure' : ''}); cells ${JSON.stringify(kC)}; bubble: ${H.bubbleLine(bC)}${moved ? '' : ''}. Rule: unchanged → no bubble; if it moved, the bubble names the OD — ${moved ? (bC.where !== 'none' && /overseas duty/.test(bC.text) ? 'holds' : 'DOES NOT HOLD') : (bC.where === 'none' ? 'holds' : 'DOES NOT HOLD')}`, [`s13-${size}-C-after-tap.png`, pC].filter(Boolean))
    await H.dismissBubble(w)
  })

  /* ============ S16: the member's own bid ============ */
  await sc(w, 16, async () => {
    await P.evaluate(() => window.scrollTo(0, 0))
    const a0 = await (async () => { await L.reachCell(w, 'bane', D16); if (!(await P.locator(T(`avail-p-${D16}`)).count())) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } return availCell(P, D16) })()
    const folded = await foldRows(w)
    await L.openCellR(w, 'bane', D16); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setManningView(w, true)
    let seen = await H.tapPic(w, T('bid-LL'), `s16-${size}-ask-tap`)
    await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) { seen = await H.tapPic(w, T('bid-LL'), `s16-${size}-after-tap`); await P.waitForTimeout(700) }
    const b = await H.bubbleNow(P), a1 = await availCell(P, D16), k = await H.kinds(w, 'bane', D16), open = await rowsOpen(P)
    const pic = await H.cropPic(w, `s16-${size}-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D16}`)])
    judge('S16 the member’s own bid on an open day at F1', size, [
      ['Manning rows folded (a phone) / open (a desktop) before his tap', phone ? folded : true, `folded=${folded}`],
      ['his LL pending on the cell', k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k)],
      ['Available P turned red', /red$/.test(a1 || ''), `${a0} → ${a1}`],
      ['the Manning rows opened by themselves', open, `rowsOpen=${open}`],
      ...redConds(b, 'This bid turns Available P red.'),
    ], `Available P ${a0} → ${a1}; right after: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b)}`, [`s16-${size}-after-tap.png`, pic].filter(Boolean))
    /* reload: do the Manning rows open folded (his remembered choice) or open (the bubble's opening taken as his choice)? */
    await P.reload(); await P.waitForTimeout(1500)
    const onLogin = await P.locator('#luser').count()
    let back = 'stayed signed in'
    if (onLogin) { await memberIn(w); back = 'signed in again' } else { await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(900) }
    const afterReload = await rowsOpen(P)
    const kk = await H.kinds(w, 'bane', D16)
    const rpic = await H.settled(w, `s16-${size}-after-reload`)
    rec('S16 reload: do the Manning rows open folded or open?', size, 'RECORD', `after a reload (${back}) the Manning rows open ${afterReload ? 'OPEN' : 'FOLDED'} (his remembered choice = the bubble's opening, or folded as before); his bid is still there: ${JSON.stringify(kk)}`, [rpic])
  })
  rec('errors-e', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`e-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
