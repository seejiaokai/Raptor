/* MIX16 — applicable behavioural watches; see Insights build register. */
import { test, expect } from '@playwright/test'
import { login, go } from './app'
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
