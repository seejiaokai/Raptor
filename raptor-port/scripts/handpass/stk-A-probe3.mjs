import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
await S.weekText(p, 'dn:1.0', 'MARKTEST')
console.log(await p.evaluate(() => {
  const e = document.querySelector('#eWeek [data-txt="dn:1.0"]')
  const cs = getComputedStyle(e), cs0 = getComputedStyle(document.querySelector('#eWeek [data-txt="dn:0.0"]'))
  const up = []; let x = e; for (let i = 0; i < 3; i++) { up.push(x.tagName + '.' + x.className); x = x.parentElement }
  return { cls: e.className, color: cs.color, color0: cs0.color, bg: cs.backgroundColor, up, pend: Object.keys(window.SCHED.pending), keys: [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-txt]')].map(e => e.dataset.txt).filter(k => /^(dn|pn|dtn|sn|gn)/.test(k)) }
}))
console.log(await p.evaluate(() => [...new Set([...document.querySelectorAll('#eWeek .day[data-day="1"] *')].flatMap(e => typeof e.className === 'string' ? e.className.split(/\s+/) : []).filter(c => /chg|mark|edit|amd|pend|new|dif/i.test(c)))].join(' ')))
await browser.close()
