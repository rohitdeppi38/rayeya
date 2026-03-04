# Rayeva AI Systems — Technical README

> Full Stack Next.js application built with Next.js 14 App Router, TypeScript, and Tailwind CSS.  
> Implements **Module 1: AI Auto-Category & Tag Generator** and **Module 2: AI B2B Proposal Generator**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
   - [Presentation Layer (Frontend)](#presentation-layer-frontend)
   - [Processing Layer (Backend)](#processing-layer-backend)
   - [Data Layer (Mock Database)](#data-layer-mock-database)
   - [Architecture Diagram](#architecture-diagram)
2. [AI Prompt Design & Strategy](#ai-prompt-design--strategy)
   - [Module 1: AI Auto-Category & Tag Generator](#module-1-ai-auto-category--tag-generator)
   - [Module 2: AI B2B Proposal Generator](#module-2-ai-b2b-proposal-generator)
3. [Unimplemented Modules — Architecture Outline](#unimplemented-modules--architecture-outline)
   - [Module 3: AI Impact Reporting Generator](#module-3-ai-impact-reporting-generator)
   - [Module 4: AI WhatsApp Support Bot](#module-4-ai-whatsapp-support-bot)
4. [Getting Started](#getting-started)

---

## Architecture Overview

The application follows a clean **three-layer architecture**, separating concerns across Presentation, Processing, and Data layers. This ensures maintainability, testability, and clear responsibility boundaries between the UI, business logic, and storage.

```
┌──────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                       │
│          Next.js App Router · React · Tailwind            │
│         Client Components · Framer Motion · Lucide        │
└────────────────────────┬─────────────────────────────────┘
                         │  HTTP (fetch)
┌────────────────────────▼─────────────────────────────────┐
│                  PROCESSING LAYER                         │
│         Next.js Route Handlers (/api/...)                 │
│         AI Services (src/lib/ai/) · Zod Validation        │
└────────────────────────┬─────────────────────────────────┘
                         │  OpenAI API calls
┌────────────────────────▼─────────────────────────────────┐
│                    DATA LAYER                             │
│         In-Memory DB (src/lib/db.ts)                      │
│         Logger Service · Prompt & Token Audit Logs        │
└──────────────────────────────────────────────────────────┘
```

---

### Presentation Layer (Frontend)

| Concern | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Animations | Framer Motion |
| Form State | React Client Components |

**Key Design Decisions:**
- Forms are implemented as **Client Components** (`"use client"`) to interactively capture user input and manage API loading states gracefully.
- Server Components handle static layout and metadata — Client Components are scoped only where interactivity is required, keeping the bundle lean.
- Loading and error states are handled locally within each form component, providing smooth feedback without full-page refreshes.

---

### Processing Layer (Backend)

| Concern | Location |
|---|---|
| API Entry Points | `src/app/api/...` (Next.js Route Handlers) |
| AI Service Abstraction | `src/lib/ai/...` |
| Input Validation | Zod schemas |

**Key Design Decisions:**

- **Route Handlers as Gateway**: All frontend requests go through Next.js Route Handlers, which act as the secure entry point. The OpenAI API key is never exposed to the client — all AI calls originate server-side.

- **AI Services Abstraction Layer**: The `src/lib/ai/` directory contains a dedicated abstraction layer responsible solely for communicating with the OpenAI API. This decouples AI logic from HTTP handling, making it easy to swap providers or mock responses in tests.

- **Zod Validation**: Strict Zod schemas enforce type safety at the API boundary. Schemas map directly to the TypeScript interfaces used by the frontend, guaranteeing that malformed requests are rejected before they reach the AI service.

```
Request → Route Handler → Zod Validation → AI Service → OpenAI API
                                                ↓
Response ← Route Handler ← Parsed Output ← AI Service
```

---

### Data Layer (Mock Database)

| Concern | Location |
|---|---|
| Storage | `src/lib/db.ts` (in-memory) |
| Logging | Logger service (prompt, response time, token usage) |

**Key Design Decisions:**

- **In-Memory Store**: `src/lib/db.ts` simulates a database using JavaScript objects, providing a fast, dependency-free development experience. Records persist for the lifetime of the server process.

- **Prompt Logger**: Every AI interaction is logged with:
  - The raw prompt sent
  - Response time (ms)
  - Token usage (prompt + completion)
  - The final AI-generated output

  This supports compliance requirements and makes debugging AI outputs straightforward.

> **Production Note**: Replace the in-memory store with a persistent database (e.g., PostgreSQL via Prisma) and a structured logging service (e.g., Datadog, Logtail) for production deployment.

---

## AI Prompt Design & Strategy

Both modules follow a consistent prompting philosophy:

1. **Define an expert System Role** — grounds the model in the correct domain.
2. **Inject business context** — provide constraints the model must respect (categories, budgets).
3. **Enforce structured output** — use `response_format: { type: "json_object" }` combined with explicit JSON instructions to guarantee parseable responses.
4. **Validate post-generation** — Zod schemas verify the AI's output before it reaches the frontend.

---

### Module 1: AI Auto-Category & Tag Generator

**Objective**: Parse raw product descriptions and automatically categorise them using predefined options, generate SEO tags, and extract sustainability filters.

#### Prompt Architecture

```
┌─────────────────────────────────────────────────────┐
│  SYSTEM ROLE                                        │
│  "You are an expert e-commerce catalog AI for a    │
│   sustainable B2B platform."                        │
├─────────────────────────────────────────────────────┤
│  CONTEXT INJECTION                                  │
│  Allowed Top-Level Categories:                      │
│  Fashion | Home & Garden | Food & Beverage | ...    │
├─────────────────────────────────────────────────────┤
│  USER INPUT                                         │
│  Raw product description provided by the user       │
├─────────────────────────────────────────────────────┤
│  CONSTRAINT ENFORCEMENT                             │
│  Return ONLY valid JSON with these keys:            │
│  • primaryCategory   (string, from allowed list)    │
│  • subCategory       (string)                       │
│  • seoTags           (array, 5–10 keywords)         │
│  • sustainabilityFilters (array of keywords)        │
└─────────────────────────────────────────────────────┘
```

#### Why This Strategy Works

| Decision | Reasoning |
|---|---|
| Expert system role | Anchors the model's behaviour to e-commerce and sustainability domain knowledge, reducing off-topic or generic outputs. |
| Explicit allowed categories | Prevents the model from inventing arbitrary categories. The LLM picks from a bounded set, ensuring database compatibility. |
| `json_object` response format | Paired with explicit JSON instructions, this eliminates markdown fences, prose preambles, and malformed outputs that break `JSON.parse()`. |
| 5–10 SEO tag constraint | Enforces quality over quantity — enough tags for coverage without diluting relevance. |

#### Expected Output Shape

```json
{
  "primaryCategory": "Home & Garden",
  "subCategory": "Kitchenware",
  "seoTags": ["bamboo", "sustainable", "eco-friendly", "kitchen", "zero-waste"],
  "sustainabilityFilters": ["biodegradable", "plastic-free", "locally-sourced"]
}
```

---

### Module 2: AI B2B Proposal Generator

**Objective**: Convert a client profile and maximum budget into a complete, actionable B2B order proposal — including a product mix, cost breakdown, and sustainability impact statement.

#### Prompt Architecture

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM ROLE                                            │
│  "You are an expert B2B sales strategist focusing on   │
│   sustainable commerce."                                │
├─────────────────────────────────────────────────────────┤
│  CONTEXT INJECTION                                      │
│  • Client Request  (description of the client's needs) │
│  • Maximum Budget  (hard upper limit in currency)       │
├─────────────────────────────────────────────────────────┤
│  REASONING DIRECTIVE (Chain-of-Thought)                 │
│  Step 1 → Identify relevant sustainable products        │
│  Step 2 → Estimate quantities so total ≤ max budget     │
│  Step 3 → Formulate impact positioning statement        │
├─────────────────────────────────────────────────────────┤
│  FORMAT GUARANTEE                                       │
│  Return ONLY valid JSON aligned to ProposalResult       │
│  interface. Include cost table + text summaries.        │
└─────────────────────────────────────────────────────────┘
```

#### Why This Strategy Works

| Decision | Reasoning |
|---|---|
| Expert sales strategist role | Generates commercially realistic proposals rather than generic product lists. |
| Budget as a hard constraint | Explicitly stating `total cost must be strictly ≤ maximum budget` forces the model to do quantity reasoning before output — preventing hallucinated over-budget proposals. |
| Chain-of-thought directive | Breaking the task into three explicit steps (products → quantities → impact) produces more coherent, logically consistent proposals compared to a single open-ended prompt. |
| `json_object` format | Ensures the cost table is machine-parseable, making it trivial to render in the UI and store in the database. |

#### Expected Output Shape (`ProposalResult`)

```json
{
  "proposalTitle": "Eco Office Starter Pack",
  "clientSummary": "Mid-size tech company seeking sustainable office supplies.",
  "productMix": [
    {
      "productName": "Recycled Notebook",
      "quantity": 50,
      "unitPrice": 4.99,
      "lineTotal": 249.50,
      "sustainabilityNote": "Made from 100% post-consumer recycled paper."
    }
  ],
  "totalCost": 249.50,
  "impactStatement": "This order avoids an estimated 2.1kg of virgin paper production and reduces packaging waste by 60% compared to conventional alternatives.",
  "callToAction": "Place this order to meet your Q3 sustainability targets."
}
```

---

## Unimplemented Modules — Architecture Outline

### Module 3: AI Impact Reporting Generator

**Objective**: Generate a human-readable environmental impact report for a completed order.

**Architecture Plan:**

```
Completed Order Payload
        │
        ▼
┌───────────────────────┐
│  Deterministic Math   │  ← Hardcoded conversion table
│  (No LLM involved)    │    e.g. 1 Bamboo Toothbrush = 15g plastic saved
│  • plasticSaved (g)   │
│  • carbonAvoided (kg) │
└──────────┬────────────┘
           │ Calculated totals passed to LLM
           ▼
┌───────────────────────┐
│  AI Narrative Layer   │  ← LLM generates the "story"
│  Prompt: "Generate a  │
│  human-readable impact │
│  statement for saving  │
│  {X}g plastic and     │
│  {Y}kg carbon..."     │
└──────────┬────────────┘
           │
           ▼
   impactStatement saved
   alongside Order record
```

**Key Design Principle**: Mathematical accuracy is guaranteed deterministically — the LLM is only used for narrative generation, not calculation. This prevents hallucinated numbers.

---

### Module 4: AI WhatsApp Support Bot

**Objective**: Automate customer support via WhatsApp using intent routing, RAG-based data retrieval, and graceful human escalation.

**Architecture Plan:**

```
Incoming WhatsApp Message (Meta Webhook)
        │
        ▼ /api/webhooks/whatsapp
┌───────────────────────┐
│  Intent Classifier    │  ← LLM classifies intent:
│                       │    ORDER_STATUS | RETURN_POLICY
│                       │    ESCALATION | GENERAL
└──────────┬────────────┘
           │
    ┌──────┴───────────────────────────────────┐
    │                                          │
    ▼ ORDER_STATUS                             ▼ RETURN_POLICY
┌──────────────┐                      ┌──────────────────┐
│  DB Query    │                      │  Vector DB (RAG) │
│  by Order ID │                      │  Policy Document │
└──────┬───────┘                      └───────┬──────────┘
       │                                      │
       └──────────────┬───────────────────────┘
                      │ Retrieved context
                      ▼
             ┌─────────────────┐
             │  LLM Response   │  ← Formats friendly WhatsApp reply
             │  Generator      │    using retrieved business data
             └────────┬────────┘
                      │
          ┌───────────┴───────────┐
          │ ESCALATION / Negative │
          │ Sentiment detected?   │
          └───────────┬───────────┘
                      │ YES
                      ▼
             Mark conversation:
             "Needs Human" →
             Alert support agent
             on dashboard
```

**Key Design Principles:**
- Intent routing keeps AI calls targeted — only relevant data is retrieved per intent type.
- Human escalation is a hard exit — the AI never attempts to resolve high-tension interactions autonomously.
- RAG pattern for policy queries ensures answers are grounded in actual business documentation, not model hallucinations.

---

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key

### Installation

1. Clone the repository and navigate to the project root.

2. Create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000) to interact with the generators.

---

> Built with Next.js 14 · TypeScript · Tailwind CSS · OpenAI API