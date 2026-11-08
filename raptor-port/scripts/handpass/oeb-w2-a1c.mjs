// A1 third attempt: Comet (Personal 10:00-11:00) outside the mode on the phone, tap forced past the stability wait
import { newWorld, openBoard, sleep, close, shot, fileInput, tag, selCount, toast, standAt, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'a1c', process.env.SIZE || 'phone')
const w = await newWorld(process.env.SIZE || 'phone', 'sat')
try {
  await fileInput(w, { kind: 'Personal', person: 'Comet', rmk: 'W2 PERS', s: '10:00', e: '11:00' })
  await openBoard(w)
  const t = await tag(w.page, { cs: 'Comet', key: 'dn:5.0' }); console.log('tag', JSON.stringify(t))
  console.log('stand', await standAt(w.page, '[data-w2="1"]', 420)); await sleep(500)
  const before = await selCount(w.page)
  await w.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) t.textContent = '' })
  const loc = w.page.locator('[data-w2="1"]')
  if (w.phone) await loc.tap({ force: true, timeout: 8000 }); else await loc.click({ force: true })
  await sleep(100); await shot(w, 'a1-Comet-outside-' + w.size + '-' + (w.phone ? 'phone-right-after-tap' : 'pc-after'))
  await sleep(300)
  console.log('before', before, 'after', await selCount(w.page), 'toast', JSON.stringify(await toast(w.page)))
  await sleep(1000); await shot(w, 'a1-Comet-outside-' + w.size + '-settled')
} catch (e) { console.log('ERR', e.message.slice(0, 300)) }
await close(w)
