/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 3: figure by figure.
   The published world against the untouched one, man by man: what each man's
   OIL figure was, what it is, and what the two new days credited him. A cell
   that says FO with no money behind it is the shape of a real defect, so the
   archive (used-up credits) is read too — a credit swallowed by an old debit
   is money that DID arrive. */
import { open, go, shot } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const BEFORE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const AFTER = OUT + '/state-lw-published.json'

async function figures(state) {
  const { browser, page, errors } = await open({ state })
  await go(page, 'leavewar')
  await page.waitForTimeout(1600)
  const sat = await cells(page, '2026-07-18'), sun = await cells(page, '2026-07-19')
  await page.click('[data-testid="oil-tracker"]')
  await page.waitForTimeout(1500)
  const bal = await page.evaluate(() => {
    const out = {}
    for (const r of document.querySelectorAll('[data-testid^="oil-row-"]')) {
      const id = r.getAttribute('data-oilrow')
      const nm = r.querySelector(`[data-testid="oil-name-${id}"]`)
      const b = r.querySelector(`[data-testid="oil-bal-${id}"]`)
      const a = r.querySelector(`[data-testid="oil-arch-${id}"]`)
      out[id] = { cs: (nm ? nm.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 16),
        bal: b ? Number(b.textContent.trim().replace('−', '-')) : null,
        arch: a ? (a.innerText || '').trim() : '',
        archTitle: a ? (a.getAttribute('title') || '') : '',
        ents: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
    }
    return out
  })
  await browser.close()
  return { sat, sun, bal, errors }
}
const cells = (page, d) => page.evaluate(x => {
  const o = {}
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const c = document.querySelector(`[data-testid="cell-${id}-${x}"]`)
    o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL'
  }
  return o
}, d)

const A = await figures(BEFORE)
const B = await figures(AFTER)

console.log('man            | Sat cell | Sun cell | OIL before | OIL after | moved | archive')
console.log('-'.repeat(96))
const bad = []
for (const id of Object.keys(B.bal)) {
  const b = B.bal[id], a = A.bal[id] || { bal: 0, arch: '' }
  const moved = (b.bal ?? 0) - (a.bal ?? 0)
  const satc = B.sat[id] || '', sunc = B.sun[id] || ''
  const earned = (satc ? 1 : 0) + (sunc ? 1 : 0)
  console.log(b.cs.padEnd(14) + ' | ' + satc.padEnd(8) + ' | ' + sunc.padEnd(8) + ' | '
    + String(a.bal).padStart(10) + ' | ' + String(b.bal).padStart(9) + ' | ' + String(moved).padStart(5)
    + ' | ' + (b.arch || '·') + (b.arch !== a.arch ? ' (was ' + (a.arch || '·') + ')' : ''))
  /* a cell that credits but moves no money, or money that moves with no cell */
  const credited = /FO|HO/.test(satc) || /FO|HO/.test(sunc)
  if (credited && moved === 0 && b.arch === a.arch) bad.push(b.cs + ': cell says ' + satc + '/' + sunc + ' but the figure did not move and nothing went to the archive')
  if (!credited && moved !== 0) bad.push(b.cs + ': figure moved by ' + moved + ' with no FO/HO cell on either day')
}
console.log('\nMISMATCHES between what the grid says and what the money did:')
console.log(bad.length ? bad.map(s => '  ! ' + s).join('\n') : '  none')
console.log('\nerrors before:', A.errors.slice(0, 4), '| after:', B.errors.slice(0, 4))
