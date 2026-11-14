// W10 column alignment (measure copied from lw-m4-colalign.mjs, adapted to per-kind tags); BEFORE vs AFTER in an emulated desktop 1536x733
import * as C from './appr-a-common.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const TAG = process.env.W10_TAG || 'after'
console.log('[appr-a-w10 v1]', TAG)
C.initLog(`appr-a-w10-${TAG}-log.txt`)
const { browser, page } = await C.launchDesk()
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page
const measure = () => P.evaluate(() => {
  const words = el => { if (!el) return null; const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect(); return b.width ? b : null }
  const head = document.querySelector('.appr-cols:not(.ph)'); const hs = [...head.children]
  const cellsOf = l => { const c = [...l.children]; return [c[0].querySelector('.appr-puck'), c[1], c[2].querySelector('.appr-dlink'), c[3], c[4], c[5], c[6]] }
  const out = {}
  const tagsOf = l => {
    const t = []; const box = l.querySelector('.appr-box')?.innerText.trim(); if (box) t.push(box)
    const txt = l.innerText.replace(/\s+/g, ' ')
    if (/, (AM|PM)/.test(txt)) t.push('half'); if (/ – /.test(txt)) t.push('multi'); if (/by Saber/.test(txt)) t.push('bySaber'); if (/Approved|Refused|Already/.test(txt)) t.push('decided')
    if (!t.length) t.push('other'); return t
  }
  const lines = [...document.querySelectorAll('[data-testid^="appr-line-"]')]
  for (const [i, h] of hs.entries()) {
    const hb = words(h); if (!hb) continue
    const name = h.innerText.trim(); const right = getComputedStyle(h).textAlign === 'right' || h.classList.contains('r')
    for (const l of lines) {
      let c; try { c = cellsOf(l)[i] } catch { continue }
      const t = c && (c.classList?.contains('appr-avail') ? (c.querySelector('.appr-av .appr-n') ?? c.querySelector('.appr-av')) : c)
      const cb = t && (t.classList?.contains('appr-puck') || t.classList?.contains('appr-box') ? t.getBoundingClientRect() : words(t))
      if (!cb || !cb.width) continue
      const gap = +((right ? cb.right - hb.right : cb.left - hb.left)).toFixed(2)
      for (const tag of ['ALL', ...tagsOf(l)]) { const k = name + '|' + (right ? 'R' : 'L') + '|' + tag; if (!out[k] || Math.abs(gap) > Math.abs(out[k])) out[k] = gap }
    }
  }
  return out
})
const result = {}
async function take(label) { const m = await measure(); result[label] = m; const n = Object.keys(m).length; C.note(`${label}: ${n} cells measured; worst ${Math.max(...Object.entries(m).filter(([k]) => /\|ALL$/.test(k)).map(([, v]) => Math.abs(v))).toFixed(2)}`); await C.shot(P, `w10-${TAG}-${label}`) }
await take('top')
await P.mouse.move(700, 450); await P.mouse.wheel(0, 250); await C.sleep(600)
await take('scrolled250')
// decide one line then re-measure
await P.mouse.wheel(0, -400); await C.sleep(400)
await P.locator(C.PAGE + ' [data-testid^="appr-line-"]').nth(1).locator(C.T('appr-approve')).click({ force: false }).catch(e => C.note('decide click: ' + String(e).slice(0, 100)))
await C.sleep(500)
await take('decided-top')
await P.mouse.move(700, 450); await P.mouse.wheel(0, 250); await C.sleep(600)
await take('decided-scrolled250')
writeFileSync(path.join(C.OUT, `appr-a-w10-${TAG}-data.json`), JSON.stringify(result, null, 1))
C.note('errors ' + JSON.stringify(errs))
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
