import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bPublish, bType, rlBox, rec, errors, openBoard, closeBoard, status } from './lib.mjs'
console.log('sc12 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, '12')
await p.addInitScript(() => { const d = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc'); if (d && d.set) Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', { set(v) { window.__pdfHtml = String(v); return d.set.call(this, v) }, get() { return d.get.call(this) }, configurable: true }) })
await p.reload(); await sleep(800)
if (await p.locator('#luser').isVisible().catch(() => false)) { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]') }
await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
await buildSat(p); await bPublish(p, 5)
const csvOf = async () => {
  await closeBoard(p); await go(p, 'editsched')
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.locator('#exportSched').click()])
  const path = await dl.path(); const fs = await import('node:fs'); const txt = fs.readFileSync(path, 'utf8')
  const lines = txt.split(/\r?\n/)
  return { head: lines[0], sat: lines.filter(l => /^"?Sat/.test(l)).slice(0, 3), mon: lines.filter(l => /^"?Mon/.test(l)).slice(0, 1) }
}
const pdfOf = async () => {
  await p.evaluate(() => { window.__pdfHtml = null })
  await p.locator('#exportPdf').click(); await sleep(1200)
  const h = await p.evaluate(() => window.__pdfHtml)
  if (!h) return null
  const th = (h.match(/<th>[^<]*<\/th>/g) || []).slice(0, 8).join('')
  const satRow = (h.match(/<tr[^>]*>(?:(?!<\/tr>).)*Sat(?:(?!<\/tr>).)*<\/tr>/gs) || []).slice(0, 1).map(x => x.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|').slice(0, 160))
  return { th, satRow }
}
const c0 = await csvOf(); const pdf0 = await pdfOf()
rec('12', 'desk', 'Published Saturday, R empty: Export (CSV) and PDF', 'a Rally column before Brief; the Saturday line prints blank in it (default never printed)', { csv: c0, pdf: pdf0 }, /Rally,Brief|"Rally","Brief"/.test(c0.head) ? 'PASS' : 'FAIL')
/* change R on the published day */
await openBoard(p, 5)
await bType(p, rlBox(5, 0, 0), '08:30')
const hist = async () => { await p.locator('#sbHist').click(); await sleep(800); const t = await p.evaluate(() => { const m = [...document.querySelectorAll('div,section,aside')].filter(e => e.offsetParent && /Rally|rally/.test(e.innerText || '') && e.innerText.length < 1500).sort((a, b) => a.innerText.length - b.innerText.length)[0]; return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 500) : '(nothing mentioning rally)' }); const pic = await shot(p, 'A12-history'); await p.keyboard.press('Escape'); await sleep(300); return { t, pic } }
const hh = await hist()
rec('12', 'desk', 'type R 08:30 on the published day, open History', 'the changes window names "Rally" for the change', hh.t, /rally/i.test(hh.t) && hh.t !== '(nothing mentioning rally)' ? 'PASS' : 'FAIL', hh.pic)
/* day info "To go out" */
await p.locator('#schedBoard [data-dayinfo="5"]').first().click(); await sleep(700)
const info = await p.evaluate(() => { const m = [...document.querySelectorAll('div,section,aside')].filter(e => e.offsetParent && /go out|To go/i.test(e.innerText || '') && e.innerText.length < 2000).sort((a, b) => a.innerText.length - b.innerText.length)[0]; return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 600) : '(no "go out" text)' })
rec('12', 'desk', 'open the day info (i) after the R change', '"To go out" words the change (rally)', info, /rally/i.test(info) ? 'PASS' : 'RECORD', await shot(p, 'A12-dayinfo'))
await p.keyboard.press('Escape'); await sleep(300)
/* export with the change pending */
const c1 = await csvOf(); const pdf1 = await pdfOf()
rec('12', 'desk', 'export while the R change is pending', 'the issued (empty) Rally prints, not the pending 08:30', { csv: c1.sat, pdf: pdf1 && pdf1.satRow }, !/08:30/.test(JSON.stringify(c1.sat)) ? 'PASS' : 'FAIL')
/* undo wording */
await openBoard(p, 5)
await p.locator('#sbUndo').click(); await sleep(400)
const toast = await p.evaluate(() => [...document.querySelectorAll('[class*=toast], #toast, .snack')].map(e => e.innerText).filter(Boolean))
const title = await p.locator('#sbUndo').getAttribute('title')
rec('12', 'desk', 'press Undo after the R change', 'the line/toast says "a rally time"', { toast, title }, /rally/i.test(JSON.stringify([toast, title])) ? 'PASS' : 'RECORD', await shot(p, 'A12-undo'))
await p.locator('#sbRedo').click(); await sleep(400)
/* amend */
const pub = await bPublish(p, 5)
const c2 = await csvOf(); const pdf2 = await pdfOf()
rec('12', 'desk', 'publish AL1, export again', 'the issued R 08:30 prints in the Rally column', { pub, csv: c2.sat, pdf: pdf2 && pdf2.satRow }, /08:30/.test(JSON.stringify(c2.sat)) ? 'PASS' : 'FAIL')
/* the AL mark on R, week page */
await go(p, 'editsched')
const week = await p.evaluate(() => { const e = document.querySelector('#eWeek [data-txt="ff:5.0.0.rl"]'); return e ? { cls: e.className, attrs: [...e.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 300), parent: e.parentElement.className } : null })
await p.locator('#eWeek .day[data-day="5"]').first().scrollIntoViewIfNeeded()
rec('12', 'desk', 'after AL1: the week page R box on Saturday', 'RECORD the AL mark on R', week, 'RECORD', await shot(p, 'A12-week-sat', p.locator('#eWeek .day[data-day="5"]').first()))
console.log('errors', JSON.stringify(errors)); await b.close()
