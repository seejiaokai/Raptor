// RW1-5 — the Inputs List: no "Export to Excel", no gap, every other tool works. desktop + phone, Saber + Ranger.
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { shotP, log, sleep, errs as errsD } from './or-RW1-lib.mjs'
import { openPhone, errs as errsP, press } from './or-RW1-plib.mjs'
import { launch, openWorld } from './or-RW1-lib.mjs'
const browser = await launch()
const WHO = process.argv[2] || 'ad'
const KIND = process.argv[3] || 'desk'
const pass = WHO === 'ad' ? 'a' : 'us'
const tag = `${KIND}-${WHO === 'ad' ? 'saber' : 'ranger'}`
const tap = async (loc) => KIND === 'phone' ? loc.tap() : loc.click()
let p
if (KIND === 'phone') ({ page: p } = await openPhone(browser, { who: WHO, pass }))
else ({ page: p } = await openWorld(browser, { who: WHO, pass }))
await p.evaluate(() => window.go('inputs'))
await p.waitForTimeout(700)
if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await tap(p.locator('#inListBtn')); await p.waitForTimeout(500) }
const W = KIND === 'phone' ? 390 : 1440
const inv = async (label) => {
  const items = await p.evaluate(() => {
    const out = []
    for (const b of document.querySelectorAll('#page-inputs button, #page-inputs select, #page-inputs input, #page-inputs [role=button]')) {
      if (!b.offsetParent) continue
      const r = b.getBoundingClientRect()
      if (r.top > 330 || r.top < 0) continue
      out.push({ id: b.id, text: (b.innerText || b.value || b.getAttribute('aria-label') || b.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 28), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right) })
    }
    return out
  })
  log(label, 'tools:', items.map(t => `${t.id || '(' + t.text + ')'}@${t.x},${t.y} ${t.w}x${t.h}`).join(' | '))
  log(label, 'out of screen:', items.filter(t => t.right > W || t.x < 0).map(t => t.id || t.text))
  log(label, 'export anywhere?', await p.evaluate(() => [...document.querySelectorAll('#page-inputs *, body *')].filter(e => e.offsetParent && /export/i.test((e.innerText || '') + (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')) && e.children.length === 0).map(e => e.tagName + '#' + e.id + ':' + (e.innerText || '').trim().slice(0, 30))))
  return items
}
const rows = () => p.evaluate(() => { const r = [...document.querySelectorAll('#page-inputs [data-iid], #page-inputs .icard')].filter(e => e.offsetParent); return new Set(r.map(e => e.getAttribute('data-iid') || e.innerText.slice(0, 30))).size })
await inv('start')
await shotP(p, `rw1-5-${tag}-1-tools`, { x: 0, y: 0, width: W, height: KIND === 'phone' ? 420 : 330 })
await shotP(p, `rw1-5-${tag}-1b-full`)
log('rows at start', await rows())
/* dates button */
if (await p.locator('#inRangeBtn').count()) {
  log('range button text', await p.locator('#inRangeBtn').innerText())
  await tap(p.locator('#inRangeBtn')); await p.waitForTimeout(500)
  log('after tap dates: All dates visible', await p.locator('#inRangeAll').count())
  await shotP(p, `rw1-5-${tag}-2-dates-open`)
  if (await p.locator('#inRangeAll').count()) { await tap(p.locator('#inRangeAll')); await p.waitForTimeout(500) }
  log('range button after All', await p.locator('#inRangeBtn').innerText(), 'rows', await rows())
  await shotP(p, `rw1-5-${tag}-3-all-dates`)
} else log('NO range button')
/* filters */
const filt = p.locator('#inFType'), pers = p.locator('#inFPerson'), srch = p.locator('#inFSearch')
log('filter fields visible', { type: await filt.isVisible().catch(() => false), person: await pers.isVisible().catch(() => false), search: await srch.isVisible().catch(() => false) })
if (KIND === 'phone') {
  const fb = p.locator('#inFiltersBtn').first()
  log('phone filter button', await fb.count(), await fb.getAttribute('id').catch(() => null))
  if (await fb.count()) { await tap(fb); await p.waitForTimeout(500); await shotP(p, `rw1-5-${tag}-4-filters-open`) }
  log('filter fields visible after', { type: await filt.isVisible().catch(() => false), person: await pers.isVisible().catch(() => false), search: await srch.isVisible().catch(() => false) })
}
const r0 = await rows()
if (await filt.isVisible().catch(() => false)) {
  const opts = await filt.locator('option').allTextContents()
  const pick = opts.find(o => /^OIL/.test(o.trim())) || opts[1]
  await filt.selectOption({ label: pick }); await p.waitForTimeout(500)
  log('type filter', pick, 'rows', r0, '->', await rows())
  await shotP(p, `rw1-5-${tag}-5-type-filter`)
  await filt.selectOption({ index: 0 }); await p.waitForTimeout(400)
  log('type filter cleared rows', await rows())
}
if (await pers.isVisible().catch(() => false)) {
  const opts = await pers.locator('option').allTextContents()
  const pick = opts.find(o => /Quill/.test(o)) || opts[3]
  await pers.selectOption({ label: pick }); await p.waitForTimeout(500)
  log('person filter', pick, 'rows', r0, '->', await rows())
  await shotP(p, `rw1-5-${tag}-6-person-filter`)
  await pers.selectOption({ index: 0 }); await p.waitForTimeout(400)
  log('person filter cleared rows', await rows())
}
if (await srch.isVisible().catch(() => false)) {
  await srch.fill('Quill'); await p.waitForTimeout(500)
  log('search Quill rows', await rows())
  await shotP(p, `rw1-5-${tag}-7-search`)
  await srch.fill(''); await p.waitForTimeout(400)
  log('search cleared rows', await rows())
}
/* + Input */
const nw = p.locator('#inNew')
log('+ Input present', await nw.count())
if (await nw.count()) {
  await tap(nw); await p.waitForTimeout(600)
  log('window opened', await p.locator('[data-testid="win-inputedit"]').count())
  await shotP(p, `rw1-5-${tag}-8-new-input`)
  if (await p.locator('#inpEditCancel').count()) { await tap(p.locator('#inpEditCancel')); await p.waitForTimeout(400) }
}
/* gear */
const gear = p.locator('#inGear')
if (await gear.count() && await gear.isVisible()) {
  await tap(gear); await p.waitForTimeout(500)
  log('gear opened; text', (await p.evaluate(() => { const g = document.querySelector('[data-testid*="gear"], #inGearPop, .ig-pop'); return g ? g.innerText.replace(/\s+/g, ' ').slice(0, 160) : '(no gear popover found)' })))
  await shotP(p, `rw1-5-${tag}-9-gear`)
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
}
await inv('end')
log('errs', [...errsD, ...errsP])
await browser.close()
