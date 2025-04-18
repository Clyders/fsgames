import { Arg, NativeFunction } from "@tryforge/forgescript";
import { ITTTGameOptions } from "../../../../typings";

const discordEmojiRegex = /^<:[\w-]+:\d+>$/;

export default new NativeFunction({
  name: "$setTTTGameEmoji",
  aliases: ["$setTTTEmoji"],
  version: "1.0.0",
  description: "Sets the emoji used in the Tic Tac Toe game.",
  unwrap: true,
  args: [
    Arg.requiredString("property", "Emoji property (x, o, blank)"),
    Arg.optionalString("value", "Emoji to use (leave blank to reset to default)"),
  ],
  brackets: true,
  async execute(ctx, [prop, val]) {
    let opts = ctx.getEnvironmentKey("__ttt_game_options__") as ITTTGameOptions;

    if (typeof opts !== "object")
      return this.customError("Not Allowed. Try to use in $startTTTGame");

    if (!opts.emojis) opts.emojis = { x: "", o: "", blank: "" };

    const emojis = opts.emojis as { x: string; o: string; blank: string };

    type EmojiKeys = keyof typeof emojis; // 'x' | 'o' | 'blank'

    const emojiProp = prop.toLowerCase() as EmojiKeys;

    if (!["x", "o", "blank"].includes(emojiProp)) {
      return this.customError("Invalid emoji property: " + prop);
    }

    if (val && discordEmojiRegex.test(val)) {
      emojis[emojiProp] = val;
    } else if (val) {
      emojis[emojiProp] = val;
    } else {
      delete emojis[emojiProp];
    }

    ctx.setEnvironmentKey("__ttt_game_options__", opts);
    return this.success();
  },
});