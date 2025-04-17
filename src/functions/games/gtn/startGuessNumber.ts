import {
  Arg,
  CompiledFunction,
  NativeFunction,
  Context,
} from "@tryforge/forgescript";
import { IGuessNumberGameOptions } from "../../../typings";
import { getGameOptionFunctionNames } from "../../../util";
import { Message } from "discord.js";

export default new NativeFunction({
  name: "$startGTNGame",
  aliases: ["$startGuessNumber", "$gtn", "$startGTN"],
  version: "1.0.0",
  description: "Starts a 'Guess the Number' game.",
  unwrap: false,
  args: [
    Arg.requiredString("options", "Game configuration options."),
    Arg.optionalString(
      "result",
      "Env variable to store results (Default: result)",
    ),
  ],
  brackets: true,
  async execute(ctx) {
    let env = this.data.fields![1];
    ctx.setEnvironmentKey("__guess_number__game__options__", {});

    let optionFunctions: CompiledFunction[] = [];
    getGameOptionFunctionNames("gtn").forEach((name) => {
      let opts = this.getFunctions(0, { name } as NativeFunction);
      optionFunctions.push(...opts);
    });

    for (let fn of optionFunctions) {
      const result = await fn.execute(ctx);
      if (!this["isValidReturnType"](result)) return result;
    }

    let opts = ctx.getEnvironmentKey(
      "__guess_number__game__options__",
    ) as IGuessNumberGameOptions;
    ctx.deleteEnvironmentKey("__guess_number__game__options__");

    let result = await new Promise(async (resolve) => {
      const min = opts.min ?? 1;
      const max = opts.max ?? 100;
      const number = Math.floor(Math.random() * (max - min + 1)) + min;
      const timeout = opts.timeoutTime ?? 60000;
      const authorId =
        (ctx.author as any)?.id ??
        (ctx.user as any)?.id ??
        (ctx.member as any)?.id ??
        (ctx.interaction?.user as any)?.id ??
        null;

      if (!ctx.channel || !("createMessageCollector" in ctx.channel)) {
        return this.customError("Channel is not messageable.");
      }

      const embedOptions = opts.embed ?? {};
      const embed = {
        title: embedOptions.title ?? "🎯 Guess The Number!",
        description: `Guess a number between **${min}** and **${max}**.`,
        color: embedOptions.color
          ? parseInt(embedOptions.color.replace("#", ""), 16)
          : 0x00bfff,
      };

      if (ctx?.channel?.isTextBased?.()) {
        const message = await ctx.channel.send({
          embeds: [embed],
        });
      }

      const collector = (ctx.channel as any).createMessageCollector({
        time: timeout,
        filter: (m: any) => m.author?.id === authorId,
      });

      collector.on("collect", (msg: any) => {
        const guess = parseInt(msg.content);
        if (isNaN(guess)) return;
        if (guess === number) {
          msg.reply(`🎉 You got it! The number was **${number}**.`);
          collector.stop("guessed");
        }
      });

      collector.on("end", async (_: any, reason: string) => {
        const isWin = reason === "guessed";

        if (!ctx.channel || !("createMessageCollector" in ctx.channel)) {
          return this.customError("Channel is not messageable.");
        }

        if (ctx?.channel?.isTextBased?.()) {
          const message = await ctx.channel.send({
            embeds: [
              {
                title: isWin ? "🎉 You Won!" : "⌛ Game Over",
                description: isWin
                  ? `You guessed the number **${number}** correctly!`
                  : `Time's up! The correct number was **${number}**.`,
                color: isWin ? 0x00ff88 : 0xff4444,
              },
            ],
          });
        }

        resolve({
          result: isWin ? "win" : "timeout",
          number,
          player: authorId,
          options: opts,
        });
      });
    });

    let envKey = await this["resolveCode"](ctx, env ?? "result");
    if (!this["isValidReturnType"](envKey)) return envKey;
    ctx.setEnvironmentKey(envKey.value, result);

    return this.successJSON(result);
  },
});
