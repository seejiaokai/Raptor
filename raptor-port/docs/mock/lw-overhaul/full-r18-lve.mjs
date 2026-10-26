// Round 18 (22 Oct 26), D1239: his "3 taken above war bal seems like 1 title … the rest of the numbers are aligned to the
// left but the LVE portion is aligned to the right … think of a better layout". Round 17 changed so every figure and label
// aligns LEFT (LVE included); "3 taken" beside the LVE box; LVE's line App bal · Pending −2½ · War bal, no floating signs.
// Round 17 was: his "can this be designed with alignment in consideration so that it looks neat" (D1238,
// lesson 35) on round 14's LVE tile. One grid for every tile: row 1 the kind's box (LVE now a coloured box like the
// rest), row 2 LVE's labels, row 3 every main figure, row 4 every small line. Inside LVE three columns — App bal ·
// Pending · War bal — each label right over its own figure, the figures sharing one right edge in their column, the
// "−" and "=" in narrow gutters of their own; "incl. 4 carried fwd · till 31 Dec" from the tile's left edge; OIL's and
// MED's figures on LVE's figure line, MED's "days" on its small line; row 2's boxes on one left edge under their labels.
// Every fact of round 14 kept (D1217, D1218, D1224, D1209, D1220, D1201). Round 13/14's staging, read between markers.
//   r17-lve-member · r17-lve-locked · r17-lve-admin · r17-lve-before-after (round 14 beside round 17)
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r17-lve.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, mk, unmk, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const PR = load(cut(SRC('full-r7-person.mjs'), 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME', 'kb', 'LOCKI'])
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO
// round 14's caption / key / marks / crop helpers, unchanged (they read only the page)
const R14 = load(cut(SRC('full-r14-lve.mjs'), 'const caption = ', "for (const [v, o, head"), {}, ['caption', 'key', 'num', 'clipOf'])
const R14CSS = load(cut(SRC('full-r14-lve.mjs'), 'const CSS = `', 'const box = '), {}, ['CSS']).CSS

const CSS = R14CSS + `
.bidsheet .r17-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));column-gap:6px;row-gap:6px}
.bidsheet .r17-t{background:#151b22;border-radius:9px;padding:8px 9px;display:grid;grid-template-rows:22px 12px 30px 14px;row-gap:5px;min-width:0;box-sizing:border-box}
.bidsheet .r17-t.r2{grid-template-rows:22px 30px}
.bidsheet .r17-t .k{grid-row:1;display:flex;align-items:center;justify-content:flex-start;gap:8px;min-width:0}
.bidsheet .r17-t .tk{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .r17-t .f{grid-row:3;display:flex;align-items:center;gap:5px;font:700 20px/1 system-ui;font-variant-numeric:tabular-nums;color:#f1f4f7}
.bidsheet .r17-t.r2 .f{grid-row:2}
.bidsheet .r17-t .f.z{color:#7d8894;font-weight:600}
.bidsheet .r17-t .s{grid-row:4;align-self:center;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .r17-go{color:#5fd0e6;font:700 16px/1 system-ui}
/* LVE: three columns, two gutters; label and figure right-aligned in each column */
.bidsheet .r17-lve{grid-column:span 3}
.bidsheet .r17-sum{grid-row:2 / span 2;display:grid;grid-template-columns:max-content max-content max-content;justify-content:start;grid-template-rows:12px 30px;row-gap:5px;column-gap:24px}
.bidsheet .r17-sum .h{grid-row:1;font:600 10.5px/12px system-ui;color:#8a96a3;text-align:left;white-space:nowrap}
.bidsheet .r17-sum .v{grid-row:2;display:flex;align-items:center;justify-content:flex-start;font:700 15px/1 system-ui;font-variant-numeric:tabular-nums;color:#c9d1d9}
.bidsheet .r17-sum .op{grid-row:2;display:flex;align-items:center;justify-content:center;color:#6b7785;font:600 13px/1 system-ui}
.bidsheet .r17-sum .war{font:800 20px/1 system-ui;color:#fff}
.bidsheet .r17-cf{grid-row:4;display:flex;align-items:center;gap:5px;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
/* the box: "you can type this" (edge 3.4:1); locked it gives its room back so the figure sits on its label's edge */
.bidsheet .r17-box{display:inline-flex;align-items:center;justify-content:flex-start;box-sizing:border-box;height:28px;min-width:42px;padding:0 7px;border:1px solid #66717f;border-radius:6px;background:#0d1217;color:#f1f4f7;font:700 16px/1 system-ui;font-variant-numeric:tabular-nums}
.bidsheet .r17-box.sm{height:18px;min-width:22px;padding:0 4px;font-size:11.5px;border-radius:4px;justify-content:center}
.bidsheet .r17-box.z{color:#7d8894;font-weight:600}
.bidsheet .r17-box.ro{border-color:transparent;background:transparent;min-width:0;padding:0}
.bidsheet .r17-t .f .r17-box.ro{font-size:20px}
`
const box = (v, o = {}) => `<span class="r17-box${o.sm ? ' sm' : ''}${o.ro ? ' ro' : ''}${v === '0' ? ' z' : ''}"${o.zk ? ` data-zk="${o.zk}"` : ''}>${v}</span>`
const kbx = k => k === 'LVE' ? PR.kb('LL').replace('<b>LL</b>', '<b>LVE</b>') : PR.kb(k)
const lve = ro => `<div class="r17-t r17-lve" data-zk="lve"><span class="k">${kbx('LVE')}<span class="tk" data-zk="taken">3 taken</span></span>` +
  `<div class="r17-sum" data-zk="sum"><span class="h" style="grid-column:1">App bal</span><span class="h" style="grid-column:2">Pending</span><span class="h" style="grid-column:3">War bal</span>` +
  `<span class="v" style="grid-column:1">${box('17', { ro, zk: 'app' })}</span><span class="v" style="grid-column:2">−2½</span><span class="v war" style="grid-column:3" data-zk="war">14½</span></div>` +
  `<span class="r17-cf" data-zk="cf">incl. ${box('4', { ro, sm: 1, zk: 'cfbox' })} carried fwd · till 31 Dec</span></div>`
const tile = (k, v, o = {}) => `<div class="r17-t${o.r2 ? ' r2' : ''}" data-zk="${k}"><span class="k">${kbx(k)}</span>` +
  `<span class="f${!o.box && v === '0' ? ' z' : ''}">${o.box ? box(v, { ro: o.ro }) : v}${o.go ? '<span class="r17-go">›</span>' : ''}</span>${o.sub ? `<span class="s">${o.sub}</span>` : ''}</div>`
const grid = (o = {}) => `<div class="r17-bal zz-balgrid">` + lve(!!o.ro) + tile('OIL', '0', { go: true }) + tile('MED', '0', { sub: 'days' }) +
  ['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => tile(k, '0', { box: true, ro: !!o.ro, r2: true })).join('') + `</div>`

async function scene(p, o = {}) {
  await PR.stage(p, true, o.admin ? PR.ME.admin : PR.ME.member); await PR.gridAsBuilt(p)
  await PR.openPerson(p, true, 'bane', PR.personHTML('bane', { edit: !o.locked }))
  await p.evaluate(([css, gridHTML, lockWords, LOCKI]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    document.querySelector('.zz-balgrid').outerHTML = gridHTML
    const hd = document.querySelector('.zz-balhd'); hd.querySelector('.zz-lk')?.remove()
    if (lockWords) hd.insertAdjacentHTML('beforeend', `<span class="r14-lk" data-zk="lock">${LOCKI}${lockWords}</span>`)
    for (const n of document.querySelectorAll('.bidsheet .r7-ln .s.wait')) n.textContent = 'Pending'
  }, [CSS, grid({ ro: o.locked && !o.admin }), o.locked ? (o.admin ? 'Locked for members' : 'Locked by admin') : '', PR.LOCKI])
  await PR.placePhone(p); await p.addScriptTag({ content: DECO }); await p.waitForTimeout(150)
}
// the lines everything sits on: a hairline at each shared edge, for the picture only
const guides = p => p.evaluate(() => {
  const g = document.querySelector('.zz-balgrid').getBoundingClientRect()
  const ys = new Set(), xs = new Set()
  for (const sel of ['.r17-t .k', '.r17-sum .v', '.r17-t:not(.r2) .f', '.r17-cf', '.r17-t .s']) for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); ys.add(Math.round(r.top + r.height / 2)) }
  for (const e of document.querySelectorAll('.r17-sum .v')) xs.add(Math.round(e.getBoundingClientRect().left))
  const line = st => { const d = document.createElement('div'); d.className = 'zz-tag'; Object.assign(d.style, { position: 'fixed', zIndex: 2147483000, pointerEvents: 'none', background: 'rgba(255,45,149,.55)' }, st); document.body.appendChild(d) }
  for (const y of ys) line({ left: (g.left - 4) + 'px', width: (g.width + 8) + 'px', top: y + 'px', height: '1px' })
  for (const x of xs) line({ left: (x - 0.5) + 'px', width: '1px', top: (g.top - 4) + 'px', height: '96px' })
})
const fit = p => p.evaluate(() => [...document.querySelectorAll('.zz-balgrid > *')].map(e => { const b = e.getBoundingClientRect(); return [e.dataset.zk, Math.round(b.height)] }))

for (const [v, o, head, rest, keys] of [
  ['member', {}, 'Unlocked:', 'every line shared, each label over its figure',
    [['', '<b>Pink hairlines</b> (on the picture only): the four lines every tile shares, and the left edge of each LVE figure under its label.'],
      ['', '<b>LVE</b> is now a coloured box like the other kinds, so every tile starts on the same line.']]],
  ['locked', { locked: true }, 'Locked:', 'the same lines; each figure on its label’s edge', [['', 'No boxes; nothing moves off its line.']]],
  ['admin', { locked: true, admin: true }, 'The admin, while locked:', 'his boxes stay', [['', '<b>Locked for members</b>: he may still type.']]],
]) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, o.admin ? 'admin' : 'member')
  await scene(p, o)
  console.log(v, JSON.stringify(await fit(p)))
  await shot(p, `r18-lve-${v}-clean`, { clip: await R14.clipOf(p) })
  await R14.caption(p, head, rest)
  if (v === 'member') await guides(p)
  await R14.key(p, keys)
  await shot(p, `r18-lve-${v}`, { clip: await R14.clipOf(p) })
  await ctx.close()
}
{
  const img = f => 'data:image/png;base64,' + readFileSync(join(OUT, f)).toString('base64')
  const { ctx, p } = await newPage(browser, 820, 600, false, null, 3)
  const lab = (t, s) => `<div style="height:34px;display:flex;align-items:center;gap:8px;padding:0 14px;color:#f1f4f7;font:700 13.5px system-ui;border-bottom:1px solid #2a313a"><i style="width:8px;height:8px;border-radius:50%;background:#ff2d95"></i>${t}<span style="font-weight:500;color:#b6c0cb">${s}</span></div>`
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;align-items:flex-start;font-family:system-ui">
    <div style="width:390px">${lab('Round 17:', '3 taken over War bal; LVE right-aligned')}<img src="${img('r17-lve-member-clean.png')}" style="width:390px;display:block"></div>
    <div style="width:390px">${lab('Round 18:', 'everything from the left')}<img src="${img('r18-lve-member-clean.png')}" style="width:390px;display:block"></div></body>`)
  await p.waitForTimeout(200)
  const h = await p.evaluate(() => Math.max(...[...document.body.children].map(i => i.getBoundingClientRect().bottom)))
  await shot(p, 'r18-lve-before-after', { clip: { x: 0, y: 0, width: 820, height: Math.ceil(h) } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
