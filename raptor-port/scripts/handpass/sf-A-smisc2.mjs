import { launch, ctxOpen, sleep, go, shot, errors, rec } from './sf-A-lib.mjs'
console.log('sf-A-smisc2 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, 'smisc2')
await go(p, 'logic')
const found = await p.evaluate(() => {
  const el = [...document.querySelectorAll('#page-logic *')].filter(e => (e.textContent || '').includes('a standby shift earns none')).pop()
  if (!el) return null
  el.scrollIntoView({ block: 'center' })
  const r = el.getBoundingClientRect()
  return { text: el.textContent.replace(/\s+/g, ' ').trim(), top: r.top }
})
await sleep(300)
if (found) await p.evaluate(() => { const el = [...document.querySelectorAll('#page-logic *')].filter(e => (e.textContent || '').includes('a standby shift earns none')).pop(); el.style.outline = '2px solid #ff9a3c' })
const pic = await shot(p, 'A-misc-4-logic-earns-none')
const other = await p.evaluate(() => { const el = [...document.querySelectorAll('#page-logic *')].filter(e => e.children.length === 0 && /earns OIL by default/.test(e.textContent || ''))[0]; return el ? el.textContent.replace(/\s+/g, ' ').slice(0, 260) : null })
rec('misc', 'the Logic page line on OIL for a standby shift', 'must not say a standby shift earns none now that a flying one does by default', JSON.stringify({ line: found && found.text, laterOnTheSamePage: other }), found ? 'FAIL' : 'PASS', pic)
console.log('errors', JSON.stringify(errors))
await ctx.close(); await b.close()
