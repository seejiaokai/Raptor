const L = await import('./msq-pa-a-lib.mjs')
const { X, say, sleep, sj, tap } = L
say('msq-pa-a-s1 v1', L.size, 'PART=' + (process.env.PA_PART || 'abc'))
const part = process.env.PA_PART || 'abc'
const vis = w => w.page.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 }).map(b => (b.id ? '#' + b.id + ':' : '') + b.innerText.replace(/\s+/g, ' ').trim()).filter(s => s).join(' | ').slice(0, 900))
const OS = 'Osprey'
const dot = async w => (await L.state(w, OS)).row.signin
async function look(w, tag) { const s = await L.state(w, OS); say(tag, sj(s)); return s }

if (part.includes('a') || part.includes('b') || part.includes('c')) {
  const w = await L.start(true)
  await X.login(w.page, 'ad2'); await L.toUsers(w)
  if (part.includes('a')) {
    await L.openRow(w, OS)
    await X.pic(w, 's1a-0-open')
    await L.press(w, L.btn(w, /^Suspend$/), 's1a-1-suspend')
    let s = await look(w, 'S1a after Suspend')
    L.rep('S1a', 'Osprey row, Suspend', 'no refusal; Sign-in dot red', 'toast=' + s.toast + ' dot=' + s.row.signin, (s.row.signin === 'r' && !/only|He is/i.test(s.toast)) ? 'PASS' : 'FAIL', 's1a-1-suspend')
    await L.openRow(w, OS)
    say('buttons', await vis(w))
    await L.press(w, L.btn(w, /^Enable$/), 's1a-2-enable')
    s = await look(w, 'S1a after Enable')
    L.rep('S1a', 'Osprey row, Enable', 'no refusal; dot green', 'toast=' + s.toast + ' dot=' + s.row.signin, (s.row.signin === 'g' && !/only|He is/i.test(s.toast)) ? 'PASS' : 'FAIL', 's1a-2-enable')
    await L.press(w, L.undoBtn(w), 's1a-3-undo')
    s = await look(w, 'S1a after Undo')
    L.rep('S1a', 'top bar Undo', 'RECORD', 'toast=' + s.toast + ' dot=' + s.row.signin, 'RECORDED', 's1a-3-undo')
    await L.press(w, L.redoBtn(w), 's1a-4-redo')
    s = await look(w, 'S1a after Redo')
    L.rep('S1a', 'top bar Redo', 'RECORD', 'toast=' + s.toast + ' dot=' + s.row.signin, 'RECORDED', 's1a-4-redo')
    // leave Osprey enabled for b
    if ((await dot(w)) !== 'g') { await L.openRow(w, OS); await tap(L.btn(w, /^Enable$/)); await sleep(900); say('re-enabled for b, dot', await dot(w)) }
  }
  if (part.includes('b')) {
    await L.openRow(w, OS)
    await w.page.selectOption('#accEdRole', 'admin'); await sleep(300)
    await X.pic(w, 's1b-0-role')
    await L.press(w, w.page.locator('#accEdSave'), 's1b-1-save')
    let s = await look(w, 'S1b after Save')
    L.rep('S1b', 'Role Admin, Save', 'saved, no refusal; row reads Admin', 'toast=' + s.toast + ' badge=' + s.row.badge + ' header=' + s.row.header, (/admin/i.test(s.row.badge + s.row.header) && !/only|He is/i.test(s.toast)) ? 'PASS' : 'FAIL', 's1b-1-save')
    await L.press(w, L.undoBtn(w), 's1b-2-undo')
    s = await look(w, 'S1b after Undo')
    L.rep('S1b', 'top bar Undo', 'RECORD', 'toast=' + s.toast + ' badge=' + s.row.badge + ' header=' + s.row.header, 'RECORDED', 's1b-2-undo')
  }
  if (part.includes('c')) {
    await L.openRow(w, OS)
    say('buttons before archive', await vis(w))
    await L.press(w, w.page.locator('#accEdArchive'), 's1c-1-archive')
    let s = await look(w, 'S1c after Archive tap')
    say('buttons after archive tap', await vis(w))
    say('S1c page text near', await w.page.evaluate(() => (document.querySelector('.acc-edit')?.innerText || document.querySelector('#page-admin')?.innerText || '').replace(/\s+/g, ' ').slice(0, 700)))
    L.rep('S1c', 'Archive tap 1', 'RECORD question; no "He is 149\'s" refusal', 'toast=' + s.toast + ' dlg=' + sj(s.dlg) + ' edit=' + (s.row === 'NO ROW' ? 'NO ROW' : s.row.editWords), 'RECORDED', 's1c-1-archive')
  }
  say('stop-point: leaving world open? no — closing')
  await L.done(w)
}
