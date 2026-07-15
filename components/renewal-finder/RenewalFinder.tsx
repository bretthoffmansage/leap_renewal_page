"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { validateEmailInput } from "../../lib/validation/email";
import type { PublicAccountSummary, RenewalDestinationResponse, RenewalLookupResponse } from "../../types/api";

type FinderState =
  | { status: "email-entry"; email?: string; validationError?: string }
  | { status: "retrieving"; email: string }
  | { status: "account-found"; email: string; account: PublicAccountSummary; warnings: string[] }
  | { status: "not-found"; email: string; message: string }
  | { status: "error"; email?: string; message: string }
  | { status: "renewal-ready"; account: PublicAccountSummary; cohort: number; renewalUrl: string };

function getErrorMessage(response: RenewalLookupResponse | RenewalDestinationResponse): string {
  if (response.ok) return "";

  if (response.code === "CONTACT_NOT_FOUND") {
    return "Check that you entered the same email address used for your LEAP membership.";
  }

  if (response.code === "MULTIPLE_CONTACTS_FOUND") {
    return "More than one account matched this email. Please contact the LEAP team for help.";
  }

  if (response.code === "RATE_LIMITED") {
    return "Please wait before trying again.";
  }

  return "We couldn’t retrieve your account right now. Please try again.";
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function AccountSummary({ account }: { account: PublicAccountSummary }) {
  return (
    <dl className="account-summary" aria-label="Account summary">
      <DetailRow label="Name" value={account.displayName} />
      <DetailRow label="Email" value={account.maskedEmail} />
      <DetailRow label="Membership" value={account.membershipStatus} />
      <DetailRow label="Cohort" value={account.cohort} />
      <DetailRow label="Pod" value={account.podNumber} />
      <DetailRow label="Member since" value={account.memberSince} />
    </dl>
  );
}

function isLookupResponse(value: unknown): value is RenewalLookupResponse {
  return value !== null && typeof value === "object" && "ok" in value;
}

function isDestinationResponse(value: unknown): value is RenewalDestinationResponse {
  return value !== null && typeof value === "object" && "ok" in value;
}

export function RenewalFinder() {
  const [state, setState] = useState<FinderState>({ status: "email-entry" });
  const [draftEmail, setDraftEmail] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isBusy = state.status === "retrieving";
  const describedBy = useMemo(() => {
    if (state.status === "email-entry" && state.validationError) return "email-error";
    if (state.status === "error") return "lookup-error";
    return undefined;
  }, [state]);

  useEffect(() => {
    if (state.status !== "email-entry") {
      headingRef.current?.focus();
    }
  }, [state.status]);

  function reset(keepEmail = false) {
    const nextEmail = keepEmail ? draftEmail : "";
    setDraftEmail(nextEmail);
    setState({ status: "email-entry", email: nextEmail || undefined });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateEmailInput(draftEmail);
    if (!validation.ok) {
      setState({ status: "email-entry", email: draftEmail, validationError: validation.message });
      return;
    }

    setDraftEmail(validation.email);
    setState({ status: "retrieving", email: validation.email });

    try {
      const response = await fetch("/api/renewal-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validation.email }),
      });
      const payload: unknown = await response.json();

      if (!isLookupResponse(payload)) {
        setState({ status: "error", email: validation.email, message: "We couldn’t retrieve your account right now. Please try again." });
        return;
      }

      if (!payload.ok) {
        if (payload.code === "CONTACT_NOT_FOUND") {
          setState({ status: "not-found", email: validation.email, message: getErrorMessage(payload) });
        } else {
          setState({ status: "error", email: validation.email, message: getErrorMessage(payload) });
        }
        return;
      }

      setState({
        status: "account-found",
        email: payload.inputEmail,
        account: payload.account,
        warnings: payload.warnings ?? [],
      });
    } catch {
      setState({ status: "error", email: validation.email, message: "We couldn’t retrieve your account right now. Please try again." });
    }
  }

  async function confirmAccount(account: PublicAccountSummary) {
    try {
      const response = await fetch("/api/renewal-destination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account }),
      });
      const payload: unknown = await response.json();

      if (!isDestinationResponse(payload) || !payload.ok) {
        setState({ status: "error", message: "We couldn’t retrieve your renewal page right now. Please try again." });
        return;
      }

      setState({
        status: "renewal-ready",
        account,
        cohort: payload.routing.cohort,
        renewalUrl: payload.routing.url,
      });
    } catch {
      setState({ status: "error", message: "We couldn’t retrieve your renewal page right now. Please try again." });
    }
  }

  return (
    <section className="renewal-card" aria-labelledby="renewal-heading">
      <p className="eyebrow">LEAP / Sage</p>

      {state.status === "email-entry" ? (
        <>
          <h1 id="renewal-heading">Find Your LEAP Renewal Page</h1>
          <p className="intro">Enter the email address connected to your LEAP membership.</p>
          <form className="lookup-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-describedby={describedBy}
              value={draftEmail}
              onChange={(event) => {
                setDraftEmail(event.target.value);
                if (state.status === "email-entry" && state.validationError) {
                  setState({ status: "email-entry", email: event.target.value });
                }
              }}
            />
            {state.validationError ? (
              <p id="email-error" className="form-message form-message--error">
                {state.validationError}
              </p>
            ) : null}
            <button className="button button--primary" type="submit" disabled={isBusy}>
              Confirm Email
            </button>
          </form>
        </>
      ) : null}

      {state.status === "retrieving" ? (
        <div className="state-panel" aria-live="polite" aria-busy="true">
          <h1 id="renewal-heading" ref={headingRef} tabIndex={-1}>
            Retrieving account…
          </h1>
          <p className="intro">Please wait while we securely check your LEAP membership account.</p>
          <div className="loader" aria-hidden="true" />
        </div>
      ) : null}

      {state.status === "account-found" ? (
        <div className="state-panel">
          <h1 id="renewal-heading" ref={headingRef} tabIndex={-1}>
            Is this your account?
          </h1>
          <p className="intro">Review the limited account summary below and confirm if it belongs to you.</p>
          <AccountSummary account={state.account} />
          {state.warnings.length ? <p className="form-message">Some optional account details were unavailable.</p> : null}
          <div className="button-row">
            <button className="button button--primary" type="button" onClick={() => void confirmAccount(state.account)}>
              Yes, This Is My Account
            </button>
            <button className="button button--secondary" type="button" onClick={() => reset(false)}>
              No, Start Over
            </button>
          </div>
        </div>
      ) : null}

      {state.status === "not-found" ? (
        <div className="state-panel">
          <h1 id="renewal-heading" ref={headingRef} tabIndex={-1}>
            We couldn’t find that account
          </h1>
          <p className="intro">{state.message}</p>
          <div className="button-row">
            <button className="button button--primary" type="button" onClick={() => reset(true)}>
              Try Again
            </button>
            <button className="button button--secondary" type="button" onClick={() => reset(false)}>
              Reset
            </button>
          </div>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel" role="alert">
          <h1 id="renewal-heading" ref={headingRef} tabIndex={-1}>
            We couldn’t retrieve your account right now
          </h1>
          <p id="lookup-error" className="intro">
            {state.message}
          </p>
          <div className="button-row">
            <button className="button button--primary" type="button" onClick={() => reset(Boolean(state.email))}>
              Try Again
            </button>
            <button className="button button--secondary" type="button" onClick={() => reset(false)}>
              Reset
            </button>
          </div>
        </div>
      ) : null}

      {state.status === "renewal-ready" ? (
        <div className="state-panel">
          <h1 id="renewal-heading" ref={headingRef} tabIndex={-1}>
            Your renewal page is ready
          </h1>
          <p className="intro">Use the button below to continue to your LEAP renewal page.</p>
          <AccountSummary account={state.account} />
          <p className="cohort-note">Assigned renewal cohort: Cohort {state.cohort}</p>
          <div className="button-row">
            <a className="button button--primary" href={state.renewalUrl}>
              Go to Renewal Page
            </a>
            <button className="button button--secondary" type="button" onClick={() => reset(false)}>
              Reset
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
