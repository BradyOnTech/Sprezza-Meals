# Sprezza Next + Payload Workspace

This folder hosts the new stack:
- `next/`: Next.js storefront (App Router, TS). Will fetch catalog/CMS data from Payload REST/GraphQL and use Supabase Auth + Stripe for checkout.
- `payload/`: Standalone Payload CMS/admin using Postgres (Supabase). Editors manage meals, bases, customization options, meal plans, and marketing content. Media uploads target Supabase Storage (S3-compatible) once configured.

## Getting Started
1. Copy env templates:
   - `next/.env.example` → `next/.env.local`
   - `payload/.env.example` → `payload/.env`
2. Fill in Supabase Postgres URI, Supabase Storage credentials (S3-compatible), Payload secret, and Stripe keys.
3. Install deps (npm preferred):
   - `cd payload && npm install`
   - `cd ../next && npm install`
4. Run services (separate terminals):
   - Payload: `cd payload && npm run dev` (defaults to http://localhost:4000/admin)
   - Next: `cd next && npm run dev` (defaults to http://localhost:3000)

## Notes
- Payload collections mirror the Django models: Meal Categories, Meals, Customization Categories/Options, Meal Bases, Meal Plans, Testimonials, Media, Site Settings, and Users (auth-enabled for admin).
- Media currently uses local storage; switch to Supabase Storage/S3 adapter when ready.
- Orders/Payments/Favorites are not modeled yet—plan to handle via Next route handlers + Supabase/Stripe, with optional read-only exposure in Payload later.
