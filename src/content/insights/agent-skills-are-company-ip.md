---
title: 'The most valuable part of your AI agent is a text file, and you probably don''t own it'
description: 'Agent Skills just became a vendor-neutral standard. The model is now the replaceable part. Your procedures are the asset, so own them.'
author: 'Timothy Andrus'
publishDate: 2026-10-26
tags: ['ai-operations', 'agents', 'governance', 'strategy']
image: '/insights/agent-skills-are-company-ip.jpg'
imageAlt: 'A stack of blank white sheets with a small ember-orange tab, resting like a bridge across two slate blue blocks.'
draft: false
---

Your billing coordinator knows which insurance denials are worth a second appeal. Your AI agent is about to learn that from a text file nobody on your leadership team has read.

That file has a name now. The industry calls it a skill: a plain folder of instructions, examples and small scripts that tells an agent how your company does one specific job. On October 22, Anthropic [donated the Agent Skills standard](https://simonwillison.net/2026/Oct/22/donating-agent-skills/) to the Agentic AI Foundation under the Linux Foundation. That's the same body that took over the Model Context Protocol last year, and OpenAI and Block co-founded it.

Most people filed this under developer news. For an operator it means something more practical. How your agents do the work can now move between vendors. The model underneath is becoming the replaceable part. The procedures are the asset.

## The model is the part you can swap

I run a personal agent every day. It works from 139 skill files: how to triage my inbox, how to publish to this website, how to prepare for an interview. When my primary model is unavailable, the agent falls back to a second model from the same lab, then to a different vendor entirely. The skills don't change, so the agent keeps doing the work my way. What I want done lives in files I own, not in whichever model happens to be answering.

Every mid-market company should want that structure, and most are building the opposite. Procedures get typed into a vendor's admin console by whoever set up the pilot. Nobody reviews them. Nobody versions them. When the contract comes up for renewal, the company finds out that switching means rebuilding every process from memory.

A good skill also takes longer to write than it looks, because most of its rules are scar tissue. One of mine says a scheduled job must re-read its own output and confirm a specific line is present before it reports success. That rule exists because a job once told me a post was held for review when the line holding it back was missing entirely. The fix took five minutes. The rule will outlast every model that job ever runs on.

## Who should own the file

The strongest objection is that a standard is a press release. Vendors will still make their own hosted skill store the easy default, the same way plenty of companies adopted the open MCP standard and still wired every tool into one platform. That's fair. Open formats don't prevent lock-in. They turn it into a choice. Until this month you could blame the format. Now your procedures stay in a vendor's console only if you leave them there.

So decide on purpose. None of these decisions is technical.

**The person who does the work writes the first draft.** Not IT, and not the vendor's onboarding team. In dental operations, the knowledge that matters most is rarely in the policy manual. It sits with the front-desk lead who has worked the same insurers for a decade and knows which denials are genuinely ambiguous. Skills are how that judgment stops walking out the door with one person.

**Changes get reviewed like changes to a price list.** A skill is policy that executes. If someone edits how the agent handles refunds, the manager who owns refunds should see the change before it ships, and the record of who changed what should outlive both of them.

**The files live in your repository.** Every skill sits in version control you control, in the open format, with its full history. If your vendor can't load skills from there, raise it at this renewal, not the next one.

You'll change models more often than you change billing coordinators. Models are rented. Your procedures are the only part of your AI you can actually own.

If you want help pulling your agents' procedures out of a vendor console and into something your team owns, [let's talk](/contact).
