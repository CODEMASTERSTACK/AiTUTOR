import Link from "next/link";
import { Mic, Clock, FileText, CheckCircle, MessageSquare, Heart, Ear, BookOpen, Target, CheckCircle2, Download, HelpCircle, ExternalLink, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-[#e36c39]/20 selection:text-[#e36c39] pb-20">
      
      {/* 1. Navbar (Refined to match Fomogo) */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="MentorScope Logo" className="w-8 h-8 object-cover rounded-md" />
          <Link href="/" className="font-bold text-xl tracking-tight text-black flex-shrink-0">
            MentorScope
          </Link>
        </div>
        
        {/* Center: Links */}
        <div className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-gray-500 absolute left-1/2 -translate-x-1/2">
          <Link href="#overview" className="hover:text-black transition-colors">Features</Link>
          <Link href="#criteria" className="hover:text-black transition-colors">How we Evaluate?</Link>
          <Link href="#resources" className="hover:text-black transition-colors">About</Link>
          <Link href="#faq" className="hover:text-black transition-colors">Blog</Link>
        </div>

        {/* Right: Auth & CTA */}
        <div className="flex items-center gap-6">
          
        </div>
      </nav>

      {/* 2. Hero Section (Fomogo Master Layout) */}
      <section className="relative w-full max-w-5xl mx-auto pt-24 pb-16 px-6 text-center">
        
        <p className="text-gray-500 font-medium text-sm md:text-base tracking-wide mb-8">
          The Agentic Assessment Platform
        </p>

        <h1 className="text-[3.5rem] md:text-[5.5rem] leading-[1.05] font-extrabold tracking-tight text-black mb-6">
          Smart Interview Buddy<br />
          <span className="font-playfair italic font-normal text-black tracking-normal">Interview with AI</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-gray-500 mx-auto leading-relaxed mb-12">
          MentorScope sources, screens, interviews, evaluates, and ranks — end to end. You just tell it what soft-skills to look for.
        </p>

        <div className="flex items-center justify-center gap-4 mb-20">
          <Link href="/interview">
            <button className="bg-[#e36c39] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#d65f2e] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              Start Assessment
            </button>
          </Link>

        </div>

        {/* Feature Checkmarks Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-600 font-medium">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400" /> Source from any channel</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400" /> AI screening & interviews</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400" /> Evaluation on autopilot</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400" /> AI-native agency experience</span>
        </div>
      </section>

      {/* Spacer to separate hero clearly from content */}
      <div className="w-full max-w-6xl mx-auto border-b border-gray-100 my-10"></div>

      {/* 3. Steps / Timeline Section */}
      <section id="overview" className="max-w-5xl mx-auto mt-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-black mb-3">How it works</h2>
          <p className="text-gray-500 text-base">A streamlined, highly objective hardware and assessment process.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#e36c39] transition-all duration-300 relative pt-12 group">
            <div className="absolute top-0 left-8 -translate-y-1/2 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-black shadow-sm group-hover:bg-[#fff5f2] group-hover:text-[#e36c39] group-hover:border-[#e36c39] transition-colors">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">1. Environment Setup</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We'll perform a quick check of your microphone. Please ensure you are in a quiet room with minimal background noise.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm shadow-[#e36c39]/5 hover:shadow-lg hover:shadow-[#e36c39]/10 hover:-translate-y-1 transition-all duration-300 relative pt-12 ring-1 ring-black/5 group">
            <div className="absolute top-0 left-8 -translate-y-1/2 w-12 h-12 bg-black border border-black rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:bg-[#e36c39] group-hover:border-[#e36c39] transition-all">
              <Clock className="w-5 h-5" />
            </div>
            <div className="absolute top-4 right-4 bg-[#fff5f2] text-[#e36c39] text-[10px] font-bold px-2 py-1 rounded">LIVE</div>
            <h3 className="text-xl font-bold text-black mb-3">2. Voice Assessment</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Engage in a short voice conversation with our AI platform. You will be asked open-ended questions designed to gauge your teaching temperament.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-600 transition-all duration-300 relative pt-12 group">
            <div className="absolute top-0 left-8 -translate-y-1/2 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-black shadow-sm group-hover:bg-green-50 group-hover:text-green-600 group-hover:border-green-600 transition-colors">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">3. Human Review</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Transcripts and soft-skills assessments are flagged to our recruitment team. You will be contacted via email regarding the next round.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Criteria Grid */}
      <section id="criteria" className="max-w-5xl mx-auto mt-32 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-gray-100 pb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-black tracking-tight">Evaluation Rubric</h2>
            <p className="text-gray-500 mt-2 text-base max-w-xl">
              Our AI evaluates your responses purely on delivery methodology and conversational tone, not hard technical knowledge.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 p-8 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex-shrink-0 mt-1">
              <BookOpen className="w-7 h-7 text-gray-400 group-hover:text-[#e36c39] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">Clarity & Simplification</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Can you break down complex concepts into digestible, easy-to-understand explanations suitable for a student?
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-8 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex-shrink-0 mt-1">
              <MessageSquare className="w-7 h-7 text-gray-400 group-hover:text-[#e36c39] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">English Fluency</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Evaluation of vocabulary usage, enunciation, and the ability to structure cohesive sentences quickly.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-8 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex-shrink-0 mt-1">
              <Heart className="w-7 h-7 text-gray-400 group-hover:text-[#e36c39] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">Patience & Warmth</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Assessing for an empathetic tone, supportive language, and a general temperament suited for mentoring.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-8 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex-shrink-0 mt-1">
              <Ear className="w-7 h-7 text-gray-400 group-hover:text-[#e36c39] transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">Conversational Flow</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Gauging active listening skills and the natural back-and-forth interactivity of your communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Candidate Resources */}
      <section id="resources" className="max-w-5xl mx-auto mt-32 px-6">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h2 className="text-3xl font-extrabold text-black tracking-tight">Candidate Resources</h2>
          <p className="text-gray-500 mt-2 text-base max-w-xl">
            Everything you need to review before starting your assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-[#fff5f2] border border-[#ffdbcf] p-8 rounded-2xl hover:border-[#e36c39] hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#e36c39] shadow-sm mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-black mb-3 group-hover:text-[#e36c39] transition-colors">Pedagogy Overview</h3>
            <p className="text-sm text-gray-600 mb-6">Learn about our foundational teaching methods and what we value in educators.</p>
            <span className="text-[#e36c39] text-sm font-bold flex items-center gap-1">Read Guide <ExternalLink className="w-3 h-3" /></span>
          </div>

          <div className="group bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-black shadow-sm mb-6 group-hover:scale-110 group-hover:border-black transition-all">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">Tech Checklist</h3>
            <p className="text-sm text-gray-600 mb-6">Ensure your microphone, browser, and internet connection are ready for the test.</p>
            <span className="text-black text-sm font-bold flex items-center gap-1 group-hover:underline">View Checklist <ExternalLink className="w-3 h-3" /></span>
          </div>

          <div className="group bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-black shadow-sm mb-6 group-hover:scale-110 group-hover:border-black transition-all">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-black mb-3">Sample Questions</h3>
            <p className="text-sm text-gray-600 mb-6">Download a PDF of example questions our AI might ask you during the session.</p>
            <span className="text-black text-sm font-bold flex items-center gap-1 group-hover:underline">Download PDF <Download className="w-3 h-3" /></span>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="max-w-3xl mx-auto mt-32 px-6 mb-32">
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-black mx-auto mb-6 opacity-30" />
          <h2 className="text-3xl font-extrabold text-black tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-[#e36c39] transition-colors cursor-default">
            <h3 className="text-lg font-bold text-black mb-3">Do I need to prepare advanced math formulas?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">No. This preliminary screening is entirely focused on assessing your soft skills: communication, patience, interpretation, and English fluency. Technical math assessments happen in later rounds.</p>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-[#e36c39] transition-colors cursor-default">
            <h3 className="text-lg font-bold text-black mb-3">What happens if my internet disconnects?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">If you experience a severe drop in connection, the session will pause. You can refresh the page to resume within 15 minutes. If technical issues persist, please reach out to our recruitment support.</p>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-[#e36c39] transition-colors cursor-default">
            <h3 className="text-lg font-bold text-black mb-3">Who reviews my AI assessment?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">While the AI evaluates your conversational flow and provides a base score, all audio recordings and transcripts are personally reviewed by a human recruiter before making a final decision.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-12 mt-auto">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="font-bold text-2xl tracking-tight text-black mb-4 inline-flex items-center gap-3 hover:text-[#e36c39] transition-colors">
                <img src="/logo.jpg" alt="MentorScope Logo" className="w-8 h-8 object-cover rounded-md" />
                MentorScope
              </div>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                Empowering the next generation of educators through fair, objective, and highly scalable candidate assessments.
              </p>
            </div>
            
            <div>
              <h4 className="text-black font-bold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link href="#overview" className="hover:text-black transition-colors inline-block">Features</Link></li>
                <li><Link href="#criteria" className="hover:text-black transition-colors inline-block">Pricing</Link></li>
                <li><Link href="#resources" className="hover:text-black transition-colors inline-block">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-black font-bold mb-4 text-sm uppercase tracking-wider">Legal & Help</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link href="#faq" className="hover:text-black transition-colors inline-block">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-black transition-colors inline-block">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-black transition-colors inline-block">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-400">
            <p>© {new Date().getFullYear()} MentorScope. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
