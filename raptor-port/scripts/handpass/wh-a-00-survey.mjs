/* [WARN-HIDE-KEPT] walker A — survey (read only): what each day flags, who is where, the day's DOM. */
import { world, warnsOf, pucks, flagged, openList, readList, pic, L, W, DAY } from './wh-lib.mjs'
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
for (let di = 0; di < 7; di++) {
  const w = await warnsOf(p, di)
  console.log(`\n=== ${DAY[di]} (${w.length})`)
  for (const x of w) console.log(`  ${x.ix} ${x.sev} ${x.code} who=${JSON.stringify(x.who)} off=${x.off} :: ${x.msg}\n       key=${x.key}`)
}
console.log('\nPEOPLE', JSON.stringify(await p.evaluate(() => Object.entries(window.PEOPLE).map(([id, v]) => `${id}:${v.cs}:${v.role || v.cat || ''}`))))
console.log('\nbridge', JSON.stringify(await p.evaluate(() => Object.keys(window).filter(k => /^[A-Z]{3,}$|^(go|openScheduler|loadWeek|histSnap|raptorRole|validate|selectPerson)$/.test(k)))))
/* the structure of a day on the edit week */
console.log('\nDAY DOM (Tue)', await p.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="1"]')
  const walk = (e, depth) => depth > 3 ? '' : [...e.children].map(c => '  '.repeat(depth) + c.tagName.toLowerCase() + (c.id ? '#' + c.id : '') + (c.className && typeof c.className === 'string' ? '.' + c.className.split(/\s+/).slice(0, 4).join('.') : '') + [...c.attributes].filter(a => a.name.startsWith('data-')).slice(0, 3).map(a => `[${a.name}=${a.value.slice(0, 20)}]`).join('') + '\n' + walk(c, depth + 1)).join('')
  return walk(d, 0).slice(0, 9000)
}))
console.log('\nDAYS[1] keys', JSON.stringify(await p.evaluate(() => { const d = window.DAYS[1]; const o = {}; for (const k of Object.keys(d)) o[k] = Array.isArray(d[k]) ? `array(${d[k].length})` : typeof d[k] === 'object' && d[k] ? Object.keys(d[k]).slice(0, 12) : d[k]; return o })))
await openList(p, '#eWeek', 1)
console.log('\nTUE LIST', JSON.stringify(await readList(p, '#eWeek', 1), null, 1))
await pic(p, 'survey-tue')
await openList(p, '#eWeek', 0)
console.log('\nMON LIST', JSON.stringify(await readList(p, '#eWeek', 0), null, 1))
await pic(p, 'survey-mon')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
