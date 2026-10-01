/* [WARN-HIDE-KEPT] walker A — own helpers on top of wh-lib (read-only readers of what is PAINTED, and gestures through
   the app's own controls). */
import { L, W, PHONE } from './wh-lib.mjs'
export * from './wh-lib.mjs'

/* every VISIBLE puck of `id` inside `scope`, as PAINTED: where it sits, which day, the ring's colour (computed
   box-shadow), its chip letter, a dotted / dashed outline */
export async function pk(p, scope, id) {
  return p.evaluate(([s, who]) => {
    /* a RING is an outer box-shadow (a busy man's crew-list puck carries an INSET grey bar on its left — not a flag) */
    const col = c => !c || c === 'none' || /inset/.test(c) || /240, 182, 255/.test(c) ? '' : /240, 85, 95/.test(c) ? 'red' : /229, 168, 59/.test(c) ? 'amber' : /138, 150, 163/.test(c) ? 'grey' : c.replace(/ 0px.*/, '')
    const where = e => {
      if (e.closest('.availwin, .aw-win, [data-availwin]')) return 'ALL AVAIL window'
      if (e.closest('#eRoster')) return 'crew list (week)'
      if (e.closest('#sbRoster')) return 'crew list (board)'
      const sec = e.closest('[data-secmove]'); const n = sec ? sec.dataset.secmove.split('.')[1] : ''
      if (n === 'inputs') return 'Personal Inputs'
      if (e.closest('.availpuck')) return 'Available crew'
      if (e.closest('.sanscards, .sb-panel.sansav')) return 'SANS'
      if (e.closest('[data-inprow], .sb-panel.unav')) return 'Unavailable'
      return ({ waves: 'flying line', duty: 'duty', sims: 'sim', ground: 'ground', prog: 'programme', inputs: 'Personal Inputs', avail: 'Available crew', sans: 'SANS', unav: 'Unavailable' })[n] || n || 'other'
    }
    return [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => e.offsetParent !== null).map(e => {
      const cs = getComputedStyle(e), d = e.closest('.day[data-day]'), sl = e.closest('[data-slot]')
      const chips = [...e.querySelectorAll('.lchip')].map(c => c.innerText.trim()).join('')
      return { where: where(e), day: d ? +d.dataset.day : null, slot: sl ? sl.dataset.slot : '', ring: col(cs.boxShadow), out: cs.outlineStyle === 'none' ? '' : cs.outlineStyle + ' ' + col(cs.outlineColor), chip: chips,
        tip: (e.getAttribute('title') || '').split(' · ').slice(3).join(' · ').slice(0, 80) }
    })
  }, [scope, id])
}
export const marked = ps => ps.filter(x => x.ring || x.out || x.chip)
export const sum = ps => ps.map(x => `${x.where}${x.day != null ? '@' + x.day : ''}${x.slot ? '(' + x.slot + ')' : ''}:${x.ring || '-'}${x.out ? '/' + x.out : ''}${x.chip ? '/' + x.chip : ''}`).join(' ; ')

/* every flagged puck in `scope`, by man: "where:ring/chip/dotted" — a lit (solid) outline is a highlight, not a flag */
export async function snap(p, scope) {
  const ids = await p.evaluate(s => [...new Set([...document.querySelectorAll(`${s} .puck[data-person]`)].filter(e => e.offsetParent !== null).map(e => e.dataset.person))], scope)
  const out = {}
  for (const id of ids) {
    const m = (await pk(p, scope, id)).map(x => ({ ...x, out: /dotted|dashed/.test(x.out) ? x.out : '' })).filter(x => x.ring || x.out || x.chip)
    if (m.length) out[id] = m.map(x => `${x.where}${x.slot ? '(' + x.slot + ')' : ''}:${x.ring || '-'}/${x.chip || '-'}${x.out ? '/' + x.out : ''}`).sort()
  }
  return out
}
/* what changed between two snaps, by man */
export function snapDiff(a, b) {
  const d = {}
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = (a[id] || []).join(' ; '), y = (b[id] || []).join(' ; '); if (x !== y) d[id] = `${x || 'plain'}  →  ${y || 'plain'}` }
  return d
}
/* the board's "+ Wave" / "+ Block" menus — the app's own buttons */
export async function addWave(p, di, kind) {
  const b = p.locator(`#schedBoard [data-wvadd="${di}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await b.click(); await L.sleep(400)
  const k = p.locator('button:visible', { hasText: new RegExp('^' + kind + '$') }).first()
  if (!(await k.count())) return 'no such kind offered'
  await k.click(); await L.sleep(700); return 'added'
}
export async function addBlock(p, di, name) {
  const b = p.locator(`#schedBoard [data-dwadd="${di}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await b.click(); await L.sleep(400)
  const k = p.locator('button:visible', { hasText: new RegExp('^' + name) }).first()
  if (!(await k.count())) return 'no such block offered'
  await k.click(); await L.sleep(700); return 'added'
}
/* the ALL AVAIL window, opened by the count chip beside a placeholder puck (`scope` = '#schedBoard' or a day of the
   week), read as written and PAINTED, then closed by its ✕ */
export async function availWin(p, scope, shot = null, who = null) {
  const chip = p.locator(`${scope} .oilcount:visible`).first()
  if (!(await chip.count())) return { none: 'no count chip on screen' }
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200)
  const chipTxt = (await chip.innerText()).trim()
  await chip.click(); await L.sleep(700)
  const out = await p.evaluate(() => {
    const w = [...document.querySelectorAll('.availwin')].find(e => e.getBoundingClientRect().width > 0); if (!w) return { none: 'the window did not open' }
    const col = c => !c || c === 'none' || /inset/.test(c) || /240, 182, 255/.test(c) ? '' : /240, 85, 95/.test(c) ? 'red' : /229, 168, 59/.test(c) ? 'amber' : /138, 150, 163/.test(c) ? 'grey' : 'other'
    const men = [...w.querySelectorAll('.rpuck[data-awp]')].map(r => { const pk = r.querySelector('.puck'); const cs = getComputedStyle(pk); const y = r.querySelector('.rwhy'); const why = y && y.offsetParent !== null ? y.innerText.replace(/\s+/g, ' ').trim() : ''
      return { id: r.dataset.awp, flagged: r.classList.contains('flagged') || r.classList.contains('clash'), ring: col(cs.boxShadow), chip: [...pk.querySelectorAll('.lchip')].map(c => c.innerText.trim()).join(''), why: why.slice(0, 120) } })
    const txt = w.innerText.replace(/\n+/g, ' | ')
    return { title: (w.querySelector('.win-ttl') || {}).innerText.replace(/\s+/g, ' '), count: +(w.querySelector('.win-one .c') || {}).innerText || null, n: men.length, men, foot: (/\|\s*([^|]*flagged[^|]*)/.exec(txt) || [])[1] || '', nFlagged: +(/(\d+) m[ae]n (?:are|is) flagged/.exec(txt) || [])[1] || 0 }
  })
  out.chip = chipTxt
  if (shot) { if (who) { await p.evaluate(id => { const e = document.querySelector(`.availwin .rpuck[data-awp="${id}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, who); await L.sleep(250) } out.pic = await shot() }
  await p.locator('.availwin .win-x').first().click().catch(() => {}); await L.sleep(350)
  return out
}
/* the app's toast, if it is on screen now */
export async function toastNow(p) { return p.evaluate(() => { const el = document.getElementById('toastEl'); return el && (el.textContent || '').trim() && getComputedStyle(el).opacity !== '0' ? el.textContent.trim() : '' }) }

/* bring an element to the middle of the window, for the picture */
export async function centre(p, sel) { await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel); await L.sleep(300) }

/* close a list box if it is open (the bar is the toggle) */
export async function closeList(p, surf, di) {
  const st = await p.evaluate(([s, i]) => { const b = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, [surf, di])
  if (st === true) { await p.locator(`${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await L.sleep(350) }
}
/* the Insights window, opened by its own top-bar button, read as written, closed by its ✕ */
export async function insights(p, shot = null) {
  let b = p.locator('button:visible', { hasText: /^Insights$/ }).first()
  if (!(await b.count())) {   /* a phone: the ☰ menu's "Week insights" */
    if (await p.locator('#burger:visible').count()) { await p.locator('#burger').click(); await L.sleep(450) }
    b = p.locator('#drawerInsights:visible').first()
    if (!(await b.count())) return { none: 'no Insights button on screen' }
  }
  await b.click(); await L.sleep(700)
  const out = await p.evaluate(() => {
    const m = document.querySelector('#insightModal'); if (!m || !m.getBoundingClientRect().width) return { none: 'Insights did not open' }
    const t = e => e.innerText.replace(/\s+/g, ' ').trim()
    const secs = {}; let cur = null
    for (const e of m.querySelectorAll('.isec-h, .irow')) { if (e.classList.contains('isec-h')) { cur = t(e); secs[cur] = {} } else if (cur) { const s = e.querySelectorAll(':scope > span'); if (s.length >= 2) secs[cur][t(s[0])] = t(s[s.length - 1]) } }
    const txt = m.innerText.replace(/\n+/g, ' | ')
    const tile = /AIRCREW FLYING \| (\d+) \| ([^|]*)\|/.exec(txt)
    const hrs = {}; const wh = /WORK HOURS[^|]*\|(.*?)\| NOT ON THE FLYING/.exec(txt)
    if (wh) { const a = wh[1].split('|').map(x => x.trim()).filter(Boolean); for (let i = 0; i + 1 < a.length; i += 2) hrs[a[i]] = a[i + 1] }
    return { total: tile ? +tile[1] : null, tileSub: tile ? tile[2].trim() : '', byType: secs['Conflicts by type'] || secs['CONFLICTS BY TYPE'] || {}, byDay: secs['By day'] || secs['BY DAY'] || {}, hours: hrs, secNames: Object.keys(secs) }
  })
  if (shot) { await p.evaluate(() => { const m = document.querySelector('#insightModal'); const h = [...m.querySelectorAll('.isec-h')].find(e => /conflicts by type/i.test(e.innerText)); if (h) h.scrollIntoView({ block: 'start' }) }); await L.sleep(250); out.pic = await shot() }
  await p.locator('#insightModal button').first().click().catch(() => {}); await L.sleep(400)
  return out
}
export const typeSum = ins => Object.values(ins.byType || {}).reduce((a, b) => a + (+b || 0), 0)
export const dayIssues = (ins, dow) => { const s = (ins.byDay || {})[dow] || ''; const m = /(\d+) issues?/.exec(s); return m ? +m[1] : /clear/.test(s) ? 0 : null }

/* the day's ⓘ popup on `surf`, read as written and PAINTED, then closed */
export async function dayInfo(p, surf, di, shot = null) {
  await W.showDay(p, di, surf)
  const b = p.locator(`${surf} .day[data-day="${di}"] [data-dayinfo="${di}"]`).first()
  if (!(await b.count())) return { none: 'no ⓘ on that day' }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
  await b.click(); await L.sleep(600)
  const out = await p.evaluate(() => {
    const m = document.querySelector('#dayPop'); if (!m || !m.getBoundingClientRect().width) return { none: 'the popup did not open' }
    const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''
    const hs = [...m.querySelectorAll('.dip-h')]; const ih = hs.find(e => /issues/i.test(e.innerText))
    let after = ''; if (ih) { let n = ih.nextElementSibling; while (n && !n.classList.contains('dip-list') && !n.classList.contains('dip-h')) { after += ' ' + t(n); n = n.nextElementSibling } }
    return { title: t(m.querySelector('#dayPopTitle')), stat: t(m.querySelector('.dip-stat')), sev: t(m.querySelector('.dip-sev')), under: after.trim(),
      lines: [...m.querySelectorAll('.dip-list .witem')].map(e => { const x = e.querySelector('.wtx') || e.children[1] || e; const cs = getComputedStyle(x); return { hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), btn: (e.querySelector('button') || {}).innerText || '', text: t(e).slice(0, 80) } }),
      buttons: [...m.querySelectorAll('.dip-list button')].length }
  })
  if (shot) { await p.evaluate(() => { const h = [...document.querySelectorAll('#dayPop .dip-h')].find(e => /issues/i.test(e.innerText)); if (h) h.scrollIntoView({ block: 'start' }) }); await L.sleep(250); out.pic = await shot() }
  await p.locator('#dayPopDone, #dayPopClose').first().click().catch(() => {}); await L.sleep(400)
  return out
}
/* run one scenario body; an exception becomes a row, never a crash of the file */
export async function guard(id, did, fn, onErr = null) {
  try { await fn() } catch (e) { const { row } = await import('./wh-lib.mjs'); let pc = []; if (onErr) { try { pc = [await onErr()] } catch { /* */ } } row(id, did, 'THE STEP DID NOT RUN: ' + String(e && e.message || e).split('\n')[0].slice(0, 300), 'ERROR (script)', pc) }
}
export { PHONE as IS_PHONE }
