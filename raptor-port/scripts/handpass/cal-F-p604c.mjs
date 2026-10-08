/* WALKER F — a bar dragged onto a weekend: the single man's question beside the group's (what the question is titled, what opens). */
import * as L from './cal-F-lib3.mjs'
const b = await L.launch()
const ctx = await L.newCtx(b)
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const [ranger, echo, ace] = await L.ids(p, ['Ranger', 'Echo', 'Ace'])
const info = async () => ({
  oil: await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 70) : null }),
  editor: await p.locator('[data-testid="win-inputedit"]').count(),
  title: await p.evaluate(() => { const t = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); return t ? t.innerText : null }),
})
async function dragBar(barLoc, fromIso, toIso) {
  const bx = await barLoc.boundingBox()
  const a = await L.cell(p, fromIso).boundingBox(), z = await L.cell(p, toIso).boundingBox()
  const y = bx.y + bx.height / 2
  await p.mouse.move(a.x + a.width / 2, y); await p.mouse.down()
  await p.mouse.move((a.x + z.x) / 2 + a.width / 2, y + 4, { steps: 4 })
  await p.mouse.move(z.x + z.width / 2, y + 6, { steps: 4 }); await p.mouse.up(); await L.sleep(700)
}
const out = {}
/* single: Saber files a Duty for Ranger on Fri 24 Jul, drags it to Sat 25 */
await L.openNew(p, '2026-07-24')
await p.selectOption('#inpEditPerson', ranger); await p.selectOption('#inpEditType', 'Duty')
await L.setWhen(p, { allday: true, remarks: 'p604c single' })
await p.locator('#inpEditSave').click(); await L.sleep(700)
await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
await dragBar(p.locator('#inpCal .ib-bar').filter({ hasText: 'Ranger · Duty' }).first(), '2026-07-24', '2026-07-25')
out.single = await info(); await L.pic(p, 'single-drag-weekend')
await L.answerOil(p, 'yes'); await L.sleep(500)
/* group: Ranger + Echo + Ace Duty on Fri 31 Jul, drag to Sat 1 Aug */
await p.evaluate(() => scrollTo(0, 0))
await L.openNew(p, '2026-07-10')
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ranger, echo, ace])
await L.setWhen(p, { allday: true, remarks: 'p604c group' })
await p.locator('#inpEditSave').click(); await L.sleep(700)
await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
await dragBar(p.locator('#inpCal .ib-bar').filter({ hasText: '+2 · Duty' }).first(), '2026-07-10', '2026-07-11')
out.group = await info(); await L.pic(p, 'group-drag-weekend')
console.log(JSON.stringify(out, null, 1))
console.log(JSON.stringify(L.errors))
await b.close()
