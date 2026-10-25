// W1 part a — scenarios 1 and 2 (the decided buttons, Approve / Refuse, second tap back to waiting, Undo / Redo / reload).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-a.mjs [chromium|webkit]
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const engine = process.argv[2] || 'chromium'
const tag = engine === 'webkit' ? 'wk' : 'cr'
console.log('lw-m3b-w1-a', engine, 'bundle', 'out', L.OUT)
const w = await M.start('phone', engine)
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const IDS = ['decide-approve', 'decide-refuse', 'bid-LL']
const short = b => b.there ? `${b.id.replace('decide-', '').replace('bid-', '')}[${b.text}] bg ${b.bg} words ${b.color} ring ${b.outline.startsWith('solid') ? b.outline : 'none'} pressed ${b.pressed}` : `${b.id} (not drawn)`
const read = async (who, iso) => {
  const open = await L.vis(P, T('bid-picker'))
  const btn = open ? await M.btnState(P, IDS) : []
  const cell = await M.cellWords(P, who, iso)
  return { open, btn, cell: cell?.boxes?.join(' ; '), state: await M.stateOf(P, who, iso) }
}
const say = (label, r) => console.log(`   ${label}: window ${r.open ? 'open' : 'closed'}; cell ${r.cell}; record ${r.state}\n      ` + r.btn.map(short).join('\n      '))
const reopen = async (who, iso) => { await L.closeAny(w); await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 }); await P.waitForTimeout(350) }

/* ---------- scenario 1 ---------- */
const D1 = '2026-11-10'
{
  const f = await M.bidType(w, 'bane', D1, { approve: false })
  console.log('fixture 1:', JSON.stringify(f.k), await M.stateOf(P, 'bane', D1))
  await reopen('bane', D1)
  say('S1 pending, window opened', await read('bane', D1))
  await M.winPic(w, `s1-${tag}-0-pending`)
  // tap Approve
  await M.tapWin(w, T('decide-approve'), `s1-${tag}-1-approve-q`)
  say('S1 after Approve tap (settled)', await read('bane', D1))
  await M.winPic(w, `s1-${tag}-1-approve`)
  // second tap on Approve -> waiting
  if (await L.vis(P, T('bid-picker'))) {
    await M.tapWin(w, T('decide-approve'), `s1-${tag}-2-approve2-q`)
    say('S1 after the second Approve tap (settled)', await read('bane', D1))
    await M.winPic(w, `s1-${tag}-2-approve2`)
  } else console.log('   (window closed after Approve — reopening)')
  // Approve again, then Undo / Redo / reload
  await reopen('bane', D1)
  await M.tapWin(w, T('decide-approve'), `s1-${tag}-3-approveagain-q`)
  say('S1 Approve again', await read('bane', D1))
  await L.closeAny(w)
  await L.undo(w)
  say('S1 after Undo (window closed)', await read('bane', D1))
  await reopen('bane', D1)
  say('S1 after Undo, window reopened', await read('bane', D1))
  await M.winPic(w, `s1-${tag}-4-undo`)
  await L.closeAny(w)
  await L.redo(w)
  await reopen('bane', D1)
  say('S1 after Redo, window reopened', await read('bane', D1))
  await M.winPic(w, `s1-${tag}-5-redo`)
  await L.closeAny(w)
  console.log('   ', await M.reloadApp(w))
  await L.reachCell(w, 'bane', D1)
  say('S1 after reload (grid)', await read('bane', D1))
  await reopen('bane', D1)
  say('S1 after reload, window reopened', await read('bane', D1))
  await M.winPic(w, `s1-${tag}-6-reload`)
  await L.closeAny(w)
}

/* ---------- scenario 2 ---------- */
const D2 = '2026-11-11'
{
  const f = await M.bidType(w, 'bane', D2, { approve: false })
  console.log('fixture 2:', JSON.stringify(f.k), await M.stateOf(P, 'bane', D2))
  await reopen('bane', D2)
  await M.tapWin(w, T('decide-refuse'), `s2-${tag}-1-refuse-q`)
  say('S2 after Refuse tap', await read('bane', D2))
  await M.winPic(w, `s2-${tag}-1-refuse`)
  await L.cellShot(w, 'bane', D2, `s2-${tag}-1-refuse-cell`)
  if (await L.vis(P, T('bid-picker'))) {
    await M.tapWin(w, T('decide-refuse'), `s2-${tag}-2-refuse2-q`)
    say('S2 after the second Refuse tap', await read('bane', D2))
    await M.winPic(w, `s2-${tag}-2-refuse2`)
    await L.closeAny(w)
    await L.cellShot(w, 'bane', D2, `s2-${tag}-2-refuse2-cell`)
  }
  await reopen('bane', D2)
  await M.tapWin(w, T('decide-refuse'), null)
  say('S2 Refuse again', await read('bane', D2))
  await L.closeAny(w)
  await L.undo(w)
  await reopen('bane', D2)
  say('S2 after Undo, reopened', await read('bane', D2))
  await M.winPic(w, `s2-${tag}-3-undo`)
  await L.closeAny(w)
  await L.cellShot(w, 'bane', D2, `s2-${tag}-3-undo-cell`)
  await L.redo(w)
  await reopen('bane', D2)
  say('S2 after Redo, reopened', await read('bane', D2))
  await M.winPic(w, `s2-${tag}-4-redo`)
  await L.closeAny(w)
  await L.cellShot(w, 'bane', D2, `s2-${tag}-4-redo-cell`)
  console.log('   ', await M.reloadApp(w))
  await L.reachCell(w, 'bane', D2)
  await L.cellShot(w, 'bane', D2, `s2-${tag}-5-reload-cell`)
  await reopen('bane', D2)
  say('S2 after reload, reopened', await read('bane', D2))
  await M.winPic(w, `s2-${tag}-5-reload`)
  await L.closeAny(w)
}
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
