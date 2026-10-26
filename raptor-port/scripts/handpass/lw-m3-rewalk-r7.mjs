// Re-walk item 7: Inputs page, a NEW leave with no document: the ask is in ordinary letters; "No document" files it and focus returns to "+ Input".
// usage: node lw-m3-rewalk-r7.mjs <phone|desktop> [chromium|webkit]
import * as L from './lw-m3-rewalk-lib.mjs'
const size = process.argv[2] || 'phone', engine = process.argv[3] || 'chromium'
const tag = `r7-${size === 'phone' ? 'ph' : 'dk'}-${engine === 'webkit' ? 'wk' : 'cr'}`
console.log('lw-m3-rewalk-r7 v1', size, engine, tag)
L.clearPrefix(tag)
const w = await L.newCtx(size, engine)
const P = w.page
await L.signInPlain(w, 'admin')
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
await L.press(w, '#inListBtn'); await P.waitForTimeout(600)
const newSel = '[data-testid="in-new"]'
console.log('+ Input button:', await P.evaluate(s => { const e = document.querySelector(s); return e ? { id: e.id, tid: e.dataset.testid, text: e.innerText.trim(), tag: e.tagName } : null }, newSel))
await L.press(w, newSel, w.phone ? tag + '-01-new-q' : null); await P.waitForTimeout(800)
await P.locator('#inpEditPerson').selectOption({ label: 'Ranger' })
await P.locator('#inpEditType').selectOption('LL'); await P.waitForTimeout(300)
await L.press(w, '[data-testid="inpEdCal-day-2026-07-21"]'); await P.waitForTimeout(400)
await L.shot(w, tag + '-02-new-window')
await L.press(w, '#inpEditSave', w.phone ? tag + '-03-save-q' : null); await P.waitForTimeout(900)
const askVis = await L.vis(P, L.T('docconf'))
const ask = await P.evaluate(() => {
  const root = document.querySelector('[data-testid="docconf"]'); if (!root) return null
  const parts = [...root.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() && e.getBoundingClientRect().width > 1).map(e => { const cs = getComputedStyle(e); return { text: e.textContent.trim(), tt: cs.textTransform, ls: cs.letterSpacing, fs: cs.fontSize, tag: e.tagName } })
  return { text: root.innerText.replace(/\s+/g, ' ').trim(), parts }
})
console.log('ask visible', askVis, JSON.stringify(ask))
await L.shot(w, tag + '-04-the-ask')
const sentence = ask?.parts.find(p => /attach the approval/i.test(p.text))
const ordinary = sentence && sentence.tt === 'none' && /^Attach the approval from the leave app now, or file it and attach it later\.$/.test(sentence.text)
L.rec(`7 ${size}/${engine} the ask's sentence is in ordinary letters`, size, askVis && ordinary ? 'PASS' : 'FAIL', `sentence "${sentence?.text}" text-transform ${sentence?.tt}, letter-spacing ${sentence?.ls}, size ${sentence?.fs}; head "${ask?.parts[0]?.text}" tt ${ask?.parts[0]?.tt}`, [tag + '-04-the-ask'])
// No document
await L.press(w, L.T('docconf-nodoc'), w.phone ? tag + '-05-nodoc-q' : null); await P.waitForTimeout(1000)
const after = await P.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, id: a?.id || '', tid: a?.dataset?.testid || '', text: (a?.innerText || '').trim().slice(0, 30) } })
const gone = !(await L.vis(P, L.T('docconf')))
await L.shot(w, tag + '-06-after-nodoc')
console.log('after No document: ask gone', gone, 'activeElement', JSON.stringify(after))
const newBtn = await P.evaluate(s => { const e = document.querySelector(s); return e ? { id: e.id, tid: e.dataset.testid } : null }, newSel)
L.rec(`7 ${size}/${engine} "No document" files it, focus returns to + Input`, size, gone && ((after.id && after.id === newBtn.id) || after.tid === newBtn.tid) ? 'PASS' : 'FAIL', `ask gone ${gone}; document.activeElement = <${after.tag}> id "${after.id}" testid "${after.tid}" text "${after.text}"; the + Input button is id "${newBtn?.id}" testid "${newBtn?.tid}"`, w.phone ? [tag + '-05-nodoc-q', tag + '-06-after-nodoc'] : [tag + '-06-after-nodoc'])
// the filing landed: the list row says No document
await P.evaluate(() => window.scrollTo(0, 0))
const rows = await P.evaluate(() => [...document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs .icard[data-iid]')].map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)).filter(t => /Ranger/.test(t) && /LL/.test(t)))
console.log('Ranger LL rows after filing', JSON.stringify(rows))
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
