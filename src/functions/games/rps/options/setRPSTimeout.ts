import { Arg, NativeFunction } from "@tryforge/forgescript";
import { TimeParser } from "@tryforge/forgescript/dist/constants";
import { IRPSGameOptions } from "../../../../typings";

export default new NativeFunction({
  name: "$setRPSTimeout",
  aliases: ["$setTimeout", "$rpsTimeout", "$setRpsTimeout", "$setTime"],
  version: "1.0.0",
  description: "Sets the timeout for the Rock Paper Scissors game.",
  unwrap: true,
  args: [Arg.optionalString("duration", "Duration of the timeout.")],
  brackets: true,
  async execute(ctx, [dur]) {
    const opts = ctx.getEnvironmentKey(
      "__rps_game_options__",
    ) as IRPSGameOptions;

    if (typeof opts !== "object") {
      return this.customError("Use inside $startRPSGame.");
    }

    try {
      opts.timeout = dur ? TimeParser.parseToMS(dur) : 60000;
    } catch {
      return this.customError("Invalid duration.");
    }

    ctx.setEnvironmentKey("__rps_game_options__", opts);
    return this.success();
  },
});