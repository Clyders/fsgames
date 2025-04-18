import { Arg, NativeFunction } from "@tryforge/forgescript";
import { TimeParser } from "@tryforge/forgescript/dist/constants";
import { ITTTGameOptions } from "../../../../typings";

export default new NativeFunction({
  name: "$setTTTTimeout",
  aliases: ["$tttTimeout", "$setTicTacToeTimeout", "$setTimeout"],
  version: "1.0.0",
  description: "Sets the timeout for the Tic Tac Toe game.",
  unwrap: true,
  args: [Arg.requiredString("timeout", "Timeout duration, e.g., 30s or 1m")],
  brackets: true,
  async execute(ctx, [time]) {
    const opts = ctx.getEnvironmentKey("__ttt_game_options__") as ITTTGameOptions;

    if (!opts || typeof opts !== "object") {
      return this.customError("Use inside $startTTTGame.");
    }

    try {
        opts.timeout = time ? TimeParser.parseToMS(time) : 60000;
      } catch {
        return this.customError("Invalid duration.");
      }

    ctx.setEnvironmentKey("__ttt_game_options__", opts);
    return this.success();
  },
});
