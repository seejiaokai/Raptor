/* [OIL-SEATS-CAN-EARN] walk — THE ROLL-CALL, re-marked by hand.
   bug-check-order.md §6, plan §7. Every row is CREATED here: the empty seat is
   made through the app's own add control, then a placeholder is armed and
   dropped on it by hand. Nothing is read off a fixture that already had one —
   that omission is how the owner found the original defect. No blank cells.

   WHY THE EMPTY SEAT MATTERS: tapping a seat that already holds a man does NOT
   arm it (it selects the man for a move), so a "placement" onto an occupied
   seat silently does nothing and reads exactly like a refusal. Measured 22 Sep. */
import { open, board, tap, type, shot, oilMode, STATE } from './lib.mjs'
import { handPut, seatHolds, allChips, allSwitches, allPucks } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* ---- CREATE the empty seats the roll-call needs -------------------------- */
const made = []
/* an ORDINARY flying line with an empty cockpit (wave 1 already holds two) */
await tap(page, `[data-gline="${di}.0"]`)
await type(page, `[data-bfld="ff:${di}.0.2.cs"]`, 'HORNET')
await type(page, `[data-bfld="ff:${di}.0.2.to"]`, '08:00')
await type(page, `[data-bfld="ff:${di}.0.2.ld"]`, '09:30')
made.push('HORNET line added to wave 1')
/* a second OFT sim row, empty */
await tap(page, `[data-sradd="${di}.oft"]`)
await type(page, `[data-bfld="sr:${di}.oft.1.label"]`, 'EP-9')
await type(page, `[data-bfld="sr:${di}.oft.1.str"]`, '10:00')
await type(page, `[data-bfld="sr:${di}.oft.1.end"]`, '11:30')
made.push('EP-9 OFT row added')
/* a ground row, empty */
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
made.push('STORES ground row added')
/* a Common Programme row, empty */
await tap(page, `[data-padd="${di}"]`)
await type(page, `[data-bfld="ap:${di}.2.prog"]`, 'SAFETY BRIEF')
await type(page, `[data-bfld="ap:${di}.2.str"]`, '08:00')
await type(page, `[data-bfld="ap:${di}.2.end"]`, '09:00')
made.push('SAFETY BRIEF programme row added')
console.log('CREATED:', made.join(' | '))
await shot(page, 'RC-00-rows-created')

/* ---- THE ROLL-CALL ------------------------------------------------------- */
const ROWS = [
  ['Flying — cockpit P, ordinary wave (HORNET, empty)', `${di}.0.2.0.p`, 'refuse'],
  ['Flying — cockpit W, ordinary wave (HORNET, empty)', `${di}.0.2.0.w`, 'refuse'],
  ['Flying — cockpit P, SC MAIN (empty jet 2)',         `${di}.1.0.1.p`, 'refuse'],
  ['Flying — cockpit W, SC MAIN (empty jet 2)',         `${di}.1.0.1.w`, 'refuse'],
  ['Flying — cockpit P, SC SPARE (empty jet 4)',        `${di}.1.0.3.p`, 'refuse'],
  ['Flying — cockpit P, SC PM formation (empty)',       `${di}.1.1.0.p`, 'refuse'],
  ['Flying — cockpit P, AVALON (empty jet 2)',          `${di}.2.0.1.p`, 'refuse'],
  ['Duty desk — own position, AVALON OPS O (empty)',    `d:${di}.1.1.+`, 'take'],
  ['Duty desk — own position, SC OPS O AM (empty)',     `d:${di}.2.1.+`, 'take'],
  ['Duty desk — more (SDO row, already filled)',        `d:${di}.0.0.+`, 'take'],
  ['Sim — OFT front seat (EP-9, empty)',                `s:${di}.oft.1.p`, 'take'],
  ['Sim — OFT rear seat (EP-9, empty)',                 `s:${di}.oft.1.w`, 'take'],
  ['Sim — OFT more (EP-6, already filled)',             `s:${di}.oft.0.+`, 'take'],
  ['Sim — AMT passenger more (BOX, already filled)',    `s:${di}.amt.1.+`, 'take'],
  ['Ground row — the who (STORES, empty)',              `g:${di}.5.+`,   'take'],
  ['Ground row — more (OCU REVIEW, already filled)',    `g:${di}.0.+`,   'take'],
  ['Common Programme — the who (SAFETY BRIEF, empty)',  `a:${di}.2.+`,   'take'],
  ['Common Programme — more (MASS BRIEF, filled)',      `a:${di}.1.+`,   'take'],
]

const out = []
for (const [name, key, want] of ROWS) {
  const r = await handPut(page, key, 'allavail')
  const verdict = want === 'refuse' ? (r.took ? 'FAIL — it took' : 'refused')
    : (r.took ? 'took' : 'FAIL — it did not take')
  out.push({ name, key, want, verdict, ...r })
  console.log(`[${verdict}] ${name}`)
  console.log(`   arm=${r.armed} offered=${r.offered} before=[${r.before}] after=[${r.after}]` + (r.msg ? `\n   SAID: ${r.msg}` : ''))
}
await shot(page, 'RC-01-board-after-hand-placement')

console.log('\n=== CHIPS on the board, mode OFF ===')
for (const c of await allChips(page)) console.log(' ', JSON.stringify(c))

console.log('\n=== MODE ON ===')
console.log(JSON.stringify(await oilMode(page, true)))
await shot(page, 'RC-02-mode-on')
console.log('\n--- SWITCHES ---')
for (const s of await allSwitches(page)) console.log(' ', JSON.stringify(s))
console.log('\n--- OPENED PUCKS (OIL8) ---')
const byItem = {}
for (const p of await allPucks(page)) (byItem[p.item] ||= []).push(`${p.cs}${p.on ? '' : '(off)'}`)
for (const k of Object.keys(byItem)) console.log(' ', k, '->', byItem[k].join(', '))

console.log('\nerrors:', errors.slice(0, 8))
await page.context().storageState({ path: 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats/state-rollcall.json' })
await browser.close()
