import {
  Arg,
  CompiledFunction,
  Context,
  NativeFunction,
} from "@tryforge/forgescript";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  resolveColor,
  ColorResolvable
} from "discord.js";
import { IRPSGameOptions } from "../../../typings";
import { getGameOptionFunctionNames } from "../../../util";

export default new NativeFunction({
  name: "$startRPSGame",
  aliases: ["$startRPS", "$rps", "$startRockPaperScissors"],
  version: "1.0.0",
  description: "Starts a Rock Paper Scissors game (PvP or PvBot).",
  unwrap: false,
  args: [
    Arg.requiredString("options", "RPS game config."),
    Arg.optionalString("env", "Env variable name to store result."),
  ],
  brackets: true,
  async execute(ctx) {
    let env = this.data.fields![1];
    ctx.setEnvironmentKey("__rps_game_options__", {});

    let optionFunctions: CompiledFunction[] = [];
    getGameOptionFunctionNames("rps").forEach((name) => {
      let opts = this.getFunctions(0, { name } as NativeFunction);
      optionFunctions.push(...opts);
    });

    for (let fn of optionFunctions) {
      const result = await fn.execute(ctx);
      if (!this["isValidReturnType"](result)) return result;
    }

    const opts = ctx.getEnvironmentKey("__rps_game_options__") as IRPSGameOptions;
    ctx.deleteEnvironmentKey("__rps_game_options__");

    const authorId =
      (ctx.author as any)?.id ??
      (ctx.user as any)?.id ??
      (ctx.member as any)?.id ??
      (ctx.interaction?.user as any)?.id ??
      null;

    const opponent = opts.vs ?? "bot";
    const isPvBot = opponent === "bot";
    const opponentId = isPvBot ? "bot" : opponent;

    const choices = ["rock", "paper", "scissors"];
    const selections: Record<string, string> = {};

    const embedColor = opts.embed?.color
  ? resolveColor(opts.embed.color as ColorResolvable)
  : resolveColor("#5865F2");

    const embed = {
      title: opts.embed?.title ?? "✊ Rock Paper Scissors!",
      color: embedColor,
      description: isPvBot
        ? "Click a button to make your choice!"
        : `<@${authorId}> vs <@${opponentId}> — click a button to play!`,
    };

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      choices.map((choice) =>
        new ButtonBuilder()
          .setCustomId(`rps:${choice}`)
          .setLabel(choice.charAt(0).toUpperCase() + choice.slice(1))
          .setStyle(ButtonStyle.Primary),
      ),
    );

    const msg = await (ctx.send as (opt: any) => Promise<Message>)({
      embeds: [embed],
      components: [row],
    });

    const timeout = opts.timeout ?? 30000;
    const filter = (i: any) =>
      [authorId, opponentId].includes(i.user.id) &&
      i.customId.startsWith("rps:");

    const collector = msg.createMessageComponentCollector({ time: timeout, filter });

    collector.on("collect", async (interaction: any) => {
      const userId = interaction.user.id;
      const choice = interaction.customId.split(":")[1];

      if (selections[userId]) {
        return interaction.reply({ content: "You already picked!", ephemeral: true });
      }

      selections[userId] = choice;

      await interaction.deferUpdate();

      // PvBot: resolve immediately
      if (isPvBot) {
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        selections["bot"] = botChoice;
        collector.stop("complete");
      }

      // PvP: wait for both
      if (!isPvBot && selections[authorId] && selections[opponentId]) {
        collector.stop("complete");
      }
    });

    return await new Promise((resolve) => {
      collector.on("end", async (_, reason) => {
        const p1 = selections[authorId];
        const p2 = selections[opponentId];

        const winMap: Record<string, string> = {
          rock: "scissors",
          scissors: "paper",
          paper: "rock",
        };

        let result: any = {
          result: "timeout",
          choices: selections,
          players: {
            player: authorId,
            opponent: isPvBot ? "bot" : opponentId,
          },
        };

        let winnerText = "⏰ Game timed out!";
        if (reason === "complete" && p1 && p2) {
          if (p1 === p2) {
            result.result = "draw";
            winnerText = `🤝 It's a draw! Both chose **${p1}**.`;
          } else if (winMap[p1] === p2) {
            result.result = "win";
            result.winner = authorId;
            winnerText = `🎉 <@${authorId}> wins! **${p1}** beats **${p2}**.`;
          } else {
            result.result = "loss";
            result.winner = opponentId;
            winnerText = isPvBot
              ? `🤖 Bot wins! **${p2}** beats **${p1}**.`
              : `🎉 <@${opponentId}> wins! **${p2}** beats **${p1}**.`;
          }
        }

        await msg.edit({
          embeds: [
            {
              title: embed.title,
              description: winnerText,
              color: embedColor,
            },
          ],
          components: [],
        });

        let envKey = await this["resolveCode"](ctx, env ?? "result");
        if (!this["isValidReturnType"](envKey)) return envKey;
        ctx.setEnvironmentKey(envKey.value, result);

        return resolve(this.successJSON(result));
      });
    });
  },
});