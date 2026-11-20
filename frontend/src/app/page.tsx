
"use client";

import { useState } from "react";

type CareerAnalysis = {
  job_requirements: string[];
  matching_qualifications: string[];
  related_experience: string[];
  unverified_requirements: string[];
  recommendations: string[];
  networking_message: string;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  status?: string;
  model?: string;
  reply?: string;
  detail?: string | { msg?: string }[];
};

type AnalysisResponse = {
  status: string;
  message: string;
  model?: string;
  report: string | null;
  analysis?: CareerAnalysis;
  detail?: string;
};

function ReportCard({
  title,
  description,
  items,
  emptyMessage,
  color,
}: {
  title: string;
  description: string;
  items: string[];
  emptyMessage: string;
  color: "green" | "blue" | "amber" | "purple";
}) {
  const styles = {
    green: "border-green-200 bg-green-50",
    blue: "border-blue-200 bg-blue-50",
    amber: "border-amber-200 bg-amber-50",
    purple: "border-purple-200 bg-purple-50",
  };

  return (
    <section
      className={`rounded-xl border p-5 ${styles[color]}`}
    >
      <h3 className="text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        {description}
      </p>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="rounded-lg bg-white px-3 py-2 text-sm text-slate-800"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm italic text-slate-500">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export default function Home() {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [analysis, setAnalysis] =
    useState<CareerAnalysis | null>(null);

  const [report, setReport] = useState("");
  const [networkingMessage, setNetworkingMessage] =
    useState("");

  const [model, setModel] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatModel, setChatModel] = useState("");

  async function handleChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || chatLoading) return;
    const previousHistory = chatHistory;
    setChatInput("");
    setChatError("");
    setChatLoading(true);
    setChatHistory([...previousHistory, { role: "user", content: question }]);
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: previousHistory.slice(-8),
          skills: skills.trim(),
          experience: experience.trim(),
          job_description: jobDescription.trim(),
        }),
      });
      const data: ChatResponse = await response.json();
      if (!response.ok || !data.reply) {
        const detail = typeof data.detail === "string" ? data.detail : "AI assistant could not respond.";
        throw new Error(detail);
      }
      setChatHistory((current) => [...current, {
        role: "assistant",
        content: data.reply!.replace(/\\n/g, "\n"),
      }]);
      setChatModel(data.model ?? "");
    } catch (err) {
      setChatHistory(previousHistory);
      setChatInput(question);
      setChatError(err instanceof Error ? err.message : "Unable to connect to AI assistant.");
    } finally {
      setChatLoading(false);
    }
  }


  async function handleAnalyze() {
    if (!skills.trim() || !jobDescription.trim()) {
      setError(
        "Please enter your skills and a job description."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setAnalysis(null);
    setReport("");
    setNetworkingMessage("");
    setModel("");
    setCopyStatus("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills: skills.trim(),
            experience: experience.trim(),
            job_description: jobDescription.trim(),
          }),
        }
      );

      const data: AnalysisResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The analysis could not be completed."
        );
      }

      if (!data.analysis) {
        throw new Error(
          "The backend did not return structured analysis."
        );
      }

      setAnalysis(data.analysis);
      setReport(data.report ?? "");
      setNetworkingMessage(
        data.analysis.networking_message ?? ""
      );
      setModel(data.model ?? "");
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyText(
    text: string,
    successMessage: string
  ) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(successMessage);
    } catch {
      setCopyStatus(
        "Copy failed. Please select and copy the text manually."
      );
    }
  }

  function buildUpdatedReport() {
    if (!analysis) {
      return report;
    }

    return [
      "CYBERTRACE AI - CAREER READINESS REPORT",
      "",
      "1. MATCHING QUALIFICATIONS",
      ...analysis.matching_qualifications.map(
        (item) => `- ${item}`
      ),
      "",
      "2. RELATED EXPERIENCE - VERIFY",
      ...analysis.related_experience.map(
        (item) => `- ${item}`
      ),
      "",
      "3. MISSING OR UNVERIFIED SKILLS",
      ...analysis.unverified_requirements.map(
        (item) => `- ${item}`
      ),
      "",
      "4. RECOMMENDED IMPROVEMENTS",
      ...analysis.recommendations.map(
        (item) => `- ${item}`
      ),
      "",
      "5. PROFESSIONAL NETWORKING MESSAGE",
      networkingMessage,
      "",
      "AI-generated suggestions require verification.",
    ].join("\n");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-700">
            CyberTrace AI
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Your Career Readiness
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Compare your academic skills, projects, and
            experience with internship and entry-level job
            requirements using AI.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Student Information
            </h2>

            <label
              htmlFor="skills"
              className="mb-2 block text-sm font-medium"
            >
              Skills and Coursework
            </label>

            <textarea
              id="skills"
              value={skills}
              onChange={(event) =>
                setSkills(event.target.value)
              }
              maxLength={5000}
              placeholder="Python, SQL, Linux, cybersecurity..."
              className="mb-5 h-32 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            />

            <label
              htmlFor="experience"
              className="mb-2 block text-sm font-medium"
            >
              Projects and Experience
            </label>

            <textarea
              id="experience"
              value={experience}
              onChange={(event) =>
                setExperience(event.target.value)
              }
              maxLength={10000}
              placeholder="Describe your projects, labs, and experience..."
              className="h-32 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Internship or Job Description
            </h2>

            <label
              htmlFor="jobDescription"
              className="mb-2 block text-sm font-medium"
            >
              Paste the Job Description
            </label>

            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              maxLength={15000}
              placeholder="Paste internship or job requirements here..."
              className="h-64 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </section>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Analyzing with AI..."
            : "Analyze Career Readiness"}
        </button>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="AI Career Assistant">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">CyberTrace AI Career Assistant</h2>
              <p className="mt-1 text-sm text-slate-600">
                Ask about internships, skills, or your career plan. Your current form entries provide context.
              </p>
            </div>
            <button type="button" disabled={chatLoading || chatHistory.length === 0}
              onClick={() => { setChatHistory([]); setChatError(""); setChatModel(""); }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">
              Clear conversation
            </button>
          </div>
          <div role="log" aria-live="polite" aria-label="Conversation"
            className="mt-5 max-h-96 min-h-48 space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-4">
            {chatHistory.length === 0 && (
              <p className="text-sm text-slate-500">Start by asking: What should I learn to become a SOC Analyst?</p>
            )}
            {chatHistory.map((item, index) => (
              <div key={index} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-6 ${
                  item.role === "user" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-800"
                }`}>
                  <p className="mb-1 text-xs font-semibold opacity-75">{item.role === "user" ? "You" : "Career Assistant"}</p>
                  {item.content}
                </div>
              </div>
            ))}
            {chatLoading && <p className="text-sm text-slate-500">Career Assistant is thinking...</p>}
          </div>
          {chatError && <p role="alert" className="mt-3 text-sm text-red-700">{chatError}</p>}
          <form onSubmit={handleChat} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="chatInput" className="sr-only">Ask the Career Assistant</label>
            <input id="chatInput" type="text" maxLength={3000} value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask a career question..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
            <button type="submit" disabled={chatLoading || !chatInput.trim()}
              className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
              {chatLoading ? "Thinking..." : "Send"}
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            {chatModel ? `Model: ${chatModel}. ` : ""}Conversations are stored only in this browser session's page state and disappear on refresh.
            AI advice may be inaccurate; verify qualifications before using them.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {analysis && (
          <div className="mt-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  Your Career Readiness Dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Review your qualifications and suggested
                  next steps.
                </p>
              </div>

              {model && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  AI Model: {model}
                </span>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <ReportCard
                title="Matching Qualifications"
                description="Skills identified as matching the job requirements."
                items={analysis.matching_qualifications}
                emptyMessage="No confirmed matches identified."
                color="green"
              />

              <ReportCard
                title="Related Experience — Verify"
                description="Relevant project experience that may support a job requirement."
                items={analysis.related_experience}
                emptyMessage="No related experience requiring verification was identified."
                color="blue"
              />

              <ReportCard
                title="Missing or Unverified Skills"
                description="Job requirements not demonstrated in the information provided."
                items={analysis.unverified_requirements}
                emptyMessage="No unverified requirements were identified among the extracted skills."
                color="amber"
              />

              <ReportCard
                title="Recommended Improvements"
                description="Suggested activities to improve your readiness."
                items={analysis.recommendations}
                emptyMessage="No recommendations generated."
                color="purple"
              />
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">
                Professional Networking Message
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Edit this draft before sending it to a
                recruiter or hiring manager.
              </p>

              <textarea
                aria-label="Editable networking message"
                value={networkingMessage}
                onChange={(event) =>
                  setNetworkingMessage(event.target.value)
                }
                rows={12}
                className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-4 text-sm leading-7 focus:border-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  copyText(
                    networkingMessage,
                    "Networking message copied!"
                  )
                }
                className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Copy Networking Message
              </button>
            </section>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  copyText(
                    buildUpdatedReport(),
                    "Full report copied!"
                  )
                }
                className="rounded-lg border border-blue-700 px-5 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Copy Full Report
              </button>

              {copyStatus && (
                <p
                  role="status"
                  className="text-sm text-slate-600"
                >
                  {copyStatus}
                </p>
              )}
            </div>

            <p className="text-xs leading-6 text-slate-500">
              CyberTrace AI provides educational career
              guidance. Skill classifications and AI-generated
              recommendations may be incomplete or inaccurate.
              Verify all qualifications and review networking
              messages before sharing them.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
