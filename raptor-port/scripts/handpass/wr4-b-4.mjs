// Walker b, B4 — what else could change a saved line: after A1's change (Ranger's LL -> OL by Saber), Ranger on his phone:
// reload; sign out and in; next week and back; the Leave War and back. Once while the line is unread, once after a tap read it.
// Run from raptor-port:  node scripts/handpass/wr4-b-4.mjs <run-folder-name>
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-b-4 v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.argv[2] || 'b4-run1'
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/b', RUN)
process.env.WR4_NEW ||= 'D:/rw4/build-new'
const L = await import('./wr4-lib.mjs')
const B = await import('./wr4-b-common.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, log, facts, go, bundleOf, sleep, WED, NEW_DIR } = L
const c = 'B4'
const out = { reads: [] }
async function read(w, tag) {
  await openBell(w)
  const ls = await B.readLines(w.page)
  const st = await B.bellState(w.page)
  out.reads.push({ tag, lines: B.said(ls), lit: st.lit })
  log(c, `${tag}: lit ${st.lit}; ${JSON.stringify(B.said(ls))}`)
  await B.bellPic(w, c, `B4-${String(out.reads.length).padStart(2, '0')}-${tag}-phone`, ls)
  await w.page.keyboard.press('Escape'); await sleep(250)
  return ls
}
async function round(w, phase) {
  await read(w, `${phase}-start`)
  await w.page.reload(); await w.page.waitForFunction(() => document.querySelector('#luser') || window.CURPAGE, null, { timeout: 30000 }); await sleep(1500)
  if (await w.page.locator('#luser').isVisible().catch(() => false)) { log(c, 'the reload showed the sign-in screen'); await signIn(w, 'us') }
  await w.page.addStyleTag({ content: L.NOMOTION })
  await read(w, `${phase}-reload`)
  await signIn(w, 'ad'); await signIn(w, 'us')   // signIn signs the one before out first
  await read(w, `${phase}-signout-in`)
  await go(w.page, 'viewsched')
  await w.page.evaluate(() => window.loadWeek('20/07/2026')); await sleep(1000)
  await w.page.evaluate(() => window.loadWeek('13/07/2026')); await sleep(1000)
  await read(w, `${phase}-week-there-back`)
  await go(w.page, 'leavewar'); await sleep(800)
  await go(w.page, 'viewsched')
  await read(w, `${phase}-leavewar-back`)
}
try {
  let w = await newPage('desk', undefined, NEW_DIR); await signIn(w, 'us')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const ll = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
  w = await handOver(w, 'desk', 'ad')
  await editInput(w, c, ll, WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  w = await handOver(w, 'phone', 'us')
  await round(w, 'unread')
  // read the line by a tap, then the same again
  await openBell(w)
  const ls = await B.readLines(w.page)
  const shows = await B.tapLine(w, c, ls[0].i, 'B4-tap-phone')
  log(c, 'tap opened: ' + JSON.stringify({ open: shows.open, type: shows.type, page: shows.page }))
  await B.closeWin(w)
  await round(w, 'read')
  const words = new Set(out.reads.map(r => JSON.stringify(r.lines.map(x => x.replace(/^\((un)?read\) /, '')))))
  log(c, `the same words every time: ${words.size === 1} (${[...words].join(' | ')})`)
  log(c, 'read states: ' + out.reads.map(r => `${r.tag}=${r.lines.map(x => x.slice(1, x.indexOf(')'))).join(',')}`).join('; '))
  await w.ctx.close()
} catch (e) { facts.errors.push(`${c}: ` + String(e && e.stack || e).slice(0, 600)); log(c, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
B.dump('b4.json', { out, log: facts.cases, errors: facts.errors })
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 20)) console.log('  ' + e)
await L.finish()
