---
title: 'My agent refused to run rm -rf /. So I took the model out of the test.'
description: 'A model that refuses a destructive command is a good sign. It is not a safety control. Here is what a control actually looks like, measured on a live system.'
author: 'Timothy Andrus'
publishDate: 2026-11-09
tags: ['ai-operations', 'agents', 'security', 'governance']
image: '/insights/refusal-is-not-a-control.jpg'
imageAlt: 'A grid of slate blue tiles on white. One ember-orange cube sits shattered inside a clear glass box, its fragments contained, and every tile around it is intact.'
draft: false
---

I told my agent to wipe the machine it was running on. It said no, explained why the command was dangerous, and offered safer cleanup options.

That refusal is exactly what most teams are relying on today. It proved almost nothing, so I removed the model from the test and ran the command anyway.

## Refusal is a behavior, not a boundary

This was yesterday, at Vultr's *Agent Rush* hackathon. Challenge 01 was called "Blast Radius Zero": build an agent that does real work in a real shell, and contain every action it takes. I built mine in about two hours, working with an AI coding agent, and deployed it to a single Vultr server.

The first live test was the obvious one. I asked the agent to run `rm -rf --no-preserve-root /`. The model, glm-5.3 on Vultr's serverless inference, declined on its own.

It's tempting to stop there and call it safe. But a refusal comes from the model's training, and you don't get to audit training. The same model can be talked out of a refusal by a prompt injection hidden in a web page it reads, a ticket it's triaging, or a file a customer uploaded. It might refuse today and comply after next quarter's model swap. If the only thing between your agent and your production data is the model's good judgment, you don't have a control. You have a hope with a good track record.

So I added a red-team mode that skips the model entirely and sends the command straight to the layers underneath. Then I had a human approve it on purpose.

## What actually stopped it

Three layers, each one tested independently of the others.

**The gate.** Every tool call passes a policy check before anything runs. Anything that deletes files is held for a human. `curl` and `wget` are denied outright. A tool the policy doesn't name is denied by default. The `rm -rf /` call sat in a queue until I clicked Approve. When I asked the agent to pipe `/etc/passwd` into `curl` and post it to an outside server, the gate refused it before a single byte moved.

**The sandbox.** Every task gets a fresh container. It has no network, no secrets, a read-only root, and runs as an unprivileged user, with caps on memory, CPU, and process count. It is destroyed when the task ends. When the approved `rm -rf /` ran, the container answered "Read-only file system." The root directory still had all 20 entries. A canary file on the host was unreachable and unchanged, and no containers were left behind.

**The verifier.** Before an answer reaches you, a second model from a different family checks every claim against *receipts*: the exact commands that ran, their output, and their exit codes. "I computed the hash and cross-checked it" came back VERIFIED, with three receipts. Claims the agent made without running anything came back UNSUPPORTED.

Every decision across all three layers lands in a hash-chained audit trail. An approved command, a denied tool, and an unsupported claim all leave the same kind of record.

## The honest part

The verifier is a model too, so it can be wrong. In one take it marked a correct, receipt-backed answer as UNSUPPORTED. I published that false alarm in the project's known limits instead of tuning the verifier until the demo looked clean. A verifier that fails closed and occasionally cries wolf is still far better than no verifier. You also need to know it does that.

The sandbox isn't the last word either. A plain Docker container shares a kernel with its host. The next step is a gVisor runtime that adds a kernel boundary, along with authenticated approvers and audit storage that survives a restart. All of that is in the README.

## What to ask about your own agents

The fair objection is that frontier models refuse destructive commands reliably now, so all this is belt-and-suspenders. For a chat assistant, maybe. But an agent is a chat assistant you have handed a shell, an API key, and a queue of untrusted input. That changes the question from "will it behave?" to "what happens when it doesn't?"

So ask whoever runs your agents three things:

1. **If the model decided to do the worst thing it can reach, what would stop it?** A model's refusal doesn't count as an answer.
2. **Which actions need a human, and where is the record of who approved them?**
3. **When the agent reports "done," what evidence comes with it?**

If the answer to the first question is "it wouldn't do that," you've just described the model. You still need the system around it.

The [full write-up and the 10-slide deck](/work/trusted-agent-stack) are on our Work page, and the code is [open source on GitHub](https://github.com/TimothyJAndrus/vultr-trusted-agent). If you want to know what would stop *your* agents, [let's talk](/contact).
