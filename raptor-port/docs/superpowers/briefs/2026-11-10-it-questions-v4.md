# Questions for the IT side, 10 Nov 26 (version 4) — drafted by chat 55 for him to send; filed as [IT-QUESTIONS]

Nine questions in plain words, each with why it is asked, after both IT people's replies and his D1971 (three levels of people). No names. Sent by him, not by the agent; record the answers under [IT-QUESTIONS] in `OUTSTANDING.md`.

```
PART A - for the person who builds the tables

Thanks for the answers. A few follow-ups, mostly about who can do what. No rush.

1. Short code
Is "talon" fine as the short code (prefix) for our tables? And if the F-15, F-16 and F-35 each become their own app in the one environment, should each have its own code?
   Why we ask: you said the code is ours to choose, but we were also told the PP CoE sets it. My test account uses "talon" now, and we want the tested table list to drop in without renaming.

2. Unique keys in the kit
Can the kit create unique keys (alternate keys) if we list them in the tables.json?
   Why we ask: we need the database to refuse duplicates, for example a second row for the same week and squadron. We have about 45 tables, so adding keys by hand each time would be slow and easy to get wrong.

3. Two levels of database rights
Can we have two security roles for app users: a "member" role that can only save a member's own records, and an "admin" role that can also save the schedule, the user list and settings? We will write both in the role file.
   Why we ask: the app already has its own member and admin setting. But if everyone holds the same database rights, a member could open the user table directly, outside the app, and change himself to admin. The app cannot stop that. A weaker member role lets the database refuse it.

4. Groups our unit manages
Can each role's team be linked to a security group that our unit owns, so we add and remove people ourselves? And the same for the group that lets a person open the app at all?
   Why we ask: people post in and out often, and admins change. We do not want to send the PP CoE a request each time.

5. The app changing group membership
If our unit owns those groups, may the app itself add or remove a person from a group when our admin changes his role in the app (for example with the Office 365 Groups connector)?
   Why we ask: then one tap in the app changes both the app role and the database rights, and the two never go out of step.

6. The tables view
Can the tables view in make.powerapps.com be closed to everyone except a few named developers, including our app admins?
   Why we ask: a change made there skips the app's rules and does not show in the app's own change history. We know it is not the only way in, but closing it stops casual edits.

7. Developer access
Can a few of us (two or three) hold a role with direct access to the tables?
   Why we ask: to fix a bad record or check a fault without asking the PP CoE each time. Everyone else would go through the app only.

8. The first admin
Who creates the first admin in the empty tables: you, from details we give, or does the app do it on first start from a setting naming one person?
   Why we ask: every later account is made by an admin inside the app, so one admin must exist before anyone can sign in usefully.


PART B - for whoever arranges the role-based account

9. Licence
When our unit requests a role-based account to own the app's scheduled Power Automate flows, does it come with Power Apps Premium like our normal users?
   Why we ask: the flows will read and write the app's Dataverse tables, which counts as premium. If the owner has no premium licence, Microsoft switches the flow off.
```
