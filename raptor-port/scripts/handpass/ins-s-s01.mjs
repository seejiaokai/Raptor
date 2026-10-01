/* Scenario 1 — the Scheduler Board's door (RECORDED), then the counting half through the board. */
import * as S from './ins-s-lib.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s1-')
const { browser, p, errors } = await B.world()
const ph = !!process.env.HP_PHONE
try {
  await B.toEdit(p)
  await B.pubOrig(p, TUE); await L.settle(p)
  const h0 = await W.head(p, TUE)
  const r0 = await S.look(p, 's1-a-edit-issued', { foot: true })
  row('1.a', 'Tuesday signed and published (Original); Insights opened on Edit Schedule', `${S.brief(r0)} · tag "${h0.tag}" · opened by: ${r0.how} · topmost at centre: ${r0.topmost}`, 'RECORDED', [r0.shot, r0.shot2])

  /* the window open on Edit Schedule, THEN the board opened (by the probe bridge: the modal covers the page behind it) */
  const o = await S.openIns(p)
  await p.evaluate(() => window.openScheduler(1)); await S.sleep(900)
  const during = await p.evaluate(() => {
    const m = document.querySelector('#insightModal'); const bd = document.querySelector('#schedBoard')
    const insOpen = !!m && !m.hidden && !!document.querySelector('#insightBody')
    let top = null
    if (insOpen) { const r = m.querySelector('.modal-box').getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, Math.min(r.top + r.height / 2, innerHeight - 1)); top = m.contains(hit) ? 'window' : (bd && bd.contains(hit) ? 'board' : 'other:' + (hit && (hit.id || hit.className))) }
    return { insOpen, top, boardUp: !!bd && bd.offsetWidth > 0 }
  })
  const pA = await pic(p, 's1-b-window-then-board')
  row('1.b', `Insights opened on Edit Schedule (${o.how}); then the board for Tuesday opened (bridge) while it was open`, `window still in the page: ${during.insOpen}; what is on top at the window's centre: ${during.top}; board up: ${during.boardUp}`, 'RECORDED', [pA])

  /* if the window survived, can it still be closed/read through the board? close it anyway through its own ✕ if reachable */
  if (during.insOpen) { const x = await p.locator('#insightClose:visible').count(); const hit = x ? await p.evaluate(() => { const e = document.querySelector('#insightClose'); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t === e || e.contains(t) }) : null; row('1.b2', 'the window\'s own ✕ with the board up', `✕ drawn: ${x}; the thing a finger lands on is the ✕: ${hit}`, 'RECORDED', []); }
  if (during.insOpen) {
    await p.locator('#insightClose').first().click({ timeout: 2500 }).catch(() => {}); await S.sleep(300)
    if (await p.locator('#insightBody').count()) { await p.keyboard.press('Escape'); await S.sleep(300) }
    const still = await p.locator('#insightBody').count()
    row('1.b3', 'closing that window with the board up (its ✕, then Escape)', still ? 'still open after both' : 'closed', 'RECORDED', [])
    if (still) { await p.reload(); await L.signIn(p, 'a', { goto: false }); await B.toEdit(p) }
  }
  /* the board's own bar: every door */
  if (!(await p.locator('#schedBoard:visible').count())) await W.boardOn(p, TUE)
  const doors = await p.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    const vis = e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed'
    const bar = [...b.querySelectorAll('button, [role=button]')].filter(e => vis(e) && e.getBoundingClientRect().top < 100 && e.getBoundingClientRect().width > 0).map(e => (e.id || '') + '|' + (e.innerText || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 16))
    const mk = id => { const e = document.querySelector(id); if (!e) return 'absent from the page'; const r = e.getBoundingClientRect(); if (!r.width) return 'in the page, not drawn'; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (t === e || e.contains(t)) ? 'drawn and on top' : 'drawn but COVERED by ' + (t && (t.id || t.className.toString().slice(0, 30))) }
    return { bar, insightBtn: mk('#insightBtn'), burger: mk('#burger'), drawerInsights: mk('#drawerInsights'), more: [...b.querySelectorAll('button')].filter(e => /^(⋯|…|more)/i.test((e.innerText || '').trim()) || /more/i.test(e.getAttribute('aria-label') || '')).map(e => e.id || e.className).slice(0, 4) }
  })
  const pB = await pic(p, 's1-c-board-bar')
  row('1.c', `the Scheduler Board for Tuesday at ${ph ? '390×844' : '1440×900'}: every control in its bar, and where the shell's doors stand`, `bar: ${doors.bar.join(' ; ')} · #insightBtn: ${doors.insightBtn} · ☰ burger: ${doors.burger} · "Week insights" row: ${doors.drawerInsights} · a "more" menu in the bar: ${doors.more.join(',') || 'none'}`, 'RECORDED', [pB])
  /* the bar's own ⋯ menu, when it is drawn */
  {
    const mb = p.locator('#schedBoard #sbMore:visible').first()
    if (await mb.count()) {
      await mb.click(); await S.sleep(450)
      const menu = await p.evaluate(() => [...document.querySelectorAll('.sbmoremenu, .sb-more-menu, [role=menu], .popmenu, .menu')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 200)))
      const near = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=menuitem]')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().top < 220).map(e => (e.id || '') + '|' + (e.innerText || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 14)))
      const pM = await pic(p, 's1-c-board-more-menu')
      row('1.c3', "the board bar's ⋯ menu opened", `menu text: ${JSON.stringify(menu)} · buttons now in the top 220px: ${near.join(' ; ')} · any Insights entry: ${/insight/i.test(JSON.stringify(menu) + near.join())}`, 'RECORDED', [pM])
      await p.keyboard.press('Escape'); await S.sleep(300)
    } else row('1.c3', "the board bar's ⋯ menu", 'not drawn at this width', 'RECORDED', [])
  }
  /* try the burger on the board if one is reachable */
  if (ph) {
    const bg = p.locator('#burger').first()
    const t = await bg.count() ? await bg.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { drawn: r.width > 0, top: x === e || e.contains(x) } }) : null
    row('1.c2', 'phone: is the ☰ burger reachable while the board is up', JSON.stringify(t), 'RECORDED', [])
  }

  /* the counting half: the waiting change ON the board, ✓ Done, Insights on Edit Schedule */
  const before = r0
  await W.boardOn(p, TUE)
  const act = await S.takeOff(p, TUE, '1.1.1.0.p')
  const hBoard = await W.head(p, TUE)
  const pC = await pic(p, 's1-d-board-after-takeoff')
  await B.toEdit(p)   // ✓ Done
  const h1 = await W.head(p, TUE)
  const r1 = await S.look(p, 's1-e-edit-after-board-change', { foot: true })
  judge('1.d', `on the board: Romeo ... Rebel taken off Tuesday's second wave seat (${act}); ✓ Done; Insights on Edit Schedule`, [
    ['Tuesday waits on the board (1 change)', /1 change|1 pending/.test(hBoard.pending), hBoard.pending],
    ['the day on Edit Schedule says 1 pending/change', /1 (change|pending)/.test(h1.pending), h1.pending],
    ['Insights unchanged from the issued figures (every section)', S.fp(r1) === S.fp(before), S.fp(r1) === S.fp(before) ? '' : 'DIFF: ' + S.brief(r1) + ' vs ' + S.brief(before)],
    ['the window is topmost at its centre on Edit Schedule', r1.topmost, r1.how],
  ], [pC, r1.shot, r1.shot2])

  /* then it goes out as AL1 and the window moves together */
  const ep = await B.pubAL(p, TUE); await L.settle(p)
  const h2 = await W.head(p, TUE)
  const r2 = await S.look(p, 's1-f-after-AL1', { foot: true })
  const g = r => { const x = (r.tiles[2] || {}).n; return +x }
  judge('1.e', 'sign and Publish AL1 for Tuesday; Insights again', [
    ['AL1 on Tuesday, nothing pending', /AL1/.test(h2.tag) && !/pending/.test(h2.pending), `${h2.tag} / ${h2.pending}`],
    ['Insights moved (Aircrew flying 38 → 37 as Rebel flew only that sortie)', g(r2) === g(r1) - 1, `${g(r1)} → ${g(r2)}`],
    ['Sorties and Formations unchanged', r2.tiles[0].n === r1.tiles[0].n && r2.tiles[1].n === r1.tiles[1].n, S.brief(r2).slice(0, 120)],
  ], [r2.shot, r2.shot2])
} catch (e) { row('1.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's1-X-error')]) }
row('1.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s1', { errors })
await browser.close()
