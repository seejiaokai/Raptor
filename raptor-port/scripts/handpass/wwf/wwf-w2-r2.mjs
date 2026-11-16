/* wwf w2 R2 — the Q chip's words. usage: [PHONE=1] node scripts/handpass/wwf/wwf-w2-r2.mjs */
import * as H from './wwf-w2-lib.mjs'
const PHONE = process.env.PHONE === '1'
const RUN = PHONE ? 'r2-p' : 'r2-d'
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE })
const { page } = w
const SZ = PHONE ? 'phone' : 'desktop'
const D = 1
const P = n => `w2/${RUN}/${n}.png`
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const chipOf = id => page.evaluate(id => [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetWidth).map(e => { const c = e.querySelector('.lchip'); return { puckTitle: e.title, chip: c ? c.innerText.trim() : null, chipTitle: c ? c.title : null } }), id)
const tapChip = async (id, tag) => {
  const el = page.locator(`#schedBoard .puck[data-person="${id}"]:visible .lchip`).first()
  if (!(await el.count())) { say('no chip for', id); return 'no chip' }
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const notes0 = await page.evaluate(() => document.body.innerText.length)
  if (PHONE) await el.tap(); else { await el.hover() }
  await sleep(80); await page.screenshot({ path: `${X.SHOTS}/${tag}-fast.png` })
  await sleep(700); await pic(w, `${tag}-settled`)
  const seen = await page.evaluate(() => [...document.querySelectorAll('.toast, #toast, [role=status], [role=tooltip], .passnote, .snote, #note, .tip, .tooltip, .ltip, .pop')].filter(e => e.offsetWidth && e.innerText.trim()).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
  say('tap/hover chip', id, 'visible note:', seen)
  return seen || '(nothing visible beyond the page)'
}
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
await X.board(w, D)
// (a) AVALON MAIN with a not-SC-night-current pilot
await X.press(w, `[data-wvadd="${D}"]`, { scope: 'board' }); await sleep(300)
await X.press(w, '.wavemenu [data-wmkind="avalon"]'); await sleep(700)
say('seat a', await X.seat(w, `[data-slot="${D}.0.0.0.p"]`, 'pike'))
let warns = await X.boardWarn(w)
let chips = await chipOf('pike')
say('a: warns', JSON.stringify(warns), 'chips', JSON.stringify(chips))
await pic(w, '01-a-board')
let hoverTxt = await tapChip('pike', '02-a-chip')
const nomad = warns.filter(l => /Nomad/.test(l))
const okA = chips.length && chips.every(c => c.chip === 'Q' && /Qual \/ illegal seat/.test(c.chipTitle || '') && /Qual \/ illegal seat/.test(c.puckTitle || '')) && nomad.some(l => /Not SC NIGHT current/.test(l)) && !nomad.some(l => /Illegal seat/.test(l))
row('R2a', SZ, 'Nomad (not SC NIGHT current) in AVALON MAIN front seat; read Q chip title, list; ' + (PHONE ? 'tap' : 'hover') + ' the chip', 'chip title "Qual / illegal seat"; list "Not SC NIGHT current: ..."; no "Illegal seat" line for him', `chips ${JSON.stringify(chips)} | Nomad lines ${JSON.stringify(nomad)} | after ${PHONE ? 'tap' : 'hover'}: ${hoverTxt}`, okA ? 'PASS' : 'FAIL', P('01-a-board'))
// (b) Hex in an ordinary flight's front seat
const wi = await X.addWave(w, D, '')
await X.typeIn(w, `[data-bfld="ff:${D}.${wi}.0.to"]`, '09:00'); await X.typeIn(w, `[data-bfld="ff:${D}.${wi}.0.ld"]`, '10:00')
say('seat b', await X.seat(w, `[data-slot="${D}.${wi}.0.0.p"]`, 'rocky'))
warns = await X.boardWarn(w)
chips = await chipOf('rocky')
await pic(w, '03-b-board')
hoverTxt = await tapChip('rocky', '04-b-chip')
const hex = warns.filter(l => /Hex/.test(l))
const okB = chips.length && chips.every(c => c.chip === 'Q' && /Qual \/ illegal seat/.test(c.chipTitle || '') && /Qual \/ illegal seat/.test(c.puckTitle || '')) && hex.some(l => /Illegal seat: a WSO in the front seat of/.test(l))
row('R2b', SZ, 'Hex (WSO) in an ordinary flight front seat; Q chip title and list; ' + (PHONE ? 'tap' : 'hover') + ' the chip', 'chip "Qual / illegal seat"; list "Hex — Illegal seat: a WSO in the front seat of …"', `chips ${JSON.stringify(chips)} | Hex lines ${JSON.stringify(hex)} | after: ${hoverTxt}`, okB ? 'PASS' : 'FAIL', P('03-b-board'))
// the week page too
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', D)
await pic(w, '05-week-strip')
const wchips = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] .puck')].filter(e => e.offsetWidth).map(e => { const c = e.querySelector('.lchip'); return (e.dataset.person) + ':' + (c ? c.title : '-') }))
say('week strip', ww.head, JSON.stringify(ww.items), 'week pucks', JSON.stringify(wchips))
row('R2 week', SZ, 'week page, same day: pucks and list', 'RECORD', `chips ${JSON.stringify(wchips)} | lines ${JSON.stringify(ww.items.filter(l => /seat|current/i.test(l)))}`, 'RECORDED', P('05-week-strip'))
await X.fin(w)
