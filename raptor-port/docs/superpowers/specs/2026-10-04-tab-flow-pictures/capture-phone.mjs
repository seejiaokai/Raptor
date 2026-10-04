import{createRequire}from'node:module';import{existsSync,mkdirSync,writeFileSync}from'node:fs';
const require=createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json');const{chromium}=require('playwright');
const out='C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/specs/2026-10-04-tab-flow-pictures/phone';mkdirSync(out,{recursive:true});
const CHROMIUM=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium';const browser=await chromium.launch(existsSync(CHROMIUM)?{executablePath:CHROMIUM}:{});
const pages=[];const wanted=new Set(['waves']);
try{
const page=await browser.newPage({viewport:{width:390,height:1600},deviceScaleFactor:2,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
await page.goto('http://127.0.0.1:4220/?fresh=1');await page.locator('#luser').fill('ad');await page.locator('#lpass').fill('a');await page.locator('#loginForm button[type=submit]').click();await page.locator('#vWeek .day').first().waitFor();await page.locator('#burger').click();await page.locator('#drawerNav [data-page="editsched"]').click();
for(const[surface,selector]of[['week','#eWeek .day[data-day="0"] .dsec'],['board','#sbBoard .sb-sec']]){
 if(surface==='board'){await page.locator('#eWeek [data-sbday="0"]').click();await page.locator('#sbBoard .sb-sec').first().waitFor();}
 const inputSection=page.locator(`${selector}[data-secmove="0.inputs"]`);const toggle=inputSection.locator('[data-pitog]');if((await toggle.innerText()).includes('show'))await toggle.click();
 const sections=[];
 for(const loc of await page.locator(selector).all()){
 const key=(await loc.getAttribute('data-secmove')).split('.')[1];if(!wanted.has(key))continue;await loc.scrollIntoViewIfNeeded();
 const data=await loc.evaluate((el,{surface,key})=>{
  const bounds=el.getBoundingClientRect();const fieldSelector=surface==='week'?'[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]':'[data-bfld],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]';
  const firstRow=el.querySelector(surface==='week'?'.ah-row,.pl-row':'.sb-arow');
  const fields=[...el.querySelectorAll(fieldSelector)].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&(e.isContentEditable||(/^(INPUT|TEXTAREA)$/.test(e.tagName)&&!e.disabled&&!e.readOnly))}).map(e=>{
   const r=e.getBoundingClientRect();const attrs=Object.fromEntries([...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value]));const address=attrs['data-txt']??attrs['data-bfld']??attrs['data-inp']??attrs['data-ifld']??attrs['data-itline']??attrs['data-bombs']??attrs['data-area']??attrs['data-atime'];
   const footer=/^(pn|dtn|sn|gn):/.test(address);let selected=false;
   if(key==='notes')selected=true;
   else if(key==='waves')selected=address==='wl:0.0'||address.startsWith('0|0|')||/^(ff|fr):0\.0\.0\./.test(address)||/^0\.0\.0(?:\.|$)/.test(address);
   else selected=footer||/^dn:/.test(address)||address==='dl:0.0'||firstRow?.contains(e);
   return{address,attrs,text:e.value??e.textContent,x:r.x-bounds.x,y:r.y-bounds.y,width:r.width,height:r.height,footer,selected};
  });return{surface,key,title:el.querySelector('.ah-h,.sub-h,.sb-ph,.ap-h')?.textContent?.replace(/^⠿/,'').trim(),width:bounds.width,height:bounds.height,fields};
 },{surface,key});
 if(!data.fields.length)continue;const selected=data.fields.filter(f=>f.selected);let n=1;for(const field of selected)field.number=n++;data.selected=selected;data.original=`${surface}-${key}-original.png`;await loc.screenshot({path:`${out}/${data.original}`});sections.push(data);
 }
 pages.push({surface,sections});
}
writeFileSync(`${out}/capture.json`,JSON.stringify({pages,errors},null,2));console.log(JSON.stringify({pages:pages.map(p=>({surface:p.surface,sections:p.sections.map(s=>({key:s.key,selected:s.selected.length,total:s.fields.length,original:s.original}))})),errors}));
}finally{await browser.close()}
