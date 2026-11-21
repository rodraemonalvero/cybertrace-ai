
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState(
    "Completing email verification..."
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function completeVerification() {
      try {
        const supabase = createClient();

        const params = new URLSearchParams(
          window.location.hash.substring(1)
        );

        const urlError = params.get("error_description");

        if (urlError) {
          if (active) {
            setError(urlError);
            setMessage("");
          }
          return;
        }

        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!active) return;

        if (data.session) {
          setMessage(
            "Email verification completed. You can now sign in."
          );
          window.history.replaceState(
            {},
            "",
            "/auth/callback"
          );
        } else {
          setError(
            "No active session was found. Please try signing in."
          );
          setMessage("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Email verification failed."
          );
          setMessage("");
        }
      }
    }

    completeVerification();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-4 text-3xl font-bold">
        CyberTrace AI Email Verification
      </h1>

      {message && (
        <p role="status" className="mb-5">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mb-5 text-red-500">
          {error}
        </p>
      )}

      <Link
        href="/login"
        className="rounded-lg bg-blue-600 p-3 text-center font-semibold text-white"
      >
        Continue to Sign In
      </Link>
    </main>
  );
}
