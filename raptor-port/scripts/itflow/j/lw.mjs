/* J9 — bid for leave (everyone, own row); J10 — run the Leave War (admin): stages, deciding, moving, publishing,
   a new period, the customisable Manning (D417); and the Leave War work flow (D413, D418). Ranger is `bane`,
   Blade `slash`, Hex `rocky`. The demo war (JAN–DEC 26) is OPEN FOR BIDDING, bidding 1 Jan – 31 Mar 26.
   Stages: DRAFT → OPEN FOR BIDDING → BIDDING CLOSED → PUBLISHED, moved by the admin's stage-advance / -back. */
import { go } from '../lib.mjs'

const T = id => `[data-testid="${id}"]`
async function open(page, fold = true) {
  await go(page, 'leavewar'); await page.waitForSelector(T('row-bane'))
  if (fold) { await page.click(T('counts-toggle')); await page.click(T('figures-toggle')); await page.waitForTimeout(500) }
}
async function month(page, m) { await page.click(T('month-' + m)); await page.waitForTimeout(800) }

export default async function ({ fresh, shot, switchTo, drag, span, around }) {
  // J9 — a member bids
  let page = await fresh('us')
  await open(page, false)
  await shot(page, 'bid-1', { x: 0, y: 0, w: 720, h: 540 }, [
    { n: 1, sel: '.nav a[data-page="leavewar"]', pos: 'b' }, { n: 2, sel: T('counts-toggle'), pos: 'r' }, { n: 3, sel: T('figures-toggle'), pos: 'r' },
    { see: true, sel: T('stage-now') },
  ])
  await page.click(T('counts-toggle')); await page.click(T('figures-toggle')); await page.waitForTimeout(500)
  const d14 = T('cell-bane-2026-01-14')
  await page.click(d14); await page.waitForTimeout(500)
  await shot(page, 'bid-2', { x: 380, y: 420, w: 640, h: 480 }, [{ n: 4, sel: d14, pos: 'b' }, { see: true, sel: T('bid-picker') + ' .bidsheet-hd' }])
  await page.click(T('bid-LL')); await page.waitForTimeout(400)
  await shot(page, 'bid-3', { x: 380, y: 420, w: 640, h: 480 }, [
    { n: 5, sel: T('portion-full') }, { n: 6, sel: T('bid-LL'), pos: 'b' }, { see: true, sel: T('span-note') },
  ])
  await page.click(T('bid-LL')); await page.waitForTimeout(600)
  await shot(page, 'bid-4', { x: 0, y: 360, w: 720, h: 540 }, [{ see: true, sel: d14 }, { see: true, sel: T('bal-bane') }])
  // other ways: a drag across days; Pick a range in the sheet
  const a = T('cell-bane-2026-01-20'), b = T('cell-bane-2026-01-23')
  await drag(page, a, b); await page.waitForSelector(T('select-sheet'))
  await shot(page, 'bid-w1', { x: 380, y: 420, w: 640, h: 480 }, [{ n: 1, sel: a, pos: 'b' }, { n: 2, sel: b, pos: 'b' }, { n: 3, sel: T('sel-LL') }])
  await page.keyboard.press('Escape'); await page.mouse.click(1380, 60); await page.waitForTimeout(400)
  await page.click(T('cell-bane-2026-01-27')); await page.waitForTimeout(400)
  await page.click(T('span-range')); await page.waitForTimeout(400)
  await page.click(T('span-day-2026-01-29')); await page.waitForTimeout(400)
  await shot(page, 'bid-w2', { x: 380, y: 370, w: 680, h: 510 }, [
    { n: 1, sel: T('span-range') }, { n: 2, sel: T('span-day-2026-01-29'), pos: 'r' }, { n: 3, sel: T('bid-OL') },
  ])
  await page.context().close()

  // J10 — the admin runs it
  page = await fresh()
  await open(page)
  await shot(page, 'run-1', { x: 0, y: 40, w: 720, h: 540 }, [
    { n: 1, sel: T('stage-advance'), pos: 'b' }, { see: true, sel: T('stage-now') }, { see: true, sel: T('war-new') },
  ])
  await page.click(T('stage-advance')); await page.waitForTimeout(600)
  const feb2 = T('cell-slash-2026-02-02')
  await page.click(feb2); await page.waitForTimeout(500)
  await shot(page, 'run-2', { x: 436, y: 408, w: 656, h: 492 }, [
    { n: 2, sel: feb2, pos: 'b' }, { n: 3, sel: T('decide-approve') }, { n: 4, sel: T('decide-shift'), pos: 'r' },
  ])
  await page.click(T('decide-approve')); await page.waitForTimeout(500)
  await page.click(T('cell-slash-2026-02-03')); await page.waitForTimeout(400)
  await page.click(T('decide-shift')); await page.waitForTimeout(600)
  const feb5 = T('cell-slash-2026-02-05')
  await page.hover(feb5); await page.waitForTimeout(300)
  await shot(page, 'run-3', { x: 790, y: 540, w: 480, h: 360 }, [{ n: 5, sel: feb5, pos: 'b' }, { see: true, sel: T('move-cancel') }])
  await page.click(feb5); await page.waitForTimeout(600)
  await page.click(T('stage-advance')); await page.waitForTimeout(600)
  await shot(page, 'run-4', { x: 0, y: 40, w: 720, h: 540 }, [{ see: true, sel: T('stage-now') }, { see: true, sel: T('stage-back') }])
  await page.context().close()

  // other ways for the admin: decide many at once; the day's list; a new period
  page = await fresh()
  await open(page)
  await page.click(T('stage-advance')); await page.waitForTimeout(500)
  await drag(page, feb2, T('cell-slash-2026-02-03')); await page.waitForSelector(T('select-sheet'))
  await shot(page, 'run-w1', { x: 440, y: 410, w: 680, h: 490 }, [
    { n: 1, sel: feb2, pos: 'b' }, { n: 2, sel: T('cell-slash-2026-02-03'), pos: 'b' }, { n: 3, sel: T('sel-approve') },
  ])
  await page.keyboard.press('Escape'); await page.mouse.click(1380, 60); await page.waitForTimeout(400)
  await page.click(T('war-new')); await page.waitForTimeout(500)
  await page.fill(T('war-name'), 'JAN 28')
  await page.click(T('war-day-2028-01-01')); await page.click(T('war-day-2028-01-31')); await page.waitForTimeout(300)
  await shot(page, 'run-w3', await span(page, [T('war-name'), T('war-create')], { pad: 40 }), [
    { n: 1, sel: T('war-name') }, { n: 2, sel: T('war-day-2028-01-01') }, { n: 3, sel: T('war-day-2028-01-31'), pos: 'r' }, { n: 4, sel: T('war-create') },
  ])
  await page.click(T('war-create')); await page.waitForTimeout(700)
  // the new war opens in DRAFT: the Leave War flow's "open it for bidding"
  await shot(page, 'lwflow-open', { x: 0, y: 40, w: 720, h: 540 }, [{ n: 1, sel: T('stage-advance'), pos: 'b' }, { see: true, sel: T('stage-now') }])
  await page.context().close()

  // after publishing: a member adds remarks to his own approved leave (the war's flow, D413)
  page = await fresh()
  await open(page)
  await page.click(T('stage-advance')); await page.waitForTimeout(400)
  await page.click(T('cell-bane-2026-01-14')); await page.waitForTimeout(400)
  const llBtn = page.locator(T('bid-LL'))
  if (await llBtn.count()) { await llBtn.click(); await page.waitForTimeout(300); if (await llBtn.count()) { await llBtn.click(); await page.waitForTimeout(300) } }
  await page.click(T('cell-bane-2026-01-14')); await page.waitForTimeout(400)
  const appr = page.locator(T('decide-approve'))
  if (await appr.count()) { await appr.click(); await page.waitForTimeout(400) }
  await page.click(T('stage-advance')); await page.waitForTimeout(500)
  await switchTo(page, 'us')
  await open(page)
  await page.click(T('cell-bane-2026-01-14')); await page.waitForSelector(T('remarks-sheet'))
  await page.fill(T('remarks-field'), 'Family trip')
  await shot(page, 'lwflow-remarks', { x: 380, y: 420, w: 640, h: 480 }, [
    { n: 1, sel: T('cell-bane-2026-01-14'), pos: 'b' }, { n: 2, sel: T('remarks-field') }, { n: 3, sel: T('remarks-save') },
  ])
  await page.context().close()

  // the Manning (D417): what a row counts, its amber and red lines; + Counter; hide and restore
  page = await fresh()
  await go(page, 'leavewar'); await page.waitForSelector(T('row-bane'))
  await shot(page, 'man-1', { x: 0, y: 100, w: 960, h: 720 }, [
    { n: 1, sel: T('manning-info-ip') }, { n: 2, sel: T('settings-open'), pos: 'r' }, { see: true, sel: T('undermanned') },
  ])
  await page.click(T('manning-info-ip')); await page.waitForSelector(T('manning-sheet'))
  await shot(page, 'man-2', await span(page, [T('manning-sheet')], { pad: 20 }), [
    { n: 3, sel: T('thresh-amber') }, { n: 4, sel: T('thresh-red') }, { n: 5, sel: T('thresh-save'), pos: 'b' }, { n: 6, sel: T('counter-edit-open'), pos: 'r' },
  ])
  await page.click(T('manning-info-close')); await page.waitForTimeout(300)
  await page.click(T('settings-open')); await page.waitForSelector(T('settings-sheet'))
  await page.click(T('counter-add')); await page.waitForTimeout(500)
  await page.fill(T('cform-name'), 'NVG IP')
  await page.click(T('cf-cat-IP')); await page.click(T('cf-qual-nvg')); await page.waitForTimeout(300)
  await shot(page, 'man-3', await span(page, [T('cform-name'), T('cform-save')], { pad: 40 }), [
    { n: 7, sel: T('cform-name') }, { n: 8, sel: T('cf-cat-IP') }, { n: 9, sel: T('cf-qual-nvg') }, { n: 10, sel: T('cform-save'), pos: 'r' },
    { see: true, sel: T('cform-preview') },
  ])
  await page.click(T('cform-save')); await page.waitForTimeout(600)
  await page.mouse.click(1380, 60); await page.waitForTimeout(300)
  await page.click(T('roster-arrange')); await page.waitForTimeout(400)
  await shot(page, 'man-4', await span(page, [T('roster-arrange'), T('manning-hide-nvg-ip')], { pad: 40 }), [
    { n: 11, sel: T('roster-arrange'), pos: 'r' }, { n: 12, sel: T('manning-hide-nvg-ip'), pos: 'r' }, { see: true, sel: T('manning-info-nvg-ip') },
  ])
  await page.context().close()
}
