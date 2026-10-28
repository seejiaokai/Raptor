# The fix read — [LW-APPR-PERIOD-LANDING] and the cyan ring (commit c2c246b83)

One fresh, blind Opus reader, 28 Oct 26. **F1 (MEDIUM):** a kept landing could be replayed over a newer jump — on the
Approvals page, a period picked and then a request's dates tapped (or the bell's Leave War line), the grid showing and
jumping in the same press; the listener's replay of the older landing moved the view off the ringed day. Cause: a jump that
ran never cleared the kept one. Fix (applied): any jump that runs clears it. The host's test of the case
("a period picked on Approvals, then a request's dates…") passed before and after — the order the reader traced did not
occur in the test browser — and stays as its guard. **(a)** right for its case: only the Approvals page's hidden grid
measures 0; soft Undo asks there return before the jump; a pre-warm's kept jump is overtaken by the page's own landing.
**(b)** the replay sees real layout; a newer ask in a later commit wins. **(c)** no unit coverage lost (the strip and row
tests stub the scroller's size). **(d)** the landing test is a real guard. The cyan ring is style only.
