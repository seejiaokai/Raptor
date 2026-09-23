/* [HUMAN-RETEST] Tracker — step 0, the survey: what is on screen, at both
   widths, for both roles. Pictures + an inventory of every visible control, so
   the roll-call and the door check start from what is DRAWN, not from memory. */
import { open, shot, save, core, PHONE, DESK } from './trk-lib.mjs'

async function inventory(page) {
  return page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' }
    const root = document.querySelector('#page-tracker')
    const ctl = [...root.querySelectorAll('button, select, input, [role=button], a, label.tab, .tab')]
      .filter(vis)
      .map(el => ({
        tag: el.tagName.toLowerCase(), id: el.id || '', cls: (el.className && el.className.baseVal === undefined ? el.className : '') + '',
        text: (el.innerText || el.value || el.getAttribute('aria-label') || el.title || '').trim().slice(0, 50),
        title: (el.title || '').slice(0, 80), disabled: !!el.disabled,
        box: (() => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })(),
      }))
    const balls = document.querySelectorAll('#flowSvg .ball').length
    return { ctl, balls, bodyCls: document.body.className, trCls: root.className }
  })
}

const res = {}
for (const [label, size, who] of [['desk-admin', DESK, 'a'], ['phone-admin', PHONE, 'a'], ['desk-member', DESK, 'u'], ['phone-member', PHONE, 'u']]) {
  const { browser, page, errors } = await open({ size, who, touch: size === PHONE })
  await shot(page, `00-${label}`)
  const inv = await inventory(page)
  const st = await core(page, c => ({
    course: c.curCourseName && c.curCourseName(), syl: c.curSylName && c.curSylName(),
    courses: (c.COURSES || []).map(x => x.name), syls: (c.SYLS || []).map(x => x.name + (c.isHidden(x.id) ? ' (hidden)' : '')),
    roster: (c.roster || []).map(r => r.name + (r.pid ? ' [linked]' : '')), active: c.active, fileLocked: c.fileLocked,
    events: (c.SYL || []).length,
  }))
  res[label] = { inv, st, errors }
  console.log(`\n== ${label}: ${inv.balls} balls, ${inv.ctl.length} visible controls; course ${st.course} / ${st.syl}; roster ${JSON.stringify(st.roster)}; fileLocked ${st.fileLocked}; errors ${errors.length}`)
  for (const c of inv.ctl) console.log(`   ${c.tag}${c.id ? '#' + c.id : ''} "${c.text}"${c.disabled ? ' [disabled]' : ''} @${c.box.join(',')}`)
  await browser.close()
}
save('00-survey', res)
