// W2 J: phone refusal on U (new input into U), a tap on the toast area, reopen box and type; then the bell on PC healthy.
import * as L from './sm-lib.mjs'
import { readFileSync } from 'node:fs'
console.log('sm-w2-j v1')
const OUT = L.outDir('w2')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const s3 = JSON.parse(readFileSync(SCR + '/w2-state3.json', 'utf8'))
const log = (k, v) => console.log(k, JSON.stringify(v))
const U = await L.launch('phone', { origin: 'http://localhost:4393', state: s3, init: L.damageInit('raptor:weeks/13-07-2026#2') })
const { page } = U
const v = page.viewportSize(); const full = { x: 0, y: 0, width: v.width, height: v.height }
await L.signIn(U)
try {
  await L.fillNew(U, { who: 'Saint', type: 'Meeting', iso: '2026-07-16', remarks: 'phone refusal' })
  await L.pic(U, OUT, 's12-phone-before-save', { clip: full })
  await page.locator('#inpEditSave').tap(); await L.sleep(120)
  await L.pic(U, OUT, 's12-phone-refusal-100ms', { clip: full })
  await L.sleep(500)
  log('refusal', { toast: await L.toastText(U.page), win: await page.locator(L.T('win-inputedit')).count(), n: await page.evaluate(() => window.INPUTS.length) })
  await L.pic(U, OUT, 's12-phone-refusal-settled', { clip: full })
  // tap away (the title), tap the remarks again, type
  await page.locator('#inpEditRmk').tap(); await L.sleep(700)
  await page.keyboard.type(' more'); await L.sleep(300)
  log('retype', { rmk: await page.locator('#inpEditRmk').inputValue(), toast: await L.toastText(U.page) })
  await L.pic(U, OUT, 's12-phone-retyped', { clip: full })
} catch (e) { log('ERR', e.message.split('\n')[0]) }
log('errs', U.errs); await L.closeAll(U)
console.log('DONE')
