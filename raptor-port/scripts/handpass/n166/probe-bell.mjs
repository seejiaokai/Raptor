// probe-bell - exploration only: Saber's bell lines on 142 and after a pick of 149, and the squadron list's rows
import { mk, closeAll, signIn, pic, reachPick, barSq, wait } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const s = await mk(SZ)
const lines = () => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 120)))
try {
  await signIn(s, process.argv[3] || 'ad', process.argv[4] || 'a')
  await s.page.locator('#notifyBell').filter({ visible: true }).first().click(); await wait(s, 500)
  console.log('142 lines', JSON.stringify(await lines(), null, 1))
  await pic(s, 'probe-bell-142-' + SZ)
  await s.page.keyboard.press('Escape'); await wait(s, 300)
  console.log(JSON.stringify(await reachPick(s, 149)), await barSq(s))
  await s.page.locator('#notifyBell').filter({ visible: true }).first().click(); await wait(s, 500)
  console.log('149 lines', JSON.stringify(await lines(), null, 1))
  await pic(s, 'probe-bell-149-' + SZ)
} finally { await closeAll() }
