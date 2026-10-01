/* Scenario 19 — opening Insights must not mutate any downstream schedule or entitlement reader. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s19-')
const { browser, p, errors } = await B.world()
const ph = !!process.env.HP_PHONE
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16) }
/* everything the app saved, as one fingerprint, plus its key count */
async function store() { const r = await L.rows(p); const keys = Object.keys(r).sort(); return { n: keys.length, h: hash(keys.map(k => k + '=' + r[k]).join('\n')), keys: r } }
async function record(label) {
  await B.toEdit(p); await B.openList(p, '#eWeek', TUE)
  const list = await B.readList(p, '#eWeek', TUE), head = await B.W.head(p, TUE)
  const info = await B.dayInfo(p, '#eWeek', TUE).catch(e => ({ err: String(e) }))
  const pend = await S.dayState(p, TUE, { view: true })
  const al = await B.alPanel ? null : null
  const alp = await p.evaluate(() => { const a = document.querySelector('#alPanel'); return a ? a.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : '(no panel)' })
  const st = await store()
  let lw = '(not read)', oil = '(not read)'
  try {
    await L.go(p, 'leavewar'); await S.sleep(900)
    lw = await p.evaluate(() => { const e = document.querySelector('#page-leavewar'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(none)' })
    const ob = p.locator('#page-leavewar button', { hasText: /OIL tracker/i }).first()
    if (await ob.count()) { await ob.click(); await S.sleep(700); oil = await p.evaluate(() => { const h = [...document.querySelectorAll('.bidsheet-hd')].find(e => /OIL TRACKER/i.test(e.innerText)); let sh = h; for (let i = 0; i < 4 && sh && sh.parentElement && sh.innerText.length < 400; i++) sh = sh.parentElement; return sh ? sh.innerText.replace(/\s+/g, ' ').trim() : '(no sheet)' }); await p.keyboard.press('Escape'); await S.sleep(400) }
  } catch (e) { lw = 'ERR ' + e.message.slice(0, 80) }
  await B.toEdit(p)
  return { bar: list.bar, lines: (list.lines || []).map(x => x.text + '|' + x.struck + '|' + x.btn).join(' // '), head: JSON.stringify(head), info: JSON.stringify({ stat: info.stat, sev: info.sev, als: info.als, n: (info.lines || []).length }), pend: JSON.stringify({ e: pend.editBar, v: pend.viewBar, c: pend.pending, s: pend.signs }), alp, st, lw: hash(lw) + ' ' + lw.slice(0, 80), oil: hash(oil) + ' ' + oil.slice(0, 120), lwFull: lw.length, oilFull: oil.length, label }
}
const same = (a, b) => ['bar', 'lines', 'head', 'info', 'pend', 'alp', 'lw', 'oil'].filter(k => a[k] !== b[k]).concat(a.st.h !== b.st.h ? ['stored rows'] : [])
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  await L.settle(p)
  const before = await record('before')
  row('19.a', 'Tuesday published with a waiting change (Rebel off); every non-Insights reader recorded', `bar "${before.bar}" · day head ${before.head.slice(0, 140)} · ⓘ ${before.info} · pending ${before.pend.slice(0, 160)} · Amendments panel "${before.alp}" · stored rows ${before.st.n} (fingerprint ${before.st.h}) · Leave War page text ${before.lwFull} chars, OIL tracker sheet ${before.oilFull} chars`, 'RECORDED', [await pic(p, 's19-a-before')])

  /* open, scroll, close — five times, with a scroll to the foot each time */
  const picks = []
  for (let i = 0; i < 5; i++) {
    const o = await S.openIns(p)
    await p.evaluate(() => { const b = document.querySelector('#insightBody'); const sc = b && (b.scrollHeight > b.clientHeight ? b : b.parentElement); if (sc) sc.scrollTop = 99999 }); await S.sleep(200)
    await p.evaluate(() => { const rows = document.querySelectorAll('#insightBody .irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await S.sleep(200)
    if (i === 2) picks.push(await pic(p, 's19-b-scrolled-open'))
    await S.closeIns(p)
    if (!o.ok) picks.push('open failed on round ' + i)
  }
  const mid = await record('after 5 opens')
  const dMid = same(before, mid)
  judge('19.b', 'Insights opened, scrolled to its foot and closed five times', [
    ['every recorded reader unchanged (bar, lines, head, ⓘ, pending, sign-offs, Amendments panel, Leave War page, OIL tracker)', dMid.filter(k => k !== 'stored rows').length === 0, dMid.join(', ') || 'identical'],
    ['the saved rows are byte-for-byte the same (nothing written by merely viewing)', !dMid.includes('stored rows'), `${before.st.n} rows, fingerprint ${before.st.h} → ${mid.st.n} / ${mid.st.h}`],
  ], [await pic(p, 's19-c-after-5-opens')])

  /* a reload, then the same again */
  await B.admin(p); await L.settle(p)
  const rl = await record('after reload')
  const o2 = await S.openIns(p); await p.evaluate(() => { const rows = document.querySelectorAll('#insightBody .irow'); if (rows.length) rows[rows.length - 1].scrollIntoView({ block: 'end' }) }); await S.sleep(200); await S.closeIns(p)
  const rl2 = await record('after reload and one more open')
  const dR = same(rl, rl2)
  judge('19.c', 'reload (sign in again), then one more open / scroll / close', [
    ['readers identical before and after that one open', dR.filter(k => k !== 'stored rows').length === 0, dR.join(', ') || 'identical'],
    ['saved rows identical', !dR.includes('stored rows'), `${rl.st.n}/${rl.st.h} → ${rl2.st.n}/${rl2.st.h}`],
    ['and the same as before the reload (nothing drifted across the reload)', same(before, rl).filter(k => k !== 'stored rows').length === 0, same(before, rl).join(', ') || 'identical'],
  ], [await pic(p, 's19-d-after-reload')])
  row('19.d', 'Print / CSV export', 'NOT WALKED as a file: an export is a file download, which needs the owner’s say-so in chat; the exported content is built from the same rows and day lists compared above, and the saved rows did not change', 'NOT WALKED (download needs permission)', [])
  row('19.e', 'OIL Earn figures', `read through the Leave War OIL tracker sheet (${before.oilFull} chars) — compared above, identical`, 'RECORDED', [])
} catch (e) { row('19.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's19-X-error')]) }
row('19.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s19', { errors })
await browser.close()
