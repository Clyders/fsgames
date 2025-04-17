import { Arg, NativeFunction } from "@tryforge/forgescript";
import { IRPSGameOptions } from "../../../../typings";

export default new NativeFunction({
  name: "$setRPSOpponent",
  aliases: ["$setPlayer", "$rpsOpponent", "$setRpsOp", "$setRockPaperScissorsOp"],
  version: "1.0.0",
  description: "Sets the opponent for Rock Paper Scissors (PvP or PvBot).",
  unwrap: true,
  args: [Arg.requiredString("idOrBot", "The user ID or 'bot' to play against.")],
  brackets: true,
  async execute(ctx, [idOrBot]) {
    const opts = ctx.getEnvironmentKey(
      "__rps_game_options__",
    ) as IRPSGameOptions;

    if (!opts || typeof opts !== "object") {
      return this.customError("Use inside $startRPSGame.");
    }

    if (idOrBot.toLowerCase() === "bot") {
      opts.vs = "bot";
    } else if (/^\d{17,19}$/.test(idOrBot)) {
      opts.vs = idOrBot;
    } else {
      return this.customError("Invalid opponent ID. Provide a valid user ID or 'bot'.");
    }

    ctx.setEnvironmentKey("__rps_game_options__", opts);
    return this.success();
  },
});