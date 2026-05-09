"use client";

/**
 * contact-form-example.tsx
 * Example component demonstrating the submitTapyForm helper.
 * This is for PR review / developer reference only — not required in production.
 * Tree-shaken if unused.
 */

import { useState } from "react";
import {
  submitTapyForm,
  type FormSubmitErrorPayload,
} from "@/lib/tapy-form-submit";

export function ContactFormExample() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorPayload, setErrorPayload] =
    useState<FormSubmitErrorPayload | null>(null);
  const [submissionId, setSubmissionId] = useState<string | undefined>();
  /** Backend expects epoch ms for `FORM_MIN_SUBMIT_MS` (see nestjs form-submission.pipeline). */
  const [renderAtMs] = useState(() => String(Date.now()));

  return (
    <form
      data-tapy-form-kind="contact"
      data-tapy-form-id="contact-main"
      data-tapy-form-version="1"
      onSubmit={async (e) => {
        setStatus("loading");
        setErrorPayload(null);

        await submitTapyForm(e, {
          onSuccess: ({ id }) => {
            setSubmissionId(id);
            setStatus("success");
          },
          onError: (err) => {
            setErrorPayload(err);
            setStatus("error");
          },
        });
      }}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 480 }}
    >
      {/* Honeypot — bots fill this, humans don't (keep as-is, helper won't strip it) */}
      <input
        name="_honeypot"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <input
        name="_form_render_at"
        type="hidden"
        value={renderAtMs}
      />

      <div>
        <label htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" type="text" required />
      </div>

      <div>
        <label htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" required />
      </div>

      <div>
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows={4} required />
      </div>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send"}
      </button>

      {status === "success" && (
        <p style={{ color: "green" }}>
          ✓ Message sent!{submissionId ? ` (id: ${submissionId})` : ""}
        </p>
      )}

      {status === "error" && errorPayload && (
        <div style={{ color: "red" }}>
          <p>
            ✗ {errorPayload.message} <code>[{errorPayload.code}]</code>
          </p>
          {errorPayload.fields &&
            Object.entries(errorPayload.fields).map(([field, msgs]) => (
              <p key={field}>
                <strong>{field}:</strong> {msgs.join(", ")}
              </p>
            ))}
        </div>
      )}
    </form>
  );
}
