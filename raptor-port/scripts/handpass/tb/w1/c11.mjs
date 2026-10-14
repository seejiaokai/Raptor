import * as F from './fx.mjs'
const { L } = F
console.log('w1 c11 v1')
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
const w = await L.world('desk')
const p = w.page
try {
  const ACCENT = await p.evaluate(() => { const i = document.createElement('i'); i.style.color = 'var(--accent)'; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return c })
  const fx = await F.c6Fixture(w)
  await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(300)
  const n = await F.readNote(p)
  console.log('strip', JSON.stringify(n.strip))
  await p.locator('[data-testid="legend-open"]').focus()
  const before = await L.focusOf(w)
  await p.keyboard.press('Tab'); await L.sleep(200)
  const on = await L.focusOf(w)
  const info = await p.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); return { tid: e.getAttribute('data-testid'), text: (e.textContent || '').replace(/\s+/g, ' ').trim(), ring: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` } })
  console.log('before', before, '| after Tab', on, JSON.stringify(info), 'accent', ACCENT)
  await L.pic(w, 'c11-desk-keyboard-on-instruction', { clip: { x: 0, y: 60, width: 1440, height: 260 } })
  const firstWho = n.strip[0].split(' · ')[0]
  await p.keyboard.press('Enter'); await L.sleep(700)
  const sheet = await F.sheetNow(p)
  console.log('sheet', JSON.stringify(sheet))
  await L.pic(w, 'c11-desk-enter-opens-the-sheet')
  const btns = (sheet.buttons || []).map(b => b.split(':').slice(1).join(':'))
  ok('C11', `Tab from Legend lands on the first clash's instruction "Decide the bid ›" wearing a cyan ring; Enter opens ${firstWho}'s Sat 18 Jul sheet with Ack, Approve, Refuse`,
    { focusBefore: before, focus: info, accent: ACCENT, sheet: { open: sheet.open, text: (sheet.text || '').slice(0, 60), buttons: btns }, firstWho },
    info.tid === 'clash-go-0' && /^Decide the bid/.test(info.text) && info.ring === `solid 2px ${ACCENT}` && (sheet.text || '').startsWith(firstWho + ' Sat 18 Jul') && ['Ack', 'Approve', 'Refuse'].every(x => btns.includes(x)))
} finally { await L.close(w) }
