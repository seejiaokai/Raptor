/* [OIL-SEATS-CAN-EARN] walk — shared helpers for the roll-call and the doors. */
import { tap, shot } from './lib.mjs'

export const SENTINELS = ['allavail', 'all']

/** ARM a seat and drop ONE named person on it, by hand, through the palette.
    Reports what the app DID, not what we hoped: whether the arm took, whether
    the palette offered the puck, whether the seat holds it afterwards, and any
    message the app put on screen. A refusal and a silent no-op look identical
    from the outside, so both are recorded separately. */
export async function handPut(page, armSel, pid) {
  const before = await seatHolds(page, armSel)
  await tap(page, `[data-slot="${armSel}"], [data-fill="${armSel}"]`)
  await page.waitForTimeout(220)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  const offered = await page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).count()
  let msg = null
  if (armed && offered) {
    const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
    await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(100)
    try { await p.click({ timeout: 2500 }) }
    catch { const b = await p.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
    await page.waitForTimeout(420)
    msg = await toast(page)
  }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
  const after = await seatHolds(page, armSel)
  return { armed: !!armed, offered: !!offered, before, after, took: after.includes(pid), msg }
}

/** Who is sitting at this address right now, straight off the DOM. */
export async function seatHolds(page, key) {
  return page.evaluate(k => {
    const b = document.querySelector('#schedBoard') || document
    const host = b.querySelector(`[data-slot="${k}"]`) || b.querySelector(`[data-fill="${k}"]`)
    if (!host) return []
    return [...host.querySelectorAll('[data-person]')].map(e => e.dataset.person)
  }, key)
}

/** Anything the app said on screen.
    THE APP'S TOAST IS `#toastEl` AND CARRIES NO CLASS — a selector list built
    from ".toast / [class*=toast] / [role=alert]" misses it entirely and reports
    "nothing opened" for a tap that worked perfectly. That cost a false defect
    report against the count chip, 22 Sep 26. It is also only FADED, never
    removed, so a stale message sits in the DOM at opacity 0 for ever: read the
    opacity and treat a faded one as gone. */
export async function toast(page) {
  return page.evaluate(() => {
    const out = []
    const el = document.getElementById('toastEl')
    if (el && (el.textContent || '').trim() && getComputedStyle(el).opacity !== '0')
      out.push((el.textContent || '').trim())
    for (const e of document.querySelectorAll('.toast, .snack, [class*=toast], [role=alert], .sb-msg'))
      if (e.offsetParent !== null && (e.innerText || '').trim()) out.push((e.innerText || '').trim())
    return out.length ? out.join(' | ').slice(0, 400) : null
  })
}

/** The count chip drawn on a seat address: its text, its title, its version. */
export async function chipAt(page, key) {
  return page.evaluate(k => {
    const b = document.querySelector('#schedBoard') || document
    const host = b.querySelector(`[data-slot="${k}"]`) || b.querySelector(`[data-fill="${k}"]`)
    if (!host) return 'NO HOST'
    /* the chip is drawn as the seat's SIBLING inside the same .seat span */
    const scope = host.closest('.seat') || host
    const c = scope.querySelector('.oilcount') || host.querySelector('.oilcount')
      || (host.parentElement && host.parentElement.querySelector('.oilcount'))
    if (!c) return null
    return { txt: (c.innerText || '').trim(), title: c.getAttribute('title'), ver: c.dataset.oilver, item: c.dataset.oilsent }
  }, key)
}

/** Every count chip on the board right now — the honest way to ask "does the
    count show", because a chip may be drawn beside a seat rather than in it. */
export async function allChips(page) {
  return page.evaluate(() => [...document.querySelectorAll('#schedBoard .oilcount')]
    .filter(e => e.offsetParent !== null)
    .map(e => ({ txt: (e.innerText || '').trim(), item: e.dataset.oilsent, ver: e.dataset.oilver, title: (e.getAttribute('title') || '').slice(0, 130) })))
}

/** Every switch the OIL mode is offering, with its state and its sentence. */
export async function allSwitches(page) {
  return page.evaluate(() => [...document.querySelectorAll('#schedBoard .oilitem')]
    .filter(e => e.offsetParent !== null)
    .map(e => ({
      item: e.dataset.oilitem || null,
      txt: (e.innerText || '').trim().slice(0, 40),
      state: e.classList.contains('none') ? 'none'
        : e.classList.contains('off') ? 'off'
          : e.classList.contains('mixed') ? 'mixed' : 'on',
      title: (e.getAttribute('title') || '').slice(0, 130),
    })))
}

/** Every opened puck inside the mode — OIL8's "a crowd opens into real pucks". */
export async function allPucks(page) {
  return page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')]
    .filter(e => e.offsetParent !== null)
    .map(e => ({ who: e.dataset.oilp, item: e.dataset.oilitem, on: e.classList.contains('on'),
      cs: (window.PEOPLE[e.dataset.oilp] || {}).cs || e.dataset.oilp })))
}

export { shot }
