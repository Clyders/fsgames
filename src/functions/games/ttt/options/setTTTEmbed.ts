import { Arg, NativeFunction } from "@tryforge/forgescript";
import { ITTTGameOptions } from "../../../../typings";

type PROPS = keyof ITTTGameOptions["embed"];

export default new NativeFunction({
  name: "$setTTTEmbed",
  aliases: ["$tttEmbed", "$setTicTacToeEmbed"],
  version: "1.0.0",
  description: "Sets the embed options for Tic Tac Toe game.",
  unwrap: true,
  args: [Arg.requiredString("property", "title or color"), Arg.optionalString("value", "Value of the field")],
  brackets: true,
  async execute(ctx, [prop, val]) {
    const opts = ctx.getEnvironmentKey("__ttt_game_options__") as ITTTGameOptions;

    if (!opts || typeof opts !== "object") {
      return this.customError("Use inside $startTTTGame.");
    }

    switch (prop.toLowerCase() as PROPS) {
      case "title":
      case "color":
        break;
      default:
        return this.customError("Invalid property: " + prop);
    }

    opts.embed = opts.embed || {};
    if (val) (opts.embed as Record<string, string>)[prop.toLowerCase()] = val;
    else delete opts.embed[prop.toLowerCase() as PROPS];

    ctx.setEnvironmentKey("__ttt_game_options__", opts);
    return this.success();
  },
});