import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          AI Tutor Interview Screener
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Run a voice-based tutor interview demo
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          The AI interviewer asks natural follow-up questions, listens to your
          spoken answers, and generates a structured evaluation report with
          evidence quotes.
        </p>
        <Link
          href="/interview"
          className="mt-8 inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Start Interview
        </Link>
      </div>
    </main>
  );
}
