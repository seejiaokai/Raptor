import { launch, proveBundle, phone, addWaveAndSeat, openBoard, shot, zoom, wait } from './sf-B-lib.mjs'
console.log('sf-B-probe1 v1')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  const DI = 5
  const gi = await addWaveAndSeat(p, DI, 'avalon', [[0, 0], [0, 1], [0, 2], [0, 3]])
  console.log('avalon gi', gi)
  console.log(await p.evaluate(([DI, gi]) => JSON.stringify(window.DAYS[DI].waves[gi], (k, v) => k === 'aircraft' ? v.map(a => ({ p: a.p, w: a.w, role: a.role, fly: a.fly })) : v).slice(0, 1500), [DI, gi]))
  await openBoard(p, DI)
  const info = await p.evaluate(() => {
    const q = s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).map(e => ({ tag: e.tagName, cls: e.className, attrs: [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' '), txt: (e.innerText || '').slice(0, 30), title: e.title || '' }))
    return { sarole: q('[data-sarole]'), safly: q('[data-safly]'), flies: q('.saflies'), ff: q('[data-bfld^="ff:5."]').slice(0, 12), vp: [innerWidth, innerHeight] }
  })
  console.log(JSON.stringify(info, null, 1).slice(0, 6000))
  console.log('zoom', await zoom(p))
  await shot(p, 'probe-board')
  console.log('errors', errors)
} finally { await browser.close() }
