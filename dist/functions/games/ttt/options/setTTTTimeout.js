"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const constants_1 = require("@tryforge/forgescript/dist/constants");
exports.default = new forgescript_1.NativeFunction({
    name: "$setTTTTimeout",
    aliases: ["$tttTimeout", "$setTicTacToeTimeout", "$setTimeout"],
    version: "1.0.0",
    description: "Sets the timeout for the Tic Tac Toe game.",
    unwrap: true,
    args: [forgescript_1.Arg.requiredString("timeout", "Timeout duration, e.g., 30s or 1m")],
    brackets: true,
    async execute(ctx, [time]) {
        const opts = ctx.getEnvironmentKey("__ttt_game_options__");
        if (!opts || typeof opts !== "object") {
            return this.customError("Use inside $startTTTGame.");
        }
        try {
            opts.timeout = time ? constants_1.TimeParser.parseToMS(time) : 60000;
        }
        catch {
            return this.customError("Invalid duration.");
        }
        ctx.setEnvironmentKey("__ttt_game_options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setTTTTimeout.js.map