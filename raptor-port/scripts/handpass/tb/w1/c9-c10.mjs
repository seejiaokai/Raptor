import * as F from './fx.mjs'
const { L } = F
console.log('w1 c9-c10 v1')
L.SIZES.p431 = { w: 431, h: 932, dpr: 3, phone: true }
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
{
  const w = await L.world('p431')
  const p = w.page
  try {
    const fx = await F.c6Fixture(w)
    await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(300)
    const n = await F.readNote(p)
    console.log('c9 note', JSON.stringify({ cls: n.cls, inFilters: n.inFilters, line: n.line, strip: n.strip, box: n.box, vw: n.vw }))
    ok('C9 431x932', 'the strip of a desktop (inside the stage line), not the phone\'s line', { cls: n.cls, inFilters: n.inFilters, line: n.line, strip: n.strip, box: n.box }, n.cls === 'syncclash' && n.inFilters && n.line === null && n.strip.length === 2)
    await L.pic(w, 'c9-431x932-strip')
  } finally { await L.close(w) }
}
{
  const w = await L.world('phone')
  const p = w.page
  try {
    const fx = await F.c6Fixture(w)
    await w.press('[data-testid="clash-line"]'); await L.sleep(400)
    await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(200)
    const probe = () => p.evaluate(() => {
      const n = document.querySelector('[data-testid="sync-clashes"]'), q = (el) => { const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); return { x: Math.round(x), y: Math.round(y), ok: !!h && el.contains(h), hit: h ? h.tagName + '.' + String(h.className).slice(0, 25) + (h.id ? '#' + h.id : '') : null } }
      const line = n.querySelector('[data-testid="clash-line"]'), rows = [...n.querySelectorAll('.clashrow')]
      const burger = document.getElementById('burger'), nb = n.getBoundingClientRect(), bb = burger.getBoundingClientRect()
      const t = document.getElementById('toastEl'), tb = t ? t.getBoundingClientRect() : null
      const inter = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
      return { line: q(line), rows: rows.map(q), burgerOverlapsNote: inter(nb, bb), burgerBox: `${Math.round(bb.left)},${Math.round(bb.top)} ${Math.round(bb.width)}x${Math.round(bb.height)}`, noteBox: `${Math.round(nb.left)},${Math.round(nb.top)} ${Math.round(nb.width)}x${Math.round(nb.height)}`, toast: t ? { text: t.textContent, opacity: getComputedStyle(t).opacity, overlapsNote: tb ? inter(nb, tb) : null } : null, scrollY: Math.round(scrollY), topbarBottom: Math.round(document.querySelector('#shell .topbar').getBoundingClientRect().bottom) }
    })
    let r = await probe()
    console.log('c10 probe (quiet)', JSON.stringify(r))
    await L.pic(w, 'c10-phone-full-with-menu-button')
    // raise a passing note with the screen's own control: undo in the top bar
    const hasToast = await p.evaluate(() => typeof window.toast)
    console.log('window.toast is', hasToast)
    let raised = 'none'
    await w.press('[aria-label="Undo"], #undoBtn, .topbar [title*="ndo"]').catch(() => {})
    await L.sleep(250)
    const r2 = await probe()
    console.log('c10 probe (after undo press)', JSON.stringify(r2))
    await L.pic(w, 'c10-phone-full-after-a-note')
    const all = [r.line, ...r.rows, r2.line, ...r2.rows]
    ok('C10', 'each centre (line, each row) belongs to it; nothing over the note — not the menu button, not a passing note', { quiet: { line: r.line, rows: r.rows, burgerOverlapsNote: r.burgerOverlapsNote, burger: r.burgerBox, note: r.noteBox, toast: r.toast }, afterUndoPress: { line: r2.line, rows: r2.rows, burgerOverlapsNote: r2.burgerOverlapsNote, toast: r2.toast } },
      all.every(x => x.ok) && !r.burgerOverlapsNote && !r2.burgerOverlapsNote && !(r2.toast && +r2.toast.opacity === 1 && r2.toast.overlapsNote))
  } finally { await L.close(w) }
}
