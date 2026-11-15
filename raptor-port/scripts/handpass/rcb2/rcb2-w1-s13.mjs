/* rcb2-w1 S13 — the Logic page: one setting changed, two, Reset (once with the box still focused), search "planned", the filters,
   then as Ranger. usage: node scripts/handpass/rcb2/rcb2-w1-s13.mjs [desktop|phone] */
const KIND = process.argv[2] || 'desktop'
process.env.RCB2_RUN = 's13-' + KIND + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep } = X
const P = KIND === 'phone' ? 'p' : 'd'
const w = await X.world(KIND, 'a')
const page = w.page
const OLD = /(leave|downchit) \+ flying/i
const NOTE = 'A published day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a changed OIL setting would change that OIL, the day reads pending.'
const tap = async (sel, o = {}) => X.press(w, sel, { scope: 'page', ...o })
const strip = () => page.evaluate(() => {
  const e = document.querySelector('#lgOff'); if (!e) return null
  const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
  return { shown: r.width > 0 && !e.hidden, text: (e.innerText || '').replace(/\s+/g, ' ').replace(/ /g, ' ').trim(), w: Math.round(r.width), h: Math.round(r.height), sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, ov: cs.overflow, vw: innerWidth, right: Math.round(r.right) }
})
const bar = () => page.evaluate(() => [...document.querySelectorAll('.lgbar > *, .lgbar .lgfilt > *')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return [e.id || e.className.toString().slice(0, 14), Math.round(r.top), Math.round(r.height), Math.round(r.left), Math.round(r.right)] }))
const setBox = async (key, val) => { const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first(); await inp.scrollIntoViewIfNeeded(); await inp.fill(String(val)); await inp.press('Tab'); await sleep(500) }

await L.go(page, 'logic'); await sleep(500)
const keys = await page.evaluate(() => [...document.querySelectorAll('#lgBody input[data-lgset]')].map(e => e.dataset.lgset + '=' + e.value))
say('settings boxes (before Edit):', JSON.stringify(keys))
let s0 = await strip()
check('S13.0 standard settings: the strip is hidden', s0 && !s0.shown, JSON.stringify(s0))
await X.pic(w, `s13-0-standard-${P}`)
await tap('#lgEdit', { after: `s13-0b-edit-tap-${P}` })
const boxes = await page.evaluate(() => [...document.querySelectorAll('#lgBody input[data-lgset]')].filter(e => e.getBoundingClientRect().width > 0).map(e => [e.dataset.lgset, e.value, (e.closest('.lgset') || {}).dataset ? e.closest('.lgset').dataset.lgname : '']))
say('editable boxes:', JSON.stringify(boxes))
const keys2 = await page.evaluate(() => [...document.querySelectorAll('#lgBody input[data-lgset]')].map(e => e.dataset.lgset + '=' + e.value))
const second = boxes.find(b => b[0] !== 'briefLead' && /^\d+h?\d*m?$/.test(b[1]))
say('second setting chosen:', JSON.stringify(second))

/* one setting */
await setBox('briefLead', '3h20')
let s1 = await strip()
say('ONE setting strip:', JSON.stringify(s1))
await X.pic(w, `s13-1-one-setting-${P}`)
await X.crop(w, '#lgOff', `s13-1b-strip-one-${P}`)
check('S13.1 one setting: "1 setting changed… checked against it now" + the note, word for word', s1 && s1.shown && /^1 setting changed from the squadron standard\. The schedule is checked against it now\./.test(s1.text) && s1.text.includes(NOTE) && !/Only an admin/.test(s1.text), s1 ? s1.text : 'no strip')
check('S13.1b the strip reads whole (nothing cut: no overflow, inside the screen)', s1 && s1.sh <= s1.ch + 1 && s1.sw <= s1.cw + 1 && s1.right <= s1.vw, s1 ? `w ${s1.w} h ${s1.h} scroll ${s1.sw}x${s1.sh} client ${s1.cw}x${s1.ch} right ${s1.right} of ${s1.vw}` : '')

/* two settings */
if (second) await setBox(second[0], '11h')
const s2 = await strip()
say('TWO settings strip:', JSON.stringify(s2), ' second box now', await page.evaluate(k => (document.querySelector(`#lgBody input[data-lgset="${k}"]`) || {}).value, second && second[0]))
await X.pic(w, `s13-2-two-settings-${P}`)
await X.crop(w, '#lgOff', `s13-2b-strip-two-${P}`)
check('S13.2 two settings: "2 settings changed … checked against them now" + the note', s2 && s2.shown && /^2 settings changed from the squadron standard\. The schedule is checked against them now\./.test(s2.text) && s2.text.includes(NOTE), s2 ? s2.text : 'no strip')
check('S13.2b two settings: reads whole', s2 && s2.sh <= s2.ch + 1 && s2.sw <= s2.cw + 1 && s2.right <= s2.vw, s2 ? `scroll ${s2.sw}x${s2.sh} client ${s2.cw}x${s2.ch}` : '')
const b2 = await bar()
say('top row boxes [id, top, height, left, right]:', JSON.stringify(b2))
const hs = b2.filter(r => /lgsearch|searchbox|lgFilterBtn|lgDone|lgReset|lgEdit/i.test(r[0]) || true).map(r => r[2])
check('S13.2c the page\'s top row: side-by-side boxes one height (lesson 23b) — RECORDED heights', 'RECORDED', JSON.stringify(b2))

/* Reset once with the last edited box still focused */
const lastKey = second ? second[0] : 'briefLead'
const box = page.locator(`#lgBody input[data-lgset="${lastKey}"]`).first()
await box.scrollIntoViewIfNeeded(); await box.focus(); await box.fill(String(await box.inputValue())); await sleep(200)
say('focused box before Reset:', await page.evaluate(() => document.activeElement && (document.activeElement.dataset.lgset || document.activeElement.id)))
await page.evaluate(() => window.scrollTo(0, 0))
await tap('#lgReset', { after: `s13-3-reset-tap-focused-${P}` })
await sleep(500)
const s3 = await strip()
const vals = await page.evaluate(() => [...document.querySelectorAll('#lgBody input[data-lgset]')].map(e => e.dataset.lgset + '=' + e.value))
say('after Reset (box was focused): strip', JSON.stringify(s3), 'values', JSON.stringify(vals), 'toasts', JSON.stringify(await X.takeToasts(page)))
await X.pic(w, `s13-3-after-reset-${P}`)
check('S13.3 Reset to standard (box still focused): the strip goes, values back to standard', s3 && !s3.shown && vals.join() === keys2.join(), `strip shown ${s3 && s3.shown}; values equal the standard list: ${vals.join() === keys2.join()}`)
const resetVisible = await page.locator('#lgReset:visible').count()
check('S13.3b Reset button gone once nothing is changed', resetVisible === 0, 'visible ' + resetVisible)
/* shown again */
await setBox('briefLead', '3h20')
const s4 = await strip()
await X.pic(w, `s13-4-shown-again-${P}`)
check('S13.4 changing a setting again shows the strip again', s4 && s4.shown && /^1 setting changed/.test(s4.text), s4 && s4.text.slice(0, 60))
await tap('#lgDone')
/* Reset once more with focus elsewhere */
await tap('#lgReset')
const s5 = await strip()
check('S13.5 Reset to standard (no box focused): strip gone', s5 && !s5.shown, JSON.stringify(s5 && s5.shown))
const redo = await page.evaluate(() => { const b = document.querySelector('#lgReset'); return b ? b.getBoundingClientRect().width : -1 })
say('Reset button after reset width', redo)
await X.pic(w, `s13-5-after-second-reset-${P}`)

/* search and filters */
await page.fill('#lgSearch', 'planned'); await sleep(500)
const names = () => page.evaluate(() => [...document.querySelectorAll('#lgBody .lgnm')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()))
let nm = await names()
await X.pic(w, `s13-6-search-planned-${P}`)
check('S13.6 search "planned" finds both renamed checks, none named "flying"', nm.some(t => /On leave \+ planned/.test(t)) && nm.some(t => /Downchit \+ planned/.test(t)) && !nm.some(t => OLD.test(t)), JSON.stringify(nm))
await page.fill('#lgSearch', 'On leave + fl'); await sleep(400)
nm = await names()
check('S13.6b search for the old name finds neither renamed check', !nm.some(t => /On leave \+ planned/.test(t)), JSON.stringify(nm))
await page.fill('#lgSearch', ''); await sleep(300)
for (const [f, label] of [['hard', 'Warnings'], ['fired', 'Fired this week'], ['adv', 'Advisories'], ['all', 'All']]) {
  await tap('#lgFilterBtn')
  await tap(`[data-lgf="${f}"]`)
  await sleep(400)
  const n = await names()
  const btn = nrm(await page.locator('#lgFilterBtn').first().innerText())
  say(`filter ${f}: button "${btn}"; check names drawn (${n.length}):`, JSON.stringify(n.filter(t => /planned|leave|Downchit/i.test(t))))
  await X.pic(w, `s13-7-filter-${f}-${P}`)
  if (f === 'hard') check('S13.7a severity filter "Warnings": both renamed checks listed (they are warnings), "planned" names', n.some(t => /On leave \+ planned/.test(t)) && n.some(t => /Downchit \+ planned/.test(t)), JSON.stringify(n.slice(0, 6)))
  if (f === 'adv') check('S13.7b severity filter "Advisories": neither renamed check listed', !n.some(t => /On leave \+ planned/.test(t)), JSON.stringify(n.slice(0, 6)))
  if (f === 'fired') check('S13.7c "Fired this week" filter: RECORDED which renamed checks fired (demo week)', 'RECORDED', `button "${btn}" names ${JSON.stringify(n.filter(t => /planned/.test(t)))} (${n.length} checks)`)
  if (f === 'all') check('S13.7d filter back to All clears it', /^(Filter|All)$/.test(btn) && n.length > 4, `button "${btn}", ${n.length} names`)
}

/* as Ranger, with settings changed */
await tap('#lgEdit'); await setBox('briefLead', '3h20'); await setBox(second ? second[0] : 'briefLead', second ? ('11h') : '3h30'); await tap('#lgDone')
await X.relogin(w, 'us')
await L.go(page, 'logic'); await sleep(600)
const sm = await strip()
say('AS RANGER strip:', JSON.stringify(sm))
await X.pic(w, `s13-8-member-${P}`)
await X.crop(w, '#lgOff', `s13-8b-member-strip-${P}`)
const edit = await page.evaluate(() => ({ editBtn: [...document.querySelectorAll('#lgEdit,#lgDone,#lgReset')].filter(e => e.getBoundingClientRect().width > 0).length, boxes: [...document.querySelectorAll('#lgBody input[data-lgset]')].filter(e => e.getBoundingClientRect().width > 0).length }))
check('S13.8 as Ranger: the note reads, followed by "Only an admin can change them."; no edit controls', sm && sm.shown && sm.text.includes(NOTE) && /Only an admin can change them\.$/.test(sm.text) && edit.editBtn === 0 && edit.boxes === 0, `${sm && sm.text.slice(-90)} | controls ${JSON.stringify(edit)}`)
check('S13.8b member: strip reads whole', sm && sm.sh <= sm.ch + 1 && sm.right <= sm.vw, sm ? `scroll ${sm.sw}x${sm.sh} client ${sm.cw}x${sm.ch}` : '')
await X.relogin(w, 'a')
await L.go(page, 'logic'); await sleep(400)
await tap('#lgReset').catch(() => {})
say('errors', JSON.stringify(w.errors))
check('S13 no console/page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
X.W.summary()
