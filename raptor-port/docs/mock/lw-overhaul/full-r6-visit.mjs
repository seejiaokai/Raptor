// Round 6 (night of 21-22 Oct 26): D1199, "since your last visit", designed the app's own way and drawn.
// Three options, all drawn INTO THE REAL LOCAL BUILD (the clock held at Thu 8 Jan 26):
//   A (recommended) — what is new shows where each person already looks. A member: "My leave" carries "3 new", fed by
//     the bell's own Leave War lines (D1142); his list marks those lines with the bell's own unread dot; a tap on one
//     lands the grid there with the app's one just-added ring. An admin: Approvals carries "3 new"; its list gains a
//     "New" view — the requests placed since he last opened it, then what changed that needs no decision.
//   B — the changed cells marked on the grid with a small dot, for that visit only.
//   C — nothing new: the bell already says it (D1142).
// The top is drawn as round 4 left it (full-r4.mjs: "View", the open-dates chip, "My leave", Approvals after + New);
// the cells are drawn in look F (D1175): filled approved, dashed waiting, grey struck refused. Nothing is built.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r6-visit.mjs
import { join } from 'node:path'
import { chromium, OUT, errs, PINK, newPage, signIn, mark, unmark, gridTo } from './full-lib.mjs'
const browser = await chromium.launch()

const CHEV = '<svg viewBox="0 0 12 8" width="1em" height=".7em" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="#57c97a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const DOT = '<i class="zd" aria-hidden="true"></i>'

const CSS = `
#page-leavewar .zrow{display:flex;align-items:center;gap:8px;width:100%;white-space:nowrap}
.zsp{flex:1}
.zlab{font:600 11px system-ui;letter-spacing:.14em;color:#8a96a3}
.zchip{display:inline-flex;align-items:center;gap:6px;height:var(--ch);padding:0 10px;border-radius:7px;border:1px solid #2a323c;background:#12161b;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
.zchip b{font-weight:700;color:#fff}
.zchip .n{font-style:normal;font:700 calc(var(--fs) - 1px) system-ui;color:#5fd0e6;background:#16303b;border-radius:9px;padding:1px 7px}
.zchip.pick{border-color:rgba(87,201,122,.55);background:#0f1d15;font-weight:700;height:28px;font-size:var(--pf)}
.zchip.sq{width:28px;height:28px;justify-content:center;padding:0;font-size:18px;font-weight:400;color:#c9d1d9}
.zchip.open{border-color:rgba(87,201,122,.7);background:#0f1d15}.zchip.open b{color:#8FE0A8}
.zml{display:flex;align-items:center;gap:5px;height:var(--mh);padding:0 12px;border-radius:8px;border:1px solid #2a323c;background:#1a1f26;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
.zml b{font-weight:800}.zml .zlab{margin-right:4px}
.zrow>.zml:only-child{flex:1}
/* "new": the bell list's own unread dot (cyan, 7px) and its count in the accent's words */
.zd{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:#3bc6e8;font-style:normal}.zd.off{background:transparent}
.znw{display:inline-flex;align-items:center;gap:4px;color:#5fd0e6;font:700 var(--fs) system-ui}
.zml .znw{margin:0 6px 0 4px}.zchip .znw{margin-left:2px;font-size:calc(var(--fs) - 1px)}
.zrow3{display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid #2a313a}
/* look F (D1175) on the grid */
.zbox{position:absolute;left:3px;right:3px;top:3px;bottom:3px;display:flex;align-items:center;justify-content:center;border-radius:3px;font:800 10px system-ui;z-index:2;pointer-events:none}
.zbox.ok{background:rgba(var(--h),.24);box-shadow:inset 0 0 0 1px rgba(var(--h),.95);color:#FFF1CF}
.zbox.wt{box-shadow:none;outline:1px dashed rgba(var(--h),.95);outline-offset:-1px;color:rgb(var(--h))}
.zbox.rf{background:#1d2229;box-shadow:inset 0 0 0 1px #4a5560;color:#6b7785;text-decoration:line-through}
.zbox.am{bottom:50%;top:2px;margin-bottom:0;font-size:6.5px}
.zcd{position:absolute;right:1px;top:1px;width:7px;height:7px;border-radius:50%;background:#3bc6e8;box-shadow:0 0 0 1.5px #0b0d10;z-index:3}
.zring{position:absolute;left:1px;top:1px;bottom:1px;border:2px solid #4c8dff;border-radius:4px;z-index:4;pointer-events:none}
/* the member's list, from the foot (as the person window of round 2) */
.zsheet{position:fixed;left:8px;right:8px;bottom:0;z-index:90;background:#161b22;border:1px solid #2a323c;border-bottom:0;border-radius:14px 14px 0 0;padding:6px 10px 10px;box-shadow:0 -8px 24px rgba(0,0,0,.55);color:#e6edf3;font-family:system-ui}
.zt{display:flex;align-items:center;gap:8px;height:40px;border-bottom:1px solid #2a323c;padding:0 4px;margin-bottom:8px}
.zt b{font:800 15px system-ui;letter-spacing:.06em}.zsub{color:#8a96a3;font:500 13px system-ui}
.zgrip{color:#6b7785;font-size:14px}.zx{color:#9aa5b1;font-size:16px}
.zln{display:flex;align-items:flex-start;gap:8px;padding:9px 10px;margin-bottom:6px;border-radius:10px;background:#12161b;border:1px solid #232b34}
.zln>.zd{margin-top:8px}
.zlm{flex:1;min-width:0}.zl1{display:flex;align-items:center;gap:8px}.zl1 .zdt{font:700 14px system-ui}
.zl2{margin-top:4px;color:#9aa5b1;font:500 12.5px system-ui}
.zln.new .zl2{color:#c9d1d9}.zln.del .zdt{text-decoration:line-through;color:#8a96a3}
.zst{font:600 12.5px system-ui;padding:0 4px}.zst.ok{color:#8FE0A8;outline:1px solid rgba(87,201,122,.7)}.zst.wt{color:#e6edf3;outline:1px dashed #9aa5b1}.zst.rf{color:#ff8a92;outline:1px solid rgba(240,85,95,.7)}.zst.gone{color:#9aa5b1;outline:1px solid #3a4652}
.zkb{display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:22px;border-radius:3px;outline:1px dashed rgba(var(--h),.95);outline-offset:-1px;color:rgb(var(--h));font:800 9.5px system-ui}
.zkb.ok{outline-style:solid;background:rgba(var(--h),.22);color:#FFF1CF}.zkb.rf,.zkb.gone{outline:1px solid #4a5560;color:#6b7785;text-decoration:line-through;background:#1a1f26}
/* the admin's Approvals window (as round 4's, with its D1189 columns) */
.zwin{position:fixed;z-index:90;background:#161b22;border:1px solid #2a323c;border-radius:12px;padding:4px 12px 10px;box-shadow:0 10px 30px rgba(0,0,0,.6);color:#c9d1d9;font:13px system-ui}
.zdates{display:flex;align-items:center;gap:4px;height:46px;border-bottom:1px solid #2a323c;white-space:nowrap}
.zmb{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 6px;border-radius:7px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 12px system-ui}
.zmb.on{border-color:#3f8fa6;background:#14313b;color:#5fd0e6}.zmb.dim{color:#5c6773;border-color:#222a33;background:#0f1317}.zmb em{font-style:normal;font-weight:800}
.zvs{width:1px;height:20px;background:#2f3a46;margin:0 4px}
.zapall{display:inline-flex;align-items:center;height:30px;padding:0 14px;border-radius:8px;border:1px solid rgba(87,201,122,.6);background:#183224;color:#8FE0A8;font:700 13px system-ui}
.zr{display:flex;align-items:center;gap:10px;min-height:46px;border-bottom:1px solid #222a33;white-space:nowrap}
.zr.hdr{min-height:26px;font:600 9.5px system-ui;letter-spacing:.12em;color:#8a96a3}
.zpk{display:inline-flex;align-items:center;gap:4px;width:112px;flex:none}
.zpk .cs{flex:1;padding:2px 8px;border-radius:4px;font:600 12.5px system-ui}
.zpk.pilot .cs{background:#423F1C;color:#FBFAF0}.zpk.wso .cs{background:#13402F;color:#EAFBF3}
.zpk i{font-style:normal;font:800 9px system-ui;padding:2px 5px;border-radius:8px}
.zdt2{width:150px;flex:none;color:#e6edf3;font-weight:600}
.zc{flex:none;font-size:12.5px}.zc b{color:#fff}.zc.dy{width:52px}.zc.bl{width:64px;text-align:right;padding-right:14px}.zc.av{width:100px}.zc.pl{width:96px;color:#9aa5b1}
.zap,.zrf{display:inline-flex;align-items:center;justify-content:center;flex:none;height:30px;border-radius:7px;font:700 13px system-ui}
.zap{width:86px;border:1px solid rgba(87,201,122,.55);background:#183224;color:#8FE0A8}
.zrf{width:76px;border:1px solid rgba(240,85,95,.5);background:#2d1618;color:#FFA6AD}
.zgh{display:flex;align-items:center;gap:8px;height:30px;margin-top:12px;border-bottom:1px solid #2a323c}.zgh .l2{font:500 12px system-ui;color:#8a96a3}
.zr.o{min-height:42px}.zwhat{width:262px;flex:none;color:#c9d1d9}
.zgo{color:#5fd0e6;font:600 12.5px system-ui}
`
// the top, as round 4 drew it — phone: View (+ an admin's + and Approvals) / open · under · Legend / My leave
const topPhone = (s) => {
  const r1 = `<div class="zrow"><span class="zlab">VIEW</span><span class="zchip pick">JAN - DEC 26 ${CHEV}</span>${s.admin ? `<span class="zchip sq">+</span><span class="zchip" data-zk="appr">Approvals <i class="n">15</i>${s.apNew ? `<span class="znw">${DOT}${s.apNew} new</span>` : ''}</span>` : ''}<span class="zsp"></span></div>`
  const r2 = `<div class="zrow"><span class="zchip open" data-zk="open">${s.openDot ? DOT : ''}<span>Open</span><b>1 Jan – 31 Mar</b></span><span class="zchip">Under <b>0</b> days</span><span class="zsp"></span><span class="zchip">Legend</span></div>`
  const r3 = `<div class="zrow"><span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE 14.5</b> · OIL 0 · 2 waiting · next 19 Jan<span class="zsp"></span>${s.mlNew ? `<span class="znw">${DOT}${s.mlNew} new</span>` : ''}›</span></div>`
  return [r1, r2, r3]
}
const topDesk = (s) => {
  const r1 = `<div class="zrow"><span class="zlab">VIEW</span><span class="zchip pick">JAN - DEC 26 ${CHEV}</span><span class="zchip">+ New</span><span class="zchip" data-zk="appr">Approvals <i class="n">15</i>${s.apNew ? `<span class="znw">${DOT}${s.apNew} new</span>` : ''}</span></div>`
  const r2 = `<div class="zrow"><span class="zchip open"><span>Open for bidding</span><b>1 Jan – 31 Mar</b></span><span class="zlab">UNDER-MANNED</span><span class="zchip"><b>0</b> days</span><span class="zchip">Legend</span><span class="zsp"></span><span class="zml"><span class="zlab">MY LEAVE</span><b>LVE 17</b> · OIL 0 · 0 waiting · next 30 Jan ›</span></div>`
  return [r1, r2]
}

// a person's id on the war, by his callsign
const ids = p => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="person-"]')].map(e => [e.textContent.replace(/(IR|IP|IW|A|B|C|D)\s*$/, '').trim(), e.getAttribute('data-testid').slice(7)])))
const KIND = { LL: '242,200,110', OL: '226,146,38', OIL: '70,196,108' }
// put a look-F box in a cell: [person id, iso date, kind, state ok|wt|rf, half am?]
const boxes = (p, list) => p.evaluate(([list, KIND]) => {
  for (const [id, d, k, st, half] of list) {
    const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); if (!c) { console.log('no cell', id, d); continue }
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative'
    c.querySelectorAll('.zbox').forEach(n => n.remove())
    const b = document.createElement('span'); b.className = `zbox ${st}${half ? ' am' : ''}`; b.style.setProperty('--h', KIND[k]); b.textContent = k
    c.appendChild(b)
  }
}, [list, KIND])
const dots = (p, list) => p.evaluate(list => { for (const [id, d] of list) { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); if (!c) continue; if (getComputedStyle(c).position === 'static') c.style.position = 'relative'; const s = document.createElement('span'); s.className = 'zcd'; c.appendChild(s) } }, list)

async function stage(p, phone, s) {
  await p.evaluate(([css, rows, phone]) => {
    if (!document.getElementById('zzcss')) { const st = document.createElement('style'); st.id = 'zzcss'; st.textContent = css; document.head.appendChild(st) }
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    pg.style.setProperty('--ch', phone ? '23px' : '32px'); pg.style.setProperty('--fs', phone ? '11.2px' : '13.5px')
    pg.style.setProperty('--pf', phone ? '12.6px' : '13.5px'); pg.style.setProperty('--mh', phone ? '25px' : '34px')
    top.innerHTML = rows[0]; fil.innerHTML = rows[1]
    pg.querySelector('.zrow3')?.remove()
    if (rows[2]) { const r = document.createElement('div'); r.className = 'zrow3'; r.innerHTML = rows[2]; fil.after(r) }
  }, [CSS, phone ? topPhone(s) : topDesk(s), phone])
  await p.waitForTimeout(300)
}

// ======================= the member, on his phone =======================
{
  const { ctx, p } = await newPage(browser, 390, 844, true)
  await signIn(p, 'member')
  await stage(p, true, { mlNew: 0, openDot: false })
  // the bell as it is today
  await p.tap('.bellbtn'); await p.waitForTimeout(500)
  await p.screenshot({ path: join(OUT, 'r6-visit-bell-today-phone.png'), clip: { x: 0, y: 0, width: 390, height: 430 } }); console.log('shot bell-today')
  // option C: the bell's own lines for the three decisions (D1142, worded by D769)
  await p.evaluate(() => {
    const list = document.querySelector('.bell-list'); if (!list) return
    list.querySelector('.bl-empty')?.remove()
    const line = (name, day, what, ago) => `<button type="button" class="bl-line unread"><span class="bl-dot"></span><span class="bl-main"><span class="bl-t"><b class="bl-name">${name}</b><i class="bl-day">${day}</i></span><span class="bl-what">${what}</span></span><span class="bl-ago">${ago}</span></button>`
    list.insertAdjacentHTML('afterbegin', line('Your leave', 'Mon 19 – Wed 21 Jan', 'LL approved · Saber', '20m') + line('Your leave', 'Mon 2 Feb', 'LL refused · Saber', '20m') + line('Your leave', 'Mon 9 Feb', 'LL deleted · Saber', '1d'))
    if (!list.querySelector('.bl-foot')) list.insertAdjacentHTML('beforeend', '<div class="bl-foot"><button type="button" class="abtn sm ghost">Mark all read</button></div>')
    document.querySelector('.bellbtn')?.classList.add('on')
  })
  await mark(p, '.bell-list', '1', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-C-phone.png'), clip: { x: 0, y: 0, width: 390, height: 430 } }); console.log('shot C-phone')
  await unmark(p); await p.keyboard.press('Escape'); await p.mouse.click(200, 700); await p.waitForTimeout(400)
  await p.evaluate(() => { document.querySelector('.bell-list')?.remove() })

  const I = await ids(p); const R = I.Ranger
  console.log('Ranger id', R)
  await boxes(p, [
    [R, '2026-01-19', 'LL', 'ok'], [R, '2026-01-20', 'LL', 'ok'], [R, '2026-01-21', 'LL', 'ok'],
    [R, '2026-01-26', 'LL', 'wt'], [R, '2026-01-27', 'LL', 'wt'], [R, '2026-01-29', 'LL', 'wt', true],
    [I.Reaper, '2026-01-19', 'OL', 'ok'], [I.Reaper, '2026-01-20', 'OL', 'ok'], [I.Reaper, '2026-01-21', 'OL', 'ok'], [I.Reaper, '2026-01-22', 'OL', 'ok'],
    [I.Anvil, '2026-01-20', 'LL', 'ok'], [I.Cinch, '2026-01-22', 'LL', 'wt'], [I.Cinch, '2026-01-23', 'LL', 'wt'],
    [I.Piston, '2026-01-26', 'LL', 'ok'], [I.Piston, '2026-01-27', 'LL', 'ok'], [I.Saber, '2026-01-30', 'LL', 'ok'],
    [I.Drifter, '2026-01-27', 'OL', 'wt'], [I.Basher, '2026-01-27', 'LL', 'wt'],
  ])
  await gridTo(p, '2026-01-19', R)

  // A1 — he lands: "My leave" says 3 new; the open dates' chip wears the dot (bidding opened since his last visit)
  await stage(p, true, { mlNew: 3, openDot: true })
  await mark(p, '[data-zk="ml"]', '1', { num: true }); await mark(p, '[data-zk="open"]', '2', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-A-phone.png') }); console.log('shot A-phone')
  await unmark(p)

  // A2 — a tap on "My leave": his list, the three new lines wearing the bell's own unread dot
  await p.evaluate(([DOT]) => {
    const kb = (k, st) => `<span class="zkb ${st}" style="--h:242,200,110">${k}</span>`
    const L = [
      [1, 'ok', 'Mon 19 – Wed 21 Jan', 'Approved', '3 days · approved by Saber · 08:40', 'a'],
      [0, 'wt', 'Mon 26 – Tue 27 Jan', 'Waiting', '2 days · placed 5 Jan'],
      [0, 'wt', 'Thu 29 Jan, AM', 'Waiting', '½ day · placed 7 Jan'],
      [1, 'rf', 'Mon 2 Feb', 'Refused', '1 day · refused by Saber · 08:40'],
      [1, 'gone', 'Mon 9 Feb', 'Deleted', '1 day · approved 3 Jan, deleted by Saber yesterday', 'd'],
    ]
    const sh = document.createElement('div'); sh.className = 'zsheet'
    sh.innerHTML = `<div class="zt"><span class="zgrip">⠿</span><b>Ranger</b><span class="zsub">my leave</span><span class="zsp"></span><span class="znw" data-zk="cnt" style="--fs:13px">${DOT}3 new</span><span class="zx">✕</span></div>`
      + L.map(([nw, st, d, w, sub, k]) => `<div class="zln${nw ? ' new' : ''}${st === 'gone' ? ' del' : ''}"${k ? ` data-zk="${k}"` : ''}>${nw ? DOT : '<i class="zd off"></i>'}<div class="zlm"><div class="zl1">${kb('LL', st)}<b class="zdt">${d}</b><span class="zsp"></span><span class="zst ${st}">${w}</span></div><div class="zl2">${sub}</div></div></div>`).join('')
    document.body.appendChild(sh)
  }, [DOT])
  await mark(p, '[data-zk="cnt"]', '3'); await mark(p, '[data-zk="a"]', '4', { num: true }); await mark(p, '[data-zk="d"]', '5', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-A-phone-list.png') }); console.log('shot A-phone-list')
  await unmark(p); await p.evaluate(() => document.querySelector('.zsheet')?.remove())

  // A3 — a tap on the approved line: the grid lands on 19 Jan, the three days in the app's one just-added ring (about 6
  // seconds), and "My leave" no longer says new — the list was opened, so all three are read (here and in the bell)
  await stage(p, true, { mlNew: 0, openDot: true })
  await p.evaluate(() => document.querySelector('.bellbtn')?.classList.remove('on'))
  await p.evaluate(R => {
    const c = document.querySelector(`[data-testid="cell-${R}-2026-01-19"]`); if (!c) return
    const w = ['19', '20', '21'].reduce((a, d) => a + (document.querySelector(`[data-testid="cell-${R}-2026-01-${d}"]`)?.offsetWidth || 0), 0)
    const r = document.createElement('span'); r.className = 'zring'; r.style.width = (w - 2) + 'px'; r.dataset.zk = 'ring'; c.appendChild(r)
  }, R)
  await mark(p, '[data-zk="ring"]', '6', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-A-phone-grid.png') }); console.log('shot A-phone-grid')
  await unmark(p); await p.evaluate(() => document.querySelectorAll('.zring').forEach(n => n.remove()))

  // B — no count anywhere; the cells that changed since his last visit wear a small cyan dot until he leaves the page
  await stage(p, true, { mlNew: 0, openDot: false })
  await dots(p, [[R, '2026-01-19'], [R, '2026-01-20'], [R, '2026-01-21']])
  await mark(p, `[data-testid="cell-${R}-2026-01-19"] .zcd`, '1', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-B-phone.png') }); console.log('shot B-phone')
  await ctx.close()
}

// ======================= the admin, on a phone: the top only =======================
{
  const { ctx, p } = await newPage(browser, 390, 844, true)
  await signIn(p, 'admin')
  await stage(p, true, { admin: true, apNew: 3 })
  await p.evaluate(() => { const m = document.querySelector('.zml'); if (m) m.innerHTML = m.innerHTML.replace('LVE 14.5', 'LVE 17').replace('2 waiting', '0 waiting').replace('next 19 Jan', 'next 30 Jan') })
  await mark(p, '[data-zk="appr"]', '1', { num: true })
  const of = await p.evaluate(() => [...document.querySelectorAll('#page-leavewar .zrow')].map(r => r.scrollWidth - r.clientWidth))
  console.log('admin phone top overflow', of)
  await p.screenshot({ path: join(OUT, 'r6-visit-A-phone-admin.png'), clip: { x: 0, y: 0, width: 390, height: 260 } }); console.log('shot A-phone-admin')
  await ctx.close()
}

// ======================= the admin, at a desktop =======================
{
  const { ctx, p } = await newPage(browser, 1536, 860, false)
  await signIn(p, 'admin')
  const I = await ids(p)
  await boxes(p, [
    [I.Ranger, '2026-01-19', 'LL', 'ok'], [I.Ranger, '2026-01-20', 'LL', 'ok'], [I.Ranger, '2026-01-21', 'LL', 'ok'],
    [I.Ranger, '2026-01-26', 'LL', 'wt'], [I.Ranger, '2026-01-27', 'LL', 'wt'], [I.Ranger, '2026-01-29', 'LL', 'wt', true],
    [I.Reaper, '2026-01-19', 'OL', 'ok'], [I.Reaper, '2026-01-20', 'OL', 'ok'], [I.Reaper, '2026-01-21', 'OL', 'ok'], [I.Reaper, '2026-01-22', 'OL', 'ok'],
    [I.Reaper, '2026-01-27', 'LL', 'wt'],
    [I.Anvil, '2026-01-20', 'LL', 'ok'], [I.Anvil, '2026-01-27', 'LL', 'wt'],
    [I.Piston, '2026-01-26', 'LL', 'ok'], [I.Piston, '2026-01-27', 'LL', 'ok'], [I.Saber, '2026-01-30', 'LL', 'ok'],
    [I.Drifter, '2026-01-27', 'OL', 'wt'], [I.Basher, '2026-01-27', 'LL', 'wt'], [I.Basher, '2026-02-02', 'LL', 'ok'],
  ])
  // A1 — he lands: Approvals 15, and 3 new since he last opened it
  await stage(p, false, { apNew: 3 })
  await mark(p, '[data-zk="appr"]', '1', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-A-desk.png') }); console.log('shot A-desk')
  await unmark(p)

  // A2 — a tap on Approvals: the list opens on "New" while anything is new
  await p.evaluate(([DOT]) => {
    const CHIP = { sxo: ['#E5B53B', '#2a1e02'], ins: ['#9F4ADF', '#fff'] }
    const puck = (cs, seat, cat, chip) => `<span class="zpk ${seat}"><span class="cs">${cs}</span><i style="background:${CHIP[chip][0]};color:${CHIP[chip][1]}">${cat}</i></span>`
    const kb = (k, st, h) => `<span class="zkb ${st}" style="--h:${h}">${k}</span>`
    const LLH = '242,200,110'
    const NEW = [['Static', 'wso', 'IW', 'ins', 'Thu 8 Jan', '1 day', 14, 'W 17', '8 Jan 07:55'], ['Reaper', 'pilot', 'IR', 'sxo', 'Tue 27 Jan', '1 day', 12, 'P 23', '7 Jan 18:10'], ['Ranger', 'pilot', 'IP', 'sxo', 'Thu 29 Jan, AM', '½ day', 14.5, 'P 27.5', '7 Jan 21:30']]
    const OTH = [['Cinch', 'pilot', 'IP', 'sxo', 'gone', 'Thu 22 – Fri 23 Jan', 'Bid withdrawn by Cinch', '7 Jan 17:20'], ['Basher', 'wso', 'IW', 'sxo', 'ok', 'Mon 2 Feb', 'Filed on the Inputs page · approved', '7 Jan 19:05']]
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const w = document.createElement('div'); w.className = 'zwin'; Object.assign(w.style, { left: '262px', top: '206px', width: '990px' })
    w.innerHTML = `<div class="zt"><span class="zgrip">⠿</span><b>Approvals</b><span class="zsub" data-zk="sub">15 waiting · 3 new since you last looked, Wed 7 Jan 16:40</span><span class="zsp"></span><span class="zx">✕</span></div>
<div class="zdates"><span class="zmb on" data-zk="new">${DOT}New <em>3</em></span><span class="zvs"></span><span class="zlab">DATES</span><span class="zmb">All</span>${MON.map(m => `<span class="zmb${m === 'Jan' ? '' : ' dim'}">${m}</span>`).join('')}<span class="zmb">Pick dates…</span><span class="zsp"></span><span class="zapall">Approve all 3</span></div>
<div class="zr hdr"><i class="zd off"></i><span class="zpk">NAME</span><span style="width:30px">KIND</span><span class="zdt2" style="color:inherit;font-weight:inherit">DATES</span><span class="zc dy">DAYS</span><span class="zc bl">LVE BAL</span><span class="zc av">LOWEST AVAIL</span><span class="zc pl">PLACED</span></div>
${NEW.map(([cs, seat, cat, chip, d, days, v, av, pl], i) => `<div class="zr"${i === 0 ? ' data-zk="l1"' : ''}>${DOT}${puck(cs, seat, cat, chip)}${kb('LL', 'wt', LLH)}<span class="zdt2">${d}</span><span class="zc dy">${days}</span><span class="zc bl"><b>${v}</b></span><span class="zc av">${av.split(' ')[0]} <b>${av.split(' ')[1]}</b></span><span class="zc pl">${pl}</span><span class="zsp"></span><span class="zap">Approve</span><span class="zrf">Refuse</span></div>`).join('')}
<div data-zk="grp"><div class="zgh"><span class="zlab">ALSO SINCE YOU LAST LOOKED</span><span class="l2">· nothing to decide</span></div>
${OTH.map(([cs, seat, cat, chip, st, d, what, when]) => `<div class="zr o">${DOT}${puck(cs, seat, cat, chip)}${kb('LL', st, LLH)}<span class="zdt2">${d}</span><span class="zwhat">${what}</span><span class="zc pl">${when}</span><span class="zsp"></span><span class="zgo">Show on grid ›</span></div>`).join('')}</div>`
    document.body.appendChild(w)
  }, [DOT])
  await mark(p, '[data-zk="new"]', '2', { num: true }); await mark(p, '[data-zk="sub"]', '3', { right: true })
  await mark(p, '[data-zk="l1"] > .zd', '4', { below: true }); await mark(p, '[data-zk="grp"]', '5', { num: true })
  const of = await p.evaluate(() => [...document.querySelectorAll('.zwin .zr,.zwin .zdates,.zwin .zt,#page-leavewar .zrow')].map(r => r.scrollWidth - r.clientWidth).filter(v => v > 0))
  console.log('desk overflow', of)
  await p.screenshot({ path: join(OUT, 'r6-visit-A-desk-approvals.png') }); console.log('shot A-desk-approvals')
  await unmark(p); await p.evaluate(() => document.querySelector('.zwin')?.remove())

  // B — the cells of the requests placed since his last visit wear the dot; nothing counts them
  await stage(p, false, { apNew: 0 })
  await dots(p, [[I.Reaper, '2026-01-27'], [I.Ranger, '2026-01-29'], [I.Basher, '2026-02-02']])
  await mark(p, `[data-testid="cell-${I.Reaper}-2026-01-27"] .zcd`, '1', { num: true })
  await p.screenshot({ path: join(OUT, 'r6-visit-B-desk.png') }); console.log('shot B-desk')
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
