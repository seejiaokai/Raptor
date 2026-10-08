/* P2-06 — short forms survive every Event writer (D643-D645, D652). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size, { fresh: false })
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const F = d => `2026-02-${String(d).padStart(2, '0')}`
const ev = d => B.tid(w, `event-0-${F(d)}`)
const band = d => B.tid(w, `event-band-0-${F(d)}`)
const cellOrBand = async d => { const a = await B.txt(ev(d)); const b = await B.txt(band(d)); return b !== '(none)' ? `[band]${b}` : a }
const row = async ds => { const o = []; for (const d of ds) { o.push(`${d}:${await B.txt(ev(d))}`) } return o.join(' ') }
const reveal = async d => { await B.reveal(w, F(d), 'event-0') }
const openEmpty = async d => { await reveal(d); await B.press(w, ev(d)); await B.sleep(300) }
const openFilled = async d => { await reveal(d); await B.press(w, ev(d)); await B.sleep(300); if (await B.tid(w, 'event-peek-edit').count()) { await B.press(w, B.tid(w, 'event-peek-edit')); await B.sleep(300) } }
const pickDay = async d => { const l = B.tid(w, `event-day-${F(d)}`); await l.scrollIntoViewIfNeeded().catch(() => {}); await B.press(w, l) }
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(700)
const winFeb = ['3', '4', '5', '6', '9', '10', '11', '12', '13'].map(Number)

/* 1. Event A: explicit short "QZ" on Feb 3 */
await openEmpty(3)
await B.tid(w, 'event-text').fill('Range closure'); await B.press(w, B.tid(w, 'event-other')); await B.press(w, B.tid(w, 'event-tag-work'))
await B.tid(w, 'event-short').fill('qz'); await B.press(w, B.tid(w, 'event-apply')); await B.sleep(400)
note('1 A saved (Range closure, short qz)', await ev(3).innerText())
/* 2. Event B: PH preset, short untouched, Feb 4 */
await openEmpty(4); await B.press(w, B.tid(w, 'event-quick-0')); await B.press(w, B.tid(w, 'event-apply')); await B.sleep(400)
note('2 B saved (PH preset, follows it)', await ev(4).innerText())
/* 3. Event C: a wide band, explicit short "SDW", Feb 9..13 merged */
await openEmpty(9)
await B.tid(w, 'event-text').fill('Stand-down week'); await B.press(w, B.tid(w, 'event-other')); await B.press(w, B.tid(w, 'event-tag-work'))
await B.tid(w, 'event-short').fill('sdw')
await B.press(w, B.tid(w, 'event-scope-range')); await B.sleep(200)
await pickDay(9); await pickDay(13)
pics.push(await B.pic(p, `P2-06-${S}-1-band-sheet`))
await B.press(w, B.tid(w, 'event-apply')); await B.sleep(400)
const bandTxt = await B.txt(band(9)); const bandBox = await band(9).boundingBox().catch(() => null)
note('3 C merged band Feb 9-13 prints', `${bandTxt} (width ${bandBox ? Math.round(bandBox.width) : '?'}px)`)
/* a 2-day band: should print the short form */
await openEmpty(5)
await B.tid(w, 'event-text').fill('Detachment alpha'); await B.press(w, B.tid(w, 'event-other')); await B.press(w, B.tid(w, 'event-tag-work'))
await B.tid(w, 'event-short').fill('da')
await B.press(w, B.tid(w, 'event-scope-range')); await B.sleep(200)
await pickDay(5); await pickDay(6)
await B.press(w, B.tid(w, 'event-apply')); await B.sleep(400)
const band2 = await B.txt(band(5)); const b2 = await band(5).boundingBox().catch(() => null)
note('3b D 2-day band Feb 5-6 prints', `${band2} (width ${b2 ? Math.round(b2.width) : '?'}px)`)
pics.push(await B.pic(p, `P2-06-${S}-2-after-create`))
chk('explicit short QZ on A', (await ev(3).innerText()) === 'QZ')
chk('B follows its preset (PH)', (await ev(4).innerText()) === 'PH')
chk('a wide band prints its full name where it fits, else the short form', /Stand-down week/i.test(bandTxt) || /SDW/.test(bandTxt), `wide: ${bandTxt}`)
chk('the 2-day band prints the short form (DA) not the long name', /^DA$/.test(band2.trim()) || /DA/.test(band2), band2)
/* 4. Repeat each day: reopen A, A range, repeat, 23..26 */
await openFilled(3)
note('4 reopened A', `name=${await B.tid(w, 'event-text').inputValue()} short=${await B.tid(w, 'event-short').inputValue()}`)
await B.press(w, B.tid(w, 'event-scope-range')); await B.sleep(200); await B.press(w, B.tid(w, 'event-mode-repeat'))
await pickDay(23); await pickDay(23); await pickDay(26)
await B.press(w, B.tid(w, 'event-apply')); await B.sleep(500)
await reveal(24)
const rep = await row([23, 24, 25, 26])
note('4 repeat each day 23-26', rep)
note('4 all filled event cells', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="event-0-"]')].filter(e => e.innerText.trim() && e.innerText.trim() !== '＋').map(e => e.getAttribute('data-testid').slice(8) + '=' + e.innerText.trim()).join(' ')))
pics.push(await B.pic(p, `P2-06-${S}-3-repeat`))
chk('repeat keeps explicit QZ in every cell', [23, 24, 25, 26].every(d => /\b\d+:QZ\b/.test(rep.split(' ').find(x => x.startsWith(d + ':')) || '')), rep)
/* 5. Move A from Feb 3 to Feb 20 (an empty day far right), via Move... */
const moveTo = async (fromD, toD) => {
  await openFilled(fromD)
  await B.press(w, B.tid(w, 'event-move')); await B.sleep(400)
  await reveal(toD)
  if (w.phone) { await B.press(w, ev(toD)); await B.sleep(300); if (await B.tid(w, 'event-move-confirm').count()) { await B.press(w, B.tid(w, 'event-move-confirm')); await B.sleep(500) } }
  else { const b = await ev(toD).boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await B.sleep(200); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await B.sleep(500) }
}
await moveTo(3, 20)
note('5 after moving A 3 -> 20', `3:${await B.txt(ev(3))} 20:${await B.txt(ev(20))}`)
pics.push(await B.pic(p, `P2-06-${S}-4-moved`))
chk('moved event keeps QZ at the new date', (await B.txt(ev(20))) === 'QZ' && (await B.txt(ev(3))) !== 'QZ', `20=${await B.txt(ev(20))} 3=${await B.txt(ev(3))}`)
/* 6. Undo then Redo */
await B.undo(w); await reveal(3)
const afterUndo = `3:${await B.txt(ev(3))} 20:${await B.txt(ev(20))}`
note('6 Undo', afterUndo)
await B.redo(w); await reveal(20)
const afterRedo = `3:${await B.txt(ev(3))} 20:${await B.txt(ev(20))}`
note('6 Redo', afterRedo)
chk('Undo returns QZ to 3; Redo moves it to 20', /3:QZ 20:\+|3:QZ/.test(afterUndo) && /20:QZ/.test(afterRedo), `${afterUndo} | ${afterRedo}`)
/* 7. a refused move: A (now on 20) moved onto Feb 4's PH? the move target must overlap B's cell */
await moveTo(20, 4)
const refMsg = await B.txt(B.tid(w, 'event-move-banner'))
note('7 refused move banner', refMsg)
pics.push(await B.pic(p, `P2-06-${S}-5-refused-move`))
/* leave move mode: Escape or cancel */
if (await B.tid(w, 'event-move-cancel').count()) { await B.press(w, B.tid(w, 'event-move-cancel')); await B.sleep(300) } else await p.keyboard.press('Escape')
const afterRef = `4:${await B.txt(ev(4))} 20:${await B.txt(ev(20))}`
note('7 after the refusal', afterRef)
chk('refusal changes nothing (PH stays on 4, QZ stays on 20)', /4:PH/.test(afterRef) && /20:QZ/.test(afterRef), afterRef + ' | banner: ' + refMsg)
/* 8. reload (a plain reload, same storage) */
await B.sleep(1200)
await p.reload(); await p.waitForSelector('#luser', { timeout: 8000 }).then(async () => { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]') }, () => {})
await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await B.sleep(500)
await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="row-slipway"]'); await B.sleep(800)
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(700)
await reveal(4)
const afterReload = `4:${await B.txt(ev(4))} 20:${await B.txt(ev(20))} 24:${await B.txt(ev(24))} bandA:${await B.txt(band(9))} bandD:${await B.txt(band(5))}`
note('8 after a reload', afterReload)
pics.push(await B.pic(p, `P2-06-${S}-6-after-reload`))
chk('reload keeps the short forms', /4:PH/.test(afterReload) && /20:QZ/.test(afterReload) && /24:QZ/.test(afterReload), afterReload)
/* 9. change the PH preset's short form: B (inherited) follows, A (explicit) stays */
await openEmpty(16)
await B.press(w, B.tid(w, 'event-edit-types')); await B.sleep(300)
const presetShortBefore = await B.tid(w, 'evtype-short-0').inputValue()
await B.tid(w, 'evtype-short-0').fill('hol'); await B.sleep(200)
await B.press(w, B.tid(w, 'types-done')); await B.sleep(300)
await B.press(w, B.tid(w, 'event-cancel')); await B.sleep(400)
await reveal(4)
const afterPreset = `4:${await B.txt(ev(4))} 20:${await B.txt(ev(20))} 24:${await B.txt(ev(24))}`
note(`9 PH preset short "${presetShortBefore}" -> HOL; cells`, afterPreset)
pics.push(await B.pic(p, `P2-06-${S}-7-preset-changed`))
chk('inherited short follows the preset (4 = HOL); explicit stays (QZ)', /4:HOL/.test(afterPreset) && /20:QZ/.test(afterPreset), afterPreset)
/* 10. a MERGED BAND: move it to March (Move…), then Undo, Redo */
await reveal(9); await B.press(w, band(9)); await B.sleep(300); if (await B.tid(w, 'event-peek-edit').count()) { await B.press(w, B.tid(w, 'event-peek-edit')); await B.sleep(300) }
await B.press(w, B.tid(w, 'event-move')); await B.sleep(400)
await B.press(w, B.tid(w, 'month-MAR')); await B.sleep(700)
const mTarget = B.tid(w, 'event-0-2026-03-02')
await mTarget.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await B.sleep(300)
if (w.phone) { await B.press(w, mTarget); await B.sleep(300); if (await B.tid(w, 'event-move-confirm').count()) { await B.press(w, B.tid(w, 'event-move-confirm')); await B.sleep(500) } }
else { const bb = await mTarget.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await B.sleep(200); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await B.sleep(500) }
const bandMoved = await B.txt(B.tid(w, 'event-band-0-2026-03-02'))
const bandMovedBox = await B.tid(w, 'event-band-0-2026-03-02').boundingBox().catch(() => null)
note('10 merged band moved to 2 Mar', bandMoved + ' (' + (bandMovedBox ? Math.round(bandMovedBox.width) : '?') + 'px)')
pics.push(await B.pic(p, `P2-06-${S}-8-band-moved`))
chk('a moved merged band keeps its name / short form (full name where it fits, else SDW)', /Stand-down week|SDW/.test(bandMoved), bandMoved)
await B.undo(w); await B.sleep(400)
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(600)
const bandBack = await B.txt(band(9))
note('10 after Undo, Feb 9 band', bandBack)
chk('Undo brings the band back to 9 Feb with its text', /Stand-down week|SDW/.test(bandBack), bandBack)
await B.redo(w); await B.sleep(400)
console.log('\nLOG\n' + log.join('\n'))
const bad = checks.filter(c => !c[1])
B.row('P2-06', S, 'Created named event (short qz) + preset-following PH + wide band + 2-day band; Repeat each day; Move (via Move…); Undo; Redo; a refused move; reload; changed the PH preset short. Copy / cut / resize are not offered on the Event row (the sheet offers Move… and Delete).',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | ') + ' || ' + log.join(' || '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p206-' + S, w.errors)
await B.close(w)
