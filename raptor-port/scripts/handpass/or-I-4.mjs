// I11 (the app's own act: Admin -> Users delete). One world.
import * as L from './or-I-lib.mjs'
const { page, browser } = await L.start({ clock: '2026-06-22T09:00:00' })
const ID = {}
for (const cs of ['Ranger', 'Saber', 'Tally', 'Hex']) ID[cs] = await L.csId(page, cs)
const results = {}
let cur = 'Saber'
const as = async (cs) => { await page.evaluate(([id, role]) => { window.raptorRole(role); window.raptorMe(id) }, [ID[cs], cs === 'Saber' ? 'admin' : 'member']); await page.waitForTimeout(400); cur = cs }
async function read(cs, label) {
  const back = cur
  if (cur !== cs) await as(cs)
  const st = await L.bellState(page)
  const f = await L.openList(page)
  const lines = L.lineTexts(f)
  L.say(`   [${label}] ${cs}'s bell lit=${st.lit}; ${lines.length} line(s)`); lines.forEach(l => L.say('      ' + l))
  results[label + ' / ' + cs] = { lit: st.lit, lines }
  if (cs === 'Ranger' || cs === 'Tally') await L.shotList(page, `I11-${label.replace(/\W+/g, '-')}-${cs}`)
  await L.closeList(page)
  if (back !== cs) await as(back)
  return lines
}
const f = await L.fileIt(page, { title: 'Trio training', kind: 'Training', pick: ['Ranger', 'Tally', 'Hex'], from: '09:00', to: '10:00', oil: 'close' })
L.say('filed:', JSON.stringify(await L.rec(page, f.iid)))
for (const cs of ['Ranger', 'Tally', 'Hex']) await read(cs, 'I11 before the delete')
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(600)
await L.shot(page, 'I11-admin')
L.say('admin page buttons:', await page.evaluate(() => [...document.querySelectorAll('#page-admin button, .page.on button')].filter(b => b.offsetParent).map(b => (b.id || '') + ':' + (b.getAttribute('data-testid') || '') + ':' + b.textContent.trim().slice(0, 24)).slice(0, 60).join(' | ')))
await page.locator('button', { hasText: /^Hex/ }).first().click(); await page.waitForTimeout(600)
await L.shot(page, 'I11-hex-open')
L.say('after clicking Hex:', await page.evaluate(() => [...document.querySelectorAll('button, [role=dialog] *')].filter(b => b.tagName === 'BUTTON' && b.offsetParent).map(b => (b.id || '') + ':' + (b.getAttribute('data-testid') || '') + ':' + b.textContent.trim().slice(0, 30)).filter(x => /delete|archive|post|remove|restore|save|cancel|close/i.test(x)).join(' | ')))
await page.locator('#accEdDel').click(); await page.waitForTimeout(600)
await L.shot(page, 'I11-delete-confirm')
const btns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /delete|confirm|yes|remove|cancel/i.test(b.textContent)).map(b => (b.id || '') + ':' + (b.getAttribute('data-testid') || '') + ':' + b.textContent.trim().slice(0, 30)))
L.say('after Delete pressed:', btns.join(' | '), '| dialog text:', (await page.evaluate(() => (document.querySelector('[role=dialog], .modal, .confirm, #accConfirm') || {}).innerText || '')).replace(/s+/g, ' ').slice(0, 400))
await page.locator('#accEdDel').click(); await page.waitForTimeout(900)
await L.shot(page, 'I11-after-delete')
L.say('note:', await L.note(page))
L.say('Hex on the crew list?', JSON.stringify(await page.evaluate(id => { const p = window.PEOPLE[id]; return p ? { cs: p.cs, del: p.deleted || p.del || null, arch: p.arch || p.archived || null } : 'gone' }, ID.Hex)))
L.say('INPUTS:', JSON.stringify(await L.rec(page, f.iid)))
for (const cs of ['Ranger', 'Tally', 'Saber']) await read(cs, 'I11 after Hex was deleted')
L.record('I11', results)
console.log(L.errs)
await browser.close()
