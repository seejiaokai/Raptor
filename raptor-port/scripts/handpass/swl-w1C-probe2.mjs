// swl-w1C-probe2 — walker C learns more of the present screen (chat 203, 26 Nov 26): where each SANS man sits each day of
// the demo week, the Logic page's SANS check and its Edit mode, Admin → Users for Ranger once posted out, the ⓘ popup and
// View-only Sched's warning list. Reads, and one posting through the Leave War's own sheet.
//   SWLC_RUN=probe2 SZ=d|p node scripts/handpass/swl-w1C-probe2.mjs   (from raptor-port/)
import './swl-w1C-env.mjs'
import { writeFileSync } from 'node:fs'
const X = await import('./sss-w1A-lib.mjs')
const { Z, L, sleep, J, run, RANGER } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION swl-w1C-probe2 1 · ${SZ} · bundle ${process.env.W2_URL} · out ${X.OUT}`)
const dump = {}
const SANS = ['yeti', 'cards', 'wrangler', 'badger', 'ipman', 'vinci', 'romeo', 'krait', 'waldo', 'nick', 'bullet', 'dj']
await run('PR2', SZ, async (p, W) => {
  dump.holds = {}
  for (const id of SANS) dump.holds[id] = await p.evaluate(id => (window.DAYS || []).map(d => {
    const out = []
    const walk = (o, at) => { if (o == null) return; if (typeof o === 'string') { if (o === id) out.push(at); return } if (Array.isArray(o)) { o.forEach((x, n) => walk(x, at + '[' + n + ']')); return } if (typeof o === 'object') for (const k of Object.keys(o)) if (k !== 'by') walk(o[k], at + '.' + k) }
    walk(d, '')
    const kinds = out.map(a => { const m = /^\.waves\[(\d+)\]/.exec(a); return m ? (d.waves[+m[1]].kind || 'fly') + ':' + (d.waves[+m[1]].label || '') : a.split('[')[0] })
    return d.dt + ': ' + (out.map((a, i) => a + ' {' + kinds[i] + '}').join(' ') || 'nothing')
  }), id)
  // Logic page: search SANS
  await L.go(p, 'logic'); await sleep(600)
  await p.fill('#lgSearch', 'SANS'); await sleep(700)
  dump.logicRows = await p.evaluate(() => [...document.querySelectorAll('#page-logic *')].filter(e => e.getBoundingClientRect().width > 0 && /SANS/.test(e.textContent || '') && e.children.length <= 4 && (e.textContent || '').length < 400).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 50), txt: (e.textContent || '').replace(/\s+/g, ' ').trim() })).slice(0, 40))
  await W.pic(p, 'logic-search')
  if (await p.locator('#lgEdit:visible').count()) {
    await W.press(p, '#lgEdit:visible', 'lg-edit'); await sleep(500)
    dump.logicEdit = await p.evaluate(() => [...document.querySelectorAll('#page-logic input, #page-logic button, #page-logic [role="switch"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const row = e.closest('[class*="row"], li, tr, div'); return { tag: e.tagName, type: e.type || '', id: e.id, cls: String(e.className).slice(0, 50), aria: e.getAttribute('aria-pressed') || e.getAttribute('aria-checked') || '', data: JSON.stringify(e.dataset).slice(0, 80), row: row ? (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) : '' } }).filter(x => /SANS/.test(x.row)).slice(0, 20))
    await W.pic(p, 'logic-edit')
    if (await p.locator('#lgDone:visible').count()) await W.press(p, '#lgDone:visible', 'lg-done')
  }
  // ⓘ popup on Edit Schedule for Wed 15
  await L.go(p, 'editsched'); await sleep(500)
  dump.iBtns = await p.evaluate(() => [...document.querySelectorAll('#eWeek button, #eWeek [role="button"]')].filter(e => e.getBoundingClientRect().width > 0 && /^(i|ⓘ)$/.test((e.textContent || '').trim())).map(e => ({ id: e.id, cls: String(e.className), data: JSON.stringify(e.dataset), title: e.getAttribute('title') || e.getAttribute('aria-label') || '' })).slice(0, 10))
  // View-only Sched: its day warning bars and lists
  await L.go(p, 'viewsched'); await sleep(600)
  dump.viewWarn = await p.evaluate(() => [...document.querySelectorAll('#page-viewsched [class*="warn"], #page-viewsched details')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 50), data: JSON.stringify(e.dataset).slice(0, 60), txt: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160) })).slice(0, 20))
  await W.pic(p, 'view')
  // Ranger posted SANS from Fri 17, then Admin → Users: his row pressed
  await Z.post(p, W, RANGER, '2026-07-17', 'set.post')
  await L.go(p, 'admin'); await sleep(600)
  const r = p.locator('#page-admin').getByText('Ranger', { exact: true }).first()
  if (await r.count()) { await r.scrollIntoViewIfNeeded(); await W.press(p, r, 'admin-ranger'); await sleep(700) }
  dump.adminRanger = await p.evaluate(() => document.body.innerText.split('\n').filter(x => x.trim()).slice(0, 200).filter(x => /SANS|post|Ranger|date|from/i.test(x)))
  await W.pic(p, 'admin-ranger')
}, '2026-07-15T09:00:00')
writeFileSync(`D:/raptor-work/c203-walk/C/probe2-${SZ}.json`, JSON.stringify(dump, null, 1))
console.log('DONE probe2')
process.exit(0)
