/* explore: the phone board's bar and its ⋯ menu.  node explore-phone-bar.mjs */
import { L, openBoard, sleep } from './w2lib.mjs'
console.log('explore-phone-bar v1')
const w = await L.world('phone')
const p = w.page
const vis = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #sbMenu *, .sb-more *')].filter(b => b.tagName === 'BUTTON' && b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top < 260).map(b => `${b.id ? '#' + b.id : ''}|${(b.textContent || '').trim().slice(0, 24)}|${(b.getAttribute('aria-label') || b.title || '').slice(0, 40)}|${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 40)}`))
try {
  await openBoard(w, 5)
  console.log((await vis()).join('\n'))
  await L.pic(w, 'explore-phone-bar-0')
  const more = p.locator('#sbMore, #sbOverflow, #schedBoard button:has-text("⋯"), #schedBoard [aria-label*="More"]').first()
  console.log('more count', await more.count())
  if (await more.count()) { await w.press(more); await sleep(500); console.log('--- after more\n' + (await vis()).join('\n')); await L.pic(w, 'explore-phone-bar-1') }
} finally { await L.close(w) }
