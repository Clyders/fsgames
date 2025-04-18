"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$setTTTEmbed",
    aliases: ["$tttEmbed", "$setTicTacToeEmbed"],
    version: "1.0.0",
    description: "Sets the embed options for Tic Tac Toe game.",
    unwrap: true,
    args: [forgescript_1.Arg.requiredString("property", "title or color"), forgescript_1.Arg.optionalString("value", "Value of the field")],
    brackets: true,
    async execute(ctx, [prop, val]) {
        const opts = ctx.getEnvironmentKey("__ttt_game_options__");
        if (!opts || typeof opts !== "object") {
            return this.customError("Use inside $startTTTGame.");
        }
        switch (prop.toLowerCase()) {
            case "title":
            case "color":
                break;
            default:
                return this.customError("Invalid property: " + prop);
        }
        opts.embed = opts.embed || {};
        if (val)
            opts.embed[prop.toLowerCase()] = val;
        else
            delete opts.embed[prop.toLowerCase()];
        ctx.setEnvironmentKey("__ttt_game_options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setTTTEmbed.js.map