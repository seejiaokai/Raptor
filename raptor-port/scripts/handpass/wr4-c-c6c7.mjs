// Walker c — C6 (Ranger: any route to a day's OIL list or its Save?) and C7 (the 60-letter note measured on the phone,
// Chromium and WebKit; a second note replacing the first). Run: node scripts/handpass/wr4-c-c6c7.mjs
console.log('wr4-c-c6c7 v1')
const C = await (await import('./wr4-c-common.mjs')).setup('c6c7')
const { newPage, signIn, handOver, go, sleep, judge, save, note, noteGone, bundleOf, log, shot, finish, NEW_DIR } = C
const LONG = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567'

/* the note's letters against its own box and the screen: the drawn text's rectangle (a Range over its text) */
const inkOf = page => page.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = document.createRange(); r.selectNodeContents(t); const rs = [...r.getClientRects()]
  const box = t.getBoundingClientRect()
  const L = Math.min(...rs.map(x => x.left)), R = Math.max(...rs.map(x => x.right))
  return { box: { l: Math.round(box.left), r: Math.round(box.right), w: Math.round(box.width) }, ink: { l: Math.round(L), r: Math.round(R) }, scrollW: t.scrollWidth, clientW: t.clientWidth, vw: innerWidth, pageScrollW: document.documentElement.scrollWidth, overflowX: getComputedStyle(t).overflowX, wordBreak: getComputedStyle(t).overflowWrap + '/' + getComputedStyle(t).wordBreak }
})
async function longNote(w, tag) {
  await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
  const key = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-txt^="ff:"][data-txt$=".to"]')].find(x => x.getBoundingClientRect().width > 4); if (!e) return null; e.scrollIntoView({ block: 'center' }); return e.getAttribute('data-txt') })
  if (!key) { judge('C7', `long note ${tag}`, 'NOT WALKED', 'no take-off box', ''); return }
  const el = w.page.locator(`#eWeek [data-txt="${key}"]`).first()
  await el.tap(); await sleep(300)
  await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(LONG); await w.page.keyboard.press('Tab')
  const t = await C.catchToast(w.page, /not a time/, 4000)
  const m = await inkOf(w.page)
  await w.page.screenshot({ path: `${process.env.WR4_OUT}/c7-longnote-${tag}.png` })
  await C.releaseToast(w.page)
  const over = m && (m.ink.r > m.box.r || m.ink.l < m.box.l || m.ink.r > m.vw)
  judge('C7', `long note fits ${tag}`, over ? 'FAIL' : 'PASS', { text: t, ...m }, 'the letters inside the note and the screen', `c7-longnote-${tag}.png`)
  /* a second note straight after the first: 2560 typed at once */
  await el.tap(); await sleep(300)
  await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('2560'); await w.page.keyboard.press('Tab')
  await sleep(250)
  const t2 = await C.shownToast(w.page)
  await w.page.screenshot({ path: `${process.env.WR4_OUT}/c7-second-note-${tag}.png` })
  judge('C7', `second note replaces ${tag}`, t2 === '2560 is not a time. Try 0900 or 09:00.' ? 'PASS' : 'FAIL', t2, '2560 is not a time. Try 0900 or 09:00.', `c7-second-note-${tag}.png`)
}
try {
  const w = await newPage('phone'); await signIn(w, 'ad'); log('C7', 'bundle ' + await bundleOf(w.page))
  await longNote(w, 'phone')
  /* C6: Ranger, the same world */
  const r = await handOver(w, 'phone', 'us')
  const probe = async sz => r.page.evaluate(() => ({ page: window.CURPAGE, oilList: !!document.querySelector('[data-testid*="oilday"], .oilday-list'), signBoxes: [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 2 && !e.disabled).length, oilChips: [...document.querySelectorAll('[data-oilsent], [data-oilitem]')].filter(e => e.getBoundingClientRect().width > 2).length }))
  const out = {}
  for (const p of ['viewsched', 'editsched', 'inputs', 'leavewar']) { try { await go(r.page, p); out[p] = await probe() } catch (e) { out[p] = 'could not open: ' + e.message.split('\n')[0].slice(0, 80) } }
  await go(r.page, 'viewsched')
  const lines = await C.openBell(r)
  out.bell = lines.map(l => `${l.name} ${l.day} / ${l.what}`)
  await r.page.screenshot({ path: `${process.env.WR4_OUT}/c6-ranger-bell-phone.png` })
  judge('C6', 'Ranger: a route to the OIL day list or its Save', 'RECORD', out, 'say "not reachable" if none', 'c6-ranger-bell-phone.png')
  await r.ctx.close()
} catch (e) { console.log('ERR phone', e.message.split('\n')[0]); C.facts.errors.push('phone ' + e.stack) }
try {
  const k = await newPage('phone', undefined, NEW_DIR, 'webkit'); await signIn(k, 'ad')
  await longNote(k, 'wk')
  await k.ctx.close()
} catch (e) { console.log('ERR wk', e.message.split('\n')[0]); C.facts.errors.push('wk ' + e.stack) }
save(); await finish()
console.log('errors:', C.facts.errors.length, C.facts.errors.slice(0, 5).map(s => s.slice(0, 200)))
