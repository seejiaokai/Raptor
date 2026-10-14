/* W2 N24 — an Event input for ALL AVAIL on Tuesday; drag a man onto its row on the board.  node n24-allavail.mjs */
import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('n24-allavail v1')
const w = await L.world('desk')
const p = w.page
const DAY = '2026-07-14', DI = 1
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
try {
  await L.go(w, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
  await p.waitForSelector('#inpCal')
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${DAY}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +DAY.slice(0, 4) * 12 + (+DAY.slice(5, 7) - 1)
    await w.press(at < want ? '#icNext' : '#icPrev')
  }
  const before = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  await p.locator(`[data-icday="${DAY}"]`).click({ position: { x: 8, y: 8 } })
  await p.waitForSelector('[data-testid="win-inputsday"]')
  await w.press('#icPopAdd')
  await p.waitForSelector('#inpEditPop #inpEditType')
  await p.selectOption('#inpEditPop #inpEditType', 'Event')
  await p.selectOption('#inpEditPop #inpEditPerson', 'allavail')
  console.log('several-people control:', await p.evaluate(() => [...document.querySelectorAll('#inpEditPop input[type=checkbox], #inpEditPop [role=switch], #inpEditPop button')].map(b => `${b.tagName}#${b.id}|${(b.parentElement.textContent || '').trim().slice(0, 30)}`).join(' ; ')))
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', '10:00'); await p.fill('#inpEditPop #inpEditEnd', '11:00')
  await p.fill('#inpEditPop #inpEditOwnTitle', 'Squadron photo').catch(() => {})
  await L.pic(w, 'n24-desk-form')
  await w.press('#inpEditSave')
  await sleep(800)
  console.log('oil question up?', await p.locator('[data-testid="oilconf"]').count(), 'edit pop still up?', await p.locator('#inpEditPop:visible').count())
  const made = await p.evaluate(b => window.INPUTS.filter(r => !b.includes(r.iid)).map(r => `${r.iid} ${r.type} ${r.date} people=${JSON.stringify((r.people || [{ p: r.person }]).map(e => e.p))}`), before)
  console.log('made:', made.join(' | '))
  const iid = made.length ? made[0].split(' ')[0] : null
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().click().catch(() => {})
  await sleep(300)
  await openBoard(w, DI)
  await sleep(600)
  const SLOT = await p.evaluate(id => { const e = document.querySelector(`#schedBoard [data-oilsent="i:${id}"]`) || document.querySelector('#schedBoard .puck.allavail[data-person="allavail"]'); const s = e.closest('[data-slot]'); return s ? s.dataset.slot : null }, iid)
  console.log('the ALL AVAIL input stands on the board at slot', SLOT)
  const rowSel = `#schedBoard [data-slot="${SLOT}"] .puck`
  await p.locator(rowSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await L.pic(w, 'n24-desk-board-row')
  const drag = async (fromLoc, toLoc) => {
    await fromLoc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    const fb = await fromLoc.boundingBox(), tb = await toLoc.boundingBox()
    await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down()
    await p.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
    await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
    await p.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
    const during = await toastNow(p)
    await p.mouse.up()
  }
  /* (a) a man from the roster dropped onto the input's row (its ALL AVAIL puck) */
  await clearToast(p)
  let t, pic
  if (process.argv[2] !== 'b') {
    const man = p.locator('#sbRoster .rpuck[data-person="bane"]:visible').first()
    console.log('roster man found', await man.count())
    await man.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await drag(man, p.locator(rowSel).first())
    t = await toastShown(p, 2500)
    await sleep(300)
    pic = await L.pic(w, 'n24-desk-drop-a-man-on-the-row')
    console.log('(a) man dropped on the row:', JSON.stringify(t && [t.text, t.opacity]), pic)
  } else console.log('(a) skipped — fresh ALL AVAIL input, only (b)')
  const rowHtml = await p.locator(`#schedBoard [data-slot="${SLOT}"]`).first().evaluate(e => e.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 120))
  console.log('row before (b):', rowHtml)
  /* (b) the ALL AVAIL puck dragged off its row onto another ground row's seat */
  await clearToast(p)
  const other = p.locator('#schedBoard [data-slot="g:1.0"] .puck, #schedBoard [data-slot="g:1.0"]').first()
  console.log('other target found', await other.count())
  await drag(p.locator(rowSel).first(), other)
  t = await toastShown(p, 2500)
  await sleep(300)
  pic = await L.pic(w, 'n24-desk-drag-all-avail-off-the-row' + (process.argv[2] === 'b' ? '-fresh' : ''))
  console.log('(b) ALL AVAIL puck dragged off:', JSON.stringify(t && [t.text, t.opacity]), pic)
  const want = 'An ALL AVAIL input can only be changed in its own window. Open it to change who it is for.'
  console.log('want', JSON.stringify(want))
} finally { await L.close(w) }
