// sah-w8-more — walker w8's other scenarios (S3 S4 S5 S15 S17 S20 S21 S23 and the plain-user round), loaded by sah-w8.mjs.
// window.* is only READ (and window.go, the recipes' own page switch).
import path from 'node:path'
const X = await import('./sah-w8-lib.mjs')
const { L, sleep, J, RANGER, HEX } = X
const sansIn = (p, id) => p.evaluate(id => (window.INPUTS || []).filter(r => r.type === 'SANS Availability' && JSON.stringify(r).includes('"' + id + '"')).map(r => r.date + (r.end ? '–' + r.end : '') + '/' + Object.keys(r.sans || {}).filter(k => r.sans[k]).join('')).sort(), id)

/* ---------- S3: several people, different starting dates (Ranger 17, Hex 20) ---------- */
export async function s3(p, W) {
  /* (a) a populated draft on 20 Jul — both picked, Fly/OFT/AMT — its date moved to 17 on its own calendar */
  await X.openSans(p, W)
  const c20 = await X.cellRead(p, '2026-07-20')
  const a = await X.fileOn(p, W, '2026-07-20', { who: [RANGER, HEX], kinds: ['f', 'o', 'a'], date: '2026-07-17', tag: 's3-01', keep: true })
  W.rec('S3-01', 'Saber: 20 Jul → "+ Commitment" → Several people, Ranger + Hex, Fly/OFT/AMT, All day; the date moved to 17 on its own calendar → Add: refused naming Hex\'s start (RECORD the words); nothing saved; both still picked and removable', a.made.length === 0 && a.stayed && /Hex is SANS from Mon 20 Jul/.test(a.said) && a.after && a.after.picked.includes(HEX) && a.after.picked.includes(RANGER), `opened groups ${J(a.opened && a.opened.groups)} · ${a.whoSet} · ${a.dateSet} · form ${J(a.form && { dates: a.form.dates, ticks: a.form.ticks, groups: a.form.groups, why: a.form.why, count: a.form.count })} · said "${a.said}" · after ${J(a.after && { picked: a.after.picked, count: a.after.count, why: a.after.why })} · made ${J(a.made)}`, a.pic)
  if (await X.inpOpen(p)) {
    const w = await X.setWho(p, W, [RANGER])
    const r = await X.inpRead(p)
    const s = await X.saveInp(p, W, 's3-01b')
    W.rec('S3-01b', 'Hex taken out by his own puck, Add again: saved for Ranger alone on 17', s.made.length === 1 && s.made[0].who === RANGER && /Jul 17/.test(s.made[0].date) && !s.stayed, `${w} · picked ${J(r.picked)} "${r.count}" dates ${J(r.dates)} · said "${s.said}" · made ${J(s.made)}`, s.pic)
  } else W.rec('S3-01b', 'Hex taken out, Add again', 'NW', 'the window had closed')
  await X.closeInp(p, W)
  /* (b) 20 Jul for both: saved, each counted once in his own column */
  const b = await X.fileOn(p, W, '2026-07-20', { who: [RANGER, HEX], kinds: ['f', 'o', 'a'], tag: 's3-02' })
  const c20b = await X.cellRead(p, '2026-07-20'), w20 = await X.sansPage(p)
  W.rec('S3-02', 'Saber: 20 Jul, Several people Ranger + Hex, Fly/OFT/AMT → Add: one shared offer; the month\'s F, O and A each up by one pilot and one WSO', b.ok && b.made.length === 1 && /bane/.test(b.made[0].who) && /rocky/.test(b.made[0].who), `said "${b.said}" · made ${J(b.made)} · figs before "${c20.figs}" after "${c20b.figs}" · day list "${w20.win && w20.win.list}"`, b.pic + ', ' + await W.pic(p, 's3-02-day20'))
  /* (c) a fresh window on 17 Jul with Several people: whom the picker offers (Hex is not SANS on 17); 20 for comparison */
  for (const [step, iso, wantHex] of [['S3-03', '2026-07-17', false], ['S3-04', '2026-07-20', true]]) {
    await X.sansDay(p, W, iso)
    await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(400)
    const sw = p.locator('#inpEditPop [data-testid="pp-several"]:visible').first()
    if (await sw.count()) { await W.press(p, sw, 'pp-several'); await sleep(300) }
    const g = await X.inpRead(p)
    W.rec(step, `Saber: a new window on ${iso.slice(8)} Jul, Several people: the picker offers Ranger${wantHex ? ' and Hex' : ', not Hex (SANS from 20)'} (RECORD the groups)`, g.groups.some(x => /bane/.test(x)) && g.groups.some(x => /rocky/.test(x)) === wantHex, `groups (Ranger/Hex only) ${J(g.groups)} · Person list ${J(g.options)}`, await W.pic(p, step.toLowerCase() + '-picker'))
    await X.closeInp(p, W)
  }
  W.rec('S3-05', 'Ranger\'s and Hex\'s SANS availability now (read): Ranger 17 + 20; Hex 20 only', null, `Ranger ${J(await sansIn(p, RANGER))} · Hex ${J(await sansIn(p, HEX))}`, await W.pic(p, 's3-05-month'))
}

/* ---------- S4: a run across the SANS boundary (Ranger 17) — as Ranger, then as Saber (world A each, fresh) ---------- */
async function runTry(p, W, label, how, who) {
  /* how: ['drag', a, b] | ['keys', from, steps] | ['start', open, newStart] */
  let r
  if (how[0] === 'drag') r = await X.dragDays(p, W, how[1], how[2])
  else if (how[0] === 'keys') r = await X.keysRun(p, W, how[1], how[2])
  else {
    const pg = await X.sansDay(p, W, how[1])
    if (!pg.win || pg.win.add !== 'enabled') return { label, opened: false, why: 'greyed' }
    await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(300)
    await X.tapWinDate(p, W, how[2])
    r = { opened: true, r: await X.inpRead(p) }
  }
  const picPre = await W.pic(p, label + '-after-gesture')
  if (!r.opened) {
    const said = X.clean(await p.locator('#toastEl').first().textContent().catch(() => ''))
    return { label, opened: false, said, picked: r.picked, pic: picPre }
  }
  const opts = (r.r && r.r.options) || []
  const whoSet = who ? await X.setWho(p, W, who) : 'his own'
  await X.setKinds(p, W, ['f'])
  const form = await X.inpRead(p)
  const fpic = await W.pic(p, label + '-form')
  /* Ranger not offered in the Person box: Add is not pressed (it would file the man the box came with) */
  if (who && /not offered/.test(whoSet)) { await X.closeInp(p, W); return { label, opened: true, notOffered: true, whoSet, options: opts, form: { person: form.person, dates: form.dates }, said: '', made: [], picked: r.picked, pic: picPre + ', ' + fpic } }
  const s = await X.saveInp(p, W, label)
  await X.closeInp(p, W)
  return { label, opened: true, whoSet, form: { person: form.person, dates: form.dates }, said: s.said, stayed: s.stayed, made: s.made, picked: r.picked, pic: picPre + ', ' + fpic + ', ' + s.pic }
}
export async function s4(p, W, role) {
  const who = role === 'saber' ? RANGER : null
  if (role === 'ranger') await X.as(p, W, 'us', 'us')
  await X.openSans(p, W)
  /* the early runs first (each touches 16–18), the wholly eligible run 17–20 last, so no one-a-day refusal clouds them */
  const tries = [['s4-02', ['drag', '2026-07-16', '2026-07-18']], ['s4-03', ['drag', '2026-07-18', '2026-07-16']]]
  if (!W.isPhone) tries.push(['s4-04', ['keys', '2026-07-16', 2]], ['s4-05', ['keys', '2026-07-18', -2]])
  tries.push(['s4-06', ['start', '2026-07-18', '2026-07-16']], ['s4-01', ['drag', '2026-07-17', '2026-07-20']])
  for (const [label, how] of tries) {
    const r = await runTry(p, W, label, how, who)
    const days = how[0] === 'drag' ? `${how[1].slice(8)}→${how[2].slice(8)}` : how[0] === 'keys' ? `${how[1].slice(8)} Shift+${how[2] > 0 ? '→' : '←'}×${Math.abs(how[2])} Enter` : `opened ${how[1].slice(8)}, start moved to ${how[2].slice(8)}`
    const early = !(how[0] === 'drag' && how[1] === '2026-07-17')
    const savedEarly = (r.made || []).some(m => /Jul 16/.test(m.date) || /Jul 16/.test(m.end || ''))
    let ok
    if (!early) ok = r.opened && (r.made || []).length === 1
    else if (r.notOffered) ok = 'REC'
    else ok = !savedEarly && (r.opened ? (r.made || []).length === 0 && /SANS from Fri 17 Jul/.test(r.said || '') : !!r.said)
    W.rec(label, `${role === 'saber' ? 'Saber' : 'Ranger'}: ${how[0] === 'drag' ? (W.touchCdp ? 'a finger held, then dragged (Chromium phone, CDP)' : 'a mouse drag') : how[0] === 'keys' ? 'the keys' : 'the start date changed in the window'} ${days}${who ? ' (Person Ranger)' : ''} → ${early ? 'part before 17: refused naming 17, or no window WITH words; never an early day saved (RECORD)' : 'all from 17: saved'}`, ok, `window ${r.opened ? 'opened ' + J(r.form) : 'did NOT open'}${r.picked ? ' · days lit by the gesture ' + J(r.picked) : ''}${who ? ' · Person box: ' + (r.whoSet || '') + (r.notOffered ? ' (offered: ' + J(r.options) + ') — Add not pressed' : '') : ''} · said "${r.said || ''}" · made ${J(r.made || [])}`, r.pic)
  }
  W.rec('s4-07', 'Ranger\'s SANS availability at the end (read): no day before 17', null, J(await sansIn(p, RANGER)), await W.pic(p, 's4-07-month'))
  const c16 = await X.cellRead(p, '2026-07-16')
  W.rec('s4-08', 'nothing shows or counts on 16 Jul for Ranger', !(await sansIn(p, RANGER)).some(s => /Jul 16/.test(s)), `16 figs "${c16.figs}"`)
}

/* ---------- S5: the ordinary Inputs doors; a man with no SANS status (world N: Hex from 20, Ranger nothing) ---------- */
async function typeList(p, W, door, tag) {
  await L.go(p, 'inputs')
  if (await p.locator('#inSansMode[aria-pressed="true"], #inSansMode.on').count()) { const t = p.locator('#inInputsMode:visible, [data-testid="in-tab-inputs"]:visible').first(); if (await t.count()) await W.press(p, t, 'inputs-tab') }
  if (door === 'list') { await W.press(p, '#inListBtn:visible', 'list'); await sleep(400); await W.press(p, '#inNew:visible', 'in-new') }
  else {
    await W.press(p, '#inCalBtn:visible', 'cal'); await sleep(500)
    const d = p.locator('[data-icday="2026-07-20"]:visible').first()
    if (W.isPhone) await d.tap({ position: { x: 6, y: 6 } }); else await d.click({ position: { x: 6, y: 6 } })
    await sleep(600)
    await W.press(p, '#icPopAdd:visible', 'ic-add')
  }
  await p.waitForSelector('#inpEditPop', { timeout: 6000 }).catch(() => {}); await sleep(400)
  const types = await p.evaluate(() => { const s = document.querySelector('#inpEditType'); return s ? [...s.querySelectorAll('option, optgroup')].map(o => o.tagName === 'OPTGROUP' ? '[' + o.label + ']' : o.textContent.trim()) : ['(no Type box) ' + ((document.querySelector('#inpEditTypeFixed') || {}).textContent || '')] })
  const pic = await W.pic(p, tag)
  await X.closeInp(p, W)
  /* the Inputs calendar's opened day (it stands over the page on a phone) closed by its own ✕ */
  const dx = p.locator('.floatwin:visible .win-x').first()
  if (await dx.count()) { await W.press(p, dx, 'day-x'); await sleep(400) }
  return { types, pic }
}
export async function s5(p, W) {
  for (const who of ['ranger', 'saber']) {
    if (who === 'ranger') await X.as(p, W, 'us', 'us'); else await X.as(p, W, 'ad', 'a')
    for (const door of ['cal', 'list']) {
      const t = await typeList(p, W, door, `s5-${who}-${door}`)
      W.rec(`S5-${who}-${door}`, `${who === 'ranger' ? 'Ranger' : 'Saber'}: Inputs → ${door === 'cal' ? 'Calendar → 20 Jul → + Input' : 'List → + Input'}: the Type list does not offer SANS Availability (RECORD the choices)`, !t.types.some(x => /SANS/i.test(x)), J(t.types), t.pic)
    }
    await X.openSans(p, W)
    const d20 = await X.sansDay(p, W, '2026-07-20')
    if (who === 'ranger') {
      W.rec('S5-ranger-sans', 'Ranger (no SANS tick, no posting): 20 Jul\'s "+ Commitment" greyed; the month not faded for him', !!d20.win && d20.win.add === 'greyed' && (await X.cellsBefore(p, '2026-07-01', '2026-07-31')).length === 0, `${J(d20.win && { add: d20.win.add, why: d20.win.addwhy })} · faded ${J(await X.cellsBefore(p, '2026-07-01', '2026-07-31'))}`, await W.pic(p, 's5-ranger-sans'))
      await X.sansX(p, W)
    } else {
      for (const iso of ['2026-07-20', '2026-07-17']) {
        const pg = await X.sansDay(p, W, iso)
        await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(400)
        const r = await X.inpRead(p)
        const pic = await W.pic(p, 's5-saber-people-' + iso.slice(8))
        let sev = null
        if (await p.locator('#inpEditPop [data-testid="pp-several"]:visible').count()) { await W.press(p, '#inpEditPop [data-testid="pp-several"]', 'pp-several'); await sleep(300); sev = await X.inpRead(p) }
        const hasR = r.options.includes('Ranger') || (sev && sev.groups.some(g => /bane/.test(g))), hasH = r.options.includes('Hex') || (sev && sev.groups.some(g => /rocky/.test(g)))
        W.rec('S5-saber-' + iso.slice(8), `Saber: ${iso.slice(8)} Jul → "+ Commitment": whom he may pick — Ranger never; Hex ${iso === '2026-07-20' ? 'offered (SANS from 20)' : 'RECORD (not SANS on 17)'}`, !hasR && (iso === '2026-07-20' ? hasH : true), `Person box ${J(r.options)} · several-people groups (Ranger/Hex) ${J(sev && sev.groups)} · Hex ${hasH ? 'offered' : 'not offered'}`, pic)
        await X.closeInp(p, W)
      }
      await X.sansX(p, W)
    }
  }
}

/* ---------- S15: the early bell, shrinking, its destination (world A: Ranger planned 18, 20 (+ demo 20, 23)) ---------- */
export async function s15(p, W) {
  await L.gotoWeek(p, W, '2026-07-20')
  const wk20 = await X.holds(p, RANGER)
  await L.gotoWeek(p, W, '2026-07-13')
  W.rec('S15-00', 'Ranger\'s planned days (read, both weeks): 13 Jul week + 20 Jul week', null, `${await X.holds(p, RANGER)} || ${wk20}`)
  const sb = await X.bellRead(p, W, 's15-00-saber')
  W.rec('S15-01', 'Saber\'s own bell: no line of Ranger\'s reminder', !sb.sans.some(l => /bane/.test(l.id)), X.bellWords(sb), sb.pic)
  await X.bellShut(p)
  await X.as(p, W, 'us', 'us')
  let b = await X.bellRead(p, W, 's15-02')
  let l = b.due[0]
  const WANT1 = "You're SANS from Fri 17 Jul. You're planned on Sat 18, Mon 20, Thu 23 Jul with nothing filed. Tap to file."
  W.rec('S15-02', `Ranger, Wed 15 (before Friday): one unread line, its words exactly "${WANT1}" (planned 18, 20, 23: the BRIEF on Sat 18; Mon 20 two flights and the BRIEF; Thu 23 the demo Meeting)`, b.due.length === 1 && !!l && l.text === WANT1 && l.unread && b.lit === true, X.bellWords(b) + ` · line box ${l && l.w}px, right ${l && l.right} of ${p.viewportSize().width}`, b.pic)
  if (!l) return
  const t1 = await X.bellTap(p, W, l.id, 's15-03')
  W.rec('S15-03', 'its tap: the SANS calendar, July, Sat 18\'s day open, on screen', t1.page === 'inputs' && /JUL[A-Z]* 2026/i.test(t1.month) && t1.win && /Sat 18 Jul/.test(t1.win.ttl) && t1.win.inScreen && t1.win.topIsWin, J({ page: t1.page, month: t1.month, win: t1.win && { ttl: t1.win.ttl, add: t1.win.add, inScreen: t1.win.inScreen, top: t1.win.topIsWin } }), t1.pic)
  const f18 = await X.fileOn(p, W, '2026-07-18', { kinds: ['f'], tag: 's15-04' })
  W.rec('S15-04', 'he files Sat 18 (+ Commitment, Fly, All day, Add)', f18.ok, `said "${f18.said}" · made ${J(f18.made)}`, f18.pic)
  await X.sansX(p, W)
  b = await X.bellRead(p, W, 's15-05'); l = b.due[0]
  const WANT2 = "You're SANS from Fri 17 Jul. You're planned on Mon 20, Thu 23 Jul with nothing filed. Tap to file."
  W.rec('S15-05', `the line shrinks: "${WANT2}"; read (he tapped it)`, b.due.length === 1 && !!l && l.text === WANT2, X.bellWords(b), b.pic)
  if (!l) return
  const t2 = await X.bellTap(p, W, l.id, 's15-06')
  W.rec('S15-06', 'its tap now opens Mon 20 Jul', t2.win && /Mon 20 Jul/.test(t2.win.ttl), J({ month: t2.month, win: t2.win && t2.win.ttl }), t2.pic)
  const f20 = await X.fileOn(p, W, '2026-07-20', { kinds: ['f'], tag: 's15-07' })
  const f23 = await X.fileOn(p, W, '2026-07-23', { kinds: ['f'], tag: 's15-07b' })
  W.rec('S15-07', 'he files Mon 20 and Thu 23', f20.ok && f23.ok, `20 "${f20.said}" ${J(f20.made)} · 23 "${f23.said}" ${J(f23.made)}`, f23.pic)
  await X.sansX(p, W)
  b = await X.bellRead(p, W, 's15-08')
  W.rec('S15-08', 'every planned day filed: the reminder is gone (nothing struck either)', b.sans.length === 0, X.bellWords(b), b.pic)
  await X.bellShut(p)
  await X.as(p, W, 'ad', 'a')
  const sb2 = await X.bellRead(p, W, 's15-09-saber')
  W.rec('S15-09', 'Saber\'s bell still holds no line of Ranger\'s reminder', !sb2.sans.some(x => /bane/.test(x.id)), X.bellWords(sb2), sb2.pic)
}

/* ---------- S17: longer lists, read state, repeated changes (world C: planned 18, 20, 21, 23, 24) ---------- */
export async function s17(p, W) {
  await X.as(p, W, 'us', 'us')
  let b = await X.bellRead(p, W, 's17-01'); let l = b.due[0]
  const W1 = "You're SANS from Fri 17 Jul. You're planned on Sat 18, Mon 20, Tue 21 Jul and 2 more with nothing filed. Tap to file."
  W.rec('S17-01', 'five planned days: the first three in order, then "and 2 more" (RECORD the exact words)', !!l && /Sat 18, Mon 20, Tue 21 Jul/.test(l.text) && /and 2 more/.test(l.text), X.bellWords(b) + ` · expected like "${W1}"`, b.pic)
  if (!l) return
  const t = await X.bellTap(p, W, l.id, 's17-02')
  W.rec('S17-02', 'tapped (read): opens Sat 18', t.win && /Sat 18/.test(t.win.ttl), J(t.win && t.win.ttl), t.pic)
  const fa = await X.fileOn(p, W, '2026-07-18', { kinds: ['f'], tag: 's17-03a' })
  const fb = await X.fileOn(p, W, '2026-07-21', { kinds: ['f'], tag: 's17-03b' })
  await X.sansX(p, W)
  b = await X.bellRead(p, W, 's17-03'); l = b.due[0]
  W.rec('S17-03', 'filed 18 and 21: the line now "Mon 20, Thu 23, Fri 24 Jul", no "more"; still read', fa.ok && fb.ok && !!l && /You're planned on Mon 20, Thu 23, Fri 24 Jul with nothing filed/.test(l.text) && !l.unread, X.bellWords(b), b.pic)
  await X.bellShut(p)
  await L.reload(p, 'us', 'us')
  b = await X.bellRead(p, W, 's17-04'); l = b.due[0]
  W.rec('S17-04', 'after a reload: the same words, still read', !!l && /Mon 20, Thu 23, Fri 24 Jul/.test(l.text) && !l.unread, X.bellWords(b), b.pic)
  await X.bellShut(p)
  /* a newly planned day while his line is read: Saber names him on Wed 22 (BRIEF 13:00–14:00) */
  await X.as(p, W, 'ad', 'a')
  const r22 = await X.row(p, W, '2026-07-20', 2, 'BRIEF', '13:00', '14:00', RANGER)
  await L.gotoWeek(p, W, '2026-07-13')
  await X.as(p, W, 'us', 'us')
  b = await X.bellRead(p, W, 's17-05'); l = b.due[0]
  W.rec('S17-05', 'Saber names Ranger on Wed 22 too: whether his read line lights again (RECORD — an open question to the owner)', 'REC', `row ${r22.ok ? 'added' : 'NOT added'} · ${X.bellWords(b)} → ${l ? (l.unread ? 'UNREAD again (relit)' : 'stays read') : 'no line'}`, b.pic)
  await X.bellShut(p)
  /* the posting moved later, to Tue 21: 18 is hidden (filed), 21 stays */
  await X.as(p, W, 'ad', 'a')
  const s = await X.poSheet(p, W, RANGER, '2026-07-17', 's17-06')
  const mv = s.kind === 'NO CELL' ? 'no cell' : await X.poMove(p, W, '2026-07-21')
  const pic6 = await W.pic(p, 's17-06-moved')
  await X.poClose(p, W)
  W.rec('S17-06', `Saber: Ranger's posting (${s.kind}) moved to Tue 21 on its sheet`, /21 Jul/.test(mv), `before "${s.line}" · after "${mv}"`, s.pic + ', ' + pic6)
  await X.as(p, W, 'us', 'us')
  const b1 = await X.bellRead(p, W, 's17-07')
  W.rec('S17-07', 'Ranger\'s bell: his old line struck, "taken back · Saber", then "Your SANS availability for Sat 18 Jul is hidden while you\'re not SANS that day." (RECORD the whole; and any new line from 21)', b1.back.length === 1 && /taken back · Saber/.test(b1.back[0].text) && /Your SANS availability for Sat 18 Jul is hidden while you're not SANS that day\./.test(b1.back[0].text) && !/Tue 21 Jul is hidden/.test(b1.back[0].text), X.bellWords(b1), b1.pic)
  await X.bellShut(p)
  /* the sheet reopened and closed unchanged: nothing doubles */
  await X.as(p, W, 'ad', 'a')
  const s2 = await X.poSheet(p, W, RANGER, '2026-07-21', 's17-08')
  await X.poClose(p, W)
  await X.as(p, W, 'us', 'us')
  const b2 = await X.bellRead(p, W, 's17-08')
  W.rec('S17-08', `Saber reopened the sheet (${s2.kind}, "${s2.line}") and closed it unchanged: Ranger's bell the same — no second take-back`, J(b2.sans.map(x => x.id + x.text)) === J(b1.sans.map(x => x.id + x.text)), X.bellWords(b2), b2.pic)
  await X.bellShut(p)
  await L.reload(p, 'us', 'us')
  const b3 = await X.bellRead(p, W, 's17-09')
  W.rec('S17-09', 'after a reload: the same lines, the same read state', J(b3.sans.map(x => x.id + x.text + x.unread)) === J(b2.sans.map(x => x.id + x.text + x.unread)), X.bellWords(b3), b3.pic)
  await X.bellShut(p)
}
/* S17's months: world D (Ranger from 17; planned 18, 20 (demo), 23 (demo), Fri 31 Jul, Mon 3 Aug) — 18, 20, 23 filed first */
export async function s17m(p, W) {
  await X.as(p, W, 'us', 'us')
  let b = await X.bellRead(p, W, 's17m-01')
  W.rec('S17m-01', 'before filing (RECORD)', 'REC', X.bellWords(b), b.pic)
  await X.bellShut(p)
  await X.openSans(p, W)
  const f = []
  for (const iso of ['2026-07-18', '2026-07-20', '2026-07-23']) { const r = await X.fileOn(p, W, iso, { kinds: ['f'], tag: 's17m-f' + iso.slice(8) }); f.push(iso.slice(8) + (r.ok ? ' filed' : ' NOT: ' + (r.why || r.said))) }
  await X.sansX(p, W)
  b = await X.bellRead(p, W, 's17m-02'); const l = b.due[0]
  W.rec('S17m-02', 'filed 18, 20, 23: the line names "Fri 31 Jul, Mon 3 Aug" — each month named right', !!l && /You're planned on Fri 31 Jul, Mon 3 Aug with nothing filed\./.test(l.text), `${f.join(' · ')} · ${X.bellWords(b)}`, b.pic)
  if (l) {
    const t = await X.bellTap(p, W, l.id, 's17m-03')
    W.rec('S17m-03', 'its tap: the SANS calendar on July, Fri 31 open', t.win && /Fri 31 Jul/.test(t.win.ttl) && /JUL/i.test(t.month), J({ month: t.month, win: t.win && t.win.ttl }), t.pic)
  }
}

/* ---------- S20: midnight with the calendar open (world A; Ranger) ---------- */
export async function s20(p, W) {
  await X.as(p, W, 'us', 'us')
  const t0 = await L.moveTo(p, W, '2026-07-16T23:59:50', 'us', 'us')
  await X.openSans(p, W); await X.sansGoto(p, W, '2026-07-16')
  const f0 = await X.cellsBefore(p, '2026-07-01', '2026-07-31')
  W.rec('S20-01', `Thu 16 Jul 23:59:50 (${t0}, setSystemTime + reload): the SANS month open, 1–16 faded`, f0.length === 16 && f0[15] === '16', `faded ${J(f0)}`, await W.pic(p, 's20-01'))
  await p.clock.fastForward(12000); await sleep(1800)
  let t1 = await L.today(p), f1 = await X.cellsBefore(p, '2026-07-01', '2026-07-31')
  if (f1.length) { await p.clock.runFor(65000); await sleep(1500); t1 = await L.today(p); f1 = await X.cellsBefore(p, '2026-07-01', '2026-07-31') }
  W.rec('S20-02', `the clock fast-forwarded past midnight, no reload, nothing pressed (${t1}): the fade gone`, f1.length === 0, `faded ${J(f1)} · 16 cell ${J(await X.cellRead(p, '2026-07-16').then(c => ({ b: c.before, op: c.kidOpacity })))}`, await W.pic(p, 's20-02'))
  const d17 = await X.sansDay(p, W, '2026-07-17')
  W.rec('S20-03', 'opens 17 Jul: "+ Commitment" offered', d17.win && d17.win.add === 'enabled', J(d17.win && { ttl: d17.win.ttl, add: d17.win.add }), await W.pic(p, 's20-03'))
  const d16 = await X.sansDay(p, W, '2026-07-16')
  W.rec('S20-04', 'opens 16 Jul: still greyed, though no longer faded', d16.win && d16.win.add === 'greyed', J(d16.win && { ttl: d16.win.ttl, add: d16.win.add, why: d16.win.addwhy }), await W.pic(p, 's20-04'))
  await X.sansX(p, W)
  const b = await X.bellRead(p, W, 's20-05')
  W.rec('S20-05', 'his bell: one reminder line, no duplicate, no negative or odd age', b.due.length === 1 && !/-/.test(b.due[0].ago), X.bellWords(b), b.pic)
  await X.bellShut(p)
  await L.reload(p, 'us', 'us')
  await X.openSans(p, W)
  const f2 = await X.cellsBefore(p, '2026-07-01', '2026-07-31')
  const b2 = await X.bellRead(p, W, 's20-06')
  W.rec('S20-06', `reopened (reload, ${await L.today(p)}): the same — no fade, one line`, f2.length === 0 && b2.due.length === 1, `faded ${J(f2)} · ${X.bellWords(b2)}`, b2.pic)
  W.rec('S20-07', 'the page BACKGROUNDED across midnight', 'NW', 'cannot be walked in a test browser: it keeps a background tab "visible" (the brief, S20)')
}

/* ---------- S21: the date moved earlier, later, taken back (world B: Ranger from 20) ---------- */
async function rangerLook(p, W, tag, want) {
  await X.as(p, W, 'us', 'us')
  await X.openSans(p, W); await X.sansGoto(p, W, '2026-07-16')
  const f = await X.cellsBefore(p, '2026-07-01', '2026-07-31')
  const res = { faded: f.length ? `${f[0]}–${f[f.length - 1]} (${f.length})` : 'none' }
  for (const d of want.days) { const w = await X.sansDay(p, W, '2026-07-' + d); res[d] = w.win ? w.win.add : 'no window' }
  await X.sansX(p, W)
  const pic = await W.pic(p, tag)
  await X.as(p, W, 'ad', 'a')
  return { res, pic }
}
export async function s21(p, W) {
  let r = await rangerLook(p, W, 's21-00', { days: ['19', '20'] })
  W.rec('S21-00', 'start: Ranger from Mon 20 — faded 01–19; 19 greyed, 20 offered', r.res.faded === '01–19 (19)' && r.res['19'] === 'greyed' && r.res['20'] === 'enabled', J(r.res), r.pic)
  for (const [step, from, to, want] of [['S21-01', '2026-07-20', '2026-07-17', { faded: '01–16 (16)', g: '16', e: '17' }], ['S21-02', '2026-07-17', '2026-07-21', { faded: '01–20 (20)', g: '20', e: '21' }]]) {
    const s = await X.poSheet(p, W, RANGER, from, step.toLowerCase())
    const mv = s.kind === 'NO CELL' ? 'no cell' : await X.poMove(p, W, to)
    const pic = await W.pic(p, step.toLowerCase() + '-moved')
    await X.poClose(p, W)
    r = await rangerLook(p, W, step.toLowerCase() + '-ranger', { days: [want.g, want.e] })
    W.rec(step, `Saber moves the posting (${s.kind}) ${from.slice(8)} → ${to.slice(8)}; Ranger signs in: faded ${want.faded}, ${want.g} greyed, ${want.e} offered`, r.res.faded === want.faded && r.res[want.g] === 'greyed' && r.res[want.e] === 'enabled', `sheet before "${s.line}" after "${mv}" · Ranger ${J(r.res)}`, s.pic + ', ' + pic + ', ' + r.pic)
  }
  const s = await X.poSheet(p, W, RANGER, '2026-07-21', 's21-03')
  if (s.kind !== 'NO CELL') await X.poUndo(p, W)
  const pic = await W.pic(p, 's21-03-undone')
  await X.poClose(p, W)
  r = await rangerLook(p, W, 's21-03-ranger', { days: ['21', '24'] })
  W.rec('S21-03', 'Saber: Undo post out; Ranger: no fade, "+ Commitment" greyed on 21 and 24 (no new SANS filings)', r.res.faded === 'none' && r.res['21'] === 'greyed' && r.res['24'] === 'greyed', `sheet "${s.line}" · Ranger ${J(r.res)}`, s.pic + ', ' + pic + ', ' + r.pic)
  W.rec('S21-04', 'the posting changed while Ranger\'s own calendar stays open in another tab', 'NW', 'cannot be walked: two tabs do not share live changes (the brief, S21) — walked signing in as each in turn')
}

/* ---------- S23: who may file whom (world A) ---------- */
export async function s23(p, W) {
  await X.as(p, W, 'us', 'us')
  await X.openSans(p, W)
  const own = await X.fileOn(p, W, '2026-07-21', { kinds: ['f'], tag: 's23-01' })
  W.rec('S23-01', 'Ranger files his own Tue 21: saved, his', own.ok && own.made[0].who === RANGER, `opened ${J(own.opened && { person: own.opened.person, several: own.opened.several, options: own.opened.options })} · said "${own.said}" · made ${J(own.made)}`, own.pic)
  await X.sansDay(p, W, '2026-07-22')
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(400)
  const r = await X.inpRead(p)
  const pic = await W.pic(p, 's23-02-own-window')
  await X.closeInp(p, W)
  W.rec('S23-02', 'Ranger\'s own "+ Commitment" on 22: no Person box, no "Several people" — he cannot pick Hex', /^fixed Ranger/.test(r.person) && r.several === 'no switch' && !r.options.length, J({ person: r.person, several: r.several, options: r.options }), pic)
  await X.as(p, W, 'ad', 'a')
  await X.openSans(p, W)
  const h = await X.fileOn(p, W, '2026-07-20', { who: HEX, kinds: ['o'], tag: 's23-03' })
  const h2 = await X.fileOn(p, W, '2026-07-22', { who: [RANGER, HEX], kinds: ['f'], tag: 's23-04' })
  W.rec('S23-03', 'Saber files Hex alone (Mon 20, OFT) and both together (Wed 22, Several people): both saved', h.ok && h.made[0].who === HEX && h2.ok && /bane/.test(h2.made[0] && h2.made[0].who) && /rocky/.test(h2.made[0] && h2.made[0].who), `Hex: "${h.said}" ${J(h.made)} · both: "${h2.said}" ${J(h2.made)}`, h.pic + ', ' + h2.pic)
  await X.as(p, W, 'us', 'us')
  await X.openSans(p, W)
  const o = h.made[0] ? await X.openLine(p, W, '2026-07-20', h.made[0].iid, 's23-05') : { ok: false }
  W.rec('S23-05', 'Ranger opens Hex\'s offer on Mon 20: read only — no Save, no Delete', o.ok && !o.r.save && !o.r.del, J(o.r && { person: o.r.person, ro: o.r.ro, save: o.r.save, del: o.r.del }), o.pic)
  await X.closeInp(p, W)
  const sh = h2.made[0] ? await X.openLine(p, W, '2026-07-22', h2.made[0].iid, 's23-06') : { ok: false }
  W.rec('S23-06', 'Ranger opens the shared offer (him + Hex) on Wed 22: he cannot change it for Hex (RECORD what it offers)', 'REC', J(sh.r && { person: sh.r.person, several: sh.r.several, picked: sh.r.picked, ro: sh.r.ro, save: sh.r.save, del: sh.r.del }), sh.pic)
  await X.closeInp(p, W)
}

/* ---------- the plain-user round (§7.0a) ---------- */
export async function pu(p, W) {
  /* as Ranger: the bell, each way of closing it, its line's tap */
  await X.as(p, W, 'us', 'us')
  for (const how of ['escape', 'bell', 'outside']) {
    const b = await X.bellRead(p, W, 'pu-bell-' + how)
    const said = await X.bellShut(p, how, W)
    W.rec('PU-bell-' + how, `Ranger: the bell opened (${b.due.length} reminder) and closed by ${how === 'bell' ? 'the bell again' : how === 'outside' ? 'a tap outside' : 'Escape'}`, b.due.length === 1 && said === 'closed', `${said} · ${X.bellWords(b)}`, b.pic + ', ' + await W.pic(p, 'pu-bell-' + how + '-closed'))
  }
  const b = await X.bellRead(p, W, 'pu-01')
  const t = await X.bellTap(p, W, b.due[0].id, 'pu-02')
  W.rec('PU-02', 'its tap: the SANS day window on Sat 18, on screen', t.win && /Sat 18/.test(t.win.ttl) && t.win.inScreen, J(t.win && { ttl: t.win.ttl, box: t.win.box }), t.pic)
  /* the day window: ✕, Escape, a tap outside (D641: it stays — the page behind works), the phone's pull-up bar */
  let r = await X.sansX(p, W, 'x')
  W.rec('PU-03', 'the day window closed by its ✕', r === 'closed', r, await W.pic(p, 'pu-03'))
  await X.sansDay(p, W, '2026-07-18'); r = await X.sansX(p, W, 'esc')
  W.rec('PU-04', 'reopened, closed by Escape', r === 'closed', r, await W.pic(p, 'pu-04'))
  await X.sansDay(p, W, '2026-07-18')
  const vp = p.viewportSize()
  const pt = W.isPhone ? [20, 200] : [200, 200]
  const topAt = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.testid || e.className || e.tagName) : 'none' }, pt)
  if (W.isPhone) await p.touchscreen.tap(...pt); else await p.mouse.click(...pt)
  await sleep(500)
  const after = await X.sansPage(p)
  W.rec('PU-05', `reopened, a tap outside it (at ${pt}, on "${String(topAt).slice(0, 40)}"): RECORD — D641 says the window stays and the page behind acts`, 'REC', `window ${after.win ? 'still open: ' + after.win.ttl : 'closed'}`, await W.pic(p, 'pu-05'))
  if (W.isPhone && after.win) {
    const bar = p.locator('[data-testid="win-sansday"] .win-bar').first()
    const h0 = after.win.box[3]
    await W.press(p, bar, 'pullbar'); await sleep(600)
    const h1 = (await X.sansPage(p)).win
    await W.press(p, bar, 'pullbar2'); await sleep(600)
    const h2 = (await X.sansPage(p)).win
    W.rec('PU-06', 'the phone\'s pull-up bar: a tap brings the day down to about two-thirds, another back up', !!h1 && !!h2 && h1.box[3] < h0 && h2.box[3] > h1.box[3], `heights ${h0} → ${h1 && h1.box[3]} → ${h2 && h2.box[3]} of ${vp.height}`, await W.pic(p, 'pu-06'))
  }
  if (!(await X.sansPage(p)).win) await X.sansDay(p, W, '2026-07-18')
  /* "+ Commitment": Cancel, ✕, Escape, then save; open it and delete it */
  for (const how of ['cancel', 'x', 'esc']) {
    await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add'); await p.waitForSelector('#inpEditPop'); await sleep(400)
    const pic0 = await W.pic(p, 'pu-07-' + how + '-open')
    if (how === 'cancel') await W.press(p, '#inpEditCancel:visible', 'inp-cancel')
    else if (how === 'x') { const x = p.locator('#inpEditClose:visible, .floatwin:has(#inpEditPop) .win-x:visible').first(); await W.press(p, x, 'inp-x') }
    else await p.keyboard.press('Escape')
    await sleep(500)
    const ask = await p.locator('[data-testid="inped-escask"]:visible').count()
    const open = await X.inpOpen(p)
    W.rec('PU-07-' + how, `the commitment window (untouched) closed by ${how === 'cancel' ? 'Cancel' : how === 'x' ? 'its ✕' : 'Escape'}; the day window behind as it was`, !open && !ask && !!(await X.sansPage(p)).win, `window ${open ? 'STILL OPEN' : 'closed'}${ask ? ' · asked to lose changes' : ''} · day behind ${(await X.sansPage(p)).win ? 'open' : 'closed'}`, pic0 + ', ' + await W.pic(p, 'pu-07-' + how))
    if (open) await X.closeInp(p, W)
  }
  const f = await X.fileOn(p, W, '2026-07-18', { kinds: ['f', 'o'], tag: 'pu-08' })
  W.rec('PU-08', 'saved: Fly + OFT, All day', f.ok, `"${f.said}" ${J(f.made)}`, f.pic)
  if (f.made[0]) {
    const o = await X.openLine(p, W, '2026-07-18', f.made[0].iid, 'pu-09')
    const dl = o.ok && o.r.del ? (await W.press(p, '#inpEditDel:visible', 'delete'), await sleep(700), X.clean(await p.locator('#toastEl').first().textContent().catch(() => ''))) : 'no Delete'
    const gone = await p.evaluate(i => !(window.INPUTS || []).some(r => r.iid === i), f.made[0].iid)
    W.rec('PU-09', 'opened from its day, deleted by its Delete: gone from the day and the store', o.ok && gone, `window ${J(o.r && { person: o.r.person, save: o.r.save, del: o.r.del })} · said "${dl}" · gone ${gone}`, o.pic + ', ' + await W.pic(p, 'pu-09-deleted'))
  }
  await X.sansX(p, W)
  /* as Saber: the Post out sheet — open, ✕, Escape, a tap outside; post out (Hex is posted already: Ranger re-posted after Undo) */
  await X.as(p, W, 'ad', 'a')
  for (const how of ['x', 'esc', 'outside']) {
    const s = await X.poSheet(p, W, RANGER, '2026-07-17', 'pu-10-' + how)
    if (how === 'x') await X.poClose(p, W)
    else if (how === 'esc') { await p.keyboard.press('Escape'); await sleep(500) }
    else { if (W.isPhone) await p.touchscreen.tap(20, 120); else await p.mouse.click(20, 120); await sleep(500) }
    const open = await p.locator('[data-testid="postout-sheet"]:visible').count()
    W.rec('PU-10-' + how, `Saber: Ranger's posting sheet (${s.kind}) closed by ${how === 'x' ? 'its ✕' : how === 'esc' ? 'Escape' : 'a tap outside'} (RECORD for the tap outside)`, how === 'outside' ? 'REC' : !open, `${open ? 'STILL OPEN' : 'closed'} · "${s.line}"`, s.pic + ', ' + await W.pic(p, 'pu-10-' + how + '-after'))
    if (open) await X.poClose(p, W)
  }
  let s = await X.poSheet(p, W, RANGER, '2026-07-17', 'pu-11')
  await X.poUndo(p, W)
  const u = await p.locator('[data-testid="postout-sheet"]:visible, [data-testid="po-line"]:visible').count()
  const pic11 = await W.pic(p, 'pu-11-undone')
  await X.poClose(p, W)
  if (await p.locator('[data-testid="bid-cancel"]:visible').count()) await X.poClose(p, W)
  W.rec('PU-11', 'Saber: Undo post out', true, `sheet "${s.line}"`, s.pic + ', ' + pic11)
  const po = await L.postOut(p, W, RANGER, '2026-07-17', 'pu-12')
  W.rec('PU-12', 'Saber: post out again (⋯ → Post out → SANS → Post out)', /becomes SANS/.test(po.line || ''), `"${po.line}"`, po.pic)
  /* every other place that should show the result: Ranger files Sat 18 through his own door; then Saber looks */
  await X.as(p, W, 'us', 'us')
  await X.openSans(p, W)
  const f18 = await X.fileOn(p, W, '2026-07-18', { kinds: ['f'], tag: 'pu-13' })
  W.rec('PU-13', 'Ranger files Sat 18 again (Fly, All day)', f18.ok, `"${f18.said}" ${J(f18.made)}`, f18.pic)
  await X.sansX(p, W)
  await X.as(p, W, 'ad', 'a')
  await X.openSans(p, W)
  const c18 = await X.cellRead(p, '2026-07-18'), w18 = await X.sansDay(p, W, '2026-07-18')
  W.rec('PU-14', 'the SANS month as Saber: 18 counts Ranger to fly; the day lists him', /F1/.test(c18.figs) && /Ranger/.test(w18.win && w18.win.list), `18 "${c18.figs}" · list "${w18.win && w18.win.list}"`, await W.pic(p, 'pu-14'))
  await X.sansX(p, W)
  /* Edit Schedule's crew list on Sat 18 (filed: SANS Avail) and Mon 20 (not filed: the look-ahead note) */
  await L.go(p, 'editsched')
  await X.crewTo(p, W, 'sat')
  const n18 = await X.crewNote(p, '.ros-body', RANGER)
  W.rec('PU-15', 'Edit Schedule\'s crew list, Sat 18 (filed): Ranger in SANS Avail, no "no availability" words', n18.pucks && n18.pucks.some(x => x.where === 'SANS Avail') && !/no availability filed/.test(X.noteWords(n18)), X.noteWords(n18), await W.pic(p, 'pu-15'))
  await X.crewShut(p, W)
  await L.gotoWeek(p, W, '2026-07-20')
  await L.go(p, 'editsched'); await X.crewTo(p, W, 'tue')
  const n21 = await X.crewNote(p, '.ros-body', RANGER)
  W.rec('PU-16', `Edit Schedule's crew list, Tue 21 (not filed, looked at on Wed 15): "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."`, X.noteWords(n21).includes("SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."), X.noteWords(n21), await W.pic(p, 'pu-16'))
  await X.crewShut(p, W)
  /* the Scheduler Board's crew list on Tue 21 */
  await L.openBoard(p, W, 1)
  if (W.isPhone && await p.locator('#schedBoard .sb-ros .ros-tab').count()) { await W.press(p, '#schedBoard .sb-ros .ros-tab', 'aircrew'); await sleep(500) }
  const nb = await X.crewNote(p, '#schedBoard', RANGER)
  W.rec('PU-17', 'the Scheduler Board\'s crew list, Tue 21: the same look-ahead words', X.noteWords(nb).includes("SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."), X.noteWords(nb), await W.pic(p, 'pu-17'))
  await L.closeBoard(p, W)
  await L.gotoWeek(p, W, '2026-07-13')
  /* View-only Sched and the changes window: SANS availability never lands on the programme — nothing to show there */
  await L.go(p, 'viewsched'); await sleep(500)
  const vs = await p.evaluate(() => /SANS Availability/.test(document.querySelector('#vWeek') ? document.querySelector('#vWeek').innerText : ''))
  W.rec('PU-18', 'View-only Sched: no SANS availability printed on the programme (RECORD)', 'REC', `"SANS Availability" on the week: ${vs}`, await W.pic(p, 'pu-18'))
  await L.go(p, 'editsched')
  const clk = p.locator('#histBtn:visible, [data-testid="hist-btn"]:visible, .histbtn:visible').first()
  if (await clk.count()) {
    await W.press(p, clk, 'changes'); await sleep(700)
    const txt = await p.evaluate(() => [...document.querySelectorAll('.floatwin, .chgwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).join(' || ').slice(0, 500))
    W.rec('PU-19', 'the changes window (RECORD what it holds of the posting / filings)', 'REC', txt, await W.pic(p, 'pu-19'))
    await p.keyboard.press('Escape')
  } else W.rec('PU-19', 'the changes window', 'NW', 'no changes button found on Edit Schedule (selectors tried: #histBtn, hist-btn, .histbtn)', await W.pic(p, 'pu-19'))
}
