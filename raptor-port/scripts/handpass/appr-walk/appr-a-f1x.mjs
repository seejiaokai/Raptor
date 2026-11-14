import * as C from './appr-a-common.mjs'
console.log('[appr-a-f1x v1]')
C.initLog('appr-a-f1x-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
await setWin(1550, 560)
await C.wheelList(P, 300)
C.note('list before pick: ' + await C.listY(P))
await P.locator(T('appr-pick')).click(); await C.sleep(900)
const d = await P.evaluate(sel => {
  const b = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), h: +r.height.toFixed(1) } }
  const pk = document.querySelector('[data-testid="appr-range-picker"]'); const sc = document.querySelector(`${sel} .appr-scroll`)
  const anc = []; for (let e = pk; e && e !== document.body; e = e.parentElement) anc.push(e.tagName + '.' + (e.className || '').toString().slice(0, 40))
  return { inner: innerHeight, picker: b(pk), pickerInScroll: !!sc?.contains(pk), anc: anc.slice(0, 6), scroller: b(sc), scTop: sc?.scrollTop, scRoom: sc ? sc.scrollHeight - sc.clientHeight : null, cols: b(document.querySelector(`${sel} .appr-cols`)), card: b(document.querySelector(`${sel} .appr-card`)), cardScrollTop: document.querySelector(`${sel} .appr-card`)?.scrollTop, d31: b(document.querySelector('[data-testid="appr-range-day-2026-01-31"]')) }
}, C.PAGE)
C.note(JSON.stringify(d, null, 1))
await C.shot(P, 'f1x-560-open')
C.note('errors ' + JSON.stringify(errs))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
