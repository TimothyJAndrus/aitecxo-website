---
title: 'Your fraud rules were built to stop software, and your customers just started sending software to buy'
description: 'Agent payments are live. The bot blocks and fraud rules that protect your checkout will decline real buyers, and your dashboard will count it as a win.'
author: 'Timothy Andrus'
publishDate: 2026-11-16
tags: ['ai-operations', 'agents', 'strategy', 'security']
image: '/insights/fraud-rules-decline-agent-customers.jpg'
imageAlt: 'A long, uniform row of tall slate blue panels on white, with one small ember-orange sphere stopped at the base of a single panel.'
draft: false
---

You spent years training your checkout to reject anything that behaves like software. Your customers have now started sending software to buy from you.

Your bot-protection dashboard has a number on it that your team reports as a win: requests blocked, sessions challenged, transactions declined for risk. Some part of that number is about to be paying customers. Nothing in the dashboard will tell you which part.

## What changed

On November 13, OpenAI launched [ChatGPT Wallet](https://openai.com/index/introducing-chatgpt-wallet/), built with American Express, Mastercard and Visa. An agent finds the product and fills the cart. The user approves the total with Face ID or a fingerprint, and the network issues a payment token so the agent never sees the real card. The design is careful. Every purchase still has a human approval and a record of what was authorized.

The launch post says the quiet part plainly. Some sites "may unintentionally block purchases," and risk systems "may still flag legitimate purchases made by agents, leading to declines or cancellations." OpenAI shipped a [Commerce Partner Playbook](https://developers.openai.com/commerce) alongside it and named the fraud vendors it is working with: Forter, Riskified, Sardine and Signifyd, plus Adyen, Checkout.com and Stripe on payments.

When a vendor publishes a playbook on day one telling merchants how to stop rejecting its customers, it already knows how often it is happening.

## Where the decline actually happens

Think about how a mid-market checkout gets protected. Someone turned on the CDN's bot mode after a credential-stuffing attack in 2023. The fraud team added a velocity rule after a run of gift card abuse. A developer added a headless-browser check because scrapers were hammering the pricing pages. Each rule was correct when it went in. Nobody wrote them down in one place, and nobody owns them as a set.

An agent buying on a customer's behalf trips all three. It arrives from a cloud IP range. It moves through the cart faster than any person. It renders the page in a browser that looks automated, because it is. Your stack was built to treat that profile as an attack, and it will.

The customer sees "something went wrong" in their agent's reply and buys from the competitor whose site worked. You get no abandoned-cart email, because the cart never existed for you. Your fraud report shows one more stopped bot.

## The objection, and why it doesn't hold

The strongest counterargument is volume. ChatGPT Wallet is limited to US Pro subscribers at launch. Agent purchases are a rounding error in your revenue this quarter, and loosening fraud controls for a rounding error is a bad trade.

That's correct, and it's also why now is the cheap time to act. You don't need to loosen anything. The playbook's first technical step is configuring your CDN or firewall to recognize signed agent requests through Web Bot Auth. That swaps "looks automated, block it" for "this is a verified agent, apply normal fraud scoring." That's a tighter control, not a looser one. The expensive version of this work comes later, when agent volume is real and you're debugging declines from a revenue dip with no logs that separate agents from attackers.

OpenAI also says users will eventually pre-approve purchases inside spending limits and categories, with no tap for each order. When that ships, the human approval on every purchase goes away and your risk rules become the main check.

## What to do this quarter

Give the problem one owner. Right now it sits between the ecommerce lead, the fraud team and whoever manages the CDN, which means nobody has it.

Ask that owner for three things. First, an inventory of every rule that blocks or challenges automated traffic, with who added it and why. Second, a question to your fraud vendor and payment processor: how do you identify agent transactions today, and can you report them separately? Third, one test purchase made through an agent against your own checkout, with the result written down.

That last one takes an afternoon. Most companies that run it will find out their own storefront turns away the customers they'll most want in two years.

If you want help running that inventory or reading what your fraud stack is actually declining, [let's talk](/contact).
