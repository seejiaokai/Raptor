// sah-w8-keep — copies walker w8's deciding pictures from D:\raptor-work\c152-walk\w8 into the repo's walk folder
// (docs/img/handpass/2026-11-23-sans-ahead/w8/), each under its own name, the run folder as a prefix.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('sah-w8-keep v1')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const DEST = path.resolve(HERE, '../../docs/img/handpass/2026-11-23-sans-ahead/w8')
mkdirSync(DEST, { recursive: true })
const R = 'D:/raptor-work/c152-walk/w8/'
const KEEP = [
  'run2/s1-s1-01-month-desktop.png', 'run2/s1-s1-02-16-desktop.png', 'run2/s1-s1-04-17-desktop.png',
  'run2/s2-s2-03-16-saved-desktop.png', 'run2/s3-s3-01-saved-desktop.png', 'run2/s3-s3-02-day20-desktop.png', 'run2/s3-s3-03-picker-desktop.png',
  'run3/taps/s4r-drag-16-18-held-desktop.png', 'run3/s4r-s4-02-after-gesture-desktop.png', 'run3/s4r-s4-04-after-gesture-desktop.png', 'run3/s4r-s4-01-form-desktop.png',
  'run3/s4s-s4-02-form-desktop.png', 'run3/s4s-s4-06-saved-desktop.png',
  'run2/s5-s5-ranger-list-desktop.png', 'run2/s5-s5-saber-people-17-desktop.png',
  'run2/s15-s15-02-bell-desktop.png', 'run2/s15-s15-03-tapped-desktop.png', 'run2/s15-s15-05-bell-desktop.png', 'run2/s15-s15-08-bell-desktop.png',
  'run3/s17-s17-01-bell-desktop.png', 'run3/s17-s17-05-bell-desktop.png', 'run3/s17-s17-07-bell-desktop.png', 'run2/s17m-s17m-02-bell-desktop.png',
  'run2/s19-s19-01-saber-desktop.png', 'run2/s19-s19-04-clip-desktop.png',
  'run2/s20-s20-01-desktop.png', 'run2/s20-s20-02-desktop.png',
  'run2/s21-s21-02-ranger-desktop.png', 'run2/s21-s21-03-ranger-desktop.png', 'run2/s23-s23-05-open-desktop.png',
  'run2/pu-pu-05-desktop.png', 'run2/pu-pu-16-desktop.png',
  'run2p/s19-s19-03-ranger-phone.png', 'run2p/s15-s15-02-bell-phone.png', 'run2p/s15-s15-03-tapped-phone.png', 'run2p/taps/s15-s15-03-line-now-phone.png',
  'run3p/taps/s4r-drag-16-18-held-phone.png', 'run3p/s4r-s4-02-after-gesture-phone-chromium.png', 'run2p/s17-s17-07-bell-phone.png', 'run2p/pu-pu-06-phone.png',
]
let n = 0
for (const f of KEEP) {
  if (!existsSync(R + f)) { console.log('MISSING', f); continue }
  copyFileSync(R + f, path.join(DEST, f.replace(/\//g, '__').replace('__taps__', '__taps-')))
  n++
}
console.log('copied', n, 'to', DEST)
