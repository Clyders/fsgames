import { Arg, NativeFunction } from "@tryforge/forgescript";
import { IGuessNumberGameOptions } from "../../../../typings";

export default new NativeFunction({
  name: "$setGuessNumberRange",
  version: "1.0.0",
  description: "Sets min and max range for Guess the Number.",
  unwrap: true,
  args: [
    Arg.requiredNumber("min", "Minimum number."),
    Arg.requiredNumber("max", "Maximum number."),
  ],
  brackets: true,
  async execute(ctx, [min, max]) {
    let opts = ctx.getEnvironmentKey(
      "__guess_number__game__options__",
    ) as IGuessNumberGameOptions;
    if (typeof opts !== "object")
      return this.customError("Use inside $startGuessNumberGame.");

    if (min >= max)
      return this.customError("Minimum must be less than maximum.");
    opts.min = min;
    opts.max = max;

    ctx.setEnvironmentKey("__guess_number__game__options__", opts);
    return this.success();
  },
});
