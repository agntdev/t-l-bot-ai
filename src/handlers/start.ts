import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { mainMenuKeyboard, inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";

registerMainMenuItem({ label: "💬 Chat", data: "chat:start", order: 10 });

const composer = new Composer<Ctx>();

const WELCOME_FR = "👋 Bienvenue ! Je suis TéléBot AI, votre assistant conversationnel.\n\nEnvoyez-moi un message ou choisissez une option ci-dessous.";
const WELCOME_EN = "👋 Welcome! I'm TéléBot AI, your conversational assistant.\n\nSend me a message or choose an option below.";

composer.command("start", async (ctx) => {
  if (!ctx.session.locale) {
    const lang = ctx.from?.language_code?.split("-")[0] ?? "fr";
    const supported = ["fr", "en", "es", "de", "it"];
    ctx.session.locale = supported.includes(lang) ? lang : "fr";
    ctx.session.responseStyle = "balanced";
    ctx.session.messageHistory = [];
  }

  const welcome = ctx.session.locale === "fr" ? WELCOME_FR : WELCOME_EN;
  await ctx.reply(welcome, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  const welcome = ctx.session.locale === "fr" ? WELCOME_FR : WELCOME_EN;
  await ctx.editMessageText(welcome, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("chat:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  const locale = ctx.session.locale ?? "fr";
  const prompts: Record<string, string[]> = {
    fr: ["Explique-moi un concept", "Aide-moi à rédiger", "Traduis un texte", "Résume un sujet"],
    en: ["Explain a concept", "Help me write", "Translate text", "Summarize a topic"],
  };
  const examples = prompts[locale] ?? prompts.fr;

  const text = locale === "fr"
    ? "💬 Posez-moi une question ou tapez votre message directement."
    : "💬 Ask me a question or type your message directly.";

  await ctx.editMessageText(text, {
    reply_markup: inlineKeyboard([
      examples.map((e) => inlineButton(e, `example:${e}`)),
      [inlineButton("⬅️ Retour au menu", "menu:main")],
    ]),
  });
});

composer.callbackQuery(/^example:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const example = ctx.match[1];
  await ctx.editMessageText(example, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Menu", "menu:main")]]),
  });
  ctx.session.step = "awaiting_input";
});

export default composer;
