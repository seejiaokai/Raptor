// r1 - the check lead's own walk of the two chart gestures walker A left: a GROUP drag (Select tool, Select all, a ball held) and
// the SELECTION BOX (Select tool, held on empty chart), each held across a pick of 149. 1536 by mouse and keys; 402 by a real finger
// and a second real pointer. PASS = the right behaviour.
import { signIn, closeAll, finish, picsFor, step, mk, go, T, log, pickSq, shut, check, arrange, tool } from './rlib.mjs'
import { chartPrint, samePrint, viewSig, shot, hold, pickHeld, edgePoint, ballPoint, ready, trackerSaved, layoutDiff } from './ra-lib.mjs'
console.log('r1-group v1', process.env.MQ_PORT)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1300) }
const emptyPoint = s => s.page.evaluate(() => {
  const r = document.getElementById('board').getBoundingClientRect()
  for (let y = r.top + 130; y < r.bottom - 90; y += 14) for (let x = r.left + 40; x < r.right - 90; x += 14) {
    const t = document.elementFromPoint(x, y)
    if (t && t.closest('#flowSvg') && !t.closest('.ball,.edgehit,.linehit,.port,.endhandle,.linehandle,.lend,.lvert,text')) return { x, y }
  }
  return null
})
const band = s => s.page.evaluate(() => document.getElementById('bandLayer')?.innerHTML.length ?? 0)

for (const sz of ['d', 'pc']) for (const kind of ['group', 'box']) {
  const run = `r1-${sz}-${kind}`, dir = picsFor(run)
  await step(run, async () => {
    const s = await mk(sz); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800)
    await to(s, '149'); await to(s, '142')
    await arrange(s, true); await wait(s, 300); await tool(s, 'Select'); await wait(s, 200)
    if (kind === 'group') { await tool(s, 'Select all'); await wait(s, 300) }
    const g = kind === 'group' ? await ballPoint(s) : await emptyPoint(s)
    if (!g) { check(`${run} NOT WALKED: no point to press`, false, kind); await s.ctx.close(); return }
    const base = await chartPrint(s), a0 = await trackerSaved(s, '142'), b0 = await trackerSaved(s, '149')
    await shot(s, dir, '01-before-press')
    const h = await hold(s, g.x, g.y)
    const mx = g.x + (s.desk ? 46 : 26), my = g.y + (s.desk ? 34 : 22)
    await h.move(mx, my); await wait(s, 200)
    if (kind === 'group') check(`${run}: the group really moved under the held press`, !samePrint(await chartPrint(s), base), 'chart changed')
    else check(`${run}: the selection box is drawn under the held press`, (await band(s)) > 0, await band(s))
    await shot(s, dir, '02-held-moved')
    const how = await pickHeld(s, '149'); log(run, 'pick by', how)
    if (!how) { check(`${run} NOT WALKED: the pick`, false, 'not reached'); await h.up(); await s.ctx.close(); return }
    await wait(s, 500)
    check(`${run}: on 149 with the press still held`, /^149/.test((await T(s)).sq || ''), (await T(s)).sq)
    await shot(s, dir, '03-after-pick-still-held')
    const v0 = await viewSig(s), e = await edgePoint(s, mx)
    await h.move(e.x, e.y); await wait(s, 700)
    check(`${run}: no edge pan on 149 from the old press`, v0 === await viewSig(s), { v0, v1: await viewSig(s) })
    await h.move(mx + 8, my + 6); await wait(s, 120); await h.up(); await wait(s, 900)
    await shot(s, dir, '04-after-release')
    if (!s.desk) { await shut(s); await wait(s, 300) }
    const t2 = await T(s), a2 = await trackerSaved(s, '142'), b2 = await trackerSaved(s, '149')
    check(`${run}: ends on 149, nothing unsaved`, /^149/.test(t2.sq || '') && !t2.dirty, { sq: t2.sq, dirty: t2.dirty, stat: t2.saveStat })
    check(`${run}: no selection box left drawn`, (await band(s)) === 0, await band(s))
    check(`${run}: 149's saved records unchanged`, layoutDiff(b0, b2).length === 0, layoutDiff(b0, b2))
    check(`${run}: 142's saved records unchanged`, layoutDiff(a0, a2).length === 0, layoutDiff(a0, a2))
    await to(s, '142'); await arrange(s, true); await wait(s, 400)
    check(`${run}: 142's chart as it was`, samePrint(await chartPrint(s), base), { base, now: await chartPrint(s) })
    await shot(s, dir, '05-142-back')
    const b = await ready(s, 'ball')
    if (b) {
      const before = await chartPrint(s), f = await hold(s, b.x, b.y)
      await f.move(b.x + (s.desk ? 40 : 24), b.y + (s.desk ? 28 : 18)); await wait(s, 200); await f.up(); await wait(s, 700)
      const a3 = await trackerSaved(s, '142'), b3 = await trackerSaved(s, '149')
      check(`${run}: a later ordinary drag works on 142`, !samePrint(await chartPrint(s), before) && layoutDiff(a2, a3).length > 0, layoutDiff(a2, a3))
      check(`${run}: and touches nothing of 149`, layoutDiff(b2, b3).length === 0, layoutDiff(b2, b3))
      await shot(s, dir, '06-later-drag')
    } else check(`${run} NOT WALKED: the later drag`, false, 'no ball')
    await s.ctx.close()
  })
}
finish('r1-group'); await closeAll()
