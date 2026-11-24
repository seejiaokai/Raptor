// ra-02 - why a drawn line's end did not move under a finger at 402, and where a drawn line's corner handle is: read only.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, log, arrange, tool, fingerDown } from './rlib.mjs'
import { pressPoint, tapAt } from './ra-lib.mjs'
console.log('ra-02-lineprobe v1', process.env.MQ_PORT)
picsFor('ra-02')
for (const sz of ['d', 'pc']) await step('probe ' + sz, async () => {
  const s = await mk(sz); const { page } = s
  await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await page.waitForTimeout(1800)
  await arrange(s, true); await page.waitForTimeout(300); await tool(s, 'Edit lines'); await page.waitForTimeout(200)
  const p = await pressPoint(s, '.linehit'); await tapAt(s, p.x, p.y)
  log(sz, 'after a press on a line', await page.evaluate(() => {
    const info = c => [...document.querySelectorAll('#flowSvg ' + c)].slice(0, 6).map(e => { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y); return { x: Math.round(x), y: Math.round(y), w: +r.width.toFixed(1), top: t ? t.tagName + '.' + (t.className?.baseVal ?? '') : null, ta: getComputedStyle(e).touchAction } })
    return { lend: info('.lend'), lvert: info('.lvert') }
  }))
  await pic(s, sz + '-01-line-selected')
  if (!s.desk) {
    await page.evaluate(() => { window.__raEv = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel']) window.addEventListener(t, e => { if (window.__raEv.length < 40) window.__raEv.push(t + ':' + (e.target?.tagName || '') + '.' + (e.target?.className?.baseVal ?? '')) }, true) })
    const g = await page.evaluate(() => { const e = document.querySelector('#flowSvg .lend'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    const before = await page.evaluate(() => document.querySelector('#flowSvg .linehit[id]') ? 1 : 0)
    const f = await fingerDown(s, g.x, g.y); await f.move(g.x + 26, g.y + 22); await page.waitForTimeout(250)
    log(sz, 'events during a finger drag of the end', await page.evaluate(() => window.__raEv))
    await pic(s, sz + '-02-held')
    await f.up(); await page.waitForTimeout(300); log(sz, 'before', before)
  }
  await s.ctx.close()
})
finish('ra-02'); await closeAll()
