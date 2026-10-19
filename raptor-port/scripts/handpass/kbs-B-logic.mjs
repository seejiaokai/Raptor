// Walker B — B8 / B9 (Logic page ✎ Edit) and B12 (a member on Logic and the Leave War). VERSION 1
import { launch, runBox, prevFocusable } from './kbs-B-lib.mjs'
import { appendFileSync } from 'node:fs'
import { RES } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
const only = process.argv[3] || ''
console.log('kbs-B-logic VERSION 1', size, only)
const row = (A, id, box, step, did, expected, shown, result, pics, note) => { const r = { id, box, size: A.size, step, did, expected, shown, result, pics: pics || [], note: note || '' }; appendFileSync(RES, JSON.stringify(r) + '\n'); console.log(`  [${id} ${A.size} s${step}] ${result} — shown ${JSON.stringify(shown)}${note ? ' — ' + note : ''}`) }

if (!only || only === 'B8' || only === 'B9') {
  const A = await launch(size)
  const { page } = A
  const edit = async () => { if (!(await page.locator('.lgin').first().isVisible().catch(() => false))) { await A.go('logic'); await page.waitForTimeout(400); await page.click('#lgEdit'); await page.waitForTimeout(500) } }
  const box = label => A.page.locator(`input.lgin[aria-label="${label}"]`)
  if (!only || only === 'B8') {
    for (const [slug, label, prior, typed, leaveRe] of [['crew-rest', 'Crew rest', '12h', '11h', /^11h$/], ['days-in-a-row', 'Days in a row', '6 days', '5', /^5( days?)?$/], ['brief-before-takeoff', 'Brief before take-off', '2h20', '2h30', /^2h30$/]]) {
      await runBox(A, {
        id: 'B8', slug, name: `Logic ✎ Edit → ${label}`,
        ensure: edit,
        loc: A => box(label), prev: A => prevFocusable(box(label)),
        prior, typed,
        expectText1: `box holds only "${typed}"`,
        expect2: v => leaveRe.test(v),
        expectText2: `shows ${typed === '5' ? '"5" or "5 days"' : '"' + typed + '"'} after leaving`,
        persist: async A => { await A.go('editsched'); await page.waitForTimeout(500); await A.go('logic'); await page.waitForTimeout(500); const still = await page.locator('.lgin').first().isVisible().catch(() => false); if (!still) { await page.click('#lgEdit'); await page.waitForTimeout(500) } return await A.val(box(label)) },
        persistDid: 'left the Logic page (went to Edit Schedule), came back (the page was still in edit mode, else pressed ✎ Edit) and looked',
        expectTextPersist: `still ${typed === '5' ? '5 days' : typed}`,
        expectPersist: v => leaveRe.test(v),
      })
    }
  }
  if (!only || only === 'B9') {
    const lab = 'In-time words'
    await edit()
    await runBox(A, {
      id: 'B9', slug: 'intime-words', name: 'Logic ✎ Edit → "+ In-time" words setting (a words box)',
      ensure: edit,
      loc: A => box(lab), prev: A => prevFocusable(box(lab)),
      prior: 'IN TIME + WX/NOTAMS', typed: 'XY',
      expect1: (v, p) => v.length === p.length + 2 && v.replace('XY', '') === p,
      expectText1: 'NOT replaced: "XY" is added into "IN TIME + WX/NOTAMS" at the caret',
      expect2: v => v.includes('XY'),
      expectText2: 'still holds the words with XY added',
      expect4: (v, p) => v.length === p.length - 1,
      expectText4: 'NOT emptied: one character is deleted at the caret',
    })
    // put the words back
    await box(lab).fill('IN TIME + WX/NOTAMS'); await box(lab).evaluate(e => e.blur())
  }
  console.log('errors', A.errors)
  await A.close()
}

if (!only || only === 'B12') {
  const A = await launch(size, 'us')
  const { page } = A
  const facts = async (name) => page.evaluate(() => {
    const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' }
    const byId = id => document.getElementById(id)
    return { lgEdit: !!byId('lgEdit') && vis(byId('lgEdit')), lgEditExists: !!byId('lgEdit'), settingsOpen: vis(document.querySelector('[data-testid="settings-open"]')), counterAdd: !!document.querySelector('[data-testid="counter-add"]'), oilTracker: vis(document.querySelector('[data-testid="oil-tracker"]')), counts: vis(document.querySelector('[data-testid="counts-toggle"]')), lgin: [...document.querySelectorAll('input.lgin')].filter(vis).length, page: document.querySelector('.topbar a.on, .topbar a[class*=on]')?.innerText }
  })
  const nav = await page.evaluate(() => [...document.querySelectorAll('.topbar a')].map(a => a.innerText.trim() + (getComputedStyle(a).display === 'none' ? '(hidden)' : '')).join(' · '))
  console.log('member nav:', nav)
  await A.go('logic'); await page.waitForTimeout(700)
  const f1 = await facts()
  const p1 = await A.shot('B12-member-logic')
  const heads = await page.evaluate(() => (document.querySelector('#page-logic')?.innerText || '').slice(0, 160).replace(/\n/g, ' | '))
  row(A, 'B12', 'A member (us / us) on the Logic page', 'x', 'signed in as the member, opened Logic', 'no ✎ Edit button: nothing to arm', JSON.stringify(f1), (f1.lgEdit ? 'FAIL' : 'PASS'), [p1], `page text begins: ${heads}`)
  await A.go('leavewar'); await page.waitForTimeout(1200)
  const f2 = await facts()
  const p2 = await A.shot('B12-member-leavewar')
  row(A, 'B12', 'A member (us / us) on the Leave War', 'x', 'signed in as the member, opened Leave War', 'no ⚙ settings / no counter tools: nothing to arm', JSON.stringify(f2), (f2.settingsOpen || f2.counterAdd) ? 'FAIL' : 'PASS', [p2])
  console.log('errors', A.errors)
  await A.close()
}
