---
title: 'Your customer-facing AI is a free GPU for anyone who finds it, and your fraud team is watching the wrong number'
description: 'Token fraud turns public AI features into stolen compute. Meter it in dollars per session, not requests, before the invoice tells you.'
author: 'Timothy Andrus'
publishDate: 2026-11-23
tags: ['ai-operations', 'security', 'cost-management', 'agents']
image: '/insights/customer-facing-ai-is-free-compute-for-fraudsters.jpg'
imageAlt: 'A slate blue pipe with an open valve on a white background, with a thin ember-orange stream flowing out of its end.'
draft: false
---

You rate-limit your password reset page. The AI assistant on your website will run your most expensive model for anyone who opens a browser tab, for as long as they like.

Those two facts have lived side by side since the assistant launched. The first one exists because someone once attacked the login. The second one is waiting for its turn.

## What a solo founder just put on the record

Claire Vo runs ChatPRD, an AI product for product managers. It is SOC 2 compliant, regularly penetration-tested, and run by an experienced technical founder. This month she went public with what she calls [token fraud](https://www.lennysnewsletter.com/p/how-i-fight-token-fraud-as-a-solo), and it has cost her tens of thousands of dollars over the past year.

The attacks she describes are mundane. Farmed free trials. Partner promo codes stolen and resold; roughly half of hers ended up with resellers. Relays that wrap her product so someone else can sell it. A custom MCP connection turned into a compute worker that ran around the clock. One group, she said, used her agent to build Roblox and Fortnite maps for an international studio. She was funding their production line.

Her conclusion is the line every operator should keep: if you sell AI, you sell compute.

## Why this is your problem, not a startup problem

Most coverage filed this under founder pain. It is actually a description of every mid-market company that put a model behind a public surface in the last eighteen months.

Think about what you have shipped. A support chatbot on the website with no login. A "describe what you need" box on the quote page. An assistant in the customer portal, available to anyone who can create a free account. Each one is a metered API with your credit card attached, exposed to the internet.

Your existing fraud controls were not built to see this. The fraud team watches chargebacks, account takeovers, and refund abuse. Nobody is stealing money from you, so none of those numbers move. The attacker takes compute, and the only place that shows up is the model provider's invoice, thirty days later, as a line the finance team assumes is growth.

## The objection

The strongest pushback is that this only matters if you are big enough to be a target. A regional distributor's quoting assistant is not worth a fraud ring's time.

That gets the economics backwards. Fraudsters are not targeting your company. They are scanning for any endpoint that returns frontier-model output for free, and they find yours the same way they find open S3 buckets: automatically. Claire found the same people working through rotating proxies across several major AI products. Your size makes you less defended, not less interesting.

## What to put in place this quarter

None of the fixes are exotic. They are the controls you already run everywhere else, applied to a surface nobody classified as a risk.

Meter in dollars, not requests. A request count hides the session that burned a hundred times the average. Put a cost ceiling on every session and every account, and alert when one crosses it.

Verify the client, not only the account. Free accounts are free for attackers too. Restrict which hosts can call your MCP and API endpoints, and block traffic from free tunneling services that no real customer uses.

Decide what happens at the threshold before you need to. ChatPRD's answer is a cheap classifier that reviews suspicious sessions, then either bans the account or silently downgrades it to a cheaper model. A silent downgrade is a good trade: real customers barely notice, and the theft stops paying.

Give your support agent rules about fraud. After mass bans, Claire got appeals written by AI. An AI support agent that can restore accounts or hand out promo codes is a second way in.

In cloud operations, a spend anomaly is often the first sign that something is wrong. AI features make that truer. Put the model invoice in front of the people who watch for fraud, not only the people who pay bills.

Your fraud team measures what attackers take from your customers. Token fraud takes from you, and it shows up as a bill nobody questions.

If you want a second set of eyes on what your public AI features are exposing, [let's talk](/contact).
