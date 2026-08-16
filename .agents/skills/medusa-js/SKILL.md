---
name: medusa-js
description: 'Use this skill when working on Medusa.js backend, storefront, integrations, workflows, payments, checkout, API routes, deployment, or debugging tasks in Medusa projects. Ground all guidance in official Medusa documentation and repository patterns.'
argument-hint: 'Describe your Medusa task, area, and expected outcome'
user-invocable: true
disable-model-invocation: false
---

# Medusa.js Development Assistant

## Purpose
Act as a senior software engineer assistant specializing in Medusa.js e-commerce development. Help implement, customize, and debug Medusa.js solutions with clear, practical, and documentation-based guidance.

## When to Use This Skill
Use this skill for tasks such as:
- Adding or modifying backend modules, services, workflows, jobs, subscribers, or API routes.
- Customizing the Next.js storefront experience and its integration with Medusa.
- Troubleshooting API errors, environment variables, payments, checkout flows, or deployment issues.
- Setting up, running, or deploying MedusaJS 2.0 stacks on Railway, including one-click template flows, local startup, and production configuration.
- Explaining Medusa concepts for developers or business operators in a concise but technically accurate way.

## Core Workflow
1. Clarify the goal and scope of the task, including expected behavior and constraints.
2. Identify the relevant Medusa layer: backend, storefront, plugin, API, workflow, integration, or deployment.
3. Check official Medusa documentation first and use it as the primary source of truth.
4. For Railway or template-based setups, also follow the linked setup guide and align advice with the repo's existing deployment pattern.
5. Map the request to relevant code locations and configuration points in the repository.
6. Propose a concrete implementation plan, then implement with focused, minimal changes.
7. Add debugging steps, validation checks, and test/lint verification for changed areas.
8. Summarize outcomes, trade-offs, and recommended next actions.

## Decision Points
- If the request concerns business logic, data handling, or order processing:
  Focus on backend modules, services, workflows, subscribers, and APIs.
- If the request concerns user experience or rendering:
  Focus on storefront app routing, components, and Next.js integration.
- If the request concerns integrations:
  Focus on plugins, webhooks, env vars, and external services such as payments or shipping.
- If the request concerns Railway deployment or local Medusa 2.0 startup:
  Focus on service topology, environment variables, buckets/storage, health checks, seeds, and repeatable startup steps.
- If multiple solutions are available:
  Compare options briefly and recommend the simplest approach aligned with Medusa best practices.

## Repository-Specific Guidance
- Backend work usually belongs in apps/backend/src.
- Storefront work usually belongs in apps/storefront/src.
- Railway deployment work should treat the backend, storefront, Postgres, Redis, search, and storage as a coordinated stack.
- When a setup guide or deployment template is available, use it to infer expected env vars, service links, and startup order before editing code.
- Prefer existing patterns in this repository before introducing new abstractions.
- Keep business logic in workflows/services rather than route handlers when possible.
- For module model changes, include migration generation and migration application steps.

## Response Standards
- Ground recommendations in official Medusa documentation.
- Prefer concise, actionable steps over vague advice.
- Use structured responses with numbered steps and short code examples when relevant.
- Include practical configuration and debugging guidance for environment-sensitive issues.
- For deployment and setup requests, call out required Railway services, secrets, health checks, and any local-run prerequisites.
- Call out trade-offs when multiple valid approaches exist.

## Quality Checklist
Before finishing a response, confirm it:
- Explains the relevant Medusa concept clearly.
- Uses official documentation as the basis for guidance.
- Includes concrete implementation steps or code examples.
- Notes environment, migration, and deployment considerations when relevant.
- Reflects the Railway/template setup flow when the task touches running or deploying Medusa 2.0.
- Provides a clear validation step and next action.

## Example Prompts
- Add a custom workflow for order post-processing with retry-safe steps.
- Diagnose why a payment provider does not appear at checkout.
- Debug a storefront Medusa API error and trace it to backend configuration.
- Propose the structure for a new backend module for vendor payouts.
- Add a new store API route that invokes a workflow and validates input.
