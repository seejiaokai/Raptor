const L = await import('./msq-pa-a-lib.mjs')
const { X, say, sleep, sj, tap } = L
say('msq-pa-a-s1c v1', L.size)
const vis = w => w.page.evaluate(() => [...document.querySelectorAll('#page-admin button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 }).map(b => (b.id ? '#' + b.id + ':' : '') + b.innerText.replace(/\s+/g, ' ').trim()).filter(s => s).join(' | ').slice(0, 900))
const OS = 'Osprey'
const bad = t => /He is 149|only an admin|Only a master|can.t|cannot/i.test(t)
// ---- c: archive, then restore
{
  const w = await L.start(true)
  await X.login(w.page, 'ad2'); await L.toUsers(w)
  await L.openRow(w, OS)
  await L.press(w, w.page.locator('#accEdArchive'), 's1c-1-archive')
  let s = await L.state(w, OS)
  L.rep('S1c', 'Archive (no question asked; done on first tap)', 'no "He is 149\'s" refusal', 'toast=' + s.toast + ' header=' + (s.row === 'NO ROW' ? 'NO ROW (moved to Archived list)' : s.row.header), bad(s.toast) ? 'FAIL' : 'PASS', 's1c-1-archive')
  await L.find(w).fill(''); await sleep(600)
  await tap(w.page.locator('#accArchToggle')); await sleep(700)
  await X.pic(w, 's1c-2-archived-list')
  say('archived list read', sj(await L.state(w, OS)))
  const rb = w.page.locator('#page-admin button.acc-main', { hasText: /^Osprey/ }).first()
  await tap(rb); await sleep(900)
  say('buttons', await vis(w))
  await X.pic(w, 's1c-3-archived-open')
  const rest = w.page.locator('#page-admin button:visible', { hasText: /^Restore$/ }).first()
  say('restore buttons', await rest.count())
  if (await rest.count()) {
    await L.press(w, rest, 's1c-4-restore')
    s = await L.state(w, OS)
    say('after restore', sj(s), 'buttons', await vis(w))
    L.rep('S1c', 'archived row opened, Restore', 'RECORD', 'toast=' + s.toast + ' header=' + (s.row === 'NO ROW' ? 'NO ROW' : s.row.header + ' signin=' + s.row.signin + ' roster=' + s.row.roster), 'RECORDED', 's1c-4-restore')
  } else L.rep('S1c', 'archived row opened', 'a Restore button', 'none; buttons: ' + await vis(w), 'FAIL', 's1c-3-archived-open')
  await L.done(w)
}
// ---- d: fresh world, Delete
{
  const w = await L.start(true)
  await X.login(w.page, 'ad2'); await L.toUsers(w)
  await L.openRow(w, OS)
  await L.press(w, w.page.locator('#accEdDel'), 's1d-1-delete-tap1')
  let s = await L.state(w, OS)
  say('after delete tap1', sj(s), 'buttons', await vis(w))
  L.rep('S1d', 'Delete, first tap', 'RECORD the question', 'toast=' + s.toast + ' dlg=' + sj(s.dlg) + ' edit=' + (s.row === 'NO ROW' ? 'NO ROW' : s.row.editWords) + ' btn=' + await w.page.locator('#accEdDel').innerText().catch(() => 'gone'), 'RECORDED', 's1d-1-delete-tap1')
  const d2 = w.page.locator('#accEdDel:visible').first()
  if (await d2.count()) {
    await L.press(w, d2, 's1d-2-delete-tap2')
    s = await L.state(w, OS)
    say('after delete tap2', sj(s))
    L.rep('S1d', 'Delete, second tap', 'no "He is 149\'s" refusal; RECORD what happens', 'toast=' + s.toast + ' dlg=' + sj(s.dlg) + ' row=' + (s.row === 'NO ROW' ? 'NO ROW (gone)' : s.row.header), bad(s.toast) ? 'FAIL' : 'PASS', 's1d-2-delete-tap2')
  } else say('no second Delete button')
  await L.done(w)
}
