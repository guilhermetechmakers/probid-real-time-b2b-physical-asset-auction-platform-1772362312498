# Create Listing (Intake Wizard)

## Overview

The Create Listing flow is a 6-step guided wizard for sellers to submit new asset listings. It integrates with the AI Vision QA pipeline (provider-agnostic) and the Intake & Enrichment pipeline.

## Steps

1. **Identifier** – Enter asset identifier (SN/VIN). Triggers async enrichment.
2. **Enrichment Prefill** – Review and edit prefilled specs from enrichment.
3. **Photo Upload** – Upload 15–25 images with required angles. Includes Photo Angle Guide link.
4. **AI Vision QA** – Run QA check; view hard-fails, warnings, tags, evidence images.
5. **Additional Details** – Pricing, pickup location, auction batch, payment terms.
6. **Submit for Ops Review** – Summary, terms acceptance, submit.

## Data Models

### Draft (drafts table)

- `id`, `seller_id`, `data` (JSONB), `step`, `status` (draft|ready|submitted), `created_at`, `updated_at`

### DraftData

- `identifier`, `enrichment`, `specs`, `photos`, `qa`, `reservePrice`, `estimatedValue`, `pickupLocation`, etc.

### QA Result (IntakeQAResult)

- `hardFails`, `warnings`, `tags`, `confidence`, `evidenceImages`, `overallScore`, `pass`

## API Endpoints (Supabase)

- **Drafts**: `drafts` table – create, fetch, update
- **Enrichment**: `enrichment_results` table – trigger via `triggerEnrichment()`
- **Photos**: `uploadDraftPhotos()` – uploads to Supabase Storage `listing-photos`
- **QA**: `triggerQA()` – mock/provider-agnostic; stores in `qa_results`
- **Submit**: `submitDraft()` – creates listing, inserts `listing_photos`, `qa_results`, locks draft

## Swapping QA Providers

The QA pipeline is provider-agnostic. To swap providers:

1. Update `triggerQA()` in `src/api/intake.ts` to call your provider (Edge Function or external API).
2. Ensure the response conforms to `IntakeQAResult`: `hardFails`, `warnings`, `tags`, `confidence`, `evidenceImages`.

## Edit / Manage Listing

After submission, sellers can navigate to `/dashboard/seller/listings/:id/edit` to:

- View listing metadata
- Re-run QA checks
- View ops notes
- Manage photos

## Runtime Safety

All array operations use `ensureArray()` or `Array.isArray()` guards. API responses are validated before use.
