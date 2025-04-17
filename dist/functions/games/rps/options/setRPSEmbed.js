"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$setRPSEmbed",
    aliases: ["$setEmbed", "$rpsEmbed", "$setRpsEmbed", "$setRockPaperScissorsEmbed"],
    version: "1.0.0",
    description: "Sets embed options for Rock Paper Scissors game.",
    unwrap: true,
    args: [
        forgescript_1.Arg.requiredString("property", "title or color"),
        forgescript_1.Arg.optionalString("value", "Value of the embed field"),
    ],
    brackets: true,
    async execute(ctx, [prop, val]) {
        const opts = ctx.getEnvironmentKey("__rps_game_options__");
        if (!opts || typeof opts !== "object") {
            return this.customError("Use inside $startRPSGame.");
        }
        switch (prop.toLowerCase()) {
            case "title":
            case "color":
                break;
            default:
                return this.customError("Invalid embed property: " + prop);
        }
        opts.embed = opts.embed || {};
        if (val)
            opts.embed[prop.toLowerCase()] = val;
        else
            delete opts.embed[prop.toLowerCase()];
        ctx.setEnvironmentKey("__rps_game_options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setRPSEmbed.js.map