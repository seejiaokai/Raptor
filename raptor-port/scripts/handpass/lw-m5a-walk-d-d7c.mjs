// Walker D, script d7c: 5d (second half), 47, 48, 49, 35 on the seed. Desktop, admin then member, today 25 Jan 2026.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d7c v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const tabSel = () => P.evaluate(() => [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getAttribute('aria-selected') === 'true').map(e => e.dataset.testid).join(','))
try {
  await L.signIn(w, 'admin'); await D.openBalances(w)
  // ---- 5d, second half: a valid carried forward 4 then App bal 3 → clamped to 3 at the save
  await D.typeInBox(w, T('bal-LVE-vegas'), 20); await D.typeInBox(w, T('bal-cf-vegas'), 20)
  const a = await D.balRow(P, 'vegas')
  await D.typeInBox(w, T('bal-LVE-vegas'), 3)
  const b = await D.balRow(P, 'vegas'); await shot(w, 'd7c-5d-app3')
  judge('5d App bal typed 3 while incl. 20 shows (designer: 3 incl 3)', [exp('before: 20 incl 20', a.app + ' incl ' + a.cf, '20 incl 20'), exp('after: App', b.app, '3'), exp('after: incl. clamped', b.cf, '3')], ['d7c-5d-app3'], 'error words: ' + (await txt(P, T('bal-LVE-vegas-err')) ?? 'none'))
  // ---- 47 locked: the admin keeps his boxes
  await press(w, T('bal-lock')); await P.waitForTimeout(700)
  await D.typeInBox(w, T('bal-LVE-bane'), 18)
  const rb = await D.balRow(P, 'bane'), rs = await D.balRow(P, 'stiff')
  await press(w, T('bal-name-stiff')); await P.waitForTimeout(700)
  const own = await D.pwRead(P); await shot(w, 'd7c-47-own-window'); await D.closePw(w)
  judge('47 locked: Saber types Ranger\'s App bal 18 (saved); his own row keeps its boxes; his window reads "Locked for members"', [exp('Ranger App bal saved', rb.app, '18'), exp('Saber\'s own row boxes', rs.boxes, '7'), exp('window padlock words', own.lock, 'Locked for members')], ['d7c-47-own-window'])
  // ---- 49 no bell for a balance change: grade change + lock were made; sign in as Ranger and read the bell
  await press(w, T('bal-grade-bane')); await P.waitForTimeout(400); await press(w, T('bal-grade-opt-jp')); await P.waitForTimeout(600)
  await L.switchTo(w, 'member')
  await L.openBell(w); const bl = await L.bellLines(P); await shot(w, 'd7c-49-bell'); await L.closeBell(w)
  const balLines = bl.filter(l => /balance|grade|lock|LVE/i.test(l.text))
  await D.openBalances(w)
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const mw = await D.pwRead(P); await shot(w, 'd7c-49-member-window'); await D.closePw(w)
  judge('49 admin typed Ranger\'s figure, changed his grade, locked: Ranger\'s bell and window', [exp('bell lines about balance/grade/lock', balLines.length, 0), exp('dots in his window list', mw.lines.filter(l => l.dot).length, 0)], ['d7c-49-bell', 'd7c-49-member-window'], `bell lines: ${bl.map(l => l.text).join(' | ') || 'none'}; his window lock line "${mw.lock}", boxes ${mw.boxes}`)
  // ---- 35 reload on the Balances page: which tab does it land on?
  await D.reloadAs(w, 'member', '2026-01-25')
  const landing = await tabSel(); await shot(w, 'd7c-35-reload-landing')
  note('35 a reload while on the Balances page: where it lands (signed in again by the walk)', 'desk', 'PASS', `selected tab after the reload and a new sign-in: ${landing}`, ['d7c-35-reload-landing'])
  // ---- 48 Undo leaves the screen where it is — the page scrolled to a row far down; then with the docked window open
  await L.switchTo(w, 'admin'); await D.openBalances(w)
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); if (s) s.scrollTop = 1500; else window.scrollTo(0, 1500) })
  await P.waitForTimeout(500)
  const sc0 = await D.where(P)
  await D.typeInBox(w, T('bal-LVE-divot'), 40)
  const sc1 = await D.where(P)
  await L.undo(w)
  const sc2 = await D.where(P); const dv = await D.balRow(P, 'divot'); await shot(w, 'd7c-48-undo-scrolled')
  judge('48 the Balances page scrolled to row 41 (Vector): type, Undo — the page does not move', [exp('scroll before typing', JSON.stringify(sc0), JSON.stringify(sc1)), exp('scroll after Undo', JSON.stringify(sc2), JSON.stringify(sc1)), exp('figure back', dv.app, '33')], ['d7c-48-undo-scrolled'], `scroll ${JSON.stringify(sc0)} → ${JSON.stringify(sc1)} → ${JSON.stringify(sc2)}; the page's scroll max after: ${await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); return s ? s.scrollHeight - s.clientHeight : document.scrollingElement.scrollHeight - innerHeight })}`)
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); if (s) s.scrollTop = 0; else window.scrollTo(0, 0) }); await P.waitForTimeout(400)
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const before = await D.pwRead(P)
  await D.typeInBox(w, T('pw-LVE'), 17)
  const mid = await D.pwRead(P)
  await L.undo(w)
  const after = await D.pwRead(P); await shot(w, 'd7c-48-window-undo')
  judge('48 the docked window open: type App bal 17 in it, Undo from the top bar — window figure back, window and page where they were', [exp('window App before', before.app, '18'), exp('after typing', mid.app, '17'), exp('after Undo', after.app, '18'), exp('window left edge unmoved', after.box.left, before.box.left), exp('window top unmoved', after.box.top, before.box.top)], ['d7c-48-window-undo'])
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd7c-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d7c')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
