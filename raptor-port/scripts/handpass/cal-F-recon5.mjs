import * as L from './cal-F-lib2.mjs'
import * as H from './lib.mjs'
const b = await L.launch()
const ctx = await L.newCtx(b)
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const [ace, anvil, basher, saber, ranger] = await L.ids(p, ['Ace', 'Anvil', 'Basher', 'Saber', 'Ranger'])
await L.openNew(p, '2026-07-18')
await p.selectOption('#inpEditType', 'Duty')
await L.pickSeveral(p, [ace, anvil, basher])
await L.setWhen(p, { allday: true, remarks: 'oil group' })
await p.locator('#inpEditSave').click()
await L.answerOil(p, 'yes')
await L.sleep(500)
async function asMember(id) {
  await p.evaluate(i => { window.raptorMe(i); window.raptorRole('member') }, id)
  await L.sleep(600)
}
const bell = async () => p.evaluate(() => { const b = document.getElementById('notifyBell'); return b ? { cls: b.className, title: b.title || b.getAttribute('aria-label') } : null })
for (const [nm, id] of [['Ranger', ranger], ['Ace', ace], ['Anvil', anvil], ['Basher', basher]]) {
  await asMember(id)
  console.log(nm, 'bell', JSON.stringify(await bell()), 'me', await p.evaluate(() => (window.PEOPLE[window.raptorMeNow ? window.raptorMeNow() : ''] || {}).cs))
  await p.locator('#notifyBell').click(); await L.sleep(500)
  console.log(nm, 'bell panel text:', (await p.evaluate(() => { const e = [...document.querySelectorAll('[role=dialog], .bellpop, .notifypop, .airpop')].filter(x => x.offsetParent !== null).map(x => x.innerText.replace(/\s+/g, ' ').slice(0, 300)); return e.join(' || ') })))
  await L.pic(p, 'r5-bell-' + nm)
  await p.keyboard.press('Escape'); await L.sleep(200)
}
console.log(JSON.stringify(L.errors))
await b.close()
