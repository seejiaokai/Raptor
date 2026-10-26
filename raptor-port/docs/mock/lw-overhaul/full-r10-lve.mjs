// Round 10 (22 Oct 26): the LVE tile of Ranger's person window redrawn for D1217 (App bal vs War bal, "pending",
// days not requests) and D1218 (carried-forward leave: one year, then gone). Drawn INTO THE REAL LOCAL BUILD on the
// staged squadron (clock Thu 8 Jan 26; <LWMOCK_OUT>/out/state.json), from the r7 person window's own helpers, read
// from full-r7-person.mjs between its markers exactly as full-r9-open.mjs does. Nothing here is built.
//   r10-lve-rest-phone       at rest: War bal 14.5 big; App bal 17 (the box he taps); 2½ days pending; carried fwd 4
//   r10-lve-edit-phone       App bal tapped: the tile opens across the row — App bal box 17, War bal after pending,
//                            the carried-fwd box 4 and the date it ends; the phone's number keys up
//   r10-lve-cf-gone-phone    1 Jan 27: the 2 carried-fwd days unused are gone (App bal 15, War bal 12.5), one quiet note
// INVENTED for the pictures: 4 of his 17 are carried forward (ending 31 Dec 26); on 1 Jan 27 2 of them were unused.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r10-lve.mjs      (R10_ONLY=rest,edit,gone)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, mk, unmk, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const ONLY = (process.env.R10_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const PR = load(cut(SRC('full-r7-person.mjs'), 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME'])

// the tile's own pieces, in the r7 window's look (the figure, the grey small lines, the editable box)
const CSS = `
.bidsheet .zz-lve10{gap:3px}
.bidsheet .zz-lve10 .wb{display:flex;align-items:baseline;gap:6px}
.bidsheet .zz-lve10 .wb .r7-fig{border-color:transparent;background:transparent;align-self:auto}
.bidsheet .zz-lve10 .cap{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .zz-lve10 .ln{font:600 11px/1.25 system-ui;color:#8a96a3;font-variant-numeric:tabular-nums;white-space:nowrap}
.bidsheet .zz-lve10 .ln b{color:#e6edf3;font-weight:700}
.bidsheet .zz-lve10 .ab{display:inline-flex;align-items:center;gap:5px}
.bidsheet .zz-lve10 .sbox{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:20px;padding:0 5px;box-sizing:border-box;border:1px solid #39424D;border-radius:5px;background:#0d1217;color:#f1f4f7;font:700 12.5px/1 system-ui;font-variant-numeric:tabular-nums}
.bidsheet .zz-lve10 .cf{margin-top:3px;padding-top:4px;border-top:1px solid #26303a}
.bidsheet .zz-lve10 .gone{margin-top:3px;padding-top:4px;border-top:1px solid #26303a;white-space:normal}
/* editing: the tile opens across the whole row (the row under it moves down, the tapped box stays where it was) */
.bidsheet .r7-t.zz-lve10.open{grid-column:1/-1;gap:6px;box-shadow:inset 0 0 0 1px rgba(59,198,232,.35);background:#121a21}
.bidsheet .zz-lve10 .er{display:grid;grid-template-columns:auto 1fr;column-gap:9px;row-gap:3px;align-items:center}
.bidsheet .zz-lve10 .er .r7-fig{margin-left:0;align-self:center;min-width:54px;text-align:center}
.bidsheet .zz-lve10 .er .k{font:700 12.5px/1.2 system-ui;color:#e6edf3;white-space:nowrap}
.bidsheet .zz-lve10 .er .k span{font-weight:600;color:#8a96a3}
.bidsheet .zz-lve10 .er .s{grid-column:2;font:600 11.5px/1.2 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .zz-lve10 .er .s b{color:#fff;font-variant-numeric:tabular-nums}
.bidsheet .zz-lve10 .er .s.gap{margin-bottom:6px}
`

// War bal = App bal less the days pending (D1217); the carried-forward part with the date it ends (D1218)
const rest = ({ war = '14.5', app = '17', pend = '2½', cf = '4', ends = '31 Dec', gone } = {}) =>
  `<span class="lb">LVE</span>` +
  `<span class="wb" data-zk="war"><span class="r7-fig">${war}</span><span class="cap">War bal</span></span>` +
  `<span class="ln ab" data-zk="app">App bal <span class="sbox">${app}</span></span>` +
  `<span class="ln" data-zk="pend">${pend} days pending</span>` +
  (cf ? `<span class="ln cf" data-zk="cf">incl. carried fwd <b>${cf}</b><br>ends ${ends}</span>` : '') +
  (gone ? `<span class="ln gone" data-zk="gonenote">${gone}</span>` : '')
const editing = () =>
  `<span class="lb">LVE</span>` +
  `<div class="er">` +
  `<span class="r7-fig editing" data-zk="appbox"><span class="sel">17</span><span class="caret"></span></span><span class="k">App bal <span>— from the leave app</span></span>` +
  `<span class="s gap" data-zk="warline">War bal <b>14.5</b> · after 2½ days pending</span>` +
  `<span class="r7-fig ed" data-zk="cfbox">4</span><span class="k">of which carried fwd</span>` +
  `<span class="s">ends 31 Dec 26</span>` +
  `</div>`

async function scene(p, html, o = {}) {
  await PR.stage(p, true, PR.ME.member); await PR.gridAsBuilt(p)
  await PR.openPerson(p, true, 'bane', PR.personHTML('bane', { edit: true }))
  await p.evaluate(([css, html, open]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    const t = document.querySelector('.zz-lve'); t.classList.add('zz-lve10'); if (open) t.classList.add('open'); t.innerHTML = html
    // "pending", not "waiting", wherever the Leave War names an undecided request (D1217) — the list's state words
    for (const n of document.querySelectorAll('.bidsheet .r7-ln .s.wait')) n.textContent = 'Pending'
    // and My leave, counted in days
    for (const b of document.querySelectorAll('[data-zk="ml"] .b, .zml[data-zk="ml"]'))
      for (const w of [...b.childNodes].filter(n => n.nodeType === 3 && /\d+ waiting/.test(n.textContent))) w.textContent = w.textContent.replace(/\d+ waiting/, () => '2½ pending')
  }, [CSS, html, !!o.open])
  await p.waitForTimeout(150)
}
const keys = async p => {
  await p.evaluate(() => {
    const k = document.createElement('div'); k.className = 'r7-kbd zz-kbd'
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['.', '', 'f'], ['0', ''], ['⌫', '', 'f']]
    k.innerHTML = `<div class="acc">Done</div><div class="keys">${keys.map(([a, b, f]) => `<span class="k${f ? ' f' : ''}">${a}${b ? `<small>${b}</small>` : ''}</span>`).join('')}</div>`
    document.body.appendChild(k)
  })
  return Math.round(await p.evaluate(() => document.querySelector('.zz-kbd').getBoundingClientRect().height))
}
const fit = p => p.evaluate(() => {
  const t = document.querySelector('.zz-lve'), r = t.getBoundingClientRect()
  const over = [...t.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > r.right + 0.5).map(e => e.className || e.tagName)
  const row = [...document.querySelectorAll('.zz-balgrid > *')].map(e => { const b = e.getBoundingClientRect(); return [e.className.split(' ').pop(), Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] })
  const ml = document.querySelector('[data-zk="ml"]'); const mlOver = ml ? ml.scrollWidth - ml.clientWidth : null
  return { tileW: Math.round(r.width), tileH: Math.round(r.height), over, mlOver, row }
})

if (want('rest')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await scene(p, rest())
  await PR.placePhone(p)
  console.log('rest', JSON.stringify(await fit(p)))
  await shot(p, 'r10-lve-rest-phone-clean')
  await mk(p, '[data-zk="war"]', '1', { prefer: ['e', 'ne'] })
  await mk(p, '[data-zk="app"]', '2', { prefer: ['e'] })
  await mk(p, '[data-zk="pend"]', '3', { prefer: ['e'] })
  await mk(p, '[data-zk="cf"]', '4', { prefer: ['e', 'se'] })
  await shot(p, 'r10-lve-rest-phone')
  await ctx.close()
}

if (want('edit')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await scene(p, editing(), { open: true })
  const kh = await keys(p)
  await PR.placePhone(p, kh)
  console.log('edit', JSON.stringify(await fit(p)))
  await shot(p, 'r10-lve-edit-phone-clean')
  await mk(p, '[data-zk="appbox"]', '1', { off: 3, prefer: ['w', 'sw', 'nw'] })
  await mk(p, '[data-zk="cfbox"]', '2', { off: 3, prefer: ['w', 'sw', 'nw'] })
  await shot(p, 'r10-lve-edit-phone')
  await ctx.close()
}

if (want('gone')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  // 1 Jan 27: the 2 carried-forward days he did not use are gone from the balance; the rest of the window as it was
  await scene(p, rest({ war: '12.5', app: '15', cf: '', gone: '2 carried-fwd days<br>ended 31 Dec' }))
  await PR.placePhone(p)
  console.log('gone', JSON.stringify(await fit(p)))
  // the picture is the window's balances only: its leave list is still the 2026 one the staged squadron holds
  const clip = await p.evaluate(() => {
    const d = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop().getBoundingClientRect()
    const g = document.querySelector('.zz-balgrid').getBoundingClientRect()
    return { x: 0, y: Math.max(0, d.top - 8), width: 390, height: Math.round(g.bottom + 14 - Math.max(0, d.top - 8)) }
  })
  await shot(p, 'r10-lve-cf-gone-phone-clean', { clip })
  await mk(p, '[data-zk="gonenote"]', '1', { prefer: ['e', 'se'] })
  await shot(p, 'r10-lve-cf-gone-phone', { clip })
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
