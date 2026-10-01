/* [WARN-HIDE-KEPT] — WALKER B (the publish line): helpers on top of wh-lib.mjs. Every gesture is the app's own control
   (the ✕ / ↺ on a line, the four sign-off selects, Publish day / Publish AL / Unpublish, the plans selector's issued
   versions and "Load onto working copy"); `window.*` only to get to a place and to read. */
import { L, W, PHONE, TAG, reloadAs, openList, readList, tapLine, pucks, flagged, head, pic, boardOpenFold, readBoard } from './wh-lib.mjs'
export * from './wh-lib.mjs'
export const MON = 0, TUE = 1
/* the pictures the helpers take themselves are named after the scenario that asked (set once per script) */
let PFX = ''
export const prefix = s => { PFX = s }
export const K = {
  long: { re: /Long work day/i, who: 'wolf', cs: 'Static', name: "Static's long work day (freezes on a published face)", chip: 'L' },
  rest: { re: /Crew rest \(/i, who: 'casper', cs: 'Outlaw', name: "Outlaw's crew-rest breach (stays live on a published face)", chip: 'R' },
  clash: { re: /Conflict — two events/i, who: 'salsa', cs: 'Saint', name: "Saint's clash", chip: 'C' },
  brief: { re: /No time for the flight brief/i, who: 'salsa', cs: 'Saint', name: "Saint's no time for the brief", chip: '' },
}
export const lineOf = (list, re) => (list.lines || []).find(x => re.test(x.text)) || null
export const short = list => `${list.bar} | ` + (list.lines || []).map(x => `${x.ix}:${x.struck ? 'STRUCK' : 'plain'}${x.btn ? '[' + x.btn + (x.btnTop === true ? '' : ' not-on-top:' + x.btnTop) + ']' : '[no button]'}`).join(' ')
export const nIssues = list => { const m = /(\d+) issues?/.exec(list.bar || ''); return m ? +m[1] : (/No issues/.test(list.bar || '') ? 0 : null) }

export async function toEdit(p) { await W.toEdit(L, p); await L.sleep(200) }
/* the working copy on Edit Schedule: the day's list (opened) and its head */
export async function work(p, di) {
  await toEdit(p); await openList(p, '#eWeek', di)
  return { list: await readList(p, '#eWeek', di), head: await head(p, di) }
}
/* ✕ (hide) or ↺ (flag again) on the line that matches — only when the line shows that very button */
export async function press(p, di, re, want) {
  await toEdit(p); await openList(p, '#eWeek', di)
  const l = lineOf(await readList(p, '#eWeek', di), re)
  if (!l) return 'no such line'
  if (l.btn !== want) return `the line shows "${l.btn}", not "${want}"`
  if (l.btnTop !== true) { await p.evaluate(([d, i]) => { const b = document.querySelector(`#eWeek .day[data-day="${d}"] [data-woff="${d}.${i}"]`); if (b) b.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [di, l.ix]); await L.sleep(200) }
  return tapLine(p, '#eWeek', di, l.ix)
}
export const hide = (p, di, re) => press(p, di, re, '✕')
export const again = (p, di, re) => press(p, di, re, '↺')
export async function sign4(p, di) { await toEdit(p); await W.showDay(p, di); return W.signDay(p, di) }
export async function pubOrig(p, di) { const s = await sign4(p, di); const r = await W.publishDay(p, di); await L.sleep(400); return { s, r } }
export async function pubAL(p, di) { const s = await sign4(p, di); const r = await W.publishAL(p, di); await L.sleep(400); return { s, r } }

/* a man's pucks inside one day of a week surface */
export const dayPucks = (p, surf, di, id) => pucks(p, `${surf} .day[data-day="${di}"]`, id)
export const pk = ps => ps.length ? ps.map(x => `${x.where}:${x.warn ? 'ring(' + x.sev + ')' : 'plain'}${x.chip ? ' chip ' + x.chip : ''}${x.dot ? ' dotted' : ''}${x.dash ? ' dashed' : ''}${x.red ? ' red' : ''}`).join(', ') : '(no puck drawn)'

/* the published face: a reload, signed in as the member, View-only Sched */
export async function member(p, di, ids = [], name = null, extra = null) {
  await reloadAs(p, 'm'); await L.sleep(400)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  await openList(p, '#vWeek', di)
  const list = await readList(p, '#vWeek', di)
  const pks = {}
  for (const id of ids) pks[id] = await dayPucks(p, '#vWeek', di, id)
  const hd = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const sel = d.querySelector('select.dver'); return { cls: d.className, tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend')), nys: t(d.querySelector('.nysmark')), sel: sel ? sel.options[sel.selectedIndex].text : '', signed: t(d.querySelector('.signedln')), woff: d.querySelectorAll('[data-woff]').length } }, di)
  const more = extra ? await extra() : null
  const shot = name ? await pic(p, name) : null
  const shots = shot ? [shot] : []
  if (name && ids.length) shots.push(await puckPic(p, '#vWeek', di, ids[0], name + '-puck'))
  return { list, pks, hd, shot, shots, more }
}
/* bring a man's first puck of that day to the middle of the window, and take the picture a person would look at */
export async function puckPic(p, surf, di, id, name) {
  await p.evaluate(([s, i, who]) => { const e = [...document.querySelectorAll(`${s} .day[data-day="${i}"] .puck[data-person="${who}"]`)].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [surf, di, id])
  await L.sleep(250)
  return pic(p, name)
}
export async function admin(p) { await reloadAs(p, 'a'); await L.sleep(300); await toEdit(p) }

/* ---------- every count of pending, on Edit Schedule ---------- */
export async function auth(p, di, { tap = false } = {}) {
  await toEdit(p); await W.showDay(p, di)
  const h = await head(p, di)
  const btn = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const b = d && d.querySelector(`[data-alpub="${i}"]`); return b ? { label: b.innerText.trim(), locked: b.disabled, title: b.title } : null }, di)
  const panel = await p.evaluate(() => { const a = document.querySelector('#alPanel'); if (!a) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    return { line: t(a.querySelector('.al-pend')), days: [...a.querySelectorAll('.al-pubday')].map(e => ({ text: t(e.querySelector('.al-pd-lbl')), btn: t(e.querySelector('button')), locked: !!(e.querySelector('button') || {}).disabled })), list: t(a.querySelector('.al-list')).slice(0, 400), shown: a.offsetParent !== null } })
  /* the changes window, from the day's own count */
  let win = null
  const c = p.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  if (await c.count()) {
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600)
    const rd = () => p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null
      const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
      return { title: t(w.querySelector('.win-ttl')), tabs: [...w.querySelectorAll('.win-tab')].map(x => t(x) + (x.classList.contains('on') ? ' [on]' : '')),
        outHead: t(w.querySelector('.pl-head')), out: [...w.querySelectorAll('.pl-list > *')].map(e => ({ where: t(e.querySelector('.pl-where')), chg: t(e.querySelector('.pl-chg')), tappable: e.tagName === 'BUTTON' || !!e.querySelector('button:not([disabled])'), title: e.getAttribute('title') || '', text: t(e) })),
        groups: [...w.querySelectorAll('.cw-g')].map(g => ({ title: t(g.querySelector('.cw-ghname')) || t(g.querySelector('.cw-what')), lines: [...g.querySelectorAll('.cw-l, .cw-txt')].map(t).slice(0, 8), text: t(g).slice(0, 300) })) } })
    const tabTo = async name => { const x = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: name }).first(); if (await x.count()) { await x.click(); await L.sleep(300); return true } return false }
    const hasOut = await tabTo('To go out')
    const out = hasOut ? await rd() : null
    const shotOut = await pic(p, PFX + 'pend-togoout')
    let landed = null
    if (tap && out && out.out.length) {
      /* close the day's list first, so a tap that opens it and lights the line can be told from one that does nothing */
      const before = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); return { open: b ? b.classList.contains('open') : null, y: window.scrollY, flash: document.querySelectorAll('.chgflash').length } }, di)
      const it = p.locator('.chgwin:not([hidden]) .pl-list > *').first()
      await it.click({ timeout: 2500 }).catch(() => {}); await L.sleep(400)
      landed = await p.evaluate(i => { const e = document.querySelector('.chgflash'); const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`)
        return { flash: e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 90) : null, flashIsLine: e ? !!e.closest('.witem') || e.classList.contains('witem') : false, listOpen: b ? b.classList.contains('open') : null, y: window.scrollY, wfoc: document.querySelectorAll('.witem.wsel, .witem.on, .witem.cur').length } }, di)
      landed.before = before
      landed.shot = await pic(p, PFX + 'pend-tapped')
    }
    await tabTo('All changes')
    const all = await rd()
    const shotAll = await pic(p, PFX + 'pend-allchanges')
    await p.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await L.sleep(300)
    win = { out, all, landed, shots: [shotOut, shotAll] }
  }
  return { head: h, btn, panel, win }
}
export const authLine = a => `chip "${a.head.pending}" · marker "${a.head.nys}" · sign-offs [${a.head.signs.join(' | ')}] · button ${a.btn ? `"${a.btn.label}"${a.btn.locked ? ' (locked)' : ''}` : 'none'} · Amendments "${a.panel ? a.panel.line + ' / ' + a.panel.days.map(d => d.text + ' ' + d.btn + (d.locked ? ' (locked)' : '')).join('; ') : 'no panel'}" · window ${a.win && a.win.out ? `"${a.win.out.title}" tabs ${a.win.out.tabs.join(', ')} — ${a.win.out.outHead} — ${a.win.out.out.map(o => o.where + ' ' + o.chg).join(' || ')}` : 'not opened'}`

/* ---------- a 👁 look at an issued version ---------- */
/* the versions the plans selector offers for a day (Edit Schedule's day head, or the open board's strip) */
export async function versions(p, di, surf = '#eWeek') {
  if (surf === '#eWeek') { await toEdit(p); await W.showDay(p, di) }
  const m = p.locator(`${surf} [data-planmenu="${di}"]:visible`).first()
  if (!(await m.count())) return { err: 'no plans selector' }
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await L.sleep(400)
  const vs = await p.evaluate(() => [...document.querySelectorAll('[data-planpv]')].filter(e => e.offsetParent !== null).map(e => ({ ver: e.dataset.planpv, label: e.innerText.replace(/\s+/g, ' ').replace(/read-only.*/, '').replace('●', '').trim() })))
  return { vs }
}
/* look at the version whose label matches (the menu is opened here) */
export async function look(p, di, label, surf = '#eWeek') {
  const r = await versions(p, di, surf); if (r.err) return r
  const v = r.vs.find(x => label.test(x.label)); if (!v) { await p.keyboard.press('Escape'); return { err: 'no such version in the menu: ' + r.vs.map(x => x.label).join(', ') } }
  await p.locator(`[data-planpv="${v.ver}"]:visible`).first().click(); await L.sleep(600)
  return { ver: v.ver, label: v.label, vs: r.vs }
}
export async function backLive(p, di, surf = '#eWeek') {
  const b = p.locator(`${surf} [data-golive="${di}"]:visible`).first()
  if (!(await b.count())) return 'no "Back to live copy"'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await b.click(); await L.sleep(500); return 'back'
}
/* the look's own bar on Edit Schedule: its words and whether any write door is drawn inside the day */
export async function lookFace(p, di) {
  return p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    return { cls: d.className, bar: t(d.querySelector('.dprev-bar')), woff: d.querySelectorAll('[data-woff]').length, nys: t(d.querySelector('.nysmark')), pend: t(d.querySelector('.dpend')), signs: d.querySelectorAll('select[data-sign]').length, oilper: [...d.querySelectorAll('button')].filter(b => /period/i.test(b.innerText)).length, sel: t(d.querySelector('[data-planmenu]')) } }, di)
}
/* press "Load onto working copy" on the look in front; `confirm` presses the armed button too. Reports every label. */
export async function load(p, di, { confirm = true, surf = '#eWeek' } = {}) {
  const said = []
  const b = p.locator(`${surf} [data-restore="${di}"]:visible`).first()
  if (!(await b.count())) return { said, err: 'no Load button' }
  said.push((await b.innerText()).trim())
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await b.click(); await L.sleep(700)
  const b2 = p.locator(`${surf} [data-restore="${di}"]:visible`).first()
  let armed = null
  if (await b2.count()) { armed = (await b2.innerText()).trim(); said.push(armed)
    if (confirm) { await b2.click(); await L.sleep(800) } }
  return { said, armed }
}

/* ---------- the ⓘ day details ---------- */
export async function dayInfo(p, surf, di, name = null) {
  const b = p.locator(`${surf} .day[data-day="${di}"] .dinfobtn:visible`).first()
  if (!(await b.count())) return { err: 'no ⓘ' }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await b.click(); await L.sleep(450)
  const r = await p.evaluate(() => { const b = document.querySelector('#dayPopBody'); if (!b) return { err: 'no panel' }
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const hs = [...b.querySelectorAll('.dip-h')]; const ih = hs.find(h => /Issues/i.test(h.innerText))
    const sev = b.querySelector('.dip-sev'); let after = ''
    if (ih) { let n = ih.nextElementSibling; while (n && !n.classList.contains('dip-list') && !n.classList.contains('dip-h')) { after += ' ' + t(n); n = n.nextElementSibling } }
    return { title: t(document.querySelector('#dayPopTitle')), stat: t(b.querySelector('.dip-stat')), als: t(b.querySelector('.dip-als')), sev: sev ? t(sev) : '', under: after.trim(),
      lines: [...b.querySelectorAll('.dip-list .witem')].map(e => { const s = e.children[1] || e; const cs = getComputedStyle(s); return { struck: cs.textDecorationLine.includes('line-through'), hid: e.classList.contains('hid'), btn: e.querySelectorAll('button').length, text: t(e).slice(0, 70) } }) } })
  r.shot = name ? await pic(p, name) : null
  await p.locator('#dayPopClose').click().catch(() => {}); await L.sleep(250)
  return r
}
export const infoShort = r => r.err ? r.err : `"${r.sev || r.under}" · ${r.lines.length} lines: ${r.lines.map(l => l.struck ? 'STRUCK' : 'plain').join(' ')}`

/* ---------- Insights ---------- */
export async function insights(p, name = null) {
  const b = p.locator('#insightBtn:visible').first()
  if (await b.count()) { await b.click(); await L.sleep(500) }
  else {
    /* a phone: the burger menu's own Insights row */
    const bg = p.locator('#burger:visible').first()
    if (!(await bg.count())) return { err: 'no Insights button' }
    await bg.click(); await L.sleep(400)
    const d = p.locator('#drawerInsights:visible').first()
    if (!(await d.count())) return { err: 'no Insights row in the menu' }
    await d.click(); await L.sleep(500)
  }
  const r = await p.evaluate(() => { const b = document.querySelector('#insightBody'); if (!b) return { err: 'no panel' }
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const tiles = [...b.querySelectorAll('.itile')].map(t)
    const secs = {}; let cur = ''
    for (const e of b.children) { if (e.classList.contains('isec-h')) cur = t(e); else if (e.classList.contains('irow')) (secs[cur] ||= []).push(t(e)) }
    return { tile: tiles[3] || '', byType: secs['CONFLICTS BY TYPE'] || secs['Conflicts by type'] || [], byDay: secs['BY DAY'] || secs['By day'] || [], heads: Object.keys(secs) } })
  if (name) {
    r.shot = await pic(p, name)   /* the tiles */
    /* …and the foot of the panel: "Conflicts by type" and "By day" */
    await p.evaluate(() => { const rows = document.querySelectorAll('#insightBody .irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await L.sleep(250)
    r.shot2 = await pic(p, name + '-byday')
  }
  await p.locator('#insightClose').click().catch(() => {}); await L.sleep(250)
  return r
}

/* ---------- the board ---------- */
export async function board(p, di) { await toEdit(p); await W.boardOn(p, di); await L.sleep(400); await boardOpenFold(p); return readBoard(p) }
export const bshort = b => b.none ? b.none : `${b.head} | ` + b.lines.map(x => `${x.ix}:${x.struck ? 'STRUCK' : 'plain'}${x.btn ? '[' + x.btn + ']' : '[no button]'}`).join(' ')

/* the changes window's "To go out": tap the line whose words match, and say where the schedule went */
export async function tapOut(p, di, re, name) {
  await toEdit(p); await W.showDay(p, di)
  /* shut the day's list first, so a tap that opens it can be told from one that does nothing */
  const shut = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, di)
  if (shut) { await p.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click(); await L.sleep(300) }
  const c = p.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  if (!(await c.count())) return { err: 'no count chip' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600)
  const tab = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
  if (await tab.count()) { await tab.click(); await L.sleep(300) }
  const items = await p.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) .pl-list > *')].map(e => ({ text: (e.innerText || '').replace(/\s+/g, ' ').trim(), button: e.tagName === 'BUTTON', title: e.getAttribute('title') || '' })))
  const ix = items.findIndex(i => re.test(i.text))
  if (ix < 0) return { err: 'no such line', items }
  const hint = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return ((w.querySelector('.win-foot') || {}).innerText || '').replace(/\s+/g, ' ').trim() })
  const it = p.locator('.chgwin:not([hidden]) .pl-list > *').nth(ix)
  await it.click({ timeout: 2500 }).catch(() => {})
  await L.sleep(250)
  const landed = await p.evaluate(i => { const e = document.querySelector('.chgflash'); const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`)
    const t = x => x ? (x.innerText || x.value || '').replace(/\s+/g, ' ').trim().slice(0, 100) : ''
    const d = e ? e.closest('.day[data-day]') : null
    return { lit: e ? { tag: e.tagName, cls: String(e.className).slice(0, 80), text: t(e), day: d ? +d.dataset.day : null, isWarnLine: !!(e.closest('.witem') || e.classList.contains('witem')), isPuck: !!(e.closest('.puck') || e.classList.contains('puck') || e.closest('.seat')) } : null,
      listOpen: b ? b.classList.contains('open') : null, focusLine: [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .witem.wsel, #eWeek .day[data-day="${i}"] .witem.sel, #eWeek .day[data-day="${i}"] .witem.wfocus`)].map(x => t(x)) } }, di)
  const shot = name ? await pic(p, name) : null
  await p.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await L.sleep(300)
  return { item: items[ix], items, hint, landed, shot }
}
