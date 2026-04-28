# MSME Credit Ready AI

A mobile-first web application that helps Micro, Small, and Medium Enterprises (MSMEs) assess their creditworthiness, improve their financial standing, and become "bankable" through an AI-powered credit coach.

---

## What is this app?

**MSME Credit Ready AI** is designed for small business owners who want to understand and improve their credit readiness — without needing a bank account or formal credit history.

The app evaluates businesses across **4 pillars**:

| Pillar | Weight | What it measures |
|---|---|---|
| Financial Health | 30% | Revenue, expenses, savings, debt ratio |
| Operational Stability | 25% | Business age, registration, location, employees |
| Alternative Data | 25% | Digital presence, mobile money, transaction patterns |
| Psychometric Indicators | 20% | Entrepreneurial mindset, risk tolerance, financial discipline |

---

## Key Features

- **Credit Readiness Score** — Composite score out of 100 with band labels (Credit Ready, Approaching Ready, Building Foundation, Early Stage)
- **AI Credit Coach (Aria)** — Conversational interface where users can ask questions like *"Why is my score low?"* or *"How do I get a $50k loan?"*
- **Personalized Action Plan** — Auto-generated step-by-step tasks ranked by score impact
- **Score Dashboard** — Visual breakdown with pillar radar chart, trend chart, and audit history
- **Low-Friction Onboarding** — Users see their credit score within ~3 minutes
- **Persistent Storage** — All assessments, chat history, and action plans survive page refresh via `localStorage`
- **Full Audit Trail** — Every assessment is timestamped and stored for historical comparison

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Scoring Engine | Custom JavaScript (no external API) |
| AI Coach | Rule-based NLU engine (no external API) |
| Data Layer | localStorage with audit trail |

---

## Project Structure

```
msme-credit-app/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Onboarding.jsx      # 5-step onboarding flow
│   │   ├── Dashboard.jsx       # Score dashboard + charts
│   │   ├── ScoreCard.jsx       # Score ring + pillar summary
│   │   ├── CoachChat.jsx       # AI coach chat interface
│   │   └── ActionPlan.jsx      # Prioritised task list
│   ├── engine/
│   │   ├── scoringEngine.js    # Multi-pillar scoring algorithm
│   │   └── coachEngine.js      # Intent classifier + response generator
│   ├── data/
│   │   └── store.js            # localStorage data layer + audit trail
│   ├── App.jsx                 # Root component + navigation
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles + Tailwind config
├── index.html
├── vite.config.js
└── package.json
```

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

Verify with:
```bash
node --version
npm --version
```

---

## Setup Instructions

**1. Clone the repository**
```bash
git clone https://github.com/hafiz-sariban/codebuddy-msme-credit-ready-ai.git
cd codebuddy-msme-credit-ready-ai
```

**2. Install dependencies**
```bash
npm install
```

---

## How to Run

**Development server (with hot reload)**
```bash
npm run dev
```
Then open your browser at: [http://localhost:5173](http://localhost:5173)

**Build for production**
```bash
npm run build
```
Output will be in the `dist/` folder.

**Preview the production build locally**
```bash
npm run preview
```

---

## How to Use the App

1. **Onboarding** — Fill in 4 steps: Business Info → Financial Picture → Operations → Psychometric Quiz
2. **Dashboard** — View your credit score, pillar breakdown, and score trend over time
3. **Score tab** — Detailed score card with band label and improvement suggestions
4. **Action Plan** — Track your personalised tasks sorted by impact
5. **Coach tab** — Chat with Aria, your AI credit coach

**Example questions to ask Aria:**
- *"Why is my score low?"*
- *"How do I get a loan?"*
- *"What should I do first?"*
- *"Am I bank ready?"*
- *"How do I register my business?"*

---

## Re-assessing Your Score

Click **"Re-assess My Score"** on the Dashboard or Score tab at any time. Your previous assessment is saved in the audit history for comparison.

---

## License

MIT License — free to use, modify, and distribute.
