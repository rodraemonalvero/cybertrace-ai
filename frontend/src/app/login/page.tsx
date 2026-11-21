
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verified = searchParams.get("verified") === "true";
  const confirmationError = searchParams.get("error");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold">
        Sign in to CyberTrace AI
      </h1>

      <p className="mb-8 text-gray-500">
        Access your AI career assistant and career profile.
      </p>

      {verified && (
        <p role="status" className="mb-5 text-green-600">
          Email verified successfully. You can now sign in.
        </p>
      )}

      {confirmationError && (
        <p role="alert" className="mb-5 text-red-500">
          Email verification failed. Please try again.
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border p-3 text-black"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center">
        Don't have an account?{" "}
        <Link href="/register" className="text-blue-500 underline">
          Create an account
        </Link>
      </p>

      <Link href="/" className="mt-6 text-center text-blue-500">
        Back to CyberTrace AI
      </Link>
    </main>
  );
}
