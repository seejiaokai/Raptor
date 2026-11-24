// ra-00 - walker a's survey: the editor's tools, the parts of 142's chart, the longest link's middle point and whether a
// press there selects it, how far Shift+Tab goes to the squadron button, and which saved keys a plain pick writes.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, arrange, tool, T, log, pickSq, shut, trackerSaved, layoutDiff } from './rlib.mjs'
console.log('ra-00-survey v1', process.env.MQ_PORT)
picsFor('ra-00')
for (const sz of ['d', 'pc']) {
  await step('survey ' + sz, async () => {
    const s = await mk(sz); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await page.waitForTimeout(1800)
    const a0 = await trackerSaved(s, '142'), b0 = await trackerSaved(s, '149')
    log(sz, 'saved keys', Object.keys(a0).length, Object.keys(b0).length, Object.keys(a0).slice(0, 12))
    await pickSq(s, '149'); await shut(s); await page.waitForTimeout(1500)
    log(sz, 'on', (await T(s)).sq, (await T(s)).course?.now)
    const a1 = await trackerSaved(s, '142'), b1 = await trackerSaved(s, '149')
    log(sz, 'first visit of 149 changed', layoutDiff(a0, a1), layoutDiff(b0, b1))
    await pickSq(s, '142'); await shut(s); await page.waitForTimeout(1500)
    const a2 = await trackerSaved(s, '142'), b2 = await trackerSaved(s, '149')
    log(sz, 'back on 142 changed', layoutDiff(a1, a2), layoutDiff(b1, b2))
    await arrange(s, true); await page.waitForTimeout(400)
    log(sz, 'tools', await page.evaluate(() => [...document.querySelectorAll('#arrTools button')].map(b => (b.className.includes('on') ? '*' : '') + b.textContent.trim())))
    await pic(s, sz + '-01-editor')
    log(sz, 'parts', await page.evaluate(() => { const q = c => document.querySelectorAll('#flowSvg ' + c).length; return { ball: q('.ball'), edgehit: q('.edgehit'), linehit: q('.linehit'), lend: q('.lend'), lvert: q('.lvert') } }))
    await tool(s, 'Edit lines'); await page.waitForTimeout(200)
    const pts = await page.evaluate(() => {
      const bd = document.getElementById('board').getBoundingClientRect()
      return [...document.querySelectorAll('#flowSvg .edgehit')].map((p, i) => {
        const L = p.getTotalLength(), m = p.getPointAtLength(L / 2), c = p.getScreenCTM()
        const x = c.a * m.x + c.c * m.y + c.e, y = c.b * m.x + c.d * m.y + c.f
        const top = document.elementFromPoint(x, y)
        return { i, L: Math.round(L), x: Math.round(x), y: Math.round(y), scale: +c.a.toFixed(3), isIt: top === p, inBoard: x > bd.left + 8 && x < bd.right - 8 && y > bd.top + 8 && y < bd.bottom - 8 }
      }).filter(o => o.isIt && o.inBoard).sort((a, b) => b.L - a.L).slice(0, 4)
    })
    log(sz, 'longest pressable links', pts)
    if (pts[0]) {
      if (s.desk) await page.mouse.click(pts[0].x, pts[0].y); else await page.touchscreen.tap(pts[0].x, pts[0].y)
      await page.waitForTimeout(400)
      log(sz, 'after the press', await page.evaluate(() => { const q = c => document.querySelectorAll('#flowSvg ' + c).length; const h = document.querySelector('#flowSvg .linehandle'); return { linehandle: q('.linehandle'), endhandle: q('.endhandle'), box: h ? h.getBoundingClientRect().toJSON() : null, top: h ? (() => { const b = h.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return t ? t.tagName + '.' + (t.className?.baseVal ?? t.className) : null })() : null } }))
      await pic(s, sz + '-02-link-selected')
    }
    /* how many Shift+Tabs from the chart to the squadron button */
    let n = 0, on = null
    for (; n < 80; n++) { await page.keyboard.press('Shift+Tab'); on = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName); if (on === 'sqnMenuBtn') break }
    log(sz, 'Shift+Tab presses to the squadron button', n + 1, on)
    log(sz, 'burger', await page.evaluate(() => { const b = document.getElementById('burger'); if (!b) return null; const r = b.getBoundingClientRect(); return { w: Math.round(r.width), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } }))
    await s.ctx.close()
  })
}
finish('ra-00'); await closeAll()
