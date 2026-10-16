---
title: 'Your AI agent passed the pilot once, and that tells you almost nothing about Tuesday'
description: 'New benchmark data shows agents that look capable in a demo fail quietly on repeat runs. Grade the records they leave, and grade them twenty times.'
author: 'Timothy Andrus'
publishDate: 2026-10-09
tags: ['ai-operations', 'agents', 'evaluation']
image: '/insights/ai-agent-success-rate-hides-consistency.jpg'
imageAlt: 'Abstract illustration of many parallel paths toward a target, with one stray path highlighted in orange'
draft: false
---

Your AI pilot was approved on a demo that worked. Nobody asked whether it would work the same way the next nineteen times.

That is the number that should have decided it. Most pilot reviews never put it on the table.

Microsoft and Hugging Face published a benchmark last week, ThinkingBox, that grades agents the way an operator would: by checking the records they leave behind in the database, not by reading what they said. They ran 507 business workflows across retail, auto insurance, travel, banking, and consulting. Every task ran 20 separate times from an identical clean start.

Their lead example is a customer whose $745 appliance has been stuck in a carrier exception for fifteen days. The agent makes nine sensible tool calls, reads the refund policy correctly, opens a ticket, documents the timeline. Then it marks the ticket resolved. The carrier exception was still open, so the ticket should have gone on hold. The customer never got an answer to her question. Every tool call looked correct, and the record in the system was wrong.

## The failures you will not see

The part that should worry you: of the attempts that failed, 67% ended cleanly. The agent called a tool that changed data, reported no error, and finished. Inside those quiet failures, the checks found wrong field values 78% of the time and unintended extra changes 43% of the time.

So the agent does not crash. It gives no sign that anything went wrong, and the bad record just sits in your system of record.

Anyone who has run dental billing knows this failure shape. A claim marked "sent" in the practice software and a claim the payer actually received are two different facts, and the gap between them is where the receivables go to die. An agent's own report of what it did is the "sent" flag. The database is the payer.

## Breadth is not dependability

The second finding changes how you should pick a model. One open-weight model, Kimi-K3, solved 93.89% of the tasks at least once, the broadest coverage in the field. It completed only 13.41% of them correctly on all 20 attempts. Claude Opus 5 solved fewer tasks at least once but got 47.53% right every single time.

Newer did not mean more reliable, either. Claude Opus 5.5 edged out Opus 5 on average accuracy and passed exactly the same number of tasks on all 20 runs: 241. If you upgraded for that half-point, you bought nothing in dependability.

A pilot with one good run measures the first number. Your operations run on the second.

The fair objection is that humans are inconsistent too. A new claims processor gets the edge cases wrong for months, and nobody demands twenty perfect repetitions before letting them work. True. But a human who gets it wrong usually leaves evidence of doubt: a note, a question to a supervisor, a ticket left open. The agent in that example closed the ticket and moved on with full confidence. Human error is usually visible. These agent errors are mostly invisible, and for a system touching customer records or money, invisible errors are the more expensive kind.

You can see the right posture in OpenAI's Sophos case study this week. Sophos reports agents resolving 52% of its managed detection cases end to end, average response down from about 38 minutes to 89 seconds. The useful detail is that the same three authority tiers (notify, collaborate, authorize) apply whether a person or an agent does the work, and anything the team is not confident an agent handles consistently goes to a human. That is a reliability boundary drawn by people who measured it.

## What to change in your next pilot review

Ask for three numbers instead of one. How often it succeeds on average. How many tasks it can do at least once. How many it does correctly every time across repeated runs. Make the vendor or your internal team produce the third, because it is the one that tells you what to automate.

Grade outcomes, not transcripts. Pick twenty real cases, define the correct end state of every record each one touches, and check the database after each run. Ticket status, refund amount, appointment slot, claim code.

Then let the consistency number set the authority level. Tasks the agent completes correctly every time can be automated outright. Tasks it gets right most of the time get a human approval step. Tasks it solves only sometimes stay as suggestions.

An agent that can do the job is a demo. An agent that does it the same way every time is something you can put into operations.

*If you want help designing a pilot review that measures the second kind, [let's talk](/contact).*
