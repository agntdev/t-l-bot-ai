import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

const HELP_FR =
  "ℹ️ Comment utiliser TéléBot AI\n\n" +
  "💬 Envoyez-moi un message pour démarrer une conversation.\n" +
  "⚙️ Réglez vos préférences dans les paramètres.\n" +
  "🔄 Réinitialisez la conversation avec /restart.\n" +
  "📝 Obtenez un résumé avec /summary.\n\n" +
  "Tout est accessible en tapant les boutons — pas besoin de mémoriser des commandes.";

const HELP_EN =
  "ℹ️ How to use TéléBot AI\n\n" +
  "💬 Send me a message to start a conversation.\n" +
  "⚙️ Adjust your preferences in settings.\n" +
  "🔄 Reset the conversation with /restart.\n" +
  "📝 Get a summary with /summary.\n\n" +
  "Everything is reachable by tapping buttons — no need to memorize commands.";

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.command("help", async (ctx) => {
  const locale = ctx.session.locale ?? "fr";
  await ctx.reply(locale === "fr" ? HELP_FR : HELP_EN);
});

composer.callbackQuery("menu:help", async (ctx) => {
  await ctx.answerCallbackQuery();
  const locale = ctx.session.locale ?? "fr";
  await ctx.editMessageText(locale === "fr" ? HELP_FR : HELP_EN, {
    reply_markup: backToMenu,
  });
});

export default composer;
