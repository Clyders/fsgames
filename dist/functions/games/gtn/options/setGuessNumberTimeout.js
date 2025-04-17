"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const constants_1 = require("@tryforge/forgescript/dist/constants");
exports.default = new forgescript_1.NativeFunction({
    name: "$setGuessNumberTimeout",
    version: "1.0.0",
    description: "Sets the timeout for the game.",
    unwrap: true,
    args: [forgescript_1.Arg.optionalString("duration", "Duration of the timeout.")],
    brackets: true,
    async execute(ctx, [dur]) {
        let opts = ctx.getEnvironmentKey("__guess_number__game__options__");
        if (typeof opts !== "object")
            return this.customError("Use inside $startGuessNumberGame.");
        try {
            opts.timeoutTime = dur ? constants_1.TimeParser.parseToMS(dur) : 60000;
        }
        catch {
            return this.customError("Invalid duration.");
        }
        ctx.setEnvironmentKey("__guess_number__game__options__", opts);
        return this.success();
    },
});
//# sourceMappingURL=setGuessNumberTimeout.js.map