/* D-01 — the ALL AVAIL window. B; on Tuesday a Ground Programme row 14:00–15:00 with the ALL AVAIL puck in it; tap its count to open the window;
   find X; tap X; then + Line on Tuesday, seat X on the blank line, read the window again. Env HP_PHONE=1 for the phone. */
import * as K from './rbl-D-lib.mjs'
const { B, W, L, R, X, MON, TUE, clean } = K
const sz = K.PHONE ? 'phone' : 'desk'
const ID = `D-01-${sz}`
const { browser, p, errors } = await K.fresh()

const win = () => p.evaluate(() => {
  const w = document.querySelector('.availwin:not([hidden])')
  if (!w) return { open: false }
  const r = w.getBoundingClientRect()
  const at = el => { if (!el) return false; const b = el.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!h && w.contains(h) }
  const P = window.PEOPLE
  const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
  return {
    open: true, title: t(w.querySelector('.win-ttl')), sub: t(w.querySelector('.win-ttl small')),
    tabs: [...w.querySelectorAll('.win-tab')].map(e => t(e) + (e.classList.contains('on') ? ' [on]' : '')),
    one: t(w.querySelector('.win-one')), lost: t(w.querySelector('.win-lost')), from: t(w.querySelector('.win-from')), foot: t(w.querySelector('.win-foot')),
    rows: [...w.querySelectorAll('.rpuck')].map(x => { const pk = x.querySelector('.puck'); const c = pk ? getComputedStyle(pk) : null
      return { id: x.dataset.awp, cs: (P[x.dataset.awp] || {}).cs, rowCls: x.className.replace(/\s+/g, ' '), flag: x.classList.contains('clash') ? 'RED' : x.classList.contains('flagged') ? 'AMBER' : '',
        why: t(x.querySelector('.rwhy')), text: t(x), puckCls: pk ? pk.className.replace(/\s+/g, ' ') : '', chip: pk ? t(pk.querySelector('.lchip')) : '', shadow: c ? c.boxShadow.slice(0, 50) : '', outline: c ? c.outlineStyle + ' ' + c.outlineWidth : '' } }),
    onTop: { bar: at(w.querySelector('.win-ttl')), body: at(w.querySelector('.win-body')) }, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
})
const closeWin = async () => { const x = p.locator('.availwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await K.sleep(300) } }
async function chipOf(ri) {
  const rid = await p.evaluate(([i, r]) => ((window.DAYS[i].ground || [])[r] || {}).rid, [TUE, ri])
  return `r:${rid}`
}
async function openWin(item) {
  await closeWin()
  await K.boardTo(p, TUE)
  const c = p.locator(`#schedBoard [data-oilsent="${item}"]:visible`).first()
  if (!(await c.count())) return { err: 'no count chip for ' + item }
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(200)
  const hit = await c.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!x && (x === e || e.contains(x)) })
  const txt = (await c.innerText()).trim()
  await c.click({ timeout: 4000 }); await K.sleep(500)
  const w = await win(); w.chip = txt; w.chipHit = hit
  return w
}
const manRow = w => (w.rows || []).find(r => r.id === X) || null
const sayWin = w => w.err ? w.err : !w.open ? 'window not open' : `count chip "${w.chip}" · title "${w.title}" · tabs ${JSON.stringify(w.tabs)} · line "${w.one}" · lost "${w.lost}" · foot "${w.foot}" · ${(w.rows || []).length} men listed${(w.rows || []).filter(r => r.flag).length ? '; flagged: ' + w.rows.filter(r => r.flag).map(r => r.cs + ' ' + r.flag + ' (' + r.why + ')').join('; ') : '; none flagged'} · ${w.rows && manRow(w) ? 'X: ' + JSON.stringify({ flag: manRow(w).flag, why: manRow(w).why, chip: manRow(w).chip, cls: manRow(w).puckCls, ring: manRow(w).shadow + ' / ' + manRow(w).outline }) : 'X NOT LISTED'}`
const litFor = id => p.evaluate(i => ({ board: document.querySelectorAll(`#schedBoard .puck.sel[data-person="${i}"]`).length, wfoc: document.querySelectorAll(`#schedBoard .puck.wfoc[data-person="${i}"]`).length, week: document.querySelectorAll(`#eWeek .puck.sel[data-person="${i}"]`).length }), id)
const toastNow = () => p.evaluate(() => { const e = document.getElementById('toastEl'); return e && (e.textContent || '').trim() && getComputedStyle(e).opacity !== '0' ? e.textContent.trim() : null })

try {
  const cs = await B.csOf(p, X)
  const m = await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  const g = await K.groundRow(p, TUE, 'OPS BRIEF', '14:00', '15:00', 'allavail')
  const gl = await K.groundOf(p, TUE, g.ri)
  const item = await chipOf(g.ri)
  const base = await K.see(p, 'base', { pics: false })
  console.log('ground', gl, 'took', g.took, g.msg, 'item', item, '| baseline breach', base.breach)
  const w1 = await openWin(item)
  const pic1 = await B.pic(p, 'win-before')
  const xr = manRow(w1)
  R(`${ID}.1`, `${cs}: Monday ZM 20:00–22:30; Tuesday ZT 07:00–08:00 Brief 05:00 (baseline breach: ${base.breach}); Tuesday Ground Programme row ${gl} with the ALL AVAIL puck in it (placed: ${g.took}${g.msg ? ', app said "' + g.msg + '"' : ''}); tapped the count on that puck`,
    sayWin(w1), xr && xr.flag === 'RED' ? 'PASS' : (xr ? 'FAIL' : 'FAIL'), [pic1])
  // tap X
  let tapSay = 'not tapped'
  if (xr) {
    const row = p.locator(`.availwin .rpuck[data-awp="${X}"] .puck`).first()
    await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(150)
    await row.click({ timeout: 4000 }).catch(async () => { const b = await row.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) })
    await K.sleep(500)
    const w2 = await win()
    const lit = await litFor(X)
    const ts = await toastNow()
    const pic2 = await B.pic(p, 'win-tapped-X')
    tapSay = `foot "${w2.foot}" · line "${w2.one}" · toast ${JSON.stringify(ts)} · his pucks lit behind (selected on board ${lit.board}, warning-lit ${lit.wfoc}, week ${lit.week}) · window still open: ${w2.open}`
    R(`${ID}.2`, `tapped ${cs} in the window`, tapSay, /crew rest|breach|rest/i.test(JSON.stringify([w2.foot, w2.one, ts, xr.why])) || lit.board > 0 || lit.wfoc > 0 ? 'PASS' : 'FAIL', [pic2])
  } else R(`${ID}.2`, `tapped ${cs} in the window`, 'he is not listed — nothing to tap', 'NOT WALKED (not listed)')
  // + Line, seat X on the blank line
  await closeWin()
  await K.addLine(p, TUE, t.gi)
  const fi = (await K.nLines(p, TUE, t.gi)) - 1
  const sb = await K.seat(p, TUE, t.gi, fi, 0, K.SEAT, X)
  const lineIs = await K.lineOf(p, TUE, t.gi, fi)
  const s3 = await K.see(p, 'after', { pics: false })
  const w3 = await openWin(item)
  const pic3 = await B.pic(p, 'win-after-blank-line')
  const xr3 = manRow(w3)
  const same = xr && xr3 && xr.flag === xr3.flag && xr.why === xr3.why && xr.chip === xr3.chip
  R(`${ID}.3`, `+ Line on Tuesday, ${cs} seated on the blank line (took ${sb.took}; ${lineIs}); the week still reads breach ${s3.breach}; the window reopened`,
    sayWin(w3) + ` · BEFORE X: ${xr ? JSON.stringify({ flag: xr.flag, why: xr.why, chip: xr.chip }) : 'not listed'} · AFTER X: ${xr3 ? JSON.stringify({ flag: xr3.flag, why: xr3.why, chip: xr3.chip }) : 'not listed'} · flagged count before ${(w1.rows || []).filter(r => r.flag).length}, after ${(w3.rows || []).filter(r => r.flag).length} · men listed before ${(w1.rows || []).length}, after ${(w3.rows || []).length}`,
    xr && xr3 && same && s3.breach ? 'PASS' : 'FAIL', [pic3])
  await closeWin()
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap(`d01`, browser, errors, ID)
