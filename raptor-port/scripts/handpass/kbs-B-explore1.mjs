// exploration — VERSION 1
import { launch } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore1 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('admin')
await A.shot('x-admin')
const ids = await page.evaluate(() => [...document.querySelectorAll('button,[id]')].filter(e => /adm/i.test(e.id)).map(e => e.id + ' ' + (e.innerText||'').slice(0,30).replace(/\n/g,' ')).slice(0, 60))
console.log(ids.join('\n'))
await page.evaluate(() => document.getElementById('admDutyTpl').click())
await page.waitForTimeout(600)
await A.shot('x-dutytpl')
const inputs = await page.evaluate(() => [...document.querySelectorAll('input,textarea,select')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName} id=${e.id} cls=${e.className} ph=${e.placeholder} val=${e.value} testid=${e.getAttribute('data-testid')||''} aria=${e.getAttribute('aria-label')||''}`))
console.log(inputs.join('\n'))
console.log('errors', A.errors)
await A.close()
