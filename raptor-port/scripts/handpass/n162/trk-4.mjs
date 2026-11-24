// trk-4 v1 — item 4, for comparison of looks only.
//  band:    the app-wide "Not saved" band, on the Tracker: the app opened with its test switch ?savefail (owner D1666 — every
//           save refused as a full browser store refuses it), Saber on 142's Tracker grades a ball by presses.
//  blocked: the app's grey "Blocked:" note — the Tracker's code holds no "Blocked:" words, so the Grades window (Leave War →
//           Balances → Grades…) is tried: a days box given words it cannot take ("abc"), then the window shut by its ✕;
//           then the same box given "abc" and Enter. Whatever is drawn is read.
//   node raptor-port/scripts/handpass/n162/trk-4.mjs d|p [band,blocked]
import { SZ, mk, run, fact, fail, log, press, go, signIn, trackerReady, dlg, waitNoDlg, bar, shots, frames } from './trk-lib.mjs'
const PARTS = (process.argv[3] || 'band,blocked').split(',')
console.log('trk-4 v1', SZ, PARTS.join(','))

const bandRead = s => s.page.evaluate(() => {
  const m = [...document.querySelectorAll('.sv-msg')].find(e => e.getBoundingClientRect().width > 0)
  if (!m) return null
  const host = m.closest('.savestat') || m.parentElement, r = host.getBoundingClientRect()
  const words = [...host.querySelectorAll('b, .sv-sep, .sv-rest, button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent).join('')
  return { text: words, cls: host.className, rect: [r.left, r.top, r.width, r.height].map(Math.round), insideTracker: !!host.closest('#page-tracker') }
})
const toastRead = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); if (!t || t.getBoundingClientRect().width < 2) return null; const r = t.getBoundingClientRect(); return { text: t.textContent.replace(/\s+/g, ' ').trim(), cls: t.className, rect: [r.left, r.top, r.width, r.height].map(Math.round) } })

await run('trk-4', async () => {
  if (PARTS.includes('band')) {
    log(`--- 4 band (${SZ})`)
    const s = await mk()
    /* signed in first without the switch (the sign-in itself writes), 142's Tracker opened once (its seed records written),
       then the same address opened again with ?savefail: the saved sign-in is read, every later save refused */
    await signIn(s, 'ad', 'a')
    await go(s, 'tracker'); await trackerReady(s)
    await s.page.goto('http://localhost:4700/?savefail')
    await s.page.waitForSelector('.page.on, #luser', { state: 'attached', timeout: 30000 })
    if (await s.page.locator('#luser').filter({ visible: true }).count()) {
      /* the sign-in is not kept across a load: signed in again on the ?savefail card */
      await s.page.fill('#luser', 'ad'); await s.page.fill('#lpass', 'a')
      await press(s, '#loginForm button[type=submit]', 'Sign in (?savefail)')
      const ok = await s.page.waitForSelector('.page.on', { state: 'attached', timeout: 20000 }).then(() => true).catch(() => false)
      if (!ok) {
        const seen = await s.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 400))
        fact(`4.${SZ}.band.signInWithSwitch`, seen); await shots(s, `trk-4-band-${SZ}-signin`)
        fail('signing in on the ?savefail address did not reach a page')
      }
    }
    await s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
    if ((await s.page.evaluate(() => document.querySelector('.page.on')?.id)) !== 'page-tracker') await go(s, 'tracker')
    await trackerReady(s)
    fact(`4.${SZ}.band.beforeGrade`, await bandRead(s))
    if (!s.desk) { const fl = s.page.locator('#page-tracker button', { hasText: 'Flow chart' }).filter({ visible: true }); if (await fl.count()) await press(s, fl.first(), 'Flow chart') }
    const id = await s.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(b => b.dataset.id).find(Boolean))
    const b = s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first(); await b.scrollIntoViewIfNeeded().catch(() => {})
    const r = await b.boundingBox(); if (!r) fail('no ball drawn')
    if (s.desk) await s.page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); else await s.page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2)
    await s.page.waitForFunction(() => { const p = document.getElementById('pop'); return p && p.style.visibility !== 'hidden' && p.getBoundingClientRect().width > 0 }, null, { timeout: 5000 }).catch(() => fail('pop-up did not open'))
    await press(s, '#pop .opts button[data-g="dco"]', 'DCO')
    await s.page.keyboard.press('Escape'); await frames(s)
    await s.page.waitForFunction(() => [...document.querySelectorAll('.sv-msg')].some(e => e.getBoundingClientRect().width > 0), null, { timeout: 15000 }).catch(() => log('no band within 15 s'))
    const band = await bandRead(s); fact(`4.${SZ}.band.afterGrade`, band)
    const c = await bar(s); fact(`4.${SZ}.band.trackerCorner.visibleText`, c.visibleText); fact(`4.${SZ}.band.trackerCorner.fullText`, c.fullText)
    fact(`4.${SZ}.band.where`, await s.page.evaluate(() => document.querySelector('.page.on')?.id))
    await shots(s, `trk-4-band-${SZ}`, '.sv-msg')
    await s.ctx.close()
  }
  if (PARTS.includes('blocked')) {
    log(`--- 4 blocked (${SZ})`)
    fact(`4.${SZ}.blocked.trackerCodeHasBlockedWords`, false) // read from code: no "Blocked" in raptor-port/src/tracker (grep), see the report
    const s = await mk()
    await signIn(s, 'ad', 'a')
    await go(s, 'leavewar')
    await s.page.waitForSelector('.lw-tabs [role=tab]', { timeout: 20000 }).catch(() => fail('Leave War tabs not drawn'))
    await press(s, s.page.locator('.lw-tabs [role=tab]', { hasText: /^Balances/ }).first(), 'Balances tab')
    await press(s, '[data-testid="bal-grades"]', 'Grades…')
    await s.page.waitForSelector('[data-testid="grades-sheet"]', { state: 'visible' }).catch(() => fail('Grades window not open'))
    const box = s.page.locator('[data-testid^="grade-days-"]').filter({ visible: true }).first()
    const tid = await box.getAttribute('data-testid'); fact(`4.${SZ}.blocked.box`, tid)
    /* (a) words it cannot take, then the window shut by its ✕ */
    await press(s, box, 'days box'); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type('abc')
    await press(s, '[data-testid="grades-close"]', '✕ Grades')
    await frames(s)
    fact(`4.${SZ}.blocked.a.windowStillOpen`, await s.page.locator('[data-testid="grades-sheet"]').filter({ visible: true }).count() > 0)
    fact(`4.${SZ}.blocked.a.toast`, await toastRead(s))
    fact(`4.${SZ}.blocked.a.boxWords`, await s.page.evaluate(t => { const e = document.querySelector(`[data-testid="${t}-err"]`); return e ? e.textContent : null }, tid))
    await shots(s, `trk-4-blocked-a-${SZ}`, (await toastRead(s)) ? '#toastEl' : `[data-testid="${tid}-err"]`)
    /* (b) the window open again, "abc" and Enter */
    if (!(await s.page.locator('[data-testid="grades-sheet"]').filter({ visible: true }).count())) await press(s, '[data-testid="bal-grades"]', 'Grades…')
    const box2 = s.page.locator(`[data-testid="${tid}"]`).filter({ visible: true }).first()
    await press(s, box2, 'days box'); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type('abc'); await s.page.keyboard.press('Enter'); await frames(s)
    const err = await s.page.evaluate(t => { const e = document.querySelector(`[data-testid="${t}-err"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.textContent, cls: e.className, rect: [r.left, r.top, r.width, r.height].map(Math.round) } }, tid)
    fact(`4.${SZ}.blocked.b.boxWords`, err); fact(`4.${SZ}.blocked.b.toast`, await toastRead(s))
    await shots(s, `trk-4-blocked-b-${SZ}`, `[data-testid="${tid}-err"]`)
    await s.ctx.close()
  }
})
