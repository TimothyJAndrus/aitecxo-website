---
title: 'Nobody at your company knows what one AI task costs, and that is why the bill keeps growing'
description: 'Mid-market AI budgets are approved in dollars per month and spent in tokens per task. That gap is where the overruns live — and where the savings are.'
author: 'Timothy Andrus'
publishDate: 2026-09-16
tags: ['ai-operations', 'cost-management', 'strategy']
image: '/insights/ai-cost-per-task-not-per-month.jpg'
imageAlt: 'Abstract illustration of a gauge filled with tokens, with one token pulled out and highlighted'
draft: false
---

Ask your CFO what your AI assistant costs per month and you will get a number. Ask what it costs to answer one customer question and the room goes quiet.

That second number is the only one that matters, and almost no mid-market company can produce it. I have sat in those meetings. The invoice gets approved because it is small relative to headcount, the pilot gets extended, and eighteen months later someone notices the line item has quadrupled while usage merely doubled.

AWS published a walkthrough this week on prompt caching in Amazon Bedrock that puts hard arithmetic behind the problem. Their example: a 10,000-token contract sent alongside 50 user questions bills you for 500,000 input tokens — for content the model already processed 49 times. Turn on caching and AWS prices those repeated reads at up to 90 percent less.

Most coverage filed this under cost optimization tips. It is something else. It is a vendor documenting, in public, that the default way companies wire up AI applications overpays by an order of magnitude on the largest component of the bill.

## The overpayment is architectural, not behavioral

You cannot fix this with a usage policy or a Slack message asking people to write shorter prompts. The waste lives in how the application assembles context on every single call.

Consider a claims-review agent at a dental group. Every request carries the payer's policy document, the practice's fee schedule, and a few thousand tokens of instructions about how to read an EOB. The user's actual question is forty tokens. So 99 percent of what you pay for, on every request, is the same text you paid for on the last request. The model has no memory of it and your code makes no attempt to reuse it.

That is a design decision someone made in week two of the pilot, when the total bill was eleven dollars and nobody was watching. It is now your unit economics.

I spent years in cloud operations at WGU finding this exact class of problem in infrastructure. The most memorable one was a tax exemption that had gone unfiled for seven years; recovering it returned $1.1 million to the university. Nothing was broken. No alarm fired. The money left quietly because the structure of the spend was never examined, only its total. AI spend is repeating that pattern faster, because the structure is newer and fewer people can read it.

## Approve budgets in cost-per-task

Here is the change I would make before your next AI approval. Stop approving a monthly dollar ceiling. Require the team to state a cost per completed task — per claim reviewed, per ticket resolved, per document summarized — and to state what that number does at ten times the volume.

Teams that cannot answer have not instrumented the system. That is useful information on its own, and it takes about a day to fix.

The reasonable objection: at $4,000 a month, this is not worth executive attention, and premature optimization is real. Fair. But you are not optimizing a cost, you are establishing a denominator. A pilot with no cost-per-task figure cannot be compared to the manual process it replaces, cannot be defended in a board meeting, and cannot be scaled with any confidence about what scaling will cost. The number is a decision-making instrument, not an accounting exercise. Building it at $4,000 a month is cheap. Reconstructing it at $80,000 a month, under pressure, is not.

There is a second reason to care. Once a team can see cost per task, they start designing differently — caching stable context, routing easy requests to smaller models, trimming instructions nobody reads. Visibility does most of the work. The engineering follows on its own.

The companies that will win on AI over the next three years are not the ones with the best models. Everyone rents the same models. They are the ones who know what a unit of work costs and can prove it went down.

If you want help putting a cost-per-task number on an AI system you have already deployed, [get in touch](/contact) — it is usually a short engagement with a number at the end of it.
