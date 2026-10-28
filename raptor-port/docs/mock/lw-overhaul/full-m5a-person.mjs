// M5a round 1 (28 Oct 26): the person window redrawn on today's main, from the busy case full-m5a-stage.mjs saves.
// ONE transform: the real window a tap on a name opens (today's figures sheet) keeps its frame and title bar; its body is
// replaced by the approved tiles (round 20d — D1241, D1252, D1253; halves .5 — D1246) and his leave as one-line rows (the
// app's own LeaveLine look, `.ll-row`, the box cloned from the grid's own cell box), a year picker (D1148), new rows dotted
// for his own window (D1231), the padlock when locked (D1220). New in this round: D1472's LVE line — App bal · Approved ·
// Pending · War bal, with the day App bal was typed. Every figure here is drawn in; the grid behind is real.
//   p1 today, desktop admin · p2 drawn, desktop admin (locked for members, his boxes stay)
//   p3 today, phone member · p4 drawn, phone member, his own, unlocked, 3 new · p5 the same, locked · p6 another man's
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-m5a-person.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, PINK } from './full-lib.mjs'
const M5CLOCK = new Date('2026-01-22T09:00:00+08:00')
const state = JSON.parse(readFileSync(join(OUT, 'm5a-state.json'), 'utf8'))
const browser = await chromium.launch()

// round 20d's tile look, verbatim (full-r20-3c.mjs, its 'd' variant folded in), scoped to the drawn window
const CSS = `
.m5p .r17-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));column-gap:4px;row-gap:6px}
.m5p .r17-t{background:#151b22;border-radius:9px;padding:8px 9px;display:grid;grid-template-rows:22px 12px 30px 14px;row-gap:5px;min-width:0;box-sizing:border-box}
.m5p .r17-t.r2{grid-template-rows:22px 30px;padding:8px 5px}
.m5p .r17-t.r2.st{grid-template-rows:22px 30px 14px 14px;row-gap:4px}
.m5p .r17-t .k{grid-row:1;display:flex;align-items:center;justify-content:flex-start;gap:8px;min-width:0}
.m5p .r17-t .tk{font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.m5p .r17-t .f{grid-row:3;display:flex;align-items:center;gap:5px;font:700 20px/1 system-ui;font-variant-numeric:tabular-nums;color:#f1f4f7}
.m5p .r17-t.r2 .f{grid-row:2}
.m5p .r17-t .f.z{color:#7d8894;font-weight:600}
.m5p .r17-t .s{grid-row:4;align-self:center;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.m5p .r17-go{color:#5fd0e6;font:700 16px/1 system-ui}
.m5p .r17-lve{grid-column:span 3}
.m5p .r17-sum{grid-row:2 / span 2;display:grid;grid-template-columns:repeat(3,max-content);justify-content:start;grid-template-rows:12px 30px;row-gap:5px;column-gap:24px}
.m5p .r17-sum .h{grid-row:1;font:600 10.5px/12px system-ui;color:#8a96a3;text-align:left;white-space:nowrap}
.m5p .r17-sum .v{grid-row:2;display:flex;align-items:center;justify-content:flex-start;font:700 15px/1 system-ui;font-variant-numeric:tabular-nums;color:#c9d1d9}
.m5p .r17-sum .v.pd{color:#F2C879}
.m5p .r17-sum .war{font:800 20px/1 system-ui;color:#fff}
.m5p .r17-t.r17-lve{grid-template-rows:22px 12px 30px 14px 14px}
.m5p .r17-ap{grid-row:4;display:flex;align-items:baseline;gap:8px;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.m5p .r17-ap b{font:800 12px/1 system-ui;color:#fff;font-variant-numeric:tabular-nums}
.m5p .r17-t.r17-lve.noap{grid-template-rows:22px 12px 30px 14px}
.m5p .m5-none{color:#8a96a3;font:500 13px/1.3 system-ui;padding:10px 0 4px;border-top:1px solid #222a33}
.m5p .r17-t.noap .r17-cf{grid-row:4}
.m5p .r17-cf{grid-row:5;display:flex;align-items:center;gap:5px;font:600 11px/1 system-ui;color:#8a96a3;white-space:nowrap}
.m5p .r17-box{display:inline-flex;align-items:center;justify-content:flex-start;box-sizing:border-box;height:28px;min-width:42px;padding:0 7px;border:1px solid #66717f;border-radius:6px;background:#0d1217;color:#f1f4f7;font:700 16px/1 system-ui;font-variant-numeric:tabular-nums}
.m5p .r17-box.sm{height:18px;min-width:22px;padding:0 4px;font-size:11.5px;border-radius:4px;justify-content:center}
.m5p .r17-box.z{color:#7d8894;font-weight:600}
.m5p .r17-box.ro{border-color:transparent;background:transparent;min-width:0;padding:0}
.m5p .r17-t .f .r17-box.ro{font-size:20px}
.m5p .r17-t .ln{display:flex;align-items:baseline;justify-content:space-between;gap:3px;font:600 10px/1 system-ui;color:#8a96a3;white-space:nowrap}
.m5p .r17-t .ln.a{grid-row:3}.m5p .r17-t .ln.b{grid-row:4}
.m5p .r17-t .ln b{font:800 11px/1 system-ui;font-variant-numeric:tabular-nums;color:#fff}
.m5p .r17-t .ln b.pd{color:#F2C879;font-weight:700}
.m5p .kb{display:inline-flex;align-items:center;justify-content:center;height:22px;min-width:34px;padding:0 6px;border-radius:5px;font:800 11.5px/1 system-ui;box-sizing:border-box}
/* the body */
.m5p .m5-body{padding:4px 14px 14px;display:flex;flex-direction:column;gap:6px}
.m5p .m5-hd{display:flex;align-items:center;gap:10px;min-height:30px;font:700 11.5px/1 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#8a96a3}
.m5p .m5-hd .sp{flex:1}
.m5p .m5-lk{display:inline-flex;align-items:center;gap:5px;letter-spacing:0;text-transform:none;font:600 12px/1 system-ui;color:#c9d1d9;border:1px solid #3a4452;border-radius:6px;padding:4px 7px}
.m5p .m5-typed{letter-spacing:0;text-transform:none;font:600 11px/1 system-ui;color:#8a96a3}
.m5p .m5-yr{letter-spacing:0;text-transform:none}
.m5p .m5-list{display:flex;flex-direction:column}
.m5p .m5-list .ll-row{grid-template-columns:10px 34px 1fr max-content 64px;min-height:34px;font-size:13.5px;border-top:1px solid #222a33;padding:5px 0}
.m5p .m5-list .ll-row .ll-box{min-width:34px;height:22px;font-size:11px}
.m5p .m5-list .ll-row .ll-state{font-size:12.5px}
.m5p .m5-list .ll-row .ll-state.ref{color:#7d8894}
.m5p .m5-dot{width:7px;height:7px;border-radius:50%;background:#38bdf8;justify-self:start}
.m5p .m5-by{grid-column:3 / -1;font:500 11.5px/1.2 system-ui;color:#8a96a3;margin-top:-2px}
.m5p .ll-row.gone .ll-dates{text-decoration:line-through;color:#8a96a3}
.m5p .m5-clip{color:#8a96a3;margin-left:6px}
`
const LOCK = '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="5.2" width="9" height="6" rx="1.3"/><path d="M3 5.2V3.6a2.5 2.5 0 0 1 5 0v1.6"/></svg>'
const CLIP = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>'
// the kinds' boxes as the grid's look F draws them (D1175): the app's own classes, copied off a grid cell at run time
const box = (v, o = {}) => `<span class="r17-box${o.sm ? ' sm' : ''}${o.ro ? ' ro' : ''}${v === '0' ? ' z' : ''}">${v}</span>`

// one person's figures: { app, appr, pend, war, cf, taken, typed, oil, med, other: {CCL:[v,pend],…} }
function tiles(F, ro) {
  const kb = (k, cls) => `<span class="kb ${cls}">${k}</span>`
  const lve = `<div class="r17-t r17-lve${F.appr === '0' ? ' noap' : ''}" data-zk="lve"><span class="k">${kb('LVE', 'kLVE')}<span class="tk">${F.taken} taken</span></span>` +
    `<div class="r17-sum" data-zk="sum"><span class="h" style="grid-column:1">App bal</span><span class="h" style="grid-column:2">Pending</span><span class="h" style="grid-column:3">War bal</span>` +
    `<span class="v" style="grid-column:1">${box(F.app, { ro })}</span><span class="v pd" style="grid-column:2">${F.pend}</span><span class="v war" style="grid-column:3">${F.war}</span></div>` +
    // D1472: approved leave placed since App bal was typed comes off too — one small line, only while there is some
    (F.appr !== '0' ? `<span class="r17-ap" data-zk="ap">Approved since ${F.typed} <b>${F.appr}</b></span>` : '') +
    `<span class="r17-cf">incl. ${box(F.cf, { ro, sm: 1 })} carried fwd · till 31 Dec</span></div>`
  const t1 = (k, v, o) => `<div class="r17-t" data-zk="${k}"><span class="k">${kb(k, 'k' + k)}</span><span class="f${v === '0' ? ' z' : ''}">${v}${o.go ? '<span class="r17-go">›</span>' : ''}</span>${o.sub ? `<span class="s">${o.sub}</span>` : ''}</div>`
  const t2 = (k, [v, pend, war]) => `<div class="r17-t r2${pend ? ' st' : ''}" data-zk="${k}"><span class="k">${kb(k, 'kO')}</span><span class="f">${box(v, { ro })}</span>` +
    (pend ? `<span class="ln a"><span>Pending</span><b class="pd">−${pend}</b></span><span class="ln b"><span>War bal</span><b>${war}</b></span>` : '') + '</div>'
  return `<div class="r17-bal">${lve}${t1('OIL', F.oil, { go: 1 })}${t1('MED', F.med, { sub: 'days' })}${Object.entries(F.other).map(([k, x]) => t2(k, x)).join('')}</div>`
}

// his leave, one line each, from the grid's own cells (look F's box cloned, D1175); `extra` adds the drawn-in lines
function leaveRows(p, pid, extra) {
  return p.evaluate(([pid, extra]) => {
    const cells = [...document.querySelectorAll(`#page-leavewar td[data-testid^="cell-${pid}-2026"]`)]
    const runs = []
    for (const td of cells) {
      const d = td.dataset.testid.slice(-10)
      for (const c of td.querySelectorAll(':scope > .c, :scope .c')) {
        const code = c.textContent.replace(/[*<>]/g, '').trim(); if (!/^(LL|OL|CCL|FCL|PL|EL|CL)$/.test(code)) continue
        const st = /\bs-r\b|\bref\b/.test(c.className) ? 'ref' : /\bs-w\b|\bwait\b/.test(c.className) ? 'pend' : 'appr'
        // the grid draws a morning box at the cell's top, an afternoon at its foot (MatrixRows.tsx Place)
        const half = /\btop\b/.test(c.className) ? 'AM' : /\bbot\b/.test(c.className) ? 'PM' : ''
        const last = runs[runs.length - 1]
        const next = new Date(new Date((last?.to || d) + 'T12:00:00').getTime() + 864e5).toISOString().slice(0, 10)
        const wkGap = last && (() => { let x = last.to; for (let i = 0; i < 4; i++) { x = new Date(new Date(x + 'T12:00:00').getTime() + 864e5).toISOString().slice(0, 10); if (x === d) return true; const wd = new Date(x + 'T12:00:00').getDay(); if (wd !== 0 && wd !== 6) return false } return false })()
        if (last && last.code === code && last.st === st && !half && !last.half && (last.to === d || next === d || wkGap)) { last.to = d; last.days += 1 }
        else runs.push({ code, st, half, from: d, to: d, days: half ? 0.5 : 1, cls: c.className })
      }
    }
    const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dd = s => { const t = new Date(s + 'T12:00:00'); return { w: W[t.getDay()], d: t.getDate(), m: M[t.getMonth()] } }
    const words = r => { const a = dd(r.from), b = dd(r.to); return r.from === r.to ? `${a.w} ${a.d} ${a.m}${r.half ? ', ' + r.half : ''}` : a.m === b.m ? `${a.w} ${a.d} – ${b.w} ${b.d} ${a.m}` : `${a.w} ${a.d} ${a.m} – ${b.w} ${b.d} ${b.m}` }
    const all = [...runs, ...extra.filter(e => e.code)].sort((a, b) => a.from < b.from ? -1 : 1)
    return all.map(r => {
      const x = extra.find(e => e.from === r.from) || r
      const stw = r.st === 'appr' ? 'Approved' : r.st === 'pend' ? 'Pending' : r.st === 'ref' ? 'Refused' : 'Deleted'
      const boxCls = (r.cls || 'c k-ll s-w').replace(/(^|\s)(am|pm|top|bot|whole|left|right|right-am|right-pm|tap|editable|moved|wide|w4|sel\S*|j\S*|r7-\S+)(?=\s|$)/g, ' ').trim()
      return `<div class="ll-row${r.st === 'gone' ? ' gone' : ''}" data-zk="row-${r.from}"><span>${x.isNew ? '<i class="m5-dot"></i>' : ''}</span>` +
        `<span class="${boxCls} ll-box" style="position:static">${r.code}</span><span class="ll-dates">${words(r)}${x.clip ? `<span class="m5-clip">${x.clip}</span>` : ''}</span>` +
        `<span class="ll-days">${String(r.days)}</span><span class="ll-state${r.st === 'pend' ? ' pend' : r.st === 'ref' || r.st === 'gone' ? ' ref' : ''}">${stw}</span>` +
        (x.by ? `<span></span><span></span><span class="m5-by">${x.by}</span>` : '') + '</div>'
    }).join('')
  }, [pid, extra])
}

async function scene(p, { pid, F, ro, lockWords, extra, phone, dockW = 560 }) {
  // '@Name' finds a man by the callsign his row shows
  if (pid.startsWith('@')) pid = await p.evaluate(n => [...document.querySelectorAll('[data-testid^="person-"]')].find(e => e.textContent.trim().startsWith(n))?.dataset.testid.slice(7), pid.slice(1))
  const rows = (await leaveRows(p, pid, extra)) || '<div class="m5-none">No leave in 2026 and ahead.</div>'
  await p.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center' }), 'person-' + pid)
  await p.waitForTimeout(250)
  await (phone ? p.tap(q('person-' + pid)) : p.click(q('person-' + pid))); await p.waitForTimeout(600)
  const r = await p.evaluate(([css, body, phone, dockW]) => {
    if (!document.getElementById('m5css')) { const s = document.createElement('style'); s.id = 'm5css'; s.textContent = css; document.head.appendChild(s) }
    const sh = document.querySelector('[data-testid="person-figures"]'); if (!sh) return 'NO SHEET'
    const win = sh.closest('.bidsheet') || sh
    win.classList.add('m5p')
    // keep the title bar (name, ✕); drop today's caption, key and list; the new body after the title bar
    const hd = win.querySelector('.bidsheet-hd'); hd.querySelector('.dt')?.remove()
    win.querySelectorAll('.clegend, .clist').forEach(n => n.remove())
    hd.insertAdjacentHTML('afterend', body)
    // where it stands: desktop docked to the grid card's right edge, under the grid's bar; phone in the middle (D997)
    const card = document.querySelector('#page-leavewar .mx-outer').parentElement.getBoundingClientRect()
    if (phone) {
      Object.assign(win.style, { left: '10px', right: '10px', width: 'auto', maxWidth: 'none', bottom: 'auto', transform: 'none', margin: '0', height: 'auto', overflow: 'auto', maxHeight: (innerHeight - 24) + 'px' })
      const h = Math.min(win.scrollHeight, innerHeight - 24); win.style.top = Math.max(12, (innerHeight - h) / 2) + 'px'
    } else {
      const top = Math.max(card.top, 0) + 64
      Object.assign(win.style, { left: 'auto', right: (innerWidth - card.right + 8) + 'px', top: top + 'px', bottom: 'auto', width: dockW + 'px', maxWidth: dockW + 'px', height: 'auto', maxHeight: (innerHeight - top - 10) + 'px', transform: 'none', overflow: 'auto', margin: '0' })
    }
    // the kinds' boxes as the grid's: borrow a grid chip's look for each kind's tile box
    // only a filled (approved) box: a tile's kind box is the kind's colour, never a pending box's hollow look
    const gridChip = k => [...document.querySelectorAll('#page-leavewar td .c.s-a')].find(c => c.textContent.trim() === k)
    for (const kb of win.querySelectorAll('.kb')) {
      // the five other leaves share one look on the grid (D1175: other leave blue) — every tile borrows the same one
      const OTHER5 = ['CCL', 'FCL', 'PL', 'EL', 'CL']
      const k = kb.textContent.trim()
      const src = k === 'LVE' ? gridChip('LL') : OTHER5.includes(k) ? OTHER5.map(gridChip).find(Boolean) : gridChip(k)
      const cs = src ? getComputedStyle(src) : null
      if (cs) Object.assign(kb.style, { background: cs.backgroundColor, color: cs.color, border: cs.border })
      else Object.assign(kb.style, k === 'OIL' ? { background: '#2c4a1c', color: '#dff5b0', border: '1.5px solid #aae628' } : k === 'MED' ? { background: '#4a1f24', color: '#ffd5d8', border: '1.5px solid #ee5252' } : { background: '#26304f', color: '#d9e2ff', border: '1.5px solid #7f93ff' })
    }
    const over = [...win.querySelectorAll('.r17-sum, .r17-cf, .r17-t, .ll-row, .m5-hd')].map(e => [e.className.split(' ')[0], e.scrollWidth - e.clientWidth]).filter(x => x[1] > 0)
    const b = win.getBoundingClientRect()
    return { over, box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], scroll: win.scrollHeight - win.clientHeight }
  }, [CSS, body(F, ro, lockWords, rows), !!phone, dockW])
  await p.mouse.move(2, 2)
  return r
}
const body = (F, ro, lockWords, rows) => `<div class="m5-body">` +
  `<div class="m5-hd">Balances${lockWords ? `<span class="m5-lk">${LOCK}${lockWords}</span>` : ''}</div>` +
  tiles(F, ro) +
  `<div class="m5-hd" style="margin-top:6px">Leave<span class="sp"></span><button class="lw-btn m5-yr" style="height:30px;padding:0 10px;border:1px solid #3a4452;border-radius:7px;background:#11161c;color:#e6edf3;font:600 13px system-ui">2026 and ahead ▾</button></div>` +
  `<div class="m5-list">${rows}</div></div>`

// Ranger's figures (the staged case): App bal 17 typed Mon 5 Jan; approved since then 26–27 Jan (2); pending 2.5
const RANGER = { app: '17', appr: '−2', pend: '−2.5', war: '12.5', cf: '4', taken: '3', typed: '5 Jan', oil: '0', med: '0',
  other: { CCL: ['3', '1', '2'], FCL: ['5'], PL: ['2'], EL: ['0'], CL: ['1'] } }
// the drawn-in parts of his list: what is new since his last visit (D1231), a deleted leave struck for that visit
const NEWS = [
  { from: '2026-01-26', isNew: 1, by: 'approved by Saber · yesterday 08:40' },
  { from: '2026-02-02', isNew: 1, by: 'refused by Saber · yesterday 08:42' },
  { from: '2026-02-09', to: '2026-02-09', code: 'LL', st: 'gone', days: 1, isNew: 1, by: 'deleted by Saber · yesterday 08:45', cls: 'c k-ll s-w' },
  { from: '2026-01-19', clip: CLIP },
]
const FIT = []
async function one(name, who, w, h, touch, o) {
  const { ctx, p } = await newPage(browser, w, h, touch, state)
  await p.clock.setFixedTime(M5CLOCK)
  await signIn(p, who)
  if (o.myleave) {
    // My leave as built, then the same with the count of what is new since his last visit (the question's option)
    const clip = { x: 0, y: 0, width: w, height: 330 }
    await shot(p, name + '-today', { clip })
    await p.evaluate(() => {
      const ml = document.querySelector('[data-testid="my-leave"]')
      const tw = document.createTreeWalker(ml, NodeFilter.SHOW_TEXT); let t
      while ((t = tw.nextNode()) && !/my leave/i.test(t.textContent));
      const s = document.createElement('span'); s.textContent = '● 3 new'
      Object.assign(s.style, { color: '#38bdf8', fontWeight: '700', marginLeft: '6px', letterSpacing: '0', textTransform: 'none' })
      t.parentNode.insertBefore(s, t.nextSibling)
      ml.style.outline = '2px solid #ff2d95'; ml.style.outlineOffset = '2px'
    })
    await shot(p, name + '-count', { clip })
  } else if (o.today) {
    if (touch) { await p.tap(q('my-leave')); await p.waitForTimeout(700) }
    else { await p.click(q('person-bane')); await p.waitForTimeout(700) }
    await shot(p, name)
  } else {
    if (o.wide) await p.addStyleTag({ content: '.m5p .m5-body *{letter-spacing:.07em}' })
    const r = await scene(p, { phone: touch, ...o })
    FIT.push([name, JSON.stringify(r)])
    if (o.marks) for (const [sel, lab] of o.marks) await p.evaluate(([sel, lab, PINK]) => {
      const el = document.querySelector('.m5p ' + sel); if (!el) return
      el.style.outline = `2px solid ${PINK}`; el.style.outlineOffset = '2px'; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
      const t = document.createElement('i'); t.textContent = lab
      Object.assign(t.style, { position: 'absolute', right: '-10px', top: '-11px', background: PINK, color: '#fff', font: '700 11px/1 system-ui', fontStyle: 'normal', padding: '3px 5px', borderRadius: '9px', zIndex: 5, boxShadow: '0 0 0 2px #0b0d10' })
      el.appendChild(t)
    }, [sel, lab, PINK])
    await shot(p, name)
  }
  await ctx.close()
}
// Gambit, another man, as a member sees him: read only, no dots (what is new is his own to see — D1231)
const OTHER = { app: '8.5', appr: '0', pend: '−0.5', war: '8', cf: '2', taken: '1', typed: '12 Jan', oil: '0', med: '0', other: { CCL: ['0'], FCL: ['0'], PL: ['0'], EL: ['0'], CL: ['0'] } }
await one('m5a-p1-desk-today', 'admin', 1536, 864, false, { today: 1 })
await one('m5a-p2-desk-drawn', 'admin', 1536, 864, false, { pid: 'bane', F: RANGER, ro: false, lockWords: 'Locked for members', extra: [{ from: '2026-01-19', clip: CLIP }],
  marks: [['.r17-ap', '1'], ['.m5-list', '2']] })
await one('m5a-p3-phone-today', 'member', 402, 874, true, { today: 1 })
await one('m5a-p4-phone-own', 'member', 402, 874, true, { pid: 'bane', F: RANGER, ro: false, lockWords: '', extra: NEWS })
await one('m5a-p5-phone-locked', 'member', 402, 874, true, { pid: 'bane', F: RANGER, ro: true, lockWords: 'Locked by admin', extra: NEWS })
await one('m5a-p7-myleave', 'member', 402, 874, true, { myleave: 1 })
// an iPhone's letters run about a seventh wider than this browser's: the same window, its words spaced out to match
await one('m5a-p4w-phone-wide', 'member', 402, 874, true, { pid: 'bane', F: RANGER, ro: false, lockWords: '', extra: NEWS, wide: 1 })
await one('m5a-p6-phone-other', 'member', 402, 874, true, { pid: '@Gambit', F: OTHER, ro: true, lockWords: '', extra: [] })
for (const f of FIT) console.log(...f)
await browser.close(); console.log('errors:', errs)
