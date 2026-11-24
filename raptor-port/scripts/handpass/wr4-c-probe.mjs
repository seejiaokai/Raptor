// Walker c — a read-only look at the seat keys the week and the board draw (to choose C2's seats). No change made.
console.log('wr4-c-probe v1')
const C = await (await import('./wr4-c-common.mjs')).setup('probe')
const { newPage, signIn, go, sleep, finish, TMP } = C
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
const w = await newPage('desk'); await signIn(w, 'ad')
await go(w.page, 'editsched')
const dump = root => w.page.evaluate(root => {
  const out = {}
  for (const e of document.querySelectorAll(root + ' [data-slot]')) {
    if (e.getBoundingClientRect().width < 3) continue
    const k = e.getAttribute('data-slot'); const shape = k.replace(/\d+/g, 'N').replace(/[a-z0-9]{12,}/g, 'ID')
    const p = e.querySelector('.puck[data-person]'); const cls = e.className
    ;(out[shape] ||= []).push({ k, who: p ? p.getAttribute('data-person') : null, cls: String(cls).slice(0, 60) })
  }
  const other = [...new Set([...document.querySelectorAll(root + ' [data-inpseat], ' + root + ' [data-fill], ' + root + ' [data-gman]')].map(e => [...e.attributes].map(a => a.name).filter(n => n.startsWith('data-')).join(',')))]
  return { shapes: Object.fromEntries(Object.entries(out).map(([s, v]) => [s, { n: v.length, ex: v.filter(x => x.who).slice(0, 3).concat(v.filter(x => !x.who).slice(0, 1)) }])), other }
}, root)
const week = await dump('#eWeek')
await w.page.evaluate(() => window.openScheduler(0)); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
const board = await dump('#schedBoard')
const pucks = await w.page.evaluate(() => [...new Set([...document.querySelectorAll('#schedBoard .puck')].map(p => p.parentElement.className + ' | ' + [...p.attributes].map(a => a.name).join(',')))].slice(0, 30))
writeFileSync(join(TMP, 'probe.json'), JSON.stringify({ week, board, pucks }, null, 1))
console.log('written'); await w.ctx.close(); await finish()
