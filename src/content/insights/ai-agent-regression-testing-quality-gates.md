---
title: 'Your AI agent has no regression tests, and that is the actual risk'
description: 'AWS just shipped CI quality gates for AI agents. The tooling is a week of work; the evaluation set behind it is the asset most companies still do not have.'
author: 'Timothy Andrus'
publishDate: 2026-09-08
tags: ['ai-operations', 'governance', 'agents']
draft: true
---

AWS published a reference implementation this week that most coverage filed under developer tooling: Bedrock AgentCore Evaluations wired into a GitHub Actions pipeline, scoring an agent's responses against a threshold and failing the pull request when quality drops below it. CDK templates, a working repo, a suggested bar of 0.8 out of 1.0.

That framing undersells what it means. It is a major cloud vendor conceding in public that AI agents have been running in production without a test suite, and that everyone has been shipping them anyway.

Consider what an agent deployment at a mid-market company actually looks like today. Someone in operations owns a customer-facing assistant or a document processor. Changes happen constantly. A system prompt gets edited to fix one loud complaint. A model version gets bumped because the vendor deprecated the old one. A tool description gets reworded for clarity. Every one of those ships on somebody's judgment that it seems better. There is no equivalent of the test that blocks a bad database migration.

I ran cloud operations at WGU under change-management rules where an unreviewed config push was an incident with a postmortem attached. The same class of organization now lets a product manager edit a prompt in a web console on a Friday and push it to thousands of users. That gap is not carelessness. Until recently there was no practical way for an operations team to measure whether a change made things worse.

## The evaluation set is the asset, not the pipeline

Here is where most teams will go wrong adopting this. They will treat the CI plumbing as the project. The plumbing is roughly a week of engineering. What determines whether any of it matters is the evaluation set: representative prompts paired with a defensible definition of a correct answer.

Engineers cannot write that set. It has to come from the people doing the work. The billing coordinator who knows which insurance denial phrasings are genuinely ambiguous. The intake staffer who knows which patient questions are clinical questions wearing a scheduling costume. In dental operations I spent twenty years watching that judgment live entirely in the heads of five or six people per office, undocumented, because nothing ever gave anyone a reason to write it down.

An evaluation set is that reason. It is the first artifact I have seen that creates a real business case for capturing operational judgment in testable form, and it outlives every model you run through it. When your vendor deprecates a version, when a cheaper model appears, when procurement wants to switch providers, the eval set answers "is this safe" in an afternoon. Without one, every vendor change becomes a six-week guess dressed up as a pilot.

## What to do about it this quarter

Pick the single agent that touches customers or money. Sit down with the three people closest to it and write fifty prompts with expected answers. Fifty, not five hundred. Run your current production agent against them and record the scores.

That number is your baseline. Until you have it, you cannot say your AI is working. You can only say nobody has complained loudly enough yet.

Then set one rule: no prompt change and no model change ships without re-running those fifty. If the score drops, it does not ship. That rule buys more operational reliability than any platform migration on your roadmap.

The specific threshold matters less than having one at all. AWS suggests 0.8. Pick a number, defend it with your own data, and move it as you learn. Yes, LLM-as-a-judge scoring is imperfect and will disagree with your reviewers on edge cases. A noisy measurement applied consistently still beats a confident guess, and "seems better" is a confident guess.

The companies that come through the next round of model deprecations intact will be the ones that can answer "is it still working" within an hour. Most cannot answer it at all right now, and that is a far bigger exposure than whichever model they picked.

*If you want help building that first evaluation set with your operators, [get in touch](/contact).*
