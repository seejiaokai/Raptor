import { L, openBoard, sleep, clearToast, toastShown } from './w2lib.mjs'
console.log('explore-wave v1')
const w = await L.world('desk')
const p = w.page
try {
  await openBoard(w, 1)
  const b = p.locator('#schedBoard [data-wvadd="1"]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await w.press(b); await sleep(600)
  const t = await toastShown(p, 800)
  console.log('toast', JSON.stringify(t && t.text))
  await L.pic(w, 'explore-wave-0')
  console.log(await p.evaluate(() => [...document.querySelectorAll('button, [role=menuitem], .menu *, [data-wvk], [data-wvkind]')].filter(e => e.getBoundingClientRect().width > 0 && /^(SC|AVALON|BB|Standard|Wave|Flying)/i.test((e.textContent || '').trim())).slice(0, 20).map(e => `${e.tagName}.${String(e.className).slice(0, 20)}|${e.textContent.trim().slice(0, 30)}|${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')}`).join('\n')))
} finally { await L.close(w) }
