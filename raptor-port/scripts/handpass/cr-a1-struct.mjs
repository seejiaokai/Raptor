/* Walker A1 — the day's STRUCTURE and the one Undo (28 Sep 26), the brief's own additions: a wave added, a row deleted,
   a section dragged (and a wave dragged) — on the BOARD and on the EDIT WEEK — each undone, then redone. The edit week
   has no "+ Wave" and no row ✕ (those live on the board; the week edits in place), so on the week the structural
   gestures are its own: "+ In time" (a line added), an in-time line's ✕ (a line deleted), a section's ⠿ and a wave's ⠿
   (dragged). Every gesture through the app's own controls; the drags with a real pointer (press, move, release).
   HP_W=390 for the phone. */
import { openA1, book, door, boardOn, boardOff, dragTo, toasts, PHONE } from './cr-a1-lib.mjs'

const { browser, page, errors } = await openA1('a')
const bk = book('struct')
const MON = 0, TUE = 1

async function toDate(iso) {
  await boardOff(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500) }
  await page.evaluate(() => window.scrollTo(0, 0))
  const cal = page.locator(PHONE ? '.filt-cal:visible, .wknav-mbtn:visible' : '.wk-cal:visible, button[aria-label="Jump to a date"]:visible').first()
  if (PHONE) await cal.tap().catch(() => cal.click()); else await cal.click()
  await page.waitForTimeout(500)
  const d = page.locator(`[data-wcal="${iso}"]:visible`).first()
  if (PHONE) await d.tap().catch(() => d.click()); else await d.click()
  await page.waitForTimeout(1200)
}
const press = async (loc) => { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150); if (PHONE) await loc.tap().catch(() => loc.click()); else await loc.click(); await page.waitForTimeout(700) }
const waves = (di) => page.evaluate(i => window.DAYS[i].waves.map(w => w.label || '(no label)'), di)
const prog = (di) => page.evaluate(i => window.DAYS[i].allhands.map(a => a.prog), di)
const secs = (root, di) => page.evaluate(([r, i]) => [...document.querySelectorAll(`${r} [data-secmove^="${i}."]`)].filter(e => e.offsetParent !== null).map(e => e.dataset.secmove.split('.')[1]), [root, di])
const intimes = (di, gi) => page.evaluate(([i, g]) => (window.DAYS[i].waves[g].intimes || []).slice(), [di, gi])
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
async function undoRedo(where, id, what, read, before, after) {
  const u = await door(page, where, 'undo')
  const x = await read()
  const pu = await bk.shot(page, `${id}-undone`)
  bk.ck(`${id}.undo`, `${where === 'top' ? 'top-bar' : 'board'} Undo → ${what} put back exactly`, same(x, before) && /^Undid:/.test(u.toasts.join(' ')), { before, now: x, toasts: u.toasts }, pu)
  const r = await door(page, where, 'redo')
  const y = await read()
  const pr = await bk.shot(page, `${id}-redone`)
  bk.ck(`${id}.redo`, `${where === 'top' ? 'top-bar' : 'board'} Redo → ${what} done again`, same(y, after) && /^Redid:/.test(r.toasts.join(' ')), { after, now: y, toasts: r.toasts }, pr)
}

/* ================= the BOARD (Monday) ================= */
await boardOn(page, MON)
/* B1 — a wave added (+ Wave → Flying wave) */
{
  const w0 = await waves(MON)
  await press(page.locator('#schedBoard [data-wvadd="0"]:visible').first())
  const pick = page.locator('[data-wmkind=""]:visible').first()
  const had = await pick.count()
  if (had) await press(pick)
  const w1 = await waves(MON)
  const p = await bk.shot(page, 'board-wave-added')
  bk.ck('B1', 'board: + Wave → Flying wave adds a wave', had && w1.length === w0.length + 1, { w0, w1, t: await toasts(page) }, p)
  await undoRedo('board', 'B1', 'the added wave (gone)', () => waves(MON), w0, w1)
}
/* B2 — a row deleted (a Common Programme item's ✕) */
{
  const p0 = await prog(MON)
  await press(page.locator('#schedBoard [data-pdel="0.1"]:visible').first())
  let p1 = await prog(MON)
  if (p1.length === p0.length) { /* a confirm may ask first — press the same ✕ again */ const again = page.locator('#schedBoard [data-pdel="0.1"]:visible').first(); if (await again.count()) await press(again); p1 = await prog(MON) }
  const p = await bk.shot(page, 'board-row-deleted')
  bk.ck('B2', 'board: a Common Programme item\'s ✕ removes that row', p1.length === p0.length - 1,{ removed: p0[1], p0: p0.length, p1: p1.length, t: await toasts(page) }, p)
  await undoRedo('board', 'B2', 'the deleted row (back, in its place)', () => prog(MON), p0, p1)
}
/* B3 — a section dragged (Overall Notes moved below the Common Programme) */
{
  const s0 = await secs('#schedBoard', MON)
  const grip = page.locator(`#schedBoard [data-secmove="${MON}.notes"] .secgrip:visible`).first()
  const nextKey = s0[s0.indexOf('notes') + 2] || s0[s0.length - 1]
  const target = page.locator(`#schedBoard [data-secmove="${MON}.${nextKey}"]:visible`).first()
  const how = await dragTo(page, grip, target)
  await page.waitForTimeout(500)
  const s1 = await secs('#schedBoard', MON)
  const snack = await page.evaluate(() => { const s = [...document.querySelectorAll('.snackbar, [class*=snack]')].find(e => e.offsetParent); return s ? s.textContent.trim().slice(0, 80) : '' })
  const p = await bk.shot(page, 'board-section-dragged')
  bk.ck('B3', 'board: the Overall Notes section dragged by its ⠿ to a new place', !same(s0, s1), { how, s0, s1, snackbar: snack }, p)
  if (!same(s0, s1)) await undoRedo('board', 'B3', 'the section order', () => secs('#schedBoard', MON), s0, s1)
  else bk.note('B3.undo', 'not walked — the drag itself did not move the section')
}
/* B4 — a wave dragged (the last wave — the short one B1 added — above the one before it: a drag a thumb can make
   inside one phone screen) */
{
  const w0 = await waves(MON)
  const n = w0.length
  const grip = page.locator(`#schedBoard [data-move="mv:w.${MON}.${n - 1}"] .wvgrip:visible`).first()
  /* a thumb's drag: press the grip in the middle of the screen, slide up until the drop bar lights on the wave
     before it, and let go there (a wave block is taller than a phone screen, so its own top is off screen — a
     driver aiming at that top released outside the window: probe cr-a1-probe-wavedrag.mjs) */
  let how = 'no wave grip'
  if (await grip.count()) {
    await grip.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400)
    const gb = await grip.boundingBox(), want = `mv:w.${MON}.${n - 2}`
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.mouse.down()
    let lit = false
    for (let i = 1; i <= 30 && !lit; i++) {
      await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2 - i * 20); await page.waitForTimeout(60)
      lit = await page.evaluate(m => [...document.querySelectorAll('.rowdrop')].some(e => e.dataset.move === m), want)
    }
    await page.mouse.up(); await page.waitForTimeout(700)
    how = lit ? 'released on the lit drop bar' : 'the drop bar never lit'
  }
  await page.waitForTimeout(500)
  const w1 = await waves(MON)
  const p = await bk.shot(page, 'board-wave-dragged')
  bk.ck('B4', 'board: the last wave dragged by its ⠿ above the one before it', !same(w0, w1), { how, w0, w1 }, p)
  if (!same(w0, w1)) await undoRedo('board', 'B4', 'the wave order', () => waves(MON), w0, w1)
  else bk.note('B4.undo', 'not walked — the drag itself did not move the wave')
}
await boardOff(page)

/* ================= the EDIT WEEK (Tuesday) ================= */
await toDate('2026-07-14')
await page.evaluate(() => window.scrollTo(0, 0))
/* W1 — a line added (+ In time on Tuesday's first wave) */
{
  const i0 = await intimes(TUE, 0)
  await press(page.locator(`#eWeek [data-itadd="${TUE}|0"]:visible`).first())
  const i1 = await intimes(TUE, 0)
  const p = await bk.shot(page, 'week-intime-added')
  bk.ck('W1', 'edit week: + In time adds an in-time line to Tuesday\'s first wave', i1.length === i0.length + 1, { i0, i1 }, p)
  await undoRedo('top', 'W1', 'the added in-time line (gone)', () => intimes(TUE, 0), i0, i1)
}
/* W2 — a line deleted (an in-time line's ✕) */
{
  const i0 = await intimes(TUE, 0)
  await press(page.locator(`#eWeek [data-itdel="${TUE}|0|0"]:visible`).first())
  const i1 = await intimes(TUE, 0)
  const p = await bk.shot(page, 'week-intime-deleted')
  bk.ck('W2', 'edit week: an in-time line\'s ✕ removes it', i1.length === i0.length - 1, { i0, i1 }, p)
  await undoRedo('top', 'W2', 'the deleted in-time line (back, word for word)', () => intimes(TUE, 0), i0, i1)
}
/* W3 — a section dragged on the week (Flying Waves above the Common Programme) */
{
  const s0 = await secs('#eWeek', TUE)
  const grip = page.locator(`#eWeek [data-secmove="${TUE}.waves"] .secgrip:visible`).first()
  const target = page.locator(`#eWeek [data-secmove="${TUE}.${s0[0]}"]:visible`).first()
  const how = (await grip.count()) && (await target.count()) ? await dragTo(page, grip, target) : 'no section grip or target'
  await page.waitForTimeout(500)
  const s1 = await secs('#eWeek', TUE)
  const p = await bk.shot(page, 'week-section-dragged')
  bk.ck('W3', 'edit week: the Flying Waves section dragged by its ⠿ to the top', !same(s0, s1), { how, s0, s1 }, p)
  if (!same(s0, s1)) await undoRedo('top', 'W3', 'the section order', () => secs('#eWeek', TUE), s0, s1)
  else bk.note('W3.undo', 'not walked — the drag itself did not move the section')
}
/* W4 — a wave dragged on the week (the second wave above the first) */
{
  const w0 = await waves(TUE)
  const grip = page.locator(`#eWeek [data-move="mv:w.${TUE}.1"] .wvgrip:visible`).first()
  const target = page.locator(`#eWeek [data-move="mv:w.${TUE}.0"]:visible`).first()
  const how = (await grip.count()) && (await target.count()) ? await dragTo(page, grip, target) : 'no wave grip or target'
  await page.waitForTimeout(500)
  const w1 = await waves(TUE)
  const p = await bk.shot(page, 'week-wave-dragged')
  bk.ck('W4', 'edit week: the second wave dragged by its ⠿ above the first', !same(w0, w1), { how, w0, w1 }, p)
  if (!same(w0, w1)) await undoRedo('top', 'W4', 'the wave order', () => waves(TUE), w0, w1)
  else bk.note('W4.undo', 'not walked — the drag itself did not move the wave')
}

bk.save(errors)
await browser.close()
