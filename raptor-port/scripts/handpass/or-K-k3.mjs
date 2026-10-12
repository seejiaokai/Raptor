// K3 - print and the PDF (RECORDED). Wed 15 Jul carries a Meeting of three + ALL AVAIL; the day is signed and published through the board;
// the Export-as-PDF button is pressed; what the print document lists is read from the iframe the app builds.
import * as K from './or-K-lib.mjs'
import { writeFileSync } from 'node:fs'
const { fileInput, goWeek, goBoard, shot, shotEl, inputsOf, saveRes, errs, toast, toastMark, toastsSince } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const filed = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], ph: ['allavail'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE })
console.log('filed', JSON.stringify(filed))
// sign the four and publish Wed through the board
await goBoard(p)
const sels = p.locator(`#schedBoard [data-signday="${K.DI}"]`)
const n = await sels.count()
for (let i = 0; i < n; i++) {
  const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
  if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
  await p.waitForTimeout(150)
}
await p.waitForTimeout(300)
let btn = p.locator(`#schedBoard [data-beak="${K.DI}"]`).first()
if (!(await btn.count())) btn = p.locator(`#schedBoard [data-alpub="${K.DI}"]`).first()
const label = (await btn.innerText()).trim(); console.log('publish button:', label, 'disabled', await btn.isDisabled())
await btn.evaluate(b => b.click()); await p.waitForTimeout(800)
const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await p.waitForTimeout(900) }
out.version = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
console.log('version chip:', out.version)
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(500)
await goWeek(p)
out.dayHead = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')][2].innerText.slice(0, 120).replace(/\s+/g, ' '))
console.log('Wed head:', out.dayHead)
// press Export as PDF and capture the print document the app builds (the iframe's srcdoc)
await p.evaluate(() => { window.__printCalls = 0; const orig = window.print; window.print = function () { window.__printCalls++; return orig && orig.apply(this, arguments) } })
await K.hideToast(p)
const mk = await toastMark(p)
await p.locator('#exportPdf').click()
await p.waitForTimeout(1500)
out.toast = await toastsSince(p, mk); console.log('toast:', out.toast)
const doc = await p.evaluate(() => { const f = document.querySelector('iframe[srcdoc]') || [...document.querySelectorAll('iframe')].pop(); return f ? { srcdoc: f.getAttribute('srcdoc') || f.srcdoc || (f.contentDocument && f.contentDocument.documentElement.outerHTML) || '' } : null })
console.log('iframe found:', !!doc, 'length', doc ? doc.srcdoc.length : 0)
if (doc) {
  writeFileSync('docs/handpass/parts/or-K-print.html', doc.srcdoc)
  const text = await (async () => {
    const pg = await ctx.newPage(); await pg.setContent(doc.srcdoc); const t = await pg.evaluate(() => document.body.innerText);
    out.printedSections = await pg.evaluate(() => [...document.querySelectorAll('section.day')].map(s => ({ head: s.querySelector('.dhead')?.innerText.replace(/\s+/g, ' ').trim(), rows: s.querySelectorAll('tbody tr').length, none: s.querySelector('.none')?.innerText || null })))
    await pg.setViewportSize({ width: 900, height: 1200 })
    await pg.screenshot({ path: K.OUT + '/k3-1-print-document.png', fullPage: true }); console.log('saved k3-1-print-document')
    await pg.close(); return t
  })()
  out.printText = text.replace(/\s+/g, ' ').slice(0, 1200)
  out.mentions = { rangeBrief: /range brief/i.test(text), meeting: /meeting/i.test(text), allAvail: /all avail/i.test(text), ground: /ground/i.test(text), drifter: /drifter/i.test(text), hunter: /hunter/i.test(text), ranger: /ranger/i.test(text) }
  console.log('PRINT sections:', JSON.stringify(out.printedSections)); console.log('MENTIONS', JSON.stringify(out.mentions))
}
out.printCalls = await p.evaluate(() => window.__printCalls)
console.log('print() calls on top window', out.printCalls)
await shot(p, 'k3-2-app-after-export')
// the CSV door too, as the other export door of the same page (record only: does it throw)
out.errs = errs.slice(); saveRes('k3', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
