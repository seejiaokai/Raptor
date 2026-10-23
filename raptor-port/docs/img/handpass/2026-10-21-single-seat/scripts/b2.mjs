import { L, snap, sideWarn } from './h.mjs'
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900, state: 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/state-a3.json' })
console.log(await page.evaluate(() => [...document.querySelectorAll('nav button, header button, [data-go]')].slice(0,20).map(b => b.innerText.trim() + ' ' + [...b.attributes].map(a => a.name + '=' + a.value).join(' '))).then(a => a.join('\n')))
await page.getByRole('button', { name: 'View-only Sched' }).click(); await page.waitForTimeout(800)
console.log('CURPAGE', await page.evaluate(() => window.CURPAGE))
await page.screenshot({ path: process.env.HP_SHOTS + '/b2a.png' })
console.log(await page.evaluate(() => [...document.querySelectorAll('#vWeek [data-sbday], #vWeek button')].filter(b=>b.offsetParent).slice(0,15).map(b => b.innerText.trim().slice(0,20) + ' ' + [...b.attributes].map(a => a.name + '=' + a.value.slice(0,20)).join(' '))).then(a => a.join('\n')))
console.log(errors)
await browser.close()
