console.log('B probe3 v1')
import { launch, open, sleep, shot, elShot } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
console.log(await p.evaluate(() => window.DAYS.map((d, di) => d.waves.map((w, gi) => w.formations.map((f, li) => `${di}.${gi}.${li} ${f.cs} ${f.to}-${f.ld}: ` + f.aircraft.map(a => `${a.p}/${a.w}`).join(' ; ')))).flat(2).join('\n')))
console.log(await p.evaluate(() => Object.keys(window).filter(k => /^(WARN|REST|EVD|PEOPLE|SCHED|openScheduler|go|DAYS|CURDAY|curDay|setDay|gotoDay)/i.test(k))))
console.log(await p.evaluate(() => [...document.querySelectorAll('button,[data-act]')].filter(b => /day|prev|next|‹|›|←|→/i.test((b.dataset.act || '') + b.getAttribute('aria-label') + b.textContent)).slice(0, 20).map(b => b.outerHTML.slice(0, 160))))
await b.close()
