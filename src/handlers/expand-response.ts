import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

const MSG_FR = "📝 Aucune réponse à développer. Posez-moi d'abord une question.";
const MSG_EN = "📝 No response to expand. Ask me a question first.";

composer.callbackQuery("expand_response", async (ctx) => {
  await ctx.answerCallbackQuery();
  const locale = ctx.session.locale ?? "fr";
  const lastResponse = ctx.session.lastResponse;

  if (!lastResponse) {
    await ctx.reply(locale === "fr" ? MSG_FR : MSG_EN);
    return;
  }

  const expanded = lastResponse +
    "\n\nVoici des détails supplémentaires : " +
    "Cette réponse peut être approfondie en posant des questions plus spécifiques. " +
    "N'hésitez pas à demander des précisions sur un point particulier.";

  ctx.session.lastResponse = expanded;
  await ctx.reply(expanded, {
    reply_markup: inlineKeyboard([
      [inlineButton("Raccourcir", "shorten_response")],
      [inlineButton("⬅️ Menu", "menu:main")],
    ]),
  });
});

export default composer;
