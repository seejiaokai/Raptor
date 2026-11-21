/* msq-j2-w1-h v1 — W1's helpers for job 2's walk (19 Nov 26) */
export const mk = async () => {
  const X = await import('./msq-lib.mjs')
  const U = await import('./msq-w1-util.mjs')
  const { say, sleep, row } = X
  const click = async (w, loc) => { if (w.phone) await loc.tap(); else await loc.click() }
  const FIND = 'input[aria-label="Find a callsign or sign-in"]'
  async function usersPage(w) {
    await X.L.go(w.page, 'admin'); await sleep(900)
  }
  async function openRow(w, cs) {
    const page = w.page
    await usersPage(w)
    const f = page.locator(FIND)
    await f.fill(cs); await sleep(600)
    const pid = await U.pidOf(page, cs)
    const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
    if (!(await tap.count())) return { pid, opened: false }
    await tap.click(); await sleep(800)
    return { pid, opened: true }
  }
  const controls = (page, pid) => page.evaluate(pid => {
    const out = []
    const root = document.querySelector(`.acc-row[data-person="${pid}"]`)
    const scope = root ? [root, root.nextElementSibling, root.parentElement].filter(Boolean) : []
    const seen = new Set()
    for (const s of scope) for (const e of s.querySelectorAll('button,input,select,[role=button]')) {
      if (seen.has(e)) continue; seen.add(e)
      const r = e.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      out.push({ tag: e.tagName, id: e.id || '', label: (e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 40), cls: String(e.className).slice(0, 40) })
    }
    return out
  }, pid)
  const swap = async (w, user) => { await X.signOut(w); await X.login(w.page, user) }
  return { X, U, say, sleep, row, click, FIND, usersPage, openRow, controls, swap }
}
