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
