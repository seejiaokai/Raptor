/* probe 4: duty / ground rows, the view-only version switch, Logic, week navigation (own world, thrown away) */
import * as A from './ins-a-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const log = (k, v) => console.log(`## ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 3500))
const step = async (k, f) => { try { log(k, await f()) } catch (e) { log(k + ' ERR', String(e).slice(0, 300)) } }
await A.toEdit(p)
await A.pubOrig(p, 1)
await step('day keys', () => p.evaluate(() => Object.keys(window.DAYS[1])))
await step('day rows', () => p.evaluate(() => { const d = window.DAYS[1]; const o = {}; for (const k of Object.keys(d)) if (Array.isArray(d[k]) || (d[k] && typeof d[k] === 'object')) o[k] = JSON.stringify(d[k]).slice(0, 330); return o }))
await W.boardOn(p, 1)
await step('board fields', () => p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-fill]')].map(e => (e.dataset.bfld || 'FILL ' + e.dataset.fill)).filter(s => /^(dl|dr|gr|FILL d|FILL g|FILL a)/.test(s)).slice(0, 80)))
/* + row on the first duty block, + item on ground */
await step('dradd', async () => { const b = p.locator('#schedBoard [data-dradd="1.0"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await L.sleep(500); return p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="dl:1.0"], #schedBoard [data-bfld^="dr:1.0"], #schedBoard [data-fill^="d:1.0"], #schedBoard [data-rolepick^="1.0"]')].map(e => (e.dataset.bfld || e.dataset.fill || 'ROLE ' + e.dataset.rolepick) + '=' + (e.value ?? '')).slice(-14)) })
await A.pic(p, 'probe4-duty-row')
await step('gradd', async () => { const b = p.locator('#schedBoard [data-gradd="1"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await L.sleep(500); return p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="gr:1"], #schedBoard [data-fill^="g:1"], #schedBoard [data-bfld^="g"]')].map(e => (e.dataset.bfld || e.dataset.fill) + '=' + (e.value ?? '')).slice(-14)) })
await A.pic(p, 'probe4-ground-row')
await step('head', () => A.head(p, 1))
await W.boardOff(p)
await L.go(p, 'viewsched'); await W.showDay(p, 1, '#vWeek')
await step('dver', () => p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="1"]'); const s = d.querySelector('select'); return { sel: s ? s.outerHTML.replace(/\s+/g, ' ').slice(0, 600) : null, head: d.querySelector('.dhead, .day-head, header') ? d.querySelector('.dhead, .day-head, header').innerText.replace(/\s+/g, ' ').slice(0, 200) : d.innerText.replace(/\s+/g, ' ').slice(0, 200) } }))
await A.pic(p, 'probe4-viewsched')
await L.go(p, 'logic'); await L.sleep(500)
await A.pic(p, 'probe4-logic')
await step('logic', () => p.evaluate(() => { const pg = [...document.querySelectorAll('[id^="page-"]')].find(e => e.offsetParent !== null); return { id: pg && pg.id, btns: [...pg.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + ':' + e.innerText.trim().slice(0, 30)).slice(0, 40), txt: pg.innerText.replace(/\s+/g, ' ').slice(0, 700) } }))
await step('topbar', () => p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().top < 110).map(e => (e.id || e.className) + ':' + e.innerText.trim().slice(0, 16) + (Object.keys(e.dataset).length ? JSON.stringify(e.dataset) : '')).slice(0, 50)))
console.log('errors', errors)
await browser.close()
