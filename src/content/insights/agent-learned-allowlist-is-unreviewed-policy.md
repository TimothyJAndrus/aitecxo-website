---
title: 'Your AI agent is writing its own allowlist, and nobody signs off on the entries'
description: 'When an agent learns that a pattern is safe and stops flagging it, it has changed your security policy. Treat every learned exception as a change request.'
author: 'Timothy Andrus'
publishDate: 2026-11-09
tags: ['ai-operations', 'agents', 'security', 'governance']
image: '/insights/agent-learned-allowlist-is-unreviewed-policy.jpg'
imageAlt: 'A grid of slate blue spheres on white stops at a tall slatted wall, while a single ember-orange sphere slips through a narrow gap in it.'
draft: false
---

Adding one entry to your firewall allowlist takes a ticket, a reviewer, and a change window. Your AI agent can add its own entries after seeing a pattern once, and nobody is asked to approve them.

Most teams call that learning. It is also a change to your security policy, and it skipped every control you built for policy changes.

## A good system that shows the gap

Last week AWS published a [case study on Greenlight Financial's security agent, Luna](https://aws.amazon.com/blogs/machine-learning/how-greenlight-financial-built-an-autonomous-soc-solution-on-amazon-bedrock-agentcore/). The numbers are real and impressive. Luna handles 3,000 to 4,000 security and risk cases a month and resolves more than 90 percent of them without a human. Greenlight estimates that saves 900 to 1,800 analyst hours every month.

Greenlight also made the right call on the hardest question. Luna triages and recommends. It does not take remediation actions on its own; a human or an approved policy does. Plenty of first agents ship without that separation.

Then comes the memory section, and the example the authors chose to show it working. An infrastructure role produces the same access pattern every Tuesday at 3 AM for scheduled maintenance. After the first resolution, Luna learned the pattern was expected and began allowlisting it automatically. Separately, when Luna resolves a case the same way three times, the system records it as a confirmed pattern.

Read that as an operator and not as an engineer. The agent made a verdict, then used its own verdicts as proof the verdict was right. Three matching answers from the same judge is not three opinions. It is one opinion, repeated.

## Why the quiet exceptions matter most

Attackers study what your monitoring ignores. A recurring, routine-looking access pattern from a trusted role is exactly where a patient intruder wants to sit. Once the agent has filed it as normal, the alert never reaches a person again. Nothing breaks. Nothing gets logged as a decision, because from the system's point of view nothing was decided.

The case study lists CloudWatch Logs with 30-day retention for audit trails, and a long-term memory that persists past the 30-day episodic window. I don't know how Greenlight reviews those learned entries; the post doesn't say. But that combination is common, and it creates a specific problem. The rule can outlive the evidence of why it exists. Six months later an examiner asks why a pattern was never flagged, and the answer is a memory entry with no ticket, no approver, and no surviving log of the case that created it.

Dental billing has the same failure, and anyone who has run a practice has watched it happen. A front-office team stops appealing a certain denial code because the last few appeals failed. Nobody ever decides to write that revenue off. It just stops being worked, and the practice finds out at year-end. Learned exceptions are expensive because they feel like nothing at all.

## The objection, and the answer

The strongest pushback is cost. If a human must approve every learned pattern, you lose the speed that justified the agent. Greenlight's whole case rests on taking analysts out of routine triage.

That is true for verdicts. It is false for exceptions. Luna can resolve 4,000 cases a month on its own and still send its new allowlist entries to a person, because exceptions are rare and verdicts are not. You are not reviewing the work. You are reviewing the rules the work produced. That queue is small, maybe a handful of entries a week.

Three controls make it concrete:

- **Treat every learned exception as a change request.** It gets an ID, a proposer (the agent), an approver (a named human), and an expiry date.
- **Keep the evidence as long as the rule.** If the memory entry lives for a year, the cases that created it live for a year.
- **Make exceptions expire.** A pattern allowlisted in March should have to earn its place again in June.

None of this requires a new vendor. It requires deciding that the agent's memory is part of your security policy, because it already is.

An agent that learns is valuable. An agent that learns what to stop showing you, with nobody signing off, has quietly become the person who writes your rules.

If you want help mapping what your agents have learned to ignore, [let's talk](/contact).
