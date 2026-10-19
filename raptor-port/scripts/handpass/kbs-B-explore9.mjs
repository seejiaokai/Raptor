// exploration — VERSION 2
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore9 VERSION 2', size)
const A = await launch(size)
const { page } = A
await A.go('editsched'); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
const info = await page.evaluate(() => [...document.querySelectorAll('input,textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.dataset.bfld && !/^(ap|dn|pn|dtn|sn|gn):/.test(e.dataset.bfld) }).slice(0, 60).map(e => `${e.tagName} cls=${e.className} bfld=${e.dataset.bfld} val=${JSON.stringify(e.value)} ph=${e.placeholder}`))
console.log(info.join('\n'))
const all = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-bfld]')].map(e => e.dataset.bfld.replace(/[0-9]+/g, 'N')))])
console.log(all.join(' ; '))
console.log('errors', A.errors)
await A.close()
