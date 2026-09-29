import { browser, fresh, go, shot, box, errors } from './lib.mjs'
const page = await fresh()
await go(page, 'editsched')
console.log('daywarn', await box(page, '#eWeek [data-daywarn="0"]'))
await page.click('#eWeek [data-daywarn="0"]'); await page.waitForTimeout(500)
await shot(page, 'p3-issues-open')
const rows = await page.$$eval('#eWeek [data-dwbox="0"] *', a => a.filter(e => e.offsetWidth && [...e.attributes].some(x => x.name.startsWith('data-'))).slice(0, 12).map(e => `${e.tagName}.${e.className} [${[...e.attributes].filter(x=>x.name.startsWith('data-')).map(x=>x.name+'='+x.value).join(' ')}] "${e.innerText.replace(/\s+/g,' ').slice(0,60)}"`))
console.log(rows.join('\n'))
// tap first issue row
const first = page.locator('#eWeek [data-dwbox="0"] .witem, #eWeek [data-dwbox="0"] [data-witem]').first()
console.log('witem count', await page.locator('#eWeek [data-dwbox="0"] .witem, #eWeek [data-dwbox="0"] [data-witem]').count(), await box(page, first))
if (await first.count()) { await first.click(); await page.waitForTimeout(900); await shot(page, 'p3-issue-tapped'); console.log('scrollY', await page.evaluate(() => window.scrollY)) }
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
// Templates on the week
await page.click('#eWeek [data-daytplopen="0"]'); await page.waitForTimeout(600)
await shot(page, 'p3-templates')
const dlg = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return (s.position === 'fixed' || s.position==='absolute') && e.offsetWidth > 200 && e.offsetHeight > 100 && s.visibility !== 'hidden' && s.display!=='none' && s.opacity !== '0' }).map(e => `${e.tagName}#${e.id}.${String(e.className).slice(0,40)} "${e.innerText.replace(/\s+/g,' ').slice(0,300)}"`).slice(0, 8))
console.log(dlg.join('\n'))
const btns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetWidth && e.closest('.modal,.sheet,[role=dialog],.tplpop,.pop,.wmenu,.popmenu,.tpl, [class*=tpl]')).map(e => { const b = e.getBoundingClientRect(); return `${e.tagName}#${e.id}.${e.className} [${[...e.attributes].filter(x=>x.name.startsWith('data-')).map(x=>x.name+'='+x.value).join(' ')}] "${e.innerText.replace(/\s+/g,' ').slice(0,40)}" @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` }))
console.log(btns.join('\n'))
console.log(errors)
await browser.close()
