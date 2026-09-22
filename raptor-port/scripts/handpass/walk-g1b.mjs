/* G1 follow-up — the complete door list, taken off the DOM rather than guessed,
   outside the mode and inside it, on an UNPUBLISHED day (so Publish is live)
   and then on a published one.  Also: the ALL AVAIL count chip, the grips, the
   row buttons, and whether the plans selector / Unpublish really operate. */
import { open, board, tap, shot, publish, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

const doors = () => page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const vis = el => !!(el.offsetParent || el.getClientRects().length)
  const map = {}
  for (const el of root.querySelectorAll('button, select, input, textarea, [data-fill], [data-slot], [draggable], .grip, .rgrip, [class*=grip]')) {
    if (!vis(el)) continue
    const keys = [...el.attributes].map(a => a.name).filter(n => n.startsWith('data-')).sort().join(',')
      || el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '')
    const dead = !!el.disabled || el.getAttribute('aria-disabled') === 'true' || !!el.readOnly
    map[keys] = map[keys] || { n: 0, live: 0, eg: (el.innerText || el.value || el.getAttribute('title') || '').trim().slice(0, 34) }
    map[keys].n++; if (!dead) map[keys].live++
  }
  return map
})

const chips = () => page.evaluate(() => {
  const out = []
  for (const scope of ['#schedBoard', '#vWeek', '#eWeek']) {
    const r = document.querySelector(scope); if (!r) continue
    for (const e of r.querySelectorAll('.oilcount, [data-oilsent]')) {
      if (!(e.offsetParent || e.getClientRects().length)) continue
      out.push({ where: scope, text: (e.innerText || '').trim(), cls: e.className, title: e.getAttribute('title') || '' })
    }
  }
  return out
})

R.doorsDraftOut = await doors()
R.chipsDraftOut = await chips()
/* the mode on an UNPUBLISHED day — is Publish offered from inside it? */
await oilMode(page, true)
R.doorsDraftIn = await doors()
R.chipsDraftIn = await chips()
R.publishInMode = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard [data-beak]')
  const sign = [...document.querySelectorAll('#schedBoard select')].filter(s => s.closest('.sb-sign, .signrow, [class*=sign]'))
  return {
    beak: b ? { text: b.innerText.trim(), disabled: !!b.disabled, visible: !!(b.offsetParent) } : null,
    signSelects: sign.length, signLive: sign.filter(s => !s.disabled).length,
  }
})
await shot(page, 'G-G1-04-mode-on-draft-day')
await oilMode(page, false)

/* now publish and look again */
R.publish = await publish(page, di)
await page.waitForTimeout(500)
R.chipsPubOut = await chips()
R.doorsPubOut = await doors()
await oilMode(page, true)
R.doorsPubIn = await doors()

/* does the plans selector actually OPEN inside the mode? */
R.plans = await (async () => {
  const sel = page.locator('#schedBoard button, #schedBoard select').filter({ hasText: /Live working copy/ }).first()
  if (!await sel.count()) return { found: false }
  await sel.click({ force: true }).catch(() => {})
  await page.waitForTimeout(500)
  const open = await page.evaluate(() => {
    const m = document.querySelector('.planmenu, .draftmenu, [class*=planpop], [class*=draftpop]')
    const any = [...document.querySelectorAll('body > div, #schedBoard .menu, #schedBoard [class*=menu]')]
      .filter(e => /working copy|saved plan|new plan|draft/i.test(e.innerText || '') && (e.offsetParent))
    return { named: !!m, popups: any.map(e => (e.innerText || '').replace(/\n+/g, ' | ').slice(0, 160)).slice(0, 3) }
  })
  await page.keyboard.press('Escape')
  return { found: true, ...open }
})()
await shot(page, 'G-G1-05-plans-in-mode')

/* the Unpublish button inside the mode — is it live? (do NOT press it) */
R.unpublish = await page.evaluate(() => {
  const b = [...document.querySelectorAll('#schedBoard button')].filter(e => /^Unpublish/.test((e.innerText || '').trim()))[0]
  if (!b) return null
  return { text: b.innerText.trim(), disabled: !!b.disabled, visible: !!b.offsetParent, title: b.getAttribute('title') || '' }
})

/* the SC wave's switches — is the SPARE line offering one? */
R.scSwitches = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  return [...root.querySelectorAll('.oilitem')].map(e => {
    const row = e.closest('.sb-line, .sb-arow, tr, .sb-row')
    const people = row ? [...row.querySelectorAll('.oilpk')].map(p => ({
      who: (p.querySelector('[data-person]') || {}).dataset?.person || '',
      kind: p.classList.contains('inert') ? 'INERT' : p.classList.contains('on') ? 'ON' : 'OFF',
    })) : []
    return { name: (e.innerText || '').trim() || '(blank)', item: e.getAttribute('data-oilitem') || 'DEAD', people }
  }).filter(r => /^SC|AV/.test(r.name) || r.people.some(p => p.kind === 'INERT'))
})

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g1b.json', JSON.stringify(R, null, 1))
const pr = (m, n) => { console.log('=== ' + n + ' ==='); Object.entries(m).sort().forEach(([k, v]) => console.log(`  ${k.padEnd(46)} n=${String(v.n).padStart(3)} live=${String(v.live).padStart(3)}  ${v.eg.replace(/\n/g, ' ')}`)) }
pr(R.doorsDraftOut, 'DRAFT, outside the mode')
pr(R.doorsDraftIn, 'DRAFT, INSIDE the mode')
console.log('publish offered inside the mode (draft day):', JSON.stringify(R.publishInMode))
pr(R.doorsPubIn, 'PUBLISHED, INSIDE the mode')
console.log('chips draft-out:', JSON.stringify(R.chipsDraftOut))
console.log('chips draft-in:', JSON.stringify(R.chipsDraftIn))
console.log('chips pub-out:', JSON.stringify(R.chipsPubOut))
console.log('plans selector in mode:', JSON.stringify(R.plans))
console.log('Unpublish in mode:', JSON.stringify(R.unpublish))
console.log('SC / inert rows:'); R.scSwitches.forEach(r => console.log('  ' + r.name.padEnd(12) + (r.item === 'DEAD' ? 'no switch' : 'SWITCH ' + r.item).padEnd(26) + JSON.stringify(r.people)))
console.log('errors:', R.errors)
await browser.close()
