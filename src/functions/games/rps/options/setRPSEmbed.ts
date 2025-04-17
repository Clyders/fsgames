import { Arg, NativeFunction } from "@tryforge/forgescript";
import { IRPSGameOptions } from "../../../../typings";

type PROPS = keyof IRPSGameOptions["embed"];

export default new NativeFunction({
  name: "$setRPSEmbed",
  aliases: ["$setEmbed", "$rpsEmbed", "$setRpsEmbed", "$setRockPaperScissorsEmbed"],
  version: "1.0.0",
  description: "Sets embed options for Rock Paper Scissors game.",
  unwrap: true,
  args: [
    Arg.requiredString("property", "title or color"),
    Arg.optionalString("value", "Value of the embed field"),
  ],
  brackets: true,
  async execute(ctx, [prop, val]) {
    const opts = ctx.getEnvironmentKey(
      "__rps_game_options__",
    ) as IRPSGameOptions;

    if (!opts || typeof opts !== "object") {
      return this.customError("Use inside $startRPSGame.");
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

    ctx.setEnvironmentKey("__rps_game_options__", opts);
    return this.success();
  },
});