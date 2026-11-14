/* pdl-w1-probe1 v1 — who is free Mon-Thu, what the week looks like */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/probe')
console.log('pdl-w1-probe1 v1')
const X = await import('../rcf/rcf-w1-lib.mjs')
const w = await X.world('desktop')
const { page } = w
const info = await page.evaluate(() => {
  const P = window.PEOPLE
  const used = di => { const d = window.DAYS[di]; const s = new Set(); const js = JSON.stringify(d); for (const k of Object.keys(P)) if (js.includes('"' + k + '"')) s.add(P[k].cs); return [...s] }
  return { mon: window.DAYS[0].dt, curweek: window.CURWEEK, people: Object.entries(P).map(([k, p]) => k + ':' + p.cs + (p.arch ? '(arch)' : '')), d: [0,1,2,3].map(i => ({ di: i, dt: window.DAYS[i].dt, waves: window.DAYS[i].waves.length, usedBy: used(i) })), vconf: { crewRest: VCONF.crewRest, briefLead: VCONF.briefLead, debrief: VCONF.debrief } }
})
console.log(JSON.stringify(info, null, 1))
await X.L.go(page, 'logic'); await X.sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/logic.png' })
console.log(await page.evaluate(() => document.querySelector('#lgBody')?.innerText.slice(0, 600)))
console.log(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.id + '|' + b.innerText.trim().slice(0, 20)).join(' ; ')))
console.log(await page.evaluate(() => (document.querySelector('#lgBody input[data-lgset="crewRest"]')||{}).value))
console.log('errors', w.errors)
await w.browser.close()
