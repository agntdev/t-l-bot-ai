import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const COMPLAINT_WORDS = [
  "merde", "putain", "connard", "enculé", "nique", "salope",
  "fuck", "shit", "damn", "ass", "bitch",
  "mierda", "puta", "verga", "pendejo",
  "scheiße", "verdammt", "mist",
];

const RATE_LIMIT_PER_MINUTE = 30;
const RATE_LIMIT_PER_HOUR = 200;
const HISTORY_LIMIT = 20;

const LANG_PATTERNS: Record<string, RegExp> = {
  fr: /[àâäéèêëïîôùûüÿçœæ]/i,
  es: /[áéíóúñ¿¡]/i,
  de: /[äöüß]/i,
  it: /[àèéìíîòóùú]/i,
};

function detectLanguage(text: string): string {
  for (const [lang, pattern] of Object.entries(LANG_PATTERNS)) {
    if (pattern.test(text)) return lang;
  }
  return "fr";
}

function containsAbuse(text: string): boolean {
  const lower = text.toLowerCase();
  return COMPLAINT_WORDS.some((w) => lower.includes(w));
}

function isRateLimited(ctx: Ctx): boolean {
  const now = Date.now();
  const window = ctx.session.rateLimitWindow ?? 0;
  const count = ctx.session.rateLimitCount ?? 0;

  if (now - window > 60_000) {
    ctx.session.rateLimitWindow = now;
    ctx.session.rateLimitCount = 1;
    return false;
  }

  if (count >= RATE_LIMIT_PER_MINUTE) return true;

  ctx.session.rateLimitCount = count + 1;
  return false;
}

function buildResponse(prompt: string, history: Ctx["session"]["messageHistory"], style: string): string {
  const recent = (history ?? []).slice(-6);
  const contextSummary = recent.map((m) => m.content).join(" ");
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("bonjour") || lowerPrompt.includes("salut") || lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
    const greetings: Record<string, string> = {
      fr: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      en: "Hello! How can I help you today?",
      es: "¡Hola! ¿Cómo puedo ayudarte hoy?",
      de: "Hallo! Wie kann ich Ihnen heute helfen?",
      it: "Ciao! Come posso aiutarti oggi?",
    };
    return greetings[detectLanguage(prompt)] ?? greetings.fr;
  }

  if (lowerPrompt.includes("merci") || lowerPrompt.includes("thanks")) {
    const thanks: Record<string, string> = {
      fr: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.",
      en: "You're welcome! Feel free to ask if you have more questions.",
      es: "¡De nada! No dudes en hacer más preguntas.",
      de: "Bitte! Zögern Sie nicht, weitere Fragen zu stellen.",
      it: "Prego! Non esitare a fare altre domande.",
    };
    return thanks[detectLanguage(prompt)] ?? thanks.fr;
  }

  if (lowerPrompt.includes("aide") || lowerPrompt.includes("help") || lowerPrompt.includes("ayuda") || lowerPrompt.includes("hilfe")) {
    const helps: Record<string, string> = {
      fr: "Je peux vous aider avec des questions, de la rédaction, des traductions, ou tout autre texte. Posez-moi votre question !",
      en: "I can help with questions, writing, translations, or any other text. Just ask!",
      es: "Puedo ayudarte con preguntas, escritura, traducciones o cualquier otro texto. ¡Pregunta!",
      de: "Ich kann bei Fragen, Texten, Übersetzungen oder jedem anderen Text helfen. Fragen Sie einfach!",
      it: "Posso aiutarti con domande, scrittura, traduzioni o qualsiasi altro testo. Chiedi pure!",
    };
    return helps[detectLanguage(prompt)] ?? helps.fr;
  }

  if (lowerPrompt.includes("qui es-tu") || lowerPrompt.includes("who are you") || lowerPrompt.includes("qué eres")) {
    return "Je suis TéléBot AI, votre assistant conversationnel. Je peux vous aider avec vos questions et vos projets de texte.";
  }

  if (contextSummary) {
    const locale = detectLanguage(prompt);
    const responses: Record<string, string[]> = {
      fr: [
        `En regardant notre conversation, je comprends que vous parlez de "${prompt.slice(0, 50)}". Pouvez-vous me donner plus de détails ?`,
        `Intéressant ! Suite à notre échange précédent, voici ma réponse : ${prompt} est un sujet que nous pouvons approfondir.`,
        `D'après le contexte de notre discussion, je vois que vous vous intéressez à "${prompt.slice(0, 40)}". Voulez-vous que j'explique davantage ?`,
      ],
      en: [
        `Looking at our conversation, I understand you're asking about "${prompt.slice(0, 50)}". Can you give me more details?`,
        `Interesting! Following our previous exchange, here's my response: ${prompt} is a topic we can explore further.`,
        `Based on the context of our discussion, I see you're interested in "${prompt.slice(0, 40)}". Would you like me to explain more?`,
      ],
    };
    const pool = responses[locale] ?? responses.fr;
    return pool[Math.floor(Date.now() % pool.length)];
  }

  return `Merci pour votre message. Je suis prêt à vous aider avec "${prompt.slice(0, 60)}". Pouvez-vous préciser votre demande ?`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

const composer = new Composer<Ctx>();

composer.on("message:text", async (ctx, next) => {
  const prompt = ctx.message.text.trim();
  if (!prompt) return next();

  if (ctx.message.entities?.some((e) => e.type === "bot_command")) return next();

  if (containsAbuse(prompt)) {
    await ctx.reply("Ce message contient du langage inapproprié. Veuillez reformuler votre demande.");
    return;
  }

  if (isRateLimited(ctx)) {
    await ctx.reply("Vous envoyez trop de messages. Ralentissez un peu et réessayez dans quelques instants.");
    return;
  }

  const style = ctx.session.responseStyle ?? "balanced";
  const history = ctx.session.messageHistory ?? [];
  const response = buildResponse(prompt, history, style);

  let finalResponse = response;
  if (style === "concise") {
    finalResponse = truncate(response, 150);
  } else if (style === "detailed") {
    finalResponse = response + "\n\nN'hésitez pas à me poser d'autres questions pour approfondir.";
  }

  ctx.session.messageHistory = [
    ...history.slice(-(HISTORY_LIMIT - 2)),
    { role: "user", content: prompt, timestamp: Date.now() },
    { role: "assistant", content: finalResponse, timestamp: Date.now() },
  ];
  ctx.session.lastResponse = finalResponse;
  ctx.session.lastPrompt = prompt;

  await ctx.reply(finalResponse, {
    reply_markup: inlineKeyboard([
      [
        inlineButton("Développer", "expand_response"),
        inlineButton("Raccourcir", "shorten_response"),
      ],
      [inlineButton("⬅️ Menu", "menu:main")],
    ]),
  });
});

export default composer;
