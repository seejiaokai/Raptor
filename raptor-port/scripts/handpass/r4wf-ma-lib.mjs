// r4wf-ma-lib — walker A of the merge walk (25 Nov 26): helpers over shr-a-lib.mjs. Results go to .tmp/r4wf-ma/.
import * as S from './shr-a-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
export * from './shr-a-lib.mjs'
const { L, J, sleep } = S
export const RES = []
export const res = (id, verdict, what, pics = []) => { RES.push({ id, tag: S.TAG, build: S.EXPECT_BUNDLE, verdict, what, pics }); console.log('RESULT', id, S.TAG, '|', verdict, '|', typeof what === 'string' ? what : J(what), '|', pics.join(', ')) }
export async function fin(name) {
  mkdirSync('.tmp/r4wf-ma', { recursive: true })
  writeFileSync(`.tmp/r4wf-ma/res-${name}-${S.EXPECT_BUNDLE}-${S.TAG}.json`, J({ results: RES, errors: L.facts.errors }, null, 1))
  console.log('PAGE ERRORS', J(L.facts.errors))
  await L.finish()
}
/* the sections of the Board, in order */
export const secs = p => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => s.getAttribute('data-secmove')))
/* the first visible Ground Programme remark box's selector */
export async function groundRmks(p, nth = 0) {
  const k = await p.evaluate(n => { const a = [...document.querySelectorAll('#sbBoard > [data-secmove$=".ground"] [data-bfld$=".rmks"]')].filter(e => e.getBoundingClientRect().width > 0); return a[n]?.getAttribute('data-bfld') || null }, nth)
  if (!k) throw new Error('no Ground Programme remark box on the Board')
  return `#schedBoard [data-bfld="${k}"]`
}
/* tap / click a box (no typing) */
export async function tapBox(w, sel, picName) { const l = w.page.locator(sel).first(); await l.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(150); await S.pressAt(w, sel, picName) }
/* a press that should keep the caret. KEEP=tap (a real tap / click) or js (element.click() — no blur). Returns caret before/after */
export async function keepPress(w, sel, picName) {
  const p = w.page, before = await S.caret(p)
  const how = process.env.KEEP || 'tap'
  /* how the caret goes, if it goes: the focusout's target still on the page (a blur) or not (the box rewritten) */
  await p.evaluate(() => { window.__maFo = []; const a = document.activeElement; if (a && a !== document.body) { const h = e => window.__maFo.push(`focusout of ${e.target.getAttribute?.('data-ifld') || e.target.tagName}, still on the page: ${e.target.isConnected}, to: ${e.relatedTarget ? (e.relatedTarget.id || e.relatedTarget.tagName) : 'none'}`); a.addEventListener('focusout', h, { once: true }); window.__maEl = a } })
  if (how === 'js') {
    await p.evaluate(s => document.querySelector(s).click(), sel)
    if (w.tap && picName) await p.screenshot({ path: `${L.OUT}/${picName}-lift.png`, scale: 'css' }).catch(() => {})
    await sleep(650)
  } else {
    const l = p.locator(sel).first()
    if (w.tap) { await l.tap(); if (picName) await p.screenshot({ path: `${L.OUT}/${picName}-lift.png`, scale: 'css' }).catch(() => {}); await sleep(650) }
    else { await l.click(); await sleep(300) }
  }
  const after = await S.caret(p)
  const fo = await p.evaluate(() => [...(window.__maFo || []), `the box ${window.__maEl ? (window.__maEl.isConnected ? 'still on the page' : 'gone from the page (rewritten)') : '-'}`])
  return { how, before, after, kept: before === after && after !== 'body', focusout: fo }
}
/* the Inputs page: the day window's cards for Wed 15 Jul */
export async function inputsDay(w) {
  const done = w.page.locator('#sbDone:visible').first(); if (await done.count()) { await done.click().catch(() => {}); await sleep(500) }
  await L.openDay(w, L.WED)
  const cards = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-iid], [data-testid="win-inputsday"] [data-popiid]')].map(c => (c.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 140)))
  return cards
}
/* the whole store of a day for the watched men (all types) */
export const dayStore = (p, ids) => S.store(p, ids)
export const T = S.TAG
