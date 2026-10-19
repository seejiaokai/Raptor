// exploration of wave templates, leave war, inputs, logic — VERSION 1
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore2 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('admin')
await page.evaluate(() => document.getElementById('admWaveTpl').click()); await page.waitForTimeout(500)
console.log('--- wave tpl'); console.log((await dumpBtns(page)).filter(x=>/tpl|wave|New/i.test(x)).join('\n'))
await A.shot('x-wavetpl')
console.log((await dumpInputs(page)).slice(-6).join('\n'))
await page.evaluate(() => document.getElementById('waveTplClose').click()); await page.waitForTimeout(300)
await A.go('leavewar'); await page.waitForTimeout(800)
await A.shot('x-lw')
console.log('--- lw btns'); console.log((await dumpBtns(page)).filter(x=>/testid=[a-z]/.test(x)).slice(0,60).join('\n'))
await A.go('inputs'); await page.waitForTimeout(500)
await A.shot('x-inputs')
console.log('--- inputs btns'); console.log((await dumpBtns(page)).slice(0,60).join('\n'))
await A.go('logic'); await page.waitForTimeout(500)
await A.shot('x-logic')
console.log('--- logic'); console.log((await dumpBtns(page)).slice(0,40).join('\n'))
console.log('errors', A.errors)
await A.close()
