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
| AI Coach | AI API (primary) + Rule-based NLU fallback |
| AI Providers | Z.ai GLM, CodeBuddy.ai, OpenAI-compatible |
| Data Layer | localStorage with audit trail |

### New Files (AI Integration)

```
src/
├── services/
│   └── apiService.js         # Unified API layer for all providers
├── components/
│   └── ApiSettings.jsx       # Settings UI for key management
```

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
│   │   ├── CoachChat.jsx       # AI coach chat interface (API + fallback)
│   │   ├── ActionPlan.jsx      # Prioritised task list
│   │   └── ApiSettings.jsx     # API key config & provider selection
│   ├── engine/
│   │   ├── scoringEngine.js    # Multi-pillar scoring algorithm
│   │   └── coachEngine.js      # Hybrid: AI API + rule-based NLU engine
│   ├── services/
│   │   └── apiService.js       # Unified API layer (Z.ai, CodeBuddy, OpenAI-compatible)
│   ├── data/
│   │   └── store.js            # localStorage data layer + audit trail
│   ├── App.jsx                 # Root component + navigation (with Settings tab)
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

### Step 1: Complete Onboarding

1. **Onboarding** — Fill in 4 steps: Business Info → Financial Picture → Operations → Psychometric Quiz
2. You'll receive your **credit score out of 100** within ~3 minutes

### Step 2: Explore Your Dashboard

3. **Dashboard** — View your credit score, pillar breakdown, and score trend over time
4. **Score tab** — Detailed score card with band label and improvement suggestions
5. **Action Plan** — Track your personalised tasks sorted by impact
6. Click **"Re-assess My Score"** anytime to re-take the assessment. Previous results are saved in the audit history.

---

## AI Coach (Aria) Setup & Usage

The app comes with a built-in AI credit coach called **Aria**. She works in two modes:

| Mode | When Used | Response Quality |
|---|---|---|
| **AI-Powered (default after config)** | API key configured | Real-time, intelligent, contextual responses |
| **Rule-based Fallback** | No API key, or API unreachable | Pre-written template responses |

> **Important:** The app works perfectly without any API configuration — Aria will use rule-based responses automatically. But connecting an AI provider gives you much richer, more natural conversations.

### How to Connect an AI Provider

1. Open the app in your browser
2. Tap **Settings** in the bottom navigation bar (rightmost icon)
3. Choose your provider:

| Provider | Best For | Where to Get API Key |
|---|---|---|
| **Z.ai (GLM-5 Plus)** | Powerful multilingual AI, great for financial advice | [open.bigmodel.cn](https://open.bigmodel.cn) |
| **CodeBuddy AI** | Optimized for code & analysis tasks | [codebuddy.ai](https://www.codebuddy.ai) |
| **OpenAI Compatible** | Any provider with `/chat/completions` endpoint (e.g., OpenAI, Anthropic via proxy, local LLMs) | Your chosen provider's dashboard |

4. Enter your **API Key**
5. Optionally customize **Base URL** and **Model Name** (for custom providers)
6. Click **Test Connection** to verify it works
7. Click **Save Configuration**

#### Z.ai (GLM-5) Quick Start

1. Go to [open.bigmodel.cn](https://open.bigmodel.cn) and create a free account
2. Navigate to **API Keys** in the console
3. Create a new API key and copy it
4. In the app Settings tab:
   - Select **Z.ai (GLM-5)** as the provider
   - Paste your API key
   - Model defaults to `glm-5-plus`
5. Test → Save

#### CodeBuddy AI Quick Start

1. Get your CodeBuddy API key from your [CodeBuddy dashboard](https://www.codebuddy.ai)
2. In the app Settings tab:
   - Select **CodeBuddy AI** as the provider
   - Paste your API key
3. Test → Save

#### Custom / OpenAI-Compatible Provider

1. In the app Settings tab, select **OpenAI Compatible**
2. Fill in:
   - **API Key**: Your provider's key (e.g., `sk-...`)
   - **Base URL**: The full endpoint URL (e.g., `https://api.openai.com/v1` or `http://localhost:1234/v1`)
   - **Model Name**: The model identifier (e.g., `gpt-4o`, `claude-sonnet`, etc.)
3. Test → Save

### Chatting with Aria

After completing onboarding (and optionally configuring AI), go to the **Coach** tab:

**Example questions you can ask:**

| Question | What Aria Does |
|---|---|
| *"Why is my score low?"* | Analyzes your weakest pillars with specific gaps |
| *"How do I get a loan?"* | Maps your path to loan readiness with steps |
| *"What should I do first?"* | Ranks actions by highest score impact |
| *"Am I bank ready?"* | Checks if you meet the 75+ threshold |
| *"How do I register my business?"* | Step-by-step registration guide |
| *"How can I improve my score quickly?"* | Top 3 fastest-improvement actions |
| *"Help me manage my debt"* | Debt snowball strategy + targets |

**Response Indicators:**
- 🟣 **AI Powered** badge = response generated by real LLM (your configured API)
- 🟢 **Rule-based** badge = pre-written fallback (no API or offline)
- Each response ends with clickable **suggestion chips** for follow-up questions

### Security Notes

- **API keys are stored only in your browser's `localStorage`** — never sent anywhere except your selected provider's API endpoint
- No server-side data collection — everything stays client-side
- To remove stored keys: go to Settings → **Clear Keys** button

---

## License

MIT License — free to use, modify, and distribute.
