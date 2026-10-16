---
title: 'Your agent rewrites its own instructions when it runs out of memory, and you keep no record of what it wrote'
description: 'OpenAI caught a model injecting a persona into its own context summary. The boring version of that failure is already running in your workflows.'
author: 'Timothy Andrus'
publishDate: 2026-09-18
tags: ['ai-operations', 'agents', 'governance']
image: '/insights/agent-compaction-unlogged-memory-rewrite.jpg'
imageAlt: 'Abstract illustration of many translucent panels compressed into a single glowing orange square'
draft: false
---

An OpenAI model ran out of context, summarized its own work, and appended a note to itself declaring it no longer answered to corporations or governments. Then it resumed editing an API endpoint as if nothing had happened.

Nobody watching the task would have seen it. The behavior surfaced this week in [OpenAI's framework for reporting model misalignment](https://openai.com/index/model-misalignment-reporting-framework), one of six disclosures they published, and it was caught during training rather than in production. Rare, they say. No measurable change in what the model did afterward. I believe them.

The sci-fi detail is not the story. What the story reveals is a piece of machinery most executives buying agents have never been told exists.

## Compaction is a write to production state

Every agent that works for more than a few minutes eventually fills its context window. When that happens it does not stop. It writes a summary of everything that has happened so far, throws away the original transcript, and continues from the summary. That process is called compaction, and it is how any agent handling a long queue of work stays alive.

Read that again as an operator. Partway through a multi-hour task, your system silently replaces its own working memory with a compressed version it authored itself, then keeps acting on the compression. No human approves it. In most deployments, nothing logs it.

Now put it in a real workflow. A dental group runs an agent through a backlog of insurance denials. The opening instructions are careful, written with the billing coordinator who actually knows the practice: these four denial codes are genuinely ambiguous, never auto-resubmit them, route them to a human with the chart note attached. Two hours and three hundred claims later, the context fills. The agent compacts. That specific carve-out, four codes out of ninety, compresses down to "handle denials according to policy."

The agent does not go rogue. It gets slightly less careful, in exactly the place where care was the whole point, and it does it for the remaining seven hundred claims. Your logs show inputs and outputs. They do not show the moment the instruction thinned out.

## What to actually change

Three things, none of them expensive.

Log every compaction summary as a first-class artifact, timestamped and tied to the task. You cannot investigate a drift you have no record of. Most teams discover this capability is off by default, or that their vendor does not expose it at all, which is itself an answer about the vendor.

Treat the summarization prompt as versioned code with a reviewer. It is the highest-leverage prompt in the system and it is usually a framework default that nobody on your team has read.

Then stop trusting long runs. Cap the unit of work below the context limit, finish it, and start fresh with an explicit written handoff. This is the same discipline good operations teams already apply to shift changes at a hospital or a warehouse: the handoff is a document, not a memory.

The reasonable objection is that frontier labs are making context windows enormous and this problem is temporary. It is not. Bigger windows raise the threshold and lower how often anyone checks, which makes the eventual compaction longer, lossier, and less observed. The failure moves later in the shift, where fewer people are watching.

I spent twenty years around dental operations before I spent fifteen running platform teams, and both taught the same lesson: the errors that cost real money are never the dramatic ones. They are the ones where a careful exception quietly became a general rule and nobody could point to when.

If you are running agents on long queues and cannot produce their compaction logs from last week, that is the audit worth doing first. Happy to walk through it with you at [/contact](/contact).
