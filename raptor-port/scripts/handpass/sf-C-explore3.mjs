import { launch, ctxOpen, openBoard, bPut, bType, bf, bPublish, sleep, shot, warns, errors, go } from './sf-C-lib.mjs'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await p.evaluate(() => window.addWave(5, 'avalon')); await sleep(500)
await openBoard(p, 5)
const seats = []
seats.push(await bPut(p, 5, 0, 0, 0, 'p', ['stiff']))
seats.push(await bPut(p, 5, 0, 0, 1, 'p', ['bane']))
seats.push(await bPut(p, 5, 0, 0, 2, 'p', ['slipway']))
seats.push(await bPut(p, 5, 0, 0, 3, 'p', ['dj']))
console.log('seats', seats)
const dump1 = async (tag) => {
  const r = await p.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const lit = [...b.querySelectorAll('.saflies')].filter(e => e.offsetParent).map(e => e.dataset.safly + (e.classList.contains('on') ? ':ON' : ':off') + ' "' + e.innerText.trim() + '"')
    const head = [...b.querySelectorAll('[class*=count],[class*=badge],[class*=cnt]')].filter(e => e.offsetParent).map(e => e.className + '=' + e.innerText.trim().replace(/\s+/g, ' ')).slice(0, 10)
    return { lit, head }
  })
  console.log(tag, JSON.stringify(r, null, 1))
}
await dump1('before')
const pub = await bPublish(p, 5)
console.log('pub', pub)
await bType(p, bf(5, 0, 0, 'rl'), '18:30')
await dump1('afterR')
console.log((await warns(p)).slice(0, 12).join(' | '))
const week = await p.evaluate(() => { const w = document.querySelectorAll('#eWeek .day'); return [...w].map(d => d.innerText.replace(/\s+/g, ' ').slice(0, 160)) })
console.log(week)
await shot(p, 'explore3')
console.log(errors)
await b.close()
