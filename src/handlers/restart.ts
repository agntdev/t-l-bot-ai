import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { mainMenuKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

const MSG_FR = "🔄 Conversation réinitialisée. Envoyez-moi un nouveau message ou choisissez une option.";
const MSG_EN = "🔄 Conversation reset. Send me a new message or choose an option.";

composer.command("restart", async (ctx) => {
  ctx.session.messageHistory = [];
  ctx.session.lastResponse = undefined;
  ctx.session.lastPrompt = undefined;
  ctx.session.step = "idle";

  const locale = ctx.session.locale ?? "fr";
  await ctx.reply(locale === "fr" ? MSG_FR : MSG_EN, {
    reply_markup: mainMenuKeyboard(),
  });
});

export default composer;
