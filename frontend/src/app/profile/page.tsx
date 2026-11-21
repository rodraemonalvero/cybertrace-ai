
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ProfileField =
  | "full_name"
  | "career_goal"
  | "skills"
  | "coursework"
  | "projects"
  | "experience"
  | "preferred_role";

type CareerProfile = Record<ProfileField, string>;

const emptyProfile: CareerProfile = {
  full_name: "",
  career_goal: "",
  skills: "",
  coursework: "",
  projects: "",
  experience: "",
  preferred_role: "",
};

const fields: {
  name: ProfileField;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    name: "full_name",
    label: "Full Name",
    placeholder: "Enter your full name",
  },
  {
    name: "career_goal",
    label: "Career Goal",
    placeholder: "Example: Become a cybersecurity analyst",
    multiline: true,
  },
  {
    name: "skills",
    label: "Skills",
    placeholder: "Python, Linux, SQL, networking...",
    multiline: true,
  },
  {
    name: "coursework",
    label: "Coursework",
    placeholder: "List relevant courses and certifications",
    multiline: true,
  },
  {
    name: "projects",
    label: "Projects",
    placeholder: "Describe your academic or personal projects",
    multiline: true,
  },
  {
    name: "experience",
    label: "Experience",
    placeholder: "Describe internships, employment, or labs",
    multiline: true,
  },
  {
    name: "preferred_role",
    label: "Preferred Job or Internship Role",
    placeholder: "Example: SOC Analyst Intern",
  },
];

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<CareerProfile>(emptyProfile);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (active) {
            setError("Please sign in to access your profile.");
          }
          return;
        }

        if (!active) return;

        setUserId(user.id);
        setEmail(user.email ?? "");

        const { data, error: profileError } = await supabase
          .from("career_profiles")
          .select(
            "full_name, career_goal, skills, coursework, projects, experience, preferred_role"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (active && data) {
          setProfile({
            full_name: data.full_name ?? "",
            career_goal: data.career_goal ?? "",
            skills: data.skills ?? "",
            coursework: data.coursework ?? "",
            projects: data.projects ?? "",
            experience: data.experience ?? "",
            preferred_role: data.preferred_role ?? "",
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function updateField(name: ProfileField, value: string) {
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
    setMessage("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user || user.id !== userId) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const { error: saveError } = await supabase
        .from("career_profiles")
        .upsert(
          {
            user_id: user.id,
            ...profile,
          },
          { onConflict: "user_id" }
        );

      if (saveError) throw saveError;

      setMessage("Your career profile was saved successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p>Loading your CyberTrace AI profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-blue-700 underline">
          Back to CyberTrace AI
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Student Career Profile
        </h1>

        <p className="mt-2 text-slate-600">
          Save your skills, projects, and career goals for
          future career-readiness assessments.
        </p>

        {email && (
          <p className="mt-3 text-sm text-green-700">
            Signed in as {email}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {!userId ? (
          <div className="mt-6">
            <Link href="/login" className="text-blue-700 underline">
              Sign in to continue
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-semibold"
                >
                  {field.label}
                </label>

                {field.multiline ? (
                  <textarea
                    id={field.name}
                    value={profile[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    maxLength={10000}
                    rows={4}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                ) : (
                  <input
                    id={field.name}
                    type="text"
                    value={profile[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    maxLength={500}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                )}
              </div>
            ))}

            {message && (
              <p role="status" className="text-green-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Career Profile"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
