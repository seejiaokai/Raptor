import { VCONF } from './rules'
import { parseHM } from './time'
import { isStandalone } from './waves'
import { PEOPLE, realP, nameToId } from './people'
/* =====================================================================
   WEEKEND / PUBLIC-HOLIDAY DUTY EARNS OIL — Leave War sync wire 4
   (owner, 16-17 Aug 26: "use SC shift, but also the duties follow for that
   day itself, based on what timing was written… Categorise them into Leave
   War", refined 17 Aug 26: "for SC if it's like AM and PM then it's half
   day… for non SC u count hours. Which is 6 or more").

   This module answers ONE question: given a day's content, how much OIL
   does each person's duty on it earn — 0.5 (Leave War's HS) or 1 (FS).
   It does not know what a weekend or a public holiday is; whether the day
   is non-working at all is Leave War's answer (DayInfo.ph and the 'off'
   event tags live there), asked by src/leavewar/sync.ts, which is also
   where the credit is posted. Keeping this half DOM-free and Leave-War-free
   means the rule is testable against a bare day blob — including a frozen
   snapshot, which is what the sync wire actually feeds it: an ISSUED day is
   the squadron's word that the duty stood.

   What earns, exactly:
   - An SC MAIN seat. The AM and PM shifts are minted as the two halves of
     the SC day window (waves.ts SAWAVE), so a shift sitting wholly inside
     ONE half of [scDayFrom, scDayTo] is half a day and anything more — the
     whole window, a shift spanning its midpoint, or a night shift reaching
     outside it — is a full one. Read off the times as scheduled, not the
     shift's label, for the same reason scShiftKind is: labels are free text.
   - A duty row, by its written hours: oilFullMin minutes or more is a full
     day, under it a half. Hours are SUMMED per person first, so two short
     posts credit like one long one.
   NOT earning, deliberately:
   - An SC SPARE — he is standing by at home, reachable but not at work
     (the same reading scSpare gives the conflict engine).
   - A row with no readable times. The owner's rule is "based on what timing
     was written"; a duty with no times written is not a measured duty, and
     inventing a default here would mint OIL from a guess.
   - AVALON / BB and flying seats — the owner named SC and the duties.
   A person on more than one earning line sums and caps at one day: SC AM
   plus an afternoon duty post is a full day worked, not a day and a half. */
export function scShiftCredit(st:any,en:any){
  if(st==null||en==null)return null;
  if(en<st)en+=1440;
  const mid=Math.floor((VCONF.scDayFrom+VCONF.scDayTo)/2);
  const amHalf=st>=VCONF.scDayFrom&&en<=mid, pmHalf=st>=mid&&en<=VCONF.scDayTo;
  return (amHalf||pmHalf)?0.5:1;
}
/* every person's OIL credit for one day blob: id -> 0.5 | 1 */
export function dayOilCredits(day:any){
  const sc:any={}, dutyMin:any={};
  const rid=(v:any)=>{const id=PEOPLE[v]?v:nameToId(v);return realP(id)?id:null;};
  /* cancelled structures earn nothing — the same cx skips dayBusy/dayEngaged
     make, at both levels, because a CX'd duty on an issued day is a duty that
     did NOT stand; and a duty row's more[] extras earn the row's hours like
     its primary, the same "tasked exactly as much" reading dayEngaged gives
     them (an SC line's seats stay p/w only, also matching dayEngaged) */
  (day.waves||[]).forEach((wv:any)=>{
    if(!isStandalone(wv)||wv.kind!=='sc')return;
    (wv.formations||[]).forEach((f:any)=>{
      if(f.cx)return;
      const c=scShiftCredit(parseHM(f.to),parseHM(f.ld)); if(c==null)return;
      (f.aircraft||[]).forEach((ac:any)=>{
        if(ac.cx||f.spare||ac.spare)return;
        [ac.p,ac.w].forEach((v:any)=>{const id=rid(v);if(id)sc[id]=(sc[id]||0)+c;});
      });
    });
  });
  (day.dutywaves||[]).forEach((dw:any)=>{
    (dw.rows||[]).forEach((r:any)=>{
      if(r.cx)return;
      const st=parseHM(r.str); let en=parseHM(r.end);
      if(st==null||en==null)return;
      if(en<st)en+=1440;
      [r.id,...(r.more||[])].forEach((v:any)=>{
        const id=rid(v); if(id)dutyMin[id]=(dutyMin[id]||0)+(en-st);
      });
    });
  });
  const out:any={};
  new Set([...Object.keys(sc),...Object.keys(dutyMin)]).forEach((id:any)=>{
    const d=dutyMin[id]?(dutyMin[id]>=VCONF.oilFullMin?1:0.5):0;
    const v=Math.min(1,Math.min(1,sc[id]||0)+d);
    if(v)out[id]=v;   // a zero-length duty row measures nothing and mints nothing
  });
  return out;
}
