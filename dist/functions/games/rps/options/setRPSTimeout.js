"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const constants_1 = require("@tryforge/forgescript/dist/constants");
exports.default = new forgescript_1.NativeFunction({
    name: "$setRPSTimeout",
    aliases: ["$setTimeout", "$rpsTimeout", "$setRpsTimeout", "$setTime"],
    version: "1.0.0",
    description: "Sets the timeout for the Rock Paper Scissors game.",
    unwrap: true,
    args: [forgescript_1.Arg.optionalString("duration", "Duration of the timeout.")],
    brackets: true,
    async execute(ctx, [dur]) {
        const opts = ctx.getEnvironmentKey("__rps_game_options__");
        if (typeof opts !== "object") {
            return this.customError("Use inside $startRPSGame.");
        }
        try {
            opts.timeout = dur ? constants_1.TimeParser.parseToMS(dur) : 60000;
        }
        catch {
            return this.customError("Invalid duration.");
        }
        ctx.setEnvironmentKey("__rps_game_options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setRPSTimeout.js.map