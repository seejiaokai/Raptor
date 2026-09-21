/* THE EVERYTHING SATURDAY — built through the app's own controls only.
   bug-check-order.md §7.1 (the fixture principle) and §7.7 (no injection).

   Day 5 is Sat 18 Jul 26 in the seeded week (Mon 13 Jul). It arrives from the
   demo seed carrying one duty desk — SDO, Fable, 08:00-18:00. Everything below
   is added on top, by clicking what a scheduler clicks.

   Who ends up where, and what each should be worth:
     Ranger  / Echo    VIPER  10:00-11:00   working day 07:00-13:00 = 6h00  -> HO
     Ridge   / Grit    COBRA  14:00-15:30   working day 11:00-17:30 = 6h30  -> FO
     Piston  / Basher  SC MAIN 06:00-14:00                          8h00   -> FO
     Cobra   / Ledger  SC SPARE 06:00-14:00                  spare -> nothing
     Hunter  / Quill   AVALON line 09:00-12:00              exempt -> nothing
     Fable             SDO 08:00-18:00                              10h    -> FO
     Warden            SXO, NO TIMES                          blind -> nothing
     Outlaw            OPS DESK 07:00-07:00               zero length-> nothing
     Saint             AVALON desk 09:00-12:00              exempt -> nothing
     Drifter           SC desk SXO AM 07:00-13:00                   6h00   -> HO
     Reaper  / Basher  OFT EP-6 14:00-15:30                        1h30   -> HO / Basher FO
     Cinch   / Cinder  AMT BOX 09:00-11:00                          2h00   -> HO
     Saber             OCU REVIEW 09:00-11:00 + MASS BRIEF 15:00-16:00 = 7h -> FO, BOTH rows
     Torch             MASS BRIEF 15:00-16:00                       1h00   -> HO
     Vandal            ADMIN 13:00-14:00, turned info-only          -> nothing
     ALL AVAIL         FAMILY DAY 10:00-14:00                       4h00   -> HO for its members
*/
import { tap, type, put, board } from './lib.mjs'

export async function buildSaturday(page, di = 5) {
  await board(page, di)
  const log = []
  const L = (s) => { log.push(s); return s }

  /* --- flying wave: VIPER and COBRA ------------------------------------ */
  await tap(page, `[data-wvadd="${di}"]`)
  await page.getByRole('button', { name: 'Flying wave', exact: true }).click()
  await page.waitForTimeout(500)
  await type(page, `[data-bfld="ff:${di}.0.0.cs"]`, 'VIPER')
  await type(page, `[data-bfld="ff:${di}.0.0.to"]`, '10:00')
  await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '11:00')
  L('VIPER ' + await put(page, `[data-slot="${di}.0.0.0.p"]`, ['bane']))
  L('VIPER ' + await put(page, `[data-slot="${di}.0.0.0.w"]`, ['freak']))
  await tap(page, `[data-gline="${di}.0"]`)
  await type(page, `[data-bfld="ff:${di}.0.1.cs"]`, 'COBRA')
  await type(page, `[data-bfld="ff:${di}.0.1.to"]`, '14:00')
  await type(page, `[data-bfld="ff:${di}.0.1.ld"]`, '15:30')
  L('COBRA ' + await put(page, `[data-slot="${di}.0.1.0.p"]`, ['razer']))
  L('COBRA ' + await put(page, `[data-slot="${di}.0.1.0.w"]`, ['sufa']))

  /* --- SC wave: a MAIN that earns and a SPARE that must not ------------ */
  await tap(page, `[data-wvadd="${di}"]`)
  await page.getByRole('button', { name: 'SC', exact: true }).click()
  await page.waitForTimeout(600)
  await type(page, `[data-bfld="ff:${di}.1.0.to"]`, '06:00')
  await type(page, `[data-bfld="ff:${di}.1.0.ld"]`, '14:00')
  L('SC MAIN ' + await put(page, `[data-slot="${di}.1.0.0.p"]`, ['pump']))
  L('SC MAIN ' + await put(page, `[data-slot="${di}.1.0.0.w"]`, ['glass']))
  L('SC SPARE ' + await put(page, `[data-slot="${di}.1.0.2.p"]`, ['taipan']))
  L('SC SPARE ' + await put(page, `[data-slot="${di}.1.0.2.w"]`, ['drill', 'nasty', 'pain']))

  /* --- AVALON: exempt, must earn nothing ------------------------------- */
  await tap(page, `[data-wvadd="${di}"]`)
  await page.getByRole('button', { name: 'AVALON', exact: true }).click()
  await page.waitForTimeout(600)
  await type(page, `[data-bfld="ff:${di}.2.0.to"]`, '09:00')
  await type(page, `[data-bfld="ff:${di}.2.0.ld"]`, '12:00')
  L('AVALON ' + await put(page, `[data-slot="${di}.2.0.0.p"]`, ['prowler']))
  L('AVALON ' + await put(page, `[data-slot="${di}.2.0.0.w"]`, ['nasty', 'pain', 'xray']))

  /* --- duties: the blind desk, the zero-length one, the two wave desks -- */
  await tap(page, `[data-dradd="${di}.0"]`)
  await tap(page, `[data-dradd="${di}.0"]`)
  await type(page, `[data-bfld="dr:${di}.0.1.role"]`, 'SXO')
  await type(page, `[data-bfld="dr:${di}.0.2.role"]`, 'OPS DESK')
  await type(page, `[data-bfld="dr:${di}.0.2.str"]`, '07:00')
  await type(page, `[data-bfld="dr:${di}.0.2.end"]`, '07:00')
  L('SXO blind ' + await put(page, `[data-fill="d:${di}.0.1.+"]`, ['nact']))
  L('OPS DESK 0-len ' + await put(page, `[data-fill="d:${di}.0.2.+"]`, ['casper']))

  await tap(page, `[data-dwadd="${di}"]`)
  await page.getByRole('button', { name: /^AVALON/ }).click()
  await page.waitForTimeout(600)
  await type(page, `[data-bfld="dr:${di}.1.0.str"]`, '09:00')
  await type(page, `[data-bfld="dr:${di}.1.0.end"]`, '12:00')
  L('AVALON desk ' + await put(page, `[data-fill="d:${di}.1.0.+"]`, ['salsa']))

  await tap(page, `[data-dwadd="${di}"]`)
  await page.getByRole('button', { name: /^SC Shift/ }).click()
  await page.waitForTimeout(600)
  L('SC desk ' + await put(page, `[data-fill="d:${di}.2.0.+"]`, ['slipway']))

  /* --- sims ------------------------------------------------------------ */
  await tap(page, `[data-sradd="${di}.oft"]`)
  await type(page, `[data-bfld="sr:${di}.oft.0.label"]`, 'EP-6')
  await type(page, `[data-bfld="sr:${di}.oft.0.str"]`, '14:00')
  await type(page, `[data-bfld="sr:${di}.oft.0.end"]`, '15:30')
  L('OFT ' + await put(page, `[data-slot="s:${di}.oft.0.p"]`, ['dice']))
  L('OFT ' + await put(page, `[data-slot="s:${di}.oft.0.w"]`, ['glass']))

  await tap(page, `[data-sblkadd="${di}"]`)
  await type(page, `[data-bfld="sr:${di}.amt.1.str"]`, '09:00')
  await type(page, `[data-bfld="sr:${di}.amt.1.end"]`, '11:00')
  L('AMT BOX ' + await put(page, `[data-slot="s:${di}.amt.1.pax.0"]`, ['snap']))
  L('AMT BOX ' + await put(page, `[data-slot="s:${di}.amt.1.pax.1"]`, ['ammo']))

  /* --- ground programme, one of them turned info-only ------------------- */
  await tap(page, `[data-gradd="${di}"]`)
  await tap(page, `[data-gradd="${di}"]`)
  await type(page, `[data-bfld="gr:${di}.0.prog"]`, 'OCU REVIEW')
  await type(page, `[data-bfld="gr:${di}.0.str"]`, '09:00')
  await type(page, `[data-bfld="gr:${di}.0.end"]`, '11:00')
  await type(page, `[data-bfld="gr:${di}.1.prog"]`, 'ADMIN')
  await type(page, `[data-bfld="gr:${di}.1.str"]`, '13:00')
  await type(page, `[data-bfld="gr:${di}.1.end"]`, '14:00')
  L('OCU REVIEW ' + await put(page, `[data-fill="g:${di}.0.+"]`, ['stiff']))
  L('ADMIN ' + await put(page, `[data-fill="g:${di}.1.+"]`, ['split', 'ignite', 'vegas']))
  await tap(page, `[data-grinfo="${di}.1"]`)

  /* --- common programme: the sentinel, and a named row ------------------ */
  await tap(page, `[data-padd="${di}"]`)
  await tap(page, `[data-padd="${di}"]`)
  await type(page, `[data-bfld="ap:${di}.0.prog"]`, 'FAMILY DAY')
  await type(page, `[data-bfld="ap:${di}.0.str"]`, '10:00')
  await type(page, `[data-bfld="ap:${di}.0.end"]`, '14:00')
  await type(page, `[data-bfld="ap:${di}.1.prog"]`, 'MASS BRIEF')
  await type(page, `[data-bfld="ap:${di}.1.str"]`, '15:00')
  await type(page, `[data-bfld="ap:${di}.1.end"]`, '16:00')
  L('FAMILY DAY ' + await put(page, `[data-fill="a:${di}.0.+"]`, ['allavail']))
  L('MASS BRIEF ' + await put(page, `[data-fill="a:${di}.1.+"]`, ['stiff']))
  L('MASS BRIEF ' + await put(page, `[data-fill="a:${di}.1.+"]`, ['ignite', 'vegas', 'prism']))

  return log
}

/* The board's own "+ INPUTS" door, end to end. Pressing Add raises the OIL
   question ON TOP of the form when the type can earn on a non-working day;
   `oil` is the answer to give it ('yes' | 'no' | null when none is asked). */
export async function fileInputFromBoard(page, di, { person, type: t, st, en, allday = false, oil = 'yes' }) {
  await tap(page, `[data-inpadd="${di}.g"]`)
  await page.waitForTimeout(600)
  const pop = page.locator('#inpEditPop')
  const before = await page.evaluate(() => Object.keys(window.INPUTS).length)
  if (person) await pop.locator('select').nth(0).selectOption(person)
  if (t) await pop.locator('select').nth(1).selectOption(t)
  const cb = pop.locator('input[type=checkbox]').first()
  if (allday !== await cb.isChecked()) await cb.click()
  if (!allday) {
    if (st) await pop.locator('input[type=time]').nth(0).fill(st)
    if (en) await pop.locator('input[type=time]').nth(1).fill(en)
  }
  await page.waitForTimeout(250)
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(800)

  const conf = page.locator('[data-testid="oilconf"]')
  let asked = false
  if (await conf.count() && await conf.isVisible()) {
    asked = true
    const want = oil === 'yes' ? /^Yes/ : /^No OIL/
    await conf.locator('button').filter({ hasText: want }).first().click()
    await page.waitForTimeout(300)
    await conf.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(900)
  }
  const after = await page.evaluate(() => Object.keys(window.INPUTS).length)
  return { before, after, added: after - before, oilAsked: asked }
}
