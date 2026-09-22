/* [OIL-SEATS-CAN-EARN] walk — SURFACES 5: ROLES.
   A squadron member signs in. The roll-call says the count is a READ he is
   allowed, and the earn switch is the admin's — enforced at the PAGE and at the
   WRITE PATH, never at the nav. So: log in as the member, look at View-only
   Sched, tap the chip, and then try to work the switch from the page anyway. */
import { open, go, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE, who: 'u' })
const who = await page.evaluate(() => ({
  user: (document.querySelector('#luser') ? 'still on login' : 'signed in'),
  name: (document.querySelector('#whoami,#userChip,.who') || {}).innerText || '',
  admin: typeof window.canEditSched === 'function' ? window.canEditSched() : 'not exposed',
  page: window.CURPAGE,
  tabs: [...document.querySelectorAll('.nav a,.nav button,[data-page]')].map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 12),
}))
console.log('signed in as the member:', JSON.stringify(who))

await go(page, 'viewsched'); await page.waitForTimeout(1000)
const seen = await page.evaluate(d => {
  const day = document.querySelector(`#vWeek .day[data-day="${d}"]`)
  if (!day) return { err: 'no day column on the view week' }
  return {
    chips: [...day.querySelectorAll('.oilcount')].map(e => ({ txt: (e.innerText || '').trim(),
      item: e.dataset.oilsent, ver: e.dataset.oilver, title: (e.getAttribute('title') || '').slice(0, 130) })),
    bars: [...day.querySelectorAll('[class*=oilbar]')].length,
    placeholders: [...day.querySelectorAll('[data-person="allavail"],[data-person="all"]')].length,
    /* the admin's doors, on the page a member is looking at */
    oilButtons: [...document.querySelectorAll('#sbOil,[data-oilmode],[data-oilitem],[data-oilp]')].length,
    editable: [...day.querySelectorAll('[data-slot],[data-fill],[contenteditable="true"]')].length,
    roster: !!document.querySelector('#eRoster'),
  }
}, di)
console.log('\n===== VIEW-ONLY SCHED, AS THE MEMBER =====')
console.log(JSON.stringify(seen, null, 1))
await shot(page, 'SURF-07-member-viewweek')

/* the READ he is allowed — tap the chip */
if (seen.chips && seen.chips.length) {
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
  const c = page.locator(`#vWeek .day[data-day="${di}"] .oilcount`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  try { await c.click({ timeout: 3000 }) } catch { const b = await c.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await page.waitForTimeout(600)
  const said = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { txt: (t.textContent || '').trim().slice(0, 300), op: t.style.opacity } : 'none' })
  console.log('\n the member taps the count chip ->', JSON.stringify(said))
  await shot(page, 'SURF-08-member-chip-tap')
}

/* the door he must NOT have — can he reach Edit Schedule at all? */
console.log('\n===== THE ADMIN\'S DOORS, TRIED BY THE MEMBER =====')
await go(page, 'editsched'); await page.waitForTimeout(900)
const edit = await page.evaluate(() => ({
  page: window.CURPAGE,
  denied: !!document.querySelector('#edDeny,#admDeny,.deny'),
  denyText: ((document.querySelector('#edDeny,#admDeny,.deny') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 200),
  weekDrawn: !!document.querySelector('#eWeek .day'),
  oilBtn: !!document.querySelector('#sbOil'),
}))
console.log(' Edit Schedule as the member:', JSON.stringify(edit))
await shot(page, 'SURF-09-member-editsched')

/* THE WRITE PATH, not the nav: ask the app itself to flip an earn switch */
const write = await page.evaluate(d => {
  const out = {}
  const call = (nm, fn) => { try { out[nm] = fn() } catch (e) { out[nm] = 'REFUSED: ' + String(e.message || e).slice(0, 120) } }
  out.canEditSched = typeof window.canEditSched === 'function' ? window.canEditSched() : 'n/a'
  out.editMode = window.HOOKS && typeof window.HOOKS.editMode === 'function' ? window.HOOKS.editMode() : 'n/a'
  const before = JSON.stringify((window.DAYS[d] || {}).oil || null)
  call('toggleOilItem', () => typeof window.toggleOilItem === 'function' ? window.toggleOilItem(d, 'r:rmubcmaxl24wz91') : 'not exposed')
  out.dayOilBefore = before
  out.dayOilAfter = JSON.stringify((window.DAYS[d] || {}).oil || null)
  return out
}, di)
console.log(' the write path, asked directly:', JSON.stringify(write, null, 1))
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
