# Rulings read: D1208–D1220, D1231–D1259, D1263–D1269, and design lessons 31–40 with the §8 line from D1237

A fresh, blind reader. Read-only: no file in the repo was changed.

## How I checked

- **Rulings:** for each ruling I compared the short line in `.claude/rules/decisions/` with its full row in `.claude/decisions-full/`. Where a ruling has a "— changed by" tail, or a NARROWED or ANSWERED mark, I also read the later rulings it names.
- **Lessons:** I compared design lessons 31–40 in `raptor-port/docs/design-practices.md` §9, and the §8 line from D1237, with the full rows of their rulings: D1212, D1222, D1232, D1233, D1238, D1239, D1246, D1251, D1252, D1264 and D1237.
- **Archive:** none of the rulings in these ranges is archived. Every one has a short line in `leave-war.md`, apart from D1237, which is in `how-we-work.md`.

## Agreed (short line says the same rule as the full row, as it now stands)

- **Rulings:** D1208, D1209, D1210, D1211, D1212, D1213, D1214, D1215, D1216, D1217, D1218, D1219, D1220, D1231, D1232, D1233, D1234, D1235, D1236, D1237, D1238, D1239, D1240, D1241, D1242, D1243, D1244, D1245, D1246, D1247, D1248, D1249, D1250, D1251, D1252, D1253, D1254, D1255, D1256, D1257, D1258, D1259, D1263, D1264, D1265, D1266, D1267, D1268, D1269.
- **Lessons and §8:** lessons 31, 33, 34, 37, 38, 39 and 40, and the §8 line from D1237.

## Findings in the rulings' short lines

None.

## Findings in the design lessons

### F1: lessons 35 and 36 are not tied to each other, and lesson 35 still carries a reading D1239 struck

**What is wrong.**

1. Lesson 36 says *"Narrows lesson 35's 'figures sharing one right edge' for the balance tiles."* Lesson 35 does not contain those words. It reads *"figures in a column sharing one edge"*. The words quoted are D1238's bold rule ("the figures sharing one right edge"). Git history confirms lesson 35 never said "right edge" (the phrase first enters the guide in commit edb65fa27, inside lesson 36).
2. Lesson 35 has no pointer back to lesson 36. §0 step 2 says a lesson that narrows a rule already in the guide says so, "and that rule gets a short pointer to it".
3. Lesson 35 keeps the agent's reading *"a sign such as '−' or '=' gets a narrow column of its own"*. D1239's full row struck that for the very tiles lesson 35 was taken from: LVE's line reads "App bal · Pending · War bal … with no floating '−' or '=' between them". Lesson 36 does not mention the signs at all.

**What the full rows say.**

- D1238 (narrowed by D1239): "the figures sharing one right edge". Its readings include "the '−' and '=' in narrow gutters of their own".
- D1239: "every figure and label aligns the same way, to the left, LVE's included". Its readings: "no floating '−' or '=' between them".

**Consequence.** A later chat that reads lesson 35, with no pointer to 36, could:

- put a "−" / "=" column back into a group of tiles, which the owner removed in the case the lesson came from;
- follow lesson 36's quote to look for a right-edge rule in lesson 35, find none, and not know what was narrowed.

**Exact fix.**

1. In lesson 35, after *"Said of the person window's balance tiles."*, insert:
   `*Narrowed by lesson 36 (D1239): in the balance tiles every figure and label reads from the left, and no "−" or "=" stands between the figures.*`
2. In lesson 36, replace *`Narrows lesson 35's "figures sharing one right edge" for the balance tiles.`* with:
   `*Narrows lesson 35 for the balance tiles: its figures, drawn sharing one right edge (D1238), now read from the left, and the "−" / "=" columns of its reading go.*`

### F2: lesson 32 states one of the agent's readings as if it were the owner's lesson

**What is wrong.** Lesson 32 ends: *"A before / after pair differs in the one thing asked."* This is stated as part of the lesson, with no reading marker.

**What the full row says.** In D1222 this sentence sits under **"The agent's readings:"**: "a before / after pair differs in only the thing asked". It is not in his words, and it is not in the bold rule. Every other lesson in 31–40 marks such an addition with *"(… is the agent's reading, not his words.)"*.

**Consequence.** A later chat, or the owner reading §9, takes that sentence as his own lesson rather than as a reading he may strike (D941: "he may strike or change any"). The difference between his word and the agent's is lost, and D941's check exists to prevent exactly that.

**Exact fix.** Replace *`A before / after pair differs in the one thing asked.`* with:
`*(That a before / after pair differs in only the one thing asked is the agent's reading, not his words.)*`

## Observations (not findings: no wrong action follows)

- **D1240.** The short line still reads as an open instruction ("…tabs design is redrawn with less height…"). In practice the redraw was done: round 19 was put to him and approved by D1254 (N1). The full row is marked as answered by D1243, D1244 and D1245, but D1254 is not named. A one-word "changed by D1254" tail, or archiving D1240 as a spent instruction, would stop a chat from thinking a redraw is still owed. The rule the short line states is still accurate to its full row.
- **D1218.** The short line's tail says "changed by D1224", but D1224 only answers D1218's open reading (carried-forward days used first) and does not change its rule. The tail is harmless: D1224 has its own accurate short line.
- **§8 line (D1237).** It says "every mock-up **or look** page". D1237 says "every mock-up page". This is a slight widening within the same intent (§8 is how a look is reported, and a look is also put to him as a page). I see no wrong action from it.
- **Lesson 39.** It marks "the figures go to the right" as the agent's reading. Since D1253 (his "3c approved" of round 20d, "words left and figures right"), that is now his approved drawing. The marker is overly cautious, not wrong.
