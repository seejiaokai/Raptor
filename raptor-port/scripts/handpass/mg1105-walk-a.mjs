// Scenario A — a member on Edit Schedule. Usage: WALK_DIR=... MG_OUT=... node mg1105-walk-a.mjs desktop|phone
import { L, press, pressShot, memberFixture } from './mg1105-walk-common.mjs'
const { say, note, check } = L
const size = process.argv[2] || 'desktop'
const h = await L.open(size)
const { page } = h
const tag = size === 'desktop' ? 'Ad' : 'Ap'
try {
  const live = await memberFixture(h)
  check(tag + '0', 'fixture: admin sees live Publish AL1', !!live && !live.disabled, live)
  await L.shotEl(page, '#alPanel', tag + '0', 'admin-alpanel')
  await L.signOut(page); await L.signIn(page, 'us', 'us')
  await page.evaluate(() => window.setPage('editsched')); await page.waitForTimeout(800)
  await L.shot(page, tag + '1', 'member-editsched')
  await L.shotEl(page, '#alPanel', tag + '1', 'member-alpanel')
  // A1
  const btn = page.locator('#alPanel .al-pubday button').first()
  const look = await page.evaluate(() => { const b = document.querySelector('#alPanel .al-pubday button'); return b ? { text: b.textContent.trim(), disabled: b.disabled, title: b.title, panel: document.querySelector('#alPanel').innerText.replace(/\s+/g, ' ').slice(0, 300) } : null })
  note(tag + '1-look', look)
  let s = await L.state(page)
  const vis = !!(await btn.count()) && await btn.isVisible().catch(() => false)
  if (!vis) note(tag + 'A1-hidden', await page.evaluate(() => { const pn = document.querySelector('#alPanel'); if (!pn) return 'no #alPanel'; const r = pn.getBoundingClientRect(); const cs = getComputedStyle(pn); let hid = []; for (let e = pn; e && e !== document.body; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden') hid.push(e.tagName + '#' + e.id + '.' + e.className) } return { rect: [r.x, r.y, r.width, r.height], display: cs.display, hiddenAncestors: hid, scrollX: window.scrollX } }))
  if (vis) {
    await btn.scrollIntoViewIfNeeded()
    await press(h, btn)
    if (h.tap) await L.shot(page, tag + '1', 'publish-instant')
    const instantText = await page.evaluate(() => ({ btn: (document.querySelector('#alPanel .al-pubday button') || {}).textContent, toast: (document.getElementById('toastEl') || {}).textContent }))
    await page.waitForTimeout(700)
    await L.shot(page, tag + '1', 'publish-settled')
    await L.shotEl(page, '#alPanel', tag + '1', 'alpanel-after-publish')
    const after = await page.evaluate(() => ({ btn: (document.querySelector('#alPanel .al-pubday button') || {}).textContent, list: (document.querySelector('#alPanel .al-list') || {}).innerText, toast: (document.getElementById('toastEl') || {}).textContent, dialogs: [...document.querySelectorAll('[role=dialog], .modal, .confirm')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.slice(0, 200)) }))
    const w = await L.writesSince(page, s.writes), said = await L.notesSince(page, s.notes)
    check(tag + 'A1', 'Publish AL1 by member: 0 writes, list still none', w.length === 0 && /No amendments published yet/.test(after.list || ''), { writes: w, instantText, after, said })
  } else note(tag + 'A1', 'no Publish button found for member')

  // A2 day head controls
  const heads = await page.evaluate(() => {
    const d = document.querySelector('#eWeek .day') || document.querySelector('.day')
    if (!d) return null
    const head = d.querySelector('.dayhead, .dhead, header') || d
    return [...d.querySelectorAll('button, [role=button], select, summary')].slice(0, 25).map(e => `${e.tagName}|${e.className}|${(e.getAttribute('aria-label') || e.title || e.textContent || '').trim().slice(0, 50)}|${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name).join(',')}`)
  })
  note(tag + 'A2-controls', heads)
  const cand = [
    ['plan selector', page.locator('#eWeek .day').first().locator('[data-planmenu], button[title*="Switch between"], button[aria-label*="Switch between"]').first()],
    ['see changes', page.locator('#eWeek .day').first().locator('button[data-pendlist]').first()],
    ['info/approval', page.locator('#eWeek .day').first().locator('button[data-dayinfo]').first()],
  ]
  for (const [name, loc] of cand) {
    if (!(await loc.count())) { note(tag + 'A2-' + name, 'not found / not visible'); continue }
    s = await L.state(page)
    await loc.scrollIntoViewIfNeeded().catch(() => {})
    const lab = (await loc.textContent() || '').trim().slice(0, 40)
    await pressShot(h, loc, tag + 'A2', name.replace(/\W+/g, '-') + '-open')
    const opened = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal, .popup, .menu, .pmenu, .planmenu, [class*=menu], [class*=pop]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 30 && r.height > 20 }).slice(0, 4).map(e => `${e.className}: ${e.innerText.replace(/\s+/g, ' ').slice(0, 160)}`))
    const said = await L.notesSince(page, s.notes)
    const OPEN = '.chgwin, .airpop, .planmenu, .pmenu, [role=dialog]'
    const isOpen = () => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 30 && r.height > 20 }).length, OPEN)
    const openNow = await isOpen()
    const tn = name.replace(/[^a-z0-9]+/gi, '-')
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    await L.shot(page, tag + 'A2', tn + '-after-escape')
    const stillOpen1 = await isOpen()
    await page.mouse.click(h.tap ? 200 : 700, 5); await page.waitForTimeout(400)
    await L.shot(page, tag + 'A2', tn + '-after-outside')
    const stillOpen2 = await isOpen()
    let closedBy = 'no own close control found'
    const closer = page.locator('.chgwin .win-x, .airpop #dayPopClose').first()
    if (await closer.count() && await closer.isVisible().catch(() => false)) { await press(h, closer); await page.waitForTimeout(400); closedBy = 'own ✕ pressed'; await L.shot(page, tag + 'A2', tn + '-after-own-close') }
    const stillOpen3 = await isOpen()
    const w = await L.writesSince(page, s.writes)
    check(tag + 'A2', `${name} (${lab}): nothing saved`, w.length === 0, { opened, said, openAtStart: openNow, stillOpenAfterEsc: stillOpen1, stillOpenAfterOutside: stillOpen2, closedBy, stillOpenAfterOwnClose: stillOpen3, writes: w })
    if (stillOpen3) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  }

  if (size === 'desktop') {
    // A3 drag a puck from the AIRCREW panel to an empty seat of Monday
    s = await L.state(page)
    const info = await page.evaluate(() => {
      const pk = document.querySelector('#palette .puck, #aircrew .puck, .palette .puck, [id*=pal] .puck, .crewpanel .puck')
      const seats = [...document.querySelectorAll('#eWeek .day:first-of-type [data-slot], #eWeek [data-key^="0."]')].filter(e => !e.querySelector('.puck') && e.getBoundingClientRect().width > 5)
      return { pk: pk ? pk.className + '|' + pk.textContent.trim().slice(0, 20) + '|' + pk.parentElement.id : null, seats: seats.length, seat0: seats[0] ? seats[0].outerHTML.slice(0, 160) : null }
    })
    note(tag + 'A3-find', info)
    await page.evaluate(() => { const p = [...document.querySelectorAll('.puck[data-person]')].find(e => !e.closest('.day-body') && !e.closest('#eWeek') && /Comet/.test(e.textContent)); if (p) p.setAttribute('data-mgpal', '1'); let sp = [...document.querySelectorAll('#eWeek [data-slot^="a:0."]:not(.puck)')].filter(e => !e.querySelector('.puck') && e.getBoundingClientRect().width > 5); window.__empty = sp.length; if (!sp.length) sp = [...document.querySelectorAll('#eWeek .seat[data-slot^="0."]')].filter(e => e.getBoundingClientRect().width > 5).slice(1); if (sp[0]) sp[0].setAttribute('data-mgseat', '1'); window.__a3 = { emptyFound: window.__empty, pal: !!p, seats: sp.length, slot: sp[0] && sp[0].getAttribute('data-slot') } })
    note(tag + 'A3-find2', await page.evaluate(() => window.__a3))
    const pk = page.locator('[data-mgpal]').first()
    const seat = page.locator('[data-mgseat]').first()
    if (await pk.count() && await seat.count()) {
      await seat.scrollIntoViewIfNeeded()
      const pb = await pk.boundingBox(), sb = await seat.boundingBox()
      await L.shot(page, tag + 'A3', 'before')
      if (pb && sb) {
        await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await page.mouse.down()
        for (let i = 1; i <= 12; i++) { await page.mouse.move(pb.x + (sb.x - pb.x) * i / 12 + sb.width / 2, pb.y + (sb.y - pb.y) * i / 12 + sb.height / 2); await page.waitForTimeout(40) }
        await L.shot(page, tag + 'A3', 'mid-drag')
        await page.mouse.up(); await page.waitForTimeout(600)
        await L.shot(page, tag + 'A3', 'after')
      } else note(tag + 'A3', { pb, sb })
      const st2 = await L.state(page), w = await L.writesSince(page, s.writes)
      check(tag + 'A3', 'puck drag lands nothing, nothing saved', w.length === 0 && st2.model === s.model, { writes: w, modelSame: st2.model === s.model })
    } else note(tag + 'A3', 'NOT WALKED — no puck or seat found: ' + JSON.stringify({ pk: await pk.count(), seat: await seat.count() }))

    // A4 board
    s = await L.state(page)
    await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(800)
    await L.shot(page, tag + 'A4', 'board')
    const sel = page.locator('#schedBoard select[data-signday], #schedBoard select').first()
    note(tag + 'A4-find', await page.evaluate(() => [...document.querySelectorAll('#schedBoard select')].slice(0, 6).map(e => `${e.className}|${[...e.attributes].map(a => a.name + '=' + a.value).join(' ')}|${[...e.options].map(o => o.text).slice(0, 4).join('/')}`)))
    if (await sel.count()) {
      const v = await sel.evaluate(e => [...e.options].map(o => o.value).filter(Boolean).find(x => x !== e.value))
      const before = await sel.evaluate(e => e.value)
      await sel.selectOption(v)
      await L.shot(page, tag + 'A4', 'pill-right-after')
      const t0 = await page.evaluate(() => (document.getElementById('toastEl') || {}).textContent)
      await page.waitForTimeout(900)
      await L.shot(page, tag + 'A4', 'pill-settled')
      const val1 = await page.locator('#schedBoard select').first().evaluate(e => e.value)
      await page.mouse.click(700, 500); await page.waitForTimeout(500)
      await L.shot(page, tag + 'A4', 'pill-after-repaint')
      const val2 = await page.locator('#schedBoard select').first().evaluate(e => e.value)
      const w = await L.writesSince(page, s.writes), said = await L.notesSince(page, s.notes)
      check(tag + 'A4', 'sign-off pill: nothing saved', w.length === 0, { picked: v, before, valueSettled: val1, valueAfterRepaint: val2, toastRightAfter: t0, said, writes: w })
    } else note(tag + 'A4', 'NOT WALKED — no select on the board')
    // A5
    s = await L.state(page)
    const rem = page.locator('#schedBoard [placeholder="Remarks"]').first()
    if (await rem.count()) {
      const dis = await rem.evaluate(e => ({ disabled: e.disabled, readOnly: e.readOnly })); note(tag + 'A5-box', dis); await rem.click({ force: true }); await page.keyboard.type('ZZQ'); await L.shot(page, tag + 'A5', 'typed')
      await page.mouse.click(700, 600); await page.waitForTimeout(700)
      await L.shot(page, tag + 'A5', 'after-blur')
      const stay = await page.evaluate(() => document.getElementById('schedBoard').innerText.includes('ZZQ'))
      const w = await L.writesSince(page, s.writes), said = await L.notesSince(page, s.notes)
      check(tag + 'A5', 'remarks box: nothing saved, text does not stay', w.length === 0 && !stay, { boxState: dis, stay, writes: w, said })
    } else note(tag + 'A5', 'NOT WALKED — no remarks box found')
    // A6
    const closeBy = async (how) => {
      if (!(await page.locator('#schedBoard').isVisible().catch(() => false))) { await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(700) }
      if (how === 'done') await page.getByText(/Done/).first().click(); else await page.keyboard.press('Escape')
      await page.waitForTimeout(600)
      await L.shot(page, tag + 'A6', 'closed-by-' + how)
      return { boardGone: !(await page.locator('#schedBoard').isVisible().catch(() => false)), page: await page.evaluate(() => window.CURPAGE) }
    }
    const r1 = await closeBy('done'); const r2 = await closeBy('escape')
    check(tag + 'A6', 'board closes by Done and by Escape, Edit Schedule under it', r1.boardGone && r2.boardGone && r1.page === 'editsched' && r2.page === 'editsched', { r1, r2 })
  }
} catch (e) { say('SCRIPT ERROR ' + (e.stack || e).toString().split('\n').slice(0, 4).join(' | ')) }
await L.shot(page, tag + 'Z', 'final').catch(() => {})
await L.finish('a-' + size)
