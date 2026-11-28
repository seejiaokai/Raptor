// ra-09 - the plain-user round on the Tracker, both widths: course, chart, student; a mark on and off; the mark window, Info (Edit
// details) and the student window (+ Add) each closed by every way it offers; the layout editor: a ball moved, Undo, Redo, Save changes;
// File: Export and Import opened and closed; the same result after a pick of 149 and back. Dropdowns are set by the browser's select call.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, check, ask, hit, shut, pickSq, half, info, openBall, grade, pickCourse, pickSyl, pickCrew, arrange, tool, addEvent, hasEv, pressUndo, pressRedo } from './rlib.mjs'
import { chartPrint, samePrint, ballPoint, hold, trackerSaved, layoutDiff, inEditor } from './ra-lib.mjs'
const SZS = (process.env.SZ || 'd,pc').split(','), TAG = process.env.TAG || 'ra-09'
console.log('ra-09-plain v1', process.env.MQ_PORT, SZS)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const shown = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden' }, sel)
const popShown = s => s.page.evaluate(() => { const p = document.getElementById('pop'); return !!p && p.style.visibility !== 'hidden' && p.getBoundingClientRect().width > 0 })
/* a point on a shade, or on the empty chart clear of the window and every ball */
const outside = (s, box) => s.page.evaluate(box => {
  const b = document.querySelector(box)?.getBoundingClientRect(), bd = document.getElementById('board').getBoundingClientRect()
  for (let y = bd.bottom - 14; y > bd.top + 20; y -= 18) for (let x = bd.left + 12; x < bd.right - 10; x += 18) {
    if (b && x > b.left - 8 && x < b.right + 8 && y > b.top - 8 && y < b.bottom + 8) continue
    const t = document.elementFromPoint(x, y)
    if (t && (t.closest('#board') || /Overlay$/.test(t.id)) && !t.closest('.ball') && !t.closest('#pop')) return { x, y, on: t.id || t.tagName }
  }
  /* on a phone's Info half the board has no size: the window's own shade, anywhere clear of the box */
  for (let y = innerHeight - 14; y > 20; y -= 18) for (let x = 12; x < innerWidth - 10; x += 18) {
    if (b && x > b.left - 8 && x < b.right + 8 && y > b.top - 8 && y < b.bottom + 8) continue
    const t = document.elementFromPoint(x, y)
    if (t && /Overlay$/.test(t.id)) return { x, y, on: t.id }
  }
  return null
}, box)
const tapAt = async (s, p) => { if (s.desk) await s.page.mouse.click(p.x, p.y); else await s.page.touchscreen.tap(p.x, p.y); await wait(s, 350) }
const hasX = (s, box) => s.page.evaluate(box => [...document.querySelectorAll(box + ' button')].some(b => /^[✕×xX]$/.test(b.textContent.trim()) || /close/i.test(b.getAttribute('aria-label') || '')), box)

async function closings(s, run, label, open, isOpen, box, btn) {
  for (const how of ['button', 'x', 'Escape', 'outside']) {
    await open(); await wait(s, 300)
    if (!(await isOpen())) { check(`${run}: ${label} opens (for ${how})`, false, 'did not open'); continue }
    if (how === 'x' && !(await hasX(s, box))) { log(run, label, 'draws no ✕'); await s.page.keyboard.press('Escape'); await wait(s, 300); continue }
    if (how === 'button') await hit(s, btn, 350)
    if (how === 'x') await hit(s, s.page.locator(box + ' button').filter({ hasText: /^[✕×xX]$/ }).first(), 350)
    if (how === 'Escape') { await s.page.keyboard.press('Escape'); await wait(s, 350) }
    if (how === 'outside') { const p = await outside(s, box); if (!p) { check(`${run}: ${label}: an outside point`, false, 'none found'); await s.page.keyboard.press('Escape'); await wait(s, 300); continue } await tapAt(s, p) }
    check(`${run}: ${label} closes by ${how}`, !(await isOpen()), await isOpen())
  }
}

for (const sz of SZS) {
  const run = `${TAG}-${sz}`
  picsFor(run)
  await step(run, async () => {
    const s = await mk(sz); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800); if (!s.desk) await shut(s)
    await pickSq(s, '149'); await shut(s); await wait(s, 1200); await pickSq(s, '142'); await shut(s); await wait(s, 1200)
    /* course, chart, student */
    const t0 = await T(s); log(run, 'lists', { course: t0.course?.list, syl: t0.syl?.list, crew: t0.crew?.list })
    const otherSyl = t0.syl.list.find(x => x !== t0.syl.now), otherCrew = t0.crew.list.find(x => x !== t0.crew.now), otherCourse = t0.course.list.find(x => x !== t0.course.now)
    if (otherCourse) { await pickCourse(s, otherCourse); check(`${run}: course chosen`, (await T(s)).course.now === otherCourse, otherCourse); await pickCourse(s, t0.course.now) }
    await pickSyl(s, otherSyl); check(`${run}: chart chosen`, (await T(s)).syl.now === otherSyl, (await T(s)).syl.now); await pic(s, '01-other-chart'); await pickSyl(s, t0.syl.now)
    if (otherCrew) { await pickCrew(s, otherCrew); check(`${run}: student chosen`, (await T(s)).crew.now === otherCrew, otherCrew); await pickCrew(s, t0.crew.now) }
    /* a mark on and off */
    const ev = 'ST-01', i0 = await info(s)
    await grade(s, ev, 'dco'); await wait(s, 500); const i1 = await info(s); await pic(s, '02-marked')
    check(`${run}: the mark counts`, i1.overall !== i0.overall, { before: i0.overall, after: i1.overall })
    await grade(s, ev, '0'); await wait(s, 500); const i2 = await info(s); await pic(s, '03-mark-off')
    check(`${run}: the mark comes off`, i2.overall === i0.overall, { before: i0.overall, after: i2.overall })
    /* the three windows, every way of closing */
    await closings(s, run, 'the mark window', () => openBall(s, ev), () => popShown(s), '#pop', s.page.locator('#pop .opts button', { hasText: /^Close$/ }).first())
    await closings(s, run, 'Info (Edit details)', async () => { await openBall(s, ev); await hit(s, '#popEditInfo', 350) }, () => shown(s, '#infoModal'), '#infoModal', '#ifCancel')
    await closings(s, run, 'the student window (+ Add)', async () => { await half(s, 'info'); await hit(s, '#addStu', 350) }, () => shown(s, '#dlgModal'), '#dlgModal', '#dlgCancel')
    await half(s, 'flow'); await wait(s, 200)
    check(`${run}: no window left open`, !(await popShown(s)) && !(await shown(s, '#infoModal')) && !(await shown(s, '#dlgModal')), 'read')
    await pic(s, '04-windows-closed')
    /* the editor: move, Undo, Redo, Save changes */
    await arrange(s, true); await wait(s, 350); await tool(s, 'Move'); await wait(s, 150)
    const p0 = await chartPrint(s), b = await ballPoint(s)
    const h = await hold(s, b.x, b.y); await h.move(b.x + (s.desk ? 40 : 24), b.y + (s.desk ? 30 : 18)); await wait(s, 120); await h.up(); await wait(s, 700)
    const p1 = await chartPrint(s); check(`${run}: a ball moved`, p1.b !== p0.b, { p0: p0.b, p1: p1.b }); await pic(s, '05-moved')
    await pressUndo(s); await wait(s, 400); const p2 = await chartPrint(s); check(`${run}: Undo puts it back`, samePrint(p2, p0), p2.b); await pic(s, '06-undo')
    await pressRedo(s); await wait(s, 400); const p3 = await chartPrint(s); check(`${run}: Redo moves it again`, p3.b === p1.b, p3.b); await pic(s, '07-redo')
    await arrange(s, false); await wait(s, 300)
    const nm = 'RA9' + sz.toUpperCase(); check(`${run}: an unsaved event made`, await addEvent(s, nm), nm)
    const u = await T(s), a0 = await trackerSaved(s, '142'), c0 = await trackerSaved(s, '149')
    check(`${run}: Save changes is offered`, u.dirty, u.saveStat); await pic(s, '08-unsaved')
    await hit(s, '#saveChanges', 900)
    const v = await T(s), a1 = await trackerSaved(s, '142'), c1 = await trackerSaved(s, '149')
    check(`${run}: Save changes saved on 142 only`, !v.dirty && layoutDiff(a0, a1).length > 0 && layoutDiff(c0, c1).length === 0, { dirty: v.dirty, on142: layoutDiff(a0, a1), on149: layoutDiff(c0, c1) })
    await pic(s, '09-saved')
    /* File: Export and Import */
    await hit(s, '#fileMenuBtn', 250); await hit(s, '#exportBtn', 450)
    check(`${run}: the Export window opens`, await shown(s, '#copyModal'), 'read'); await pic(s, '10-export')
    await hit(s, '#copyCancel', 350); check(`${run}: the Export window closes`, !(await shown(s, '#copyModal')), 'read')
    await hit(s, '#fileMenuBtn', 250)
    const fc = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null)
    await hit(s, '#importFileBtn', 300); const chooser = await fc
    check(`${run}: Import opens the file chooser (left unanswered: nothing brought in)`, !!chooser, !!chooser)
    await wait(s, 300); await page.keyboard.press('Escape'); await wait(s, 300)
    await pic(s, '11-after-import-door')
    /* the same result after a pick of 149 and back */
    const before = { t: await T(s), p: await chartPrint(s), i: await info(s) }, s0 = await trackerSaved(s, '142')
    await pickSq(s, '149'); await shut(s); await wait(s, 1300)
    const on149 = await T(s); check(`${run}: on 149, its own chart without 142's new event`, /^149/.test(on149.sq || '') && !(await hasEv(s, nm)), { sq: on149.sq }); await pic(s, '12-on-149')
    await pickSq(s, '142'); await shut(s); await wait(s, 1300)
    const after = { t: await T(s), p: await chartPrint(s), i: await info(s) }, s1 = await trackerSaved(s, '142')
    check(`${run}: 142 the same after the round trip`, samePrint(before.p, after.p) && before.t.course.now === after.t.course.now && before.t.crew.now === after.t.crew.now && before.i.overall === after.i.overall && await hasEv(s, nm) && layoutDiff(s0, s1).length === 0, { course: after.t.course.now, crew: after.t.crew.now, overall: after.i.overall, diff: layoutDiff(s0, s1) })
    await pic(s, '13-back-on-142')
    await s.ctx.close()
  })
}
finish(TAG); await closeAll()
