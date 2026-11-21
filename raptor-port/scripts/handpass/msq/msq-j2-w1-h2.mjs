/* msq-j2-w1-h2 v1 — W1's Leave War readers (19 Nov 26) */
export const iso = (base, n) => { const d = new Date(base + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
export const T = '2026-11-19'
export const lwRow = (page, pid, days) => page.evaluate(([pid, days]) => {
  const out = {}
  for (const d of days) {
    const c = document.querySelector(`[data-testid="cell-${pid}-${d}"]`)
    out[d] = c ? ((c.innerText || '').replace(/\s+/g, ' ').trim() + ' {' + String(c.className).replace(/\s+/g, '.').slice(0, 60) + '}') : '(no cell)'
  }
  return out
}, [pid, days])
export const lwScroll = async (page, pid, d) => {
  const c = page.locator(`[data-testid="cell-${pid}-${d}"]`).first()
  if (await c.count()) await c.scrollIntoViewIfNeeded().catch(() => {})
  return c
}
