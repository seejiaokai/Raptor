// Targeted readable picture after walk-13 clipped the existing role question.
// Normal controls and read-only probes; no model/storage/command injection.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect } from '@playwright/test'
import { open } from './lib.mjs'
import { root, verify } from './schedule-tab-evidence.mjs'
const out=resolve(root,'docs/img/handpass/2026-10-04-schedule-tab',process.env.TAB_ROLE_RUN||'role-picture-1')
if(existsSync(out))throw new Error('Retain the old evidence')
mkdirSync(out,{recursive:true})
const result={identity:await verify(resolve(process.env.TAB_FREEZE),process.env.HP_URL||'http://localhost:4220'),pass:false}
const {page,browser,errors}=await open({width:1440,height:1000,who:'a',fresh:false})
try{
  await page.locator('.nav [data-page="logic"]').click()
  await page.locator('#lgEdit').click();await page.locator('#lgMissionMix').check()
  await page.locator('.nav [data-page="editsched"]').click()
  await page.locator('#eWeek [data-sbday="0"]').first().click()
  const mission=page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]').first()
  await mission.fill('ACM');await page.keyboard.press('Tab')
  const later=page.locator('[data-role-side="later"]')
  if(await later.count())await later.click()
  await page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]').first().fill('DS FOR TAB BOARD')
  await page.keyboard.press('Tab')
  const question=page.locator('.mission-role-question'),stores=page.locator('#sbBoard [data-bombs="0.0.0.0"]')
  await expect(question).toBeVisible()
  await question.scrollIntoViewIfNeeded()
  result.caret=await stores.evaluate(e=>document.activeElement===e)
  const q=await question.boundingBox();const viewport=page.viewportSize()
  result.question=q
  if(!result.caret||!q||q.y<0||q.y+q.height>viewport.height)throw new Error('Question/caret not proved')
  result.image=resolve(out,'role-question-and-next-caret.png')
  await page.screenshot({path:result.image})
  result.errors=errors;result.pass=errors.length===0
  if(!result.pass)throw new Error('Browser errors')
}finally{writeFileSync(resolve(out,'result.json'),JSON.stringify(result,null,2));await browser.close()}
