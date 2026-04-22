import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-[#e36c39]/20 selection:text-black pb-32">
      {/* Simple Header */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#e36c39] flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-sm"></div>
          </div>
          <Link href="/" className="font-semibold text-lg tracking-tight text-gray-900">
            Cuemath Eval
          </Link>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      {/* Content */}
      <section className="max-w-3xl mx-auto mt-16 px-6 bg-white p-12 border border-gray-200 rounded-2xl shadow-sm">
        <p className="text-[#e36c39] text-xs mb-3 uppercase tracking-wider font-bold">Legal & Policies</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-10 text-gray-900">
          Terms & Conditions
        </h1>

        <div className="space-y-8 text-gray-600 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">1. Assessment Environment Agreement</h2>
            <p className="mb-4">
              Welcome to the Cuemath Tutor Assessment platform. This portal is designed to provide a fair, welcoming, and standardized screening experience. By starting a session, you agree to engage in a short voice conversation with our automated interviewer explicitly for hiring evaluation purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">2. Evaluation Scope</h2>
            <p className="mb-4">
              Our system does not test comprehensive mathematical logic or deep technical knowledge during this particular phase. Instead, we are evaluating crucial soft skills required for tutoring students, specifically:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Communication clarity and the ability to simplify concepts.</li>
              <li>Patience and warmth during interaction.</li>
              <li>General English fluency and conversational flow.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">3. Fairness & Human Review</h2>
            <p className="mb-4">
              We are committed to a fair evaluation process. The AI is programmed strictly to assess the communication parameters listed above. However, the AI's assessment is only one component of a broader review. All screening transcripts and scores are subject to final review and approval by human recruiters at Cuemath.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">4. Conduct Policy</h2>
            <p className="mb-4">
              Candidates must treat the automated interviewer with standard professional courtesy. Instances of profanity, abusive language, or inappropriate content will be flagged and result in immediate disqualification from the Cuemath screening process.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">5. Disclaimer Limitations</h2>
            <p>
              The screening tool relies on accurate voice transcription. Network latency or poor microphone quality can affect parsing accuracy. If you believe your session was negatively impacted by systemic technical difficulties, please complete the assessment and immediately notify our recruitment team via email for manual review.
            </p>
          </section>

          <div className="pt-10 mt-10 border-t border-gray-100 text-gray-400 text-xs">
            Last updated: April 2026
          </div>
        </div>
      </section>
    </main>
  );
}
