// swl-w1B-probe3 — walker B (chat 203): the routes proved before the walk — a timed line on Fri 17, Bolt (yeti, SANS, nothing
// filed) tapped in and dragged in, the note, the line's words; publish; a filing after publish; the two faces; Export as PDF.
//   SWLB_RUN=probe3 SZ=d node scripts/handpass/swl-w1B-probe3.mjs
import './swl-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const B = await import('./swl-w1B-lib.mjs')
const { L, T, A, J, sleep, OUT, path, place, boardUndo } = B
const SZ = process.env.SZ || 'd'
const DI = 4, ISO = '2026-07-17', BOLT = 'cards'
console.log('VERSION swl-w1B-probe3 2 (Marlin, RCP) · size', SZ, '· out', OUT)
const dump = async (p, W, tag) => {
  const l = (await B.openList(p, W, '#eWeek', DI), await B.readList(p, '#eWeek', DI))
  W.rec(tag + '.list', 'Edit Schedule Fri 17 list', 'REC', B.listSay(l), await B.listPic(p, W, '#eWeek', DI, tag))
  W.rec(tag + '.held', 'held (read only)', 'REC', (await B.held(p, DI)).join(' || '))
  W.rec(tag + '.pk', 'Bolt pucks on the week', 'REC', B.pkSay(await B.pk(p, '#eWeek', BOLT)))
  const h = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return null; const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; return { tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend, [data-pendlist]')), head: t(d.querySelector('.dhead, header, .dh')).slice(0, 200) } }, DI)
  W.rec(tag + '.head', 'the day head', 'REC', J(h))
}
await T.run('probe3', SZ, async (p, W) => {
  const a = await A.addLine(p, W, DI, { cs: 'VL BFM', to: '13:00', ld: '14:00' })
  W.rec('line', 'a flying line on Fri 17', 'REC', J(a))
  const k = `${DI}.${a.wi}.0.0.w`
  const r = await place(p, W, DI, `[data-slot="${k}"]`, 'tap', BOLT)
  W.rec('tap', 'Bolt tapped into the FCP', 'REC', `placed ${r.placed} · note "${r.toast}"`, r.pic)
  await dump(p, W, 'd1')
  const u = await boardUndo(p, W, DI, 'undo', 'u1')
  W.rec('undo', 'board Undo', 'REC', `${u.title} → "${u.toast}" · holds ${J(await B.dayHold(p, DI, BOLT))}`, u.pic)
  if (!W.isPhone) {
    await L.openBoard(p, W, DI)
    const src = p.locator(`#schedBoard .rpuck[data-person="${BOLT}"]:visible`).first(), dst = p.locator(`#schedBoard [data-slot="${k}"]:visible`).first()
    await p.evaluate(() => { window.__nt = []; new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t) window.__nt.push((t.textContent || '').trim()) }).observe(document.body, { childList: true, subtree: true, characterData: true }) })
    await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    await src.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await sleep(200)
    const sa = await src.boundingBox(), db = await dst.boundingBox()
    await p.mouse.move(sa.x + sa.width / 2, sa.y + sa.height / 2); await p.mouse.down()
    await p.mouse.move(sa.x + sa.width / 2 + 6, sa.y + sa.height / 2 + 6, { steps: 3 })
    await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 14 }); await sleep(150)
    await p.mouse.up(); await sleep(250)
    const note = await L.toastSaid(p)
    W.rec('drag', 'Bolt dragged from the crew list onto the FCP', 'REC', `holds ${J(await B.dayHold(p, DI, BOLT))} · note "${note}" · seen ${J(await p.evaluate(() => [...new Set(window.__nt)]))}`, await W.pic(p, 'drag'))
  } else {
    const r2 = await place(p, W, DI, `[data-slot="${k}"]`, 'tap2', BOLT)
    W.rec('tap2', 'Bolt tapped in again', 'REC', `placed ${r2.placed} · note "${r2.toast}"`, r2.pic)
  }
  const pub = await L.publish(p, W, DI)
  W.rec('pub', 'publish Fri 17', 'REC', pub, await W.pic(p, 'pub'))
  await L.closeBoard(p, W)
  await dump(p, W, 'd2')
  const f = await B.fileFor(p, W, ISO, BOLT, ['fly'], 'all', 'file')
  W.rec('file', 'Bolt filed Fly all day on Fri 17', 'REC', J(f.made))
  await L.go(p, 'editsched')
  await dump(p, W, 'd3')
  await L.go(p, 'viewsched')
  await B.openList(p, W, '#vWeek', DI)
  W.rec('view', 'View-only Fri 17 list (Saber)', 'REC', B.listSay(await B.readList(p, '#vWeek', DI)), await B.listPic(p, W, '#vWeek', DI, 'v'))
  const bl = await B.boardList(p, W, DI)
  W.rec('board', 'board Fri 17', 'REC', B.boardSay(bl), await W.pic(p, 'board'))
  const bh = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; return { ver: t(b.querySelector('.verchip')), top: t(b.querySelector('.sb-top, .sb-head, header')).slice(0, 300) } })
  W.rec('bhead', 'board head', 'REC', J(bh))
  await L.closeBoard(p, W)
  /* Export as PDF */
  await L.go(p, 'editsched')
  const ex = await p.locator('#exportPdf').count()
  W.rec('exp', 'Export as PDF control', 'REC', `count ${ex} · visible ${await p.locator('#exportPdf:visible').count()}`)
  if (ex) {
    await p.evaluate(() => { window.__printed = 0; const o = window.print; window.print = () => { window.__printed++ } })
    if (await p.locator('#exportPdf:visible').count()) await p.locator('#exportPdf:visible').first().click(); else await p.evaluate(() => document.querySelector('#exportPdf').click())
    await sleep(1500)
    const fr = await p.evaluate(() => { const f = [...document.querySelectorAll('iframe')]; return f.map(x => ({ src: x.src, len: x.contentDocument ? x.contentDocument.body.innerText.length : -1, head: x.contentDocument ? x.contentDocument.body.innerText.slice(0, 400).replace(/\s+/g, ' ') : '', sans: x.contentDocument ? x.contentDocument.body.innerText.split('\n').filter(l => /SANS|Bolt|issue/i.test(l)).slice(0, 12) : [] })) })
    W.rec('frames', 'frames after Export as PDF', 'REC', J(fr) + ' printed ' + await p.evaluate(() => window.__printed))
    await W.pic(p, 'exp')
    const html = await p.evaluate(() => { const f = [...document.querySelectorAll('iframe')].filter(x => x.contentDocument).pop(); return f ? f.contentDocument.documentElement.outerHTML : '' })
    writeFileSync(path.join(OUT, 'export.html'), html)
  }
})
