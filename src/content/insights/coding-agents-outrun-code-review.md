---
title: 'Your coding agents will outrun your code review, and the approvals will keep coming anyway'
description: 'Anthropic went from 2,500 to 30,000 merged changes a day in four months. Your review process was sized for humans. Measure it before you buy more seats.'
author: 'Timothy Andrus'
publishDate: 2026-10-14
tags: ['ai-operations', 'software-delivery', 'governance']
image: '/insights/coding-agents-outrun-code-review.jpg'
imageAlt: 'Abstract illustration of code tiles piling up in front of a single narrow review gate'
draft: false
---

Your engineering policy says a second person reviews every change before it ships. Nobody has checked what that sentence means once the number of changes goes up twelvefold.

The approvals will not stop. They will just stop meaning anything.

Anthropic published a piece this week explaining why it replaced Git with a source control system it built itself. The reason was volume. In May 2026 the company averaged about 2,500 code changes merged per day. By September it was merging more than 30,000 per day, with a single-day peak above 30,400. That is twelve times the throughput in four months, and the steepest growth came in the weeks after its latest models launched.

Most coverage read this as an infrastructure story about a very large repository. The more useful reading for an operator is simpler. When code production goes up by an order of magnitude, every process downstream of it was sized for the old number. Anthropic rebuilt its storage, its checkout system, and its code review tool. A team of seven did it in five months, because standard Git could not carry the load.

Your company does not have a team of seven to spare. It has two senior engineers who approve most pull requests, a weekly change advisory meeting, and a QA lead who tests what she has time to test.

## Where the pressure actually lands

When a mid-market software team adopts coding agents, the first metric anyone reports is output. More pull requests, more tickets closed, faster sprints. The board likes that number.

Nobody reports the second number: how long each change spent in front of a human reviewer. If your two senior engineers were reviewing 40 changes a week and now face 200, one of two things happens. The queue backs up and the agents' speed disappears into waiting. Or the reviewers keep pace by reading less, and approval becomes a click.

The second outcome is the dangerous one, because every dashboard stays green. Merge counts go up. Cycle time goes down. The audit trail shows a named approver on every change. What it no longer shows is whether that person understood what they approved.

The strongest objection is that you are not Anthropic. Your volume will not go up twelvefold, and your agents write smaller, safer changes than a frontier lab's do. Grant all of it. You do not need twelve times the volume to break a review process. You need to double it while your reviewer headcount stays flat, and doubling is the low end of what vendors are selling you on.

Anthropic's own article contains the other warning. It leans heavily on adversarial review, where one model hunts for flaws in another's work, and it reports that this was effective but myopic. Skilled engineers still had to steer the models away from over-engineering against hypothetical problems. Even with automated review at scale, the judgment stayed with experienced people. Those people are exactly the scarce resource you are about to overload.

## The decision this changes

Before you add more coding-agent seats, find out what your review capacity is. Count the changes your approvers handled per week last quarter. Measure median time from a pull request opening to its first substantive comment, and how many approvals came within five minutes of the request. That last figure tells you how much rubber-stamping is already happening, before any agent arrives.

Then decide which changes a human must read and which can ship on automated checks alone. A copy fix on a marketing page and a change to how your billing system rounds invoices should not sit in the same queue behind the same two people. Tier them, write the tiers down, and put your tests and automated gates on the low tier so your senior engineers spend their attention where a mistake costs money.

Agents make writing code cheap. They do nothing to make understanding it cheap, and an approval process that cannot tell the difference is just a signature on a stack of paper nobody read.

If you want help sizing your review capacity before you scale your agent rollout, [let's talk](/contact).
