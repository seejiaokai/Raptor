/* explore: list the board's buttons.  node explore-board.mjs phone|desk */
import { L, openBoard, sleep } from './w2lib.mjs'
console.log('explore-board v1')
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
try {
  await openBoard(w, +(process.argv[3] || 1))
  const list = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=button]')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.id ? '#' + b.id : ''}|${b.className.toString().slice(0, 30)}|${(b.textContent || '').trim().slice(0, 20)}|${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 60)}|t=${(b.title || '').slice(0, 40)}`))
  const uniq = [...new Set(list)]
  console.log(uniq.length, 'buttons\n' + uniq.filter(x=>!/data-(l|dr|dw|it|stcfg|g|p|n|sortsec|wv)[a-z]*=/.test(x) || /ginfo|gflag|gcx/.test(x)).join('\n'))
  await L.pic(w, `explore-${size}-board`)
} finally { await L.close(w) }
