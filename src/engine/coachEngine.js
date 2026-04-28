/**
 * AI Credit Coach Engine
 * Rule-based NLU + generative responses for credit coaching
 */

import { analyzeGaps, generateActionPlan, scoreToBand } from './scoringEngine';

// Intent classifier
function classifyIntent(message) {
  const msg = message.toLowerCase();
  if (/why.*low|score.*bad|score.*poor|low.*score/.test(msg)) return 'explain_low_score';
  if (/how.*loan|get.*loan|apply.*loan|loan.*how/.test(msg)) return 'loan_guidance';
  if (/improve.*score|raise.*score|increase.*score|boost.*score/.test(msg)) return 'improve_score';
  if (/action plan|what.*do|next step|what.*focus|where.*start/.test(msg)) return 'action_plan';
  if (/ready.*bank|bank.*ready|apply.*bank|credit.*ready/.test(msg)) return 'bank_readiness';
  if (/debt|loan.*repay|owe/.test(msg)) return 'debt_advice';
  if (/register|formal|license|permit/.test(msg)) return 'registration_advice';
  if (/digital|online|social media|google|website/.test(msg)) return 'digital_advice';
  if (/saving|emergency|fund|buffer/.test(msg)) return 'savings_advice';
  if (/greeting|hello|hi |hey /.test(msg)) return 'greeting';
  if (/thank|great|awesome|perfect/.test(msg)) return 'affirmation';
  if (/score|result|pillar|breakdown/.test(msg)) return 'score_details';
  return 'general';
}

// Response generator
export function generateCoachResponse(message, assessmentData) {
  const intent = classifyIntent(message);
  const { scoreTotal, pillars, band } = assessmentData || {};

  if (!assessmentData) {
    return {
      text: "Hi! I'm Aria, your AI Credit Coach 👋 Complete your credit assessment first, and I'll give you personalized insights to help you become bankable. Head to the Assessment tab to get started!",
      suggestions: ['Start my assessment', 'What is credit readiness?', 'How does scoring work?'],
    };
  }

  const gaps = analyzeGaps(pillars);
  const actionPlan = generateActionPlan(pillars);
  const worstPillar = Object.entries(pillars).sort((a, b) => a[1].score - b[1].score)[0];
  const bestPillar = Object.entries(pillars).sort((a, b) => b[1].score - a[1].score)[0];

  switch (intent) {
    case 'greeting':
      return {
        text: `Hello! I'm Aria, your Credit Coach 😊 Your current credit score is **${scoreTotal}/100** — ${band.label}.\n\nI'm here to help you understand your score and create a clear path to bankability. What would you like to explore?`,
        suggestions: ['Why is my score this level?', 'What should I focus on?', 'How do I get a loan?'],
      };

    case 'explain_low_score': {
      const topGaps = gaps.slice(0, 3);
      let text = `Great question! Your score of **${scoreTotal}/100** reflects gaps in a few key areas:\n\n`;
      topGaps.forEach((g, i) => {
        text += `**${i + 1}. ${g.item}** (${g.pillar})\n📌 ${g.note}\n\n`;
      });
      text += `Your weakest area is **${worstPillar[1].label}** at ${worstPillar[1].score}/100. Improving this pillar alone could add 10-20 points to your overall score.`;
      return {
        text,
        suggestions: [`How do I fix ${topGaps[0]?.item}?`, 'Show me my action plan', 'What is my best pillar?'],
      };
    }

    case 'loan_guidance': {
      const pointsNeeded = Math.max(0, 75 - scoreTotal);
      const topActions = actionPlan.slice(0, 3);
      let text = `Let me map out your loan readiness path! 🎯\n\n`;
      if (scoreTotal >= 75) {
        text += `✅ **You're already loan-ready!** Your score of ${scoreTotal}/100 puts you in the "${band.label}" band.\n\nNext steps to apply:\n1. Gather last 6 months of bank statements\n2. Prepare business registration documents\n3. Have a clear loan purpose statement\n4. Approach microfinance institutions or your bank's SME division`;
      } else {
        text += `You need **${pointsNeeded} more points** to reach the "Credit Ready" threshold (75+).\n\n**Fastest ways to get there:**\n`;
        topActions.forEach((a, i) => {
          text += `${i + 1}. ${a.task} → **${a.impact}** (${a.timeframe})\n`;
        });
        text += `\nEstimated time to loan readiness: **${pointsNeeded <= 20 ? '1-2 months' : pointsNeeded <= 40 ? '3-4 months' : '6+ months'}**`;
      }
      return {
        text,
        suggestions: ['Show full action plan', 'How do I open a bank account?', 'What documents do lenders need?'],
      };
    }

    case 'improve_score': {
      const topAction = actionPlan[0];
      let text = `Here are your **top 3 highest-impact actions** to improve your score:\n\n`;
      actionPlan.slice(0, 3).forEach((a, i) => {
        text += `**${i + 1}. ${a.task}**\n⏱ ${a.timeframe} | 📈 ${a.impact}\n💡 ${a.reason}\n\n`;
      });
      text += `Start with #1 today — it has the biggest impact and shortest timeframe!`;
      return {
        text,
        suggestions: ['Mark task 1 as started', 'Show my full plan', 'How long until I reach 75?'],
      };
    }

    case 'action_plan': {
      let text = `Here's your personalised **8-Step Action Plan** to credit readiness:\n\n`;
      actionPlan.forEach((a) => {
        const icon = a.priority === 'high' ? '🔴' : '🟡';
        text += `${icon} **${a.task}**\n📁 ${a.category} | ⏱ ${a.timeframe} | 📈 ${a.impact}\n\n`;
      });
      return {
        text,
        suggestions: ['Start with the first task', 'Which is most urgent?', 'How much can I improve?'],
      };
    }

    case 'bank_readiness': {
      let text = '';
      if (scoreTotal >= 75) {
        text = `🎉 **Yes, you are bank-ready!**\n\nYour score of ${scoreTotal}/100 qualifies you for formal credit products. Here's what to do:\n\n1. **Microfinance loans** – Apply at any MFI with your business docs\n2. **SME bank products** – Visit your bank's business banking branch\n3. **Government schemes** – Check MUDRA loans or equivalents in your country\n\nYour strongest assets: **${bestPillar[1].label}** (${bestPillar[1].score}/100)`;
      } else {
        text = `Not quite yet — but you're **${scoreTotal}/100** and the threshold is **75**. You need ${75 - scoreTotal} more points.\n\n`;
        text += `**What's holding you back:**\n${gaps.slice(0, 3).map(g => `• ${g.note}`).join('\n')}\n\n`;
        text += `Complete your action plan and you could be bank-ready in **${75 - scoreTotal <= 20 ? '1-2 months' : '3-6 months'}**.`;
      }
      return {
        text,
        suggestions: ['What banks work with small businesses?', 'Show my action plan', 'What documents do I need?'],
      };
    }

    case 'debt_advice':
      return {
        text: `Managing debt well is key to your credit score! Here's a framework:\n\n**Debt Snowball Strategy:**\n1. List all debts from smallest to largest\n2. Pay minimums on all, extra on the smallest\n3. When smallest is paid, roll that payment to the next\n\n**Debt-to-Revenue target:** Keep below 20% for the best credit score impact.\n\nYour current debt situation contributes to your **Financial Health** score of ${pillars.financial.score}/100.`,
        suggestions: ['How does debt affect my score?', 'Show financial tips', 'Create debt payoff plan'],
      };

    case 'digital_advice':
      return {
        text: `Building a digital presence is one of the **fastest wins** for your credit score!\n\n**3 Quick Wins (All Free):**\n1. **Google Business Profile** (30 mins) → +7 pts\n2. **Facebook Business Page** (1 hour) → +8 pts\n3. **Mobile Money Account** (1 day) → +20 pts\n\nYour **Alternative Data** score is currently ${pillars.alternative.score}/100. Digital presence improvements can push this to 70+ quickly!`,
        suggestions: ['How to create Google Business?', 'Which mobile money is best?', 'Show all digital tasks'],
      };

    case 'savings_advice':
      return {
        text: `An emergency fund is your **financial safety net** and a major credit signal! 🛡️\n\n**Goal:** 3 months of operating expenses\n\n**How to build it:**\n1. Calculate your monthly costs: $___\n2. Open a separate savings account\n3. Automate 10% of revenue into it each month\n4. Do not touch it for non-emergencies\n\n**Impact:** A 3-month buffer adds up to **+15 points** to your Financial Health score.`,
        suggestions: ['How much should I save?', 'Best savings accounts for businesses', 'Show financial action plan'],
      };

    case 'score_details':
      return {
        text: `Here's your full credit score breakdown:\n\n📊 **Overall Score: ${scoreTotal}/100** (${band.label})\n\n` +
          Object.entries(pillars).map(([k, p]) =>
            `**${p.label}** — ${p.score}/100 (Weight: ${p.weight}%)\n${p.score >= 70 ? '✅ Strong' : p.score >= 40 ? '⚠️ Needs work' : '🔴 Critical gap'}`
          ).join('\n\n'),
        suggestions: ['Why is my financial score low?', 'How to improve operations?', 'Show action plan'],
      };

    case 'affirmation':
      return {
        text: `That's the spirit! 💪 Every step forward builds your creditworthiness. Stay consistent, and you'll reach Credit Ready status before you know it.\n\nCurrent progress: **${scoreTotal}/100** — ${100 - scoreTotal} points to maximum score!`,
        suggestions: ['What\'s my next task?', 'Show my progress', 'How close am I to a loan?'],
      };

    case 'registration_advice':
      return {
        text: `Business registration is one of the **highest-impact actions** you can take! 📋\n\n**Why it matters:**\n• Unlocks **+25 points** to your Operational Stability score\n• Makes you eligible for formal loans\n• Enables you to open business bank accounts\n• Protects your personal assets\n\n**Steps to register:**\n1. Choose business structure (Sole Trader / Partnership / LLC)\n2. Visit your local business registration office\n3. Obtain a Business ID / Registration Number\n4. Get any required sector-specific licenses\n\nCost: Usually $50–$500 depending on your state/country`,
        suggestions: ['What documents do I need?', 'Show registration checklist', 'Update my registration status'],
      };

    default:
      return {
        text: `I'm Aria, your Credit Coach! Here's a quick summary:\n\n📊 **Your Score: ${scoreTotal}/100** (${band.label})\n🎯 **Biggest opportunity:** ${worstPillar[1].label} (${worstPillar[1].score}/100)\n⚡ **Top priority:** ${actionPlan[0]?.task || 'Complete your assessment'}\n\nWhat would you like to explore in more depth?`,
        suggestions: ['Why is my score this level?', 'Show action plan', 'How to get a loan?'],
      };
  }
}

export const STARTER_PROMPTS = [
  "Why is my score low?",
  "How do I get a loan?",
  "What should I do first?",
  "Am I ready for a bank loan?",
  "How can I improve my score quickly?",
];
