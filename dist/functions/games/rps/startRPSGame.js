"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const discord_js_1 = require("discord.js");
const util_1 = require("../../../util");
exports.default = new forgescript_1.NativeFunction({
    name: "$startRPSGame",
    aliases: ["$startRPS", "$rps", "$startRockPaperScissors"],
    version: "1.0.0",
    description: "Starts a Rock Paper Scissors game (PvP or PvBot).",
    unwrap: false,
    args: [
        forgescript_1.Arg.requiredString("options", "RPS game config."),
        forgescript_1.Arg.optionalString("env", "Env variable name to store result."),
    ],
    brackets: true,
    async execute(ctx) {
        let env = this.data.fields[1];
        ctx.setEnvironmentKey("__rps_game_options__", {});
        let optionFunctions = [];
        (0, util_1.getGameOptionFunctionNames)("rps").forEach((name) => {
            let opts = this.getFunctions(0, { name });
            optionFunctions.push(...opts);
        });
        for (let fn of optionFunctions) {
            const result = await fn.execute(ctx);
            if (!this["isValidReturnType"](result))
                return result;
        }
        if (!ctx.channel || !("createMessageCollector" in ctx.channel)) {
            return this.customError("Channel is not messageable.");
        }
        const opts = ctx.getEnvironmentKey("__rps_game_options__");
        ctx.deleteEnvironmentKey("__rps_game_options__");
        const authorId = ctx.author?.id ??
            ctx.user?.id ??
            ctx.member?.id ??
            ctx.interaction?.user?.id ??
            null;
        const opponent = opts.vs ?? "bot";
        const isPvBot = opponent === "bot";
        const opponentId = isPvBot ? "bot" : opponent;
        const choices = ["rock", "paper", "scissors"];
        const selections = {};
        const embedColor = opts.embed?.color
            ? (0, discord_js_1.resolveColor)(opts.embed.color)
            : (0, discord_js_1.resolveColor)("#5865F2");
        const getEmbedDescription = () => {
            let desc = isPvBot
                ? "Click a button to make your choice!"
                : `<@${authorId}> vs <@${opponentId}> — click a button to play!`;
            if (selections[authorId]) {
                desc += `\n\n🧑 <@${authorId}> picked **${selections[authorId]}**.`;
            }
            if (!isPvBot && selections[opponentId]) {
                desc += `\n🧑 <@${opponentId}> picked **${selections[opponentId]}**.`;
            }
            return desc;
        };
        const makeButtons = (disabled = false) => new discord_js_1.ActionRowBuilder().addComponents(choices.map((choice) => new discord_js_1.ButtonBuilder()
            .setCustomId(`rps:${choice}`)
            .setLabel(choice.charAt(0).toUpperCase() + choice.slice(1))
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(disabled)));
        const sentMsg = await ctx.channel.send({
            embeds: [
                {
                    title: opts.embed?.title ?? "✊ Rock Paper Scissors!",
                    color: embedColor,
                    description: getEmbedDescription(),
                },
            ],
            components: [makeButtons()],
        });
        const timeout = opts.timeout ?? 30000;
        const collector = ctx.channel.createMessageComponentCollector({
            time: timeout,
            filter: (i) => [authorId, opponentId].includes(i.user.id) &&
                i.customId.startsWith("rps:"),
        });
        collector.on("collect", async (interaction) => {
            const userId = interaction.user.id;
            const choice = interaction.customId.split(":")[1];
            if (selections[userId]) {
                return interaction.reply({ content: "You already picked!", ephemeral: true });
            }
            selections[userId] = choice;
            await interaction.deferUpdate();
            await sentMsg.edit({
                embeds: [
                    {
                        title: opts.embed?.title ?? "✊ Rock Paper Scissors!",
                        description: getEmbedDescription(),
                        color: embedColor,
                    },
                ],
                components: [makeButtons(true)],
            });
            if (isPvBot) {
                selections["bot"] = choices[Math.floor(Math.random() * choices.length)];
                collector.stop("complete");
            }
            else if (selections[authorId] && selections[opponentId]) {
                collector.stop("complete");
            }
        });
        return await new Promise((resolve) => {
            collector.on("end", async (_, reason) => {
                const p1 = selections[authorId];
                const p2 = selections[opponentId];
                const winMap = {
                    rock: "scissors",
                    scissors: "paper",
                    paper: "rock",
                };
                let result = {
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
                    }
                    else if (winMap[p1] === p2) {
                        result.result = "win";
                        result.winner = authorId;
                        winnerText = `🎉 <@${authorId}> wins! **${p1}** beats **${p2}**.`;
                    }
                    else {
                        result.result = "loss";
                        result.winner = opponentId;
                        winnerText = isPvBot
                            ? `🤖 Bot wins! **${p2}** beats **${p1}**.`
                            : `🎉 <@${opponentId}> wins! **${p2}** beats **${p1}**.`;
                    }
                }
                await sentMsg.edit({
                    embeds: [
                        {
                            title: opts.embed?.title ?? "✊ Rock Paper Scissors!",
                            description: winnerText,
                            color: embedColor,
                        },
                    ],
                    components: [],
                });
                let envKey = await this["resolveCode"](ctx, env ?? "result");
                if (!this["isValidReturnType"](envKey))
                    return envKey;
                ctx.setEnvironmentKey(envKey.value, result);
                return resolve(this.successJSON(result));
            });
        });
    },
});
//# sourceMappingURL=startRPSGame.js.map