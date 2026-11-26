// swl-w1C — walker C's walk of chat 203's build (the warning list's SANS lines: his D2579, D2584 Q3 / 2a / 3b, D2583),
// 26 Nov 26: his SANS date, filings, moves, the demo week, the crew list, the Logic page (F16–F20, F24, F30–F32, F37, F39,
// A8–A10, A16–A21, A31's Logic part, A32; N4, N5, N10, N13, N15) and the plain-user round.
// Brief: docs/superpowers/briefs/2026-11-26-sans-warnlines-walk-brief.md. Run from raptor-port/, one scenario and size a run:
//   SWLC_RUN=<run> ONLY=<scenario> SZ=d|p node scripts/handpass/swl-w1C.mjs
import './swl-w1C-env.mjs'
const C = await import('./swl-w1C-lib.mjs')
const { Z, T, L, W5, RANGER, sleep, J, need, run, NAME, ISO, NOFILE, noFile, offered, hours, wl, wSay, headN, seated, seatSay, hasA,
  look, lookSay, tapIn, placedOk, flight, weekBars, infoPop, infoClose, fileFor, hideRow, avail, sansCell, crewAll, who, say1, sayAll,
  addSimRow, armAt, sbUndo, sbRedo, holdsAt, puckPic, addLine } = C
const SCN = process.env.ONLY || 'F32', SZ = process.env.SZ || 'd'
console.log(`VERSION swl-w1C 1 · ${SCN} · ${SZ} · bundle ${process.env.W2_URL} · out ${C.OUT}`)
const S = {}
const one = (c, id) => who(c, id)[0] || null
const postR = async (p, W, iso = ISO[17]) => Z.post(p, W, RANGER, iso, 'set-post')
const bundleOk = async (p, W) => { const b = await p.evaluate(() => [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'))); W.rec('bundle', 'the page loaded serves index-ZgGJLqIy.js', b.some(s => s.includes('index-ZgGJLqIy.js')), J(b)) }
/* the four demo SANS men with nothing filed, and the six the demo files for */
const FOUR = ['cards', 'wrangler', 'yeti', 'badger'], SIX = ['nick', 'romeo', 'vinci', 'waldo', 'krait', 'bullet']
/* where a man sits on a day, flying seats and sims only (a standby wave — SC, AVALON, BB — never counts, D2584 Q4) */
const flySims = (p, di, id) => p.evaluate(([i, id]) => {
  const d = window.DAYS[i], out = []
  ;(d.waves || []).forEach((w, wi) => { if (w.kind && /sc|avalon|bb/i.test(w.kind)) return; (w.formations || []).forEach((f, fi) => (f.aircraft || []).forEach((a, ai) => { for (const s of ['p', 'w']) if (a[s] === id) out.push(`fly ${wi}.${fi}.${ai}.${s} ${f.cs || ''}`) })) })
  for (const k of Object.keys(d.sims || {})) (d.sims[k] || []).forEach((x, ri) => { if (JSON.stringify(x).includes(`"${id}"`)) out.push(`${k} ${ri} ${x.label || ''}`) })
  return out
}, [di, id])

/* ---- F32 = A32: the demo week as it boots (no edits), every day's list, count and bar; then one man covered ---- */
S.F32 = async (p, W) => {
  await bundleOk(p, W)
  const wb = await weekBars(p, W, 'f32-0')
  W.rec('F32.bars', "Edit Schedule's week as it boots: each day's issues bar (words and colour)", 'REC', wb.b.join(' | '), wb.pic)
  for (let di = 0; di < 7; di++) {
    const want = []
    for (const id of FOUR) { const at = await flySims(p, di, id); if (at.length) want.push(`${NAME[id]} (${at.join('; ')})`) }
    const also = []
    for (const id of SIX) { const at = await flySims(p, di, id); if (at.length) also.push(`${NAME[id]} (${at.join('; ')})`) }
    const w = await wl(p, W, di, `f32-d${di}`)
    const names = w.sans.map(r => r.split(' — ')[0]).sort()
    const wantN = want.map(x => x.split(' (')[0]).sort()
    const shape = w.sans.every(r => r.includes(' — ' + NOFILE))
    const told = w.sans.filter(r => /file it|needs to file|File /i.test(r))
    W.rec(`F32.d${di}`, `day ${di}: SANS lines for exactly the four unfiled men who sit in a flying seat or sim that day (${wantN.join(', ') || 'none'}), each "— ${NOFILE}…"; none for the six the demo files for`,
      J(names) === J(wantN) && shape && !told.length, `in seats: ${want.join(', ') || 'none'} · six filed in seats: ${also.join(', ') || 'none'} · ${wSay(w)} · count ${headN(w.head)}`, w.pic)
    for (const r of w.sans) {
      const nm = r.split(' — ')[0], id = Object.keys(NAME).find(k => NAME[k] === nm)
      const s = id ? await seated(p, id) : []
      const pp = id ? await puckPic(p, W, id, `f32-d${di}-${id}`) : ''
      W.rec(`F32.d${di}.${id}`, `day ${di}: ${nm}'s puck — the amber "A" (or a harder chip that outranks it), RECORDED`, 'REC', seatSay(s), pp)
    }
  }
  /* A32's second half: Bolt covered on Wed 15 (Fly all day) — his line goes, Otter's and Pixel's stay */
  const w0 = await wl(p, W, 2, 'f32-a32-before')
  const f = await fileFor(p, W, ISO[15], 'yeti', ['fly'], 'all', 'f32-a32-file')
  need(W, 'set.a32', 'Saber files Fly all day for Bolt on Wed 15 (Inputs → SANS)', !!f.iid, J(f.rec), f.pic)
  const w1 = await wl(p, W, 2, 'f32-a32-after')
  W.rec('F32.a32', 'Wed 15 after Bolt is covered: his line goes, Otter\'s and Pixel\'s stay, the count drops by one',
    !w1.sans.some(r => r.startsWith('Bolt ')) && w1.sans.some(r => r.startsWith('Otter ')) && w1.sans.some(r => r.startsWith('Pixel ')) && headN(w1.head) === headN(w0.head) - 1,
    `before ${wSay(w0)} · after ${wSay(w1)}`, w1.pic)
  const wb2 = await weekBars(p, W, 'f32-a32')
  W.rec('F32.a32.bars', 'the week\'s bars after Bolt is covered', 'REC', wb2.b.join(' | '), wb2.pic)
}

/* ---- F39 = A31 (the Logic part): the check's name and line on the Logic page; can it be switched off? ---- */
S.F39 = async (p, W) => {
  await bundleOk(p, W)
  await L.go(p, 'logic'); await sleep(600)
  /* the name's words a person sees: the name's text less any part one pixel wide or less (a screen reader's label) */
  const read = () => p.evaluate(() => [...document.querySelectorAll('#page-logic .lgchk')].filter(e => /SANS availability — not filed/.test(e.textContent || '') && e.getBoundingClientRect().width > 0).map(e => ({ cls: String(e.className), nm: (e.querySelector('.lgnm') || e).textContent.replace(/\s+/g, ' ').trim(),
    nmSeen: (() => { const n = e.querySelector('.lgnm'); if (!n) return ''; let s = n.textContent; for (const c of n.querySelectorAll('*')) { const b = c.getBoundingClientRect(); if (b.width <= 1 || b.height <= 1) s = s.replace(c.textContent, '') } return s.replace(/\s+/g, ' ').trim() })(), why: ((e.querySelector('.lgwhy') || {}).textContent || '').replace(/\s+/g, ' ').trim(), seen: [...e.querySelectorAll('*')].filter(x => !x.children.length && x.getBoundingClientRect().width > 1).map(x => x.textContent.trim()).filter(Boolean), ctl: e.querySelectorAll('input, button, [role="switch"]').length, grp: ((e.closest('.lggrp') || {}).querySelector ? (e.closest('.lggrp').querySelector('h2, h3, .lggh, .lghd') || {}).textContent || '' : '').replace(/\s+/g, ' ').trim(), box: (() => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), innerWidth] })() })))
  /* without a search: scroll the check into view */
  let r0 = await read()
  const loc = p.locator('#page-logic .lgchk', { hasText: 'SANS availability' }).first()
  if (await loc.count()) { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
  /* the check's own box pictured by the browser (run F39-d's framed clip landed on another part of the page) */
  const own = p.locator('#page-logic .lgchk', { hasText: 'SANS availability — not filed' }).first()
  const pic0 = (await own.count()) ? await (async () => { const f = `${W.scn}-f39-check-${W.sz.name}.png`; await own.screenshot({ path: `${C.OUT}/${f}` }); return f })() : await W.pic(p, 'f39-nocheck')
  const want = { nm: 'SANS availability — not filed, or planned outside it', why: 'A SANS man planned outside the event or the hours he filed, or with nothing filed.' }
  const x = r0[0] || {}
  W.rec('F39.1', `Logic page, the checks: the check named "${want.nm}" (as seen), its line "${want.why}", marked advisory (amber)`, x.nmSeen === want.nm && x.why === want.why && /adv/.test(x.cls), J(r0), pic0)
  W.rec('F39.1w', 'the words a person SEES (parts with a width) — RECORDED', 'REC', `name seen "${x.nmSeen}" · full text "${x.nm}" · leaves ${J(x.seen)} · group "${x.grp}"`, pic0)
  await p.fill('#lgSearch', 'SANS'); await sleep(700)
  r0 = await read()
  W.rec('F39.2', 'the same check found by the page\'s search for "SANS"', r0.length === 1 && r0[0].why === want.why, J(r0.map(y => y.nm + ' / ' + y.why)), await W.pic(p, 'f39-search'))
  let ctl = 'no Edit'
  if (await p.locator('#lgEdit:visible').count()) {
    await W.press(p, '#lgEdit:visible', 'lg-edit'); await sleep(500)
    const r1 = await read()
    ctl = `in Edit: ${r1.map(y => y.ctl + ' control(s) on the check').join(', ')}`
    const sw = await p.evaluate(() => [...document.querySelectorAll('#page-logic .lgchk input, #page-logic .lgchk [role="switch"], #page-logic .lgchk button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.closest('.lgchk').querySelector('.lgnm') || {}).textContent))
    ctl += ` · switches on any check: ${J(sw)}`
    W.rec('F39.3', 'can the check be switched off on the Logic page? (Edit mode looked at) — RECORDED', 'REC', ctl, await W.pic(p, 'f39-edit'))
    if (await p.locator('#lgDone:visible').count()) await W.press(p, '#lgDone:visible', 'lg-done')
  } else W.rec('F39.3', 'can the check be switched off on the Logic page? — RECORDED', 'REC', ctl, await W.pic(p, 'f39-noedit'))
  /* the Filter button: what it offers */
  if (await p.locator('#page-logic button', { hasText: /^Filter$/ }).count()) {
    await W.press(p, p.locator('#page-logic button', { hasText: /^Filter$/ }).first(), 'lg-filter'); await sleep(400)
    const fo = await p.evaluate(() => [...document.querySelectorAll('button, label, [role="menuitemcheckbox"], [role="option"]')].filter(e => e.getBoundingClientRect().width > 0 && e.closest('[class*="filt"], [role="menu"], [role="dialog"], .lgfilt, .pop')).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 30))
    W.rec('F39.4', 'the Logic page\'s Filter — what it offers (RECORDED)', 'REC', J(fo), await W.pic(p, 'f39-filter'))
    await p.keyboard.press('Escape'); await sleep(300)
  }
}

/* ---- F16 = A8, N4, N13: Ranger posted out as SANS from Fri 17 — X Thu 16 (before), Y Fri 17, Z Sun 19 ---- */
S.F16 = async (p, W) => {
  await bundleOk(p, W)
  await postR(p, W)
  /* X = Thu 16: his demo flight RU BFM — an ordinary man that day */
  const x = await look(p, W, 3, RANGER, 'f16-x16')
  W.rec('F16.x', 'Thu 16 (before his date): Ranger on his demo flight — no SANS line for him (N4: nor for Ace, an ordinary man)', !x.w.his.some(r => /SANS/.test(r)) && !x.w.sans.some(r => /^(Ranger|Ace) /.test(r)), lookSay(x, 'Ranger'), x.pic)
  /* Y = Fri 17 and Z = Sun 19: a timed flight each, Ranger tapped into the front seat */
  for (const [di, d, cs] of [[4, 'Fri 17', 'C16 FRI'], [6, 'Sun 19', 'C16 SUN']]) {
    const f = await flight(p, W, di, cs, '13:00', '14:00')
    need(W, `set.f16.${di}`, `${d}: + Wave → Flying wave "${cs}" T/O 13:00, landing 14:00`, f.wi >= 0 && f.f.to === '13:00', J(f.f))
    const pk = await tapIn(p, W, di, f.F, RANGER, `f16-${di}`)
    const cl = one(pk.c, RANGER)
    W.rec(`F16.${di}.crew`, `${d}: the front seat armed — Ranger's crew-list reason "SANS from Fri 17 Jul: no availability filed" (D2587)`, !!cl && cl.printed === 'SANS from Fri 17 Jul: no availability filed', say1(pk.c, RANGER), pk.notePic)
    W.rec(`F16.${di}.note`, `${d}: Ranger placed; the note after the plant — RECORDED (repeats the new line? tells anyone to file?)`, placedOk(pk, RANGER) && !pk.seen.some(n => /file it|File it|needs to file/i.test(n)) ? 'REC' : false, `seat ${pk.placed} · notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
    const l = await look(p, W, di, RANGER, `f16-${di}`)
    const want = noFile('Ranger', `${cs} (T/O 13:00)`)
    W.rec(`F16.${di}.list`, `${d}: the line "${want}", amber "A" on his puck`, l.w.his.includes(want) && hasA(l.s), lookSay(l, 'Ranger'), l.pic)
    /* lesson 32: the crew list (the back seat armed) and the warning list in one picture */
    const r2 = await armAt(p, W, di, `[data-slot="${f.R}"]`, `f16-${di}-l32`)
    const both = await W.pic(p, `f16-${di}-l32-both`)
    W.rec(`F16.${di}.l32`, `${d}: lesson 32 — the crew list (back seat armed) beside the warning list, Ranger's words in each (RECORDED)`, 'REC', `crew list: ${say1(r2.c, RANGER)} · warning list: ${l.w.his.join(' | ')}`, both)
    await C.X.disarmPick(p, W).catch(() => {}); await W5.disarm(p, W)
  }
  /* the week's bars with the two new lines */
  const wb = await weekBars(p, W, 'f16-bars')
  W.rec('F16.bars', 'the week\'s bars after the two plants (RECORDED)', 'REC', wb.b.join(' | '), wb.pic)
  /* N13 + lesson 32: his bell after the plants (as Ranger), then A8's last part — he files Fly all day for Sun 19 */
  await Z.asR(p, W)
  const b = await Z.bell(p, W, 'f16-bell')
  W.rec('F16.bell', "Ranger's bell after the plants: the reminder as before (planned on … with nothing filed. Tap to file for availability.), no new words (N13) — RECORDED", 'REC', Z.sayB(b), b.pic)
  await T.closeAll(p, W)
  const fl = await T.file(p, W, ISO[19], null, ['fly'], 'all', 'f16-a8-file')
  need(W, 'set.a8', 'Ranger files Fly all day for Sun 19 on his SANS calendar', !!fl.iid, J(fl.made) + ' ' + (fl.refused || ''), fl.pic)
  await Z.asS(p, W)
  const z2 = await look(p, W, 6, RANGER, 'f16-a8-after')
  const y2 = await look(p, W, 4, RANGER, 'f16-a8-fri')
  W.rec('F16.a8', 'A8: after his filing for Sun 19, Sun 19 has no SANS line for him, no "A"; Fri 17 keeps its line', !z2.w.his.some(r => /SANS/.test(r)) && !hasA(z2.s) && y2.w.his.some(r => r.includes(NOFILE)), `Sun 19: ${lookSay(z2, 'Ranger')} · Fri 17: ${lookSay(y2, 'Ranger')}`, z2.pic + ', ' + y2.pic)
  /* N15: the Tracker and the Leave War show nothing new */
  for (const pg of ['tracker', 'leavewar']) {
    await L.closeBoard(p, W); await L.go(p, pg); await sleep(1200)
    const hit = await p.evaluate(() => (document.body.innerText.match(/SANS: (no availability|offered|available)[^\n]*/g) || []).slice(0, 3))
    W.rec(`N15.${pg}`, `N15: the ${pg === 'tracker' ? 'Tracker' : 'Leave War'} carries none of the warning list's SANS lines`, hit.length === 0, J(hit), await W.pic(p, `n15-${pg}`))
  }
}

/* the man's rows on a day, read with his puck; the day's count */
const day = async (p, W, di, id, tag) => { const l = await look(p, W, di, id, tag); return { ...l, n: headN(l.w.head) } }
const sansOf = l => l.w.his.filter(r => /SANS/.test(r))
const D3 = { 4: 'Fri 17', 5: 'Sat 18', 6: 'Sun 19' }
const undoState = p => p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `"${(b.textContent || '').trim()}" ${b.disabled || b.getAttribute('aria-disabled') === 'true' ? 'greyed' : 'enabled'} title "${b.getAttribute('title') || ''}"` : 'no Undo' })

/* ---- F17 + F18 = A9: his SANS date moved past a day and back, with a mismatch and a matching filing standing ---- */
S.F17 = async (p, W) => {
  await bundleOk(p, W)
  await postR(p, W)
  const tails = {}
  for (const [di, cs] of [[4, 'C17 FRI'], [5, 'C17 SAT'], [6, 'C17 SUN']]) {
    const f = await flight(p, W, di, cs, '13:00', '14:00')
    need(W, `set.f17.${di}`, `${D3[di]}: flying line "${cs}" T/O 13:00`, f.wi >= 0 && f.f.to === '13:00', J(f.f))
    const pk = await tapIn(p, W, di, f.F, RANGER, `f17-${di}`)
    need(W, `set.f17.${di}.in`, `${D3[di]}: Ranger tapped into its front seat`, placedOk(pk, RANGER), `seat ${pk.placed} · notes ${J(pk.seen)}`, pk.notePic)
    tails[di] = `${cs} (T/O 13:00)`
  }
  const f18 = await fileFor(p, W, ISO[18], RANGER, ['oft'], 'all', 'f17-file18')
  need(W, 'set.f17.file18', 'Saber files OFT only, all day, for Ranger on Sat 18', !!f18.iid, J(f18.rec), f18.pic)
  const f19 = await fileFor(p, W, ISO[19], RANGER, ['fly'], 'all', 'f17-file19')
  need(W, 'set.f17.file19', 'Saber files Fly, all day, for Ranger on Sun 19', !!f19.iid, J(f19.rec), f19.pic)
  const want = { 4: [noFile('Ranger', tails[4])], 5: [offered('Ranger', 'OFT', tails[5])], 6: [] }
  const readAll = async (tag) => { const o = {}; for (const di of [4, 5, 6]) o[di] = await day(p, W, di, RANGER, `${tag}-${di}`); return o }
  const sayAll3 = o => [4, 5, 6].map(di => `${D3[di]}: ${sansOf(o[di]).join(' | ') || 'no SANS line'} (count ${o[di].n}; puck ${seatSay(o[di].s)})`).join(' · ')
  const r0 = await readAll('f17-r0')
  W.rec('F17.0', 'SANS from Fri 17: Fri 17 "no availability filed", Sat 18 "offered OFT only" (D2584 2a), Sun 19 none (Fly filed)', [4, 5, 6].every(di => J(sansOf(r0[di])) === J(want[di])) && hasA(r0[4].s) && hasA(r0[5].s) && !hasA(r0[6].s), sayAll3(r0), [4, 5, 6].map(di => r0[di].pic).join(', '))
  /* the date moved 17 → 18 on the Leave War's posted-out sheet */
  await Z.K.move(p, W, ISO[17], ISO[18], 'set.mv1')
  const u1 = await undoState(p)
  W.rec('F17.undo', "after the date move: the top bar's Undo — does it take back the date change? (RECORDED)", 'REC', u1, await W5.clip(p, W, '#undoBtn', 'f17-undo', 120))
  /* Admin → Users: Ranger's row, any SANS date control there */
  await L.go(p, 'admin'); await sleep(500)
  /* run F17-p: on the phone Admin opens on its menu — "Users" pressed first */
  const um = p.locator('#page-admin').getByText('Users', { exact: true }).locator('visible=true').first()
  if (W.isPhone && await um.count()) { await W.press(p, um, 'admin-users'); await sleep(600) }
  const ar = p.locator('#page-admin').getByText('Ranger', { exact: true }).locator('visible=true').first()
  if (await ar.count()) { await ar.scrollIntoViewIfNeeded().catch(() => {}); await W.press(p, ar, 'admin-ranger').catch(() => {}); await sleep(600) }
  const aw = await p.evaluate(() => { const e = [...document.querySelectorAll('#page-admin *')].find(x => !x.children.length && /^(POSTING OUT|POSTED OUT|Posting out|Posted out)/i.test((x.textContent || '').trim()) && x.getBoundingClientRect().width > 0); const ctl = [...document.querySelectorAll('#page-admin input[type="date"], #page-admin [data-testid*="sans"], #page-admin [data-testid*="post"]')].filter(x => x.getBoundingClientRect().width > 0).length; return { badge: e ? e.textContent.trim() : 'none', dateControls: ctl } })
  W.rec('F17.admin', 'Admin → Users, Ranger\'s row opened: his SANS date shown? any control to move it? (RECORDED)', 'REC', J(aw), await W.pic(p, 'f17-admin'))
  const r1 = await readAll('f17-r1')
  W.rec('F17.1', 'date moved to Sat 18: Fri 17\'s line, ring and "A" go and its count drops by one; Sat 18 keeps "offered OFT only"; Sun 19 none (D2341, D2329)',
    !sansOf(r1[4]).length && !hasA(r1[4].s) && r1[4].n === r0[4].n - 1 && J(sansOf(r1[5])) === J(want[5]) && !sansOf(r1[6]).length, sayAll3(r1), [4, 5, 6].map(di => r1[di].pic).join(', '))
  /* 18 → 20: past every day; the SANS calendar's Sat 18 read */
  await Z.K.move(p, W, ISO[18], ISO[20], 'set.mv2')
  const r2 = await readAll('f17-r2')
  const sc = await sansCell(p, W, ISO[18], 'f17-sans18')
  W.rec('F17.2', 'date moved to Mon 20: no SANS line on Fri 17, Sat 18 or Sun 19 (an ordinary man there)', [4, 5, 6].every(di => !sansOf(r2[di]).length && !hasA(r2[di].s)), sayAll3(r2), [4, 5, 6].map(di => r2[di].pic).join(', '))
  W.rec('F17.2s', 'the SANS calendar\'s Sat 18 while he is not SANS that day: his OFT filing (RECORDED — hidden or shown)', 'REC', sc.line, sc.pic)
  /* 20 → 17: everything back by itself, the filings included (F18, D2341) */
  await Z.K.move(p, W, ISO[20], ISO[17], 'set.mv3')
  const r3 = await readAll('f17-r3')
  W.rec('F17.3', 'date back to Fri 17: Fri 17 "no availability filed" returns, Sat 18 "offered OFT only" returns by itself, Sun 19 stays clean (his Fly filing counts again — F18)',
    [4, 5, 6].every(di => J(sansOf(r3[di])) === J(want[di])) && hasA(r3[4].s) && hasA(r3[5].s) && !hasA(r3[6].s), sayAll3(r3), [4, 5, 6].map(di => r3[di].pic).join(', '))
}

/* ---- F19: the SANS tick on the Quals page for an ordinary man (Ace) planned on flights ---- */
S.F19 = async (p, W) => {
  await bundleOk(p, W)
  const ACE = 'dj'
  const seats = {}
  for (let di = 0; di < 7; di++) seats[di] = await flySims(p, di, ACE)
  const read = async tag => { const o = {}; for (let di = 0; di < 7; di++) { const w = await wl(p, W, di, `${tag}-d${di}`, 'Ace'); o[di] = { w, s: await seated(p, ACE) } } return o }
  const say7 = o => [0, 1, 2, 3, 4, 5, 6].map(di => `d${di}${seats[di].length ? '(' + seats[di].join(';') + ')' : ''}: ${o[di].w.his.filter(r => /SANS/.test(r)).join(' | ') || '-'} [${seatSay(o[di].s)}]`).join(' · ')
  const r0 = await read('f19-r0')
  W.rec('F19.0', 'before: Ace (an ordinary pilot) has no SANS line on any day (N4)', [0, 1, 2, 3, 4, 5, 6].every(di => !r0[di].w.his.some(r => /SANS/.test(r))), say7(r0), [1, 3].map(di => r0[di].w.pic).join(', '))
  const q = await L.qualsTick(p, W, ACE, 'f19-tick')
  need(W, 'set.f19.tick', 'Quals → Edit → Ace\'s SANS ticked → Done', q.st && q.st.san === true, J(q.st), q.pic)
  const r1 = await read('f19-r1')
  const bad = [0, 1, 2, 3, 4, 5, 6].filter(di => !seats[di].length && r1[di].w.his.some(r => /SANS/.test(r)))
  W.rec('F19.1', `ticked SANS (from ${q.st.sanFrom || 'no date'}): a line on the days he sits in a flying seat or sim, none on any other day — RECORDED day by day`, bad.length ? false : 'REC', say7(r1) + (bad.length ? ` · LINE ON A DAY WITH NO SEAT: ${bad.join(',')}` : ''), [1, 3].map(di => r1[di].w.pic).join(', '))
  const q2 = await L.qualsTick(p, W, ACE, 'f19-untick')
  need(W, 'set.f19.untick', 'Quals → Edit → Ace\'s SANS unticked → Done', q2.st && q2.st.san === false, J(q2.st), q2.pic)
  const r2 = await read('f19-r2')
  W.rec('F19.2', 'unticked: every SANS line for Ace goes', [0, 1, 2, 3, 4, 5, 6].every(di => !r2[di].w.his.some(r => /SANS/.test(r))), say7(r2), [1, 3].map(di => r2[di].w.pic).join(', '))
}

/* ---- F20 = A17: the member files for himself; the scheduler's screen answers; Saber's Undo / Redo / Cancel / reload ---- */
/* a filing opened from its SANS day: the Inputs page's SANS tab first (a member signs in on View-only Sched) */
const openL = async (p, W, iso, iid, tag) => { await T.closeAll(p, W); await Z.X.openSans(p, W); return Z.X.openLine(p, W, iso, iid, tag) }
async function editFiling(p, W, iso, iid, kinds, span, tag, cancel = false) {
  const o = await openL(p, W, iso, iid, tag)
  if (!o.ok) return { ok: false, why: o.why, pic: o.pic }
  await Z.X.setKinds(p, W, kinds)
  if (Array.isArray(span)) { await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom'); await p.fill('#inpEditStart', span[0]); await p.fill('#inpEditEnd', span[1]) }
  const form = await Z.X.inpRead(p)
  const fpic = await W.pic(p, tag + '-form')
  if (cancel) { await Z.X.closeInp(p, W); await T.closeAll(p, W); return { ok: true, form, pic: fpic, said: 'cancelled' } }
  const s = await Z.X.saveInp(p, W, tag)
  if (s.stayed) { const t = await p.evaluate(() => (document.querySelector('#inpEditPop') || document.body).innerText.slice(0, 300)); await Z.X.closeInp(p, W); await T.closeAll(p, W); return { ok: false, why: 'window stayed: ' + t, pic: fpic + ', ' + s.pic } }
  await T.closeAll(p, W)
  return { ok: true, form, said: s.said, pic: fpic + ', ' + s.pic }
}
S.F20 = async (p, W) => {
  await bundleOk(p, W)
  await postR(p, W)
  const di = 5, cs = 'C20 SAT', tail = `${cs} (T/O 13:00)`
  const f = await flight(p, W, di, cs, '13:00', '14:00')
  need(W, 'set.f20', 'Sat 18: flying line "C20 SAT" T/O 13:00', f.wi >= 0, J(f.f))
  const pk = await tapIn(p, W, di, f.F, RANGER, 'f20-in')
  need(W, 'set.f20.in', 'Ranger tapped into its front seat', placedOk(pk, RANGER), `notes ${J(pk.seen)}`, pk.notePic)
  const st = async (tag, wantRows, what, needA) => { const l = await day(p, W, di, RANGER, tag); const ok = J(sansOf(l)) === J(wantRows) && hasA(l.s) === needA; return { l, ok, say: `${lookSay(l, 'Ranger')} · count ${l.n}` } }
  let s = await st('f20-0', [noFile('Ranger', tail)], '', true)
  W.rec('F20.0', `Sat 18: "${noFile('Ranger', tail)}", amber "A"`, s.ok, s.say, s.l.pic)
  const n0 = s.l.n
  /* as Ranger: Fly all day */
  await Z.asR(p, W)
  const fl = await T.file(p, W, ISO[18], null, ['fly'], 'all', 'f20-rfile')
  need(W, 'set.f20.rfile', 'Ranger files Fly all day for Sat 18 on his SANS calendar', !!fl.iid, J(fl.made) + ' ' + (fl.refused || ''), fl.pic)
  await Z.asS(p, W)
  s = await st('f20-1', [], '', false)
  W.rec('F20.1', 'back as Saber: the line, the "A" and one from the count gone', s.ok && s.l.n === n0 - 1, s.say, s.l.pic)
  /* as Ranger: changed to OFT only */
  await Z.asR(p, W)
  let e = await editFiling(p, W, ISO[18], fl.iid, ['o'], 'all', 'f20-oft')
  need(W, 'set.f20.oft', 'Ranger changes his filing to OFT only (opened from Sat 18, Save)', e.ok, (e.why || '') + ' ' + J(e.form && e.form.ticks) + ' "' + (e.said || '') + '"', e.pic)
  await Z.asS(p, W)
  s = await st('f20-2', [offered('Ranger', 'OFT', tail)], '', true)
  W.rec('F20.2', `OFT only: "${offered('Ranger', 'OFT', tail)}", amber "A"`, s.ok, s.say, s.l.pic)
  /* A17: Fly 08:00–12:00 — the hours line, unchanged words */
  await Z.asR(p, W)
  e = await editFiling(p, W, ISO[18], fl.iid, ['f'], ['08:00', '12:00'], 'f20-hrs')
  need(W, 'set.f20.hrs', 'Ranger changes it to Fly, 08:00–12:00', e.ok, (e.why || '') + ' ' + J(e.form && e.form.ticks) + ' "' + (e.said || '') + '"', e.pic)
  await Z.asS(p, W)
  s = await st('f20-3', [hours('Ranger', '08:00', '12:00', tail)], '', true)
  W.rec('F20.3', `A17: Fly 08:00–12:00 against T/O 13:00: "${hours('Ranger', '08:00', '12:00', tail)}" (the hours line as before)`, s.ok, s.say, s.l.pic)
  /* as Ranger: deleted */
  await Z.asR(p, W)
  const u = await W5.uncommit(p, W, ISO[18], fl.iid, 'f20-del')
  await T.closeAll(p, W)
  need(W, 'set.f20.del', 'Ranger deletes his filing (opened from Sat 18, Delete)', u.ok, u.why || '', u.pic)
  await Z.asS(p, W)
  s = await st('f20-4', [noFile('Ranger', tail)], '', true)
  W.rec('F20.4', `deleted: back to "${noFile('Ranger', tail)}"`, s.ok && s.l.n === n0, s.say, s.l.pic)
  /* A17 as Saber: file, delete, Undo, Redo */
  const sf = await fileFor(p, W, ISO[18], RANGER, ['fly'], 'all', 'f20-sfile')
  need(W, 'set.f20.sfile', 'Saber files Fly all day for Ranger on Sat 18', !!sf.iid, J(sf.rec), sf.pic)
  s = await st('f20-5', [], '', false)
  W.rec('F20.5', 'A17: filed by Saber — no line', s.ok, s.say, s.l.pic)
  const ud = await W5.uncommit(p, W, ISO[18], sf.iid, 'f20-sdel')
  await T.closeAll(p, W)
  need(W, 'set.f20.sdel', 'Saber deletes it', ud.ok, ud.why || '', ud.pic)
  s = await st('f20-6', [noFile('Ranger', tail)], '', true)
  W.rec('F20.6', 'A17: deleted — the line back', s.ok, s.say, s.l.pic)
  await L.closeBoard(p, W); await L.go(p, 'inputs')
  const ut = await undoState(p)
  await W.press(p, '#undoBtn:visible', 'undo'); await sleep(700)
  const back = await p.evaluate(i => (window.INPUTS || []).some(r => r.iid === i), sf.iid)
  s = await st('f20-7', [], '', false)
  W.rec('F20.7', 'A17: the top bar\'s Undo on Inputs brings the filing back — the line goes', back && s.ok, `Undo before: ${ut} · filing back ${back} · ${s.say}`, s.l.pic)
  await L.closeBoard(p, W); await L.go(p, 'inputs')
  const rt = await p.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? `"${b.textContent.trim()}" title "${b.getAttribute('title') || ''}"` : 'no Redo' })
  await W.press(p, '#redoBtn:visible', 'redo'); await sleep(700)
  const gone = await p.evaluate(i => !(window.INPUTS || []).some(r => r.iid === i), sf.iid)
  s = await st('f20-8', [noFile('Ranger', tail)], '', true)
  W.rec('F20.8', 'A17: Redo deletes it again — the line back', gone && s.ok, `Redo: ${rt} · filing gone ${gone} · ${s.say}`, s.l.pic)
  /* Cancel changes nothing; a reload keeps the saved state */
  const so = await fileFor(p, W, ISO[18], RANGER, ['oft'], 'all', 'f20-soft')
  need(W, 'set.f20.soft', 'Saber files OFT only all day for Ranger on Sat 18', !!so.iid, J(so.rec), so.pic)
  const c = await editFiling(p, W, ISO[18], so.iid, ['f'], 'all', 'f20-cancel', true)
  const rec = await T.inp(p, so.iid)
  s = await st('f20-9', [offered('Ranger', 'OFT', tail)], '', true)
  W.rec('F20.9', 'A17: the filing opened, ticks changed to Fly, then Cancel — nothing changes: still "offered OFT only"', c.ok && J(rec.sans) === J({ o: true }) && s.ok, `form at cancel ${J(c.form && c.form.ticks)} · record ${J(rec.sans)} · ${s.say}`, c.pic + ', ' + s.l.pic)
  await T.reload(p, 'ad', 'a')
  s = await st('f20-10', [offered('Ranger', 'OFT', tail)], '', true)
  W.rec('F20.10', 'A17: after a reload (Saber signs in again) — still "offered OFT only"', s.ok, s.say, s.l.pic)
}

/* ---- F24: a SANS man on leave, planned in a seat with nothing filed ---- */
S.F24 = async (p, W) => {
  await bundleOk(p, W)
  const D14 = await import('./swd-w14d-lib.mjs')
  const di = 2, id = 'wrangler'
  const l0 = await day(p, W, di, id, 'f24-0')
  W.rec('F24.0', 'Wed 15 as it boots: Otter (nothing filed) on RU ACM — his rows and puck', l0.w.his.some(r => r.includes(NOFILE)) ? 'REC' : false, `${lookSay(l0, 'Otter')} · count ${l0.n}`, l0.pic)
  await L.closeBoard(p, W)
  await D14.inDay(p, W, ISO[15])
  await W.press(p, '#icPopAdd', 'icadd')
  await p.locator('#inpEditPop #inpEditType').waitFor()
  const opts = await p.locator('#inpEditPop #inpEditType option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent.trim()))
  await Z.X.closeInp(p, W); await T.closeAll(p, W)
  const x = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await x.count()) await W.press(p, x.first(), 'day-x')
  /* the window's types are short codes (probe run F24-d): LL is local leave */
  const lv = (opts.find(o => /^LL=/.test(o)) || opts.find(o => /=Local leave/i.test(o)) || '').split('=')[0]
  need(W, 'set.f24.type', 'a leave type offered in the input window', !!lv, J(opts))
  const fi = await D14.fileIn(p, W, ISO[15], { type: lv, who: id }, 'f24-leave')
  need(W, 'set.f24.leave', `Saber files "${lv}" for Otter on Wed 15 (Inputs → Calendar → the day → +)`, !!fi.iid, J(fi.rec) + ' asked ' + J(fi.asked), fi.pic)
  const l1 = await day(p, W, di, id, 'f24-1')
  W.rec('F24.1', 'Otter on leave and planned, nothing filed: which lines the list shows (the leave clash, the SANS line, or both) and his chip — RECORDED; the count agrees with the list', l1.n === l1.w.rows.length ? 'REC' : false, `${lookSay(l1, 'Otter')} · count ${l1.n} · rows ${l1.w.rows.length}`, l1.pic)
  /* the crew list's reason for him: an empty seat armed (a new evening line) */
  const f = await flight(p, W, di, 'C24 WED', '21:00', '22:00')
  const a = await armAt(p, W, di, `[data-slot="${f.R}"]`, 'f24-arm')
  W.rec('F24.2', 'an empty back seat armed: Otter\'s crew-list reason is the leave, not SANS', !!one(a.c, id) && !/SANS/.test(one(a.c, id).printed || '') && /leave/i.test((one(a.c, id).printed || '') + one(a.c, id).title) ? true : 'REC', say1(a.c, id), await W.pic(p, 'f24-arm-crew'))
  await W5.disarm(p, W)
}

/* ---- F30 = A10, A19, A20: an unfiled SANS man moved seat to seat (desktop: dragged; phone: Undo, then tapped in) ---- */
S.F30 = async (p, W) => {
  await bundleOk(p, W)
  const di = 4, id = 'cards', nm = 'Marlin'
  const a = await flight(p, W, di, 'C30 A', '13:00', '14:00')
  const b = await flight(p, W, di, 'C30 B')
  const o = await addSimRow(p, W, di, 'oft', 'C30 OFT', '15:00', '16:00')
  const sc = await addLine(p, W, di, { kind: 'SC' })
  const g = await L.groundRow(p, W, di, 'C30 GR', '16:30', '17:00')
  need(W, 'set.f30', 'Fri 17: flight "C30 A" T/O 13:00, untimed flight "C30 B", OFT "C30 OFT" 15:00–16:00, SC, ground row "C30 GR" 16:30–17:00', a.wi >= 0 && b.wi >= 0 && o.ri >= 0 && sc.wi >= 0 && g.ri >= 0, J({ a: a.f, b: b.f, o: o.r, sc: sc.f, g: g.row }))
  const K = { A: a.R, B: b.R, O: `s:${di}.oft.${o.ri}.w`, SC: `${di}.${sc.wi}.0.0.w`, G: `g:${di}.${g.ri}.+` }
  const pk = await tapIn(p, W, di, K.A, id, 'f30-a')
  need(W, 'set.f30.in', 'Marlin tapped into C30 A\'s back seat', placedOk(pk, id), `notes ${J(pk.seen)}`, pk.notePic)
  let l = await day(p, W, di, id, 'f30-0')
  W.rec('F30.0', `on C30 A: "${noFile(nm, 'C30 A (T/O 13:00)')}"`, J(sansOf(l)) === J([noFile(nm, 'C30 A (T/O 13:00)')]) && hasA(l.s), lookSay(l, nm), l.pic)
  const steps = [['B', 'C30 B (no times yet)', 'an untimed flight', true], ['O', null, 'the OFT seat', true], ['SC', '', 'SC MAIN (standby)', false], ['G', '', 'a ground row', false]]
  let from = K.A
  for (const [k, tail, what, raise] of steps) {
    let how
    if (!W.isPhone) {
      const src = p.locator(`#schedBoard [data-slot="${from}"] .puck[data-person="${id}"]:visible, #schedBoard [data-fill="${from}"] .puck[data-person="${id}"]:visible`).first()
      const tgt = p.locator(/\+$/.test(K[k]) ? `#schedBoard [data-fill="${K[k]}"]` : `#schedBoard [data-slot="${K[k]}"]`).first()
      const d = await C.X.dragVia(p, W, src, [tgt], `f30-${k}`)
      how = `dragged from ${from}: ${d.ok ? 'ok' : d.why} · note "${d.note}"`
    } else {
      await sbUndo(p, W)
      const left = await holdsAt(p, from)
      const t = await tapIn(p, W, di, K[k], id, `f30-${k}`)
      how = `phone: board Undo took him off ${from} (left "${left}"), then tapped into ${K[k]} · notes ${J(t.seen)}`
    }
    const at = await holdsAt(p, K[k]), was = await holdsAt(p, from)
    l = await day(p, W, di, id, `f30-${k}`)
    const s = sansOf(l)
    /* a ground row's place is read from his drawn puck (run F30-d: the seat reader knows no ground key and said "no seat") */
    const landed = /^g:/.test(K[k]) ? l.s.some(x => x.at === K[k].replace(/\.\+$/, '')) : String(at).includes(id)
    const ok = landed && !String(was).includes(id) && (raise ? s.length === 1 && (tail ? s[0] === noFile(nm, tail) : s[0].startsWith(`${nm} — ${NOFILE}Sim C30 OFT`)) && hasA(l.s) : !s.length && !hasA(l.s))
    W.rec(`F30.${k}`, `moved to ${what}: ${raise ? `one line, the tail following the seat${tail ? ` ("${tail}")` : ' ("Sim C30 OFT …" — exact words RECORDED)'}` : 'no SANS line, no "A"'}`, ok, `${how} · now at ${K[k]} "${at}" · old seat "${was}" · ${lookSay(l, nm)}`, l.pic)
    from = K[k]
  }
  /* A10: two days with different filings — a filing on Fri 17 only; Marlin on a Sat 18 flight and back on C30 A */
  const s18 = await flight(p, W, 5, 'C30 SAT', '13:00', '14:00')
  const t18 = await tapIn(p, W, 5, s18.R, id, 'f30-sat')
  need(W, 'set.a10', 'Sat 18: flight "C30 SAT" T/O 13:00, Marlin tapped into its back seat', placedOk(t18, id), `notes ${J(t18.seen)}`, t18.notePic)
  const ff = await fileFor(p, W, ISO[17], id, ['fly'], 'all', 'f30-file17')
  need(W, 'set.a10.file', 'Saber files Fly all day for Marlin on Fri 17 only', !!ff.iid, J(ff.rec), ff.pic)
  const tA = await tapIn(p, W, di, K.A, id, 'f30-backA')
  const l17 = await day(p, W, di, id, 'f30-a10-17'), l18 = await day(p, W, 5, id, 'f30-a10-18')
  W.rec('F30.a10', 'A10: each day uses its own filing — Fri 17 (filed) no line on C30 A; Sat 18 (not filed) keeps "no availability filed"', placedOk(tA, id) && !sansOf(l17).length && J(sansOf(l18)) === J([noFile(nm, 'C30 SAT (T/O 13:00)')]), `Fri 17: ${lookSay(l17, nm)} · Sat 18: ${lookSay(l18, nm)}`, l17.pic + ', ' + l18.pic)
  const dl = await L.openBoard(p, W, 5).then(() => p.locator(L.B(`[data-ldel="5.${s18.wi}.0.0"]`)).first())
  if (await dl.count()) await W.press(p, dl, 'ldel')
  await sleep(500)
  const l18b = await day(p, W, 5, id, 'f30-a10-18b')
  W.rec('F30.a10b', 'A10: the Sat 18 line removed (its ✕) — Sat 18 loses Marlin\'s line, Fri 17 unchanged', !sansOf(l18b).length, lookSay(l18b, nm), l18b.pic)
}

/* ---- F31 = A18: a cancelled line, a cancelled OFT box and AMT box; removed and put back by Undo ---- */
S.F31 = async (p, W) => {
  await bundleOk(p, W)
  const di = 4
  const f = await flight(p, W, di, 'C31 F', '13:00', '14:00')
  const o = await addSimRow(p, W, di, 'oft', 'C31 OFT', '15:00', '16:00')
  const m = await addSimRow(p, W, di, 'amt', 'C31 AMT', '17:00', '18:00')
  need(W, 'set.f31', 'Fri 17: flight "C31 F" 13:00, OFT "C31 OFT" 15:00–16:00, AMT "C31 AMT" 17:00–18:00', f.wi >= 0 && o.ri >= 0 && m.ri >= 0, J({ f: f.f, o: o.r, m: m.r }))
  const who3 = [['cards', 'Marlin', f.R, `[data-lcx="${di}.${f.wi}.0.0"]`, 'the flying line'], ['wrangler', 'Otter', `s:${di}.oft.${o.ri}.w`, `[data-srcx="${di}.oft.${o.ri}"]`, 'the OFT box'], ['badger', 'Pixel', `s:${di}.amt.${m.ri}.w`, `[data-srcx="${di}.amt.${m.ri}"]`, 'the AMT box']]
  for (const [id, nm, key] of who3) {
    const t = await tapIn(p, W, di, key, id, `f31-in-${id}`)
    need(W, `set.f31.${id}`, `${nm} tapped into ${key}`, placedOk(t, id), `notes ${J(t.seen)}`, t.notePic)
  }
  const l0 = await wl(p, W, di, 'f31-0')
  W.rec('F31.0', 'three SANS lines: Marlin on C31 F, Otter on the OFT, Pixel on the AMT (sim tails RECORDED)', ['Marlin', 'Otter', 'Pixel'].every(n => l0.sans.some(r => r.startsWith(n + ' — ' + NOFILE))), wSay(l0), l0.pic)
  for (const [id, nm, , btn, what] of who3) {
    const c1 = await Z.cx(p, W, di, btn, true, `f31-cx-${id}`)
    const l = await day(p, W, di, id, `f31-cx-${id}`)
    const agree = sansOf(l).length ? hasA(l.s) || l.s.some(x => x.chips.length) : !hasA(l.s)
    W.rec(`F31.cx.${id}`, `${what} cancelled (CX, WX): does ${nm}'s line stay? RECORDED — the list and his puck must agree (no ring without a line)`, c1.ok && agree ? 'REC' : false, `${c1.why || 'cancelled'} · ${lookSay(l, nm)}`, [c1.pic, l.pic].filter(Boolean).join(', '))
    const c2 = await Z.cx(p, W, di, btn, false, `f31-uncx-${id}`)
    const l2 = await day(p, W, di, id, `f31-uncx-${id}`)
    W.rec(`F31.uncx.${id}`, `${what} un-cancelled: ${nm}'s line there`, c2.ok && sansOf(l2).length === 1 && hasA(l2.s), `${lookSay(l2, nm)}`, l2.pic)
  }
  /* A18: the flight removed by its ✕, put back by the board's Undo */
  await L.openBoard(p, W, di)
  await W.press(p, L.B(`[data-ldel="${di}.${f.wi}.0.0"]`), 'ldel'); await sleep(600)
  const lr = await day(p, W, di, 'cards', 'f31-del')
  W.rec('F31.del', 'A18: C31 F removed (its ✕): Marlin\'s line goes; Otter\'s and Pixel\'s stay', !sansOf(lr).length && lr.w.sans.some(r => r.startsWith('Otter ')) && lr.w.sans.some(r => r.startsWith('Pixel ')), lookSay(lr, 'Marlin'), lr.pic)
  await sbUndo(p, W)
  const lu = await day(p, W, di, 'cards', 'f31-undo')
  W.rec('F31.undo', 'A18: the board\'s Undo puts the line back with Marlin — his line returns', J(sansOf(lu)) === J([noFile('Marlin', 'C31 F (T/O 13:00)')]) && hasA(lu.s), lookSay(lu, 'Marlin'), lu.pic)
}

/* ---- F37 = A21, N5: the crew list's strikes and "N free" with nothing filed, then one man filed ---- */
const sansHead = c => (c && c.head) || ''
const freeN = h => { const m = /(\d+)\s*free/i.exec(h || ''); return m ? +m[1] : NaN }
S.F37 = async (p, W) => {
  await bundleOk(p, W)
  const di = 4, K = 'krait'
  await L.openBoard(p, W, di)
  await W5.boardDrawer(p, W, true)
  const c0 = await crewAll(p, '#schedBoard')
  const printed0 = (c0.pucks || []).filter(x => x.where === 'SANS Avail' && x.printed)
  const pic0 = await W.pic(p, 'f37-unarmed')
  await W5.boardDrawer(p, W, false)
  const w0 = await wl(p, W, di, 'f37-w0')
  W.rec('F37.0', 'N5 / D2420: Fri 17, nothing armed — the SANS men drawn struck with no reason line under any; the warning list has no SANS line (nobody planned)', !printed0.length && !w0.sans.length, `${sayAll(c0)} · struck ${(c0.pucks || []).filter(x => x.where === 'SANS Avail' && x.struck).length} · printed ${J(printed0.map(x => x.id + ':' + x.printed))} · ${wSay(w0)}`, pic0 + ', ' + w0.pic)
  const f = await flight(p, W, di, 'C37 F', '13:00', '14:00')
  const u = await flight(p, W, di, 'C37 U')
  const o = await addSimRow(p, W, di, 'oft', 'C37 OFT', '15:00', '16:00')
  const m = await addSimRow(p, W, di, 'amt', 'C37 AMT')
  const sc = await addLine(p, W, di, { kind: 'SC' })
  need(W, 'set.f37', 'Fri 17: flight "C37 F" 13:00, untimed flight "C37 U", OFT 15:00–16:00, untimed AMT, SC', f.wi >= 0 && u.wi >= 0 && o.ri >= 0 && m.ri >= 0 && sc.wi >= 0, J({ f: f.f, u: u.f, o: o.r, m: m.r }))
  const arm = async (sel, tag) => { const r = await armAt(p, W, di, sel, tag); const pic = await W.pic(p, tag + '-crew'); await C.X.disarmPick(p, W).catch(() => {}); await W5.disarm(p, W); return { ...r, pic } }
  let r = await arm(`[data-slot="${f.F}"]`, 'f37-1')
  const n1 = freeN(sansHead(r.c))
  W.rec('F37.1', 'the timed flight\'s front seat armed, nothing filed: Kraken struck "SANS — no availability filed for today"; "SANS Avail · N free" read', !!one(r.c, K) && one(r.c, K).struck && one(r.c, K).printed === 'SANS — no availability filed for today', `${sayAll(r.c)} · Kraken ${say1(r.c, K)}`, r.pic)
  const ff = await fileFor(p, W, ISO[17], K, ['fly'], 'all', 'f37-file')
  need(W, 'set.f37.file', 'Saber files Fly all day for Kraken on Fri 17', !!ff.iid, J(ff.rec), ff.pic)
  r = await arm(`[data-slot="${f.F}"]`, 'f37-2')
  const n2 = freeN(sansHead(r.c))
  W.rec('F37.2', 'the same seat armed after his filing: Kraken no longer struck, "N free" up by one', !!one(r.c, K) && !one(r.c, K).struck && n2 === n1 + 1, `free ${n1} → ${n2} · ${sayAll(r.c)} · Kraken ${say1(r.c, K)}`, r.pic)
  const cases = [[`[data-slot="s:${di}.oft.${o.ri}.p"]`, 'the OFT front seat', 'SANS — not offering OFT', 'f37-3'], [`[data-slot="${u.F}"]`, 'the untimed flight\'s front seat', '', 'f37-4'], [`[data-fill="s:${di}.amt.${m.ri}.+"]`, 'the untimed AMT\'s extra place', 'SANS — not offering AMT', 'f37-5'], [`[data-slot="${di}.${sc.wi}.0.0.p"]`, 'SC MAIN (standby)', '', 'f37-6']]
  for (const [sel, what, want, tag] of cases) {
    r = await arm(sel, tag)
    const x = one(r.c, K)
    const sansStruck = (r.c.pucks || []).filter(y => y.where === 'SANS Avail' && /SANS/.test(y.printed || ''))
    /* the crew list's own SANS words changed in this build too (walked separately — the brief): struck with words naming
       the event is judged; the exact words are RECORDED (run F37-d read "SANS — offered Fly only, not OFT") */
    const ev = want ? want.split(' ').pop() : ''
    const base = !!r.armed && !!x && (what.startsWith('SC') ? !sansStruck.length : true)
    const ok = !base ? false : want ? (x.struck && /SANS/.test(x.printed || '') && x.printed.includes(ev) ? 'REC' : false) : !/SANS/.test(x.printed || '') && !/SANS/.test(x.title || '')
    W.rec(`F37.${tag.slice(-1)}`, `${what} armed: Kraken ${want ? `struck, words naming ${ev} (Fable's "${want}"; exact words RECORDED)` : 'free (no SANS words)'}${what.startsWith('SC') ? '; no SANS reason for anyone' : ''}; "N free" RECORDED`, ok, `armed ${r.armed} · ${sayAll(r.c)} · free ${freeN(sansHead(r.c))} · Kraken ${say1(r.c, K)}${what.startsWith('SC') ? ' · SANS reasons shown: ' + sansStruck.length : ''}`, r.pic)
  }
  await L.openBoard(p, W, di); await W5.boardDrawer(p, W, true)
  const c9 = await crewAll(p, '#schedBoard')
  const pic9 = await W.pic(p, 'f37-unarmed2')
  await W5.boardDrawer(p, W, false)
  const w9 = await wl(p, W, di, 'f37-w9')
  W.rec('F37.7', 'nothing armed again: no reason line under any SANS man; the warning list still has no SANS line (an unplanned man raises none)', !(c9.pucks || []).some(x => x.where === 'SANS Avail' && x.printed) && !w9.sans.length, `${sayAll(c9)} · ${wSay(w9)}`, pic9 + ', ' + w9.pic)
  /* lesson 32: the crew list said "not offering OFT"; planted there, the warning list must agree */
  const t = await tapIn(p, W, di, `s:${di}.oft.${o.ri}.p`, K, 'f37-plant')
  const l = await day(p, W, di, K, 'f37-plant')
  W.rec('F37.8', 'Kraken planted on the OFT (he offered Fly only): the list says "offered Fly only today. Planned on Sim C37 OFT …" — the crew list and the list agree (exact tail RECORDED)', placedOk(t, K) && sansOf(l).length === 1 && sansOf(l)[0].startsWith('Kraken — SANS: offered Fly only today. Planned on Sim C37 OFT') && hasA(l.s), `notes ${J(t.seen)} · ${lookSay(l, 'Kraken')}`, l.pic)
}

/* ---- A16: one shared offer for two men over three days; its ticks changed, a man removed, dates shortened, deleted ---- */
S.A16 = async (p, W) => {
  await bundleOk(p, W)
  const KR = 'krait', RB = 'romeo'
  const fl = await T.file(p, W, ISO[17], [KR, RB], ['fly'], 'all', 'a16-file', { endIso: ISO[19] })
  need(W, 'set.a16.file', 'Saber files ONE offer for Kraken and Rebel, Fly all day, Fri 17 → Sun 19 (Several people)', !!fl.iid, J(fl.made) + ' ' + (fl.refused || ''), fl.pic)
  const f1 = await flight(p, W, 4, 'C16A F1', '13:00', '14:00'), f2 = await flight(p, W, 4, 'C16A F2', '13:00', '14:00'), f3 = await flight(p, W, 5, 'C16A S', '13:00', '14:00')
  for (const [di, k, id] of [[4, f1.F, KR], [4, f2.F, RB], [5, f3.F, KR]]) { const t = await tapIn(p, W, di, k, id, `a16-in-${di}-${id}`); need(W, `set.a16.${di}.${id}`, `${NAME[id]} tapped into ${k}`, placedOk(t, id), `notes ${J(t.seen)}`, t.notePic) }
  const rd = async tag => { const o = {}; for (const di of [4, 5, 6]) o[di] = await wl(p, W, di, `${tag}-${di}`); return o }
  const ks = o => [4, 5, 6].map(di => `${D3[di]}: ${o[di].sans.filter(r => /^(Kraken|Rebel) /.test(r)).join(' | ') || 'none'}`).join(' · ')
  const kr = (o, di) => o[di].sans.filter(r => /^(Kraken|Rebel) /.test(r)).sort()
  let o = await rd('a16-0')
  W.rec('A16.0', 'covered: no SANS line for Kraken or Rebel on Fri 17, Sat 18, Sun 19 (Sun 19 unplanned)', [4, 5, 6].every(di => !kr(o, di).length), ks(o), [4, 5].map(di => o[di].pic).join(', '))
  let e = await editFiling(p, W, ISO[17], fl.iid, ['o'], 'all', 'a16-oft')
  W.rec('A16.1s', 'the shared offer opened from Fri 17 and changed to OFT only, saved (RECORDED what the window said)', e.ok ? 'REC' : false, `${e.why || ''} ticks ${J(e.form && e.form.ticks)} "${e.said || ''}" · record ${J(await T.inp(p, fl.iid))}`, e.pic)
  o = await rd('a16-1')
  W.rec('A16.1', 'OFT only: Fri 17 Kraken and Rebel "offered OFT only today", Sat 18 Kraken the same, Sun 19 none (unplanned)', J(kr(o, 4)) === J([offered('Kraken', 'OFT', 'C16A F1 (T/O 13:00)'), offered('Rebel', 'OFT', 'C16A F2 (T/O 13:00)')].sort()) && J(kr(o, 5)) === J([offered('Kraken', 'OFT', 'C16A S (T/O 13:00)')]) && !kr(o, 6).length, ks(o), [4, 5].map(di => o[di].pic).join(', '))
  const op = await openL(p, W, ISO[17], fl.iid, 'a16-who')
  let said = ''
  if (op.ok) { said = await Z.X.setWho(p, W, [KR]); const s = await Z.X.saveInp(p, W, 'a16-who'); said += ` · saved "${s.said}" stayed ${s.stayed}`; if (s.stayed) await Z.X.closeInp(p, W) }
  await T.closeAll(p, W)
  o = await rd('a16-2')
  W.rec('A16.2', 'Rebel taken off the shared offer: Fri 17 Rebel "no availability filed", Kraken still "offered OFT only"; Kraken\'s Sat 18 unchanged', J(kr(o, 4)) === J([offered('Kraken', 'OFT', 'C16A F1 (T/O 13:00)'), noFile('Rebel', 'C16A F2 (T/O 13:00)')].sort()) && J(kr(o, 5)) === J([offered('Kraken', 'OFT', 'C16A S (T/O 13:00)')]), `${said} · record ${J(await T.inp(p, fl.iid))} · ${ks(o)}`, [op.pic, o[4].pic].filter(Boolean).join(', '))
  const od = await openL(p, W, ISO[17], fl.iid, 'a16-dates')
  let ds = ''
  /* run A16-d: the saved offer's window draws no calendar; its foot says how its dates change — read and recorded */
  if (od.ok) ds = 'window says "' + (await p.evaluate(() => (((document.querySelector('#inpEditPop') || document.body).innerText || '').match(/To change its dates[^\n]*/) || ['(no such words)'])[0])) + '" · '
  if (od.ok) { ds += (await Z.X.tapWinDate(p, W, ISO[17])) + ' 17, ' + (await Z.X.tapWinDate(p, W, ISO[17])) + ' 17 again'; const f0 = await Z.X.inpRead(p); ds += ` · dates now ${J(f0.dates)}`; const s = await Z.X.saveInp(p, W, 'a16-dates'); ds += ` · saved "${s.said}" stayed ${s.stayed}`; if (s.stayed) await Z.X.closeInp(p, W) }
  await T.closeAll(p, W)
  const rec3 = await T.inp(p, fl.iid)
  o = await rd('a16-3')
  W.rec('A16.3', 'the offer shortened to Fri 17 alone (dates pressed on its own calendar): Sat 18 Kraken now "no availability filed"; Fri 17 unchanged — RECORDED with the record\'s dates', rec3 && !rec3.endDate ? (J(kr(o, 5)) === J([noFile('Kraken', 'C16A S (T/O 13:00)')]) && J(kr(o, 4)) === J([offered('Kraken', 'OFT', 'C16A F1 (T/O 13:00)'), noFile('Rebel', 'C16A F2 (T/O 13:00)')].sort())) : 'REC', `${ds} · record ${J(rec3)} · ${ks(o)}`, [od.pic, o[5].pic].filter(Boolean).join(', '))
  const ox = await openL(p, W, ISO[17], fl.iid, 'a16-del')
  if (ox.ok) { await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700) }
  await T.closeAll(p, W)
  const gone = await p.evaluate(i => !(window.INPUTS || []).some(r => r.iid === i), fl.iid)
  o = await rd('a16-4')
  W.rec('A16.4', 'the offer deleted: Fri 17 Kraken and Rebel, Sat 18 Kraken — each "no availability filed"', gone && J(kr(o, 4)) === J([noFile('Kraken', 'C16A F1 (T/O 13:00)'), noFile('Rebel', 'C16A F2 (T/O 13:00)')].sort()) && J(kr(o, 5)) === J([noFile('Kraken', 'C16A S (T/O 13:00)')]), `deleted ${gone} · ${ks(o)}`, [ox.pic, o[4].pic, o[5].pic].filter(Boolean).join(', '))
}

/* ---- N10: the day's other counts do not move when the line is hidden or flagged again ---- */
S.N10 = async (p, W) => {
  await bundleOk(p, W)
  const di = 4, id = 'cards'
  const f = await flight(p, W, di, 'C10 F', '13:00', '14:00')
  const t = await tapIn(p, W, di, f.R, id, 'n10-in')
  need(W, 'set.n10', 'Fri 17: flight "C10 F" 13:00, Marlin tapped into its back seat (the line raised)', placedOk(t, id), `notes ${J(t.seen)}`, t.notePic)
  const counts = async tag => {
    await L.openBoard(p, W, di); await W5.boardDrawer(p, W, true)
    const heads = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .rh, #schedBoard .rh2')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()))
    await W5.boardDrawer(p, W, false)
    const w = await wl(p, W, di, tag + '-w')
    const av = await avail(p, W, di, tag + '-')
    const sc = await sansCell(p, W, ISO[17], tag + '-sans')
    return { heads, av: av.line, sc: sc.line.split(' · ').slice(0, 4).join(' · '), w, pic: [w.pic, av.pic, sc.pic].filter(Boolean).join(', ') }
  }
  const c0 = await counts('n10-0')
  const h1 = await hideRow(p, W, di, 'Marlin', 'SANS', 'n10-hide')
  const c1 = await counts('n10-1')
  const h2 = await hideRow(p, W, di, 'Marlin', 'SANS', 'n10-flag')
  const c2 = await counts('n10-2')
  const same = (a, b) => J(a.heads) === J(b.heads) && a.av === b.av && a.sc === b.sc
  W.rec('N10.1', 'hiding Marlin\'s SANS line moves none of the day\'s other counts: the crew list\'s headings ("N free"), the Available crew line, the SANS calendar\'s figures', h1.ok && h1.now === true && same(c0, c1), `hide ${J({ was: h1.was, now: h1.now, why: h1.why })} · before ${J({ h: c0.heads, av: c0.av, sc: c0.sc })} · hidden ${J({ h: c1.heads, av: c1.av, sc: c1.sc })} · list ${wSay(c1.w)}`, [h1.pic, c1.pic].filter(Boolean).join(', '))
  W.rec('N10.2', 'flagging it again moves none of them either', h2.ok && h2.now === false && same(c0, c2), `flag ${J({ was: h2.was, now: h2.now })} · again ${J({ h: c2.heads, av: c2.av, sc: c2.sc })} · list ${wSay(c2.w)}`, [h2.pic, c2.pic].filter(Boolean).join(', '))
}

/* ---- PU: the plain-user round ---- */
S.PU = async (p, W) => {
  await bundleOk(p, W)
  await postR(p, W)
  await L.go(p, 'editsched')
  W.rec('PU.1', 'Saber on Edit Schedule', 'REC', '', await W.pic(p, 'pu-1-editsched'))
  const di = 4
  const f = await flight(p, W, di, 'C PU', '13:00', '14:00')
  W.rec('PU.2', 'Fri 17\'s board: + Wave → Flying wave, its line named "C PU", T/O 13:00, landing 14:00', f.wi >= 0, J(f.f), await W.pic(p, 'pu-2-line'))
  const o = await addSimRow(p, W, di, 'oft', 'C PU OFT', '15:00', '16:00')
  W.rec('PU.3', 'an OFT row "C PU OFT" 15:00–16:00', o.ri >= 0, J(o.r), await W.pic(p, 'pu-3-oft'))
  const kO = `s:${di}.oft.${o.ri}.p`
  const drop = async (id, key, tag) => {
    if (W.isPhone) { const t = await tapIn(p, W, di, key, id, tag); return { how: 'tap-to-plan', note: J(t.seen), at: await holdsAt(p, key), pic: t.notePic } }
    await L.openBoard(p, W, di); await W5.boardDrawer(p, W, true)
    const src = p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first()
    const tgt = p.locator(`#schedBoard [data-slot="${key}"]`).first()
    const d = await C.X.dragVia(p, W, src, [tgt], tag)
    return { how: 'dragged from the crew list', note: d.note, at: await holdsAt(p, key), pic: d.npic }
  }
  let d = await drop('cards', f.R, 'pu-4')
  W.rec('PU.4', `Marlin (SANS, nothing filed) dropped into C PU's back seat (${d.how}): placed; the note RECORDED`, String(d.at).includes('cards') ? 'REC' : false, `at "${d.at}" · note ${d.note}`, d.pic)
  d = await drop(RANGER, kO, 'pu-5')
  W.rec('PU.5', `Ranger (SANS from Fri 17, nothing filed) dropped into the OFT's front seat (${d.how}): placed; the note RECORDED`, String(d.at).includes(RANGER) ? 'REC' : false, `at "${d.at}" · note ${d.note}`, d.pic)
  let w = await wl(p, W, di, 'pu-6')
  W.rec('PU.6', 'the day\'s warning list opened: Marlin\'s and Ranger\'s SANS lines', w.sans.some(r => r.startsWith('Marlin — ' + NOFILE)) && w.sans.some(r => r.startsWith('Ranger — ' + NOFILE + 'Sim C PU OFT')), wSay(w), w.pic)
  /* Undo / Redo of the drop BEFORE the hide: run PU-d found a hide and a flag-again are Undo steps of their own */
  await sbUndo(p, W); const u = await holdsAt(p, kO); const wu = await wl(p, W, di, 'pu-9')
  await sbRedo(p, W); const r = await holdsAt(p, kO); const wr = await wl(p, W, di, 'pu-10')
  W.rec('PU.9', 'Undo takes Ranger off the OFT (his line goes), Redo puts him back (his line returns)', !String(u).includes(RANGER) && String(r).includes(RANGER) && !wu.sans.some(x => x.startsWith('Ranger ')) && wr.sans.some(x => x.startsWith('Ranger ')), `undo "${u}" · ${wSay(wu)} · redo "${r}" · ${wSay(wr)}`, wu.pic + ', ' + wr.pic)
  const h1 = await hideRow(p, W, di, 'Marlin', 'SANS', 'pu-7')
  w = await wl(p, W, di, 'pu-7')
  W.rec('PU.7', 'Marlin\'s line hidden by its ✕: struck in place, the count down by one', h1.ok && h1.now === true, `${J({ was: h1.was, now: h1.now, why: h1.why })} · ${wSay(w)}`, [h1.pic, w.pic].filter(Boolean).join(', '))
  const h2 = await hideRow(p, W, di, 'Marlin', 'SANS', 'pu-8')
  w = await wl(p, W, di, 'pu-8')
  W.rec('PU.8', 'and flagged again by its reset: shown again', h2.ok && h2.now === false, `${J({ was: h2.was, now: h2.now })} · ${wSay(w)}`, [h2.pic, w.pic].filter(Boolean).join(', '))
  const ut = await p.locator('#sbUndo').first().getAttribute('title').catch(() => '')
  W.rec('PU.8u', 'the board\'s Undo after the flag-again: what it names (RECORDED)', 'REC', `title "${ut}"`, await W5.clip(p, W, '#sbUndo', 'pu-8u', 80))
  await L.closeBoard(p, W)
  W.rec('PU.10', 'the board closed by ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-10-done'))
  await L.go(p, 'editsched')
  const cp = await C.A.S.crewPanelTo(p, W, 'fri').catch(e => 'ERR ' + e.message)
  W.rec('PU.11', 'Edit Schedule\'s crew panel opened on Fri 17 (on a desktop it is always shown)', 'REC', J(cp), await W.pic(p, 'pu-11-crew'))
  await C.A.S.crewPanelClose(p, W).catch(() => {})
  W.rec('PU.12', 'and closed', 'REC', '', await W.pic(p, 'pu-12-crew-closed'))
  const lg = p.locator('#eLegendBox summary:visible').first()
  if (await lg.count()) {
    await lg.scrollIntoViewIfNeeded(); await W.press(p, lg, 'legend'); await sleep(400)
    const open = await p.evaluate(() => document.querySelector('#eLegendBox').open)
    const aLine = await p.evaluate(() => [...document.querySelectorAll('#eLegend span, #eLegend div')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).find(t => /advisory/i.test(t)) || '')
    W.rec('PU.13', 'the Legend opened (its amber "A" line RECORDED)', open ? 'REC' : false, `"${aLine}"`, await W5.clip(p, W, '#eLegendBox', 'pu-13-legend', 20))
    await W.press(p, p.locator('#eLegendBox summary:visible').first(), 'legend-close'); await sleep(300)
    W.rec('PU.14', 'and closed', !(await p.evaluate(() => document.querySelector('#eLegendBox').open)), '', await W.pic(p, 'pu-14-legend-closed'))
  } else W.rec('PU.13', 'the Legend', 'NW', 'no Legend summary visible', await W.pic(p, 'pu-13-nolegend'))
  await L.openBoard(p, W, di)
  w = await wl(p, W, di, 'pu-15')
  W.rec('PU.15', 'the Scheduler Board for Fri 17 and its issues panel', w.sans.length >= 2, wSay(w), w.pic)
  await L.closeBoard(p, W)
  W.rec('PU.16', 'closed with ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-16-done'))
  const ip = await infoPop(p, W, di, 'pu-17')
  W.rec('PU.17', 'the ⓘ popup of Fri 17 opened: its issues name the same two SANS lines as the list, under the check\'s name (RECORDED)', ip.ok && ip.words.some(x => /Marlin — SANS: no availability filed for today/.test(x)) && ip.words.some(x => /Ranger — SANS: no availability filed for today/.test(x)) ? 'REC' : false, J(ip.words.filter(x => /SANS|issue|advis/i.test(x)).slice(0, 8)), ip.pic)
  const gone = await infoClose(p, W)
  W.rec('PU.18', 'and closed by its Close', gone, '', await W.pic(p, 'pu-18-info-closed'))
  /* as Ranger */
  await Z.asR(p, W)
  await L.go(p, 'viewsched'); await sleep(600)
  const vb = p.locator(`#vWeek [data-daywarn="${di}"]:visible`).first()
  let vw = 'no bar'
  if (await vb.count()) { await vb.scrollIntoViewIfNeeded(); await W.press(p, vb, 'vwarn'); await sleep(400); vw = await p.evaluate(di => { const d = document.querySelector(`#vWeek .day[data-day="${di}"]`) || document; return { bar: ((d.querySelector('.daywarn') || {}).textContent || '').replace(/\s+/g, ' ').trim(), rows: [...d.querySelectorAll('.witem')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()), x: d.querySelectorAll('[data-woff]').length } }, di) }
  const vrow = typeof vw === 'object' ? vw.rows.find(x => /SANS/.test(x)) : null
  const vpic = vrow ? await (async () => { await p.evaluate(() => { const e = [...document.querySelectorAll('#vWeek .witem')].find(x => /SANS/.test(x.textContent)); if (e) e.scrollIntoView({ block: 'center' }) }); await sleep(200); return W.pic(p, 'pu-19-view') })() : await W.pic(p, 'pu-19-view')
  W.rec('PU.19', 'Ranger: View-only Sched, Fri 17\'s warning list opened — the SANS lines as the scheduler\'s list, no ✕ for him (RECORDED)', typeof vw === 'object' && vw.rows.some(x => /SANS/.test(x)) ? 'REC' : false, J(vw), vpic)
  const b = await Z.bell(p, W, 'pu-20-bell')
  W.rec('PU.20', 'Ranger opens the bell: his SANS reminder (RECORDED)', b.rem ? 'REC' : false, Z.sayB(b), b.pic)
  if (b.rem) {
    const t = await Z.X.bellTap(p, W, b.rem.id, 'pu-21')
    W.rec('PU.21', 'the reminder tapped: what it opened (RECORDED)', 'REC', J(t), t.pic)
    await T.closeAll(p, W)
    W.rec('PU.22', 'what it opened, closed', !(await p.locator('[data-testid="win-sansday"]:visible').count()), '', await W.pic(p, 'pu-22-closed'))
  }
}

const fn = S[SCN]
if (!fn) { console.log('no such scenario', SCN); process.exit(1) }
await run(SCN, SZ, fn)
C.saveRaw(`${SCN}-${SZ}-${process.env.SWLC_RUN || 'run1'}`)
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SCN} ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
