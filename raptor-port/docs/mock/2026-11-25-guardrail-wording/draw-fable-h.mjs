// The fresh Fable reader's picture for its new question H (25 Nov 26): the demo week AS IT SHIPS, Monday 13 Jul's
// Common Programme, where three rows are typed with a start and no end. The proposed frame adds only draw-g.mjs's one
// class `gw-noend` to the empty END boxes the app drew. Pictures go to img/fable/.
// Run from raptor-port/:  GW_URL=http://localhost:4791/ node docs/mock/2026-11-25-guardrail-wording/draw-fable-h.mjs
import * as K from './kit.mjs'
import path from 'node:path'
import { mkdirSync, renameSync } from 'node:fs'
const OUT = path.join(K.IMG, 'fable'); mkdirSync(OUT, { recursive: true })
const NOEND_CSS = `.gw-noend{box-shadow:inset 0 0 0 1px var(--hard)!important;border-radius:4px}
input.tm.gw-noend{border-color:var(--hard)!important;box-shadow:none!important}`
for (const key of ['d', 'p']) {
  const { b, p, sz } = await K.world(key)
  await K.signIn(p); await p.addStyleTag({ content: NOEND_CSS })
  await K.go(p, 'editsched')
  await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"]'); d && d.scrollIntoView({ inline: 'start' }) }); await K.wait(p, 900); await K.hideNote(p)
  const found = await p.evaluate(() => {
    const val = e => (e.tagName === 'INPUT' ? e.value : e.textContent).trim(), out = []
    for (const e of document.querySelectorAll('#eWeek [data-txt]')) {
      if (!e.getBoundingClientRect().width) continue
      const k = e.getAttribute('data-txt'), m = /^([a-z]+):(0\.[^ ]*?)\.end$/.exec(k); if (!m || m[1] === 'sr') continue
      const s = document.querySelector(`#eWeek [data-txt="${k.replace(/\.end$/, '.str')}"]`)
      if (val(e) === '' && s && val(s) !== '') { e.setAttribute('data-gwne', k); s.setAttribute('data-gwns', k); out.push(k + ' (start ' + val(s) + ')') }
    }
    const first = document.querySelector('[data-gwne]'); first && first.scrollIntoView({ block: 'center', inline: 'nearest' })
    return out
  })
  K.fact('FB-H', sz.name, 'Monday as the demo ships: programme and ground rows with a start and no end', found)
  if (found.length) {
    await K.wait(p, 500); await K.neutral(p)
    await p.evaluate(() => {
      document.querySelectorAll('[data-gwne]').forEach(e => e.classList.add('gw-noend'))
      /* the picture's frame: each flagged row, whole (the row the app drew round the END box) */
      document.querySelectorAll('[data-gwne]').forEach(e => { const r = e.closest('tr, .row, .arow, .prow, li') || e.parentElement.parentElement; r && r.setAttribute('data-gwrow', '1') })
    })
    await K.shot(p, sz, 'fb-h-monday-programme', ['[data-gwrow]', '[data-gwne]', '[data-gwns]'].flatMap(s => [s]), 16)
    /* K.shot frames the FIRST match of each selector: widen to every flagged row */
    const box = await p.evaluate(() => { const rs = [...document.querySelectorAll('[data-gwrow]')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0)
      return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) } })
    const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height, pad = 14
    const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
    await p.screenshot({ path: path.join(OUT, `fb-h-monday-programme-${sz.name}.png`), clip: { x, y, width: Math.min(vw, box.r + pad) - x, height: Math.min(vh, box.b + pad) - y } })
    renameSync(path.join(K.IMG, `fb-h-monday-programme-${sz.name}.png`), path.join(OUT, `fb-h-first-row-${sz.name}.png`))
  }
  await b.close()
}
K.saveFacts('fable-h'); renameSync(path.join(K.IMG, 'facts-fable-h.json'), path.join(OUT, 'facts-fable-h.json'))
