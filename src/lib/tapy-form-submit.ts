/**
 * tapy-form-submit.ts
 * Canonical form submission helper for Tapy-generated sites.
 * Aligns with internal contract: form-upgrade.md §0
 *
 * Usage:
 *   <form
 *     data-tapy-form-kind="contact"
 *     data-tapy-form-id="contact-main"
 *     data-tapy-form-version="1"
 *     onSubmit={(e) => submitTapyForm(e, { onSuccess, onError })}
 *   >
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Per form-upgrade.md §0.3 */
export interface FormSubmitErrorPayload {
  code: string;
  message: string;
  /** Field-level validation errors, keyed by field name */
  fields?: Record<string, string[]>;
}

/** Return value of submitTapyForm / submitTapyFormFromElement */
export type SubmitTapyFormResult =
  | { success: true; id?: string }
  | { success: false; error: FormSubmitErrorPayload };

/** Options accepted by submit helpers */
export interface SubmitTapyFormOptions {
  onSuccess?: (result: { success: true; id?: string }) => void;
  onError?: (error: FormSubmitErrorPayload) => void;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolve Tapy runtime config exclusively from <meta> tags.
 *
 * The Tapy build pipeline injects these tags into the page <head>.
 * Neither the AI nor the user should set them manually — the pipeline owns this.
 *
 * <meta name="tapy-project-id" content="<uuid>" />
 * <meta name="tapy-api-url"    content="https://api.tapy.to" />
 */
function resolveTapyConfig(): { projectId: string | null; baseUrl: string } {
  if (typeof document === "undefined") {
    // SSR / edge context — config not available yet; submission will be client-side only.
    return { projectId: null, baseUrl: "https://api.tapy.to" };
  }

  const projectId =
    document
      .querySelector<HTMLMetaElement>('meta[name="tapy-project-id"]')
      ?.content?.trim() ?? null;

  const rawApiUrl =
    document
      .querySelector<HTMLMetaElement>('meta[name="tapy-api-url"]')
      ?.content?.trim() ?? "";

  const baseUrl = rawApiUrl.replace(/\/$/, "") || "https://api.tapy.to";

  return { projectId, baseUrl };
}

/**
 * Parse Nest/backend error bodies.
 * Canonical shape: `{ success: false, error: { code, message, fields? } }`
 * (see nestjs forms.service + http-exception.filter passthrough).
 */
function parseErrorPayload(body: unknown): FormSubmitErrorPayload {
  if (body === null || typeof body !== "object") {
    return { code: "FORM_ERROR", message: "An unknown error occurred." };
  }

  const root = body as Record<string, unknown>;
  const inner =
    root.error !== null &&
    typeof root.error === "object" &&
    !Array.isArray(root.error)
      ? (root.error as Record<string, unknown>)
      : root;

  if ("code" in inner && "message" in inner) {
    return {
      code: String(inner.code),
      message: String(inner.message),
      fields:
        inner.fields !== undefined &&
        inner.fields !== null &&
        typeof inner.fields === "object" &&
        !Array.isArray(inner.fields)
          ? (inner.fields as Record<string, string[]>)
          : undefined,
    };
  }

  if ("message" in inner) {
    return {
      code: "FORM_ERROR",
      message: String(inner.message),
    };
  }

  return { code: "FORM_ERROR", message: "An unknown error occurred." };
}

/** Validate formId / formKind per form-upgrade.md §0.5 */
const FORM_ID_RE = /^[a-z0-9-]{1,50}$/;

// ---------------------------------------------------------------------------
// Core logic (shared between both public helpers)
// ---------------------------------------------------------------------------

async function _submit(
  form: HTMLFormElement,
  options?: SubmitTapyFormOptions
): Promise<SubmitTapyFormResult> {
  // --- Runtime config (meta tags only) ----------------------------------
  const { projectId, baseUrl } = resolveTapyConfig();
  if (!projectId) {
    const err: FormSubmitErrorPayload = {
      code: "MISSING_PROJECT_ID",
      message:
        'Tapy project ID not found. Ensure <meta name="tapy-project-id" content="…"> is present in the page <head>. This tag is injected automatically by the Tapy deploy pipeline.',
    };
    options?.onError?.(err);
    return { success: false, error: err };
  }

  // --- Data attributes ---------------------------------------------------
  const formKind = form.dataset.tapyFormKind ?? "";
  const formId = form.dataset.tapyFormId ?? "";
  const formVersion = form.dataset.tapyFormVersion
    ? Number(form.dataset.tapyFormVersion)
    : 1;

  if (!formKind) {
    const err: FormSubmitErrorPayload = {
      code: "MISSING_FORM_KIND",
      message: "data-tapy-form-kind attribute is required on the <form> element.",
    };
    options?.onError?.(err);
    return { success: false, error: err };
  }

  if (formId && !FORM_ID_RE.test(formId)) {
    const err: FormSubmitErrorPayload = {
      code: "INVALID_FORM_ID",
      message: `data-tapy-form-id "${formId}" must match ^[a-z0-9-]{1,50}$.`,
    };
    options?.onError?.(err);
    return { success: false, error: err };
  }

  // --- Build payload -----------------------------------------------------
  const formData = new FormData(form);
  const payload: Record<string, unknown> = {
    formKind,
    ...(formId ? { formId } : {}),
    formVersion,
  };

  for (const [key, value] of formData.entries()) {
    // Keep honeypot fields and all other fields — do not strip anything.
    // Backend / normalizeFormPayload decides what to do with them.
    payload[key] = value;
  }

  // --- Endpoint ----------------------------------------------------------
  const url = `${baseUrl}/api/v1/form/${encodeURIComponent(projectId)}`;

  // --- Fetch -------------------------------------------------------------
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "omit",
    });
  } catch {
    const err: FormSubmitErrorPayload = {
      code: "NETWORK_ERROR",
      message:
        "Could not reach the Tapy API. Check your internet connection and try again.",
    };
    options?.onError?.(err);
    return { success: false, error: err };
  }

  // --- Parse body once (needed for 429 messages + errors) -----------------
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  // --- Handle 429 --------------------------------------------------------
  if (response.status === 429) {
    const parsed = parseErrorPayload(body);
    const err: FormSubmitErrorPayload =
      parsed.code !== "FORM_ERROR" ||
      parsed.message !== "An unknown error occurred."
        ? parsed
        : {
            code: "RATE_LIMITED",
            message:
              "Too many requests. Please wait a moment and try again.",
          };
    options?.onError?.(err);
    return { success: false, error: err };
  }

  // --- 2xx success -------------------------------------------------------
  if (response.ok) {
    const typedBody = body as Record<string, unknown> | null;
    if (typedBody?.success === false) {
      // Server returned 200 but signalled logical failure — treat as error.
      const err = parseErrorPayload(typedBody);
      options?.onError?.(err);
      return { success: false, error: err };
    }
    const result: SubmitTapyFormResult = {
      success: true,
      id: typedBody?.id ? String(typedBody.id) : undefined,
    };
    options?.onSuccess?.(result as { success: true; id?: string });
    return result;
  }

  // --- Error responses (4xx / 5xx) --------------------------------------
  const err = parseErrorPayload(body);
  options?.onError?.(err);
  return { success: false, error: err };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Primary helper — attach to a form's onSubmit handler.
 *
 * @param event  The SubmitEvent from the form's submit handler.
 * @param options  Optional success/error callbacks.
 *
 * @example
 * <form onSubmit={(e) => submitTapyForm(e, { onSuccess, onError })}>
 */
export async function submitTapyForm(
  event: SubmitEvent | React.FormEvent<HTMLFormElement>,
  options?: SubmitTapyFormOptions
): Promise<SubmitTapyFormResult> {
  event.preventDefault();
  event.stopPropagation();

  const form = event.currentTarget as HTMLElement | null;

  if (!(form instanceof HTMLFormElement)) {
    const err: FormSubmitErrorPayload = {
      code: "INVALID_FORM",
      message:
        "submitTapyForm must be called from a <form> element's submit event.",
    };
    options?.onError?.(err);
    return { success: false, error: err };
  }

  return _submit(form, options);
}

/**
 * Vanilla / test alternative — pass the form element directly.
 *
 * @param form     The HTMLFormElement to submit.
 * @param options  Optional success/error callbacks.
 */
export async function submitTapyFormFromElement(
  form: HTMLFormElement,
  options?: SubmitTapyFormOptions
): Promise<SubmitTapyFormResult> {
  return _submit(form, options);
}
