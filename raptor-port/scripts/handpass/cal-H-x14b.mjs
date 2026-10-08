/* X-14 (Medical actions) — the Medical tab's write doors by role: Saber (admin), Ranger (a member who is not the subject),
   Grit (the man a medical entry belongs to, a member). Authority changed in place (raptorMe + raptorRole + lwSetRole). */
import * as H from './cal-H-lib.mjs'
H.setTag('x14b')
const { browser, page, errors } = await H.world({})
const SABER = await H.pidOf(page, 'Saber'), RANGER = await H.pidOf(page, 'Ranger'), GRIT = await H.pidOf(page, 'Grit')
const swapFull = async (pid, role) => { await page.evaluate(([p, r]) => { window.raptorMe(p); window.raptorRole(r); window.lwSetRole(r) }, [pid, role]); await H.sleep(700) }
async function medDoors(label) {
  await H.go(page, 'inputs'); await H.sleep(400)
  await page.locator('#inMedBtn').click(); await H.sleep(800)
  const o = await page.evaluate(() => {
    const m = document.querySelector('.medview, [data-testid="medview"], #medView') || document.body
    const btns = [...m.querySelectorAll('button, a, input[type=file], [role=button]')].filter(b => b.offsetParent).map(b => (b.id || b.dataset.testid || '') + '|' + ((b.innerText || b.title || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30))).filter(t => t.length > 1)
    const cards = [...m.querySelectorAll('[data-medcard], .medcard, .mcard')].length
    return { btns: btns.slice(0, 40), cards, text: m.innerText.replace(/\s+/g, ' ').slice(0, 300) }
  })
  o.pic = await H.pic(page, label)
  return o
}
const dA = await medDoors('admin-saber')
await swapFull(RANGER, 'member'); const dR = await medDoors('member-ranger')
await swapFull(GRIT, 'member'); const dG = await medDoors('member-grit-subject')
await swapFull(SABER, 'admin')
const writeish = d => d.btns.filter(t => /Upload|Add|Edit|Revise|Delete|Remove|OIL|Trim|Upchit|Save|✎|✕|clip|Attach|Release|Fit/i.test(t))
console.log('ADMIN', JSON.stringify(writeish(dA)))
console.log('RANGER', JSON.stringify(writeish(dR)))
console.log('GRIT', JSON.stringify(writeish(dG)))
console.log('A text', dA.text); console.log('R text', dR.text)
H.row('X-14 (Medical)', 'read the Medical tab\'s buttons as Saber (admin), Ranger (member, not the subject) and Grit (member, the subject of the demo medical entry)', JSON.stringify({ admin: writeish(dA), ranger: writeish(dR), grit: writeish(dG) }), 'RECORDED', [dA.pic, dR.pic, dG.pic])
H.save('x14b', { errors })
console.log(errors)
await browser.close()
