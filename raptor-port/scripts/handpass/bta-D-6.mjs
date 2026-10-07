/* Walker D — S37 (rest): (A) the member at the scheduler board reached through the probe bridge; (B) the guest (access request + the admin's guest switch). */
import * as D from './bta-D-lib.mjs'
import * as AD from './dbrA-W2-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const T = 'S37'
const which = process.argv[2] || 'all'

async function memberBoard() {
  const { browser, p, errors } = await K.fresh()
  try {
    await B.reloadAs(p, 'm'); await sleep(500)
    await p.evaluate(() => { window.go('editsched') }).catch(() => {}); await sleep(700)
    await p.evaluate(() => { try { window.openScheduler(1) } catch (e) {} }).catch(() => {}); await sleep(800)
    const info = await p.evaluate(() => {
      const sel = [...document.querySelectorAll('#schedBoard select[data-sign]')].map(s => ({ role: s.dataset.sign, disabled: s.disabled, shown: s.offsetParent !== null }))
      const cs = document.querySelector('#schedBoard [data-bfld="ff:1.0.0.cs"]')
      const ctl = sel.length
      return { page: window.CURPAGE, board: !!document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth > 0, sel, cs: cs ? { tag: cs.tagName, readOnly: cs.readOnly, disabled: cs.disabled, ce: cs.contentEditable, val: cs.value } : null,
        btns: [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent !== null).map(b => b.innerText.trim() || b.title || b.id).filter(Boolean).slice(0, 40) }
    })
    const cs0 = await p.evaluate(() => window.DAYS[1].waves[0].formations[0].cs)
    let typed = 'no box'
    const box = p.locator('#schedBoard [data-bfld="ff:1.0.0.cs"]').first()
    if (await box.count()) { try { await box.focus({ timeout: 1500 }); await p.keyboard.type('ZZ', { delay: 10 }); await box.evaluate(e => e.blur()); await sleep(400); typed = 'focused and typed ZZ' } catch (e) { typed = 'could not focus the box: ' + String(e).slice(0, 90) } }
    const cs1 = await p.evaluate(() => window.DAYS[1].waves[0].formations[0].cs)
    let signTry = 'no sign-off select'
    const s1 = p.locator('#schedBoard select[data-sign="cur"]').first()
    const head0 = await p.evaluate(() => (document.querySelector('#schedBoard .signedln, #schedBoard .nysmark') || { innerText: '' }).innerText)
    if (await s1.count()) {
      const opts = await s1.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
      try { await s1.selectOption(opts[0], { timeout: 1500 }); await sleep(400); signTry = `tried to pick "${opts[0]}": the box now reads "${await s1.evaluate(s => s.options[s.selectedIndex]?.text)}"` } catch (e) { signTry = 'could not pick a name: ' + String(e).slice(0, 90) }
    }
    const shot = await B.pic(p, 'dk-s37-6-member-board')
    const rowsAfter = await p.evaluate(() => JSON.stringify((window.DAYS[1].sign || window.DAYS[1].signoff || {})))
    R(`${T}.5b`, `as the member, the scheduler board reached by the probe bridge's openScheduler (no Edit Schedule tab exists for him): its doors, then a try at typing a callsign and picking a sign-off name`,
      `page "${info.page}", board drawn ${info.board} · buttons drawn on the board: ${JSON.stringify(info.btns)} · sign-off selects ${JSON.stringify(info.sel)} · callsign box ${JSON.stringify(info.cs)} · ${typed}; the line's callsign "${cs0}" → "${cs1}" · sign-off: ${signTry}; day sign state after: ${rowsAfter}`, 'RECORDED', [shot])
  } catch (e) { R(T + '.5b', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, 's37b-X')]) }
  R(`${T}.5b.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function guest() {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = await D.file(p, 'LL', 'Walker D'); await D.seatBlank(p); await D.pub(p); await D.lift(p, f.iid)
    await L.go(p, 'admin'); await sleep(600)
    await p.locator('button', { hasText: /^Users/ }).first().click().catch(() => {}); await sleep(700)
    const sw = p.locator('#admGuestView'); await sw.scrollIntoViewIfNeeded().catch(() => {})
    const was = await sw.isChecked().catch(() => null)
    if (was === false) { await sw.check(); await sleep(500) }
    const now = await sw.isChecked().catch(() => null)
    R(`${T}.6`, `admin: Admin → Users → "Let people waiting for access view the schedule (read only)" switched on (was ${was})`, `switch now ${now}`, now ? 'PASS' : 'NOT WALKED', [await B.pic(p, 'dk-s37-7-guest-switch')])
    await AD.signOut(p)
    await AD.cardSignIn(p, 'walkerd', 'x')
    const onReq = await p.locator('#accessRequest:visible').count()
    if (onReq) {
      await p.fill('#accCs', 'Walkerd'); await p.fill('#accIni', 'WD')
      const seatOpts = await p.locator('#accSeat option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
      await p.selectOption('#accSeat', seatOpts[0]); await sleep(200)
      if (await p.locator('#accCat:visible').count()) { const co = await p.locator('#accCat option').evaluateAll(os => os.map(o => o.value).filter(Boolean)); await p.selectOption('#accCat', co[0]) }
      await p.click('#accSend'); await sleep(800)
    }
    const waiting = await p.locator('#accessWaiting:visible').count()
    const gbtn = await p.locator('#accGuest:visible').count()
    const shotA = await B.pic(p, 'dk-s37-8-guest-waiting')
    if (gbtn) { await p.click('#accGuest'); await sleep(1500) }
    const g = await p.evaluate(i => {
      const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
      const d = document.querySelector(`.day[data-day="${i}"]`)
      const box = d ? d.querySelector(`[data-dwbox="${i}"]`) : null
      return { page: window.CURPAGE, role: (window.raptorRole || null), body: t(document.body).slice(0, 300), hasDay: !!d, dayHead: d ? t(d.querySelector('.day-head') || d).slice(0, 160) : null, bar: box ? t(box.querySelector('.daywarn')) : '(no warnings bar drawn)',
        lines: box ? [...box.querySelectorAll('.witem')].map(e => t(e).slice(0, 140)) : [], info: !!(d && d.querySelector('.dinfobtn')), writeDoors: d ? d.querySelectorAll('[data-woff], select[data-sign], [data-beak], [data-alpub], [data-txt]').length : 0,
        pucks: d ? [...d.querySelectorAll('.puck[data-person="split"]')].filter(e => e.offsetParent !== null).map(e => ({ cls: String(e.className), shadow: getComputedStyle(e).boxShadow.slice(0, 40), chip: ((e.querySelector('.lchip') || {}).innerText || '') })) : [] }
    }, TUE)
    let shotB = await B.pic(p, 'dk-s37-9-guest-view')
    let shotC = null
    if (g.hasDay) { await p.evaluate(i => { const d = document.querySelector(`.day[data-day="${i}"]`); d && d.scrollIntoView({ block: 'start' }) }, TUE); await sleep(300); shotC = await B.pic(p, 'dk-s37-10-guest-tuesday') }
    R(`${T}.7`, `a new name asks for access on the sign-in card (request form shown: ${!!onReq}; waiting screen: ${!!waiting}; "View the schedule" button: ${!!gbtn}), then "View the schedule" is pressed — the guest view of Tuesday (published WITH the warning, the leave since lifted)`,
      `guest page ${JSON.stringify(g)}`, g.hasDay ? 'RECORDED' : 'PARTIAL', [shotA, shotB, shotC].filter(Boolean))
  } catch (e) { R(T + '.7', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, 's37g-X')]) }
  R(`${T}.7.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
if (which === 'member' || which === 'all') await memberBoard()
if (which === 'guest' || which === 'all') await guest()
B.savePart('bta-D-s37b-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 2600)}\n      pics ${(r.pics || []).join(' ')}`)
