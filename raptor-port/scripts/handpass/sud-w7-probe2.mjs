// w7 probe 2 (read only): Vandal's / Reaper's records; Fri's board fill zones (sim spare seats); Thu's empty seats.
import { DUMP } from './sud-w7-env.mjs'
const L = await import('./asp-w2-lib.mjs')
import { writeFileSync } from 'node:fs'
console.log('sud-w7-probe2 v1', L.URL_)
const sz = L.SIZES.d, W = L.mk('probe2', sz)
const { b, p } = await L.world(sz, W, '2026-07-13T09:00:00')
await L.signIn(p, 'ad', 'a')
const rec = await p.evaluate(() => ({ split: window.PEOPLE.split, dice: window.PEOPLE.dice, rocky: window.PEOPLE.rocky, diceTue: JSON.stringify(window.DAYS[1]).split('"dice"').length - 1,
  thuEmpty: (() => { const o = []; (window.DAYS[3].waves || []).forEach((w, gi) => (w.formations || []).forEach((f, li) => (f.aircraft || []).forEach((a, ai) => { if (!a.w) o.push(`3.${gi}.${li}.${ai}.w ${f.cs}`); if (!a.p) o.push(`3.${gi}.${li}.${ai}.p ${f.cs}`) }))); return o })() }))
console.log(JSON.stringify(rec).slice(0, 1500))
await L.openBoard(p, W, 4)
const z = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill], #schedBoard [data-slot]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.fill ? 'fill ' + e.dataset.fill : 'slot ' + e.dataset.slot)).filter(k => /s:|^fill [0-9]|^slot [0-9]/.test(k)).slice(0, 40))
console.log('FRI zones', z.join(' | '))
writeFileSync(DUMP + '/probe2.json', JSON.stringify({ rec, z }, null, 1))
console.log('errs', W.errs.join(' || '))
await b.close()
