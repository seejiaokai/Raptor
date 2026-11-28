// shr-a-a11 — share A, A11 (O-S15): the fixture filed by the admin; Ranger signed in as a member (same tab); the Board on
// the day; his own row's boxes tapped and typed. EXPECTED: read-only — no box takes typing, nothing saved.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=phone|desk ENG=chromium node scripts/handpass/shr-a-a11.mjs
import { L, J, sleep, add, done, world, read, pic, fixture, note, caret, pressAt, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a11 v1', TAG)
const steps = [], pics = [], checks = []
const chk = (n, ok, seen) => checks.push(`${ok ? 'ok' : 'WRONG'} ${n}: ${seen}`)
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w)
  steps.push({ step: 'filed by the admin', store: await (await import('./shr-a-lib.mjs')).store(p) })
  await sleep(1200)
  let who = null
  for (const u of ['us']) {
    try { await L.signIn(w, u); who = u; break } catch (e) { steps.push({ step: `sign-in as ${u} refused: ${e.message.split('\n')[0].slice(0, 120)}` }); await p.goto(L.URL).catch(() => {}) }
  }
  if (!who) throw new Error('Ranger could not sign in')
  const me = await p.evaluate(() => [window.ME, window.CURUSER, window.USER].map(x => x && (x.id || x.p || x.name || x)).filter(Boolean).join(' / '))
  steps.push({ step: `signed in as ${who}; the app's own user: ${me}` })
  /* the Board on the day, by the doors a member has */
  const pages = await p.evaluate(() => [...document.querySelectorAll('[data-go], nav button, #burger')].filter(e => e.offsetWidth).map(e => e.getAttribute('data-go') || e.id || e.textContent.trim()).slice(0, 30))
  steps.push({ step: 'doors on screen: ' + J(pages) })
  /* the member's own doors: the menu */
  await pressAt(w, '#burger', 'burger'); await sleep(400)
  const menu = await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => e.offsetWidth).map(e => e.textContent.trim()).filter(Boolean))
  steps.push({ step: 'the member\'s menu: ' + J(menu) })
  pics.push(await pic(w, 'a11-member-menu', ['body']))
  const hasBoardDoor = menu.some(t => /Edit Sched|Scheduler|Board/i.test(t) && !/View-only/i.test(t))
  await p.keyboard.press('Escape'); await sleep(300)
  /* the day he can reach: the view-only schedule — read whether any box of the Unavailable list takes typing */
  await L.go(p, 'viewsched'); await sleep(500)
  const ed = await p.evaluate(() => [...document.querySelectorAll('#vWeek input:not([type=hidden]), #vWeek textarea, #vWeek [contenteditable="true"]')].filter(e => e.offsetWidth && !e.readOnly && !e.disabled).map(e => (e.getAttribute('data-inp') || e.getAttribute('data-ifld') || e.className)).slice(0, 10))
  const unavTxt = await p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="2"]') || document.querySelector('#vWeek .day'); return d ? [...d.querySelectorAll('*')].filter(e => e.children.length === 0 && /Ranger|Hex/.test(e.textContent)).map(e => e.closest('tr, .row, [class*="row"]')?.innerText?.replace(/\s+/g, ' ').slice(0, 120)).filter(Boolean).slice(0, 6) : [] })
  steps.push({ step: `view-only schedule: editable boxes ${J(ed)}; Ranger/Hex lines ${J(unavTxt)}` })
  await p.evaluate(() => (document.querySelector('#vWeek .day[data-day="2"]') || document.querySelector('#vWeek'))?.scrollIntoView({ block: 'start' }))
  pics.push(await pic(w, 'a11-member-viewsched', ['body']))
  const opened = 'no Board'
  if (opened !== 'Board open') {
    add('A11', hasBoardDoor ? 'FAIL' : 'RECORDED', { says: hasBoardDoor ? 'a member\'s menu offers a door to the Board' : `a member has no door to the Scheduler Board (menu ${J(menu)}); the day he can reach, the view-only schedule, has ${ed.length} editable box(es)`, checks, steps }, pics)
  } else {
    const boxes = await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].filter(r => r.querySelector('[data-person="bane"]')).flatMap(r => [...r.querySelectorAll('[data-ifld]')].map(e => ({ k: e.getAttribute('data-ifld'), ro: e.readOnly, dis: e.disabled, v: e.value }))))
    steps.push({ step: 'his row boxes: ' + J(boxes) })
    if (!boxes.length) chk('his row is drawn with boxes', false, 'no boxes on his Unavailable row (row text: ' + J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].map(r => r.innerText.replace(/\s+/g, ' ')).slice(0, 4))) + ')')
    for (const b of boxes) {
      const sel = `#schedBoard [data-ifld="${b.k}"]`
      const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {})
      await (w.tap ? l.tap() : l.click()).catch(e => steps.push({ step: 'tap refused: ' + e.message.split('\n')[0] }))
      await sleep(600); const c = await caret(p)
      await p.keyboard.type(b.k.endsWith('rmks') ? 'mine' : '0900'); await p.keyboard.press('Tab'); await sleep(600)
      const v = await l.inputValue().catch(() => '?')
      const r = await read(p, `${b.k} tapped (caret ${c}), typed, Tab — box now ${v}`); steps.push(r)
      chk(`${b.k.split('.').pop()} takes no typing and saves nothing`, v === b.v && r.store.length === 1 && /^LL Ranger\+Hex Jul 15 480-600 ""/.test(r.store[0]), `box ${J(b.v)} → ${J(v)}; readOnly ${b.ro}; store ${J(r.store)}`)
    }
    pics.push(await pic(w, 'a11-after-typing'))
    add('A11', checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, steps }, pics)
  }
} catch (e) { add('A11', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
await done('a11')
