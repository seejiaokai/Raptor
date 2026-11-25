/* Folds the captured day (capture/1-draft.html), the app's stylesheets (capture/app.css) and the try-out's own frame,
   styles and script (src/) into one self-contained page: index.html. No app script is carried over.
   Run from raptor-port/: node docs/mock/2026-11-25-endtime-tryout/build.mjs */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'

const HERE = dirname(fileURLToPath(import.meta.url))
const read = p => readFileSync(join(HERE, p), 'utf8')
let day = read('capture/1-draft.html')
day = day.replace(/<script[\s\S]*?<\/script>/gi, '')
/* the sign-off panel's long name lists are redrawn by the try-out (four names a box), so the capture's are dropped */
day = day.replace(/<option[^>]*>[^<]*<\/option>/g, '')
/* a stylesheet's closing tag inside the CSS would end the <style> early */
const css = read('capture/app.css').replace(/<\/style/gi, '<\\/style')
const out = read('src/frame.html')
  .replace('/*APPCSS*/', () => css)
  .replace('/*TRYCSS*/', () => read('src/tryout.css'))
  .replace('<!--DAY-->', () => day)
  .replace('/*TRYJS*/', () => read('src/tryout.js').replace(/<\/script/gi, '<\\/script'))
writeFileSync(join(HERE, 'index.html'), out)
console.log('index.html', (out.length / 1024).toFixed(0) + ' KB')
