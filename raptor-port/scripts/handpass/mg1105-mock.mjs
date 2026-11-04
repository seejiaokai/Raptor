// The member / guest check's three mock-ups (5 Nov 26), drawn ON the real frozen build — nothing here is built. Each is a
// today-beside-proposed pair at his PC's 1536 (Chromium) and his iPhone's 402 × 874 (WebKit), the place marked by an
// outline drawn on the element and a tag in its own ::before (the method: .claude/skills/brainstorming/mockups-on-the-real-app.md).
//   Q1 — the access screens and the guest page wear the failed-save warning band every other page wears (the band is
//        CLONED from the app's own markup and class — SaveStatus.tsx `.saveband`; no new style).
//   Q2 — Quals: a member's own Scheduler cell reads only, as his Management cell already does (the cell's read-only look
//        is the Management cell's own: class `qro` and its title).
//   Q3 — Edit Schedule as a member (reached only through the developer bridge): the Amendments panel without its
//        "Publish AL1" row. Drawn for completeness; the recommendation is to leave it.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node scripts/handpass/mg1105-mock.mjs
import * as L from './mg1105-lib.mjs'
import { join } from 'node:path'
const OUT = join(L.OUT, '../../../mock/2026-11-05-member-guest/img')
import { mkdirSync } from 'node:fs'
mkdirSync(OUT, { recursive: true })

const MARK = `.mg-new{outline:3px solid #ff3b6b !important;outline-offset:2px;position:relative}
.mg-new::before{content:attr(data-mg);position:absolute;left:6px;top:-22px;z-index:99;background:#ff3b6b;color:#fff;
  font:700 11px/1 system-ui,sans-serif;padding:4px 6px;border-radius:4px;white-space:nowrap;letter-spacing:.02em}
.mg-today{outline:3px dashed #ff3b6b !important;outline-offset:2px;position:relative}
.mg-today::before{content:attr(data-mg);position:absolute;left:6px;top:-22px;z-index:99;background:#ff3b6b;color:#fff;
  font:700 11px/1 system-ui,sans-serif;padding:4px 6px;border-radius:4px;white-space:nowrap}`
const mark = (page) => page.addStyleTag({ content: MARK })
const shot = (page, name, clip) => page.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) })


for (const size of ['desktop', 'phone']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  /* ---- Q1: the stranger's request cannot be saved ---- */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
    await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
    if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
    await page.waitForTimeout(300)
    await L.signOut(page)
    await L.signIn(page, 'stranger', 'x')
    await page.fill('#accCs', 'Stranger'); await page.fill('#accIni', 'ST')
    await page.selectOption('#accSeat', await page.locator('#accSeat option').evaluateAll(os => os.map(o => o.value).find(Boolean)))
    if (await page.locator('#accCat').count()) await page.selectOption('#accCat', await page.locator('#accCat option').evaluateAll(os => os.map(o => o.value).find(Boolean)))
    await L.refuse(page, true)
    await page.click('#accSend'); await page.waitForTimeout(900)
    await mark(page)
    /* today: the waiting screen says the request is with the admins — nothing says it was not saved */
    await page.evaluate(() => { const h = document.querySelector('#accessWaiting .acc-h'); h.classList.add('mg-today'); h.dataset.mg = 'TODAY: says sent — it was not saved' })
    await shot(page, `Q1-waiting-today-${sfx}`)
    await page.evaluate(() => { const h = document.querySelector('#accessWaiting .acc-h'); h.classList.remove('mg-today') })
    /* proposed: the band across the top of the screen, as under a top bar */
        await page.evaluate(([place, label]) => {
      const b = document.createElement('div')
      b.className = 'saveband mg-new'; b.setAttribute('role', 'status'); b.dataset.mg = label
      b.innerHTML = '<span class="sv-msg"><span class="sv-ico" aria-hidden="true">⚠</span>Not saved — keep this page open</span><button type="button">Retry</button>'
      if (place === 'top') { Object.assign(b.style, { position: 'fixed', top: '0', left: '0', right: '0', zIndex: '9999', height: '40px' }); document.body.appendChild(b) }
      else document.querySelector('#guestApp .guestbar').insertAdjacentElement('afterend', b)
    }, ['top', 'PROPOSED: the failed-save warning'])
    await shot(page, `Q1-waiting-proposed-${sfx}`)
    await page.evaluate(() => document.querySelectorAll('.saveband.mg-new').forEach(x => x.remove()))
    /* the guest page */
    await page.click('#accGuest'); await page.waitForTimeout(900)
    await mark(page)
    await page.evaluate(() => { const n = document.querySelector('#guestApp .guestbar'); n.classList.add('mg-today'); n.dataset.mg = 'TODAY: no warning — the request is still not saved' })
    await shot(page, `Q1-guest-today-${sfx}`, size === 'desktop' ? { x: 0, y: 0, width: 1536, height: 360 } : { x: 0, y: 0, width: 402, height: 420 })
    await page.evaluate(() => { const n = document.querySelector('#guestApp .guestbar'); n.classList.remove('mg-today') })
        await page.evaluate(([place, label]) => {
      const b = document.createElement('div')
      b.className = 'saveband mg-new'; b.setAttribute('role', 'status'); b.dataset.mg = label
      b.innerHTML = '<span class="sv-msg"><span class="sv-ico" aria-hidden="true">⚠</span>Not saved — keep this page open</span><button type="button">Retry</button>'
      if (place === 'top') { Object.assign(b.style, { position: 'fixed', top: '0', left: '0', right: '0', zIndex: '9999', height: '40px' }); document.body.appendChild(b) }
      else document.querySelector('#guestApp .guestbar').insertAdjacentElement('afterend', b)
    }, ['guest', 'PROPOSED: the same warning band, under the guest bar'])
    await page.waitForTimeout(200)
    await shot(page, `Q1-guest-proposed-${sfx}`, size === 'desktop' ? { x: 0, y: 0, width: 1536, height: 360 } : { x: 0, y: 0, width: 402, height: 420 })
    await page.context().close()
  }
  /* ---- Q2: a member's own Scheduler cell on Quals ---- */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'us', 'us')
    await page.evaluate(() => window.go('quals')); await page.waitForTimeout(700)
    await page.locator('#qEdit').click(); await page.waitForTimeout(600)
    await mark(page)
    /* bring his row and the Scheduler column into sight the way a person does — the table's own sideways scroll, the
       page's own scroll — then cut the picture from the pinned heading to just under his row, the whole width */
    const clipOf = async () => page.evaluate(() => {
      const cell = document.querySelector('#page-quals td[data-q="bane|sched"]'); const row = cell.closest('tr')
      let sc = cell.parentElement; while (sc && !(sc.scrollWidth > sc.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowX))) sc = sc.parentElement
      if (sc) { const cr = cell.getBoundingClientRect(), sr = sc.getBoundingClientRect(); sc.scrollLeft += (cr.left - sr.left) - 150 }
      const rr = row.getBoundingClientRect(); window.scrollBy(0, rr.top - window.innerHeight / 2)
      const head = document.querySelector('#page-quals thead tr') || document.querySelector('#page-quals tr')
      const r = row.getBoundingClientRect(), h = head.getBoundingClientRect()
      /* on the phone the test browser left the pinned headings where they were after a scripted sideways scroll (a finger
         scroll was not tried) — so the phone's picture starts under them, the cell named by its tag instead */
      const y = window.innerWidth < 700 ? Math.max(h.bottom + 2, r.top - 160) : Math.max(0, Math.min(h.top, r.top - 160))
      return { x: 0, y, width: window.innerWidth, height: Math.min(window.innerHeight, r.bottom + 50) - y }
    })
    await page.evaluate(() => { const c = document.querySelector('#page-quals td[data-q="bane|sched"]'); c.classList.add('mg-today'); c.dataset.mg = 'TODAY: his own Scheduler tick — he can untick it' })
    await page.waitForTimeout(150)
    { await clipOf(); await page.waitForTimeout(500); await page.waitForTimeout(400) } await shot(page, `Q2-quals-today-${sfx}`, await clipOf())
    /* proposed: the cell reads only, as his Management cell does (the same class and title) */
    await page.evaluate(() => {
      const c = document.querySelector('#page-quals td[data-q="bane|sched"]'); c.classList.remove('mg-today')
      c.classList.add('qro', 'mg-new'); c.title = 'Only an admin can appoint a scheduler'; c.dataset.mg = 'PROPOSED: reads only, like Management'
    })
    await page.waitForTimeout(150)
    await page.waitForTimeout(400); await shot(page, `Q2-quals-proposed-${sfx}`, await clipOf())
    await page.context().close()
  }
  /* ---- Q3: a member put on Edit Schedule by the developer bridge — the Amendments panel ---- */
  if (size === 'desktop') {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
    const signAll = async () => { for (const sel of await page.locator('select[data-signday="0"]').all()) { const v = await sel.evaluate(s => [...s.options].map(o => o.value).find(Boolean) || ''); if (v) { await sel.selectOption(v); await page.waitForTimeout(250) } } }
    await signAll(); await page.locator('button[data-beak="0"]').click(); await page.waitForTimeout(600)
    await page.locator('#eWeek [data-txt="dn:0.0"]').first().click(); await page.keyboard.press('End'); await page.keyboard.type(' MG'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
    await signAll()
    await L.signOut(page); await L.signIn(page, 'us', 'us')
    await page.evaluate(() => window.setPage('editsched')); await page.waitForTimeout(700)
    await mark(page)
    await page.evaluate(() => { const r = document.querySelector('#alPanel .al-pubday'); r.classList.add('mg-today'); r.dataset.mg = 'TODAY (member, developer route only): looks live, a press does nothing' })
    await page.waitForTimeout(150)
    const clip = await page.evaluate(() => { const r = document.querySelector('#alPanel').getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 30), width: 1536, height: r.height + 60 } })
    await shot(page, 'Q3-amendments-today-desk', clip)
    await page.evaluate(() => { const r = document.querySelector('#alPanel .al-pubday'); r.style.display = 'none'; const p = document.querySelector('#alPanel .al-pend'); p.classList.add('mg-new'); p.dataset.mg = 'PROPOSED: the count only, no Publish button for a member' })
    await page.waitForTimeout(150)
    const clip2 = await page.evaluate(() => { const r = document.querySelector('#alPanel').getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 30), width: 1536, height: r.height + 60 } })
    await shot(page, 'Q3-amendments-proposed-desk', clip2)
    await page.context().close()
  }
}
await L.finish('mock')
