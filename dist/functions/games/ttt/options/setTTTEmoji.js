"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const discordEmojiRegex = /^<:[\w-]+:\d+>$/;
exports.default = new forgescript_1.NativeFunction({
    name: "$setTTTGameEmoji",
    aliases: ["$setTTTEmoji"],
    version: "1.0.0",
    description: "Sets the emoji used in the Tic Tac Toe game.",
    unwrap: true,
    args: [
        forgescript_1.Arg.requiredString("property", "Emoji property (x, o, blank)"),
        forgescript_1.Arg.optionalString("value", "Emoji to use (leave blank to reset to default)"),
    ],
    brackets: true,
    async execute(ctx, [prop, val]) {
        let opts = ctx.getEnvironmentKey("__ttt_game_options__");
        if (typeof opts !== "object")
            return this.customError("Not Allowed. Try to use in $startTTTGame");
        if (!opts.emojis)
            opts.emojis = { x: "", o: "", blank: "" };
        const emojis = opts.emojis;
        const emojiProp = prop.toLowerCase();
        if (!["x", "o", "blank"].includes(emojiProp)) {
            return this.customError("Invalid emoji property: " + prop);
        }
        if (val && discordEmojiRegex.test(val)) {
            emojis[emojiProp] = val;
        }
        else if (val) {
            emojis[emojiProp] = val;
        }
        else {
            delete emojis[emojiProp];
        }
        ctx.setEnvironmentKey("__ttt_game_options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setTTTEmoji.js.map