// Round 13 (22 Oct 26): the LVE tile of Ranger's person window laid out again (his "/impeccable could u see how the
// layout can be improved", and: when the balances are LOCKED a member sees no input boxes). Same facts as round 10
// (D1217 War bal / App bal, days pending in days; D1218 + D1224 carried forward, used first, gone after its date;
// D1209 OIL never typed; D1220 one lock for everyone) in fewer lines:
//   - LVE spans three columns and keeps the other tiles' three rows (label · figure · small line), so it is no taller
//     than OIL or CCL: War bal is the big figure; App bal and Pending stand at its right as a two-line sum, their
//     figures in one column; carried fwd is the tile's small line, with the date it ends.
//   - One rule for every balance: a box means "you can type this"; no box, you cannot. Locked, every box goes (the
//     figures stay exactly where they were) and the heading says "Locked by admin" with the padlock.
//   - Editing happens in place: the tapped box takes the cyan ring, War bal follows as he types; nothing moves.
//   - The row under: FCL PL EL CL MED, MED one column like the rest.
// Drawn INTO THE REAL LOCAL BUILD (clock Thu 8 Jan 26; <LWMOCK_OUT>/out/state.json) with the r7 window's own helpers,
// read from full-r7-person.mjs between its markers as full-r10-lve.mjs does. Every picture is cut to the Balances
// area, with its words on it (lesson 32). Nothing here is built.
//   r13-lve-unlocked     a member, balances open: boxes on what he may type (App bal, carried fwd, CCL … CL)
//   r13-lve-locked       the admin has locked balances: no boxes anywhere, padlock + "Locked by admin"
//   r13-lve-editing      two moments side by side: typing App bal (War bal follows), then carried fwd
//   r13-lve-before-after round 10's tile beside this one
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r13-lve.mjs      (R13_ONLY=unlocked,locked,edit,ba)
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, SP, gridTo } from './full-lib.mjs'
import { oneStage, mk, unmk, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const ONLY = (process.env.R13_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const PR = load(cut(SRC('full-r7-person.mjs'), 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME', 'kb', 'LOCKI'])

const CSS = `
.bidsheet .r13-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
/* LVE: three columns wide, the other tiles' three rows — label · figure · small line */
.bidsheet .r7-t.r13-lve{grid-column:span 3;display:grid;grid-template-columns:minmax(0,1fr) auto 34px;grid-template-rows:18px 27px 16px;column-gap:7px;row-gap:3px;align-items:center}
.bidsheet .r13-lve .lb{grid-column:1;grid-row:1}
.bidsheet .r13-lve .wb{grid-column:1;grid-row:2;display:flex;align-items:baseline;gap:6px;min-width:0}
.bidsheet .r13-lve .wb .r7-fig{border-color:transparent;background:transparent;margin-left:0;padding-left:0;align-self:auto}
.bidsheet .r13-lve .cap{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .r13-lve .nm{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap;text-align:right}
.bidsheet .r13-lve .nm.a{grid-column:2;grid-row:1}
.bidsheet .r13-lve .nm.p{grid-column:2;grid-row:2}
.bidsheet .r13-lve .vb{grid-column:3;grid-row:1;justify-self:stretch}
.bidsheet .r13-lve .pv{grid-column:3;grid-row:2;justify-self:stretch;text-align:center;font:700 13px/1 system-ui;font-variant-numeric:tabular-nums;color:#c9d1d9}
.bidsheet .r13-lve .cf{grid-column:1/-1;grid-row:3;display:flex;align-items:center;gap:5px;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
/* the box: "you can type this" — the same box, smaller; locked it keeps its size and loses its edge */
.bidsheet .r13-box{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:22px;min-width:34px;padding:0 5px;border:1px solid #39424D;border-radius:5px;background:#0d1217;color:#f1f4f7;font:700 13px/1 system-ui;font-variant-numeric:tabular-nums}
.bidsheet .r13-box.sm{height:18px;min-width:24px;padding:0 4px;font-size:11.5px;border-radius:4px}
.bidsheet .r13-box.ro{border-color:transparent;background:transparent}
.bidsheet .r13-box.editing{border:2px solid #3bc6e8;padding:0 4px}
.bidsheet .r13-box.editing .sel{background:#2a5d8a;color:#fff;border-radius:2px;padding:0 1px}
.bidsheet .r13-box.editing .caret{display:inline-block;width:2px;height:14px;background:#3bc6e8;margin-left:1px}
.bidsheet .r13-box.sm.editing .caret{height:11px}
.bidsheet .r13-box .live{color:#fff}
/* a small tile's figure: the box sits inside the tile; locked it keeps its place and loses its edge, so nothing moves */
.bidsheet .r13-bal .r7-fig.sf{margin-left:0;border-color:#39424D;background:#0d1217}
.bidsheet .r13-bal .r7-fig.sf.ro{border-color:transparent;background:transparent}
/* MED one column, like the rest */
.bidsheet .r13-bal .r7-t.med{grid-column:auto}
/* the heading when locked */
.bidsheet .r13-lk{display:inline-flex;align-items:center;gap:5px;letter-spacing:.02em;text-transform:none;font:600 12px/1 system-ui;color:#b6c0cb}
.bidsheet .r13-lk svg{width:11px;height:13px;display:inline-block}
/* the words on the picture (lesson 32) */
.r13-cap{position:fixed;z-index:2147483646;left:0;right:0;display:flex;align-items:center;gap:8px;padding:0 14px;height:34px;background:#0b0d10;border-bottom:1px solid #2a313a;color:#f1f4f7;font:700 13.5px/1.15 system-ui}
.r13-cap i{flex:none;width:8px;height:8px;border-radius:50%;background:#ff2d95}
.r13-cap span{font-weight:500;color:#b6c0cb}
.r13-key{position:fixed;z-index:2147483646;left:0;right:0;padding:8px 14px 10px;background:#0b0d10;border-top:1px solid #2a313a;display:grid;grid-template-columns:22px 1fr;row-gap:6px;column-gap:6px;align-items:center;font:500 12.5px/1.25 system-ui;color:#c9d1d9}
.r13-key b{font-weight:700;color:#fff}
.r13-key .n{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:10px;background:#ff2d95;color:#fff;font:800 12px/1 system-ui}
`

// one balance tile (OIL, CCL … CL, MED): the r7 tile with its box only when he may type it
const small = (k, fig, o = {}) => {
  const cls = o.go || o.med ? 'r7-fig' : ['r7-fig', 'sf', o.box ? '' : 'ro'].filter(Boolean).join(' ')
  return `<div class="r7-t${o.med ? ' med' : ''}" data-zk="${k}"><span class="lb">${PR.kb(k)}</span><span class="r7-fr"><span class="${cls}">${fig}</span>${o.go ? '<span class="r7-go">›</span>' : ''}</span><span class="r7-used">${o.used || ''}</span></div>`
}
const box = (v, o = {}) => {
  const c = ['r13-box', o.sm ? 'sm' : '', o.ro ? 'ro' : '', o.editing ? 'editing' : ''].filter(Boolean).join(' ')
  const inner = o.editing ? (o.typed ? `<span class="live">${v}</span><span class="caret"></span>` : `<span class="sel">${v}</span><span class="caret"></span>`) : v
  return `<span class="${c}"${o.zk ? ` data-zk="${o.zk}"` : ''}>${inner}</span>`
}
// War bal = App bal less the days pending (D1217); carried fwd is part of App bal, used first, gone after its date (D1218, D1224)
const lve = ({ war = '14.5', app = '17', pend = '2½', cf = '4', ends = '31 Dec', ro = false, ed = '' } = {}) =>
  `<div class="r7-t r13-lve" data-zk="lve">` +
  `<span class="lb">LVE</span>` +
  `<span class="nm a">App bal</span>${box(app, { ro, zk: 'app', editing: ed === 'app', typed: ed === 'app' })}` +
  `<span class="wb" data-zk="war"><span class="r7-fig">${war}</span><span class="cap">War bal</span></span>` +
  `<span class="nm p" data-zk="pendn">Pending</span><span class="pv" data-zk="pend">−${pend}</span>` +
  `<span class="cf" data-zk="cf">Carried fwd ${box(cf, { sm: 1, ro, zk: 'cfbox', editing: ed === 'cf', typed: ed === 'cf' })} till ${ends}</span>` +
  `</div>`
const grid = (o = {}) => {
  const b = !o.locked
  return `<div class="r13-bal zz-balgrid">` + lve(o.lve ? { ro: o.locked, ...o.lve } : { ro: o.locked }) +
    small('OIL', '0', { go: true }) + small('CCL', '0', { box: b }) +
    small('FCL', '0', { box: b }) + small('PL', '0', { box: b }) + small('EL', '0', { box: b }) + small('CL', '0', { box: b }) +
    small('MED', '0', { med: true, used: 'days' }) + `</div>`
}

async function scene(p, o = {}) {
  await PR.stage(p, true, PR.ME.member); await PR.gridAsBuilt(p)
  await PR.openPerson(p, true, 'bane', PR.personHTML('bane', { edit: !o.locked }))
  await p.evaluate(([css, gridHTML, locked, LOCKI]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    document.querySelector('.zz-balgrid').outerHTML = gridHTML
    // the heading: the padlock and who locked it, only when locked (D1220)
    const hd = document.querySelector('.zz-balhd')
    hd.querySelector('.zz-lk')?.remove()
    if (locked) hd.insertAdjacentHTML('beforeend', `<span class="r13-lk" data-zk="lock">${LOCKI}Locked by admin</span>`)
    // "pending", not "waiting" (D1217), in the list under
    for (const n of document.querySelectorAll('.bidsheet .r7-ln .s.wait')) n.textContent = 'Pending'
  }, [CSS, grid(o), !!o.locked, PR.LOCKI])
  await PR.placePhone(p)
  await p.waitForTimeout(150)
}
// the words on the picture, just above the Balances heading
const caption = (p, head, rest) => p.evaluate(([head, rest]) => {
  const hd = document.querySelector('.zz-balhd').getBoundingClientRect()
  const c = document.createElement('div'); c.className = 'r13-cap'; c.style.top = Math.round(hd.top - 44) + 'px'
  c.innerHTML = `<i></i>${head}${rest ? ` <span>${rest}</span>` : ''}`; document.body.appendChild(c)
}, [head, rest])
// the crop: the caption, the heading, the tiles and any word label, nothing of the leave list
const clipOf = (p, pad = 10) => p.evaluate(pad => {
  const rs = [...document.querySelectorAll('.r13-cap, .zz-balhd, .zz-balgrid, .zz-tag, .r13-key')].map(e => e.getBoundingClientRect()).filter(r => r.width)
  const top = Math.max(0, Math.min(...rs.map(r => r.top)) - (document.querySelector('.r13-cap') ? 0 : pad))
  const bottom = Math.max(...rs.map(r => r.bottom)) + (document.querySelector('.r13-key') ? 0 : pad)
  return { x: 0, y: Math.round(top), width: 390, height: Math.round(bottom - top) }
}, pad)
const fit = p => p.evaluate(() => {
  const t = document.querySelector('.r13-lve'), r = t.getBoundingClientRect()
  const over = [...t.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > r.right + 0.5).map(e => e.className || e.tagName)
  const tiles = [...document.querySelectorAll('.zz-balgrid > *')].map(e => { const b = e.getBoundingClientRect(); return [e.dataset.zk, Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] })
  return { lveW: Math.round(r.width), lveH: Math.round(r.height), over, tiles }
})
// a word label (pink, as the marks are) beside a thing, with the ring round it
const say = (p, sel, n, prefer) => mk(p, sel, n, { prefer, off: 2 })
const key = (p, items) => p.evaluate(items => {
  const g = document.querySelector('.zz-balgrid').getBoundingClientRect()
  const k = document.createElement('div'); k.className = 'r13-key'; k.style.top = Math.round(g.bottom + 7) + 'px'
  k.innerHTML = items.map(([n, t]) => `${n ? `<span class="n">${n}</span>` : "<span></span>"}<span>${t}</span>`).join(''); document.body.appendChild(k)
}, items)

if (want('unlocked')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await scene(p)
  console.log('unlocked', JSON.stringify(await fit(p)))
  await shot(p, 'r13-lve-unlocked-clean', { clip: await clipOf(p) })
  await caption(p, 'Unlocked:', 'a box means you can type it')
  await say(p, '[data-zk="app"]', '1', ['nw', 'w', 'ne'])
  await say(p, '[data-zk="cf"]', '2', ['e', 'in'])
  await say(p, '[data-zk="war"] .r7-fig', '3', ['nw', 'ne', 'n'])
  await say(p, '[data-zk="OIL"] .r7-fr', '4', ['s', 'sr', 'sl'])
  await key(p, [['1', '<b>App bal</b>: what the leave app shows. Tap the box to type it.'],
    ['2', '<b>Carried fwd</b>: the part of App bal from last year, used first, gone after 31 Dec. Typed too.'],
    ['3', '<b>War bal</b>: App bal less the 2½ days pending, the figure the grid shows. Worked out, never typed.'],
    ['4', '<b>OIL</b>: never typed. A tap opens the OIL tracker.']])
  console.log('unlocked marked', JSON.stringify(await fit(p)))
  await shot(p, 'r13-lve-unlocked', { clip: await clipOf(p) })
  await ctx.close()
}

if (want('locked')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await scene(p, { locked: true })
  console.log('locked', JSON.stringify(await fit(p)))
  await shot(p, 'r13-lve-locked-clean', { clip: await clipOf(p) })
  await caption(p, 'Locked:', 'no boxes anywhere, figures read only')
  await say(p, '[data-zk="lock"]', '1', ['e', 'ne'])
  await say(p, '[data-zk="lve"]', '2', ['nw', 'sw'])
  await say(p, '.zz-balgrid > [data-zk="CCL"]', '3', ['ne', 'e'])
  await key(p, [['1', '<b>Locked by admin</b>: one switch locks everyone’s balances.'],
    ['2', 'The same figures in the same places, with <b>no boxes</b>: nothing he can type.'],
    ['3', 'CCL, FCL, PL, EL and CL lose their boxes too.']])
  await shot(p, 'r13-lve-locked', { clip: await clipOf(p) })
  await ctx.close()
}

if (want('edit')) {
  // two moments: he has typed 18 in App bal (War bal follows: 15.5); then he is in carried fwd, typing 5
  for (const [n, o, head, rest, marks, keys] of [
    ['a', { lve: { app: '18', war: '15.5', ed: 'app' } }, 'First, App bal:', 'he types 18',
      [['[data-zk="app"]', '1', ['nw', 'w']], ['[data-zk="war"] .r7-fig', '2', ['nw', 'ne']]],
      [['1', 'The box he tapped takes the cyan ring; the number keys come up.'], ['2', '<b>War bal follows as he types</b>: 18 less 2½ pending is 15.5.']]],
    ['b', { lve: { app: '18', war: '15.5', cf: '5', ed: 'cf' } }, 'Then carried fwd:', 'he types 5',
      [['[data-zk="cf"]', '1', ['e', 'in']]],
      [['1', 'The next box. "till 31 Dec" is not typed: it comes from the year.'], ['', 'Nothing in the window moves while he types.']]],
  ]) {
    const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
    await scene(p, o)
    console.log('edit', n, JSON.stringify(await fit(p)))
    await caption(p, head, rest)
    for (const [sel, w, pr] of marks) await say(p, sel, w, pr)
    await key(p, keys)
    await shot(p, 'r13-lve-editing-' + n, { clip: await clipOf(p) })
    await ctx.close()
  }
  // side by side, one picture
  const { ctx, p } = await newPage(browser, 800, 400, false, null, 3)
  const img = f => 'data:image/png;base64,' + readFileSync(join(OUT, f)).toString('base64')
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;padding:0;align-items:flex-start">
    <img src="${img('r13-lve-editing-a.png')}" style="width:390px;display:block"><img src="${img('r13-lve-editing-b.png')}" style="width:390px;display:block"></body>`)
  await p.waitForTimeout(200)
  const h = await p.evaluate(() => Math.max(...[...document.images].map(i => i.getBoundingClientRect().height)))
  await shot(p, 'r13-lve-editing', { clip: { x: 0, y: 0, width: 800, height: Math.ceil(h) } })
  await ctx.close()
}

if (want('ba')) {
  // round 10's tile (its clean picture, cut to Balances) beside this round's, at the same scale
  const r10 = join(SP, '..', 'r10', 'out', 'r10-lve-rest-phone-clean.png')
  if (!existsSync(r10)) throw new Error('round 10 clean picture missing: ' + r10)
  const img = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  const { ctx, p } = await newPage(browser, 820, 600, false, null, 3)
  const lab = (t, s) => `<div style="height:34px;display:flex;align-items:center;gap:8px;padding:0 14px;color:#f1f4f7;font:700 13.5px system-ui;border-bottom:1px solid #2a313a"><i style="width:8px;height:8px;border-radius:50%;background:#ff2d95"></i>${t}<span style="font-weight:500;color:#b6c0cb">${s}</span></div>`
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;align-items:flex-start;font-family:system-ui">
    <div style="width:390px">${lab('Today (round 10):', 'LVE taller than its row, 4 small lines')}
      <div style="height:${process.env.R13_BH || 278}px;overflow:hidden"><img src="${img(r10)}" style="width:390px;display:block;margin-top:-${process.env.R13_BT || 372}px"></div></div>
    <div style="width:390px">${lab('Proposed:', 'every tile the same height, 3 rows')}
      <img src="${img(join(OUT, 'r13-lve-unlocked-clean.png'))}" style="width:390px;display:block"></div></body>`)
  await p.waitForTimeout(200)
  const h = await p.evaluate(() => Math.max(...[...document.body.children].map(i => i.getBoundingClientRect().bottom)))
  await shot(p, 'r13-lve-before-after', { clip: { x: 0, y: 0, width: 820, height: Math.ceil(h) } })
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
