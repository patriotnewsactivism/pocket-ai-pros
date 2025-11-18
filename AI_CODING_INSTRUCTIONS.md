# AI Coding Instructions for BuildMyBot (Pocket AI Pros)

## 1. Project Overview

This is a **SaaS (Software-as-a-Service) platform** called "BuildMyBot" that allows users to create, manage, and deploy AI-powered chatbots for their websites. The platform is built on a modern web stack using React for the frontend and Supabase for the entire backend (database, authentication, and serverless functions).

## 2. Technology Stack

* **Frontend:** React 18, Vite, TypeScript
* **UI:** Tailwind CSS, shadcn/ui, Radix UI
* **Routing:** React Router v6
* **State & Caching:** React Query (TanStack Query)
* **Forms:** React Hook Form
* **Schema Validation:** Zod
* **Backend (BaaS):** Supabase
    * **Database:** Supabase Postgres
    * **Authentication:** Supabase Auth
    * **Serverless Logic:** Supabase Edge Functions (Deno/TypeScript)
* **Payments:** Stripe (integrated via Supabase Edge Functions)
* **AI:** OpenAI (GPT models)

## 3. Project Architecture

The project uses a **direct client-to-Supabase** architecture for most database operations, supplemented by Supabase Edge Functions for secure operations.

* **Frontend (`src/`):** A Vite-powered React single-page application (SPA).
* **Database (`supabase-setup.sql`):** A single SQL file defines the entire Postgres database schema, including tables, indexes, and Row Level Security (RLS) policies.
* **Serverless Backend (`supabase/functions/`):** Deno-based TypeScript functions for secure logic that cannot be exposed to the client, such as:
    * Creating Stripe checkout sessions.
    * Processing reseller applications.
    * Handling payment webhooks.
* **AI Logic (`src/lib/chatbot.ts`):** **(CURRENTLY FLAWED)** The client-side logic for the chatbot widget. *Note: This file incorrectly attempts to handle AI logic on the client.*

## 4. CRITICAL SECURITY & ARCHITECTURE WARNINGS

You **MUST** adhere to these warnings. This project has critical vulnerabilities identified in `CODE_REVIEW_REPORT.md`.

* **🔴 CRITICAL VULNERABILITY #1:** **DO NOT** use any API keys found in `.env` or `.env.example`. They are **EXPOSED PRODUCTION KEYS**. Treat them as placeholders and always refer to them via environment variables (e.g., `Deno.env.get("STRIPE_SECRET_KEY")`).
* **🔴 CRITICAL VULNERABILITY #2:** Never expose the OpenAI key to the client. All AI logic **MUST** run through Supabase Edge Functions using the server-side `OPENAI_API_KEY` environment variable.
* **🟡 ARCHITECTURAL FLAW:** The project has two separate files for database logic: `src/lib/api.ts` and `src/lib/supabase.ts`. Your goal is to consolidate all direct database operations into `src/lib/supabase.ts` and refactor API calls in `src/hooks/useApi.ts` to use it.
* **🟡 NO TESTS:** The project has 0% test coverage. All new code **MUST** include unit tests using **Vitest** and **React Testing Library**.
* **🟡 TS STRICT MODE:** Strict mode is disabled in `tsconfig.app.json`. You should write all new code as if `strict: true` is enabled and help fix existing type errors.

## 5. Key File Map

Use this map to locate core logic:

* **Database Schema:** `supabase-setup.sql` (This is the single source of truth for all tables, RLS policies, and DB functions).
* **Database Types:** `src/integrations/supabase/types.ts` (Auto-generated from schema).
* **Supabase Client:** `src/integrations/supabase/client.ts` (Main client instance).
* **DB Helper Functions:** `src/lib/supabase.ts` (Preferred file for DB operations).
* **API/DB Logic (Legacy):** `src/lib/api.ts` (To be refactored).
* **React Query Hooks:** `src/hooks/useApi.ts` (Hooks for mutations/queries).
* **Serverless Functions:** `supabase/functions/`
    * `create-checkout-session`: Handles Stripe payments.
    * `check-subscription`: Verifies user's payment status.
    * `process-reseller-application`: Handles reseller signups.
* **Main Pages (Routes):**
    * `src/pages/Index.tsx`: The main landing page.
    * `src/pages/Auth.tsx`: User sign-in and sign-up.
    * `src/pages/Dashboard.tsx`: User's main dashboard after login.
    * `src/pages/ResellerDashboard.tsx`: Dashboard for reseller partners.
* **Chatbot Logic:**
    * `src/components/AIChatbot.tsx`: The chatbot UI widget.
    * `src/lib/chatbot.ts`: The client-side logic (needs refactoring to server-side).
* **UI Components:** `src/components/ui/` (shadcn/ui components).
* **Key Dialogs:**
    * `src/components/ContactDialog.tsx`: Lead capture form.
    * `src/components/ResellerDialog.tsx`: Reseller application form.
    * `src/components/CreateBotDialog.tsx`: New bot creation form.

## 6. Database Schema Overview

(Defined in `supabase-setup.sql`)

* `users`: Stores public user profile data (linked to `auth.users`).
* `bots`: Stores AI bots created by users.
* `subscriptions`: Stores user subscription data from Stripe.
* `resellers`: Stores approved reseller partner data.
* `reseller_applications`: Stores applications from potential resellers.
* `contacts`: Stores submissions from the main contact form.
* `newsletter_subscribers`: Stores emails from the newsletter form.
* `chat_sessions`: Stores individual chat session metadata.
* `chat_messages`: Stores all messages from all chat sessions.
* `chat_leads`: Stores leads (e.g., emails) captured by the chatbot.

**RLS (Row Level Security) is ENABLED.** All database queries from the client **MUST** respect RLS policies. Data modification should primarily happen via server-side functions or RLS-protected policies.