// swd-w11-probe2 — can "Ranger reads the line, then Saber presses Undo" be played through the app's own controls?
// Saber keeps his tab (his Undo list clears at a sign-out, D148); Ranger signs in in a second tab of the same browser.
process.env.W11_RUN ||= 'probe2'
await import('./swd-w11-env.mjs')
const X = await import('./sah-w8-lib.mjs')
const T = await import('./sah-w10-lib.mjs')
const { L, RANGER } = X
console.log('VERSION swd-w11-probe2 1')
const SZ = process.env.SZ || 'd'
const lines = p => p.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(e => ({ id: e.dataset.testid.replace('bell-line-', '').slice(0, 24), unread: e.classList.contains('unread'), t: (e.querySelector('.bl-main').textContent || '').replace(/\s+/g, ' ').slice(0, 170), struck: !!e.querySelector('.bl-struck, s') })))
const bell = async (p, W) => { await T.closeAll(p, W); await W.press(p, '.bellbtn:visible', 'bell'); await p.waitForSelector('[data-testid="bell-list"]'); await L.sleep(350); const l = await lines(p); await p.keyboard.press('Escape'); await L.sleep(250); return l }
await T.run('probe2', SZ, async (p, W, ctx) => {
  const q = await L.qualsTick(p, W, RANGER, 'tick'); console.log('ticked', JSON.stringify(q.st))
  await T.as(p, W, 'us', 'us')
  const f = await T.file(p, W, '2026-07-17', null, ['fly'], null, 'file', { endIso: '2026-07-18' })
  console.log('filed', f.iid, f.refused); await T.closeAll(p, W)
  await W.press(p, '.bellbtn:visible', 'bell'); await p.waitForSelector('[data-testid="bell-list"]')
  const m = p.locator('[data-testid="bell-markall"]:visible').first(); if (await m.count()) await W.press(p, m, 'markall')
  await T.closeAll(p, W)
  await T.as(p, W, 'ad', 'a')
  const q2 = await L.qualsTick(p, W, RANGER, 'untick'); console.log('unticked', JSON.stringify(q2.st))
  /* the second tab */
  const p2 = await ctx.newPage(); await p2.goto(L.URL_); await L.sleep(1500)
  console.log('tab 2 opens on', (await p2.locator('#luser:visible').count()) ? 'the sign-in' : 'a signed-in page', await p2.locator('#roleBadge').first().textContent().catch(() => ''))
  if (!(await p2.locator('#luser:visible').count())) await L.signOut(p2, W)
  await L.signIn(p2, 'us', 'us')
  const b1 = await bell(p2, W); console.log('Ranger tab 2 bell', JSON.stringify(b1))
  await W.press(p2, '.bellbtn:visible', 'bell'); await p2.waitForSelector('[data-testid="bell-list"]')
  const c = b1.find(l => /no longer SANS/.test(l.t))
  if (c) { await p2.locator(`[data-testid^="bell-line-${c.id}"]`).first().click(); await L.sleep(900) }
  await T.closeAll(p2, W)
  const b2 = await bell(p2, W); console.log('after his tap', JSON.stringify(b2))
  await p.bringToFront()
  console.log('Saber tab: undo title', await p.locator('#undoBtn').getAttribute('title'), 'disabled', await p.locator('#undoBtn').isDisabled())
  await W.press(p, '#undoBtn:visible', 'undo'); await L.sleep(900)
  console.log('after Undo: Ranger', JSON.stringify(await T.rec(p, RANGER)), 'toast', await L.toastSaid(p))
  await p2.bringToFront(); await p2.reload(); await L.sleep(1500)
  if (await p2.locator('#luser:visible').count()) await L.signIn(p2, 'us', 'us')
  const b3 = await bell(p2, W); console.log('Ranger after Undo (tab 2 reloaded)', JSON.stringify(b3))
})
process.exit(0)
