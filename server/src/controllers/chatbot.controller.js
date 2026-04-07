const db = require("../../config/db");

// ─────────────────────────────────────────────────────────────
// Smart context-aware response engine
// ─────────────────────────────────────────────────────────────

const SEVERITY_ORDER = ["normal", "mild", "moderate", "severe", "extremely_severe"];

function isAtLeast(level, threshold) {
  return SEVERITY_ORDER.indexOf(level) >= SEVERITY_ORDER.indexOf(threshold);
}

const GREETINGS = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "howdy", "sup"];
const THANKS = ["thank", "thanks", "thank you", "ty", "thx"];
const FAREWELLS = ["bye", "goodbye", "see you", "later", "take care"];

function matchesAny(msg, list) {
  const lower = msg.toLowerCase();
  return list.some(w => lower.includes(w));
}

function extractKeywords(msg) {
  const lower = msg.toLowerCase();
  return {
    isGreeting: matchesAny(msg, GREETINGS),
    isThankYou: matchesAny(msg, THANKS),
    isFarewell: matchesAny(msg, FAREWELLS),
    feelsSad: /\b(sad|depress|down|hopeless|empty|cry|crying|tears|grief|lonely|alone|worthless|low)\b/.test(lower),
    feelsAnxious: /\b(anxious|anxiety|panic|worried|worry|fear|scared|nervous|dread|overwhelm|overthink)\b/.test(lower),
    feelsStressed: /\b(stress|stressed|burnout|exhaust|tired|pressure|overload|can'?t cope|too much)\b/.test(lower),
    sleepIssue: /\b(sleep|insomnia|awake|nightmares?|rest|fatigue|drowsy|can'?t sleep)\b/.test(lower),
    angryOrFrustrated: /\b(angry|anger|frustrat|furious|irritat|annoy|mad|rage)\b/.test(lower),
    askingForHelp: /\b(help|advice|suggest|recommend|what should|how (can|do) i|tips?|guide)\b/.test(lower),
    askingAboutSelf: /\b(my (results?|assessment|score|dass|report)|how (am|do) i (doing|look)|my (mental|health) (status|state))\b/.test(lower),
    feelingBetter: /\b(better|good|great|amazing|happy|improved|positive|well|fantastic|okay now)\b/.test(lower),
    breathing: /\b(breath|breathe|breathing)\b/.test(lower),
    meditation: /\b(meditat|mindful)\b/.test(lower),
    journaling: /\b(journal|write|writing|diary)\b/.test(lower),
    exercise: /\b(exercise|workout|walk|run|movement|yoga|stretch)\b/.test(lower),
  };
}

function getGreeting(name) {
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${timeGreet}, ${name}! 😊 I'm MindKare — your personal wellness companion. How are you feeling today? I'm here to listen and support you.`;
}

function buildContextSummary(assessment) {
  if (!assessment) return null;
  const { depression_level: d, anxiety_level: a, stress_level: s, overall_severity: o } = assessment;
  return { d, a, s, o };
}

function generateResponse(msg, userName, ctx, recentMoods, recentJournals, isFirstMessage) {
  const k = extractKeywords(msg);
  const name = userName || "friend";

  // First message ever — warm welcome
  if (isFirstMessage) {
    return getGreeting(name);
  }

  // Greetings
  if (k.isGreeting) {
    return `Hey ${name}! 👋 Great to see you. How are you feeling right now? You can share anything — I'm fully here for you.`;
  }

  // Farewells
  if (k.isFarewell) {
    return `Take care, ${name}! 🌟 Remember, every small step counts. Come back anytime you need support. You've got this! 💙`;
  }

  // Thank you
  if (k.isThankYou) {
    return `You're very welcome, ${name}! 💙 That's what I'm here for. Is there anything else on your mind that you'd like to talk about?`;
  }

  // Feeling better
  if (k.feelingBetter) {
    return `That's wonderful to hear, ${name}! 🌟 Progress, even small progress, matters so much. What do you think helped you feel better? Recognizing what works is a powerful step toward lasting wellness.`;
  }

  // Asking about their assessment results
  if (k.askingAboutSelf && ctx) {
    const { d, a, s, o } = ctx;
    return `Based on your DASS-21 assessment, here's a snapshot of where you stand:\n\n` +
      `• 🧠 **Depression:** ${formatLevel(d)}\n` +
      `• 😰 **Anxiety:** ${formatLevel(a)}\n` +
      `• ⚡ **Stress:** ${formatLevel(s)}\n\n` +
      `Your overall level is **${formatLevel(o)}**.\n\n` +
      getPersonalizedAdvice(ctx) +
      `\n\nWould you like to dive deeper into any of these areas?`;
  }

  // Breathing / specific technique queries
  if (k.breathing) {
    return `Breathing exercises are incredibly effective, ${name}! Here's a simple technique:\n\n` +
      `**4-7-8 Breathing:**\n` +
      `1. Inhale quietly through your nose for **4 seconds**\n` +
      `2. Hold your breath for **7 seconds**\n` +
      `3. Exhale completely through your mouth for **8 seconds**\n\n` +
      `Repeat 3–4 times. This activates your parasympathetic nervous system and calms anxiety within minutes. Try it now if you'd like! 🌬️`;
  }

  if (k.meditation) {
    return `Mindfulness meditation is a powerful tool, ${name}! 🧘\n\n` +
      `Try this 5-minute grounding exercise:\n` +
      `1. Sit comfortably and close your eyes\n` +
      `2. Notice **5 things** you can see (around you)\n` +
      `3. Notice **4 things** you can touch\n` +
      `4. Notice **3 things** you can hear\n` +
      `5. Notice **2 things** you can smell\n` +
      `6. Notice **1 thing** you can taste\n\n` +
      `This 5-4-3-2-1 grounding technique brings you fully into the present moment. How do you feel afterward?`;
  }

  if (k.journaling) {
    return `Journaling is one of the most powerful tools for mental wellness, ${name}! ✍️\n\n` +
      `Here are some prompts to get started:\n` +
      `• "Today I felt ___ because ___"\n` +
      `• "One thing I'm grateful for today is ___"\n` +
      `• "A challenge I faced was ___, and I dealt with it by ___"\n\n` +
      `Even 5–10 minutes of journaling daily can significantly reduce stress and improve clarity. You can use the Journal section in this app to track your entries! 📓`;
  }

  if (k.exercise) {
    return `Movement is medicine, ${name}! 🏃\n\n` +
      `Even a 20-minute walk outside can boost serotonin and dopamine levels significantly. Here are some options:\n` +
      `• **Light walk:** Great for clearing your head\n` +
      `• **Yoga:** Combines movement with mindfulness\n` +
      `• **Stretching:** Releases physical tension from stress\n` +
      `• **Dancing:** Surprisingly effective mood booster! 💃\n\n` +
      `What type of movement feels most accessible for you right now?`;
  }

  // Sad / depressed
  if (k.feelsSad) {
    const baseResponse = `I hear you, ${name}, and I want you to know — it's completely okay to feel this way. Your feelings are valid. 💙\n\n`;
    if (ctx && isAtLeast(ctx.d, "moderate")) {
      return baseResponse +
        `Based on your assessment, you've been experiencing elevated depressive feelings. Here are things that can genuinely help:\n\n` +
        `• **Journaling:** Writing down even 3 things you're grateful for daily rewires the brain over time\n` +
        `• **Behavioral activation:** Start with one tiny enjoyable activity — even something you used to love\n` +
        `• **Sunlight:** 15–20 minutes outside can meaningfully shift mood\n` +
        `• **Connection:** Reaching out to even one trusted person helps\n\n` +
        `Would you like to talk about what's been weighing on you? Sometimes just expressing it helps lighten the load.`;
    }
    return baseResponse +
      `Sadness is a natural emotion and it will pass. A few things that often help:\n\n` +
      `• Allow yourself to feel it — don't push it away\n` +
      `• Write about it in your journal\n` +
      `• Do one small kind thing for yourself today\n` +
      `• Reach out to someone you trust\n\n` +
      `What do you think triggered this feeling?`;
  }

  // Anxious
  if (k.feelsAnxious) {
    const baseResponse = `Anxiety can feel so overwhelming, ${name}. You're not alone in this. 🌿\n\n`;
    if (ctx && isAtLeast(ctx.a, "moderate")) {
      return baseResponse +
        `Your assessment shows elevated anxiety levels. Let me share what helps most:\n\n` +
        `• **Right now:** Try box breathing — inhale 4s, hold 4s, exhale 4s, hold 4s\n` +
        `• **Short term:** Limit caffeine and screens before bed\n` +
        `• **Daily practice:** 10 minutes of mindfulness meditation\n` +
        `• **Physical:** Regular exercise is clinically proven to reduce anxiety\n\n` +
        `What's triggering your anxiety most right now? Let's work through it together.`;
    }
    return baseResponse +
      `Here's something you can try right now:\n\n` +
      `**Grounding technique:** Name 5 things you can see around you right now. This brings you back to the present moment and interrupts the anxiety spiral.\n\n` +
      `Can you try that and tell me how it feels?`;
  }

  // Stressed
  if (k.feelsStressed) {
    const baseResponse = `Stress is your body signaling it needs attention, ${name}. Let's work through this together. 💪\n\n`;
    if (ctx && isAtLeast(ctx.s, "moderate")) {
      return baseResponse +
        `Your stress levels have been elevated. Here's a structured approach:\n\n` +
        `• **Identify:** What are the top 2–3 stressors right now?\n` +
        `• **Prioritize:** What genuinely needs your attention vs what can wait?\n` +
        `• **Body first:** Stress lives in the body — a 10-min walk or stretching session helps\n` +
        `• **Boundaries:** Practice saying no to one thing that drains you this week\n\n` +
        `What's the biggest source of stress for you right now?`;
    }
    return baseResponse +
      `Try this quick stress reset:\n\n` +
      `1. Step away from screens for 5 minutes\n` +
      `2. Take 5 slow deep breaths\n` +
      `3. Write down what's actually in your control vs what isn't\n\n` +
      `Often, stress decreases significantly when we focus only on what we can actually change. What's stressing you out?`;
  }

  // Sleep issues
  if (k.sleepIssue) {
    return `Poor sleep and mental health are deeply connected, ${name}. 😴\n\n` +
      `Here are evidence-based sleep tips:\n\n` +
      `• **Consistent schedule:** Sleep and wake at the same time daily, even weekends\n` +
      `• **Screen-free hour:** No phone/TV 1 hour before bed — blue light suppresses melatonin\n` +
      `• **Cool room:** 65–68°F (18–20°C) is optimal for sleep\n` +
      `• **4-7-8 breathing:** Helps calm your nervous system before sleep\n` +
      `• **Limit caffeine:** After 2pm, avoid coffee and energy drinks\n\n` +
      `How many hours of sleep are you getting on average?`;
  }

  // Angry / frustrated
  if (k.angryOrFrustrated) {
    return `It's okay to feel angry or frustrated, ${name} — those feelings carry important information. 🔥\n\n` +
      `The key is healthy expression:\n\n` +
      `• **Physical release:** Go for a brisk walk, do jumping jacks, or exercise\n` +
      `• **Write it out:** Put the anger on paper — don't filter yourself\n` +
      `• **Pause before reacting:** Count to 10, or take 5 minutes before responding in conflict\n` +
      `• **Name it:** "I feel frustrated because ___" — labeling emotions reduces their intensity\n\n` +
      `What's sparking this feeling for you?`;
  }

  // General help request
  if (k.askingForHelp) {
    if (ctx) {
      return getPersonalizedAdvice(ctx) +
        `\n\nThese recommendations are personalized based on your DASS-21 results. Which one would you like to explore further?`;
    }
    return `I'm here to help, ${name}! 💙 Here are some things we can explore together:\n\n` +
      `• 🧘 **Breathing & Relaxation techniques**\n` +
      `• ✍️ **Journaling prompts** to process emotions\n` +
      `• 🏃 **Movement & exercise** recommendations\n` +
      `• 😴 **Sleep hygiene** tips\n` +
      `• 💬 **Talking through** what's on your mind\n\n` +
      `What would be most helpful for you right now?`;
  }

  // Include recent mood context if available
  if (recentMoods && recentMoods.length > 0) {
    const lastMood = recentMoods[0];
    const moodAge = Math.floor((Date.now() - new Date(lastMood.created_at).getTime()) / (1000 * 60 * 60));
    if (moodAge < 24) {
      return `I noticed you logged a **${lastMood.mood}** mood recently (intensity ${lastMood.intensity}/5). ${moodAge < 2 ? "That was just a couple hours ago." : `About ${moodAge} hours ago.`}\n\n` +
        `How are you feeling now compared to then? Sometimes talking through what shifted can be really helpful. I'm listening. 👂`;
    }
  }

  // Default conversational response
  const defaults = [
    `Thank you for sharing that with me, ${name}. 💙 I'm here and I'm listening. Can you tell me more about what you're experiencing? The more you share, the better I can support you.`,
    `I appreciate you opening up, ${name}. Sometimes just putting thoughts into words is the first step toward feeling better. What's been on your mind the most lately?`,
    `That's something worth exploring together, ${name}. How long have you been feeling this way? And is there anything specific that triggered it, or did it come gradually?`,
    `I hear you, ${name}. Your feelings are valid. Mental wellness is a journey, not a destination — and you're already taking a great step by talking about it. What would feel most supportive right now?`,
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

function formatLevel(level) {
  if (!level) return "Not assessed";
  return level.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getPersonalizedAdvice(ctx) {
  const lines = [];

  if (isAtLeast(ctx.d, "moderate")) {
    lines.push("• **For depression:** Daily journaling, gratitude practice (3 things/day), and behavioral activation (doing one small enjoyable thing daily)");
  }
  if (isAtLeast(ctx.a, "moderate")) {
    lines.push("• **For anxiety:** Box breathing exercises, the 5-4-3-2-1 grounding technique, and limiting news/social media");
  }
  if (isAtLeast(ctx.s, "moderate")) {
    lines.push("• **For stress:** Progressive muscle relaxation, time-boxing tasks, and regular physical movement");
  }
  if (ctx.d === "normal" && ctx.a === "normal" && ctx.s === "normal") {
    lines.push("• You're doing well overall! Maintain your wellness with consistent sleep, movement, and mindfulness.");
  }

  return lines.length
    ? `Here are personalized recommendations based on your profile:\n\n${lines.join("\n")}`
    : `Focus on consistent sleep, daily movement, and keeping your journal up to date — these are the foundations of great mental wellness.`;
}

// ─────────────────────────────────────────────────────────────
// Controller functions
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/chatbot/history
 */
async function getChatHistory(req, res) {
  try {
    const result = await db.query(
      `SELECT id, user_message, bot_response, created_at
       FROM chatbot_logs
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("getChatHistory error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/chatbot/message
 */
async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user.id;
    const isInit = message.trim() === "__init__";

    // Fetch user info
    const userResult = await db.query(
      "SELECT name FROM users WHERE id = $1",
      [userId]
    );
    const userName = userResult.rows[0]?.name || "friend";

    // Check if this is first message (before any DB insert)
    const historyCount = await db.query(
      "SELECT COUNT(*) FROM chatbot_logs WHERE user_id = $1",
      [userId]
    );
    const isFirstMessage = parseInt(historyCount.rows[0].count) === 0;

    // For __init__ sentinel: just return greeting without saving to DB
    if (isInit) {
      const greeting = getGreeting(userName);
      return res.json({ response: greeting });
    }

    // Fetch latest assessment for context
    const assessmentResult = await db.query(
      `SELECT depression_level, anxiety_level, stress_level, sleep_risk, screen_risk, overall_severity
       FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    const assessment = assessmentResult.rows[0] || null;
    const ctx = buildContextSummary(assessment);

    // Fetch recent moods (last 5)
    const moodResult = await db.query(
      `SELECT mood, intensity, note, created_at FROM mood_entries
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );
    const recentMoods = moodResult.rows;

    // Fetch recent journals (last 3)
    const journalResult = await db.query(
      `SELECT title, content, mood, created_at FROM journal_entries
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [userId]
    );
    const recentJournals = journalResult.rows;

    // Generate response
    const botResponse = generateResponse(
      message,
      userName,
      ctx,
      recentMoods,
      recentJournals,
      isFirstMessage
    );

    // Save to DB
    await db.query(
      `INSERT INTO chatbot_logs (user_id, user_message, bot_response)
       VALUES ($1, $2, $3)`,
      [userId, message.trim(), botResponse]
    );

    return res.json({ response: botResponse });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getChatHistory, sendMessage };
