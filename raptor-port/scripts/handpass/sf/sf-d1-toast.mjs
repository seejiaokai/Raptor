/* D1 — [AMEND-SMALL-SEEN] 1: a publish says what it published even when the OIL check speaks in the same breath, and
   Unpublish says what it did. Walked on the edit week, desktop. Usage: node sf-d1-toast.mjs [outdir-suffix] */
const OUT = 'd1-toast' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, editWeek, editText, signDay, publishAL, unpublish, head, screen, check, note, summary, SF_STATE, DESK } = L
const shown = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.style.opacity !== '0' ? t.textContent : '' })

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
await editWeek(page)
/* A spy that sees EVERY message, even two written in the same breath (a MutationObserver batches them and would record
   only the last): the one toast element is made once (the bridge's own toast), then its text writes are recorded. */
async function spy(page) {
  await page.evaluate(() => {
    if (!document.getElementById('toastEl')) window.toast(' ')
    const t = document.getElementById('toastEl'); window.__said = []
    const d = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent')
    Object.defineProperty(t, 'textContent', { configurable: true, get() { return d.get.call(this) }, set(v) { window.__said.push(String(v)); d.set.call(this, v) } })
  })
}
const takeSaid = page => page.evaluate(() => { const a = window.__said || []; window.__said = []; return a.filter(s => s.trim()) })
await spy(page)
/* Saturday — a weekend day published at its Original: a change, the four, Publish AL1 → the OIL check runs too */
await editText(page, 'dn:5.0', 'SAT NOTE — SF AL1')
note('Sat before', JSON.stringify(await head(page, 5)))
await signDay(page, 5); await takeSaid(page)
const pub = await publishAL(page, 5)
const said = await takeSaid(page), face = await shown(page)
await screen(page, 'd1-a-sat-published-al1')
note('Sat Publish AL1 pressed', JSON.stringify(pub))
note('every toast raised in that press', JSON.stringify(said))
note('the toast on screen after it', face)
check('D1a the toast on screen still says what was published', /Published AL1/.test(face), face)
check('D1b every message raised by the press is on screen (none swallowed)', said.every(s => s.split(' · ').every(part => face.includes(part.trim()))), JSON.stringify({ said, face }))
/* Tuesday — published at its Original, nothing waiting: Unpublish */
await page.waitForTimeout(300); await takeSaid(page)
const un = await unpublish(page, 1)
const usaid = await takeSaid(page), uface = await shown(page)
await screen(page, 'd1-b-tue-unpublished')
note('Tue Unpublish', JSON.stringify({ un, usaid, uface, head: await head(page, 1) }))
check('D1c Unpublish says what it did', un.pressed && /unpublish/i.test(uface), uface)
check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-d1-toast') ? 1 : 0
