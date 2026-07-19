import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "⚙️ Settings", data: "settings:show", order: 30 });

const LANGUAGES = [
  { code: "fr", label: "🇫🇷 Français" },
  { code: "en", label: "🇬🇧 English" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "it", label: "🇮🇹 Italiano" },
];

const STYLES = [
  { value: "concise", label: "Bref" },
  { value: "balanced", label: "Équilibré" },
  { value: "detailed", label: "Détaillé" },
];

const composer = new Composer<Ctx>();

composer.callbackQuery("settings:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const locale = ctx.session.locale ?? "fr";
  const style = ctx.session.responseStyle ?? "balanced";
  const langName = LANGUAGES.find((l) => l.code === locale)?.label ?? locale;
  const styleName = STYLES.find((s) => s.value === style)?.label ?? style;

  const text =
    `⚙️ Vos paramètres\n\n` +
    `Langue : ${langName}\n` +
    `Style : ${styleName}`;

  await ctx.editMessageText(text, {
    reply_markup: inlineKeyboard([
      [inlineButton("🌐 Changer la langue", "settings:lang")],
      [inlineButton("📝 Changer le style", "settings:style")],
      [inlineButton("⬅️ Retour au menu", "menu:main")],
    ]),
  });
});

composer.callbackQuery("settings:lang", async (ctx) => {
  await ctx.answerCallbackQuery();
  const current = ctx.session.locale ?? "fr";
  const buttons = LANGUAGES.map((l) => [
    inlineButton(
      l.code === current ? `${l.label} ✓` : l.label,
      `settings:setlang:${l.code}`,
    ),
  ]);
  buttons.push([inlineButton("⬅️ Retour", "settings:show")]);

  await ctx.editMessageText("🌐 Choisissez votre langue :", {
    reply_markup: inlineKeyboard(buttons),
  });
});

composer.callbackQuery(/^settings:setlang:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Langue mise à jour" });
  const code = ctx.match[1];
  ctx.session.locale = code;

  const langName = LANGUAGES.find((l) => l.code === code)?.label ?? code;
  const style = ctx.session.responseStyle ?? "balanced";
  const styleName = STYLES.find((s) => s.value === style)?.label ?? style;

  await ctx.editMessageText(
    `⚙️ Vos paramètres\n\nLangue : ${langName}\nStyle : ${styleName}`,
    {
      reply_markup: inlineKeyboard([
        [inlineButton("🌐 Changer la langue", "settings:lang")],
        [inlineButton("📝 Changer le style", "settings:style")],
        [inlineButton("⬅️ Retour au menu", "menu:main")],
      ]),
    },
  );
});

composer.callbackQuery("settings:style", async (ctx) => {
  await ctx.answerCallbackQuery();
  const current = ctx.session.responseStyle ?? "balanced";
  const buttons = STYLES.map((s) => [
    inlineButton(
      s.value === current ? `${s.label} ✓` : s.label,
      `settings:setstyle:${s.value}`,
    ),
  ]);
  buttons.push([inlineButton("⬅️ Retour", "settings:show")]);

  await ctx.editMessageText("📝 Choisissez la longueur des réponses :", {
    reply_markup: inlineKeyboard(buttons),
  });
});

composer.callbackQuery(/^settings:setstyle:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Style mis à jour" });
  const style = ctx.match[1] as "concise" | "detailed" | "balanced";
  ctx.session.responseStyle = style;

  const locale = ctx.session.locale ?? "fr";
  const langName = LANGUAGES.find((l) => l.code === locale)?.label ?? locale;
  const styleName = STYLES.find((s) => s.value === style)?.label ?? style;

  await ctx.editMessageText(
    `⚙️ Vos paramètres\n\nLangue : ${langName}\nStyle : ${styleName}`,
    {
      reply_markup: inlineKeyboard([
        [inlineButton("🌐 Changer la langue", "settings:lang")],
        [inlineButton("📝 Changer le style", "settings:style")],
        [inlineButton("⬅️ Retour au menu", "menu:main")],
      ]),
    },
  );
});

export default composer;
