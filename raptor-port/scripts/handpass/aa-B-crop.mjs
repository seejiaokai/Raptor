import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const src = process.argv[2], x = +process.argv[3], y = +process.argv[4], w = +process.argv[5], h = +process.argv[6], out = process.argv[7]
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w * 4, height: h * 4 } })
const data = readFileSync(src).toString('base64')
await p.setContent(`<body style="margin:0;background:#000"><canvas id=c width=${w * 4} height=${h * 4}></canvas><script>const i=new Image();i.onload=()=>{const c=document.getElementById('c').getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(i,${x},${y},${w},${h},0,0,${w * 4},${h * 4});document.title='ok'};i.src='data:image/png;base64,${data}'</script>`)
await p.waitForFunction(() => document.title === 'ok'); await p.screenshot({ path: out }); await b.close()
