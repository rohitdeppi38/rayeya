# Rayeva AI Systems Assignment

This repository contains the Full Stack Next.js application for the Rayeva AI Systems Assignment, built using modern web development practices (Next.js 14 App Router, TypeScript, Tailwind CSS).

The implementation focuses on **Module 1 (AI Auto-Category & Tag Generator)** and **Module 2 (AI B2B Proposal Generator)**, integrating structured AI generation with real business logic through isolated backend services and user-friendly frontend UI.

## Architecture Overview

### Presentation Layer (Frontend)
- **Framework**: Next.js App Router providing Server/Client separation.
- **UI Components**: Built with React, Tailwind CSS, Lucide Icons, and Framer Motion for premium interactions.
- **Client Forms**: Forms are implemented as Client Components to capture user input interactively and handle API loading states gracefully.

### Processing Layer (Backend)
- **API Routes**: Next.js Route Handlers (`src/app/api/...`) act as the secure entry point for frontend requests.
- **AI Services**: Abstraction layer (`src/lib/ai/...`) that talks to the OpenAI API.
- **Validation schema**: Strict Zod schemas map exactly to the frontend TypeScript interfaces ensuring type-safety.

### Data Layer (Mock Database)
- **Storage**: In-memory database via `src/lib/db.ts` to simulate database records (e.g. logging proposals and generated categories).
- **Prompt Logging**: A Logger service records the prompt, response time, token usage, and AI outputs per compliance requirements.

---

## AI Prompt Design & Strategy

### Module 1: AI Auto-Category & Tag Generator
**Objective**: Parse raw product descriptions and categorize them with predefined options, generating SEO tags, and extracting sustainability filters.

**Prompt Strategy**:
- **System Role**: You are an expert e-commerce catalog AI for a sustainable B2B platform.
- **Context Injection**: Give the LLM the explicitly allowed Top-Level Categories (e.g., *Fashion*, *Home & Garden*, *Food & Beverage*).
- **Constraint Enforcement**: Ask for the output strictly in a JSON format containing keys for `primaryCategory`, `subCategory`, `seoTags` (array of 5-10 words), and `sustainabilityFilters` (array of relevant keywords).
- **Format Guarantee**: Use OpenAI's `response_format: { type: "json_object" }` paired with an explicit instruction to return JSON.

### Module 2: AI B2B Proposal Generator
**Objective**: Convert a client profile and budget into an actionable B2B order proposal containing a product mix, cost breakdown, and impact statement.

**Prompt Strategy**:
- **System Role**: You are an expert B2B sales strategist focusing on sustainable commerce.
- **Context Injection**: Inject the specific Client Request and Maximum Budget constraints.
- **Reasoning Process**: Direct the LLM to think step-by-step: 
  1. Determine the relevant sustainable products.
  2. Estimate reasonable unit constraints so the total cost is strictly <= maximum budget.
  3. Formulate the impact positioning (why these particular items are sustainable).
- **Format Guarantee**: Output strictly JSON aligned to a defined `ProposalResult` interface. We use `json_object` format to reliably parse the cost table and textual summaries.

---

## Unimplemented Modules (Architecture Outline)

### Module 3: AI Impact Reporting Generator
**How I would build it**:
1. **Input Data**: A completed order payload (items, quantities, material type, origin location).
2. **Deterministic Logic (The "Math")**: Use a hardcoded conversion table (e.g., 1 Bamboo Toothbrush = 15g plastic saved). Calculate baseline totals for `plasticSaved` and `carbonAvoided` without the LLM to guarantee mathematical accuracy.
3. **AI Generation (The "Story")**: Pass these calculated totals to the LLM. 
   - *Prompt*: "Generate a short, human-readable impact statement highlighting that the customer just saved {X}g of plastic and {Y}kg of carbon by sourcing locally."
4. **Storage**: Save the final `impactStatement` text alongside the Order record in the database.

### Module 4: AI WhatsApp Support Bot
**How I would build it**:
1. **Webhook Integration**: Set up Meta WhatsApp API webhooks (Next.js `/api/webhooks/whatsapp`) to receive incoming messages.
2. **Intent Routing**: When a message arrives, pass it to an LLM to classify intent: `ORDER_STATUS`, `RETURN_POLICY`, `ESCALATION`, or `GENERAL`.
3. **Data Retrieval (RAG)**: 
   - If `ORDER_STATUS`, query the database with the extracted Order ID.
   - If `RETURN_POLICY`, retrieve the policy document from a vector DB (like Pinecone) or static context.
4. **Response Generation**: Pass the retrieved business logic (e.g., "Order 123 is currently Out for Delivery") back to the LLM to format a friendly WhatsApp reply.
5. **Human Escalation**: If the intent is `ESCALATION` or sentiment is highly negative, exit the AI flow, mark the conversation as `Needs Human`, and alert a support agent on the dashboard.

---

## Running the Application Locally

1. Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Visit `http://localhost:3000` to interact with the generators.
