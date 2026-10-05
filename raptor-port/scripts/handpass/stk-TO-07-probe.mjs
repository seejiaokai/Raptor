/* walker TO — probe (throw-away world) for P2-17: can Monday go out once its four timing lines are in order and an
   unrecognised-clock line is left; what the CSV and print buttons do; where the next-week peek is; the member's view. */
import { writeFileSync, readFileSync } from 'node:fs'
import * as T from './stk-TO-lib.mjs'
const { W, L } = T
const out = {}
const w = await T.world()
const p = w.p
try {
  await W.toastSpy(p)
  await T.toEdit(p); await W.showDay(p, 0)
  await T.itType(p, 'week', 0, 0, 0, '10:00H: FIRST WAVE VL IN TIME + WX/NOTAMS')
  await T.itType(p, 'week', 0, 0, 1, '11:00H: FIRST WAVE RU IN TIME + WX/NOTAMS')
  await T.itType(p, 'week', 0, 1, 0, '17:00H: NIGHT WAVE VL IN TIME + WX/NOTAMS')
  await T.itType(p, 'week', 0, 1, 1, '16:40H: NIGHT WAVE RU IN TIME + WX/NOTAMS')
  await T.itAdd(p, 'week', 0, 0); out.third = await T.itType(p, 'week', 0, 0, 2, 'VL RALLY AT 25:70')
  out.lines = [await T.itRead(p, 'week', 0, 0), await T.itRead(p, 'week', 0, 1)].map(r => r.lines.join(' / ') + ' :: ' + r.fb)
  out.list = (await T.linesFull(p, 0, /In-time|reporting/i)).map(l => l.sev + ' ' + l.text)
  await W.toasts(p)
  const pub = await T.pubOrig(p, 0)
  out.pub = { r: pub.r, said: await W.toasts(p), head: await T.head(p, 0) }
  /* CSV */
  const dl = p.waitForEvent('download', { timeout: 6000 }).catch(e => null)
  await p.locator('#exportSched:visible').first().click(); await L.sleep(600)
  out.csvUi = await p.evaluate(() => [...document.querySelectorAll('.modal:not([hidden]), .wavemenu, [role=dialog], [role=menu]')].filter(e => e.offsetParent !== null).map(e => e.innerText.slice(0, 400)))
  const d = await dl
  if (d) { const path = process.env.STK_DUMP.replace(/\.json$/, '.csv'); await d.saveAs(path); const txt = readFileSync(path, 'utf8'); out.csv = { name: d.suggestedFilename(), len: txt.length, head: txt.slice(0, 1500), it: txt.split(/\r?\n/).filter(l => /IN TIME|RALLY/i.test(l)).slice(0, 12) } }
  else out.csv = 'no download fired'
  await T.pic(p, 'probe-after-csv')
  await p.keyboard.press('Escape'); await L.sleep(200)
  /* print */
  await p.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++ } })
  const pop = p.context().waitForEvent('page', { timeout: 3000 }).catch(() => null)
  await p.locator('#exportPdf:visible').first().click(); await L.sleep(900)
  const np = await pop
  out.print = { printed: await p.evaluate(() => window.__printed), newPage: !!np, ui: await p.evaluate(() => [...document.querySelectorAll('.modal:not([hidden]), .wavemenu, [role=dialog], [role=menu], #printRoot, .printsheet, [class*=print]')].filter(e => e.offsetParent !== null || /print/i.test(e.id + e.className)).slice(0, 6).map(e => (e.id || e.className) + ' :: ' + (e.innerText || '').slice(0, 300))), bodyCls: await p.evaluate(() => document.body.className) }
  await T.pic(p, 'probe-after-print')
  await p.emulateMedia({ media: 'print' }); await L.sleep(300)
  out.printText = await p.evaluate(() => document.body.innerText.slice(0, 2500))
  await T.pic(p, 'probe-print-media', { fullPage: true })
  await p.emulateMedia({ media: 'screen' })
  await p.keyboard.press('Escape'); await L.sleep(200)
  /* the peek */
  await T.toPage(p, 'viewsched')
  out.weekBtns = await p.evaluate(() => [...document.querySelectorAll('#page-viewsched [data-wk], #page-viewsched [data-wpk], #page-viewsched [data-wpd], #page-viewsched [data-peek-day]')].map(e => ({ tag: e.tagName, t: (e.innerText || '').trim().slice(0, 40), a: [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' '), vis: e.offsetParent !== null, cls: e.className })).slice(0, 30))
  const prev = p.locator('#page-viewsched [data-wk]:visible', { hasText: 'Jul 06' }).first()
  if (await prev.count()) { await prev.click(); await L.sleep(900) }
  out.afterPrev = await p.evaluate(() => ({ week: window.CURWEEK, days: [...document.querySelectorAll('#vWeek .day')].map(e => ({ d: e.dataset.day, cls: e.className, peek: e.dataset.peekDay || null, head: (e.querySelector('.dow, .dhead, h3') || e).innerText.slice(0, 40).replace(/\s+/g, ' ') })), peek: [...document.querySelectorAll('[data-peek-day], [data-wpk], [data-wpd]')].map(e => ({ t: (e.innerText || '').slice(0, 200).replace(/\s+/g, ' '), a: [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' '), cls: e.className, vis: e.offsetParent !== null })).slice(0, 12) }))
  await p.evaluate(() => { const sc = document.querySelector('#vWeek'); if (sc) sc.scrollLeft = sc.scrollWidth }); await L.sleep(400)
  await T.pic(p, 'probe-view-prev-week-end')
} catch (e) { out.err = String(e && e.stack || e) }
out.errors = w.errors
writeFileSync(process.env.STK_DUMP, JSON.stringify(out, null, 1))
await w.browser.close()
console.log(JSON.stringify(out, null, 1).slice(0, 12000))
