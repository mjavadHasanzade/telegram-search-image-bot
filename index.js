const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
const getMessageType = require("./utils/getType");
const { createClient } = require("pexels");
const fs = require("fs");
const getArg = require("./utils/getArg");
const { default: axios } = require("axios");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

const helpMsg = `/start - Start the bot
/help - Get help

Media Bot

/uns <topic> - search image by topic in unsplash
/pex <topic> - search image by topic in pexel
`;

bot.use((ctx, next) => {
  if (ctx.has("callback_query")) return next();
  const tp = getMessageType(ctx.message);
  let msg = "";
  if (tp === "text")
    msg = `${ctx.from.first_name || "Name Not Set"} ${
      ctx.from.last_name || "Family Not Set"
    } @${ctx.from.username || "Id Not Set"} said ${ctx.message.text}`;
  else
    msg = `${ctx.from.first_name || "Name Not Set"} ${
      ctx.from.last_name || "Family Not Set"
    } @${ctx.from.username || "Id Not Set"} Sent ${tp}`;

  fs.appendFile("./logs/logs.txt", msg + "\n", (err) => {
    if (err) return console.log({ err });
    console.log(msg);
  });
  next();
});

bot.start((ctx) => {
  ctx.reply("Hello I'm Img bot");
  ctx.reply(helpMsg);
});

bot.help((ctx) => {
  ctx.reply(helpMsg);
});

bot.command("pex", (ctx) => {
  const client = createClient(process.env.PEXEL_TOKEN);
  const arg = getArg(ctx.message.text);
  if (arg === "noArg") return ctx.reply("No Argument Found");

  client.photos.search({ query: arg, per_page: 7 }).then((photos) => {
    if (photos.total_results === 0)
      return ctx.reply("No Image found in this topic");
    const medias = photos.photos.map((item) => {
      return {
        type: "photo",
        caption: arg,
        media: { url: item.src.medium, source: item.src.medium },
      };
    });
    bot.telegram.sendMediaGroup(ctx.chat.id, medias);
  });
});

bot.command("uns", (ctx) => {
  const arg = getArg(ctx.message.text);
  if (arg === "noArg") return ctx.reply("No Argument Found");

  axios
    .get(
      `https://api.unsplash.com/search/photos?query=${arg}&per_page=7&client_id=${process.env.UNSPLASH_TOKEN}`
    )
    .then(async (res) => {
      if (res.data.total === 0)
        return ctx.reply("No Image found in this topic");
      const medias = res.data.results.map((item) => {
        return {
          type: "photo",
          caption: arg,
          media: { url: item.urls.regular, source: item.urls.regular },
        };
      });

      bot.telegram.sendMediaGroup(ctx.chat.id, medias);
    })
    .catch((err) => {
      ctx.reply(err.response.description || "Sth went Wrong Try again");
    });
});

bot.launch();
