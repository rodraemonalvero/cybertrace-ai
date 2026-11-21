
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage(
        "Registration submitted! Check your email for a confirmation link."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold">
        Create your CyberTrace AI account
      </h1>

      <p className="mb-8 text-gray-500">
        Register to build your cybersecurity career profile.
      </p>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border p-3 text-black"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border p-3 text-black"
            placeholder="Create a strong password"
          />
          <p className="mt-2 text-sm text-gray-500">
            Use at least 12 characters, including uppercase,
            lowercase, a number, and a symbol.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-green-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center">
        Already registered?{" "}
        <Link href="/login" className="text-blue-500 underline">
          Sign in
        </Link>
      </p>

      <Link href="/" className="mt-6 text-center text-blue-500">
        Back to CyberTrace AI
      </Link>
    </main>
  );
}
