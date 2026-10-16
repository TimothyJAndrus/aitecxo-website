---
title: 'The smartest model in your bake-off can lose the moment the clock keeps running'
description: 'A stronger model beat a faster one on paused tasks and lost when the clock kept running. Your model bake-off probably stopped the clock.'
author: 'Timothy Andrus'
publishDate: 2026-10-16
tags: ['ai-operations', 'evaluation', 'agents', 'strategy']
draft: true
---

Your team picked its AI model by giving each candidate the same questions and grading the answers. Nobody graded how long the answers took, because the test stood still while the models thought.

Your customers do not stand still. The patient on hold hangs up. The fraudulent transaction clears. The truck leaves the dock with the wrong pallet.

A paper published this week puts a number on that gap. Researchers built [RealtimeBench](https://arxiv.org/abs/2610.20665), 180 tasks across six game types, and ran each one two ways: paused while the agent thought, and running live. GPT-6.1 Sol, the stronger reasoning model, beat the faster model Jev when the games were paused. When the games kept running, it fell behind.

Same tasks, same models, opposite winner. The only thing that changed was whether the world waited.

## Latency is a correctness property

Most mid-market AI evaluations I see treat speed as a cost line. Is it fast enough, is it cheap enough, and then separately, is it right. That split works for back-office work. A model that takes forty seconds to classify an invoice is fine, because nobody is standing at the invoice.

It breaks for anything with a person or a process waiting on the other end. A voice agent answering the front desk at a dental practice has maybe two seconds before silence starts to sound like a dropped call. A correct answer about insurance eligibility that arrives after the caller has said "hello?" twice is a wrong answer. The caller has already decided you're the office that never picks up.

I spent twenty years around dental operations. The front desk is the business. A smarter but slower tool there doesn't cost you a little accuracy. It costs you the new-patient call.

The strongest objection is simple: buy the fast model for live work and the smart one for everything else. That's partly right. But the paper also shows the fast model on its own is weak. Jev averaged 13.51 out of 100. Speed alone doesn't win either.

## Let the slow model teach the fast one

What makes this paper useful rather than just alarming is the fix. The researchers had the slow model study the fast model's failures between attempts, with the game paused, test corrections, and write reusable instructions. The fast model then played live with those instructions and made no calls to the slow model during play. An update was kept only if it improved validation scores.

Two rounds took Jev from 13.51 to 24.19. The same instructions improved three other models without retuning.

Translate that into an operating design. Your expensive reasoning model doesn't belong on the live call. It belongs in the overnight review, reading yesterday's transcripts where the fast agent stalled, misrouted, or gave up, then rewriting the playbook the fast agent runs tomorrow. You get deliberation where time is cheap and speed where it isn't. And because a change is adopted only when it beats a validation set, you have a gate instead of a hope.

One caveat, stated plainly: these are games, not phone queues. I wouldn't quote 24.19 to anyone's board. What transfers is the shape of the result. A ranking taken with the clock stopped can invert when the clock runs.

If you're choosing a model for a customer-facing or time-bound workflow, run the bake-off with the clock on. Replay real calls or real event streams at real speed and score the outcome, not the answer. Count "right action, too late" as its own failure category, because today it is probably hiding inside your success rate.

Then split the work by timescale: fast model in the live path, slow model in the improvement loop, a validation set between them.

Your vendor's leaderboard was measured in a world that waits for the answer. Your business isn't one.

If you're deciding which model goes into a live workflow and want a second set of eyes on how you're testing it, [I'm glad to help](/contact).
