import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const editable = () => p.locator(L.WIN).evaluate(w => [...w.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e => e.offsetParent && !e.disabled && !e.readOnly && !e.closest('[inert]')).map(e => e.id || e.dataset.pp || e.type))
try {
  await L.fileNew(w, { iso: '2026-07-21', type: 'Duty', title: 'Stores run', s: '09:00', e: '10:00' })
  await L.fileNew(w, { iso: '2026-07-22', type: 'ATT C', doc: L.SAMPLE })
  const duty = await L.recBy(p, { type: 'Duty', date: 'Jul 21' })
  const att = await L.recBy(p, { type: 'ATT C', date: 'Jul 22' })
  parts.push(`Saber filed his own Duty (Tue 21 Jul, "Stores run") and an ATT C downchit on Wed 22 Jul with a document (docId ${att.docId ? 'present' : 'MISSING'})`)
  await L.switchUser(w, 'us')
  await L.toList(w)
  await L.showEveryone(w)
  // the duty
  await p.locator(`#inBody tr[data-iid="${duty.iid}"] [data-testid="in-open"]`).scrollIntoViewIfNeeded()
  await p.locator(`#inBody tr[data-iid="${duty.iid}"] [data-testid="in-open"]`).click(); await L.win(p).waitFor(); await sleep(300)
  let f = await L.winFacts(p)
  let ed = await editable()
  parts.push(`Duty opened by Ranger: Save ${f.save}, Delete ${f.del}, date calendar ${f.cal}, paperclip ${f.docview}; read-only line "${f.ro}"; editable controls ${JSON.stringify(ed)}`)
  if (f.save || f.del || f.cal) fail('Duty window gives Ranger Save/Delete/calendar')
  if (!/Only Saber/.test(f.ro)) fail('no explanation of who may change it: "' + f.ro + '"')
  if (ed.length) fail('editable controls present in the read-only window: ' + JSON.stringify(ed))
  pics.push(await L.pic(w, '60-1-duty-readonly'))
  await p.locator('#inpEditCancel, [data-testid="win-inputedit-x"]').first().click().catch(async () => { await p.keyboard.press('Escape') }); await sleep(300)
  if (await L.win(p).count()) await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {})
  await sleep(200)
  // the downchit
  await p.locator(`#inBody tr[data-iid="${att.iid}"] [data-testid="in-open"]`).scrollIntoViewIfNeeded()
  await p.locator(`#inBody tr[data-iid="${att.iid}"] [data-testid="in-open"]`).click(); await L.win(p).waitFor(); await sleep(300)
  f = await L.winFacts(p)
  ed = await editable()
  parts.push(`ATT C opened by Ranger: Save ${f.save}, Delete ${f.del}, date calendar ${f.cal}, paperclip button ${f.docview}; read-only line "${f.ro}"; editable controls ${JSON.stringify(ed)}`)
  if (f.save || f.del || f.cal) fail('ATT C window gives Ranger Save/Delete/calendar')
  if (!f.docview) fail('no paperclip button in the window for the document')
  if (ed.length) fail('editable controls present in the read-only medical window: ' + JSON.stringify(ed))
  pics.push(await L.pic(w, '60-2-attc-readonly'))
  if (f.docview) {
    await p.locator(`${L.WIN} [data-testid="inped-docview"]`).click(); await sleep(600)
    const viewer = await p.locator('#docViewPop:not([hidden])').count()
    const shown = viewer ? await p.evaluate(() => { const v = document.querySelector('#docViewPop'); const im = v.querySelector('img, iframe, embed, canvas'); return im ? im.tagName + ' ' + (im.naturalWidth || im.width || '') : 'no media' }) : null
    const onTop = viewer && await p.evaluate(() => { const v = document.querySelector('#docViewPop .airpop-box') || document.querySelector('#docViewPop'); const b = v.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + 20); return !!hit && (v === hit || v.contains(hit)) })
    pics.push(await L.pic(w, '60-3-document-viewer'))
    parts.push(`paperclip in window opened the viewer: ${viewer}, media ${shown}, in front ${onTop}`)
    if (!viewer || !onTop) fail('document viewer did not open in front')
    if (viewer) await p.locator('#docViewClose').click(); await sleep(300)
  }
  await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {}); await sleep(300)
  // the row's own paperclip
  const clip = p.locator(`#inBody tr[data-iid="${att.iid}"] .rclip`)
  const clipN = await clip.count()
  if (clipN) { await clip.click(); await sleep(500); const v2 = await p.locator('#docViewPop:not([hidden])').count(); const w2 = await L.win(p).count(); parts.push(`row paperclip: viewer ${v2}, window ${w2}`); if (!v2) fail('row paperclip did not open the document'); if (v2) await p.locator('#docViewClose').click() } else parts.push('row has no paperclip for Ranger')
  L.row(60, 'desktop 1440x900', 'Member (Ranger) reading Admin (Saber)\'s inputs', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '60-err'))
  L.row(60, 'desktop 1440x900', 'Member (Ranger)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
