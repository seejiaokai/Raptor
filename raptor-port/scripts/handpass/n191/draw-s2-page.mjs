// draw-s2-page - section 2, Admin → Users across squadrons: THE PAGE's owed states (ledger rows 2.2, 2.6-2.9, 2.11, 2.13,
// 2.14, 2.16-2.18, 2.21, 2.23, 2.37), each desktop (1536) and phone (402), on the REAL app at 4700 in round 6's world.
// Built by ./draw-s2-lib.mjs `build` (round 6's approved page). What is new in the app and the row's subject wears the
// teal dashed ring. DRAWN, NOT IN THE WORLD (the app cannot do them yet), as round 6: Cinch posting to 149 on 14 Dec, Raven
// posting out 4 Jan, Mako's View of 149, Kestrel's View of 142, Mako posting in to 142 on 4 Jan.
//   s2-02-d-column            2.2   Kestrel, 149: Admin's left column with the jumps AND the new "Display" card
//   s2-06-{d,p}-search        2.6   Kestrel types "Bol": Bolt ONCE, under "From other squadrons" (D2652 N13 d)
//   s2-07-{d,p}-nobody        2.7   Kestrel types "Zzz": "Nobody matches."
//   s2-08-{d,p}-empty-other   2.8   Hunter, 142, nobody from outside, nobody coming or going: the empty block, two jumps
//   s2-09-{d,p}-no-incoming   2.9   Kestrel, 149, nobody incoming: Incoming and its jump are not there
//   s2-11-p-375-words / -nocount  2.11  a 375-px phone, "Outgoing 12": the recommended rule and the other
//   s2-13-{d,p}-viewonly      2.13  "▾ View only · 2 people" opened
//   s2-14-{d,p}-block-opened  2.14  Hunter's row of the block opened by Kestrel: his Plan of 149, Save, Cancel
//   s2-16-{d,p}-admin-opened  2.16  Blade (a 142 admin) opened by Kestrel inside "▾ 142 · 60 people": no grey numbers
//   s2-17-{d,p}-nosignin      2.17  Basher (no sign-in) opened there
//   s2-18-{d,p}-plan-greyed   2.18  Hunter (Plan of 149) on 149: Blade opened, Plan greyed, the reason under the line
//   s2-21-{d,p}-master-top / -foot  2.21  Saber (master admin) on his own 142: the page in the new order
//   s2-23-{d,p}-outcomes      2.23  Outgoing holding postings overseas, to SANS and to Delete; a restored man incoming
//   s2-37-{d,p}-plan-holder   2.37  Hunter on 149: himself in "From other squadrons"
//   node raptor-port/scripts/handpass/n191/draw-s2-page.mjs   (ONLY=02,06,…  SZ=d,p)
import { run, as, W, W6, WN, WS, FACT, wait, usersTab, reachPick, shot, shotTall, box, words, closeAll, typeInto, barSq, want, load, S, man, subOf, rowsOf, tring, tringFixed, ringAll, build, pin, pinnedFoot, headTo, J, sqFolds, spec149, viewRows, start, column, paneCol, R6 } from './draw-s2-lib.mjs'

const tplKeep = s => s.page.evaluate(() => { window.__s2tpl = [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].find(e => !e.querySelector('.acc-sqn') && !e.querySelector('.ub') && !e.querySelector('.acc-tag') && !e.querySelector('.od-po')).cloneNode(true) })
const jumpsSel = s => (s.desk ? '#s2rail' : '#s2jumps')
const pic = (row, name) => async (sz, fn, st = R6) => { const k = `s2-${row}-${sz}-${name}`; if (want(row, sz)) await run(k, sz, s => fn(s, k), { state: st }) }
/* the cut from the page's top (the rail too, on a desktop) down to the given element */
const cutTo = async (s, k, lastSel, extra = 6) => { const col = await column(s), top = await box(s, s.desk ? '.adm-rail' : '.adm-pane'), last = await box(s, lastSel), rail = s.desk ? await box(s, '.adm-rail') : null; const foot = Math.max(last.y + last.h, rail ? rail.y + rail.h : 0); await shotTall(s, k, { x: col.x, y: top.y, w: col.w, h: foot - top.y + extra }, 16) }
/* the cut round one part of the pane, with some of the page above and below it */
const cutRound = async (s, k, sel, above, below) => { const c = await box(s, sel), pane = await paneCol(s), bar = await box(s, '.topbar'); const y = Math.max(bar.y + bar.h, c.y - above); await shot(s, k, [{ x: pane.x, y, w: pane.w, h: Math.min(s.H - 8, c.y + c.h + below) - y }], 12) }
const toMid = async (s, sel, y) => { await s.page.evaluate(([sel, y]) => { const a = document.querySelector(sel).getBoundingClientRect(); scrollBy(0, a.top - y) }, [sel, y]); await wait(s, 300) }
const group142 = (open, you) => rowsOf('142', '149').map(r => (open && r.cs === open.cs ? { ...r, card: open.card } : you && r.cs === you ? { ...r, you: true } : r))

try {
  await load()
  FACT('s2.world', { counts: S.COUNT, served: 'http://localhost:4700 (this folder\'s dist)', bolLike142: S.P['142'].filter(p => /bol/i.test(p.cs + ' ' + (p.signIn || ''))).map(p => p.cs), bolLike149: S.P['149'].filter(p => /bol/i.test(p.cs + ' ' + (p.signIn || ''))).map(p => p.cs), bolLike150: S.P['150'].filter(p => /bol/i.test(p.cs + ' ' + (p.signIn || ''))).map(p => p.cs) })

  /* 2.2 - the left column with the jumps and "Display" */
  await pic('02', 'column')('d', async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    const b = await build(s, { ...spec149(), display: WS.displayCard }); FACT(`${k}.built`, { railCards: b.railCards, jumps: b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '')) })
    await ringAll(s, ['#s2rail', '#s2display'])
    const rail = await box(s, '.adm-rail'), pane = await box(s, '.adm-pane')
    await shot(s, k, [rail, { x: pane.x, y: pane.y, w: pane.w, h: rail.h }], 16)
  })

  /* 2.6 - "Bol": Bolt once, under "From other squadrons"; his own squadron's fold, holding no one else who matches, hides */
  for (const sz of ['d', 'p']) await pic('06', 'search')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel')); await tplKeep(s)
    FACT(`${k}.typed`, await typeInto(s, '#accFind', 'Bol'))
    FACT(`${k}.todayOwnList`, await words(s, '[data-testid="acc-groups"] .acc-row, #accNoMatch'))
    const bolt = man('142', 'Bolt')
    const b = await build(s, { navName: WN.navName, leave: ['prowler'], hidePeople: true, hideWaiting: true,
      jumps: J('other', ['people', 'out', 'in'])(['people', 'out', 'in', 'other'], [S.COUNT['149'], 1, 1, 4]),
      groups: [{ id: 'other', label: WN.open(W6.fromOther(4)), rows: [], fold: WN.opened(W6.viewOnly(2)), foldRows: [{ key: 'bolt', cs: 'Bolt', chip: '142', sub: subOf(bolt, '149') }] }] })
    FACT(`${k}.built`, { jumps: b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '') + (j.greyed ? ' (greyed)' : '')), headings: b.headings, folds: b.folds, foldRows: b.foldRows, boltShown: b.foldRows.filter(r => /^Bolt/.test(r)).length })
    await s.page.evaluate(() => { document.querySelector('#s2bar .searchbox').style.borderColor = 'var(--accent)' })
    await ringAll(s, ['#s2other'])
    await cutTo(s, k, '#s2other', 14)
  })

  /* 2.7 - nothing matches anywhere */
  for (const sz of ['d', 'p']) await pic('07', 'nobody')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel')); await tplKeep(s)
    FACT(`${k}.typed`, await typeInto(s, '#accFind', 'Zzz'))
    FACT(`${k}.today`, await words(s, '#accNoMatch'))
    const b = await build(s, { navName: WN.navName, hidePeople: true, hideWaiting: true, nobody: true, jumps: J(null, ['people', 'out', 'in', 'other'])(['people', 'out', 'in', 'other'], [S.COUNT['149'], 1, 1, 4]), groups: [] })
    FACT(`${k}.built`, { jumps: b.jumps.map(j => j.words + (j.greyed ? ' (greyed)' : '')), notes: b.notes, headings: b.headings })
    await s.page.evaluate(() => { document.querySelector('#s2bar .searchbox').style.borderColor = 'var(--accent)' })
    await ringAll(s, ['#s2nomatch'])
    await cutTo(s, k, '#s2nomatch', s.desk ? 14 : 60)
  })

  /* 2.8 - the empty "From other squadrons"; nobody coming or going, so two jumps */
  for (const sz of ['d', 'p']) await pic('08', 'empty-other')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'hunter'))
    const b = await build(s, { navName: WN.navName, jumps: J('other')(['people', 'other'], [S.COUNT['142'], 0]),
      groups: [{ id: 'other', label: WN.open(W6.fromOther(0).replace(' · 0', '')), reached: false, empty: W6.nobodyOutside('142') }], sqFolds: sqFolds(149, 150) })
    FACT(`${k}.built`, { squadron: await barSq(s), jumps: b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '')), headings: b.headings, notes: b.notes, folds: b.folds })
    FACT(`${k}.pinned`, await pin(s))
    FACT(`${k}.reached`, await headTo(s, '#s2other-h', (await pinnedFoot(s)) + (s.desk ? 200 : 150)))
    await ringAll(s, ['#s2other'], false); await tringFixed(s, await box(s, jumpsSel(s)))
    const col = await column(s), bar = await box(s, '.topbar'), last = await box(s, '#s2sq150')
    await shot(s, k, [{ x: col.x, y: bar.h, w: col.w, h: Math.min(s.H - bar.h - 8, last.y + last.h - bar.h + 16) }], 12)
  })

  /* 2.9 - no Incoming: the group and its jump are not there */
  for (const sz of ['d', 'p']) await pic('09', 'no-incoming')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    const sp = spec149(); sp.groups = sp.groups.filter(g => g.id !== 'in'); sp.jumps = J('people')(['people', 'out', 'other'], [S.COUNT['149'], 1, 4])
    const b = await build(s, sp)
    FACT(`${k}.built`, { jumps: b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '')), headings: b.headings })
    await ringAll(s, [jumpsSel(s)])
    await cutTo(s, k, '#s2sq150')
  })

  /* 2.11 - a 375-px phone and a two-figure count. Twelve of 149's ten cannot be posting out - the count alone is drawn
     ("Outgoing 12"), the list under it kept as round 6's; the rule is what the picture is for. */
  for (const [fit, name] of [['equal', '375-equal'], ['words', '375-words'], ['nocount', '375-nocount']]) await pic('11', name)('p', async (s, k) => {
    await s.page.setViewportSize({ width: 375, height: 812 }); s.W = 375; s.H = 812
    FACT(`${k}.add`, await start(s, 'kestrel'))
    const sp = spec149(); sp.jumps = J('people')(['people', 'out', 'in', 'other'], [S.COUNT['149'], 12, 1, 4]); sp.fit = fit
    const b = await build(s, sp)
    FACT(`${k}.built`, { screen: '375 x 812', fit, jumps: b.jumps.map(j => `${j.words}: ${j.box.w}px${j.wordsFit ? '' : ' - WORDS DO NOT FIT'}`), rowScrolls: b.jumpsRowScrolls })
    await ringAll(s, ['#s2jumps'])
    const pane = await paneCol(s), a = await box(s, '#s2bar'), add = await box(s, '#n176add')
    await shot(s, k, [{ x: pane.x, y: a.y - 70, w: pane.w, h: add.y + add.h - a.y + 190 }], 8)
  })

  /* 2.13 - "View only" opened */
  for (const sz of ['d', 'p']) await pic('13', 'viewonly')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    const b = await build(s, spec149({ lit: 'other', other: { fold: WN.opened(W6.viewOnly(2)), foldRows: viewRows() } }))
    FACT(`${k}.built`, { rows: b.groupRows.s2other, folds: b.folds })
    FACT(`${k}.pinned`, await pin(s)); await headTo(s, '#s2other-h', (await pinnedFoot(s)) + (s.desk ? 120 : 60))
    await ringAll(s, ['#s2viewfold'])
    await cutRound(s, k, '#s2other', s.desk ? 110 : 50, s.desk ? 150 : 140)
  })

  /* 2.14 - a row of the block opened: Hunter's, by Kestrel (149's own admin, who may give or end Plan of 149 - D2626) */
  for (const sz of ['d', 'p']) await pic('14', 'block-opened')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    FACT(`${k}.hunterRowToday`, S.CARD['k.Hunter'].today)
    const b = await build(s, spec149({ lit: 'other', other: { hunter: { card: { html: S.CARD['k.Hunter'].html, view: '149', line: 'plan', live: ['none', 'view', 'plan'], note: null } } } }))
    FACT(`${k}.built`, b.opened)
    FACT(`${k}.pinned`, await pin(s)); await headTo(s, '#s2other-h', (await pinnedFoot(s)) + (s.desk ? 120 : 60))
    await ringAll(s, ['#s2opened'])
    await cutRound(s, k, '#s2other', s.desk ? 110 : 50, s.desk ? 150 : 140)
  })

  /* 2.16, 2.17 - a short row opened inside "▾ 142 · 60 people" by Kestrel (not 142's admin: no "Edit on 142 →") */
  for (const [row, name, cs, card] of [
    ['16', 'admin-opened', 'Blade', () => ({ html: S.CARD['k.Blade'].html, view: '149', line: 'none', live: ['none', 'view', 'plan'], note: null })],
    ['17', 'nosignin', 'Basher', () => ({ html: S.CARD['k.Basher'].html, kind: 'nosignin', words: W.noSignInOpened('142') })]])
    for (const sz of ['d', 'p']) await pic(row, name)(sz, async (s, k) => {
      FACT(`${k}.add`, await start(s, 'kestrel'))
      FACT(`${k}.rowToday`, S.CARD['k.' + cs].today)
      const b = await build(s, spec149({ lit: 'other', sq: { 142: { label: WN.opened(W6.folded('142', S.COUNT['142'])), rows: group142({ cs, card: card() }) } } }))
      FACT(`${k}.built`, { opened: b.opened, greyNumbersInFolds: b.greyNumbersInFolds, firstRows: b.foldRows.slice(0, 5), folds: b.folds })
      FACT(`${k}.pinned`, await pin(s)); await toMid(s, '#s2opened', s.desk ? 330 : 330)
      await ringAll(s, ['#s2opened'])
      await cutRound(s, k, '#s2opened', s.desk ? 250 : 200, s.desk ? 130 : 150)
    })

  /* 2.18 - Plan greyed for one who may not give it: Hunter (Plan of 149), 149 picked, Blade of 142 opened */
  for (const sz of ['d', 'p']) await pic('18', 'plan-greyed')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'hunter', 149))
    FACT(`${k}.rowToday`, S.CARD['h.Blade'].today)
    const b = await build(s, spec149({ lit: 'other', other: { hunter: { you: true } }, sq: { 142: { label: WN.opened(W6.folded('142', S.COUNT['142'])), rows: group142({ cs: 'Blade', card: { html: S.CARD['h.Blade'].html, view: '149', line: 'none', live: ['none', 'view'], note: W.planGreyed('149') } }, 'Hunter') } } }))
    FACT(`${k}.built`, { squadron: await barSq(s), opened: b.opened, greyNumbersInFolds: b.greyNumbersInFolds })
    FACT(`${k}.pinned`, await pin(s)); await toMid(s, '#s2opened', 330)
    await ringAll(s, ['#s2note'])
    await cutRound(s, k, '#s2opened', s.desk ? 250 : 200, s.desk ? 130 : 150)
  })

  /* 2.21 - a master admin on his own squadron (Saber, 142): the page in the new order, the rest folded at the foot */
  for (const sz of ['d', 'p']) for (const part of ['top', 'foot']) await pic('21', 'master-' + part)(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'saber'))
    const cinch = man('142', 'Cinch'), mako = man('150', 'Mako'), kestrel = man('149', 'Kestrel')
    const b = await build(s, { navName: WN.navName, tags: [[cinch.pid, W6.postingOutTo('14 Dec', '149')]],
      jumps: J(part === 'top' ? 'people' : 'out')(['people', 'out', 'in', 'other'], [S.COUNT['142'], 1, 1, 1]),
      groups: [
        { id: 'out', label: WN.open(W6.outgoing(1)), rows: [{ key: 'cinch', cs: 'Cinch', sub: cinch.seatCat, tag: W6.postingOutTo('14 Dec', '149') }] },
        { id: 'in', label: WN.open(W6.incoming(1)), rows: [{ key: 'mako', cs: 'Mako', chip: '150', sub: mako.seatCat, tag: W6.postingIn('4 Jan') }] },
        { id: 'other', label: WN.open(W6.fromOther(1)), rows: [{ key: 'kestrel', cs: 'Kestrel', chip: '149', sub: subOf(kestrel, '142') }] }],
      sqFolds: sqFolds(149, 150) })
    FACT(`${k}.built`, { squadron: await barSq(s), badge: await s.page.evaluate(() => document.querySelector('#roleBadge')?.textContent.replace(/[ \t\r\n]+/g, ' ').trim()), filterToday: 'the Filter panel loses its squadron ticks (a removal - not drawn)', jumps: b.jumps.map(j => j.words + (j.lit ? ' (lit)' : '')), headings: b.headings, folds: b.folds, ownRows: b.ownRows })
    const col = await column(s), bar = await box(s, '.topbar')
    if (part === 'top') { const top = await box(s, s.desk ? '.adm-rail' : '.adm-pane'); await ringAll(s, [jumpsSel(s)]); await shot(s, k, [{ x: col.x, y: top.y, w: col.w, h: s.H - top.y - 10 }], 16) }
    else { FACT(`${k}.pinned`, await pin(s)); FACT(`${k}.reached`, await headTo(s, '#s2out-h', (await pinnedFoot(s)) + (s.desk ? 60 : 30))); await ringAll(s, ['#s2sq149', '#s2sq150']); const last = await box(s, '#s2sq150'); await shot(s, k, [{ x: col.x, y: bar.h, w: col.w, h: Math.min(s.H - bar.h - 8, last.y + last.h - bar.h + 16) }], 12) }
  })

  /* 2.23 - what Incoming and Outgoing can hold before the Transfer step: postings overseas, to SANS and to Delete (each
     the app's own tag today), and a restored man with a post-in date (D2652 N3 g). Drawn on 149's people. */
  for (const sz of ['d', 'p']) await pic('23', 'outcomes')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    const raven = man('149', 'Raven'), shrike = man('149', 'Shrike'), merlin = man('149', 'Merlin'), heron = man('149', 'Heron'), hunter = man('142', 'Hunter'), saber = man('142', 'Saber')
    const out = [[raven, WS.postingOutOverseas('4 Jan')], [shrike, WS.postingOutSans('11 Jan')], [merlin, WS.postingOutDelete('18 Jan')]], inc = [[heron, WS.postingIn('14 Dec')]]
    const b = await build(s, { navName: WN.navName, leave: ['prowler'], tags: [...out, ...inc].map(([p, t]) => [p.pid, t]),
      jumps: J('people')(['people', 'out', 'in', 'other'], [S.COUNT['149'], 3, 1, 4]),
      groups: [
        { id: 'out', label: WN.open(W6.outgoing(3)), rows: out.map(([p, t]) => ({ key: p.pid, cs: p.cs, sub: p.seatCat, tag: t })) },
        { id: 'in', label: WN.open(W6.incoming(1)), rows: inc.map(([p, t]) => ({ key: p.pid, cs: p.cs, sub: p.seatCat, tag: t })) },
        { id: 'other', label: WN.open(W6.fromOther(4)), rows: [{ key: 'hunter', cs: 'Hunter', chip: '142', sub: subOf(hunter, '149') }, { key: 'saber', cs: 'Saber', chip: '142', sub: subOf(saber, '149') }], fold: W6.viewOnly(2) }],
      sqFolds: sqFolds(142, 150) })
    FACT(`${k}.built`, { jumps: b.jumps.map(j => j.words), rows: b.groupRows, appTagsToday: 'posting out <date> · Overseas Sqn / · SANS / · auto delete; posting in <date> (leavewar/sync.ts postingPendingTag)' })
    await ringAll(s, ['#s2out', '#s2in'])
    await cutTo(s, k, '#s2sq150')
  })

  /* 2.37 - a Plan holder looking at the squadron he plans: Hunter, 149 picked - himself in "From other squadrons" */
  for (const sz of ['d', 'p']) await pic('37', 'plan-holder')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'hunter', 149))
    const b = await build(s, spec149({ other: { hunter: { you: true } } }))
    FACT(`${k}.built`, { squadron: await barSq(s), badge: await s.page.evaluate(() => document.querySelector('#roleBadge')?.textContent.replace(/[ \t\r\n]+/g, ' ').trim()), rows: b.groupRows.s2other, ownRows: b.ownRows, hunterOnOwnList: await s.page.evaluate(() => !!document.querySelector('[data-testid="acc-groups"] [data-person="prowler"]')) })
    await ringAll(s, ['#s2row-hunter'])
    await cutTo(s, k, '#s2sq150')
  })
} finally { await closeAll() }
