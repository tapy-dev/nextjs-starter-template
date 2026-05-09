# Tapy Form Integration Guide

## Quick Start

Every form in a Tapy-generated site submits via the **`submitTapyForm`** helper in `src/lib/tapy-form-submit.ts`. This ensures forms always POST to the correct backend endpoint without any hardcoded URLs.

```tsx
import { submitTapyForm } from "@/lib/tapy-form-submit";

<form
  data-tapy-form-kind="contact"
  data-tapy-form-id="contact-main"
  data-tapy-form-version="1"
  onSubmit={(e) =>
    submitTapyForm(e, {
      onSuccess: ({ id }) => console.log("Submitted, id:", id),
      onError: (err) => console.error(err.code, err.message),
    })
  }
>
  {/* fields */}
</form>
```

> **Do not** add `action` or `method` attributes to forms — these are handled entirely by the helper.

---

## Required Form Attributes

| Attribute | Required | Pattern | Description |
|---|---|---|---|
| `data-tapy-form-kind` | ✅ | free string | Type of form (`contact`, `signup`, …) |
| `data-tapy-form-id` | recommended | `^[a-z0-9-]{1,50}$` | Stable identifier per form |
| `data-tapy-form-version` | recommended | integer string | Schema version, default `1` |

---

## Configuration — Pipeline Managed

> **⚠️ AI must not read or write env vars or meta tags directly.**  
> The Tapy deploy pipeline owns all configuration. Forms only need the three `data-*` attributes and the `submitTapyForm` call.

### How it works

```
Tapy pipeline
  └─ sets NEXT_PUBLIC_TAPY_PROJECT_ID & NEXT_PUBLIC_TAPY_API_URL at build time
        ↓
layout.tsx  (tapy-pipeline:begin … tapy-pipeline:end block)
  └─ converts env vars → <meta name="tapy-project-id"> / <meta name="tapy-api-url">
        ↓
submitTapyForm  (src/lib/tapy-form-submit.ts)
  └─ reads ONLY the meta tags at runtime — never touches env
```

### Local development override

For local testing only, copy `.env.example` to `.env.local` and uncomment:

```env
NEXT_PUBLIC_TAPY_API_URL=http://localhost:4000
NEXT_PUBLIC_TAPY_PROJECT_ID=<your-local-uuid>
```

This populates the meta tags via `layout.tsx`. The helper itself still reads only meta tags.

---

## AI Prohibition Rules

| File / scope | AI may? | Reason |
|---|---|---|
| `.env`, `.env.local`, `.env.production` | ✗ Never | Pipeline-managed |
| `NEXT_PUBLIC_TAPY_*` env vars in any generated code | ✗ Never | Meta tags are the contract |
| `tapy-pipeline:begin … :end` block in `layout.tsx` | ✗ Never | Pipeline zone |
| `data-tapy-form-*` attributes | ✅ Yes | AI writes these in form HTML |
| `submitTapyForm(e, …)` | ✅ Yes | AI uses this in onSubmit handlers |

---

## Error Codes

| Code | Cause |
|---|---|
| `MISSING_PROJECT_ID` | `tapy-project-id` meta missing or empty (set via pipeline / `.env.local` at build time → `layout.tsx`) |
| `MISSING_FORM_KIND` | `data-tapy-form-kind` attribute missing |
| `INVALID_FORM_ID` | `data-tapy-form-id` doesn't match `^[a-z0-9-]{1,50}$` |
| `NETWORK_ERROR` | Fetch threw (offline, CORS, etc.) |
| `RATE_LIMITED` | Backend returned 429 |
| `FORM_ERROR` | Generic server-side error |
| `INVALID_FORM` | Helper called outside a `<form>` submit event |

---

## Honeypot / Hidden Fields

Do **not** strip `_honeypot` or `_form_render_at` fields — the backend uses them for spam detection. The helper forwards all `FormData` entries as-is.

`_form_render_at` must be a **Unix timestamp in milliseconds** (string or number), set when the form is rendered — not an ISO date string. The backend compares it to `FORM_MIN_SUBMIT_MS` (production default often ≥ 2000 ms).

---

## Local Testing

```bash
# 1. Start local backend
NEXT_PUBLIC_TAPY_API_URL=http://localhost:4000 \
NEXT_PUBLIC_TAPY_PROJECT_ID=<your-uuid> \
npm run dev

# 2. Use a form with data-tapy-form-kind="contact"
# 3. Submit → expect { success: true, id: "…" }
```

See `src/components/examples/contact-form-example.tsx` for a minimal working example.
