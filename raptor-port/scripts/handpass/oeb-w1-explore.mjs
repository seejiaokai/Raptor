console.log('oeb-w1-explore v1')
import { launch, closeAll, open, oilOn, sleep, pic, BAR, toTop, SW } from './oeb-w1-lib.mjs'
const size = process.argv[2] || 'pc'
const W = await launch(size)
try {
  await open(W)
  await toTop(W)
  console.log('BAR before:', await W.page.evaluate(() => document.querySelector('#schedBoard .daybar').outerHTML))
  await pic(W, 'explore-' + size + '-off', { sel: BAR, pad: 30 })
  await oilOn(W)
  await toTop(W)
  console.log('BAR on:', await W.page.evaluate(() => document.querySelector('#schedBoard .daybar').outerHTML))
  const info = await W.page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')].filter(p => p.getBoundingClientRect().width > 0).slice(0, 12).map(p => ({ t: p.innerText.trim(), cls: p.className, par: p.parentElement.className, key: p.getAttribute('data-key') || p.closest('[data-key]')?.getAttribute('data-key'), title: p.title })))
  console.log(JSON.stringify(info, null, 1))
  console.log('toolbar btns:', await W.page.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-oilmode]')].filter(b => b.getBoundingClientRect().width > 0).slice(0, 60).map(b => (b.id || '') + '|' + (b.className) + '|' + b.innerText.trim().slice(0, 20) + '|' + [...b.attributes].map(a => a.name).filter(n => n.startsWith('data-')).join(','))))
  console.log(W.errs)
} finally { await closeAll(W) }
