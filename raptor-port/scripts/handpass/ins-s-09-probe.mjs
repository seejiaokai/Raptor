import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await p.locator('button[title="Jump to a date"]:visible').first().click(); await S.sleep(600)
  const cells = await p.evaluate(() => [...document.querySelectorAll('[role=dialog] *, .rc *, .weekcal *, .popmenu *')].filter(e => e.offsetParent !== null && e.children.length === 0 && /^\d+$/.test(e.innerText.trim())).slice(0, 5).map(e => e.tagName + '|' + e.className + '|' + e.innerText + '|' + [...(e.closest('[data-cal],[data-day],[data-d],[data-date]') || e).attributes].map(a => a.name + '=' + a.value).join(',')))
  console.log(cells.join('\n'))
  const all = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null && /^22$/.test(e.innerText.trim())).map(e => e.outerHTML.slice(0, 200)))
  console.log(all.join('\n'))
  await B.pic(p, 'probe9-cal')
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
