/* J2's "several ways" slides (D412): every way a person gets onto a seat, and the ways to take him off, cancel a
   line or put rows in order. On the Edit Schedule week of 13 Jul (Comet is `beams`, Warden `nact`); each way on a
   fresh page so none leans on another. Drags run on the app's own pointer machine (lib.mjs drag). */
import { go } from '../lib.mjs'

const COMET = '#eRoster .rpuck[data-person="beams"]'
const TUE_ADD = '#eWeek [data-fill="a:1.0.+"]'

export default async function ({ fresh, shot, drag, span, boardTo, around }) {
  const edit = async () => { const p = await fresh(); await go(p, 'editsched'); return p }

  // A — drag a name from the AIRCREW list onto a seat (shot in flight, the ghost over the target)
  let page = await edit()
  let crop = await span(page, [COMET, TUE_ADD], { pad: 60 })
  await drag(page, COMET, TUE_ADD, { hold: true })
  await shot(page, 'puck-a', crop, [{ n: 1, sel: COMET, pos: 'r' }, { n: 2, sel: TUE_ADD, pos: 'b' }])
  await page.mouse.up(); await page.context().close()

  // B — tap the empty seat (it arms: a dashed ring, the list narrows to who is free), then tap a name
  page = await edit()
  await page.click(TUE_ADD); await page.waitForTimeout(500)
  await shot(page, 'puck-b', await span(page, [TUE_ADD, COMET], { pad: 60 }), [{ n: 1, sel: TUE_ADD, pos: 'b' }, { n: 2, sel: COMET, pos: 'r' }])
  await page.context().close()

  // C — the placeholders ALL AVAIL / ALL: dragged like a name, onto any seat but a jet's
  page = await edit()
  const AA = '#eRoster .rpuck[data-person="allavail"]'
  crop = await span(page, [AA, TUE_ADD], { pad: 60 })
  await drag(page, AA, TUE_ADD, { hold: true })
  await shot(page, 'puck-c', crop, [{ n: 1, sel: AA, pos: 'r' }, { n: 2, sel: TUE_ADD, pos: 'b' }])
  await page.mouse.up(); await page.context().close()

  // D — drag a puck from one seat to another, or to another day (week only: all seven days side by side)
  page = await edit()
  const WARDEN = '#eWeek .day[data-day="0"] .puck[data-person="nact"]'
  crop = await span(page, [WARDEN, TUE_ADD], { pad: 60 })
  await drag(page, WARDEN, TUE_ADD, { hold: true })
  await shot(page, 'puck-d', crop, [{ n: 1, sel: WARDEN, pos: 'b' }, { n: 2, sel: TUE_ADD, pos: 'b' }])
  await page.mouse.up(); await page.context().close()

  // F — accept a personal input onto the day: the week's Personal Inputs panel (an activity lands by itself;
  //     after UNDO the row offers ACCEPT)
  page = await edit()
  await page.click('#eWeek [data-pitog="0"]'); await page.waitForTimeout(500)
  const undo = page.locator('#eWeek .day[data-day="0"] button:has-text("UNDO"), #eWeek .day[data-day="0"] [data-unacc]').first()
  if (await undo.count()) { await undo.click(); await page.waitForTimeout(500) }
  const acc = page.locator('#eWeek .day[data-day="0"] [data-acc]').first()
  await acc.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  await shot(page, 'puck-f', await around(page, acc, 560, 420, 0.75, 0.5), [{ n: 1, sel: acc, pos: 'l' }])
  await page.context().close()

  // taking people off, cancelling a line, putting rows in order — on the board (Mon 13 Jul)
  page = await edit()
  await page.click('#eWeek [data-sbday="0"]'); await page.waitForTimeout(900)
  const cx = page.locator('#schedBoard [data-lcx]').first()
  await boardTo(page, '#schedBoard [data-lcx]', 'mid')
  await cx.click(); await page.waitForSelector('#cxPop'); await page.waitForTimeout(300)
  await shot(page, 'off-c', await around(page, '#cxSave', 640, 480, 0.6, 0.6), [{ n: 1, sel: '#cxPop button:has-text("WX")' }, { n: 2, sel: '#cxSave', pos: 'b' }])
  await page.keyboard.press('Escape'); await page.mouse.click(1300, 880); await page.waitForTimeout(300)
  const sort = page.locator('#schedBoard [data-sortsec]').first()
  await boardTo(page, '#schedBoard [data-sortsec]', 'mid')
  const grip = page.locator('#schedBoard .rgrip').first()
  await shot(page, 'off-d', await around(page, sort, 900, 675, 0.8, 0.3), [
    { n: 1, sel: sort, pos: 'b' }, ...((await grip.count()) ? [{ n: 2, sel: grip, pos: 'r' }] : []),
  ])
  await page.context().close()

  // A / B — take a puck off: right-click it, or drag it off onto the crew list (the week)
  page = await edit()
  const TRI = '#eWeek .day[data-day="0"] .puck[data-person="harpoon"]'
  await shot(page, 'off-a', await around(page, TRI, 560, 420, 0.4, 0.5), [{ n: 1, sel: TRI, pos: 'r' }])
  crop = await span(page, [TRI, COMET], { pad: 60 })
  await drag(page, TRI, '#eRoster', { hold: true })
  await shot(page, 'off-b', crop, [{ n: 1, sel: TRI, pos: 'b' }, { see: true, sel: '#eRoster .rpuck[data-person="harpoon"]' }])
  await page.mouse.up(); await page.context().close()
}
