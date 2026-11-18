/* msq-j2-r-h v1 — walker R's shared helpers (19 Nov 26, job 2 re-walk): sign-in swap, bell, Inputs, windows */
export const mk = async () => {
  const X = await import('./msq-lib.mjs')
  const U = await import('./msq-w1-util.mjs')
  const { say, sleep, row } = X
  const swap = async (w, user) => { await X.signOut(w); await X.login(w.page, user); say('signed in as', user) }
  const bellOpen = async (w, name) => {
    const page = w.page
    const b = page.locator('#notifyBell:visible').first()
    const cls = await b.getAttribute('class').catch(() => '')
    const aria = await b.getAttribute('aria-label').catch(() => '')
    const txt = ((await b.textContent().catch(() => '')) || '').trim()
    if (w.phone) await b.tap(); else await b.click()
    await sleep(900)
    const lines = await page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]') || document.querySelector('.bell-list'); return l ? l.innerText.split('\n').map(s => s.trim()).filter(Boolean) : null })
    if (name) await X.pic(w, name)
    return { cls, aria, txt, lines }
  }
  const bellClose = async w => {
    const page = w.page
    const open = await page.locator('[data-testid="bell-list"]:visible, .bell-list:visible').count()
    if (open) { const b = page.locator('#notifyBell:visible').first(); if (w.phone) await b.tap(); else await b.click(); await sleep(500) }
  }
  const openChip = async w => {
    const page = w.page
    await X.L.go(page, 'leavewar'); await sleep(2500)
    return ((await page.locator('[data-testid="open-chip"]').first().innerText().catch(() => '(no chip)')) || '').replace(/\s+/g, ' ').trim()
  }
  const FIND = 'input[aria-label="Find a callsign or sign-in"]'
  const lwCell = async (w, pid, d) => {
    const c = w.page.locator(`[data-testid="cell-${pid}-${d}"]`).first()
    await c.scrollIntoViewIfNeeded(); await sleep(400)
    if (w.phone) await c.tap(); else await c.click()
    await sleep(900)
  }
  const iso = (base, n) => { const d = new Date(base + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
  const T = '2026-11-19'
  const txt = sel => (w) => w.page.evaluate(s => (document.querySelector(s)?.innerText || '').replace(/\s+/g, ' ').trim(), sel)
  return { X, U, say, sleep, row, swap, bellOpen, bellClose, openChip, FIND, lwCell, iso, T, txt }
}
