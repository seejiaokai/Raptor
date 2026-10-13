import { L, sleep, toastNow } from './w2lib.mjs'
console.log('explore-quals4 v1')
const w = await L.world('desk')
const p = w.page
try {
  await L.go(w, 'quals')
  await p.click('#qEdit'); await sleep(400)
  await p.click('#qUses'); await sleep(800)
  console.log('page', await p.evaluate(() => window.CURPAGE))
  await L.pic(w, 'explore-quals-uses')
  console.log(await p.evaluate(() => [...document.querySelectorAll('button, [role=switch], input[type=checkbox]')].filter(b => b.getBoundingClientRect().width > 0 && b.closest('#page-quals, #page-admin, .airpop, [data-testid^=win]')).slice(0, 60).map(b => `${b.tagName}#${b.id}.${String(b.className).slice(0,20)}|${(b.textContent || '').trim().slice(0, 30)}|${[...b.attributes].filter(a => a.name.startsWith('data-')||a.name.startsWith('aria')).map(a => a.name + '=' + a.value).join(',').slice(0, 50)}|t=${(b.title||'').slice(0,40)}`).join('\n')))
} finally { await L.close(w) }
