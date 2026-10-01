/* Scenario 18 — every ordinary page, each width and each eligible role opens the identical window. (A guest: excluded.) */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '18'
const PAGES = [['viewsched', 'View-only Sched'], ['editsched', 'Edit Schedule'], ['inputs', 'Inputs'], ['quals', 'Quals'], ['logic', 'Logic'], ['leavewar', 'Leave War'], ['tracker', 'Tracker'], ['help', 'Help'], ['admin', 'Admin']]
/* which pages this sign-in is offered (its own navigation: the top bar on a desktop, the ☰ drawer on a phone) */
async function drawerShut(p) { if (await p.locator('#drawer.open').count()) { await p.mouse.click(378, 640); await L.sleep(350) } }
async function offered(p) {
  if (A.PHONE) { await p.locator('#burger:visible').first().click(); await L.sleep(350) }
  const ids = await p.evaluate(() => [...document.querySelectorAll('[data-go], [data-page]')].filter(e => e.offsetParent !== null).map(e => (e.dataset.go || e.dataset.page || '') + '|' + e.innerText.trim()))
  if (A.PHONE) await drawerShut(p)
  return PAGES.filter(([id, name]) => ids.some(x => x.startsWith(id + '|') || x.endsWith('|' + name)))
}
async function visit(p, ref, who, pages) {
  const out = []
  for (const [id, name] of pages) {
    await W.boardOff(p)
    await L.go(p, id); await L.sleep(300)
    const o = await A.insOpen(p)
    if (o.err) { out.push({ name, err: o.err }); continue }
    const r = await A.insRead(p)
    const shot = await pic(p, `s18-${who}-${id}`)
    /* the foot of the window can be reached, and is the thing on top there too */
    const foot = await p.evaluate(() => { const b = document.querySelector('#insightBody'), box = document.querySelector('#insightModal .modal-box'); const rows = b.querySelectorAll('.irow'); const last = rows[rows.length - 1]; last.scrollIntoView({ block: 'end' }); const r = last.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { text: last.innerText.replace(/\s+/g, ' ').trim(), inView: r.top >= 0 && r.bottom <= innerHeight, top: !!h && box.contains(h) } })
    const page = await p.evaluate(() => window.CURPAGE)
    await A.insClose(p)
    out.push({ name, how: o.how, page, same: A.same(ref, r), diff: A.same(ref, r) ? '' : A.diffText(ref, r), top: r.top, fits: r.box.x >= 0 && r.box.y >= 0 && r.box.x + r.box.w <= r.vw && r.box.y + r.box.h <= r.vh, box: r.box, title: r.title, foot, shot })
  }
  return out
}
const ok = v => !v.err && v.same && v.top && v.fits && v.foot.inView && v.foot.top && /^Sunday/.test(v.foot.text) && /Jul 13 – Jul 19/.test(v.title)
const say = vs => vs.map(v => v.err ? `${v.name}: ${v.err}` : `${v.name}: ${v.same ? 'identical' : 'DIFFERS ' + v.diff}${v.top ? '' : ' NOT ON TOP'}${v.fits ? '' : ' CLIPPED ' + JSON.stringify(v.box)}${v.foot.inView && v.foot.top ? '' : ' FOOT NOT REACHABLE'}`).join(' · ')
await A.run(S, async p => {
  /* the fixture: a published Tuesday with a change waiting */
  await A.toEdit(p)
  await A.pubOrig(p, TUE)
  const i0 = await A.insNow(p)
  await W.boardOn(p, TUE)
  const did = A.PHONE ? await A.cxLine(p, '1.1.1.0') : JSON.stringify(await A.seatPut(p, '1.1.1.0.p', 'shaft'))
  if (!A.PHONE) await A.cxLine(p, '1.0.0.1')
  await W.boardOff(p)
  const f = await A.face(p, TUE)
  const ref = await A.insNow(p)
  judge(`${S}.fix`, `admin: Tuesday published; on the board ${A.PHONE ? 'CX on Go 2\'s RU lead line' : 'Anvil on Rebel\'s seat and CX on Go 1\'s VL no. 2'} (${did}); ✓ Done`, [
    ['Tuesday is Original with changes waiting', /ORIG/.test(f.tag) && A.isPending(f), A.faceLine(f)],
    ['the expected window is the Original\'s, word for word', A.same(i0, ref), A.diffText(i0, ref)],
  ])
  row(`${S}.ref`, 'the expected window text (every page must match it word for word)', `"${ref.title}" · ${A.tilesLine(ref)} · ${A.sec(ref, /By day/i).join(' | ')} · idle ${A.sec(ref, /Not on the flying/i).length} names · ${A.sec(ref, /Work hours/i).length} Work-hours bars · ${A.sec(ref, /Conflicts by type/i).length} types`, 'RECORDED')

  /* admin */
  const pa = await offered(p)
  const va = await visit(p, ref, 'admin', pa)
  judge(`${S}.admin`, `admin (Saber): ${A.PHONE ? '☰ → Week insights' : 'the top bar\'s Insights'} over each page offered — ${pa.map(x => x[1]).join(', ')}`, [
    ['all nine pages offered', pa.length === 9, pa.length],
    ['every page: the door is there and opens the window', va.every(v => !v.err), va.filter(v => v.err).map(v => v.name + ': ' + v.err)],
    ['every page: identical contents, the right week title', va.every(v => !v.err && v.same && /Jul 13 – Jul 19/.test(v.title)), say(va)],
    ['every page: the window is the topmost thing at its centre', va.every(v => v.top)],
    ['every page: the window fits the screen and its last row (Sunday) can be scrolled to', va.every(v => !v.err && v.fits && v.foot.inView && v.foot.top), va.map(v => v.err ? '' : JSON.stringify(v.box)).join(' ')],
  ], va.map(v => v.shot).filter(Boolean))

  /* the admin's "Switch to the member view" (the role badge) */
  let sw = 'no switch found'
  if (A.PHONE) {
    await p.locator('#burger:visible').first().click(); await L.sleep(350)
    const d = p.locator('#drawerRole:visible').first()
    if (await d.count()) { const label = (await d.innerText()).trim(); const before = (await p.locator('#drawerAcct').innerText()).trim(); await d.click(); await L.sleep(600)
      await p.locator('#burger:visible').first().click(); await L.sleep(350); const after = (await p.locator('#drawerAcct').innerText()).trim(); const now = (await p.locator('#drawerRole').innerText().catch(() => '')).trim(); await drawerShut(p)
      sw = `☰ → "${label}": "${before}" → "${after} MEMBER-VIEW:${/Back to the admin view/.test(now)}"` } else await drawerShut(p)
  } else {
    const b2 = p.locator('#roleBadge:visible').first()
    if (await b2.count()) { const before = (await b2.innerText()).trim(); await b2.click(); await L.sleep(600); const after = await p.evaluate(() => { const e = document.querySelector('#roleBadge'); return e ? e.innerText.trim() : '' }); sw = `"${before}" → "${after}"` }
  }
  const pv = await offered(p)
  const vv = await visit(p, ref, 'memberview', pv)
  judge(`${S}.memberview`, `admin's switch to the member view (${sw}): the door over each page offered — ${pv.map(x => x[1]).join(', ')}`, [
    ['the switch took (the member view)', /MEMBER|Member/.test(sw.split('→').pop() || '') && !/MEMBER-VIEW:false/.test(sw), sw],
    ['every page: identical contents, on top, fits, foot reachable', vv.length > 0 && vv.every(ok), say(vv)],
  ], vv.map(v => v.shot).filter(Boolean))

  /* the member (Ranger), signed in on the same storage */
  await A.reloadAs(p, 'm')
  const pm = await offered(p)
  const vm = await visit(p, ref, 'member', pm)
  judge(`${S}.member`, `reload, signed in as the member (Ranger): the door over each page offered — ${pm.map(x => x[1]).join(', ')}`, [
    ['every page: identical contents, on top, fits, foot reachable', vm.length > 0 && vm.every(ok), say(vm)],
  ], vm.map(v => v.shot).filter(Boolean))
  row(`${S}.guest`, 'a guest', 'excluded, as the scenario says — the guest view has no Insights button by design; not walked', 'NOT WALKED (excluded by the brief)')
})
