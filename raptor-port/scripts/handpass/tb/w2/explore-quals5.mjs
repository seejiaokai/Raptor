import { L, sleep, toastNow } from './w2lib.mjs'
console.log('explore-quals5 v1')
const w = await L.world('desk')
const p = w.page
try {
  await L.go(w, 'quals')
  await p.click('#qEdit'); await sleep(400)
  await p.click('#qEditQuals'); await sleep(800)
  await L.pic(w, 'explore-quals-editquals')
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals th')].slice(4, 7).map(t => t.outerHTML.slice(0, 500)).join('\n')))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals button, #page-quals [role=button]')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top < 400).slice(0, 40).map(b => `#${b.id}.${String(b.className).slice(0,20)}|${(b.textContent || '').trim().slice(0, 30)}|${[...b.attributes].filter(a => a.name.startsWith('data-')||a.name.startsWith('aria')).map(a => a.name + '=' + a.value).join(',').slice(0, 50)}|t=${(b.title||'').slice(0,50)}`).join('\n')))
} finally { await L.close(w) }
