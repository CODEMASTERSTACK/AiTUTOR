import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="space-y-8 text-gray-600 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">1. Information We Collect</h2>
            <p className="mb-4">
              To conduct a fair, scalable, and objective soft skills assessment, the Cuemath Assessment Platform collects and processes live audio input during your screening session. This entails temporary short audio buffers and the generated text transcripts of your conversation.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">2. Purpose of Data Use</h2>
            <p className="mb-4">
              Your session transcripts are utilized strictly for evaluating your candidacy as a Cuemath tutor. We explicitly analyze conversational flow, English fluency, and communication clarity to provide our recruitment team with standardized applicant data.
            </p>
            <p className="mb-4">
              <strong>Enterprise Commitment:</strong> We do not use your voice data to train large foundational AI models, nor do we sell or distribute your candidate profile to third-party marketing entities.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">3. Data Retention and Security Protocols</h2>
            <p className="mb-4">
              Your privacy is fundamental to our hiring process. Interview transcripts and metric scorecards are securely retained on encrypted cloud servers only for the duration necessary for our HR team to review your application. Raw audio streams are processed in transit and are not permanently stored once the session successfully concludes.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-gray-900 font-bold mb-3">4. Candidate Rights & Transparency</h2>
            <p className="mb-4">
              We maintain a transparent evaluation cycle. If you have any inquiries regarding how the automated platform processes your responses or handles your applicant data during this screening phase, you may request clarification from the Cuemath recruitment support desk.
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
