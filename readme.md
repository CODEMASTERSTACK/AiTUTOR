<div align="center">
  <img src="https://img.icons8.com/color/96/000000/artificial-intelligence.png" alt="MentorScope AI Logo" />
  <h1>🎯 MentorScope: Agentic Assessment Platform</h1>
  <p><strong>Next-Generation Autonomous AI Interviewer & Candidate Evaluation System</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-Backend-lightgray?style=for-the-badge&logo=express" alt="Express" /></a>
    <a href="https://huggingface.co/"><img src="https://img.shields.io/badge/HuggingFace-TTS-yellow?style=for-the-badge&logo=huggingface" alt="HuggingFace" /></a>
  </p>
</div>

<hr />

## 📖 Overview

**MentorScope** is a highly advanced, end-to-end AI recruitment and assessment platform. Designed to simulate a natural, conversational interview experience, it leverages large language models and real-time text-to-speech (TTS) to evaluate candidates' soft skills, teaching temperament, and English fluency without human bias. 

The platform acts as an **autonomous agent** ("Krish"), managing the entire pre-flight hardware setup, conducting the multi-turn conversational interview, strictly enforcing temporal limits, and ultimately generating a multi-dimensional competency dossier for human recruiters to review.

---

## ✨ Key Features

- **🎙️ Conversational Voice AI**: Features "Krish", an intelligent, context-aware AI interviewer utilizing OpenRouter LLMs and Hugging Face's VITS architecture for real-time organic voice synthesis.
- **👁️ Active Anti-Cheat Face Tracking**: Integrates `MediaPipe` computer vision to actively monitor candidate presence during the session, enforcing a 3-strike warning system if the candidate leaves the camera frame.
- **⏱️ Temporal Intelligence**: Strictly enforces a 10-minute session limit, actively tracking silence to issue inactivity warnings and dynamically prompting the candidate to conclude when 30 seconds remain.
- **📊 Standardized Competency Dossier**: Automatically synthesizes the raw transcript into a multi-dimensional scorecard evaluating:
  - *Clarity & Simplification*
  - *English Fluency*
  - *Patience & Warmth*
  - *Conversational Flow*
- **🎨 Cinematic UI/UX**: Built with a responsive, premium cinematic aesthetic featuring a dynamic audio-reactive CSS animated "AI Core", smooth linear interpolations, and high-fidelity skeleton loading states.

---

## 🏗️ Architecture & Tech Stack

### Frontend (Client-Side)
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks (`useState`, `useEffect`, `useRef`)
- **Speech Recognition**: Native Browser `SpeechRecognition` API
- **Computer Vision**: `@mediapipe/face_detection`
- **Icons**: `lucide-react`

### Backend (Server-Side)
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/) (Session logging)
- **AI Integration**:
  - **LLM**: OpenRouter API (`meta-llama/llama-3-8b-instruct` or similar)
  - **TTS**: Hugging Face Inference API (`espnet/kan-bayashi_ljspeech_vits`)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Accounts and API keys for:
  - [OpenRouter](https://openrouter.ai/)
  - [Hugging Face](https://huggingface.co/)
  - [Firebase](https://firebase.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/mentorscope.git
cd mentorscope
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with your secure credentials:
```env
PORT=8000
OPENROUTER_API_KEY=your_openrouter_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory pointing to your backend:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Start the frontend development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:3000`.

---

## 🖥️ Usage & Testing Workflow

1. **Landing Page**: Navigate to `http://localhost:3000` to view the candidate dashboard.
2. **Pre-flight Setup**: Click **"Start Assessment"**. You will be guided through an information disclosure, followed by a hardware setup wizard to grant Microphone and Camera permissions.
3. **Live Assessment**: Interact with the AI interviewer naturally using your voice. The AI will respond dynamically. You can observe the Face Tracking anti-cheat by hiding your face from the camera.
4. **Evaluation Dossier**: Allow the 10-minute timer to expire or click "Submit & Result" to generate the final algorithmic evaluation scorecard.

---

## ☁️ Deployment

This repository is structured as a monorepo and is pre-configured for modern PaaS providers.
- **Backend**: Can be deployed to [Render](https://render.com/) using the included `render.yaml` blueprint.
- **Frontend**: Can be deployed to [Netlify](https://www.netlify.com/) or Vercel using the included `netlify.toml` configuration. 

> **Note:** Ensure all environment variables are properly mapped in your production deployment settings, and that the frontend `NEXT_PUBLIC_BACKEND_URL` points to the live backend domain.

---

<div align="center">
  <p>Built with ❤️ for the future of unbiased recruitment.</p>
</div>
