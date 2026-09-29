"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    signIn,
    {
      error: initialError,
    },
  );

  return (
    <form
      action={action}
      className="mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm"
    >
      <label className="grid gap-1">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
          className="min-h-12 w-full rounded-xl border border-brand/20 bg-cream/40 px-3 text-base"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 w-full rounded-xl border border-brand/20 bg-cream/40 px-3 text-base"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-accent-text">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 min-h-12 rounded-xl bg-brand font-semibold text-white disabled:bg-muted/40"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
