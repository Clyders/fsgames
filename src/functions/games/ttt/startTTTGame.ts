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
    resolveColor,
    ColorResolvable,
  } from "discord.js";
  import { ITTTGameOptions } from "../../../typings";
  import { getGameOptionFunctionNames } from "../../../util";
  
  export default new NativeFunction({
    name: "$startTTTGame",
    aliases: ["$startTTT", "$ttt", "$ticTacToe", "$startTicTacToe"],
    version: "1.0.0",
    description: "Starts a Tic Tac Toe game (PvP & PvBot only).",
    unwrap: false,
    args: [
      Arg.requiredString("options", "Tic Tac Toe game config."),
      Arg.optionalString("env", "Env variable name to store result."),
    ],
    brackets: true,
    async execute(ctx) {
      let env = this.data.fields![1];
      ctx.setEnvironmentKey("__ttt_game_options__", {});
  
      let optionFunctions: CompiledFunction[] = [];
      getGameOptionFunctionNames("ttt").forEach((name) => {
        let opts = this.getFunctions(0, { name } as NativeFunction);
        optionFunctions.push(...opts);
      });
  
      for (let fn of optionFunctions) {
        const result = await fn.execute(ctx);
        if (!this["isValidReturnType"](result)) return result;
      }
  
      const opts = ctx.getEnvironmentKey("__ttt_game_options__") as ITTTGameOptions;
      ctx.deleteEnvironmentKey("__ttt_game_options__");
  
      const playerX = (ctx.author as any)?.id;
      const playerO = opts.opponent;
  
      const board = Array(9).fill(null);
      let turn = "X";
  
      const embedColor = opts.embed?.color
        ? resolveColor(opts.embed.color as ColorResolvable)
        : resolveColor("#57F287");

      const getBoardButtons = () => {
        const rows: any[] = [];
        for (let i = 0; i < 3; i++) {
          const row = new ActionRowBuilder<ButtonBuilder>();
          for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            const label = board[index]
              ? board[index] === "X"
                ? opts.emojis?.x ?? "❌"
                : opts.emojis?.o ?? "⭕"
              : opts.emojis?.blank ?? "⠀";
      
            row.addComponents(
              new ButtonBuilder()
                .setCustomId(`ttt:${index}`)
                .setLabel(label)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(Boolean(board[index]))
            );
          }
          rows.push(row);
        }
        return rows;
      };      
  
      const getStatusText = () => {
        return `🎮 <@${playerX}> (❌) vs <@${playerO}> (⭕)\n🕹️ Turn: ${
          turn === "X" ? `<@${playerX}> (❌)` : `<@${playerO}> (⭕)`
        }`;
      };

      if (!ctx.channel || !("createMessageCollector" in ctx.channel)) {
        return this.customError("Channel is not messageable.");
      }
  
      const message = await ctx.channel.send({
        embeds: [
          {
            title: opts.embed?.title ?? "🎯 Tic Tac Toe",
            description: getStatusText(),
            color: embedColor,
          },
        ],
        components: getBoardButtons(),
      });
  
      const collector = (ctx.channel as any).createMessageComponentCollector({
        time: opts.timeout ?? 60000,
        filter: (i: any) =>
          [playerX, playerO].includes(i.user.id) &&
          i.customId.startsWith("ttt:"),
      });
  
      collector.on("collect", async (interaction: any) => {
        const userId = interaction.user.id;
        const cell = Number(interaction.customId.split(":")[1]);
  
        if (
          (turn === "X" && userId !== playerX) ||
          (turn === "O" && userId !== playerO)
        ) {
          return interaction.reply({
            content: "It's not your turn!",
            ephemeral: true,
          });
        }
  
        if (board[cell]) {
          return interaction.reply({
            content: "Cell already taken!",
            ephemeral: true,
          });
        }
  
        board[cell] = turn;
        turn = turn === "X" ? "O" : "X";
  
        const winner = checkWinner(board);
        const isDraw = board.every(Boolean);
  
        if (winner || isDraw) collector.stop("complete");
  
        await interaction.deferUpdate();
        await message.edit({
          embeds: [
            {
              title: opts.embed?.title ?? "🎯 Tic Tac Toe",
              description: winner
                ? `🎉 <@${winner === "X" ? playerX : playerO}> wins the game!`
                : isDraw
                ? "🤝 It's a draw!"
                : getStatusText(),
              color: embedColor,
            },
          ],
          components: winner || isDraw ? [] : getBoardButtons(),
        });
      });
  
      return await new Promise((resolve) => {
        collector.on("end", async () => {
          const winner = checkWinner(board);
          const isDraw = board.every(Boolean);
  
          let result = {
            result: winner ? "win" : isDraw ? "draw" : "timeout",
            winner: winner === "X" ? playerX : winner === "O" ? playerO : null,
            board,
            players: { X: playerX, O: playerO },
          };
  
          let envKey = await this["resolveCode"](ctx, env ?? "result");
          if (!this["isValidReturnType"](envKey)) return envKey;
  
          ctx.setEnvironmentKey(envKey.value, result);
          return resolve(this.successJSON(result));
        });
      });
  
      function checkWinner(board: any[]) {
        const wins = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
        ];
  
        for (const [a, b, c] of wins) {
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
          }
        }
  
        return null;
      }
    },
  });  