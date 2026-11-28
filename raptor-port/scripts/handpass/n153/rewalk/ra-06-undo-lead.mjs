// ra-06 - a lead from the plain round, 1536: a moved ball saves itself with no unsaved mark, but Undo of that move lights Save changes.
// What does the store hold after Undo, and what does Discard at a pick then leave on 142?
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, check, ask, arrange, tool, pickSq, shut, pressUndo } from './rlib.mjs'
import { chartPrint, samePrint, ballPoint, hold, answerHeld, trackerSaved, layoutDiff } from './ra-lib.mjs'
console.log('ra-06-undo-lead v1', process.env.MQ_PORT)
picsFor('ra-06')
const wait = (s, ms) => s.page.waitForTimeout(ms)
await step('undo of a saved ball move', async () => {
  const s = await mk('d'); const { page } = s
  await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800)
  await pickSq(s, '149'); await shut(s); await wait(s, 1200); await pickSq(s, '142'); await shut(s); await wait(s, 1200)
  await arrange(s, true); await wait(s, 350); await tool(s, 'Move'); await wait(s, 150)
  const p0 = await chartPrint(s), a0 = await trackerSaved(s, '142'), b = await ballPoint(s)
  const h = await hold(s, b.x, b.y); await h.move(b.x + 40, b.y + 30); await wait(s, 120); await h.up(); await wait(s, 800)
  const p1 = await chartPrint(s), a1 = await trackerSaved(s, '142'), t1 = await T(s)
  log('after the move', { moved: p1.b !== p0.b, dirty: t1.dirty, wrote: layoutDiff(a0, a1) }); await pic(s, '01-moved')
  await pressUndo(s); await wait(s, 700)
  const p2 = await chartPrint(s), a2 = await trackerSaved(s, '142'), t2 = await T(s)
  log('after Undo', { chartBackToStart: samePrint(p2, p0), dirty: t2.dirty, stat: t2.saveStat, storeSameAsMoved: layoutDiff(a1, a2).length === 0, storeSameAsStart: layoutDiff(a0, a2).length === 0 })
  await pic(s, '02-undo')
  await pickSq(s, '149'); await wait(s, 500)
  const q = await ask(s); log('the pick asks', q.msg); await pic(s, '03-question')
  if (q.msg) { await page.locator('#dlgAlt').click(); await wait(s, 1200) }
  await shut(s); log('after Discard on', (await T(s)).sq)
  await pickSq(s, '142'); await shut(s); await wait(s, 1300); await arrange(s, true); await wait(s, 400)
  const p3 = await chartPrint(s), a3 = await trackerSaved(s, '142')
  log('back on 142', { chartIsStart: samePrint(p3, p0), chartIsMoved: samePrint(p3, p1), storeSameAsMoved: layoutDiff(a1, a3).length === 0, dirty: (await T(s)).dirty })
  await pic(s, '04-back-on-142')
  check('read completed', true, 'see the log lines')
  await s.ctx.close()
})
finish('ra-06'); await closeAll()
