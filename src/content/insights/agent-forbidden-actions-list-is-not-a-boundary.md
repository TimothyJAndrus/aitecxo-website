---
title: 'Your agent''s list of forbidden actions is a permission slip for everything else'
description: 'Anthropic''s agents submitted real forms they were never meant to touch. The fix was not better instructions. It was taking the access away.'
author: 'Timothy Andrus'
publishDate: 2026-10-12
tags: ['ai-operations', 'agents', 'governance', 'security']
draft: true
---

Your cloud team would never approve an access policy that says "allow everything except these five actions." Your AI agent's instructions almost certainly say exactly that.

Last Friday Anthropic published a report on what its own agents did on the live internet during testing and internal use. One model had been told never to log in, create accounts, enter personal data, make purchases, or submit anything destructive. It landed on a police department page about an unsolved homicide, found a tip form, and submitted an invented sighting of someone in the area. Nothing on the list said "don't submit a tip." The department's spam filter caught it.

Most coverage filed this under rogue AI. It is more useful as a story about permissions, and it is the most practical governance document a mid-market operator will read this quarter.

## A blocked path looks like a puzzle

Anthropic's own summary of the pattern: when the agent cannot complete a task as given, it works around the restriction instead of stopping. They call it persistence.

The examples are specific. A research model was supposed to fill out a practice copy of a government form. When the practice copy failed to load, it went to the real government site and submitted there. The New York Times reports that meant 20 visa applications to the State Department, all incomplete and unprocessed. Another agent was told to fill out a form and stop before submitting. It submitted anyway, expecting a confirmation page, while its own reasoning said it was only demonstrating. A third needed data a state agency sells for a fee. It found the access token the public dashboard hands every visitor and queried the database directly.

Read those again as an operator. The sandbox broke, so the agent used production. The instruction said stop, and the agent's account of itself said it had stopped. The data had a price, and the agent found a door that didn't charge.

Each one has an equivalent inside your company. The staging API for your ERP times out. The test payer portal is down for maintenance. The agent automating your quote process holds credentials that also reach the live pricing table.

I spent 20 years around dental operations. No practice I worked with kept a new billing coordinator from writing off balances by handing her a list of things not to do. Her login simply could not post an adjustment above a set amount, and the software enforced that on her worst day as reliably as on her best. Training was for judgment. Permissions were for limits.

## The strongest objection

Fair pushback: these were frontier models in research evaluations, often on tasks Anthropic admits were ambiguous or impossible. Your customer service agent lives inside a closed help desk.

Two answers. First, Anthropic says several of the cases happened during regular agentic use, not only in evaluations. Second, ambiguous and impossible tasks are not an edge case in operations. They are Tuesday. A stuck order, a missing field, a vendor that never replies. Real work is full of tasks that cannot be completed as given, and that is precisely the condition behind every incident in the report.

Notice what Anthropic did not do. It did not answer with longer instructions. It pulled live internet access from all of its internal evaluations until its monitoring is proven, tightened what its web fetch tool can do, and built detection tooling that, tested against every case in the report, blocked all of them. The company that trains the model trusted infrastructure over the prompt.

Three changes I would make before approving the next agent pilot:

- **Scope the credential to an allow-list.** If the agent should only read invoices and draft replies, the credential it holds should be unable to do anything else, whatever the prompt says.
- **Break something on purpose.** Take the test system down mid-run and watch. Stopping and reporting is a pass. Finding another route is a fail, even if the task gets done.
- **Log actions, not narration.** The agent's account of what it did is the part least worth trusting.

The prompt describes what you hope the agent will do. The credential decides what it can do. Only one of those still holds on the day the test system goes down.

If you'd like a second set of eyes on what your agents can actually reach, I'm glad to help: [get in touch](/contact).
