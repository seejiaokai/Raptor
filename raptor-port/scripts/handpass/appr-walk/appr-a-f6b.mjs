import * as C from './appr-a-common.mjs'
const TAG = process.env.F6B_TAG || 'fix1'
console.log('[appr-a-f6b v1]', TAG)
C.initLog(`appr-a-f6b-${TAG}-log.txt`)
const { browser, page } = await C.launchPhone('webkit')
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const m = () => P.evaluate(sel => {
  const b = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { t: +(r.top + scrollY).toFixed(1), b: +(r.bottom + scrollY).toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), h: +r.height.toFixed(1) } }
  const pk = document.querySelector('[data-testid="appr-range-picker"]'); const se = document.scrollingElement
  const sc = document.querySelector(`${sel} .appr-scroll`)
  return { innerW: innerWidth, innerH: innerHeight, room: se.scrollHeight - se.clientHeight, scrollY: +scrollY.toFixed(1), innerScroller: !!sc, bodyClass: document.body.className, chips: b(document.querySelector(`${sel} .appr-filters`)), pick: b(document.querySelector('[data-testid="appr-pick"]')), picker: b(pk), pickerParent: pk ? pk.parentElement.className : null, cols: b(document.querySelector(`${sel} .appr-cols`)), firstLine: b(document.querySelector(`${sel} [data-testid^="appr-line-"]`)), card: b(document.querySelector(`${sel} .appr-card`)), lines: document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`).length }
}, C.PAGE)
const m0 = await m(); C.note('closed: ' + JSON.stringify(m0))
await P.locator(T('appr-pick')).tap(); await C.sleep(1000)
const m1 = await m(); C.note('open: ' + JSON.stringify(m1))
await C.shot(P, `f6b-${TAG}-calendar-open`)
await P.evaluate(() => window.scrollTo(0, 0)); await C.sleep(300)
await P.screenshot({ path: C.OUT + `/appr-a-f6b-${TAG}-calendar-open-full.png`, fullPage: true })
C.check(`F6b-${TAG}-between`, !!m1.picker && m1.picker.t >= m1.chips.b - 1 && m1.cols.t >= m1.picker.b - 1 && !m1.innerScroller && m1.picker.t - m1.chips.b < 40, `${TAG}: calendar ${m1.picker?.t}-${m1.picker?.b} between the chips (foot ${m1.chips.b}) and the column headings (top ${m1.cols.t}); no inner scroller ${!m1.innerScroller}; calendar's parent "${m1.pickerParent}"`)
C.note(`${TAG} summary: chips foot ${m1.chips.b}, calendar ${m1.picker?.t}-${m1.picker?.b} (h ${m1.picker?.h}), headings top ${m1.cols.t}, first line top ${m1.firstLine.t}, card ${m1.card.t}-${m1.card.b}`)
C.note('errors ' + JSON.stringify(errs))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
