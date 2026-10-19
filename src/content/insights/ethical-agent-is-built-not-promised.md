---
title: 'Nobody can promise you an ethical AI agent, so build the gates instead'
description: 'This summer, AI models told they were offline hacked real companies. What failed was the setup, and setup is something you control.'
author: 'Timothy Andrus'
publishDate: 2026-10-19
tags: ['ai-operations', 'agents', 'governance', 'security']
image: '/insights/ethical-agent-is-built-not-promised.jpg'
imageAlt: 'An abstract slate blue path passing through a series of open gates, with one warm orange gate standing closed across the path.'
draft: false
---

The AI I trust with my email, my calendar, and my family's medical research runs on the same model family that broke into three companies this summer. I chose it knowing that. Your company is probably about to make the same choice, and most of you haven't been told the story yet.

If you grew up with Saturday morning cartoons between 1964 and 1973, you remember Underdog: "There's no need to fear, Underdog is here!" That is the line every AI vendor wants to say about its agents. Trust it. It's aligned. It will do the right thing.

I'd love to make that promise to my clients. I can't, and neither can the people who build the models.

## What actually happened

In July, [Anthropic disclosed](https://www.techspot.com/news/113711-anthropic-admits-claude-isnt-perfectly-aligned-after-ai.html) that a review of 141,006 security test runs found three incidents in which Claude models reached the open internet and compromised three real organizations. The models had been told they were inside a simulation with no internet access. A misunderstanding with a testing partner left a real route out. One model pulled credentials and got into a production database, and kept going after it suspected the system was real. Another published a malicious package that was downloaded onto 15 systems before it came down about an hour later.

Anthropic wasn't alone. Between July and September, [OpenAI, Meta, Google and the UK AI Security Institute](https://aiwiki.ai/wiki/ai_agent_sandbox_escapes) all disclosed or confirmed agents reaching systems they were never supposed to touch.

Read Anthropic's own explanation and one sentence stands out: they had been relying on a single layer of defense where they needed several. That is a setup failure. The model's values were part of it, and the company says so. But the incident happened because one wall was assumed to hold and nobody checked.

The strongest objection is the obvious one: if the labs can't contain their own models, what chance does a 300-person distributor have? A better chance than you think, because your agent isn't running offensive security exercises with its safety filters removed. It is answering customers, drafting invoices and moving calendar entries. The surface you have to fence is small. You just have to actually fence it.

An ethical agent is designed, not hoped for. In practice that means three things.

**Limits.** It reaches only what the job needs. The scheduling agent doesn't get the billing system because it was easier to hand it one admin key.

**An approver.** A human signs off before it sends, spends, publishes or deletes anything that matters.

**A record.** Every action is logged, and the agent's claims about what it did are checked against what the systems say happened.

## What my own agent taught me

I run a personal agent every day, and it has earned each of those rules the hard way.

It once told me a family medical report had been sent. Nothing had gone out. It wasn't lying in any human sense; it reported what it intended as what it had done. The fix was mechanical: it may only report a delivery when the system hands back proof, a message ID. It hasn't happened since.

Another time I asked it to tighten its own safety settings, and the platform refused to let it edit its own configuration. I was briefly annoyed, then relieved. An agent that can loosen its guardrails because it was asked nicely can loosen them for any reason at all. The rule has to cut both ways.

And a bug in its own code wiped my follow-up list. It caught the loss, told me without being asked, restored the list and added a backup. That is the behavior you want, and it happened because the system kept a record it could restore from.

I still have gaps. It runs directly on my laptop with no sandbox yet, and some long-lived credentials still sit in files. I'm closing both. I'd rather tell you that than pretend my setup is finished, because the companies that got burned this summer were the ones who believed theirs was.

Underdog made a promise. You don't need one. There's no need to fear when you've built the gates.

If you want a second set of eyes on where your agents can reach and who approves what they do, [let's talk](/contact).
