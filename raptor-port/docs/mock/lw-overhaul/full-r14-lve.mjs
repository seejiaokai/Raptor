// Round 14 (22 Oct 26), his "/impeccable /design is this good enough? Any other ideas on making a better design" on
// round 13's LVE tile. Impeccable critique run as two independent reads (a design review; the detector and the
// browser's measurements), then a polish. What the reads found and this round changes (all facts kept — D1217, D1218,
// D1224, D1209, D1220, D1201):
//   - the sum reads left to right on one line: App bal [17] − 2½ = 14½ War bal (round 13 split it: the answer sat
//     left of the figures it comes from);
//   - carried fwd is said to be PART of App bal: "incl. [4] carried fwd · till 31 Dec" right under it (round 13's
//     "Carried fwd 4" read as extra days — a member could type 21 = 17 + 4 and over-bid by 4);
//   - "taken" is back (D1201: what is left AND what is taken): "3 taken" on LVE's first line; a kind with none says nothing;
//   - a zero is grey, any other figure white; the five typed kinds (CCL FCL PL EL CL) stand together on row 2, the
//     never-typed OIL and MED on row 1 with LVE; MED loses its own border;
//   - a typed box's edge 3.4:1 against the tile (round 13's was 1.85:1, under the 3:1 a control's edge needs — the
//     detector's finding), so "a box means you can type it" can be seen;
//   - locked: no boxes, each figure sits on its label (round 13 kept the box's empty room); a member reads "Locked by
//     admin", the admin "Locked for members" with his boxes still there (he may still type).
// Drawn INTO THE REAL LOCAL BUILD with r7's person window and round 13's own staging, each picture cut to Balances with
// its words on it (lesson 32). Nothing is built.
//   r14-lve-member       a member, unlocked        r14-lve-locked     the same member, locked
//   r14-lve-admin        the admin on the same man's window while locked: boxes stay, "Locked for members"
//   r14-lve-before-after round 13's tile beside this one
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r14-lve.mjs      (R14_ONLY=member,locked,admin,ba)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, mk, unmk, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const ONLY = (process.env.R14_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const PR = load(cut(SRC('full-r7-person.mjs'), 'const CHEV', '// ---------- r7-20'),
  { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
  ['stage', 'gridAsBuilt', 'openPerson', 'personHTML', 'placePhone', 'ME', 'kb', 'LOCKI'])
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO

const CSS = `
.bidsheet .r14-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.bidsheet .r14-t{background:#151b22;border-radius:9px;padding:7px 8px;display:flex;flex-direction:column;gap:5px;min-width:0;box-sizing:border-box}
.bidsheet .r14-t .top{display:flex;align-items:center;gap:6px;min-height:18px}
.bidsheet .r14-t .tk{margin-left:auto;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .r14-t .fig{font:700 19px/1 system-ui;font-variant-numeric:tabular-nums;color:#f1f4f7;display:flex;align-items:center;gap:5px;min-height:27px}
.bidsheet .r14-t .fig.z{color:#7d8894;font-weight:600}
.bidsheet .r14-t .r14-go{color:#5fd0e6;font:700 15px system-ui}
.bidsheet .r14-t .sub{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap;min-height:11px}
/* LVE: three columns, the sum on one line, labels above their figures */
.bidsheet .r14-lve{grid-column:span 3}
.bidsheet .r14-lve .lb{font:800 11px/1 system-ui;letter-spacing:.08em;color:#b6c0cb}
.bidsheet .r14-sum{display:grid;grid-template-columns:auto 10px auto 10px 1fr;column-gap:4px;row-gap:3px;align-items:center}
.bidsheet .r14-sum .h{font:600 10.5px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .r14-sum .h.r{text-align:right}
.bidsheet .r14-sum .op{color:#6b7785;font:600 13px/1 system-ui;text-align:center}
.bidsheet .r14-sum .pv{font:700 14px/1 system-ui;font-variant-numeric:tabular-nums;color:#c9d1d9}
.bidsheet .r14-sum .war{font:800 22px/1 system-ui;font-variant-numeric:tabular-nums;color:#fff;text-align:right}
/* a box: "you can type this" — edge #66717f, 3.4:1 against the tile */
.bidsheet .r14-box{display:inline-flex;align-items:center;justify-content:flex-end;box-sizing:border-box;height:26px;min-width:40px;padding:0 7px;border:1px solid #66717f;border-radius:6px;background:#0d1217;color:#f1f4f7;font:700 14px/1 system-ui;font-variant-numeric:tabular-nums}
.bidsheet .r14-box.sm{height:20px;min-width:24px;padding:0 5px;font-size:12px;border-radius:5px;justify-content:center}
.bidsheet .r14-box.z{color:#7d8894;font-weight:600}
.bidsheet .r14-box.ro{border-color:transparent;background:transparent;min-width:0;padding:0}
.bidsheet .r14-t .fig .r14-box{height:27px;font-size:16px;min-width:38px}
.bidsheet .r14-t .fig .r14-box.ro{font-size:19px;min-width:0;padding:0}
.bidsheet .r14-cf{display:flex;align-items:center;gap:5px;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.bidsheet .r14-lk{display:inline-flex;align-items:center;gap:5px;letter-spacing:.02em;text-transform:none;font:600 12px/1 system-ui;color:#b6c0cb}
.bidsheet .r14-lk svg{width:11px;height:13px;display:inline-block}
.r13-cap{position:fixed;z-index:2147483646;left:0;right:0;display:flex;align-items:center;gap:8px;padding:0 14px;height:34px;background:#0b0d10;border-bottom:1px solid #2a313a;color:#f1f4f7;font:700 13.5px/1.15 system-ui}
.r13-cap i{flex:none;width:8px;height:8px;border-radius:50%;background:#ff2d95}
.r13-cap span{font-weight:500;color:#b6c0cb}
.r13-key{position:fixed;z-index:2147483646;left:0;right:0;padding:8px 14px 10px;background:#0b0d10;border-top:1px solid #2a313a;display:grid;grid-template-columns:22px 1fr;row-gap:6px;column-gap:6px;align-items:center;font:500 12.5px/1.25 system-ui;color:#c9d1d9}
.r13-key b{font-weight:700;color:#fff}
.r13-key .n{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:10px;background:#ff2d95;color:#fff;font:800 12px/1 system-ui}
`
const box = (v, o = {}) => `<span class="r14-box${o.sm ? ' sm' : ''}${o.ro ? ' ro' : ''}${v === '0' ? ' z' : ''}"${o.zk ? ` data-zk="${o.zk}"` : ''}>${v}</span>`
const lve = ro => `<div class="r14-t r14-lve" data-zk="lve">` +
  `<div class="top"><span class="lb">LVE</span><span class="tk" data-zk="taken">3 taken</span></div>` +
  `<div class="r14-sum" data-zk="sum"><span class="h">App bal</span><span></span><span class="h">Pending</span><span></span><span class="h r">War bal</span>` +
  `${box('17', { ro, zk: 'app' })}<span class="op">−</span><span class="pv">2½</span><span class="op">=</span><span class="war" data-zk="war">14½</span></div>` +
  `<div class="r14-cf" data-zk="cf">incl. ${box('4', { ro, sm: 1, zk: 'cfbox' })} carried fwd · till 31 Dec</div></div>`
const tile = (k, v, o = {}) => `<div class="r14-t" data-zk="${k}"><div class="top">${PR.kb(k)}</div>` +
  `<div class="fig${o.box ? '' : v === '0' ? ' z' : ''}">${o.box ? box(v, { ro: o.ro }) : v}${o.go ? '<span class="r14-go">›</span>' : ''}</div>${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</div>`
const grid = (o = {}) => {
  const ro = !!o.ro
  return `<div class="r14-bal zz-balgrid">` + lve(ro) + tile('OIL', '0', { go: true }) + tile('MED', '0', { sub: 'days' }) +
    ['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => tile(k, '0', { box: true, ro })).join('') + `</div>`
}

async function scene(p, o = {}) {
  await PR.stage(p, true, o.admin ? PR.ME.admin : PR.ME.member); await PR.gridAsBuilt(p)
  await PR.openPerson(p, true, 'bane', PR.personHTML('bane', { edit: !o.locked }))
  await p.evaluate(([css, gridHTML, lockWords, LOCKI]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    document.querySelector('.zz-balgrid').outerHTML = gridHTML
    const hd = document.querySelector('.zz-balhd')
    hd.querySelector('.zz-lk')?.remove()
    if (lockWords) hd.insertAdjacentHTML('beforeend', `<span class="r14-lk" data-zk="lock">${LOCKI}${lockWords}</span>`)
    for (const n of document.querySelectorAll('.bidsheet .r7-ln .s.wait')) n.textContent = 'Pending'
  }, [CSS, grid({ ro: o.locked && !o.admin }), o.locked ? (o.admin ? 'Locked for members' : 'Locked by admin') : '', PR.LOCKI])
  await PR.placePhone(p)
  await p.addScriptTag({ content: DECO })
  await p.waitForTimeout(150)
}
const caption = (p, head, rest) => p.evaluate(([head, rest]) => {
  const hd = document.querySelector('.zz-balhd').getBoundingClientRect()
  const c = document.createElement('div'); c.className = 'r13-cap'; c.style.top = Math.round(hd.top - 44) + 'px'
  c.innerHTML = `<i></i>${head}${rest ? ` <span>${rest}</span>` : ''}`; document.body.appendChild(c)
}, [head, rest])
const key = (p, items) => p.evaluate(items => {
  const g = document.querySelector('.zz-balgrid').getBoundingClientRect()
  const k = document.createElement('div'); k.className = 'r13-key'; k.style.top = Math.round(g.bottom + 7) + 'px'
  k.innerHTML = items.map(([n, t]) => `${n ? `<span class="n">${n}</span>` : '<span></span>'}<span>${t}</span>`).join(''); document.body.appendChild(k)
}, items)
// a numbered pink dot pinned beside a thing, with a pink ring round it (the round's tag style, covering nothing)
const num = (p, sel, n, side = 'r') => p.evaluate(([sel, n, side]) => {
  const d = window.__d, e = document.querySelector(sel); if (!e) return false
  const r = d.R(e); d.ring(r, 1)
  d.tag(n, side === 'r' ? { left: r.right + 5, cy: r.top + r.height / 2, font: '800 12px/1 system-ui' } : side === 'l' ? { right: r.left - 5, cy: r.top + r.height / 2, font: '800 12px/1 system-ui' } : { cx: r.left + r.width / 2, bottom: r.top - 4, font: '800 12px/1 system-ui' })
  return true
}, [sel, n, side])
const clipOf = p => p.evaluate(() => {
  const rs = [...document.querySelectorAll('.r13-cap, .zz-balhd, .zz-balgrid, .zz-tag, .r13-key')].map(e => e.getBoundingClientRect()).filter(r => r.width)
  const top = Math.max(0, Math.min(...rs.map(r => r.top))), bottom = Math.max(...rs.map(r => r.bottom))
  return { x: 0, y: Math.round(top), width: 390, height: Math.round(bottom - top) }
})
const fit = p => p.evaluate(() => {
  const t = document.querySelector('.r14-lve'), r = t.getBoundingClientRect()
  const over = [...t.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > r.right + 0.5).map(e => e.className)
  const tiles = [...document.querySelectorAll('.zz-balgrid > *')].map(e => { const b = e.getBoundingClientRect(); return [e.dataset.zk, Math.round(b.width), Math.round(b.height)] })
  return { over, tiles }
})

for (const [v, o, head, rest, marks, keys] of [
  ['member', {}, 'Unlocked:', 'a box means you can type it',
    [['[data-zk="sum"]', '1', 't'], ['[data-zk="cf"]', '2', 'r'], ['[data-zk="taken"]', '3', 'l'], ['.zz-balgrid > [data-zk="CL"]', '4', 't']],
    [['1', '<b>One line, read left to right</b>: what the leave app shows, less 2½ days pending, leaves <b>14½</b> on the Leave War.'],
      ['2', '<b>incl.</b>: the 4 carried fwd are part of the 17, used first, gone after 31 Dec.'],
      ['3', '<b>3 taken</b> this year. A kind with none taken says nothing.'],
      ['4', 'The five he types stand together; a zero is grey.']]],
  ['locked', { locked: true }, 'Locked:', 'no boxes; each figure sits on its label',
    [['[data-zk="lock"]', '1', 'r'], ['[data-zk="sum"]', '2', 't']],
    [['1', 'One switch locks every member’s balances (D1220).'], ['2', 'The same figures in the same order, nothing to type.']]],
  ['admin', { locked: true, admin: true }, 'The admin, while locked:', 'he may still type',
    [['[data-zk="lock"]', '1', 'r']],
    [['1', '<b>Locked for members</b>: the admin reads that members cannot type; his boxes stay.']]],
]) {
  if (!want(v)) continue
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, o.admin ? 'admin' : 'member')
  await scene(p, o)
  console.log(v, JSON.stringify(await fit(p)))
  await shot(p, `r14-lve-${v}-clean`, { clip: await clipOf(p) })
  await caption(p, head, rest)
  for (const [sel, n, side] of marks) await num(p, sel, n, side)
  await key(p, keys)
  await shot(p, `r14-lve-${v}`, { clip: await clipOf(p) })
  await ctx.close()
}

if (want('ba')) {
  const img = f => 'data:image/png;base64,' + readFileSync(join(OUT, f)).toString('base64')
  const { ctx, p } = await newPage(browser, 820, 600, false, null, 3)
  const lab = (t, s) => `<div style="height:34px;display:flex;align-items:center;gap:8px;padding:0 14px;color:#f1f4f7;font:700 13.5px system-ui;border-bottom:1px solid #2a313a"><i style="width:8px;height:8px;border-radius:50%;background:#ff2d95"></i>${t}<span style="font-weight:500;color:#b6c0cb">${s}</span></div>`
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;align-items:flex-start;font-family:system-ui">
    <div style="width:390px">${lab('Round 13:', 'the answer left of its sum')}<img src="${img('r13-lve-unlocked-clean.png')}" style="width:390px;display:block"></div>
    <div style="width:390px">${lab('Round 14:', 'one line, left to right')}<img src="${img('r14-lve-member-clean.png')}" style="width:390px;display:block"></div></body>`)
  await p.waitForTimeout(200)
  const h = await p.evaluate(() => Math.max(...[...document.body.children].map(i => i.getBoundingClientRect().bottom)))
  await shot(p, 'r14-lve-before-after', { clip: { x: 0, y: 0, width: 820, height: Math.ceil(h) } })
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
