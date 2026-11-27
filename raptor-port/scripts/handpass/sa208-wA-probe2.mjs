// sa208-wA-probe2 — walker A's second look: the SANS men's seats (pilot / WSO), the sign-ins, the SANS form's span
// buttons, the + Wave kinds, and one plant made by the borrowed helpers (a new timed line on Mon, Otter tapped on to its
// front seat) with the note, his reason, the board's warning list and the line's hide button read. window.* only READ.
// Run from raptor-port/: SZ=d|p node scripts/handpass/sa208-wA-probe2.mjs
import './sa208-wA-env.mjs'
import { writeFileSync } from 'node:fs'
const Y = await import('./swl-w1A-lib.mjs')
const { L, W5, Z, sleep, J, run, crewAll, armAt, addLine, addSimRow, noteWatch, notesSeen, boardList, boardLineBtn, say1 } = Y
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wA-probe2 1 ·', SZ, '·', process.env.W2_URL, '·', Y.OUT)
await run('probe2', SZ, async (p, W) => {
  const ppl = await p.evaluate(() => { const ids = ['vinci', 'yeti', 'romeo', 'ipman', 'krait', 'cards', 'wrangler', 'badger', 'waldo', 'nick', 'bullet', 'bane']; return ids.map(id => { const q = window.PEOPLE[id] || {}; return id + ':' + Object.entries(q).filter(([k, v]) => typeof v !== 'object' || v === null).map(([k, v]) => k + '=' + v).join(',').slice(0, 260) }) })
  W.rec('people', 'the SANS men and Ranger, their plain fields', 'REC', ppl.join(' || '))
  const users = await p.evaluate(() => { const u = window.USERS || window.ACCOUNTS || window.LOGINS; return u ? JSON.stringify(u).slice(0, 1500) : Object.keys(window).filter(k => /user|acct|login|cred/i.test(k)).join(',') })
  W.rec('users', 'the sign-ins (or the names of the globals that might hold them)', 'REC', users)
  const kinds = await Z.waveMenu(p, W, 0)
  W.rec('wavemenu', 'the + Wave menu on Mon', 'REC', J(kinds))
  await p.keyboard.press('Escape'); await sleep(300)
  await L.closeBoard(p, W)
  await W5.sansDay(p, W, '2026-07-16')
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 5000 })
  const form = await p.evaluate(() => { const t = x => (x ? x.textContent || '' : '').replace(/\s+/g, ' ').trim(); const w = document.querySelector('#inpEditPop'); return { spans: [...w.querySelectorAll('#inpEditSpan [data-span]')].map(e => e.dataset.span + '="' + t(e) + '" pressed=' + e.getAttribute('aria-pressed')), ticks: [...w.querySelectorAll('#inpEditSans label')].map(t), inputs: [...w.querySelectorAll('input, select')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || e.name || e.type) + ':' + e.type + '=' + e.value), text: t(w).slice(0, 700) } })
  W.rec('form', 'the SANS form opened from Thu 16\'s + Commitment', 'REC', J(form), await W.pic(p, 'form'))
  await p.keyboard.press('Escape'); await sleep(400)
  const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard')
  await W5.closeSansWin(p, W)
  const l = await addLine(p, W, 0, { cs: 'VX', to: '09:00', ld: '10:00' })
  W.rec('line', 'Mon: + Wave → Flying wave, VX 09:00–10:00', l.wi >= 0, J(l))
  const key = `0.${l.wi}.0.0.p`
  const a = await armAt(p, W, 0, `[data-slot="${key}"]`, 'arm')
  const sans = (a.c.pucks || []).filter(x => x.where === 'SANS Avail')
  W.rec('arm', `seat ${key} armed; the SANS Avail list`, !!a.armed, `armed ${a.armed} · head ${a.c.head} · ` + sans.map(x => `${x.id}/${x.cs}${x.struck ? '(x)' : ''} "${x.printed}" title "${x.title}"`).join(' | '), await W.pic(p, 'armed'))
  await noteWatch(p)
  const pk = p.locator('#schedBoard .rpuck[data-person="wrangler"]:visible').first()
  if (W.isPhone) await pk.tap(); else await pk.click()
  const t0 = Date.now(); const f0 = await W.pic(p, 'note-first'); const dt = Date.now() - t0
  await sleep(600)
  const seen = await notesSeen(p)
  W.rec('note', 'Otter tapped on: every note raised (watcher), the first picture after the press', 'REC', `notes ${J(seen)} · picture took ${dt}ms · toast now "${await L.toastSaid(p)}" · seat holds ${await Y.holdsAt(p, key)}`, f0)
  for (const ms of [1000, 2000, 3000, 4000, 5000]) { await sleep(1000); const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return 'none'; const cs = getComputedStyle(t); return cs.opacity + '/' + cs.visibility + '/' + (t.className || '') }); W.rec('fade' + ms, 'the note after ' + (ms + 600) + 'ms', 'REC', o) }
  const b = await boardList(p, W, 0)
  W.rec('board', "the board's warning panel", 'REC', `head "${b.head}" · ` + (b.lines || []).map(x => `[${x.ix}] ${x.sev} "${x.text}" btn "${x.btn}"`).join(' | '), await W.pic(p, 'board'))
  const w = await Z.warns(p, W, 0, 'warns')
  W.rec('warns', 'Z.warns reader', 'REC', J(w.sans))
  const ot = (b.lines || []).find(x => /Otter/.test(x.text))
  if (ot) {
    const r = await boardLineBtn(p, W, 0, ot.ix, 'hide')
    const b2 = await boardList(p, W, 0)
    W.rec('hide', "Otter's line's button pressed", 'REC', `${r} · head "${b2.head}" · ` + (b2.lines || []).map(x => `[${x.ix}] ${x.hid ? 'HID ' : ''}"${x.text.slice(0, 80)}" btn "${x.btn}"`).join(' | ') + ' · other ' + J(b2.other), await W.pic(p, 'hidden'))
    await Y.sbUndo(p, W)
    const b3 = await boardList(p, W, 0)
    W.rec('undo1', 'Undo pressed once after the hide: is the line back, is Otter still seated?', 'REC', `seat ${await Y.holdsAt(p, key)} · head "${b3.head}" · ` + (b3.lines || []).filter(x => /Otter/.test(x.text)).map(x => `${x.hid ? 'HID ' : ''}"${x.text}"`).join(' | '))
  }
  const pucks = await p.evaluate(k => { const z = document.querySelector(`#schedBoard [data-slot="${k}"]`); return z ? z.outerHTML.slice(0, 900) : 'none' }, key)
  W.rec('puck', 'the seat after', 'REC', pucks)
}, '2026-07-15T09:00:00')
writeFileSync('D:/raptor-work/c208/A/probe2-' + SZ + '.json', JSON.stringify(L.results, null, 1))
process.exit(0)
