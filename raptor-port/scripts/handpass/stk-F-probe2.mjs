import * as F from './stk-F-lib.mjs'
import * as X from './stk-F-fx.mjs'
const c = await F.open('desk'); const { p } = c
await X.flyWave(p, 4, { cs: 'VL', to: '12:00', ld: '13:00', crew: ['bane', 'freak'], gi: 0 })
await X.ensureLines(p, 'board', 4, 2, 0)
await X.boardOff(p); await F.go(p, 'editsched')
const bar = async tag => { const r = await F.H.readList(p, '#eWeek', 4); console.log(tag, '| week day bar:', JSON.stringify(r.bar), r.barCls, '| model:', JSON.stringify((await X.warns(p, 4)).map(w => w.code))) }
const line = async (i, text, how) => {
  const el = p.locator(`#eWeek [data-itline="4|0|${i}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 8 })
  if (how === 'tab') await p.keyboard.press('Tab'); else if (how === 'enter') await p.keyboard.press('Enter'); else if (how === 'blur') await p.mouse.click(30, 300)
  await F.sleep(900)
}
await bar('0. before')
await line(1, '10:00 RALLY', 'tab'); await bar('A. Rally 10:00 by Tab')
await line(1, '09:00 RALLY', 'enter'); await bar('B. Rally 09:00 (clears) by Enter')
await line(1, '10:10 RALLY', 'enter'); await bar('C. Rally 10:10 by ENTER')
await line(1, '09:00 RALLY', 'enter'); await bar('D. Rally 09:00 by Enter')
await line(1, '10:20 RALLY', 'blur'); await bar('E. Rally 10:20 by clicking elsewhere (blur)')
await F.pic(p, 'probe-week-bar')
await c.browser.close()
