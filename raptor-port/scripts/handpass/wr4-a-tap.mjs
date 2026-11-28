// Walker a — §7.10 on the phone: a picture right after each tap (the bell, a "changed to" line) and the settled one.
// Run: node scripts/handpass/wr4-a-tap.mjs [run]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-tap v1')
const RUN = process.argv[2] || 'tap-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, log, sleep, go, WED } = L
const c = 'A1tap'
try {
  let w = await newPage('desk'); await signIn(w, 'us')
  const iid = await fileInput(w, c, WED, { type: 'LL', span: 'all' })
  w = await handOver(w, 'desk', 'ad')
  await editInput(w, c, iid, WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  w = await handOver(w, 'phone', 'us')
  await go(w.page, 'viewsched'); await w.page.evaluate(() => scrollTo(0, 0))
  const full = { x: 0, y: 0, width: 402, height: 874 }
  const tapNow = async (loc, name) => {
    const b = await loc.boundingBox(); await w.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
    await w.page.screenshot({ path: `${L.OUT}/${name}-pressed-phone.png`, clip: full }); await sleep(800)
    await L.shot(w.page, c, `${name}-settled-phone`, full, name, 'phone')
  }
  await tapNow(w.page.locator('#notifyBell:visible').first(), 'A1-tap-bell')
  const line = w.page.locator('[data-testid="bell-list"] .bl-line').first()
  const said = (await line.textContent() || '').replace(/\s+/g, ' ').trim()
  await tapNow(line, 'A1-tap-line')
  const win = await w.page.locator('[data-testid="win-inputedit"]:visible').count()
  A.judge(c, 'phone: a tap on "LL changed to OL" opens the input\'s window, Inputs behind (RECORD)', null, { line: said, window: !!win, page: await w.page.evaluate(() => window.CURPAGE), type: await w.page.locator('#inpEditPop #inpEditType').inputValue().catch(() => null) })
  await w.ctx.close()
} catch (e) { L.facts.errors.push('tap: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
