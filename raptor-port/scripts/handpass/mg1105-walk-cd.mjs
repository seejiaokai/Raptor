// Scenarios C and D — a guest. Usage: node mg1105-walk-cd.mjs C|D desktop|phone
import { L, press, guestViewOn } from './mg1105-walk-common.mjs'
const { say, note, check } = L
const part = process.argv[2] || 'C', size = process.argv[3] || 'phone'
const tag = part + (size === 'desktop' ? 'd' : 'p')
const h = await L.open(size)
const { page } = h
const step = async (name, fn) => { try { await fn() } catch (e) { say(`SCRIPT ERROR ${tag} ${name} — ` + String(e.message || e).split('\n').slice(0, 3).join(' | ')) } }
const where = () => page.evaluate(() => ({ ids: [...document.querySelectorAll('#accessWaiting, #accessRequest, #guestApp, #loginForm, #app, #shell')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id), band: [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100)), words: ((document.querySelector('#accessWaiting') || document.querySelector('#accessRequest') || document.body).innerText || '').replace(/\s+/g, ' ').slice(0, 260) }))
const shotBoth = async (id, what) => { if (h.tap) await L.shot(page, id, what + '-instant'); await page.waitForTimeout(700); return L.shot(page, id, what + '-settled') }
const user = part === 'C' ? 'walker-guest' : 'walker-two'
const cs = part === 'C' ? 'Walker' : 'Walkertwo', ini = part === 'C' ? 'WK' : 'WT'

// fixture
await step('fixture', async () => {
  await L.signIn(page, 'ad', 'a')
  check(tag + '0', 'admin switches the guest view on', await guestViewOn(page), true)
  await L.signOut(page)
})
await L.signIn(page, user, 'x')
note(tag + '0-signin', await where())
await L.shot(page, tag + '1', 'request-form')
const fill = async () => {
  await page.fill('#accCs', cs); await page.fill('#accIni', ini)
  const seat = await page.locator('#accSeat option').evaluateAll(os => os.map(o => o.value).find(Boolean)); await page.selectOption('#accSeat', seat)
  if (await page.locator('#accCat').count()) { const c = await page.locator('#accCat option').evaluateAll(os => os.map(o => o.value).find(Boolean)); if (c) await page.selectOption('#accCat', c) }
}
let reqWrites = []

if (part === 'C') {
  await step('C1-empty', async () => {
    const s = await L.state(page)
    await press(h, page.locator('#accSend')); if (h.tap) await L.shot(page, tag + '1', 'empty-send-instant'); await page.waitForTimeout(800)
    await L.shot(page, tag + '1', 'empty-send-settled')
    note(tag + '1-empty-refusal', { where: await where(), said: await L.notesSince(page, s.notes), writes: await L.writesSince(page, s.writes) })
  })
  await step('C1-fill', async () => {
    await fill(); await L.shot(page, tag + '1', 'filled')
    const s = await L.state(page)
    await press(h, page.locator('#accSend')); if (h.tap) await L.shot(page, tag + '1', 'send-instant'); await page.waitForTimeout(900)
    await L.shot(page, tag + '1', 'send-settled')
    reqWrites = await L.writesSince(page, s.writes)
    const w = await where()
    check(tag + 'C1', 'request sent: waiting screen, one save (an accessreq key)', /with the admins/i.test(w.words) && reqWrites.some(x => /accessreq/i.test(x)), { where: w, writes: reqWrites })
  })
  // C2
  await step('C2', async () => {
    const nG = (await L.state(page)).writes
    await press(h, page.locator('#accGuest')); await page.waitForTimeout(900)
    await shotBoth(tag + '2', 'guest-page')
    const inGuest = await page.locator('#guestApp').isVisible().catch(() => false)
    note(tag + '2-in-guest', inGuest)
    const ctl = await page.evaluate(() => [...document.querySelectorAll('#guestApp button, #guestApp [role=button], #guestApp a, #guestApp select, #guestApp input')].filter(e => e.getBoundingClientRect().width > 2).map(e => `${e.tagName}#${e.id}.${String(e.className).slice(0, 20)}|${(e.getAttribute('aria-label') || e.title || e.textContent || '').trim().slice(0, 25)}`))
    note(tag + '2-controls', ctl)
    // weeks
    const wks = page.locator('#guestApp .guest-wks .wk:visible')
    const n = await wks.count()
    for (let i = 0; i < n; i++) { await press(h, wks.nth(i), { timeout: 4000 }).catch(e => note(tag + '2-week-press-failed', i)); if (h.tap) await L.shot(page, tag + '2', 'week' + i + '-instant'); await page.waitForTimeout(600); if (i === n - 1) await L.shot(page, tag + '2', 'week' + i + '-settled') }
    note(tag + '2-weeks', n)
    // swipe days sideways
    const sc = await page.evaluate(() => { const g = document.querySelector('#guestApp'); const cands = [...g.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 20 && e.clientWidth > 100 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowX)); const e = cands[0]; if (!e) return null; e.setAttribute('data-mgsw', '1'); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, left0: e.scrollLeft, cls: e.className } })
    note(tag + '2-scroller', sc)
    if (sc) {
      const doSwipe = () => page.evaluate(async ([x, y, w, h]) => {
        const el = document.elementFromPoint(x + w * 0.8, 400)
        try {
          const mk = (cx) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: 400 })
          const fire = (type, cx) => el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [mk(cx)], targetTouches: type === 'touchend' ? [] : [mk(cx)], changedTouches: [mk(cx)] }))
          fire('touchstart', x + w * 0.8); for (let i = 1; i <= 10; i++) { await new Promise(r => setTimeout(r, 30)); fire('touchmove', x + w * 0.8 - w * 0.06 * i) } fire('touchend', x + w * 0.2)
          return 'synthetic touch events'
        } catch (e) { return 'touch events unavailable: ' + e.message }
      }, [sc.x, sc.y, sc.w, sc.h])
      const how = (await doSwipe()) + ' | then pointer drag'
      await page.mouse.move(340, 400); await page.mouse.down(); for (let i = 1; i <= 12; i++) { await page.mouse.move(340 - 22 * i, 400); await page.waitForTimeout(30) } await page.mouse.up(); await page.waitForTimeout(700)
      const left1 = await page.evaluate(() => document.querySelector('[data-mgsw]').scrollLeft)
      await L.shot(page, tag + '2', 'after-swipe')
      // also a native scroll of the same strip, as a finger drag would
      await page.evaluate(() => { const e = document.querySelector('[data-mgsw]'); e.scrollBy({ left: 300, behavior: 'auto' }) }); await page.waitForTimeout(500)
      const left2 = await page.evaluate(() => document.querySelector('[data-mgsw]').scrollLeft)
      await L.shot(page, tag + '2', 'after-scrollby')
      note(tag + '2-swipe', { how, left0: sc.left0, afterSynthetic: left1, afterScrollBy: left2 })
    }
    // long-press a puck (synthetic) + tap a puck
    const pk = page.locator('#guestApp .puck').first()
    if (await pk.count()) {
      await pk.scrollIntoViewIfNeeded().catch(() => {}); await page.evaluate(() => window.scrollTo(0, window.scrollY)); const b = await pk.boundingBox()
      if (b && b.y > 0 && b.y < 800) {
        const lp = await page.evaluate(async ([x, y]) => { const el = document.elementFromPoint(x, y); try { const mk = () => new Touch({ identifier: 2, target: el, clientX: x, clientY: y }); el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [mk()], targetTouches: [mk()], changedTouches: [mk()] })); await new Promise(r => setTimeout(r, 900)); el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [mk()] })); return 'synthetic long press' } catch (e) { return 'unavailable: ' + e.message } }, [b.x + b.width / 2, b.y + b.height / 2])
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(900); await L.shot(page, tag + '2', 'during-hold'); await page.mouse.up(); await page.waitForTimeout(500); await L.shot(page, tag + '2', 'after-longpress')
        note(tag + '2-longpress', { lp, open: (await where()).ids })
        await press(h, pk, { timeout: 4000 }).catch(() => {}); if (h.tap) await L.shot(page, tag + '2', 'puck-tap-instant'); await page.waitForTimeout(600); await L.shot(page, tag + '2', 'puck-tap-settled')
        note(tag + '2-puck-tap', { visibleWindows: await page.evaluate(() => [...document.querySelectorAll('.floatwin, .airpop, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 30).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 100))) })
        await page.keyboard.press('Escape'); await page.waitForTimeout(300)
      }
    } else note(tag + '2-puck', 'no .puck in #guestApp')
    // day title tap
    const dt = page.locator('#guestApp .day h2, #guestApp .day .dayname, #guestApp .day-title, #guestApp .day .dayhead, #guestApp .day').first()
    if (await dt.count()) { await press(h, dt, { timeout: 4000 }).catch(() => {}); if (h.tap) await L.shot(page, tag + '2', 'daytitle-instant'); await page.waitForTimeout(600); await L.shot(page, tag + '2', 'daytitle-settled'); note(tag + '2-daytitle', await page.evaluate(() => [...document.querySelectorAll('.floatwin, .airpop, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 30).map(e => e.className))) }
    // every other control
    const all = page.locator('#guestApp button:visible')
    const cnt = await all.count()
    for (let i = 0; i < cnt; i++) { const b = all.nth(i); const t = ((await b.textContent().catch(() => '')) || '').trim(); if (/Sign out|Log ?out/i.test(t) || (await b.getAttribute('id')) === 'guestOut') continue; await press(h, b, { timeout: 3000 }).catch(() => {}); await page.waitForTimeout(200); await page.keyboard.press('Escape') }
    await page.waitForTimeout(6000)
    const gw = await L.writesSince(page, nG)
    await L.shot(page, tag + '2', 'after-6s-wait')
    check(tag + 'C2', 'whole guest part: 0 storage writes (except reopen-page key, recorded)', gw.length === 0, gw)
    await L.signOut(page)
    const s2 = await L.state(page)
    await L.signIn(page, user, 'x')
    const again = await where()
    await L.shot(page, tag + '2', 'signin-again')
    note(tag + '2-signin-again', { again, writes: await L.writesSince(page, s2.writes) })
  })
  await step('C3', async () => {
    // make sure we are signed out, then admin
    const w = await where(); if (!w.ids.includes('loginForm')) await L.signOut(page).catch(() => {})
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
    await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(600)
    const cnt = await page.evaluate(() => (document.body.innerText.match(/Walker\b/g) || []).length)
    await L.shot(page, tag + '3', 'admin-users')
    const reqEl = await page.evaluate(() => [...document.querySelectorAll('[class*=req], #admReqs, .adm-reqs')].filter(e => /Walker/.test(e.textContent) && e.getBoundingClientRect().width > 50).slice(0, 2).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 200)))
    note(tag + '3-requests', { walkerMentions: cnt, reqEl })
  })
} else {
  // D
  await step('D-fill', async () => {
    await fill(); await L.shot(page, tag + '1', 'filled')
    await L.refuse(page, true)
    const s = await L.state(page)
    await press(h, page.locator('#accSend')); if (h.tap) await L.shot(page, tag + '1', 'send-refused-instant'); await page.waitForTimeout(1200)
    await L.shot(page, tag + '1', 'send-refused-settled')
    note(tag + 'D1-waiting', { where: await where(), writes: await L.writesSince(page, s.writes), said: await L.notesSince(page, s.notes) })
    await page.waitForTimeout(3000); await L.shot(page, tag + '1', 'waiting-after-4s')
    note(tag + 'D1-waiting-4s', await where())
    await press(h, page.locator('#accGuest')); await page.waitForTimeout(1000)
    await L.shot(page, tag + '1', 'guest-refusing-1s')
    await page.waitForTimeout(5000)
    await L.shot(page, tag + '1', 'guest-refusing-6s')
    note(tag + 'D1-guest', { where: await where(), refusedWrites: await page.evaluate(() => window.__lsLog.filter(e => !e.ok).map(e => e.k)) })
    await L.signOut(page)
    const s2 = await L.state(page)
    await L.signIn(page, user, 'x')
    await L.shot(page, tag + '2', 'signin-again')
    note(tag + 'D2-signin-again', { where: await where(), writes: await L.writesSince(page, s2.writes), refusedOn: await page.evaluate(() => window.__lsRefuse) })
  })
  if (size === 'desktop') await step('D3', async () => {
    await page.reload(); await page.waitForTimeout(1000)
    note(tag + 'D3-leave-asked', page.__leaveAsked || 0)
    await L.shot(page, tag + '3', 'after-reload')
    await L.signIn(page, user, 'x'); await page.waitForTimeout(500)
    await L.shot(page, tag + '3', 'signin-after-reload')
    note(tag + 'D3-after-reload', await where())
  })
  else note(tag + 'D3', 'NOT WALKED — desktop only per brief')
}
await L.finish('cd-' + tag)
