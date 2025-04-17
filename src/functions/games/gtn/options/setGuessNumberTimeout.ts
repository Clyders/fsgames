import { Arg, NativeFunction } from "@tryforge/forgescript";
import { IGuessNumberGameOptions } from "../../../../typings";
import { TimeParser } from "@tryforge/forgescript/dist/constants";

export default new NativeFunction({
  name: "$setGuessNumberTimeout",
  aliases: ["$setTimeout", "$gtnTimeout", "$setGtnTimeout", "$setTime"],
  version: "1.0.0",
  description: "Sets the timeout for the game.",
  unwrap: true,
  args: [Arg.optionalString("duration", "Duration of the timeout.")],
  brackets: true,
  async execute(ctx, [dur]) {
    let opts = ctx.getEnvironmentKey(
      "__guess_number__game__options__",
    ) as IGuessNumberGameOptions;
    if (typeof opts !== "object")
      return this.customError("Use inside $startGuessNumberGame.");

    try {
      opts.timeoutTime = dur ? TimeParser.parseToMS(dur) : 60000;
    } catch {
      return this.customError("Invalid duration.");
    }

    ctx.setEnvironmentKey("__guess_number__game__options__", opts);
    return this.success();
  },
});
