// bell190 walker A — group 8: a published day — an add waiting as an amendment, then the amendment published [F44, A35];
// group 9: Undo of an add before Ranger reads it, and after he read it [F45, F46, A38, A39]. Desktop, Edit Schedule week.
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g89 v2', L.LIBV)
const R = L.recorder('bell190-a-g89')
const only = process.argv[2] || ''
const { ID, J } = L
const linesTo = (ns, pid) => ns.filter(n => [].concat(n.to).includes(pid))
async function signAndPublish(w, di, log) {
  const p = w.page
  const sels = await p.locator(`#eWeek [data-signbar="${di}"] select[data-sign]`).count()
  for (let i = 0; i < sels; i++) {
    const s = p.locator(`#eWeek [data-signbar="${di}"] select[data-sign]`).nth(i)
    await s.scrollIntoViewIfNeeded()
    const opts = await s.evaluate(e => [...e.options].map(o => o.value).filter(Boolean))
    if (opts.length) await s.selectOption(opts[0]); await L.sleep(250)
  }
  const btn = p.locator(`#eWeek button[data-beak="${di}"], #eWeek button[data-alpub="${di}"]`).filter({ visible: true }).first()
  if (!(await btn.count())) { log('  no publish button'); return { ok: false, signed: sels } }
  const t = await btn.textContent(); const dis = await btn.isDisabled()
  if (dis) { log('  publish button greyed: ' + await btn.getAttribute('title')); return { ok: false, signed: sels, title: await btn.getAttribute('title') } }
  await btn.scrollIntoViewIfNeeded(); await btn.click(); await L.sleep(900)
  /* any confirm it raises */
  const dlg = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [data-testid*="confirm"], [data-testid*="pub"]')].filter(e => e.getBoundingClientRect().width > 3).map(e => (e.getAttribute('data-testid') || e.className) + ': ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 200)))
  if (dlg.length) log('  publish raised: ' + JSON.stringify(dlg))
  const conf = p.locator('[role="dialog"] button:not([disabled]), [role="alertdialog"] button:not([disabled])').filter({ hasText: /^(Publish|Confirm|Yes)/ }).filter({ visible: true }).first()
  let confirmed = null
  if (await conf.count()) { confirmed = await conf.textContent(); await conf.click(); await L.sleep(900) }
  return { ok: true, signed: sels, pressed: t.trim(), confirmed, note: await L.toast(p) }
}
const stampOf = (p, di) => p.evaluate(di => { const d = document.querySelector(`#eWeek [data-signbar="${di}"]`)?.closest('.day'); const b = [...document.querySelectorAll('#eWeek .dbeak, #eWeek [data-alpub]')].filter(e => e.getBoundingClientRect().width > 3).map(e => (e.textContent || '').trim() + (e.getAttribute('data-alpub') ? '@' + e.getAttribute('data-alpub') : '') + (e.getAttribute('data-beak') ? '#' + e.getAttribute('data-beak') : '')); return b }, di)

/* ---------- group 8 ---------- */
for (const door of ['drop', 'inputs']) {
  const c = `A8-published-${door}-desk`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  const w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const p = w.page
    const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00' })
    await L.go(p, 'editsched')
    const pub = await signAndPublish(w, 2, console.log)
    const pb = `a-${c}`
    R(c, 'Wednesday published first', pub.ok ? 'DONE' : 'BLOCKED', { ...pub, buttons: await stampOf(p, 2) }, '', [await L.shot(w, pb + '-1-published')])
    if (!pub.ok) { await w.ctx.close(); continue }
    const n0 = await L.allNotices(p)
    let target = iid
    if (door === 'drop') {
      const place = await L.rowPlace(p, 2, iid, null)
      const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
      R(c, 'Ranger dropped on the Training\'s "+ add"', d.ok ? 'DONE' : 'BLOCKED', { drag: d.ok ? d.under : d.why, note: await L.toast(p), input: (await L.rec(p, iid)).people })
    } else {
      const i0 = await L.ids(p)
      const nid = await L.fileInput(w, L.WED, { type: 'Meeting', people: [ID.Ranger], from: '13:00', to: '14:00' })
      target = nid
      await L.go(p, 'editsched')
      R(c, 'a Meeting filed for Ranger on the Inputs page', nid ? 'DONE' : 'BLOCKED', { nid, rec: nid && await L.rec(p, nid) })
    }
    await L.sleep(500)
    const f1 = L.newSince(n0, await L.allNotices(p))
    R(c, 'what the bell holds while the change waits as an amendment', 'RECORD', { buttons: await stampOf(p, 2), lines: f1.map(L.fmtN) }, 'no ruling (F44): record when the line comes', [await L.shot(w, pb + '-3-pending')])
    /* the amendment published */
    const pub2 = await signAndPublish(w, 2, console.log)
    await L.sleep(600)
    const f2 = L.newSince(n0, await L.allNotices(p))
    const r2 = linesTo(f2, 'bane')
    R(c, 'the amendment published: no second line', pub2.ok ? (r2.length === 1 ? 'PASS' : 'FAIL') : 'BLOCKED', { publish: pub2, buttons: await stampOf(p, 2), rangerLines: r2.map(L.fmtN), all: f2.map(L.fmtN) }, 'Ranger one "You were added", never a second at publish (F44, A35)', [await L.shot(w, pb + '-4-amendment-published')])
    const rr = await L.readAs(w, 'us', pb + '-5-ranger', /Training|Meeting/)
    R(c, 'Ranger\'s bell on screen after the publish', (rr.bell.lines || []).filter(l => /You were added/.test(l.what)).length === 1 ? 'PASS' : 'FAIL', { lines: (rr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what} | ${l.cls}`), tap: rr.tap && { type: rr.tap.type, editor: rr.tap.editor } }, 'one line', [rr.bell.pic, rr.tap?.pic].filter(Boolean))
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}

/* ---------- group 9: Undo before he read it ---------- */
{
  const c = 'A9-undo-unread-week-desk'
  if (!only || c.includes(only)) {
    console.log('\n=====', c)
    const w = await L.newWorld('desk')
    try {
      await L.signIn(w, 'ad')
      const p = w.page
      const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00' })
      await L.go(p, 'editsched')
      const place = await L.rowPlace(p, 2, iid, null)
      const pb = `a-${c}`
      const n0 = await L.allNotices(p)
      const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
      await L.sleep(500)
      const f1 = L.newSince(n0, await L.allNotices(p))
      R(c, 'the add (Ranger on Tally\'s Training)', f1.length === 2 ? 'DONE' : 'NOTE', { drag: d.ok ? d.under : d.why, lines: f1.map(L.fmtN) })
      await p.locator('#undoBtn').click(); await L.sleep(800)
      const f2 = L.newSince(n0, await L.allNotices(p))
      R(c, 'Undo before he read it: his line and Tally\'s go', f2.length === 0 && J((await L.rec(p, iid)).people) === J(['nick']) ? 'PASS' : 'FAIL', { input: (await L.rec(p, iid)).people, linesLeft: f2.map(L.fmtN) }, 'F45: Ranger\'s line gone, the bell not lit; Tally\'s "Ranger added" gone', [await L.shot(w, pb + '-3-undone')])
      await p.locator('#redoBtn').click(); await L.sleep(800)
      const f3 = L.newSince(n0, await L.allNotices(p))
      R(c, 'Redo: the lines are back, unread', linesTo(f3, 'bane').length === 1 && linesTo(f3, 'nick').length === 1 ? 'PASS' : 'FAIL', { input: (await L.rec(p, iid)).people, lines: f3.map(n => L.fmtN(n) + ' read=' + J(n.read ?? n.seen ?? null)) }, 'F45: Redo — the lines are back, unread', [await L.shot(w, pb + '-4-redone')])
      await p.locator('#undoBtn').click(); await L.sleep(800)
      const rr = await L.readAs(w, 'us', pb + '-5-ranger', /Training/)
      R(c, 'Ranger\'s bell after Undo (signed in as him)', !(rr.bell.lines || []).some(l => /Training/.test(l.name)) ? 'PASS' : 'FAIL', { lit: rr.bell.lit, lines: (rr.bell.lines || []).map(l => `${l.name} | ${l.what} | ${l.cls}`), toast: rr.bell.toast }, 'nothing about the Training; bell not lit', [rr.bell.pic])
    } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
    await w.ctx.close().catch(() => {})
  }
}
/* ---------- group 9: Undo after he read it — one tab, as F46 is written (Saber signs back in and looks for Undo) ---------- */
{
  const c = 'A9-undo-after-read-one-tab-desk'
  if (!only || c.includes(only)) {
    console.log('\n=====', c)
    const w = await L.newWorld('desk')
    try {
      await L.signIn(w, 'ad')
      const p = w.page
      const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00' })
      await L.go(p, 'editsched')
      const place = await L.rowPlace(p, 2, iid, null)
      const pb = `a-${c}`
      const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
      const rr = await L.readAs(w, 'us', pb + '-3-ranger-reads', /Training/)
      await L.closeBell(w)
      await L.signOut(w); await L.signIn(w, 'ad'); await L.go(p, 'editsched')
      const u = await p.locator('#undoBtn').evaluate(b => ({ disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.title || b.getAttribute('aria-label') }))
      R(c, 'Saber signs back in after Ranger read it: is there an Undo', 'RECORD', { drag: d.ok ? 'ok' : d.why, rangerRead: (rr.bell.lines || []).map(l => `${l.name} | ${l.what}`), undo: u }, 'D148: his Undo list clears when he signs out — so F46 cannot be walked in one tab', [rr.bell.pic, await L.shot(w, pb + '-4-saber-back')])
    } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
    await w.ctx.close().catch(() => {})
  }
}
/* ---------- group 9: Undo after he read it — two tabs of one browser (Saber's tab keeps his Undo; Ranger reads in the other) ---------- */
{
  const c = 'A9-undo-after-read-two-tabs-desk'
  if (!only || c.includes(only)) {
    console.log('\n=====', c)
    const w = await L.newWorld('desk')
    try {
      await L.signIn(w, 'ad')
      const p = w.page
      const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00' })
      await L.go(p, 'editsched')
      const place = await L.rowPlace(p, 2, iid, null)
      const pb = `a-${c}`
      const n0 = await L.allNotices(p)
      const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
      await L.sleep(1200)
      R(c, 'the add', d.ok ? 'DONE' : 'BLOCKED', { input: (await L.rec(p, iid)).people, lines: L.newSince(n0, await L.allNotices(p)).map(L.fmtN) })
      /* tab 2: Ranger */
      const p2 = await w.ctx.newPage()
      const w2 = { ...w, page: p2 }
      await p2.goto(L.URL, { waitUntil: 'domcontentloaded' }); await L.sleep(1500)
      const asked = await p2.locator('#luser').isVisible().catch(() => false)
      let who2 = await p2.evaluate(() => (document.querySelector('#acctBtn, .acct, [data-testid="whoami"]')?.textContent || document.body.innerText.match(/(SABER|RANGER)\s*·\s*\w+/)?.[0] || '').trim())
      R(c, 'a second tab of the same browser opens', 'RECORD', { asksSignIn: asked, showsAs: who2 })
      if (asked) { await p2.fill('#luser', 'us'); await p2.fill('#lpass', 'us'); await p2.click('#loginForm button[type=submit]'); await p2.waitForSelector('#notifyBell', { state: 'attached' }); await L.sleep(800) }
      else R(c, 'tab 2 is already signed in — walk stops at this gesture', 'BLOCKED', who2)
      if (asked) {
        const b1 = await L.bell(w2, pb + '-3-tab2-ranger-reads')
        await L.sleep(1500); await L.closeBell(w2); await L.sleep(1200)
        const readMark = (await L.allNotices(p2)).filter(n => n.iid === iid && [].concat(n.to).includes('bane')).map(n => ({ read: n.read ?? n.seen ?? null, keys: Object.keys(n).join(',') }))
        R(c, 'Ranger reads his line in tab 2', 'RECORD', { lines: (b1.lines || []).map(l => `${l.name} | ${l.what} | ${l.cls}`), stored: readMark }, '', [b1.pic])
        /* tab 1 still Saber? his Undo */
        await p.bringToFront(); await L.sleep(500)
        const still = await p.evaluate(() => (document.body.innerText.match(/(SABER|RANGER)\s*·\s*\w+/) || [''])[0])
        const undoOn = await p.locator('#undoBtn').isEnabled().catch(() => false)
        await p.locator('#undoBtn').click().catch(() => {}); await L.sleep(1000)
        const after1 = await L.rec(p, iid)
        R(c, 'Saber presses Undo in tab 1', 'RECORD', { tab1ShowsAs: still, undoLive: undoOn, input: after1.people, tab1Lines: L.newSince(n0, await L.allNotices(p)).map(n => L.fmtN(n) + ' read=' + J(n.read ?? null)) }, '', [await L.shot(w, pb + '-4-tab1-undo')])
        await L.sleep(1500)
        await p2.bringToFront(); await p2.reload({ waitUntil: 'domcontentloaded' }); await L.sleep(1500)
        if (await p2.locator('#luser').isVisible().catch(() => false)) { await p2.fill('#luser', 'us'); await p2.fill('#lpass', 'us'); await p2.click('#loginForm button[type=submit]'); await p2.waitForSelector('#notifyBell', { state: 'attached' }); await L.sleep(800) }
        const b2 = await L.bell(w2, pb + '-5-tab2-ranger-after-undo')
        R(c, 'Ranger\'s bell after the Undo (tab 2 reloaded)', 'RECORD', { lit: b2.lit, lines: (b2.lines || []).map(l => `${l.name} | ${l.what} | ${l.cls}`), toast: b2.toast, stored: (await L.allNotices(p2)).filter(n => [].concat(n.to).includes('bane')).map(L.fmtN) }, 'D1693/D2437: a new unread line saying what is true now — not built for input lines; record today', [b2.pic])
      }
    } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
    await w.ctx.close().catch(() => {})
  }
}
await L.closeAll()
