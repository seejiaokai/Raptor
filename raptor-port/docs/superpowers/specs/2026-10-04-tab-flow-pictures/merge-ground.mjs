import{readFileSync,writeFileSync,copyFileSync}from'node:fs';
const base='C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/specs/2026-10-04-tab-flow-pictures';
const current=JSON.parse(readFileSync(`${base}/capture.json`));const fresh=JSON.parse(readFileSync(`${base}/recapture/capture.json`));
const source=fresh.pages.find(p=>p.surface==='week').sections.find(s=>s.key==='ground');
const dest=current.pages.find(p=>p.surface==='week');const index=dest.sections.findIndex(s=>s.key==='ground');if(index<0||!source)throw Error('Missing section');dest.sections[index]=source;copyFileSync(`${base}/recapture/${source.original}`,`${base}/${source.original}`);writeFileSync(`${base}/capture.json`,JSON.stringify(current,null,2));
