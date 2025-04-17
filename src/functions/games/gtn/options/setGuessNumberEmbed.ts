import { Arg, NativeFunction } from "@tryforge/forgescript";
import { IGuessNumberGameOptions } from "../../../../typings";

type PROPS = keyof IGuessNumberGameOptions["embed"];

export default new NativeFunction({
  name: "$setGuessNumberEmbed",
  version: "1.0.0",
  description: "Sets embed options for Guess the Number game.",
  unwrap: true,
  args: [
    Arg.requiredString("property", "title or color"),
    Arg.optionalString("value", "Value of the embed field"),
  ],
  brackets: true,
  async execute(ctx, [prop, val]) {
    const opts = ctx.getEnvironmentKey(
      "__guess_number__game__options__",
    ) as IGuessNumberGameOptions;
    if (!opts || typeof opts !== "object") {
      return this.customError("Use inside $startGuessNumberGame.");
    }

    switch (prop.toLowerCase() as PROPS) {
      case "title":
      case "color":
        break;
      default:
        return this.customError("Invalid embed property: " + prop);
    }

    opts.embed = opts.embed || {};
    if (val) (opts.embed as Record<string, string>)[prop.toLowerCase()] = val;
    else delete opts.embed[prop.toLowerCase() as PROPS];

    ctx.setEnvironmentKey("__guess_number__game__options__", opts);
    return this.success();
  },
});
