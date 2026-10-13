import { L, sleep } from './w2lib.mjs'
console.log('explore-quals2 v1')
const w = await L.world('desk')
const p = w.page
try {
  await L.go(w, 'quals')
  await p.click('#qViewA').catch(() => {})
  await p.click('#qEdit'); await sleep(500)
  await L.pic(w, 'explore-quals-edit')
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals th, #page-quals th *')].filter(b => b.getBoundingClientRect().width > 0 && /button|span|a|i|b/i.test(b.tagName)).slice(0, 60).map(b => `${b.tagName}.${String(b.className).slice(0, 20)}|${(b.textContent || '').trim().slice(0, 14)}|${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 50)}|t=${(b.title || '').slice(0, 50)}`).join('\n')))
} finally { await L.close(w) }
