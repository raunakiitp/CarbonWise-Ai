# 🌿 CarbonWise AI — Your Personal Carbon Footprint Intelligence Platform

> **🏆 Built for Hackathon 2026** | Empowering individuals to fight climate change with AI-driven insights

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Cloud_Run-4ade80?style=for-the-badge)](https://ssrcarbonwisemaps-hgiguricoq-uc.a.run.app)
[![Firebase](https://img.shields.io/badge/Firebase-Deployed-FFCA28?style=for-the-badge&logo=firebase)](https://carbonwise-maps.web.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Run-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/run)

---

## 🎯 The Problem We're Solving

**Climate change is the defining challenge of our generation** — but most people have no idea what their personal carbon footprint actually looks like, let alone how to reduce it.

> 🌍 The average person generates **4–10 tonnes of CO₂** per year. Small, consistent behavioral changes can cut this by **30–50%**.

CarbonWise AI bridges the gap between **awareness** and **action** using Gemini AI, real-time data, and gamified sustainability tracking.

---

## 💡 What is CarbonWise AI?

CarbonWise AI is a **full-stack web application** that gives users a real-time, AI-powered window into their carbon footprint — and an intelligent coach to help them reduce it.

### ✨ Key Features

| Feature | Description |
|---|---|
| 🧮 **Carbon Calculator** | Track emissions from transport, energy, food & shopping |
| 🤖 **Gemini AI Coach** | Personalized sustainability advice powered by Google Gemini |
| 📊 **Analytics Dashboard** | Beautiful charts showing your carbon trends over time |
| 🗺️ **Eco Map** | Discover nearby sustainable businesses and green spaces |
| 🎯 **Goals & Actions** | Set carbon reduction goals and track progress |
| 🌡️ **AI Predictions** | ML-powered forecasts of your future carbon footprint |
| 📄 **PDF Reports** | Generate shareable sustainability reports |
| 🏆 **Community** | Compare progress with a global community of eco-warriors |
| 📚 **Education Hub** | Learn about sustainability with curated content |
| 📷 **Product Scanner** | Scan barcodes to check product carbon scores |

---

## 🏗️ Tech Stack

```
Frontend          → Next.js 16 (App Router) + TypeScript
Styling           → Vanilla CSS with glassmorphism design
AI Engine         → Google Gemini 1.5 Flash API
Authentication    → Firebase Auth (Google OAuth + Email)
Database          → Cloud Firestore
Hosting           → Firebase Hosting + Google Cloud Run
Charts            → Chart.js + React Chart.js 2
Maps              → Google Maps JavaScript API
Reports           → jsPDF + html2canvas
Testing           → Vitest + Testing Library
```

---

## 🚀 Live Demo

**Primary (Cloud Run):** https://ssrcarbonwisemaps-hgiguricoq-uc.a.run.app  
**Firebase Hosting:** https://carbonwise-maps.web.app

---

## 🧠 How the AI Works

The **Gemini AI Coach** is at the heart of CarbonWise AI:

1. **Context-Aware** — Analyzes your personal carbon data from Firestore
2. **Actionable Advice** — Gives specific, ranked recommendations tailored to your lifestyle
3. **Conversational** — Chat naturally about sustainability questions
4. **Predictive** — Forecasts how your choices today will impact future emissions

```
User Data → Carbon Calculator → Gemini 1.5 Flash → Personalized Coaching
```

---

## 🛠️ Running Locally

```bash
# Clone the repo
git clone https://github.com/raunakiitp/CarbonWise-Ai.git
cd CarbonWise-Ai

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Firebase + Gemini API keys

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── analyzer/       # Carbon footprint analyzer
│   │   ├── coach/          # Gemini AI coach
│   │   ├── community/      # Community leaderboard
│   │   ├── dashboard/      # Main dashboard
│   │   ├── education/      # Learning hub
│   │   ├── goals/          # Carbon reduction goals
│   │   ├── map/            # Eco map
│   │   ├── predictions/    # AI predictions
│   │   ├── reports/        # PDF report generator
│   │   └── scanner/        # Product barcode scanner
│   ├── api/gemini/         # Gemini AI API route
│   ├── login/              # Authentication pages
│   └── register/
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── firebase/           # Firebase config & auth helpers
│   └── carbon/             # Carbon calculation engine
└── types/                  # TypeScript type definitions
```

---

## 🏆 Hackathon Highlights

### What makes CarbonWise AI special?

- **🔥 Real AI Integration** — Not just a chatbot. Gemini analyzes real user data to give hyper-personalized advice
- **📈 Gamification** — Sustainability scores, badges, and community leaderboards drive engagement
- **🎨 Premium Design** — Glassmorphism dark UI with smooth micro-animations
- **🔒 Production-Ready** — Firebase Auth, Firestore security rules, CSP headers, TypeScript strict mode
- **☁️ Fully Deployed** — Live on Google Cloud Run, accessible worldwide right now

### Impact Potential
> If CarbonWise AI helped just **1 million users** reduce their footprint by 10%, that's  
> **~4 million tonnes of CO₂** saved annually — equivalent to taking **870,000 cars off the road**.

---

## 👨‍💻 Team

Built with ❤️ and urgency during the hackathon.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**🌿 Together, we can make sustainability the default — not the exception.**

[🚀 Try it Live](https://ssrcarbonwisemaps-hgiguricoq-uc.a.run.app) · [🐛 Report Bug](https://github.com/raunakiitp/CarbonWise-Ai/issues) · [✨ Request Feature](https://github.com/raunakiitp/CarbonWise-Ai/issues)

</div>
