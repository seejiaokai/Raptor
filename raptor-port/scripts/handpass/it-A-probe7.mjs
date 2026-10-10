import { launch, open, shot, sleep, press } from './it-A-lib.mjs'
import { boardDoor } from './it-A-doors.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'phone')
const d = boardDoor(2)
page.setDefaultTimeout(6000)
try { await d.openNew(page, { st: '10:00', en: '11:00' }); console.log('opened'); await shot(page, 'probe7-open') } catch (e) { console.log('ERR', e.stack.split('\n').slice(0, 8).join('\n')); await shot(page, 'probe7-err') }
await browser.close()
