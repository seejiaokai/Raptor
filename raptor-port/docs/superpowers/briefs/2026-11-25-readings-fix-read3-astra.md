**Astra’s round-three read: one must-fix remains.**

**Must-fix — answering one question silently closes others.** I reproduced two open interpretations beside one ruling: whether “planned” includes ground rows, and whether the reminder also reaches admins. Adding an answer about flying seats and sims made **both** disappear, including the admin question still marked “not asked”. The complete checker returned no failure and no open questions.

The cause is the answer matching: a later answer or narrowing on the same ruling closes every earlier reading there, without identifying which question it answers. An unrelated narrowing produces the same failure. This could again leave reviewers treating an unasked interpretation as settled.

**Fix:** link each answer explicitly to the individual reading it resolves. Leave every other reading open; neither sharing a ruling nor having an earlier date establishes an answer. Add regression cases for two readings with only one answered, and an unrelated later narrowing.

The requested wording checks pass. Marking a question “asked” when presented, requiring the actual answering ruling, and saying “never left **only** in a comment” preserve the intended meaning. The lesson’s historical account is unchanged. I found no unnecessary addition in the two increased size allowances.

Older answers have an honest, cheap route through: record the historical question and its actual answer beside the original ruling, then cite that answer. I verified this with the already-settled SANS question. It needs no fresh decision or repeat question.

**Left as is:** explain that historical-answer procedure in the standing instructions; currently the builder’s report supplies the explanation.

**Checks and limits:** all 25 existing tests that run without writing files passed. Independent cases confirmed the wrapping, comment-reading, citation, listing and moved-line fixes. The live readings check passed against the requested base in about three seconds. Nine temporary-repository tests were not run because access is read-only; integration probes used in-memory substitutes.

No other round-three report opened. No files changed, committed or pushed.

Walk: not required by the approved plan.  
Rulings: none this session.

