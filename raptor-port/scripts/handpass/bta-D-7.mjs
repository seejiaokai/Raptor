/* Walker D — S38: the CSV and the print-to-PDF export before and after an amendment, with a newly created blank line. RECORDED (the exports carry no warning furniture).
   The CSV is the app's own download, caught in the browser and read here; the PDF is the app's own hidden print page (its text is read, nothing is saved). */
import * as D from './bta-D-lib.mjs'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const T = 'S38'
const { browser, p, errors } = await K.fresh()
const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 8)
async function csv() {
  await W.boardOff(p).catch(() => {}); await B.toEdit(p)
  const b = p.locator('#exportSched:visible').first()
  if (!(await b.count())) return { err: 'no CSV button' }
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), b.click()])
  const path = await dl.path(); const text = readFileSync(path, 'utf8')
  const rows = text.split(/\r?\n/)
  const mine = rows.filter(r => /Vandal/.test(r))
  const widths = [...new Set(rows.filter(r => r.trim()).map(r => (r.match(/(?:"[^"]*"|[^,])+|(?<=,)(?=,)|^(?=,)|(?<=,)$/g) || []).length))]
  return { name: dl.suggestedFilename(), n: rows.length, hash: hash(text), mine, text, bad: rows.filter(r => /NaN|undefined|null/.test(r)).slice(0, 3), widths, tueRows: rows.filter(r => /Tuesday|Tue/.test(r)).slice(0, 2) }
}
async function pdfText() {
  await W.boardOff(p).catch(() => {}); await B.toEdit(p)
  const b = p.locator('#exportPdf:visible').first()
  if (!(await b.count())) return { err: 'no PDF button' }
  await b.click(); await sleep(1200)
  const r = await p.evaluate(() => {
    const f = [...document.querySelectorAll('iframe')].filter(x => x.style.position === 'fixed').pop()
    if (!f) return { err: 'no print frame found' }
    const doc = f.contentDocument; const t = doc ? doc.body.innerText : ''
    return { len: t.length, text: t, vandal: t.split('\n').filter(l => /Vandal/.test(l)).slice(0, 4), tue: (t.match(/Tuesday[^\n]*/) || [''])[0] }
  })
  return { ...r, hash: r.text ? hash(r.text) : null }
}
const say = (c, d) => `CSV "${c.name}": ${c.n} lines, hash ${c.hash}, widths ${JSON.stringify(c.widths)}, malformed cells ${JSON.stringify(c.bad)}, rows naming Vandal: ${JSON.stringify(c.mine)} · PRINT PAGE: ${d.err || `${d.len} characters, hash ${d.hash}, Tuesday heading "${d.tue}", lines naming Vandal ${JSON.stringify(d.vandal)}`}`
try {
  const s0 = await D.seatBlank(p)
  const c0 = await csv(); const d0 = await pdfText()
  R(`${T}.0`, `before anything is published: a blank flying line with ${CSN} on it (took ${s0.took}); CSV and print page opened from Edit Schedule`, say(c0, d0), 'RECORDED', [await B.pic(p, 'dk-s38-0-unpublished')])
  await D.file(p, 'LL', 'Walker D')
  await D.pub(p)
  const c1 = await csv(); const d1 = await pdfText()
  R(`${T}.1`, `LL filed; Tuesday published (the day goes out with the red line); exports again`, say(c1, d1) + ` · CSV differs from before publishing: ${c1.hash !== c0.hash} · mentions any warning wording: ${/leave|planned to fly|warning/i.test(c1.text) || /planned to fly|On leave/i.test(d1.text || '')}`, 'RECORDED', [await B.pic(p, 'dk-s38-1-published')])
  /* a working change after the issue: the blank line gets a callsign — pending, not issued */
  await K.ff(p, TUE, s0.gi, 0, 'cs', 'ZQ'); await W.boardOff(p).catch(() => {})
  const w = await D.work(p, 'dk-s38-2-W', { puck: false })
  const c2 = await csv(); const d2 = await pdfText()
  R(`${T}.2`, `after the issue the line's callsign ZQ typed (working copy reads "${w.hd.pend}"); exports again`, say(c2, d2) + ` · CSV unchanged from the issued one: ${c2.hash === c1.hash} · print page unchanged: ${d2.hash === d1.hash} · ZQ appears in CSV: ${/ZQ/.test(c2.text)}, in print page: ${/ZQ/.test(d2.text || '')}`, c2.hash === c1.hash && d2.hash === d1.hash && !/ZQ/.test(c2.text) ? 'PASS' : 'FAIL', [w.shot])
  const am = await D.amend(p)
  const c3 = await csv(); const d3 = await pdfText()
  R(`${T}.3`, `Publish AL1 (${JSON.stringify(am.r)}); exports again`, say(c3, d3) + ` · CSV differs from the issued one: ${c3.hash !== c1.hash} · ZQ in CSV: ${/ZQ/.test(c3.text)}, in print page: ${/ZQ/.test(d3.text || '')}`, /ZQ/.test(c3.text) && /ZQ/.test(d3.text || '') ? 'PASS' : 'FAIL', [await B.pic(p, 'dk-s38-3-after-AL1')])
} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, 's38-X')]) }
R(`${T}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-D-s38')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2600)}\n      pics ${(r.pics || []).join(' ')}`)
