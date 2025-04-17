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

      const message = await (ctx.send as (options: any) => Promise<Message>)({
        embeds: [
          {
            title: "🎯 Guess The Number!",
            description: "Guess a number between 1 and 100.",
            color: "#00bfff",
          },
        ],
      });

      if (!ctx.channel || !("createMessageCollector" in ctx.channel)) {
        return this.customError("Channel is not messageable.");
      }

      const collector = (ctx.channel as any).createMessageCollector({
        time: timeout,
        filter: (m: any) => m.author?.id === authorId,
      });

      collector.on("collect", (msg: any) => {
        const guess = parseInt(msg.content);
        if (isNaN(guess)) return;
        if (guess > number) msg.reply("📉 Too high!");
        else if (guess < number) msg.reply("📈 Too low!");
        else {
          msg.reply(`🎉 You got it! The number was **${number}**.`);
          collector.stop("guessed");
        }
      });

      collector.on("end", (_: any, reason: string) => {
        resolve({
          result: reason === "guessed" ? "win" : "timeout",
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
