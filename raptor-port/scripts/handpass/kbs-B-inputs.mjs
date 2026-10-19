// Walker B — B6 (Inputs page gear: late cut-off days) and B7 (SANS calendar gear: Yellow / Amber / Red from). VERSION 1
import { launch, runBox, prevFocusable, RES } from './kbs-B-lib.mjs'
import { appendFileSync } from 'node:fs'
const size = process.argv[2] || 'desktop'
const only = process.argv[3] || ''
console.log('kbs-B-inputs VERSION 1', size, only)
const A = await launch(size)
const { page } = A
const T = id => page.locator(`[data-testid="${id}"]`)
const vis = async id => (await T(id).count()) > 0 && (await T(id).first().isVisible().catch(() => false))
const saveBtn = () => page.locator('button:visible', { hasText: /^\s*Save\s*$/ }).last()

if (!only || only === 'B6') {
  await A.go('inputs'); await page.waitForTimeout(700)
  const openGear = async () => { if (!(await vis('iset-lead'))) { await A.tap('#inGear'); await page.waitForTimeout(500) } }
  const noteText = () => page.evaluate(() => {
    const els = [...document.querySelectorAll('*')].filter(e => /inputs are due by/i.test(e.textContent || '') && e.children.length === 0)
    return els.length ? els[0].textContent.trim() : '(no line found)'
  })
  const note0 = await (async () => { await openGear(); return await noteText() })()
  console.log('baseline line under the box:', note0)
  await runBox(A, {
    id: 'B6', slug: 'late-cutoff', name: 'Inputs page ⚙ → Days before the week starts',
    ensure: openGear,
    loc: A => T('iset-lead'), prev: A => prevFocusable(T('iset-lead')),
    prior: '14', typed: '10',
    expectText1: 'box holds only "10"',
    readAfter: async A => (await A.val(T('iset-lead'))) + ' | ' + (await noteText()),
    expect2: (left) => left.startsWith('10 | ') && !left.includes(note0),
    expectText2: 'box "10"; the line under it names a new date (not the one it named for 14)',
    persist: async A => { await A.tap(saveBtn()); await page.waitForTimeout(600); if (await vis('iset-lead')) await page.keyboard.press('Escape'); await page.waitForTimeout(300); await openGear(); return (await A.val(T('iset-lead'))) + ' | ' + (await noteText()) },
    persistDid: 'pressed Save, then opened the gear again',
    expectTextPersist: 'box still "10"',
    expectPersist: v => v.startsWith('10 | '),
  })
  if (await vis('iset-lead')) { await A.tap(page.locator('button:visible', { hasText: /^\s*Cancel\s*$/ }).last()).catch(() => {}) }
}

if (!only || only === 'B7') {
  await A.go('inputs'); await page.waitForTimeout(700)
  await A.tap('#inSansMode'); await page.waitForTimeout(700)
  const openGear = async () => { if (!(await vis('sset-yellow'))) { await A.tap('.sc-gear'); await page.waitForTimeout(500) } }
  for (const [slug, tid, label, prior] of [['yellow', 'sset-yellow', 'Yellow from', '1'], ['amber', 'sset-amber', 'Amber from', '3'], ['red', 'sset-red', 'Red from', '5']]) {
    await runBox(A, {
      id: 'B7', slug, name: `SANS calendar ⚙ → ${label}`,
      ensure: async A => { await openGear() },
      loc: A => T(tid), prev: A => prevFocusable(T(tid)),
      prior, typed: '2',
      expectText1: 'box holds only "2"',
      readAfter: async A => (await A.val(T('sset-yellow'))) + ' / ' + (await A.val(T('sset-amber'))) + ' / ' + (await A.val(T('sset-red'))),
      expect2: (left) => { const [y, a, r] = left.split(' / '); return ({ 'sset-yellow': y, 'sset-amber': a, 'sset-red': r })[tid] === '2' },
      expectText2: 'the box shows "2" (yellow / amber / red are listed in the shown text)',
      persist: async A => { await A.tap(saveBtn()); await page.waitForTimeout(700); if (await vis(tid)) await page.keyboard.press('Escape'); await page.waitForTimeout(300); await openGear(); return (await A.val(T('sset-yellow'))) + ' / ' + (await A.val(T('sset-amber'))) + ' / ' + (await A.val(T('sset-red'))) },
      persistDid: 'pressed Save, then opened the SANS gear again',
      expectTextPersist: 'the box still "2"',
      expectPersist: v => { const [y, a, r] = v.split(' / '); return ({ 'sset-yellow': y, 'sset-amber': a, 'sset-red': r })[tid] === '2' },
    })
    // put the three back to 1 / 3 / 5 for the next box
    await openGear()
    for (const [t, v] of [['sset-red', '5'], ['sset-amber', '3'], ['sset-yellow', '1']]) { await T(t).fill(v); await T(t).evaluate(e => e.blur()) }
    await A.tap(saveBtn()); await page.waitForTimeout(600)
    if (await vis(tid)) await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  }
  // the red box with a value ABOVE amber (2 is below amber's 3, which the screen does not keep on Save)
  await openGear()
  await T('sset-red').fill('5'); await T('sset-red').evaluate(e => e.blur()); await page.waitForTimeout(750)
  await A.pressEl(T('sset-red')); await page.keyboard.type('9', { delay: 45 }); await page.keyboard.press('Tab'); await page.waitForTimeout(400)
  const typed = await A.val(T('sset-red'))
  await A.tap(saveBtn()); await page.waitForTimeout(700); if (await vis('sset-red')) await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await openGear()
  const kept = (await A.val(T('sset-yellow'))) + ' / ' + (await A.val(T('sset-amber'))) + ' / ' + (await A.val(T('sset-red')))
  const pic = await A.shot('B7-red-9-saved')
  const r = { id: 'B7', box: 'SANS calendar ⚙ → Red from', size: A.size, step: '2d', did: 'extra: pressed Red from (held 5), typed 9 (above amber), Tab, Save, opened the gear again', expected: 'Save keeps 9', shown: kept, result: kept.endsWith('/ 9') ? 'PASS' : 'FAIL', pics: [pic], note: 'box read "' + typed + '" before Save' }
  appendFileSync(RES, JSON.stringify(r) + '\n'); console.log('  [B7 red s2d]', r.result, JSON.stringify(kept))
  await T('sset-red').fill('5'); await T('sset-red').evaluate(e => e.blur()); await A.tap(saveBtn()); await page.waitForTimeout(500)
}
console.log('errors', A.errors)
await A.close()
