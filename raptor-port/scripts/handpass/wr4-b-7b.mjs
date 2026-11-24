// Walker b, B7 part 2 — (a) the "↓ N more" foot with a list long enough to scroll (phone and desktop, Ranger);
// (b) the Scheduler Board's own bell against the top bar's (Saber, who can open the board: Ranger changes a Training he
// filed for himself and Saber). Run from raptor-port:  node scripts/handpass/wr4-b-7b.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-7b v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b7b-run1'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, log, facts, press, bundleOf, sleep, shot, bellClip, RANGER, NEW_DIR } = L
const c = 'B7b'
const out = {}
const DAYS = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24']
const below = page => page.evaluate(() => {
  const s = document.querySelector('[data-testid="bell-list"] .bl-scroll'); if (!s) return null
  const r = s.getBoundingClientRect()
  const n = [...s.querySelectorAll('.bl-line')].filter(l => l.getBoundingClientRect().bottom > r.bottom + 1).length
  const f = document.querySelector('[data-testid="bell-more"]')
  const lb = document.querySelector('[data-testid="bell-list"]').getBoundingClientRect()
  return { counted: n, foot: f ? f.textContent.trim() : null, scrollTop: Math.round(s.scrollTop), scrollMax: s.scrollHeight - s.clientHeight, listBottom: Math.round(lb.bottom), screen: innerHeight }
})
try {
  let w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'ad')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const SABER = await w.page.evaluate(() => Object.entries(window.PEOPLE).find(([, p]) => p && p.cs === 'Saber')?.[0])
  log(c, 'Saber id: ' + SABER)
  for (let i = 0; i < DAYS.length; i++) await fileInput(w, c, DAYS[i], { type: 'Training', people: [RANGER], from: '14:00', to: '15:00', title: 'Sim brief ' + (i + 1), remarks: '' })
  w = await handOver(w, 'desk', 'us')
  const g = await fileInput(w, c, '2026-07-15', { type: 'Training', people: [RANGER, SABER], from: '09:00', to: '10:00', title: 'Training', remarks: 'Kit' })
  if (g) await editInput(w, c, g, '2026-07-15', async () => { await w.page.selectOption('#inpEditPop #inpEditType', 'Meeting'); await w.page.fill('#inpEditPop #inpEditRmk', 'No kit') })
  await sleep(1200)
  const state = await w.ctx.storageState({ indexedDB: true }); await w.ctx.close()
  // (a) the foot
  for (const size of process.argv[3] === 'board' ? [] : ['phone', 'desk']) {
    const r = await newPage(size, state, NEW_DIR); await signIn(r, 'us')
    await openBell(r)
    const ls = await B.readLines(r.page)
    const steps = []
    steps.push({ at: 'top', ...(await below(r.page)) })
    await B.bellPic(r, c, `B7b-1-foot-top-${size}`, ls)
    for (const [tag, f] of [['third', 1 / 3], ['twothirds', 2 / 3], ['end', 1]]) {
      const box = await r.page.locator('[data-testid="bell-list"] .bl-scroll').boundingBox()
      const max = (await below(r.page)).scrollMax
      if (r.tap) {
        // a finger drags the list up inside its own box (CDP touch), resting before it lifts
        const cdp = await r.ctx.newCDPSession(r.page)
        const x = box.x + box.width / 2, y0 = box.y + box.height * 0.8
        await r.page.evaluate(() => 0)
        await cdp.send('Input.synthesizeScrollGesture', { x, y: y0, yDistance: -Math.round(max * f - (await below(r.page)).scrollTop), speed: 600, gestureSource: 'touch' })
        await sleep(500)
      } else {
        await r.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await r.page.mouse.wheel(0, Math.round(max * f - (await below(r.page)).scrollTop)); await sleep(500)
      }
      const b = await below(r.page)
      steps.push({ at: tag, ...b })
      await shot(r.page, c, `B7b-2-foot-${tag}-${size}`, await bellClip(r.page), b, size)
    }
    out['foot_' + size] = { lines: ls.length, steps }
    for (const s of steps) log(c, `${size} ${s.at}: scroll ${s.scrollTop}/${s.scrollMax}; lines below counted ${s.counted}; foot says ${JSON.stringify(s.foot)}; ${s.foot ? (s.foot === `↓ ${s.counted} more` ? 'MATCH' : 'DIFFERS') : (s.counted ? 'DIFFERS (no foot)' : 'MATCH (no foot, none below)')}`)
    await r.ctx.close()
  }
  // (b) Saber: the top bar's bell and the board's
  const s = await newPage('desk', state, NEW_DIR); await signIn(s, 'ad')
  await L.go(s.page, 'viewsched')
  await press(s, '#notifyBell'); await sleep(500)
  const top = await B.readLines(s.page)
  out.saberTop = B.said(top)
  log(c, 'Saber top bar: ' + JSON.stringify(B.said(top)) + ' note ' + JSON.stringify(await L.shownToast(s.page)))
  await shot(s.page, c, 'B7b-3-saber-topbar-desk', (await bellClip(s.page)) || { x: 0, y: 0, width: 1440, height: 400 }, B.said(top), 'desk')
  await s.page.keyboard.press('Escape'); await sleep(300)
  await L.go(s.page, 'editsched')
  await s.page.evaluate(() => window.openScheduler(0)); await s.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(800)
  await press(s, '#sbBell'); await sleep(500)
  const sb = await B.readLines(s.page)
  out.saberBoard = B.said(sb)
  log(c, 'Saber board bar: ' + JSON.stringify(B.said(sb)) + ' note ' + JSON.stringify(await L.shownToast(s.page)))
  log(c, `same words: ${JSON.stringify(top.map(x => x.what)) === JSON.stringify(sb.map(x => x.what))}`)
  await shot(s.page, c, 'B7b-4-saber-board-desk', (await L.boxOf(s.page, ['[data-testid="bell-list"]', '#sbBell'], 10)) || { x: 0, y: 0, width: 1440, height: 400 }, B.said(sb), 'desk')
  await s.ctx.close()
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b7b.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
