// ja-01: how the chart editor's Delete tool is pressed (no fixture).
import { mk, closeAll, finish, signIn, go, T, ballIds, pic, picsFor, note, step, arrange, tool, hit, ask, sleep } from './ja-lib.mjs'
import { openTrk } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-01-debug v1', SZ)
picsFor('j01-' + SZ)
try {
  const s = await mk(SZ); s.page.setDefaultTimeout(6000)
  await signIn(s, 'ad', 'a'); await openTrk(s, '142')
  note((await ballIds(s)).join(' '))
  await step('del', async () => {
    await arrange(s, true); await pic(s, '01-arr')
    await tool(s, 'Delete'); await pic(s, '02-tool')
    note('active tool: ' + await s.page.evaluate(() => [...document.querySelectorAll('#arrTools button.primary')].map(b => b.textContent.trim()).join('|')))
    const b = s.page.locator('#flowSvg .ball[data-id="ACG-02"]').first()
    await b.scrollIntoViewIfNeeded(); await sleep(s, 200)
    const r = await b.boundingBox(); note(JSON.stringify(r))
    const x = r.x + r.width / 2, y = r.y + r.height / 2
    note('at point: ' + await s.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName} id=${e.id} ${e.getAttribute('class')} parent=${e.parentElement?.id}/${e.parentElement?.className} in ball ${e.closest('.ball')?.dataset.id}` : 'none' }, [x, y]))
    if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y)
    await sleep(s, 500); note('after press: ' + JSON.stringify(await ask(s))); await pic(s, '03-after')
    note(JSON.stringify(await T(s)))
  })
  await s.ctx.close()
} finally { finish('j01-' + SZ); await closeAll() }
