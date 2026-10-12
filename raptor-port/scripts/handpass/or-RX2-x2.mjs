import { open, shot, browser, sleep, WIN } from './or-RX2-lib.mjs'
const { ctx, page: p } = await open('ad', 'a', { fresh: true })
await p.evaluate(() => window.go('inputs')); await sleep(400)
if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await p.locator('#inListBtn').click(); await sleep(300); await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'LL'); await sleep(300)
console.log(await p.evaluate(() => [...document.querySelectorAll('#inpEditPop input, #inpEditPop select, #inpEditPop label, #inpEditPop button')].map(e => e.tagName + '#' + e.id + '.' + e.className + ' vis=' + !!e.offsetParent + ' "' + (e.textContent || e.value || '').trim().slice(0, 30) + '"').join('\n')))
await shot(p, 'x2-ll-window')
await ctx.close(); await browser.close()
