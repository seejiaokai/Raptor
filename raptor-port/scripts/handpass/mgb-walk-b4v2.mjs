// Walker B, script 4: S14 (member on Quals), S15 (admin tick / untick, sign-off lists), S16 (admin in member view), S17 (member with no tick).
import * as L from './mgb-walk-b-lib.mjs'
console.log('mgb-walk-b4 v2')
const only = process.env.ONLY || ''
const cell = (page, col, who = 'bane') => page.locator(`#qtbl td[data-q="${who}|${col}"]`)
const readCell = (page, col, who = 'bane') => page.evaluate(([col, who]) => { const td = document.querySelector(`#qtbl td[data-q="${who}|${col}"]`); return td ? { text: td.textContent.trim(), cls: td.className, title: td.title } : null }, [col, who])
const toast = (page) => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent.replace(/\s+/g, ' ').trim() : null })
const edit = async (page, want) => { const eb = page.locator('#qEdit'), db = page.locator('#qSave'); if (want) { if (await eb.isVisible()) { await eb.click(); await page.waitForTimeout(400) } } else if (await db.isVisible()) { await db.click(); await page.waitForTimeout(400) } }
/* the sign-off lists on the day heads: every select on the page with its label, and whether Ranger is an option */
const lists = (page) => page.evaluate(() => {
  const out = []
  document.querySelectorAll('select').forEach(s => {
    const holder = s.closest('label, .field, div') || s.parentElement
    const label = (holder ? holder.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 30)
    const opts = [...s.options].map(o => o.textContent.trim())
    if (/SKED|PLANNED|APPROVED/i.test(label + ' ' + (s.id || '') + ' ' + (s.className || '')) || opts.includes('Saber'))
      out.push({ id: s.id, cls: s.className.slice(0, 30), label, n: opts.length, ranger: opts.includes('Ranger'), saber: opts.includes('Saber'), vis: s.getBoundingClientRect().width > 0 })
  })
  return out
})

async function s14(kind, w, h) {
  const sfx = kind === 'phone' ? 'phone' : 'desk'
  const id = `S14-${sfx}`
  const { page, tap, ctx } = await L.openAt(kind, w, h)
  const press = (loc) => (tap ? loc.tap() : loc.click())
  try {
    await L.signIn(page, 'us', 'us')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }).catch(() => {})
    await L.go(page, 'quals')
    await edit(page, true)
    L.check(`${id}-edit`, 'Edit mode on (button reads Done)', await page.locator('#qSave').isVisible(), 'Done visible: ' + await page.locator('#qSave').isVisible())
    const nvg0 = (await readCell(page, 'nvg')).text
    await press(cell(page, 'nvg')); await page.waitForTimeout(400)
    const nvg1 = (await readCell(page, 'nvg')).text
    await press(cell(page, 'nvg')); await page.waitForTimeout(400)
    const nvg2 = (await readCell(page, 'nvg')).text
    L.check(`${id}-nvg`, 'NVG ticks off and on', nvg0 === '✓' && nvg1 === '' && nvg2 === '✓', { before: nvg0, afterFirst: nvg1, afterSecond: nvg2 })
    /* leave it UNTICKED so a reload can prove it saved, then tick again at the end */
    await press(cell(page, 'nvg')); await page.waitForTimeout(300)
    // CAT and initials: the boxes in Ranger's row
    const row = page.locator('#qtbl tr', { has: page.locator('td[data-q="bane|nvg"]') })
    const fields = await row.evaluate(r => [...r.querySelectorAll('input, select')].map((e, i) => ({ i, tag: e.tagName, type: e.type, id: e.id, val: e.value, cls: e.className.slice(0, 30) })))
    L.note(id, 'fields in his row: ' + JSON.stringify(fields))
    const catSel = row.locator('select').first()
    const ini = row.locator('input[type=text], input:not([type])').first()
    let catBefore = null, catAfter = null, iniBefore = null, iniAfter = null
    if (await catSel.count()) {
      catBefore = await catSel.inputValue()
      const opts = await catSel.evaluate(s => [...s.options].map(o => o.value))
      const other = opts.find(o => o !== catBefore && o)
      if (other) { await catSel.selectOption(other); await page.waitForTimeout(400); catAfter = await catSel.inputValue() }
    }
    if (await ini.count()) {
      iniBefore = await ini.inputValue()
      await ini.fill('RQ'); await ini.press('Enter'); await page.waitForTimeout(400); iniAfter = await ini.inputValue()
    }
    L.check(`${id}-cat`, 'CAT changed and kept on screen', catAfter !== null && catAfter !== catBefore, { catBefore, catAfter })
    L.check(`${id}-ini`, 'initials changed and kept on screen', iniAfter === 'RQ', { iniBefore, iniAfter })
    // Scheduler cell: press, a picture right after
    const s0 = await readCell(page, 'sched')
    const m0 = await readCell(page, 'mgmt')
    await press(cell(page, 'sched'))
    if (tap) await L.shot(page, `${id}-sched-tap`)
    const t1 = await toast(page)
    await page.waitForTimeout(350)
    const t1b = await toast(page)
    const s1 = await readCell(page, 'sched')
    await L.shot(page, `${id}-sched-after`)
    L.check(`${id}-sched`, 'Scheduler refused with "Only an admin can appoint a scheduler"; tick and purple look kept', /only an admin can appoint a scheduler/i.test((t1 || '') + (t1b || '')) && s1.text === '✓' && /apt-on/.test(s1.cls), { toast: t1 || t1b, before: s0, after: s1 })
    await press(cell(page, 'mgmt'))
    if (tap) await L.shot(page, `${id}-mgmt-tap`)
    await page.waitForTimeout(350)
    const t2 = await toast(page)
    const m1 = await readCell(page, 'mgmt')
    await L.shot(page, `${id}-mgmt-after`)
    L.check(`${id}-mgmt`, 'Management refused, cell unchanged', m1.text === m0.text && !!t2, { toast: t2, before: m0, after: m1 })
    if (!tap) {
      const title = (await readCell(page, 'sched')).title
      L.check(`${id}-hover`, 'hover title on the Scheduler cell', /only an admin can appoint a scheduler/i.test(title), title)
      await cell(page, 'sched').hover(); await page.waitForTimeout(900)
      await L.shot(page, `${id}-sched-hover`, { x: 0, y: 0, width: 1536, height: 500 })
    }
    await edit(page, false)
    await L.shot(page, `${id}-done`)
    // reload and sign in again: what was saved
    await page.reload(); await page.waitForSelector('#luser')
    await L.signIn(page, 'us', 'us')
    await L.go(page, 'quals')
    const after = { nvg: (await readCell(page, 'nvg')).text, sched: await readCell(page, 'sched') }
    const row2 = page.locator('#qtbl tr', { has: page.locator('td[data-q="bane|nvg"]') })
    const rowText = (await row2.textContent()).replace(/\s+/g, ' ')
    const cat2 = await row2.locator('select').count() ? await row2.locator('select').first().inputValue() : null
    const ini2 = await row2.locator('input').count() ? await row2.locator('input').first().inputValue() : null
    L.note(id, 'after reload: ' + JSON.stringify({ after, cat2, ini2, rowText: rowText.slice(0, 120) }))
    L.check(`${id}-saved`, 'after a reload NVG (unticked), CAT (OCU) and initials (RQ) are as left; Scheduler still ticked', after.nvg === '' && after.sched.text === '✓' && rowText.includes('RQ') && rowText.includes(catAfter), { nvg: after.nvg, sched: after.sched.text, catAfter, rowText: rowText.slice(0, 80) })
    await L.shot(page, `${id}-reloaded`)
    // restore NVG
    await edit(page, true); await press(cell(page, 'nvg')); await page.waitForTimeout(300); await edit(page, false)
    // the sign-off lists: does Ranger still appear
    await L.signOut(page); await L.signIn(page, 'ad', 'a'); await L.go(page, 'editsched')
    const lk = (await lists(page)).filter(x => /SKED|PLANNED|APPROVED/.test(x.label))
    L.check(`${id}-lists`, 'after the member changes, the SKED CK / PLANNED BY / APPROVED BY lists still list Ranger (read as admin; members have no list on screen)', lk.length > 0 && lk.every(x => x.ranger), lk.map(x => x.label.slice(0, 12) + ':' + x.ranger))
    await L.shot(page, `${id}-lists-admin`)
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]); try { await L.shot(page, `${id}-threw`) } catch {} }
  await ctx.close()
}

async function s15(kind, w, h) {
  const sfx = kind === 'phone' ? 'phone' : 'desk'
  const id = `S15-${sfx}`
  const { page, tap, ctx } = await L.openAt(kind, w, h)
  const press = (loc) => (tap ? loc.tap() : loc.click())
  try {
    await L.signIn(page, 'ad', 'a')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }).catch(() => {})
    await L.go(page, 'editsched')
    const l0 = await lists(page)
        L.check(`${id}-lists0`, 'sign-off lists found on Edit Schedule and Ranger is listed in all', l0.filter(x => /SKED|PLANNED|APPROVED/.test(x.label)).length > 0 && l0.filter(x => /SKED|PLANNED|APPROVED/.test(x.label)).every(x => x.ranger), l0.filter(x => /SKED|PLANNED|APPROVED/.test(x.label)).length)
    await L.go(page, 'quals'); await edit(page, true)
    const a0 = await readCell(page, 'sched')
    await press(cell(page, 'sched')); await page.waitForTimeout(500)
    const a1 = await readCell(page, 'sched')
    L.check(`${id}-untick`, 'admin unticks Ranger\'s Scheduler', a0.text === '✓' && a1.text === '', { before: a0, after: a1 })
    await L.shot(page, `${id}-unticked`)
    await edit(page, false)
    await L.go(page, 'editsched')
    const l1 = await lists(page)
    L.check(`${id}-lists-unticked`, 'RECORD: Ranger in the sign-off lists after untick', true, { before: l0.map(x => x.ranger), after: l1.map(x => x.ranger), n: l1.length })
    const sk = l1.filter(x => /SKED|PLANNED|APPROVED/.test(x.label)), ck = l1.filter(x => /CUR CK/.test(x.label))
    L.check(`${id}-leaves`, 'Ranger leaves the SKED CK / PLANNED BY / APPROVED BY lists (CUR CK keeps him)', sk.length > 0 && sk.every(x => !x.ranger), { signoff: sk.map(x => x.label.slice(0, 12) + ':' + x.n + ':' + x.ranger), curCk: ck.map(x => x.ranger) })
    await L.shot(page, `${id}-lists-unticked`)
    // as us: the cell unticked and read only; press adds nothing
    await L.signOut(page)
    await L.signIn(page, 'us', 'us')
    await L.go(page, 'quals'); await edit(page, true)
    const u1 = await readCell(page, 'sched')
    await press(cell(page, 'sched'))
    if (tap) await L.shot(page, `${id}-us-press-tap`)
    await page.waitForTimeout(400)
    const u2 = await readCell(page, 'sched'), tt = await toast(page)
    L.check(`${id}-member`, 'as us: Scheduler unticked, read only (qro), a press adds nothing', u1.text === '' && /qro/.test(u1.cls) && u2.text === '', { before: u1, after: u2, toast: tt })
    L.note(`S17-${sfx}`, `a member (Ranger, tick removed by an admin) presses his empty Scheduler cell: before ${JSON.stringify(u1)}, after ${JSON.stringify(u2)}, toast ${tt}`)
    await L.shot(page, `${id}-us-view`)
    await edit(page, false)
    await L.signOut(page)
    await L.signIn(page, 'ad', 'a')
    await L.go(page, 'quals'); await edit(page, true)
    await press(cell(page, 'sched')); await page.waitForTimeout(500)
    const r1 = await readCell(page, 'sched')
    L.check(`${id}-retick`, 'admin ticks it again', r1.text === '✓', r1)
    await edit(page, false)
    await L.go(page, 'editsched')
    const l2 = await lists(page)
    const sk2 = l2.filter(x => /SKED|PLANNED|APPROVED/.test(x.label))
    L.check(`${id}-lists-back`, 'Ranger is back in the SKED CK / PLANNED BY / APPROVED BY lists', sk2.length > 0 && sk2.every(x => x.ranger), sk2.map(x => x.label.slice(0, 12) + ':' + x.n + ':' + x.ranger))
    await L.shot(page, `${id}-lists-back`)
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]); try { await L.shot(page, `${id}-threw`) } catch {} }
  await ctx.close()
}

async function s16() {
  const id = 'S16-desk'
  const { page, tap, ctx } = await L.openAt('desktop', 1536, 864)
  try {
    await L.signIn(page, 'ad', 'a')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }).catch(() => {})
    const who = await page.evaluate(() => { const row = [...document.querySelectorAll('#qtbl')][0]; return null })
    await L.go(page, 'quals')
    const saberId = await page.evaluate(() => { const tr = [...document.querySelectorAll('#qtbl tbody tr')].find(r => /^\s*Saber/.test(r.textContent)); const td = tr && tr.querySelector('td[data-q]'); return td ? td.dataset.q.split('|')[0] : null })
    L.note(id, 'Saber person id: ' + saberId)
    await edit(page, true)
    const adm = { sched: await readCell(page, 'sched', saberId), mgmt: await readCell(page, 'mgmt', saberId) }
    L.check(`${id}-admin-editable`, 'as admin, his own Scheduler and Management cells are editable (no qro)', !/qro/.test(adm.sched.cls) && !/qro/.test(adm.mgmt.cls), adm)
    await edit(page, false)
    await page.locator('#roleBadge').click(); await page.waitForTimeout(800)
    L.note(id, 'badge after tap: ' + await page.locator('#roleBadge').textContent())
    await L.go(page, 'quals'); await edit(page, true)
    const mem = { sched: await readCell(page, 'sched', saberId), mgmt: await readCell(page, 'mgmt', saberId) }
    await L.shot(page, `${id}-member-view`)
    L.check(`${id}-memberview`, 'in member view his own Scheduler and Management cells read only', /qro/.test(mem.sched.cls) && /qro/.test(mem.mgmt.cls), mem)
    const before = mem.sched.text
    await cell(page, 'sched', saberId).click(); await page.waitForTimeout(400)
    const after = (await readCell(page, 'sched', saberId)).text
    L.check(`${id}-press`, 'pressing his Scheduler cell in member view changes nothing', after === before, { before, after, toast: await toast(page) })
    await edit(page, false)
    await page.locator('#roleBadge').click(); await page.waitForTimeout(800)
    L.note(id, 'badge after back: ' + await page.locator('#roleBadge').textContent())
    await L.go(page, 'quals'); await edit(page, true)
    const back = { sched: await readCell(page, 'sched', saberId), mgmt: await readCell(page, 'mgmt', saberId) }
    L.check(`${id}-back`, 'back in admin view the cells are editable', !/qro/.test(back.sched.cls) && !/qro/.test(back.mgmt.cls), back)
    await L.shot(page, `${id}-admin-again`)
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]); try { await L.shot(page, `${id}-threw`) } catch {} }
  await ctx.close()
}

if (!only || only === 's14') { await s14('desktop', 1536, 864); await s14('phone', 402, 874) }
if (!only || only === 's15') { await s15('desktop', 1536, 864); await s15('phone', 402, 874) }
if (!only || only === 's16') await s16()
await L.finish('b4')
process.exit(0)
