/* MIX16 — applicable behavioural watches; see Insights build register. */
import { test, expect } from '@playwright/test'
import { login, go } from './app'
/* D558 MENU01–07: new phone week doors, retained calendar/desktop/Board routes. */
for(const width of [320,360,375,390,820,821,1440]){
  test(`D558 MENU01 geometry and actual menu hits at ${width}`,async({page})=>{
    await page.setViewportSize({width,height:844});await login(page)
    for(const [p,id] of [['viewsched','viewSched'],['editsched','editSched']] as const){
      await go(page,p);const more=page.locator(`#${id}More`)
      if(width>820){await expect(more).toHaveCount(0);await expect(page.locator('#insightBtn')).toBeVisible();continue}
      await expect(more).toBeVisible()
      const measure=await page.locator(`#page-${p} .filters`).evaluate(e=>{
        const r=(s:string)=>e.querySelector(s)!.getBoundingClientRect(),m=r('.schedule-more'),h=r('.hl-tog'),s=r('.searchbox'),i=r('.searchbox input'),c=r('.filt-cal')
        return {m:{x:m.x,y:m.y,w:m.width,h:m.height,right:m.right},hl:{right:h.right,y:h.y,w:h.width,h:h.height},search:{x:s.x,y:s.y,right:s.right,input:i.width},cal:{w:c.width,h:c.height},scroll:e.scrollWidth,client:e.clientWidth}
      })
      expect(measure.m.w).toBe(30);expect(measure.m.h).toBe(26);expect(measure.hl.w).toBe(30);expect(measure.hl.h).toBe(26)
      expect(measure.cal).toEqual({w:34,h:26});expect(measure.m.x).toBeGreaterThan(measure.hl.right)
      expect(Math.abs(measure.search.y-measure.m.y)).toBeLessThan(8);expect(measure.search.x).toBeGreaterThanOrEqual(measure.m.right)
      expect(measure.search.right).toBeLessThanOrEqual(width);expect(measure.search.input).toBeGreaterThanOrEqual(45)
      expect(measure.scroll).toBeLessThanOrEqual(measure.client+1)
      if(p==='editsched'){await expect(page.locator('#exportSched')).toBeVisible();await expect(page.locator('#exportPdf')).toBeVisible()}
      await more.click();const item=page.locator(`#${id}MoreInsights`)
      const box=await page.locator(`#${id}MoreMenu`).boundingBox();expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width)
      expect(await item.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===hit||e.contains(hit)})).toBe(true)
      await item.click();await expect(page.locator('#insightModal')).toBeVisible();await expect(page.locator('#insightClose')).toBeFocused()
      await page.locator('#insightClose').click();await expect(more).toBeFocused()
      await page.locator(`#page-${p} .hl-tog`).click()
      const y=await page.locator(`#page-${p} .hlrow`).evaluate(e=>e.getBoundingClientRect().top)
      expect(y).toBeGreaterThan(measure.m.y+measure.m.h)
      await page.locator(`#page-${p} .hl-tog`).click()
    }
  })
}
test.describe('D558 phone menu native flows',()=>{
  test.use({viewport:{width:390,height:568},isMobile:true,hasTouch:true})
  test('MENU02/03 keyboard, outside actions, page/Board/drawer/resize resets and both orders',async({page})=>{
    await login(page)
    for(const [p,id] of [['viewsched','viewSched'],['editsched','editSched']] as const){
      await go(page,p);const more=page.locator(`#${id}More`),menu=page.locator(`#${id}MoreMenu`),item=page.locator(`#${id}MoreInsights`)
      await more.focus();await page.keyboard.press('Enter');await expect(item).toBeFocused()
      for(const key of ['ArrowDown','ArrowUp','Home','End']){await page.keyboard.press(key);await expect(item).toBeFocused()}
      await page.keyboard.press('Escape');await expect(menu).toHaveCount(0);await expect(more).toBeFocused()
      await page.keyboard.press('Space');await expect(item).toBeFocused();await page.keyboard.press('Tab');await expect(page.locator(`#search${p==='viewsched'?'V':'E'}`)).toBeFocused();await expect(menu).toHaveCount(0)
      await more.click();await page.locator(`#page-${p} .filt-cal`).click();await expect(menu).toHaveCount(0);await expect(page.locator('#weekCal')).toBeVisible();await page.locator('#weekCal .x').click()
      await page.locator(`#page-${p} .hl-tog`).click();await more.click();await expect(menu).toBeVisible();await page.locator(`#page-${p} .hl-tog`).click();await expect(menu).toHaveCount(0)
      await more.click();await page.locator(`#search${p==='viewsched'?'V':'E'}`).click();await expect(menu).toHaveCount(0)
      await more.click();await page.locator('#burger').click();await expect(menu).toHaveCount(0);await page.locator(`#drawerNav [data-page="${p}"]`).click();await expect(menu).toHaveCount(0)
      await more.click();await go(page,'inputs');await go(page,p);await expect(menu).toHaveCount(0)
      await more.click();await page.setViewportSize({width:821,height:568});await expect(menu).toHaveCount(0);await page.setViewportSize({width:390,height:568});await expect(menu).toHaveCount(0)
      if(p==='editsched'){await more.click();await page.locator('#eWeek [data-sbday="0"]').first().click();await expect(menu).toHaveCount(0);await page.locator('#sbDone').click();await expect(menu).toHaveCount(0)}
      await more.click();await item.click();await page.locator('#insightClose').click();await more.click();await item.click();await page.locator('#insightClose').click()
    }
  })
  test('MENU04 drawer from schedule/Inputs/Leave War/Tracker; actual member and role switch/logout',async({page})=>{
    await login(page)
    for(const p of ['viewsched','inputs','leavewar','tracker'] as const){
      await go(page,p);await page.locator('#burger').click();await expect(page.locator('#drawer')).toHaveClass(/open/)
      await expect(page.locator('#drawerWeeks,#drawerPickWeek,#drawerInsights')).toHaveCount(0)
      expect(await page.locator('#drawer h4').allTextContents()).toEqual(['Menu','Account'])
      await expect(page.locator('#drawerAcct')).toBeVisible();await expect(page.locator('#drawerRole')).toBeVisible();await expect(page.locator('#drawerLogout')).toBeVisible()
      await page.locator('#drawerNav [data-page="viewsched"]').click();await page.locator('#viewSchedMore').click();await page.locator('#viewSchedMoreInsights').click();await expect(page.locator('#insightModal')).toBeVisible();await page.locator('#insightClose').click()
    }
    await page.locator('#viewSchedMore').click();await page.locator('#burger').click();await page.locator('#drawerRole').click()
    await expect(page.locator('#viewSchedMoreMenu')).toHaveCount(0);await page.locator('#burger').click();await expect(page.locator('#drawerNav [data-page="editsched"]')).toHaveCount(0)
    await page.locator('#drawerRole').click();await page.locator('#burger').click();await page.locator('#drawerLogout').click();await expect(page.locator('#loginForm')).toBeVisible()
    await login(page,'user');await page.locator('#viewSchedMore').click();await page.locator('#viewSchedMoreInsights').click();await expect(page.locator('#insightModal')).toBeVisible();await page.locator('#insightClose').click()
    await page.locator('#burger').click();await expect(page.locator('#drawerNav [data-page="editsched"]')).toHaveCount(0)
  })
  test('MENU06 dirty text saves once via native blur; unchanged Remarks silent; Enter/Escape/Tab resume',async({page})=>{
    await login(page);await go(page,'editsched')
    const f=page.locator('#eWeek [data-txt="ff:0.0.0.cs"]'),more=page.locator('#editSchedMore')
    const n=await page.evaluate(()=>(window as any).commandStreamLen())
    await f.fill('MENU TEST');await more.click();await expect(page.locator('#editSchedMoreMenu')).toBeVisible()
    expect(await page.evaluate(()=>(window as any).DAYS[0].waves[0].formations[0].cs)).toBe('MENU TEST')
    expect(await page.evaluate(()=>(window as any).commandStreamLen())).toBe(n+1)
    await page.keyboard.press('Escape');await f.fill('CANCELLED');await f.press('Escape');await expect(f).toHaveText('MENU TEST')
    await f.fill('ENTER TEST');await f.press('Enter');await expect(f).toHaveText('ENTER TEST')
    await f.focus();await f.press('Tab');await expect(page.locator('#eWeek [data-txt="ff:0.0.0.msn"]')).toBeFocused()
    const remarks=page.locator('#eWeek [data-txt="fr:0.0.0.0"]');await remarks.focus()
    const clean=await page.evaluate(()=>(window as any).commandStreamLen());await more.click()
    expect(await page.evaluate(()=>(window as any).commandStreamLen())).toBe(clean);await expect(page.locator('.mission-role-question')).toHaveCount(0)
  })
  test('MENU07 both surviving calendars exact cross-week day, Today, Escape; Board context',async({page})=>{
    await login(page)
    for(const [p,id,week] of [['viewsched','viewSched','#vWeek'],['editsched','editSched','#eWeek']] as const){
      await go(page,p);await page.locator(`#${id}More`).click();await page.locator(`#page-${p} .filt-cal`).click()
      await page.locator('[data-wcal="2026-07-22"]').click();await page.waitForFunction(()=>(window as any).CURWEEK==='20/07/2026')
      await expect(page.locator(`#${id}MoreMenu`)).toHaveCount(0)
      await expect.poll(()=>page.locator(week).evaluate(e=>{const day=e.querySelector('.day[data-day="2"]')!.getBoundingClientRect(),w=e.getBoundingClientRect();return Math.abs(day.left-w.left)})).toBeLessThan(30)
      await page.locator(`#page-${p} .filt-cal`).click();await page.locator('#weekCal .wc-today').click();await page.waitForFunction(()=>(window as any).CURWEEK==='13/07/2026')
      await page.locator(`#page-${p} .filt-cal`).click();await expect(page.locator('#weekCal .rc-nav').first()).toBeFocused();await page.keyboard.press('Escape');await expect(page.locator('#weekCal')).toBeHidden();expect(await page.evaluate(()=>(window as any).CURWEEK)).toBe('13/07/2026')
    }
    await page.locator('#eWeek [data-sbday="0"]').first().click();await page.locator('#sbCal').click();await page.locator('[data-wcal="2026-07-22"]').click()
    await expect(page.locator('#schedBoard')).toBeVisible();expect(await page.evaluate(()=>(window as any).SBDAY)).toBe(2)
  })
})
for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]] as const){
  test.describe(`Insights real routes ${name}`,()=>{
    test.use({viewport,...(name==='phone'?{isMobile:true,hasTouch:true}:{})})
    test('D512/D515/D524/D532 default Off, Logic control, Board text before annotation answer',async({page})=>{
      await login(page);await go(page,'logic')
      const toggle=page.locator('#lgMissionMix');await expect(toggle).toHaveAttribute('aria-checked','false');await expect(toggle).toHaveAttribute('aria-disabled','true')
      await page.locator('#lgEdit').click();await toggle.check();await expect(toggle).toBeChecked()
      await go(page,'editsched');await page.locator('#eWeek [data-sbday="0"]').first().click()
      // The phone's approved door lives in More, keeping its action row unchanged.
      if(name==='phone')await expect(page.locator('#sbInsights')).toBeHidden()
      else await expect(page.locator('#sbInsights')).toBeVisible()
      const field=page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible')
      await field.fill('DS FOR EAGLE');await field.press('Tab')
      await expect(page.locator('.mission-role-question')).toHaveCount(1)
      await expect(page.locator('.mission-role-question')).toContainText('Working copy')
      expect(await page.evaluate(()=>(window as any).DAYS[0].waves[0].formations[0].aircraft[0].rmks)).toBe('DS FOR EAGLE')
      const snapshot=await page.evaluate(()=>JSON.stringify([(window as any).DAYS,(window as any).SCHED]))
      const red=page.locator('[data-role-side="red"]');await red.scrollIntoViewIfNeeded()
      expect(await red.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===hit||e.contains(hit)})).toBe(true)
      await red.click();await expect(page.locator('.mission-role-question')).toHaveCount(0)
      expect(await page.evaluate(()=>JSON.stringify([(window as any).DAYS,(window as any).SCHED]))).toBe(snapshot)
      expect(await page.evaluate(()=>(window as any).lastEnvelope().changes.some((c:any)=>c.collection==='insights.role'))).toBe(true)
      await field.focus();await expect(page.locator('[data-role-choose]')).toHaveText('Change mission role')
      await page.keyboard.press('Tab');await page.waitForTimeout(30);await expect(page.locator('.mission-role-question')).toHaveCount(0)
      if(name==='phone'){await page.locator('#sbMore').click();await page.locator('#sbMoreInsights').click()}else await page.locator('#sbInsights').click()
      await expect(page.locator('#insightModal')).toBeVisible();await expect(page.locator('#insightModal')).toContainText('Blue')
      await page.locator('#insightClose').click();await expect(page.locator('#schedBoard')).toBeVisible()
    })
  })
}
/* D536 (his find, 3 Oct 26): the Insights window's title bar and ✕ stay on screen at its longest. On his iPhone the
   sheet was taller than the visible screen and its top sat under the address bar. THIS browser has no address bar that
   shrinks the screen, so this test cannot go red on that cause (the stylesheet is pinned by modal-phone-height.test.ts);
   it guards the same promise wherever it IS measurable — a short phone, a short laptop window, the longest list. */
for(const [name,viewport] of [['short phone',{width:390,height:560}],['phone',{width:390,height:844}],['short desktop',{width:1440,height:620}]] as const){
  test.describe(`Insights window top stays reachable — ${name}`,()=>{
    test.use({viewport,...(viewport.width<821?{isMobile:true,hasTouch:true}:{})})
    test('D536 the title bar and its close button are on screen and tappable, Show all pressed',async({page})=>{
      await login(page);await go(page,'logic');await page.locator('#lgEdit').click();await page.locator('#lgMissionMix').check()
      await go(page,'editsched');await page.locator('#eWeek [data-sbday="0"]').first().click()
      if(viewport.width<821){await page.locator('#sbMore').click();await page.locator('#sbMoreInsights').click()}else await page.locator('#sbInsights').click()
      await expect(page.locator('#insightModal')).toBeVisible()
      const all=page.locator('#insightModal [data-insights-all]');if(await all.count()){await all.scrollIntoViewIfNeeded();await all.click()}
      await page.locator('#insightModal .modal-box').evaluate(e=>{e.scrollTop=0})
      const m=await page.evaluate(()=>{
        const box=document.querySelector('#insightModal .modal-box')!.getBoundingClientRect(),head=document.querySelector('#insightModal .modal-head')!.getBoundingClientRect()
        const x=document.querySelector('#insightClose')!,r=x.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)
        return {boxTop:box.top,boxBottom:box.bottom,headTop:head.top,headBottom:head.bottom,h:innerHeight,closeHit:hit===x||x.contains(hit)}
      })
      expect(m.boxTop,'the window starts on screen').toBeGreaterThanOrEqual(0)
      // D537: on a phone a tall window runs up to a thin strip at the top — never a tenth of the screen of gap
      if(viewport.width<821)expect(m.boxTop,'no large gap above a tall window').toBeLessThanOrEqual(26)
      expect(m.headTop,'its title bar is on screen').toBeGreaterThanOrEqual(0)
      expect(m.headBottom).toBeLessThanOrEqual(m.h)
      expect(m.boxBottom,'and it ends on screen').toBeLessThanOrEqual(m.h+0.5)
      expect(m.closeHit,'the close button is the thing under a tap on it').toBe(true)
      await page.locator('#insightClose').click();await expect(page.locator('#schedBoard')).toBeVisible()
    })
  })
}
