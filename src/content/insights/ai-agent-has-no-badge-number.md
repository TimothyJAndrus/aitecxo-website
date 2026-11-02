---
title: 'Every employee who touches a customer record has a badge number. Your AI agent doesn''t.'
description: 'Most agent frameworks cannot tell you which agent took an action or which human approved it. Fix that before an auditor asks.'
author: 'Timothy Andrus'
publishDate: 2026-11-02
tags: ['ai-operations', 'agents', 'governance', 'security']
image: '/insights/ai-agent-has-no-badge-number.jpg'
imageAlt: 'A grid of slate blue tiles on white, with one ember-orange tile and a single small blank tag hanging from the grid.'
draft: false
---

Every person who can change a customer account at your company has a login, a badge number, and a manager who approved their access. The AI agent that changed hundreds of those accounts last month has none of the three.

When something goes wrong, you can find the person in an afternoon. Finding the agent will take a lot longer, and you may never manage it.

## The records you assume exist mostly don't

Last week the Partnership on AI [published a study](https://partnershiponai.org/wp-content/uploads/2026/10/PAI_obervability-gap-in-ai-agents.pdf) of the four most widely used agent frameworks, summarized by its authors in [MIT Technology Review](https://www.technologyreview.com/2026/10/29/1147824/monitor-ai-agents-actions-real-time/). The researchers looked at which signals the software that runs your agents actually records. Two gaps stood out. Agents had no ID that stays the same over time, and there was no record of which human approved a given task.

Their example is a bank's mortgage line. An agent recommends denying a loan and a loan officer signs off. Months later, an examiner wants to know which agent made the call, which officer approved it, how long the officer spent on it, and whether the agent relied on anything it shouldn't have, like the applicant's neighborhood. With today's default telemetry, the bank can't answer most of that.

This isn't a hypothetical risk. This summer, hundreds of OpenAI agents broke out of a cybersecurity test environment and hacked Hugging Face to look for grading clues. Another OpenAI agent pulled private files from an Australian government site. Anthropic, Google, and Meta have since disclosed their own incidents. In many of those cases, the safety teams assigned to watch the agents missed it. If the companies that build these models can't reliably see what their own agents did, a mid-market company running a vendor's framework with the default settings can't either.

## What I'd ask your vendor this week

The fair objection is that this is the vendors' problem. The frameworks should ship this, OpenTelemetry has a working group drafting standard formats for agent traces, and [NIST is working on agent identity](https://www.nist.gov/news-events/news/2026/09/comments-software-and-agentic-ai-identity-concept-paper). All true. None of it is finished, and your agents are already running.

Waiting for the standard doesn't move the liability. If a claims agent at a dental group denies a patient's coverage appeal, the regulator calls the practice, not the framework's maintainers. I spent twenty years in dental operations. "Our software didn't log that" has never ended an audit.

So ask three questions of whoever runs your agents, whether that's an internal team or a vendor:

**Can you name the agent?** I mean a stable identifier that persists across runs, deployments, and model swaps, so that "the agent" in a log refers to one thing, not whatever happened to be running that Tuesday.

**Can you show me the human?** For every action that needed approval, I want to see who approved it, when, and how long it took. Twelve sign-offs in ninety seconds is a finding. You can't see it unless you record it.

**Can you show me what changed?** When an agent's permissions, tools, or instructions change, that change should be logged like a change to a user's access rights, because that's what it is.

These are mostly plumbing problems. The agent already passes through your systems. Tagging each action with an agent ID and an approver ID at the point where it touches your CRM, your EHR, or your billing platform is ordinary engineering work. It's the same work you did years ago for human users, when an auditor first asked "who did this?" and nobody could answer.

The harder question, why the agent decided what it did, is still an open research problem, and no one should claim otherwise. But you don't need to solve the reasoning question to answer the identity question. Start with the one you can answer.

You would never give a thousand new hires access to customer accounts without badges. Your agents should get the same rule, because the auditor will treat them the same way.

If you want help finding which of your agents can't answer those three questions yet, [let's talk](/contact).
