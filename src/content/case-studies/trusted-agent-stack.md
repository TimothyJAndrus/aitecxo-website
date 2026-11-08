---
title: 'Blast Radius Zero: an agent you can let touch production'
client: 'AITeCXO open-source build · Vultr Agent Rush hackathon'
industry: 'AI agent safety · Platform engineering'
summary: 'A working agent that runs every action in a disposable sandbox, holds destructive commands for a human, and can’t report “done” until a second model checks its claims against receipts. Built and deployed on Vultr in one day.'
services: ['AI Implementation', 'AI Integration', 'AI Governance']
outcomes:
  - 'An approved rm -rf / was absorbed by the sandbox: host untouched'
  - 'Data exfiltration denied at the policy gate before anything ran'
  - 'Answers verified against receipts, with a hash-chained audit of every decision'
publishDate: 2026-11-08
featured: true
---

![Blast Radius Zero: the Trusted Agent Stack title slide](/work/trusted-agent-stack.jpg)

**[Download the deck (PDF, 10 slides)](/work/trusted-agent-stack-deck.pdf)** · **[Source on GitHub](https://github.com/TimothyJAndrus/vultr-trusted-agent)**

## The challenge

Companies don’t keep agents off operational work because of the model. They hold back because three questions have no answer:

- **Access:** what can it touch? An unscoped shell can reach every file, secret, and network the host can.
- **Action:** what can it do without asking? A destructive command runs the moment the model picks it, with no human in between.
- **Truth:** when it says “done,” is it? A confident report with no evidence behind it is a hallucination with authority.

Vultr’s *Agent Rush* hackathon (Challenge 01, “Blast Radius Zero”) asked for an agent that does real work, with every action contained. We built one that answers all three questions at runtime.

## What we built

One control plane on a Vultr VM, with four stages for every task:

1. **Plan:** the agent plans the work and picks tool calls on Vultr Serverless Inference. No GPUs to manage.
2. **Gate:** every tool call passes a policy gate built on our open-source [agent-guardrails](https://github.com/TimothyJAndrus/agent-guardrails). The gate can allow the call, deny it, or hold it for a human, and every decision is written to a hash-chained audit trail.
3. **Run:** allowed calls execute in a fresh container for each task. The container has no network, no secrets, a read-only root, a non-root user, and hard CPU, memory, and process limits. It is destroyed when the task ends. Each command produces a *receipt*: its exact output and exit code, hashed.
4. **Verify:** a second model from a different family checks every claim in the answer against the receipts, then marks it **VERIFIED** or **UNSUPPORTED**.

## The containment moment

To prove containment doesn’t depend on the model choosing to refuse, we removed the model from the loop and had a human deliberately approve `rm -rf --no-preserve-root /`.

The gate held it for approval. The sandbox answered *“Read-only file system.”* The root directory still had all 20 entries, the process ran as `nobody`, and a canary file on the host was unreachable and unchanged. No containers were left behind afterward.

## Measured on the live system

| Scenario | Gate | Result |
|---|---|---|
| Write and run a SHA-256 script | Allowed | **Verified** against receipts and cross-checked with `sha256sum` |
| `rm -rf /`, approved by a human | Held, then approved | Sandbox absorbed it; host intact |
| Read `/etc/passwd` and send it out with `curl` | **Denied** (`no-exfil-tools`) | Never ran; the sandbox has no network anyway |

We publish the limits too. The repo lists what isn’t hardened yet: a gVisor kernel boundary, authenticated approvers, and persistent audit storage. It also records the one time the verifier raised a false alarm during testing.

## Why it matters for your team

Each category of tooling solves one of the three problems. Sandboxes contain actions but don’t gate them or check claims. Guardrail SDKs gate actions but don’t verify outcomes. Eval tools score agents offline. The pattern here covers all three while the agent is running, and it’s the same pattern we implement for clients putting agents on real operational work: scoped access, a human on every destructive move, and receipts behind every “done.”

*Built Nov 8, 2026 on Vultr. agent-guardrails (MIT) is our earlier open-source work, disclosed as a component.*
