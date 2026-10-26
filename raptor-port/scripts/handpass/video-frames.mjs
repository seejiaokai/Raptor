// Pull still frames out of his iPhone screen recording (23 Oct 26, [LW-PHONE-PINCH-ZOOM]). There is no ffmpeg on his PC, and an
// iPhone records in HEVC, which the test browser cannot play: the installed Chrome, opened in a VISIBLE window with its HEVC
// decoder on, can. Usage: node scripts/handpass/video-frames.mjs <video.mp4> <out folder> [seconds between frames, 1]
// Frames come out as f<seconds>.jpg at the video's own size; lw-pz-questions.mjs (REC, REC_SPEC) turns, crops and marks them.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const [, , src, outDir, everyArg] = process.argv;
const every = Number(everyArg || 1);
fs.mkdirSync(outDir, { recursive: true });
const srv = http.createServer((req, res) => {
  if (req.url.startsWith('/v.mp4')) {
    const stat = fs.statSync(src);
    const range = req.headers.range;
    if (range) {
      const [s, e] = range.replace('bytes=', '').split('-');
      const start = Number(s); const end = e ? Number(e) : stat.size - 1;
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': 'video/mp4' });
      fs.createReadStream(src, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': 'video/mp4' });
      fs.createReadStream(src).pipe(res);
    }
  } else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<video id=v src="/v.mp4" muted preload=auto></video><canvas id=c></canvas>'); }
}).listen(0);
const port = srv.address().port;
let browser;
for (const channel of ['chrome', 'msedge']) {
  try { browser = await chromium.launch({ channel, headless: false, args: ['--enable-features=PlatformHEVCDecoderSupport'] }); console.log('using', channel); break; } catch (e) { console.log('no', channel); }
}
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/`);
const info = await page.evaluate(() => new Promise((ok) => {
  const v = document.getElementById('v');
  const done = () => ok({ d: v.duration, w: v.videoWidth, h: v.videoHeight, err: v.error && v.error.code });
  if (v.readyState >= 2) done(); v.onloadeddata = done; v.onerror = done;
}));
console.log(JSON.stringify(info));
if (!info.d || info.err) { await browser.close(); srv.close(); process.exit(1); }
for (let t = 0; t <= info.d; t += every) {
  const data = await page.evaluate((t) => new Promise((ok) => {
    const v = document.getElementById('v'); const c = document.getElementById('c');
    v.onseeked = () => { c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); ok(c.toDataURL('image/jpeg', 0.8)); };
    v.currentTime = t;
  }), t);
  const name = path.join(outDir, `f${String(t.toFixed(1)).padStart(5, '0')}.jpg`);
  fs.writeFileSync(name, Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close(); srv.close();
console.log('done');
