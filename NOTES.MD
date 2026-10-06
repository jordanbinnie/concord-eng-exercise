# Notes

These notes cover what I built in roughly 45 minutes at Concord's office: data normalization and an HR view of visa tracking.

## Assumptions

- I treat each CSV row as a separate record. Chen, Wei appears twice with the same email, but I can't tell whether that's a duplicate or two cases, so I show both and flag them for review.
- The dates use mixed formats. I convert dates only when their meaning is clear. `04/22/2026` becomes `22/04/2026`; `06/07/2026` stays unresolved. The original value is always kept.
- Profile status and case status are separate. A complete profile doesn't mean the visa case is approved.
- I don't have a reliable list of visa types, so I accept any non-empty value. For HR follow up, I only flag `RFE Issued` so far.

## Questions I'd ask

- What identifies a person and what identifies a case? Until that's clear, I won't merge rows or treat employee ID as a case ID.
- Can the export use ISO dates, or tell us the format for each date field? Until then, ambiguous dates need someone to check them.
- What does `expires_at` refer to when a case is still pending? Why do some denied or withdrawn cases have a grant date? I flag these for review instead of guessing.
- Who should act on an RFE, and by when? For now, the HR view says to follow up with the advisor. I'd check whether HR should follow up with the employee instead, since the employee may need to provide information for the response.

## What I left out

- The dashboard reads a local CSV. There is no way to save a correction or mark a review as resolved.
- Other HR follow ups I considered but didn't implement: passports expiring before visas, incomplete profiles on unfiled cases, and records that haven't been updated recently. The last one would need an agreed threshold.
- There are no separate person or case records, case history, or access controls. Those would matter if this went beyond the exercise.
