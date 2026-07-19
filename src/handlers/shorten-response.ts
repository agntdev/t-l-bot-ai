import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

const MSG_FR = "📝 Aucune réponse à raccourcir. Posez-moi d'abord une question.";
const MSG_EN = "📝 No response to shorten. Ask me a question first.";

function shorten(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  if (sentences.length <= 1) return text;
  return sentences[0].trim() + ".";
}

composer.callbackQuery("shorten_response", async (ctx) => {
  await ctx.answerCallbackQuery();
  const locale = ctx.session.locale ?? "fr";
  const lastResponse = ctx.session.lastResponse;

  if (!lastResponse) {
    await ctx.reply(locale === "fr" ? MSG_FR : MSG_EN);
    return;
  }

  const shortened = shorten(lastResponse);
  ctx.session.lastResponse = shortened;
  await ctx.reply(shortened, {
    reply_markup: inlineKeyboard([
      [inlineButton("Développer", "expand_response")],
      [inlineButton("⬅️ Menu", "menu:main")],
    ]),
  });
});

export default composer;
