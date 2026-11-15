/* rcb2-w1 S10 — hidden warnings and "goes away once signed". Friday (4): Ranger on whole-day LL and Reaper on an ATT C,
   both put on a 09:00-10:00 BRIEFING row (as S09). usage: node scripts/handpass/rcb2/rcb2-w1-s10.mjs [desktop|phone] */
const KIND = process.argv[2] || 'desktop'
process.env.RCB2_RUN = 's10-' + KIND + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep, FRI } = X
const P = KIND === 'phone' ? 'p' : 'd'
const w = await X.world(KIND, 'a')
const page = w.page
const OLD = /(leave|downchit) \+ flying/i
const RANGER = 'bane', DOWN = 'dice'

await X.fileInput(w, { iso: '2026-07-17', type: 'LL', person: RANGER, remarks: 'rcb2 w1 s10 leave' })
await X.fileInput(w, { iso: '2026-07-17', type: 'ATT C', person: DOWN, remarks: 'rcb2 w1 s10 downchit' })
await X.board(w, FRI)
const g1 = await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: RANGER })
const g2 = await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: DOWN })
say('fixture rows', JSON.stringify(g1), JSON.stringify(g2))

const boardState = async () => {
  const b = await X.boardWarn(w)
  const rings = await page.evaluate(ids => Object.fromEntries(ids.map(id => [id, [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => (e.classList.contains('hard') ? 'RED' : e.classList.contains('warn') ? 'AMBER' : 'plain'))])), [RANGER, DOWN])
  return { head: b.head, lines: b.lines.map(l => ({ ix: l.ix, hid: l.hid, struck: l.struck, btn: l.btn, text: l.text })), rings }
}
const weekState = async () => {
  const ew = await X.weekWarn(w, '#eWeek', FRI)
  return { head: ew.head, items: ew.items.map(i => ({ hid: / hid\b/.test(i.cls), gone: / gone\b/.test(i.cls), text: i.text })) }
}
const ixOf = (st, cs) => (st.lines.find(l => l.text.includes(cs)) || {}).ix
const live = st => st.lines.filter(l => l.ix != null && !l.hid)

/* 10.1 baseline */
let bs = await boardState()
say('baseline board', JSON.stringify(bs))
check('S10.1 baseline: two live warnings, both pucks ringed red', live(bs).length === 2 && bs.rings[RANGER].includes('RED') && bs.rings[DOWN].includes('RED'), JSON.stringify(bs.rings) + ' ' + bs.head)
await X.pic(w, `s10-1-baseline-board-${P}`)
const ixR = ixOf(bs, 'Ranger')
await X.closeBoard(w)

/* 10.2 hide Ranger's warning from the week */
await L.go(page, 'editsched'); await sleep(400)
let ws = await weekState()
say('week before hide', JSON.stringify(ws))
await X.crop(w, '#eWeek [data-dwbox="4"]', `s10-2a-week-before-${P}`)
await X.press(w, `#eWeek [data-woff="4.${ixR}"]`, { scope: 'page', after: `s10-2b-hide-tap-${P}` })
ws = await weekState()
say('week after hide', JSON.stringify(ws))
await X.crop(w, '#eWeek [data-dwbox="4"]', `s10-2c-week-hidden-${P}`)
const wh = ws.items.find(i => i.text.includes('Ranger'))
check('S10.2a week: Ranger\'s line stays, struck/subdued (hid), name "planned"', !!wh && wh.hid && /On leave \+ planned/.test(wh.text) && !ws.items.some(i => OLD.test(i.text)), JSON.stringify(ws.items.map(i => [i.hid, i.text.slice(0, 40)])))
check('S10.2b week head counts one warning (hidden excluded)', /1 issue/.test(ws.head) || /1 warning/.test(ws.head), ws.head)
await X.board(w, FRI)
bs = await boardState()
await X.pic(w, `s10-2d-board-after-week-hide-${P}`)
const bl = bs.lines.find(l => l.text.includes('Ranger'))
check('S10.2c board: the same line struck with the Reset arrow; his puck plain, Reaper still red', !!bl && bl.hid && bl.struck && bl.btn === 'reset' && !bs.rings[RANGER].includes('RED') && bs.rings[DOWN].includes('RED'), JSON.stringify(bl) + ' ' + JSON.stringify(bs.rings))
const dd = await X.dayDetails(w, FRI, { name: `s10-2e-daydetails-hidden-${P}` })
say('day details with one hidden:', JSON.stringify(dd.items), '|', (dd.text || '').slice(0, 300))
check('S10.2d day details: lists with the new names; the hidden one reads as hidden or is excluded (RECORDED)', !dd.error && !OLD.test(dd.text), (dd.items || []).join(' / '))
say('close day details Escape:', await X.closeDayDetails(w, 'Escape'))

/* 10.3 Undo */
const u = await X.undo(w)
bs = await boardState()
await X.pic(w, `s10-3-after-undo-${P}`)
check('S10.3 Undo puts the warning back live', u.ok && live(bs).length === 2 && bs.rings[RANGER].includes('RED'), JSON.stringify(u) + ' ' + JSON.stringify(bs.rings) + ' live ' + live(bs).length)

/* 10.4 hide from the board, restore through the Reset arrow */
const ix2 = ixOf(bs, 'Ranger')
await X.hideIx(w, FRI, ix2)
bs = await boardState()
await X.pic(w, `s10-4a-board-hidden-${P}`)
check('S10.4a hidden from the board: struck with Reset', (bs.lines.find(l => l.text.includes('Ranger')) || {}).btn === 'reset', JSON.stringify(bs.lines.map(l => [l.hid, l.btn])))
await X.hideIx(w, FRI, ix2)
bs = await boardState()
await X.pic(w, `s10-4b-board-restored-${P}`)
check('S10.4b restored through the Reset arrow: live again, puck red', live(bs).length === 2 && bs.rings[RANGER].includes('RED'), JSON.stringify(bs.rings))

/* 10.5 hide both, reload */
await X.hideIx(w, FRI, ixOf(bs, 'Ranger')); await X.hideIx(w, FRI, ixOf(await boardState(), 'Reaper'))
bs = await boardState()
await X.pic(w, `s10-5a-both-hidden-${P}`)
check('S10.5a both hidden: no puck ringed, both lines still reachable (struck, Reset)', bs.lines.filter(l => l.hid).length === 2 && !bs.rings[RANGER].includes('RED') && !bs.rings[DOWN].includes('RED'), JSON.stringify(bs.lines.map(l => [l.hid, l.btn])) + ' ' + bs.head)
await X.closeBoard(w)
await L.go(page, 'editsched'); await sleep(300)
ws = await weekState()
say('week with both hidden', JSON.stringify(ws))
await X.crop(w, '#eWeek [data-dwbox="4"]', `s10-5b-week-both-hidden-${P}`)
check('S10.5b week: list still reachable, both rows there, struck', ws.items.filter(i => i.hid).length === 2, ws.head + ' | ' + JSON.stringify(ws.items.map(i => [i.hid, i.text.slice(0, 30)])))
await page.reload(); await page.waitForSelector('#vWeek .day', { state: 'attached' }).catch(() => {}); await sleep(900)
if (await page.locator('#luser').count()) await L.login(page, 'a')
await L.go(page, 'editsched'); await sleep(500)
ws = await weekState()
await X.crop(w, '#eWeek [data-dwbox="4"]', `s10-5c-week-after-reload-${P}`)
check('S10.5c after a reload both still hidden (saved)', ws.items.filter(i => i.hid).length === 2, JSON.stringify(ws.items.map(i => [i.hid, i.text.slice(0, 30)])))

/* --- published order --- */
let pubOk = true
if (KIND === 'desktop' || process.env.S10_PUB) {
  await X.board(w, FRI)
  bs = await boardState()
  await X.hideIx(w, FRI, ixOf(bs, 'Ranger')); await X.hideIx(w, FRI, ixOf(await boardState(), 'Reaper'))   // both back to live
  bs = await boardState()
  say('before publishing: live', live(bs).length)
  const sp = await X.signAndPublish(w, FRI)
  say('publish', JSON.stringify(sp))
  check('S10.6 the day is published with both warnings live', sp.pressed === true && live(await boardState()).length === 2, JSON.stringify(sp.signs) + ' ' + JSON.stringify(await X.head(w, FRI)))
  await X.pic(w, `s10-6-published-${P}`)
  pubOk = sp.pressed === true
  if (pubOk) {
    bs = await boardState()
    await X.hideIx(w, FRI, ixOf(bs, 'Ranger'))
    const hd = await X.head(w, FRI)
    await X.pic(w, `s10-7a-hidden-in-working-copy-${P}`)
    say('head after hiding in the working copy', JSON.stringify(hd))
    check('S10.7a hiding a published day\'s warning is pending (head shows a pending count)', /pending|1/.test(hd.pending || hd.tag) || (hd.alpub && !hd.alpub.disabled), JSON.stringify(hd))
    await X.closeBoard(w)
    await L.go(page, 'viewsched'); await sleep(500)
    const vw1 = await X.weekWarn(w, '#vWeek', FRI)
    say('View-only before the amendment is published:', vw1.head, JSON.stringify(vw1.items))
    await X.crop(w, '#vWeek [data-dwbox="4"]', `s10-7b-view-before-amend-${P}`)
    check('S10.7b View-only still shows the issued warning (live)', vw1.items.some(i => i.text.includes('Ranger') && !/ hid\b/.test(' ' + i.cls)) && vw1.items.some(i => /On leave \+ planned/.test(i.text)), vw1.items.map(i => i.cls.slice(0, 20) + ' ' + i.text.slice(0, 30)).join(' / '))
    // Insights count before
    await L.go(page, 'editsched'); await sleep(300)
    const insBefore = await insightsCounts()
    say('Insights before amendment:', JSON.stringify(insBefore))
    await X.board(w, FRI)
    const sp2 = await X.signAndPublish(w, FRI)
    say('amendment publish', JSON.stringify(sp2))
    await X.pic(w, `s10-7c-amendment-published-${P}`)
    await X.closeBoard(w)
    await L.go(page, 'viewsched'); await sleep(500)
    const vw2 = await X.weekWarn(w, '#vWeek', FRI)
    say('View-only after the amendment:', vw2.head, JSON.stringify(vw2.items))
    await X.crop(w, '#vWeek [data-dwbox="4"]', `s10-7d-view-after-amend-${P}`)
    check('S10.7c after publishing the amendment View-only shows Ranger\'s warning hidden', sp2.pressed && vw2.items.some(i => i.text.includes('Ranger') && / hid\b/.test(' ' + i.cls)), JSON.stringify(vw2.items.map(i => [i.cls.slice(0, 18), i.text.slice(0, 30)])))
    await L.go(page, 'editsched'); await sleep(300)
    const insAfter = await insightsCounts()
    say('Insights after amendment:', JSON.stringify(insAfter))
    check('S10.7d Insights count of "On leave + planned" falls by one after the amendment (RECORDED before/after)', insAfter.leave === insBefore.leave - 1 ? true : 'RECORDED', `before ${JSON.stringify(insBefore)} after ${JSON.stringify(insAfter)}`)

    /* 10.8 goes away once signed: remove the cause of Reaper's warning in the working copy */
    await X.board(w, FRI)
    const gi2 = await page.evaluate(() => window.DAYS[4].ground.map((g, i) => [i, g.prog, JSON.stringify(g.who)]).filter(x => x[1] === 'BRIEFING' && /dice/.test(x[2])).map(x => x[0]))
    say('Reaper\'s BRIEFING row index', JSON.stringify(gi2))
    await X.press(w, `[data-grdel="${FRI}.${gi2[0]}"]`, { after: `s10-8a-delete-tap-${P}` })
    await X.closeBoard(w)
    await L.go(page, 'editsched'); await sleep(400)
    ws = await weekState()
    say('week after removing the cause:', JSON.stringify(ws))
    await X.crop(w, '#eWeek [data-dwbox="4"]', `s10-8b-week-goes-away-${P}`)
    const gn = ws.items.find(i => i.gone)
    check('S10.8 the removed warning reads "goes away once signed" with the new name, no restore control', !!gn && /Downchit \+ planned/.test(gn.text) && !OLD.test(gn.text), gn ? gn.text : JSON.stringify(ws.items.map(i => [i.gone, i.hid, i.text.slice(0, 30)])))
    const hasBtn = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-dwbox="4"] .witem.gone [data-woff]')].length)
    check('S10.8b the "gone" row carries no hide/restore button', hasBtn === 0, 'buttons ' + hasBtn)
  }
} else say('published order walked on the desktop; the phone look is S10_PUB=1')
say('errors', JSON.stringify(w.errors))
check('S10 no console/page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
X.W.summary()

async function insightsCounts() {
  if (KIND === 'phone') { await X.press(w, '#editSchedMore', { scope: 'page' }); await X.press(w, '#editSchedMoreInsights', { scope: 'page' }) } else await X.press(w, '#insightBtn', { scope: 'page' })
  await page.waitForSelector('#insightBody'); await sleep(500)
  const t = nrm(await page.evaluate(() => document.querySelector('#insightBody').innerText))
  await X.press(w, '#insightClose', { scope: 'page' })
  const g = re => { const m = t.match(re); return m ? +m[1] : null }
  return { leave: g(/On leave \+ planned (\d+)/), down: g(/Downchit \+ planned (\d+)/), fri: g(/Friday \d+ sorties · \d+ formations · (\d+) issue/), flying: /(leave|downchit) \+ flying/i.test(t) }
}
