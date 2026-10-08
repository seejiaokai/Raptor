import * as L from './cal-F-lib3.mjs'
const b = await L.launch()
const ctx = await L.newCtx(b, { clock: new Date('2026-06-30T10:00:00') })
const p = await L.newPage(ctx)
await p.clock.setFixedTime(new Date('2026-06-30T10:00:00'))
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
const [anvil] = await L.ids(p, ['Anvil'])
await L.openNew(p, '2026-07-15')
await p.selectOption('#inpEditPerson', anvil); await p.selectOption('#inpEditType', 'LL')
await p.locator('#inpEditSave').click(); await L.sleep(700)
await L.go(p, 'viewsched'); await L.sleep(800)
console.log(await p.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('#vWeek .latetag, #vWeek .latechip')) {
    if (e.offsetParent === null) continue
    const chain = []; let a = e
    for (let i = 0; i < 7 && a.parentElement; i++) { a = a.parentElement; chain.push(a.tagName + '.' + String(a.className).slice(0, 30) + ' [' + a.innerText.replace(/\s+/g, ' ').slice(0, 70) + ']') }
    out.push(chain.join('\n   '))
  }
  return out.join('\n----\n')
}))
await L.go(p, 'editsched'); await L.sleep(500)
await p.locator('#eWeek [data-sbday="2"]:visible').first().click(); await p.waitForSelector('#schedBoard'); await L.sleep(800)
console.log('BOARD', await p.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('#schedBoard .latetag, #schedBoard .latechip')) {
    if (e.offsetParent === null) continue
    const chain = []; let a = e
    for (let i = 0; i < 7 && a.parentElement; i++) { a = a.parentElement; chain.push(a.tagName + '.' + String(a.className).slice(0, 30) + ' [' + a.innerText.replace(/\s+/g, ' ').slice(0, 70) + ']') }
    out.push(chain.join('\n   '))
  }
  return out.join('\n----\n')
}))
console.log('buttons', await p.evaluate(() => [...document.querySelectorAll('#sbNextDay, #sbPrevDay')].map(e => e.id + ' ' + (e.offsetParent !== null)).join(',')))
await b.close()
