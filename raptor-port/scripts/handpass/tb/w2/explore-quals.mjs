import { L, sleep } from './w2lib.mjs'
console.log('explore-quals v1')
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
try {
  await L.go(w, 'quals')
  await L.pic(w, `explore-quals-${size}-0`)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals button, #page-quals a')].filter(b => b.getBoundingClientRect().width > 0).slice(0, 50).map(b => `${b.tagName}#${b.id}.${String(b.className).slice(0, 24)}|${(b.textContent || '').trim().slice(0, 30)}|${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 50)}|t=${(b.title || '').slice(0, 40)}`).join('\n')))
  console.log(await p.evaluate(() => (document.querySelector('#page-quals').innerText || '').slice(0, 500)))
} finally { await L.close(w) }
