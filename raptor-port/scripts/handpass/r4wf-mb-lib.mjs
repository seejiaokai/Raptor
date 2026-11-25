// r4wf-mb-lib — walker B's helpers for the merge walk (25 Nov 26), over shr-a-lib.mjs (whose routes passed today).
// Reads only; pictures to WR4_OUT, results to .tmp/r4wf-mb/.
import * as A from './shr-a-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
export * from './shr-a-lib.mjs'
const { L, J, TAG } = A
export const BUILD = /main/.test(L.NEW_DIR) ? 'main' : 'merged'
const RES = []
export const add = (id, verdict, what, pics = []) => { RES.push({ id, build: BUILD, tag: TAG, verdict, what, pics }); console.log('RESULT', id, BUILD, TAG, '|', verdict, '|', typeof what === 'string' ? what : J(what), '|', pics.join(', ')) }
export async function done(name) {
  mkdirSync('.tmp/r4wf-mb', { recursive: true })
  writeFileSync(`.tmp/r4wf-mb/res-${name}-${BUILD}-${TAG}.json`, J({ results: RES, errors: L.facts.errors }, null, 1))
  console.log('PAGE ERRORS', J(L.facts.errors))
  await L.finish()
}
/* where the caret is: the box's own address (an Inputs-row box, a Board box), else the element */
export const caretAt = p => p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return a.getAttribute('data-ifld') || a.getAttribute('data-bfld') || (a.id ? '#' + a.id : a.tagName + '.' + String(a.className).slice(0, 40) + (a.textContent ? ' "' + a.textContent.trim().slice(0, 20) + '"' : '')) })
/* the other sections a man shows in: Available crew, his flying puck, the warning count */
export const around = (p, ids) => p.evaluate(ids => {
  const avail = document.querySelector('#sbBoard > [data-secmove$=".avail"]')
  const wv = document.querySelector('#sbBoard > [data-secmove$=".waves"]')
  const o = { availHas: ids.filter(id => avail && avail.querySelector(`[data-person="${id}"]`)), warn: (document.querySelector('#sbWarn')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60) }
  o.flyPucks = wv ? [...wv.querySelectorAll('[data-person]')].filter(e => ids.includes(e.getAttribute('data-person'))).map(e => e.getAttribute('data-person') + ':' + String(e.className).replace(/\s+/g, '.')) : []
  return o
}, ids)
/* rows of the Unavailable list whose address names a man the record no longer holds (a held row) */
export const heldRows = p => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].filter(r => { const [iid, man] = r.getAttribute('data-inprow').split('~'); const rec = window.INPUTS.find(x => String(x.iid) === iid); return !rec || (man && !(rec.people || []).some(y => y.p === man)) }).map(r => r.getAttribute('data-inprow')))
/* a press with no sleep after it, so a picture can be taken "at once" */
export async function clickNow(w, sel) {
  const l = w.page.locator(sel).first()
  await l.evaluate(el => el.scrollIntoView({ block: 'center' }))
  if (w.tap) await l.tap(); else await l.click()
}
/* the store on any one date (shr-a-lib's store reads 13–17 Jul only) */
export const storeOn = (p, date, ids = ['bane', 'rocky']) => p.evaluate(([date, ids, names]) => window.INPUTS.filter(r => (r.people || []).some(x => ids.includes(x.p)) && (r.date === date || r.endDate === date))
  .map(r => `${r.type} ${(r.people || []).map(x => names[x.p] || x.p).join('+')} ${r.date}${r.endDate ? '–' + r.endDate : ''} ${r.allday ? 'allday' : (r.s ?? '?') + '-' + (r.e ?? '?')} "${r.remarks || ''}"${r.acc ? ' acc=' + r.acc : ''}${r.oil != null ? ' oil=' + JSON.stringify(r.oil) : ''} [${r.iid}]`), [date, ids, A.NAMES])
export async function readOn(p, date, label, ids = ['bane', 'rocky']) {
  const o = { step: label, store: await storeOn(p, date, ids), screen: await A.screen(p, ids), caret: await A.caret(p), agree: await A.agree(p, ids) }
  console.log('READ', label, J(o)); return o
}
export async function boardOn(w, di) { await A.go(w.page, 'editsched'); await w.page.evaluate(d => window.openScheduler(d), di); await A.sleep(900) }
/* a box's top on screen */
export const topOf = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top * 10) / 10 : null }, sel)
