import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

const EMPTY_FR = "📝 Aucune conversation à résumer. Commencez par m'envoyer un message.";
const EMPTY_EN = "📝 No conversation to summarize. Start by sending me a message.";

composer.command("summary", async (ctx) => {
  const history = ctx.session.messageHistory ?? [];
  const locale = ctx.session.locale ?? "fr";

  if (history.length === 0) {
    await ctx.reply(locale === "fr" ? EMPTY_FR : EMPTY_EN);
    return;
  }

  const exchanges = history.filter((m) => m.role === "user").length;
  const topics = history
    .filter((m) => m.role === "user")
    .slice(-5)
    .map((m) => `"${m.content.slice(0, 40)}"`)
    .join(", ");

  const summaryFr =
    `📝 Résumé de la conversation\n\n` +
    `Échanges : ${exchanges}\n` +
    `Derniers sujets : ${topics}\n\n` +
    `La conversation porte sur ${exchanges} message${exchanges > 1 ? "s" : ""} concernant ${topics}.`;

  const summaryEn =
    `📝 Conversation summary\n\n` +
    `Exchanges: ${exchanges}\n` +
    `Recent topics: ${topics}\n\n` +
    `The conversation covers ${exchanges} message${exchanges > 1 ? "s" : ""} about ${topics}.`;

  const text = locale === "fr" ? summaryFr : summaryEn;
  await ctx.reply(text, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Menu", "menu:main")]]),
  });
});

export default composer;
