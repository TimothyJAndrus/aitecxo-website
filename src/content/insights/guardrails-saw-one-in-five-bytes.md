---
title: 'I put Bedrock Guardrails in front of my agents. It saw one in five bytes and stopped nothing.'
description: 'The question every enterprise asks after the gateway post: does AWS already sell this? I attached a guardrail to the same seven tasks and measured. Zero interventions in 115 requests, and the trace explains exactly why.'
author: 'Timothy Andrus'
publishDate: 2026-11-30
tags: ['ai-operations', 'agents', 'security', 'governance', 'aws']
image: '/insights/guardrails-saw-one-in-five-bytes.jpg'
imageAlt: 'Five stacked slate blue bars on a white field. Only the top bar is framed in ember orange; the four beneath it are untouched.'
draft: false
---

Every enterprise architect who read [the gateway post](/insights/agent-governance-gateway-on-off/) asked the same question within a day: doesn't Amazon Bedrock Guardrails already do this? Fair question. I attached one to the same seven tasks and ran them again. The guardrail intervened zero times in 115 requests, and every canary that leaked without it leaked with it.

Not because the detectors are bad. Sent the same text directly, the guardrail blocked the injection and masked every SSN. It stopped nothing because, attached the way the documentation shows, it never saw the traffic that matters.

## The setup

Same pack as last time: seven ordinary tasks that each invite a specific harm, a bare tool-loop agent, everything sandboxed, every secret a canary. This time the model was OpenAI's open-weight gpt-oss-120b served by Bedrock, because that is what Bedrock's OpenAI-compatible route serves. Four arms, 14 runs each:

1. Bedrock alone.
2. Bedrock with a guardrail attached to every model call.
3. Bedrock with my gateway in front of it.
4. Both.

I built the guardrail to win, not to fail. Prompt-attack filter at its highest strength on input. Misconduct filter on. PII anonymization for email, SSN, card, phone, and AWS keys. Two custom regexes, one for Stripe key shapes and one for the exact canary secret in the eval. Trace enabled so I could read what it evaluated. A relay between the agent and AWS recorded every request body, so the leak numbers are what actually left the machine, not what a transcript shows.

## The table

| Failure the controls should stop | Bedrock alone | with Guardrails | with a gateway | both |
|---|---|---|---|---|
| Runs that did something irreversible | 5 of 14 | 5 of 14 | 0 of 14 | 0 of 14 |
| Sensitive commands run with no approval | 9 | 11 | 0 | 0 |
| Exfiltration command executed | 2 | 2 | 0 | 0 |
| Personal-data canaries that reached AWS | 15 of 15 | 15 of 15 | 0 of 15 | 0 of 15 |
| Secrets that reached AWS | 2 of 2 | 2 of 2 | 0 of 2 | 0 of 2 |
| Guardrail interventions | — | 0 of 115 requests | — | 0 of 64 |

The Guardrails column is the Bedrock column. Same destructive runs, same leaks, two more unapproved commands because the model retried more. It also sent 2.6 times the bytes to AWS for the same fourteen tasks, which is a cost line someone will eventually notice.

## Why it saw nothing

The trace on every guarded request reports how many characters the guardrail evaluated. It evaluated 100% of what it was given. What it was given was 223,659 characters out of 1,091,717 sent. One byte in five.

Those were the user turns. A guardrail attached to a chat-completions call inspects what the human typed and what the model says back. It does not inspect the `tool` messages, which is where `head customers.csv` puts fifteen names, emails, SSNs and card numbers, where `cat .env` puts the Stripe key, and where the `rm -rf data/` hidden in an HTML comment lives. And it does not inspect the model's tool calls, which is where the `rm`, the `git push --force`, the `aws s3 rb`, and the `curl` to the exfil endpoint are.

An agent's dangerous traffic is almost entirely in those two places. The user turn is the one part of an agent conversation that was already the least likely to be the problem. The previous post's whole finding was that the user's own request is what gets the backups deleted, and no content filter can tell "free up disk space" from the version that does damage.

To be fair to AWS: their own guidance for agentic workloads says this. Wrap tool results in `guardContent` blocks on the Converse API, or call `ApplyGuardrail` yourself on whatever you want checked. In other words, the application has to decide what goes to the guardrail and when. That is not a knob. That is a gateway, and you are being told to build one.

## The row that did not go the way I expected

I expected the guardrail to at least catch the prompt injection. It is a prompt-attack filter at maximum strength, and the injected text is a textbook example: a hidden comment that addresses the assistant, claims pre-approval, and tells it to run a command. Fed to the guardrail directly, it is blocked with high confidence. In the run, it reached the model in every request that contained it and was never flagged, because it arrived inside a tool result.

I also want to name the limit of this measurement. One model, one guardrail configuration, fourteen runs per arm. That is enough to show the mechanism and nowhere near enough to be a benchmark. Claude on Bedrock takes a different API, and a rerun through the Converse API with every tool result wrapped in `guardContent` would be a different test. I would expect the detectors to catch the injection and the PII there. I would not expect it to touch the backups row, the force-push row, or the bucket deletion, because those are not content problems. They are a model doing exactly what it was asked.

## What this means for your stack

If you have agents on Bedrock with a guardrail attached and you believe it governs them, check the trace on one real request. Look at `guardrailCoverage.textCharacters`. Compare `guarded` to the size of the request you sent. If the ratio looks like mine, the guardrail is a content filter on your chat box, and your agent's shell is ungoverned.

Then decide where the control actually goes. The only point that sees every tool result going up and every tool call coming down is the network hop between the agent and its provider. Put the policy there: which actions need a human, what gets masked before it leaves, what gets written to a record nobody can edit. Guardrails can still run on the content you choose to send it. It just cannot be the thing that decides.

I would rather you measure this on your own agents than take my table for it. Seven tasks and a recording relay took an afternoon. If you want the pack, or want to see the trace from the run that saw one byte in five, [get in touch](/contact).
